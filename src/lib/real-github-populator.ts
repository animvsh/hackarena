import { supabase } from "@/integrations/supabase/client";

// Fetch real GitHub user data
async function fetchGitHubUser(username: string) {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: { 'User-Agent': 'HackCast-LIVE' }
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${username}:`, error);
    return null;
  }
}

async function fetchGitHubRepos(username: string) {
  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=10&sort=updated`, {
      headers: { 'User-Agent': 'HackCast-LIVE' }
    });
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error(`Error fetching repos for ${username}:`, error);
    return [];
  }
}

// List of diverse real GitHub users from different domains
const REAL_GITHUB_USERS = [
  // React/JS Ecosystem
  'gaearon', 'sindresorhus', 'addyosmani', 'jashkenas', 'tj',
  // Vue.js
  'yyx990803', 'posva',
  // Backend/Infrastructure  
  'tj', 'isaacs', 'substack', 'nodejs',
  // AI/ML
  'microsoft', 'google', 'pytorch', 'tensorflow',
  // Web Development
  'vercel', 'railway', 'railsware', 'jupiter', 'cloudflare',
  // Blockchain/Web3
  'ethereum', 'cosmos', 'chainlink',
  // Mobile
  'facebook', 'airbnb',
  // Data Science
  'pandas-dev', 'scikit-learn', 'matplotlib',
  // Popular Individual Developers
  'torvalds', 'octocat', 'mojombo', 'pjhyett',
  'defunkt', 'kball', 'addyosmani', 'rauchg',
  // Startup Devs
  'zeit', 'hashicorp', 'dapr', 'kubernetes',
  // Frontend Frameworks
  'solidjs', 'sveltejs', 'preactjs',
  // Backend Frameworks
  'fastify', 'expressjs', 'nestjs',
];

export async function populateWithRealGitHubUsers() {
  console.log('Starting to populate with real GitHub users...');
  
  try {
    // Get all existing teams
    const { data: teams, error: teamsError } = await supabase
      .from('hackathon_teams')
      .select('id, name, hackathon_id');
    
    if (teamsError || !teams) {
      throw new Error('Failed to fetch teams');
    }
    
    console.log(`Found ${teams.length} teams`);
    
    // Shuffle array function
    const shuffle = (array: string[]) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };
    
    const usersToAdd = shuffle([...REAL_GITHUB_USERS]);
    let addedCount = 0;
    
    for (const team of teams) {
      // Check how many members this team currently has
      const { data: existingMembers } = await supabase
        .from('hackathon_team_members')
        .select('hacker_id')
        .eq('team_id', team.id);
      
      const currentMemberCount = existingMembers?.length || 0;
      
      // Add 1-3 real GitHub users to each team
      const membersToAdd = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < membersToAdd && addedCount < usersToAdd.length; i++) {
        const username = usersToAdd[addedCount];
        console.log(`Fetching data for ${username}...`);
        
        const githubUser = await fetchGitHubUser(username);
        if (!githubUser) {
          console.log(`Skipping ${username} - user not found`);
          addedCount++;
          continue;
        }
        
        const repos = await fetchGitHubRepos(username);
        
        // Check if hacker already exists globally
        const { data: existingHacker } = await supabase
          .from('hackers')
          .select('id')
          .eq('github_username', username)
          .single();
        
        let hackerId;
        
        if (existingHacker) {
          hackerId = existingHacker.id;
          
          // Check if already in this team
          const { data: existingMembership } = await supabase
            .from('hackathon_team_members')
            .select('id')
            .eq('team_id', team.id)
            .eq('hacker_id', hackerId)
            .single();
          
          if (existingMembership) {
            console.log(`${username} already in team ${team.name}`);
            addedCount++;
            continue;
          }
          console.log(`Using existing hacker ${username}`);
        } else {
          // Insert new hacker
          const { data: newHacker, error: hackerError } = await supabase
            .from('hackers')
            .insert({
              github_username: username,
              name: githubUser.name || githubUser.login,
              avatar_url: githubUser.avatar_url,
              bio: githubUser.bio,
              location: githubUser.location,
              company: githubUser.company,
              email: githubUser.email,
            })
            .select('id')
            .single();
          
          if (hackerError || !newHacker) {
            console.error(`Error inserting hacker ${username}:`, hackerError);
            addedCount++;
            continue;
          }
          
          hackerId = newHacker.id;
          console.log(`Created hacker ${username} with ID ${hackerId}`);
        }
        
        // Add hacker to team
        const { error: memberError } = await supabase
          .from('hackathon_team_members')
          .insert({
            team_id: team.id,
            hacker_id: hackerId,
            role: ['Lead Developer', 'Full Stack Developer', 'Backend Engineer', 'Frontend Engineer', 'DevOps Engineer', 'Data Scientist'][Math.floor(Math.random() * 6)]
          });
        
        if (memberError) {
          console.error(`Error adding ${username} to team:`, memberError);
        } else {
          console.log(`✅ Added ${username} to team ${team.name}`);
        }
        
        addedCount++;
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      console.log(`\n--- Finished team ${team.name} ---\n`);
    }
    
    console.log(`\n✅ Successfully added ${addedCount} real GitHub users to teams!`);
    return { success: true, added: addedCount };
    
  } catch (error) {
    console.error('Error populating with real GitHub users:', error);
    throw error;
  }
}

export async function fetchMoreDiverseUsers() {
  // Try to get users from trending repositories
  const trending = await fetch('https://api.github.com/search/repositories?q=stars:>1000&sort=stars&order=desc&per_page=30', {
    headers: { 'User-Agent': 'HackCast-LIVE' }
  });
  
  const data = await trending.json();
  return data.items?.map((repo: any) => repo.owner.login) || [];
}

