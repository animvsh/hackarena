import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { linkedinUrl } = await req.json();
    
    if (!linkedinUrl) {
      return new Response(
        JSON.stringify({ error: 'LinkedIn URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const CLADO_API_KEY = Deno.env.get('CLADO_API_KEY');
    if (!CLADO_API_KEY) {
      console.error('CLADO_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Clado API is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Clado API to enrich LinkedIn profile
    const cladoResponse = await fetch(
      `https://search.clado.ai/api/enrich/linkedin?linkedin_url=${encodeURIComponent(linkedinUrl)}`,
      {
        headers: {
          'Authorization': `Bearer ${CLADO_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!cladoResponse.ok) {
      const errorText = await cladoResponse.text();
      console.error('Clado API error:', cladoResponse.status, errorText);
      
      if (cladoResponse.status === 404) {
        return new Response(
          JSON.stringify({ error: 'LinkedIn profile not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to fetch LinkedIn profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cladoData = await cladoResponse.json();
    console.log('Clado API response received');

    // Transform Clado response to our ProfileData format
    const profileData = {
      name: cladoData.full_name || cladoData.name || '',
      email: cladoData.email || '',
      bio: cladoData.summary || cladoData.bio || '',
      headline: cladoData.headline || '',
      location: cladoData.location || '',
      linkedin_url: linkedinUrl,
      portfolio_url: cladoData.website || '',
      
      skills: (cladoData.skills || []).map((skill: any) => ({
        name: typeof skill === 'string' ? skill : skill.name,
        level: skill.level || 'intermediate'
      })),
      
      experience: (cladoData.experiences || cladoData.experience || []).map((exp: any) => ({
        title: exp.title || exp.position || '',
        company: exp.company || exp.company_name || '',
        startDate: exp.start_date || exp.started_on || '',
        endDate: exp.end_date || exp.ended_on || null,
        description: exp.description || ''
      })),
      
      education: (cladoData.education || []).map((edu: any) => ({
        degree: edu.degree || edu.degree_name || '',
        institution: edu.school || edu.institution || '',
        year: edu.end_date || edu.year || ''
      })),
      
      years_of_experience: cladoData.years_of_experience || 0,
      certifications: cladoData.certifications || []
    };

    return new Response(
      JSON.stringify({ profile: profileData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in import-linkedin-profile:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to import LinkedIn profile' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
