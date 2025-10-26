import { supabase } from "@/integrations/supabase/client";

export async function populateAllTeamsWithMembers() {
  console.log('Starting to populate all teams with members...');
  
  try {
    // Get all teams
    const { data: teams } = await supabase
      .from('hackathon_teams')
      .select('id, name, category');
    
    // Get all hackers
    const { data: hackers } = await supabase
      .from('hackers')
      .select('id, name, github_username');
    
    if (!teams || !hackers) {
      throw new Error('Failed to fetch teams or hackers');
    }
    
    console.log(`Found ${teams.length} teams and ${hackers.length} hackers`);
    
    const roles = ['Lead Developer', 'Full Stack Developer', 'Backend Engineer', 'Frontend Engineer', 'DevOps Engineer', 'Data Scientist', 'UI/UX Designer', 'Product Manager'];
    
    for (const team of teams) {
      // Check current members
      const { data: existingMembers } = await supabase
        .from('hackathon_team_members')
        .select('id')
        .eq('team_id', team.id);
      
      const currentCount = existingMembers?.length || 0;
      
      // If team has members, skip
      if (currentCount >= 2) {
        console.log(`Skipping ${team.name} - already has ${currentCount} members`);
        continue;
      }
      
      // Add 2-4 members to each team
      const membersToAdd = Math.floor(Math.random() * 3) + 2; // 2-4 members
      const membersAdded = Math.min(membersToAdd, hackers.length - currentCount);
      
      // Shuffle and pick random hackers
      const shuffledHackers = [...hackers].sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < membersAdded; i++) {
        const hacker = shuffledHackers[i];
        const role = roles[Math.floor(Math.random() * roles.length)];
        
        // Check if hacker is already in this team
        const { data: existing } = await supabase
          .from('hackathon_team_members')
          .select('id')
          .eq('team_id', team.id)
          .eq('hacker_id', hacker.id)
          .single();
        
        if (existing) continue;
        
        // Add hacker to team
        const { error } = await supabase
          .from('hackathon_team_members')
          .insert({
            team_id: team.id,
            hacker_id: hacker.id,
            role: role
          });
        
        if (error) {
          console.error(`Error adding ${hacker.name} to ${team.name}:`, error);
        } else {
          console.log(`✅ Added ${hacker.name} (${hacker.github_username}) to ${team.name}`);
        }
      }
    }
    
    console.log('\n✅ Successfully populated teams with members!');
    return { success: true };
    
  } catch (error) {
    console.error('Error populating teams:', error);
    throw error;
  }
}

export async function generateStatsForAllHackers() {
  console.log('Starting to generate stats for all hackers without stats...');
  
  try {
    // Get hackers without stats
    const { data: hackers } = await supabase
      .from('hackers')
      .select('id, name, github_username, ai_ml_skill');
    
    if (!hackers) return { success: false, error: 'No hackers found' };
    
    // Check which hackers don't have stats
    const hackersWithoutStats = [];
    for (const hacker of hackers) {
      const { data: stats } = await supabase
        .from('hacker_stats')
        .select('id')
        .eq('hacker_id', hacker.id)
        .single();
      
      if (!stats) {
        hackersWithoutStats.push(hacker);
      }
    }
    
    console.log(`Found ${hackersWithoutStats.length} hackers without stats`);
    
    // Generate realistic stats for each
    for (const hacker of hackersWithoutStats) {
      const stats = {
        hacker_id: hacker.id,
        overall_rating: parseFloat((Math.random() * 40 + 60).toFixed(2)), // 60-100
        technical_skill: Math.floor(Math.random() * 40 + 60),
        hackathon_experience: Math.floor(Math.random() * 30 + 40),
        innovation: Math.floor(Math.random() * 35 + 50),
        leadership: Math.floor(Math.random() * 30 + 45),
        communication: Math.floor(Math.random() * 30 + 55),
        ai_ml_skill: Math.floor(Math.random() * 40 + 50),
        fintech_skill: Math.floor(Math.random() * 40 + 50),
        blockchain_skill: Math.floor(Math.random() * 40 + 50),
        mobile_skill: Math.floor(Math.random() * 40 + 50),
        fullstack_skill: Math.floor(Math.random() * 35 + 60),
        consistency: Math.floor(Math.random() * 30 + 55),
        growth: Math.floor(Math.random() * 30 + 50),
        network: Math.floor(Math.random() * 30 + 40),
        company_prestige: Math.floor(Math.random() * 25 + 50),
        market_value: Math.floor(Math.random() * 100000 + 80000),
        github_followers: Math.floor(Math.random() * 5000),
        github_repos: Math.floor(Math.random() * 20 + 10),
        github_stars: Math.floor(Math.random() * 1000),
        github_commits: Math.floor(Math.random() * 5000 + 1000),
      };
      
      const { error } = await supabase
        .from('hacker_stats')
        .insert(stats);
      
      if (error) {
        console.error(`Error creating stats for ${hacker.name}:`, error);
      } else {
        console.log(`✅ Created stats for ${hacker.name} (Rating: ${stats.overall_rating})`);
      }
    }
    
    console.log('\n✅ Successfully generated stats for all hackers!');
    return { success: true, generated: hackersWithoutStats.length };
    
  } catch (error) {
    console.error('Error generating stats:', error);
    throw error;
  }
}

