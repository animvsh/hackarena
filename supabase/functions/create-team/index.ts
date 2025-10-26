import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface CreateTeamRequest {
  teamName: string;
  tagline: string;
  projectDescription: string;
  industryTags?: string[];
  techStack?: string[];
  stage?: string;
  teamSize?: number;
  userId: string;
  hackathonId?: string;
  aiAnalysis?: any;
  githubRepo?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const {
      teamName,
      tagline,
      projectDescription,
      industryTags,
      techStack,
      stage,
      teamSize,
      userId,
      hackathonId,
      aiAnalysis,
      githubRepo
    }: CreateTeamRequest = await req.json();

    // Generate unique invite code
    const inviteCode = `PIEFI-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    // Create team in hackathon_teams table
    // Set team_size to 0 initially, will update after adding creator
    const { data: team, error: teamError } = await supabase
      .from('hackathon_teams')
      .insert({
        name: teamName,
        tagline: tagline,
        category: industryTags?.[0] || '', // Use first category as string
        tech_stack: techStack || [],
        team_size: 0, // Start at 0, will update after adding members
        hackathon_id: hackathonId || null,
        github_url: githubRepo || null,
        invite_code: inviteCode, // Store invite code directly in hackathon_teams
      })
      .select()
      .single();

    if (teamError) throw teamError;

    // Get user's data to create/find their hacker profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user data:', userError);
    } else {
      // Check if user already has a hacker profile
      let hackerId = userData.github_id || userData.linkedin_id;
      
      // Try to find existing hacker record by github_username or linkedin_url
      let existingHacker = null;
      
      if (userData.github_username) {
        const { data } = await supabase
          .from('hackers')
          .select('id')
          .eq('github_username', userData.github_username)
          .maybeSingle();
        existingHacker = data;
      }
      
      // If still not found and user has linkedin, try that
      if (!existingHacker && userData.linkedin_url) {
        const { data } = await supabase
          .from('hackers')
          .select('id')
          .eq('linkedin_url', userData.linkedin_url)
          .maybeSingle();
        existingHacker = data;
      }

      // If no hacker exists, create one
      if (!existingHacker) {
        const { data: newHacker, error: hackerError } = await supabase
          .from('hackers')
          .insert({
            github_username: userData.github_username || userData.username,
            name: userData.username,
            avatar_url: userData.avatar_url,
            bio: userData.bio,
            location: userData.location,
            linkedin_url: userData.linkedin_url,
            website: userData.portfolio_url,
          })
          .select()
          .single();

        if (hackerError) {
          console.error('Error creating hacker profile:', hackerError);
        } else {
          existingHacker = newHacker;
        }
      }

      // Add user as team member
      if (existingHacker) {
        const { error: memberError } = await supabase
          .from('hackathon_team_members')
          .insert({
            team_id: team.id,
            hacker_id: existingHacker.id,
            role: 'Owner',
          });

        if (memberError) {
          console.error('Error adding team member:', memberError);
        } else {
          console.log('Successfully added creator as team member');
          // team_size is automatically updated by database trigger
        }
      }
    }

    // Invite code is already stored in hackathon_teams
    // No need to create a separate record in team_invite_codes

    return new Response(JSON.stringify({ 
      team_id: team.id,
      invite_code: inviteCode,
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Error in create-team:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});
