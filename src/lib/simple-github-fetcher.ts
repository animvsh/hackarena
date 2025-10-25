import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN; // Ensure you have a GitHub token for higher rate limits

interface GitHubUser {
  login: string;
  name: string | null;
  public_repos: number;
  followers: number;
  created_at: string;
  html_url: string;
}

export const simpleGitHubFetcher = async (username: string): Promise<GitHubUser | null> => {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        'Authorization': GITHUB_TOKEN ? `token ${GITHUB_TOKEN}` : '',
      },
    });
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`GitHub user ${username} not found - skipping`);
        return null;
      }
      console.error(`Failed to fetch GitHub profile for ${username}: ${response.statusText}`);
      return null;
    }
    return response.json();
  } catch (error) {
    console.log(`Error fetching GitHub profile for ${username}:`, error);
    return null;
  }
};

export const calculateHackerStats = (githubUser: GitHubUser) => {
  const reposScore = Math.min(100, githubUser.public_repos * 2);
  const followersScore = Math.min(100, githubUser.followers * 0.5);
  const accountAge = (new Date().getFullYear() - new Date(githubUser.created_at).getFullYear());
  const experienceScore = Math.min(100, accountAge * 10);

  const technical_skill = (reposScore * 0.4 + followersScore * 0.3 + experienceScore * 0.3);
  const hackathon_experience = Math.min(100, experienceScore * 0.8 + Math.random() * 20); // Simulate some hackathon experience
  const innovation_score = Math.min(100, technical_skill * 0.7 + Math.random() * 30);
  
  const overall_rating = (technical_skill * 0.4 + hackathon_experience * 0.3 + innovation_score * 0.3);

  return {
    overall_rating: parseFloat(overall_rating.toFixed(1)),
    technical_skill: parseFloat(technical_skill.toFixed(1)),
    hackathon_experience: parseFloat(hackathon_experience.toFixed(1)),
    innovation_score: parseFloat(innovation_score.toFixed(1)),
  };
};