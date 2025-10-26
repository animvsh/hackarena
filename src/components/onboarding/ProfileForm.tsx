import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

interface ProfileFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onBack: () => void;
}

export const ProfileForm = ({ initialData, onSubmit, onBack }: ProfileFormProps) => {
  const [formData, setFormData] = useState({
    username: initialData?.username || initialData?.name || '',
    bio: initialData?.bio || '',
    skills: initialData?.skills || [],
    linkedin_url: initialData?.linkedin_url || '',
    github_url: initialData?.github_url || '',
    portfolio_url: initialData?.portfolio_url || '',
  });

  const [newSkill, setNewSkill] = useState({ name: '', level: 'Intermediate' });

  const handleAddSkill = () => {
    if (newSkill.name.trim()) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill],
      });
      setNewSkill({ name: '', level: 'Intermediate' });
    }
  };

  const handleRemoveSkill = (index: number) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_: any, i: number) => i !== index),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Complete Your Profile</h2>
        <p className="text-muted-foreground">
          Tell us about yourself
        </p>
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="username">Display Name *</Label>
          <Input
            id="username"
            placeholder="Your name"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            placeholder="Tell us about yourself..."
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            {formData.bio.length}/500 characters
          </p>
        </div>

        <div className="space-y-3">
          <Label>Skills</Label>
          
          {formData.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.skills.map((skill: any, idx: number) => (
                <Badge key={idx} variant="secondary" className="pl-3 pr-1 py-1">
                  <span className="mr-2">{skill.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(idx)}
                    className="hover:bg-destructive/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              placeholder="Skill name"
              value={newSkill.name}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
            />
            <select
              className="px-3 py-2 border rounded-md"
              value={newSkill.level}
              onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
            <Button type="button" onClick={handleAddSkill} size="icon">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Label>Social Links</Label>
          
          <div className="space-y-2">
            <Input
              placeholder="LinkedIn Profile URL"
              value={formData.linkedin_url}
              onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Input
              placeholder="GitHub Profile URL"
              value={formData.github_url}
              onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Input
              placeholder="Portfolio/Website URL"
              value={formData.portfolio_url}
              onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
            />
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" className="flex-1">
          Continue
        </Button>
      </div>
    </form>
  );
};