import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, Key } from 'lucide-react';
import { toast } from 'sonner';

interface InviteCodeDisplayProps {
  inviteCode: string;
  teamName: string;
  onContinue: () => void;
}

export const InviteCodeDisplay = ({ inviteCode, teamName, onContinue }: InviteCodeDisplayProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      toast.success('Invite code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy invite code');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Team Created Successfully! 🎉</h2>
        <p className="text-muted-foreground">
          Share this invite code with your team members
        </p>
      </div>

      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Your Team Invite Code
          </CardTitle>
          <CardDescription>
            Team members can use this code to request access to "{teamName}"
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={inviteCode}
              readOnly
              className="font-mono text-lg"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">How it works:</p>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Share this code with your team members</li>
              <li>They enter it during onboarding or on the teams page</li>
              <li>You'll receive a notification to approve their request</li>
              <li>Once approved, they'll have access to your team's data</li>
            </ol>
          </div>

          <Button onClick={onContinue} className="w-full">
            Continue to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
