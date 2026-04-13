import Link from "next/link";
import { Home, Wallet, MessageSquare, CheckSquare, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Beranda", icon: Home, href: "/dashboard" },
  { label: "Dompet", icon: Wallet, href: "/wallets" },
  { label: "Yumna AI", icon: MessageSquare, href: "/chat" },
  { label: "Tugas", icon: CheckSquare, href: "/tasks" },
  { label: "Setelan", icon: Settings, href: "/settings" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-white/80 backdrop-blur-xl border-t border-emerald-deep/10 sm:hidden">
      <div className="flex h-full items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 transition-all",
                isActive ? "text-emerald-deep scale-110" : "text-muted-foreground hover:text-emerald-deep"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "fill-current")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
