"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Sparkles, Heart, ShieldCheck } from "lucide-react";

const steps = [
  {
    title: "Selamat Datang di Yumna",
    description: "Asisten keuangan keluarga yang dirancang untuk membawa keberkahan dan ketenangan (Sakinah) dalam setiap transaksi Anda.",
    icon: Sparkles,
  },
  {
    title: "Transparansi Keluarga",
    description: "Bagikan akses dengan Istri dan Anak. Pantau pengeluaran bersama tanpa rasa curiga, karena kejujuran adalah kunci kebahagiaan.",
    icon: Heart,
  },
  {
    title: "Zakat & Keberkahan",
    description: "Biarkan kami membantu menghitung Zakat dan Sedekah Anda secara otomatis. Bersihkan harta, tenangkan jiwa.",
    icon: ShieldCheck,
  },
];

export function WelcomeWalkthrough() {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const isFirstTime = !localStorage.getItem("yumna_walkthrough_seen");
    if (isFirstTime) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setOpen(false);
      localStorage.setItem("yumna_walkthrough_seen", "true");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const StepIcon = steps[currentStep].icon;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="flex flex-col items-center text-center space-y-6 py-4">
          <div className="p-4 bg-primary/10 rounded-full text-primary">
            <StepIcon size={48} />
          </div>
          
          <div className="space-y-2">
            <DialogTitle className="text-2xl font-display font-bold">
              {steps[currentStep].title}
            </DialogTitle>
            <DialogDescription className="text-base leading-relaxed">
              {steps[currentStep].description}
            </DialogDescription>
          </div>

          <div className="flex items-center gap-2">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all ${
                  i === currentStep ? "w-8 bg-primary" : "w-1.5 bg-muted"
                }`} 
              />
            ))}
          </div>

          <div className="flex items-center justify-between w-full pt-4">
            <Button 
              variant="ghost" 
              onClick={handleBack} 
              disabled={currentStep === 0}
            >
              <ChevronLeft className="mr-2" size={16} />
              Kembali
            </Button>
            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? "Mulai Sekarang" : "Lanjut"}
              <ChevronRight className="ml-2" size={16} />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
