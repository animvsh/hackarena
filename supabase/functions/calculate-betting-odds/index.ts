import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { hackathonId } = await req.json()

    if (!hackathonId) {
      return new Response(
        JSON.stringify({ error: 'Missing hackathonId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Calculating betting odds for hackathon: ${hackathonId}`)

    // Fetch all prizes for this hackathon
    const { data: prizes, error: prizesError } = await supabaseClient
      .from('hackathon_prizes')
      .select('*')
      .eq('hackathon_id', hackathonId)

    if (prizesError) {
      console.error('Error fetching prizes:', prizesError)
      return new Response(
        JSON.stringify({ error: prizesError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${prizes.length} prizes`)

    if (!prizes || prizes.length === 0) {
      console.log('No prizes found for this hackathon')
      return new Response(
        JSON.stringify({ success: true, message: 'No prizes found', calculated: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch all teams for this hackathon with their stats and GitHub URLs
    const { data: teams, error: teamsError } = await supabaseClient
      .from('hackathon_teams')
      .select(`
        id,
        name,
        category,
        github_url,
        team_stats!left(
          avg_overall_rating,
          avg_technical_skill,
          avg_hackathon_experience,
          avg_innovation
        )
      `)
      .eq('hackathon_id', hackathonId)

    // Fetch GitHub commit counts for teams
    let commitCounts: Record<string, number> = {}
    
    for (const team of teams || []) {
      // Check if team has GitHub URL linked
      if (team.github_url) {
        try {
          // Parse GitHub URL to get owner/repo
          const match = team.github_url.match(/github\.com\/([^\/]+)\/([^\/]+)/)
          if (match) {
            const owner = match[1]
            const repo = match[2].replace(/\.git$/, '') // Remove .git suffix if present
            
            // Fetch commit count from GitHub API
            const githubResponse = await fetch(
              `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100&page=1`,
              {
                headers: {
                  'Accept': 'application/vnd.github.v3+json',
                  'User-Agent': 'HackCast-LIVE'
                }
              }
            )
            
            if (githubResponse.ok) {
              const commits = await githubResponse.json()
              commitCounts[team.id] = commits.length
              console.log(`Team ${team.name}: Fetched ${commits.length} commits from GitHub`)
            }
          }
        } catch (error) {
          console.error(`Error fetching GitHub commits for team ${team.id}:`, error)
          commitCounts[team.id] = 0
        }
      } else {
        // Fall back to progress_updates table
        const { count } = await supabaseClient
          .from('progress_updates')
          .select('*', { count: 'exact', head: true })
          .eq('team_id', team.id)
          .eq('type', 'commit')
        
        commitCounts[team.id] = count || 0
      }
    }

    if (teamsError) {
      console.error('Error fetching teams:', teamsError)
      return new Response(
        JSON.stringify({ error: teamsError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${teams.length} teams`)

    if (!teams || teams.length === 0) {
      console.log('No teams found for this hackathon')
      return new Response(
        JSON.stringify({ success: true, message: 'No teams found', calculated: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let calculatedCount = 0

    // For each prize, calculate odds for all teams
    for (const prize of prizes) {
      console.log(`Calculating odds for prize: ${prize.category}`)

      // Calculate win probabilities based on team stats + GitHub activity + prize alignment
      // Using a normalization approach: each team's probability is proportional to their overall rating
      const teamRatings = teams.map(t => {
        const stats = t.team_stats
        const baseRating = parseFloat(stats?.avg_overall_rating || '50')
        
        // Bonus for GitHub activity based on commit count
        const commitCount = commitCounts[t.id] || 0
        // Scale: 0-10 commits = +0 to +5 points, 11-30 = +5 to +10, 31+ = +10 to +15
        let activityBonus = 0
        if (commitCount > 0) {
          if (commitCount <= 10) {
            activityBonus = (commitCount / 10) * 5
          } else if (commitCount <= 30) {
            activityBonus = 5 + ((commitCount - 10) / 20) * 5
          } else {
            activityBonus = 10 + Math.min(5, (commitCount - 30) / 10)
          }
        }
        activityBonus = Math.min(15, activityBonus) // Cap at +15
        
        // Bonus for prize alignment (check if team category matches prize category)
        let alignmentBonus = 0
        const teamCategory = (t.category || '').toLowerCase()
        const prizeCategory = (prize.category || '').toLowerCase()
        
        // Check for keyword matching between team category and prize category
        const alignmentKeywords: Record<string, string[]> = {
          'defi': ['defi', 'decentralized finance', 'finance', 'yield', 'yieldfarm'],
          'nft': ['nft', 'non-fungible', 'marketplace', 'collectibles', 'art'],
          'dao': ['dao', 'governance', 'gov', 'governance tool', 'builder'],
          'public goods': ['public goods', 'social impact', 'public', 'infrastructure'],
          'infrastructure': ['infrastructure', 'tooling', 'tools', 'developer', 'infra'],
          'overall': [] // No bonus for overall winner
        }
        
        // Check if team's category/tagline aligns with prize category
        for (const [key, keywords] of Object.entries(alignmentKeywords)) {
          if (prizeCategory.includes(key)) {
            const matchesKeyword = keywords.some(kw => 
              teamCategory.includes(kw) || 
              (t.name && t.name.toLowerCase().includes(kw))
            )
            if (matchesKeyword && key !== 'overall') {
              alignmentBonus = 20 // Strong bonus for perfect alignment
              console.log(`Team ${t.name} aligns with ${prize.category}: +${alignmentBonus} bonus`)
              break
            }
          }
        }
        
        // Add random variation to differentiate teams with same stats
        const randomVariation = (Math.random() - 0.5) * 10 // -5 to +5
        const adjustedRating = baseRating + activityBonus + alignmentBonus + randomVariation
        
        return {
          id: t.id,
          name: t.name,
          rating: adjustedRating
        }
      })

      const totalRating = teamRatings.reduce((sum, t) => sum + t.rating, 0)
      
      if (totalRating === 0) continue

      // Calculate implied probabilities
      const impliedProbabilities = teamRatings.map(t => ({
        teamId: t.id,
        probability: t.rating / totalRating
      }))

      // Add vigorish (house edge) of 5% and normalize
      const vigorish = 0.05
      const normalizedProbabilities = impliedProbabilities.map(p => ({
        teamId: p.teamId,
        probability: p.probability * (1 - vigorish)
      }))

      const probSum = normalizedProbabilities.reduce((sum, p) => sum + p.probability, 0)
      const finalProbabilities = normalizedProbabilities.map(p => ({
        teamId: p.teamId,
        probability: probSum > 0 ? p.probability / probSum : 0
      }))

      // Convert probabilities to odds
      for (const { teamId, probability } of finalProbabilities) {
        // Calculate American odds from probability
        let americanOdds: number
        if (probability >= 0.5) {
          americanOdds = Math.round(-100 * probability / (1 - probability))
        } else {
          americanOdds = Math.round((1 - probability) * 100 / probability)
        }

        // Scale down to more reasonable bounds (divide by 6 to reduce large numbers)
        // This makes odds like +435 become +72, making them much more readable
        americanOdds = Math.round(americanOdds / 6)
        
        // Ensure odds are within reasonable bounds
        americanOdds = Math.max(-120, Math.min(150, americanOdds))

        // Calculate decimal odds
        let decimalOdds: number
        if (americanOdds > 0) {
          decimalOdds = 1 + (americanOdds / 100)
        } else {
          decimalOdds = 1 + (100 / Math.abs(americanOdds))
        }

        // Round to 2 decimal places
        decimalOdds = Math.round(decimalOdds * 100) / 100

        // Insert or update betting odds
        console.log(`Upserting odds for team ${teamId}:`, {
          teamId,
          prizeId: prize.id,
          americanOdds,
          decimalOdds,
          probability
        })

        const { error: upsertError } = await supabaseClient
          .from('betting_odds')
          .upsert({
            team_id: teamId,
            prize_id: prize.id,
            odds_american: americanOdds,
            odds_decimal: decimalOdds,
            implied_probability: Math.round(probability * 100) / 100,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'team_id,prize_id'
          })

        if (upsertError) {
          console.error(`Error upserting odds for team ${teamId}:`, upsertError)
        } else {
          calculatedCount++
        }
      }
    }

    console.log(`Calculated ${calculatedCount} betting odds`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Calculated ${calculatedCount} betting odds for ${prizes.length} prizes and ${teams.length} teams`,
        calculated: calculatedCount,
        prizes: prizes.length,
        teams: teams.length
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error calculating betting odds:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

