"use client";

import { useState, useRef } from "react";
import {
  FileText, Download, Printer, Mail, TableProperties, Calculator,
  Loader2, ChevronDown, ChevronRight, BarChart2, CheckCircle2,
  AlertTriangle, Filter, RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useSWR from "swr";
import apiClient from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const fetcher = (url: string) => apiClient.get(url).then(r => r.data);

// ── Column config for 406 Custom Report Builder ────────────────────────────
const ALL_COLUMNS = [
  { id: "date",        label: "Tanggal" },
  { id: "type",        label: "Jenis" },
  { id: "category",    label: "Kategori" },
  { id: "description", label: "Keterangan" },
  { id: "amount",      label: "Jumlah" },
  { id: "wallet",      label: "Dompet" },
  { id: "user",        label: "Anggota" },
  { id: "tags",        label: "Tag" },
  { id: "status",      label: "Status Halal" },
];

// ── Skeleton row ───────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="flex gap-3 p-3 animate-pulse">
      <div className="w-24 h-4 bg-slate-100 rounded-lg" />
      <div className="flex-1 h-4 bg-slate-100 rounded-lg" />
      <div className="w-20 h-4 bg-slate-100 rounded-lg" />
    </div>
  );
}

export default function ReportGeneratorPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedCols, setSelectedCols] = useState<string[]>(["date","type","category","amount","wallet"]);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const { data: summary, isLoading: loadingSum } = useSWR(`/finance/summary?month=${selectedMonth}`, fetcher);
  const { data: topCats, isLoading: loadingCats } = useSWR(`/finance/top-categories`, fetcher);
  const { data: allTx, isLoading: loadingTx }    = useSWR(`/finance/transactions`, fetcher);
  const { data: zakatLogs }                       = useSWR(`/zakat/logs`, fetcher);
  const { data: debts }                           = useSWR(`/finance/debts`, fetcher);
  const { data: wallets }                         = useSWR(`/finance/wallets`, fetcher);
  const { data: members }                         = useSWR(`/family/members`, fetcher);

  // ── 402 PDF Export ──────────────────────────────────────────────────────
  const handlePDFExport = async () => {
    setIsExporting("pdf");
    try {
      window.print();
    } finally {
      setIsExporting(null);
    }
  };

  // ── 403 CSV Export ──────────────────────────────────────────────────────
  const handleCSVExport = async () => {
    setIsExporting("csv");
    try {
      const res = await apiClient.get("/finance/export/csv", { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `yumna-laporan-${selectedMonth}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: build CSV from allTx data
      if (!allTx) return;
      const headers = selectedCols.map(c => ALL_COLUMNS.find(col => col.id === c)?.label || c).join(",");
      const rows = allTx.map((tx: any) => selectedCols.map(c => {
        switch(c) {
          case "date": return new Date(tx.date).toLocaleDateString("id-ID");
          case "type": return tx.type;
          case "category": return tx.category;
          case "description": return `"${(tx.description||"").replace(/"/g,'""')}"`;
          case "amount": return tx.amount;
          case "wallet": return tx.wallet?.name || "";
          case "user": return tx.user?.name || "";
          case "tags": return (tx.tags||[]).join(";");
          case "status": return tx.status || "HALAL";
          default: return "";
        }
      }).join(",")).join("\n");
      const blob = new Blob([headers + "\n" + rows], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `yumna-laporan-${selectedMonth}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(null);
    }
  };

  // ── 415 Export All Family Data (GDPR) ───────────────────────────────────
  const handleExportAll = async () => {
    setIsExporting("gdpr");
    try {
      const [txData, walletData, memberData, zakatData, debtData] = await Promise.all([
        apiClient.get("/finance/transactions").then(r => r.data),
        apiClient.get("/finance/wallets").then(r => r.data),
        apiClient.get("/family/members").then(r => r.data),
        apiClient.get("/zakat/logs").then(r => r.data),
        apiClient.get("/finance/debts").then(r => r.data),
      ]);
      const exportData = {
        exportedAt: new Date().toISOString(),
        note: "Data eksport GDPR Yumna Family Command Center",
        transactions: txData,
        wallets: walletData,
        members: memberData?.map((m: any) => ({ name: m.name, role: m.role, email: m.email })),
        zakatLogs: zakatData,
        debts: debtData,
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `yumna-data-export-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(null);
    }
  };

  // ── 405 Send Monthly Email ───────────────────────────────────────────────
  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    try {
      await apiClient.post("/finance/send-monthly-report", { month: selectedMonth });
      alert("Laporan dikirim ke email anggota keluarga! 📧");
    } catch {
      alert("Fitur email aktif saat server berjalan dengan SMTP terkonfigurasi.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  // ── 407 Tax Computation ──────────────────────────────────────────────────
  const totalIncome  = summary?.income  || 0;
  const pkpBasic     = Math.max(0, totalIncome - 54_000_000);
  const taxEstimate  = pkpBasic <= 0 ? 0 : pkpBasic <= 60_000_000 ? pkpBasic * 0.05 : pkpBasic <= 250_000_000 ? pkpBasic * 0.15 : pkpBasic * 0.25;

  // ── 411 Family Statistics ────────────────────────────────────────────────
  const memberSpending = members?.map((m: any) => ({
    name: m.name,
    total: allTx?.filter((tx: any) => tx.userId === m.id && tx.type === "EXPENSE").reduce((s: number, tx: any) => s + Number(tx.amount), 0) || 0,
  })).sort((a: any, b: any) => b.total - a.total) || [];

  // ── 413 Cash vs Bank ─────────────────────────────────────────────────────
  const cashTotal = wallets?.filter((w: any) => w.type === "CASH").reduce((s: number, w: any) => s + Number(w.balance), 0) || 0;
  const bankTotal = wallets?.filter((w: any) => w.type === "BANK").reduce((s: number, w: any) => s + Number(w.balance), 0) || 0;
  const otherTotal = wallets?.filter((w: any) => !["CASH","BANK"].includes(w.type)).reduce((s: number, w: any) => s + Number(w.balance), 0) || 0;

  // ── 414 Zakat Paid vs Outstanding ───────────────────────────────────────
  const totalZakatPaid = zakatLogs?.reduce((s: number, z: any) => s + Number(z.amount), 0) || 0;
  const totalDebtOwed  = debts?.filter((d: any) => d.type === "DEBT" && !d.isPaid).reduce((s: number, d: any) => s + Number(d.amount), 0) || 0;

  // ── 412 Period Comparison ────────────────────────────────────────────────
  const { data: comp } = useSWR("/finance/comparative-analytics", fetcher);

  return (
    <div className="space-y-8 print:space-y-6" ref={printRef}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-4xl font-black text-emerald-950 tracking-tighter flex items-center gap-3">
            <FileText size={32} className="text-emerald-600" />
            Generator Laporan
          </h1>
          <p className="text-emerald-700/60 font-medium mt-1">Buat, ekspor & kirim laporan keuangan keluarga.</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {/* Month Selector */}
          <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
            className="h-9 px-3 rounded-xl border border-emerald-200 text-sm font-bold text-emerald-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400" />

          {/* 402 PDF */}
          <Button onClick={handlePDFExport} disabled={!!isExporting} size="sm"
            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs h-9 gap-2 shadow-none">
            {isExporting === "pdf" ? <Loader2 size={14} className="animate-spin" /> : <Printer size={14} />} PDF / Cetak
          </Button>

          {/* 403 CSV */}
          <Button onClick={handleCSVExport} disabled={!!isExporting} size="sm"
            className="bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-xl font-bold text-xs h-9 gap-2 shadow-none">
            {isExporting === "csv" ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} CSV / Excel
          </Button>

          {/* 415 GDPR Export */}
          <Button onClick={handleExportAll} disabled={!!isExporting} size="sm"
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl font-bold text-xs h-9 gap-2 shadow-none">
            {isExporting === "gdpr" ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} Ekspor Semua
          </Button>

          {/* 405 Email */}
          <Button onClick={handleSendEmail} disabled={isSendingEmail} size="sm"
            className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl font-bold text-xs h-9 gap-2 shadow-none">
            {isSendingEmail ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />} Kirim Email
          </Button>
        </div>
      </div>

      {/* Print header (only shown on print) */}
      <div className="hidden print:block text-center mb-8">
        <h1 className="text-2xl font-black">Laporan Keuangan Keluarga — Yumna</h1>
        <p className="text-sm text-slate-500">Periode: {selectedMonth} | Dicetak: {new Date().toLocaleDateString("id-ID", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}</p>
        <hr className="mt-4" />
      </div>

      {/* ── 418 Skeleton Loading ─── */}
      {(loadingSum || loadingTx) ? (
        <div className="space-y-3">
          {Array(5).fill(0).map((_,i) => <SkeletonRow key={i} />)}
        </div>
      ) : (
        <Tabs defaultValue="summary">
          <TabsList className="bg-white border border-emerald-100 p-1 rounded-2xl flex flex-wrap gap-1 h-auto print:hidden">
            {[["summary","📊 Ringkasan"],["custom","⚙️ Kustom"],["family","👨‍👩‍👧 Statistik Keluarga"],["tax","🧾 Persiapan Pajak"],["zakat","🌙 Zakat & Hutang"],["breakdown","💰 Aset"]].map(([v,l]) => (
              <TabsTrigger key={v} value={v} className="rounded-xl font-bold text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-4">{l}</TabsTrigger>
            ))}
          </TabsList>

          {/* ── 401 Summary ── */}
          <TabsContent value="summary" className="mt-6 space-y-6">
            {/* 412 Period indicators */}
            {comp && (
              <div className={cn("flex items-center gap-3 p-4 rounded-2xl border", comp.percent > 0 ? "bg-rose-50 border-rose-100" : "bg-emerald-50 border-emerald-100")}>
                <div className={cn("font-black text-2xl", comp.percent > 0 ? "text-rose-600" : "text-emerald-600")}>
                  {comp.percent > 0 ? "+" : ""}{comp.percent}%
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-800">Dibanding Bulan Lalu</p>
                  <p className="text-xs text-slate-500">Bulan ini: Rp {comp.currentMonth?.toLocaleString("id-ID")} vs Rp {comp.prevMonth?.toLocaleString("id-ID")}</p>
                </div>
                {comp.percent > 0 ? <AlertTriangle size={20} className="text-rose-400 ml-auto" /> : <CheckCircle2 size={20} className="text-emerald-400 ml-auto" />}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Total Pemasukan",    value: summary?.income  || 0, color: "emerald" },
                { label: "Total Pengeluaran",  value: summary?.expense || 0, color: "rose"    },
                { label: "Saldo Bersih (Net)", value: summary?.net     || 0, color: "blue"    },
              ].map((s, i) => (
                <motion.div key={i} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.08 }}>
                  <Card className={`rounded-[28px] border-none shadow-md bg-${s.color}-50`}>
                    <CardContent className="p-5">
                      <p className={`text-[9px] font-black uppercase tracking-widest text-${s.color}-600 mb-2`}>{s.label}</p>
                      <p className={`text-2xl font-black text-${s.color}-800`}>Rp {Number(s.value).toLocaleString("id-ID")}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Top Categories */}
            <Card className="rounded-[28px] border-none shadow-md">
              <CardHeader><CardTitle className="text-sm font-black">Kategori Pengeluaran Teratas</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {topCats?.map((cat: any, i: number) => {
                  const pct = topCats ? Math.round((cat.amount / topCats[0]?.amount) * 100) : 0;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs font-black text-slate-400 w-5">{i+1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span>{cat.category}</span>
                          <span>Rp {cat.amount.toLocaleString("id-ID")}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: i * 0.1 }}
                            className="h-full bg-emerald-500 rounded-full" />
                        </div>
                      </div>
                    </div>
                  );
                })}
                {!topCats?.length && <p className="text-sm italic text-slate-400 text-center py-4">Belum ada data pengeluaran.</p>}
              </CardContent>
            </Card>

            {/* 404 Print-friendly transaction table */}
            <Card className="rounded-[28px] border-none shadow-md">
              <CardHeader><CardTitle className="text-sm font-black flex items-center gap-2"><TableProperties size={16} /> Tabel Transaksi Bulan Ini</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left p-2 font-black text-slate-500 uppercase tracking-wider">Tanggal</th>
                      <th className="text-left p-2 font-black text-slate-500 uppercase tracking-wider">Kategori</th>
                      <th className="text-left p-2 font-black text-slate-500 uppercase tracking-wider">Keterangan</th>
                      <th className="text-right p-2 font-black text-slate-500 uppercase tracking-wider">Jumlah</th>
                      <th className="text-left p-2 font-black text-slate-500 uppercase tracking-wider print:hidden">Jenis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingTx ? Array(5).fill(0).map((_,i) => (
                      <tr key={i}><td colSpan={5}><SkeletonRow /></td></tr>
                    )) : allTx?.filter((tx: any) => tx.date?.startsWith(selectedMonth)).slice(0, 20).map((tx: any, i: number) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-2 text-slate-500">{new Date(tx.date).toLocaleDateString("id-ID", {day:"numeric",month:"short"})}</td>
                        <td className="p-2 font-bold text-slate-700">{tx.category}</td>
                        <td className="p-2 text-slate-500 max-w-[200px] truncate">{tx.description || "-"}</td>
                        <td className={cn("p-2 font-black text-right", tx.type === "INCOME" ? "text-emerald-600" : "text-rose-600")}>
                          {tx.type === "INCOME" ? "+" : "-"} Rp {Number(tx.amount).toLocaleString("id-ID")}
                        </td>
                        <td className="p-2 print:hidden">
                          <Badge className={cn("text-[8px] border-none rounded-full font-black", tx.type === "INCOME" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600")}>{tx.type}</Badge>
                        </td>
                      </tr>
                    ))}
                    {!allTx?.filter((tx: any) => tx.date?.startsWith(selectedMonth)).length && (
                      <tr><td colSpan={5} className="p-8 text-center italic text-slate-400">Belum ada transaksi bulan ini.</td></tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── 406 Custom Report Builder ── */}
          <TabsContent value="custom" className="mt-6 space-y-6">
            <Card className="rounded-[28px] border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-black flex items-center gap-2"><Filter size={18} className="text-emerald-600" /> Pembangun Laporan Kustom</CardTitle>
                <CardDescription>Pilih kolom yang ingin ditampilkan lalu ekspor ke CSV.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Pilih Kolom</p>
                  <div className="flex flex-wrap gap-2">
                    {ALL_COLUMNS.map(col => {
                      const active = selectedCols.includes(col.id);
                      return (
                        <button key={col.id} onClick={() => setSelectedCols(prev => active ? prev.filter(c => c !== col.id) : [...prev, col.id])}
                          className={cn("px-3 py-1.5 rounded-xl text-xs font-bold transition-all border", active ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300")}>
                          {col.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Preview ({selectedCols.length} kolom dipilih)</p>
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-emerald-50">
                        {selectedCols.map(c => (
                          <th key={c} className="text-left p-2 font-black text-emerald-700 uppercase tracking-wider whitespace-nowrap">
                            {ALL_COLUMNS.find(col => col.id === c)?.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {allTx?.slice(0, 5).map((tx: any, i: number) => (
                        <tr key={i} className="border-b border-slate-100">
                          {selectedCols.map(c => (
                            <td key={c} className="p-2 text-slate-600">
                              {c === "date" ? new Date(tx.date).toLocaleDateString("id-ID") : c === "amount" ? `Rp ${Number(tx.amount).toLocaleString("id-ID")}` : c === "wallet" ? tx.wallet?.name : c === "user" ? tx.user?.name : c === "tags" ? (tx.tags||[]).join(", ") : tx[c] || "-"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Button onClick={handleCSVExport} disabled={!!isExporting} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold gap-2">
                  {isExporting === "csv" ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} Ekspor Kustom CSV
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── 411 Family Statistics ── */}
          <TabsContent value="family" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="rounded-[28px] border-none shadow-md">
                <CardHeader><CardTitle className="text-lg font-black">👨‍👩‍👧 Siapa yang Belanja Paling Banyak?</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {memberSpending.length === 0 ? (
                    <p className="text-sm italic text-slate-400 text-center py-8">Belum ada data pengeluaran per anggota.</p>
                  ) : memberSpending.map((m: any, i: number) => {
                    const max = memberSpending[0]?.total || 1;
                    const pct = Math.round((m.total / max) * 100);
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-sm font-bold">
                          <span className="flex items-center gap-2">
                            {i === 0 && <span className="text-base">🥇</span>}
                            {i === 1 && <span className="text-base">🥈</span>}
                            {i === 2 && <span className="text-base">🥉</span>}
                            {m.name}
                          </span>
                          <span className="text-slate-600">Rp {m.total.toLocaleString("id-ID")}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: i * 0.1 }}
                            className={cn("h-full rounded-full", i === 0 ? "bg-rose-500" : i === 1 ? "bg-amber-400" : "bg-emerald-500")} />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* 408 Subscription Status Widget */}
              <Card className="rounded-[28px] border-none shadow-md">
                <CardHeader><CardTitle className="text-lg font-black">📋 Status Tagihan Berulang</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {allTx?.filter((tx: any) => tx.metadata?.recurrence || tx.tags?.includes("subscription")).map((tx: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                        <div className={cn("w-2 h-2 rounded-full", tx.isPaid ? "bg-emerald-400" : "bg-rose-400")} />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-700">{tx.category}</p>
                          <p className="text-[10px] text-slate-400">{tx.description}</p>
                        </div>
                        <span className="text-sm font-black text-slate-800">Rp {Number(tx.amount).toLocaleString("id-ID")}</span>
                      </div>
                    )) || (
                      <div className="py-8 text-center">
                        <p className="text-3xl mb-2">✅</p>
                        <p className="text-sm text-slate-400 italic">Tidak ada tagihan berulang terdeteksi.</p>
                        <p className="text-[10px] text-slate-300 mt-1">Tag transaksi dengan "subscription" untuk melacaknya.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── 407 Tax Preparation ── */}
          <TabsContent value="tax" className="mt-6 space-y-6">
            <Card className="rounded-[28px] border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-black flex items-center gap-2"><Calculator size={18} className="text-blue-600" /> Persiapan Pajak PPh 21</CardTitle>
                <CardDescription>Estimasi berdasarkan data pemasukan keluarga. Bukan pengganti konsultasi pajak.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: "Total Penghasilan", value: totalIncome, color: "emerald", note: "Bruto tahunan" },
                    { label: "PTKP (Estimasi)", value: 54_000_000, color: "blue", note: "K/0 standard" },
                    { label: "PKP (Kena Pajak)", value: Math.max(0, pkpBasic), color: "amber", note: "Setelah PTKP" },
                  ].map((item, i) => (
                    <div key={i} className={`p-4 rounded-[20px] bg-${item.color}-50 border border-${item.color}-100`}>
                      <p className={`text-[9px] font-black uppercase tracking-widest text-${item.color}-600 mb-1`}>{item.label}</p>
                      <p className={`text-xl font-black text-${item.color}-800`}>Rp {item.value.toLocaleString("id-ID")}</p>
                      <p className="text-[9px] text-slate-400 mt-1">{item.note}</p>
                    </div>
                  ))}
                </div>

                <div className="p-5 rounded-[24px] bg-linear-to-br from-blue-600 to-indigo-700 text-white">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-70 mb-2">Estimasi Pajak Terhutang (PPh 21)</p>
                  <p className="text-4xl font-black">Rp {Math.round(taxEstimate).toLocaleString("id-ID")}</p>
                  <p className="text-xs opacity-70 mt-2">Berdasarkan tarif progresif: 5% (s.d. 60jt) · 15% (60-250jt) · 25% (di atas 250jt)</p>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-xs text-amber-800">
                  <strong>⚠️ Penting:</strong> Estimasi ini hanya untuk perencanaan. Hubungi konsultan pajak terdaftar untuk laporan SPT resmi.
                  Data zakat yang dibayarkan (Rp {totalZakatPaid.toLocaleString("id-ID")}) dapat menjadi pengurang PKP.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── 414 Zakat & Debt ── */}
          <TabsContent value="zakat" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="rounded-[28px] border-none shadow-md">
                <CardHeader><CardTitle className="text-lg font-black flex items-center gap-2">🌙 Zakat Dibayar vs Potensi</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm font-bold mb-2">
                        <span className="text-emerald-700">Zakat Terbayar</span>
                        <span>Rp {totalZakatPaid.toLocaleString("id-ID")}</span>
                      </div>
                      <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: "70%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-bold mb-2">
                        <span className="text-rose-600">Hutang Aktif</span>
                        <span>Rp {totalDebtOwed.toLocaleString("id-ID")}</span>
                      </div>
                      <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-400 rounded-full" style={{ width: totalDebtOwed > 0 ? "40%" : "0%" }} />
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-100 space-y-2">
                      {zakatLogs?.slice(0,5).map((z: any, i: number) => (
                        <div key={i} className="flex justify-between text-xs font-bold text-slate-600 p-2 bg-emerald-50 rounded-xl">
                          <span>{z.type} — {new Date(z.date).toLocaleDateString("id-ID", {month:"short",year:"numeric"})}</span>
                          <span className="text-emerald-700">Rp {Number(z.amount).toLocaleString("id-ID")}</span>
                        </div>
                      ))}
                      {!zakatLogs?.length && <p className="text-xs italic text-slate-400 text-center py-2">Belum ada zakat dicatat.</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[28px] border-none shadow-md">
                <CardHeader><CardTitle className="text-lg font-black flex items-center gap-2">⚖️ Ringkasan Hutang Piutang</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {debts?.slice(0,6).map((d: any, i: number) => (
                    <div key={i} className={cn("flex items-center gap-3 p-3 rounded-2xl border", d.isPaid ? "bg-slate-50 border-slate-100 opacity-50" : d.type === "DEBT" ? "bg-rose-50 border-rose-100" : "bg-emerald-50 border-emerald-100")}>
                      <div className={cn("w-2 h-2 rounded-full shrink-0", d.isPaid ? "bg-slate-300" : d.type === "DEBT" ? "bg-rose-400" : "bg-emerald-400")} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-700 truncate">{d.personName}</p>
                        <p className="text-[9px] text-slate-400">{d.type === "DEBT" ? "Hutang" : "Piutang"}</p>
                      </div>
                      <div className="text-right">
                        <p className={cn("text-xs font-black", d.type === "DEBT" ? "text-rose-600" : "text-emerald-600")}>Rp {Number(d.amount).toLocaleString("id-ID")}</p>
                        {d.isPaid && <Badge className="text-[8px] bg-slate-100 border-none text-slate-400">Lunas</Badge>}
                      </div>
                    </div>
                  ))}
                  {!debts?.length && <p className="text-sm italic text-slate-400 text-center py-8">Tidak ada hutang piutang.</p>}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── 413 Cash vs Bank Breakdown ── */}
          <TabsContent value="breakdown" className="mt-6 space-y-6">
            <Card className="rounded-[28px] border-none shadow-md">
              <CardHeader><CardTitle className="text-lg font-black flex items-center gap-2"><BarChart2 size={18} className="text-emerald-600" /> Komposisi Aset Keluarga</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  {[
                    { label: "Kas & Tunai",  value: cashTotal,  color: "emerald", icon: "💵" },
                    { label: "Rekening Bank", value: bankTotal,  color: "blue",    icon: "🏦" },
                    { label: "Investasi & Lainnya", value: otherTotal, color: "purple", icon: "📈" },
                  ].map((item, i) => (
                    <div key={i} className={`p-5 rounded-[24px] bg-${item.color}-50 border border-${item.color}-100 text-center`}>
                      <span className="text-3xl">{item.icon}</span>
                      <p className={`text-[9px] font-black uppercase tracking-widest text-${item.color}-600 mt-2 mb-1`}>{item.label}</p>
                      <p className={`text-xl font-black text-${item.color}-800`}>Rp {item.value.toLocaleString("id-ID")}</p>
                      <p className="text-[9px] text-slate-400 mt-1">
                        {(cashTotal + bankTotal + otherTotal) > 0 ? Math.round((item.value / (cashTotal + bankTotal + otherTotal)) * 100) : 0}% dari total
                      </p>
                    </div>
                  ))}
                </div>

                {/* Stacked bar visualization */}
                {(cashTotal + bankTotal + otherTotal) > 0 && (
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Distribusi Aset</p>
                    <div className="flex h-8 rounded-2xl overflow-hidden gap-0.5">
                      {cashTotal > 0 && <motion.div initial={{ width: 0 }} animate={{ width: `${(cashTotal/(cashTotal+bankTotal+otherTotal))*100}%` }} className="bg-emerald-500 flex items-center justify-center text-[8px] text-white font-black" title={`Kas: Rp ${cashTotal.toLocaleString()}`}>Kas</motion.div>}
                      {bankTotal > 0 && <motion.div initial={{ width: 0 }} animate={{ width: `${(bankTotal/(cashTotal+bankTotal+otherTotal))*100}%` }} className="bg-blue-500 flex items-center justify-center text-[8px] text-white font-black" title={`Bank: Rp ${bankTotal.toLocaleString()}`}>Bank</motion.div>}
                      {otherTotal > 0 && <motion.div initial={{ width: 0 }} animate={{ width: `${(otherTotal/(cashTotal+bankTotal+otherTotal))*100}%` }} className="bg-purple-500 flex items-center justify-center text-[8px] text-white font-black" title={`Lainnya: Rp ${otherTotal.toLocaleString()}`}>Lain</motion.div>}
                    </div>
                  </div>
                )}

                {/* Per-wallet breakdown */}
                <div className="mt-6 space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Detail Per Dompet</p>
                  {wallets?.map((w: any, i: number) => {
                    const total = wallets.reduce((s: number, x: any) => s + Number(x.balance), 0) || 1;
                    const pct = Math.round((Number(w.balance) / total) * 100);
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs w-28 font-bold text-slate-600 truncate">{w.name}</span>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full bg-emerald-400 rounded-full" />
                        </div>
                        <span className="text-xs font-black text-slate-700 w-28 text-right">Rp {Number(w.balance).toLocaleString("id-ID")}</span>
                        <span className="text-[9px] text-slate-400 w-8 text-right">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Print Footer */}
      <div className="hidden print:block mt-8 pt-4 border-t text-center text-[10px] text-slate-400">
        Laporan ini dihasilkan otomatis oleh Yumna — Asisten Keuangan Keluarga Islami. Rahmatan lil alamin.
      </div>
    </div>
  );
}
