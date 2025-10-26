import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    const { hackathonId, winnerResults } = await req.json()

    if (!hackathonId || !winnerResults) {
      return new Response(
        JSON.stringify({ error: 'Missing hackathonId or winnerResults' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Resolving bets for hackathon ${hackathonId}`)
    console.log('Winner results:', winnerResults)

    // Fetch all pending bets for this hackathon
    const { data: bets, error: betsError } = await supabaseClient
      .from('hackathon_bets')
      .select('*')
      .eq('hackathon_id', hackathonId)
      .eq('status', 'pending')

    if (betsError) {
      console.error('Error fetching bets:', betsError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch bets' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!bets || bets.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No pending bets to resolve' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${bets.length} pending bets`)

    let resolvedCount = 0;
    let totalPayout = 0;

    // Resolve each bet based on final placements
    for (const bet of bets) {
      const teamPlacement = winnerResults[bet.team_id];
      
      if (!teamPlacement) {
        // Team didn't place, mark as lost with 0.9x multiplier
        const finalPayout = Math.floor(bet.bet_amount * 0.9);
        
        // Update user balance
        const { data: user } = await supabaseClient
          .from('users')
          .select('wallet_balance')
          .eq('id', bet.user_id)
          .single();

        if (user) {
          await supabaseClient
            .from('users')
            .update({ wallet_balance: (user.wallet_balance || 0) + finalPayout })
            .eq('id', bet.user_id);

          // Create transaction record
          await supabaseClient
            .from('wallet_transactions')
            .insert({
              user_id: bet.user_id,
              amount: finalPayout,
              transaction_type: 'bet_lost',
              description: `Bet resolved - team did not place`
            });
        }

        // Update bet status
        await supabaseClient
          .from('hackathon_bets')
          .update({
            status: 'lost',
            payout_multiplier: 0.9,
            final_payout: finalPayout,
            team_final_position: null,
            resolved_at: new Date().toISOString()
          })
          .eq('id', bet.id);

        resolvedCount++;
        totalPayout += finalPayout;
        continue;
      }

      // Team placed - determine multiplier based on placement
      let multiplier = 0.9;
      if (teamPlacement.position === 1) multiplier = 1.5;
      else if (teamPlacement.position === 2) multiplier = 1.3;
      else if (teamPlacement.position === 3) multiplier = 1.1;

      const finalPayout = Math.floor(bet.bet_amount * multiplier);
      const status = teamPlacement.position <= 3 ? 'won' : 'lost';

      // Update user balance
      const { data: user } = await supabaseClient
        .from('users')
        .select('wallet_balance')
        .eq('id', bet.user_id)
        .single();

      if (user) {
        await supabaseClient
          .from('users')
          .update({ wallet_balance: (user.wallet_balance || 0) + finalPayout })
          .eq('id', bet.user_id);

        // Create transaction record
        await supabaseClient
          .from('wallet_transactions')
          .insert({
            user_id: bet.user_id,
            amount: finalPayout,
            transaction_type: status === 'won' ? 'bet_won' : 'bet_lost',
            description: `Bet resolved - team placed ${teamPlacement.position}`
          });

        // Update correct predictions and accuracy if won
        if (status === 'won') {
          const { data: existingUser } = await supabaseClient
            .from('users')
            .select('correct_predictions, won_bets, total_bets')
            .eq('id', bet.user_id)
            .single();

          if (existingUser) {
            const newWonBets = (existingUser.won_bets || 0) + 1;
            const totalBets = existingUser.total_bets || 1;
            const newAccuracy = (newWonBets / totalBets) * 100;

            await supabaseClient
              .from('users')
              .update({ 
                correct_predictions: (existingUser.correct_predictions || 0) + 1,
                won_bets: newWonBets,
                accuracy_rate: newAccuracy
              })
              .eq('id', bet.user_id);
          }
        }
      }

      // Update bet status
      await supabaseClient
        .from('hackathon_bets')
        .update({
          status,
          payout_multiplier: multiplier,
          final_payout: finalPayout,
          team_final_position: teamPlacement.position,
          resolved_at: new Date().toISOString()
        })
        .eq('id', bet.id);

      resolvedCount++;
      totalPayout += finalPayout;
    }

    console.log(`Resolved ${resolvedCount} bets with total payout of ${totalPayout}`)

    return new Response(
      JSON.stringify({
        success: true,
        resolvedCount,
        totalPayout
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error resolving bets:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

