"use client";

import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, Lock, LogIn, Chrome } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      toast.error("Email atau kata sandi salah.");
      setIsLoading(false);
    } else {
      toast.success("Assalamu'alaikum! Senang melihat Anda kembali.");
      router.push("/dashboard");
    }
  };

  return (
    <AuthLayout
      title="Selamat Datang Kembali"
      subtitle="Masuk untuk mengelola keberkahan finansial keluarga Anda."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Alamat Email</Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
            <Mail className="absolute left-3 top-2.5 text-muted-foreground" size={18} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Kata Sandi</Label>
            <Link 
              href="/forgot-password" 
              className="text-xs text-primary hover:underline"
            >
              Lupa sandi?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
              required
            />
            <Lock className="absolute left-3 top-2.5 text-muted-foreground" size={18} />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Memuat..." : "Masuk Sekarang"}
          <LogIn size={18} className="ml-2" />
        </Button>

        <div className="relative flex items-center gap-4 py-2">
          <div className="h-[1px] flex-1 bg-muted" />
          <span className="text-xs text-muted-foreground uppercase">atau</span>
          <div className="h-[1px] flex-1 bg-muted" />
        </div>

        <Button variant="outline" className="w-full border-muted-foreground/20" type="button">
          <Chrome size={18} className="mr-2" />
          Masuk dengan Google
        </Button>

        <div className="text-center text-sm">
          Belum punya akun?{" "}
          <Link href="/register" className="text-primary font-bold hover:underline">
            Daftar Gratis
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
