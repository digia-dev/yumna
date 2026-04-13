"use client";

import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, Lock, User, UserPlus } from "lucide-react";
import Link from "next/link";
import apiClient from "@/lib/api-client";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "KEPALA_KELUARGA",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiClient.post("/auth/register", formData);
      toast.success("Akun berhasil dibuat! Silakan masuk.");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal membuat akun.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Mulai Perjalanan Sakinah"
      subtitle="Bergabunglah dengan ribuan keluarga yang telah mengelola keuangan secara Islami."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Lengkap</Label>
          <div className="relative">
            <Input
              id="name"
              placeholder="Nama Anda"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="pl-10"
              required
            />
            <User className="absolute left-3 top-2.5 text-muted-foreground" size={18} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Alamat Email</Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="pl-10"
              required
            />
            <Mail className="absolute left-3 top-2.5 text-muted-foreground" size={18} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Kata Sandi</Label>
          <div className="relative">
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="pl-10"
              required
            />
            <Lock className="absolute left-3 top-2.5 text-muted-foreground" size={18} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Peran dalam Keluarga</Label>
          <Select 
            onValueChange={(v) => setFormData({ ...formData, role: v })}
            defaultValue="KEPALA_KELUARGA"
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih Peran" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="KEPALA_KELUARGA">Kepala Keluarga (Ayah)</SelectItem>
              <SelectItem value="ISTRI">Istri (Pengelola)</SelectItem>
              <SelectItem value="ANAK">Anak (Anggota)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <input 
            type="checkbox" 
            id="tos" 
            required 
            className="w-4 h-4 text-primary border-muted rounded focus:ring-primary"
          />
          <Label htmlFor="tos" className="text-xs text-muted-foreground leading-tight">
            Saya setuju dengan <Link href="/tos" className="text-primary hover:underline">Syarat & Ketentuan</Link> serta <Link href="/privacy" className="text-primary hover:underline">Kebijakan Privasi</Link> Yumna.
          </Label>
        </div>

        <Button type="submit" className="w-full mt-2" disabled={isLoading}>
          {isLoading ? "Memuat..." : "Daftar Sekarang"}
          <UserPlus size={18} className="ml-2" />
        </Button>

        <div className="text-center text-sm pt-4">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-primary font-bold hover:underline">
            Masuk Saja
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
