"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Book, HelpCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

const GLOSSARY_ITEMS = [
  { term: "Gharar", category: "Transaksi", definition: "Ketidakpastian dalam suatu akad, baik mengenai kualitas, kuantitas, maupun penyerahan objek akad. Sangat dilarang dalam keuangan Islam." },
  { term: "Maysir", category: "Transaksi", definition: "Perjudian atau spekulasi yang berlebihan di mana satu pihak untung dari kerugian pihak lain tanpa ada pertukaran nilai yang adil." },
  { term: "Riba", category: "Transaksi", definition: "Tambahan atau kelebihan dalam pertukaran barang sejenis (Riba Fadhl) atau tambahan dalam hutang-piutang (Riba Nasiah)." },
  { term: "Wadiah", category: "Akad Tabungan", definition: "Titipan murni dari satu pihak ke pihak lain yang harus dijaga dan dapat diambil kapan saja." },
  { term: "Mudharabah", category: "Akad Investasi", definition: "Kerja sama di mana satu pihak menyediakan modal (Shahibul Maal) dan pihak lain menyediakan keahlian (Mudharib). Keuntungan dibagi sesuai kesepakatan." },
  { term: "Musyarakah", category: "Akad Investasi", definition: "Kerja sama di mana kedua pihak berkontribusi modal dan usaha. Keuntungan dan kerugian dibagi secara proporsional." },
  { term: "Zakat Maal", category: "Zakat", definition: "Zakat yang dikenakan atas harta (tabungan, perhiasan, dll) yang telah mencapai nisab dan haul." },
  { term: "Nisab", category: "Zakat", definition: "Ambang batas minimum jumlah harta yang menyebabkan seseorang wajib mengeluarkan zakat." },
  { term: "Haul", category: "Zakat", definition: "Jangka waktu satu tahun Hijriah (354 hari) sebagai syarat wajib zakat harta." },
  { term: "Sukuk", category: "Investasi", definition: "Sertifikat bernilai sama yang mewakili bukti kepemilikan yang tak terbagi atas suatu aset (Obligasi Syariah)." }
];

export default function GlossaryPage() {
  const [search, setSearch] = useState("");

  const filtered = GLOSSARY_ITEMS.filter(item => 
    item.term.toLowerCase().includes(search.toLowerCase()) || 
    item.definition.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/zakat">
           <Button variant="ghost" size="icon">
              <ArrowLeft size={18} />
           </Button>
        </Link>
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Glosarium Keuangan Halal</h1>
           <p className="text-muted-foreground">Pahami istilah penting dalam ekonomi Syariah.</p>
        </div>
      </div>

      <Card className="p-4 bg-primary/5 border-none">
         <div className="relative">
            <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
            <Input 
               className="pl-10 h-12 bg-white" 
               placeholder="Cari istilah (contoh: Riba, Mudharabah...)" 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
            />
         </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         {filtered.length > 0 ? filtered.map((item, i) => (
           <Card key={i} className="hover:shadow-md transition-all border-emerald-100">
              <CardHeader className="pb-2">
                 <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-serif text-emerald-900">{item.term}</CardTitle>
                    <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700">{item.category}</Badge>
                 </div>
              </CardHeader>
              <CardContent>
                 <p className="text-sm text-balance leading-relaxed text-muted-foreground">
                    {item.definition}
                 </p>
              </CardContent>
           </Card>
         )) : (
           <div className="col-span-full py-20 text-center">
              <HelpCircle size={48} className="mx-auto text-muted-foreground opacity-20 mb-4" />
              <p className="text-muted-foreground">Istilah tidak ditemukan.</p>
           </div>
         )}
      </div>

      <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl flex gap-4">
         <Book className="text-amber-600 shrink-0" size={24} />
         <div>
            <h4 className="font-bold text-amber-900 mb-1">Pentingnya Literasi Keuangan Islami</h4>
            <p className="text-xs text-amber-800 leading-relaxed">
               Memahami akad-akad dasar dalam keuangan Islam membantu kita menjauhkan diri dari transaksi yang batil dan memastikan setiap harta yang masuk memiliki keberkahan yang maksimal.
            </p>
         </div>
      </div>
    </div>
  );
}
