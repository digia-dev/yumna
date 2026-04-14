"use client";

import { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  Pin,
  Bot
} from "lucide-react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval 
} from "date-fns";
import { id } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      const res = await apiClient.get(`/schedule/unified?start=${start.toISOString()}&end=${end.toISOString()}`);
      
      // Merge tasks and reminders
      const allEvents = [
        ...res.data.reminders.map((r: any) => ({ ...r, type: 'REMINDER' })),
        ...res.data.tasks.map((t: any) => ({ ...t, type: 'TASK' }))
      ];
      setEvents(allEvents);
    } catch (err) {
      toast.error("Gagal memuat agenda.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentMonth]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth))
  });

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(new Date(event.date), day));
  };

  return (
    <div className="space-y-8 p-1">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-emerald-950 tracking-tighter">Kalender Berkah</h1>
          <p className="text-emerald-700/60 font-medium mt-1">Pantau amanah dan pengingat keluarga dalam satu pandangan.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-1 rounded-2xl border border-emerald-100 shadow-sm">
           <Button variant="ghost" size="icon" onClick={prevMonth} className="rounded-xl h-9 w-9 text-emerald-700">
             <ChevronLeft size={20} />
           </Button>
           <span className="text-sm font-black text-emerald-950 min-w-[140px] text-center uppercase tracking-widest">
             {format(currentMonth, 'MMMM yyyy', { locale: id })}
           </span>
           <Button variant="ghost" size="icon" onClick={nextMonth} className="rounded-xl h-9 w-9 text-emerald-700">
             <ChevronRight size={20} />
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Calendar Grid */}
        <div className="lg:col-span-3">
          <Card className="rounded-[40px] border-none shadow-xl shadow-emerald-900/5 bg-white overflow-hidden">
            <CardContent className="p-0">
              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b border-emerald-50">
                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
                  <div key={day} className="py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800/40">
                    {day}
                  </div>
                ))}
              </div>

              {/* Day Grid */}
              <div className="grid grid-cols-7">
                {daysInMonth.map((day, idx) => {
                  const dayEvents = getEventsForDay(day);
                  const isToday = isSameDay(day, new Date());
                  const isSelected = isSameDay(day, selectedDate);
                  const isCurrentMonth = isSameMonth(day, currentMonth);

                  return (
                    <div 
                      key={idx}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        "min-h-[120px] p-2 border-r border-b border-emerald-50 transition-all cursor-pointer hover:bg-emerald-50/30",
                        !isCurrentMonth && "bg-slate-50/50 opacity-30",
                        isSelected && "bg-emerald-50/50"
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={cn(
                          "w-7 h-7 flex items-center justify-center text-xs font-black rounded-lg transition-colors",
                          isToday ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20" : "text-slate-400"
                        )}>
                          {format(day, 'd')}
                        </span>
                      </div>

                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((event, i) => (
                          <div 
                            key={i} 
                            className={cn(
                              "text-[9px] font-bold px-2 py-1 rounded-md line-clamp-1 truncate",
                              event.type === 'TASK' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                            )}
                          >
                            {event.title}
                          </div>
                        ))}
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

        {/* Sidebar: Day Details */}
        <div className="space-y-6">
           <Card className="rounded-[32px] border-none shadow-lg bg-white premium-gradient overflow-hidden">
             <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
                      <CalendarIcon size={24} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800/40">Agenda Hari Ini</p>
                      <p className="text-lg font-black text-emerald-950">{format(selectedDate, 'd MMMM yyyy', { locale: id })}</p>
                   </div>
                </div>

                <div className="space-y-4">
                   {getEventsForDay(selectedDate).length === 0 ? (
                     <div className="text-center py-12">
                        <Bot size={40} className="mx-auto text-emerald-100 mb-3" />
                        <p className="text-xs font-bold text-slate-400">Belum ada agenda barakah.</p>
                     </div>
                   ) : (
                     getEventsForDay(selectedDate).map((event, i) => (
                       <div key={i} className="group p-4 bg-white rounded-2xl border border-emerald-50 hover:border-emerald-200 transition-all shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                             <Badge className={cn(
                               "text-[8px] font-black uppercase tracking-widest px-2 py-0",
                               event.type === 'TASK' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                             )}>
                               {event.type}
                             </Badge>
                             <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                                <Clock size={10} />
                                {format(new Date(event.date), 'HH:mm')}
                             </span>
                          </div>
                          <p className="text-sm font-bold text-slate-800 line-clamp-1">{event.title}</p>
                          {event.assignee && (
                            <p className="text-[10px] text-emerald-600 font-medium mt-1 uppercase tracking-widest">
                               PJ: {event.assignee.name}
                            </p>
                          )}
                       </div>
                     ))
                   )}
                </div>

                <Button className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 rounded-2xl h-11 font-bold shadow-lg shadow-emerald-900/10">
                   Tambah Agenda
                </Button>
             </CardContent>
           </Card>

           <div className="bg-emerald-950 rounded-[32px] p-6 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                 <Pin size={60} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-2">Tips Syura</p>
              <p className="text-xs leading-relaxed font-medium">"Aturlah waktumu, maka Allah akan memberkahi urusanmu. Jadikan setiap amanah sebagai ladang pahala."</p>
           </div>
        </div>
      </div>
    </div>
  );
}
