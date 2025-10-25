import { supabase } from '../integrations/supabase/client';

// Function to create all hacker stats tables
export const createHackerStatsTables = async (): Promise<void> => {
  console.log('🚀 Creating hacker stats tables...');

  try {
    // Create hackers table
    const { error: hackersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS hackers (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          github_username VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          avatar_url TEXT,
          bio TEXT,
          location VARCHAR(255),
          company VARCHAR(255),
          website TEXT,
          twitter_username VARCHAR(255),
          linkedin_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (hackersError) {
      console.error('Error creating hackers table:', hackersError);
    } else {
      console.log('✅ Created hackers table');
    }

    // Create hacker_stats table
    const { error: statsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS hacker_stats (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          hacker_id UUID REFERENCES hackers(id) ON DELETE CASCADE,
          hackathon_experience INTEGER DEFAULT 0,
          technical_skill INTEGER DEFAULT 0,
          leadership INTEGER DEFAULT 0,
          innovation INTEGER DEFAULT 0,
          communication INTEGER DEFAULT 0,
          ai_ml_skill INTEGER DEFAULT 0,
          fintech_skill INTEGER DEFAULT 0,
          blockchain_skill INTEGER DEFAULT 0,
          mobile_skill INTEGER DEFAULT 0,
          fullstack_skill INTEGER DEFAULT 0,
          consistency INTEGER DEFAULT 0,
          growth INTEGER DEFAULT 0,
          network INTEGER DEFAULT 0,
          company_prestige INTEGER DEFAULT 0,
          overall_rating DECIMAL(5,2) DEFAULT 0.00,
          market_value DECIMAL(10,2) DEFAULT 0.00,
          github_followers INTEGER DEFAULT 0,
          github_repos INTEGER DEFAULT 0,
          github_stars INTEGER DEFAULT 0,
          github_commits INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (statsError) {
      console.error('Error creating hacker_stats table:', statsError);
    } else {
      console.log('✅ Created hacker_stats table');
    }

    // Create hackathons table
    const { error: hackathonsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS hackathons (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          description TEXT,
          start_date TIMESTAMP WITH TIME ZONE,
          end_date TIMESTAMP WITH TIME ZONE,
          location VARCHAR(255),
          website TEXT,
          prize_pool DECIMAL(12,2) DEFAULT 0.00,
          total_participants INTEGER DEFAULT 0,
          status VARCHAR(50) DEFAULT 'upcoming',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (hackathonsError) {
      console.error('Error creating hackathons table:', hackathonsError);
    } else {
      console.log('✅ Created hackathons table');
    }

    // Create hackathon_prizes table
    const { error: prizesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS hackathon_prizes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
          category VARCHAR(255) NOT NULL,
          prize_amount DECIMAL(10,2) NOT NULL,
          position INTEGER NOT NULL,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (prizesError) {
      console.error('Error creating hackathon_prizes table:', prizesError);
    } else {
      console.log('✅ Created hackathon_prizes table');
    }

    // Create hackathon_teams table
    const { error: teamsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS hackathon_teams (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          tagline TEXT,
          category VARCHAR(255),
          tech_stack TEXT[],
          logo_url TEXT,
          github_url TEXT,
          devpost_url TEXT,
          team_size INTEGER DEFAULT 0,
          current_progress INTEGER DEFAULT 0,
          momentum_score DECIMAL(5,2) DEFAULT 0.00,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (teamsError) {
      console.error('Error creating hackathon_teams table:', teamsError);
    } else {
      console.log('✅ Created hackathon_teams table');
    }

    // Create team_members table
    const { error: membersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS team_members (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          team_id UUID REFERENCES hackathon_teams(id) ON DELETE CASCADE,
          hacker_id UUID REFERENCES hackers(id) ON DELETE CASCADE,
          role VARCHAR(255),
          joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(team_id, hacker_id)
        );
      `
    });

    if (membersError) {
      console.error('Error creating team_members table:', membersError);
    } else {
      console.log('✅ Created team_members table');
    }

    // Create team_stats table
    const { error: teamStatsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS team_stats (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          team_id UUID REFERENCES hackathon_teams(id) ON DELETE CASCADE,
          avg_hackathon_experience DECIMAL(5,2) DEFAULT 0.00,
          avg_technical_skill DECIMAL(5,2) DEFAULT 0.00,
          avg_leadership DECIMAL(5,2) DEFAULT 0.00,
          avg_innovation DECIMAL(5,2) DEFAULT 0.00,
          avg_communication DECIMAL(5,2) DEFAULT 0.00,
          avg_ai_ml_skill DECIMAL(5,2) DEFAULT 0.00,
          avg_fintech_skill DECIMAL(5,2) DEFAULT 0.00,
          avg_blockchain_skill DECIMAL(5,2) DEFAULT 0.00,
          avg_mobile_skill DECIMAL(5,2) DEFAULT 0.00,
          avg_fullstack_skill DECIMAL(5,2) DEFAULT 0.00,
          avg_consistency DECIMAL(5,2) DEFAULT 0.00,
          avg_growth DECIMAL(5,2) DEFAULT 0.00,
          avg_network DECIMAL(5,2) DEFAULT 0.00,
          avg_company_prestige DECIMAL(5,2) DEFAULT 0.00,
          avg_overall_rating DECIMAL(5,2) DEFAULT 0.00,
          total_market_value DECIMAL(12,2) DEFAULT 0.00,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (teamStatsError) {
      console.error('Error creating team_stats table:', teamStatsError);
    } else {
      console.log('✅ Created team_stats table');
    }

    // Create betting_odds table
    const { error: oddsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS betting_odds (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          team_id UUID REFERENCES hackathon_teams(id) ON DELETE CASCADE,
          prize_id UUID REFERENCES hackathon_prizes(id) ON DELETE CASCADE,
          odds_american INTEGER NOT NULL,
          odds_decimal DECIMAL(5,2) NOT NULL,
          implied_probability DECIMAL(5,4) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (oddsError) {
      console.error('Error creating betting_odds table:', oddsError);
    } else {
      console.log('✅ Created betting_odds table');
    }

    // Create indexes
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_hackers_github_username ON hackers(github_username);
        CREATE INDEX IF NOT EXISTS idx_hacker_stats_hacker_id ON hacker_stats(hacker_id);
        CREATE INDEX IF NOT EXISTS idx_hackathon_teams_hackathon_id ON hackathon_teams(hackathon_id);
        CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
        CREATE INDEX IF NOT EXISTS idx_team_members_hacker_id ON team_members(hacker_id);
        CREATE INDEX IF NOT EXISTS idx_team_stats_team_id ON team_stats(team_id);
        CREATE INDEX IF NOT EXISTS idx_betting_odds_team_id ON betting_odds(team_id);
        CREATE INDEX IF NOT EXISTS idx_betting_odds_prize_id ON betting_odds(prize_id);
      `
    });

    if (indexError) {
      console.error('Error creating indexes:', indexError);
    } else {
      console.log('✅ Created indexes');
    }

    // Enable RLS
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE hackers ENABLE ROW LEVEL SECURITY;
        ALTER TABLE hacker_stats ENABLE ROW LEVEL SECURITY;
        ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;
        ALTER TABLE hackathon_prizes ENABLE ROW LEVEL SECURITY;
        ALTER TABLE hackathon_teams ENABLE ROW LEVEL SECURITY;
        ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
        ALTER TABLE team_stats ENABLE ROW LEVEL SECURITY;
        ALTER TABLE betting_odds ENABLE ROW LEVEL SECURITY;
      `
    });

    if (rlsError) {
      console.error('Error enabling RLS:', rlsError);
    } else {
      console.log('✅ Enabled RLS');
    }

    // Create RLS policies
    const { error: policyError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Allow all operations on hackers" ON hackers FOR ALL USING (true);
        CREATE POLICY "Allow all operations on hacker_stats" ON hacker_stats FOR ALL USING (true);
        CREATE POLICY "Allow all operations on hackathons" ON hackathons FOR ALL USING (true);
        CREATE POLICY "Allow all operations on hackathon_prizes" ON hackathon_prizes FOR ALL USING (true);
        CREATE POLICY "Allow all operations on hackathon_teams" ON hackathon_teams FOR ALL USING (true);
        CREATE POLICY "Allow all operations on team_members" ON team_members FOR ALL USING (true);
        CREATE POLICY "Allow all operations on team_stats" ON team_stats FOR ALL USING (true);
        CREATE POLICY "Allow all operations on betting_odds" ON betting_odds FOR ALL USING (true);
      `
    });

    if (policyError) {
      console.error('Error creating RLS policies:', policyError);
    } else {
      console.log('✅ Created RLS policies');
    }

    console.log('🎉 All tables created successfully!');

  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
};

