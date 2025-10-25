#!/bin/bash

# Script to apply the hacker stats migration to Supabase
# Run this script from your project root directory

echo "🚀 Applying hacker stats migration to Supabase..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if we're logged in
if ! supabase status &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please login first:"
    echo "supabase login"
    exit 1
fi

# Apply the migration
echo "📝 Applying migration: create_hacker_stats_tables"
supabase db push

echo "✅ Migration applied successfully!"
echo ""
echo "🎯 Next steps:"
echo "1. Visit /populate in your app to populate the database"
echo "2. The migration creates these tables:"
echo "   - hackers (individual hacker profiles)"
echo "   - hacker_stats (comprehensive stats for each hacker)"
echo "   - hackathons (hackathon events)"
echo "   - hackathon_prizes (prize categories)"
echo "   - hackathon_teams (teams participating in hackathons)"
echo "   - team_members (team-hacker relationships)"
echo "   - team_stats (calculated team stats)"
echo "   - betting_odds (betting odds for teams)"
echo ""
echo "🚀 Ready to populate with real hacker data!"


