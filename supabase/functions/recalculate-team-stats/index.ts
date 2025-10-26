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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { hackathonId } = await req.json()

    if (!hackathonId) {
      return new Response(
        JSON.stringify({ error: 'hackathonId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get all teams for this hackathon
    const { data: teams, error: teamsError } = await supabaseClient
      .from('hackathon_teams')
      .select('id')
      .eq('hackathon_id', hackathonId)

    if (teamsError) {
      console.error('Error fetching teams:', teamsError)
      return new Response(
        JSON.stringify({ error: teamsError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${teams?.length || 0} teams`)

    let updatedCount = 0

    // For each team, calculate averages from member stats
    for (const team of teams || []) {
      // Get all hacker stats for this team's members
      const { data: members, error: membersError } = await supabaseClient
        .from('hackathon_team_members')
        .select(`
          hacker_id,
          hackers!inner(
            id,
            hacker_stats!inner(
              overall_rating,
              technical_skill,
              hackathon_experience,
              innovation,
              leadership,
              communication,
              ai_ml_skill,
              fintech_skill,
              blockchain_skill,
              mobile_skill,
              fullstack_skill
            )
          )
        `)
        .eq('team_id', team.id)

      if (membersError) {
        console.error(`Error fetching members for team ${team.id}:`, membersError)
        continue
      }

      if (!members || members.length === 0) {
        console.log(`No members found for team ${team.id}`)
        continue
      }

      // Calculate averages
      const stats: Record<string, number[]> = {}

      for (const member of members) {
        const hacker = member.hackers
        const hackerStats = hacker.hacker_stats?.[0]
        
        if (!hackerStats) continue

        Object.keys(hackerStats).forEach(key => {
          if (typeof hackerStats[key] === 'number') {
            if (!stats[key]) stats[key] = []
            stats[key].push(hackerStats[key])
          }
        })
      }

      // Calculate averages
      const avgStats: Record<string, number> = {}
      Object.keys(stats).forEach(key => {
        const values = stats[key]
        if (values.length > 0) {
          avgStats[`avg_${key}`] = values.reduce((sum, val) => sum + val, 0) / values.length
        }
      })

      // Upsert team stats
      const { error: upsertError } = await supabaseClient
        .from('team_stats')
        .upsert({
          team_id: team.id,
          ...avgStats,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'team_id'
        })

      if (upsertError) {
        console.error(`Error upserting team stats for ${team.id}:`, upsertError)
      } else {
        updatedCount++
        console.log(`Updated stats for team ${team.id}:`, avgStats)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Updated ${updatedCount} team stats`,
        updated: updatedCount,
        teams: teams?.length || 0
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error recalculating team stats:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

