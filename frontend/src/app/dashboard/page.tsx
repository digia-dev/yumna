/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  History, 
  TrendingUp,
  LayoutDashboard,
  Coins
} from "lucide-react";
import useSWR from "swr";
import apiClient from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils"; // Assuming I have this or I'll add it
import { Loader2 } from "lucide-react";
import { WelcomeWalkthrough } from "@/components/onboarding/walkthrough";

const fetcher = (url: string) => apiClient.get(url).then((res) => res.data);

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: wallets, isLoading: isLoadingWallets } = useSWR("/finance/wallets", fetcher);
  const { data: transactions, isLoading: isLoadingTx } = useSWR("/finance/transactions", fetcher);

  const totalBalance = wallets?.reduce((acc: number, w: any) => acc + Number(w.balance), 0) || 0;

  if (isLoadingWallets || isLoadingTx) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <WelcomeWalkthrough />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display flex items-center gap-2">
            <LayoutDashboard className="text-primary" />
            Ringkasan Keberkahan
          </h1>
          <p className="text-muted-foreground italic">Assalamu'alaikum, {user?.name}. Mari awali hari dengan niat terbaik.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-primary/20 text-primary">
            <Plus size={18} className="mr-2" />
            Tambah Dompet
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <TrendingUp size={18} className="mr-2" />
            Catat Transaksi
          </Button>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 bg-primary text-white overflow-hidden relative premium-gradient border-none">
          <CardHeader className="relative z-10">
            <CardTitle className="text-primary-foreground/80 font-medium">Total Saldo Keluarga</CardTitle>
            <div className="text-4xl md:text-5xl font-bold mt-2">
              Rp {totalBalance.toLocaleString('id-ID')}
            </div>
          </CardHeader>
          <CardContent className="relative z-10 pb-8">
            <div className="flex items-center gap-4 text-primary-foreground/90">
              <div className="flex items-center gap-1">
                <ArrowUpRight size={16} className="text-emerald-300" />
                <span className="text-sm">+12% Bulan ini</span>
              </div>
              <div className="h-4 w-[1px] bg-white/20" />
              <div className="flex items-center gap-1">
                <Coins size={16} className="text-gold-islamic" />
                <span className="text-sm">Siap Zakat: Rp 1.2M</span>
              </div>
            </div>
          </CardContent>
          {/* Decorative background pattern */}
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Wallet size={160} />
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-lg">Kesehatan Keuangan</CardTitle>
            <CardDescription>Berdasarkan alokasi kebutuhan pokok</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Alokasi Terpakai</span>
                <span className="font-semibold">65%</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground italic">
              "Kesehatan finansial terjaga, hati pun menjadi tenang."
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-display flex items-center gap-2">
              <History size={20} className="text-primary" />
              Transaksi Terakhir
            </h2>
            <Button variant="link" className="text-primary">Lihat Semua</Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {transactions && transactions.length > 0 ? (
                  transactions.slice(0, 5).map((tx: any) => (
                    <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${tx.type === 'INCOME' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {tx.type === 'INCOME' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                        </div>
                        <div>
                          <p className="font-semibold">{tx.description || tx.category}</p>
                          <p className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString('id-ID')}</p>
                        </div>
                      </div>
                      <div className={`font-bold ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-foreground'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'} Rp {Number(tx.amount).toLocaleString('id-ID')}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    Belum ada transaksi di database.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Wallets List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold font-display flex items-center gap-2">
            <Wallet size={20} className="text-primary" />
            Dompet & Aset
          </h2>
          <div className="space-y-4">
            {wallets?.map((wallet: any) => (
              <Card key={wallet.id} className="hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{wallet.name}</p>
                    <p className="text-lg font-bold">
                      Rp {Number(wallet.balance).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                    {wallet.currency}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
