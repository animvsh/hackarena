import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { teamId, githubUrl, userId } = await req.json()

    if (!teamId || !githubUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing teamId or githubUrl' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user's GitHub access token if available
    let githubToken = null
    if (userId) {
      const { data: user } = await supabase
        .from('users')
        .select('github_access_token')
        .eq('id', userId)
        .single()
      
      if (user?.github_access_token) {
        githubToken = user.github_access_token
      }
    }

    console.log(`Fetching GitHub commits for: ${githubUrl}`)

    // Parse GitHub URL to get owner and repo
    const urlMatch = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
    if (!urlMatch) {
      return new Response(
        JSON.stringify({ error: 'Invalid GitHub URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const [, owner, repo] = urlMatch
    const repoName = repo.replace(/\.git$/, '')

    // Fetch commits from GitHub API with authentication if available
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'HackCast-LIVE'
    }
    
    if (githubToken) {
      headers['Authorization'] = `Bearer ${githubToken}`
    }
    
    // Fetch all commits by paginating
    let allCommits: any[] = []
    let page = 1
    const perPage = 100
    
    while (true) {
      console.log(`Fetching page ${page}...`)
      
      const githubResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/commits?per_page=${perPage}&page=${page}`,
        { headers }
      )

      if (!githubResponse.ok) {
        console.error(`GitHub API error: ${githubResponse.status}`)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch GitHub commits' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const commits = await githubResponse.json()
      
      if (!commits || commits.length === 0) {
        break
      }
      
      allCommits = allCommits.concat(commits)
      
      // If we got less than perPage, we've reached the end
      if (commits.length < perPage) {
        break
      }
      
      page++
      
      // Safety limit to prevent infinite loops (max 1000 commits)
      if (page > 10) {
        console.log('Reached max page limit')
        break
      }
    }

    console.log(`Fetched ${allCommits.length} total commits`)

    // Store commits as progress_updates in Supabase
    const progressUpdates = allCommits.map((commit: any) => ({
      team_id: teamId,
      type: 'commit',
      title: commit.commit.message.split('\n')[0],
      content: commit.commit.author.name,
      metadata: {
        commit_hash: commit.sha,
        author: commit.commit.author.name,
        author_email: commit.commit.author.email,
        date: commit.commit.author.date,
        url: commit.html_url,
        message: commit.commit.message
      },
      created_at: commit.commit.author.date
    }))

    // Insert commits - check for duplicates first
    let inserted = 0
    let errors = 0
    
    for (const update of progressUpdates) {
      try {
        // Check if this commit already exists by querying metadata JSON
        const { data: existing, error: checkError } = await supabase
          .from('progress_updates')
          .select('id')
          .eq('team_id', teamId)
          .eq('type', 'commit')
          .eq('title', update.title)
          .eq('metadata->>author', update.metadata.author)
          .single()

        // If not found, insert it
        if (checkError || !existing) {
          console.log(`Inserting commit: ${update.title} by ${update.metadata.author}`)
          
          const { error: insertError } = await supabase
            .from('progress_updates')
            .insert(update)

          if (!insertError) {
            inserted++
          } else {
            console.error('Insert error:', insertError)
            errors++
          }
        } else {
          console.log(`Skipping duplicate commit: ${update.title}`)
        }
      } catch (e) {
        console.error('Error processing commit:', e)
        errors++
      }
    }

    console.log(`Inserted ${inserted} new activity items out of ${progressUpdates.length} total (${errors} errors)`)

    return new Response(
      JSON.stringify({
        success: true,
        commits: allCommits.length,
        inserted,
        updates: progressUpdates.slice(0, 5)
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error fetching GitHub activity:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

