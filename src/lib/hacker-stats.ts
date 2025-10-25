import { supabase } from '@/integrations/supabase/client';

export interface LinkedInProfile {
  name: string;
  headline: string;
  location: string;
  industry: string;
  current_company: string;
  company_size: 'startup' | 'mid' | 'enterprise' | 'faang';
  years_experience: number;
  seniority_level: 'junior' | 'mid' | 'senior' | 'staff' | 'principal';
  hackathon_mentions: string[];
  project_showcases: string[];
  achievement_posts: string[];
  skills_endorsements: {skill: string, count: number}[];
  certifications: string[];
  education: {school: string, degree: string, gpa?: number}[];
  connection_count: number;
  follower_count: number;
  post_engagement_rate: number;
  speaking_events: string[];
}

export interface HackerStats {
  // Core Stats (0-100 scale)
  hackathon_experience: number;
  technical_skill: number;
  leadership_score: number;
  innovation_score: number;
  communication_score: number;
  
  // Specialized Stats
  ai_ml_expertise: number;
  fintech_experience: number;
  blockchain_knowledge: number;
  mobile_dev_skill: number;
  fullstack_proficiency: number;
  
  // Meta Stats
  consistency_score: number;
  growth_trajectory: number;
  network_strength: number;
  company_prestige: number;
  
  // Calculated Overall Score
  overall_rating: number;
  market_value: number;
}

export class HackerStatsCalculator {
  
  calculateHackathonExperience(profile: LinkedInProfile): number {
    let score = 0;
    
    // Past hackathon mentions (weighted by recency)
    profile.hackathon_mentions.forEach((mention, index) => {
      const recencyWeight = Math.max(0.1, 1 - (index * 0.1));
      if (mention.includes('won') || mention.includes('winner')) {
        score += 25 * recencyWeight;
      } else if (mention.includes('finalist') || mention.includes('top')) {
        score += 15 * recencyWeight;
      } else {
        score += 5 * recencyWeight;
      }
    });
    
    // Achievement posts analysis
    profile.achievement_posts.forEach(post => {
      if (post.includes('hackathon')) {
        score += 20;
      }
      if (post.includes('first place') || post.includes('1st')) {
        score += 30;
      }
    });
    
    return Math.min(100, score);
  }
  
  calculateTechnicalSkill(profile: LinkedInProfile): number {
    let score = 0;
    
    // Company prestige multiplier
    const companyMultiplier = this.getCompanyMultiplier(profile.current_company);
    
    // Years of experience
    score += Math.min(40, profile.years_experience * 4);
    
    // Seniority level
    const seniorityScores = {
      'junior': 10,
      'mid': 25,
      'senior': 40,
      'staff': 60,
      'principal': 80
    };
    score += seniorityScores[profile.seniority_level] || 0;
    
    // Skills endorsements (top skills weighted higher)
    profile.skills_endorsements
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .forEach((skill, index) => {
        const weight = 1 - (index * 0.1);
        score += Math.min(5, skill.count / 10) * weight;
      });
    
    return Math.min(100, score * companyMultiplier);
  }
  
  calculateLeadershipScore(profile: LinkedInProfile): number {
    let score = 0;
    
    // Management keywords in headline/experience
    const leadershipKeywords = ['lead', 'manager', 'director', 'head', 'founder', 'ceo', 'cto'];
    const text = `${profile.headline} ${profile.achievement_posts.join(' ')}`.toLowerCase();
    
    leadershipKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        score += 15;
      }
    });
    
    // Speaking events
    score += Math.min(30, profile.speaking_events.length * 5);
    
    // Network strength (connections)
    if (profile.connection_count > 500) score += 20;
    else if (profile.connection_count > 200) score += 15;
    else if (profile.connection_count > 100) score += 10;
    
    return Math.min(100, score);
  }
  
  calculateSpecializedSkills(profile: LinkedInProfile): Partial<HackerStats> {
    const skills = profile.skills_endorsements.map(s => s.skill.toLowerCase());
    
    return {
      ai_ml_expertise: this.calculateSkillCategory(skills, [
        'machine learning', 'artificial intelligence', 'deep learning', 
        'tensorflow', 'pytorch', 'computer vision', 'nlp', 'openai', 'claude'
      ]),
      
      fintech_experience: this.calculateSkillCategory(skills, [
        'fintech', 'blockchain', 'cryptocurrency', 'trading', 
        'payments', 'banking', 'financial services', 'visa', 'stripe'
      ]),
      
      blockchain_knowledge: this.calculateSkillCategory(skills, [
        'blockchain', 'ethereum', 'solidity', 'web3', 'defi', 
        'smart contracts', 'cryptocurrency', 'bitcoin'
      ]),
      
      mobile_dev_skill: this.calculateSkillCategory(skills, [
        'ios', 'android', 'react native', 'flutter', 'swift', 
        'kotlin', 'mobile development', 'xcode'
      ]),
      
      fullstack_proficiency: this.calculateSkillCategory(skills, [
        'react', 'node.js', 'python', 'javascript', 'typescript',
        'django', 'flask', 'express', 'mongodb', 'postgresql', 'supabase'
      ])
    };
  }
  
  private calculateSkillCategory(skills: string[], keywords: string[]): number {
    let score = 0;
    keywords.forEach(keyword => {
      if (skills.some(skill => skill.includes(keyword))) {
        score += 20;
      }
    });
    return Math.min(100, score);
  }
  
  private getCompanyMultiplier(company: string): number {
    const faangCompanies = ['google', 'apple', 'meta', 'amazon', 'netflix', 'microsoft'];
    const unicorns = ['openai', 'anthropic', 'stripe', 'databricks', 'figma', 'notion'];
    
    if (faangCompanies.some(faang => company.toLowerCase().includes(faang))) {
      return 1.5;
    }
    if (unicorns.some(unicorn => company.toLowerCase().includes(unicorn))) {
      return 1.3;
    }
    return 1.0;
  }
  
  calculateOverallRating(stats: HackerStats): number {
    // Weighted average of core stats
    const coreWeight = 0.4;
    const specializedWeight = 0.3;
    const metaWeight = 0.3;
    
    const coreAverage = (
      stats.hackathon_experience +
      stats.technical_skill +
      stats.leadership_score +
      stats.innovation_score +
      stats.communication_score
    ) / 5;
    
    const specializedAverage = (
      stats.ai_ml_expertise +
      stats.fintech_experience +
      stats.blockchain_knowledge +
      stats.mobile_dev_skill +
      stats.fullstack_proficiency
    ) / 5;
    
    const metaAverage = (
      stats.consistency_score +
      stats.growth_trajectory +
      stats.network_strength +
      stats.company_prestige
    ) / 4;
    
    return Math.round(
      (coreAverage * coreWeight) +
      (specializedAverage * specializedWeight) +
      (metaAverage * metaWeight)
    );
  }
  
  calculateMarketValue(overallRating: number): number {
    // Convert rating to HackCoins equivalent
    // 100 rating = 10,000 HC, 50 rating = 5,000 HC, etc.
    return Math.round((overallRating / 100) * 10000);
  }
}

