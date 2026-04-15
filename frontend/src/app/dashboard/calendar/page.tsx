"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  Clock, CheckCircle2, AlertCircle, Pin, Bot, GripHorizontal,
} from "lucide-react";
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, eachDayOfInterval,
} from "date-fns";
import { id } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";

// ── 366 Color Map for event types and task colors ────────────────────────────
const TASK_EVENT_COLOR: Record<string, { bg: string; text: string; dot: string }> = {
  WORSHIP:   { bg: "bg-purple-100", text: "text-purple-700",  dot: "bg-purple-400" },
  Finance:   { bg: "bg-blue-100",   text: "text-blue-700",    dot: "bg-blue-400" },
  Household: { bg: "bg-amber-100",  text: "text-amber-700",   dot: "bg-amber-400" },
  Belanja:   { bg: "bg-rose-100",   text: "text-rose-700",    dot: "bg-rose-400" },
  Health:    { bg: "bg-green-100",  text: "text-green-700",   dot: "bg-green-400" },
  REMINDER:  { bg: "bg-amber-100",  text: "text-amber-700",   dot: "bg-amber-400" },
  TASK:      { bg: "bg-emerald-100",text: "text-emerald-700", dot: "bg-emerald-400" },
  DEFAULT:   { bg: "bg-slate-100",  text: "text-slate-600",   dot: "bg-slate-400" },
};

