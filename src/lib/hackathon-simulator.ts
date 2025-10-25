// GitHub Profile Fetcher and Hackathon Simulator
// This fetches real GitHub data and creates a realistic hackathon simulation

export interface GitHubProfile {
  username: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
  blog: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  avatar_url: string;
  html_url: string;
  repos_url: string;
  languages: { [key: string]: number };
  total_stars: number;
  total_forks: number;
}

export interface HackathonParticipant {
  id: string;
  github_profile: GitHubProfile;
  calculated_stats: {
    technical_skill: number;
    hackathon_experience: number;
    leadership_score: number;
    innovation_score: number;
    communication_score: number;
    ai_ml_expertise: number;
    fintech_experience: number;
    blockchain_knowledge: number;
    mobile_dev_skill: number;
    fullstack_proficiency: number;
    consistency_score: number;
    growth_trajectory: number;
    network_strength: number;
    company_prestige: number;
    overall_rating: number;
    market_value: number;
  };
  hackathon_history: Array<{
    name: string;
    date: string;
    placement?: number;
    category: string;
  }>;
}

export interface HackathonTeam {
  id: string;
  name: string;
  tagline: string;
  logo_url: string;
  category: string[];
  tech_stack: string[];
  github_repo: string;
  devpost_url: string;
  status: string;
  team_size: number;
  current_progress: number;
  momentum_score: number;
  members: HackathonParticipant[];
  team_composition: {
    skill_diversity: number;
    experience_gap: number;
    leadership_clarity: number;
    domain_expertise: number;
    hackathon_readiness: number;
    innovation_potential: number;
    execution_ability: number;
    market_fit_understanding: number;
    overall_team_rating: number;
    predicted_performance: number;
  };
}

export class GitHubHackathonSimulator {
  private githubUsernames: string[] = [
    // Provided usernames
    'v2pir', 'animvsh', 'abhisheknaiidu', 'coderjojo', 'ALX-13', 'daria-stanilevici', 'rzashakeri',
    
    // Additional popular GitHub users
    'torvalds', 'mojombo', 'defunkt', 'pjhyett', 'wycats', 'ezmobius', 'ivey', 'evanphx',
    'vanpelt', 'wayneeseguin', 'brynary', 'kevinclark', 'technoweenie', 'macournoyer',
    'takeo', 'caged', 'topfunky', 'anotherjesse', 'roland', 'lukas', 'fanquake', 'schacon',
    'rtomayko', 'matz', 'rkh', 'josh', 'svenfuchs', 'ry', 'jashkenas', 'josevalim',
    'tenderlove', 'dhh', 'jeresig', 'addyosmani', 'paulirish', 'fat', 'mdo', 'substack',
    'isaacs', 'tj', 'rauchg', 'gaearon', 'yyx990803', 'kentcdodds', 'getify', 'sindresorhus',
    'jakearchibald', 'danielroe', 'antfu', 'egoist', 'yyx990803', 'evanw', 'developit'
  ];

  async fetchGitHubProfile(username: string): Promise<GitHubProfile | null> {
    try {
      // Fetch user profile
      const userResponse = await fetch(`https://api.github.com/users/${username}`);
      if (!userResponse.ok) {
        console.warn(`Failed to fetch GitHub profile for ${username}`);
        return null;
      }
      
      const user = await userResponse.json();
      
      // Fetch repositories to analyze languages
      const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
      const repos = reposResponse.ok ? await reposResponse.json() : [];
      
      // Analyze languages and calculate stats
      const languages = await this.analyzeLanguages(repos.slice(0, 20)); // Limit to first 20 repos
      const totalStars = repos.reduce((sum: number, repo: any) => sum + repo.stargazers_count, 0);
      const totalForks = repos.reduce((sum: number, repo: any) => sum + repo.forks_count, 0);
      
      return {
        username: user.login,
        name: user.name,
        bio: user.bio,
        location: user.location,
        company: user.company,
        blog: user.blog,
        twitter_username: user.twitter_username,
        public_repos: user.public_repos,
        public_gists: user.public_gists,
        followers: user.followers,
        following: user.following,
        created_at: user.created_at,
        updated_at: user.updated_at,
        avatar_url: user.avatar_url,
        html_url: user.html_url,
        repos_url: user.repos_url,
        languages,
        total_stars: totalStars,
        total_forks: totalForks
      };
    } catch (error) {
      console.error(`Error fetching GitHub profile for ${username}:`, error);
      return null;
    }
  }

