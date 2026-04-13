/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Wallet, 
  ArrowUpRight, 
  History, 
  TrendingUp,
  Zap,
  LayoutDashboard,
  Coins,
  PieChart,
  Target,
  BookOpen,
  Users,
  AlertCircle,
  Sparkles,
  Moon,
  MessageSquare
} from "lucide-react";
import useSWR, { mutate } from 'swr';
import Link from 'next/link';
import apiClient from "@/lib/api-client";
import { Loader2 } from "lucide-react";
import { WelcomeWalkthrough } from "@/components/onboarding/walkthrough";
import { AddWalletModal } from "@/components/modals/add-wallet-modal";
import { AddTransactionModal } from "@/components/modals/add-transaction-modal";
import { TransferFundsModal } from "@/components/modals/transfer-funds-modal";
import { WalletCard } from "@/components/finance/wallet-card";
import { TransactionRow } from "@/components/finance/transaction-row";
import { BudgetingOverview } from "@/components/finance/budget-overview";
import { SavingsGoalWidget } from "@/components/finance/savings-goal-widget";
import { CashFlowChart } from "@/components/finance/cash-flow-chart";
import { CategoryDonutChart } from "@/components/finance/category-donut-chart";
import { QuickTransactionActions } from "@/components/finance/quick-actions";
import { PrayerTimesWidget } from "@/components/religi/prayer-times-widget";
import { RamadanModeToggle } from "@/components/layout/ramadan-mode-toggle";
import { toast } from "sonner";

