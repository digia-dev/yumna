"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ComponentProps,
} from "react";
import {
  Plus, Search, Calendar, CheckCircle2, Circle, User as UserIcon,
  Trash2, Edit2, Image as ImageIcon, CheckCircle, Download, ClipboardList,
  Upload, Target, GripVertical, FileText, Clock, Star, Bell, Trophy,
  Lock, Layers, Filter, MapPin, Printer, ChevronRight, ChevronDown,
  Link2, AlertTriangle, Repeat, Palmtree, ArchiveX, Users,
} from "lucide-react";

// DnD-Kit
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors, closestCorners,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ─────────────────────────────────────────────────────────────────────
interface UserSummary { id: string; name: string; image?: string | null; role?: string; }
interface TaskChecklistItem { id: string; title: string; isDone: boolean; }
interface TaskComment { id: string; content: string; createdAt: string; user: UserSummary; }
interface TaskAttachment { id: string; url: string; name: string; createdAt?: string; }

interface Task {
  id: string; title: string; description?: string; priority: string;
  category?: string; status: string; assignee?: UserSummary | null;
  billId?: string; bill?: { id: string; title: string; amount: number; status?: string; } | null;
  subTasks?: Task[]; isGoal?: boolean; goalProgress?: number;
  checklists?: TaskChecklistItem[]; attachments?: TaskAttachment[];
  comments?: TaskComment[]; lastEditedAt?: string; updatedAt?: string;
  isPrivate?: boolean; estimatedMinutes?: number; color?: string;
  recurringType?: string; holidayDate?: string;
  dependencies?: { id: string; title: string; status: string; priority: string; }[];
}

interface AuditLogEntry { id: string; action: string; details?: string; createdAt: string; user?: UserSummary | null; }
interface Suggestion { title: string; description: string; priority: string; category: string; }
interface BillSummary { id: string; title?: string; amount: number; status?: string; description?: string; dueDate?: string; }

interface LeaderboardEntry {
  id: string; name: string; image?: string | null; role: string;
  completed: number; total: number; thisWeek: number; completionRate: number; points: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = ["Household", "Finance", "Belanja", "Worship", "Health", "Lainnya"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED"] as const;
type TaskStatus = (typeof STATUSES)[number];

const STATUS_LABELS: Record<TaskStatus, string> = { PENDING: "To Do", IN_PROGRESS: "Dikerjakan", COMPLETED: "Selesai" };
const STATUS_COLORS: Record<TaskStatus, string> = {
  PENDING: "bg-slate-50 border-slate-100",
  IN_PROGRESS: "bg-amber-50/40 border-amber-100",
  COMPLETED: "bg-emerald-50/40 border-emerald-100",
};

const TASK_COLORS = [
  { label: "Emerald", value: "#10b981" }, { label: "Blue", value: "#3b82f6" },
  { label: "Purple", value: "#8b5cf6" }, { label: "Rose", value: "#f43f5e" },
  { label: "Amber", value: "#f59e0b" }, { label: "Cyan", value: "#06b6d4" },
];

const TEMPLATES = [
  { key: "RAMADAN", label: "Persiapan Ramadan", icon: "🌙", desc: "Sahur, tadarus, sedekah iftar" },
  { key: "HOUSEHOLD_DAILY", label: "Rumah Tangga Harian", icon: "🏠", desc: "Bersih-bersih, siram tanaman" },
  { key: "FINANCE_WEEKLY", label: "Evaluasi Finansial", icon: "💰", desc: "Rekap nota, alokasi darurat" },
];

const RECURRING_OPTIONS = [
  { value: "DAILY", label: "🔁 Harian" },
  { value: "WEEKLY", label: "📅 Mingguan" },
  { value: "MONTHLY", label: "🗓️ Bulanan" },
];

// ── Push Notification helper (355) ────────────────────────────────────────────
async function requestPushPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  const result = await Notification.requestPermission();
  return result === "granted";
}

function sendPushNotif(title: string, body: string) {
  if (Notification.permission === "granted") {
    new Notification(`🔔 Yumna: ${title}`, { body, icon: "/icon-192.png" });
  }
}

// ── Print helper (365) ────────────────────────────────────────────────────────
function printChecklist(task: Task) {
  const items = task.checklists ?? [];
  const html = `
    <html><head><title>Checklist: ${task.title}</title>
    <style>
      body{font-family:sans-serif;padding:40px;color:#111}
      h1{font-size:24px;margin-bottom:4px}
      .meta{color:#666;font-size:12px;margin-bottom:24px}
      .item{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #eee}
      .box{width:20px;height:20px;border:2px solid #333;border-radius:4px;flex-shrink:0}
      .done{background:#059669;border-color:#059669}
      .title{font-size:14px}
      .done-text{text-decoration:line-through;color:#999}
      footer{margin-top:32px;font-size:10px;color:#bbb;text-align:center}
    </style></head><body>
    <h1>${task.title}</h1>
    <div class="meta">${task.category ?? ""} · ${task.priority} · ${items.filter(i=>i.isDone).length}/${items.length} selesai</div>
    ${items.map(i=>`<div class="item"><div class="box ${i.isDone?"done":""}"></div><span class="title ${i.isDone?"done-text":""}">${i.title}</span></div>`).join("")}
    <footer>Dicetak dari Yumna Family App · ${new Date().toLocaleDateString("id-ID")}</footer>
    </body></html>`;
  const w = window.open("", "_blank")!;
  w.document.write(html);
  w.document.close();
  w.print();
}

// ── PDF Agenda helper (368) ───────────────────────────────────────────────────
async function downloadAgendaPDF(agenda: any) {
  const html = `
    <html><head><title>Agenda Keluarga ${agenda.familyName}</title>
    <style>
      body{font-family:sans-serif;padding:48px;color:#111;max-width:800px;margin:auto}
      h1{font-size:32px;font-weight:900;color:#064e3b}
      .subtitle{color:#6b7280;margin-bottom:32px;font-size:14px}
      h2{font-size:16px;font-weight:700;color:#065f46;margin:24px 0 12px;padding-bottom:6px;border-bottom:2px solid #d1fae5}
      .stat{display:inline-block;background:#ecfdf5;padding:8px 16px;border-radius:8px;margin-right:8px;font-size:13px;font-weight:600;color:#047857}
      .task{padding:10px 0;border-bottom:1px solid #f3f4f6;display:flex;gap:12px;align-items:flex-start}
      .dot{width:8px;height:8px;border-radius:50%;background:#059669;margin-top:4px;flex-shrink:0}
      .tdone .dot{background:#9ca3af}
      .tname{font-size:13px;font-weight:600}
      .tmeta{font-size:11px;color:#9ca3af;margin-top:2px}
      .member{display:inline-flex;align-items:center;gap:6px;background:#f9fafb;padding:6px 12px;border-radius:8px;margin:4px;font-size:12px}
      footer{margin-top:48px;text-align:center;font-size:10px;color:#d1d5db}
    </style></head><body>
    <h1>📋 Agenda Keluarga ${agenda.familyName}</h1>
    <div class="subtitle">Dicetak: ${new Date(agenda.generatedAt).toLocaleString("id-ID")}</div>
    <div>
      <span class="stat">📌 Total: ${agenda.stats.total}</span>
      <span class="stat">✅ Selesai: ${agenda.stats.completed}</span>
      <span class="stat">⚠️ Terlambat: ${agenda.stats.overdue}</span>
    </div>
    <h2>👨‍👩‍👧 Anggota Keluarga</h2>
    <div>${agenda.members.map((m:any)=>`<span class="member">👤 ${m.name} (${m.role})</span>`).join("")}</div>
    <h2>📌 Tugas Aktif (${agenda.tasks.pending.length + agenda.tasks.inProgress.length})</h2>
    ${[...agenda.tasks.pending, ...agenda.tasks.inProgress].map((t:any)=>`
      <div class="task"><div class="dot"></div><div>
        <div class="tname">${t.title}</div>
        <div class="tmeta">${t.category??""} · ${t.priority}${t.assignee?` · PJ: ${t.assignee.name}`:""}</div>
      </div></div>`).join("")}
    <h2 style="color:#6b7280">✅ Selesai (${agenda.tasks.completed.length})</h2>
    ${agenda.tasks.completed.slice(0,10).map((t:any)=>`
      <div class="task tdone"><div class="dot"></div><div>
        <div class="tname" style="text-decoration:line-through;color:#9ca3af">${t.title}</div>
      </div></div>`).join("")}
    ${agenda.pendingBills.length>0?`
    <h2 style="color:#b45309">💳 Tagihan Jatuh Tempo</h2>
    ${agenda.pendingBills.map((b:any)=>`<div class="task"><div class="dot" style="background:#f59e0b"></div><div>
      <div class="tname">${b.title??b.id}</div>
      <div class="tmeta">Rp ${(b.amount??0).toLocaleString()}</div></div></div>`).join("")}`:""}
    <footer>Yumna Family Financial Command Center · yumna.app</footer>
    </body></html>`;
  const w = window.open("", "_blank")!;
  w.document.write(html);
  w.document.close();
  w.print();
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TasksPage() {
  const [tasks, setTasks] = useState<(Task | AuditLogEntry)[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<
    "active" | "board" | "goals" | "leaderboard" | "weekly" | "holiday" | "shopping" | "history"
  >("active");

  // 358 – Filter by Assignee
  const [filterAssignee, setFilterAssignee] = useState("");
  // 359 – Show private toggle
  const [showPrivateOnly, setShowPrivateOnly] = useState(false);

  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [bills, setBills] = useState<BillSummary[]>([]);
  const [wallets, setWallets] = useState<BillSummary[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [weeklyData, setWeeklyData] = useState<any>(null);
  const [holidayTasks, setHolidayTasks] = useState<Task[]>([]);
  const [isAutoArchiving, setIsAutoArchiving] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "", description: "", priority: "MEDIUM", category: "Household",
    recurringType: "", dueDate: "", assigneeId: "", isGoal: false,
    parentId: "", billId: "", dependencyIds: [] as string[],
    isPrivate: false, estimatedMinutes: 0, color: "",
    holidayDate: "",
  });

  const [familyMembers, setFamilyMembers] = useState<UserSummary[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [checklistInput, setChecklistInput] = useState("");
  const [commentInput, setCommentInput] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 357 – Sub-task
  const [subTaskInput, setSubTaskInput] = useState("");
  const [isAddingSubTask, setIsAddingSubTask] = useState(false);

  // Collaborative editing
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState("");
  const [isSavingDesc, setIsSavingDesc] = useState(false);

  // Draggable board
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Template / others
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // ── Data Fetchers ────────────────────────────────────────────────────────
  const fetchTasks = useCallback(async (mode: string = "active") => {
    setLoading(true);
    try {
      let endpoint = "/tasks";
      if (mode === "history") endpoint = "/tasks/history";
      if (mode === "shopping") endpoint = "/tasks/shopping";
      const params: Record<string, string> = {};
      if (filterAssignee) params.assigneeId = filterAssignee;
      const res = await apiClient.get(endpoint, { params });
      setTasks(res.data?.items ?? res.data);
    } catch { toast.error("Gagal memuat tugas."); }
    finally { setLoading(false); }
  }, [filterAssignee]);

  const fetchLeaderboard = async () => {
    try { const r = await apiClient.get("/tasks/leaderboard"); setLeaderboard(r.data); } catch {}
  };

  const fetchWeekly = async () => {
    try { const r = await apiClient.get("/tasks/weekly-routine"); setWeeklyData(r.data); } catch {}
  };

  const fetchHoliday = async () => {
    try { const r = await apiClient.get("/tasks/holiday-planner"); setHolidayTasks(r.data); } catch {}
  };

  const fetchBills = async () => { try { const r = await apiClient.get("/bills"); setBills(r.data); } catch {} };
  const fetchWallets = async () => { try { const r = await apiClient.get("/finance/wallets"); setWallets(r.data); } catch {} };
  const fetchMembers = async () => { try { const r = await apiClient.get("/family/members"); setFamilyMembers(r.data); } catch {} };

  useEffect(() => {
    fetchTasks(viewMode);
    fetchMembers();
    fetchBills();
    fetchWallets();
    if (viewMode === "leaderboard") fetchLeaderboard();
    if (viewMode === "weekly") fetchWeekly();
    if (viewMode === "holiday") fetchHoliday();
  }, [viewMode, filterAssignee]);

  // 355 – Request push on first load
  useEffect(() => { requestPushPermission(); }, []);

  const handleCreate = async () => {
    if (!newTask.title) return toast.error("Judul tugas wajib diisi.");
    try {
      const payload = {
        ...newTask,
        estimatedMinutes: newTask.estimatedMinutes || undefined,
        color: newTask.color || undefined,
        recurringType: newTask.recurringType || undefined,
        holidayDate: newTask.holidayDate || undefined,
        assigneeId: newTask.assigneeId || undefined,
        parentId: newTask.parentId || undefined,
        billId: newTask.billId || undefined,
      };
      const res = await apiClient.post("/tasks", payload);
      toast.success("Tugas berhasil dibuat!");
      // 355 – push notif if assignee selected
      if (newTask.assigneeId) {
        const assignee = familyMembers.find(m => m.id === newTask.assigneeId);
        sendPushNotif("Amanah Baru", `"${newTask.title}" ditugaskan kepada ${assignee?.name ?? "anggota"}`);
      }
      setIsCreateOpen(false);
      setNewTask({ title: "", description: "", priority: "MEDIUM", category: "Household",
        recurringType: "", dueDate: "", assigneeId: "", isGoal: false,
        parentId: "", billId: "", dependencyIds: [], isPrivate: false, estimatedMinutes: 0, color: "", holidayDate: "" });
      fetchTasks(viewMode);
    } catch { toast.error("Gagal membuat tugas."); }
  };

  const toggleStatus = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "COMPLETED" ? "PENDING" : "COMPLETED";
    try {
      await apiClient.patch(`/tasks/${taskId}`, { status: nextStatus });
      fetchTasks(viewMode);
      if (nextStatus === "COMPLETED") {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ["#059669","#10b981","#34d399","#f59e0b"] });
        toast.success("Barakallah! Tugas selesai.");
        sendPushNotif("Tugas Selesai! 🎉", "Barakallah atas penyelesaian amanah ini.");
      }
    } catch { toast.error("Gagal memperbarui status."); }
  };

