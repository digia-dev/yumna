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
  Plus,
  ArrowRight,
  TrendingDown,
  Navigation
} from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

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

  const { data: breakdown } = useSWR("/finance/wealth-breakdown", (url) => 
    apiClient.get(url).then(res => res.data)
  );

  const { data: wallets } = useSWR("/finance/wallets", (url) => 
    apiClient.get(url).then(res => res.data)
  );

  const [wealth, setWealth] = useState("");
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [loadingCalc, setLoadingCalc] = useState(false);
  const [activeTab, setActiveTab] = useState("maal");
  const [useSilverNisab, setUseSilverNisab] = useState(false);

  const [fidyahDays, setFidyahDays] = useState("");
  const [fidyahResult, setFidyahResult] = useState<any>(null);

  const [showPayDialog, setShowPayDialog] = useState(false);
  const [payData, setPayData] = useState({
    walletId: "",
    amount: "",
    recipient: "",
    notes: "",
    type: "Zakat Maal"
  });
  const [loadingPay, setLoadingPay] = useState(false);

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

  const handlePay = async () => {
    if (!payData.walletId || !payData.amount || !payData.recipient) {
      toast.error("Mohon lengkapi data penyaluran.");
      return;
    }

    try {
      setLoadingPay(true);
      await apiClient.post("/zakat/pay", {
        ...payData,
        amount: Number(payData.amount)
      });
      toast.success("Zakat berhasil disalurkan. Barakallah!");
      setShowPayDialog(false);
      mutateHistory();
      // Reset pay data
      setPayData({
        walletId: "",
        amount: "",
        recipient: "",
        notes: "",
        type: "Zakat Maal"
      });
    } catch (error) {
      toast.error("Gagal menyalurkan zakat.");
    } finally {
      setLoadingPay(false);
    }
  };

  const openPayDialog = (type: string, amount?: number) => {
    setPayData({
      ...payData,
      type,
      amount: amount?.toString() || ""
    });
    setShowPayDialog(true);
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
          <Button variant="outline" className="gap-2" onClick={() => window.scrollTo({top: 2000, behavior: 'smooth'})}>
            <History size={16} />
            Riwayat
          </Button>
          <Button className="bg-emerald-deep hover:bg-emerald-deep/90 text-white gap-2" onClick={() => openPayDialog("Zakat Maal")}>
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
                 <Card className="border-emerald-100 bg-emerald-50/20 shadow-sm">
                    <CardHeader className="pb-2">
                       <CardTitle className="text-xs flex items-center justify-between">
                          <span>Target Qurban 2026</span>
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 h-4 text-[8px]">In Progress</Badge>
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                       <div className="flex justify-between items-end">
                          <div>
                             <p className="text-lg font-bold">Rp 3.500.000</p>
                             <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">Goal: Rp 5.000.000 (70%)</p>
                          </div>
                          <TrendingUp size={20} className="text-emerald-300" />
                       </div>
                       <Progress value={70} className="h-1.5" />
                    </CardContent>
                 </Card>

                 <Card className="border-blue-100 bg-blue-50/20 shadow-sm">
                    <CardHeader className="pb-2">
                       <CardTitle className="text-xs">Estimator Biaya Umroh/Haji</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                       <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                             <Select defaultValue="reguler">
                                <SelectTrigger className="h-7 text-[10px] bg-white">
                                   <SelectValue placeholder="Paket" />
                                </SelectTrigger>
                                <SelectContent>
                                   <SelectItem value="reguler">Reguler</SelectItem>
                                   <SelectItem value="plus">Plus</SelectItem>
                                </SelectContent>
                             </Select>
                          </div>
                          <Input type="number" defaultValue={2} className="h-7 text-[10px] bg-white" placeholder="Jiwa" />
                       </div>
                       <div className="p-2 bg-blue-100/50 rounded flex justify-between items-center">
                          <span className="text-[10px] font-bold text-blue-900 uppercase">Estimasi:</span>
                          <span className="text-sm font-black text-blue-950">~Rp 65jt</span>
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
                <p className="text-xs">Pilih kategori, masukkan nominal dan klik hitung.</p>
              </div>
            ) : (
              <Card className={calculationResult.isObligatory ? "border-emerald-deep shadow-md" : "border-amber-200"}>
                <CardHeader className="pb-2 text-center">
                  <Badge className={calculationResult.isObligatory ? "bg-emerald-500 mx-auto w-fit" : "bg-amber-500 mx-auto w-fit"}>
                    {calculationResult.isObligatory ? "WAJIB ZAKAT" : "BELUM WAJIB"}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-6 bg-emerald-50 rounded-xl flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-1">Nominal Penyaluran</span>
                    <span className="text-3xl font-black text-emerald-950">
                      Rp {(calculationResult.zakatAmount || calculationResult.totalAmount || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                  
                  <div className="space-y-3 text-[11px]">
                    <div className="flex justify-between border-b border-dashed pb-2">
                      <span className="text-muted-foreground uppercase font-bold tracking-tighter">Dasar Harta</span>
                      <span className="font-bold">Rp {Number(wealth).toLocaleString('id-ID')}</span>
                    </div>
                    {calculationResult.nisab && (
                      <div className="flex justify-between border-b border-dashed pb-2">
                        <span className="text-muted-foreground uppercase font-bold tracking-tighter">Batas Nisab</span>
                        <span className="font-bold text-rose-600">Rp {calculationResult.nisab.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                  </div>

                  {calculationResult.isObligatory && (
                    <Button 
                      className="w-full bg-emerald-deep hover:bg-emerald-900 h-12 text-sm font-bold uppercase tracking-widest"
                      onClick={() => openPayDialog(payData.type, calculationResult.zakatAmount || calculationResult.totalAmount)}
                    >
                      Salurkan Sekarang
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            <Card className="border-none shadow-sm bg-gradient-to-br from-slate-50 to-emerald-50/50">
               <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-black flex items-center gap-2 uppercase tracking-tight text-slate-600">
                    <PieChart size={14} className="text-emerald-500" />
                    Proporsi Kekayaan Saat Ini
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="space-y-3">
                     {breakdown && breakdown.length > 0 ? breakdown.map((item: any, i: number) => (
                       <div key={i} className="space-y-1">
                          <div className="flex justify-between text-[9px] font-bold uppercase tracking-tighter text-slate-500">
                             <span>{item.name}</span>
                             <span className="text-slate-900">{item.val}%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                             <div className={`${item.color} h-full transition-all duration-500`} style={{ width: `${item.val}%` }} />
                          </div>
                       </div>
                     )) : (
                       <div className="py-8 text-center text-[10px] text-muted-foreground italic">
                          Belum ada data aset terkoneksi.
                       </div>
                     )}
                  </div>
               </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>

      {/* History Section */}
      <div className="mt-12 space-y-4 pt-8 border-t border-slate-100" id="riwayat">
         <div className="flex items-center justify-between">
            <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
              <History size={20} className="text-emerald-600" />
              Riwayat Distribusi Zakat
            </h3>
            <Button variant="ghost" size="sm" className="text-emerald-700 font-bold text-[10px] uppercase">Lihat Audit</Button>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {history?.length > 0 ? history.map((log: any) => (
              <Card key={log.id} className="relative overflow-hidden group hover:border-emerald-200 transition-colors">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 text-[8px] h-4">
                      {log.type}
                    </Badge>
                    <span className="text-[9px] text-muted-foreground font-mono">{new Date(log.date).toLocaleDateString('id-ID')}</span>
                  </div>
                  <div className="text-xl font-black text-slate-900">Rp {Number(log.amount).toLocaleString('id-ID')}</div>
                  <div className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1 font-medium bg-slate-50 p-2 rounded">
                    <Navigation size={10} className="text-emerald-600" />
                    KE: <span className="text-slate-900 uppercase">{log.recipient || 'Mandiri'}</span>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <div className="col-span-full py-20 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-muted-foreground flex flex-col items-center">
                 <Coins size={40} className="mb-2 opacity-10" />
                 <p className="text-sm font-medium">Belum ada penyaluran zakat tercatat.</p>
                 <p className="text-[10px]">Tunaikan kewajiban dan raih keberkahan.</p>
              </div>
            )}
         </div>
      </div>

      <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 mt-8">
        <Info className="text-amber-600 shrink-0" size={18} />
        <p className="text-[10px] text-amber-800 leading-relaxed font-medium">
          <strong>PENTING:</strong> Hasil perhitungan ini bersifat bantuan administratif berdasarkan parameter umum. Silakan konsultasi dengan LAZ (Lembaga Amil Zakat) resmi untuk rincian hukum fiqh yang lebih spesifik.
        </p>
      </div>
      </div>

      {/* Zakat Payment Dialog */}
      <Dialog open={showPayDialog} onOpenChange={setShowPayDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
              <Coins className="text-emerald-600" />
              Penyaluran Zakat
            </DialogTitle>
            <DialogDescription>
              Tunaikan kewajiban Anda langsung melalui dompet keluarga.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Jenis Penyaluran</label>
              <Input value={payData.type} readOnly className="bg-slate-50 font-bold" />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Pilih Sumber Dana</label>
              <Select onValueChange={(v) => setPayData({...payData, walletId: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Dompet..." />
                </SelectTrigger>
                <SelectContent>
                  {wallets?.map((w: any) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name} (Saldo: {formatCurrency(Number(w.balance))})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Nominal</label>
                  <Input 
                    type="number" 
                    placeholder="Rp" 
                    value={payData.amount}
                    onChange={(e) => setPayData({...payData, amount: e.target.value})}
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Penerima</label>
                  <Input 
                    placeholder="BAZNAS / Masjid..." 
                    value={payData.recipient}
                    onChange={(e) => setPayData({...payData, recipient: e.target.value})}
                  />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Catatan / Niat (Opsional)</label>
               <Input 
                 placeholder="Ucapkan bismillah..." 
                 value={payData.notes}
                 onChange={(e) => setPayData({...payData, notes: e.target.value})}
               />
            </div>
          </div>
          <DialogFooter>
            <Button 
              className="w-full bg-emerald-deep hover:bg-emerald-900 h-12 font-black uppercase tracking-widest"
              onClick={handlePay}
              disabled={loadingPay}
            >
              {loadingPay ? "Memproses..." : "Tunaikan Sekarang"}
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
