"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Camera, User, Mail, Shield, Save, LogOut, Fingerprint } from "lucide-react";
import { SwitchFamilyModal } from "@/components/modals/switch-family-modal";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.image || "");
  const [biometricEnabled, setBiometricEnabled] = useState(true);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Simulation of upload to /api/uploads/avatar
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // In real app: const res = await axios.post("/api/uploads/avatar", formData);
      // setAvatarUrl(res.data.url);
      
      const fakeUrl = URL.createObjectURL(file);
      setAvatarUrl(fakeUrl);
      toast.success("Foto profil berhasil diperbarui");
    } catch (error) {
      toast.error("Gagal mengunggah foto");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: "Menyimpan perubahan...",
        success: "Profil berhasil diperbarui",
        error: "Gagal menyimpan perubahan",
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display">Profil Pribadi</h1>
          <p className="text-muted-foreground">Kelola informasi identitas Anda di Yumna</p>
        </div>
        <SwitchFamilyModal />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Summary */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <div className="relative inline-block">
                <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                  <AvatarImage src={avatarUrl} alt={name} />
                  <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                    {name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label 
                  htmlFor="avatar-upload" 
                  className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full cursor-pointer shadow-lg hover:bg-primary/90 transition-colors"
                >
                  <Camera size={18} />
                  <input 
                    id="avatar-upload" 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleAvatarUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
              <div>
                <h2 className="text-xl font-bold">{name}</h2>
                <div className="flex items-center justify-center gap-1 text-sm text-secondary font-semibold mt-1">
                  <Shield size={14} />
                  {user?.role?.replace("_", " ")}
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full text-destructive hover:bg-destructive/10"
                onClick={() => signOut()}
              >
                <LogOut size={16} className="mr-2" />
                Keluar Sesi
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Edit Form */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Dasar</CardTitle>
              <CardDescription>Perbarui nama dan data personal Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <div className="relative">
                    <Input 
                      id="name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      className="pl-10"
                    />
                    <User className="absolute left-3 top-2.5 text-muted-foreground" size={18} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Alamat Email</Label>
                  <div className="relative">
                    <Input 
                      id="email" 
                      value={user?.email || ""} 
                      className="pl-10 bg-muted cursor-not-allowed" 
                      readOnly
                    />
                    <Mail className="absolute left-3 top-2.5 text-muted-foreground" size={18} />
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">
                    *Email tidak dapat diubah demi alasan keamanan akun.
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <Button type="submit" className="w-full sm:w-auto">
                    <Save size={16} className="mr-2" />
                    Simpan Perubahan
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Privasi</CardTitle>
              <CardDescription>Kontrol bagaimana data Anda dibagikan dalam keluarga</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="font-medium">Sembunyikan Saldo Utama</p>
                  <p className="text-xs text-muted-foreground">Jangan tampilkan total saldo di dashboard utama.</p>
                </div>
                <input type="checkbox" className="w-5 h-5 accent-primary" />
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="font-medium">Bagikan Detail Transaksi</p>
                  <p className="text-xs text-muted-foreground">Izinkan anggota lain melihat detail deskripsi belanja Anda.</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary" />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Notifikasi Aktivitas Keluarga</p>
                  <p className="text-xs text-muted-foreground">Terima pemberitahuan saat anggota lain mencatat transaksi.</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Keamanan & Sesi</CardTitle>
              <CardDescription>Informasi aktivitas masuk akun Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-light/20 text-emerald-deep rounded-full">
                    <Fingerprint size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Masuk dengan Biometrik</p>
                    <p className="text-[10px] text-muted-foreground uppercase">FaceID / Fingerprint</p>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={biometricEnabled} 
                  onChange={(e) => {
                    setBiometricEnabled(e.target.checked);
                    toast.success(e.target.checked ? "Biometrik diaktifkan" : "Biometrik dimatikan");
                  }}
                  className="w-5 h-5 accent-emerald-deep" 
                />
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-full">
                    <Shield size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Perangkat Saat Ini</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Aktif sekarang • Browser</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10">Active</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground text-center">
                Terakhir login: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bantuan & Panduan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-3" asChild>
                <Link href="/handbook">
                  <Shield size={18} />
                  Buku Panduan Pengguna (Handbook)
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3">
                <Shield size={18} />
                Hubungi Dukungan Yumna
              </Button>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Zona Bahaya</CardTitle>
              <CardDescription>Tindakan permanen terhadap akun Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="text-destructive hover:bg-destructive/10">
                Hapus Akun & Data Finansial
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