  const updateGoalProgress = async (taskId: string, progress: number) => {
    try {
      await apiClient.patch(`/tasks/${taskId}`, { goalProgress: progress });
      setTasks(p => p.map(t => t.id === taskId ? { ...t, goalProgress: progress } : t));
      if (selectedTask?.id === taskId) setSelectedTask(s => s ? { ...s, goalProgress: progress } : s);
      if (progress === 100) confetti();
    } catch { toast.error("Gagal memperbarui progress."); }
  };

  const fetchTaskDetail = async (taskId: string) => {
    try {
      const res = await apiClient.get(`/tasks/${taskId}`);
      setSelectedTask(res.data);
      setDescDraft(res.data.description ?? "");
      setIsDetailOpen(true);
    } catch { toast.error("Gagal memuat detail tugas."); }
  };

  const saveDescription = async () => {
    if (!selectedTask) return;
    setIsSavingDesc(true);
    try {
      await apiClient.patch(`/tasks/${selectedTask.id}`, { description: descDraft });
      setSelectedTask(s => s ? { ...s, description: descDraft, lastEditedAt: new Date().toISOString() } : s);
      setEditingDesc(false);
      toast.success("Deskripsi diperbarui!");
    } catch { toast.error("Gagal menyimpan deskripsi."); }
    finally { setIsSavingDesc(false); }
  };

