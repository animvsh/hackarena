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

    const { userId, hackathonId, teamId, prizeId, betAmount, oddsAmerican, oddsDecimal } = await req.json()

    if (!userId || !hackathonId || !teamId || !prizeId || !betAmount) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Placing bet: User ${userId}, Amount ${betAmount}`)

    // Check user balance
    const { data: user, error: userError } = await supabaseClient
      .from('users')
      .select('wallet_balance')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('Error fetching user:', userError)
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const currentBalance = user.wallet_balance || 0

    // Check if user has enough balance
    if (currentBalance < betAmount) {
      return new Response(
        JSON.stringify({ error: 'Insufficient balance', currentBalance }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Deduct bet amount from user's wallet and add XP
    const { error: deductError } = await supabaseClient
      .from('users')
      .update({ 
        wallet_balance: currentBalance - betAmount,
        total_predictions: (user.total_predictions || 0) + 1,
        total_bets: (user.total_bets || 0) + 1,
        xp: (user.xp || 0) + 5
      })
      .eq('id', userId)

    if (deductError) {
      console.error('Error deducting balance:', deductError)
      return new Response(
        JSON.stringify({ error: 'Failed to deduct balance' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create wallet transaction record
    await supabaseClient
      .from('wallet_transactions')
      .insert({
        user_id: userId,
        amount: -betAmount,
        transaction_type: 'bet_placed',
        description: `Bet placed on team for prize`,
        reference_id: teamId
      })

    // Insert the bet record
    const { data: bet, error: insertError } = await supabaseClient
      .from('hackathon_bets')
      .insert({
        user_id: userId,
        hackathon_id: hackathonId,
        team_id: teamId,
        prize_id: prizeId,
        bet_amount: betAmount,
        odds_american: oddsAmerican,
        odds_decimal: oddsDecimal
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting bet:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to place bet' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Bet placed successfully:', bet)

    return new Response(
      JSON.stringify({
        success: true,
        bet: bet,
        newBalance: currentBalance - betAmount
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error placing bet:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

