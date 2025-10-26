import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface JoinTeamRequest {
  inviteCode: string;
  userId: string;
  message?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { inviteCode, userId, message }: JoinTeamRequest = await req.json();

    // Validate invite code
    const { data: inviteCodeData, error: codeError } = await supabase
      .from('team_invite_codes')
      .select('*, teams(id, name)')
      .eq('code', inviteCode)
      .eq('is_active', true)
      .single();

    if (codeError || !inviteCodeData) {
      return new Response(JSON.stringify({ error: 'Invalid or expired invite code' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Check if code has expired
    if (inviteCodeData.expires_at && new Date(inviteCodeData.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: 'Invite code has expired' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Check if max uses reached
    if (inviteCodeData.max_uses && inviteCodeData.uses_count >= inviteCodeData.max_uses) {
      return new Response(JSON.stringify({ error: 'Invite code has reached maximum uses' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('team_permissions')
      .select('id')
      .eq('team_id', inviteCodeData.team_id)
      .eq('user_id', userId)
      .single();

    if (existingMember) {
      return new Response(JSON.stringify({ error: 'You are already a member of this team' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Check if user has pending request
    const { data: existingRequest } = await supabase
      .from('team_join_requests')
      .select('id, status')
      .eq('team_id', inviteCodeData.team_id)
      .eq('user_id', userId)
      .eq('status', 'pending')
      .single();

    if (existingRequest) {
      return new Response(JSON.stringify({ error: 'You already have a pending request for this team' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Create join request
    const { data: joinRequest, error: requestError } = await supabase
      .from('team_join_requests')
      .insert({
        team_id: inviteCodeData.team_id,
        user_id: userId,
        invite_code_id: inviteCodeData.id,
        message: message || null,
        status: 'pending',
      })
      .select()
      .single();

    if (requestError) throw requestError;

    // Create audit log
    await supabase
      .from('team_audit_logs')
      .insert({
        team_id: inviteCodeData.team_id,
        user_id: userId,
        action: 'join_request_created',
        details: {
          team_name: inviteCodeData.teams.name,
        },
      });

    return new Response(JSON.stringify({ 
      success: true,
      teamName: inviteCodeData.teams.name,
      requestId: joinRequest.id,
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Error in join-team:', error);
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
