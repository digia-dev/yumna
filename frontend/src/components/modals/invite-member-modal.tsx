"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { UserPlus, Mail, ShieldCheck, Share2, MessageCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function InviteMemberModal({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("ANAK");
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulation of invitation API
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      toast.success(`Undangan berhasil dikirim ke ${email}`);
      setOpen(false);
      setEmail("");
    } catch {
      toast.error("Gagal mengirim undangan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-width-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus size={20} className="text-primary" />
            Undang Anggota Keluarga
          </DialogTitle>
          <DialogDescription>
            Kirimkan kode akses unik agar anggota keluarga Anda dapat bergabung dalam manajemen keuangan syariah.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleInvite} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Alamat Email</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="email@keluarga.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
              <Mail className="absolute left-3 top-2.5 text-muted-foreground" size={18} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Peran Keluarga</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih peran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ISTRI">Istri (Akses Penuh Laporan)</SelectItem>
                <SelectItem value="ANAK">Anak (Akses Terbatas)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <ShieldCheck size={12} /> Peran dapat diubah nanti oleh Kepala Keluarga.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Mengirim..." : "Kirim Undangan Amanah"}
          </Button>
        </form>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Atau bagikan lewat</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pb-4">
          <Button
            variant="outline"
            className="w-full border-emerald-light hover:bg-emerald-light/10 text-emerald-deep"
            onClick={() => {
              const text = encodeURIComponent(
                "Assalamualaikum! Ayah/Ibu ingin mengundang kamu bergabung di aplikasi Yumna untuk mengelola keuangan keluarga secara berkah. Masukkan kode: YMN-2026 di aplikasi ya!"
              );
              window.open(`https://wa.me/?text=${text}`, "_blank");
              toast.success("Membuka WhatsApp...");
            }}
          >
            <MessageCircle size={18} className="mr-2" />
            WhatsApp
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              navigator.clipboard.writeText("YMN-2026");
              toast.success("Kode undangan berhasil disalin!");
            }}
          >
            <Share2 size={18} className="mr-2" />
            Salin Kode
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
