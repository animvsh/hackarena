import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Upload, Linkedin, Github, FileText, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ResumeUploader } from "./ResumeUploader";
import { ProfilePreview } from "./ProfilePreview";

interface ProfileData {
  name?: string;
  email?: string;
  bio?: string;
  skills?: Array<{ name: string; level: string }>;
  experience?: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    description: string;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
}

interface ProfileImportProps {
  onComplete: (data: ProfileData, source: string) => void;
}

export const ProfileImport = ({ onComplete }: ProfileImportProps) => {
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUsername, setGithubUsername] = useState("");

  const handleResumeUpload = async (file: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('parse-resume', {
        body: formData,
      });

      if (error) throw error;

      setProfileData(data.profile);
      toast.success("Resume parsed successfully!");
    } catch (error) {
      console.error('Error parsing resume:', error);
      toast.error("Failed to parse resume. Please try manual entry.");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkedinImport = async () => {
    if (!linkedinUrl) {
      toast.error("Please enter a LinkedIn URL");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('import-linkedin-profile', {
        body: { linkedinUrl },
      });

      if (error) throw error;

      setProfileData(data.profile);
      toast.success("LinkedIn profile imported successfully!");
    } catch (error) {
      console.error('Error importing LinkedIn profile:', error);
      toast.error("Failed to import LinkedIn profile. Please try resume upload instead.");
    } finally {
      setLoading(false);
    }
  };

  const handleGithubImport = async () => {
    if (!githubUsername) {
      toast.error("Please enter a GitHub username");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://api.github.com/users/${githubUsername}`);
      const data = await response.json();

      setProfileData({
        name: data.name || githubUsername,
        bio: data.bio || "",
        github_url: data.html_url,
        portfolio_url: data.blog || "",
      });

      toast.success("GitHub profile imported!");
    } catch (error) {
      console.error('Error fetching GitHub profile:', error);
      toast.error("Failed to import GitHub profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkedInOAuth = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${window.location.origin}/auth/callback/linkedin`,
          scopes: 'openid profile email',
        },
      });

      if (error) throw error;

      toast.info('Redirecting to LinkedIn for verification...');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to connect to LinkedIn: ${errorMessage}`);
      setLoading(false);
    }
  };

  const handleConfirm = (source: string) => {
    if (profileData) {
      onComplete(profileData, source);
    }
  };

  if (profileData) {
    return (
      <ProfilePreview
        data={profileData}
        onConfirm={handleConfirm}
        onEdit={setProfileData}
        onBack={() => setProfileData(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Import Your Profile</h2>
        <p className="text-muted-foreground">
          Please import your profile to continue
        </p>
        <p className="text-sm text-primary font-medium">
          This step is required to create your account
        </p>
      </div>

      <Tabs defaultValue="resume" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="resume">Resume</TabsTrigger>
          <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
          <TabsTrigger value="github">GitHub</TabsTrigger>
        </TabsList>

        <TabsContent value="resume" className="space-y-4">
          <Card className="p-6">
            <ResumeUploader onUpload={handleResumeUpload} loading={loading} />
          </Card>
        </TabsContent>

        <TabsContent value="linkedin" className="space-y-4">
          <Card className="p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Linkedin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Import from LinkedIn</h3>
                <p className="text-sm text-muted-foreground">
                  Choose how to import your profile
                </p>
              </div>
            </div>

            {/* Recommended: OAuth Verification */}
            <div className="space-y-3 p-4 border-2 border-primary/20 rounded-lg bg-primary/5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm">Verify with LinkedIn</h4>
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Securely connect and auto-import your profile data
                  </p>
                </div>
              </div>
              <Button
                onClick={handleLinkedInOAuth}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                <ShieldCheck className="w-4 h-4 mr-2" />
                {loading ? "Connecting..." : "Connect & Verify LinkedIn"}
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or import manually
                </span>
              </div>
            </div>

            {/* Alternative: Manual URL Import */}
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
                <Input
                  id="linkedin"
                  type="url"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                />
              </div>

              <Button
                onClick={handleLinkedinImport}
                disabled={loading || !linkedinUrl}
                variant="outline"
                className="w-full"
              >
                {loading ? "Importing..." : "Import from URL"}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="github" className="space-y-4">
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Github className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Import from GitHub</h3>
                <p className="text-sm text-muted-foreground">
                  Enter your GitHub username
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="github">GitHub Username</Label>
              <Input
                id="github"
                placeholder="yourusername"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
              />
            </div>

            <Button
              onClick={handleGithubImport}
              disabled={loading || !githubUsername}
              className="w-full"
            >
              {loading ? "Importing..." : "Import from GitHub"}
            </Button>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
};