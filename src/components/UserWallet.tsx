import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
  const { user: authUser } = useAuth();

  useEffect(() => {
    if (authUser) {
      fetchUser();

      const channel = supabase
        .channel('user-wallet-updates')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${authUser.id}`
        }, fetchUser)
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setLoading(false);
    }
  }, [authUser]);

  const fetchUser = async () => {
    if (!authUser) return;
    
    setLoading(true);
    const { data } = await supabase
      .from('users')
      .select('id, username, wallet_balance, xp')
      .eq('id', authUser.id)
      .single();

    if (data) {
      setUser(data);
    }
    setLoading(false);
  };

  if (!authUser) {
    return (
      <div className="bg-secondary rounded-3xl p-8 relative overflow-hidden">
        <div className="relative z-10 text-center">
          <Wallet className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Sign in to view your wallet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary rounded-3xl p-8 relative overflow-hidden">
      <div className="absolute top-4 right-4 w-20 h-20 bg-primary-foreground/10 rounded-2xl transform rotate-12"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="w-4 h-4 text-primary-foreground/80" />
          <p className="text-primary-foreground/80 text-sm font-medium">
            {loading ? 'Loading...' : user?.username || 'User'}
          </p>
        </div>
        <h2 className="text-4xl font-bold text-primary-foreground mb-4">
          {loading ? '...' : (user?.wallet_balance?.toLocaleString() || '0')} HC
        </h2>
        <div className="flex gap-4 text-primary-foreground/70 text-xs">
          <div>
            <span className="opacity-70">XP:</span> {loading ? '...' : (user?.xp?.toLocaleString() || '0')}
          </div>
          <div>
            <span className="opacity-70">Balance:</span> {loading ? '...' : (user?.wallet_balance?.toLocaleString() || '0')} HC
          </div>
        </div>
      </div>
    </div>
  );
};
