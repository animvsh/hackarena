import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { team_id, target_email, target_user_id, message } = await req.json();

    if (!team_id || (!target_email && !target_user_id)) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has permission to invite members
    const { data: permission } = await supabase
      .from('team_permissions')
      .select('role, can_manage_members')
      .eq('team_id', team_id)
      .eq('user_id', user.id)
      .single();

    if (!permission || (permission.role !== 'owner' && !permission.can_manage_members)) {
      return new Response(
        JSON.stringify({ error: 'You do not have permission to invite members' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get team info
    const { data: team } = await supabase
      .from('teams')
      .select('name, logo_url')
      .eq('id', team_id)
      .single();

    let invitedUserId = target_user_id;
    let inviteEmail = target_email;

    // If email provided, check if user exists
    if (target_email && !target_user_id) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', target_email)
        .single();

      if (existingUser) {
        invitedUserId = existingUser.id;
      }
    }

    // Create team invite
    const { data: invite, error: inviteError } = await supabase
      .from('team_invites')
      .insert({
        team_id,
        invited_by: user.id,
        invited_user_id: invitedUserId,
        invite_email: inviteEmail,
        message,
      })
      .select()
      .single();

    if (inviteError) throw inviteError;

    // Create notification if user exists on platform
    if (invitedUserId) {
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: invitedUserId,
          type: 'team_invite',
          title: 'Team Invitation',
          message: `You've been invited to join ${team?.name || 'a team'}`,
          metadata: {
            invite_id: invite.id,
            team_id,
            team_name: team?.name,
            inviter_id: user.id,
            message,
          },
        });

      if (notifError) console.error('Error creating notification:', notifError);
    }

    // Generate shareable link
    const inviteLink = `${req.headers.get('origin')}/invite/${invite.id}`;

    return new Response(
      JSON.stringify({
        success: true,
        invite,
        invite_link: inviteLink,
        requires_signup: !invitedUserId,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error inviting team member:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to invite team member';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});