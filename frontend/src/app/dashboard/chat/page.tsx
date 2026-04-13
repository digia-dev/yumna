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
  MicOff,
  Wallet,
  Receipt
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
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const userMessage = input.trim();
    setInput("");
    setIsSending(true);

    try {
      await apiClient.post("/chat/send", { message: userMessage });
      mutate();
    } catch (e) {
      toast.error("Gagal mengirim pesan.");
      setInput(userMessage);
    } finally {
      setIsSending(false);
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

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-white/80 backdrop-blur-md rounded-3xl border border-emerald-100 shadow-sm">
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
           <Button variant="ghost" size="icon" className="text-emerald-700 rounded-full hover:bg-emerald-50" onClick={() => mutate()}>
             <RefreshCcw size={16} />
           </Button>
        </div>
      </div>

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
          // Try to parse message content if it contains JSON for extraction
          let extractionData = null;
          let taskData = null;
          if (isAI && msg.content.includes("{")) {
             try {
                const jsonMatch = msg.content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                   const parsed = JSON.parse(jsonMatch[0]);
                   if (parsed.action === 'TRANSACTION_RECORD') {
                      extractionData = parsed.data;
                   } else if (parsed.action === 'TASK_CREATE') {
                      taskData = parsed.data;
                   }
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
                    <Sparkles size={11} className="text-amber-500" />
                    <span className="text-[9px] uppercase font-black tracking-[0.15em] text-emerald-700/70">Yumna Insight</span>
                  </div>
                )}
                {!isAI && msg.user && (
                    <div className="flex items-center gap-2 mb-1 justify-end">
                       <span className="text-[9px] uppercase font-black tracking-widest opacity-60">{msg.user.name}</span>
                       <UserIcon size={10} className="opacity-60" />
                    </div>
                )}
                
                {/* Markdown Support (Task 289) */}
                <div className={cn(
                  "text-[13px] leading-relaxed prose prose-sm max-w-none",
                  !isAI && "text-white prose-invert",
                  "prose-strong:text-emerald-800 prose-headings:text-emerald-900"
                )}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {/* Clean up JSON if any for display */}
                    {extractionData ? msg.content.replace(/\{[\s\S]*\}/, "").trim() || "Saya berhasil mendeteksi transaksi Anda:" : msg.content}
                  </ReactMarkdown>
                </div>

                {/* Confirmation Card (Task 288) */}
                {extractionData && (
                   <ConfirmationCard 
                      data={extractionData} 
                      onConfirm={() => confirmTransaction(extractionData)}
                      onCancel={() => toast.info("Pencatatan dibatalkan.")}
                   />
                )}

                {/* Task Card (Task 295) */}
                {taskData && (
                   <TaskConfirmationCard 
                      data={taskData} 
                      onConfirm={() => confirmTask(taskData)}
                      onCancel={() => toast.info("Pembuatan tugas dibatalkan.")}
                   />
                )}
                
                <div className="flex items-center justify-end gap-1 mt-2.5">
                   <span className="text-[8px] opacity-40 font-bold uppercase tracking-tighter">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </span>
                   {isAI && <Check size={8} className="text-emerald-400" />}
                </div>
              </div>
            </div>
          );
        })}

        {isSending && <TypingIndicator />}
      </div>

      {/* Input Area */}
      <div className={cn(
        "bg-white pb-6 pt-4 px-6 rounded-t-[40px] border-x border-t border-emerald-100 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] transition-all",
        isListening && "ring-4 ring-emerald-500/20"
      )}>
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "rounded-2xl w-12 h-12 transition-all active:scale-95 shrink-0 shadow-sm",
              isListening ? "bg-red-50 text-red-600 hover:bg-red-100 animate-pulse" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            )}
            onClick={startListening}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </Button>

          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Mendengarkan ucapan Anda..." : "Tulis pesan barakah Anda..."}
            className="flex-1 bg-muted/60 border-none focus-visible:ring-emerald-500 rounded-2xl h-12 px-5 shadow-inner text-sm font-medium"
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          
          <Button 
            onClick={handleSend}
            disabled={!input.trim() || isSending}
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
  );
}
