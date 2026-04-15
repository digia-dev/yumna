"use client";

import { useState } from "react";
import { Shield, ChevronDown, ChevronRight, Lock, Eye, Database, Globe, Trash2, Mail, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

// 451 – Kebijakan Privasi (Privacy Policy) page with consent checkbox

const SECTIONS = [
  {
    icon: Database, color: "emerald",
    title: "Data yang Kami Kumpulkan",
    content: `Yumna mengumpulkan data berikut untuk memberikan layanan keuangan keluarga:

**Data yang Anda berikan:**
• Nama, email, dan kata sandi (di-hash dengan bcrypt)
• Data keuangan: saldo dompet, transaksi, tagihan, dan tujuan tabungan
• Data keluarga: nama anggota, peran, dan hak akses
• Tugas, catatan keluarga, dan lampiran foto
• Pesan chat dengan asisten AI Yumna

**Data yang dikumpulkan otomatis:**
• Waktu login dan aktivitas sesi (Request ID)
• Preferensi UI (tema, urutan widget)
• Laporan bug yang Anda kirimkan secara sukarela

**Data yang TIDAK kami kumpulkan:**
• Nomor rekening bank atau kartu kredit lengkap
• Lokasi GPS (fitur geofencing bersifat opsional di masa depan)
• Data biometrik`,
  },
  {
    icon: Lock, color: "blue",
    title: "Keamanan Data",
    content: `Yumna mengimplementasikan perlindungan berlapis:

• **Enkripsi Transit:** HTTPS/TLS di semua komunikasi (HSTS aktif)
• **Enkripsi Simetris:** AES-256-GCM untuk data sensitif (field-level encryption)
• **Kata Sandi:** Di-hash menggunakan bcrypt (salt rounds = 10)
• **Autentikasi:** JWT stateless dengan masa berlaku singkat (15 menit)
• **Perlindungan Serangan:** WAF aplikasi, rate limiting, deteksi SQLi & XSS
• **Header Keamanan:** CSP, X-Frame-Options, HSTS, Referrer-Policy

Data Anda **tidak pernah** dijual, disewakan, atau dibagikan kepada pihak ketiga.`,
  },
  {
    icon: Eye, color: "violet",
    title: "Cara Kami Menggunakan Data",
    content: `Data Anda digunakan **hanya** untuk:

• Menyediakan fitur manajemen keuangan keluarga
• Menghitung zakat, anggaran, dan analitik keuangan
• Memproses permintaan melalui asisten AI Yumna
• Mengirimkan pengingat tagihan dan laporan bulanan (jika diaktifkan)
• Meningkatkan pengalaman aplikasi berdasarkan pola penggunaan yang dianonimkan

**Kami TIDAK menggunakan data Anda untuk:**
• Iklan tertarget
• Profiling perilaku komersial
• Berbagi dengan mitra pemasaran pihak ketiga`,
  },
  {
    icon: Globe, color: "amber",
    title: "Berbagi Data",
    content: `Yumna **tidak menjual atau membagikan** data pribadi Anda. Satu-satunya pengecualian adalah:

• **Anggota keluarga yang sama:** Data keuangan keluarga terlihat oleh anggota yang berwenang sesuai peran (Kepala/Istri/Anak)
• **Penyedia infrastruktur:** Server hosting (Railway/Vercel) dan database memproses data Anda secara teknis — namun terikat perjanjian kerahasiaan ketat
• **Kepatuhan hukum:** Hanya jika diwajibkan oleh hukum yang berlaku di Indonesia`,
  },
  {
    icon: Trash2, color: "rose",
    title: "Hak Anda (GDPR & UU PDP Indonesia)",
    content: `Anda memiliki hak penuh atas data Anda:

• **Hak Akses:** Ekspor semua data Anda melalui Generator Laporan → "Ekspor Semua"
• **Hak Koreksi:** Edit profil dan data keuangan kapan saja
• **Hak Penghapusan:** Hubungi support@yumna.app untuk menghapus akun dan semua data
• **Hak Portabilitas:** Data diekspor dalam format JSON standar (machine-readable)
• **Hak Keberatan:** Nonaktifkan pengiriman laporan email di pengaturan profil

Permintaan penghapusan data akan diproses dalam **30 hari kerja**.`,
  },
  {
    icon: Mail, color: "teal",
    title: "Kontak & DPO",
    content: `Untuk pertanyaan privasi, hubungi:

📧 **Email:** privacy@yumna.app  
📧 **Data Protection Officer:** dpo@yumna.app  
🌐 **Website:** https://yumna.app/privacy  

Jika Anda merasa privasi Anda dilanggar, Anda berhak melaporkan ke **Kominfo** atau **BSSN** sesuai UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi.`,
  },
];

function PolicySection({ section, index }: { section: typeof SECTIONS[0]; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const Icon = section.icon;

  return (
    <Card className="rounded-[24px] border-none shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left group hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", `bg-${section.color}-100`)}>
            <Icon size={16} className={`text-${section.color}-600`} />
          </div>
          <span className="font-black text-slate-800 text-sm">{section.title}</span>
        </div>
        {open
          ? <ChevronDown size={16} className="text-emerald-500 shrink-0" />
          : <ChevronRight size={16} className="text-slate-300 shrink-0" />
        }
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <CardContent className="pt-0 pb-5 px-5">
              <div className="border-t border-slate-100 pt-4">
                {section.content.split('\n').map((line, i) => (
                  <p key={i} className={cn(
                    "text-sm leading-relaxed",
                    line.startsWith('**') ? "font-bold text-slate-700 mt-3 mb-1" :
                    line.startsWith('•') ? "text-slate-500 ml-2" :
                    line === '' ? "mt-2" : "text-slate-600"
                  )}>
                    {line.replace(/\*\*/g, '')}
                  </p>
                ))}
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export default function PrivacyPolicyPage() {
  const [agreed, setAgreed] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleAgree = () => {
    setAgreed(true);
    localStorage.setItem('yumna:privacy-agreed', new Date().toISOString());
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-[20px] bg-emerald-100 flex items-center justify-center mx-auto">
          <Shield size={32} className="text-emerald-600" />
        </div>
        <h1 className="text-3xl font-black text-emerald-950 tracking-tighter">Kebijakan Privasi Yumna</h1>
        <p className="text-slate-500 text-sm">Terakhir diperbarui: 15 April 2026 · Berlaku sejak: 15 April 2026</p>
        <p className="text-emerald-700/70 text-sm italic max-w-md mx-auto">
          Privasi keluarga Anda adalah amanah. Kami berkomitmen menjaga kepercayaan ini dengan standar keamanan tertinggi.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Tidak Dijual", sub: "Data Anda", icon: "🔒" },
          { label: "AES-256", sub: "Enkripsi", icon: "🔐" },
          { label: "GDPR Ready", sub: "UU PDP ID", icon: "⚖️" },
          { label: "30 Hari", sub: "Hapus Data", icon: "🗑️" },
        ].map((item, i) => (
          <div key={i} className="bg-emerald-50 rounded-[20px] p-4 text-center border border-emerald-100">
            <div className="text-2xl mb-1">{item.icon}</div>
            <p className="font-black text-emerald-800 text-sm">{item.label}</p>
            <p className="text-emerald-600/70 text-[10px] font-bold">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Policy Sections */}
      <div className="space-y-3">
        {SECTIONS.map((section, i) => (
          <PolicySection key={i} section={section} index={i} />
        ))}
      </div>

      {/* Consent & Agreement */}
      <Card className="rounded-[28px] border-2 border-emerald-200 bg-emerald-50">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-black text-emerald-900 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600" />
            Persetujuan Kebijakan Privasi
          </h3>
          <p className="text-sm text-emerald-800/80">
            Dengan menggunakan Yumna, Anda menyetujui pengumpulan dan pemrosesan data sebagaimana dijelaskan di atas.
            Anda dapat mencabut persetujuan ini kapan saja dengan menghapus akun Anda.
          </p>
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="privacy-agree"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-emerald-600 rounded"
            />
            <label htmlFor="privacy-agree" className="text-sm text-slate-700 cursor-pointer">
              Saya telah membaca dan menyetujui{" "}
              <span className="text-emerald-600 font-bold">Kebijakan Privasi</span> dan{" "}
              <Link href="/dashboard/help" className="text-emerald-600 font-bold underline">Syarat Penggunaan</Link>{" "}
              Yumna Family Finance.
            </label>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleAgree}
              disabled={!agreed || saved}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-5 text-sm font-bold"
            >
              {saved ? "✓ Persetujuan Tersimpan" : "Simpan Persetujuan"}
            </Button>
            <a href="mailto:privacy@yumna.app" className="text-xs text-slate-400 hover:text-emerald-600 transition-colors">
              Hubungi DPO ↗
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
