// LinkedIn Data Extraction Service
// This service handles extracting hacker profile data from LinkedIn
// In production, this would integrate with LinkedIn's official APIs or web scraping

export interface LinkedInExtractionConfig {
  method: 'api' | 'scraping' | 'manual';
  rateLimit: number; // requests per minute
  batchSize: number;
  retryAttempts: number;
}

export interface ExtractionResult {
  success: boolean;
  data?: any;
  error?: string;
  confidence: number; // 0-1, how confident we are in the data
}

export class LinkedInDataExtractor {
  private config: LinkedInExtractionConfig;
  private rateLimitQueue: Array<() => Promise<any>> = [];
  private isProcessing = false;

  constructor(config: LinkedInExtractionConfig) {
    this.config = config;
  }

  // Main extraction method
  async extractHackerProfile(linkedinUrl: string): Promise<ExtractionResult> {
    try {
      // Validate LinkedIn URL
      if (!this.isValidLinkedInUrl(linkedinUrl)) {
        return {
          success: false,
          error: 'Invalid LinkedIn URL',
          confidence: 0
        };
      }

      // Extract profile ID from URL
      const profileId = this.extractProfileId(linkedinUrl);
      if (!profileId) {
        return {
          success: false,
          error: 'Could not extract profile ID from URL',
          confidence: 0
        };
      }

      // Choose extraction method based on config
      let profileData;
      switch (this.config.method) {
        case 'api':
          profileData = await this.extractViaAPI(profileId);
          break;
        case 'scraping':
          profileData = await this.extractViaScraping(linkedinUrl);
          break;
        case 'manual':
          profileData = await this.extractViaManual(profileId);
          break;
        default:
          throw new Error('Invalid extraction method');
      }

      // Validate and clean the extracted data
      const cleanedData = this.validateAndCleanData(profileData);
      
      return {
        success: true,
        data: cleanedData,
        confidence: this.calculateConfidence(cleanedData)
      };

    } catch (error) {
      console.error('LinkedIn extraction error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        confidence: 0
      };
    }
  }

  // LinkedIn API extraction (requires LinkedIn API access)
  private async extractViaAPI(profileId: string): Promise<any> {
    // This would use LinkedIn's official API
    // Requires LinkedIn Developer account and proper authentication
    
    const apiEndpoint = `https://api.linkedin.com/v2/people/${profileId}`;
    
    // Mock API response for demo
    return {
      firstName: "John",
      lastName: "Doe",
      headline: "Senior Software Engineer at Google | AI/ML Enthusiast",
      location: "San Francisco Bay Area",
      industry: "Computer Software",
      currentPosition: {
        company: "Google",
        title: "Senior Software Engineer",
        startDate: "2020-01-01"
      },
      experience: [
        {
          company: "Google",
          title: "Senior Software Engineer",
          duration: "4 years",
          description: "Working on AI/ML infrastructure"
        },
        {
          company: "Microsoft",
          title: "Software Engineer",
          duration: "2 years",
          description: "Full-stack development"
        }
      ],
      skills: [
        { name: "Python", endorsements: 50 },
        { name: "Machine Learning", endorsements: 45 },
        { name: "React", endorsements: 40 },
        { name: "JavaScript", endorsements: 35 }
      ],
      education: [
        {
          school: "Stanford University",
          degree: "Bachelor of Science in Computer Science",
          gpa: 3.8
        }
      ],
      connections: 500,
      followers: 2000
    };
  }

  // Web scraping extraction (requires careful handling of rate limits and anti-bot measures)
  private async extractViaScraping(linkedinUrl: string): Promise<any> {
    // This would use web scraping techniques
    // WARNING: LinkedIn has strong anti-scraping measures
    // Consider using services like ScrapingBee, Bright Data, or similar
    
    // Mock scraping result
    return {
      name: "John Doe",
      headline: "Senior Software Engineer at Google | AI/ML Enthusiast",
      location: "San Francisco, CA",
      current_company: "Google",
      experience_summary: "6 years in software engineering",
      skills: ["Python", "Machine Learning", "React", "JavaScript"],
      education: "Stanford University - Computer Science",
      connections: 500
    };
  }

  // Manual extraction (for cases where automated methods fail)
  private async extractViaManual(profileId: string): Promise<any> {
    // This would present a form for manual data entry
    // Useful for high-value profiles or when automated extraction fails
    
    return {
      name: "Manual Entry Required",
      headline: "Please enter profile data manually",
      requires_manual_input: true
    };
  }

