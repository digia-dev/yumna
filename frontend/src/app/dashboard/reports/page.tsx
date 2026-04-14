"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  ChevronRight,
  Loader2,
  Sparkles
} from "lucide-react";
import useSWR from "swr";
import Link from "next/link";
import apiClient from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { CashFlowChart } from "@/components/finance/cash-flow-chart";
import { CategoryDonutChart } from "@/components/finance/category-donut-chart";

const fetcher = (url: string) => apiClient.get(url).then((res) => res.data);

export default function ReportsPage() {
  useAuth();
  const { data: summary } = useSWR("/finance/summary", fetcher);
  const { data: topCategories } = useSWR("/finance/top-categories", fetcher);
  const { data: aiInsight, isLoading: loadingAi } = useSWR("/ai/advisor-insight", fetcher);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display flex items-center gap-2">
          <FileText className="text-primary" />
          Laporan Keuangan
        </h1>
        <p className="text-muted-foreground italic">Analisis mendalam keberkahan harta keluarga bulan ini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-emerald-600 dark:text-emerald-400 font-bold uppercase text-[10px] tracking-widest">Total Pemasukan</CardDescription>
            <CardTitle className="text-2xl text-emerald-700 dark:text-emerald-300">
              {formatCurrency(summary?.income || 0)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-rose-50 border-rose-100 dark:bg-rose-950/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-rose-600 dark:text-rose-400 font-bold uppercase text-[10px] tracking-widest">Total Pengeluaran</CardDescription>
            <CardTitle className="text-2xl text-rose-700 dark:text-rose-300">
              {formatCurrency(summary?.expense || 0)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-primary/5 border-primary/10">
          <CardHeader className="pb-2">
            <CardDescription className="text-primary font-bold uppercase text-[10px] tracking-widest">Saldo Bersih (Net)</CardDescription>
            <CardTitle className="text-2xl text-primary">
              {formatCurrency(summary?.net || 0)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CashFlowChart />
        <CategoryDonutChart />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Kategori Pengeluaran Teratas</CardTitle>
            <CardDescription>Berdasarkan nominal transaksi bulan ini</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topCategories && topCategories.length > 0 ? topCategories.map((cat: { category: string; amount: number }, i: number) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary font-bold text-xs ring-1 ring-primary/10">
                    {i + 1}
                  </div>
                  <span className="font-medium group-hover:text-primary transition-colors">{cat.category}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold">{formatCurrency(cat.amount)}</span>
                </div>
              </div>
            )) : (
              <div className="py-8 text-center text-muted-foreground italic text-xs">Belum ada data pengeluaran.</div>
            )}
          </CardContent>
        </Card>

        <Card className="premium-gradient text-white border-none relative overflow-hidden">
          <CardHeader className="relative z-10">
            <CardTitle className="text-primary-foreground/90 font-display">Wawasan Yumna AI</CardTitle>
            <CardDescription className="text-primary-foreground/70">Asisten cerdas keberkahan keluarga</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 pb-10">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 italic text-sm border border-white/20 leading-relaxed min-h-[100px] flex items-center justify-center text-center">
              {loadingAi ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="animate-spin text-white/50" size={24} />
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Sedang Menganalisis...</span>
                </div>
              ) : (
                `"${aiInsight?.insight || "Mari catat lebih banyak transaksi agar saya bisa memberikan saran yang lebih tepat."}"`
              )}
            </div>
            <Link href="/dashboard/chat">
              <Button variant="outline" className="mt-6 w-full bg-white/10 border-white/40 hover:bg-white/20 text-white font-bold h-11 uppercase text-[10px] tracking-widest">
                Tanya Detail ke Yumna <ChevronRight size={14} className="ml-2" />
              </Button>
            </Link>
          </CardContent>
          <FileText className="absolute bottom-0 right-0 -mb-12 -mr-12 text-white/5" size={200} />
          <Sparkles className="absolute top-4 right-4 text-amber-300/30" size={24} />
        </Card>
      </div>
    </div>
  );
}
