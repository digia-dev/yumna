"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Plus, 
  Calendar, 
  MessageSquare, 
  CheckCircle2, 
  Target, 
  ArrowLeft 
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function SyuraNotesPage() {
  const [showForm, setShowForm] = useState(false);
  
  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
             <ArrowLeft size={20} />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Syura Keuangan Keluarga</h1>
          <p className="text-muted-foreground italic">"Dan (bagi) orang-orang yang menerima seruan Tuhan dan mendirikan shalat, sedang urusan mereka (diputuskan) dengan musyawarah..." (Asy-Syura: 38)</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2 bg-emerald-700">
          <Plus size={16} />
          Notulen Baru
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
               <Calendar size={18} className="text-primary" />
               Riwayat Musyawarah
            </h3>
            
            <Card className="border-l-4 border-l-emerald-500">
               <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base font-bold">Rapat Anggaran Ramadhan & Lebaran</CardTitle>
                    <Badge variant="outline">10 Mar 2026</Badge>
                  </div>
               </CardHeader>
               <CardContent className="space-y-4 text-sm">
                  <div>
                    <h5 className="font-medium text-xs text-muted-foreground uppercase mb-1 underline">Keputusan Utama:</h5>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Mengalokasikan dana darurat untuk zakat fitrah 1 keluarga.</li>
                      <li>Membatasi pengeluaran buka puasa luar maksimal 2 kali sebulan.</li>
                      <li>Target tabungan Qurban 2026 ditingkatkan 15%.</li>
                    </ul>
                  </div>
                  <div className="flex -space-x-2">
                     {['Ayah', 'Ibu', 'Aisyah'].map(m => (
                       <div key={m} title={m} className="w-8 h-8 rounded-full bg-primary/10 border-2 border-white flex items-center justify-center text-[10px] font-bold">
                         {m[0]}
                       </div>
                     ))}
                  </div>
               </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-400">
               <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base font-bold">Evaluasi Budget Bulanan</CardTitle>
                    <Badge variant="outline">01 Feb 2026</Badge>
                  </div>
               </CardHeader>
               <CardContent className="space-y-4 text-sm">
                  <div>
                    <h5 className="font-medium text-xs text-muted-foreground uppercase mb-1 underline">Keputusan Utama:</h5>
                    <p>Fokus pelunasan hutang jangka pendek (Kartu Kredit / Paylater) sebelum masuk bulan Sya'ban.</p>
                  </div>
               </CardContent>
            </Card>
         </div>

         <div className="space-y-6">
            <Card className="bg-primary/5 border-none">
               <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target size={18} className="text-primary" />
                    Target Musyawarah Mendatang
                  </CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="p-3 bg-white rounded-xl border flex gap-3">
                     <CheckCircle2 size={16} className="text-muted-foreground" />
                     <span className="text-xs">Rencana Pendidikan Anak (Tahun Ajaran Baru)</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border flex gap-3">
                     <CheckCircle2 size={16} className="text-muted-foreground" />
                     <span className="text-xs">Audit Zakat Maal Tahunan</span>
                  </div>
                  <Button variant="ghost" className="w-full text-xs text-primary border border-primary/20 bg-white">
                    Tambah Topik Inovasi
                  </Button>
               </CardContent>
            </Card>

            <Card className="bg-amber-50 border-amber-200">
               <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MessageSquare size={16} className="text-amber-600" />
                    Pesan Syura
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  <p className="text-[10px] italic text-amber-800 leading-relaxed">
                    "Tidak akan merugi orang yang ber-Istikharah, tidak akan menyesal orang yang bermusyawarah, dan tidak akan melarat orang yang ber-Iqtishad (hemat/proporsional)." (HR At-Thabrani)
                  </p>
               </CardContent>
            </Card>
         </div>
      </div>
    </div>
  );
}
