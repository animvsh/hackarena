import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImportResult {
  hackathon: any;
  tracks: any[];
  markets: any[];
  participants: number;
  submissions: number;
  message: string;
}

export function useDevpostImport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const importHackathon = async (devpostUrl: string): Promise<ImportResult | null> => {
    if (!devpostUrl || !devpostUrl.includes('devpost.com')) {
      setError('Invalid Devpost URL');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke(
        'import-devpost-hackathon',
        {
          body: { devpostUrl },
        }
      );

      if (functionError) {
        throw functionError;
      }

      if (data.error) {
        setError(data.error);
        toast({
          title: 'Import Failed',
          description: data.error,
          variant: 'destructive',
        });
        return null;
      }

      toast({
        title: 'Success!',
        description: data.message,
      });

      return data as ImportResult;
    } catch (err: any) {
      console.error('Import error:', err);
      const errorMessage = err.message || 'Failed to import hackathon';
      setError(errorMessage);
      toast({
        title: 'Import Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    importHackathon,
    loading,
    error,
  };
}
