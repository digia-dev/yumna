"use client";

import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import apiClient from "@/lib/api-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiClient.post("/auth/password/request", { email });
      setIsSent(true);
      toast.success("Tautan reset kata sandi telah dikirim ke email Anda.");
    } catch (error) {
      toast.error("Terjadi kesalahan. Silakan coba lagi nanti.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Atur Ulang Kata Sandi"
      subtitle="Jangan khawatir, kami akan membantu Anda kembali ke jalan Sakinah."
    >
      {!isSent ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Alamat Email</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="email@anda.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
              <Mail className="absolute left-3 top-2.5 text-muted-foreground" size={18} />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Mengirim..." : "Kirim Instruksi Reset"}
          </Button>

          <div className="text-center">
            <Link 
              href="/login" 
              className="text-sm text-primary hover:underline flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} /> Kembali ke Login
            </Link>
          </div>
        </form>
      ) : (
        <div className="text-center space-y-6">
          <div className="p-4 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto text-primary">
            <Mail size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold">Email Telah Dikirim</h3>
            <p className="text-sm text-muted-foreground pb-4">
              Silakan periksa kotak masuk email Anda {email} (termasuk folder spam) untuk instruksi selanjutnya.
            </p>
          </div>
          <Button variant="outline" className="w-full" onClick={() => setIsSent(false)}>
            Gunakan Email Lain
          </Button>
          <div className="text-center">
            <Link 
              href="/login" 
              className="text-sm text-primary hover:underline"
            >
              Kembali ke Login
            </Link>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
