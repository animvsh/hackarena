import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pencil, Check, ArrowLeft } from "lucide-react";

interface ProfilePreviewProps {
  data: {
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
  };
  onConfirm: (source: string) => void;
  onEdit: (data: any) => void;
  onBack: () => void;
}

export const ProfilePreview = ({ data, onConfirm, onEdit, onBack }: ProfilePreviewProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h2 className="text-2xl font-bold">Review Your Profile</h2>
        <div className="w-20" />
      </div>

      <div className="space-y-4">
        {/* Basic Info */}
        {(data.name || data.email) && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Basic Information</h3>
            {data.name && <p className="text-lg">{data.name}</p>}
            {data.email && <p className="text-sm text-muted-foreground">{data.email}</p>}
          </Card>
        )}

        {/* Bio */}
        {data.bio && (
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Bio</h3>
            <p className="text-sm text-muted-foreground">{data.bio}</p>
          </Card>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, idx) => (
                <Badge key={idx} variant="secondary">
                  {skill.name} {skill.level && `- ${skill.level}`}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Experience</h3>
            <div className="space-y-4">
              {data.experience.map((exp, idx) => (
                <div key={idx} className="border-l-2 border-primary pl-4">
                  <p className="font-medium">{exp.title}</p>
                  <p className="text-sm text-muted-foreground">{exp.company}</p>
                  <p className="text-xs text-muted-foreground">
                    {exp.startDate} - {exp.endDate || "Present"}
                  </p>
                  {exp.description && (
                    <p className="text-sm mt-2">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Education</h3>
            <div className="space-y-3">
              {data.education.map((edu, idx) => (
                <div key={idx}>
                  <p className="font-medium">{edu.degree}</p>
                  <p className="text-sm text-muted-foreground">{edu.institution}</p>
                  <p className="text-xs text-muted-foreground">{edu.year}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Social Links */}
        {(data.linkedin_url || data.github_url || data.portfolio_url) && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Links</h3>
            <div className="space-y-2">
              {data.linkedin_url && (
                <a
                  href={data.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline block"
                >
                  LinkedIn Profile
                </a>
              )}
              {data.github_url && (
                <a
                  href={data.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline block"
                >
                  GitHub Profile
                </a>
              )}
              {data.portfolio_url && (
                <a
                  href={data.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline block"
                >
                  Portfolio
                </a>
              )}
            </div>
          </Card>
        )}
      </div>

      <div className="flex gap-3">
        <Button onClick={() => onConfirm('imported')} className="flex-1">
          <Check className="w-4 h-4 mr-2" />
          Looks Good!
        </Button>
        <Button variant="outline" onClick={() => onEdit(data)}>
          <Pencil className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </div>
    </div>
  );
};