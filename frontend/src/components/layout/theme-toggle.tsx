"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const options = [
    { value: "light",  icon: Sun,     label: "Terang" },
    { value: "dark",   icon: Moon,    label: "Gelap"  },
    { value: "system", icon: Monitor, label: "Sistem" },
  ] as const;

  return (
    <div className={cn("flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1", className)}>
      {options.map(({ value, icon: Icon, label }) => (
        <button key={value} onClick={() => setTheme(value)}
          title={label}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
            theme === value
              ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm"
              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          )}>
          <Icon size={13} />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
