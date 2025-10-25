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
    const text = new TextDecoder().decode(buffer);

    // Use AI to parse the resume
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': lovableApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: `Parse this resume and extract structured data. Return ONLY valid JSON with this exact structure:
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "+1234567890",
  "bio": "2-3 sentence professional bio highlighting key expertise and experience",
  "skills": [{"name": "JavaScript", "level": "Expert"}, {"name": "React", "level": "Advanced"}],
  "experience": [{
    "title": "Senior Developer",
    "company": "Company Name",
    "startDate": "2020-01",
    "endDate": "2023-12",
    "description": "Brief description of responsibilities and achievements"
  }],
  "education": [{
    "degree": "Bachelor of Science in Computer Science",
    "institution": "University Name",
    "year": "2019"
  }],
  "linkedin_url": "https://linkedin.com/in/username",
  "github_url": "https://github.com/username",
  "portfolio_url": "https://example.com"
}

Resume text:
${text.substring(0, 10000)}`
        }]
      })
    });

    const aiResult = await aiResponse.json();
    console.log('AI Response:', aiResult);

    if (!aiResult.content || !aiResult.content[0]) {
      throw new Error('Invalid AI response');
    }

    // Extract JSON from AI response
    const aiText = aiResult.content[0].text;
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }

    const parsedProfile: ParsedProfile = JSON.parse(jsonMatch[0]);

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