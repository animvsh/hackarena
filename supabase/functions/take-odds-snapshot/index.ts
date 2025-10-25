import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting odds snapshot...');

    // Get all active markets
    const { data: activeMarkets, error: marketsError } = await supabase
      .from('prediction_markets')
      .select('id')
      .eq('status', 'open');

    if (marketsError) {
      console.error('Error fetching markets:', marketsError);
      throw marketsError;
    }

    if (!activeMarkets || activeMarkets.length === 0) {
      console.log('No active markets found');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No active markets to snapshot',
        snapshotCount: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Found ${activeMarkets.length} active markets`);

    // Get current odds for all teams in active markets
    const { data: currentOdds, error: oddsError } = await supabase
      .from('market_odds')
      .select('market_id, team_id, current_odds, volume')
      .in('market_id', activeMarkets.map(m => m.id));

    if (oddsError) {
      console.error('Error fetching odds:', oddsError);
      throw oddsError;
    }

    if (!currentOdds || currentOdds.length === 0) {
      console.log('No odds data found');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No odds to snapshot',
        snapshotCount: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Snapshotting ${currentOdds.length} odds entries`);

    // Insert snapshot
    const snapshots = currentOdds.map(odd => ({
      market_id: odd.market_id,
      team_id: odd.team_id,
      odds: odd.current_odds,
      volume: odd.volume,
      timestamp: new Date().toISOString()
    }));

    const { error: insertError } = await supabase
      .from('odds_history')
      .insert(snapshots);

    if (insertError) {
      console.error('Error inserting snapshots:', insertError);
      throw insertError;
    }

    console.log(`Successfully created ${snapshots.length} snapshots`);

    return new Response(JSON.stringify({ 
      success: true, 
      snapshotCount: snapshots.length,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Snapshot error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ 
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
