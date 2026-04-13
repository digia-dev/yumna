"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InviteMemberModal } from "@/components/modals/invite-member-modal";
import { FamilyQRCode } from "@/components/family/family-qr-code";
import { FamilyGallery } from "@/components/family/family-gallery";
import { Settings, Users, Shield, UserPlus, Pencil, Loader2 } from "lucide-react";
import useSWR from "swr";
import apiClient from "@/lib/api-client";
import { useState } from "react";
import { toast } from "sonner";

const fetcher = (url: string) => apiClient.get(url).then((res: any) => res.data);

export default function FamilySettingsPage() {
  const { isKepalaKeluarga } = useAuth();
  const { data: family, error, mutate, isLoading } = useSWR("/family/me", fetcher);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newFamName, setNewFamName] = useState("");

  const handleUpdateName = async () => {
    if (!newFamName) return;
    setIsUpdating(true);
    try {
      await apiClient.patch("/family/me", { name: newFamName });
      toast.success("Nama keluarga berhasil diperbarui");
      mutate(); // Refresh data
    } catch (err) {
      toast.error("Gagal memperbarui nama keluarga");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Gagal memuat data keluarga.</p>
        <Button onClick={() => mutate()} variant="link">Coba Lagi</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display">Manajemen Keluarga</h1>
          <p className="text-muted-foreground">Atur identitas dan akses anggota keluarga Anda</p>
        </div>
        {isKepalaKeluarga && (
          <div className="flex items-center gap-3">
            <FamilyQRCode familyId={family?.id} familyName={family?.name} />
            <InviteMemberModal>
              <Button className="bg-primary hover:bg-primary/90">
                <UserPlus size={18} className="mr-2" />
                Undang Anggota
              </Button>
            </InviteMemberModal>
          </div>
        )}
      </div>

      <div className="mt-8">
        <FamilyGallery />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Family Identity Settings */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings size={20} className="text-primary" />
                Identitas Keluarga
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="famName">Nama Keluarga</Label>
                <div className="relative">
                  <Input 
                    id="famName" 
                    defaultValue={family?.name} 
                    onChange={(e) => setNewFamName(e.target.value)}
                    disabled={!isKepalaKeluarga || isUpdating}
                    className={isKepalaKeluarga ? "pr-10" : ""}
                  />
                  {isKepalaKeluarga && (
                    <Pencil className="absolute right-3 top-2.5 text-muted-foreground" size={16} />
                  )}
                </div>
              </div>
              {isKepalaKeluarga && (
                <Button 
                  className="w-full" 
                  onClick={handleUpdateName} 
                  disabled={isUpdating || !newFamName || newFamName === family?.name}
                >
                  {isUpdating ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-3 bg-primary/10 rounded-full text-primary">
                  <Shield size={24} />
                </div>
                <h3 className="font-bold">Keamanan Syariah</h3>
                <p className="text-xs text-muted-foreground">
                  Data transaksi Anda dienkripsi dan hanya dapat diakses oleh anggota keluarga sah.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Member List */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={20} className="text-primary" />
                Anggota Keluarga ({family?.members?.length || 0})
              </CardTitle>
              <CardDescription>Daftar anggota yang terhubung dalam ekosistem Sakinah</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {family?.members?.map((member: any) => (
                  <div key={member.id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={member.image} />
                        <AvatarFallback>{member.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          {member.name}
                          <Badge variant="outline" className="text-[10px] font-normal uppercase tracking-wider">
                            {member.role?.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">{member.email}</div>
                      </div>
                    </div>
                    {isKepalaKeluarga && member.role !== 'KEPALA_KELUARGA' && (
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                        Atur Akses
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
