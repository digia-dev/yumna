"use client";

import { useState, useEffect, useCallback, } from "react";
import {
  Plus, Search, Pin, PinOff, Trash2, Edit2, Tag, FileText,
  Loader2, Save, X, Palette,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { motion, } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface FamilyNote {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isPinned: boolean;
  color?: string;
  updatedAt: string;
  author: { id: string; name: string; image?: string };
}

const NOTE_COLORS = [
  { label: "Vanilla",  value: "#fefce8" },
  { label: "Mint",     value: "#ecfdf5" },
  { label: "Sky",      value: "#eff6ff" },
  { label: "Rose",     value: "#fff1f2" },
  { label: "Lavender", value: "#f5f3ff" },
  { label: "Slate",    value: "#f8fafc" },
];

const NOTE_CATEGORIES = ["Umum", "Keuangan", "Kesehatan", "Sekolah", "Resep", "Penting", "Lainnya"];

export default function NotesPage() {
  const [notes, setNotes] = useState<FamilyNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");

  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState<FamilyNote | null>(null);
  const [form, setForm] = useState({
    title: "", content: "", category: "Umum", tags: [] as string[], color: "#fefce8", tagInput: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Inline editor state
  const [activeNote, setActiveNote] = useState<FamilyNote | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isEditingInline, setIsEditingInline] = useState(false);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/notes", { params: search ? { search } : {} });
      setNotes(res.data);
    } catch { toast.error("Gagal memuat catatan."); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchNotes, 300);
    return () => clearTimeout(t);
  }, [fetchNotes]);

  const resetForm = () => setForm({ title: "", content: "", category: "Umum", tags: [], color: "#fefce8", tagInput: "" });

  const openCreate = () => { resetForm(); setIsEditing(null); setIsOpen(true); };
  const openEdit = (note: FamilyNote) => {
    setIsEditing(note);
    setForm({ title: note.title, content: note.content, category: note.category, tags: note.tags, color: note.color ?? "#fefce8", tagInput: "" });
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error("Judul catatan wajib diisi.");
    setIsSaving(true);
    try {
      if (isEditing) {
        await apiClient.patch(`/notes/${isEditing.id}`, { title: form.title, content: form.content, category: form.category, tags: form.tags, color: form.color });
        toast.success("Catatan diperbarui!");
      } else {
        await apiClient.post("/notes", { title: form.title, content: form.content, category: form.category, tags: form.tags, color: form.color });
        toast.success("Catatan disimpan!");
      }
      setIsOpen(false); setIsEditing(null); resetForm(); fetchNotes();
    } catch { toast.error("Gagal menyimpan."); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try { await apiClient.delete(`/notes/${id}`); toast.success("Dihapus."); fetchNotes(); } catch {}
  };

  const handlePin = async (id: string) => {
    try { await apiClient.patch(`/notes/${id}/pin`); fetchNotes(); } catch {}
  };

  const saveInline = async () => {
    if (!activeNote) return;
    try {
      await apiClient.patch(`/notes/${activeNote.id}`, { content: editContent });
      toast.success("Disimpan!"); setIsEditingInline(false); fetchNotes();
    } catch { toast.error("Gagal menyimpan."); }
  };

  const addTag = () => {
    const tag = form.tagInput.trim().replace(/^#/, "");
    if (tag && !form.tags.includes(tag)) setForm(f => ({ ...f, tags: [...f.tags, tag], tagInput: "" }));
    else setForm(f => ({ ...f, tagInput: "" }));
  };

  const pinned = notes.filter(n => n.isPinned && (filterCat === "all" || n.category === filterCat));
  const unpinned = notes.filter(n => !n.isPinned && (filterCat === "all" || n.category === filterCat));

  return (
    <div className="space-y-8 p-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-emerald-950 tracking-tighter">Wiki Keluarga</h1>
          <p className="text-emerald-700/60 font-medium mt-1">Catatan bersama, resep, panduan, dan informasi penting keluarga.</p>
        </div>
        <Button onClick={openCreate}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-12 px-6 font-bold shadow-lg shrink-0">
          <Plus size={18} className="mr-2" /> Catatan Baru
        </Button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-700/30" size={18} />
          <Input placeholder="Cari catatan..." className="pl-12 h-12 rounded-2xl border-emerald-100 bg-white"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-44 h-12 rounded-2xl border-emerald-100 font-bold text-xs shrink-0">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            <SelectItem value="all">Semua Kategori</SelectItem>
            {NOTE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Stats bar */}
      <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
        <span>📌 {pinned.length} disematkan</span>
        <span className="text-slate-200">·</span>
        <span>📝 {unpinned.length} catatan</span>
        <span className="text-slate-200">·</span>
        <span>🏷️ {[...new Set(notes.flatMap(n => n.tags))].length} tag</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={32} className="text-emerald-500 animate-spin" /></div>
      ) : (
        <>
          {/* Pinned Notes */}
          {pinned.length > 0 && (
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800/40 mb-4 flex items-center gap-2">
                <Pin size={12} /> Disematkan
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {pinned.map((note, i) => (
                  <NoteCard key={note.id} note={note} index={i}
                    onEdit={() => openEdit(note)} onDelete={() => handleDelete(note.id)}
                    onPin={() => handlePin(note.id)} onOpen={() => { setActiveNote(note); setEditContent(note.content); setIsEditingInline(false); }} />
                ))}
              </div>
            </div>
          )}

          {/* All Notes */}
          {unpinned.length > 0 ? (
            <div>
              {pinned.length > 0 && <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2"><FileText size={12} /> Semua Catatan</h2>}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {unpinned.map((note, i) => (
                  <NoteCard key={note.id} note={note} index={i}
                    onEdit={() => openEdit(note)} onDelete={() => handleDelete(note.id)}
                    onPin={() => handlePin(note.id)} onOpen={() => { setActiveNote(note); setEditContent(note.content); setIsEditingInline(false); }} />
                ))}
              </div>
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-24 border-2 border-dashed border-emerald-100 rounded-[40px]">
              <span className="text-6xl">📓</span>
              <h3 className="text-xl font-black text-emerald-950 mt-6">Wiki Keluarga Masih Kosong</h3>
              <p className="text-slate-500 text-sm mt-2 mb-8">Mulai dengan catatan resep favorit atau panduan rumah tangga.</p>
              <Button onClick={openCreate} className="bg-emerald-600 text-white rounded-2xl px-8 h-12 font-bold">Tulis Catatan Pertama</Button>
            </div>
          ) : null}
        </>
      )}

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={isOpen} onOpenChange={o => { setIsOpen(o); if (!o) { setIsEditing(null); resetForm(); } }}>
        <DialogContent className="max-w-lg rounded-[40px] border-emerald-100 p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
          style={{ backgroundColor: form.color }}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-emerald-950 tracking-tight">{isEditing ? "Edit Catatan" : "Catatan Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input placeholder="Judul catatan*" className="h-12 rounded-2xl font-bold text-lg border-none bg-white/50 backdrop-blur placeholder:text-slate-300"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <textarea placeholder="Tulis catatan di sini... (mendukung format sederhana)" rows={8}
              className="w-full rounded-2xl border-none bg-white/50 p-4 font-medium text-sm resize-none outline-none focus:ring-2 focus:ring-emerald-300 backdrop-blur"
              value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />

            <div className="grid grid-cols-2 gap-3">
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger className="h-11 rounded-2xl bg-white/60 border-none font-bold text-xs"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-2xl">{NOTE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              {/* Color */}
              <div className="flex items-center gap-1 bg-white/60 rounded-2xl px-3">
                <Palette size={14} className="text-slate-400 shrink-0" />
                <div className="flex gap-1.5 flex-1 justify-around">
                  {NOTE_COLORS.map(c => (
                    <button key={c.value} onClick={() => setForm(f => ({ ...f, color: c.value }))}
                      className={cn("w-6 h-6 rounded-full border-2 transition-all", form.color === c.value ? "border-slate-900 scale-110" : "border-transparent")}
                      style={{ backgroundColor: c.value }} title={c.label} />
                  ))}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <div className="flex gap-2 flex-wrap mb-2">
                {form.tags.map(tag => (
                  <Badge key={tag} className="bg-white/70 text-emerald-700 border-none rounded-full text-xs font-bold pr-1">
                    #{tag}
                    <button onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }))} className="ml-1 hover:text-rose-500"><X size={11} /></button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="#tag baru (enter)" className="h-10 rounded-xl bg-white/50 border-none text-sm"
                  value={form.tagInput} onChange={e => setForm(f => ({ ...f, tagInput: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && addTag()} />
                <Button variant="ghost" size="sm" onClick={addTag} className="h-10 rounded-xl text-emerald-600 font-bold"><Tag size={14} /></Button>
              </div>
            </div>
          </div>
          <Button onClick={handleSave} disabled={isSaving}
            className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl">
            {isSaving ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
            {isSaving ? "Menyimpan..." : "Simpan Catatan"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* ── Note Viewer / Inline Editor ── */}
      <Dialog open={!!activeNote} onOpenChange={o => { if (!o) { setActiveNote(null); setIsEditingInline(false); } }}>
        {activeNote && (
          <DialogContent className="max-w-2xl rounded-[40px] border-none shadow-2xl p-0 overflow-hidden max-h-[90vh] flex flex-col"
            style={{ backgroundColor: activeNote.color ?? "#fefce8" }}>
            <div className="p-7 pb-4 border-b border-black/5 shrink-0">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-black/10 text-slate-700 border-none text-[9px] font-black rounded-full">{activeNote.category}</Badge>
                  {activeNote.tags.map(t => <Badge key={t} className="bg-black/5 text-slate-600 border-none text-[8px] rounded-full">#{t}</Badge>)}
                </div>
                <div className="flex gap-2">
                  {isEditingInline ? (
                    <button onClick={saveInline} className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"><Save size={15} /></button>
                  ) : (
                    <button onClick={() => setIsEditingInline(true)} className="p-2 bg-black/10 hover:bg-black/20 rounded-xl text-slate-700"><Edit2 size={15} /></button>
                  )}
                </div>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{activeNote.title}</h2>
              <p className="text-[10px] text-slate-500 font-bold mt-1">
                {activeNote.author.name} · {format(new Date(activeNote.updatedAt), "d MMMM yyyy, HH:mm", { locale: id })}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-7">
              {isEditingInline ? (
                <textarea value={editContent} onChange={e => setEditContent(e.target.value)} autoFocus
                  className="w-full h-full min-h-[200px] bg-transparent border-none outline-none text-sm font-medium text-slate-700 leading-relaxed resize-none" />
              ) : (
                <div className="prose prose-sm prose-slate max-w-none whitespace-pre-wrap text-slate-700 leading-relaxed">
                  {activeNote.content || <span className="text-slate-400 italic">Belum ada konten.</span>}
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

// ── Note Card ─────────────────────────────────────────────────────────────────
function NoteCard({ note, index, onEdit, onDelete, onPin, onOpen }: {
  note: FamilyNote; index: number;
  onEdit: () => void; onDelete: () => void; onPin: () => void; onOpen: () => void;
}) {
  return (
    <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: index * 0.03 }}
      className="group rounded-[28px] p-5 cursor-pointer hover:shadow-xl transition-all relative overflow-hidden border border-black/5"
      style={{ backgroundColor: note.color ?? "#fefce8" }} onClick={onOpen}>
      {note.isPinned && <Pin size={12} className="absolute top-4 right-4 text-slate-400" />}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <Badge className="bg-black/10 text-slate-600 border-none text-[8px] font-black rounded-full">{note.category}</Badge>
      </div>
      <h4 className="font-black text-slate-900 text-sm mb-2 leading-snug line-clamp-2">{note.title}</h4>
      <p className="text-xs text-slate-600/70 line-clamp-4 font-medium leading-relaxed mb-4">{note.content}</p>
      {note.tags.length > 0 && (
        <div className="flex gap-1 flex-wrap mb-3">
          {note.tags.slice(0, 3).map(t => <span key={t} className="text-[9px] font-bold text-slate-500 bg-black/5 px-2 py-0.5 rounded-full">#{t}</span>)}
          {note.tags.length > 3 && <span className="text-[9px] text-slate-400">+{note.tags.length - 3}</span>}
        </div>
      )}
      <div className="flex items-center justify-between pt-2 border-t border-black/5">
        <span className="text-[9px] text-slate-400 font-bold">{note.author.name} · {format(new Date(note.updatedAt), "d MMM", { locale: id })}</span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          <button onClick={onPin} className="p-1.5 bg-black/5 hover:bg-black/15 rounded-lg text-slate-500 transition-all">
            {note.isPinned ? <PinOff size={12} /> : <Pin size={12} />}
          </button>
          <button onClick={onEdit} className="p-1.5 bg-black/5 hover:bg-emerald-100 rounded-lg text-slate-500 transition-all"><Edit2 size={12} /></button>
          <button onClick={onDelete} className="p-1.5 bg-black/5 hover:bg-rose-100 rounded-lg text-slate-500 hover:text-rose-500 transition-all"><Trash2 size={12} /></button>
        </div>
      </div>
    </motion.div>
  );
}
