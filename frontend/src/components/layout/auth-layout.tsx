"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Left side: branding - Hidden on mobile */}
      <div className="hidden md:flex md:w-1/2 bg-emerald-deep p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
              <ShieldCheck size={28} className="text-white" />
            </div>
            <span className="text-2xl font-bold font-display tracking-tight">Yumna</span>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Membangun Keberkahan <br /> 
              <span className="text-emerald-light">Keluarga Muslim.</span>
            </h1>
            <p className="text-emerald-light/80 text-lg max-w-md">
              Aplikasi pengelola keuangan keluarga berbasis nilai-nilai Islami untuk mencapai falah dunia dan akhirat.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-emerald-light/60 text-sm">
          <span>&copy; 2026 PT Digi Antara Masa</span>
          <span>&bull;</span>
          <span>Amanah & Terpercaya</span>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-light/10 rounded-full blur-3xl" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-light/5 rounded-full blur-3xl" />
      </div>

      {/* Right side: form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="md:hidden flex items-center justify-center gap-2 mb-8">
            <div className="bg-emerald-deep p-2 rounded-lg">
              <ShieldCheck size={24} className="text-white" />
            </div>
            <span className="text-xl font-bold font-display text-emerald-deep">Yumna</span>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-8 md:p-10 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
              {subtitle && <p className="text-slate-500 mt-2">{subtitle}</p>}
            </div>

            {children}
          </motion.div>

          <p className="text-center text-slate-400 text-xs">
            Dengan melanjutkan, Anda menyetujui Ketentuan Layanan dan Kebijakan Privasi Yumna.
          </p>
        </div>
      </div>
    </div>
  );
}
