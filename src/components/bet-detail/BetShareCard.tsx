import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BetShareCardProps {
  betId: string;
  teamName: string;
  amount: number;
  odds: number;
  status: string;
}

export function BetShareCard({ betId, teamName, amount, odds, status }: BetShareCardProps) {
  const shareUrl = `${window.location.origin}/bets/${betId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Bet link copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy link to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My bet on ${teamName}`,
          text: `I bet ${amount} HC on ${teamName} at ${odds}% odds!`,
          url: shareUrl
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Share This Bet</h3>
      
      <div className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm font-mono break-all">{shareUrl}</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleShare} className="flex-1">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button onClick={handleCopyLink} variant="outline" className="flex-1">
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-2">Share on social media:</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://twitter.com/intent/tweet?text=I bet ${amount} HC on ${teamName} at ${odds}% odds!&url=${encodeURIComponent(shareUrl)}`, '_blank')}
            >
              Twitter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')}
            >
              Facebook
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
