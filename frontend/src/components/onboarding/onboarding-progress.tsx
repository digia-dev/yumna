"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingProgressProps {
  currentStep: number;
}

const steps = [
  { id: 1, name: "Identitas Akun" },
  { id: 2, name: "Pilih Cara Mulai" },
  { id: 3, name: "Detail Keluarga" },
];

export function OnboardingProgress({ currentStep }: OnboardingProgressProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between max-w-sm mx-auto">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="relative flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                  currentStep >= step.id
                    ? "bg-primary border-primary text-white"
                    : "bg-background border-muted text-muted-foreground"
                )}
              >
                {currentStep > step.id ? (
                  <Check size={16} />
                ) : (
                  <span className="text-xs font-bold">{step.id}</span>
                )}
              </div>
              <span className="absolute top-10 whitespace-nowrap text-[10px] font-medium uppercase tracking-tighter text-muted-foreground">
                {step.name}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-12 h-[2px] mx-2 transition-all duration-500",
                  currentStep > step.id ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
