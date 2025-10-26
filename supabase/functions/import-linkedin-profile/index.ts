import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('=== EDGE FUNCTION CALLED ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Timestamp:', new Date().toISOString());

  try {
    const { linkedinUrl } = await req.json();
    console.log('Request body received:', { linkedinUrl });
    console.log('LinkedIn URL validation:', {
      hasUrl: !!linkedinUrl,
      urlType: typeof linkedinUrl,
      urlLength: linkedinUrl?.length || 0
    });
    
    if (!linkedinUrl) {
      return new Response(
        JSON.stringify({ error: 'LinkedIn URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const CLADO_API_KEY = Deno.env.get('CLADO_API_KEY');
    console.log('CLADO_API_KEY check:', {
      hasKey: !!CLADO_API_KEY,
      keyLength: CLADO_API_KEY?.length || 0,
      keyPrefix: CLADO_API_KEY?.substring(0, 10) + '...' || 'none'
    });
    
    if (!CLADO_API_KEY) {
      console.error('CLADO_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Clado API is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Scrape the LinkedIn profile
    console.log('=== CLADO SCRAPE API CALL ===');
    console.log('Scraping LinkedIn URL:', linkedinUrl);
    console.log('Clado API endpoint:', `https://search.clado.ai/api/enrich/scrape?linkedin_url=${encodeURIComponent(linkedinUrl)}`);
    console.log('Request headers:', {
      'Authorization': `Bearer ${CLADO_API_KEY.substring(0, 10)}...`,
      'Content-Type': 'application/json'
    });
    
    const scrapeResponse = await fetch(
      `https://search.clado.ai/api/enrich/scrape?linkedin_url=${encodeURIComponent(linkedinUrl)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${CLADO_API_KEY}`,
        },
        signal: AbortSignal.timeout(30000) // 30 second timeout
      }
    );

    console.log('Scrape API response received:', {
      status: scrapeResponse.status,
      statusText: scrapeResponse.statusText,
      headers: Object.fromEntries(scrapeResponse.headers.entries()),
      ok: scrapeResponse.ok
    });
    
    if (!scrapeResponse.ok) {
      const errorText = await scrapeResponse.text();
      console.error('Clado scrape API error:', scrapeResponse.status, errorText);
      
      if (scrapeResponse.status === 404) {
        return new Response(
          JSON.stringify({ error: 'LinkedIn profile not found or private', details: errorText }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to scrape LinkedIn profile', status: scrapeResponse.status, details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cladoData = await scrapeResponse.json();
    console.log('Clado scrape API response received:');
    console.log('Raw response data:', JSON.stringify(cladoData, null, 2));
    console.log('Response data analysis:', {
      hasData: !!cladoData,
      dataKeys: Object.keys(cladoData || {}),
      hasFullName: !!cladoData?.full_name,
      hasBio: !!cladoData?.summary || !!cladoData?.bio,
      hasExperience: !!cladoData?.experiences || !!cladoData?.experience,
      experienceCount: (cladoData?.experiences || cladoData?.experience || []).length,
      hasEducation: !!cladoData?.education,
      educationCount: (cladoData?.education || []).length,
      hasSkills: !!cladoData?.skills,
      skillsCount: (cladoData?.skills || []).length
    });

    // Transform Clado response to our ProfileData format
    const profileData = {
      name: cladoData.full_name || cladoData.name || (cladoData.first_name && cladoData.last_name ? cladoData.first_name + ' ' + cladoData.last_name : '') || '',
      email: cladoData.email || '',
      bio: cladoData.summary || cladoData.bio || cladoData.about || cladoData.description || '',
      headline: cladoData.headline || cladoData.title || cladoData.job_title || '',
      location: cladoData.location || (cladoData.city && cladoData.country ? cladoData.city + ', ' + cladoData.country : '') || '',
      linkedin_url: linkedinUrl,
      portfolio_url: cladoData.website || '',
      
      skills: (cladoData.skills || cladoData.skill_list || []).map((skill: any) => ({
        name: typeof skill === 'string' ? skill : (skill.name || skill.skill || skill),
        level: skill.level || skill.proficiency || 'intermediate'
      })),
      
      experience: (cladoData.experiences || cladoData.experience || cladoData.work_experience || []).map((exp: any) => ({
        title: exp.title || exp.position || exp.job_title || exp.role || '',
        company: exp.company || exp.company_name || exp.organization || exp.employer || '',
        startDate: exp.start_date || exp.started_on || exp.start_time || exp.from || '',
        endDate: exp.end_date || exp.ended_on || exp.end_time || exp.to || (exp.current ? 'Present' : null),
        description: exp.description || exp.summary || exp.details || exp.responsibilities || ''
      })),
      
      education: (cladoData.education || cladoData.educations || cladoData.academic_background || []).map((edu: any) => ({
        degree: edu.degree || edu.degree_name || edu.qualification || edu.field_of_study || '',
        institution: edu.school || edu.institution || edu.university || edu.college || edu.organization || '',
        year: edu.end_date || edu.year || edu.graduation_year || edu.completion_date || ''
      })),
      
      years_of_experience: cladoData.years_of_experience || cladoData.total_experience || cladoData.experience_years || 0,
      certifications: cladoData.certifications || cladoData.certificates || cladoData.credentials || []
    };

    console.log('=== TRANSFORMED PROFILE DATA ===');
    console.log('Final profile data:', JSON.stringify(profileData, null, 2));
    console.log('Profile data summary:', {
      hasName: !!profileData.name,
      hasEmail: !!profileData.email,
      hasBio: !!profileData.bio,
      hasHeadline: !!profileData.headline,
      hasLocation: !!profileData.location,
      hasLinkedinUrl: !!profileData.linkedin_url,
      hasPortfolioUrl: !!profileData.portfolio_url,
      skillsCount: profileData.skills?.length || 0,
      experienceCount: profileData.experience?.length || 0,
      educationCount: profileData.education?.length || 0,
      yearsOfExperience: profileData.years_of_experience,
      certificationsCount: profileData.certifications?.length || 0
    });
    
    return new Response(
      JSON.stringify({ profile: profileData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in import-linkedin-profile:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to import LinkedIn profile';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
