"use client";

import { useState, useEffect } from "react";
import {
  Plus, Heart, Cake, Users, Calendar, MapPin, Clock, Edit2, Trash2,
  Bell, ChevronRight, Star, Gift, X, Loader2,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { id } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────
interface FamilyEvent {
  id: string;
  title: string;
  description?: string;
  category: "ANNIVERSARY" | "BIRTHDAY" | "MEETING" | "HOLIDAY" | "OTHER";
  date: string;
  time?: string;
  recurrence: string;
  color?: string;
  isMeeting: boolean;
  agendaSlots: string[];
  location?: string;
  nextOccurrence: string;
  isUpcoming: boolean;
  daysUntil: number | null;
  creator?: { id: string; name: string };
}

interface FamilyMember { id: string; name: string; image?: string; }

// ── Config ────────────────────────────────────────────────────────────────────
const EVENT_CATEGORY_META: Record<string, { icon: string; label: string; color: string; gradient: string }> = {
  ANNIVERSARY: { icon: "💍", label: "Hari Jadi",   color: "rose",    gradient: "from-rose-600 to-pink-700" },
  BIRTHDAY:    { icon: "🎂", label: "Ulang Tahun", color: "amber",   gradient: "from-amber-500 to-orange-600" },
  MEETING:     { icon: "🤝", label: "Rapat",       color: "blue",    gradient: "from-blue-600 to-indigo-700" },
  HOLIDAY:     { icon: "🌴", label: "Liburan",     color: "cyan",    gradient: "from-cyan-500 to-blue-600" },
  OTHER:       { icon: "📌", label: "Lainnya",     color: "emerald", gradient: "from-emerald-600 to-teal-700" },
};

const EVENT_COLORS = ["#f43f5e","#f59e0b","#3b82f6","#8b5cf6","#10b981","#06b6d4"];

export default function EventsPage() {
  const [events, setEvents] = useState<FamilyEvent[]>([]);
  const [upcoming, setUpcoming] = useState<FamilyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [tab, setTab] = useState<"upcoming" | "all" | "meeting">("upcoming");

  // Create form
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState<FamilyEvent | null>(null);
  const [form, setForm] = useState({
    title: "", description: "", category: "BIRTHDAY" as string,
    date: "", time: "", recurrence: "YEARLY", color: "#f59e0b",
    isMeeting: false, agendaSlots: [""] as string[], location: "",
  });

  // Meeting agenda editor
  const [agendaTarget, setAgendaTarget] = useState<FamilyEvent | null>(null);
  const [agendaDraft, setAgendaDraft] = useState<string[]>([]);
  const [isSavingAgenda, setIsSavingAgenda] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [evRes, upRes] = await Promise.all([
        apiClient.get("/events"),
        apiClient.get("/events/upcoming"),
      ]);
      setEvents(evRes.data);
      setUpcoming(upRes.data);
    } catch { toast.error("Gagal memuat acara."); }
    finally { setLoading(false); }
  };

  const fetchMembers = async () => {
    try { const r = await apiClient.get("/family/members"); setMembers(r.data); } catch {}
  };

  useEffect(() => { fetchAll(); fetchMembers(); }, []);

  const resetForm = () => setForm({ title: "", description: "", category: "BIRTHDAY",
    date: "", time: "", recurrence: "YEARLY", color: "#f59e0b",
    isMeeting: false, agendaSlots: [""], location: "" });

  const handleSubmit = async () => {
    if (!form.title || !form.date) return toast.error("Nama dan tanggal wajib diisi.");
    try {
      const payload = {
        ...form,
        agendaSlots: form.agendaSlots.filter(s => s.trim()),
        isMeeting: form.category === "MEETING",
      };
      if (isEditing) {
        await apiClient.patch(`/events/${isEditing.id}`, payload);
        toast.success("Acara diperbarui!");
      } else {
        await apiClient.post("/events", payload);
        toast.success("Acara ditambahkan! 🎉");
      }
      setIsOpen(false); setIsEditing(null); resetForm(); fetchAll();
    } catch { toast.error("Gagal menyimpan acara."); }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/events/${id}`);
      toast.success("Acara dihapus."); fetchAll();
    } catch { toast.error("Gagal menghapus."); }
  };

  const openEdit = (ev: FamilyEvent) => {
    setIsEditing(ev);
    setForm({
      title: ev.title, description: ev.description ?? "", category: ev.category,
      date: format(new Date(ev.date), "yyyy-MM-dd"), time: ev.time ?? "",
      recurrence: ev.recurrence, color: ev.color ?? "#f59e0b",
      isMeeting: ev.isMeeting, agendaSlots: ev.agendaSlots.length ? ev.agendaSlots : [""],
      location: ev.location ?? "",
    });
    setIsOpen(true);
  };

  const saveAgenda = async () => {
    if (!agendaTarget) return;
    setIsSavingAgenda(true);
    try {
      await apiClient.patch(`/events/${agendaTarget.id}/agenda`, { agendaSlots: agendaDraft.filter(s => s.trim()) });
      toast.success("Agenda rapat disimpan!");
      setAgendaTarget(null);
      fetchAll();
    } catch { toast.error("Gagal menyimpan agenda."); }
    finally { setIsSavingAgenda(false); }
  };

  const meetings = events.filter(e => e.category === "MEETING");

  return (
    <div className="space-y-8 p-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-emerald-950 tracking-tighter">Momen Keluarga</h1>
          <p className="text-emerald-700/60 font-medium mt-1">Hari jadi, ulang tahun, dan rapat keluarga yang penuh berkah.</p>
        </div>
        <Button onClick={() => { resetForm(); setIsEditing(null); setIsOpen(true); }}
          className="bg-rose-500 hover:bg-rose-600 text-white rounded-2xl h-12 px-6 font-bold shadow-lg shadow-rose-900/20 shrink-0">
          <Plus size={18} className="mr-2" /> Tambah Acara
        </Button>
      </div>

      {/* Upcoming Countdown Banner */}
      {upcoming.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {upcoming.slice(0, 3).map((ev, i) => {
            const meta = EVENT_CATEGORY_META[ev.category] ?? EVENT_CATEGORY_META.OTHER;
            return (
              <motion.div key={ev.id} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.08 }}
                className={cn("rounded-[32px] p-6 text-white relative overflow-hidden cursor-pointer group", `bg-gradient-to-br ${meta.gradient}`)}
                onClick={() => openEdit(ev)}>
                <div className="absolute -top-4 -right-4 text-[80px] opacity-10 group-hover:scale-110 transition-transform">{meta.icon}</div>
                <div className="relative">
                  <Badge className="bg-white/20 text-white border-none text-[9px] font-black mb-3">{meta.label}</Badge>
                  <h3 className="text-lg font-black mb-1 leading-tight">{ev.title}</h3>
                  <p className="text-white/60 text-xs mb-4">
                    {format(new Date(ev.date), "d MMMM", { locale: id })}
                    {ev.recurrence === "YEARLY" && <span className="ml-1 opacity-50">· Tahunan</span>}
                  </p>
                  <div className="bg-white/20 rounded-2xl p-3 text-center">
                    <p className="text-3xl font-black">{ev.daysUntil === 0 ? "🎉 Hari Ini!" : ev.daysUntil}</p>
                    {ev.daysUntil !== 0 && <p className="text-[9px] font-black uppercase tracking-widest opacity-70 mt-0.5">hari lagi</p>}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v: any) => setTab(v)}>
        <TabsList className="bg-white border border-emerald-100 p-1 rounded-2xl">
          <TabsTrigger value="upcoming" className="rounded-xl font-bold text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-5">🔔 Segera ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="all" className="rounded-xl font-bold text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-5">📋 Semua ({events.length})</TabsTrigger>
          <TabsTrigger value="meeting" className="rounded-xl font-bold text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white px-5">🤝 Rapat ({meetings.length})</TabsTrigger>
        </TabsList>

        {/* Upcoming */}
        <TabsContent value="upcoming" className="mt-6">
          {loading ? <Loader /> : upcoming.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-rose-100 rounded-[40px]">
              <span className="text-6xl">🎉</span>
              <h3 className="text-lg font-black text-slate-700 mt-4">Tidak ada acara dalam 30 hari ke depan</h3>
              <p className="text-slate-400 text-sm mt-1">Tambahkan ulang tahun dan hari jadi keluarga agar tidak terlewat.</p>
            </div>
          ) : (
            <EventList events={upcoming} onEdit={openEdit} onDelete={handleDelete}
              onOpenMeeting={ev => { setAgendaTarget(ev); setAgendaDraft(ev.agendaSlots); }} />
          )}
        </TabsContent>

        {/* All */}
        <TabsContent value="all" className="mt-6">
          {loading ? <Loader /> : <EventList events={events} onEdit={openEdit} onDelete={handleDelete}
            onOpenMeeting={ev => { setAgendaTarget(ev); setAgendaDraft(ev.agendaSlots); }} />}
        </TabsContent>

        {/* 379 – Meeting Tab */}
        <TabsContent value="meeting" className="mt-6">
          {meetings.length === 0 ? (
            <div className="text-center py-20 bg-gradient-to-b from-blue-950 to-blue-900 rounded-[40px]">
              <Users size={48} className="text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-black text-white">Belum Ada Rapat Keluarga</h3>
              <p className="text-blue-300/60 text-sm mt-2 mb-6">Buat rapat untuk mendiskusikan keuangan, rencana liburan, dan lainnya.</p>
              <Button onClick={() => { resetForm(); setForm(f => ({ ...f, category: "MEETING", isMeeting: true })); setIsOpen(true); }}
                className="bg-blue-500 hover:bg-blue-400 text-white rounded-2xl px-8 h-12 font-bold">
                <Plus size={18} className="mr-2" /> Jadwalkan Rapat
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              {meetings.map(ev => (
                <Card key={ev.id} className="rounded-[32px] border-blue-100 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge className="bg-white/20 text-white border-none text-[9px] font-black mb-3">🤝 Rapat Keluarga</Badge>
                          <h3 className="text-xl font-black">{ev.title}</h3>
                          <div className="flex items-center gap-4 mt-2 text-blue-200 text-xs font-bold flex-wrap">
                            <span className="flex items-center gap-1"><Calendar size={12} />{format(new Date(ev.date), "EEEE, d MMMM yyyy", { locale: id })}</span>
                            {ev.time && <span className="flex items-center gap-1"><Clock size={12} />{ev.time}</span>}
                            {ev.location && <span className="flex items-center gap-1"><MapPin size={12} />{ev.location}</span>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(ev)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"><Edit2 size={15} /></button>
                          <button onClick={() => handleDelete(ev.id)} className="p-2 bg-white/10 hover:bg-rose-500 rounded-xl transition-all"><Trash2 size={15} /></button>
                        </div>
                      </div>
                    </div>

                    {/* Agenda Slots */}
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          📋 Agenda Rapat ({ev.agendaSlots.length} item)
                        </p>
                        <button onClick={() => { setAgendaTarget(ev); setAgendaDraft([...ev.agendaSlots, ""]); }}
                          className="text-[10px] font-black text-blue-600 hover:text-blue-800 flex items-center gap-1">
                          <Edit2 size={11} /> Edit Agenda
                        </button>
                      </div>

                      {ev.agendaSlots.length > 0 ? (
                        <ol className="space-y-2">
                          {ev.agendaSlots.map((slot, i) => (
                            <li key={i} className="flex items-start gap-3 p-3 bg-blue-50 rounded-2xl">
                              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                              <span className="text-sm font-medium text-slate-700">{slot}</span>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <button onClick={() => { setAgendaTarget(ev); setAgendaDraft([""]); }}
                          className="w-full py-6 border-2 border-dashed border-blue-100 rounded-2xl text-blue-300 hover:text-blue-500 hover:border-blue-300 transition-all text-sm font-bold text-center">
                          + Tambah agenda rapat
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={isOpen} onOpenChange={o => { setIsOpen(o); if (!o) { setIsEditing(null); resetForm(); } }}>
        <DialogContent className="max-w-md rounded-[40px] border-rose-100 p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-emerald-950">{isEditing ? "Edit Acara" : "Momen Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input placeholder="Nama acara*" className="h-14 rounded-2xl bg-rose-50/40 border-rose-100 font-bold"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />

            <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v, isMeeting: v === "MEETING" }))}>
              <SelectTrigger className="h-12 rounded-2xl border-rose-100 font-bold text-xs">
                <SelectValue placeholder="Jenis acara" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {Object.entries(EVENT_CATEGORY_META).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 mb-1 block">Tanggal*</label>
                <Input type="date" className="h-12 rounded-2xl border-rose-100 font-bold text-sm"
                  value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 mb-1 block">Jam (opsional)</label>
                <Input type="time" className="h-12 rounded-2xl border-slate-100 font-bold text-sm"
                  value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
              </div>
            </div>

            <Select value={form.recurrence} onValueChange={v => setForm(f => ({ ...f, recurrence: v }))}>
              <SelectTrigger className="h-12 rounded-2xl border-slate-100 font-bold text-xs"><SelectValue /></SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="NONE">Tidak berulang</SelectItem>
                <SelectItem value="YEARLY">🔁 Setiap Tahun (Otomatis)</SelectItem>
                <SelectItem value="MONTHLY">📅 Setiap Bulan</SelectItem>
                <SelectItem value="WEEKLY">📆 Setiap Minggu</SelectItem>
              </SelectContent>
            </Select>

            <textarea placeholder="Deskripsi / catatan..." className="w-full h-16 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-medium resize-none outline-none focus:ring-2 focus:ring-rose-200"
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />

            {form.category === "MEETING" && (
              <>
                <Input placeholder="📍 Lokasi rapat" className="h-12 rounded-2xl border-blue-100 bg-blue-50/30 font-medium"
                  value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-blue-700/70 block">Agenda Rapat</label>
                  {form.agendaSlots.map((slot, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="w-7 h-10 rounded-xl bg-blue-50 text-blue-600 font-black text-xs flex items-center justify-center shrink-0">{i + 1}</span>
                      <Input value={slot} onChange={e => {
                        const slots = [...form.agendaSlots];
                        slots[i] = e.target.value;
                        setForm(f => ({ ...f, agendaSlots: slots }));
                      }} placeholder={`Agenda ${i + 1}...`} className="h-10 rounded-xl border-blue-100 text-sm" />
                      {form.agendaSlots.length > 1 && (
                        <button onClick={() => setForm(f => ({ ...f, agendaSlots: f.agendaSlots.filter((_, j) => j !== i) }))} className="text-slate-300 hover:text-rose-500"><X size={16} /></button>
                      )}
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" onClick={() => setForm(f => ({ ...f, agendaSlots: [...f.agendaSlots, ""] }))}
                    className="text-blue-600 font-bold text-xs">+ Tambah poin agenda</Button>
                </div>
              </>
            )}

            {/* Color picker */}
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-[9px] font-black uppercase text-slate-400">Warna:</span>
              {EVENT_COLORS.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={cn("w-7 h-7 rounded-full border-2 transition-all", form.color === c ? "border-slate-900 scale-110" : "border-transparent")}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <Button onClick={handleSubmit} className="w-full h-14 bg-rose-500 hover:bg-rose-600 text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl">
            {isEditing ? "Perbarui Acara" : "Simpan Momen"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* ── 379 Agenda Editor Modal ── */}
      <Dialog open={!!agendaTarget} onOpenChange={o => { if (!o) setAgendaTarget(null); }}>
        <DialogContent className="max-w-md rounded-[40px] p-8 border-blue-100">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-blue-950">Edit Agenda Rapat</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-slate-500 -mt-1 mb-4">{agendaTarget?.title}</p>
          <div className="space-y-2 py-2 max-h-72 overflow-y-auto">
            {agendaDraft.map((slot, i) => (
              <div key={i} className="flex gap-2 items-center">
                <span className="w-7 h-10 rounded-xl bg-blue-50 text-blue-600 font-black text-xs flex items-center justify-center shrink-0">{i + 1}</span>
                <Input value={slot} onChange={e => {
                  const d = [...agendaDraft]; d[i] = e.target.value;
                  setAgendaDraft(d);
                }} placeholder={`Agenda ${i + 1}...`} className="h-10 rounded-xl border-blue-100 text-sm" />
                <button onClick={() => setAgendaDraft(agendaDraft.filter((_, j) => j !== i))} className="text-slate-200 hover:text-rose-500"><X size={16} /></button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <Button variant="ghost" onClick={() => setAgendaDraft(d => [...d, ""])} className="text-blue-600 font-bold text-xs">+ Tambah Poin</Button>
            <Button onClick={saveAgenda} disabled={isSavingAgenda} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold h-11">
              {isSavingAgenda ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              {isSavingAgenda ? "Menyimpan..." : "Simpan Agenda"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Event List ──────────────────────────────────────────────────────────────
function EventList({ events, onEdit, onDelete, onOpenMeeting }: {
  events: FamilyEvent[];
  onEdit: (e: FamilyEvent) => void;
  onDelete: (id: string) => void;
  onOpenMeeting: (e: FamilyEvent) => void;
}) {
  if (events.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-rose-100 rounded-[32px]">
        <span className="text-5xl">📅</span>
        <h3 className="text-lg font-black text-slate-700 mt-4">Belum ada acara</h3>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((ev, i) => {
        const meta = EVENT_CATEGORY_META[ev.category] ?? EVENT_CATEGORY_META.OTHER;
        return (
          <motion.div key={ev.id} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.04 }}>
            <Card className="rounded-[28px] border-slate-100 overflow-hidden hover:shadow-lg transition-all group">
              <CardContent className="p-0 flex">
                {/* Left accent */}
                <div className={cn("w-2 shrink-0 bg-gradient-to-b", meta.gradient)}
                  style={ev.color ? { background: ev.color } : undefined} />
                <div className="flex-1 p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-slate-50 shrink-0">{meta.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-black text-emerald-950 truncate">{ev.title}</h4>
                      {ev.isUpcoming && ev.daysUntil !== null && (
                        <Badge className={cn("rounded-full text-[8px] font-black border-none shrink-0",
                          ev.daysUntil === 0 ? "bg-rose-500 text-white" : "bg-amber-100 text-amber-700")}>
                          {ev.daysUntil === 0 ? "Hari Ini! 🎉" : `${ev.daysUntil}h lagi`}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold flex-wrap">
                      <span className="flex items-center gap-1"><Calendar size={11} />{format(new Date(ev.date), "d MMMM yyyy", { locale: id })}</span>
                      {ev.time && <span className="flex items-center gap-1"><Clock size={11} />{ev.time}</span>}
                      {ev.location && <span className="flex items-center gap-1"><MapPin size={11} />{ev.location}</span>}
                      {ev.recurrence !== "NONE" && <span className="text-emerald-500">🔁 {ev.recurrence === "YEARLY" ? "Tahunan" : ev.recurrence === "MONTHLY" ? "Bulanan" : "Mingguan"}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {ev.category === "MEETING" && (
                      <button onClick={() => onOpenMeeting(ev)} className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-all" title="Edit Agenda">
                        <ChevronRight size={16} />
                      </button>
                    )}
                    <button onClick={() => onEdit(ev)} className="p-2 bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-xl transition-all"><Edit2 size={15} /></button>
                    <button onClick={() => onDelete(ev.id)} className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-all"><Trash2 size={15} /></button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

function Loader() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={32} className="text-rose-400 animate-spin" />
    </div>
  );
}
