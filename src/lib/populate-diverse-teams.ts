import { supabase } from '@/integrations/supabase/client'

// List of diverse real GitHub users
const GITHUB_USERS = [
  // Famous developers
  'octocat',
  'gaearon', // Dan Abramov
  'tj', // TJ Holowaychuk
  'sindresorhus', // Sindre Sorhus
  'addyosmani', // Addy Osmani
  'jashkenas', // Jeremy Ashkenas
  'mbostock', // Mike Bostock
  'matz', // Yukihiro Matsumoto
  
  // Popular developers
  'gaearon',
  'yyx990803', // Evan You
  'ljharb',
  'thejameskyle',
  'developit',
  'substack',
  'rauchg',
  'nikolas',
  'mrdoob',
  'paulirish',
  
  // More diverse developers
  'sarah_edo',
  'una',
  'rachelnabors',
  'alice',
  'jennschiffer',
  'kris',
  'g33konaut',
  'jxnblk',
  'nzakas',
  'jonschlinkert',
  
  // Additional developers
  'mdo',
  'fat',
  'wilto',
  'feross',
  'domenic',
  'zeit',
  'mafintosh',
  'kelseyhightower',
  'bradfitz',
  'mitchellh',
  
  // More developers
  'defunkt',
  'schacon',
  'mojombo',
  'torvalds',
  'pjhyett',
  'wycats',
  'ezmobius',
  'bryanl',
  'bmizerany',
  'defunkt'
]

async function fetchGitHubUser(username: string) {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      }
    })

    if (!response.ok) {
      console.log(`GitHub user ${username} not found`)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching ${username}:`, error)
    return null
  }
}

async function populateDiverseTeams() {
  console.log('Starting to populate diverse teams...')

  // Step 1: Fetch and create hackers
  const hackerData = []
  
  for (const username of GITHUB_USERS) {
    console.log(`Fetching ${username}...`)
    const githubData = await fetchGitHubUser(username)
    
    if (!githubData) continue

    // Create or get hacker
    const { data: existingHacker } = await supabase
      .from('hackers')
      .select('id')
      .eq('github_username', username)
      .single()

    let hackerId
    if (existingHacker) {
      hackerId = existingHacker.id
    } else {
      const { data: newHacker, error } = await supabase
        .from('hackers')
        .insert({
          github_username: username,
          name: githubData.name || username,
          bio: githubData.bio,
          avatar_url: githubData.avatar_url,
          location: githubData.location,
          website: githubData.blog,
        })
        .select('id')
        .single()

      if (error) {
        console.error(`Error creating hacker ${username}:`, error)
        continue
      }

      hackerId = newHacker.id
    }

    hackerData.push({ hackerId, githubUrl: githubData.html_url })
  }

  console.log(`Created ${hackerData.length} hackers`)

  // Step 2: Call OpenAI pipeline to generate stats for all hackers
  console.log('Generating stats using OpenAI...')
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  
  for (const hacker of hackerData) {
    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/analyze-github-stats`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            githubUrl: hacker.githubUrl
          })
        }
      )

      if (!response.ok) {
        console.error(`Failed to generate stats for ${hacker.hackerId}`)
        continue
      }

      console.log(`Generated stats for hacker ${hacker.hackerId}`)
    } catch (error) {
      console.error(`Error generating stats for ${hacker.hackerId}:`, error)
    }
  }

  // Step 3: Get teams and redistribute members
  const { data: hackathons } = await supabase
    .from('hackathons')
    .select('id')
    .eq('status', 'active')
    .limit(1)

  if (!hackathons || hackathons.length === 0) {
    console.log('No active hackathons found')
    return
  }

  const hackathonId = hackathons[0].id

  const { data: teams } = await supabase
    .from('hackathon_teams')
    .select('id')
    .eq('hackathon_id', hackathonId)

  if (!teams || teams.length === 0) {
    console.log('No teams found')
    return
  }

  console.log(`Assigning diverse members to ${teams.length} teams...`)

  // Clear existing members
  for (const team of teams) {
    await supabase
      .from('hackathon_team_members')
      .delete()
      .eq('team_id', team.id)
  }

  // Distribute hackers to teams (randomly, but ensuring diversity)
  const shuffledHackers = hackerData.sort(() => Math.random() - 0.5)
  
  for (let i = 0; i < teams.length; i++) {
    const team = teams[i]
    const hackersToAdd = []
    
    // Assign 2-4 random hackers to each team
    const teamSize = Math.floor(Math.random() * 3) + 2 // 2, 3, or 4
    
    for (let j = 0; j < teamSize; j++) {
      const hackerIndex = (i * teamSize + j) % shuffledHackers.length
      hackersToAdd.push({
        team_id: team.id,
        hacker_id: shuffledHackers[hackerIndex].hackerId,
        role: j === 0 ? 'Owner' : 'Member'
      })
    }

    await supabase
      .from('hackathon_team_members')
      .insert(hackersToAdd)
  }

  console.log('Team members redistributed successfully')

  // Step 4: Recalculate team stats by fetching averages and updating
  console.log('Recalculating team stats...')
  
  for (const team of teams) {
    // Get all hackers for this team
    const { data: members } = await supabase
      .from('hackathon_team_members')
      .select('hacker_id')
      .eq('team_id', team.id)

    if (!members || members.length === 0) continue

    // Calculate averages
    const hackerIds = members.map(m => m.hacker_id)
    const { data: stats } = await supabase
      .from('hacker_stats')
      .select('*')
      .in('hacker_id', hackerIds)

    if (!stats || stats.length === 0) continue

    const avgStats: Record<string, number> = {}
    const statKeys = [
      'overall_rating', 'technical_skill', 'hackathon_experience', 'innovation',
      'leadership', 'communication', 'ai_ml_skill', 'fintech_skill',
      'blockchain_skill', 'mobile_skill', 'fullstack_skill'
    ]

    statKeys.forEach(key => {
      const values = stats.map(s => parseFloat(s[key] as string) || 0)
      if (values.length > 0) {
        avgStats[`avg_${key}`] = values.reduce((sum, val) => sum + val, 0) / values.length
      }
    })

    // Update team stats
    await supabase
      .from('team_stats')
      .upsert({
        team_id: team.id,
        ...avgStats,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'team_id'
      })
  }

  console.log('Team stats recalculated')
  console.log('Done!')
}

export { populateDiverseTeams }

