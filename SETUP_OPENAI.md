# Setup OpenAI Analysis for HackCast LIVE

## Current Status
✅ Edge Function: `analyze-github-stats` is deployed and ready  
✅ UI Page: Available at `/analyze` in the app  
✅ Database: All tables are set up with hacker data  

## What's Missing
❌ OpenAI API key is not configured in Supabase secrets  

## To Complete the Setup:

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to: https://supabase.com/dashboard/project/jqdfjcpgevgajdljckur/settings/secrets
2. Click "Add Secret"
3. Name: `OPENAI_API_KEY`
4. Value: Your OpenAI API key (from https://platform.openai.com/api-keys)
5. Click "Save"

### Option 2: Using Supabase CLI
```bash
# Make sure you're logged in to Supabase
supabase login

# Set the secret
supabase secrets set OPENAI_API_KEY="your-api-key-here" --project-ref jqdfjcpgevgajdljckur
```

### Option 3: Direct API Call
You can also use the Supabase Management API to set the secret programmatically.

## After Setting the Key:

1. Navigate to http://localhost:8080/analyze in your app
2. Click "Start AI Analysis"
3. The system will:
   - Fetch GitHub profiles for all team members
   - Analyze their repositories with OpenAI GPT-4
   - Generate comprehensive stats based on their actual work
   - Store the stats in the database

## What the Analysis Does:

1. **Fetches GitHub Data**: Gets each team member's profile, repos, stars, languages
2. **AI Analysis**: OpenAI analyzes code quality, project types, activity patterns
3. **Matches Skills**: Adjusts stats based on how well projects match the hackathon category
4. **Generates Stats**: Creates ratings for technical skill, innovation, hackathon experience, etc.
5. **Updates Database**: Stores individual hacker stats and calculates team aggregates

## Current Data:
- The database currently has **random placeholder stats**
- After running the analysis, these will be replaced with **real stats based on GitHub analysis**

