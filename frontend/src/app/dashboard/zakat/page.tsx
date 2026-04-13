"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Zap, 
  PieChart, 
  Coins, 
  Calculator, 
  History, 
  TrendingUp, 
  Info, 
  AlertCircle, 
  CheckCircle2, 
  User, 
  Users, 
  Plus 
} from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

export default function ZakatHubPage() {
  const { data: nisabData, isLoading: loadingNisab } = useSWR("/zakat/nisab", (url) => 
    apiClient.get(url).then(res => res.data)
  );

  const { data: quote } = useSWR("/zakat/quotes", (url) => 
    apiClient.get(url).then(res => res.data)
  );

  const { data: history, mutate: mutateHistory } = useSWR("/zakat/history", (url) => 
    apiClient.get(url).then(res => res.data)
  );

  const { data: haulStatus } = useSWR("/zakat/haul-status", (url) => 
    apiClient.get(url).then(res => res.data)
  );

  const [wealth, setWealth] = useState("");
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [loadingCalc, setLoadingCalc] = useState(false);
  const [activeTab, setActiveTab] = useState("maal");
  const [useSilverNisab, setUseSilverNisab] = useState(false);

  const [fidyahDays, setFidyahDays] = useState("");
  const [fidyahResult, setFidyahResult] = useState<any>(null);

  const handleCalculate = async () => {
    if (!wealth) return;
    try {
      setLoadingCalc(true);
      const res = await apiClient.post("/zakat/calculate", {
        amount: Number(wealth),
        type: activeTab.toUpperCase() === "MAAL" ? "MAAL" : "PROFESSION",
        useSilver: useSilverNisab
      });
      setCalculationResult(res.data);
    } catch (error) {
      toast.error("Gagal menghitung zakat.");
    } finally {
      setLoadingCalc(false);
    }
  };

  const calculateFidyah = async () => {
    if (!fidyahDays) return;
    const res = await apiClient.post("/zakat/fidyah", { days: Number(fidyahDays) });
    setFidyahResult(res.data);
  };

  return (
    <>
      <div className="space-y-6 pb-20">
      {/* Education Quote Widget */}
      {quote && (
        <div className="bg-emerald-900 text-emerald-100 p-4 rounded-2xl flex items-center gap-4 border-l-4 border-amber-400 shadow-inner">
           <Zap className="text-amber-400 shrink-0" size={24} />
           <div className="text-sm italic">
             "{quote.text}" — <span className="font-bold">{quote.author}</span>
           </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Pusat Zakat & Infak</h1>
          <p className="text-muted-foreground mt-1">Kelola kewajiban finansial Islami Anda dengan presisi.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/zakat/waris">
            <Button variant="outline" className="gap-2 border-amber-200 text-amber-900 bg-amber-50/50">
              <Users size={16} />
              Kalkulator Waris
            </Button>
          </Link>
          <Button variant="outline" className="gap-2" onClick={() => window.scrollTo({top: 1000, behavior: 'smooth'})}>
            <History size={16} />
            Riwayat
          </Button>
          <Button className="bg-emerald-deep hover:bg-emerald-deep/90 text-white gap-2">
            <Coins size={16} />
            Bayar Zakat
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-emerald-deep text-white border-none shadow-lg overflow-hidden relative">
          <CardHeader className="pb-1">
            <CardTitle className="text-[10px] font-medium opacity-80 uppercase tracking-widest">Harga Emas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {loadingNisab ? "..." : `Rp ${(nisabData?.maal / 85).toLocaleString('id-ID')}`}
            </div>
            <p className="text-[10px] opacity-70 flex items-center gap-1">
              <TrendingUp size={10} /> Per gram murni
            </p>
          </CardContent>
          <div className="absolute -right-2 -bottom-2 opacity-10">
            <Coins size={60} />
          </div>
        </Card>
        
        <Card className={useSilverNisab ? "border-emerald-deep/10 bg-slate-100 opacity-60" : "border-emerald-deep/10 bg-emerald-50/30"}>
          <CardHeader className="pb-1 flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] font-medium text-emerald-800 uppercase tracking-widest">Nisab Maal (Emas)</CardTitle>
            {!useSilverNisab && <CheckCircle2 size={12} className="text-emerald-600" />}
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-emerald-950">
              {loadingNisab ? "..." : `Rp ${nisabData?.maal?.toLocaleString('id-ID')}`}
            </div>
            <p className="text-[10px] text-emerald-600 font-medium">85 gr Emas</p>
          </CardContent>
        </Card>

        <Card className={!useSilverNisab ? "border-slate-200 bg-slate-50 opacity-60" : "border-amber-200 bg-amber-50/50 ring-1 ring-amber-200"}>
          <CardHeader className="pb-1 flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] font-medium text-amber-800 uppercase tracking-widest">Nisab Maal (Perak)</CardTitle>
            {useSilverNisab && <CheckCircle2 size={12} className="text-amber-600" />}
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-amber-950">
              {loadingNisab ? "..." : `Rp ${nisabData?.silver?.toLocaleString('id-ID')}`}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-amber-600 font-medium">595 gr Perak</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-4 text-[8px] bg-white border border-amber-200"
                onClick={() => setUseSilverNisab(!useSilverNisab)}
              >
                Gunakan
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className={haulStatus?.isHaulMet ? "bg-amber-100 border-amber-200" : "bg-muted/50"}>
          <CardHeader className="pb-1">
            <CardTitle className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Progress Haul</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {haulStatus ? `${haulStatus.durationDays} hari` : "..."}
            </div>
            <p className="text-[10px] text-muted-foreground">Target: 354 hari</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="maal" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 space-x-6">
          <TabsTrigger value="maal" className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-deep data-[state=active]:bg-transparent px-2 py-3">Maal (Harta)</TabsTrigger>
          <TabsTrigger value="profession" className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-deep data-[state=active]:bg-transparent px-2 py-3">Profesi (Gaji)</TabsTrigger>
          <TabsTrigger value="fitrah" className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-deep data-[state=active]:bg-transparent px-2 py-3">Fitrah</TabsTrigger>
          <TabsTrigger value="fidyah" className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-deep data-[state=active]:bg-transparent px-2 py-3">Fidyah & Kaffarah</TabsTrigger>
          <TabsTrigger value="waqaf" className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-deep data-[state=active]:bg-transparent px-2 py-3">Waqaf</TabsTrigger>
          <TabsTrigger value="planning" className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-deep data-[state=active]:bg-transparent px-2 py-3 font-bold">Perencanaan</TabsTrigger>
        </TabsList>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <TabsContent value="maal" className="m-0 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Kalkulator Zakat Maal</h3>
                  <div className="flex items-center gap-2 bg-muted/50 px-2 py-1 rounded-full border">
                    <span className="text-[10px] font-medium">Metode: {useSilverNisab ? 'Perak' : 'Emas'}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Hitung zakat dari total kekayaan Anda (Tabungan, Emas, Investasi) yang sudah tersimpan selama 1 tahun (Haul).</p>
              </div>
              {haulStatus?.durationDays < 354 && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                  <AlertCircle className="text-amber-500 shrink-0" size={18} />
                  <div className="text-xs text-amber-800">
                    <strong>Peringatan Haul:</strong> Kekayaan Anda baru tersimpan selama {haulStatus.durationDays} hari. Zakat Maal wajib dibayar jika harta tersimpan minimal 354 hari (1 tahun Hijriah).
                  </div>
                </div>
              )}
              <div className="space-y-4 bg-muted/30 p-6 rounded-xl border border-border">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Total Kekayaan (IDR)</label>
                  <Input 
                    type="number" 
                    placeholder="Masukkan total harta..." 
                    value={wealth}
                    onChange={(e) => setWealth(e.target.value)}
                  />
                </div>
                <Button onClick={handleCalculate} disabled={loadingCalc || !wealth} className="w-full gap-2">
                  <Calculator size={16} />
                  Hitung Zakat {useSilverNisab ? '(Perak)' : '(Emas)'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="profession" className="m-0 space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Kalkulator Zakat Profesi</h3>
                <p className="text-sm text-muted-foreground">Hitung zakat dari pendapatan rutin bulanan Anda.</p>
              </div>
              <div className="space-y-4 bg-muted/30 p-6 rounded-xl border border-border">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pendapatan Bersih Bulanan (IDR)</label>
                  <Input 
                    type="number" 
                    placeholder="Masukkan gaji bersih..." 
                    value={wealth}
                    onChange={(e) => setWealth(e.target.value)}
                  />
                </div>
                <Button onClick={handleCalculate} disabled={loadingCalc || !wealth} className="w-full gap-2">
                  <Calculator size={16} />
                  Hitung Zakat
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="fitrah" className="m-0 space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Kalkulator Zakat Fitrah</h3>
                <p className="text-sm text-muted-foreground">Wajib dibayarkan oleh setiap muslim di bulan Ramadhan.</p>
              </div>
              <div className="space-y-4 bg-muted/30 p-6 rounded-xl border border-border">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Jumlah Anggota Keluarga</label>
                  <Input 
                    type="number" 
                    placeholder="Jumlah jiwa..." 
                    value={wealth}
                    onChange={(e) => setWealth(e.target.value)}
                  />
                </div>
                <Button onClick={async () => {
                   const res = await apiClient.post("/zakat/calculate", { amount: Number(wealth), type: "FITRAH" });
                   setCalculationResult({ isObligatory: true, ...res.data });
                }} disabled={!wealth} className="w-full gap-2">
                  <Calculator size={16} />
                  Hitung Fitrah
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="fidyah" className="m-0 space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Kalkulator Fidyah</h3>
                <p className="text-sm text-muted-foreground">Tebusan bagi yang tidak mampu menjalankan puasa (Lansia, Sakit Menahun, dll).</p>
              </div>
              <div className="space-y-4 bg-muted/30 p-6 rounded-xl border border-border">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Jumlah Hari Hutang Puasa</label>
                  <Input 
                    type="number" 
                    placeholder="Hutang hari..." 
                    value={fidyahDays}
                    onChange={(e) => setFidyahDays(e.target.value)}
                  />
                </div>
                <Button onClick={calculateFidyah} disabled={!fidyahDays} className="w-full gap-2 border-emerald-deep text-emerald-800" variant="outline">
                  <Calculator size={16} />
                  Hitung Fidyah
                </Button>
              </div>
              {fidyahResult && (
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                  <div className="flex justify-between items-center font-bold">
                    <span>Total Fidyah:</span>
                    <span className="text-xl">Rp {fidyahResult.totalAmount.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{fidyahResult.description}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="planning" className="m-0 space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Perencanaan Ibadah Finansial</h3>
                <p className="text-sm text-muted-foreground">Siapkan dana untuk ibadah besar masa depan Anda.</p>
              </div>
              
              <div className="space-y-4">
                 <Card className="border-emerald-100 bg-emerald-50/20">
                    <CardHeader className="pb-2">
                       <CardTitle className="text-sm flex items-center justify-between">
                          <span>Target Qurban 2026 (Sapi/Kambing)</span>
                          <Badge>In Progress</Badge>
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div className="flex justify-between items-end">
                          <div>
                             <p className="text-2xl font-bold">Rp 3.500.000</p>
                             <p className="text-[10px] text-muted-foreground">Terkumpul dari Rp 5.000.000 (70%)</p>
                          </div>
                          <TrendingUp size={24} className="text-emerald-300" />
                       </div>
                       <Progress value={70} className="h-2" />
                    </CardContent>
                 </Card>

                 <Card>
                    <CardHeader className="pb-2">
                       <CardTitle className="text-sm">Estimator Biaya Umroh/Haji</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                             <label className="text-[10px] font-bold uppercase text-muted-foreground">Pilih Paket</label>
                             <Select defaultValue="reguler">
                                <SelectTrigger className="h-8 text-xs">
                                   <SelectValue placeholder="Pilih..." />
                                </SelectTrigger>
                                <SelectContent>
                                   <SelectItem value="reguler">Reguler (9 Hari)</SelectItem>
                                   <SelectItem value="plus">Plus Turki (12 Hari)</SelectItem>
                                </SelectContent>
                             </Select>
                          </div>
                          <div className="space-y-1">
                             <label className="text-[10px] font-bold uppercase text-muted-foreground">Jumlah Jiwa</label>
                             <Input type="number" defaultValue={2} className="h-8 text-xs" />
                          </div>
                       </div>
                       <div className="p-3 bg-blue-50 rounded-lg flex justify-between items-center border border-blue-100">
                          <span className="text-xs font-bold text-blue-900">Estimasi Total:</span>
                          <span className="text-lg font-black text-blue-950">~Rp 65.000.000</span>
                       </div>
                       <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">Buat Savings Goal Baru</Button>
                    </CardContent>
                 </Card>

                 <Card className="bg-amber-50">
                    <CardHeader className="pb-2">
                       <CardTitle className="text-sm">Zakat Goal (Niat Bayar)</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <p className="text-[10px] text-amber-900 mb-2">"Saya berniat menyisihkan Rp 10.000.000 untuk Zakat Maal pada akhir Ramadhan 2026."</p>
                       <div className="flex justify-between items-center text-xs font-bold">
                          <span>Progress: Rp 7.500.000</span>
                          <span className="text-amber-700 underline cursor-pointer">Edit Niat</span>
                       </div>
                    </CardContent>
                 </Card>
              </div>
            </TabsContent>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Hasil Perhitungan</h3>
              <Link href="/dashboard/zakat/audit">
                <Button variant="outline" size="sm" className="h-8 text-[10px] gap-1 border-emerald-200 text-emerald-700">
                  <CheckCircle2 size={12} /> Audit Tahunan Zakat
                </Button>
              </Link>
            </div>
            {!calculationResult ? (
              <div className="h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-white/50">
                <Calculator size={48} className="mb-4 opacity-20" />
                <p>Masukkan nominal dan klik tombol hitung untuk melihat detail kewajiban zakat Anda.</p>
              </div>
            ) : (
              <Card className={calculationResult.isObligatory ? "border-emerald-deep shadow-md" : "border-amber-200"}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {calculationResult.isObligatory ? (
                      <CheckCircle2 size={20} className="text-emerald-500" />
                    ) : (
                      <AlertCircle size={20} className="text-amber-500" />
                    )}
                    {calculationResult.isObligatory ? "Kewajiban Zakat Terdeteksi" : "Belum Melewati Nisab"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-6 bg-emerald-50 rounded-xl flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-medium text-emerald-700 uppercase tracking-widest mb-1">Wajib Bayar</span>
                    <span className="text-3xl font-bold text-emerald-950">
                      Rp {(calculationResult.zakatAmount || calculationResult.totalAmount || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                  
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground font-display">Dasar Perhitungan:</span>
                      <span className="font-medium">Rp {Number(wealth).toLocaleString('id-ID')}</span>
                    </div>
                    {calculationResult.nisab && (
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground font-display">Batas Nisab:</span>
                        <span className="font-medium">Rp {calculationResult.nisab.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    <div className="flex justify-between pb-2">
                      <span className="text-muted-foreground font-display">Persentase:</span>
                      <span className="font-medium">2.5%</span>
                    </div>
                  </div>

                  {calculationResult.isObligatory && (
                    <Button className="w-full bg-emerald-deep hover:bg-emerald-deep/90 h-12 text-lg font-display">
                      Salurkan Sekarang
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
               <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <PieChart size={16} className="text-primary" />
                    Proporsi Kekayaan (Wealth Breakdown)
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="space-y-3">
                     {[
                       { name: 'Tabungan & Kas', val: 70, color: 'bg-emerald-500' },
                       { name: 'Emas & Perhiasan', val: 20, color: 'bg-amber-400' },
                       { name: 'Investasi / Saham', val: 10, color: 'bg-blue-500' },
                     ].map((item, i) => (
                       <div key={i} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-medium uppercase tracking-tighter">
                             <span>{item.name}</span>
                             <span>{item.val}%</span>
                          </div>
                          <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                             <div className={`${item.color} h-full`} style={{ width: `${item.val}%` }} />
                          </div>
                       </div>
                     ))}
                  </div>
               </CardContent>
            </Card>
            
            <div className="grid grid-cols-2 gap-4">
               <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="p-2 bg-amber-100 rounded-lg w-fit mb-3">
                    <History className="text-amber-600" size={18} />
                  </div>
                  <h4 className="font-semibold text-sm">Tabungan Qurban</h4>
                  <p className="text-[10px] text-muted-foreground">Kumpulkan dana untuk Idul Adha.</p>
               </Card>
               <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="p-2 bg-blue-100 rounded-lg w-fit mb-3">
                    <TrendingUp className="text-blue-600" size={18} />
                  </div>
                  <h4 className="font-semibold text-sm">Target Umroh</h4>
                  <p className="text-[10px] text-muted-foreground">Capai impian ke baitullah.</p>
               </Card>
            </div>
          </div>
        </div>
      </Tabs>

        {/* History Section */}
        <div className="mt-12 space-y-4 pt-8 border-t">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Riwayat & Distribusi Zakat</h3>
              <Button variant="ghost" size="sm" className="text-primary">Lihat Semua</Button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {history?.length > 0 ? history.map((log: any) => (
                <Card key={log.id} className="relative overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold">
                        {log.type}
                      </div>
                      <span className="text-[10px] text-muted-foreground">{new Date(log.date).toLocaleDateString()}</span>
                    </div>
                    <div className="text-lg font-bold">Rp {Number(log.amount).toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <User size={12} /> {log.recipient || 'Disalurkan mandiri'}
                    </div>
                    {log.notes && (
                      <div className="mt-2 text-[10px] bg-muted p-2 rounded italic">
                        "{log.notes}"
                      </div>
                    )}
                  </CardContent>
                </Card>
              )) : (
                <div className="col-span-full py-12 text-center bg-muted/20 rounded-xl border border-dashed text-muted-foreground">
                   Belum ada data distribusi zakat yang tercatat.
                </div>
              )}
           </div>
        </div>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex gap-3 mt-8">
          <Info className="text-amber-600 shrink-0" size={18} />
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Catatan:</strong> Hasil perhitungan ini bersifat bantuan administratif. Pastikan untuk berkonsultasi dengan Lembaga Amil Zakat atau Ustadz terpercaya untuk kepastian hukum fiqh yang lebih mendalam.
          </p>
        </div>
      </>
    );
  }
