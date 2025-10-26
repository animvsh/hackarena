import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  private: boolean;
  updated_at: string;
  owner: {
    login: string;
  };
}

interface GitHubErrorResponse {
  message: string;
  documentation_url?: string;
}

// Retry helper with exponential backoff
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Don't retry on client errors (4xx), only server errors (5xx) or network issues
      if (response.ok || response.status < 500) {
        return response;
      }

      if (attempt < maxRetries - 1) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout - GitHub API is not responding');
      }

      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      throw error;
    }
  }

  throw new Error('Max retries exceeded');
}

// Fetch all repositories with pagination
async function fetchAllRepos(
  accessToken: string,
  username: string
): Promise<GitHubRepo[]> {
  const allRepos: GitHubRepo[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const url = `https://api.github.com/user/repos?per_page=${perPage}&page=${page}&sort=updated&affiliation=owner`;

    const response = await fetchWithRetry(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'Supabase-Edge-Function',
      },
    });

    // Check rate limiting
    const remaining = response.headers.get('x-ratelimit-remaining');
    const resetTime = response.headers.get('x-ratelimit-reset');

    if (remaining && parseInt(remaining) < 10) {
      console.warn(`GitHub API rate limit low: ${remaining} requests remaining`);

      if (parseInt(remaining) === 0 && resetTime) {
        const resetDate = new Date(parseInt(resetTime) * 1000);
        throw new Error(`GitHub API rate limit exceeded. Resets at ${resetDate.toLocaleTimeString()}`);
      }
    }

    if (response.status === 401) {
      // Token expired or revoked
      return [{
        error: 'unauthorized',
        message: 'GitHub token expired or revoked. Please reconnect your GitHub account.'
      } as any];
    }

    if (response.status === 403) {
      const errorData: GitHubErrorResponse = await response.json();
      if (errorData.message?.includes('rate limit')) {
        throw new Error('GitHub API rate limit exceeded. Please try again later.');
      }
      throw new Error(`GitHub API access forbidden: ${errorData.message}`);
    }

    if (!response.ok) {
      const errorData: GitHubErrorResponse = await response.json();
      throw new Error(`GitHub API error (${response.status}): ${errorData.message || 'Unknown error'}`);
    }

    const repos: GitHubRepo[] = await response.json();

    if (repos.length === 0) {
      break; // No more repositories
    }

    // Filter to only owned repos
    const ownedRepos = repos.filter(repo => repo.owner.login === username);
    allRepos.push(...ownedRepos);

    // If we got fewer repos than perPage, we're on the last page
    if (repos.length < perPage) {
      break;
    }

    page++;

    // Safety limit: don't fetch more than 10 pages (1000 repos)
    if (page > 10) {
      console.warn('Reached maximum page limit for repository fetching');
      break;
    }
  }

  return allRepos;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Environment validation
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing required environment variables');
      return new Response(
        JSON.stringify({
          error: 'Server configuration error. Please contact support.',
          code: 'ENV_NOT_CONFIGURED'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the user from the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          error: 'Missing authorization header',
          code: 'UNAUTHORIZED'
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Extract user from JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({
          error: 'Invalid or expired session',
          code: 'UNAUTHORIZED'
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Fetch user's GitHub access token from database (using service role)
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('github_access_token, github_username, github_verified')
      .eq('id', user.id)
      .single();

    if (fetchError) {
      console.error('Database error fetching user:', fetchError);
      return new Response(
        JSON.stringify({
          error: 'Failed to fetch user data',
          code: 'DATABASE_ERROR'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!userData?.github_verified || !userData?.github_access_token) {
      return new Response(
        JSON.stringify({
          error: 'GitHub account not connected. Please connect your GitHub account first.',
          needsAuth: true,
          code: 'GITHUB_NOT_CONNECTED'
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Fetch all repositories with pagination and retry logic
    const repos = await fetchAllRepos(
      userData.github_access_token,
      userData.github_username
    );

    // Check if token was revoked
    if (repos.length > 0 && (repos[0] as any).error === 'unauthorized') {
      // Auto-disconnect the GitHub account
      await supabase
        .from('users')
        .update({
          github_verified: false,
          github_access_token: null,
          last_github_sync: new Date().toISOString(),
        })
        .eq('id', user.id);

      return new Response(
        JSON.stringify({
          error: (repos[0] as any).message,
          needsAuth: true,
          code: 'TOKEN_REVOKED'
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Transform to simpler format
    const simplifiedRepos = repos.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      url: repo.html_url,
      description: repo.description,
      private: repo.private,
      updated_at: repo.updated_at,
    }));

    // Update last sync time
    await supabase
      .from('users')
      .update({ last_github_sync: new Date().toISOString() })
      .eq('id', user.id);

    return new Response(
      JSON.stringify({
        success: true,
        repos: simplifiedRepos,
        count: simplifiedRepos.length,
        hasMore: repos.length >= 1000 // Reached our safety limit
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in get-github-repos:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Determine appropriate status code
    let statusCode = 500;
    let errorCode = 'INTERNAL_ERROR';

    if (errorMessage.includes('rate limit')) {
      statusCode = 429;
      errorCode = 'RATE_LIMIT_EXCEEDED';
    } else if (errorMessage.includes('timeout')) {
      statusCode = 504;
      errorCode = 'GATEWAY_TIMEOUT';
    } else if (errorMessage.includes('network')) {
      statusCode = 503;
      errorCode = 'SERVICE_UNAVAILABLE';
    }

    return new Response(
      JSON.stringify({
        error: errorMessage,
        code: errorCode
      }),
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
