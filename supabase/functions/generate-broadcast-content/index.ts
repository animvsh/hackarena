import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { teamName, metricType, currentValue, change, contentType = 'commentary' } = await req.json();
    
    console.log('Generating broadcast content:', { teamName, metricType, contentType });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Different prompts for different content types
    const systemPrompts = {
      commentary: `You are an energetic sports broadcaster covering a live coding competition. Generate exciting, 15-20 word commentary that captures the drama and excitement of the moment. Use sports broadcasting language.`,
      ticker: `You are writing ticker tape items for a live broadcast. Generate brief, 5-8 word updates in format "TeamName: Brief update". Be concise and punchy.`,
      banner: `You are writing lower-third banner text for a TV broadcast. Generate 3-5 word descriptive labels that are professional and clear.`,
      breaking: `You are writing breaking news alerts. Generate 8-12 word urgent announcements. Use emphasis for key words.`
    };

    const userPrompts = {
      commentary: `Team: ${teamName}\nMetric: ${metricType}\nCurrent: ${currentValue}\nChange: ${change > 0 ? '+' : ''}${change}\n\nCreate an exciting broadcast commentary about this development.`,
      ticker: `Team: ${teamName}, Metric: ${metricType}, Value: ${currentValue}\n\nCreate a brief ticker item.`,
      banner: `Metric: ${metricType}\n\nCreate a short descriptive label.`,
      breaking: `Team: ${teamName} just achieved ${metricType}: ${currentValue} (${change > 0 ? '+' : ''}${change})\n\nCreate an urgent breaking news alert.`
    };

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompts[contentType as keyof typeof systemPrompts] },
          { role: 'user', content: userPrompts[contentType as keyof typeof userPrompts] }
        ],
        temperature: 0.9,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('AI Gateway error:', error);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content.trim();

    console.log('Generated text:', generatedText);

    // Determine priority and duration based on content type and change magnitude
    let priority: 'breaking' | 'normal' | 'background' = 'normal';
    let duration = 5;

    if (contentType === 'breaking' || Math.abs(change) > 50) {
      priority = 'breaking';
      duration = 8;
    } else if (Math.abs(change) > 20) {
      priority = 'normal';
      duration = 6;
    } else {
      priority = 'background';
      duration = 4;
    }

    // Store in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: insertError } = await supabase
      .from('broadcast_content')
      .insert({
        content_type: contentType,
        text: generatedText,
        team_name: teamName,
        priority,
        duration,
        metadata: {
          metricType,
          currentValue,
          change
        }
      });

    if (insertError) {
      console.error('Database insert error:', insertError);
    }

    return new Response(
      JSON.stringify({
        text: generatedText,
        duration,
        priority,
        contentType
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-broadcast-content:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
