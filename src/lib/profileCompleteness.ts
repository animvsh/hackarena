interface ProfileData {
  avatar_url?: string | null;
  bio?: string | null;
  headline?: string | null;
  location?: string | null;
  skills?: any[];
  experience?: any[];
  education?: any[];
  projects?: any[];
  linkedin_url?: string | null;
  github_url?: string | null;
  portfolio_url?: string | null;
}

export function calculateProfileCompleteness(profile: ProfileData): number {
  let score = 0;

  // Avatar: 10 points
  if (profile.avatar_url) score += 10;

  // Bio: 15 points
  if (profile.bio && profile.bio.trim().length > 0) score += 15;

  // Headline: 5 points
  if (profile.headline && profile.headline.trim().length > 0) score += 5;

  // Location: 5 points
  if (profile.location && profile.location.trim().length > 0) score += 5;

  // Skills (3+): 15 points
  if (profile.skills && profile.skills.length >= 3) score += 15;

  // Experience (1+): 20 points
  if (profile.experience && profile.experience.length >= 1) score += 20;

  // Education (1+): 15 points
  if (profile.education && profile.education.length >= 1) score += 15;

  // Projects (1+): 15 points
  if (profile.projects && profile.projects.length >= 1) score += 15;

  // Social links (2+): 10 points
  const socialLinks = [
    profile.linkedin_url,
    profile.github_url,
    profile.portfolio_url,
  ].filter(Boolean);
  if (socialLinks.length >= 2) score += 10;

  return Math.min(score, 100);
}

export function getCompletenessMessage(score: number): string {
  if (score === 100) return "Your profile is complete!";
  if (score >= 80) return "Almost there! Just a few more details.";
  if (score >= 60) return "You're making good progress.";
  if (score >= 40) return "Keep going to complete your profile.";
  return "Let's get started on your profile!";
}
