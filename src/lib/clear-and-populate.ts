import { supabase } from "@/integrations/supabase/client";

export async function clearAndPopulateRealData() {
  console.log('Clearing old data and populating with real Devpost hackathons...');
  
  try {
    // Delete in correct order to avoid FK violations
    await supabase.from('betting_odds').delete().gte('created_at', '1970-01-01');
    await supabase.from('hackathon_prizes').delete().gte('created_at', '1970-01-01');
    await supabase.from('hackathon_team_members').delete().gte('created_at', '1970-01-01');
    await supabase.from('team_stats').delete().gte('created_at', '1970-01-01');
    await supabase.from('hackathon_teams').delete().gte('created_at', '1970-01-01');
    await supabase.from('hackathons').delete().gte('created_at', '1970-01-01');
    
    console.log('✅ Cleared old data');
    
    // Now populate with real data
    const { populateWithRealDevpostHackathons } = await import('./devpost-populator');
    return await populateWithRealDevpostHackathons();
    
  } catch (error) {
    console.error('Error clearing and populating:', error);
    throw error;
  }
}

