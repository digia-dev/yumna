"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Users, 
  Plus, 
  Calendar, 
  MessageSquare, 
  CheckCircle2, 
  Target, 
  ArrowLeft,
  Loader2,
  CheckCircle,
  Circle
} from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

const fetcher = (url: string) => apiClient.get(url).then(res => res.data);

export default function SyuraNotesPage() {
  const { data: notes, mutate: mutateNotes, isLoading: loadingNotes } = useSWR("/syura/notes", fetcher);
  const { data: topics, mutate: mutateTopics } = useSWR("/syura/topics", fetcher);
  
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    attendees: "" // comma separated
  });

  const [newTopic, setNewTopic] = useState("");

  const handleCreateNote = async () => {
    if (!newNote.title || !newNote.content) {
      toast.error("Judul dan isi notulen wajib diisi.");
      return;
    }
    try {
      setLoading(true);
      await apiClient.post("/syura/notes", {
        ...newNote,
        attendees: newNote.attendees.split(",").map(s => s.trim()).filter(s => s)
      });
      toast.success("Notulen berhasil disimpan.");
      mutateNotes();
      setShowForm(false);
      setNewNote({ title: "", content: "", attendees: "" });
    } catch (e) {
      toast.error("Gagal menyimpan notulen.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTopic = async () => {
    if (!newTopic) return;
    try {
      await apiClient.post("/syura/topics", { title: newTopic });
      toast.success("Topik musyawarah ditambahkan.");
      mutateTopics();
      setNewTopic("");
    } catch (e) {
      toast.error("Gagal menambah topik.");
    }
  };

  const toggleTopic = async (id: string) => {
    try {
      await apiClient.patch(`/syura/topics/${id}`);
      mutateTopics();
    } catch (e) {
      toast.error("Gagal update status topik.");
    }
  };

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
        <Button onClick={() => setShowForm(true)} className="gap-2 bg-emerald-deep hover:bg-emerald-900 border-none">
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
            
            {loadingNotes ? (
              <div className="flex justify-center py-10">
                 <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            ) : (notes && notes.length > 0) ? (
              notes.map((note: any) => (
                <Card key={note.id} className="border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base font-bold">{note.title}</CardTitle>
                      <Badge variant="outline" className="text-[10px]">{new Date(note.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="whitespace-pre-line text-muted-foreground leading-relaxed">
                      {note.content}
                    </div>
                    {note.attendees.length > 0 && (
                      <div className="pt-4 border-t flex flex-wrap gap-2">
                         <span className="text-[10px] font-bold uppercase text-muted-foreground self-center mr-1">Peserta:</span>
                         {note.attendees.map((m: string, i: number) => (
                           <Badge key={i} variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px]">
                              {m}
                           </Badge>
                         ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="py-20 text-center bg-muted/20 border-2 border-dashed rounded-2xl flex flex-col items-center">
                 <Users size={40} className="text-muted-foreground/30 mb-2" />
                 <p className="text-sm text-muted-foreground">Belum ada riwayat syura. Mulailah musyawarah untuk keberkahan keluarga.</p>
              </div>
            )}
         </div>

         <div className="space-y-6">
            <Card className="bg-primary/5 border-none shadow-sm">
               <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target size={18} className="text-primary" />
                    Target Musyawarah Mendatang
                  </CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="space-y-2">
                     {topics?.map((t: any) => (
                       <div key={t.id} className="p-3 bg-white rounded-xl border flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                             <div className="cursor-pointer" onClick={() => toggleTopic(t.id)}>
                                {t.isCompleted ? <CheckCircle size={16} className="text-emerald-500" /> : <Circle size={16} className="text-muted-foreground" />}
                             </div>
                             <span className={`text-xs ${t.isCompleted ? 'line-through text-muted-foreground' : ''}`}>{t.title}</span>
                          </div>
                       </div>
                     ))}
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Input 
                       placeholder="Tambah topik..." 
                       className="text-xs h-9" 
                       value={newTopic}
                       onChange={(e) => setNewTopic(e.target.value)}
                       onKeyDown={(e) => e.key === 'Enter' && handleAddTopic()}
                    />
                    <Button size="icon" className="h-9 w-9" onClick={handleAddTopic}>
                       <Plus size={16} />
                    </Button>
                  </div>
               </CardContent>
            </Card>

            <Card className="bg-amber-50 border-amber-200">
               <CardHeader className="pb-1">
                  <CardTitle className="text-sm flex items-center gap-2 text-amber-900">
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

      <Dialog open={showForm} onOpenChange={setShowForm}>
         <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
               <DialogTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
                  <Plus className="text-emerald-600" />
                  Notulen Musyawarah Baru
               </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
               <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Judul Musyawarah</label>
                  <Input 
                    placeholder="e.g. Rencana Pendidikan Hasan" 
                    value={newNote.title}
                    onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Hasil Keputusan</label>
                  <Textarea 
                    placeholder="Tuliskan poin-poin keputusan utama..." 
                    className="min-h-[200px]"
                    value={newNote.content}
                    onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Peserta (pisahkan dengan koma)</label>
                  <Input 
                    placeholder="Ayah, Ibu, Aisyah..." 
                    value={newNote.attendees}
                    onChange={(e) => setNewNote({...newNote, attendees: e.target.value})}
                  />
               </div>
            </div>
            <DialogFooter>
               <Button className="w-full bg-emerald-deep hover:bg-emerald-900 h-12 font-black uppercase tracking-widest" onClick={handleCreateNote} disabled={loading}>
                  {loading ? "Menyimpan..." : "Simpan Notulen"}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}
