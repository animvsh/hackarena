import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

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

    const { invite_id, response } = await req.json();

    if (!invite_id || !response || !['accept', 'reject'].includes(response)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get invite details
    const { data: invite, error: inviteError } = await supabase
      .from('team_invites')
      .select('*, teams(name)')
      .eq('id', invite_id)
      .single();

    if (inviteError || !invite) {
      return new Response(
        JSON.stringify({ error: 'Invite not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user is the invitee
    const { data: userData } = await supabase
      .from('users')
      .select('email')
      .eq('id', user.id)
      .single();

    if (invite.invited_user_id !== user.id && invite.invite_email !== userData?.email) {
      return new Response(
        JSON.stringify({ error: 'This invite is not for you' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if invite is expired
    if (new Date(invite.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'This invite has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if invite is still pending
    if (invite.status !== 'pending') {
      return new Response(
        JSON.stringify({ error: 'This invite has already been responded to' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const status = response === 'accept' ? 'accepted' : 'rejected';

    // Update invite status
    const { error: updateError } = await supabase
      .from('team_invites')
      .update({
        status,
        responded_at: new Date().toISOString(),
        invited_user_id: user.id, // Update if it was just an email invite
      })
      .eq('id', invite_id);

    if (updateError) throw updateError;

    // If accepted, add user to team
    if (response === 'accept') {
      const { error: permError } = await supabase
        .from('team_permissions')
        .insert({
          team_id: invite.team_id,
          user_id: user.id,
          role: 'member',
          can_view_analytics: true,
        });

      if (permError) {
        // Check if user is already a member
        if (!permError.message.includes('duplicate')) {
          throw permError;
        }
      }

      // Create audit log
      await supabase
        .from('team_audit_logs')
        .insert({
          team_id: invite.team_id,
          user_id: user.id,
          action: 'member_joined_via_invite',
          details: { invite_id, invited_by: invite.invited_by },
        });
    }

    // Notify inviter
    await supabase
      .from('notifications')
      .insert({
        user_id: invite.invited_by,
        type: 'invite_response',
        title: response === 'accept' ? 'Invite Accepted' : 'Invite Declined',
        message: `Your invitation to ${invite.teams?.name || 'the team'} was ${status}`,
        metadata: {
          invite_id,
          team_id: invite.team_id,
          respondent_id: user.id,
          response,
        },
      });

    return new Response(
      JSON.stringify({
        success: true,
        status,
        team_id: response === 'accept' ? invite.team_id : null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error responding to invite:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});