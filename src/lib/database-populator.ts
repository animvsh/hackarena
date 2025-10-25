import { supabase } from '../integrations/supabase/client';
import { simpleGitHubFetcher, calculateHackerStats } from './simple-github-fetcher';

export interface HackerData {
  github_username: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  company?: string;
  website?: string;
  twitter_username?: string;
  linkedin_url?: string;
  stats: {
    hackathon_experience: number;
    technical_skill: number;
    leadership: number;
    innovation: number;
    communication: number;
    ai_ml_skill: number;
    fintech_skill: number;
    blockchain_skill: number;
    mobile_skill: number;
    fullstack_skill: number;
    consistency: number;
    growth: number;
    network: number;
    company_prestige: number;
    overall_rating: number;
    market_value: number;
    github_followers: number;
    github_repos: number;
    github_stars: number;
    github_commits: number;
  };
}

export interface HackathonData {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  website?: string;
  prize_pool: number;
  total_participants: number;
  status: string;
  prizes: Array<{
    category: string;
    prize_amount: number;
    position: number;
    description: string;
  }>;
  teams: Array<{
    name: string;
    tagline: string;
    category: string;
    tech_stack: string[];
    logo_url?: string;
    github_url?: string;
    devpost_url?: string;
    team_size: number;
    current_progress: number;
    momentum_score: number;
    members: string[]; // GitHub usernames
  }>;
}

// GitHub usernames to fetch
const GITHUB_USERNAMES = [
  'v2pir', 'animvsh', 'abhisheknaiidu', 'coderjojo', 'ALX-13', 
  'daria-stanilevici', 'rzashakeri', 'lwk', 'torvalds', 'gaearon',
  'sindresorhus', 'tj', 'yyx990803', 'addyosmani', 'getify',
  'danielmiessler', 'wesbos', 'bradtraversy', 'kentcdodds', 'dan_abramov',
  'rauchg', 'mxstbr', 'jongleberry', 'sapegin', 'philipwalton',
  'addyosmani', 'paulirish', 'sindresorhus', 'substack', 'feross',
  'rvagg', 'isaacs', 'creationix', 'mikeal', 'dominictarr',
  'maxogden', 'substack', 'feross', 'rvagg', 'isaacs',
  'creationix', 'mikeal', 'dominictarr', 'maxogden', 'substack'
];

// Generate realistic hackathon data
const generateHackathons = (): HackathonData[] => [
  {
    name: "TechCrunch Disrupt 2024",
    description: "The world's premier startup competition and innovation showcase",
    start_date: "2024-03-15T09:00:00Z",
    end_date: "2024-03-17T18:00:00Z",
    location: "San Francisco, CA",
    website: "https://techcrunch.com/events/disrupt-2024",
    prize_pool: 100000,
    total_participants: 200,
    status: "upcoming",
    prizes: [
      { category: "Grand Prize", prize_amount: 50000, position: 1, description: "Overall winner" },
      { category: "AI/ML Innovation", prize_amount: 25000, position: 1, description: "Best AI/ML solution" },
      { category: "FinTech Innovation", prize_amount: 25000, position: 1, description: "Best financial technology" },
      { category: "Social Impact", prize_amount: 15000, position: 1, description: "Best social impact solution" },
      { category: "Developer Tools", prize_amount: 10000, position: 1, description: "Best developer experience" }
    ],
    teams: []
  },
  {
    name: "ETHGlobal Paris 2024",
    description: "The largest Ethereum hackathon in Europe",
    start_date: "2024-04-20T10:00:00Z",
    end_date: "2024-04-22T20:00:00Z",
    location: "Paris, France",
    website: "https://ethglobal.com/events/paris2024",
    prize_pool: 75000,
    total_participants: 150,
    status: "upcoming",
    prizes: [
      { category: "Grand Prize", prize_amount: 30000, position: 1, description: "Overall winner" },
      { category: "DeFi Innovation", prize_amount: 20000, position: 1, description: "Best DeFi protocol" },
      { category: "NFT & Gaming", prize_amount: 15000, position: 1, description: "Best NFT/gaming solution" },
      { category: "Infrastructure", prize_amount: 10000, position: 1, description: "Best infrastructure tool" }
    ],
    teams: []
  },
  {
    name: "Microsoft Build Hackathon 2024",
    description: "Build the future with Microsoft technologies",
    start_date: "2024-05-15T08:00:00Z",
    end_date: "2024-05-17T17:00:00Z",
    location: "Seattle, WA",
    website: "https://build.microsoft.com",
    prize_pool: 50000,
    total_participants: 100,
    status: "upcoming",
    prizes: [
      { category: "Grand Prize", prize_amount: 25000, position: 1, description: "Overall winner" },
      { category: "Azure Innovation", prize_amount: 15000, position: 1, description: "Best Azure solution" },
      { category: "AI & Copilot", prize_amount: 10000, position: 1, description: "Best AI integration" }
    ],
    teams: []
  }
];

