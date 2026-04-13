"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, ChevronRight } from "lucide-react";
import useSWR from "swr";
import Link from "next/link";
import apiClient from "@/lib/api-client";

const fetcher = (url: string) => apiClient.get(url).then(res => res.data);

export function PrayerTimesWidget() {
  const { data: times } = useSWR("/religi/prayer-times", fetcher);

  const prayers = [
    { name: "Subuh", time: times?.Subuh },
    { name: "Syuruq", time: times?.Syuruq },
    { name: "Dhuhur", time: times?.Dhuhur },
    { name: "Ashar", time: times?.Ashar },
    { name: "Maghrib", time: times?.Maghrib },
    { name: "Isya", time: times?.Isya },
  ];

  // Find next prayer
  const now = new Date();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
  
  const nextPrayer = prayers.find(p => p.time > currentTimeStr) || prayers[0];

  return (
    <Card className="bg-emerald-950 text-white overflow-hidden shadow-xl border-none">
      <CardContent className="p-0">
        <div className="bg-emerald-900/50 p-4 flex justify-between items-center border-b border-emerald-800">
           <div className="flex items-center gap-2">
             <MapPin size={14} className="text-emerald-400" />
             <span className="text-xs font-medium text-emerald-200">Jakarta, Indonesia</span>
           </div>
           <Badge variant="outline" className="text-[10px] border-emerald-700 text-emerald-300">
             13 Syawal 1447H
           </Badge>
        </div>
        
        <div className="p-6">
           <div className="flex justify-between items-end mb-6">
              <div>
                <p className="text-emerald-300 text-xs uppercase tracking-widest font-bold">Selanjutnya: {nextPrayer?.name}</p>
                <h3 className="text-4xl font-bold mt-1 text-amber-400">{nextPrayer?.time}</h3>
              </div>
              <div className="text-right">
                <Clock className="text-emerald-800 ml-auto mb-1" size={32} />
                <p className="text-[10px] text-emerald-400">Menuju waktu Ibadah</p>
              </div>
           </div>

           <div className="grid grid-cols-3 gap-2">
              {prayers.map((p) => (
                <div 
                  key={p.name} 
                  className={`p-2 rounded-lg text-center border ${p.name === nextPrayer?.name ? 'bg-emerald-800 border-emerald-600' : 'bg-emerald-900/30 border-emerald-800'}`}
                >
                  <p className="text-[9px] text-emerald-300 uppercase">{p.name}</p>
                  <p className={`text-xs font-bold ${p.name === nextPrayer?.name ? 'text-amber-400' : 'text-white'}`}>{p.time}</p>
                </div>
              ))}
           </div>
           
           <Link href="/dashboard/religi" className="block w-full">
             <button className="w-full mt-6 py-2 px-4 bg-emerald-800 hover:bg-emerald-700 rounded-xl text-xs flex items-center justify-between transition-colors group">
                <span className="flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                   Buka Pusat Ibadah (Religi Hub)
                </span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
             </button>
           </Link>
        </div>
      </CardContent>
    </Card>
  );
}
