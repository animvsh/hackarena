import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Wallet } from "lucide-react";

interface WalletData {
  balance: number;
  total_earned: number;
  total_spent: number;
}

export const UserWallet = () => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchWallet();

      const channel = supabase
        .channel('wallet-updates')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_wallets',
          filter: `user_id=eq.${user.id}`
        }, fetchWallet)
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchWallet = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (data) {
      setWallet(data);
    } else {
      // Create wallet if doesn't exist
      const { data: newWallet } = await supabase
        .from('user_wallets')
        .insert({ user_id: user.id })
        .select()
        .single();
      
      if (newWallet) {
        setWallet(newWallet);
      }
    }
  };

  return (
    <div className="bg-primary rounded-3xl p-8 relative overflow-hidden">
      <div className="absolute top-4 right-4 w-20 h-20 bg-primary-foreground/10 rounded-2xl transform rotate-12"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="w-4 h-4 text-primary-foreground/80" />
          <p className="text-primary-foreground/80 text-sm font-medium">HackCoins Balance</p>
        </div>
        <h2 className="text-4xl font-bold text-primary-foreground mb-4">
          {wallet?.balance?.toLocaleString() || '1,000'} HC
        </h2>
        <div className="flex gap-4 text-primary-foreground/70 text-xs">
          <div>
            <span className="opacity-70">Earned:</span> {wallet?.total_earned?.toLocaleString() || '0'}
          </div>
          <div>
            <span className="opacity-70">Spent:</span> {wallet?.total_spent?.toLocaleString() || '0'}
          </div>
        </div>
      </div>
    </div>
  );
};
