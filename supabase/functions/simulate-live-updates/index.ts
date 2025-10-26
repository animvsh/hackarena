// Supabase Edge Function to simulate live hackathon updates
// Triggers real-time events that feed into the broadcast system

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SimulationConfig {
  hackathonId?: string;
  eventTypes?: string[];
  intensity?: 'low' | 'medium' | 'high';
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse config from request
    const { hackathonId, eventTypes = ['all'], intensity = 'medium' } = await req.json() as SimulationConfig

    // Get active hackathon if not specified
    let targetHackathonId = hackathonId
    if (!targetHackathonId) {
      const { data: hackathon } = await supabase
        .from('hackathons')
        .select('id')
        .eq('status', 'active')
        .limit(1)
        .single()

      targetHackathonId = hackathon?.id
    }

    if (!targetHackathonId) {
      throw new Error('No active hackathon found')
    }

    // Get teams for this hackathon
    const { data: teams } = await supabase
      .from('teams')
      .select('id, name, current_progress, momentum_score')
      .eq('hackathon_id', targetHackathonId)
      .eq('status', 'active')

    if (!teams || teams.length === 0) {
      throw new Error('No active teams found')
    }

    // Get users for predictions
    const { data: users } = await supabase
      .from('users')
      .select('id, wallet_balance')
      .gt('wallet_balance', 100)
      .limit(20)

    // Get markets for this hackathon
    const { data: markets } = await supabase
      .from('prediction_markets')
      .select('id, category')
      .eq('hackathon_id', targetHackathonId)
      .eq('status', 'open')

    const eventsGenerated = []

    // Determine number of events based on intensity
    const eventCounts = {
      low: { progress: 1, bets: 2, updates: 1 },
      medium: { progress: 2, bets: 4, updates: 2 },
      high: { progress: 3, bets: 6, updates: 3 }
    }
    const counts = eventCounts[intensity]

    // 1. TEAM PROGRESS UPDATES (momentum & progress changes)
    if (eventTypes.includes('all') || eventTypes.includes('progress')) {
      for (let i = 0; i < counts.progress; i++) {
        const team = teams[Math.floor(Math.random() * teams.length)]

        // Random progress increase (1-5%)
        const progressDelta = 1 + Math.floor(Math.random() * 4)
        const newProgress = Math.min(100, team.current_progress + progressDelta)

        // Random momentum change (-10 to +15)
        const momentumDelta = -10 + Math.floor(Math.random() * 25)
        const newMomentum = Math.max(0, Math.min(100, team.momentum_score + momentumDelta))

        await supabase
          .from('teams')
          .update({
            current_progress: newProgress,
            momentum_score: newMomentum,
            updated_at: new Date().toISOString()
          })
          .eq('id', team.id)

        eventsGenerated.push({
          type: 'team_update',
          team: team.name,
          progress: newProgress,
          momentum: newMomentum
        })
      }
    }

    // 2. NEW PREDICTIONS (bets)
    if (eventTypes.includes('all') || eventTypes.includes('bets')) {
      if (users && markets && teams) {
        for (let i = 0; i < counts.bets; i++) {
          const user = users[Math.floor(Math.random() * users.length)]
          const market = markets[Math.floor(Math.random() * markets.length)]
          const team = teams[Math.floor(Math.random() * teams.length)]

          // Random bet amount (50-500 HC, with occasional whale bets)
          const isWhale = Math.random() < 0.1
          const betAmount = isWhale
            ? 500 + Math.floor(Math.random() * 500)
            : 50 + Math.floor(Math.random() * 450)

          // Get current odds for this team/market
          const { data: odds } = await supabase
            .from('market_odds')
            .select('current_odds')
            .eq('market_id', market.id)
            .eq('team_id', team.id)
            .single()

          await supabase
            .from('predictions')
            .insert({
              user_id: user.id,
              market_id: market.id,
              team_id: team.id,
              amount: betAmount,
              odds_at_bet: odds?.current_odds || 50,
              status: 'pending'
            })

          eventsGenerated.push({
            type: 'bet_placed',
            amount: betAmount,
            team: team.name,
            market: market.category,
            whale: isWhale
          })
        }
      }
    }

    // 3. PROGRESS UPDATES (commits, screenshots, milestones)
    if (eventTypes.includes('all') || eventTypes.includes('updates')) {
      const updateTypes = ['commit', 'screenshot', 'milestone', 'tweet']

      for (let i = 0; i < counts.updates; i++) {
        const team = teams[Math.floor(Math.random() * teams.length)]
        const updateType = updateTypes[Math.floor(Math.random() * updateTypes.length)]

        const titles = {
          commit: `Pushed ${1 + Math.floor(Math.random() * 20)} commits to main`,
          screenshot: `Updated ${['UI', 'dashboard', 'API', 'integration'][Math.floor(Math.random() * 4)]}`,
          milestone: `Completed ${['MVP', 'testing', 'deployment', 'integration'][Math.floor(Math.random() * 4)]}`,
          tweet: `Shared progress update on social media`
        }

        await supabase
          .from('progress_updates')
          .insert({
            team_id: team.id,
            type: updateType,
            title: titles[updateType as keyof typeof titles],
            content: `Live update from ${team.name}`,
            impact_score: 1 + Math.floor(Math.random() * 10)
          })

        eventsGenerated.push({
          type: 'progress_update',
          team: team.name,
          updateType
        })
      }
    }

    // 4. COMMENTARY FEED (AI commentary)
    if (Math.random() < 0.3) { // 30% chance to add commentary
      const personas = ['Analyst Ava', 'Coach K', 'StatBot Reka']
      const persona = personas[Math.floor(Math.random() * personas.length)]

      const templates = [
        `${teams[0].name} making moves! Current progress: ${teams[0].current_progress}%`,
        `Market activity heating up! ${eventsGenerated.filter(e => e.type === 'bet_placed').length} new bets this round!`,
        `Big momentum shift for ${teams[Math.floor(Math.random() * teams.length)].name}! The race is ON!`,
        `Breaking: ${Math.floor(Math.random() * 50) + 20} commits pushed in the last interval across all teams!`,
        `The crowd is going wild! Prediction volume spiking!`
      ]

      await supabase
        .from('commentary_feed')
        .insert({
          text: templates[Math.floor(Math.random() * templates.length)],
          voice_persona: persona,
          event_type: 'general',
          hackathon_id: targetHackathonId
        })

      eventsGenerated.push({ type: 'commentary', persona })
    }

    // 5. UPDATE API USAGE (increment random API calls)
    if (Math.random() < 0.4) { // 40% chance
      const team = teams[Math.floor(Math.random() * teams.length)]

      const { data: apiUsage } = await supabase
        .from('api_usage')
        .select('*')
        .eq('team_id', team.id)
        .limit(1)
        .single()

      if (apiUsage) {
        await supabase
          .from('api_usage')
          .update({
            call_count: apiUsage.call_count + Math.floor(Math.random() * 20) + 5,
            last_called_at: new Date().toISOString()
          })
          .eq('id', apiUsage.id)

        eventsGenerated.push({ type: 'api_call', team: team.name })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        hackathonId: targetHackathonId,
        eventsGenerated: eventsGenerated.length,
        events: eventsGenerated,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
