import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface CreateTeamRequest {
  teamName: string;
  tagline: string;
  projectDescription: string;
  industryTags: string[];
  techStack: string[];
  stage: string;
  teamSize: number;
  userId: string;
  aiAnalysis?: any;
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
      aiAnalysis 
    }: CreateTeamRequest = await req.json();

    // Generate unique invite code
    const { data: inviteCodeData } = await supabase.rpc('generate_team_invite_code');
    const inviteCode = inviteCodeData || `hc_live_${Math.random().toString(36).substring(2, 15)}`;

    // Create team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({
        name: teamName,
        tagline: tagline,
        category: industryTags,
        tech_stack: techStack,
        team_size: teamSize,
        status: 'active',
        team_type: aiAnalysis?.company_type || 'startup',
        owner_id: userId,
        invite_code: inviteCode,
        onboarding_completed: false,
      })
      .select()
      .single();

    if (teamError) throw teamError;

    // Create team permissions (owner)
    const { error: permError } = await supabase
      .from('team_permissions')
      .insert({
        team_id: team.id,
        user_id: userId,
        role: 'owner',
        can_manage_members: true,
        can_manage_integrations: true,
        can_view_analytics: true,
      });

    if (permError) throw permError;

    // Create team profile with AI analysis
    if (aiAnalysis) {
      const { error: profileError } = await supabase
        .from('team_profiles')
        .insert({
          team_id: team.id,
          company_type: aiAnalysis.company_type,
          industry: aiAnalysis.industry,
          business_model: aiAnalysis.business_model,
          target_metrics: aiAnalysis.key_metrics || [],
          ai_analysis: aiAnalysis,
        });

      if (profileError) console.error('Profile creation error:', profileError);
    }

    // Create invite code record
    const { error: inviteError } = await supabase
      .from('team_invite_codes')
      .insert({
        team_id: team.id,
        code: inviteCode,
        created_by: userId,
        is_active: true,
      });

    if (inviteError) console.error('Invite code creation error:', inviteError);

    // Create audit log
    await supabase
      .from('team_audit_logs')
      .insert({
        team_id: team.id,
        user_id: userId,
        action: 'team_created',
        details: {
          team_name: teamName,
          team_type: aiAnalysis?.company_type,
        },
      });

    return new Response(JSON.stringify({ 
      team,
      inviteCode,
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
