import { BottomNav } from "./bottom-nav";
import { PageTransition } from "./page-transition";
import { CommandPalette } from "./command-palette";
import { cn } from "@/lib/utils";
import { PinLock } from "@/components/auth/pin-lock";

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AppLayout({ children, className }: AppLayoutProps) {
  return (
    <div className="relative min-h-screen bg-background font-sans antialiased">
      {/* Background patterns could be added here */}
      <div className="fixed inset-0 -z-10 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      <main className={cn("pb-20 sm:pb-0", className)}>
        <PageTransition>{children}</PageTransition>
      </main>

      <PinLock />
      <CommandPalette />
      <BottomNav />
    </div>
  );
}
