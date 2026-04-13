"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck,
  TrendingUp,
  Coins,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import apiClient from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";

const fetcher = (url: string) => apiClient.get(url).then(res => res.data);

export default function ZakatAuditPage() {
  const { data: history } = useSWR("/zakat/history", fetcher);
  const { data: wallets } = useSWR("/finance/wallets", fetcher);
  const { data: nisab } = useSWR("/zakat/nisab", fetcher);

  const totalAssets = wallets?.reduce((acc: number, w: any) => acc + Number(w.balance), 0) || 0;
  const totalZakatPaid = history?.reduce((acc: number, h: any) => acc + Number(h.amount), 0) || 0;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/zakat">
          <Button variant="ghost" size="icon">
             <ArrowLeft size={20} />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Audit Keuangan Zakat</h1>
          <p className="text-muted-foreground">Laporan ketaatan zakat dan kesucian harta tahunan.</p>
        </div>
        <Button className="gap-2">
          <Download size={16} />
          Export PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-emerald-50 border-emerald-200">
           <CardHeader className="pb-2">
             <CardTitle className="text-xs font-bold uppercase text-emerald-800">Total Harta Terpantau</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold text-emerald-950">Rp {totalAssets.toLocaleString()}</div>
             <Badge variant="outline" className="mt-2 bg-white text-emerald-700 border-emerald-200">
               {totalAssets >= nisab?.maal ? "Wajib Zakat" : "Di Bawah Nisab"}
             </Badge>
           </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
           <CardHeader className="pb-2">
             <CardTitle className="text-xs font-bold uppercase text-blue-800">Zakat TerDistribusi</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold text-blue-950">Rp {totalZakatPaid.toLocaleString()}</div>
             <p className="text-[10px] text-blue-700 mt-1 italic">Total penyaluran tahun ini.</p>
           </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
           <CardHeader className="pb-2">
             <CardTitle className="text-xs font-bold uppercase text-amber-800">Status Kesucian Harta</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="flex items-center gap-2">
                <ShieldCheck className="text-amber-600" size={24} />
                <span className="text-xl font-bold text-amber-950">Terjaga</span>
             </div>
             <p className="text-[10px] text-amber-700 mt-1">Berdasarkan self-audit kehalalan.</p>
           </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Card>
            <CardHeader>
              <CardTitle className="text-lg">Analisis Kritis Fiqh</CardTitle>
              <CardDescription>Poin-poin penting kematangan zakat Anda.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex gap-4 p-4 rounded-xl bg-muted/30 border">
                  <div className="p-2 bg-emerald-100 rounded-lg h-fit">
                    <CheckCircle2 className="text-emerald-600" size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Nisab Terlampaui</h4>
                    <p className="text-xs text-muted-foreground">Harta Anda saat ini di atas ambang batas Nisab {formatCurrency(nisab?.maal || 0)}.</p>
                  </div>
               </div>

               <div className="flex gap-4 p-4 rounded-xl bg-muted/30 border">
                  <div className="p-2 bg-amber-100 rounded-lg h-fit">
                    <AlertCircle className="text-amber-600" size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Haul Berjalan</h4>
                    <p className="text-xs text-muted-foreground">Pastikan harta menetap selama 1 tahun Hijriah untuk kewajiban Maal.</p>
                  </div>
               </div>

               <div className="flex gap-4 p-4 rounded-xl bg-muted/30 border">
                  <div className="p-2 bg-blue-100 rounded-lg h-fit">
                    <Coins className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Zakat Profesi Teratur</h4>
                    <p className="text-xs text-muted-foreground">Penyetoran bulanan Anda terpantau konsisten 92%.</p>
                  </div>
               </div>
            </CardContent>
         </Card>

         <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sadaqah Jariyah Planner</CardTitle>
              <CardDescription>Rencana amal yang pahalanya terus mengalir.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">Waqaf Sumur / Air</span>
                    <Badge>Planned</Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full w-[45%]" />
                  </div>
                  <p className="text-[10px] text-muted-foreground">Terkumpul: Rp 4.500.000 / Rp 10.000.000</p>
               </div>

               <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">Pembangunan Masjid</span>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full w-[20%]" />
                  </div>
                  <p className="text-[10px] text-muted-foreground">Terkumpul: Rp 2.000.000 / Rp 10.000.000</p>
               </div>

               <Button className="w-full bg-secondary hover:bg-secondary/90 text-white">
                 <TrendingUp size={16} className="mr-2" />
                 Tambah Target Jariyah
               </Button>
            </CardContent>
         </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sertifikasi Internal Keberkahan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-emerald-100 border-dashed p-8 rounded-2xl flex flex-col items-center justify-center text-center bg-emerald-50/20">
             <ShieldCheck size={64} className="text-emerald-200 mb-4" />
             <h3 className="text-2xl font-serif font-bold text-emerald-900 italic">"Harta yang bersih melahirkan keluarga yang sakinah."</h3>
             <p className="text-sm text-emerald-700 mt-2 max-w-md">Laporan ini memverifikasi bahwa keluarga Anda aktif melakukan audit mandiri terhadap sumber pendapatan dan pengeluaran zakat.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
