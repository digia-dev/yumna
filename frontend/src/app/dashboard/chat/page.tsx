"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Send, 
  Bot, 
  User as UserIcon, 
  Loader2, 
  MessageSquare,
  Sparkles,
  RefreshCcw,
  Check,
  X,
  Mic,
  Wallet,
  Receipt,
  Pin,
  Smile,
  Image as ImageIcon,
  Paperclip,
  ChevronDown,
  Download,
  BarChart2,
  ExternalLink,
  WifiOff,
  Trash2,
  Info,
  Users,
  Settings,
  Languages
} from "lucide-react";
import useSWRInfinite from "swr/infinite";
import apiClient from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const PAGE_SIZE = 20;

const fetcher = (url: string) => apiClient.get(url).then(res => res.data);

// --- Confirmation Card Component (Task 288) ---
function ConfirmationCard({ data, onConfirm, onCancel }: { data: any, onConfirm: () => void, onCancel: () => void }) {
  return (
    <Card className="mt-4 border-2 border-emerald-100 shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
           <Receipt size={14} className="text-emerald-700" />
           <span className="text-[10px] font-black text-emerald-800 uppercase tracking-[0.2em]">Konfirmasi Transaksi</span>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </div>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground font-bold uppercase">Nominal</p>
            <p className="text-lg font-bold text-emerald-950 font-display">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(data.amount)}
            </p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-[10px] text-muted-foreground font-bold uppercase">Kategori</p>
            <p className="text-sm font-bold text-emerald-700">{data.category}</p>
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground font-bold uppercase">Keterangan</p>
          <p className="text-xs text-emerald-900 leading-relaxed font-medium">{data.description || '-'}</p>
        </div>

        {data.wallet && (
          <div className="p-2 bg-emerald-50/50 rounded-lg flex items-center gap-2 border border-emerald-100/50">
            <Wallet size={12} className="text-emerald-600" />
            <span className="text-[10px] font-bold text-emerald-800 tracking-tight">Sumber: {data.wallet}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button size="sm" onClick={onConfirm} className="bg-emerald-600 hover:bg-emerald-700 h-9 font-bold text-[11px] uppercase tracking-wider">
            Sesuai, Catat!
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel} className="h-9 border-red-100 text-red-600 hover:bg-red-50 font-bold text-[11px] uppercase tracking-wider">
            Batal
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Task Confirmation Card Component (Task 295) ---
function TaskConfirmationCard({ data, onConfirm, onCancel }: { data: any, onConfirm: () => void, onCancel: () => void }) {
  return (
    <Card className="mt-4 border-2 border-blue-100 shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-blue-50 px-4 py-2 border-b border-blue-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
           <MessageSquare size={14} className="text-blue-700" />
           <span className="text-[10px] font-black text-blue-800 uppercase tracking-[0.2em]">Buat Tugas Baru</span>
        </div>
        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
      </div>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground font-bold uppercase">Judul Tugas</p>
          <p className="text-sm font-bold text-blue-950 font-display">{data.title}</p>
        </div>
        
        <div className="flex items-center justify-between">
           <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground font-bold uppercase">Prioritas</p>
              <p className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full w-fit">{data.priority || 'Medium'}</p>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button size="sm" onClick={onConfirm} className="bg-blue-600 hover:bg-blue-700 h-9 font-bold text-[11px] uppercase tracking-wider">
            Ya, Ingatkan!
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel} className="h-9 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-[11px] uppercase tracking-wider">
            Nanti saja
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Link Preview Card (Task 304) ---
function LinkPreviewCard({ data }: { data: any }) {
  return (
    <a 
      href={data.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="mt-3 block bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden hover:bg-slate-100 transition-colors group"
    >
       {data.image && (
         <div className="h-32 w-full overflow-hidden">
            <img src={data.image} alt={data.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
         </div>
       )}
       <div className="p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-blue-600">
             <ExternalLink size={10} />
             <span className="text-[9px] font-black uppercase tracking-widest">{new URL(data.url).hostname}</span>
          </div>
          <p className="text-xs font-bold text-slate-800 line-clamp-1">{data.title}</p>
          <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{data.description}</p>
       </div>
    </a>
  );
}

// --- Poll Card Component (Task 305) ---
function PollCard({ data }: { data: any }) {
  return (
    <Card className="mt-4 border-2 border-amber-100 shadow-md overflow-hidden bg-amber-50/30">
       <div className="bg-amber-100/50 px-4 py-2 flex items-center gap-2">
          <BarChart2 size={14} className="text-amber-700" />
          <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Musyawarah Keluarga</span>
       </div>
       <CardContent className="p-4 space-y-3">
          <p className="text-xs font-bold text-slate-800">{data.question}</p>
          <div className="space-y-2">
             {data.options.map((opt: string, idx: number) => (
               <Button key={idx} variant="outline" className="w-full justify-start text-[10px] h-9 border-amber-200 bg-white hover:bg-amber-50 text-slate-700 font-bold">
                  {opt}
               </Button>
             ))}
          </div>
       </CardContent>
    </Card>
  );
}

// --- Reminder Confirmation Card Component ---
function ReminderConfirmationCard({ data, onConfirm, onCancel }: { data: any, onConfirm: () => void, onCancel: () => void }) {
  return (
    <Card className="mt-4 border-2 border-purple-100 shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-purple-50 px-4 py-2 border-b border-purple-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
           <Pin size={14} className="text-purple-700" />
           <span className="text-[10px] font-black text-purple-800 uppercase tracking-[0.2em]">Konfirmasi Pengingat</span>
        </div>
        <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
      </div>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground font-bold uppercase">Apa yang Diingatkan?</p>
          <p className="text-sm font-bold text-purple-950 font-display">{data.title}</p>
        </div>
        
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground font-bold uppercase">Waktu Pengingat</p>
          <p className="text-xs font-bold text-slate-700">
             {data.remindAt && !isNaN(Date.parse(data.remindAt)) ? new Date(data.remindAt).toLocaleString('id-ID', { 
               day: 'numeric', 
               month: 'long', 
               year: 'numeric', 
               hour: '2-digit', 
               minute: '2-digit' 
             }) : 'Waktu tidak valid'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button size="sm" onClick={onConfirm} className="bg-purple-600 hover:bg-purple-700 h-9 font-bold text-[11px] uppercase tracking-wider">
            Siap, Ingatkan!
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel} className="h-9 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-[11px] uppercase tracking-wider">
            Batal
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Typing Indicator Component (Task 287) ---
function TypingIndicator() {
  return (
    <div className="flex justify-start animate-in fade-in slide-in-from-left-2 duration-300">
      <div className="bg-white border border-emerald-50 p-4 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-3">
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" />
        </div>
        <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest italic">Yumna sedang berfikir...</span>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showPinned, setShowPinned] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [translations, setTranslations] = useState<Record<string, string>>({});

  // Task 307: Offline Awareness
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // --- Fetch Pinned Messages ---
  const fetchPinned = async () => {
    try {
      const res = await apiClient.get("/chat/pinned");
      setPinnedMessages(res.data);
    } catch {};
  };

  useEffect(() => {
    fetchPinned();
    fetchFamilyInfo();
  }, []);

  const fetchFamilyInfo = async () => {
    try {
      const res = await apiClient.get("/family/members");
      setFamilyMembers(res.data);
    } catch {}
  };

  const handleTranslate = async (msgId: string) => {
    try {
      const res = await apiClient.post("/chat/translate", { messageId: msgId, targetLang: 'Indonesian or English' });
      setTranslations(prev => ({ ...prev, [msgId]: res.data.translation }));
      toast.success("Diterjemahkan.");
    } catch (e) {
      toast.error("Gagal menterjemahkan.");
    }
  };

  // --- Voice Messaging (Task 290) ---
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Browser Anda tidak mendukung Speech Recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? " " : "") + transcript);
    };

    recognition.start();
  };

  const { 
    data, 
    error, 
    size, 
    setSize, 
    mutate, 
    isLoading 
  } = useSWRInfinite(
    (index, previousPageData) => {
      if (previousPageData && !previousPageData.length) return null;
      const cursor = index === 0 ? "" : previousPageData[previousPageData.length - 1].id;
      return `/chat/history?limit=${PAGE_SIZE}&cursor=${cursor}`;
    },
    fetcher,
    {
      revalidateFirstPage: false,
      persistSize: true,
    }
  );

  const messages = data ? [].concat(...data).reverse() : [];
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
  const isReachingEnd = data && data[data.length - 1]?.length < PAGE_SIZE;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, isSending]);

  const handleSend = async (messageText?: string, attachmentUrl?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend && !attachmentUrl || isSending) return;

    setInput("");
    setShowEmojiPicker(false);
    setIsSending(true);

    try {
      await apiClient.post("/chat/send", { 
        message: textToSend || (attachmentUrl ? "Sent an image" : ""), 
        attachmentUrl 
      });
      mutate();
    } catch (e) {
      toast.error("Gagal mengirim pesan.");
      if (textToSend) setInput(textToSend);
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm("Hapus pesan ini untuk semua orang?")) return;

    try {
      await apiClient.post("/chat/delete", { messageId });
      toast.success("Pesan dihapus.");
      mutate();
    } catch {
      toast.error("Gagal menghapus pesan.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Assuming existing upload endpoint
      const res = await apiClient.post("/uploads", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      await handleSend("", res.data.url);
      toast.success("Gambar berhasil dikirim.");
    } catch (err) {
      toast.error("Gagal mengunggah gambar.");
    } finally {
      setUploading(false);
    }
  };

  const toggleReaction = async (messageId: string, emoji: string) => {
    try {
      await apiClient.patch("/chat/reaction", { messageId, emoji });
      mutate();
    } catch {}
  };

  const togglePin = async (messageId: string) => {
    try {
      await apiClient.patch(`/chat/pin/${messageId}`);
      toast.success("Status pin diperbarui.");
      mutate();
      fetchPinned();
    } catch {}
  };

  const handleExport = async () => {
    try {
      const res = await apiClient.get("/chat/export");
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `yumna-chat-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      toast.success("Data chat berhasil diekspor!");
    } catch {
      toast.error("Gagal mengekspor data chat.");
    }
  };

  const confirmTransaction = async (txData: any) => {
    try {
      await apiClient.post("/finance/quick-add", {
        amount: txData.amount,
        type: txData.type,
        category: txData.category,
        description: txData.description,
        walletName: txData.wallet
      });
      toast.success("Transaksi berhasil dicatat!");
      mutate();
    } catch (e) {
      toast.error("Gagal mencatat transaksi.");
    }
  };

  const confirmTask = async (taskData: any) => {
    try {
      await apiClient.post("/tasks", {
        title: taskData.title,
        priority: taskData.priority || 'MEDIUM',
      });
      toast.success("Tugas berhasil dibuat!");
      mutate();
    } catch (e) {
      toast.error("Gagal membuat tugas.");
    }
  };

  const confirmReminder = async (reminderData: any) => {
    try {
      await apiClient.post("/schedule/reminders", {
        title: reminderData.title,
        remindAt: reminderData.remindAt,
      });
      toast.success("Pengingat berhasil dijadwalkan!");
      mutate();
    } catch (e) {
      toast.error("Gagal menjadwalkan pengingat.");
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] max-w-6xl mx-auto gap-4 w-full">
      <div className={cn("flex flex-col h-full space-y-4 transition-all duration-300 min-w-0 flex-1", showSidebar && "lg:flex-[2]")}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 bg-white/80 backdrop-blur-md rounded-3xl border border-emerald-100 shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 rounded-2xl shadow-inner group transition-all hover:scale-105">
              <Bot className="text-emerald-700" size={22} />
            </div>
            <div>
              <h2 className="text-sm font-black text-emerald-950 tracking-tight uppercase">Yumna Assistant</h2>
              <div className="flex items-center gap-1.5">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[9px] text-emerald-600 font-black uppercase tracking-widest">Sakinah Mode On</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <Button 
               variant="ghost" 
               size="sm" 
               className={cn("text-emerald-700 rounded-full hover:bg-emerald-50 h-8 text-[10px] font-bold", showPinned && "bg-emerald-100")}
               onClick={() => setShowPinned(!showPinned)}
             >
               <Pin size={14} className="mr-1" />
               PIN ({pinnedMessages.length})
             </Button>
             <Button variant="ghost" size="icon" className="text-emerald-700 rounded-full hover:bg-emerald-50 h-8 w-8" onClick={handleExport}>
               <Download size={16} />
             </Button>
             <Button variant="ghost" size="icon" className="text-emerald-700 rounded-full hover:bg-emerald-50 h-8 w-8" onClick={() => mutate()}>
               <RefreshCcw size={16} />
             </Button>
             <Button 
               variant="ghost" 
               size="icon" 
               className={cn("text-emerald-700 rounded-full hover:bg-emerald-50 h-8 w-8 transition-all", showSidebar && "bg-emerald-100 rotate-90")}
               onClick={() => setShowSidebar(!showSidebar)}
             >
               <Info size={16} />
             </Button>
          </div>
        </div>

        {isOffline && (
          <div className="mx-6 px-4 py-2 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-pulse shrink-0">
             <WifiOff size={14} className="text-red-600" />
             <p className="text-[10px] font-bold text-red-800 uppercase tracking-widest">Koneksi Terputus. Pesan Anda akan dikirim saat online.</p>
          </div>
        )}

        {showPinned && pinnedMessages.length > 0 && (
          <div className="mx-2 px-6 py-3 bg-amber-50 rounded-2xl border border-amber-100 animate-in slide-in-from-top-2 duration-300 shrink-0">
            <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Pin size={10} /> Pesan Penting Keluarga
            </p>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
              {pinnedMessages.map(m => (
                <div key={m.id} className="text-xs bg-white/50 p-2 rounded-lg border border-amber-200/50 flex justify-between items-start">
                  <p className="line-clamp-2">{m.content}</p>
                  <Button variant="ghost" size="sm" className="h-4 p-0 text-[8px]" onClick={() => togglePin(m.id)}>UNPIN</Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message List */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-2 space-y-6 scrollbar-hide pb-8"
        >
          {!isReachingEnd && (
            <div className="flex justify-center py-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[9px] font-black uppercase tracking-widest text-emerald-700/60 bg-emerald-50/50 hover:bg-emerald-100 rounded-full px-6"
                onClick={() => setSize(size + 1)}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? <Loader2 size={12} className="animate-spin mr-2" /> : "Muat Sejarah Barakah"}
              </Button>
            </div>
          )}

          {messages.map((msg: any, i: number) => {
            const isAI = msg.role === 'assistant';
            let smartReplies: string[] = [];
            if (isAI) {
              const srMatch = msg.content.match(/\[SmartReply:\s*([^\]]+)\]/);
              if (srMatch) smartReplies = srMatch[1].split('|').map((s: string) => s.trim());
            }
             // Try to parse message content if it contains JSON for extraction
             let actions: any[] = [];
             if (isAI && msg.content.includes("{")) {
                try {
                   const jsonMatch = msg.content.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
                   if (jsonMatch) {
                      const parsed = JSON.parse(jsonMatch[0]);
                      actions = Array.isArray(parsed) ? parsed : [parsed];
                   }
                } catch (e) {
                   console.error("Failed to parse AI extraction", e);
                }
             }

            return (
              <div 
                key={msg.id || i} 
                className={cn(
                  "flex w-full animate-in fade-in slide-in-from-bottom-2 duration-400",
                  isAI ? "justify-start" : "justify-end"
                )}
              >
                <div className={cn(
                  "max-w-[88%] sm:max-w-[75%] p-4 rounded-3xl shadow-sm relative group",
                  isAI 
                    ? "bg-white border-emerald-50 border text-emerald-950 rounded-tl-none" 
                    : "bg-emerald-700 text-white rounded-tr-none premium-gradient shadow-emerald-900/10 shadow-lg"
                )}>
                  {isAI && (
                    <div className="flex items-center gap-2 mb-2">
                      <Bot size={12} className="text-emerald-600" />
                      <span className="text-[9px] uppercase font-black tracking-[0.15em] text-emerald-700/70">Yumna AI</span>
                    </div>
                  )}
                  {!isAI && msg.user && (
                      <div className="flex items-center gap-2 mb-1 justify-end">
                         <span className="text-[9px] uppercase font-black tracking-widest opacity-60">{msg.user.name}</span>
                         <UserIcon size={10} className="opacity-60" />
                      </div>
                  )}
                  
                  <div className={cn(
                    "text-[13px] leading-relaxed prose prose-sm max-w-none",
                    !isAI && "text-white prose-invert",
                    "prose-strong:text-emerald-800 prose-headings:text-emerald-900"
                  )}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content.replace(/(\[[\s\S]*\]|\{[\s\S]*\})/g, "").replace(/\[SmartReply:\s*[^\]]+\]/, "").trim() || (actions.length > 0 ? "Saya mendeteksi beberapa informasi:" : "")}
                    </ReactMarkdown>
                  </div>

                  {translations[msg.id] && (
                    <div className="mt-2 pt-2 border-t border-emerald-100/30">
                       <p className="text-[10px] font-black uppercase text-emerald-800/40 mb-1 flex items-center gap-1">
                          <Languages size={10} /> Terjemahan AI
                       </p>
                       <p className={cn("text-[12px] italic", !isAI && "text-emerald-100")}>{translations[msg.id]}</p>
                    </div>
                  )}

                  {msg.attachmentUrl && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-emerald-100">
                      <img src={msg.attachmentUrl} alt="Attachment" className="max-w-full h-auto object-cover" />
                    </div>
                  )}

                  {msg.metadata?.type === 'link' && <LinkPreviewCard data={msg.metadata.data} />}
                  
                  {/* Multi-Action Cards (Task 329) */}
                  <div className="space-y-3">
                    {actions.map((action: any, idx: number) => (
                      <div key={idx}>
                        {action.action === 'TRANSACTION_RECORD' && (
                          <ConfirmationCard 
                              data={action.data} 
                              onConfirm={() => confirmTransaction(action.data)}
                              onCancel={() => toast.info("Dibatalkan.")}
                          />
                        )}
                        {action.action === 'TASK_CREATE' && (
                          <TaskConfirmationCard 
                              data={action.data} 
                              onConfirm={() => confirmTask(action.data)}
                              onCancel={() => toast.info("Dibatalkan.")}
                          />
                        )}
                        {action.action === 'REMINDER_CREATE' && (
                          <ReminderConfirmationCard 
                              data={action.data} 
                              onConfirm={() => confirmReminder(action.data)}
                              onCancel={() => toast.info("Dibatalkan.")}
                          />
                        )}
                        {action.action === 'POLL_CREATE' && <PollCard data={action.data} />}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-end gap-1 mt-2.5">
                     <span className="text-[8px] opacity-40 font-bold uppercase tracking-tighter">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </span>
                     {isAI && <Check size={8} className="text-emerald-400" />}
                  </div>

                  {/* Actions Row */}
                  <div className="absolute top-0 right-0 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur rounded-full px-2 py-1 shadow-md border border-slate-100 scale-75 origin-right z-10">
                    {["👍", "❤️", "🙏", "✅"].map(emoji => (
                      <button key={emoji} className="hover:scale-125 transition-transform" onClick={() => toggleReaction(msg.id, emoji)}>{emoji}</button>
                    ))}
                    <div className="w-px h-3 bg-slate-200 mx-1" />
                    <button onClick={() => handleTranslate(msg.id)} title="Terjemahkan">
                      <Languages size={12} className="text-slate-400 hover:text-emerald-500" />
                    </button>
                    <button onClick={() => togglePin(msg.id)}>
                      <Pin size={12} className={cn(msg.isPinned ? "text-amber-500 fill-amber-500" : "text-slate-400")} />
                    </button>
                    {(msg.role === 'assistant' || msg.userId === user?.id) && (
                      <button onClick={() => handleDelete(msg.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>

                  {/* Reactions Display */}
                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {Object.entries(msg.reactions).map(([emoji, users]: [string, any]) => (
                        <button 
                          key={emoji} 
                          onClick={() => toggleReaction(msg.id, emoji)}
                          className={cn(
                            "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] border transition-all",
                            users.includes(user?.id) ? "bg-emerald-100 border-emerald-200 text-emerald-700" : "bg-slate-50 border-slate-100 text-slate-500"
                          )}
                        >
                          <span>{emoji}</span>
                          <span className="font-bold">{users.length}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Smart Replies */}
                  {smartReplies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-50">
                      {smartReplies.map((sr, idx) => (
                        <Button 
                          key={idx} 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleSend(sr)}
                          className="h-8 px-4 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100/50 text-[10px] font-black uppercase tracking-widest"
                        >
                           {sr}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isSending && <TypingIndicator />}
        </div>

        {/* Input Area */}
        <div className={cn(
          "bg-white pb-6 pt-4 px-6 rounded-t-[40px] border-x border-t border-emerald-100 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] transition-all shrink-0",
          isListening && "ring-4 ring-emerald-500/20"
        )}>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-2xl w-12 h-12 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 shrink-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? <Loader2 size={20} className="animate-spin" /> : <ImageIcon size={20} />}
            </Button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

            <div className="relative shrink-0">
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("rounded-2xl w-12 h-12 bg-amber-50 text-amber-600 hover:bg-amber-100", showEmojiPicker && "bg-amber-100")}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile size={20} />
              </Button>
              {showEmojiPicker && (
                <Card className="absolute bottom-16 left-0 w-64 p-3 grid grid-cols-6 gap-2 bg-white rounded-2xl shadow-xl border border-amber-100 animate-in slide-in-from-bottom-2 z-50">
                  {["😊", "😇", "💰", "💸", "🕌", "🍎", "☕", "🚗", "🏠", "📉", "📈", "✅", "❌", "😂", "🙏", "❤️", "👍", "🔥"].map(emoji => (
                    <button 
                      key={emoji} 
                      className="text-xl hover:scale-125 transition-transform p-1"
                      onClick={() => setInput(prev => prev + emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                  <div className="col-span-6 border-t border-slate-100 pt-2 flex justify-center">
                    <span className="text-[9px] font-black text-amber-800/40 uppercase tracking-widest">Emoji Keluarga</span>
                  </div>
                </Card>
              )}
            </div>

            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Mendengarkan ucapan Anda..." : "Tulis pesan barakah Anda..."}
              className="flex-1 bg-muted/60 border-none focus-visible:ring-emerald-500 rounded-2xl h-12 px-5 shadow-inner text-sm font-medium"
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            
            <Button 
              onClick={() => handleSend()}
              disabled={(!input.trim() && !uploading) || isSending}
              className="rounded-2xl h-12 w-12 p-0 bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md active:scale-95 shrink-0 shadow-emerald-900/20"
            >
              {isSending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            </Button>
          </div>
          
          <div className="mt-3 flex gap-6 px-4">
             {[
               { label: 'Sakinah Mode', icon: Sparkles },
               { label: 'Inspirasi Syura', icon: MessageSquare },
               { label: 'Glosarium', icon: Receipt },
             ].map((item, idx) => (
               <button key={idx} className="text-[9px] font-black text-emerald-800/40 uppercase tracking-[0.2em] flex items-center gap-2 hover:text-emerald-700 transition-colors group">
                  <item.icon size={12} className="group-hover:scale-110 transition-transform" />
                  {item.label}
               </button>
             ))}
          </div>
        </div>
      </div>

      {/* Sidebar (Task 324) */}
      {showSidebar && (
        <div className="hidden lg:flex flex-col w-80 bg-white/80 backdrop-blur-md rounded-3xl border border-emerald-100 shadow-sm p-6 space-y-6 animate-in slide-in-from-right-4 duration-300 lg:sticky lg:top-0">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-2 text-emerald-900 font-black uppercase text-[10px] tracking-widest">
              <Users size={14} />
              Anggota Keluarga
            </div>
            <div className="space-y-3">
              {familyMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-2 rounded-2xl hover:bg-emerald-50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold uppercase overflow-hidden border border-emerald-200">
                    {member.image ? <img src={member.image} alt={member.name} /> : member.name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{member.name}</p>
                    <p className="text-[9px] font-medium text-slate-500">{member.role || 'Anggota'}</p>
                  </div>
                </div>
              ))}
              {familyMembers.length === 0 && <p className="text-[10px] text-slate-400 italic">Memuat anggota...</p>}
            </div>
          </div>

          <div className="space-y-4 border-t border-emerald-50 pt-6">
            <div className="flex items-center gap-2 text-emerald-900 font-black uppercase text-[10px] tracking-widest">
              <Settings size={14} />
              Pengaturan Chat
            </div>
            <div className="space-y-1">
               <Button variant="ghost" className="w-full justify-start text-[10px] h-9 font-bold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50">Bisukan Notifikasi</Button>
               <Button variant="ghost" className="w-full justify-start text-[10px] h-9 font-bold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50">Cari Pesan</Button>
               <Button variant="ghost" className="w-full justify-start text-[10px] h-9 font-bold text-red-600 hover:bg-red-50">Tinggalkan Grup</Button>
            </div>
          </div>

          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100/50">
             <p className="text-[9px] font-bold text-emerald-800/60 uppercase mb-2">Enkripsi End-to-End</p>
             <p className="text-[10px] leading-relaxed text-emerald-900/80">Pesan dan data finansial Anda diamankan dengan enkripsi syariah untuk privasi keluarga yang utuh.</p>
          </div>
        </div>
      )}
    </div>
  );
}
