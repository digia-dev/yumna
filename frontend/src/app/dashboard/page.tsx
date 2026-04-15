/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Wallet, ArrowUpRight, History, TrendingUp, Zap, LayoutDashboard,
  Coins, PieChart, Target, BookOpen, Users, AlertCircle, Sparkles,
  Moon, MessageSquare, Bot, CheckSquare, GripVertical, SlidersHorizontal,
  ChevronDown, X, Eye, EyeOff,
} from "lucide-react";
import useSWR, { mutate } from "swr";
import Link from "next/link";
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
import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const fetcher = (url: string) => apiClient.get(url).then((res) => res.data);

// ── 394 Widget Registry ────────────────────────────────────────────────────
const WIDGET_REGISTRY = [
  { id: "hero",       label: "Saldo & Waktu Sholat",      defaultVisible: true  },
  { id: "barakah",    label: "Pelacak Barakah",            defaultVisible: true  },
  { id: "tasks",      label: "Amanah (Tugas)",             defaultVisible: true  },
  { id: "spending",   label: "Analisis Belanja",           defaultVisible: true  },
  { id: "quickadd",   label: "Catat Cepat",                defaultVisible: true  },
  { id: "savings",    label: "Saving Goals",               defaultVisible: true  },
  { id: "analytics",  label: "Grafik Keuangan",            defaultVisible: true  },
  { id: "islamictools",label: "Pusat Keberkahan",          defaultVisible: true  },
  { id: "transactions",label: "Transaksi & Dompet",        defaultVisible: true  },
  { id: "bills",      label: "Tagihan Mendatang",          defaultVisible: true  },
];

const LS_ORDER_KEY   = "yumna:dashboard:widget-order";
const LS_VISIBLE_KEY = "yumna:dashboard:widget-visible";

