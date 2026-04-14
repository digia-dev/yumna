"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Circle, 
  Clock, 
  MoreVertical,
  User as UserIcon,
  AlertCircle,
  LayoutGrid,
  List as ListIcon,
  Trash2,
  Edit2,
  Image as ImageIcon,
  CheckCircle,
  Download,
  Layout,
  ClipboardList,
  Kanban,
  ShoppingCart,
  Camera,
  ChevronRight,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = ["Household", "Finance", "Belanja", "Worship", "Health", "Lainnya"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "grid" | "board">("grid");
  const [viewMode, setViewMode] = useState<"active" | "board" | "shopping" | "bills" | "history">("active");
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    category: "Household",
    recurrence: "NONE",
    dueDate: "",
    assigneeId: "",
    isGoal: false,
    parentId: "",
    billId: "",
    dependencyIds: [] as string[]
  });

  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [checklistInput, setChecklistInput] = useState("");
  const [commentInput, setCommentInput] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTasks = async (mode: string = "active") => {
    setLoading(true);
    try {
      let endpoint = "/tasks";
      if (mode === "history") endpoint = "/tasks/history";
      if (mode === "shopping") endpoint = "/tasks/shopping";
      
      const res = await apiClient.get(endpoint);
      setTasks(res.data);
    } catch (err) {
      toast.error("Gagal memuat tugas.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBills = async () => {
    try {
      const res = await apiClient.get("/bills");
      setBills(res.data);
    } catch (err) {}
  };

  const fetchWallets = async () => {
    try {
      const res = await apiClient.get("/finance/wallets");
      setWallets(res.data);
    } catch (err) {}
  };

  const fetchMembers = async () => {
    try {
      const res = await apiClient.get("/family/members");
      setFamilyMembers(res.data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchTasks(viewMode);
    fetchMembers();
    fetchBills();
    fetchWallets();
  }, [viewMode]);

  const handleCreate = async () => {
    if (!newTask.title) return toast.error("Judul tugas wajib diisi.");
    try {
      await apiClient.post("/tasks", newTask);
      toast.success("Tugas berhasil dibuat!");
      setIsCreateOpen(false);
      setNewTask({ title: "", description: "", priority: "MEDIUM", category: "Household", recurrence: "NONE", dueDate: "", assigneeId: "", isGoal: false });
      fetchTasks(viewMode);
    } catch (err) {
      toast.error("Gagal membuat tugas.");
    }
  };

  const toggleStatus = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "COMPLETED" ? "PENDING" : "COMPLETED";
    try {
      await apiClient.patch(`/tasks/${taskId}`, { status: nextStatus });
      fetchTasks(viewMode);
      if (nextStatus === "COMPLETED") {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#059669', '#10b981', '#34d399', '#f59e0b']
        });
        toast.success("Barakallah! Tugas selesai.");
      }
    } catch (err) {
      toast.error("Gagal memperbarui status.");
    }
  };

  const updateGoalProgress = async (taskId: string, progress: number) => {
    try {
       await apiClient.patch(`/tasks/${taskId}`, { goalProgress: progress });
       setTasks(tasks.map(t => t.id === taskId ? { ...t, goalProgress: progress } : t));
       if (selectedTask?.id === taskId) setSelectedTask({ ...selectedTask, goalProgress: progress });
       if (progress === 100) confetti();
    } catch (err) {
       toast.error("Gagal memperbarui progress.");
    }
  };

  const fetchTaskDetail = async (taskId: string) => {
    try {
      const res = await apiClient.get(`/tasks/${taskId}`);
      setSelectedTask(res.data);
      setIsDetailOpen(true);
    } catch (err) {
      toast.error("Gagal memuat detail tugas.");
    }
  };

  const addComment = async () => {
    if (!commentInput || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await apiClient.post(`/tasks/${selectedTask.id}/comments`, { content: commentInput });
      setSelectedTask({
        ...selectedTask,
        comments: [res.data, ...(selectedTask.comments || [])]
      });
      setCommentInput("");
    } catch (err) {
      toast.error("Gagal menambah komentar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addAttachment = async () => {
    if (!attachmentUrl) return;
    try {
      const res = await apiClient.post(`/tasks/${selectedTask.id}/attachments`, { url: attachmentUrl, name: attachmentName || "Attachment" });
      setSelectedTask({
        ...selectedTask,
        attachments: [res.data, ...(selectedTask.attachments || [])]
      });
      setAttachmentUrl("");
      setAttachmentName("");
      toast.success("Foto bukti ditambahkan!");
    } catch (err) {
      toast.error("Gagal menambah lampiran.");
    }
  };

  const deleteAttachment = async (id: string) => {
    try {
      await apiClient.delete(`/tasks/attachments/${id}`);
      setSelectedTask({
        ...selectedTask,
        attachments: selectedTask.attachments.filter((a: any) => a.id !== id)
      });
    } catch (err) {}
  };

  const applyTemplate = async (templateType: string) => {
    try {
      await apiClient.post("/tasks/templates/apply", { templateType });
      toast.success("Template berhasil diterapkan!");
      fetchTasks(viewMode);
    } catch (err) {
      toast.error("Gagal menerapkan template.");
    }
  };

  const exportCalendar = async () => {
    try {
      const res = await apiClient.get("/tasks/calendar/export");
      const blob = new Blob([res.data], { type: 'text/calendar' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'yumna-tasks.ics');
      document.body.appendChild(link);
      link.click();
      toast.success("Kalender berhasil diunduh.");
    } catch (err) {
      toast.error("Gagal mengekspor kalender.");
    }
  };

  const fetchSuggestions = async () => {
     setIsSuggesting(true);
     try {
       const res = await apiClient.get("/tasks/suggestions");
       setSuggestions(res.data);
     } catch (err) {} finally { setIsSuggesting(false); }
  };

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 p-1">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-emerald-950 tracking-tighter">Agenda Keluarga</h1>
          <p className="text-emerald-700/60 font-medium mt-1">Kelola tugas harian demi mencapai Falah bersama.</p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
           <Button variant="outline" onClick={exportCalendar} className="rounded-2xl h-11 border-emerald-100 text-emerald-700 hover:bg-emerald-50 px-4">
              <Download size={18} className="mr-2" /> Kalender
           </Button>

           <Button 
            onClick={fetchSuggestions}
            disabled={isSuggesting}
            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-2xl h-11 px-6 font-bold border border-emerald-200 shadow-sm"
           >
              {isSuggesting ? <Loader2 size={18} className="mr-2 animate-spin" /> : <div className="w-4 h-4 rounded-full bg-emerald-500 mr-2 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />}
              Saran AI
           </Button>

           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-emerald-100 rounded-2xl px-6 font-black uppercase text-[10px] tracking-widest h-11 hover:bg-emerald-50 text-emerald-700 bg-white">
                  Template
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-2xl border-emerald-100 p-2 min-w-48 shadow-xl shadow-emerald-900/5">
                <DropdownMenuItem onClick={() => applyTemplate('RAMADAN')} className="rounded-xl font-bold text-xs p-3 cursor-pointer hover:bg-emerald-50">Persiapan Ramadan</DropdownMenuItem>
                <DropdownMenuItem onClick={() => applyTemplate('HOUSEHOLD_DAILY')} className="rounded-xl font-bold text-xs p-3 cursor-pointer hover:bg-emerald-50">Rumah Tangga</DropdownMenuItem>
                <DropdownMenuItem onClick={() => applyTemplate('FINANCE_WEEKLY')} className="rounded-xl font-bold text-xs p-3 cursor-pointer hover:bg-emerald-50">Evaluasi Finansial</DropdownMenuItem>
              </DropdownMenuContent>
           </DropdownMenu>

           <Button onClick={() => setIsCreateOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 rounded-2xl h-11 px-6 font-bold shadow-lg shadow-emerald-900/20 group text-white">
              <Plus size={18} className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Tugas Baru
           </Button>
        </div>
      </div>

      {/* Suggestion Section */}
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-emerald-950 p-8 rounded-[40px] shadow-2xl shadow-emerald-950/20 relative overflow-hidden">
             {/* ... suggestion cards (omitted for brevity but kept in final code) ... */}
             <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-white text-xl font-black tracking-tight">Saran Amanah Barakah</h3>
                   <Button variant="ghost" size="sm" onClick={() => setSuggestions([])} className="text-emerald-300 hover:text-white">Sembunyikan</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {suggestions.map((s, i) => (
                     <div key={i} className="bg-white/10 backdrop-blur-md border border-white/5 p-6 rounded-3xl hover:bg-white/15 transition-all">
                        <Badge className="bg-emerald-500 text-white rounded-full text-[8px] font-black mb-3">{s.category}</Badge>
                        <h4 className="text-white font-bold leading-tight mb-2 text-lg">{s.title}</h4>
                        <p className="text-emerald-200/50 text-xs mb-6 h-8 overflow-hidden">{s.description}</p>
                        <Button className="w-full bg-white text-emerald-950 hover:bg-emerald-50 rounded-xl font-bold h-10">Adopt Tugas</Button>
                     </div>
                   ))}
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white p-3 rounded-[32px] border border-emerald-100 shadow-sm flex items-center gap-4">
         <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-700/30" size={18} />
            <Input placeholder="Cari amanah keluarga..." className="pl-12 rounded-2xl border-none bg-emerald-50/30 h-12 focus-visible:ring-0 font-medium" value={search} onChange={(e) => setSearch(e.target.value)} />
         </div>
         <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)} className="w-auto">
            <TabsList className="bg-emerald-50/50 border border-emerald-100 p-1 rounded-2xl h-12">
               <TabsTrigger value="active" className="rounded-xl px-4 font-bold h-10 data-[state=active]:bg-white data-[state=active]:text-emerald-600">Terdaftar</TabsTrigger>
               <TabsTrigger value="board" className="rounded-xl px-4 font-bold h-10 data-[state=active]:bg-white data-[state=active]:text-emerald-600">Board</TabsTrigger>
               <TabsTrigger value="shopping" className="rounded-xl px-4 font-bold h-10 data-[state=active]:bg-white data-[state=active]:text-emerald-600">Belanja</TabsTrigger>
               <TabsTrigger value="bills" className="rounded-xl px-4 font-bold h-10 data-[state=active]:bg-white data-[state=active]:text-emerald-600">Tagihan</TabsTrigger>
               <TabsTrigger value="history" className="rounded-xl px-4 font-bold h-10 data-[state=active]:bg-white data-[state=active]:text-emerald-600">Audit</TabsTrigger>
            </TabsList>
         </Tabs>
      </div>

      <Tabs value={viewMode} className="w-full">
         <TabsContent value="active" className="mt-0 outline-none">
            {loading ? <LoaderAnimation /> : filteredTasks.length === 0 ? <EmptyState /> : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {filteredTasks.map(task => (
                   <TaskCard 
                    key={task.id} 
                    task={task} 
                    onClick={() => fetchTaskDetail(task.id)} 
                    onToggle={() => toggleStatus(task.id, task.status)}
                    bills={bills}
                   />
                 ))}
              </div>
            )}
         </TabsContent>

         <TabsContent value="board" className="mt-0 outline-none h-full overflow-x-auto">
            <div className="flex gap-6 pb-6 min-w-max h-[calc(100vh-320px)]">
               {['PENDING', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
                 <div key={status} className="w-80 flex flex-col h-full bg-slate-50/50 rounded-[40px] border border-slate-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{status.replace('_', ' ')}</h4>
                       <Badge variant="outline" className="rounded-full bg-white text-slate-400 border-slate-100 font-bold">{tasks.filter(t => t.status === status).length}</Badge>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-hide">
                       {tasks.filter(t => t.status === status).map(task => (
                         <motion.div key={task.id} layout layoutId={task.id}>
                            <Card className="rounded-[28px] border-emerald-50 shadow-sm p-5 cursor-pointer hover:shadow-lg transition-all group" onClick={() => fetchTaskDetail(task.id)}>
                               <div className="flex justify-between items-start mb-3">
                                  <Badge className="bg-emerald-50 text-emerald-700 border-none text-[8px]">{task.category}</Badge>
                                  <PriorityBadge priority={task.priority} />
                               </div>
                               <h5 className="font-bold text-sm text-emerald-950 mb-3 leading-tight">{task.title}</h5>
                               {task.isGoal && (
                                 <div className="space-y-1.5 mb-4">
                                    <div className="flex justify-between text-[8px] font-black text-emerald-800/40 uppercase">
                                       <span>Kolektif</span>
                                       <span>{task.goalProgress}%</span>
                                    </div>
                                    <Progress value={task.goalProgress} className="h-1 bg-emerald-50" />
                                 </div>
                               )}
                               <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                  <div className="flex -space-x-2">
                                     {task.assignee && (
                                       <div className="w-6 h-6 rounded-full border-2 border-white bg-emerald-100 overflow-hidden shadow-sm">
                                          {task.assignee.image ? <img src={task.assignee.image} alt="" /> : <UserIcon size={12} className="m-auto mt-1" />}
                                       </div>
                                     )}
                                  </div>
                                  <button onClick={(e) => { e.stopPropagation(); toggleStatus(task.id, task.status); }} className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-300 hover:text-emerald-600"><CheckCircle size={18} /></button>
                               </div>
                            </Card>
                         </motion.div>
                       ))}
                    </div>
                 </div>
               ))}
            </div>
         </TabsContent>

         <TabsContent value="shopping" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {tasks.filter(t => t.category === 'Belanja').map(task => (
                  <Card key={task.id} className="rounded-[32px] border-emerald-100 p-6 hover:shadow-lg transition-all">
                     <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-emerald-950">{task.title}</h4>
                        <PriorityBadge priority={task.priority} />
                     </div>
                     <div className="space-y-2 mb-6">
                        {task.checklists?.map((item: any) => (
                           <div key={item.id} className="flex items-center gap-3">
                              <div className={cn("w-3 h-3 rounded-full border", item.isDone ? "bg-emerald-500 border-emerald-500" : "border-slate-300")} />
                              <span className={cn("text-xs font-medium", item.isDone ? "line-through text-slate-400" : "text-slate-600")}>{item.title}</span>
                           </div>
                        ))}
                     </div>
                     <Button onClick={() => fetchTaskDetail(task.id)} variant="ghost" className="w-full rounded-2xl text-[10px] font-black uppercase text-emerald-700 bg-emerald-50">Detail Belanja</Button>
                  </Card>
               ))}
            </div>
         </TabsContent>

         <TabsContent value="bills" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {bills.map(bill => (
                  <Card key={bill.id} className="rounded-[32px] border-emerald-100 p-8 hover:shadow-2xl transition-all bg-white relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[100px] -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                     <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                           <Badge className={cn("rounded-full text-[9px] font-black px-4", bill.status === 'PAID' ? "bg-emerald-500 text-white" : "bg-amber-500 text-white")}>
                              {bill.status}
                           </Badge>
                           <span className="text-2xl font-black text-emerald-950 tracking-tighter">Rp {bill.amount.toLocaleString()}</span>
                        </div>
                        <h4 className="text-xl font-black text-emerald-950 mb-2">{bill.title}</h4>
                        <p className="text-xs text-slate-500 mb-6 font-medium line-clamp-2">{bill.description}</p>
                        
                        <div className="flex items-center gap-3 mb-8">
                           <div className="p-2 bg-emerald-50 rounded-xl">
                              <Calendar size={16} className="text-emerald-600" />
                           </div>
                           <div>
                              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Jatuh Tempo</p>
                              <p className="text-xs font-bold text-slate-700">{new Date(bill.dueDate).toLocaleDateString()}</p>
                           </div>
                        </div>

                        <div className="flex gap-3">
                           <Button 
                              className="flex-1 bg-emerald-950 text-white hover:bg-black rounded-2xl h-12 font-bold text-xs"
                              disabled={bill.status === 'PAID'}
                              onClick={async () => {
                                 try {
                                    // Default to first wallet for now or show a selector
                                    if (wallets.length === 0) return toast.error("Dompet tidak ditemukan.");
                                    await apiClient.post(`/bills/${bill.id}/pay`, { walletId: wallets[0].id });
                                    toast.success("Alhamdulillah! Tagihan berhasil dibayar.");
                                    fetchBills();
                                    fetchTasks(viewMode);
                                 } catch (err) {
                                    toast.error("Gagal membayar tagihan. Pastikan saldo cukup.");
                                 }
                              }}
                           >
                              {bill.status === 'PAID' ? 'Lunas' : 'Bayar Sekarang'}
                           </Button>
                        </div>
                     </div>
                  </Card>
               ))}
            </div>
         </TabsContent>

         <TabsContent value="history" className="mt-0">
            <div className="space-y-4">
               {tasks.map(task => (
                 <Card key={task.id} className="rounded-[28px] border-slate-100 bg-white/50 p-4 opacity-75 grayscale-[0.3]">
                    <div className="flex items-center gap-4">
                       <CheckCircle2 size={24} className="text-emerald-500" />
                       <div className="flex-1">
                          <h5 className="font-bold text-slate-800">{task.title}</h5>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Selesai pada {new Date(task.updatedAt).toLocaleDateString()}</p>
                       </div>
                       <Badge variant="outline" className="rounded-full">{task.assignee?.name}</Badge>
                    </div>
                 </Card>
               ))}
            </div>
         </TabsContent>
      </Tabs>

      {/* Task Creation Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
         <DialogContent className="max-w-md rounded-[40px] border-emerald-100 p-8 shadow-2xl">
            <DialogHeader>
               <DialogTitle className="text-3xl font-black text-emerald-950 tracking-tight">Amanah Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-emerald-800/40 ml-1">Judul Amanah</label>
                  <Input placeholder="Tugas apa yang ingin dibagikan?" className="h-14 rounded-2xl bg-emerald-50/50 border-emerald-100 focus-visible:ring-emerald-500 font-bold" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} />
               </div>
               <div className="flex items-center gap-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                  <CheckCircle2 size={20} className={cn(newTask.isGoal ? "text-emerald-600" : "text-slate-300")} />
                  <div className="flex-1">
                     <p className="text-xs font-black text-emerald-950">Goal Keluarga</p>
                     <p className="text-[10px] font-medium text-emerald-800/50">Gunakan progress bar untuk pengerjaan kolektif.</p>
                  </div>
                  <input type="checkbox" checked={newTask.isGoal} onChange={(e) => setNewTask({...newTask, isGoal: e.target.checked})} className="w-5 h-5 accent-emerald-600" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <Select value={newTask.category} onValueChange={(v) => setNewTask({...newTask, category: v})}>
                     <SelectTrigger className="h-12 rounded-2xl bg-white border-emerald-100 font-bold text-xs"><SelectValue placeholder="Kategori" /></SelectTrigger>
                     <SelectContent className="rounded-2xl">{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={newTask.priority} onValueChange={(v) => setNewTask({...newTask, priority: v})}>
                     <SelectTrigger className="h-12 rounded-2xl bg-white border-emerald-100 font-bold text-xs"><SelectValue placeholder="Prioritas" /></SelectTrigger>
                     <SelectContent className="rounded-2xl">{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
               </div>
                <div className="grid grid-cols-2 gap-4">
                  <Select value={newTask.assigneeId} onValueChange={(v) => setNewTask({...newTask, assigneeId: v})}>
                     <SelectTrigger className="h-12 rounded-2xl bg-white border-emerald-100 font-bold text-xs"><SelectValue placeholder="Assign Ke..." /></SelectTrigger>
                     <SelectContent className="rounded-2xl">{familyMembers.map(m => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                     ))}</SelectContent>
                  </Select>
                  <Select value={newTask.parentId || "none"} onValueChange={(v) => setNewTask({...newTask, parentId: v === "none" ? "" : v})}>
                     <SelectTrigger className="h-12 rounded-2xl bg-white border-emerald-100 font-bold text-xs"><SelectValue placeholder="Induk Amanah" /></SelectTrigger>
                     <SelectContent className="rounded-2xl">
                        <SelectItem value="none">Tanpa Induk</SelectItem>
                        {tasks.filter(t => !t.parentId).map(t => (
                           <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
               </div>
               <Select value={newTask.billId || "none"} onValueChange={(v) => setNewTask({...newTask, billId: v === "none" ? "" : v})}>
                  <SelectTrigger className="h-12 rounded-2xl bg-white border-emerald-100 font-bold text-xs"><SelectValue placeholder="Hubungkan ke Tagihan" /></SelectTrigger>
                  <SelectContent className="rounded-2xl">
                     <SelectItem value="none">Tidak ada Tagihan</SelectItem>
                     {bills.map(b => (
                        <SelectItem key={b.id} value={b.id}>{b.title} - Rp {b.amount.toLocaleString()}</SelectItem>
                     ))}
                  </SelectContent>
               </Select>
            </div>
            <Button onClick={handleCreate} className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-emerald-900/20">Bagikan Amanah</Button>
         </DialogContent>
      </Dialog>

      {/* Task Detail Dialog (Extensive) */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
         <DialogContent className="max-w-2xl rounded-[40px] p-0 overflow-hidden border-emerald-100 h-[85vh] flex flex-col shadow-2xl">
            {selectedTask && (
              <>
                 <div className="p-8 bg-emerald-50/50 border-b border-emerald-100 shrink-0 relative">
                    <div className="flex justify-between items-start mb-6">
                       <Badge className="rounded-full bg-white border-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest py-1 px-4">{selectedTask.category}</Badge>
                       <PriorityBadge priority={selectedTask.priority} />
                    </div>
                    <h2 className="text-3xl font-black text-emerald-950 tracking-tight leading-tight mb-4">{selectedTask.title}</h2>
                    <div className="flex items-center gap-6">
                       <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-2xl bg-white border border-emerald-100 flex items-center justify-center shadow-sm overflow-hidden">
                             {selectedTask.assignee?.image ? <img src={selectedTask.assignee.image} alt="" /> : <UserIcon size={18} className="text-emerald-300" />}
                          </div>
                          <div>
                             <p className="text-[9px] font-black uppercase text-emerald-800/40">Penerima</p>
                             <p className="text-xs font-bold text-emerald-900">{selectedTask.assignee?.name || 'Unassigned'}</p>
                          </div>
                       </div>
                       {selectedTask.lastEditedAt && (
                         <div className="flex items-center gap-2 border-l border-emerald-100 pl-6">
                            <Edit2 size={14} className="text-emerald-300" />
                            <div>
                               <p className="text-[9px] font-black uppercase text-emerald-800/40 tracking-widest">Kolaborasi</p>
                               <p className="text-[10px] font-bold text-slate-500">Edit Terakhir: {new Date(selectedTask.lastEditedAt).toLocaleTimeString()}</p>
                            </div>
                         </div>
                       )}
                    </div>
                 </div>

                  <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide bg-white">
                     {selectedTask.bill && (
                        <div className="p-8 bg-blue-50 rounded-[32px] border border-blue-100 relative overflow-hidden group">
                           <div className="flex justify-between items-start mb-6">
                              <div>
                                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-1">Tagihan Terkait</h4>
                                 <p className="text-xl font-black text-blue-950">{selectedTask.bill.title}</p>
                              </div>
                              <Badge className={cn("rounded-full text-[9px] font-black px-4", selectedTask.bill.status === 'PAID' ? "bg-emerald-500 text-white" : "bg-blue-600 text-white")}>
                                 {selectedTask.bill.status}
                              </Badge>
                           </div>
                           <div className="flex items-end justify-between">
                              <span className="text-3xl font-black text-blue-950">Rp {selectedTask.bill.amount.toLocaleString()}</span>
                              {selectedTask.bill.status !== 'PAID' && (
                                 <Button 
                                    className="bg-blue-950 text-white hover:bg-black rounded-2xl px-6 h-12 font-bold"
                                    onClick={async () => {
                                       try {
                                          if (wallets.length === 0) return toast.error("Dompet tidak ditemukan.");
                                          await apiClient.post(`/bills/${selectedTask.bill.id}/pay`, { walletId: wallets[0].id });
                                          fetchTaskDetail(selectedTask.id);
                                          fetchBills();
                                          toast.success("Tagihan lunas!");
                                       } catch (err) {
                                          toast.error("Gagal membayar.");
                                       }
                                    }}
                                 >Bayar Sekarang</Button>
                              )}
                           </div>
                        </div>
                     )}

                     {selectedTask.isGoal && (
                        <div className="p-6 bg-emerald-950 rounded-[32px] text-white shadow-xl shadow-emerald-900/10">
                           <div className="flex justify-between items-center mb-4">
                              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">Goal Progress</h4>
                              <span className="text-2xl font-black">{selectedTask.goalProgress}%</span>
                           </div>
                           <Progress value={selectedTask.goalProgress} className="h-2 bg-white/10" />
                           <div className="grid grid-cols-5 gap-1 mt-6">
                              {[0, 25, 50, 75, 100].map(p => (
                                <Button key={p} variant="ghost" size="sm" onClick={() => updateGoalProgress(selectedTask.id, p)} className={cn("text-[10px] font-black h-8 rounded-xl", selectedTask.goalProgress === p ? "bg-emerald-500 text-white" : "text-emerald-400 hover:bg-white/5")}>{p}%</Button>
                              ))}
                           </div>
                        </div>
                     )}

                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-emerald-800/40">Amanah Description</label>
                        <p className="text-sm font-medium text-slate-600 bg-emerald-50/20 p-6 rounded-[28px] border border-emerald-100/50 leading-relaxed">{selectedTask.description || "Istiqomah adalah kunci. Belum ada deskripsi rinci."}</p>
                     </div>

                     {selectedTask.subTasks?.length > 0 && (
                        <div className="space-y-4">
                           <label className="text-[10px] font-black uppercase tracking-widest text-emerald-800/40">Sub-Amanah ({selectedTask.subTasks.length})</label>
                           <div className="grid grid-cols-1 gap-3">
                              {selectedTask.subTasks.map((st: any) => (
                                 <div key={st.id} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
                                    <span className={cn("text-xs font-bold", st.status === 'COMPLETED' ? "line-through text-slate-400" : "text-slate-700")}>{st.title}</span>
                                    <Badge className={st.status === 'COMPLETED' ? "bg-emerald-500" : "bg-slate-200"}>{st.status}</Badge>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                     <div className="space-y-6">
                       <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black uppercase tracking-widest text-emerald-800/40">Bukti Pengerjaan (Photos)</label>
                          <Dialog>
                             <DialogTrigger asChild><Button variant="ghost" size="sm" className="text-emerald-600 font-bold"><Plus size={14} className="mr-1" /> Unggah Foto</Button></DialogTrigger>
                             <DialogContent className="max-w-sm rounded-[32px]">
                                <DialogHeader><DialogTitle>Unggah Bukti</DialogTitle></DialogHeader>
                                <div className="space-y-4 py-4">
                                   <Input placeholder="URL Gambar (Mockup)" value={attachmentUrl} onChange={(e) => setAttachmentUrl(e.target.value)} className="rounded-xl" />
                                   <Input placeholder="Nama Foto (e.g. Ruang Tamu Rapi)" value={attachmentName} onChange={(e) => setAttachmentName(e.target.value)} className="rounded-xl" />
                                   <Button onClick={addAttachment} className="w-full bg-emerald-600 rounded-xl">Simpan Bukti</Button>
                                </div>
                             </DialogContent>
                          </Dialog>
                       </div>
                       <div className="grid grid-cols-3 gap-4">
                          {selectedTask.attachments?.map((a: any) => (
                             <div key={a.id} className="relative aspect-square rounded-2xl overflow-hidden border border-emerald-100 group">
                                <img src={a.url} alt={a.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-emerald-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                   <button onClick={() => deleteAttachment(a.id)} className="p-2 bg-white/20 hover:bg-rose-500 text-white rounded-full transition-colors"><Trash2 size={16} /></button>
                                </div>
                             </div>
                          ))}
                          {selectedTask.attachments?.length === 0 && (
                             <div className="col-span-3 border-2 border-dashed border-emerald-50 rounded-3xl h-24 flex flex-col items-center justify-center text-emerald-200">
                                <ImageIcon size={24} className="mb-2" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Belum ada lampiran</span>
                             </div>
                          )}
                       </div>
                    </div>

                    <div className="space-y-6 pb-20">
                       <label className="text-[10px] font-black uppercase tracking-widest text-emerald-800/40">Diskusi Keluarga</label>
                       <div className="space-y-4">
                          {selectedTask.comments?.map((c: any) => (
                             <div key={c.id} className="flex gap-4">
                                <div className="w-8 h-8 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                   {c.user.image ? <img src={c.user.image} alt="" className="w-full h-full object-cover" /> : <UserIcon size={14} className="m-auto mt-2 text-slate-400" />}
                                </div>
                                <div className="flex-1">
                                   <div className="flex items-center gap-2 mb-1">
                                      <span className="text-[10px] font-black text-emerald-950 uppercase">{c.user.name}</span>
                                      <span className="text-[8px] font-bold text-slate-300">{new Date(c.createdAt).toLocaleDateString()}</span>
                                   </div>
                                   <p className="text-xs text-slate-600 font-medium">{c.content}</p>
                                </div>
                             </div>
                          ))}
                       </div>
                       <div className="flex gap-3 pt-4">
                          <Input placeholder="Tulis masukan atau apresiasi..." className="rounded-2xl bg-slate-50 border-none h-12 text-sm" value={commentInput} onChange={(e) => setCommentInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addComment()} />
                          <Button onClick={addComment} className="h-12 w-12 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-md"><Plus size={20} /></Button>
                       </div>
                    </div>
                 </div>

                 <div className="p-6 bg-white border-t border-slate-100 flex gap-4">
                    <Button onClick={() => toggleStatus(selectedTask.id, selectedTask.status)} className={cn("flex-1 h-14 rounded-[20px] font-black uppercase tracking-widest shadow-xl transition-all", selectedTask.status === 'COMPLETED' ? "bg-slate-100 text-slate-400" : "bg-emerald-600 text-white hover:bg-emerald-700")}>
                       {selectedTask.status === 'COMPLETED' ? 'Aktifkan Kembali' : 'Selesaikan Amanah'}
                    </Button>
                 </div>
              </>
            )}
         </DialogContent>
      </Dialog>
    </div>
  );
}

function TaskCard({ task, onClick, onToggle, compact = false, bills = [] }: any) {
   const linkedBill = bills.find((b: any) => b.id === task.billId);
   return (
      <Card onClick={onClick} className={cn("group relative overflow-hidden rounded-[36px] bg-white border-emerald-50 hover:border-emerald-200 transition-all hover:shadow-2xl hover:shadow-emerald-900/5 cursor-pointer", task.status === 'COMPLETED' && "opacity-50")}>
         <CardContent className={cn("p-8", compact && "p-5")}>
            <div className="flex justify-between items-start mb-4">
               <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="rounded-full bg-emerald-50 border-none text-[8px] font-black uppercase py-0.5 px-3">{task.category}</Badge>
                  {task.billId && <Badge className="bg-blue-50 text-blue-700 border-none text-[8px] font-black">Rp {(linkedBill?.amount || 0).toLocaleString()}</Badge>}
               </div>
               <PriorityBadge priority={task.priority} />
            </div>
            <h3 className={cn("text-xl font-black text-emerald-950 leading-tight mb-2 group-hover:text-emerald-700 transition-colors", compact && "text-sm mb-4")}>{task.title}</h3>
            {!compact && <p className="text-xs font-medium text-slate-500 line-clamp-2 mb-6 h-8">{task.description}</p>}
            
            {task.subTasks?.length > 0 && (
               <div className="mb-4 flex gap-2">
                  <Badge variant="ghost" className="text-[8px] p-0 font-black text-emerald-600 uppercase">
                     {task.subTasks.filter((st: any) => st.status === 'COMPLETED').length} / {task.subTasks.length} Sub-amanah
                  </Badge>
               </div>
            )}
            {task.isGoal && (
               <div className="space-y-1.5 mb-6">
                  <div className="flex justify-between text-[9px] font-black uppercase text-emerald-800/40">
                     <span>Progres Goal</span>
                     <span>{task.goalProgress}%</span>
                  </div>
                  <Progress value={task.goalProgress} className="h-2 bg-emerald-50/50" />
               </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t border-emerald-50">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                     {task.assignee?.image ? <img src={task.assignee.image} alt="" className="w-full h-full object-cover" /> : <UserIcon size={14} className="text-slate-300" />}
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{task.assignee?.name || 'Unassigned'}</span>
               </div>
               <button onClick={(e) => { e.stopPropagation(); onToggle(); }} className={cn("w-9 h-9 rounded-2xl flex items-center justify-center transition-all", task.status === 'COMPLETED' ? "bg-emerald-500 text-white" : "bg-emerald-50 text-emerald-300 hover:text-emerald-600")}>
                  <CheckCircle size={18} />
               </button>
            </div>
         </CardContent>
      </Card>
   );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: any = { URGENT: 'rose', HIGH: 'orange', MEDIUM: 'amber', LOW: 'emerald' };
  const color = colors[priority] || 'slate';
  return (
    <Badge className={cn("rounded-full text-[8px] font-black tracking-widest py-0", `bg-${color}-100 text-${color}-600`)}>
      {priority}
    </Badge>
  );
}

function LoaderAnimation() {
   return (
     <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
       <Circle className="w-12 h-12 text-emerald-600 animate-spin" />
       <p className="font-black uppercase text-[10px] tracking-[0.5em] text-emerald-950">Memuat Barakah...</p>
     </div>
   );
}

function EmptyState() {
   return (
     <div className="text-center py-24 bg-white/50 rounded-[40px] border-2 border-dashed border-emerald-100 max-w-2xl mx-auto">
        <ClipboardList size={48} className="text-emerald-100 mx-auto mb-6" />
        <h3 className="text-xl font-black text-emerald-950">Agenda Masih Kosong</h3>
        <p className="text-slate-500 font-medium text-sm mt-2">Mulai pekan ini dengan perencanaan yang matang dan penuh berkah.</p>
     </div>
   );
}

function Loader2(props: any) {
  return <Circle {...props} className={cn("animate-spin", props.className)} />;
}
