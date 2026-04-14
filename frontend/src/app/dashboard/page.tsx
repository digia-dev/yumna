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
  MessageSquare,
  Bot,
  CheckSquare
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
  const { data: barakah } = useSWR("/gamification/barakah-score", fetcher);
  const { data: taskSummary } = useSWR("/tasks", fetcher);
  const { data: spendingComp } = useSWR("/finance/comparative-analytics", fetcher);

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

       {/* Barakah Coach Widget (Task 328) */}
       {barakah && (
         <div className="bg-gradient-to-r from-emerald-50 to-amber-50 p-6 rounded-3xl border border-emerald-100 shadow-sm flex flex-col md:flex-row items-center gap-6 animate-in slide-in-from-top-4 duration-500">
            <div className="relative shrink-0">
               <div className="w-20 h-20 rounded-2xl bg-white shadow-md flex items-center justify-center border-4 border-emerald-500/10">
                  <Bot size={40} className="text-emerald-700" />
               </div>
               <div className="absolute -bottom-2 -right-2 bg-amber-400 text-amber-950 text-[10px] font-black px-2 py-1 rounded-lg border-2 border-white shadow-sm">
                  LVL {barakah.level}
               </div>
            </div>
            <div className="flex-1 space-y-2 text-center md:text-left">
               <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  <h3 className="text-lg font-black text-emerald-950 uppercase tracking-tight">Pelacak Barakah Syariah</h3>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100/50 rounded-full border border-emerald-100">
                     <Sparkles size={12} className="text-amber-500" />
                     <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">{barakah.score} Points</span>
                  </div>
               </div>
               <p className="text-xs text-slate-600 font-medium max-w-2xl leading-relaxed">
                  Alhamdulillah! Keluarga <span className="font-bold text-emerald-900">{user?.name}</span> telah mencapai level {barakah.level}. 
                  {barakah.score < 500 ? " Teruslah mencatat untuk mencapai level berikutnya!" : " Keberkahan finansial Anda semakin kuat."}
               </p>
               <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-emerald-600 transition-all duration-1000" style={{ width: `${barakah.progress}%` }} />
               </div>
               <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Level {barakah.level}</span>
                  <span>{500 - (barakah.score % 500)} Poin menuju Level {barakah.level + 1}</span>
               </div>
            </div>
            <div className="flex gap-2">
               {barakah.achievements?.slice(0, 3).map((ach: string) => (
                  <div key={ach} className="w-10 h-10 rounded-xl bg-white border border-amber-200 flex items-center justify-center shadow-sm" title={ach}>
                     <Target size={18} className="text-amber-500" />
                  </div>
               ))}
               <Button variant="outline" size="sm" className="rounded-xl text-[10px] font-bold border-emerald-100 text-emerald-700 hover:bg-emerald-50">LIHAT BADGE</Button>
            </div>
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

        {/* Task Activity Widget (Task 381) */}
        <Card className="lg:col-span-1 border-none shadow-sm bg-white rounded-3xl overflow-hidden group">
           <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Amanah Keluarga</CardTitle>
                 <Link href="/dashboard/tasks">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-lg text-emerald-600">
                       <ArrowUpRight size={14} />
                    </Button>
                 </Link>
              </div>
           </CardHeader>
           <CardContent className="space-y-4">
              <div className="flex items-end justify-between">
                 <div>
                    <p className="text-2xl font-black text-slate-800">{taskSummary?.filter((t:any) => t.status !== 'COMPLETED').length || 0}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Tugas Pending</p>
                 </div>
                 <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <CheckSquare size={18} />
                 </div>
              </div>
              <div className="space-y-2">
                 {taskSummary?.filter((t:any) => t.status !== 'COMPLETED').slice(0, 2).map((task: any) => (
                    <div key={task.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100/50">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                       <span className="text-[10px] font-bold text-slate-600 line-clamp-1">{task.title}</span>
                    </div>
                 ))}
                 {(!taskSummary || taskSummary.filter((t:any) => t.status !== 'COMPLETED').length === 0) && (
                    <p className="text-[10px] italic text-slate-400 text-center py-2">Semua amanah tuntas! Alhamdulillah.</p>
                 )}
              </div>
           </CardContent>
        </Card>

        {/* Comparative Spending Analysis (Task 384) */}
        {spendingComp && (
           <Card className="lg:col-span-1 border-none shadow-sm bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl overflow-hidden relative group">
              <CardHeader className="pb-2 relative z-10">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Analisis Belanja</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
                 <div className="flex items-center justify-between">
                    <div>
                       <p className="text-2xl font-black">{spendingComp.percent > 0 ? '+' : ''}{spendingComp.percent}%</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">vs Bulan Lalu</p>
                    </div>
                    <div className={`p-2 rounded-xl ${spendingComp.percent > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                       <TrendingUp size={20} className={spendingComp.percent > 0 ? 'rotate-0' : 'rotate-180'} />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                       <span className="text-slate-400">Bulan Ini</span>
                       <span>Rp {spendingComp.currentMonth.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                       <div 
                          className={`h-full transition-all duration-1000 ${spendingComp.percent > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                          style={{ width: `${Math.min(100, (spendingComp.currentMonth / (spendingComp.prevMonth || 1)) * 100)}%` }} 
                       />
                    </div>
                 </div>
                 <p className="text-[9px] text-slate-400 italic leading-relaxed">
                    {spendingComp.percent > 0 
                      ? "Astaghfirullah, pengeluaran meningkat. Mari lebih hemat!" 
                      : "Alhamdulillah, pengeluaran terkendali. Lanjutkan!"}
                 </p>
              </CardContent>
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                 <TrendingUp size={80} />
              </div>
           </Card>
        )}
      </div>

      {/* Upcoming Bills (Task 389) */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-display flex items-center gap-2 text-rose-950">
          <AlertCircle size={20} className="text-rose-500" />
          Tagihan Mendatang
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {transactions?.filter((tx:any) => tx.type === 'EXPENSE' && new Date(tx.date) > new Date()).map((bill: any) => (
             <Card key={bill.id} className="rounded-3xl border-rose-100 bg-rose-50/30 shadow-none">
                <CardContent className="p-4 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-rose-500 border border-rose-100">
                         <History size={18} />
                      </div>
                      <div>
                         <p className="text-xs font-black text-rose-950">{bill.category}</p>
                         <p className="text-[10px] text-rose-700/60 font-medium">{new Date(bill.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-sm font-black text-rose-950">Rp {Number(bill.amount).toLocaleString()}</p>
                      <Badge variant="outline" className="text-[8px] border-rose-200 text-rose-600 uppercase font-black py-0">Belum Bayar</Badge>
                   </div>
                </CardContent>
             </Card>
           ))}
           {(!transactions || transactions.filter((tx:any) => tx.type === 'EXPENSE' && new Date(tx.date) > new Date()).length === 0) && (
             <div className="col-span-full py-6 text-center bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tidak ada tagihan mendesak.</p>
             </div>
           )}
        </div>
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
