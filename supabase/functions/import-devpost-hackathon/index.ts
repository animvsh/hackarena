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
        'User-Agent': 'Mozilla/5.0 (compatible; HackcastBot/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Devpost page: ${response.status}`);
    }

    const html = await response.text();

    // Parse hackathon data from HTML
    const hackathonData = parseDevpostHTML(html, devpostUrl);
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
        total_participants: 0,
        status: determineStatus(hackathonData.startDate, hackathonData.endDate),
      })
      .select()
      .single();

    if (hackathonError) {
      console.error('Error inserting hackathon:', hackathonError);
      throw hackathonError;
    }

    console.log('Created hackathon:', hackathon.id);

    // Create prediction markets for prize categories
    const markets = [];
    
    // Create overall winner market
    const { data: overallMarket, error: marketError } = await supabase
      .from('prediction_markets')
      .insert({
        hackathon_id: hackathon.id,
        category: 'Overall Winner',
        prize_amount: Math.floor(hackathonData.prizePool * 0.5) || 10000,
        status: 'upcoming',
        total_pool: 0,
        start_time: hackathonData.startDate,
        end_time: hackathonData.endDate,
      })
      .select()
      .single();

    if (!marketError && overallMarket) {
      markets.push(overallMarket);
      console.log('Created overall winner market:', overallMarket.id);
    }

    // Create markets for each prize category
    for (const prize of hackathonData.prizes) {
      const { data: prizeMarket, error: prizeError } = await supabase
        .from('prediction_markets')
        .insert({
          hackathon_id: hackathon.id,
          category: prize.category,
          prize_amount: prize.amount || 5000,
          status: 'upcoming',
          total_pool: 0,
          start_time: hackathonData.startDate,
          end_time: hackathonData.endDate,
        })
        .select()
        .single();

      if (!prizeError && prizeMarket) {
        markets.push(prizeMarket);
        console.log('Created prize market:', prizeMarket.id, prize.category);
      }
    }

    console.log(`Successfully imported hackathon with ${markets.length} markets`);

    return new Response(
      JSON.stringify({
        success: true,
        hackathon,
        markets,
        message: `Successfully imported "${hackathon.name}" with ${markets.length} prediction markets`,
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

function parseDevpostHTML(html: string, url: string): any {
  // Extract hackathon name
  const nameMatch = html.match(/<title>([^<]+)<\/title>/i) || html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const name = nameMatch ? nameMatch[1].replace(' | Devpost', '').trim() : 'Imported Hackathon';

  // Extract description
  const descMatch = html.match(/<meta name="description" content="([^"]+)"/i);
  const description = descMatch ? descMatch[1] : 'Imported from Devpost';

  // Extract dates - look for common date patterns
  const datePattern = /(\w+\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})/gi;
  const dates = html.match(datePattern) || [];
  
  const startDate = dates[0] ? new Date(dates[0]).toISOString() : new Date().toISOString();
  const endDate = dates[1] ? new Date(dates[1]).toISOString() : new Date(Date.now() + 86400000 * 2).toISOString();

  // Extract location
  const locationMatch = html.match(/location["\s:]+([^<"]+)/i);
  const location = locationMatch ? locationMatch[1].trim() : null;

  // Extract prize pool - look for dollar amounts
  const prizeMatch = html.match(/\$[\d,]+(?:\.\d{2})?/g);
  let prizePool = 0;
  if (prizeMatch) {
    prizePool = Math.max(...prizeMatch.map(p => parseInt(p.replace(/[$,]/g, ''))));
  }

  // Extract prize categories
  const prizes: Array<{ category: string; amount: number }> = [];
  const prizeCategories = [
    'Best AI/ML Hack',
    'Best FinTech Solution',
    'Best Blockchain Project',
    'Best Mobile App',
    'Best Overall',
  ];

  // Try to find actual categories in the HTML
  const categoryMatches = html.matchAll(/prize[s]?["\s:]+([^<"]+)/gi);
  for (const match of categoryMatches) {
    const category = match[1].trim();
    if (category && category.length < 100) {
      prizes.push({
        category,
        amount: Math.floor(prizePool / 5),
      });
    }
  }

  // If no prizes found, use default categories
  if (prizes.length === 0) {
    prizeCategories.forEach(cat => {
      prizes.push({
        category: cat,
        amount: 5000,
      });
    });
  }

  return {
    name,
    description,
    startDate,
    endDate,
    location,
    prizePool,
    prizes: prizes.slice(0, 5), // Limit to 5 prizes
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
