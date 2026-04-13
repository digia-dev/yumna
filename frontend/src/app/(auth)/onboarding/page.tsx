"use client";

import { useAuth } from "@/hooks/use-auth";
import { redirect } from "next/navigation";
import { OnboardingProgress } from "@/components/onboarding/onboarding-progress";
import { AuthLayout } from "@/components/layout/auth-layout";
import { RoleGuide } from "@/components/onboarding/role-guide";
import { Card } from "@/components/ui/card";
import { Home, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function OnboardingPage() {
  const { hasFamily } = useAuth();

  // If already has family, go to dashboard
  if (hasFamily) {
    redirect("/dashboard");
  }

  return (
    <AuthLayout
      title="Mari Mulai Langkah Keberkahan"
      subtitle="Pilih bagaimana Anda ingin memulai perjalanan finansial keluarga Anda"
    >
      <OnboardingProgress currentStep={2} />
      
      <div className="grid gap-6">
        <Link href="/onboarding/create-family">
          <Card className="p-6 cursor-pointer hover:border-emerald-deep/50 transition-all group border-2">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-light/20 text-emerald-deep group-hover:bg-emerald-deep group-hover:text-white transition-colors">
                <Home size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Buat Keluarga Baru</h3>
                <p className="text-sm text-muted-foreground">
                  Jadilah pionir dalam mengatur masa depan finansial keluarga Anda
                </p>
              </div>
              <ArrowRight className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </Link>

        <Link href="/onboarding/join-family">
          <Card className="p-6 cursor-pointer hover:border-secondary/50 transition-all group border-2">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                <Users size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Gabung Keluarga</h3>
                <p className="text-sm text-muted-foreground">
                  Gunakan kode undangan dari anggota keluarga Anda untuk bergabung
                </p>
              </div>
              <ArrowRight className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </Link>
      </div>

      <RoleGuide />
    </AuthLayout>
  );
}
