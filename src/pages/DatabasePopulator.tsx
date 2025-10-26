import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Database, Users, Trophy, Target, Settings, Award } from 'lucide-react';
import { populateDatabase } from '@/lib/database-populator';
import { createHackerStatsTables } from '@/lib/create-tables';
import { populateWithRealDevpostHackathons } from '@/lib/devpost-populator';
import { clearAndPopulateRealData } from '@/lib/clear-and-populate';
import { populateDiverseTeams } from '@/lib/populate-diverse-teams';

const DatabasePopulator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  const handleCreateTables = async () => {
    setIsLoading(true);
    setProgress(0);
    setStatus('Creating database tables...');

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 500);

      await createHackerStatsTables();
      
      clearInterval(progressInterval);
      setProgress(100);
      setStatus('✅ Database tables created successfully!');
    } catch (error) {
      console.error('Error creating tables:', error);
      setStatus('❌ Error creating tables. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePopulateDatabase = async () => {
    setIsLoading(true);
    setProgress(0);
    setStatus('Starting database population...');

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 500);

      await populateDatabase();
      
      clearInterval(progressInterval);
      setProgress(100);
      setStatus('✅ Database populated successfully!');
    } catch (error) {
      console.error('Error populating database:', error);
      setStatus('❌ Error populating database. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePopulateRealDevpost = async () => {
    setIsLoading(true);
    setProgress(0);
    setStatus('Clearing old data and adding real Devpost hackathons...');

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 500);

      const result = await clearAndPopulateRealData();
      
      clearInterval(progressInterval);
      setProgress(100);
      setStatus(`✅ Successfully cleared old data and added ${result.created} real Devpost hackathons!`);
    } catch (error) {
      console.error('Error populating real Devpost:', error);
      setStatus('❌ Error. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePopulateDiverseTeams = async () => {
    setIsLoading(true);
    setProgress(0);
    setStatus('Populating diverse team members...');

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 500);

      await populateDiverseTeams();
      
      clearInterval(progressInterval);
      setProgress(100);
      setStatus('✅ Successfully populated 50+ diverse hackers with real GitHub profiles and OpenAI-generated stats!');
    } catch (error) {
      console.error('Error populating diverse teams:', error);
      setStatus('❌ Error. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Database className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Database Populator</h1>
                <p className="text-muted-foreground">
                  Populate Supabase with hacker stats and hackathon data
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Hackers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">50</div>
                  <p className="text-xs text-muted-foreground">
                    Individual hacker profiles with stats
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Hackathons</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">
                    Major hackathon events
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Teams</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">36</div>
                  <p className="text-xs text-muted-foreground">
                    Teams across all hackathons
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Create Tables Button */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Create Database Tables</span>
                </CardTitle>
                <CardDescription>
                  First, create all the necessary database tables for storing hacker stats and hackathon data.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleCreateTables}
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                  variant="outline"
                >
                  {isLoading ? 'Creating Tables...' : 'Create Database Tables'}
                </Button>
              </CardContent>
            </Card>

            {/* Populate Button */}
            <Card>
              <CardHeader>
                <CardTitle>Populate Database</CardTitle>
                <CardDescription>
                  This will fetch hacker data from GitHub, calculate stats, generate hackathons and teams, 
                  and save everything to Supabase. This process may take a few minutes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handlePopulateDatabase}
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? 'Populating Database...' : 'Start Database Population'}
                </Button>

                {isLoading && (
                  <div className="space-y-2">
                    <Progress value={progress} className="w-full" />
                    <p className="text-sm text-muted-foreground">{status}</p>
                  </div>
                )}

                {!isLoading && status && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm">{status}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Add Real Devpost Hackathons */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Add Real Devpost Hackathons</span>
                </CardTitle>
                <CardDescription>
                  Replace all existing data with real hackathons from TechCrunch Disrupt, Y Combinator, and ETHGlobal. 
                  This will clear all old data and add 3 real hackathons with 7 teams and prizes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handlePopulateRealDevpost}
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                  variant="default"
                >
                  {isLoading ? 'Clearing & Adding...' : 'Replace with Real Devpost Hackathons'}
                </Button>

                {!isLoading && status && (status.includes('Devpost') || status.includes('hackathon')) && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm">{status}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Populate Diverse Teams */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Populate Diverse Team Members</span>
                </CardTitle>
                <CardDescription>
                  Fetch 50+ real GitHub accounts, generate stats using OpenAI pipeline, and assign distinct members to each team.
                  This will create realistic variation in team stats and betting odds.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handlePopulateDiverseTeams}
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                  variant="secondary"
                >
                  {isLoading ? 'Fetching & Generating...' : 'Populate 50+ Diverse Hackers with OpenAI Stats'}
                </Button>

                {!isLoading && status && status.includes('Diverse') && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm">{status}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* What This Does */}
            <Card>
              <CardHeader>
                <CardTitle>What This Does</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">1. Create Database Tables</h4>
                  <p className="text-sm text-muted-foreground">
                    Creates all necessary tables: hackers, hacker_stats, hackathons, hackathon_prizes, 
                    hackathon_teams, team_members, team_stats, and betting_odds with proper relationships.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">2. Fetch Hacker Data</h4>
                  <p className="text-sm text-muted-foreground">
                    Retrieves GitHub profiles for 50+ developers, including real profiles from GitHub API 
                    and simulated profiles to reach the target number.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">3. Calculate Hacker Stats</h4>
                  <p className="text-sm text-muted-foreground">
                    Uses the "Moneyball for Hackathons" algorithm to calculate comprehensive stats 
                    including technical skills, leadership, innovation, and market value.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">4. Generate Hackathons</h4>
                  <p className="text-sm text-muted-foreground">
                    Creates realistic hackathon events (TechCrunch Disrupt, ETHGlobal Paris, Microsoft Build) 
                    with prize categories and betting lines.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">5. Create Teams</h4>
                  <p className="text-sm text-muted-foreground">
                    Forms teams of 2-4 hackers, calculates team stats by averaging individual stats, 
                    and generates betting odds based on team performance metrics.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">6. Save to Supabase</h4>
                  <p className="text-sm text-muted-foreground">
                    Stores all data in structured tables with proper relationships, enabling the 
                    Hackathons page to fetch real data instead of generating it locally.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DatabasePopulator;

