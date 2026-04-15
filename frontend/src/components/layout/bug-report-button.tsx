"use client";

import { useState } from "react";
import { Bug, Send, X, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import apiClient from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";

type BugSeverity = "low" | "medium" | "high" | "critical";

// 479 – In-app Bug Report button
export function BugReportButton() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<BugSeverity>("medium");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const severities: { value: BugSeverity; label: string; color: string }[] = [
    { value: "low",      label: "Rendah",   color: "bg-slate-100 text-slate-600" },
    { value: "medium",   label: "Sedang",   color: "bg-amber-100 text-amber-700" },
    { value: "high",     label: "Tinggi",   color: "bg-orange-100 text-orange-700" },
    { value: "critical", label: "Kritis",   color: "bg-rose-100 text-rose-700" },
  ];

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      await apiClient.post("/feedback/bug", {
        title,
        description,
        severity,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });
      setSubmitted(true);
      setTimeout(() => { setOpen(false); setSubmitted(false); setTitle(""); setDescription(""); }, 2500);
    } catch {
      // Fallback: store locally
      const bugs = JSON.parse(localStorage.getItem("yumna:bug-reports") || "[]");
      bugs.push({ title, description, severity, url: window.location.href, timestamp: new Date().toISOString() });
      localStorage.setItem("yumna:bug-reports", JSON.stringify(bugs));
      setSubmitted(true);
      setTimeout(() => { setOpen(false); setSubmitted(false); setTitle(""); setDescription(""); }, 2500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating trigger */}
      <button
        id="bug-report-btn"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 sm:bottom-6 left-4 z-50 w-10 h-10 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        title="Laporkan Bug">
        <Bug size={16} />
      </button>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-60 bg-black/30 backdrop-blur-sm"
              onClick={() => setOpen(false)} />
            <motion.div
              initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed bottom-0 left-0 right-0 z-61 bg-white rounded-t-[32px] p-6 shadow-2xl max-w-lg mx-auto">

              {submitted ? (
                <div className="flex flex-col items-center py-8">
                  <CheckCircle2 size={48} className="text-emerald-500 mb-4" />
                  <h3 className="text-xl font-black text-emerald-950">Terima Kasih!</h3>
                  <p className="text-sm text-slate-500 mt-2 text-center">Bug sudah dilaporkan. Tim kami akan segera menindaklanjuti.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center">
                        <Bug size={18} className="text-rose-600" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-800">Laporkan Bug</h3>
                        <p className="text-[10px] text-slate-400 font-bold">Bantu kami memperbaiki Yumna</p>
                      </div>
                    </div>
                    <button onClick={() => setOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"><X size={16} /></button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Judul Bug *</label>
                      <input value={title} onChange={e => setTitle(e.target.value)}
                        placeholder="Contoh: Tombol simpan tidak berfungsi..."
                        className="w-full h-10 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-300" />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Deskripsi</label>
                      <textarea value={description} onChange={e => setDescription(e.target.value)}
                        placeholder="Langkah-langkah reproduksi, perilaku yang diharapkan vs aktual..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none" />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Tingkat Keparahan</label>
                      <div className="flex gap-2 flex-wrap">
                        {severities.map(s => (
                          <button key={s.value} onClick={() => setSeverity(s.value)}
                            className={cn("px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-2", severity === s.value ? `${s.color} border-current` : "bg-white border-slate-200 text-slate-400")}>
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Button onClick={handleSubmit} disabled={!title.trim() || loading}
                      className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold h-11 gap-2">
                      {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Kirim Laporan
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
