import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface ManageRequestInput {
  requestId: string;
  action: 'approve' | 'reject';
  reviewerId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { requestId, action, reviewerId }: ManageRequestInput = await req.json();

    // Get join request details
    const { data: joinRequest, error: fetchError } = await supabase
      .from('team_join_requests')
      .select('*, teams(name), users(username, email)')
      .eq('id', requestId)
      .single();

    if (fetchError || !joinRequest) {
      return new Response(JSON.stringify({ error: 'Join request not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Verify reviewer has permission
    const { data: permission } = await supabase
      .from('team_permissions')
      .select('role, can_manage_members')
      .eq('team_id', joinRequest.team_id)
      .eq('user_id', reviewerId)
      .single();

    if (!permission || (permission.role !== 'owner' && !permission.can_manage_members)) {
      return new Response(JSON.stringify({ error: 'You do not have permission to manage join requests' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Update join request status
    const { error: updateError } = await supabase
      .from('team_join_requests')
      .update({
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (updateError) throw updateError;

    // If approved, add user to team
    if (action === 'approve') {
      const { error: permError } = await supabase
        .from('team_permissions')
        .insert({
          team_id: joinRequest.team_id,
          user_id: joinRequest.user_id,
          role: 'member',
          can_manage_members: false,
          can_manage_integrations: false,
          can_view_analytics: true,
        });

      if (permError) throw permError;

      // Increment invite code uses
      if (joinRequest.invite_code_id) {
        await supabase
          .from('team_invite_codes')
          .update({ uses_count: supabase.rpc('increment', { row_id: joinRequest.invite_code_id }) })
          .eq('id', joinRequest.invite_code_id);
      }

      // Create audit log
      await supabase
        .from('team_audit_logs')
        .insert({
          team_id: joinRequest.team_id,
          user_id: reviewerId,
          action: 'member_added',
          details: {
            added_user_id: joinRequest.user_id,
            added_username: joinRequest.users?.username,
          },
        });
    } else {
      // Create audit log for rejection
      await supabase
        .from('team_audit_logs')
        .insert({
          team_id: joinRequest.team_id,
          user_id: reviewerId,
          action: 'join_request_rejected',
          details: {
            rejected_user_id: joinRequest.user_id,
            rejected_username: joinRequest.users?.username,
          },
        });
    }

    return new Response(JSON.stringify({ 
      success: true,
      action,
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Error in manage-join-request:', error);
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
