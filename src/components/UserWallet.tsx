import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Wallet } from "lucide-react";

interface User {
  id: string;
  username: string;
  wallet_balance: number;
  xp: number;
}

export const UserWallet = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();

    const channel = supabase
      .channel('user-wallet-updates')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'users'
      }, fetchUser)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUser = async () => {
    setLoading(true);
    // For demo purposes, get the first user from the database
    const { data } = await supabase
      .from('users')
      .select('id, username, wallet_balance, xp')
      .limit(1)
      .single();

    if (data) {
      setUser(data);
    }
    setLoading(false);
  };

  return (
    <div className="bg-primary rounded-3xl p-8 relative overflow-hidden">
      <div className="absolute top-4 right-4 w-20 h-20 bg-primary-foreground/10 rounded-2xl transform rotate-12"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="w-4 h-4 text-primary-foreground/80" />
          <p className="text-primary-foreground/80 text-sm font-medium">
            {loading ? 'Loading...' : user?.username || 'Demo User'}
          </p>
        </div>
        <h2 className="text-4xl font-bold text-primary-foreground mb-4">
          {loading ? '...' : (user?.wallet_balance?.toLocaleString() || '1,000')} HC
        </h2>
        <div className="flex gap-4 text-primary-foreground/70 text-xs">
          <div>
            <span className="opacity-70">XP:</span> {loading ? '...' : (user?.xp?.toLocaleString() || '0')}
          </div>
          <div>
            <span className="opacity-70">Balance:</span> {loading ? '...' : (user?.wallet_balance?.toLocaleString() || '1,000')} HC
          </div>
        </div>
      </div>
    </div>
  );
};
