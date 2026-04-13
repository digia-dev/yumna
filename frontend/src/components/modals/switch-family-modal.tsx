"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Plus, SwitchCamera } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { toast } from "sonner";

export function SwitchFamilyModal() {
  const { user } = useAuth();
  const [currentFamilyId, setCurrentFamilyId] = useState(user?.familyId || "1");

  // Mock list of families for the switcher (future proofing)
  const families = [
    { id: user?.familyId || "1", name: "Keluarga Utama", role: user?.role || "KEPALA_KELUARGA" },
    { id: "2", name: "Bisnis Keluarga (MOCK)", role: "BENDAHARA" },
  ];

  const handleSwitch = (id: string, name: string) => {
    setCurrentFamilyId(id);
    toast.success(`Berhasil berpindah ke ${name}`);
    // In real app, this would refresh the session or redirect
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
          <SwitchCamera size={20} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pindah Organisasi Keluarga</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            {families.map((family) => (
              <div 
                key={family.id}
                onClick={() => handleSwitch(family.id, family.name)}
                className={`flex items-center gap-4 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  currentFamilyId === family.id 
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                    : "border-transparent hover:bg-muted"
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {family.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{family.name}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{family.role}</p>
                </div>
                {currentFamilyId === family.id && (
                  <Check size={18} className="text-primary" />
                )}
              </div>
            ))}
          </div>

          <Button variant="outline" className="w-full border-dashed gap-2">
            <Plus size={18} />
            Gabung atau Buat Keluarga Baru
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
