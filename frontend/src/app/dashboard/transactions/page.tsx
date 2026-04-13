"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Download, 
  Inbox,
  Loader2
} from "lucide-react";
import useSWR from "swr";
import apiClient from "@/lib/api-client";
import { TransactionRow } from "@/components/finance/transaction-row";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const fetcher = (url: string) => apiClient.get(url).then((res) => res.data);

export default function TransactionsPage() {
  useAuth();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const { data: transactions, isLoading, mutate } = useSWR("/finance/transactions", fetcher);

  const filteredTransactions = transactions?.filter((tx: { description?: string; category?: string; type?: string }) => {
    const matchesSearch = tx.description?.toLowerCase().includes(search.toLowerCase()) || 
                         tx.category?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "ALL" || tx.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleExport = async () => {
    try {
      const response = await apiClient.get("/finance/transactions/export", { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transaksi-yumna-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Data berhasil diekspor.");
    } catch {
      toast.error("Gagal mengekspor data.");
    }
  };

  if (isLoading) return (
    <div className="flex h-[50vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Semua Transaksi</h1>
          <p className="text-muted-foreground text-sm italic">Riwayat kebaikan dan amanah harta keluarga.</p>
        </div>
        <Button variant="outline" className="gap-2 border-2" onClick={handleExport}>
          <Download size={18} />
          Ekspor CSV
        </Button>
      </div>

      <Card className="border-2">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              placeholder="Cari deskripsi atau kategori..." 
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Jenis Transaksi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Jenis</SelectItem>
                <SelectItem value="INCOME">Pemasukan</SelectItem>
                <SelectItem value="EXPENSE">Pengeluaran</SelectItem>
                <SelectItem value="TRANSFER">Pindah Dana</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 overflow-hidden">
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredTransactions && filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx: any) => (
                <TransactionRow 
                  key={tx.id} 
                  transaction={tx}
                  onDelete={async (id) => {
                    if (confirm('Hapus transaksi ini?')) {
                      await apiClient.delete(`/finance/transactions/${id}`);
                      mutate();
                      toast.success("Transaksi dihapus.");
                    }
                  }}
                />
              ))
            ) : (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-2">
                <Inbox size={48} className="opacity-20" />
                <p>Tidak ada transaksi yang ditemukan.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
