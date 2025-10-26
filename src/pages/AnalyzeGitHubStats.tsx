import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AnalyzeGitHubStats = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const { toast } = useToast();

  const analyzeAllTeams = async () => {
    setLoading(true);
    setProgress(0);
    setStatus("Fetching teams...");
    setResults([]);

    try {
      // Fetch all hackathons with teams
      const { data: hackathons, error: hackathonsError } = await supabase
        .from('hackathons')
        .select('id, name');

      if (hackathonsError) throw hackathonsError;

      setStatus(`Found ${hackathons?.length || 0} hackathons`);

      // Get teams for each hackathon
      const allTeams: any[] = [];
      for (const hackathon of hackathons || []) {
        const { data: teams } = await supabase
          .from('hackathon_teams')
          .select('id, name, category, hackathon_id')
          .eq('hackathon_id', hackathon.id);

        if (teams) {
          allTeams.push(...teams.map(t => ({ ...t, hackathon_name: hackathon.name })));
        }
      }

      setStatus(`Analyzing ${allTeams.length} teams with OpenAI...`);
      setProgress(10);

      // Analyze each team
      const analysisResults = [];
      for (let i = 0; i < allTeams.length; i++) {
        const team = allTeams[i];
        setProgress(10 + (i / allTeams.length) * 80);
        setStatus(`Analyzing team ${i + 1}/${allTeams.length}: ${team.name}`);

        try {
          // Call the Edge Function
          const { data: session } = await supabase.auth.getSession();
          const response = await fetch(
            `https://jqdfjcpgevgajdljckur.supabase.co/functions/v1/analyze-github-stats`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.session?.access_token || ''}`
              },
              body: JSON.stringify({
                teamId: team.id,
                hackathonId: team.hackathon_id
              })
            }
          );

          const result = await response.json();
          
          if (result.success) {
            analysisResults.push({
              team: team.name,
              hackathon: team.hackathon_name,
              members: result.member_count,
              rating: result.team_rating,
              success: true
            });
          } else {
            analysisResults.push({
              team: team.name,
              hackathon: team.hackathon_name,
              error: result.error,
              success: false
            });
          }

          // Small delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error: any) {
          analysisResults.push({
            team: team.name,
            hackathon: team.hackathon_name,
            error: error.message,
            success: false
          });
        }
      }

      setProgress(100);
      setStatus(`✅ Analysis complete! Analyzed ${analysisResults.filter(r => r.success).length}/${allTeams.length} teams`);
      setResults(analysisResults);

      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${analysisResults.filter(r => r.success).length} teams`
      });

    } catch (error: any) {
      console.error('Error analyzing teams:', error);
      setStatus(`❌ Error: ${error.message}`);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <Header />
          
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <Brain className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">GitHub Stats Analyzer</h1>
                <p className="text-muted-foreground">
                  Analyze team members' GitHub profiles with AI to generate real betting stats
                </p>
              </div>
            </div>

            {/* Analysis Card */}
            <Card>
              <CardHeader>
                <CardTitle>Analyze All Teams</CardTitle>
                <CardDescription>
                  This will fetch each team member's GitHub profile, analyze their repositories,
                  and use OpenAI to generate comprehensive stats based on their actual work.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={analyzeAllTeams}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  {loading ? "Analyzing..." : "Start AI Analysis"}
                </Button>

                {loading && (
                  <div className="space-y-2">
                    <Progress value={progress} />
                    <p className="text-sm text-muted-foreground">{status}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results */}
            {results.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Results</CardTitle>
                  <CardDescription>
                    {results.filter(r => r.success).length} teams successfully analyzed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {results.map((result, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{result.team}</p>
                          <p className="text-sm text-muted-foreground">{result.hackathon}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {result.success ? (
                            <>
                              <CheckCircle className="h-5 w-5 text-green-500" />
                              <div className="text-right">
                                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                                  Rating: {result.rating?.toFixed(1)}
                                </Badge>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {result.members} members
                                </p>
                              </div>
                            </>
                          ) : (
                            <Badge variant="destructive">
                              Failed
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* What This Does */}
            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">1. Fetch GitHub Data</h4>
                  <p className="text-sm text-muted-foreground">
                    Gets each team member's GitHub profile, repositories, stars, and project details
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">2. AI Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    OpenAI GPT-4 analyzes their code quality, project types, activity patterns,
                    and matches skills to hackathon category
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">3. Generate Stats</h4>
                  <p className="text-sm text-muted-foreground">
                    Creates comprehensive stats including technical skills, innovation score,
                    hackathon experience, and specialty skills (AI/ML, FinTech, Blockchain, etc.)
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">4. Update Database</h4>
                  <p className="text-sm text-muted-foreground">
                    Stores individual hacker stats and calculates team aggregates for betting lines
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

export default AnalyzeGitHubStats;

