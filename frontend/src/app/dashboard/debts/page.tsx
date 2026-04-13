"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  AlertCircle, 
  Calendar, 
  User, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2,
  BookOpen
} from "lucide-react";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

const fetcher = (url: string) => apiClient.get(url).then(res => res.data);

export default function DebtsPage() {
  const { data: debts, mutate } = useSWR("/finance/debts", fetcher);
  const [loading, setLoading] = useState(false);

  // Statistics
  const totalLent = debts?.filter((d: any) => d.type === 'LENT').reduce((acc: number, d: any) => acc + Number(d.amount), 0) || 0;
  const totalBorrowed = debts?.filter((d: any) => d.type === 'BORROWED').reduce((acc: number, d: any) => acc + Number(d.amount), 0) || 0;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Piutang & Hutang</h1>
          <p className="text-muted-foreground mt-1">Pantau kewajiban finansial dengan adab Islami.</p>
        </div>
        <Button className="gap-2">
          <Plus size={16} />
          Tambah Catatan
        </Button>
      </div>

      {/* Sunnah Reminders Widget */}
      <Card className="bg-amber-50/50 border-amber-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-800">
            <BookOpen size={16} />
            Adab Berhutang (Sunnah)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-xs text-amber-900 space-y-2 list-disc pl-4">
            <li><strong>Catatlah:</strong> Hendaklah kalian menuliskan transaksi hutang-piutang (QS. Al-Baqarah: 282).</li>
            <li><strong>Saksi:</strong> Persaksikanlah transaksi tersebut jika memungkinkan.</li>
            <li><strong>Niat:</strong> Barangsiapa yang berhutang dengan niat ingin melunasinya, maka Allah akan membantu melunasinya.</li>
            <li><strong>Tepat Waktu:</strong> Menunda pelunasan bagi yang mampu adalah sebuah kezhaliman.</li>
          </ul>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
              <ArrowDownLeft className="text-emerald-500" size={16} />
              Piutang (Kita Meminjamkan)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {totalLent.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Harta yang akan kembali (InshaAllah).</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
              <ArrowUpRight className="text-red-500" size={16} />
              Hutang (Kita Meminjam)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {totalBorrowed.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Kewajiban yang harus segera ditunaikan.</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Daftar Aktif</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {debts?.length > 0 ? debts.map((debt: any) => (
            <Card key={debt.id} className="relative overflow-hidden group">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={debt.type === 'LENT' ? 'outline' : 'destructive'} className={debt.type === 'LENT' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : ''}>
                    {debt.type === 'LENT' ? 'Piutang' : 'Hutang'}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Calendar size={10} /> {new Date(debt.dueDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-lg font-bold">Rp {Number(debt.amount).toLocaleString()}</div>
                <div className="text-sm font-medium mt-1 flex items-center gap-1">
                  <User size={14} className="text-muted-foreground" /> {debt.personName}
                </div>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2 italic">
                  "{debt.description}"
                </p>
                
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                   <div className="text-[10px] text-muted-foreground">
                     Status: <span className="font-semibold text-amber-600">{debt.status}</span>
                   </div>
                   <Button size="sm" variant="ghost" className="h-7 text-[10px] hover:bg-emerald-50 hover:text-emerald-700">
                     Tandai Lunas
                   </Button>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="col-span-full py-20 text-center bg-muted/20 border-2 border-dashed rounded-2xl">
              <CreditCard size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">Belum ada catatan hutang-piutang aktif.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
