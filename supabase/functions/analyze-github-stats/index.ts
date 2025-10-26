import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';
const CLADO_API_KEY = Deno.env.get('CLADO_API_KEY') || '';

async function fetchGitHubUser(username: string) {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: { 'User-Agent': 'HackCast-LIVE' }
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${username}:`, error);
    return null;
  }
}

async function fetchGitHubRepos(username: string) {
  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=10&sort=updated`, {
      headers: { 'User-Agent': 'HackCast-LIVE' }
    });
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error(`Error fetching repos for ${username}:`, error);
    return [];
  }
}

async function fetchLinkedInData(linkedinUrl: string) {
  if (!CLADO_API_KEY) return null;
  
  try {
    // Try database lookup first
    const lookupResponse = await fetch(
      `https://search.clado.ai/api/enrich/linkedin?linkedin_url=${encodeURIComponent(linkedinUrl)}`,
      {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${CLADO_API_KEY}` },
        signal: AbortSignal.timeout(15000)
      }
    );

    if (lookupResponse.ok) {
      const data = await lookupResponse.json();
      // Check if data has meaningful content
      const hasName = !!(data.profile?.name);
      const hasExperience = data.experience?.some((exp: any) => exp.employee_title || exp.title);
      const hasEducation = data.education?.some((edu: any) => edu.institute_name || edu.school);
      
      if (hasName || hasExperience || hasEducation) {
        return data;
      }
    }
  } catch (error) {
    console.error('Error fetching LinkedIn data:', error);
  }
  
  return null;
}

async function analyzeWithAI(teamMembers: any[], category: string, openaiKey: string) {
  if (!openaiKey) throw new Error('OpenAI API key not configured');

  const membersData = teamMembers.map(m => {
    const linkedinData = m.linkedin_data ? {
      experience: m.linkedin_data.experience || [],
      education: m.linkedin_data.education || [],
      skills: m.linkedin_data.skills || [],
      summary: m.linkedin_data.profile?.summary || '',
      headline: m.linkedin_data.profile?.headline || ''
    } : null;

    return {
      name: m.name,
      github: m.github_username,
      github_profile: m.github_data,
      repos: m.repos?.slice(0, 5).map((r: any) => ({
        name: r.name,
        description: r.description,
        language: r.language,
        stars: r.stargazers_count
      })),
      linkedin: linkedinData
    };
  });

  const prompt = `Analyze this hackathon team comprehensively. Category: ${category}
  
Team Members Data:
${JSON.stringify(membersData, null, 2)}

For EACH member, analyze BOTH their GitHub (technical portfolio, code quality, activity) AND LinkedIn (professional experience, education, career progression) data to calculate:

Return JSON array with:
- technical_skill, hackathon_experience, innovation, leadership, communication (0-100 each)
- ai_ml_skill, fintech_skill, blockchain_skill, mobile_skill, fullstack_skill (0-100 each)
- consistency, growth, overall_rating (0-100 each)
- market_value (50000-200000)
- specialties (array)
- strengths (array)
- weaknesses (array)

Consider:
- GitHub: repository quality, languages used, project types, code activity
- LinkedIn: years of experience, career progression, relevant past roles, education quality
- Boost scores if projects/experience match hackathon category: ${category}
- Be realistic and conservative in ratings
- Leadership and communication based on LinkedIn career history

Return as JSON array.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'You are a hackathon scout. Return detailed stats as JSON array.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3
    })
  });

  if (!response.ok) throw new Error('OpenAI API failed');
  
  const data = await response.json();
  const text = data.choices[0].message.content;
  const jsonMatch = text.match(/\[.*\]/s);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : [JSON.parse(text)];
}

