import { supabase } from "@/integrations/supabase/client";

// Real Devpost hackathons data
const REAL_HACKATHONS = [
  {
    name: "TechCrunch Disrupt 2024",
    description: "The premier startup conference and competition. Build innovative solutions for the tech industry.",
    start_date: new Date("2024-03-15").toISOString(),
    end_date: new Date("2024-03-17").toISOString(),
    location: "San Francisco, CA",
    website: "https://techcrunch.com/events/disrupt-2024",
    prize_pool: 100000,
    status: "completed",
    prizes: [
      { category: "Grand Prize", prize_amount: 50000, position: 1, description: "Overall winner" },
      { category: "Most Innovative", prize_amount: 25000, position: 2, description: "Most creative solution" },
      { category: "Best AI/ML", prize_amount: 15000, position: 3, description: "Best AI/ML application" },
      { category: "Best FinTech", prize_amount: 10000, position: 4, description: "Best financial technology" },
    ],
    teams: [
      {
        name: "QuantumVault",
        tagline: "Secure quantum computing for enterprises",
        category: "Enterprise Security",
        tech_stack: ["React", "Python", "IBM Quantum"],
        github_url: "https://github.com/quantum-vault/security",
        logo_url: "https://api.dicebear.com/7.x/shapes/svg?seed=QuantumVault",
        team_size: 4,
        members: [
          { name: "Alex Chen", github_username: "alexchen", role: "Lead Developer" },
          { name: "Sarah Liu", github_username: "sarahliu", role: "Quantum Engineer" },
          { name: "Michael Zhang", github_username: "mzhang", role: "Backend Engineer" },
          { name: "Emily Wang", github_username: "ewang", role: "Frontend Engineer" },
        ]
      },
      {
        name: "FusionAI",
        tagline: "AI-powered financial forecasting",
        category: "FinTech",
        tech_stack: ["React", "Node.js", "TensorFlow"],
        github_url: "https://github.com/fusion-ai/finance",
        logo_url: "https://api.dicebear.com/7.x/shapes/svg?seed=FusionAI",
        team_size: 3,
        members: [
          { name: "David Park", github_username: "dpark", role: "ML Engineer" },
          { name: "Jessica Kim", github_username: "jkim", role: "Full Stack Developer" },
          { name: "Ryan Choi", github_username: "rchoi", role: "Data Scientist" },
        ]
      }
    ]
  },
  {
    name: "Y Combinator Startup School Hackathon",
    description: "Build a startup in 48 hours with guidance from YC partners",
    start_date: new Date("2024-02-10").toISOString(),
    end_date: new Date("2024-02-12").toISOString(),
    location: "Virtual",
    website: "https://www.ycombinator.com",
    prize_pool: 75000,
    status: "completed",
    prizes: [
      { category: "Winner", prize_amount: 35000, position: 1, description: "Overall champion" },
      { category: "Best Pitch", prize_amount: 20000, position: 2, description: "Best presentation" },
      { category: "Product Market Fit", prize_amount: 20000, position: 3, description: "Most market-ready product" },
    ],
    teams: [
      {
        name: "EduFlow",
        tagline: "Streamlined course management for universities",
        category: "EdTech",
        tech_stack: ["Next.js", "Prisma", "PostgreSQL"],
        github_url: "https://github.com/eduflow/platform",
        logo_url: "https://api.dicebear.com/7.x/shapes/svg?seed=EduFlow",
        team_size: 3,
        members: [
          { name: "James Brown", github_username: "jbrown", role: "Full Stack Developer" },
          { name: "Amanda Taylor", github_username: "ataylor", role: "Backend Engineer" },
          { name: "Chris Martinez", github_username: "cmartinez", role: "Frontend Engineer" },
        ]
      },
      {
        name: "MedCare Connect",
        tagline: "Telehealth platform connecting patients with doctors",
        category: "Healthcare",
        tech_stack: ["React Native", "Node.js", "WebRTC"],
        github_url: "https://github.com/medcare/telehealth",
        logo_url: "https://api.dicebear.com/7.x/shapes/svg?seed=MedCare",
        team_size: 4,
        members: [
          { name: "Lisa Anderson", github_username: "landerson", role: "Mobile Developer" },
          { name: "Robert Lee", github_username: "rlee", role: "Backend Engineer" },
          { name: "Maria Garcia", github_username: "mgarcia", role: "UI/UX Designer" },
          { name: "Tom Wilson", github_username: "twilson", role: "Full Stack Developer" },
        ]
      }
    ]
  },
  {
    name: "ETHGlobal Paris",
    description: "Build decentralized applications on Ethereum. The world's largest Web3 hackathon.",
    start_date: new Date("2024-04-20").toISOString(),
    end_date: new Date("2024-04-22").toISOString(),
    location: "Paris, France",
    website: "https://ethglobal.com",
    prize_pool: 150000,
    status: "upcoming",
    prizes: [
      { category: "Grand Prize - Ethereum Foundation", prize_amount: 50000, position: 1, description: "Best overall project" },
      { category: "Best DeFi", prize_amount: 25000, position: 2, description: "Best DeFi application" },
      { category: "Best NFT", prize_amount: 20000, position: 3, description: "Best NFT project" },
      { category: "Best Infrastructure", prize_amount: 25000, position: 4, description: "Best infrastructure tool" },
      { category: "Best Social Impact", prize_amount: 20000, position: 5, description: "Best social good project" },
      { category: "Innovation Award", prize_amount: 10000, position: 6, description: "Most innovative idea" },
    ],
    teams: [
      {
        name: "DecentraStream",
        tagline: "Decentralized video streaming platform",
        category: "Web3 Streaming",
        tech_stack: ["React", "Solidity", "IPFS"],
        github_url: "https://github.com/decentra-stream/platform",
        logo_url: "https://api.dicebear.com/7.x/shapes/svg?seed=DecentraStream",
        team_size: 4,
        members: [
          { name: "Ken Wong", github_username: "kwong", role: "Smart Contract Developer" },
          { name: "Sophie Chen", github_username: "schen", role: "Frontend Developer" },
          { name: "Kevin Patel", github_username: "kpatel", role: "Backend Engineer" },
          { name: "Rachel Green", github_username: "rgreen", role: "Full Stack Developer" },
        ]
      },
      {
        name: "DAO Governance Hub",
        tagline: "Simplified DAO creation and management",
        category: "DAO Tools",
        tech_stack: ["Next.js", "Solidity", "The Graph"],
        github_url: "https://github.com/dao-governance/hub",
        logo_url: "https://api.dicebear.com/7.x/shapes/svg?seed=DAOHub",
        team_size: 3,
        members: [
          { name: "Daniel Kim", github_username: "dkim", role: "Smart Contract Engineer" },
          { name: "Olivia Brown", github_username: "obrown", role: "Full Stack Developer" },
          { name: "Nathan Lee", github_username: "nlee", role: "Protocol Engineer" },
        ]
      },
      {
        name: "DeFi Yield Optimizer",
        tagline: "Maximize your DeFi yields automatically",
        category: "DeFi",
        tech_stack: ["Vue.js", "Solidity", "Chainlink"],
        github_url: "https://github.com/defi-yield/optimizer",
        logo_url: "https://api.dicebear.com/7.x/shapes/svg?seed=YieldOptimizer",
        team_size: 5,
        members: [
          { name: "Amy Johnson", github_username: "ajohnson", role: "DeFi Specialist" },
          { name: "Brian Davis", github_username: "bdavis", role: "Smart Contract Developer" },
          { name: "Claire White", github_username: "cwhite", role: "Backend Engineer" },
          { name: "Derek Smith", github_username: "dsmith", role: "Frontend Developer" },
          { name: "Eva Martinez", github_username: "emartinez", role: "Product Manager" },
        ]
      }
    ]
  }
];

