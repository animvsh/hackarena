import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Github, ExternalLink, Trophy, Code, Users } from "lucide-react";
import { toast } from "sonner";
import { extractHackerProfile } from "@/lib/modern-profile-extractor";

interface ProfileSetupFormProps {
  onProfileCreated: (profile: any) => void;
  onCancel: () => void;
}

export const ProfileSetupForm = ({ onProfileCreated, onCancel }: ProfileSetupFormProps) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    // Basic Info
    name: "",
    email: "",
    location: "",
    
    // Professional Info
    current_company: "",
    current_title: "",
    years_experience: 0,
    seniority_level: "mid" as "junior" | "mid" | "senior" | "staff" | "principal",
    
    // Platform Usernames
    github_username: "",
    devpost_username: "",
    hackerrank_username: "",
    stackoverflow_user_id: "",
    portfolio_url: "",
    
    // Manual Skills
    skills: [] as string[],
    hackathon_history: [] as Array<{
      name: string;
      date: string;
      placement?: number;
      category: string;
    }>,
    
    // Additional Info
    bio: "",
    interests: [] as string[],
  });

  const [newSkill, setNewSkill] = useState("");
  const [newHackathon, setNewHackathon] = useState({
    name: "",
    date: "",
    placement: "",
    category: ""
  });

  const steps = [
    { title: "Basic Info", description: "Name and contact information" },
    { title: "Professional", description: "Work experience and role" },
    { title: "Platforms", description: "GitHub, Devpost, and other profiles" },
    { title: "Skills & History", description: "Technical skills and hackathon experience" },
    { title: "Review", description: "Confirm and create profile" }
  ];

  const handleNext = () => {
    if (step < steps.length) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addHackathon = () => {
    if (newHackathon.name.trim()) {
      setProfileData(prev => ({
        ...prev,
        hackathon_history: [...prev.hackathon_history, {
          name: newHackathon.name.trim(),
          date: newHackathon.date,
          placement: newHackathon.placement ? parseInt(newHackathon.placement) : undefined,
          category: newHackathon.category.trim()
        }]
      }));
      setNewHackathon({ name: "", date: "", placement: "", category: "" });
    }
  };

  const removeHackathon = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      hackathon_history: prev.hackathon_history.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Extract data from platforms
      const extractedProfile = await extractHackerProfile({
        name: profileData.name,
        github_username: profileData.github_username || undefined,
        devpost_username: profileData.devpost_username || undefined,
        hackerrank_username: profileData.hackerrank_username || undefined,
        stackoverflow_user_id: profileData.stackoverflow_user_id || undefined,
        portfolio_url: profileData.portfolio_url || undefined,
        manual_data: {
          email: profileData.email,
          location: profileData.location,
          current_company: profileData.current_company,
          current_title: profileData.current_title,
          years_experience: profileData.years_experience,
          seniority_level: profileData.seniority_level,
          skills: profileData.skills,
          hackathon_history: profileData.hackathon_history,
          bio: profileData.bio,
          interests: profileData.interests
        }
      });

      toast.success("Profile created successfully!");
      onProfileCreated(extractedProfile);
    } catch (error) {
      console.error('Profile creation error:', error);
      toast.error("Failed to create profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your.email@example.com"
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={profileData.location}
                onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="City, Country"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="company">Current Company</Label>
              <Input
                id="company"
                value={profileData.current_company}
                onChange={(e) => setProfileData(prev => ({ ...prev, current_company: e.target.value }))}
                placeholder="Google, Microsoft, Startup Inc..."
              />
            </div>
            <div>
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={profileData.current_title}
                onChange={(e) => setProfileData(prev => ({ ...prev, current_title: e.target.value }))}
                placeholder="Software Engineer, Product Manager..."
              />
            </div>
            <div>
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                value={profileData.years_experience}
                onChange={(e) => setProfileData(prev => ({ ...prev, years_experience: parseInt(e.target.value) || 0 }))}
                placeholder="5"
                min="0"
                max="50"
              />
            </div>
            <div>
              <Label htmlFor="seniority">Seniority Level</Label>
              <Select value={profileData.seniority_level} onValueChange={(value: any) => setProfileData(prev => ({ ...prev, seniority_level: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select seniority level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="junior">Junior</SelectItem>
                  <SelectItem value="mid">Mid-Level</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="principal">Principal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="github">GitHub Username</Label>
              <div className="flex gap-2">
                <Github className="w-4 h-4 mt-3 text-muted-foreground" />
                <Input
                  id="github"
                  value={profileData.github_username}
                  onChange={(e) => setProfileData(prev => ({ ...prev, github_username: e.target.value }))}
                  placeholder="username"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                We'll analyze your repositories, languages, and contribution activity
              </p>
            </div>
            <div>
              <Label htmlFor="devpost">Devpost Username</Label>
              <div className="flex gap-2">
                <Trophy className="w-4 h-4 mt-3 text-muted-foreground" />
                <Input
                  id="devpost"
                  value={profileData.devpost_username}
                  onChange={(e) => setProfileData(prev => ({ ...prev, devpost_username: e.target.value }))}
                  placeholder="username"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                We'll track your hackathon participation and wins
              </p>
            </div>
            <div>
              <Label htmlFor="hackerrank">HackerRank Username</Label>
              <div className="flex gap-2">
                <Code className="w-4 h-4 mt-3 text-muted-foreground" />
                <Input
                  id="hackerrank"
                  value={profileData.hackerrank_username}
                  onChange={(e) => setProfileData(prev => ({ ...prev, hackerrank_username: e.target.value }))}
                  placeholder="username"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="stackoverflow">Stack Overflow User ID</Label>
              <div className="flex gap-2">
                <Users className="w-4 h-4 mt-3 text-muted-foreground" />
                <Input
                  id="stackoverflow"
                  value={profileData.stackoverflow_user_id}
                  onChange={(e) => setProfileData(prev => ({ ...prev, stackoverflow_user_id: e.target.value }))}
                  placeholder="123456"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="portfolio">Portfolio Website</Label>
              <div className="flex gap-2">
                <ExternalLink className="w-4 h-4 mt-3 text-muted-foreground" />
                <Input
                  id="portfolio"
                  value={profileData.portfolio_url}
                  onChange={(e) => setProfileData(prev => ({ ...prev, portfolio_url: e.target.value }))}
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Skills */}
            <div>
              <Label>Technical Skills</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill (e.g., React, Python, Machine Learning)"
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                />
                <Button onClick={addSkill} variant="outline">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {profileData.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(skill)}>
                    {skill} ×
                  </Badge>
                ))}
              </div>
            </div>

            {/* Hackathon History */}
            <div>
              <Label>Hackathon History</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Input
                  value={newHackathon.name}
                  onChange={(e) => setNewHackathon(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Hackathon name"
                />
                <Input
                  value={newHackathon.date}
                  onChange={(e) => setNewHackathon(prev => ({ ...prev, date: e.target.value }))}
                  placeholder="Date (YYYY-MM-DD)"
                />
                <Input
                  value={newHackathon.placement}
                  onChange={(e) => setNewHackathon(prev => ({ ...prev, placement: e.target.value }))}
                  placeholder="Placement (1, 2, 3...)"
                />
                <Input
                  value={newHackathon.category}
                  onChange={(e) => setNewHackathon(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Category (AI, FinTech, etc.)"
                />
              </div>
              <Button onClick={addHackathon} variant="outline" className="mt-2">Add Hackathon</Button>
              
              <div className="mt-4 space-y-2">
                {profileData.hackathon_history.map((hackathon, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-background rounded">
                    <div>
                      <p className="font-medium">{hackathon.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {hackathon.date} • {hackathon.category}
                        {hackathon.placement && ` • ${hackathon.placement}${hackathon.placement === 1 ? 'st' : hackathon.placement === 2 ? 'nd' : hackathon.placement === 3 ? 'rd' : 'th'} place`}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeHackathon(index)}>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself, your interests, and what you're passionate about..."
                rows={4}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Review Your Profile</h3>
              <p className="text-muted-foreground">Confirm your information before creating your hacker profile</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Basic Information</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Name:</strong> {profileData.name}</p>
                  <p><strong>Email:</strong> {profileData.email || 'Not provided'}</p>
                  <p><strong>Location:</strong> {profileData.location || 'Not provided'}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Professional</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Company:</strong> {profileData.current_company || 'Not provided'}</p>
                  <p><strong>Title:</strong> {profileData.current_title || 'Not provided'}</p>
                  <p><strong>Experience:</strong> {profileData.years_experience} years</p>
                  <p><strong>Level:</strong> {profileData.seniority_level}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Platform Profiles</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {profileData.github_username && <p>GitHub: {profileData.github_username}</p>}
                {profileData.devpost_username && <p>Devpost: {profileData.devpost_username}</p>}
                {profileData.hackerrank_username && <p>HackerRank: {profileData.hackerrank_username}</p>}
                {profileData.stackoverflow_user_id && <p>Stack Overflow: {profileData.stackoverflow_user_id}</p>}
                {profileData.portfolio_url && <p>Portfolio: {profileData.portfolio_url}</p>}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Skills ({profileData.skills.length})</h4>
              <div className="flex flex-wrap gap-1">
                {profileData.skills.map((skill, index) => (
                  <Badge key={index} variant="outline">{skill}</Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Hackathon History ({profileData.hackathon_history.length})</h4>
              <div className="space-y-1">
                {profileData.hackathon_history.map((hackathon, index) => (
                  <p key={index} className="text-sm">
                    {hackathon.name} ({hackathon.date}) - {hackathon.category}
                    {hackathon.placement && ` - ${hackathon.placement}${hackathon.placement === 1 ? 'st' : hackathon.placement === 2 ? 'nd' : hackathon.placement === 3 ? 'rd' : 'th'} place`}
                  </p>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Step {step} of {steps.length}</span>
          <span>{Math.round((step / steps.length) * 100)}%</span>
        </div>
        <Progress value={(step / steps.length) * 100} className="h-2" />
        <h2 className="text-xl font-semibold mt-2">{steps[step - 1].title}</h2>
        <p className="text-sm text-muted-foreground">{steps[step - 1].description}</p>
      </div>

      {/* Step Content */}
      <div className="mb-6">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePrevious} disabled={step === 1}>
          Previous
        </Button>
        
        {step < steps.length ? (
          <Button onClick={handleNext} disabled={step === 1 && !profileData.name.trim()}>
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating Profile..." : "Create Profile"}
          </Button>
        )}
      </div>

      <div className="mt-4 text-center">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Card>
  );
};


