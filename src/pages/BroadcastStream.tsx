import { useState } from 'react';
import { ArrowLeft, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BroadcastVideoPlayer } from '@/components/broadcast/BroadcastVideoPlayer';
import { BettingSidebar } from '@/components/broadcast/BettingSidebar';
import { MarketCarousel } from '@/components/broadcast/MarketCarousel';
import { MarketDetailModal } from '@/components/MarketDetailModal';
import { useNavigate } from 'react-router-dom';

export default function BroadcastStream() {
  const navigate = useNavigate();
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal Header */}
      <header className="border-b border-border p-4 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-destructive rounded-full animate-pulse shadow-[0_0_10px_rgba(255,75,100,0.8)]" />
              <h1 className="text-xl font-bold">HackMarket Live Broadcast</h1>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="gap-2"
          >
            <Maximize2 className="w-4 h-4" />
            {isFullscreen ? 'Exit' : 'Fullscreen'}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Video & Markets */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
            {/* Video Player */}
            <div className="w-full">
              <BroadcastVideoPlayer />
            </div>

            {/* Market Carousel */}
            <div className="border-t border-border pt-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                📊 Active Markets
                <span className="text-sm font-normal text-muted-foreground">Click to view details</span>
              </h2>
              <MarketCarousel onMarketClick={setSelectedMarketId} />
            </div>

            {/* Additional Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border pt-6">
              <div className="bg-card rounded-xl p-4 border border-border hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer">
                <p className="text-sm text-muted-foreground">Live Viewers</p>
                <p className="text-3xl font-bold mt-1 bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">1,234</p>
                <p className="text-xs text-success mt-1">↑ 12% from last hour</p>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer">
                <p className="text-sm text-muted-foreground">Active Bets</p>
                <p className="text-3xl font-bold mt-1 bg-gradient-to-r from-neon-yellow to-neon-pink bg-clip-text text-transparent">567</p>
                <p className="text-xs text-primary mt-1">23 in last 5 min</p>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer">
                <p className="text-sm text-muted-foreground">Total Pool</p>
                <p className="text-3xl font-bold mt-1 bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">45.2K HC</p>
                <p className="text-xs text-success mt-1">↑ 8.3% today</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Betting Interface (Hidden on mobile) */}
        <div className="w-full lg:w-[400px] hidden lg:block border-l border-border">
          <BettingSidebar onMarketClick={setSelectedMarketId} />
        </div>

        {/* Mobile Betting Drawer - Show on mobile */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 max-h-[50vh] bg-card border-t border-border z-40">
          <BettingSidebar onMarketClick={setSelectedMarketId} />
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
