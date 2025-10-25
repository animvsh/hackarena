import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BroadcastVideoPlayer } from '@/components/broadcast/BroadcastVideoPlayer';
import { BettingSidebar } from '@/components/broadcast/BettingSidebar';
import { MarketCarousel } from '@/components/broadcast/MarketCarousel';
import { MarketDetailModal } from '@/components/MarketDetailModal';
import { useNavigate } from 'react-router-dom';

export default function BroadcastStream() {
  const navigate = useNavigate();
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal Header */}
      <header className="border-b border-border p-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
            <h1 className="text-xl font-bold">HackMarket Live Broadcast</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Video & Markets */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Video Player */}
            <div className="w-full">
              <BroadcastVideoPlayer />
            </div>

            {/* Market Carousel */}
            <div className="border-t border-border pt-6">
              <h2 className="text-lg font-bold mb-4">Active Markets</h2>
              <MarketCarousel onMarketClick={setSelectedMarketId} />
            </div>

            {/* Additional Stats Section */}
            <div className="grid grid-cols-3 gap-4 border-t border-border pt-6">
              <div className="bg-card rounded-lg p-4 border border-border">
                <p className="text-sm text-muted-foreground">Live Viewers</p>
                <p className="text-2xl font-bold mt-1">1,234</p>
              </div>
              <div className="bg-card rounded-lg p-4 border border-border">
                <p className="text-sm text-muted-foreground">Active Bets</p>
                <p className="text-2xl font-bold mt-1">567</p>
              </div>
              <div className="bg-card rounded-lg p-4 border border-border">
                <p className="text-sm text-muted-foreground">Total Pool</p>
                <p className="text-2xl font-bold mt-1">45.2K HC</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Betting Interface */}
        <div className="w-[400px] hidden lg:block">
          <BettingSidebar />
        </div>
      </div>

      {/* Market Detail Modal */}
      <MarketDetailModal
        marketId={selectedMarketId}
        isOpen={!!selectedMarketId}
        onClose={() => setSelectedMarketId(null)}
      />
    </div>
  );
}
