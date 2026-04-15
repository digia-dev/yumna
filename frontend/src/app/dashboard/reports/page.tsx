"use client";

import { useState, useCallback } from "react";
import {
  TrendingUp, TrendingDown, Minus, AlertTriangle, Target,
  PieChart, BarChart2, Activity, Wallet, ArrowUpRight,
  ArrowDownRight, Zap, Info, Loader2, ChevronDown, ChevronRight,
  Bot, RefreshCw, FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useSWR from "swr";
import apiClient from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { CashFlowChart } from "@/components/finance/cash-flow-chart";
import { CategoryDonutChart } from "@/components/finance/category-donut-chart";
import Link from "next/link";

const fetcher = (url: string) => apiClient.get(url).then(r => r.data);

// ── Sparkline mini-bar ───────────────────────────────────────────────────────
function MiniBar({ values, color = "#10b981" }: { values: number[]; color?: string }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-0.5 h-10">
      {values.map((v, i) => (
        <div key={i} className="flex-1 rounded-sm transition-all" style={{ height: `${(v / max) * 100}%`, backgroundColor: color, opacity: 0.6 + 0.4 * (i / values.length) }} />
      ))}
    </div>
  );
}

// ── Gauge circle ─────────────────────────────────────────────────────────────
function Gauge({ value, max = 100, color = "#10b981", label = "" }: { value: number; max?: number; color?: string; label?: string }) {
  const pct = Math.min((value / max) * 100, 100);
  const r = 40, circ = 2 * Math.PI * r;
  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#f0fdf4" strokeWidth="10" />
        <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={circ - (pct / 100) * circ}
          strokeLinecap="round" transform="rotate(-90 48 48)" style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-black text-slate-800">{Math.round(value)}{label}</span>
      </div>
    </div>
  );
}

// ── Heatmap cell ─────────────────────────────────────────────────────────────
function HeatCell({ value, max }: { value: number; max: number }) {
  const intensity = max > 0 ? value / max : 0;
  return (
    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[8px] font-black transition-all hover:scale-110"
      style={{
        backgroundColor: intensity > 0 ? `rgba(16, 185, 129, ${0.1 + intensity * 0.85})` : "#f8fafc",
        color: intensity > 0.5 ? "white" : "#6b7280",
      }}
      title={`Rp ${formatCurrency(value)}`}>
      {value > 0 ? `${Math.round(intensity * 100)}` : ""}
    </div>
  );
}