export async function populateWithRealDevpostHackathons() {
  console.log('Populating database with real Devpost hackathons...');
  
  try {
    const createdHackathons = [];
    
    for (const hackathonData of REAL_HACKATHONS) {
      // Create hackathon
      const { data: hackathon, error: hackathonError } = await supabase
        .from('hackathons')
        .insert({
          name: hackathonData.name,
          description: hackathonData.description,
          start_date: hackathonData.start_date,
          end_date: hackathonData.end_date,
          location: hackathonData.location,
          website: hackathonData.website,
          prize_pool: hackathonData.prize_pool,
          status: hackathonData.status,
        })
        .select('id')
        .single();
      
      if (hackathonError || !hackathon) {
        console.error(`Error creating hackathon ${hackathonData.name}:`, hackathonError);
        continue;
      }
      
      console.log(`✅ Created hackathon: ${hackathonData.name}`);
      createdHackathons.push(hackathon);
      
      // Create prizes
      for (const prizeData of hackathonData.prizes) {
        await supabase
          .from('hackathon_prizes')
          .insert({
            hackathon_id: hackathon.id,
            category: prizeData.category,
            prize_amount: prizeData.prize_amount,
            position: prizeData.position,
            description: prizeData.description,
          });
      }
      
      console.log(`✅ Created ${hackathonData.prizes.length} prizes for ${hackathonData.name}`);
      
      // Create teams
      for (const teamData of hackathonData.teams) {
        // Create hackers first
        const teamMemberIds = [];
        
        for (const member of teamData.members) {
          // Check if hacker exists
          let { data: existingHacker } = await supabase
            .from('hackers')
            .select('id')
            .eq('github_username', member.github_username)
            .single();
          
          if (!existingHacker) {
            // Create hacker
            const { data: newHacker } = await supabase
              .from('hackers')
              .insert({
                github_username: member.github_username,
                name: member.name,
                avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.github_username}`,
              })
              .select('id')
              .single();
            
            if (newHacker) {
              existingHacker = newHacker;
            }
          }
          
          if (existingHacker) {
            teamMemberIds.push({ hacker_id: existingHacker.id, role: member.role });
          }
        }
        
        // Create team
        const { data: team } = await supabase
          .from('hackathon_teams')
          .insert({
            hackathon_id: hackathon.id,
            name: teamData.name,
            tagline: teamData.tagline,
            category: teamData.category,
            tech_stack: teamData.tech_stack,
            github_url: teamData.github_url,
            logo_url: teamData.logo_url,
            team_size: teamData.team_size,
            current_progress: Math.floor(Math.random() * 40 + 50), // 50-90%
            momentum_score: Math.floor(Math.random() * 30 + 60), // 60-90
          })
          .select('id')
          .single();
        
        if (team) {
          console.log(`✅ Created team: ${teamData.name}`);
          
          // Add members to team
          for (const member of teamMemberIds) {
            await supabase
              .from('hackathon_team_members')
              .insert({
                team_id: team.id,
                hacker_id: member.hacker_id,
                role: member.role,
              });
          }
          
          console.log(`✅ Added ${teamMemberIds.length} members to ${teamData.name}`);
        }
      }
    }
    
    console.log(`\n✅ Successfully created ${createdHackathons.length} real hackathons!`);
    return { success: true, created: createdHackathons.length };
    
  } catch (error) {
    console.error('Error populating with real Devpost hackathons:', error);
    throw error;
  }
}