// Generate teams for each hackathon
const generateTeamsForHackathon = (hackathon: HackathonData, hackers: HackerData[]): HackathonData => {
  const teamNames = [
    "Quantum Coders", "Neural Networks", "Blockchain Builders", "AI Pioneers", "Cloud Architects",
    "Data Scientists", "Mobile Mavericks", "Full Stack Heroes", "DevOps Dynamos", "Security Squad",
    "Innovation Inc", "Tech Titans", "Code Crusaders", "Digital Dreamers", "Future Founders"
  ];

  const categories = ["AI/ML", "FinTech", "Blockchain", "Mobile", "Fullstack", "DevTools", "IoT", "Gaming"];
  const techStacks = [
    ["React", "Node.js", "PostgreSQL"], ["Python", "TensorFlow", "FastAPI"], 
    ["Solidity", "Web3.js", "React"], ["Flutter", "Firebase", "Dart"],
    ["Next.js", "TypeScript", "Supabase"], ["Rust", "WebAssembly", "React"],
    ["Vue.js", "Express", "MongoDB"], ["Angular", "Spring Boot", "MySQL"]
  ];

  const teams = [];
  const numTeams = Math.min(12, Math.floor(hackers.length / 3));

  for (let i = 0; i < numTeams; i++) {
    const teamSize = Math.floor(Math.random() * 3) + 2; // 2-4 members
    const teamMembers = hackers.slice(i * 3, i * 3 + teamSize);
    
    teams.push({
      name: teamNames[i] || `Team ${i + 1}`,
      tagline: `Building the future of ${categories[i % categories.length]}`,
      category: categories[i % categories.length],
      tech_stack: techStacks[i % techStacks.length],
      logo_url: `https://api.dicebear.com/7.x/initials/svg?seed=${teamNames[i]}`,
      github_url: `https://github.com/${teamMembers[0]?.github_username}/hackathon-project`,
      devpost_url: `https://devpost.com/software/${teamNames[i].toLowerCase().replace(/\s+/g, '-')}`,
      team_size: teamMembers.length,
      current_progress: Math.floor(Math.random() * 40) + 10, // 10-50%
      momentum_score: Math.random() * 100,
      members: teamMembers.map(h => h.github_username)
    });
  }

  return { ...hackathon, teams };
};

