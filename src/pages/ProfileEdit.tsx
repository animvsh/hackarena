import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { calculateProfileCompleteness } from '@/lib/profileCompleteness';
import { Progress } from '@/components/ui/progress';

export default function ProfileEdit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>({});
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setProfile({
        ...data,
        skills: data.skills || [],
        experience: data.experience || [],
        education: data.education || [],
        certifications: data.certifications || [],
        projects: data.projects || [],
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const completeness = calculateProfileCompleteness(profile);

      const { error } = await supabase
        .from('users')
        .update({
          headline: profile.headline,
          location: profile.location,
          bio: profile.bio,
          years_of_experience: profile.years_of_experience,
          skills: profile.skills,
          experience: profile.experience,
          education: profile.education,
          certifications: profile.certifications,
          projects: profile.projects,
          portfolio_url: profile.portfolio_url,
          profile_completeness: completeness,
        })
        .eq('id', user!.id);

      if (error) throw error;

      toast.success('Profile updated successfully');
      navigate('/profile');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    setProfile({
      ...profile,
      skills: [...profile.skills, { name: newSkill.trim() }],
    });
    setNewSkill('');
  };

  const removeSkill = (index: number) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter((_: any, i: number) => i !== index),
    });
  };

  const addExperience = () => {
    setProfile({
      ...profile,
      experience: [
        ...profile.experience,
        { title: '', company: '', startDate: '', endDate: '', description: '' },
      ],
    });
  };

  const updateExperience = (index: number, field: string, value: string) => {
    const updated = [...profile.experience];
    updated[index] = { ...updated[index], [field]: value };
    setProfile({ ...profile, experience: updated });
  };

  const removeExperience = (index: number) => {
    setProfile({
      ...profile,
      experience: profile.experience.filter((_: any, i: number) => i !== index),
    });
  };

  const addEducation = () => {
    setProfile({
      ...profile,
      education: [
        ...profile.education,
        { degree: '', institution: '', year: '' },
      ],
    });
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const updated = [...profile.education];
    updated[index] = { ...updated[index], [field]: value };
    setProfile({ ...profile, education: updated });
  };

  const removeEducation = (index: number) => {
    setProfile({
      ...profile,
      education: profile.education.filter((_: any, i: number) => i !== index),
    });
  };

  const addCertification = () => {
    setProfile({
      ...profile,
      certifications: [
        ...profile.certifications,
        { name: '', issuer: '', date: '' },
      ],
    });
  };

  const updateCertification = (index: number, field: string, value: string) => {
    const updated = [...profile.certifications];
    updated[index] = { ...updated[index], [field]: value };
    setProfile({ ...profile, certifications: updated });
  };

  const removeCertification = (index: number) => {
    setProfile({
      ...profile,
      certifications: profile.certifications.filter((_: any, i: number) => i !== index),
    });
  };

  const addProject = () => {
    setProfile({
      ...profile,
      projects: [
        ...profile.projects,
        { title: '', description: '', url: '' },
      ],
    });
  };

  const updateProject = (index: number, field: string, value: string) => {
    const updated = [...profile.projects];
    updated[index] = { ...updated[index], [field]: value };
    setProfile({ ...profile, projects: updated });
  };

  const removeProject = (index: number) => {
    setProfile({
      ...profile,
      projects: profile.projects.filter((_: any, i: number) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const completeness = calculateProfileCompleteness(profile);

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={() => navigate('/profile')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
          <h1 className="text-3xl font-bold mt-2">Edit Profile</h1>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Profile Completeness */}
      <Card className="p-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Profile Completeness</h3>
            <span className="text-sm font-bold text-primary">{completeness}%</span>
          </div>
          <Progress value={completeness} className="h-2" />
        </div>
      </Card>

      {/* Personal Information */}
      <Card className="p-6 space-y-4">
        <h2 className="text-2xl font-bold">Personal Information</h2>
        
        <div className="space-y-2">
          <Label htmlFor="headline">Professional Headline</Label>
          <Input
            id="headline"
            placeholder="e.g., Full Stack Developer | AI Enthusiast"
            value={profile.headline || ''}
            onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="e.g., San Francisco, CA"
            value={profile.location || ''}
            onChange={(e) => setProfile({ ...profile, location: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            placeholder="Tell us about yourself..."
            rows={5}
            maxLength={500}
            value={profile.bio || ''}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            {profile.bio?.length || 0}/500 characters
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="years_of_experience">Years of Experience</Label>
          <Input
            id="years_of_experience"
            type="number"
            min="0"
            placeholder="e.g., 5"
            value={profile.years_of_experience || ''}
            onChange={(e) => setProfile({ ...profile, years_of_experience: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="portfolio_url">Portfolio URL</Label>
          <Input
            id="portfolio_url"
            type="url"
            placeholder="https://yourportfolio.com"
            value={profile.portfolio_url || ''}
            onChange={(e) => setProfile({ ...profile, portfolio_url: e.target.value })}
          />
        </div>
      </Card>

      {/* Skills */}
      <Card className="p-6 space-y-4">
        <h2 className="text-2xl font-bold">Skills</h2>
        
        <div className="flex gap-2">
          <Input
            placeholder="Add a skill..."
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addSkill()}
          />
          <Button onClick={addSkill}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {profile.skills.map((skill: any, index: number) => (
            <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
              {skill.name}
              <button
                onClick={() => removeSkill(index)}
                className="ml-2 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      </Card>

      {/* Work Experience */}
      <Card className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Work Experience</h2>
          <Button onClick={addExperience} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Experience
          </Button>
        </div>

        <div className="space-y-4">
          {profile.experience.map((exp: any, index: number) => (
            <Card key={index} className="p-4 space-y-3 bg-muted/30">
              <div className="flex justify-between">
                <h3 className="font-semibold">Experience #{index + 1}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExperience(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Job Title</Label>
                  <Input
                    placeholder="e.g., Senior Developer"
                    value={exp.title}
                    onChange={(e) => updateExperience(index, 'title', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input
                    placeholder="e.g., Tech Corp"
                    value={exp.company}
                    onChange={(e) => updateExperience(index, 'company', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    placeholder="e.g., Jan 2020"
                    value={exp.startDate}
                    onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    placeholder="e.g., Present"
                    value={exp.endDate}
                    onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe your role and achievements..."
                  rows={3}
                  value={exp.description}
                  onChange={(e) => updateExperience(index, 'description', e.target.value)}
                />
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Education */}
      <Card className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Education</h2>
          <Button onClick={addEducation} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Education
          </Button>
        </div>

        <div className="space-y-4">
          {profile.education.map((edu: any, index: number) => (
            <Card key={index} className="p-4 space-y-3 bg-muted/30">
              <div className="flex justify-between">
                <h3 className="font-semibold">Education #{index + 1}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEducation(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Degree</Label>
                  <Input
                    placeholder="e.g., B.S. Computer Science"
                    value={edu.degree}
                    onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Institution</Label>
                  <Input
                    placeholder="e.g., MIT"
                    value={edu.institution}
                    onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Year</Label>
                  <Input
                    placeholder="e.g., 2020"
                    value={edu.year}
                    onChange={(e) => updateEducation(index, 'year', e.target.value)}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Certifications */}
      <Card className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Certifications</h2>
          <Button onClick={addCertification} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Certification
          </Button>
        </div>

        <div className="space-y-4">
          {profile.certifications.map((cert: any, index: number) => (
            <Card key={index} className="p-4 space-y-3 bg-muted/30">
              <div className="flex justify-between">
                <h3 className="font-semibold">Certification #{index + 1}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCertification(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    placeholder="e.g., AWS Certified Developer"
                    value={cert.name}
                    onChange={(e) => updateCertification(index, 'name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Issuer</Label>
                  <Input
                    placeholder="e.g., Amazon Web Services"
                    value={cert.issuer}
                    onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Date</Label>
                  <Input
                    placeholder="e.g., June 2023"
                    value={cert.date}
                    onChange={(e) => updateCertification(index, 'date', e.target.value)}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Projects */}
      <Card className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Projects</h2>
          <Button onClick={addProject} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        </div>

        <div className="space-y-4">
          {profile.projects.map((project: any, index: number) => (
            <Card key={index} className="p-4 space-y-3 bg-muted/30">
              <div className="flex justify-between">
                <h3 className="font-semibold">Project #{index + 1}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeProject(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    placeholder="e.g., E-commerce Platform"
                    value={project.title}
                    onChange={(e) => updateProject(index, 'title', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe your project..."
                    rows={3}
                    value={project.description}
                    onChange={(e) => updateProject(index, 'description', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input
                    type="url"
                    placeholder="https://project.com"
                    value={project.url}
                    onChange={(e) => updateProject(index, 'url', e.target.value)}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-2 sticky bottom-0 bg-background/95 backdrop-blur p-4 border-t">
        <Button variant="outline" onClick={() => navigate('/profile')}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save All Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