function loadOrder(): string[] {
  try {
    const raw = localStorage.getItem(LS_ORDER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return WIDGET_REGISTRY.map(w => w.id);
}

function loadVisible(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(LS_VISIBLE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return Object.fromEntries(WIDGET_REGISTRY.map(w => [w.id, w.defaultVisible]));
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: wallets, isLoading: isLoadingWallets } = useSWR("/finance/wallets", fetcher);
  const { data: allTransactions, isLoading: isLoadingTx } = useSWR("/finance/transactions", fetcher);
  const { data: quote }       = useSWR("/zakat/quotes",               fetcher);
  const { data: reminders }   = useSWR("/zakat/reminders",            fetcher);
  const { data: nisab }       = useSWR("/zakat/nisab",                fetcher);
  const { data: barakah }     = useSWR("/gamification/barakah-score", fetcher);
  const { data: taskSummary } = useSWR("/tasks",                      fetcher);
  const { data: spendingComp }= useSWR("/finance/comparative-analytics", fetcher);

  // ── 395 Wallet Filter ──────────────────────────────────────────────────
  const [selectedWalletId, setSelectedWalletId] = useState<string>("all");
  const [walletFilterOpen, setWalletFilterOpen] = useState(false);

  const filteredTransactions = selectedWalletId === "all"
    ? allTransactions
    : allTransactions?.filter((tx: any) => tx.walletId === selectedWalletId || tx.targetWalletId === selectedWalletId);

  const filteredBalance = selectedWalletId === "all"
    ? wallets?.reduce((acc: number, w: any) => acc + Number(w.balance), 0) || 0
    : Number(wallets?.find((w: any) => w.id === selectedWalletId)?.balance || 0);

  const selectedWalletName = selectedWalletId === "all"
    ? "Semua Dompet"
    : wallets?.find((w: any) => w.id === selectedWalletId)?.name || "Dompet";

  // ── 394 Dynamic Dashboard ─────────────────────────────────────────────
  const [widgetOrder, setWidgetOrder] = useState<string[]>([]);
  const [visibleWidgets, setVisibleWidgets] = useState<Record<string, boolean>>({});
  const [showWidgetManager, setShowWidgetManager] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId]   = useState<string | null>(null);
  const isDirty = useRef(false);

  useEffect(() => {
    setWidgetOrder(loadOrder());
    setVisibleWidgets(loadVisible());
  }, []);

  const saveLayout = useCallback((order: string[], visible: Record<string, boolean>) => {
    localStorage.setItem(LS_ORDER_KEY,   JSON.stringify(order));
    localStorage.setItem(LS_VISIBLE_KEY, JSON.stringify(visible));
  }, []);

  const handleDragStart = (id: string) => {
    setDraggingId(id);
    isDirty.current = true;
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (id !== draggingId) setDragOverId(id);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggingId || draggingId === targetId) return;
    const newOrder = [...widgetOrder];
    const fromIdx  = newOrder.indexOf(draggingId);
    const toIdx    = newOrder.indexOf(targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, draggingId);
    setWidgetOrder(newOrder);
    saveLayout(newOrder, visibleWidgets);
    setDraggingId(null);
    setDragOverId(null);
    toast.success("Layout dashboard disimpan ✨");
  };

  const handleDragEnd = () => { setDraggingId(null); setDragOverId(null); };

  const toggleWidget = (id: string) => {
    const next = { ...visibleWidgets, [id]: !visibleWidgets[id] };
    setVisibleWidgets(next);
    saveLayout(widgetOrder, next);
  };

  const resetLayout = () => {
    const defaultOrder   = WIDGET_REGISTRY.map(w => w.id);
    const defaultVisible = Object.fromEntries(WIDGET_REGISTRY.map(w => [w.id, w.defaultVisible]));
    setWidgetOrder(defaultOrder);
    setVisibleWidgets(defaultVisible);
    saveLayout(defaultOrder, defaultVisible);
    toast.success("Layout direset ke default.");
  };

  const isVisible = (id: string) => visibleWidgets[id] !== false;

  if (isLoadingWallets || isLoadingTx) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // ── Widget render map ──────────────────────────────────────────────────
  const renderWidget = (id: string) => {
    if (!isVisible(id)) return null;

    switch (id) {
      // ── HERO ───────────────────────────────────────────────────────────
      case "hero": return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-2 bg-primary text-white overflow-hidden relative premium-gradient border-none">
            <CardHeader className="relative z-10">
              <CardTitle className="text-primary-foreground/80 font-medium text-xs uppercase tracking-wider">
                {selectedWalletId === "all" ? "Total Saldo Keluarga" : `Saldo: ${selectedWalletName}`}
              </CardTitle>
              <div className="text-4xl md:text-5xl font-bold mt-2">
                Rp {filteredBalance.toLocaleString("id-ID")}
              </div>
            </CardHeader>
            <CardContent className="relative z-10 pb-8">
              <div className="flex items-center gap-4 text-primary-foreground/90 flex-wrap">
                <div className="flex items-center gap-1">
                  <ArrowUpRight size={16} className="text-emerald-300" />
                  <span className="text-xs">+12% Bulan ini</span>
                </div>
                <div className="h-4 w-px bg-white/20 hidden md:block" />
                <div className="flex items-center gap-1">
                  <Coins size={16} className="text-gold-islamic" />
                  <span className="text-xs">Nisab: Rp {nisab?.maal?.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
            <div className="absolute top-0 right-0 p-8 opacity-10"><Wallet size={160} /></div>
          </Card>
          <div className="lg:col-span-1"><PrayerTimesWidget /></div>
          <Card className="lg:col-span-1 flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Anggaran</CardTitle>
                <PieChart size={18} className="text-primary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
              <BudgetingOverview />
              <p className="text-[10px] text-muted-foreground italic pt-2 border-t">&quot;Aturlah hartamu, agar ia tidak mengaturmu.&quot;</p>
            </CardContent>
          </Card>
        </div>
      );

      // ── BARAKAH ────────────────────────────────────────────────────────
      case "barakah": return barakah ? (
        <div className="bg-gradient-to-r from-emerald-50 to-amber-50 p-6 rounded-3xl border border-emerald-100 shadow-sm flex flex-col md:flex-row items-center gap-6">
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
      ) : null;

      // ── TASKS + SPENDING ───────────────────────────────────────────────
      case "tasks": return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1 border-none shadow-sm bg-white rounded-3xl overflow-hidden group">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Amanah Keluarga</CardTitle>
                <Link href="/dashboard/tasks">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-lg text-emerald-600"><ArrowUpRight size={14} /></Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-black text-slate-800">{taskSummary?.filter((t: any) => t.status !== "COMPLETED").length || 0}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Tugas Pending</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <CheckSquare size={18} />
                </div>
              </div>
              <div className="space-y-2">
                {taskSummary?.filter((t: any) => t.status !== "COMPLETED").slice(0, 2).map((task: any) => (
                  <div key={task.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-[10px] font-bold text-slate-600 line-clamp-1">{task.title}</span>
                  </div>
                ))}
                {(!taskSummary || taskSummary.filter((t: any) => t.status !== "COMPLETED").length === 0) && (
                  <p className="text-[10px] italic text-slate-400 text-center py-2">Semua amanah tuntas! Alhamdulillah.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      );

      // ── SPENDING ANALYSIS ──────────────────────────────────────────────
      case "spending": return spendingComp ? (
        <Card className="border-none shadow-sm bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl overflow-hidden relative group">
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Analisis Belanja</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black">{spendingComp.percent > 0 ? "+" : ""}{spendingComp.percent}%</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">vs Bulan Lalu</p>
              </div>
              <div className={`p-2 rounded-xl ${spendingComp.percent > 0 ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                <TrendingUp size={20} className={spendingComp.percent > 0 ? "rotate-0" : "rotate-180"} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-slate-400">Bulan Ini</span>
                <span>Rp {spendingComp.currentMonth.toLocaleString()}</span>
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-1000 ${spendingComp.percent > 0 ? "bg-rose-500" : "bg-emerald-500"}`}
                  style={{ width: `${Math.min(100, (spendingComp.currentMonth / (spendingComp.prevMonth || 1)) * 100)}%` }} />
              </div>
            </div>
            <p className="text-[9px] text-slate-400 italic leading-relaxed">
              {spendingComp.percent > 0 ? "Astaghfirullah, pengeluaran meningkat. Mari lebih hemat!" : "Alhamdulillah, pengeluaran terkendali. Lanjutkan!"}
            </p>
          </CardContent>
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><TrendingUp size={80} /></div>
        </Card>
      ) : null;

      // ── BILLS ──────────────────────────────────────────────────────────
      case "bills": return (
        <div className="space-y-4">
          <h2 className="text-xl font-bold font-display flex items-center gap-2 text-rose-950">
            <AlertCircle size={20} className="text-rose-500" /> Tagihan Mendatang
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTransactions?.filter((tx: any) => tx.type === "EXPENSE" && new Date(tx.date) > new Date()).map((bill: any) => (
              <Card key={bill.id} className="rounded-3xl border-rose-100 bg-rose-50/30 shadow-none">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-rose-500 border border-rose-100">
                      <History size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-rose-950">{bill.category}</p>
                      <p className="text-[10px] text-rose-700/60 font-medium">{new Date(bill.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-rose-950">Rp {Number(bill.amount).toLocaleString()}</p>
                    <Badge variant="outline" className="text-[8px] border-rose-200 text-rose-600 uppercase font-black py-0">Belum Bayar</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            {(!filteredTransactions || filteredTransactions.filter((tx: any) => tx.type === "EXPENSE" && new Date(tx.date) > new Date()).length === 0) && (
              <div className="col-span-full py-6 text-center bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tidak ada tagihan mendesak.</p>
              </div>
            )}
          </div>
        </div>
      );

      // ── QUICK ADD ──────────────────────────────────────────────────────
      case "quickadd": return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-display flex items-center gap-2">
              <Zap size={20} className="text-amber-500" /> Catat Cepat
            </h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
              {selectedWalletId !== "all" ? `Dompet: ${selectedWalletName}` : "Pilih Dompet Utama"}
            </p>
          </div>
          <QuickTransactionActions walletId={selectedWalletId !== "all" ? selectedWalletId : (wallets?.[0]?.id)} />
        </div>
      );

      // ── SAVINGS ────────────────────────────────────────────────────────
      case "savings": return (
        <div className="space-y-4">
          <h2 className="text-xl font-bold font-display flex items-center gap-2">
            <Target size={20} className="text-secondary" /> Impian Keluarga (Saving Goals)
          </h2>
          <SavingsGoalWidget />
        </div>
      );

      // ── ANALYTICS ─────────────────────────────────────────────────────
      case "analytics": return (
        <div className="space-y-4">
          <h2 className="text-xl font-bold font-display flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" /> Analisis Keuangan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CashFlowChart />
            <CategoryDonutChart />
          </div>
        </div>
      );

      // ── ISLAMIC TOOLS ──────────────────────────────────────────────────
      case "islamictools": return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-display flex items-center gap-2">
              <Sparkles size={20} className="text-amber-500" /> Pusat Keberkahan (Islamic Tools)
            </h2>
            <Link href="/dashboard/islamic-tools">
              <Button variant="link" className="text-primary h-auto p-0 font-bold text-xs uppercase tracking-wider">Buka Hub Alat</Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: "Zakat Hub",    icon: <Coins size={20} />,       href: "/dashboard/zakat",          color: "bg-emerald-50 text-emerald-700" },
              { name: "Ibadah Hub",   icon: <Moon size={20} />,        href: "/dashboard/religi",         color: "bg-blue-50 text-blue-700" },
              { name: "Hutang",       icon: <History size={20} />,     href: "/dashboard/debts",          color: "bg-red-50 text-red-700" },
              { name: "Waris",        icon: <Users size={20} />,       href: "/dashboard/zakat/waris",    color: "bg-amber-50 text-amber-700" },
              { name: "Syura",        icon: <MessageSquare size={20}/>, href: "/dashboard/syura",         color: "bg-purple-50 text-purple-700" },
              { name: "Glosarium",   icon: <BookOpen size={20} />,     href: "/dashboard/zakat/glossary", color: "bg-slate-50 text-slate-700" },
            ].map((tool, i) => (
              <Link key={i} href={tool.href}>
                <Card className={`p-4 hover:shadow-lg transition-all border-none ${tool.color} flex flex-col items-center justify-center text-center group cursor-pointer`}>
                  <div className="mb-2 group-hover:scale-110 transition-transform">{tool.icon}</div>
                  <span className="text-[10px] font-bold uppercase tracking-tighter">{tool.name}</span>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      );

      // ── TRANSACTIONS + WALLETS ─────────────────────────────────────────
      case "transactions": return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold font-display flex items-center gap-2">
                <History size={20} className="text-primary" /> Transaksi Terakhir
                {selectedWalletId !== "all" && (
                  <Badge className="text-[9px] bg-emerald-100 text-emerald-700 border-none rounded-full font-black">{selectedWalletName}</Badge>
                )}
              </h2>
              <Link href="/dashboard/transactions">
                <Button variant="link" className="text-primary">Lihat Semua</Button>
              </Link>
            </div>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredTransactions && filteredTransactions.length > 0 ? (
                    filteredTransactions.slice(0, 5).map((tx: any) => (
                      <TransactionRow
                        key={tx.id}
                        transaction={tx}
                        onDelete={async (id) => {
                          if (confirm("Yakin ingin menghapus transaksi ini?")) {
                            try {
                              await apiClient.delete(`/finance/transactions/${id}`);
                              mutate("/finance/transactions");
                              mutate("/finance/wallets");
                              toast.success("Transaksi dihapus.");
                            } catch { toast.error("Gagal menghapus."); }
                          }
                        }}
                      />
                    ))
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">Belum ada transaksi.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-bold font-display flex items-center gap-2">
              <Wallet size={20} className="text-primary" /> Dompet & Aset
            </h2>
            <div className="space-y-4">
              {wallets?.filter((w: any) => selectedWalletId === "all" || w.id === selectedWalletId).map((wallet: any) => (
                <WalletCard key={wallet.id} wallet={wallet} />
              ))}
            </div>
          </div>
        </div>
      );

      default: return null;
    }
  };

  return (
    <div className="space-y-8 pb-8">
      <WelcomeWalkthrough />

      {/* Islamic Quote */}
      {quote && (
        <div className="bg-emerald-900 border-l-4 border-amber-400 p-4 rounded-xl shadow-lg flex items-center gap-4 text-emerald-50">
          <div className="p-2 bg-emerald-800 rounded-full"><BookOpen size={20} className="text-amber-400" /></div>
          <p className="text-sm italic font-medium leading-relaxed">
            &quot;{quote.text}&quot; — <span className="font-bold text-amber-200">{quote.author}</span>
          </p>
        </div>
      )}

      {/* Reminders Bar */}
      {reminders?.length > 0 && (
        <div className="flex flex-col gap-2">
          {reminders.map((r: any, i: number) => (
            <div key={i} className="bg-amber-100 border border-amber-200 p-3 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-amber-600" size={18} />
                <div>
                  <h4 className="text-xs font-bold text-amber-900">{r.title}</h4>
                  <p className="text-[10px] text-amber-800">{r.message}</p>
                </div>
              </div>
              <Link href={r.action}>
                <Button size="sm" variant="ghost" className="h-7 text-[10px] font-bold text-amber-900 hover:bg-amber-200">Cek Zakat Sekarang</Button>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* ── Header with 395 Wallet Filter + 394 Widget Manager ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display flex items-center gap-2">
            <LayoutDashboard className="text-primary" /> Ringkasan Keberkahan
          </h1>
          <p className="text-muted-foreground italic">Assalamu&apos;alaikum, {user?.name}. Mari awali hari dengan niat terbaik.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* 395 – Wallet Filter */}
          <div className="relative">
            <Button variant="outline" onClick={() => setWalletFilterOpen(!walletFilterOpen)}
              className={cn("h-9 rounded-xl text-xs font-bold border-emerald-200 gap-2", selectedWalletId !== "all" && "bg-emerald-50 text-emerald-700 border-emerald-300")}>
              <Wallet size={14} />
              {selectedWalletName}
              <ChevronDown size={12} className={cn("transition-transform", walletFilterOpen && "rotate-180")} />
            </Button>
            <AnimatePresence>
              {walletFilterOpen && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 top-11 z-50 w-56 bg-white rounded-2xl shadow-2xl border border-emerald-100 p-2 overflow-hidden">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-3 py-1">Filter Dashboard</p>
                  {[{ id: "all", name: "Semua Dompet", balance: wallets?.reduce((a: number, w: any) => a + Number(w.balance), 0) || 0 },
                    ...(wallets || []).map((w: any) => ({ id: w.id, name: w.name, balance: Number(w.balance) }))
                  ].map((w: any) => (
                    <button key={w.id} onClick={() => { setSelectedWalletId(w.id); setWalletFilterOpen(false); }}
                      className={cn("w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-bold transition-all hover:bg-emerald-50",
                        selectedWalletId === w.id ? "bg-emerald-100 text-emerald-700" : "text-slate-700")}>
                      <span className="truncate">{w.name}</span>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-2">Rp {w.balance.toLocaleString("id-ID")}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 394 – Widget Manager */}
          <Button variant="outline" onClick={() => setShowWidgetManager(!showWidgetManager)}
            className={cn("h-9 rounded-xl text-xs font-bold border-slate-200 gap-2", showWidgetManager && "bg-slate-100")}>
            <SlidersHorizontal size={14} /> Widget
          </Button>

          <div className="flex gap-2">
            <RamadanModeToggle />
            <TransferFundsModal />
            <AddTransactionModal />
          </div>
          <AddWalletModal />
        </div>
      </div>

      {/* ── 394 Widget Manager Panel ── */}
      <AnimatePresence>
        {showWidgetManager && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden">
            <div className="bg-white rounded-[28px] border border-slate-200 shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-black text-slate-800">Kelola Widget Dashboard</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Seret untuk mengatur urutan · Toggle untuk tampil/sembunyikan</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={resetLayout} className="text-slate-500 text-xs rounded-xl">Reset Default</Button>
                  <button onClick={() => setShowWidgetManager(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"><X size={16} /></button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {widgetOrder.map((id, idx) => {
                  const info = WIDGET_REGISTRY.find(w => w.id === id);
                  if (!info) return null;
                  const visible = isVisible(id);
                  return (
                    <div key={id}
                      draggable
                      onDragStart={() => handleDragStart(id)}
                      onDragOver={e => handleDragOver(e, id)}
                      onDrop={e => handleDrop(e, id)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-2xl border-2 cursor-grab active:cursor-grabbing transition-all select-none",
                        dragOverId === id ? "border-emerald-400 bg-emerald-50 scale-[0.98]" : "border-slate-100 hover:border-slate-200 bg-slate-50",
                        !visible && "opacity-40"
                      )}>
                      <GripVertical size={16} className="text-slate-300 shrink-0" />
                      <span className="text-[10px] font-black text-slate-400 w-5 shrink-0">{(idx + 1).toString().padStart(2, "0")}</span>
                      <span className="flex-1 text-sm font-bold text-slate-700 truncate">{info.label}</span>
                      <button onClick={() => toggleWidget(id)}
                        className={cn("p-1.5 rounded-lg transition-all shrink-0", visible ? "text-emerald-600 bg-emerald-100 hover:bg-emerald-200" : "text-slate-400 bg-slate-100 hover:bg-slate-200")}>
                        {visible ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 394 Widget Render Loop (respects order) ── */}
      {widgetOrder.map(id => {
        const content = renderWidget(id);
        if (!content) return null;
        const isDragging = draggingId === id;
        const isOver = dragOverId === id;
        return (
          <div key={id}
            draggable={!showWidgetManager}
            onDragStart={() => !showWidgetManager && handleDragStart(id)}
            onDragOver={e => !showWidgetManager && handleDragOver(e, id)}
            onDrop={e => !showWidgetManager && handleDrop(e, id)}
            onDragEnd={handleDragEnd}
            className={cn("transition-all duration-200", isDragging && "opacity-40 scale-[0.98]", isOver && !showWidgetManager && "ring-2 ring-emerald-400 rounded-3xl")}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