function getEventStyle(event: any) {
  if (event.color) {
    return { backgroundColor: `${event.color}20`, color: event.color };
  }
  const map = TASK_EVENT_COLOR[event.category ?? event.type ?? "DEFAULT"] ?? TASK_EVENT_COLOR.DEFAULT;
  return { bg: map.bg, text: map.text };
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 369 – Drag to reschedule state
  const [draggingEvent, setDraggingEvent] = useState<any | null>(null);
  const [dragOverDate, setDragOverDate] = useState<Date | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const start = startOfMonth(currentMonth);
      const end   = endOfMonth(currentMonth);
      const res = await apiClient.get(`/schedule/unified?start=${start.toISOString()}&end=${end.toISOString()}`);
      const allEvents = [
        ...res.data.reminders.map((r: any) => ({ ...r, type: "REMINDER" })),
        ...res.data.tasks.map((t: any) => ({ ...t, type: t.category ?? "TASK" })),
      ];
      setEvents(allEvents);
    } catch {
      toast.error("Gagal memuat agenda.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, [currentMonth]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end:   endOfWeek(endOfMonth(currentMonth)),
  });

  const getEventsForDay = (day: Date) => events.filter(e => isSameDay(new Date(e.date), day));

  // ── 369 Drag Reschedule Handlers ─────────────────────────────────────────
  const handleDragStart = (e: React.DragEvent, event: any) => {
    setDraggingEvent(event);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, day: Date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverDate(day);
  };

  const handleDrop = async (e: React.DragEvent, day: Date) => {
    e.preventDefault();
    if (!draggingEvent) return;
    setDragOverDate(null);

    const newDate = format(day, "yyyy-MM-dd");
    if (isSameDay(new Date(draggingEvent.date), day)) return;

    try {
      if (draggingEvent.type === "REMINDER") {
        await apiClient.patch(`/reminders/${draggingEvent.id}`, { date: newDate });
      } else {
        await apiClient.patch(`/tasks/${draggingEvent.id}`, { dueDate: newDate });
      }
      toast.success(`"${draggingEvent.title}" dipindah ke ${format(day, "d MMMM", { locale: id })}`);
      fetchEvents();
    } catch {
      toast.error("Gagal memindah event.");
    }
    setDraggingEvent(null);
  };

  const handleDragEnd = () => {
    setDraggingEvent(null);
    setDragOverDate(null);
  };

  return (
    <div className="space-y-8 p-1" onDragEnd={handleDragEnd}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-emerald-950 tracking-tighter">Kalender Berkah</h1>
          <p className="text-emerald-700/60 font-medium mt-1">Pantau amanah dan pengingat keluarga. Drag event untuk reschedule.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1 rounded-2xl border border-emerald-100 shadow-sm">
          <Button variant="ghost" size="icon" onClick={prevMonth} className="rounded-xl h-9 w-9 text-emerald-700"><ChevronLeft size={20} /></Button>
          <span className="text-sm font-black text-emerald-950 min-w-[140px] text-center uppercase tracking-widest">
            {format(currentMonth, "MMMM yyyy", { locale: id })}
          </span>
          <Button variant="ghost" size="icon" onClick={nextMonth} className="rounded-xl h-9 w-9 text-emerald-700"><ChevronRight size={20} /></Button>
        </div>
      </div>

      {/* 366 – Color Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mr-2">Warna Kategori:</span>
        {Object.entries(TASK_EVENT_COLOR).filter(([k]) => k !== "DEFAULT" && k !== "TASK").map(([cat, style]) => (
          <div key={cat} className="flex items-center gap-1.5">
            <div className={cn("w-2 h-2 rounded-full", style.dot)} />
            <span className="text-[9px] font-bold text-slate-500">{cat}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Calendar Grid */}
        <div className="lg:col-span-3">
          <Card className="rounded-[40px] border-none shadow-xl shadow-emerald-900/5 bg-white overflow-hidden">
            <CardContent className="p-0">
              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b border-emerald-50">
                {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map(day => (
                  <div key={day} className="py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800/40">{day}</div>
                ))}
              </div>

              {/* Day Grid */}
              <div className="grid grid-cols-7">
                {daysInMonth.map((day, idx) => {
                  const dayEvents = getEventsForDay(day);
                  const isToday      = isSameDay(day, new Date());
                  const isSelected   = isSameDay(day, selectedDate);
                  const isCurrentMo  = isSameMonth(day, currentMonth);
                  const isDragTarget = dragOverDate && isSameDay(day, dragOverDate);

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDate(day)}
                      onDragOver={e => handleDragOver(e, day)}
                      onDrop={e => handleDrop(e, day)}
                      className={cn(
                        "min-h-[120px] p-2 border-r border-b border-emerald-50 transition-all cursor-pointer",
                        !isCurrentMo && "bg-slate-50/50 opacity-30",
                        isSelected && "bg-emerald-50/50",
                        isDragTarget && "bg-emerald-100/60 border-2 border-emerald-300 scale-[0.98]",
                        !isDragTarget && "hover:bg-emerald-50/30"
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={cn(
                          "w-7 h-7 flex items-center justify-center text-xs font-black rounded-lg transition-colors",
                          isToday ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20" : "text-slate-400"
                        )}>
                          {format(day, "d")}
                        </span>
                        {isDragTarget && (
                          <span className="text-[8px] font-black text-emerald-500 animate-pulse">Drop!</span>
                        )}
                      </div>

                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 3).map((event, i) => {
                          const catStyle = TASK_EVENT_COLOR[event.category ?? event.type] ?? TASK_EVENT_COLOR.DEFAULT;
                          const inlineStyle = event.color ? { backgroundColor: `${event.color}25`, color: event.color } : undefined;
                          return (
                            <div
                              key={i}
                              draggable
                              onDragStart={e => { e.stopPropagation(); handleDragStart(e, event); }}
                              onClick={e => e.stopPropagation()}
                              title={`${event.title} — drag to reschedule`}
                              className={cn(
                                "text-[9px] font-bold px-2 py-0.5 rounded-md line-clamp-1 truncate cursor-grab active:cursor-grabbing flex items-center gap-1 group",
                                !inlineStyle && catStyle.bg,
                                !inlineStyle && catStyle.text
                              )}
                              style={inlineStyle}
                            >
                              <GripHorizontal size={8} className="opacity-0 group-hover:opacity-60 shrink-0" />
                              {event.title}
                            </div>
                          );
                        })}
                        {dayEvents.length > 3 && (
                          <p className="text-[8px] font-black text-slate-400 pl-1">+{dayEvents.length - 3} lainnya</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="rounded-[32px] border-none shadow-lg bg-white premium-gradient overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
                  <CalendarIcon size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800/40">Agenda Hari Ini</p>
                  <p className="text-lg font-black text-emerald-950">{format(selectedDate, "d MMMM yyyy", { locale: id })}</p>
                </div>
              </div>

              <div className="space-y-3">
                {getEventsForDay(selectedDate).length === 0 ? (
                  <div className="text-center py-12">
                    <Bot size={40} className="mx-auto text-emerald-100 mb-3" />
                    <p className="text-xs font-bold text-slate-400">Belum ada agenda barakah.</p>
                  </div>
                ) : (
                  getEventsForDay(selectedDate).map((event, i) => {
                    const catStyle = TASK_EVENT_COLOR[event.category ?? event.type] ?? TASK_EVENT_COLOR.DEFAULT;
                    const inlineStyle = event.color ? { backgroundColor: `${event.color}15`, borderColor: `${event.color}40` } : undefined;
                    return (
                      <motion.div
                        key={i}
                        initial={{ x: 10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="group p-4 bg-white rounded-2xl border border-emerald-50 hover:border-emerald-200 transition-all shadow-sm"
                        style={inlineStyle}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", catStyle.dot)}
                              style={event.color ? { backgroundColor: event.color } : undefined} />
                            <Badge className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-0 border-none", catStyle.bg, catStyle.text)}>
                              {event.category ?? event.type}
                            </Badge>
                          </div>
                          <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                            <Clock size={10} />
                            {format(new Date(event.date), "HH:mm")}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-slate-800 line-clamp-1">{event.title}</p>
                        {event.assignee && (
                          <p className="text-[10px] text-emerald-600 font-medium mt-1 uppercase tracking-widest">PJ: {event.assignee.name}</p>
                        )}
                        {event.estimatedMinutes && (
                          <p className="text-[9px] text-slate-400 font-bold mt-1 flex items-center gap-1"><Clock size={9} /> {event.estimatedMinutes}m estimasi</p>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </div>

              <Button className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 rounded-2xl h-11 font-bold shadow-lg shadow-emerald-900/10">
                Tambah Agenda
              </Button>
            </CardContent>
          </Card>

          {/* Drag Hint */}
          <div className="bg-emerald-50 rounded-[24px] p-5 border border-emerald-100">
            <div className="flex items-center gap-2 mb-2">
              <GripHorizontal size={16} className="text-emerald-500" />
              <p className="text-xs font-black text-emerald-700">Drag & Drop Reschedule</p>
            </div>
            <p className="text-[10px] text-emerald-600/70 leading-relaxed">
              Seret event di kalender ke tanggal lain untuk menjadwal ulang secara langsung.
            </p>
          </div>

          <div className="bg-emerald-950 rounded-[32px] p-6 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Pin size={60} /></div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-2">Tips Syura</p>
            <p className="text-xs leading-relaxed font-medium">"Aturlah waktumu, maka Allah akan memberkahi urusanmu. Jadikan setiap amanah sebagai ladang pahala."</p>
          </div>
        </div>
      </div>
    </div>
  );
}