  const handleFileUpload = async (file: File) => {
    if (!selectedTask) return;
    setIsUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await apiClient.post("/uploads", formData, { headers: { "Content-Type": "multipart/form-data" } });
      const url = uploadRes.data?.url ?? uploadRes.data?.path ?? URL.createObjectURL(file);
      const res = await apiClient.post(`/tasks/${selectedTask.id}/attachments`, { url, name: file.name });
      setSelectedTask(s => s ? { ...s, attachments: [res.data, ...(s.attachments ?? [])] } : s);
      toast.success(`Foto "${file.name}" diunggah!`);
    } catch { toast.error("Gagal mengunggah. Gunakan URL."); }
    finally { setIsUploadingFile(false); }
  };

  const addAttachment = async () => {
    if (!attachmentUrl || !selectedTask) return;
    try {
      const res = await apiClient.post(`/tasks/${selectedTask.id}/attachments`, { url: attachmentUrl, name: attachmentName || "Lampiran" });
      setSelectedTask(s => s ? { ...s, attachments: [res.data, ...(s.attachments ?? [])] } : s);
      setAttachmentUrl(""); setAttachmentName("");
      toast.success("Foto bukti ditambahkan!");
    } catch { toast.error("Gagal menambah lampiran."); }
  };

  const deleteAttachment = async (id: string) => {
    try {
      await apiClient.delete(`/tasks/attachments/${id}`);
      setSelectedTask(s => s ? { ...s, attachments: s.attachments?.filter(a => a.id !== id) } : s);
    } catch {}
  };

  const addComment = async () => {
    if (!commentInput || isSubmitting || !selectedTask) return;
    setIsSubmitting(true);
    try {
      const res = await apiClient.post(`/tasks/${selectedTask.id}/comments`, { content: commentInput });
      setSelectedTask(s => s ? { ...s, comments: [res.data, ...(s.comments ?? [])] } : s);
      setCommentInput("");
    } catch { toast.error("Gagal menambah komentar."); }
    finally { setIsSubmitting(false); }
  };

  const addChecklistItem = async () => {
    if (!checklistInput || !selectedTask) return;
    try {
      const res = await apiClient.post(`/tasks/${selectedTask.id}/checklists`, { title: checklistInput });
      setSelectedTask(s => s ? { ...s, checklists: [...(s.checklists ?? []), res.data] } : s);
      setChecklistInput("");
    } catch { toast.error("Gagal menambah item."); }
  };

  const toggleChecklistItem = async (item: TaskChecklistItem) => {
    try {
      await apiClient.patch(`/tasks/checklists/${item.id}`, { isDone: !item.isDone });
      setSelectedTask(s => s ? { ...s, checklists: s.checklists?.map(c => c.id === item.id ? { ...c, isDone: !c.isDone } : c) } : s);
    } catch {}
  };

  // 357 – Add Sub-task
  const addSubTask = async () => {
    if (!subTaskInput || !selectedTask) return;
    setIsAddingSubTask(true);
    try {
      const res = await apiClient.post(`/tasks/${selectedTask.id}/subtasks`, { title: subTaskInput, priority: "MEDIUM" });
      setSelectedTask(s => s ? { ...s, subTasks: [...(s.subTasks ?? []), res.data] } : s);
      setSubTaskInput("");
      toast.success("Sub-amanah ditambahkan!");
    } catch { toast.error("Gagal menambah sub-tugas."); }
    finally { setIsAddingSubTask(false); }
  };

  // 364 – Auto-archive
  const handleAutoArchive = async () => {
    setIsAutoArchiving(true);
    try {
      const res = await apiClient.post("/tasks/auto-archive");
      toast.success(`✅ ${res.data.archivedCount} tugas lama diarsipkan.`);
      fetchTasks(viewMode);
    } catch { toast.error("Gagal mengarsipkan."); }
    finally { setIsAutoArchiving(false); }
  };

  // 368 – PDF Agenda Export
  const handleAgendaExport = async () => {
    try {
      const res = await apiClient.get("/tasks/agenda");
      await downloadAgendaPDF(res.data);
    } catch { toast.error("Gagal mengekspor agenda."); }
  };

  // 351 – iCal Export
  const exportCalendar = async () => {
    try {
      const res = await apiClient.get("/tasks/calendar/export");
      const blob = new Blob([res.data], { type: "text/calendar;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `yumna-${new Date().toISOString().split("T")[0]}.ics`);
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Kalender .ics diunduh.");
    } catch { toast.error("Gagal mengekspor kalender."); }
  };

  const applyTemplate = async (templateType: string) => {
    try {
      await apiClient.post("/tasks/templates/apply", { templateType });
      toast.success("Template berhasil diterapkan!");
      setIsTemplateOpen(false);
      fetchTasks(viewMode);
    } catch { toast.error("Gagal menerapkan template."); }
  };

  const fetchSuggestions = async () => {
    setIsSuggesting(true);
    try { const r = await apiClient.get("/tasks/suggestions"); setSuggestions(r.data); }
    catch { toast.error("Gagal mengambil saran AI."); }
    finally { setIsSuggesting(false); }
  };

  const adoptSuggestion = async (s: Suggestion) => {
    try {
      await apiClient.post("/tasks", { title: s.title, description: s.description, priority: s.priority || "MEDIUM", category: s.category || "Lainnya" });
      toast.success("Saran tugas ditambahkan!");
      setSuggestions([]); fetchTasks(viewMode);
    } catch { toast.error("Gagal menambahkan saran."); }
  };

  // Board DnD
  const handleDragStart = (e: DragStartEvent) => setActiveTask((tasks as Task[]).find(t => t.id === e.active.id) ?? null);
  const handleDragEnd = async (e: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = e;
    if (!over) return;
    const targetStatus = STATUSES.find(s => s === String(over.id));
    if (targetStatus) {
      const task = (tasks as Task[]).find(t => t.id === String(active.id));
      if (task && task.status !== targetStatus) {
        try {
          await apiClient.patch(`/tasks/${task.id}`, { status: targetStatus });
          fetchTasks(viewMode);
          if (targetStatus === "COMPLETED") { confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } }); toast.success("Selesai!"); }
          else toast.success(`Status → "${STATUS_LABELS[targetStatus]}"`);
        } catch { toast.error("Gagal mengubah status."); }
      }
    }
  };

  const taskItems = tasks as Task[];
  const filteredTasks = viewMode === "history" ? tasks :
    taskItems.filter(t =>
      (t.title?.toLowerCase().includes(search.toLowerCase()) || t.category?.toLowerCase().includes(search.toLowerCase())) &&
      (!showPrivateOnly || t.isPrivate) &&
      (!filterAssignee || t.assignee?.id === filterAssignee)
    );
  const goalTasks = taskItems.filter(t => t.isGoal);

  return (
    <div className="space-y-8 p-1">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-emerald-950 tracking-tighter">Agenda Keluarga</h1>
          <p className="text-emerald-700/60 font-medium mt-1">Kelola tugas harian demi mencapai Falah bersama.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* 364 Auto-archive */}
          <Button variant="outline" onClick={handleAutoArchive} disabled={isAutoArchiving}
            className="rounded-2xl h-11 border-slate-200 text-slate-600 hover:bg-slate-50 px-4 text-xs font-bold">
            <ArchiveX size={15} className="mr-2" /> {isAutoArchiving ? "Archiving..." : "Auto-archive"}
          </Button>
          {/* 368 PDF Agenda */}
          <Button variant="outline" onClick={handleAgendaExport}
            className="rounded-2xl h-11 border-slate-200 text-slate-600 hover:bg-slate-50 px-4 text-xs font-bold">
            <Printer size={15} className="mr-2" /> Agenda PDF
          </Button>
          {/* 351 iCal */}
          <Button variant="outline" onClick={exportCalendar}
            className="rounded-2xl h-11 border-emerald-100 text-emerald-700 hover:bg-emerald-50 px-4 text-xs font-bold">
            <Download size={15} className="mr-2" /> iCal
          </Button>
          {/* AI */}
          <Button onClick={fetchSuggestions} disabled={isSuggesting}
            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-2xl h-11 px-5 font-bold border border-emerald-200 shadow-sm text-xs">
            {isSuggesting ? <Circle size={14} className="mr-2 animate-spin" /> : <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />}
            Saran AI
          </Button>
          {/* 353 Templates */}
          <Button variant="outline" onClick={() => setIsTemplateOpen(true)}
            className="border-emerald-100 rounded-2xl px-5 font-black uppercase text-[10px] tracking-widest h-11 hover:bg-emerald-50 text-emerald-700">
            <FileText size={14} className="mr-2" /> Template
          </Button>
          <Button onClick={() => setIsCreateOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 rounded-2xl h-11 px-6 font-bold shadow-lg shadow-emerald-900/20 text-white group">
            <Plus size={18} className="mr-2 group-hover:rotate-90 transition-transform duration-300" /> Tugas Baru
          </Button>
        </div>
      </div>

      {/* ── AI Suggestions ── */}
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="bg-emerald-950 p-8 rounded-[40px] shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white text-xl font-black">Saran Amanah Barakah</h3>
              <Button variant="ghost" size="sm" onClick={() => setSuggestions([])} className="text-emerald-300 hover:text-white">Sembunyikan</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {suggestions.map((s, i) => (
                <div key={i} className="bg-white/10 p-5 rounded-3xl hover:bg-white/15 transition-all">
                  <Badge className="bg-emerald-500 text-white rounded-full text-[8px] font-black mb-3">{s.category}</Badge>
                  <h4 className="text-white font-bold mb-2">{s.title}</h4>
                  <p className="text-emerald-200/50 text-xs mb-4 line-clamp-2">{s.description}</p>
                  <Button onClick={() => adoptSuggestion(s)} className="w-full bg-white text-emerald-950 hover:bg-emerald-50 rounded-xl font-bold h-9 text-xs">Adopsi</Button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Search + Filters + Tabs ── */}
      <div className="bg-white p-3 rounded-[32px] border border-emerald-100 shadow-sm flex flex-col lg:flex-row items-start lg:items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-700/30" size={18} />
          <Input placeholder="Cari amanah keluarga..." className="pl-12 rounded-2xl border-none bg-emerald-50/30 h-12 focus-visible:ring-0 font-medium" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* 358 – Filter by Assignee */}
        <Select value={filterAssignee || "all"} onValueChange={v => setFilterAssignee(v === "all" ? "" : v)}>
          <SelectTrigger className="w-40 h-12 rounded-2xl bg-white border-emerald-100 font-bold text-xs shrink-0">
            <Filter size={14} className="mr-2 text-emerald-500" />
            <SelectValue placeholder="Filter Anggota" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            <SelectItem value="all">Semua Anggota</SelectItem>
            {familyMembers.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
          </SelectContent>
        </Select>

        {/* 359 – Private toggle */}
        <button onClick={() => setShowPrivateOnly(p => !p)}
          className={cn("flex items-center gap-2 h-12 px-4 rounded-2xl border text-xs font-bold transition-all shrink-0",
            showPrivateOnly ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-emerald-100 text-emerald-700 hover:bg-emerald-50")}>
          <Lock size={14} /> {showPrivateOnly ? "Privat" : "Semua"}
        </button>

        <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)} className="w-auto shrink-0">
          <TabsList className="bg-emerald-50/50 border border-emerald-100 p-1 rounded-2xl h-12 flex-nowrap overflow-x-auto">
            {[
              { v: "active", label: "Aktif" }, { v: "board", label: "Board" }, { v: "goals", label: "Goals" },
              { v: "leaderboard", label: "🏆" }, { v: "weekly", label: "Rutin" }, { v: "holiday", label: "🌴 Liburan" },
              { v: "shopping", label: "Belanja" }, { v: "history", label: "Audit" },
            ].map(({ v, label }) => (
              <TabsTrigger key={v} value={v} className="rounded-xl px-3 font-bold h-10 data-[state=active]:bg-white data-[state=active]:text-emerald-600 text-[10px] whitespace-nowrap">
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* ── Content ── */}
      <Tabs value={viewMode} className="w-full">

        {/* Active Tasks */}
        <TabsContent value="active" className="mt-0">
          {loading ? <LoaderAnimation /> : filteredTasks.length === 0 ? <EmptyState /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTasks.map(task => (
                <TaskCard key={task.id} task={task as Task} onClick={() => fetchTaskDetail(task.id)}
                  onToggle={() => toggleStatus(task.id, (task as Task).status)} bills={bills} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* 352 – Draggable Board */}
        <TabsContent value="board" className="mt-0">
          <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex gap-6 pb-6 overflow-x-auto">
              {STATUSES.map(status => {
                const colTasks = taskItems.filter(t => t.status === status);
                return (
                  <DroppableColumn key={status} status={status} label={STATUS_LABELS[status]}
                    colorClass={STATUS_COLORS[status]} tasks={colTasks}
                    onTaskClick={fetchTaskDetail} onToggle={toggleStatus} bills={bills} />
                );
              })}
            </div>
            <DragOverlay>
              {activeTask && (
                <div className="rotate-2 scale-105 shadow-2xl rounded-[28px] opacity-90">
                  <TaskCard task={activeTask} onClick={() => {}} onToggle={() => {}} bills={bills} compact />
                </div>
              )}
            </DragOverlay>
          </DndContext>
          <p className="text-center text-[11px] text-slate-400 font-medium mt-2">💡 Drag kartu ke kolom lain untuk ubah status</p>
        </TabsContent>

        {/* 350 – Family Goals */}
        <TabsContent value="goals" className="mt-0">
          {goalTasks.length === 0 ? (
            <div className="text-center py-24 bg-linear-to-b from-emerald-950 to-emerald-900 rounded-[40px]">
              <Target size={56} className="text-emerald-600 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-white">Belum Ada Goal Keluarga</h3>
              <p className="text-emerald-300/60 text-sm mt-2 mb-8">Centang "Goal Keluarga" saat membuat tugas.</p>
              <Button onClick={() => { setNewTask(n => ({ ...n, isGoal: true })); setIsCreateOpen(true); }}
                className="bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl px-8 h-12 font-bold">
                <Plus size={18} className="mr-2" /> Buat Goal
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {goalTasks.map(task => (
                <FamilyGoalCard key={task.id} task={task} onClick={() => fetchTaskDetail(task.id)}
                  onProgressUpdate={updateGoalProgress} familyMembers={familyMembers} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* 356 – Task Leaderboard */}
        <TabsContent value="leaderboard" className="mt-0">
          <div className="space-y-4">
            <div className="bg-linear-to-br from-emerald-950 via-emerald-900 to-emerald-800 p-8 rounded-[40px] text-white mb-8 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <Trophy size={28} className="text-amber-400" />
                  <h2 className="text-2xl font-black">Papan Barakah</h2>
                </div>
                <p className="text-emerald-300/60 text-sm">Siapa yang paling rajin menyelesaikan amanah minggu ini?</p>
              </div>
            </div>
            {leaderboard.map((member, i) => (
              <motion.div key={member.id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.06 }}
                className={cn("rounded-[28px] p-5 border flex items-center gap-5 transition-all",
                  i === 0 ? "bg-linear-to-r from-amber-50 to-amber-100/50 border-amber-200 shadow-lg shadow-amber-100"
                  : i === 1 ? "bg-linear-to-r from-slate-50 to-slate-100/50 border-slate-200"
                  : i === 2 ? "bg-linear-to-r from-orange-50/50 to-orange-100/30 border-orange-100"
                  : "bg-white border-slate-100")}>
                <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg shrink-0",
                  i === 0 ? "bg-amber-400 text-white" : i === 1 ? "bg-slate-300 text-white" : i === 2 ? "bg-orange-300 text-white" : "bg-slate-100 text-slate-500")}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 overflow-hidden shrink-0">
                  {member.image ? <img src={member.image} alt="" className="w-full h-full object-cover" /> : <UserIcon size={18} className="m-auto mt-2 text-emerald-600" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-black text-emerald-950">{member.name}</p>
                    <Badge className="text-[8px] rounded-full bg-emerald-50 text-emerald-600 border-none font-black">{member.role}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold">
                    <span>✅ {member.completed} selesai</span>
                    <span>·</span>
                    <span>📅 {member.thisWeek} minggu ini</span>
                    <span>·</span>
                    <span>{member.completionRate}% rate</span>
                  </div>
                  <div className="mt-2">
                    <Progress value={member.completionRate} className="h-1.5 bg-slate-100" />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-2xl font-black text-emerald-700">{member.points}</p>
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">poin</p>
                </div>
              </motion.div>
            ))}
            {leaderboard.length === 0 && <EmptyState />}
          </div>
        </TabsContent>

        {/* 361 – Weekly Routine */}
        <TabsContent value="weekly" className="mt-0">
          <div className="space-y-8">
            {weeklyData ? (
              <>
                <div className="bg-linear-to-r from-emerald-950 to-emerald-800 p-6 rounded-[32px] text-white">
                  <div className="flex items-center gap-3 mb-1">
                    <Repeat size={20} className="text-emerald-400" />
                    <h2 className="text-xl font-black">Rutinitas Mingguan</h2>
                  </div>
                  <p className="text-emerald-300/60 text-xs">
                    {new Date(weeklyData.weekStart).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })} – {new Date(weeklyData.weekEnd).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                </div>

                {weeklyData.recurring?.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800/40 mb-4">🔁 Tugas Berulang</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {weeklyData.recurring.map((t: Task) => (
                        <TaskCard key={t.id} task={t} onClick={() => fetchTaskDetail(t.id)} onToggle={() => toggleStatus(t.id, t.status)} bills={bills} compact />
                      ))}
                    </div>
                  </div>
                )}

                {weeklyData.dueThisWeek?.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800/40 mb-4">📅 Jatuh Tempo Minggu Ini</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {weeklyData.dueThisWeek.map((t: Task) => (
                        <TaskCard key={t.id} task={t} onClick={() => fetchTaskDetail(t.id)} onToggle={() => toggleStatus(t.id, t.status)} bills={bills} compact />
                      ))}
                    </div>
                  </div>
                )}

                {!weeklyData.recurring?.length && !weeklyData.dueThisWeek?.length && <EmptyState />}
              </>
            ) : <LoaderAnimation />}
          </div>
        </TabsContent>

        {/* 362 – Holiday Planner */}
        <TabsContent value="holiday" className="mt-0">
          <div className="space-y-6">
            <div className="bg-linear-to-br from-cyan-600 to-blue-700 p-8 rounded-[40px] text-white relative overflow-hidden">
              <div className="absolute -bottom-8 -right-8 text-[120px] opacity-10">🌴</div>
              <Palmtree size={32} className="text-cyan-200 mb-3" />
              <h2 className="text-2xl font-black mb-1">Rencana Liburan Keluarga</h2>
              <p className="text-cyan-200/70 text-sm">Atur persiapan dan checklist perjalanan keluarga.</p>
              <Button onClick={() => { setNewTask(n => ({ ...n, category: "Lainnya" })); setIsCreateOpen(true); }}
                className="mt-5 bg-white text-blue-700 hover:bg-blue-50 rounded-2xl h-11 font-bold px-6 text-sm">
                <Plus size={16} className="mr-2" /> Tambah Rencana
              </Button>
            </div>
            {holidayTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {holidayTasks.map(task => (
                  <Card key={task.id} onClick={() => fetchTaskDetail(task.id)}
                    className="rounded-[32px] border-blue-100 p-6 cursor-pointer hover:shadow-xl hover:shadow-blue-900/5 transition-all group">
                    <CardContent className="p-0">
                      <div className="flex justify-between items-start mb-4">
                        <Badge className="bg-blue-50 text-blue-700 border-none text-[9px] font-black rounded-full">
                          {task.holidayDate ? new Date(task.holidayDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "Tanggal belum diset"}
                        </Badge>
                        <PriorityBadge priority={task.priority} />
                      </div>
                      <h3 className="text-xl font-black text-emerald-950 mb-2 group-hover:text-blue-700 transition-colors">{task.title}</h3>
                      <p className="text-xs text-slate-500 mb-4 line-clamp-2">{task.description}</p>
                      {task.checklists && task.checklists.length > 0 && (
                        <div className="mb-4">
                          <div className="flex justify-between text-[9px] font-black uppercase text-slate-400 mb-1">
                            <span>Checklist Persiapan</span>
                            <span>{task.checklists.filter(c => c.isDone).length}/{task.checklists.length}</span>
                          </div>
                          <Progress value={(task.checklists.filter(c => c.isDone).length / task.checklists.length) * 100} className="h-2 bg-blue-50" />
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                        {task.assignee && (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-xl bg-blue-50 flex items-center justify-center overflow-hidden">
                              {task.assignee.image ? <img src={task.assignee.image} alt="" className="w-full h-full object-cover" /> : <UserIcon size={12} className="text-blue-500" />}
                            </div>
                            <span className="text-[9px] font-bold text-slate-500">{task.assignee.name}</span>
                          </div>
                        )}
                        <button onClick={e => { e.stopPropagation(); toggleStatus(task.id, task.status); }}
                          className={cn("w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                            task.status === "COMPLETED" ? "bg-emerald-500 text-white" : "bg-blue-50 text-blue-300 hover:text-blue-600")}>
                          <CheckCircle size={16} />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border-2 border-dashed border-blue-100 rounded-[32px]">
                <span className="text-6xl">🏖️</span>
                <h3 className="text-lg font-black text-slate-700 mt-4">Belum ada rencana liburan</h3>
                <p className="text-slate-400 text-sm mt-1">Tambahkan tanggal liburan saat membuat tugas baru.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Shopping */}
        <TabsContent value="shopping" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {taskItems.filter(t => t.category?.toLowerCase() === "belanja").map(task => (
              <Card key={task.id} className="rounded-[32px] border-emerald-100 p-6 bg-white hover:shadow-lg transition-all">
                <div className="flex justify-between items-start gap-3 mb-4">
                  <div>
                    <h4 className="font-bold text-emerald-950">{task.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-1">{task.description || "Daftar belanja keluarga"}</p>
                  </div>
                  <PriorityBadge priority={task.priority} />
                </div>
                <div className="space-y-2 mb-4">
                  {task.checklists?.map(item => (
                    <button key={item.id} onClick={() => { /* handled in detail */ }}
                      className="w-full flex items-center gap-3 rounded-3xl border px-4 py-2.5 text-left transition hover:border-emerald-200">
                      <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center", item.isDone ? "bg-emerald-500 border-emerald-500" : "border-slate-300")}>
                        {item.isDone && <CheckCircle size={10} className="text-white" />}
                      </div>
                      <span className={cn("text-sm font-medium", item.isDone ? "line-through text-slate-400" : "text-slate-700")}>{item.title}</span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => fetchTaskDetail(task.id)} variant="ghost" className="flex-1 rounded-2xl text-xs font-black uppercase text-emerald-700 bg-emerald-50">Detail</Button>
                  <Button onClick={() => toggleStatus(task.id, task.status)} className="flex-1 rounded-2xl bg-emerald-600 text-white text-xs font-black uppercase hover:bg-emerald-700">Selesai</Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="mt-0">
          <div className="space-y-3">
            {tasks.length === 0 ? <EmptyState /> : tasks.map((entry: any) => (
              <Card key={entry.id} className="rounded-[28px] border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="mt-1 rounded-2xl bg-emerald-50 p-3"><CheckCircle2 size={18} className="text-emerald-500" /></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <div>
                        <h5 className="text-sm font-black text-emerald-950">{entry.action.replace(/TASK_/g, "").replaceAll("_", " ")}</h5>
                        <p className="text-[10px] uppercase text-slate-400 tracking-[0.2em]">
                          {new Date(entry.createdAt).toLocaleDateString("id-ID")} · {new Date(entry.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <Badge variant="outline" className="rounded-full text-[10px]">{entry.user?.name || "Sistem"}</Badge>
                    </div>
                    <p className="text-sm text-slate-600">{entry.details || "Tidak ada detail."}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* ══ Create Task Dialog ══════════════════════════════════════════════ */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg rounded-[40px] border-emerald-100 p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-emerald-950 tracking-tight">Amanah Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input placeholder="Judul Amanah*" className="h-14 rounded-2xl bg-emerald-50/50 border-emerald-100 focus-visible:ring-emerald-500 font-bold"
              value={newTask.title} onChange={e => setNewTask(n => ({ ...n, title: e.target.value }))} />
            <textarea placeholder="Deskripsi..." className="w-full h-16 rounded-2xl bg-emerald-50/50 border border-emerald-100 focus:ring-2 focus:ring-emerald-300 p-4 text-sm font-medium resize-none outline-none"
              value={newTask.description} onChange={e => setNewTask(n => ({ ...n, description: e.target.value }))} />

            <div className="grid grid-cols-2 gap-3">
              <Select value={newTask.category} onValueChange={v => setNewTask(n => ({ ...n, category: v }))}>
                <SelectTrigger className="h-12 rounded-2xl bg-white border-emerald-100 font-bold text-xs"><SelectValue placeholder="Kategori" /></SelectTrigger>
                <SelectContent className="rounded-2xl">{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={newTask.priority} onValueChange={v => setNewTask(n => ({ ...n, priority: v }))}>
                <SelectTrigger className="h-12 rounded-2xl bg-white border-emerald-100 font-bold text-xs"><SelectValue placeholder="Prioritas" /></SelectTrigger>
                <SelectContent className="rounded-2xl">{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Select value={newTask.assigneeId || "none"} onValueChange={v => setNewTask(n => ({ ...n, assigneeId: v === "none" ? "" : v }))}>
                <SelectTrigger className="h-12 rounded-2xl bg-white border-emerald-100 font-bold text-xs"><SelectValue placeholder="Assign Ke..." /></SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="none">Siapa saja</SelectItem>
                  {familyMembers.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input type="date" className="h-12 rounded-2xl bg-white border-emerald-100 font-bold text-xs"
                value={newTask.dueDate} onChange={e => setNewTask(n => ({ ...n, dueDate: e.target.value }))} />
            </div>

            {/* 360 – Estimation */}
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <Clock size={18} className="text-slate-400 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-black text-slate-700">Estimasi Waktu (menit)</p>
                <Input type="number" min={0} max={10080} placeholder="0 = tidak ada estimasi"
                  className="h-9 rounded-xl border-none bg-transparent p-0 font-medium text-sm focus-visible:ring-0 mt-1"
                  value={newTask.estimatedMinutes || ""} onChange={e => setNewTask(n => ({ ...n, estimatedMinutes: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>

            {/* 361 – Recurring */}
            <Select value={newTask.recurringType || "none"} onValueChange={v => setNewTask(n => ({ ...n, recurringType: v === "none" ? "" : v }))}>
              <SelectTrigger className="h-12 rounded-2xl bg-white border-emerald-100 font-bold text-xs"><Repeat size={14} className="mr-2 text-emerald-500" /><SelectValue placeholder="Pengulangan" /></SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="none">Tidak berulang</SelectItem>
                {RECURRING_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* 362 – Holiday Date */}
            <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
              <Palmtree size={18} className="text-blue-400 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-black text-blue-700">Tanggal Liburan (opsional)</p>
                <Input type="date" className="h-9 rounded-xl border-none bg-transparent p-0 text-sm focus-visible:ring-0 mt-1"
                  value={newTask.holidayDate} onChange={e => setNewTask(n => ({ ...n, holidayDate: e.target.value }))} />
              </div>
            </div>

            {/* 363 – Dependencies */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-xs font-black text-slate-700 mb-2 flex items-center gap-2"><Link2 size={14} /> Bergantung pada Tugas (Opsional)</p>
              <Select value={newTask.dependencyIds[0] || "none"} onValueChange={v => setNewTask(n => ({ ...n, dependencyIds: v === "none" ? [] : [v] }))}>
                <SelectTrigger className="h-10 rounded-xl bg-white border-slate-200 text-xs font-bold"><SelectValue placeholder="Pilih tugas prasyarat..." /></SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="none">Tidak ada prasyarat</SelectItem>
                  {taskItems.slice(0, 30).map(t => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* 366 – Color Coding */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-xs font-black text-slate-700 mb-3">Warna Identifikasi</p>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setNewTask(n => ({ ...n, color: "" }))}
                  className={cn("w-8 h-8 rounded-full border-2 transition-all bg-white", !newTask.color ? "border-emerald-500 scale-110" : "border-slate-200")}>
                  <span className="text-[10px]">✕</span>
                </button>
                {TASK_COLORS.map(c => (
                  <button key={c.value} onClick={() => setNewTask(n => ({ ...n, color: c.value }))}
                    className={cn("w-8 h-8 rounded-full border-2 transition-all", newTask.color === c.value ? "border-slate-900 scale-110 shadow-lg" : "border-transparent")}
                    style={{ backgroundColor: c.value }} title={c.label} />
                ))}
              </div>
            </div>

            {/* Feature toggles */}
            <div className="grid grid-cols-2 gap-3">
              {/* 350 Goal */}
              <button onClick={() => setNewTask(n => ({ ...n, isGoal: !n.isGoal }))}
                className={cn("flex items-center gap-2 p-4 rounded-2xl border text-left transition-all",
                  newTask.isGoal ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-emerald-100 hover:border-emerald-300")}>
                <Target size={18} className={newTask.isGoal ? "text-white" : "text-slate-300"} />
                <div>
                  <p className="text-xs font-black">Goal Keluarga</p>
                  <p className="text-[9px] opacity-60">Progress kolektif</p>
                </div>
              </button>
              {/* 359 Private */}
              <button onClick={() => setNewTask(n => ({ ...n, isPrivate: !n.isPrivate }))}
                className={cn("flex items-center gap-2 p-4 rounded-2xl border text-left transition-all",
                  newTask.isPrivate ? "bg-slate-800 border-slate-800 text-white" : "bg-white border-slate-100 hover:border-slate-300")}>
                <Lock size={18} className={newTask.isPrivate ? "text-white" : "text-slate-300"} />
                <div>
                  <p className="text-xs font-black">Tugas Privat</p>
                  <p className="text-[9px] opacity-60">Hanya terlihat olehmu</p>
                </div>
              </button>
            </div>
          </div>
          <Button onClick={handleCreate} className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl">
            Bagikan Amanah
          </Button>
        </DialogContent>
      </Dialog>

      {/* ══ Task Detail Dialog ══════════════════════════════════════════════ */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl rounded-[40px] p-0 overflow-hidden border-emerald-100 h-[90vh] flex flex-col shadow-2xl">
          {selectedTask && (
            <>
              {/* Header */}
              <div className="p-7 border-b border-emerald-100 shrink-0" style={{ backgroundColor: selectedTask.color ? `${selectedTask.color}15` : "#f0fdf4" }}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="rounded-full bg-white border-emerald-100 text-emerald-700 text-[9px] font-black uppercase px-3">
                      {selectedTask.category}
                    </Badge>
                    {selectedTask.isPrivate && <Badge className="rounded-full bg-slate-900 text-white border-none text-[8px] font-black"><Lock size={8} className="mr-1" />Privat</Badge>}
                    {selectedTask.recurringType && <Badge className="rounded-full bg-blue-100 text-blue-700 border-none text-[8px] font-black"><Repeat size={8} className="mr-1" />{selectedTask.recurringType}</Badge>}
                    {selectedTask.color && <div className="w-4 h-4 rounded-full border-2 border-white shadow" style={{ backgroundColor: selectedTask.color }} />}
                  </div>
                  <PriorityBadge priority={selectedTask.priority} />
                </div>
                <h2 className="text-2xl font-black text-emerald-950 tracking-tight mb-4">{selectedTask.title}</h2>

                <div className="flex items-center gap-4 flex-wrap">
                  {selectedTask.assignee && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-white border border-emerald-100 flex items-center justify-center overflow-hidden shadow-sm">
                        {selectedTask.assignee.image ? <img src={selectedTask.assignee.image} alt="" className="w-full h-full object-cover" /> : <UserIcon size={14} className="text-emerald-300" />}
                      </div>
                      <div>
                        <p className="text-[8px] font-black uppercase text-emerald-800/40">Penerima</p>
                        <p className="text-xs font-bold text-emerald-900">{selectedTask.assignee.name}</p>
                      </div>
                    </div>
                  )}
                  {/* 360 Estimation display */}
                  {selectedTask.estimatedMinutes && (
                    <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-xl border border-white shadow-sm">
                      <Clock size={13} className="text-blue-500" />
                      <span className="text-xs font-black text-slate-700">
                        {selectedTask.estimatedMinutes >= 60
                          ? `${Math.floor(selectedTask.estimatedMinutes / 60)}j ${selectedTask.estimatedMinutes % 60}m`
                          : `${selectedTask.estimatedMinutes}m`}
                      </span>
                    </div>
                  )}
                  {selectedTask.lastEditedAt && (
                    <div className="flex items-center gap-1.5 border-l border-emerald-100 pl-4">
                      <Edit2 size={13} className="text-emerald-400" />
                      <p className="text-[10px] font-bold text-slate-500">
                        Edit: {new Date(selectedTask.lastEditedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  )}
                  {/* 365 Print Checklist */}
                  {(selectedTask.checklists?.length ?? 0) > 0 && (
                    <button onClick={() => printChecklist(selectedTask)}
                      className="flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-400 hover:text-emerald-600 transition-colors ml-auto">
                      <Printer size={13} /> Cetak
                    </button>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-7 space-y-7 bg-white">

                {/* 363 – Dependencies */}
                {selectedTask.dependencies && selectedTask.dependencies.length > 0 && (
                  <div className="p-4 bg-amber-50 rounded-[24px] border border-amber-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Link2 size={14} className="text-amber-600" />
                      <p className="text-xs font-black text-amber-700 uppercase tracking-widest">Prasyarat Tugas</p>
                    </div>
                    <div className="space-y-2">
                      {selectedTask.dependencies.map(dep => (
                        <div key={dep.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-amber-100">
                          <div className={cn("w-2 h-2 rounded-full shrink-0", dep.status === "COMPLETED" ? "bg-emerald-500" : "bg-amber-400")} />
                          <span className="text-sm font-medium text-slate-700 flex-1">{dep.title}</span>
                          <Badge className={cn("text-[8px] font-black rounded-full border-none",
                            dep.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                            {dep.status === "COMPLETED" ? "✓ Selesai" : "Belum Selesai"}
                          </Badge>
                          {dep.status !== "COMPLETED" && <AlertTriangle size={14} className="text-amber-400" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 350 Goal Progress */}
                {selectedTask.isGoal && (
                  <div className="p-6 bg-linear-to-br from-emerald-950 to-emerald-900 rounded-[28px] text-white">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <Target size={15} className="text-emerald-400" />
                        <p className="text-xs font-black uppercase tracking-widest text-emerald-400">Goal Progress</p>
                      </div>
                      <span className="text-2xl font-black">{selectedTask.goalProgress ?? 0}%</span>
                    </div>
                    <Progress value={selectedTask.goalProgress ?? 0} className="h-2.5 bg-white/10 mb-4" />
                    <div className="grid grid-cols-5 gap-1.5">
                      {[0, 25, 50, 75, 100].map(p => (
                        <Button key={p} variant="ghost" size="sm" onClick={() => updateGoalProgress(selectedTask.id, p)}
                          className={cn("text-[10px] font-black h-8 rounded-xl transition-all",
                            (selectedTask.goalProgress ?? 0) === p ? "bg-emerald-500 text-white" : "text-emerald-400 hover:bg-white/10")}>
                          {p}%
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Collaborative Description */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-emerald-800/40">Deskripsi</label>
                    {!editingDesc ? (
                      <button onClick={() => { setDescDraft(selectedTask.description ?? ""); setEditingDesc(true); }}
                        className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-600 hover:text-emerald-800">
                        <Edit2 size={11} /> Edit
                      </button>
                    ) : (
                      <div className="flex gap-3">
                        <button onClick={() => setEditingDesc(false)} className="text-[10px] font-black text-slate-400 hover:text-slate-600">Batal</button>
                        <button onClick={saveDescription} disabled={isSavingDesc} className="text-[10px] font-black text-emerald-600 disabled:opacity-50">{isSavingDesc ? "Menyimpan..." : "Simpan"}</button>
                      </div>
                    )}
                  </div>
                  {editingDesc ? (
                    <textarea value={descDraft} onChange={e => setDescDraft(e.target.value)} autoFocus
                      className="w-full min-h-[80px] text-sm p-4 rounded-[20px] bg-emerald-50 border border-emerald-200 focus:ring-2 focus:ring-emerald-300 resize-none outline-none font-medium" />
                  ) : (
                    <div onClick={() => { setDescDraft(selectedTask.description ?? ""); setEditingDesc(true); }}
                      className="text-sm text-slate-600 bg-emerald-50/30 p-4 rounded-[20px] border border-emerald-100/50 cursor-text hover:border-emerald-200 hover:bg-emerald-50 min-h-[48px] font-medium">
                      {selectedTask.description || <span className="text-slate-300 italic">Klik untuk menambah deskripsi...</span>}
                    </div>
                  )}
                </div>

                {/* 357 – Sub-tasks */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-emerald-800/40">
                      Sub-Amanah ({selectedTask.subTasks?.length ?? 0})
                    </label>
                  </div>
                  {selectedTask.subTasks?.map(st => (
                    <div key={st.id} className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                      <button onClick={() => toggleStatus(st.id, st.status)}
                        className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 transition-all",
                          st.status === "COMPLETED" ? "bg-emerald-500 border-emerald-500" : "border-slate-300 hover:border-emerald-400")}>
                        {st.status === "COMPLETED" && <CheckCircle size={11} className="text-white" />}
                      </button>
                      <span className={cn("text-sm font-medium flex-1", st.status === "COMPLETED" ? "line-through text-slate-400" : "text-slate-700")}>{st.title}</span>
                      {st.assignee && <span className="text-[9px] font-bold text-slate-400">{st.assignee.name}</span>}
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input placeholder="Tambah sub-tugas..." value={subTaskInput} onChange={e => setSubTaskInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && addSubTask()}
                      className="rounded-xl border-slate-100 text-sm h-10 bg-slate-50" />
                    <Button onClick={addSubTask} disabled={isAddingSubTask} size="sm" className="h-10 rounded-xl bg-emerald-600 text-white px-4">
                      {isAddingSubTask ? <Circle size={14} className="animate-spin" /> : <Plus size={16} />}
                    </Button>
                  </div>
                </div>

                {/* Checklist */}
                {(selectedTask.checklists?.length ?? 0) > 0 && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-emerald-800/40">
                      Checklist ({selectedTask.checklists?.filter(c => c.isDone).length}/{selectedTask.checklists?.length})
                    </label>
                    {selectedTask.checklists?.map(item => (
                      <button key={item.id} onClick={() => toggleChecklistItem(item)}
                        className="w-full flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition hover:border-emerald-200 bg-white">
                        <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                          item.isDone ? "bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-200" : "border-slate-200")}>
                          {item.isDone && <CheckCircle size={11} className="text-white" />}
                        </div>
                        <span className={cn("text-sm font-medium", item.isDone ? "line-through text-slate-400" : "text-slate-700")}>{item.title}</span>
                      </button>
                    ))}
                    <div className="flex gap-2">
                      <Input placeholder="Tambah checklist..." value={checklistInput} onChange={e => setChecklistInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && addChecklistItem()}
                        className="rounded-xl border-slate-100 h-10 text-sm" />
                      <Button onClick={addChecklistItem} size="sm" className="h-10 rounded-xl bg-emerald-600 text-white px-4"><Plus size={16} /></Button>
                    </div>
                  </div>
                )}

                {/* Attachments */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-emerald-800/40">
                      Bukti Pengerjaan ({selectedTask.attachments?.length ?? 0})
                    </label>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-emerald-600 font-bold text-xs h-7"><Plus size={11} className="mr-1" />URL</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-sm rounded-[28px]">
                          <DialogHeader><DialogTitle>Tambah Lampiran via URL</DialogTitle></DialogHeader>
                          <div className="space-y-3 py-4">
                            <Input placeholder="https://..." value={attachmentUrl} onChange={e => setAttachmentUrl(e.target.value)} className="rounded-xl" />
                            <Input placeholder="Nama foto" value={attachmentName} onChange={e => setAttachmentName(e.target.value)} className="rounded-xl" />
                            <Button onClick={addAttachment} className="w-full bg-emerald-600 rounded-xl">Simpan</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploadingFile}
                        className="text-emerald-600 font-bold text-xs h-7">
                        {isUploadingFile ? <Circle size={11} className="animate-spin mr-1" /> : <Upload size={11} className="mr-1" />}Upload
                      </Button>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = ""; }} />
                    </div>
                  </div>
                  {(selectedTask.attachments?.length ?? 0) > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {selectedTask.attachments?.map(a => (
                        <div key={a.id} className="relative aspect-square rounded-2xl overflow-hidden border border-emerald-100 group bg-slate-50">
                          <img src={a.url} alt={a.name} className="w-full h-full object-cover"
                            onError={e => { (e.target as any).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23d1d5db' viewBox='0 0 24 24'%3E%3Cpath d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-1 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/%3E%3C/svg%3E"; }} />
                          <div className="absolute inset-0 bg-emerald-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                            <p className="text-white text-[8px] font-black text-center px-2">{a.name}</p>
                            <button onClick={() => deleteAttachment(a.id)} className="p-1.5 bg-white/20 hover:bg-rose-500 text-white rounded-full"><Trash2 size={12} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-emerald-100 rounded-2xl h-24 flex flex-col items-center justify-center text-emerald-300 cursor-pointer hover:border-emerald-400 hover:text-emerald-500 transition-all">
                      <ImageIcon size={24} className="mb-1" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Klik atau upload foto</span>
                    </div>
                  )}
                </div>

                {/* Comments */}
                <div className="space-y-3 pb-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-emerald-800/40">
                    Diskusi ({selectedTask.comments?.length ?? 0})
                  </label>
                  <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                    {selectedTask.comments?.map(c => (
                      <div key={c.id} className="flex gap-3">
                        <div className="w-7 h-7 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                          {c.user.image ? <img src={c.user.image} alt="" className="w-full h-full object-cover" /> : <UserIcon size={13} className="m-auto mt-1.5 text-slate-400" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-black text-emerald-950 uppercase">{c.user.name}</span>
                            <span className="text-[8px] text-slate-300">{new Date(c.createdAt).toLocaleDateString("id-ID")}</span>
                          </div>
                          <p className="text-xs text-slate-600 font-medium">{c.content}</p>
                        </div>
                      </div>
                    ))}
                    {!selectedTask.comments?.length && <p className="text-xs text-slate-400 text-center py-3">Belum ada diskusi.</p>}
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Tulis komentar..." className="rounded-2xl bg-slate-50 border-none h-11 text-sm"
                      value={commentInput} onChange={e => setCommentInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && addComment()} />
                    <Button onClick={addComment} className="h-11 w-11 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700"><Plus size={18} /></Button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 bg-white border-t border-slate-100 flex gap-3 shrink-0">
                <Button onClick={() => toggleStatus(selectedTask.id, selectedTask.status)}
                  className={cn("flex-1 h-13 rounded-[18px] font-black uppercase tracking-widest shadow-xl",
                    selectedTask.status === "COMPLETED" ? "bg-slate-100 text-slate-400 hover:bg-slate-200" : "bg-emerald-600 text-white hover:bg-emerald-700")}>
                  {selectedTask.status === "COMPLETED" ? "Aktifkan Kembali" : "Selesaikan Amanah"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ══ Template Modal ══════════════════════════════════════════════════ */}
      <Dialog open={isTemplateOpen} onOpenChange={setIsTemplateOpen}>
        <DialogContent className="max-w-sm rounded-[40px] border-emerald-100 p-8 shadow-2xl">
          <DialogHeader><DialogTitle className="text-2xl font-black text-emerald-950">Pilih Template</DialogTitle></DialogHeader>
          <p className="text-xs text-slate-500 -mt-1">Terapkan tugas instan sesuai kebutuhan keluarga.</p>
          <div className="space-y-3 py-4">
            {TEMPLATES.map(t => (
              <button key={t.key} onClick={() => applyTemplate(t.key)}
                className="w-full flex items-center gap-4 p-5 bg-emerald-50/50 rounded-[22px] border border-emerald-100 hover:border-emerald-400 hover:bg-emerald-50 transition-all group text-left">
                <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-100 flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">{t.icon}</div>
                <div>
                  <p className="text-sm font-black text-emerald-950">{t.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{t.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Droppable Column ──────────────────────────────────────────────────────────
function DroppableColumn({ status, label, colorClass, tasks, onTaskClick, onToggle, bills }: {
  status: TaskStatus; label: string; colorClass: string; tasks: Task[];
  onTaskClick: (id: string) => void; onToggle: (id: string, s: string) => void; bills: BillSummary[];
}) {
  const { setNodeRef, isOver } = useSortable({ id: status, data: { type: "column" } });
  return (
    <div ref={setNodeRef} className={cn("w-72 flex flex-col min-h-[500px] rounded-[36px] border p-5 transition-all duration-200", colorClass, isOver && "scale-[1.02] shadow-2xl border-emerald-300")}>
      <div className="flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", status === "PENDING" && "bg-slate-400", status === "IN_PROGRESS" && "bg-amber-400", status === "COMPLETED" && "bg-emerald-500")} />
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</h4>
        </div>
        <Badge variant="outline" className="rounded-full bg-white text-slate-400 border-slate-100 font-bold text-[10px]">{tasks.length}</Badge>
      </div>
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-3 overflow-y-auto pr-1 max-h-[65vh]">
          {tasks.map(task => <DraggableTaskCard key={task.id} task={task} onClick={() => onTaskClick(task.id)} onToggle={() => onToggle(task.id, task.status)} bills={bills} />)}
          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-100 rounded-3xl text-slate-300">
              <GripVertical size={20} className="mb-1" />
              <p className="text-[9px] font-black uppercase tracking-widest">Drop di sini</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// ── Draggable Task Card ───────────────────────────────────────────────────────
function DraggableTaskCard({ task, onClick, onToggle, bills }: { task: Task; onClick: () => void; onToggle: () => void; bills: BillSummary[]; }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id, data: { type: "task", task } });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.3 : 1 };
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card className={cn("rounded-[24px] border-emerald-50 shadow-sm cursor-pointer hover:shadow-lg transition-all bg-white", isDragging && "ring-2 ring-emerald-400", task.color && `border-l-4`)}
        style={task.color ? { borderLeftColor: task.color } : {}}>
        <CardContent className="p-4">
          <div className="flex items-start gap-2 mb-3">
            <button {...listeners} className="mt-0.5 text-slate-200 hover:text-slate-400 cursor-grab active:cursor-grabbing touch-none"><GripVertical size={15} /></button>
            <div className="flex-1 min-w-0" onClick={onClick}>
              <div className="flex justify-between items-start mb-1.5">
                <div className="flex items-center gap-1">
                  {task.isPrivate && <Lock size={10} className="text-slate-400" />}
                  <Badge className="bg-emerald-50 text-emerald-700 border-none text-[8px] rounded-full">{task.category}</Badge>
                </div>
                <PriorityBadge priority={task.priority} />
              </div>
              <h5 className="font-bold text-sm text-emerald-950 leading-tight line-clamp-2">{task.title}</h5>
              {task.estimatedMinutes && (
                <p className="text-[9px] text-slate-400 font-bold mt-1 flex items-center gap-1"><Clock size={9} /> {task.estimatedMinutes}m</p>
              )}
              {task.isGoal && <Progress value={task.goalProgress ?? 0} className="h-1.5 bg-emerald-100 mt-2" />}
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-slate-50 pt-2 ml-6">
            {task.assignee ? (
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden">
                  {task.assignee.image ? <img src={task.assignee.image} alt="" className="w-full h-full object-cover" /> : <UserIcon size={10} className="text-emerald-600" />}
                </div>
                <span className="text-[9px] font-bold text-slate-400">{task.assignee.name}</span>
              </div>
            ) : <div />}
            <button onClick={e => { e.stopPropagation(); onToggle(); }}
              className={cn("w-6 h-6 rounded-full flex items-center justify-center transition-all", task.status === "COMPLETED" ? "bg-emerald-500 text-white" : "bg-emerald-50 text-emerald-300 hover:text-emerald-600")}>
              <CheckCircle size={14} />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Family Goal Card ──────────────────────────────────────────────────────────
function FamilyGoalCard({ task, onClick, onProgressUpdate, familyMembers }: {
  task: Task; onClick: () => void; onProgressUpdate: (id: string, p: number) => void; familyMembers: UserSummary[];
}) {
  const progress = task.goalProgress ?? 0;
  const isComplete = progress === 100;
  return (
    <motion.div whileHover={{ scale: 1.01 }} onClick={onClick}
      className={cn("rounded-[36px] p-8 cursor-pointer border transition-all overflow-hidden relative",
        isComplete ? "bg-linear-to-br from-emerald-600 to-emerald-700 border-emerald-500" : "bg-white border-emerald-100 hover:shadow-xl")}>
      {isComplete && <div className="absolute top-4 right-4"><Star size={24} className="text-white/50 fill-white/20" /></div>}
      <div className="flex justify-between items-start mb-5">
        <Badge className={cn("rounded-full text-[9px] font-black px-3", isComplete ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-700 border-none")}>{task.category}</Badge>
        <div className={cn("flex items-center gap-1.5 text-xs font-black", isComplete ? "text-white" : "text-emerald-600")}><Target size={14} />Goal</div>
      </div>
      <h3 className={cn("text-xl font-black tracking-tight mb-5", isComplete ? "text-white" : "text-emerald-950")}>{task.title}</h3>
      <div className="mb-5">
        <div className="flex justify-between mb-2">
          <span className={cn("text-[10px] font-black uppercase tracking-widest", isComplete ? "text-white/60" : "text-slate-400")}>Progress Kolektif</span>
          <span className={cn("text-2xl font-black tabular-nums", isComplete ? "text-white" : "text-emerald-700")}>{progress}%</span>
        </div>
        <div className={cn("w-full rounded-full h-3 overflow-hidden", isComplete ? "bg-white/20" : "bg-emerald-50")}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
            className={cn("h-full rounded-full", isComplete ? "bg-white" : "bg-emerald-500 shadow-lg shadow-emerald-300")} />
        </div>
      </div>
      <div className="grid grid-cols-5 gap-1" onClick={e => e.stopPropagation()}>
        {[0, 25, 50, 75, 100].map(p => (
          <button key={p} onClick={() => onProgressUpdate(task.id, p)}
            className={cn("text-[9px] font-black h-7 rounded-xl transition-all",
              isComplete ? progress === p ? "bg-white text-emerald-700" : "bg-white/10 text-white/60 hover:bg-white/20"
              : progress === p ? "bg-emerald-600 text-white shadow-lg" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100")}>
            {p}%
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ── Task Card ─────────────────────────────────────────────────────────────────
function TaskCard({ task, onClick, onToggle, compact = false, bills = [] }: {
  task: Task; onClick: () => void; onToggle: () => void; compact?: boolean; bills?: BillSummary[];
}) {
  const linkedBill = bills.find(b => b.id === task.billId);
  return (
    <Card onClick={onClick}
      className={cn("group relative overflow-hidden rounded-[36px] bg-white border-emerald-50 hover:border-emerald-200 transition-all hover:shadow-2xl hover:shadow-emerald-900/5 cursor-pointer",
        task.status === "COMPLETED" && "opacity-60", task.color && "border-l-4")}
      style={task.color ? { borderLeftColor: task.color } : {}}>
      <CardContent className={cn("p-8", compact && "p-5")}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="rounded-full bg-emerald-50 border-none text-[8px] font-black uppercase py-0.5 px-3">{task.category}</Badge>
            {task.isGoal && <Badge className="bg-emerald-950 text-white border-none text-[8px] font-black rounded-full"><Target size={8} className="mr-1" />Goal</Badge>}
            {task.isPrivate && <Badge className="bg-slate-900 text-white border-none text-[8px] font-black rounded-full"><Lock size={8} className="mr-1" />Privat</Badge>}
            {task.recurringType && <Badge className="bg-blue-100 text-blue-700 border-none text-[8px] font-black rounded-full"><Repeat size={8} className="mr-1" />{task.recurringType}</Badge>}
            {task.billId && <Badge className="bg-blue-50 text-blue-700 border-none text-[8px] font-black">Rp {(linkedBill?.amount || 0).toLocaleString()}</Badge>}
          </div>
          <PriorityBadge priority={task.priority} />
        </div>
        <h3 className={cn("text-xl font-black text-emerald-950 leading-tight mb-2 group-hover:text-emerald-700 transition-colors", compact && "text-sm mb-3")}>{task.title}</h3>
        {!compact && <p className="text-xs font-medium text-slate-500 line-clamp-2 mb-5 h-8">{task.description}</p>}
        {/* 360 – Estimation */}
        {task.estimatedMinutes && (
          <div className="flex items-center gap-1.5 mb-3 text-[10px] font-bold text-slate-400">
            <Clock size={12} className="text-blue-400" />
            {task.estimatedMinutes >= 60 ? `${Math.floor(task.estimatedMinutes / 60)}j ${task.estimatedMinutes % 60}m` : `${task.estimatedMinutes} menit`}
          </div>
        )}
        {task.isGoal && (
          <div className="space-y-1.5 mb-5">
            <div className="flex justify-between text-[9px] font-black uppercase text-emerald-800/40"><span>Progres Goal</span><span>{task.goalProgress ?? 0}%</span></div>
            <Progress value={task.goalProgress ?? 0} className="h-2 bg-emerald-50/50" />
          </div>
        )}
        <div className="flex items-center justify-between pt-4 border-t border-emerald-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
              {task.assignee?.image ? <img src={task.assignee.image} alt="" className="w-full h-full object-cover" /> : <UserIcon size={14} className="text-slate-300" />}
            </div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{task.assignee?.name || "Unassigned"}</span>
          </div>
          <button onClick={e => { e.stopPropagation(); onToggle(); }}
            className={cn("w-9 h-9 rounded-2xl flex items-center justify-center transition-all",
              task.status === "COMPLETED" ? "bg-emerald-500 text-white" : "bg-emerald-50 text-emerald-300 hover:text-emerald-600")}>
            <CheckCircle size={18} />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── PriorityBadge ─────────────────────────────────────────────────────────────
function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = { URGENT: "bg-rose-100 text-rose-600", HIGH: "bg-orange-100 text-orange-600", MEDIUM: "bg-amber-100 text-amber-600", LOW: "bg-emerald-100 text-emerald-600" };
  return <Badge className={cn("rounded-full text-[8px] font-black tracking-widest py-0", colors[priority] || "bg-slate-100 text-slate-500")}>{priority}</Badge>;
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