  // Extract profile ID from LinkedIn URL
  private extractProfileId(url: string): string | null {
    const patterns = [
      /linkedin\.com\/in\/([^\/\?]+)/,
      /linkedin\.com\/pub\/([^\/\?]+)/,
      /linkedin\.com\/profile\/view\?id=([^&]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  // Validate LinkedIn URL format
  private isValidLinkedInUrl(url: string): boolean {
    const linkedinPattern = /^https?:\/\/(www\.)?linkedin\.com\/(in|pub|profile\/view)\//;
    return linkedinPattern.test(url);
  }

  // Validate and clean extracted data
  private validateAndCleanData(data: any): any {
    return {
      name: this.cleanString(data.name || data.firstName + ' ' + data.lastName),
      headline: this.cleanString(data.headline),
      location: this.cleanString(data.location),
      current_company: this.cleanString(data.current_company || data.currentPosition?.company),
      years_experience: this.extractYearsExperience(data.experience || data.experience_summary),
      seniority_level: this.determineSeniorityLevel(data.currentPosition?.title || data.headline),
      hackathon_mentions: this.extractHackathonMentions(data),
      skills_endorsements: this.processSkills(data.skills),
      education: this.processEducation(data.education),
      connection_count: data.connections || data.connection_count || 0,
      follower_count: data.followers || data.follower_count || 0,
      raw_data: data // Keep original data for reference
    };
  }

  // Helper methods for data cleaning
  private cleanString(str: string | undefined): string {
    if (!str) return '';
    return str.trim().replace(/\s+/g, ' ');
  }

  private extractYearsExperience(experience: any): number {
    if (typeof experience === 'string') {
      const yearsMatch = experience.match(/(\d+)\s*years?/i);
      return yearsMatch ? parseInt(yearsMatch[1]) : 0;
    }
    
    if (Array.isArray(experience)) {
      // Calculate total years from experience array
      return experience.length * 2; // Rough estimate
    }
    
    return 0;
  }

  private determineSeniorityLevel(title: string): string {
    if (!title) return 'mid';
    
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('principal') || titleLower.includes('staff')) {
      return 'principal';
    }
    if (titleLower.includes('senior') || titleLower.includes('lead')) {
      return 'senior';
    }
    if (titleLower.includes('junior') || titleLower.includes('associate')) {
      return 'junior';
    }
    
    return 'mid';
  }

  private extractHackathonMentions(data: any): string[] {
    const mentions: string[] = [];
    const textToSearch = [
      data.headline,
      data.experience_summary,
      ...(data.experience || []).map((exp: any) => exp.description || ''),
      ...(data.achievements || []),
      ...(data.posts || [])
    ].filter(Boolean).join(' ').toLowerCase();

    const hackathonKeywords = ['hackathon', 'hack day', 'mlh', 'devpost', 'won', 'winner', 'finalist'];
    
    hackathonKeywords.forEach(keyword => {
      if (textToSearch.includes(keyword)) {
        mentions.push(`Mentioned ${keyword} in profile`);
      }
    });

    return mentions;
  }

  private processSkills(skills: any[]): Array<{skill: string, count: number}> {
    if (!Array.isArray(skills)) return [];
    
    return skills.map(skill => {
      if (typeof skill === 'string') {
        return { skill, count: 0 };
      }
      if (typeof skill === 'object' && skill.name) {
        return { 
          skill: skill.name, 
          count: skill.endorsements || skill.count || 0 
        };
      }
      return { skill: '', count: 0 };
    }).filter(s => s.skill);
  }

  private processEducation(education: any): Array<{school: string, degree: string, gpa?: number}> {
    if (!Array.isArray(education)) return [];
    
    return education.map(edu => ({
      school: edu.school || edu.institution || '',
      degree: edu.degree || edu.field || '',
      gpa: edu.gpa
    })).filter(edu => edu.school);
  }

  // Calculate confidence score based on data completeness and quality
  private calculateConfidence(data: any): number {
    let score = 0;
    let maxScore = 0;

    const fields = [
      'name', 'headline', 'location', 'current_company', 
      'years_experience', 'skills_endorsements', 'education'
    ];

    fields.forEach(field => {
      maxScore += 1;
      if (data[field] && (Array.isArray(data[field]) ? data[field].length > 0 : data[field])) {
        score += 1;
      }
    });

    // Bonus points for rich data
    if (data.skills_endorsements && data.skills_endorsements.length > 5) score += 0.5;
    if (data.hackathon_mentions && data.hackathon_mentions.length > 0) score += 0.5;
    if (data.connection_count > 100) score += 0.5;

    return Math.min(1, score / maxScore);
  }

  // Batch processing for multiple profiles
  async extractMultipleProfiles(urls: string[]): Promise<ExtractionResult[]> {
    const results: ExtractionResult[] = [];
    
    for (const url of urls) {
      try {
        const result = await this.extractHackerProfile(url);
        results.push(result);
        
        // Rate limiting
        await this.delay(1000 / this.config.rateLimit * 60);
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          confidence: 0
        });
      }
    }
    
    return results;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Factory function to create extractor with different configurations
export function createLinkedInExtractor(method: 'api' | 'scraping' | 'manual' = 'api'): LinkedInDataExtractor {
  const configs = {
    api: {
      method: 'api' as const,
      rateLimit: 100, // LinkedIn API rate limit
      batchSize: 10,
      retryAttempts: 3
    },
    scraping: {
      method: 'scraping' as const,
      rateLimit: 10, // Conservative scraping rate
      batchSize: 5,
      retryAttempts: 5
    },
    manual: {
      method: 'manual' as const,
      rateLimit: 1000, // No rate limit for manual entry
      batchSize: 1,
      retryAttempts: 1
    }
  };

  return new LinkedInDataExtractor(configs[method]);
}