// Fetch hacker data from GitHub
export const fetchHackerData = async (): Promise<HackerData[]> => {
  const hackers: HackerData[] = [];
  
  console.log('Fetching hacker data from GitHub...');
  
  for (const username of GITHUB_USERNAMES) {
    try {
      const githubData = await simpleGitHubFetcher(username);
      if (githubData) {
        const stats = calculateHackerStats(githubData);
        hackers.push({
          github_username: username,
          name: githubData.name || username,
          avatar_url: githubData.avatar_url,
          bio: githubData.bio,
          location: githubData.location,
          company: githubData.company,
          website: githubData.blog,
          twitter_username: githubData.twitter_username,
          linkedin_url: undefined, // We don't have this from GitHub
          stats: {
            hackathon_experience: stats.hackathon_experience,
            technical_skill: stats.technical_skill,
            leadership: stats.leadership,
            innovation: stats.innovation,
            communication: stats.communication,
            ai_ml_skill: stats.ai_ml_skill,
            fintech_skill: stats.fintech_skill,
            blockchain_skill: stats.blockchain_skill,
            mobile_skill: stats.mobile_skill,
            fullstack_skill: stats.fullstack_skill,
            consistency: stats.consistency,
            growth: stats.growth,
            network: stats.network,
            company_prestige: stats.company_prestige,
            overall_rating: stats.overall_rating,
            market_value: stats.market_value,
            github_followers: githubData.followers || 0,
            github_repos: githubData.public_repos || 0,
            github_stars: Math.floor(Math.random() * 1000), // Simulated
            github_commits: Math.floor(Math.random() * 5000) // Simulated
          }
        });
        console.log(`✅ Fetched data for ${username}`);
      } else {
        console.log(`❌ Skipped ${username} - not found`);
      }
    } catch (error) {
      console.error(`❌ Error fetching ${username}:`, error);
    }
  }

  // Add some simulated hackers to reach 50 total
  const simulatedHackers = generateSimulatedHackers(50 - hackers.length);
  hackers.push(...simulatedHackers);

  return hackers;
};

// Generate simulated hacker data
const generateSimulatedHackers = (count: number): HackerData[] => {
  const names = [
    "Alex Chen", "Sarah Johnson", "Mike Rodriguez", "Emma Wilson", "David Kim",
    "Lisa Zhang", "James Brown", "Maria Garcia", "John Smith", "Anna Lee",
    "Chris Taylor", "Rachel Green", "Tom Anderson", "Jessica White", "Ryan Davis",
    "Amanda Miller", "Kevin Wang", "Nicole Jones", "Brian Thompson", "Stephanie Clark"
  ];

  const companies = [
    "Google", "Microsoft", "Apple", "Amazon", "Meta", "Netflix", "Uber", "Airbnb",
    "Stripe", "Shopify", "GitHub", "GitLab", "MongoDB", "Redis", "Docker", "Kubernetes"
  ];

  const locations = [
    "San Francisco, CA", "New York, NY", "Seattle, WA", "Austin, TX", "Boston, MA",
    "Los Angeles, CA", "Chicago, IL", "Denver, CO", "Portland, OR", "Miami, FL"
  ];

  return Array.from({ length: count }, (_, i) => {
    const name = names[i % names.length];
    const company = companies[i % companies.length];
    const location = locations[i % locations.length];
    
    return {
      github_username: `hacker${i + 1}`,
      name: name,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      bio: `Passionate developer specializing in ${['AI/ML', 'Web Dev', 'Mobile', 'Blockchain'][i % 4]}`,
      location: location,
      company: company,
      website: `https://${name.toLowerCase().replace(/\s+/g, '')}.dev`,
      twitter_username: `@${name.toLowerCase().replace(/\s+/g, '')}`,
      linkedin_url: `https://linkedin.com/in/${name.toLowerCase().replace(/\s+/g, '')}`,
      stats: {
        hackathon_experience: Math.floor(Math.random() * 10) + 1,
        technical_skill: Math.floor(Math.random() * 40) + 60,
        leadership: Math.floor(Math.random() * 30) + 40,
        innovation: Math.floor(Math.random() * 35) + 45,
        communication: Math.floor(Math.random() * 25) + 50,
        ai_ml_skill: Math.floor(Math.random() * 50) + 30,
        fintech_skill: Math.floor(Math.random() * 50) + 30,
        blockchain_skill: Math.floor(Math.random() * 50) + 30,
        mobile_skill: Math.floor(Math.random() * 50) + 30,
        fullstack_skill: Math.floor(Math.random() * 50) + 30,
        consistency: Math.floor(Math.random() * 30) + 50,
        growth: Math.floor(Math.random() * 40) + 40,
        network: Math.floor(Math.random() * 50) + 30,
        company_prestige: Math.floor(Math.random() * 40) + 40,
        overall_rating: Math.floor(Math.random() * 20) + 70,
        market_value: Math.floor(Math.random() * 50000) + 50000,
        github_followers: Math.floor(Math.random() * 500) + 50,
        github_repos: Math.floor(Math.random() * 100) + 10,
        github_stars: Math.floor(Math.random() * 1000) + 100,
        github_commits: Math.floor(Math.random() * 2000) + 500
      }
    };
  });
};

