"use client";

import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";

export default function JoinFamilyPage() {
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode) return;

    setIsLoading(true);
    try {
      // Simulation of joining family via API
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      toast.success("Berhasil bergabung! Selamat berkumpul bersama keluarga.");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Kode tidak valid atau sudah kedaluwarsa.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Penuhi Undangan Keluarga"
      subtitle="Masukkan kode unik yang diberikan oleh Kepala Keluarga Anda"
    >
      <form onSubmit={handleJoin} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="inviteCode">Kode Undangan</Label>
          <div className="relative">
            <Input
              id="inviteCode"
              placeholder="Masukkan 8 karakter kode"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="pl-10 uppercase tracking-widest font-mono"
              required
              disabled={isLoading}
              maxLength={8}
            />
            <KeyRound className="absolute left-3 top-2.5 text-muted-foreground" size={18} />
          </div>
          <p className="text-[10px] text-muted-foreground italic">
            *Pastikan kode sesuai dengan huruf besar/kecil yang diberikan.
          </p>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-secondary hover:bg-secondary/90 text-white" 
          disabled={inviteCode.length < 4 || isLoading}
        >
          {isLoading ? "Memverifikasi..." : "Verifikasi & Gabung"}
        </Button>
      </form>
    </AuthLayout>
  );
}
