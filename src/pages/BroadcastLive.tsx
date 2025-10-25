import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { BroadcastVideoPlayer } from '@/components/broadcast/BroadcastVideoPlayer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Radio, Users, TrendingUp, Zap } from "lucide-react";

export default function BroadcastLive() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-8">
        <Header />

        {/* Page Title */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Radio className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Live AI Broadcast</h1>
            <div className="flex items-center gap-2 ml-4">
              <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
              <span className="text-sm font-bold text-destructive uppercase">LIVE</span>
            </div>
          </div>
          <p className="text-muted-foreground">Real-time AI-generated commentary and insights</p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Video Player */}
          <div className="col-span-2">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Radio className="w-5 h-5 text-primary" />
                  Live Studio Feed
                </CardTitle>
                <CardDescription>
                  AI-powered broadcast with real-time team updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BroadcastVideoPlayer />
              </CardContent>
            </Card>

            {/* Broadcast Info */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Viewers</p>
                      <p className="text-xl font-bold">1,247</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Updates</p>
                      <p className="text-xl font-bold">342</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Live Events</p>
                      <p className="text-xl font-bold">28</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Info Panels */}
          <div className="col-span-1 space-y-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">About the Broadcast</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2 text-primary">AI-Powered Commentary</h4>
                  <p className="text-muted-foreground">
                    Watch as our AI analyzes team activity in real-time and generates
                    professional sports-style commentary.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-primary">Live Updates</h4>
                  <p className="text-muted-foreground">
                    Every commit, deployment, and milestone triggers instant broadcast updates
                    with dynamic visuals and engaging narratives.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-primary">Real-Time Data</h4>
                  <p className="text-muted-foreground">
                    All content is generated from live hackathon metrics, ensuring you never
                    miss a moment of the action.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Headlines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { team: "Team Alpha", text: "Deployed to production!", time: "2m ago" },
                  { team: "Team Beta", text: "Reached 100 commits milestone", time: "5m ago" },
                  { team: "Team Gamma", text: "Market cap surging +25%", time: "8m ago" },
                  { team: "Team Delta", text: "New feature demo released", time: "12m ago" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                    <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{item.team}</p>
                      <p className="text-xs text-muted-foreground">{item.text}</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">{item.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
