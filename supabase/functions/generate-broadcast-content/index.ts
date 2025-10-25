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
    const { 
      teamName, 
      metricType, 
      currentValue, 
      change, 
      contentType = 'commentary',
      eventType = 'generic'
    } = await req.json();
    
    console.log('Generating broadcast content:', { teamName, metricType, contentType, eventType });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Event-specific system prompts
    const getSystemPrompt = (type: string, event: string) => {
      const basePrompts = {
        commentary: 'You are an energetic sports broadcaster covering a live coding competition. Generate exciting, punchy commentary (15-25 words) that captures the drama and excitement. Use sports broadcasting language with energy!',
        ticker: 'You are writing ticker tape items. Generate brief, 6-10 word updates in format "TeamName: action description". Be concise and impactful.',
        banner: 'You are writing lower-third banner text. Generate 3-6 word descriptive labels that are professional and clear.',
        breaking: 'You are writing breaking news alerts. Generate urgent 10-15 word announcements with CAPS for emphasis on key words!'
      };

      const eventContext = {
        bet_placed: 'A bet was just placed. Focus on the STAKES and RISK involved!',
        odds_change: 'Market odds shifted dramatically. Emphasize the MOMENTUM swing!',
        team_update: 'A team made progress. Highlight their ACCELERATION and strategy!',
        milestone: 'A major milestone was reached. Celebrate the ACHIEVEMENT!',
        prediction_won: 'A prediction paid out. Focus on the VICTORY and rewards!',
        prediction_lost: 'A bet didn\'t pan out. Keep it neutral but informative.',
      };

      const context = eventContext[event as keyof typeof eventContext] || 'Something noteworthy happened.';
      return `${basePrompts[type as keyof typeof basePrompts]} ${context}`;
    };

    // Event-specific user prompts
    const getUserPrompt = (type: string, event: string) => {
      const changeDirection = change > 0 ? 'up' : 'down';
      const changeEmphasis = Math.abs(change) > 20 ? 'MASSIVE' : Math.abs(change) > 10 ? 'significant' : 'steady';

      switch (event) {
        case 'bet_placed':
          return `${teamName} just received a ${currentValue} coin bet! ${currentValue > 500 ? 'This is a HIGH-STAKES wager!' : 'Betting action heating up!'} Generate ${type === 'commentary' ? 'exciting play-by-play' : type === 'ticker' ? 'a brief update' : type === 'banner' ? 'a short label' : 'an urgent alert'}.`;
        
        case 'odds_change':
          return `${teamName}'s odds moved ${changeDirection} by ${Math.abs(change).toFixed(1)}%! ${Math.abs(change) > 15 ? 'MAJOR market movement!' : 'Market reacting!'} New odds: ${currentValue.toFixed(1)}%. Generate ${type === 'commentary' ? 'energetic commentary' : type === 'ticker' ? 'a brief update' : type === 'banner' ? 'a short label' : 'breaking news'}.`;
        
        case 'team_update':
          return `${teamName} made ${changeEmphasis} progress: +${change} points! Current: ${currentValue}. ${change >= 10 ? 'They\'re accelerating!' : 'Steady momentum!'} Generate ${type === 'commentary' ? 'exciting commentary' : type === 'ticker' ? 'a brief update' : type === 'banner' ? 'a short label' : 'breaking news'}.`;
        
        case 'milestone':
          return `🎯 ${teamName} reached a milestone! ${metricType}: ${currentValue}. Incredible achievement! Generate ${type === 'commentary' ? 'celebratory commentary' : type === 'ticker' ? 'a brief update' : type === 'banner' ? 'a short label' : 'breaking news'}.`;
        
        case 'prediction_won':
          return `💰 A bet on ${teamName} just paid out ${currentValue} coins! Winner! Generate ${type === 'commentary' ? 'exciting commentary' : type === 'ticker' ? 'a brief update' : type === 'banner' ? 'a short label' : 'breaking news'}.`;
        
        default:
          return `${teamName} - ${metricType}: ${currentValue} (${change > 0 ? '+' : ''}${change}). Generate ${type === 'commentary' ? 'commentary' : type === 'ticker' ? 'a ticker item' : type === 'banner' ? 'a banner label' : 'a news alert'}.`;
      }
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
          { role: 'system', content: getSystemPrompt(contentType, eventType) },
          { role: 'user', content: getUserPrompt(contentType, eventType) }
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

    // Smart priority and duration based on event type and magnitude
    let priority: 'breaking' | 'normal' | 'background' = 'normal';
    let duration = 6000;

    // Breaking events
    if (
      contentType === 'breaking' || 
      eventType === 'milestone' ||
      (eventType === 'bet_placed' && currentValue > 500) ||
      (eventType === 'odds_change' && Math.abs(change) > 15) ||
      (eventType === 'team_update' && change >= 10)
    ) {
      priority = 'breaking';
      duration = 10000;
    } 
    // Normal priority
    else if (
      (eventType === 'bet_placed' && currentValue > 200) ||
      (eventType === 'odds_change' && Math.abs(change) > 5) ||
      eventType === 'prediction_won'
    ) {
      priority = 'normal';
      duration = 8000;
    }
    // Background priority
    else {
      priority = 'background';
      duration = 6000;
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
          change,
          eventType
        }
      });

    if (insertError) {
      console.error('Database insert error:', insertError);
    }

    return new Response(
      JSON.stringify({
        content: generatedText,
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
