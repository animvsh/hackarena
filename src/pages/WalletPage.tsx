import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

const WalletPage = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <Header />
        
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">My Wallet</h2>
          <p className="text-muted-foreground">Coming soon - Manage your HackCoins and prediction history</p>
        </div>
      </main>
    </div>
  );
};

export default WalletPage;
