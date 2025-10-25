import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

const Leaderboard = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <Header />
        
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
          <p className="text-muted-foreground">Coming soon - Top teams, predictors, and sponsors</p>
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;
