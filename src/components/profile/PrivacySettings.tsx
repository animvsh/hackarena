import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield } from 'lucide-react';

interface PrivacySettingsProps {
  settings: {
    bio?: string;
    skills?: string;
    projects?: string;
    experience?: string;
    education?: string;
    betting?: string;
  };
  onChange: (section: string, value: string) => void;
}

const privacySections = [
  { key: 'bio', label: 'Biography' },
  { key: 'skills', label: 'Skills' },
  { key: 'projects', label: 'Projects' },
  { key: 'experience', label: 'Work Experience' },
  { key: 'education', label: 'Education' },
  { key: 'betting', label: 'Betting History' },
];

const privacyOptions = [
  { value: 'public', label: 'Public - Everyone can see' },
  { value: 'team_only', label: 'Team Only - Only teammates can see' },
  { value: 'private', label: 'Private - Only you can see' },
];

export function PrivacySettings({ settings, onChange }: PrivacySettingsProps) {
  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Privacy Settings</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Control who can see different sections of your profile
      </p>
      
      <div className="space-y-4">
        {privacySections.map((section) => (
          <div key={section.key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 bg-muted/30 rounded-lg">
            <Label htmlFor={section.key} className="font-semibold">{section.label}</Label>
            <Select
              value={settings[section.key as keyof typeof settings] || 'public'}
              onValueChange={(value) => onChange(section.key, value)}
            >
              <SelectTrigger id={section.key} className="w-full sm:w-[280px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {privacyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </Card>
  );
}
