import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { devpostUrl } = await req.json();

    if (!devpostUrl || !devpostUrl.includes('devpost.com')) {
      return new Response(
        JSON.stringify({ error: 'Invalid Devpost URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching hackathon from Devpost:', devpostUrl);

    // Check if hackathon already exists
    const { data: existingHackathon } = await supabase
      .from('hackathons')
      .select('id, name')
      .eq('devpost_url', devpostUrl)
      .single();

    if (existingHackathon) {
      return new Response(
        JSON.stringify({ error: 'Hackathon already imported', hackathon: existingHackathon }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the Devpost page
    const response = await fetch(devpostUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HackArenaBot/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Devpost page: ${response.status}`);
    }

    const html = await response.text();

    // Parse hackathon data using AI
    const hackathonData = await parseDevpostWithAI(html, lovableApiKey);
    console.log('Parsed hackathon data:', hackathonData);

    // Insert hackathon into database
    const { data: hackathon, error: hackathonError } = await supabase
      .from('hackathons')
      .insert({
        name: hackathonData.name,
        description: hackathonData.description,
        location: hackathonData.location || 'Online',
        start_date: hackathonData.startDate,
        end_date: hackathonData.endDate,
        website: devpostUrl,
        devpost_url: devpostUrl,
        prize_pool: hackathonData.prizePool || 0,
        total_participants: hackathonData.participants || 0,
        status: determineStatus(hackathonData.startDate, hackathonData.endDate),
      })
      .select()
      .single();

    if (hackathonError) {
      console.error('Error inserting hackathon:', hackathonError);
      throw hackathonError;
    }

    console.log('Created hackathon:', hackathon.id);

    // Insert tracks into hackathon_prizes and create prediction markets
    const tracks = [];
    const markets = [];

    for (let i = 0; i < hackathonData.tracks.length; i++) {
      const track = hackathonData.tracks[i];
      
      // Insert into hackathon_prizes
      const { data: prize, error: prizeError } = await supabase
        .from('hackathon_prizes')
        .insert({
          hackathon_id: hackathon.id,
          category: track.name,
          prize_amount: track.amount,
          position: i + 1,
          description: track.description || null,
        })
        .select()
        .single();

      if (prizeError) {
        console.error('Error inserting prize:', prizeError);
        continue;
      }

      tracks.push(prize);
      console.log('Created prize:', prize.id, track.name);

      // Create corresponding prediction market
      const { data: market, error: marketError } = await supabase
        .from('prediction_markets')
        .insert({
          hackathon_id: hackathon.id,
          category: track.name,
          prize_amount: track.amount,
          status: 'upcoming',
          total_pool: 0,
          start_time: hackathonData.startDate,
          end_time: hackathonData.endDate,
        })
        .select()
        .single();

      if (!marketError && market) {
        markets.push(market);
        console.log('Created market:', market.id, track.name);
      }
    }

    console.log(`Successfully imported hackathon with ${tracks.length} tracks and ${markets.length} markets`);

    return new Response(
      JSON.stringify({
        success: true,
        hackathon,
        tracks,
        markets,
        participants: hackathonData.participants,
        submissions: hackathonData.submissions,
        message: `Successfully imported "${hackathon.name}" with ${tracks.length} tracks${hackathonData.participants > 0 ? ` and ${hackathonData.participants} participants` : ''}`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error importing hackathon:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function parseDevpostWithAI(html: string, apiKey: string): Promise<any> {
  // Clean HTML to reduce token count
  const cleanHtml = html
    .replace(/<script[^>]*>.*?<\/script>/gis, '')
    .replace(/<style[^>]*>.*?<\/style>/gis, '')
    .replace(/<!--.*?-->/gs, '')
    .substring(0, 15000); // Limit to first 15k chars

  const prompt = `Parse this Devpost hackathon HTML and extract the following information in JSON format:

1. name: The hackathon name
2. description: Brief description of the hackathon
3. startDate: Start date in ISO format (if found, otherwise use current date)
4. endDate: End date in ISO format (if found, otherwise 2 days from start)
5. location: Location or "Online"
6. prizePool: Total prize pool amount (extract largest dollar amount)
7. participants: Number of registered participants (look for "X participants", "X registered", etc. - if not found, return 0)
8. submissions: Number of project submissions (if not found, return 0)
9. tracks: Array of prize tracks/categories with:
   - name: Track name (e.g., "Best Use of OpenAI API", "Best Overall")
   - amount: Prize amount for this track (distribute prize pool across tracks)
   - description: Brief description if available

If you can't find tracks, create 5 generic ones: "Track 1", "Track 2", etc., each with equal portions of the prize pool.

HTML:
${cleanHtml}

Return ONLY valid JSON, no markdown formatting.`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a precise HTML parser. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      console.error('AI API error:', response.status);
      throw new Error('Failed to parse with AI');
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(jsonStr);

    // Ensure tracks exist with fallback
    if (!parsed.tracks || parsed.tracks.length === 0) {
      const prizePerTrack = Math.floor((parsed.prizePool || 25000) / 5);
      parsed.tracks = [
        { name: 'Track 1 - General', amount: prizePerTrack, description: null },
        { name: 'Track 2 - Innovation', amount: prizePerTrack, description: null },
        { name: 'Track 3 - Impact', amount: prizePerTrack, description: null },
        { name: 'Track 4 - Design', amount: prizePerTrack, description: null },
        { name: 'Track 5 - Technical', amount: prizePerTrack, description: null },
      ];
    }

    return parsed;
  } catch (error) {
    console.error('AI parsing error:', error);
    // Fallback to basic parsing
    return fallbackParse(html);
  }
}

function fallbackParse(html: string): any {
  const nameMatch = html.match(/<title>([^<]+)<\/title>/i);
  const name = nameMatch ? nameMatch[1].replace(' | Devpost', '').trim() : 'Imported Hackathon';

  const descMatch = html.match(/<meta name="description" content="([^"]+)"/i);
  const description = descMatch ? descMatch[1] : 'Imported from Devpost';

  const prizeMatch = html.match(/\$[\d,]+(?:\.\d{2})?/g);
  const prizePool = prizeMatch ? Math.max(...prizeMatch.map(p => parseInt(p.replace(/[$,]/g, '')))) : 25000;

  const prizePerTrack = Math.floor(prizePool / 5);

  return {
    name,
    description,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    location: 'Online',
    prizePool,
    participants: 0,
    submissions: 0,
    tracks: [
      { name: 'Track 1 - General', amount: prizePerTrack, description: null },
      { name: 'Track 2 - Innovation', amount: prizePerTrack, description: null },
      { name: 'Track 3 - Impact', amount: prizePerTrack, description: null },
      { name: 'Track 4 - Design', amount: prizePerTrack, description: null },
      { name: 'Track 5 - Technical', amount: prizePerTrack, description: null },
    ],
  };
}

function determineStatus(startDate: string, endDate: string): string {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) return 'upcoming';
  if (now > end) return 'completed';
  return 'active';
}
