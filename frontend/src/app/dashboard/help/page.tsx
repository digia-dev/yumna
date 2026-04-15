"use client";

import { useState } from "react";
import {
  HelpCircle, ChevronDown, ChevronRight, Search, Book,
  MessageSquare, Zap, Users, Wallet, Moon, Calculator,
  FileText, CheckSquare, Heart, Mail,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// 488 – Help Center / Knowledge Base
const FAQ_SECTIONS = [
  {
    icon: Wallet, color: "emerald", title: "Dompet & Transaksi",
    items: [
      { q: "Bagaimana cara menambah dompet baru?", a: "Buka Dashboard → klik tombol '+ Dompet' di pojok kanan atas. Isi nama, tipe (Kas/Bank/Investasi), dan saldo awal." },
      { q: "Apakah saya bisa menghapus transaksi?", a: "Ya. Buka halaman Transaksi → klik ikon hapus di samping transaksi. Saldo dompet akan dikembalikan otomatis." },
      { q: "Bagaimana cara transfer antar dompet?", a: "Klik tombol '↔ Transfer' di Dashboard, pilih dompet asal dan tujuan, masukkan jumlah." },
      { q: "Apakah transaksi bisa diedit?", a: "Ya. Klik transaksi di halaman Riwayat → pilih Edit. Saldo akan disesuaikan otomatis." },
    ],
  },
  {
    icon: Users, color: "blue", title: "Manajemen Keluarga",
    items: [
      { q: "Bagaimana cara mengundang anggota keluarga?", a: "Buka Profil → Keluarga → Undang Anggota. Masukkan email dan pilih peran (Istri/Anak)." },
      { q: "Berapa maksimal anggota dalam satu keluarga?", a: "Saat ini tidak ada batas yang ditetapkan. Yumna mendukung keluarga besar." },
      { q: "Apakah anak bisa melihat semua transaksi?", a: "Tidak. Kepala Keluarga & Istri bisa mengatur Batas Uang Saku dan izin akses per anggota." },
      { q: "Bagaimana cara keluar dari keluarga?", a: "Buka Profil → Keluarga → Keluar dari Keluarga. Transaksi yang sudah dicatat tidak akan terhapus." },
    ],
  },
  {
    icon: Moon, color: "indigo", title: "Fitur Islami",
    items: [
      { q: "Bagaimana kalkulasi zakat dilakukan?", a: "Zakat dihitung berdasarkan total saldo dompet dibandingkan Nisab (85g emas). Harga emas diupdate secara berkala." },
      { q: "Apa itu Sakinah Mode?", a: "Mode yang menyembunyikan angka nominal transaksi dan mengganti dengan persentase. Cocok untuk ibadah atau saat berbagi layar." },
      { q: "Apa itu Skor Barakah?", a: "Sistem poin yang mencerminkan keaktifan mencatat keuangan. Semakin aktif, semakin tinggi level Barakah keluarga." },
      { q: "Bagaimana cara mencatat zakat yang sudah dibayar?", a: "Buka Zakat Hub → Log Pembayaran → Tambah Zakat. Pilih jenis zakat, jumlah, dan penerima." },
    ],
  },
  {
    icon: Calculator, color: "amber", title: "Laporan & Analitik",
    items: [
      { q: "Bagaimana cara mengekspor laporan ke PDF?", a: "Buka Laporan → Generator Laporan → klik tombol 'PDF / Cetak'." },
      { q: "Bisakah saya mengekspor data ke Excel?", a: "Ya. Di Generator Laporan, pilih kolom yang diinginkan lalu klik 'Ekspor Kustom CSV'. File CSV bisa dibuka di Excel." },
      { q: "Apa itu Deteksi Anomali?", a: "Fitur AI yang secara otomatis mendeteksi pengeluaran yang unusually besar (di atas 2× standar deviasi average)." },
      { q: "Apakah data saya bisa diekspor seluruhnya?", a: "Ya. Generator Laporan → 'Ekspor Semua' → mengunduh JSON lengkap semua data keluarga (GDPR compliant)." },
    ],
  },
  {
    icon: CheckSquare, color: "violet", title: "Tugas & Agenda",
    items: [
      { q: "Apa beda Task dan Sub-task?", a: "Task adalah tugas utama. Sub-task adalah langkah-langkah di dalamnya. Tambah sub-task lewat detail Task → tab Checklist." },
      { q: "Bisakah tugas dikaitkan dengan tagihan?", a: "Ya. Saat membuat bill di halaman Bills → klik 'Buat Task'. Task otomatis terhubung dengan tagihan." },
      { q: "Bagaimana Draggable Board bekerja?", a: "Di halaman Tugas → tab Kanban, seret kartu task dari kolom Belum mulai → Dalam proses → Selesai." },
      { q: "Apa itu Task Template?", a: "Template adalah set tugas yang bisa digunakan ulang (misal: Persiapan Ramadhan). Buat dari tab Templates di halaman Tugas." },
    ],
  },
  {
    icon: Zap, color: "rose", title: "Keamanan & Privasi",
    items: [
      { q: "Apakah data keuangan saya aman?", a: "Ya. Data dienkripsi saat transit (HTTPS/TLS). PIN lock tersedia untuk mencegah akses tanpa izin di perangkat Anda." },
      { q: "Bagaimana cara mengaktifkan PIN Lock?", a: "Buka Profil → Keamanan → Aktifkan PIN. PIN diperlukan setiap kali membuka aplikasi." },
      { q: "Apakah Yumna menjual data saya?", a: "Tidak. Data keluarga Anda 100% privat dan tidak pernah dijual atau dibagikan ke pihak ketiga." },
      { q: "Bagaimana cara menghapus akun?", a: "Hubungi support@yumna.app untuk permintaan penghapusan data sesuai kebijakan GDPR." },
    ],
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-4 text-left group">
        <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-700 transition-colors pr-4">{q}</span>
        {open ? <ChevronDown size={16} className="text-emerald-500 shrink-0" /> : <ChevronRight size={16} className="text-slate-300 shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <p className="pb-4 text-sm text-slate-500 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HelpCenterPage() {
  const [search, setSearch] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const filteredSections = FAQ_SECTIONS.map(section => ({
    ...section,
    items: section.items.filter(item =>
      !search || item.q.toLowerCase().includes(search.toLowerCase()) || item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(s => !search || s.items.length > 0);

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 rounded-[28px] bg-emerald-100 flex items-center justify-center mx-auto shadow-lg">
          <HelpCircle size={40} className="text-emerald-600" />
        </div>
        <h1 className="text-4xl font-black text-emerald-950 tracking-tighter">Pusat Bantuan Yumna</h1>
        <p className="text-emerald-700/60 font-medium">Temukan jawaban atas pertanyaan tentang fitur keuangan keluarga Islami Anda.</p>

        {/* Search */}
        <div className="relative max-w-md mx-auto">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari pertanyaan..."
            className="w-full h-12 pl-10 pr-4 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white shadow-sm" />
        </div>
      </div>

      {/* Quick Links */}
      {!search && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {FAQ_SECTIONS.map((section, i) => (
            <button key={i} onClick={() => setActiveSection(activeSection === section.title ? null : section.title)}
              className={cn("p-4 rounded-[24px] border-2 text-left transition-all group hover:shadow-md",
                activeSection === section.title ? `border-${section.color}-400 bg-${section.color}-50` : "border-slate-100 bg-white hover:border-emerald-200")}>
              <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110",
                `bg-${section.color}-100`)}>
                <section.icon size={18} className={`text-${section.color}-600`} />
              </div>
              <p className="text-xs font-black text-slate-700">{section.title}</p>
              <p className="text-[9px] text-slate-400 mt-0.5">{section.items.length} pertanyaan</p>
            </button>
          ))}
        </div>
      )}

      {/* FAQ Sections */}
      <div className="space-y-6">
        {filteredSections
          .filter(s => !activeSection || s.title === activeSection || !!search)
          .map((section, i) => (
            <Card key={i} className="rounded-[28px] border-none shadow-md overflow-hidden">
              <CardHeader className={cn("pb-4", `bg-${section.color}-50`)}>
                <CardTitle className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", `bg-${section.color}-100`)}>
                    <section.icon size={16} className={`text-${section.color}-600`} />
                  </div>
                  <span className="text-base font-black text-slate-800">{section.title}</span>
                  <span className={cn("ml-auto text-[9px] font-black px-2 py-1 rounded-full", `bg-${section.color}-100 text-${section.color}-600`)}>
                    {section.items.length} FAQ
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                {section.items.map((item, j) => <FaqItem key={j} q={item.q} a={item.a} />)}
              </CardContent>
            </Card>
          ))}
        {filteredSections.length === 0 && (
          <div className="text-center py-16">
            <Search size={40} className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 italic">Tidak ada hasil untuk &ldquo;{search}&rdquo;.</p>
          </div>
        )}
      </div>

      {/* Contact CTA */}
      <Card className="rounded-[32px] border-none bg-linear-to-br from-emerald-600 to-teal-700 text-white overflow-hidden">
        <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-black mb-2">Masih ada pertanyaan?</h3>
            <p className="text-emerald-100/80 text-sm">Tim kami siap membantu Anda 24/7. Hubungi kami melalui email atau chat.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/dashboard/chat">
              <button className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-sm font-bold transition-all border border-white/20">
                <MessageSquare size={16} /> Tanya AI Yumna
              </button>
            </Link>
            <a href="mailto:support@yumna.app">
              <button className="flex items-center gap-2 px-5 py-3 bg-white rounded-2xl text-emerald-700 text-sm font-bold hover:bg-emerald-50 transition-all shadow-lg">
                <Mail size={16} /> Email Support
              </button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