export default function AnalyticsPage() {
  const [drillCat, setDrillCat] = useState<string | null>(null);

  const { data: assets }    = useSWR("/finance/total-assets",       fetcher);
  const { data: savingsR }  = useSWR("/finance/savings-rate",       fetcher);
  const { data: dti }       = useSWR("/finance/debt-to-income",     fetcher);
  const { data: netWorth }  = useSWR("/finance/net-worth-timeline", fetcher);
  const { data: yoy }       = useSWR("/finance/year-over-year",     fetcher);
  const { data: anomalies } = useSWR("/finance/anomalies",          fetcher);
  const { data: forecast }  = useSWR("/finance/forecast",           fetcher);
  const { data: heatmap }   = useSWR("/finance/spending-heatmap",   fetcher);
  const { data: topCats }   = useSWR("/finance/top-categories",     fetcher);
  const { data: drill }     = useSWR(drillCat ? `/finance/category-drilldown?category=${drillCat}` : null, fetcher);
  const { data: aiInsight } = useSWR("/ai/advisor-insight",         fetcher);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-emerald-950 tracking-tighter flex items-center gap-3">
            <FileText className="text-emerald-600" /> Analitik Keuangan
          </h1>
          <p className="text-emerald-700/60 font-medium mt-1">Wawasan mendalam tentang kesehatan finansial keluarga.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/reports/generator">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-11 px-5 font-bold shadow-lg text-xs shrink-0">
              <BarChart2 size={14} className="mr-2" /> Generator Laporan
            </Button>
          </Link>
          <Link href="/dashboard/chat">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-11 px-5 font-bold shadow-lg text-xs shrink-0">
              <Bot size={14} className="mr-2" /> Tanya Yumna AI
            </Button>
          </Link>
        </div>
      </div>

      {/* ── 382 Total Asset Overview ─── */}
      {assets && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Aset",        value: assets.totalAssets,       icon: Wallet,         color: "emerald", up: true },
            { label: "Total Tabungan",    value: assets.totalSavings,      icon: Target,         color: "blue",    up: true },
            { label: "Total Hutang",      value: assets.totalLiabilities,  icon: ArrowDownRight, color: "rose",    up: false },
            { label: "Kekayaan Bersih",   value: assets.netWorth,          icon: TrendingUp,     color: "purple",  up: assets.netWorth >= 0 },
          ].map((item, i) => (
            <motion.div key={i} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.07 }}>
              <Card className={cn("rounded-[28px] border-none shadow-lg overflow-hidden", `bg-${item.color}-50`)}>
                <CardContent className="p-5">
                  <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center mb-3", `bg-${item.color}-100`)}>
                    <item.icon size={18} className={`text-${item.color}-600`} />
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{item.label}</p>
                  <p className={cn("text-xl font-black", item.up ? `text-${item.color}-700` : "text-rose-700")}>
                    Rp {Number(item.value).toLocaleString("id-ID")}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Tabs defaultValue="overview">
        <TabsList className="bg-white border border-emerald-100 p-1 rounded-2xl flex flex-wrap gap-1 h-auto">
          {[["overview","📊 Ringkasan"],["savings","💰 Tabungan"],["debt","⚖️ Hutang"],["forecast","🔮 Prediksi"],["anomaly","🚨 Anomali"],["heatmap","🌡️ Pola"],["yoy","📅 Tahunan"]].map(([v,l]) => (
            <TabsTrigger key={v} value={v} className="rounded-xl font-bold text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-4">{l}</TabsTrigger>
          ))}
        </TabsList>

        {/* ── 383/384/385 Overview ────────────────────────────────────── */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CashFlowChart />
            <CategoryDonutChart />
          </div>

          {/* 385 Top Categories + 391 Drilldown */}
          <Card className="rounded-[32px] border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-black text-emerald-950">Kategori Teratas (Klik untuk Detail)</CardTitle>
              <CardDescription>Klik kategori untuk melihat breakdown detail transaksi.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {topCats?.map((cat: any, i: number) => {
                const pct = topCats ? Math.round((cat.amount / topCats[0]?.amount) * 100) : 0;
                const isOpen = drillCat === cat.category;
                return (
                  <div key={i}>
                    <button onClick={() => setDrillCat(isOpen ? null : cat.category)}
                      className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-emerald-50 transition-all group">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-sm shrink-0">{i + 1}</div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{cat.category}</span>
                          <span className="text-sm font-black text-slate-800">Rp {cat.amount.toLocaleString("id-ID")}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: i * 0.1, duration: 0.8 }}
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" />
                        </div>
                      </div>
                      <div className="text-slate-300 group-hover:text-emerald-500 transition-colors shrink-0">
                        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </div>
                    </button>
                    <AnimatePresence>
                      {isOpen && drill && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden">
                          <div className="mx-4 mb-3 bg-white rounded-2xl border border-emerald-100 p-4 space-y-3">
                            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-700/60">Breakdown: {cat.category}</p>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-[9px] text-slate-400 font-black mb-2">PER ANGGOTA</p>
                                {drill.byUser?.map((u: any) => (
                                  <div key={u.name} className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-600 font-medium">{u.name}</span>
                                    <span className="font-bold text-slate-800">Rp {u.amount.toLocaleString("id-ID")}</span>
                                  </div>
                                ))}
                              </div>
                              <div>
                                <p className="text-[9px] text-slate-400 font-black mb-2">PER BULAN</p>
                                {drill.byMonth?.map((m: any) => (
                                  <div key={m.month} className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-600 font-medium">{m.month}</span>
                                    <span className="font-bold text-slate-800">Rp {m.amount.toLocaleString("id-ID")}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── 393 Savings Rate ─────────────────────────────────────────── */}
        <TabsContent value="savings" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {savingsR?.slice(-3).map((m: any, i: number) => (
              <Card key={i} className="rounded-[28px] border-none shadow-lg overflow-hidden">
                <CardContent className="p-6 text-center">
                  <Gauge value={m.savingsRate} color={m.savingsRate >= 20 ? "#10b981" : m.savingsRate >= 10 ? "#f59e0b" : "#f43f5e"} label="%" />
                  <p className="font-black text-slate-800 mt-3 text-lg">{m.month}</p>
                  <p className={cn("text-xs font-bold mt-1", m.savingsRate >= 20 ? "text-emerald-600" : m.savingsRate >= 10 ? "text-amber-600" : "text-rose-500")}>
                    {m.savingsRate >= 20 ? "✅ Ideal" : m.savingsRate >= 10 ? "⚠️ Perlu Peningkatan" : "🚨 Terlalu Rendah"}
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-[10px]">
                    <div className="bg-emerald-50 rounded-xl p-2">
                      <p className="text-emerald-700 font-black">Pemasukan</p>
                      <p className="font-bold text-slate-600 truncate">{(m.income / 1e6).toFixed(1)}jt</p>
                    </div>
                    <div className="bg-rose-50 rounded-xl p-2">
                      <p className="text-rose-700 font-black">Pengeluaran</p>
                      <p className="font-bold text-slate-600 truncate">{(m.expense / 1e6).toFixed(1)}jt</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* 388 Goal Progress Gauges */}
          <Card className="rounded-[32px] border-none shadow-lg">
            <CardHeader><CardTitle className="text-lg font-black">Tren Tingkat Tabungan (6 Bulan)</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-2 items-end h-32">
                {savingsR?.map((m: any) => (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[8px] font-black text-emerald-700">{m.savingsRate}%</span>
                    <motion.div initial={{ height: 0 }} animate={{ height: `${Math.max(4, m.savingsRate)}%` }} transition={{ duration: 0.8 }}
                      className={cn("w-full rounded-t-lg", m.savingsRate >= 20 ? "bg-emerald-500" : m.savingsRate >= 10 ? "bg-amber-400" : "bg-rose-400")}
                      style={{ minHeight: 4 }} />
                    <span className="text-[7px] text-slate-400 font-bold truncate w-full text-center">{m.month?.slice(5)}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 italic mt-4 text-center">Target ideal: menabung ≥20% dari pemasukan setiap bulan.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── 399 DTI ──────────────────────────────────────────────────── */}
        <TabsContent value="debt" className="mt-6 space-y-6">
          {dti && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className={cn("rounded-[28px] border-none shadow-lg", dti.debtToIncomeRatio < 20 ? "bg-emerald-50" : dti.debtToIncomeRatio < 40 ? "bg-amber-50" : "bg-rose-50")}>
                  <CardContent className="p-6 text-center">
                    <Gauge value={dti.debtToIncomeRatio} color={dti.debtToIncomeRatio < 20 ? "#10b981" : dti.debtToIncomeRatio < 40 ? "#f59e0b" : "#f43f5e"} label="%" />
                    <p className="font-black text-slate-800 mt-3">Rasio Hutang/Pendapatan</p>
                    <Badge className={cn("mt-2 rounded-full font-black border-none", dti.status === 'Aman' ? "bg-emerald-100 text-emerald-700" : dti.status === 'Perlu Perhatian' ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-600")}>
                      {dti.status}
                    </Badge>
                  </CardContent>
                </Card>
                <Card className="rounded-[28px] border-none shadow-lg md:col-span-2">
                  <CardContent className="p-6">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4">Daftar Hutang Aktif</p>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {dti.debts?.length === 0 ? (
                        <p className="text-sm text-slate-400 italic text-center py-4">Alhamdulillah, tidak ada hutang aktif 🎉</p>
                      ) : dti.debts?.map((d: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", d.type === 'DEBT' ? "bg-rose-400" : "bg-emerald-400")} />
                            <span className="text-sm font-bold text-slate-700">{d.name}</span>
                            <Badge className="text-[8px] border-none rounded-full bg-slate-100 text-slate-500">{d.type === 'DEBT' ? 'Hutang' : 'Piutang'}</Badge>
                          </div>
                          <span className="font-black text-slate-800 text-sm">Rp {d.amount.toLocaleString("id-ID")}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-xs font-bold">
                      <span className="text-slate-400">Pemasukan Bulanan</span>
                      <span className="text-emerald-700">Rp {dti.monthlyIncome.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold mt-1">
                      <span className="text-slate-400">Total Hutang</span>
                      <span className="text-rose-600">Rp {dti.totalDebt.toLocaleString("id-ID")}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* ── 398 Forecast ─────────────────────────────────────────────── */}
        <TabsContent value="forecast" className="mt-6 space-y-6">
          {forecast && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="rounded-[32px] border-none shadow-xl overflow-hidden">
                <div className={cn("p-6 text-white", forecast.trend === 'INCREASING' ? "bg-gradient-to-br from-rose-600 to-orange-600" : forecast.trend === 'DECREASING' ? "bg-gradient-to-br from-emerald-600 to-teal-700" : "bg-gradient-to-br from-blue-600 to-indigo-700")}>
                  <div className="flex items-center gap-3 mb-4">
                    {forecast.trend === 'INCREASING' ? <TrendingUp size={24} /> : forecast.trend === 'DECREASING' ? <TrendingDown size={24} /> : <Minus size={24} />}
                    <p className="text-lg font-black">Prediksi Bulan Depan</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {forecast.next && ([
                      { label: "Est. Pemasukan", value: forecast.next.income },
                      { label: "Est. Pengeluaran", value: forecast.next.expense },
                      { label: "Est. Tabungan", value: forecast.next.savings },
                      { label: "Tingkat Tabungan", value: null, pct: forecast.next.savingsRate },
                    ]).map((item, i) => (
                      <div key={i} className="bg-white/10 rounded-2xl p-4">
                        <p className="text-[9px] font-black opacity-70 uppercase tracking-widest">{item.label}</p>
                        <p className="text-xl font-black mt-1">{item.pct !== undefined ? `${item.pct}%` : `Rp ${item.value?.toLocaleString("id-ID")}`}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <Bot size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-600 font-medium italic">&ldquo;{forecast.advice}&rdquo;</p>
                  </div>
                </CardContent>
              </Card>

              {/* 400 Net Worth Timeline */}
              <Card className="rounded-[32px] border-none shadow-lg">
                <CardHeader><CardTitle className="text-lg font-black">Kekayaan Bersih (Net Worth)</CardTitle></CardHeader>
                <CardContent>
                  {netWorth && netWorth.length > 0 ? (
                    <div>
                      <div className="flex gap-1 items-end h-32 mb-3">
                        {netWorth.map((d: any, i: number) => {
                          const max = Math.max(...netWorth.map((x: any) => x.netWorth), 1);
                          return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                              <motion.div initial={{ height: 0 }} animate={{ height: `${Math.max(4, (d.netWorth / max) * 100)}%` }}
                                transition={{ delay: i * 0.1 }} className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg" />
                              <span className="text-[7px] text-slate-400 truncate">{d.month?.slice(5)}</span>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-center text-xl font-black text-emerald-900">
                        Rp {netWorth[netWorth.length - 1]?.netWorth?.toLocaleString("id-ID")}
                      </p>
                      <p className="text-center text-[9px] text-slate-400 font-black uppercase tracking-widest">Kekayaan Bersih Saat Ini</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-10 text-slate-400">
                      <TrendingUp size={40} className="text-slate-200 mb-3" />
                      <p className="text-sm italic">Belum ada snapshot untuk ditampilkan.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* ── 397 Anomaly ──────────────────────────────────────────────── */}
        <TabsContent value="anomaly" className="mt-6">
          <Card className="rounded-[32px] border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <AlertTriangle size={20} className="text-rose-500" /> Deteksi Anomali Pengeluaran
              </CardTitle>
              <CardDescription>Transaksi yang melebihi 2× standar deviasi dari rata-rata (aturan 2-sigma).</CardDescription>
            </CardHeader>
            <CardContent>
              {!anomalies ? <div className="flex items-center justify-center py-12"><Loader2 size={28} className="text-emerald-400 animate-spin" /></div>
                : anomalies.anomalies?.length === 0 ? (
                  <div className="text-center py-16">
                    <span className="text-5xl">✅</span>
                    <h3 className="text-lg font-black text-emerald-950 mt-4">Tidak Ada Anomali</h3>
                    <p className="text-slate-400 text-sm mt-1">Alhamdulillah, semua pengeluaran dalam batas normal!</p>
                    <p className="text-[10px] text-slate-300 mt-2">Rata-rata: Rp {anomalies.avg?.toLocaleString("id-ID")} | Ambang: Rp {anomalies.threshold?.toLocaleString("id-ID")}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex gap-3 items-center p-3 bg-amber-50 rounded-2xl border border-amber-100">
                      <Info size={16} className="text-amber-500 shrink-0" />
                      <p className="text-xs text-amber-700 font-medium">Rata-rata: <strong>Rp {anomalies.avg?.toLocaleString("id-ID")}</strong> | Ambang batas: <strong>Rp {anomalies.threshold?.toLocaleString("id-ID")}</strong></p>
                    </div>
                    {anomalies.anomalies?.map((a: any, i: number) => (
                      <motion.div key={i} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.07 }}
                        className="flex items-center gap-4 p-4 bg-rose-50 rounded-[24px] border border-rose-100">
                        <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                          <AlertTriangle size={20} className="text-rose-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-slate-800 text-sm truncate">{a.title}</p>
                          <div className="flex gap-2 items-center flex-wrap mt-0.5">
                            <Badge className="text-[8px] bg-rose-100 text-rose-600 border-none">{a.category}</Badge>
                            <span className="text-[9px] text-slate-400 font-bold">{new Date(a.date).toLocaleDateString("id-ID")} · {a.user}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-black text-rose-700">Rp {a.amount.toLocaleString("id-ID")}</p>
                          <p className="text-[9px] text-rose-400 font-bold">{a.deviation}× deviasi</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── 396 Heatmap ──────────────────────────────────────────────── */}
        <TabsContent value="heatmap" className="mt-6">
          <Card className="rounded-[32px] border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-black flex items-center gap-2"><Activity size={20} className="text-emerald-500" /> Pola Pengeluaran (90 Hari)</CardTitle>
              <CardDescription>Heatmap pengeluaran per hari dalam seminggu. Lebih gelap = lebih banyak pengeluaran.</CardDescription>
            </CardHeader>
            <CardContent>
              {!heatmap ? <div className="flex items-center justify-center py-12"><Loader2 size={28} className="text-emerald-400 animate-spin" /></div> : (
                <div>
                  <div className="flex gap-2 items-center mb-4">
                    <span className="text-[9px] font-black text-slate-400 w-8" />
                    {["Mg1","Mg2","Mg3","Mg4"].map(w => <span key={w} className="text-[9px] font-black text-slate-400 w-8 text-center">{w}</span>)}
                  </div>
                  {heatmap.days?.map((day: string, di: number) => (
                    <div key={di} className="flex gap-2 items-center mb-2">
                      <span className="text-[9px] font-black text-slate-400 w-8 text-right">{day}</span>
                      {heatmap.matrix?.[di]?.map((val: number, wi: number) => (
                        <HeatCell key={wi} value={val} max={heatmap.maxValue || 1} />
                      ))}
                    </div>
                  ))}
                  <div className="flex items-center gap-2 mt-6">
                    <span className="text-[9px] text-slate-400 font-black">Rendah</span>
                    {[0.1,0.3,0.5,0.7,0.9].map(i => (
                      <div key={i} className="w-6 h-4 rounded" style={{ backgroundColor: `rgba(16,185,129,${i})` }} />
                    ))}
                    <span className="text-[9px] text-slate-400 font-black">Tinggi</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── 392 Year-over-Year ───────────────────────────────────────── */}
        <TabsContent value="yoy" className="mt-6">
          <Card className="rounded-[32px] border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-black flex items-center gap-2"><BarChart2 size={20} className="text-blue-500" /> Perbandingan Tahun ke Tahun</CardTitle>
              <CardDescription>Pengeluaran bulanan tahun ini vs tahun lalu.</CardDescription>
            </CardHeader>
            <CardContent>
              {!yoy ? <div className="flex items-center justify-center py-12"><Loader2 size={28} className="text-emerald-400 animate-spin" /></div> : (
                <div className="space-y-3">
                  {yoy.map((m: any, i: number) => {
                    const maxVal = Math.max(...yoy.flatMap((x: any) => [x.thisYear, x.lastYear]), 1);
                    const pctThis = (m.thisYear / maxVal) * 100;
                    const pctLast = (m.lastYear / maxVal) * 100;
                    const delta = m.lastYear > 0 ? ((m.thisYear - m.lastYear) / m.lastYear * 100).toFixed(0) : null;
                    return (
                      <div key={i} className="grid grid-cols-[50px_1fr_80px] gap-3 items-center">
                        <span className="text-[10px] font-black text-slate-400 text-right">{m.month}</span>
                        <div className="space-y-1">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pctThis}%` }} transition={{ delay: i * 0.05 }}
                            className="h-3 bg-blue-500 rounded-full" style={{ minWidth: pctThis > 0 ? 4 : 0 }} />
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pctLast}%` }} transition={{ delay: i * 0.05 + 0.1 }}
                            className="h-3 bg-slate-200 rounded-full" style={{ minWidth: pctLast > 0 ? 4 : 0 }} />
                        </div>
                        <div className="text-right">
                          {delta !== null && (
                            <span className={cn("text-[9px] font-black", Number(delta) > 0 ? "text-rose-500" : "text-emerald-600")}>
                              {Number(delta) > 0 ? "+" : ""}{delta}%
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex gap-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2"><div className="w-4 h-3 rounded bg-blue-500" /><span className="text-[9px] text-slate-500 font-bold">Tahun Ini</span></div>
                    <div className="flex items-center gap-2"><div className="w-4 h-3 rounded bg-slate-200" /><span className="text-[9px] text-slate-400 font-bold">Tahun Lalu</span></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