  private async analyzeLanguages(repos: any[]): Promise<{ [key: string]: number }> {
    const languages: { [key: string]: number } = {};
    
    for (const repo of repos) {
      try {
        const langResponse = await fetch(repo.languages_url);
        if (langResponse.ok) {
          const repoLanguages = await langResponse.json();
          Object.entries(repoLanguages).forEach(([lang, bytes]) => {
            languages[lang] = (languages[lang] || 0) + (bytes as number);
          });
        }
      } catch (error) {
        // Skip if language data unavailable
      }
    }
    
    return languages;
  }

  calculateHackerStats(profile: GitHubProfile): HackathonParticipant['calculated_stats'] {
    // Calculate years since account creation
    const accountAge = (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    // Technical skill based on repos, stars, and followers
    const technicalSkill = Math.min(100, 
      (profile.public_repos * 2) + 
      (profile.total_stars / 10) + 
      (profile.followers / 5) +
      (Object.keys(profile.languages).length * 5)
    );
    
    // Hackathon experience (simulated based on activity)
    const hackathonExperience = Math.min(100, 
      (profile.public_repos > 50 ? 30 : profile.public_repos * 0.6) +
      (profile.total_stars > 100 ? 25 : profile.total_stars * 0.25) +
      (accountAge > 5 ? 20 : accountAge * 4) +
      (profile.followers > 100 ? 25 : profile.followers * 0.25)
    );
    
    // Leadership score based on followers and repo quality
    const leadershipScore = Math.min(100,
      (profile.followers / 10) +
      (profile.total_stars / 20) +
      (profile.public_repos > 30 ? 20 : 0) +
      (profile.company ? 15 : 0)
    );
    
    // Innovation score based on unique languages and project diversity
    const innovationScore = Math.min(100,
      (Object.keys(profile.languages).length * 8) +
      (profile.total_stars / 15) +
      (profile.public_repos > 20 ? 25 : profile.public_repos * 1.25) +
      (profile.bio ? 10 : 0)
    );
    
    // Communication score based on bio, blog, and social presence
    const communicationScore = Math.min(100,
      (profile.bio ? 20 : 0) +
      (profile.blog ? 15 : 0) +
      (profile.twitter_username ? 10 : 0) +
      (profile.followers / 20) +
      (profile.public_gists * 2)
    );
    
    // Specialized skills based on languages
    const aiMlExpertise = this.calculateSpecializedSkill(profile.languages, [
      'Python', 'R', 'Julia', 'MATLAB', 'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn'
    ]);
    
    const fintechExperience = this.calculateSpecializedSkill(profile.languages, [
      'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'Go', 'Rust'
    ]);
    
    const blockchainKnowledge = this.calculateSpecializedSkill(profile.languages, [
      'Solidity', 'Rust', 'Go', 'JavaScript', 'TypeScript', 'Python'
    ]);
    
    const mobileDevSkill = this.calculateSpecializedSkill(profile.languages, [
      'Swift', 'Kotlin', 'Dart', 'JavaScript', 'TypeScript', 'React Native', 'Flutter'
    ]);
    
    const fullstackProficiency = this.calculateSpecializedSkill(profile.languages, [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'Go', 'Rust', 'PHP', 'Ruby'
    ]);
    
    // Meta stats
    const consistencyScore = Math.min(100, 
      (profile.public_repos > 20 ? 40 : profile.public_repos * 2) +
      (profile.followers > 50 ? 30 : profile.followers * 0.6) +
      (accountAge > 3 ? 30 : accountAge * 10)
    );
    
    const growthTrajectory = Math.min(100,
      (profile.total_stars / 10) +
      (profile.followers / 5) +
      (profile.public_repos * 1.5) +
      (accountAge > 2 ? 20 : accountAge * 10)
    );
    
    const networkStrength = Math.min(100, profile.followers + (profile.following * 0.5));
    
    const companyPrestige = this.calculateCompanyPrestige(profile.company);
    
    // Calculate overall rating
    const overallRating = Math.round(
      (technicalSkill * 0.25) +
      (hackathonExperience * 0.20) +
      (leadershipScore * 0.15) +
      (innovationScore * 0.15) +
      (communicationScore * 0.10) +
      (consistencyScore * 0.10) +
      (growthTrajectory * 0.05)
    );
    
    const marketValue = Math.round((overallRating / 100) * 10000);
    
    return {
      technical_skill: Math.round(technicalSkill),
      hackathon_experience: Math.round(hackathonExperience),
      leadership_score: Math.round(leadershipScore),
      innovation_score: Math.round(innovationScore),
      communication_score: Math.round(communicationScore),
      ai_ml_expertise: aiMlExpertise,
      fintech_experience: fintechExperience,
      blockchain_knowledge: blockchainKnowledge,
      mobile_dev_skill: mobileDevSkill,
      fullstack_proficiency: fullstackProficiency,
      consistency_score: Math.round(consistencyScore),
      growth_trajectory: Math.round(growthTrajectory),
      network_strength: Math.round(networkStrength),
      company_prestige: companyPrestige,
      overall_rating: overallRating,
      market_value: marketValue
    };
  }

  private calculateSpecializedSkill(languages: { [key: string]: number }, targetLanguages: string[]): number {
    let score = 0;
    const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
    
    targetLanguages.forEach(lang => {
      if (languages[lang]) {
        score += (languages[lang] / totalBytes) * 100;
      }
    });
    
    return Math.min(100, score);
  }

  private calculateCompanyPrestige(company: string | null): number {
    if (!company) return 0;
    
    const prestigiousCompanies = [
      'Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix', 'Tesla', 'SpaceX',
      'OpenAI', 'Anthropic', 'Stripe', 'Databricks', 'Figma', 'Notion', 'Linear',
      'Vercel', 'Supabase', 'PlanetScale', 'Railway', 'Render'
    ];
    
    const companyLower = company.toLowerCase();
    const match = prestigiousCompanies.find(prestigious => 
      companyLower.includes(prestigious.toLowerCase())
    );
    
    return match ? 90 : 50;
  }

  generateHackathonHistory(profile: GitHubProfile): Array<{name: string, date: string, placement?: number, category: string}> {
    const categories = ['AI/ML', 'FinTech', 'Web Dev', 'Mobile', 'Blockchain', 'DevTools', 'IoT', 'Gaming'];
    const hackathons = ['MLH Local Hack Day', 'Google Hackathon', 'Microsoft Build', 'AWS Hackathon', 'Devpost Challenge', 'Hack the North', 'PennApps', 'HackMIT'];
    
    const history = [];
    const numHackathons = Math.floor(Math.random() * 5) + 1; // 1-5 hackathons
    
    for (let i = 0; i < numHackathons; i++) {
      const hackathon = hackathons[Math.floor(Math.random() * hackathons.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const date = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 2).toISOString().split('T')[0];
      
      // Higher chance of winning if user has high stats
      const stats = this.calculateHackerStats(profile);
      const winChance = stats.overall_rating / 100;
      const placement = Math.random() < winChance ? Math.floor(Math.random() * 3) + 1 : undefined;
      
      history.push({
        name: hackathon,
        date,
        placement,
        category
      });
    }
    
    return history;
  }

  async generateHackathonParticipants(): Promise<HackathonParticipant[]> {
    const participants: HackathonParticipant[] = [];
    
    // Shuffle and take first 50 usernames
    const shuffledUsernames = [...this.githubUsernames].sort(() => Math.random() - 0.5).slice(0, 50);
    
    for (let i = 0; i < shuffledUsernames.length; i++) {
      const username = shuffledUsernames[i];
      console.log(`Fetching profile ${i + 1}/50: ${username}`);
      
      const profile = await this.fetchGitHubProfile(username);
      if (profile) {
        const stats = this.calculateHackerStats(profile);
        const hackathonHistory = this.generateHackathonHistory(profile);
        
        participants.push({
          id: `participant_${i + 1}`,
          github_profile: profile,
          calculated_stats: stats,
          hackathon_history: hackathonHistory
        });
        
        // Rate limiting - wait 1 second between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return participants;
  }

  generateHackathonTeams(participants: HackathonParticipant[]): HackathonTeam[] {
    const teams: HackathonTeam[] = [];
    const teamNames = [
      'NeuralForge', 'BytePay', 'ChainForge', 'VisionAI', 'StreamSync', 'DataVault',
      'CodeMentor AI', 'FinFlow', 'TechTitans', 'DataDriven', 'CloudNative', 'AIFirst',
      'BlockchainBros', 'MobileMasters', 'WebWizards', 'DevOpsDynamos', 'SecuritySquad',
      'MLMavericks', 'FinTechFusion', 'IoTInnovators', 'GameGurus', 'ARVRArtists'
    ];
    
    const taglines = [
      'Building the future of AI-powered design',
      'Instant cross-border payments',
      'Decentralized supply chain tracking',
      'Real-time accessibility assistant',
      'Live collaboration for remote teams',
      'Privacy-first data analytics',
      'AI pair programmer for beginners',
      'Personal finance automation',
      'Next-gen development tools',
      'Data-driven decision making',
      'Cloud-native solutions',
      'AI-first applications',
      'Blockchain innovation',
      'Mobile-first experiences',
      'Modern web applications',
      'DevOps excellence',
      'Security-first approach',
      'Machine learning mastery',
      'Financial technology solutions',
      'Internet of Things innovation',
      'Immersive gaming experiences',
      'Augmented reality solutions'
    ];
    
    const categories = [
      ['AI', 'Design'], ['FinTech', 'Blockchain'], ['Blockchain', 'Enterprise'],
      ['AI', 'Accessibility'], ['DevTools', 'RealTime'], ['Data', 'Privacy'],
      ['AI', 'Education'], ['FinTech', 'Consumer'], ['DevTools', 'Productivity'],
      ['Data', 'Analytics'], ['Cloud', 'Infrastructure'], ['AI', 'Automation'],
      ['Blockchain', 'DeFi'], ['Mobile', 'iOS'], ['Web', 'Frontend'],
      ['DevOps', 'CI/CD'], ['Security', 'Cybersecurity'], ['AI', 'ML'],
      ['FinTech', 'Payments'], ['IoT', 'Hardware'], ['Gaming', 'Entertainment'],
      ['AR', 'VR']
    ];
    
    // Shuffle participants and create teams of 3-5 members
    const shuffledParticipants = [...participants].sort(() => Math.random() - 0.5);
    let participantIndex = 0;
    
    for (let i = 0; i < Math.min(teamNames.length, Math.ceil(participants.length / 4)); i++) {
      const teamSize = Math.floor(Math.random() * 3) + 3; // 3-5 members
      const teamMembers = shuffledParticipants.slice(participantIndex, participantIndex + teamSize);
      participantIndex += teamSize;
      
      if (teamMembers.length === 0) break;
      
      // Calculate team composition
      const teamComposition = this.calculateTeamComposition(teamMembers);
      
      // Generate tech stack from member languages
      const allLanguages = teamMembers.flatMap(member => Object.keys(member.github_profile.languages));
      const uniqueLanguages = [...new Set(allLanguages)].slice(0, 8);
      
      const team: HackathonTeam = {
        id: `team_${i + 1}`,
        name: teamNames[i],
        tagline: taglines[i],
        logo_url: `https://api.dicebear.com/7.x/shapes/svg?seed=${teamNames[i]}`,
        category: categories[i] || ['General'],
        tech_stack: uniqueLanguages,
        github_repo: `https://github.com/hackteam/${teamNames[i].toLowerCase()}`,
        devpost_url: `https://devpost.com/software/${teamNames[i].toLowerCase()}`,
        status: 'active',
        team_size: teamMembers.length,
        current_progress: Math.floor(Math.random() * 40) + 40, // 40-80%
        momentum_score: teamComposition.overall_team_rating * 0.8 + Math.random() * 20,
        members: teamMembers,
        team_composition: teamComposition
      };
      
      teams.push(team);
    }
    
    return teams;
  }

  private calculateTeamComposition(members: HackathonParticipant[]): HackathonTeam['team_composition'] {
    if (members.length === 0) {
      return {
        skill_diversity: 0,
        experience_gap: 0,
        leadership_clarity: 0,
        domain_expertise: 0,
        hackathon_readiness: 0,
        innovation_potential: 0,
        execution_ability: 0,
        market_fit_understanding: 0,
        overall_team_rating: 0,
        predicted_performance: 0
      };
    }
    
    const avgTechnicalSkill = members.reduce((sum, m) => sum + m.calculated_stats.technical_skill, 0) / members.length;
    const avgHackathonExp = members.reduce((sum, m) => sum + m.calculated_stats.hackathon_experience, 0) / members.length;
    const avgLeadership = members.reduce((sum, m) => sum + m.calculated_stats.leadership_score, 0) / members.length;
    const avgInnovation = members.reduce((sum, m) => sum + m.calculated_stats.innovation_score, 0) / members.length;
    
    // Skill diversity (based on different languages and skills)
    const allLanguages = members.flatMap(m => Object.keys(m.github_profile.languages));
    const uniqueLanguages = new Set(allLanguages).size;
    const skillDiversity = Math.min(100, uniqueLanguages * 10);
    
    // Experience gap (smaller gap = better)
    const experiences = members.map(m => m.calculated_stats.hackathon_experience);
    const maxExp = Math.max(...experiences);
    const minExp = Math.min(...experiences);
    const experienceGap = Math.max(0, 100 - ((maxExp - minExp) * 2));
    
    // Leadership clarity (one clear leader vs distributed)
    const leadershipScores = members.map(m => m.calculated_stats.leadership_score);
    const maxLeadership = Math.max(...leadershipScores);
    const leadershipClarity = maxLeadership;
    
    // Domain expertise (average hackathon experience)
    const domainExpertise = avgHackathonExp;
    
    // Hackathon readiness
    const hackathonReadiness = (skillDiversity + experienceGap + leadershipClarity) / 3;
    
    // Innovation potential
    const innovationPotential = avgInnovation;
    
    // Execution ability
    const executionAbility = avgTechnicalSkill;
    
    // Market fit understanding
    const marketFitUnderstanding = avgLeadership;
    
    // Overall team rating
    const overallTeamRating = (hackathonReadiness + innovationPotential + executionAbility + marketFitUnderstanding) / 4;
    
    // Predicted performance (win probability)
    const predictedPerformance = overallTeamRating;
    
    return {
      skill_diversity: Math.round(skillDiversity),
      experience_gap: Math.round(experienceGap),
      leadership_clarity: Math.round(leadershipClarity),
      domain_expertise: Math.round(domainExpertise),
      hackathon_readiness: Math.round(hackathonReadiness),
      innovation_potential: Math.round(innovationPotential),
      execution_ability: Math.round(executionAbility),
      market_fit_understanding: Math.round(marketFitUnderstanding),
      overall_team_rating: Math.round(overallTeamRating),
      predicted_performance: Math.round(predictedPerformance)
    };
  }

  async generateCompleteHackathon(): Promise<{
    participants: HackathonParticipant[];
    teams: HackathonTeam[];
  }> {
    console.log('🚀 Starting hackathon simulation...');
    console.log('📊 Fetching GitHub profiles...');
    
    const participants = await this.generateHackathonParticipants();
    console.log(`✅ Fetched ${participants.length} participants`);
    
    console.log('👥 Creating teams...');
    const teams = this.generateHackathonTeams(participants);
    console.log(`✅ Created ${teams.length} teams`);
    
    console.log('🎉 Hackathon simulation complete!');
    
    return { participants, teams };
  }
}

// Export singleton instance
export const hackathonSimulator = new GitHubHackathonSimulator();