const fetcher = (url: string) => apiClient.get(url).then((res) => res.data);

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: wallets, isLoading: isLoadingWallets } = useSWR("/finance/wallets", fetcher);
  const { data: transactions, isLoading: isLoadingTx } = useSWR("/finance/transactions", fetcher);
  const { data: quote } = useSWR("/zakat/quotes", fetcher);
  const { data: reminders } = useSWR("/zakat/reminders", fetcher);
  const { data: nisab } = useSWR("/zakat/nisab", fetcher);

  const totalBalance = wallets?.reduce((acc: number, w: { balance: number }) => acc + Number(w.balance), 0) || 0;

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
      {/* Islamic Quote Widget */}
      {quote && (
        <div className="bg-emerald-900 border-l-4 border-amber-400 p-4 rounded-xl shadow-lg flex items-center gap-4 text-emerald-50">
           <div className="p-2 bg-emerald-800 rounded-full">
             <BookOpen size={20} className="text-amber-400" />
           </div>
           <p className="text-sm italic font-medium leading-relaxed">
             &quot;{quote.text}&quot; — <span className="font-bold text-amber-200">{quote.author}</span>
           </p>
        </div>
      )}

      {/* Reminders Bar */}
      {reminders?.length > 0 && (
         <div className="flex flex-col gap-2">
           {reminders.map((r: { title: string; message: string; action: string }, i: number) => (
             <div key={i} className="bg-amber-100 border border-amber-200 p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-amber-600" size={18} />
                  <div>
                    <h4 className="text-xs font-bold text-amber-900">{r.title}</h4>
                    <p className="text-[10px] text-amber-800">{r.message}</p>
                  </div>
                </div>
                <Link href={r.action}>
                  <Button size="sm" variant="ghost" className="h-7 text-[10px] font-bold text-amber-900 hover:bg-amber-200">
                    Cek Zakat Sekarang
                  </Button>
                </Link>
             </div>
           ))}
         </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display flex items-center gap-2">
            <LayoutDashboard className="text-primary" />
            Ringkasan Keberkahan
          </h1>
          <p className="text-muted-foreground italic">Assalamu&apos;alaikum, {user?.name}. Mari awali hari dengan niat terbaik.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <RamadanModeToggle />
              <TransferFundsModal />
              <AddTransactionModal />
            </div>
          <AddWalletModal />
        </div>
      </div>

      {/* Hero Stats & Prayer Times */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-2 bg-primary text-white overflow-hidden relative premium-gradient border-none">
          <CardHeader className="relative z-10">
            <CardTitle className="text-primary-foreground/80 font-medium text-xs uppercase tracking-wider">Total Saldo Keluarga</CardTitle>
            <div className="text-4xl md:text-5xl font-bold mt-2">
              Rp {totalBalance.toLocaleString('id-ID')}
            </div>
          </CardHeader>
          <CardContent className="relative z-10 pb-8">
            <div className="flex items-center gap-4 text-primary-foreground/90">
              <div className="flex items-center gap-1">
                <ArrowUpRight size={16} className="text-emerald-300" />
                <span className="text-xs">+12% Bulan ini</span>
              </div>
              <div className="h-4 w-px bg-white/20" />
              <div className="flex items-center gap-1">
                <Coins size={16} className="text-gold-islamic" />
                <span className="text-xs">Batas Nisab: Rp {nisab?.maal?.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Wallet size={160} />
          </div>
        </Card>

        <div className="lg:col-span-1">
          <PrayerTimesWidget />
        </div>

        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Anggaran</CardTitle>
              <PieChart size={18} className="text-primary" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <BudgetingOverview />
            <p className="text-[10px] text-muted-foreground italic pt-2 border-t">
              &quot;Aturlah hartamu, agar ia tidak mengaturmu.&quot;
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-display flex items-center gap-2">
            <Zap size={20} className="text-amber-500" />
            Catat Cepat
          </h2>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Pilih Dompet Utama</p>
        </div>
        <QuickTransactionActions walletId={wallets && wallets.length > 0 ? wallets[0].id : undefined} />
      </div>

      {/* Savings Goals */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-display flex items-center gap-2">
          <Target size={20} className="text-secondary" />
          Impian Keluarga (Saving Goals)
        </h2>
        <SavingsGoalWidget />
      </div>

      {/* Analytics Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-display flex items-center gap-2">
          <TrendingUp size={20} className="text-primary" />
          Analisis Keuangan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CashFlowChart />
          <CategoryDonutChart />
        </div>
      </div>

      {/* Islamic Tools Navigation */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-display flex items-center gap-2">
            <Sparkles size={20} className="text-amber-500" />
            Pusat Keberkahan (Islamic Tools)
          </h2>
          <Link href="/dashboard/islamic-tools">
            <Button variant="link" className="text-primary h-auto p-0 font-bold text-xs uppercase tracking-wider">Buka Hub Alat</Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
           {[
             { name: 'Zakat Hub', icon: <Coins size={20} />, href: '/dashboard/zakat', color: 'bg-emerald-50 text-emerald-700' },
             { name: 'Ibadah Hub', icon: <Moon size={20} />, href: '/dashboard/religi', color: 'bg-blue-50 text-blue-700' },
             { name: 'Hutang Sunnah', icon: <History size={20} />, href: '/dashboard/debts', color: 'bg-red-50 text-red-700' },
             { name: 'Waris (Faraid)', icon: <Users size={20} />, href: '/dashboard/zakat/waris', color: 'bg-amber-50 text-amber-700' },
             { name: 'Syura Notes', icon: <MessageSquare size={20} />, href: '/dashboard/syura', color: 'bg-purple-50 text-purple-700' },
             { name: 'Glosarium', icon: <BookOpen size={20} />, href: '/dashboard/zakat/glossary', color: 'bg-slate-50 text-slate-700' },
           ].map((tool, i) => (
             <Link key={i} href={tool.href}>
                <Card className={`p-4 hover:shadow-lg transition-all border-none ${tool.color} flex flex-col items-center justify-center text-center group`}>
                   <div className="mb-2 group-hover:scale-110 transition-transform">
                      {tool.icon}
                   </div>
                   <span className="text-[10px] font-bold uppercase tracking-tighter">{tool.name}</span>
                </Card>
             </Link>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-display flex items-center gap-2">
              <History size={20} className="text-primary" />
              Transaksi Terakhir
            </h2>
            <Link href="/dashboard/transactions">
              <Button variant="link" className="text-primary">Lihat Semua</Button>
            </Link>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {transactions && transactions.length > 0 ? (
                  transactions.slice(0, 5).map((tx: any) => (
                    <TransactionRow 
                      key={tx.id} 
                      transaction={tx}
                      onDelete={async (id) => {
                        if (confirm('Yakin ingin menghapus transaksi ini?')) {
                          try {
                            await apiClient.delete(`/finance/transactions/${id}`);
                            mutate("/finance/transactions");
                            mutate("/finance/wallets");
                            toast.success("Transaksi dihapus.");
                          } catch {
                            toast.error("Gagal menghapus.");
                          }
                        }
                      }}
                    />
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
              <WalletCard key={wallet.id} wallet={wallet} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
