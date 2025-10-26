import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Pencil, Linkedin, Github, Globe, Mail, Trophy, Target, TrendingUp, Award, Eye, Users, MapPin, ArrowRight, RefreshCw, ExternalLink, Code } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/EmptyState";

function MyProfile() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [fullProfile, setFullProfile] = useState<any>(null);
  const [isImportingLinkedIn, setIsImportingLinkedIn] = useState(false);
  const [linkedinUrlInput, setLinkedinUrlInput] = useState("");
  const [showLinkedInImport, setShowLinkedInImport] = useState(false);
  const [githubUsernameInput, setGithubUsernameInput] = useState("");
  const [showGitHubImport, setShowGitHubImport] = useState(false);
  const [isResyncing, setIsResyncing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchFullProfile();
  }, [user]);

  const fetchFullProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setFullProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const importLinkedInProfile = async (linkedinUrl: string) => {
    console.log('=== IMPORTING LINKEDIN PROFILE ===');
    console.log('LinkedIn URL:', linkedinUrl);
    
    try {
      const response = await supabase.functions.invoke('import-linkedin-profile', {
        body: { 
          linkedinUrl
        },
      });

      console.log('Clado API response:', response);
      console.log('Full response data:', JSON.stringify(response.data, null, 2));

      if (response.error) {
        console.error('Clado API error:', response.error);
        toast.error("Failed to import LinkedIn profile: " + (response.error.message || 'Unknown error'));
        return;
      }

      if (response.data?.profile) {
        console.log('Profile data received from Clado:', response.data.profile);
        console.log('Profile data as JSON:', JSON.stringify(response.data.profile, null, 2));
        
        // Check if we got meaningful data
        const profileData = response.data.profile;
        const hasMeaningfulData = profileData.bio || 
                                 profileData.headline || 
                                 profileData.location || 
                                 (profileData.experience && profileData.experience.length > 0) ||
                                 (profileData.education && profileData.education.length > 0) ||
                                 (profileData.skills && profileData.skills.length > 0);

        if (hasMeaningfulData) {
          console.log('Updating profile with LinkedIn data');
          
          // Update profile with structured data - DO NOT update username or email
          const updateData: any = {};
          
          // Only update profile data fields, NOT username/email
          if (profileData.bio) updateData.bio = profileData.bio;
          if (profileData.headline) updateData.headline = profileData.headline;
          if (profileData.location) updateData.location = profileData.location;
          // Save the LinkedIn URL that was provided/imported
          updateData.linkedin_url = linkedinUrl;
          if (profileData.portfolio_url) updateData.portfolio_url = profileData.portfolio_url;
          if (profileData.skills && profileData.skills.length > 0) updateData.skills = profileData.skills;
          if (profileData.experience && profileData.experience.length > 0) updateData.experience = profileData.experience;
          if (profileData.education && profileData.education.length > 0) updateData.education = profileData.education;
          if (profileData.years_of_experience) updateData.years_of_experience = profileData.years_of_experience;
          if (profileData.certifications && profileData.certifications.length > 0) updateData.certifications = profileData.certifications;
          
          console.log('Updating profile with structured data:', updateData);
          
          const { error: updateError } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', user.id);
          
          if (updateError) {
            console.error('Error updating profile:', updateError);
            toast.error("Failed to save profile data");
          } else {
            console.log('Profile updated successfully with structured data');
            toast.success("LinkedIn profile imported successfully!");
            
            // Refresh profile data
            await fetchFullProfile();
          }
        } else {
          console.log('Clado returned empty data - no meaningful profile information found');
          toast.error('Could not find LinkedIn profile information. Please check if your LinkedIn profile is public.');
        }
      } else {
        console.log('No profile data in response');
        toast.error('No profile data returned from LinkedIn import');
      }
    } catch (error) {
      console.error('Error importing LinkedIn profile:', error);
      toast.error("Failed to import LinkedIn profile");
    }
  };

  const resyncAllProfiles = async () => {
    setIsResyncing(true);
    toast.loading("Resyncing LinkedIn and GitHub profiles...");

    try {
      const updates: any = {};

      // Resync LinkedIn if URL exists
      if (fullProfile.linkedin_url) {
        toast.loading("Importing LinkedIn data...", { id: 'linkedin-sync' });
        const linkedInResponse = await supabase.functions.invoke('import-linkedin-profile', {
          body: { linkedinUrl: fullProfile.linkedin_url }
        });

        if (linkedInResponse.data?.profile) {
          const profileData = linkedInResponse.data.profile;
          
          // Only update profile data fields - DO NOT change username/email
          if (profileData.bio) updates.bio = profileData.bio;
          if (profileData.headline) updates.headline = profileData.headline;
          if (profileData.location) updates.location = profileData.location;
          if (profileData.portfolio_url) updates.portfolio_url = profileData.portfolio_url;
          if (profileData.skills && profileData.skills.length > 0) updates.skills = profileData.skills;
          if (profileData.experience && profileData.experience.length > 0) updates.experience = profileData.experience;
          if (profileData.education && profileData.education.length > 0) updates.education = profileData.education;
          if (profileData.years_of_experience) updates.years_of_experience = profileData.years_of_experience;
          if (profileData.certifications && profileData.certifications.length > 0) updates.certifications = profileData.certifications;
        }
        toast.success("LinkedIn data synced!", { id: 'linkedin-sync' });
      }

      // Resync GitHub if URL exists
      if (fullProfile.github_url) {
        toast.loading("Importing GitHub projects...", { id: 'github-sync' });
        
        try {
          // Extract username from GitHub URL
          const githubUsername = fullProfile.github_url.replace('https://github.com/', '').replace('github.com/', '').split('/')[0];
          
          console.log('Extracted GitHub username:', githubUsername);
          
          if (githubUsername) {
            // Fetch GitHub repos
            const reposResponse = await fetch(`https://api.github.com/users/${githubUsername}/repos?per_page=10&sort=updated`, {
              headers: { 'User-Agent': 'HackCast-LIVE' }
            });

            console.log('GitHub API response status:', reposResponse.status);

            if (reposResponse.ok) {
              const repos = await reposResponse.json();
              
              console.log('Fetched repos count:', repos.length);
              
              // Convert GitHub repos to projects format
              const projects = repos.map((repo: any) => ({
                title: repo.name,
                description: repo.description || '',
                url: repo.html_url
              }));

              console.log('Converted projects:', projects);

              if (projects.length > 0) {
                updates.projects = projects;
                console.log('Added projects to updates:', projects);
              }
            } else {
              console.error('GitHub API failed:', reposResponse.status, reposResponse.statusText);
            }
          }
        } catch (githubError) {
          console.error('Error fetching GitHub repos:', githubError);
        }
        
        toast.success("GitHub projects synced!", { id: 'github-sync' });
      }

      // Save all updates to database
      console.log('All updates to save:', updates);
      console.log('Updates keys:', Object.keys(updates));
      
      if (Object.keys(updates).length > 0) {
        console.log('Updating user profile with:', updates);
        const { error: updateError } = await supabase
          .from('users')
          .update(updates)
          .eq('id', user!.id);

        if (updateError) {
          console.error('Database update error:', updateError);
          throw updateError;
        }

        console.log('Profile updated successfully');
        toast.success("Profile resynced successfully!");
        await fetchFullProfile();
      } else {
        console.log('No updates to save');
        toast.info("No new data to sync");
      }
    } catch (error) {
      console.error('Error resyncing profiles:', error);
      toast.error("Failed to resync profiles");
    } finally {
      setIsResyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 p-8">
          <Header />
          <Skeleton className="h-64 w-full mb-8" />
          <Skeleton className="h-96 w-full" />
        </main>
      </div>
    );
  }

  if (!fullProfile) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 p-8">
          <Header />
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Profile Loading...</h1>
            <p className="text-muted-foreground">Please wait while we load your profile data.</p>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8">
        <Header />
        
        <div className="container max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Profile</h1>
        {(fullProfile.linkedin_url || fullProfile.github_url) && (
          <Button
            onClick={resyncAllProfiles}
            disabled={isResyncing}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isResyncing ? 'animate-spin' : ''}`} />
            {isResyncing ? "Resyncing..." : "Resync All Profiles"}
          </Button>
        )}
      </div>
      
      {/* Profile Card */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Avatar Section */}
          <div className="flex flex-col items-center lg:items-start gap-4">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {fullProfile.username?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <Button onClick={() => navigate("/profile/edit")} size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
          
          {/* Profile Info */}
          <div className="flex-1 space-y-4 min-w-0">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{fullProfile.username}</h2>
              {fullProfile.headline && (
                <p className="text-lg text-muted-foreground mt-2">{fullProfile.headline}</p>
              )}
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                {fullProfile.location && (
                  <span className="flex items-center gap-2">
                    📍 {fullProfile.location}
                  </span>
                )}
                {fullProfile.years_of_experience && (
                  <span className="flex items-center gap-2">
                    🏆 {fullProfile.years_of_experience} years experience
                  </span>
                )}
              </div>
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap gap-2">
              {fullProfile.linkedin_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={fullProfile.linkedin_url} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4 mr-2" />
                    LinkedIn
                  </a>
                </Button>
              )}
              {fullProfile.github_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={fullProfile.github_url} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4 mr-2" />
                    GitHub
                  </a>
                </Button>
              )}
              {fullProfile.portfolio_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={fullProfile.portfolio_url} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4 mr-2" />
                    Portfolio
                  </a>
                </Button>
              )}
              {fullProfile.email && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`mailto:${fullProfile.email}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </a>
                </Button>
              )}
            </div>

            {/* Import GitHub Profile */}
            {!fullProfile.github_url && (
              <div className="pt-4 border-t">
                {!showGitHubImport ? (
                  <>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setShowGitHubImport(true)}
                    >
                      <Github className="h-4 w-4 mr-2" />
                      Import GitHub Profile
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Import your repositories and technical activity from GitHub
                    </p>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="github-username-input">GitHub Username</Label>
                    <Input
                      id="github-username-input"
                      type="text"
                      placeholder="your-username"
                      value={githubUsernameInput}
                      onChange={(e) => setGithubUsernameInput(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={async () => {
                          if (!githubUsernameInput) {
                            toast.error("Please enter a GitHub username");
                            return;
                          }
                          try {
                            // Save GitHub URL to profile
                            const { error } = await supabase
                              .from('users')
                              .update({ github_url: `https://github.com/${githubUsernameInput}` })
                              .eq('id', user!.id);
                            
                            if (error) throw error;
                            
                            toast.success("GitHub profile connected!");
                            setShowGitHubImport(false);
                            setGithubUsernameInput("");
                            await fetchFullProfile();
                          } catch (error) {
                            console.error('Error connecting GitHub:', error);
                            toast.error("Failed to connect GitHub profile");
                          }
                        }}
                        disabled={!githubUsernameInput}
                      >
                        Connect
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowGitHubImport(false);
                          setGithubUsernameInput("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Import LinkedIn Profile */}
            {!fullProfile.linkedin_url && (
              <div className="pt-4 border-t">
                {!showLinkedInImport ? (
                  <>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setShowLinkedInImport(true)}
                    >
                      <Linkedin className="h-4 w-4 mr-2" />
                      Import LinkedIn Profile
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Import your experience, education, and skills from LinkedIn
                    </p>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="linkedin-url-input">LinkedIn Profile URL</Label>
                    <Input
                      id="linkedin-url-input"
                      type="url"
                      placeholder="https://linkedin.com/in/your-profile"
                      value={linkedinUrlInput}
                      onChange={(e) => setLinkedinUrlInput(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={async () => {
                          if (!linkedinUrlInput) {
                            toast.error("Please enter a LinkedIn URL");
                            return;
                          }
                          setIsImportingLinkedIn(true);
                          try {
                            await importLinkedInProfile(linkedinUrlInput);
                          } finally {
                            setIsImportingLinkedIn(false);
                          }
                        }}
                        disabled={isImportingLinkedIn || !linkedinUrlInput}
                      >
                        {isImportingLinkedIn ? "Importing..." : "Import"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowLinkedInImport(false);
                          setLinkedinUrlInput("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Bio Section */}
      {fullProfile.bio && (
        <Card className="p-6 border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <div className="h-8 w-1.5 bg-primary rounded-full" />
            <span className="bg-primary text-background px-4 py-1 rounded">About</span>
          </h3>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{fullProfile.bio}</p>
        </Card>
      )}

      {/* Experience Section */}
      {fullProfile.experience && (
        <Card className="p-6 border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <div className="h-8 w-1.5 bg-primary rounded-full" />
            <span className="bg-primary text-background px-4 py-1 rounded">Experience & Education</span>
          </h3>
          <div className="space-y-6">
            {/* Work Experience */}
            {Array.isArray(fullProfile.experience) && fullProfile.experience.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-primary mb-4 flex items-center gap-2 uppercase tracking-wide">
                  <Award className="h-5 w-5" />
                  <span className="border-b-2 border-primary/50 pb-1">Professional History</span>
                </h4>
                <div className="space-y-4">
                  {fullProfile.experience.map((exp: any, expIndex: number) => (
                    <div key={expIndex} className="group relative p-5 border-l-4 border-primary/50 hover:border-primary bg-gradient-to-r from-muted/40 to-transparent hover:from-primary/10 rounded-r-lg transition-all duration-300 hover:shadow-lg">
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      <h5 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{exp.title || 'Position'}</h5>
                      <p className="text-sm font-semibold text-foreground mt-1">{exp.company || 'Company'}</p>
                      {(exp.startDate || exp.endDate) && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <span className="inline-block w-2 h-2 rounded-full bg-primary/60" />
                          {exp.startDate} - {exp.endDate || 'Present'}
                        </p>
                      )}
                      {exp.description && (
                        <p className="text-sm mt-3 leading-relaxed text-muted-foreground">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Education */}
            {Array.isArray(fullProfile.education) && fullProfile.education.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-primary mb-4 flex items-center gap-2 uppercase tracking-wide">
                  <Trophy className="h-5 w-5" />
                  <span className="border-b-2 border-primary/50 pb-1">Education</span>
                </h4>
                <div className="space-y-4">
                  {fullProfile.education.map((edu: any, eduIndex: number) => (
                    <div key={eduIndex} className="group relative p-5 border-l-4 border-primary/50 hover:border-primary bg-gradient-to-r from-muted/40 to-transparent hover:from-primary/10 rounded-r-lg transition-all duration-300 hover:shadow-lg">
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      <h5 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{edu.degree || 'Degree'}</h5>
                      <p className="text-sm font-semibold text-foreground mt-1">{edu.institution || 'Institution'}</p>
                      {edu.year && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <span className="inline-block w-2 h-2 rounded-full bg-primary/60" />
                          {edu.year}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Skills */}
            {Array.isArray(fullProfile.skills) && fullProfile.skills.length > 0 && (
              <div className="p-5 bg-gradient-to-r from-muted/40 to-transparent border border-primary/20 rounded-lg">
                <h4 className="text-lg font-bold text-primary mb-4 flex items-center gap-2 uppercase tracking-wide">
                  <Target className="h-5 w-5" />
                  <span className="border-b-2 border-primary/50 pb-1">Skills</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {fullProfile.skills.map((skill: any, skillIndex: number) => (
                    <Badge
                      key={skillIndex}
                      variant="secondary"
                      className="px-4 py-1.5 text-sm font-medium bg-primary/20 hover:bg-primary/30 border border-primary/30 hover:border-primary/50 transition-all duration-300 hover:scale-105"
                    >
                      {typeof skill === 'string' ? skill : skill.name || skill.skill || skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Fallback for string experience data */}
            {typeof fullProfile.experience === 'string' && (
              <div className="space-y-4">
                {fullProfile.experience.split('\n\n').map((section: string, sectionIndex: number) => {
                  const cleanSection = section.trim();
                  if (!cleanSection) return null;
                  
                  return (
                    <div key={sectionIndex} className="p-4 bg-muted/30 rounded-lg">
                      <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {cleanSection}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Projects Section */}
      {fullProfile.projects && Array.isArray(fullProfile.projects) && fullProfile.projects.length > 0 && (
        <Card className="p-6 border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <div className="h-8 w-1.5 bg-primary rounded-full" />
            <span className="bg-primary text-background px-4 py-1 rounded">Projects</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fullProfile.projects.map((project: any, projectIndex: number) => (
              <Card 
                key={projectIndex} 
                className="p-6 hover:border-primary transition-all duration-300 group cursor-pointer"
                onClick={() => project.url && window.open(project.url, '_blank')}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Code className="w-5 h-5 text-primary" />
                    </div>
                    <h5 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                      {project.title || 'Untitled Project'}
                    </h5>
                  </div>
                  {project.url && (
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                </div>
                {project.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                    {project.description}
                  </p>
                )}
                {project.url && (
                  <a 
                    href={project.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Project
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">{fullProfile.xp || 0}</div>
          <div className="text-sm text-muted-foreground">Total XP</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">${fullProfile.wallet_balance || 0}</div>
          <div className="text-sm text-muted-foreground">Wallet Balance</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">{fullProfile.total_predictions || 0}</div>
          <div className="text-sm text-muted-foreground">Total Predictions</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">
            {fullProfile.total_predictions > 0
              ? ((fullProfile.correct_predictions / fullProfile.total_predictions) * 100).toFixed(1)
              : "0.0"}%
          </div>
          <div className="text-sm text-muted-foreground">Accuracy Rate</div>
        </Card>
      </div>
        </div>
      </main>
    </div>
  );
}

export default MyProfile;