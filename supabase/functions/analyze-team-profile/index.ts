import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

interface AnalysisRequest {
  teamName: string;
  projectDescription: string;
  industryTags: string[];
  stage: string;
  teamSize: number;
}

interface IntegrationRecommendation {
  type: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  reason: string;
  setupUrl?: string;
}

interface AIAnalysisResponse {
  company_type: string;
  business_model: string;
  industry: string;
  recommended_integrations: IntegrationRecommendation[];
  key_metrics: string[];
  reasoning: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } });
  }

  try {
    const { teamName, projectDescription, industryTags, stage, teamSize }: AnalysisRequest = await req.json();

    const systemPrompt = `You are an expert startup advisor and data analyst. Given a team's project description, determine their company type, business model, and recommend the most important data sources to track their progress.

Consider these integration types:
- GitHub: For all development teams (commits, PRs, code velocity)
- HubSpot/Salesforce: For B2B companies (CRM, deals, meetings booked)
- Google Calendar: For B2B companies tracking meetings
- Gmail: For sales/customer outreach tracking
- Google Analytics: For B2C products (traffic, conversions)
- Stripe: For revenue-generating products
- Mixpanel: For SaaS products (user behavior, funnels)
- Linear: For development teams (sprint velocity, issue tracking)

Guidelines:
- B2B SaaS: GitHub (critical), CRM (high), Calendar (high), Gmail (medium)
- B2C Product: GitHub (critical), Analytics (critical), Mixpanel (high)
- Developer Tools: GitHub (critical), Linear (high), Stripe (medium)
- Marketplace: GitHub (critical), Stripe (critical), Analytics (high)
- Early stage (idea/building): Focus on GitHub, Linear
- Launched stage: Add revenue and customer tracking

Return ONLY valid JSON with this exact structure:
{
  "company_type": "b2b_saas" | "b2c_product" | "marketplace" | "developer_tools" | "consumer_app" | "other",
  "business_model": "subscription" | "transactional" | "freemium" | "advertising" | "marketplace_fee" | "other",
  "industry": "fintech" | "healthtech" | "edtech" | "devtools" | "ecommerce" | "social" | "productivity" | "other",
  "recommended_integrations": [
    {
      "type": "github" | "hubspot" | "salesforce" | "gmail" | "google_calendar" | "google_analytics" | "stripe" | "mixpanel" | "linear",
      "priority": "critical" | "high" | "medium" | "low",
      "reason": "brief explanation"
    }
  ],
  "key_metrics": ["metric_name_1", "metric_name_2"],
  "reasoning": "1-2 sentence explanation of your analysis"
}`;

    const userPrompt = `Analyze this team:

Team Name: ${teamName}
Project Description: ${projectDescription}
Industry Tags: ${industryTags.join(', ')}
Stage: ${stage}
Team Size: ${teamSize}

Provide integration recommendations and key metrics to track.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Gateway error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Parse JSON from AI response
    let analysis: AIAnalysisResponse;
    try {
      // Extract JSON if wrapped in markdown code blocks
      const jsonMatch = aiResponse.match(/```json\n?([\s\S]*?)\n?```/) || aiResponse.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiResponse;
      analysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      throw new Error('Failed to parse AI response as JSON');
    }

    return new Response(JSON.stringify(analysis), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Error in analyze-team-profile:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});
