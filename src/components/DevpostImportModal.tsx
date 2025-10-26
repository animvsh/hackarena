import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Download, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DevpostImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const DevpostImportModal = ({ open, onOpenChange, onSuccess }: DevpostImportModalProps) => {
  const [devpostUrl, setDevpostUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImport = async () => {
    if (!devpostUrl || !devpostUrl.includes('devpost.com')) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Devpost hackathon URL",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('import-devpost-hackathon', {
        body: { devpostUrl },
      });

      if (error) throw error;

      if (data.error) {
        setError(data.error);
        toast({
          title: "Import Failed",
          description: data.error,
          variant: "destructive",
        });
      } else {
        setResult(data);
        toast({
          title: "Success!",
          description: data.message,
        });
        setTimeout(() => {
          onSuccess();
          onOpenChange(false);
          setDevpostUrl("");
          setResult(null);
        }, 2000);
      }
    } catch (err: any) {
      console.error('Import error:', err);
      setError(err.message);
      toast({
        title: "Import Failed",
        description: err.message || "Failed to import hackathon",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false);
      setDevpostUrl("");
      setResult(null);
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Import from Devpost
          </DialogTitle>
          <DialogDescription>
            Enter a Devpost hackathon URL to automatically import the hackathon and create prediction markets
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="devpost-url">Devpost Hackathon URL</Label>
            <Input
              id="devpost-url"
              placeholder="https://treehacks2024.devpost.com"
              value={devpostUrl}
              onChange={(e) => setDevpostUrl(e.target.value)}
              disabled={loading}
            />
            <p className="text-sm text-muted-foreground">
              Example: https://calhacks.devpost.com
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Import Failed</p>
                <p className="text-sm text-destructive/80">{error}</p>
              </div>
            </div>
          )}

          {result && (
            <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2 text-sm">
                  <h4 className="font-semibold text-green-500 mb-2">Import Successful!</h4>
                  <p className="text-muted-foreground"><strong>Hackathon:</strong> {result.hackathon?.name}</p>
                  <p className="text-muted-foreground"><strong>Tracks Imported:</strong> {result.tracks?.length || 0}</p>
                  {result.participants > 0 && (
                    <p className="text-muted-foreground"><strong>Participants:</strong> {result.participants.toLocaleString()}</p>
                  )}
                  {result.submissions > 0 && (
                    <p className="text-muted-foreground"><strong>Submissions:</strong> {result.submissions.toLocaleString()}</p>
                  )}
                  <p className="text-muted-foreground"><strong>Total Prize Pool:</strong> ${result.hackathon?.prize_pool?.toLocaleString()}</p>
                  {result.tracks && result.tracks.length > 0 && (
                    <div className="mt-3">
                      <p className="font-medium text-foreground mb-1">Tracks:</p>
                      <ul className="list-disc list-inside space-y-0.5 ml-2 text-muted-foreground">
                        {result.tracks.slice(0, 5).map((track: any, idx: number) => (
                          <li key={idx}>{track.category}</li>
                        ))}
                        {result.tracks.length > 5 && (
                          <li className="text-muted-foreground/70">+{result.tracks.length - 5} more...</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={loading || !devpostUrl}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Import Hackathon
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
