import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

const RadioPage = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <Header />
        
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">HackCast Radio</h2>
          <p className="text-muted-foreground">Coming soon - AI-powered live commentary and broadcast</p>
        </div>
      </main>
    </div>
  );
};

export default RadioPage;
