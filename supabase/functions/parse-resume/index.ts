import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ParsedProfile {
  name?: string;
  email?: string;
  phone?: string;
  bio: string;
  headline?: string;
  location?: string;
  years_of_experience?: number;
  skills: Array<{ name: string; level: string }>;
  experience: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
  projects?: Array<{
    title: string;
    description: string;
    url?: string;
  }>;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Read file content
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    const resumeText = new TextDecoder().decode(buffer);

    // Use Lovable AI Gateway with Gemini
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an expert resume parser. Extract structured information from resumes and return it as valid JSON only, no markdown formatting."
          },
          {
            role: "user",
            content: `Parse this resume and extract the following information as JSON:
{
  "name": "Full name",
  "email": "Email address",
  "phone": "Phone number",
  "bio": "Professional summary or objective (2-3 sentences)",
  "headline": "Professional title/headline",
  "location": "City, State/Country",
  "linkedin_url": "LinkedIn profile URL if present",
  "github_url": "GitHub profile URL if present",
  "portfolio_url": "Portfolio or personal website URL if present",
  "years_of_experience": number,
  "skills": [{"name": "skill name", "level": "beginner|intermediate|advanced|expert"}],
  "experience": [{"title": "job title", "company": "company name", "startDate": "YYYY-MM", "endDate": "YYYY-MM or null", "description": "brief description"}],
  "education": [{"degree": "degree name", "institution": "school name", "year": "graduation year"}],
  "certifications": [{"name": "certification name", "issuer": "issuing organization", "date": "YYYY-MM"}],
  "projects": [{"title": "project name", "description": "project description", "url": "project URL if available"}]
}

Resume text:
${resumeText.substring(0, 10000)}`
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }

    // Extract JSON from response (remove markdown code blocks if present)
    let jsonText = content.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const parsedProfile: ParsedProfile = JSON.parse(jsonText);

    return new Response(
      JSON.stringify({ success: true, profile: parsedProfile }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error parsing resume:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
