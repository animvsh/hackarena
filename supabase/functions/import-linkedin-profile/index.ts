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

    // Try database lookup first (faster, cheaper), then fallback to scraping
    console.log('=== CLADO DATABASE LOOKUP API CALL ===');
    console.log('LinkedIn URL:', linkedinUrl);
    console.log('Clado API endpoint:', `https://search.clado.ai/api/enrich/linkedin?linkedin_url=${encodeURIComponent(linkedinUrl)}`);

    let cladoData = null;
    let usedScraping = false;

    // Try database lookup first
    const lookupResponse = await fetch(
      `https://search.clado.ai/api/enrich/linkedin?linkedin_url=${encodeURIComponent(linkedinUrl)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${CLADO_API_KEY}`,
        },
        signal: AbortSignal.timeout(15000) // 15 second timeout
      }
    );

    console.log('=== CLADO DATABASE LOOKUP RESPONSE ===');
    console.log('Response status:', lookupResponse.status);
    console.log('Response ok:', lookupResponse.ok);

    if (lookupResponse.ok) {
      const lookupData = await lookupResponse.json();
      console.log('Database lookup returned 200, checking data quality...');

      // Check if the data is actually useful (has meaningful content)
      const hasName = !!(lookupData.profile?.name);
      const hasExperienceWithTitles = lookupData.experience?.some((exp: any) =>
        exp.employee_title || exp.title
      );
      const hasEducationWithInstitutions = lookupData.education?.some((edu: any) =>
        edu.institute_name || edu.school
      );

      console.log('Data quality check:', {
        hasName,
        hasExperienceWithTitles,
        hasEducationWithInstitutions,
        experienceCount: lookupData.experience?.length || 0,
        educationCount: lookupData.education?.length || 0
      });

      // Only use database data if it has meaningful content
      if (hasName || hasExperienceWithTitles || hasEducationWithInstitutions) {
        cladoData = lookupData;
        console.log('Database lookup successful with meaningful data!');
      } else {
        console.log('Database lookup returned empty data, falling back to scraping...');
      }
    } else {
      console.log('Database lookup failed, trying scraping...');
    }

    // If we don't have data yet, try scraping
    if (!cladoData) {

      // Fallback to scraping
      console.log('=== CLADO SCRAPE API CALL ===');
      console.log('Scraping LinkedIn URL:', linkedinUrl);
      console.log('Clado API endpoint:', `https://search.clado.ai/api/enrich/scrape?linkedin_url=${encodeURIComponent(linkedinUrl)}`);

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

      console.log('=== CLADO SCRAPE RESPONSE ===');
      console.log('Response status:', scrapeResponse.status);
      console.log('Response ok:', scrapeResponse.ok);

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
          JSON.stringify({ error: 'Failed to get LinkedIn profile from Clado', status: scrapeResponse.status, details: errorText }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      cladoData = await scrapeResponse.json();
      usedScraping = true;
      console.log('Scraping successful!');
    }

    console.log('Data source:', usedScraping ? 'Real-time scraping' : 'Database lookup');

    console.log('=== CLADO API RESPONSE ANALYSIS ===');
    console.log('Raw response data (first 5000 chars):', JSON.stringify(cladoData, null, 2).substring(0, 5000));
    console.log('Full response size:', JSON.stringify(cladoData).length, 'characters');

    // Log all top-level keys to see the structure
    const topLevelKeys = Object.keys(cladoData || {});
    console.log('Top-level keys:', topLevelKeys);

    // Clado API structure: profile info is in cladoData.profile, arrays are at root level
    const profile = cladoData.profile || {};
    const experience = cladoData.experience || [];
    const education = cladoData.education || [];
    const skills = cladoData.skills || [];
    const languages = cladoData.languages || [];
    const certifications = cladoData.certifications || [];
    const honors = cladoData.honors || [];

    console.log('Profile keys:', Object.keys(profile));

    console.log('Response data analysis:', {
      hasData: !!cladoData,
      dataKeys: topLevelKeys,
      hasProfile: !!cladoData.profile,
      hasName: !!profile?.name,
      hasSummary: !!profile?.summary,
      hasHeadline: !!profile?.headline,
      hasLocation: !!profile?.location || !!cladoData?.location,
      hasExperience: !!cladoData?.experience,
      experienceCount: experience.length,
      hasEducation: !!cladoData?.education,
      educationCount: education.length,
      hasSkills: !!cladoData?.skills,
      skillsCount: skills.length,
      hasCertifications: !!cladoData?.certifications,
      certificationsCount: certifications.length,
      hasLanguages: !!cladoData?.languages,
      languagesCount: languages.length,
      hasHonors: !!cladoData?.honors,
      honorsCount: honors.length
    });
    
     // Log specific data if it exists
     console.log('=== RAW EXPERIENCE DATA FROM CLADO ===');
     console.log('Total experiences in Clado response:', experience.length);
     console.log('Full experience array:', JSON.stringify(experience, null, 2));

     if (experience.length > 0) {
       // Log experience details for debugging
       experience.forEach((exp: any, index: number) => {
         console.log(`Experience ${index + 1}:`, {
           title: exp.employee_title || exp.title || 'MISSING',
           company: exp.employer_name || exp.company || 'MISSING',
           hasDescription: !!(exp.employee_description || exp.description),
           descriptionLength: (exp.employee_description || exp.description || '').length,
           descriptionPreview: (exp.employee_description || exp.description || '').substring(0, 50),
           startDate: exp.start_date || 'MISSING',
           endDate: exp.end_date || (exp.is_current ? 'Present' : 'MISSING'),
           isCurrent: exp.is_current,
           allKeys: Object.keys(exp)
         });
       });
     } else {
       console.warn('WARNING: No experience data found in Clado response!');
     }

    if (education.length > 0) {
      console.log('Education data found:', JSON.stringify(education, null, 2).substring(0, 2000));
    }

    if (skills.length > 0) {
      console.log('Skills data found:', JSON.stringify(skills, null, 2).substring(0, 2000));
    }

    if (certifications.length > 0) {
      console.log('Certifications data found:', JSON.stringify(certifications, null, 2).substring(0, 1000));
    }

    if (languages.length > 0) {
      console.log('Languages data found:', JSON.stringify(languages, null, 2).substring(0, 1000));
    }

    if (honors.length > 0) {
      console.log('Honors data found:', JSON.stringify(honors, null, 2).substring(0, 1000));
    }

    // Enhanced data extraction with more comprehensive field mapping
    console.log('=== ENHANCED DATA EXTRACTION ===');

    // Extract all possible data fields with support for nested objects
    const extractField = (obj: any, ...fields: string[]) => {
      for (const field of fields) {
        // Support nested field access with dot notation (e.g., 'data.full_name')
        if (field.includes('.')) {
          const parts = field.split('.');
          let value = obj;
          for (const part of parts) {
            if (value && typeof value === 'object') {
              value = value[part];
            } else {
              value = undefined;
              break;
            }
          }
          if (value && value !== '' && value !== null && value !== undefined) {
            return value;
          }
        } else if (obj[field] && obj[field] !== '' && obj[field] !== null && obj[field] !== undefined) {
          return obj[field];
        }
      }
      return '';
    };

    const extractArrayField = (obj: any, ...fields: string[]) => {
      for (const field of fields) {
        // Support nested field access with dot notation
        if (field.includes('.')) {
          const parts = field.split('.');
          let value = obj;
          for (const part of parts) {
            if (value && typeof value === 'object') {
              value = value[part];
            } else {
              value = undefined;
              break;
            }
          }
          if (Array.isArray(value) && value.length > 0) {
            return value;
          }
        } else if (Array.isArray(obj[field]) && obj[field].length > 0) {
          return obj[field];
        }
      }
      return [];
    };
    
    // Get all available keys for debugging
    const allKeys = Object.keys(cladoData || {});
    console.log('All available keys in Clado response:', allKeys);
    
    // Look for any raw HTML or text content
    const rawContent = cladoData.raw_content || cladoData.html_content || cladoData.full_text || cladoData.content || '';
    if (rawContent) {
      console.log('Found raw content, length:', rawContent.length);
    }

    // Transform Clado response to our ProfileData format using correct field mappings
    const profileData = {
      // Profile info from cladoData.profile
      name: profile.name || '',
      email: (profile.emails && profile.emails.length > 0) ? profile.emails[0] : '',
      bio: profile.summary || '',
      headline: profile.headline || profile.title || '',
      location: profile.location || cladoData.location || '',
      linkedin_url: linkedinUrl,
      portfolio_url: (profile.websites && profile.websites.length > 0) ? profile.websites[0] : '',

      // Skills from root level (array of strings)
      skills: skills.map((skill: any) => ({
        name: typeof skill === 'string' ? skill : String(skill),
        level: 'intermediate'
      })),

       // Experience from root level with Clado field mappings
       experience: experience.map((exp: any, index: number) => {
         const mappedExp = {
           title: exp.employee_title || exp.title || exp.position || exp.job_title || '',
           company: exp.employer_name || exp.company || exp.organization || exp.employer || '',
           startDate: exp.start_date || exp.startDate || exp.from || exp.started_on || '',
           endDate: exp.end_date || exp.endDate || exp.to || exp.ended_on || (exp.is_current ? 'Present' : ''),
           description: exp.employee_description || exp.description || exp.summary || exp.details || exp.responsibilities || '',
           location: exp.employee_location || exp.location || exp.work_location || exp.office_location || '',
           employment_type: exp.employment_type || exp.job_type || exp.work_type || exp.position_type || ''
         };

         console.log(`Mapped experience ${index + 1}:`, mappedExp);
         return mappedExp;
       }),

      // Education from root level with Clado field mappings
      education: education.map((edu: any) => ({
        degree: edu.degree_name || '',
        institution: edu.institute_name || '',
        year: edu.end_date || '',
        start_year: edu.start_date || '',
        gpa: '',
        field: edu.field_of_study || ''
      })),

      // Calculate years of experience from experience array
      years_of_experience: experience.length > 0 ? experience.length : 0,

      // Certifications from root level
      certifications: certifications.map((cert: any) =>
        typeof cert === 'string' ? cert : (cert.name || cert.title || String(cert))
      ),

      // Languages from root level (array of strings)
      languages: languages.map((lang: any) =>
        typeof lang === 'string' ? lang : String(lang)
      ),

      // Interests - not provided by Clado API
      interests: [],

      // Volunteer experience - not provided by Clado API
      volunteer_experience: [],

      // Publications - not provided by Clado API
      publications: [],

      // Projects - not provided by Clado API
      projects: [],

      // Awards from honors
      awards: honors.map((honor: any) =>
        typeof honor === 'string' ? honor : (honor.title || honor.name || String(honor))
      ),

      // Store raw content for debugging
      raw_content: rawContent.substring(0, 1000)
    };

    console.log('=== TRANSFORMED PROFILE DATA ===');
    console.log('Total experiences after transformation:', profileData.experience.length);
    console.log('Experience titles:', profileData.experience.map((e: any) => e.title));
    console.log('Final profile data (first 5000 chars):', JSON.stringify(profileData, null, 2).substring(0, 5000));
    console.log('Profile data summary:', {
      hasName: !!profileData.name,
      nameValue: profileData.name || 'MISSING',
      hasEmail: !!profileData.email,
      emailValue: profileData.email || 'MISSING',
      hasBio: !!profileData.bio,
      bioLength: profileData.bio?.length || 0,
      hasHeadline: !!profileData.headline,
      headlineValue: profileData.headline || 'MISSING',
      hasLocation: !!profileData.location,
      locationValue: profileData.location || 'MISSING',
      hasLinkedinUrl: !!profileData.linkedin_url,
      hasPortfolioUrl: !!profileData.portfolio_url,
      skillsCount: profileData.skills?.length || 0,
      skillsSample: profileData.skills?.slice(0, 3).map(s => s.name) || [],
      experienceCount: profileData.experience?.length || 0,
      experienceSample: profileData.experience?.slice(0, 2).map(e => ({ title: e.title, company: e.company })) || [],
      educationCount: profileData.education?.length || 0,
      educationSample: profileData.education?.slice(0, 2).map(e => ({ degree: e.degree, institution: e.institution })) || [],
      yearsOfExperience: profileData.years_of_experience,
      certificationsCount: profileData.certifications?.length || 0,
      certificationsSample: profileData.certifications?.slice(0, 3) || [],
      languagesCount: profileData.languages?.length || 0,
      interestsCount: profileData.interests?.length || 0,
      projectsCount: profileData.projects?.length || 0,
      awardsCount: profileData.awards?.length || 0,
      volunteerCount: profileData.volunteer_experience?.length || 0,
      publicationsCount: profileData.publications?.length || 0,
      hasRawContent: !!profileData.raw_content
    });

    // Log any empty required fields
    const missingFields = [];
    if (!profileData.name) missingFields.push('name');
    if (!profileData.bio) missingFields.push('bio');
    if (!profileData.headline) missingFields.push('headline');
    if (!profileData.location) missingFields.push('location');
    if (!profileData.skills || profileData.skills.length === 0) missingFields.push('skills');
    if (!profileData.experience || profileData.experience.length === 0) missingFields.push('experience');
    if (!profileData.education || profileData.education.length === 0) missingFields.push('education');

    if (missingFields.length > 0) {
      console.warn('WARNING: Missing important fields:', missingFields);
      console.warn('These fields should be available in most LinkedIn profiles. Check the Clado API response structure.');
    }
    
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