// Save hackers to database
export const saveHackersToDatabase = async (hackers: HackerData[]): Promise<void> => {
  console.log('Saving hackers to database...');
  
  for (const hacker of hackers) {
    try {
      // Insert hacker
      const { data: hackerData, error: hackerError } = await supabase
        .from('hackers')
        .insert({
          github_username: hacker.github_username,
          name: hacker.name,
          avatar_url: hacker.avatar_url,
          bio: hacker.bio,
          location: hacker.location,
          company: hacker.company,
          website: hacker.website,
          twitter_username: hacker.twitter_username,
          linkedin_url: hacker.linkedin_url
        })
        .select()
        .single();

      if (hackerError) {
        console.error(`Error inserting hacker ${hacker.github_username}:`, hackerError);
        continue;
      }

      // Insert hacker stats
      const { error: statsError } = await supabase
        .from('hacker_stats')
        .insert({
          hacker_id: hackerData.id,
          ...hacker.stats
        });

      if (statsError) {
        console.error(`Error inserting stats for ${hacker.github_username}:`, statsError);
      } else {
        console.log(`✅ Saved ${hacker.github_username} to database`);
      }
    } catch (error) {
      console.error(`❌ Error saving ${hacker.github_username}:`, error);
    }
  }
};

// Save hackathons and teams to database
export const saveHackathonsToDatabase = async (hackathons: HackathonData[]): Promise<void> => {
  console.log('Saving hackathons to database...');
  
  for (const hackathon of hackathons) {
    try {
      // Insert hackathon
      const { data: hackathonData, error: hackathonError } = await supabase
        .from('hackathons')
        .insert({
          name: hackathon.name,
          description: hackathon.description,
          start_date: hackathon.start_date,
          end_date: hackathon.end_date,
          location: hackathon.location,
          website: hackathon.website,
          prize_pool: hackathon.prize_pool,
          total_participants: hackathon.total_participants,
          status: hackathon.status
        })
        .select()
        .single();

      if (hackathonError) {
        console.error(`Error inserting hackathon ${hackathon.name}:`, hackathonError);
        continue;
      }

      // Insert prizes
      for (const prize of hackathon.prizes) {
        await supabase
          .from('hackathon_prizes')
          .insert({
            hackathon_id: hackathonData.id,
            ...prize
          });
      }

      // Insert teams
      for (const team of hackathon.teams) {
        const { data: teamData, error: teamError } = await supabase
          .from('hackathon_teams')
          .insert({
            hackathon_id: hackathonData.id,
            name: team.name,
            tagline: team.tagline,
            category: team.category,
            tech_stack: team.tech_stack,
            logo_url: team.logo_url,
            github_url: team.github_url,
            devpost_url: team.devpost_url,
            team_size: team.team_size,
            current_progress: team.current_progress,
            momentum_score: team.momentum_score
          })
          .select()
          .single();

        if (teamError) {
          console.error(`Error inserting team ${team.name}:`, teamError);
          continue;
        }

        // Insert team members
        for (const memberUsername of team.members) {
          const { data: hackerData } = await supabase
            .from('hackers')
            .select('id')
            .eq('github_username', memberUsername)
            .single();

          if (hackerData) {
            await supabase
              .from('hackathon_team_members')
              .insert({
                team_id: teamData.id,
                hacker_id: hackerData.id,
                role: 'Developer'
              });
          }
        }

        // Calculate and insert team stats
        const { data: teamMembers } = await supabase
          .from('hackathon_team_members')
          .select(`
            hacker_id,
            hackers!inner (
              hacker_stats (
                hackathon_experience,
                technical_skill,
                leadership,
                innovation,
                communication,
                ai_ml_skill,
                fintech_skill,
                blockchain_skill,
                mobile_skill,
                fullstack_skill,
                consistency,
                growth,
                network,
                company_prestige,
                overall_rating,
                market_value
              )
            )
          `)
          .eq('team_id', teamData.id);

        if (teamMembers && teamMembers.length > 0) {
          const stats = teamMembers.map(m => m.hackers?.hacker_stats).filter(Boolean);
          const avgStats = {
            avg_hackathon_experience: stats.reduce((sum, s) => sum + s.hackathon_experience, 0) / stats.length,
            avg_technical_skill: stats.reduce((sum, s) => sum + s.technical_skill, 0) / stats.length,
            avg_leadership: stats.reduce((sum, s) => sum + s.leadership, 0) / stats.length,
            avg_innovation: stats.reduce((sum, s) => sum + s.innovation, 0) / stats.length,
            avg_communication: stats.reduce((sum, s) => sum + s.communication, 0) / stats.length,
            avg_ai_ml_skill: stats.reduce((sum, s) => sum + s.ai_ml_skill, 0) / stats.length,
            avg_fintech_skill: stats.reduce((sum, s) => sum + s.fintech_skill, 0) / stats.length,
            avg_blockchain_skill: stats.reduce((sum, s) => sum + s.blockchain_skill, 0) / stats.length,
            avg_mobile_skill: stats.reduce((sum, s) => sum + s.mobile_skill, 0) / stats.length,
            avg_fullstack_skill: stats.reduce((sum, s) => sum + s.fullstack_skill, 0) / stats.length,
            avg_consistency: stats.reduce((sum, s) => sum + s.consistency, 0) / stats.length,
            avg_growth: stats.reduce((sum, s) => sum + s.growth, 0) / stats.length,
            avg_network: stats.reduce((sum, s) => sum + s.network, 0) / stats.length,
            avg_company_prestige: stats.reduce((sum, s) => sum + s.company_prestige, 0) / stats.length,
            avg_overall_rating: stats.reduce((sum, s) => sum + s.overall_rating, 0) / stats.length,
            total_market_value: stats.reduce((sum, s) => sum + s.market_value, 0)
          };

          await supabase
            .from('team_stats')
            .insert({
              team_id: teamData.id,
              ...avgStats
            });
        }
      }

      console.log(`✅ Saved hackathon ${hackathon.name} to database`);
    } catch (error) {
      console.error(`❌ Error saving hackathon ${hackathon.name}:`, error);
    }
  }
};

// Main function to populate database
export const populateDatabase = async (): Promise<void> => {
  try {
    console.log('🚀 Starting database population...');
    
    // Fetch hacker data
    const hackers = await fetchHackerData();
    console.log(`📊 Fetched ${hackers.length} hackers`);
    
    // Save hackers to database
    await saveHackersToDatabase(hackers);
    
    // Generate hackathons with teams
    const hackathons = generateHackathons();
    const hackathonsWithTeams = hackathons.map(hackathon => 
      generateTeamsForHackathon(hackathon, hackers)
    );
    
    // Save hackathons to database
    await saveHackathonsToDatabase(hackathonsWithTeams);
    
    console.log('✅ Database population completed successfully!');
  } catch (error) {
    console.error('❌ Error populating database:', error);
    throw error;
  }
};


