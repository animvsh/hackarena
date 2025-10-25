import { Search, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Header = () => {
  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-3xl font-bold">HackCast LIVE</h1>
          <div className="flex items-center gap-2 px-3 py-1 bg-destructive/10 rounded-full">
            <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-destructive">BROADCASTING</span>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">Real-time hackathon predictions & AI commentary</p>
      </div>

      <div className="flex items-center gap-4">
        <button className="w-10 h-10 rounded-xl bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors">
          <Search className="w-5 h-5" />
        </button>
        <button className="w-10 h-10 rounded-xl bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full"></span>
        </button>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold">Shayna</p>
            <p className="text-xs text-muted-foreground">Beauty Reviewer</p>
          </div>
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-primary text-primary-foreground">SL</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};
