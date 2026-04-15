import { BottomNav } from "./bottom-nav";
import { PageTransition } from "./page-transition";
import { CommandPalette } from "./command-palette";
import { ThemeToggle } from "./theme-toggle";
import { BugReportButton } from "./bug-report-button";
import { cn } from "@/lib/utils";
import { PinLock } from "@/components/auth/pin-lock";

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AppLayout({ children, className }: AppLayoutProps) {
  return (
    <div className="relative min-h-screen bg-background font-sans antialiased">
      <div className="fixed inset-0 -z-10 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      {/* 409 – Fixed theme toggle top-right */}
      <div className="fixed top-3 right-3 z-40 hidden sm:block">
        <ThemeToggle />
      </div>

      <main className={cn("pb-20 sm:pb-0", className)}>
        <PageTransition>{children}</PageTransition>
      </main>

      <PinLock />
      <CommandPalette />
      <BugReportButton />
      <BottomNav />
    </div>
  );
}