export class LinkedInDataExtractor {
  
  async extractProfileData(linkedinUrl: string): Promise<LinkedInProfile> {
    // This would integrate with LinkedIn API or web scraping
    // For now, returning mock data structure
    
    const mockProfile: LinkedInProfile = {
      name: "John Doe",
      headline: "Senior Software Engineer at Google | AI/ML Enthusiast",
      location: "San Francisco, CA",
      industry: "Technology",
      current_company: "Google",
      company_size: "faang",
      years_experience: 5,
      seniority_level: "senior",
      hackathon_mentions: [
        "Won first place at Google Hackathon 2023",
        "Participated in MLH Local Hack Day",
        "Finalist at TechCrunch Disrupt Hackathon"
      ],
      project_showcases: [
        "Built AI-powered recommendation system",
        "Open source contributor to React"
      ],
      achievement_posts: [
        "Just shipped our AI product to 1M+ users!",
        "Speaking at React Conf 2024"
      ],
      skills_endorsements: [
        { skill: "Python", count: 50 },
        { skill: "Machine Learning", count: 45 },
        { skill: "React", count: 40 },
        { skill: "JavaScript", count: 35 }
      ],
      certifications: ["AWS Certified Developer", "Google Cloud Professional"],
      education: [
        { school: "Stanford University", degree: "Computer Science", gpa: 3.8 }
      ],
      connection_count: 500,
      follower_count: 2000,
      post_engagement_rate: 0.05,
      speaking_events: ["React Conf 2024", "AI Summit 2023"]
    };
    
    return mockProfile;
  }
  
  async saveHackerProfile(teamMemberId: string, linkedinUrl: string): Promise<string> {
    const { data: profile, error } = await supabase
      .from('hacker_profiles')
      .insert({
        team_member_id: teamMemberId,
        linkedin_url: linkedinUrl,
        linkedin_data: {},
        last_updated: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return profile.id;
  }
  
  async calculateAndSaveStats(hackerProfileId: string, profile: LinkedInProfile): Promise<void> {
    const calculator = new HackerStatsCalculator();
    
    const stats: HackerStats = {
      hackathon_experience: calculator.calculateHackathonExperience(profile),
      technical_skill: calculator.calculateTechnicalSkill(profile),
      leadership_score: calculator.calculateLeadershipScore(profile),
      innovation_score: 75, // Placeholder - would analyze patents, unique projects
      communication_score: 80, // Placeholder - would analyze writing, speaking
      
      ...calculator.calculateSpecializedSkills(profile),
      
      consistency_score: 70, // Placeholder - would analyze participation patterns
      growth_trajectory: 80, // Placeholder - would analyze career progression
      network_strength: Math.min(100, profile.connection_count / 10),
      company_prestige: calculator.getCompanyMultiplier(profile.current_company) * 50,
      
      overall_rating: 0, // Will be calculated
      market_value: 0 // Will be calculated
    };
    
    // Calculate overall rating and market value
    stats.overall_rating = calculator.calculateOverallRating(stats);
    stats.market_value = calculator.calculateMarketValue(stats.overall_rating);
    
    // Save to database
    const { error } = await supabase
      .from('hacker_stats')
      .insert({
        hacker_profile_id: hackerProfileId,
        ...stats,
        last_calculated: new Date().toISOString()
      });
    
    if (error) throw error;
  }
}

export class TeamAnalyzer {
  
  async analyzeTeamComposition(teamId: string): Promise<void> {
    // Trigger the database function to calculate team composition
    const { error } = await supabase.rpc('calculate_team_composition', {
      p_team_id: teamId
    });
    
    if (error) throw error;
  }
  
  async getTeamAnalysis(teamId: string) {
    const { data, error } = await supabase
      .from('team_composition')
      .select('*')
      .eq('team_id', teamId)
      .single();
    
    if (error) throw error;
    return data;
  }
  
  async getHackerStatsForTeam(teamId: string) {
    const { data, error } = await supabase
      .from('hacker_stats')
      .select(`
        *,
        hacker_profiles!inner (
          team_members!inner (
            team_id
          )
        )
      `)
      .eq('hacker_profiles.team_members.team_id', teamId);
    
    if (error) throw error;
    return data;
  }
}


