import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { teamName, metricType, currentValue, change } = await req.json();

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const systemPrompt = `You are generating natural dialogue for a two-anchor sports broadcast covering a live hackathon.

CRITICAL RULES FOR TEXT OUTPUT:
- DO NOT include anchor names in the spoken text (no "Sarah", "Marcus", "Thanks", "Over to you")
- Only output what should be SPOKEN ALOUD by the anchor
- The personality field will indicate WHO speaks, NOT the text content
- Keep each statement 15-30 words for natural speech rhythm
- Use conversational language that flows naturally
- Make it exciting and energetic like ESPN or CNN sports desk
- NO meta-commentary about the conversation itself

GOOD EXAMPLES:
"The markets are showing unprecedented volatility right now."
"Looking at the data, we're seeing massive shifts in team valuations."
"This is a game-changing development that could impact the final standings."

BAD EXAMPLES (DO NOT DO THIS):
"Thanks Sarah! Marcus, what do you think?"
"Over to you Marcus for the analysis."
"That's a great point Sarah!"

TONE: Professional but conversational, energetic, engaging`;

    const userPrompt = `Team: ${teamName}
Metric: ${metricType}
Current Value: ${currentValue}
Change: ${change > 0 ? '+' : ''}${change}

Generate an exciting broadcast narrative.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate commentary');
    }

    const data = await response.json();
    const narrative = data.choices[0].message.content;
    
    // Calculate priority based on change magnitude
    let priority: 'breaking' | 'normal' | 'background' = 'normal';
    if (Math.abs(change) > 50) priority = 'breaking';
    else if (Math.abs(change) < 10) priority = 'background';

    // Estimate duration (average speaking speed ~150 words/min)
    const wordCount = narrative.split(' ').length;
    const duration = Math.ceil((wordCount / 150) * 60); // seconds

    return new Response(
      JSON.stringify({ narrative, duration, priority }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
