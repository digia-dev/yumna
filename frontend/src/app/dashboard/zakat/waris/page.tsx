"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Calculator, Users, Info, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

export default function WarisPage() {
  const [totalWealth, setTotalWealth] = useState("");
  const [heirs, setHeirs] = useState<any>({
    hasHusband: false,
    hasWife: false,
    hasFather: false,
    hasMother: false,
    sons: 0,
    daughters: 0
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    if (!totalWealth) return;
    try {
      setLoading(true);
      const res = await apiClient.post("/zakat/inheritance", {
        totalWealth: Number(totalWealth),
        heirs
      });
      setResult(res.data);
    } catch (error) {
      toast.error("Gagal menghitung waris.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setTotalWealth("");
    setHeirs({
      hasHusband: false,
      hasWife: false,
      hasFather: false,
      hasMother: false,
      sons: 0,
      daughters: 0
    });
    setResult(null);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/zakat">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kalkulator Waris (Faraid)</h1>
          <p className="text-muted-foreground">Hitung pembagian harta warisan sesuai syariat Islam.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Input Harta & Ahli Waris</CardTitle>
              <CardDescription>Masukkan total harta bersih (setelah dikurangi hutang dan wasiat).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Total Harta Waris (IDR)</label>
                <Input 
                  type="number" 
                  placeholder="Contoh: 100000000" 
                  value={totalWealth}
                  onChange={(e) => setTotalWealth(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold border-b pb-1">Pasangan & Orang Tua</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="husband" checked={heirs.hasHusband} onCheckedChange={(c) => setHeirs({...heirs, hasHusband: !!c, hasWife: false})} />
                    <label htmlFor="husband" className="text-sm leading-none">Suami</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="wife" checked={heirs.hasWife} onCheckedChange={(c) => setHeirs({...heirs, hasWife: !!c, hasHusband: false})} />
                    <label htmlFor="wife" className="text-sm leading-none">Istri</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="father" checked={heirs.hasFather} onCheckedChange={(c) => setHeirs({...heirs, hasFather: !!c})} />
                    <label htmlFor="father" className="text-sm leading-none">Ayah</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="mother" checked={heirs.hasMother} onCheckedChange={(c) => setHeirs({...heirs, hasMother: !!c})} />
                    <label htmlFor="mother" className="text-sm leading-none">Ibu</label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold border-b pb-1">Anak-anak</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs">Anak Laki-laki</label>
                    <Input type="number" min="0" value={heirs.sons} onChange={(e) => setHeirs({...heirs, sons: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs">Anak Perempuan</label>
                    <Input type="number" min="0" value={heirs.daughters} onChange={(e) => setHeirs({...heirs, daughters: Number(e.target.value)})} />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={reset} variant="outline" className="flex-1">
                  <RefreshCw size={16} className="mr-2" /> Reset
                </Button>
                <Button onClick={handleCalculate} disabled={loading || !totalWealth} className="flex-[2] bg-emerald-deep hover:bg-emerald-deep/90">
                  <Calculator size={16} className="mr-2" /> Hitung Faraid
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3">
            <Info className="text-blue-600 shrink-0" size={18} />
            <p className="text-xs text-blue-800 leading-relaxed">
              <strong>Catatan:</strong> Kalkulator ini menggunakan metode penyederhanaan Faraid. Untuk kasus yang lebih kompleks (kakek, nenek, saudara sepersusuan, dll), harap berkonsultasi dengan ahli waris Islam.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="min-h-[400px] flex flex-col">
            <CardHeader>
              <CardTitle>Hasil Pembagian</CardTitle>
              <CardDescription>Rincian nominal untuk setiap ahli waris.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              {!result ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-30 py-20">
                  <Users size={64} className="mb-4" />
                  <p>Klik 'Hitung Faraid' untuk melihat hasil.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-6 bg-emerald-50 rounded-xl text-center">
                    <span className="text-xs font-medium text-emerald-700 uppercase tracking-widest">Total Terdistribusi</span>
                    <div className="text-3xl font-bold text-emerald-950">Rp {result.totalDistributed.toLocaleString()}</div>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(result.shares).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex justify-between items-center p-3 border rounded-lg hover:border-emerald-deep/30 transition-colors">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold capitalize">{key.replace('_', ' ')}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {key === 'suami' ? '1/2 atau 1/4' : 
                             key === 'istri' ? '1/4 atau 1/8' :
                             key.includes('anak') ? 'Asabah (Residu)' : 'Fardhu'}
                          </span>
                        </div>
                        <span className="font-bold text-emerald-900">Rp {value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {result.remaining > 0 && (
                    <div className="p-3 bg-amber-50 rounded-lg flex justify-between border border-amber-100">
                      <span className="text-xs font-medium">Harta Belum Terbagi (Baitul Maal):</span>
                      <span className="text-xs font-bold">Rp {result.remaining.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