Deno.serve(async (req: Request) => {
  try {
    // Get Supabase URL and service role key from environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get OpenAI API key from secrets (set via supabase secrets)
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      throw new Error('OPENAI_API_KEY not configured in Supabase secrets');
    }

    const { teamId, hackathonId } = await req.json();

    // Fetch team
    const { data: team } = await supabase
      .from('hackathon_teams')
      .select('id, name, category')
      .eq('id', teamId)
      .single();

    // Fetch members
    const { data: members } = await supabase
      .from('hackathon_team_members')
      .select('hacker_id, role')
      .eq('team_id', teamId);

    // Fetch hacker profiles, GitHub data, and LinkedIn data
    const teamMembers = [];
    for (const member of members || []) {
      // Fetch hacker profile
      const { data: hacker } = await supabase
        .from('hackers')
        .select('github_username, name, linkedin_url')
        .eq('id', member.hacker_id)
        .single();

      if (!hacker) continue;

      const memberData: any = {
        name: hacker.name || 'Unknown',
      };

      // Fetch GitHub data if available
      if (hacker.github_username) {
        const githubUser = await fetchGitHubUser(hacker.github_username);
        const repos = await fetchGitHubRepos(hacker.github_username);
        
        memberData.github_username = hacker.github_username;
        memberData.github_data = githubUser;
        memberData.repos = repos;
      }

      // Fetch LinkedIn data if available
      if (hacker.linkedin_url && CLADO_API_KEY) {
        const linkedinData = await fetchLinkedInData(hacker.linkedin_url);
        if (linkedinData) {
          memberData.linkedin_data = linkedinData;
        }
      }

      // Only add member if they have at least GitHub or LinkedIn data
      if (memberData.github_username || memberData.linkedin_data) {
        teamMembers.push(memberData);
      }
    }

    if (teamMembers.length === 0) {
      throw new Error('No valid GitHub or LinkedIn profiles found');
    }

    // Analyze with OpenAI
    const stats = await analyzeWithAI(teamMembers, team?.category || 'General', openaiKey);

    // Update hacker stats
    for (let i = 0; i < members.length && i < stats.length; i++) {
      await supabase.from('hacker_stats').upsert({
        hacker_id: members[i].hacker_id,
        technical_skill: stats[i].technical_skill,
        hackathon_experience: stats[i].hackathon_experience,
        innovation: stats[i].innovation,
        leadership: stats[i].leadership,
        communication: stats[i].communication,
        ai_ml_skill: stats[i].ai_ml_skill,
        fintech_skill: stats[i].fintech_skill,
        blockchain_skill: stats[i].blockchain_skill,
        mobile_skill: stats[i].mobile_skill,
        fullstack_skill: stats[i].fullstack_skill,
        consistency: stats[i].consistency,
        growth: stats[i].growth,
        overall_rating: stats[i].overall_rating,
        market_value: stats[i].market_value
      }, { onConflict: 'hacker_id' });
    }

    // Update team stats
    const avgStats = {
      avg_technical_skill: stats.reduce((s, sum) => sum + s.technical_skill, 0) / stats.length,
      avg_hackathon_experience: stats.reduce((s, sum) => sum + s.hackathon_experience, 0) / stats.length,
      avg_innovation: stats.reduce((s, sum) => sum + s.innovation, 0) / stats.length,
      avg_leadership: stats.reduce((s, sum) => sum + s.leadership, 0) / stats.length,
      avg_communication: stats.reduce((s, sum) => sum + s.communication, 0) / stats.length,
      avg_ai_ml_skill: stats.reduce((s, sum) => sum + s.ai_ml_skill, 0) / stats.length,
      avg_fintech_skill: stats.reduce((s, sum) => sum + s.fintech_skill, 0) / stats.length,
      avg_blockchain_skill: stats.reduce((s, sum) => sum + s.blockchain_skill, 0) / stats.length,
      avg_mobile_skill: stats.reduce((s, sum) => sum + s.mobile_skill, 0) / stats.length,
      avg_fullstack_skill: stats.reduce((s, sum) => sum + s.fullstack_skill, 0) / stats.length,
      avg_consistency: stats.reduce((s, sum) => sum + s.consistency, 0) / stats.length,
      avg_growth: stats.reduce((s, sum) => sum + s.growth, 0) / stats.length,
      avg_overall_rating: stats.reduce((s, sum) => sum + s.overall_rating, 0) / stats.length,
      total_market_value: stats.reduce((s, sum) => sum + s.market_value, 0)
    };

    await supabase.from('team_stats').upsert({
      team_id: teamId,
      ...avgStats
    }, { onConflict: 'team_id' });

    return new Response(JSON.stringify({
      success: true,
      team_id: teamId,
      member_count: teamMembers.length,
      stats_generated: stats.length,
      team_rating: avgStats.avg_overall_rating
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      }
    });
  }
});
