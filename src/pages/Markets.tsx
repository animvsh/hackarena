import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { MarketCard } from "@/components/MarketCard";
import { HackathonHeader } from "@/components/HackathonHeader";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Market {
  id: string;
  category: string;
  sponsor_id: string | null;
  prize_amount: number;
  total_pool: number;
  status: string;
  sponsors?: {
    name: string;
    logo_url: string;
  } | null;
}

const Markets = () => {
  const { hackathonId } = useParams<{ hackathonId: string }>();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [filteredMarkets, setFilteredMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchMarkets();

    // Subscribe to market updates
    const channel = supabase
      .channel('markets-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prediction_markets',
        },
        () => {
          fetchMarkets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    filterMarkets();
  }, [markets, searchQuery, statusFilter]);

  const fetchMarkets = async () => {
    setLoading(true);
    let query = supabase
      .from('prediction_markets')
      .select(`
        id,
        category,
        sponsor_id,
        prize_amount,
        total_pool,
        status,
        sponsors (
          name,
          logo_url
        )
      `);
    
    if (hackathonId) {
      query = query.eq('hackathon_id', hackathonId);
    }
    
    const { data, error } = await query.order('prize_amount', { ascending: false });

    if (data && !error) {
      setMarkets(data as Market[]);
    }
    setLoading(false);
  };

  const filterMarkets = () => {
    let filtered = markets;

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((m) => m.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((m) =>
        m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.sponsors?.name && m.sponsors.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredMarkets(filtered);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-8">
        <Header />
        
        {hackathonId && <HackathonHeader hackathonId={hackathonId} />}

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Prediction Markets</h1>
          </div>
          <p className="text-muted-foreground">
            Place bets on your favorite teams and earn HackCoins based on accuracy
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search markets or sponsors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Markets</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="settled">Settled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Markets Grid */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[400px] w-full" />
            ))}
          </div>
        ) : filteredMarkets.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">No markets found</h2>
            <p className="text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search criteria"
                : "Check back soon for new prediction markets"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredMarkets.map((market) => (
              <MarketCard
                key={market.id}
                marketId={market.id}
                category={market.category}
                sponsor={market.sponsors}
                prizeAmount={market.prize_amount}
                totalPool={market.total_pool}
                status={market.status}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Markets;
