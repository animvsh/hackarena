import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { HackathonHeader } from "@/components/HackathonHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Code, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TECH_OPTIONS = [
  "React", "Python", "Node.js", "TypeScript", "Machine Learning", 
  "Blockchain", "Mobile", "Web3", "AI", "Cloud", "DevOps"
];

const CATEGORY_OPTIONS = [
  "FinTech", "HealthTech", "EdTech", "Social Impact", "Gaming", 
  "Developer Tools", "E-commerce", "AI/ML", "Blockchain", "Other"
];

const HackathonTeamSetup = () => {
  const { hackathonId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<'choice' | 'create' | 'join'>('choice');
  const [loading, setLoading] = useState(false);

  // Create team state
  const [teamName, setTeamName] = useState("");
  const [tagline, setTagline] = useState("");
  const [category, setCategory] = useState<string[]>([]);
  const [techStack, setTechStack] = useState<string[]>([]);
  const [githubRepo, setGithubRepo] = useState("");
  const [devpostUrl, setDevpostUrl] = useState("");

  // Join team state
  const [inviteCode, setInviteCode] = useState("");

  const toggleTag = (tag: string, currentTags: string[], setter: (tags: string[]) => void) => {
    if (currentTags.includes(tag)) {
      setter(currentTags.filter(t => t !== tag));
    } else {
      setter([...currentTags, tag]);
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName || !tagline || category.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in team name, tagline, and select at least one category",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke('create-team', {
        body: {
          teamName,
          tagline,
          projectDescription: tagline,
          industryTags: category,
          techStack,
          stage: 'hackathon',
          teamSize: 4,
          userId: user.id,
          hackathonId
        }
      });

      if (error) throw error;

      toast({
        title: "Team Created!",
        description: `Your team "${teamName}" has been created. Share your invite code: ${data.inviteCode}`,
      });

      navigate(`/teams/${data.team.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!inviteCode) {
      toast({
        title: "Missing Code",
        description: "Please enter an invite code",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke('join-team', {
        body: { inviteCode, userId: user.id }
      });

      if (error) throw error;

      toast({
        title: "Joined Team!",
        description: `You've successfully joined ${data.team.name}`,
      });

      navigate(`/teams/${data.team.id}`);
    } catch (error: any) {
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
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <Header />
        
        {hackathonId && <HackathonHeader hackathonId={hackathonId} />}

        <div className="max-w-3xl mx-auto mt-8">
          {mode === 'choice' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Join the Competition</h1>
                <p className="text-muted-foreground">
                  Create a new team or join an existing one
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setMode('create')}>
                  <CardHeader>
                    <Trophy className="w-12 h-12 text-primary mb-4" />
                    <CardTitle>Create New Team</CardTitle>
                    <CardDescription>
                      Start fresh with your own team and invite members
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">Create Team</Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setMode('join')}>
                  <CardHeader>
                    <Users className="w-12 h-12 text-primary mb-4" />
                    <CardTitle>Join Existing Team</CardTitle>
                    <CardDescription>
                      Enter an invite code to join a team
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">Join Team</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {mode === 'join' && (
            <Card>
              <CardHeader>
                <CardTitle>Join Team with Invite Code</CardTitle>
                <CardDescription>
                  Enter the invite code shared by your team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="inviteCode">Invite Code</Label>
                  <Input
                    id="inviteCode"
                    placeholder="hc_live_..."
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                  />
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setMode('choice')} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleJoinTeam} disabled={loading} className="flex-1">
                    {loading ? "Joining..." : "Join Team"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {mode === 'create' && (
            <Card>
              <CardHeader>
                <CardTitle>Create Your Team</CardTitle>
                <CardDescription>
                  Set up your hackathon team and get your invite code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="teamName">Team Name *</Label>
                  <Input
                    id="teamName"
                    placeholder="Enter your team name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="tagline">Tagline *</Label>
                  <Textarea
                    id="tagline"
                    placeholder="Describe your team in one sentence"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Category *</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {CATEGORY_OPTIONS.map(cat => (
                      <Badge
                        key={cat}
                        variant={category.includes(cat) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleTag(cat, category, setCategory)}
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Tech Stack</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {TECH_OPTIONS.map(tech => (
                      <Badge
                        key={tech}
                        variant={techStack.includes(tech) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleTag(tech, techStack, setTechStack)}
                      >
                        <Code className="w-3 h-3 mr-1" />
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="githubRepo">GitHub Repository (Optional)</Label>
                  <Input
                    id="githubRepo"
                    placeholder="https://github.com/..."
                    value={githubRepo}
                    onChange={(e) => setGithubRepo(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="devpostUrl">Devpost URL (Optional)</Label>
                  <Input
                    id="devpostUrl"
                    placeholder="https://devpost.com/..."
                    value={devpostUrl}
                    onChange={(e) => setDevpostUrl(e.target.value)}
                  />
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setMode('choice')} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleCreateTeam} disabled={loading} className="flex-1">
                    {loading ? "Creating..." : "Create Team"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default HackathonTeamSetup;
