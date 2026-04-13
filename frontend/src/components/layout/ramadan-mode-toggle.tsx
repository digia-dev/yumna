"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Sparkles } from "lucide-react";
import { toast } from "sonner";

export function RamadanModeToggle() {
  const [isRamadan, setIsRamadan] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ramadan-mode") === "true";
    setIsRamadan(saved);
    if (saved) {
      document.documentElement.classList.add("ramadan-theme");
    }
  }, []);

  const toggle = () => {
    const next = !isRamadan;
    setIsRamadan(next);
    localStorage.setItem("ramadan-mode", next.toString());
    
    if (next) {
      document.documentElement.classList.add("ramadan-theme");
      toast("🌙 Marhaban ya Ramadan! Tema Ramadan Teraktivasi.", {
        description: "Suasana lebih tenang dengan warna emas dan emerald gelap.",
      });
    } else {
      document.documentElement.classList.remove("ramadan-theme");
      toast("☀️ Tema Standar Teraktivasi.");
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggle}
      className={`rounded-full ${isRamadan ? 'text-amber-400' : 'text-muted-foreground'}`}
      title="Toggle Ramadan Mode"
    >
      {isRamadan ? <Sparkles size={20} /> : <Moon size={20} />}
    </Button>
  );
}
