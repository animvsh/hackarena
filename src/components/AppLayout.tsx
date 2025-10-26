import { ReactNode } from "react";
import { NavigationSidebar } from "@/components/navigation/NavigationSidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <NavigationSidebar />
      <main className="flex-1 ml-60">
        {children}
      </main>
    </div>
  );
};
