"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Settings2, Trash2, Edit2, TrendingUp, ShieldCheck } from "lucide-react";
import { AddWalletModal } from "@/components/modals/add-wallet-modal";
import { ImportCSVModal } from "@/components/modals/import-csv-modal";
import useSWR, { mutate } from "swr";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";
import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";

export default function WalletsPage() {
  const { user } = useAuth();
  const { data: wallets, isLoading } = useSWR("/finance/wallets", (url) => 
    apiClient.get(url).then(res => res.data)
  );

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [walletToDelete, setWalletToDelete] = useState<string | null>(null);

  const totalBalance = wallets?.reduce((acc: number, w: any) => acc + Number(w.balance), 0) || 0;

  const handleDelete = async () => {
    if (!walletToDelete) return;
    try {
      await apiClient.delete(`/finance/wallets/${walletToDelete}`);
      toast.success("Dompet berhasil dihapus.");
      mutate("/finance/wallets");
      setDeleteConfirmOpen(false);
    } catch (error) {
      toast.error("Gagal menghapus dompet.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dompet Keluarga</h1>
          <p className="text-muted-foreground mt-1">Kelola sumber dana dan rekening keluarga Anda secara terpusat.</p>
        </div>
        <AddWalletModal />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary text-primary-foreground border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-80">Total Saldo Terkonsolidasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {totalBalance.toLocaleString('id-ID')}</div>
            <p className="text-xs mt-1 opacity-70 flex items-center gap-1">
              <ShieldCheck size={12} /> Terlindungi & Amanah
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Jumlah Sumber Dana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wallets?.length || 0} Akun</div>
            <p className="text-xs text-muted-foreground mt-1">Aktif & Terverifikasi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Informasi</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <p>• Rekening bank sinkron seminggu sekali.</p>
            <p>• Transaksi transfer antar dompet tidak dihitung pengeluaran.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
          ))
        ) : (
          wallets?.map((wallet: any) => (
            <Card key={wallet.id} className="group relative overflow-hidden hover:shadow-md transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Wallet size={20} />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ImportCSVModal walletId={wallet.id} />
                    <AddWalletModal wallet={wallet} />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        setWalletToDelete(wallet.id);
                        setDeleteConfirmOpen(true);
                      }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-lg">{wallet.name}</CardTitle>
                <CardDescription>{wallet.type} • {wallet.currency}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold mt-2">
                  Rp {Number(wallet.balance).toLocaleString('id-ID')}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Dompet?</DialogTitle>
            <DialogDescription>
              Tindakan ini tidak dapat dibatalkan. Riwayat transaksi di dompet ini akan tetap ada namun dompet tidak akan terlihat lagi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete}>Hapus Permanen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
