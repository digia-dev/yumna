"use client";

import { Card } from "@/components/ui/card";
import { Shield, Users, User, Info } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const roles = [
  {
    id: "KEPALA_KELUARGA",
    title: "Kepala Keluarga",
    icon: Shield,
    color: "text-emerald-deep",
    bg: "bg-emerald-light/20",
    desc: "Memiliki kontrol penuh atas budget, mengundang anggota, dan melihat seluruh laporan keluarga."
  },
  {
    id: "ISTRI",
    title: "Istri",
    icon: Users,
    color: "text-secondary",
    bg: "bg-secondary/10",
    desc: "Dapat mengelola budget bersama, mencatat transaksi harian, dan melihat laporan gabungan."
  },
  {
    id: "ANAK",
    title: "Anak",
    icon: User,
    color: "text-blue-500",
    bg: "bg-blue-50",
    desc: "Hanya dapat mencatat uang saku pribadi dan melihat agenda tugas harian yang diberikan."
  }
];

export function RoleGuide() {
  const [activeRole, setActiveRole] = useState(roles[0].id);

  return (
    <div className="space-y-4 py-6">
      <div className="flex items-center gap-2 text-slate-800 mb-2">
        <Info size={18} className="text-emerald-deep" />
        <h4 className="font-bold text-sm">Pahami Peran di Yumna</h4>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => setActiveRole(role.id)}
            className={cn(
              "p-3 rounded-xl border-2 transition-all flex flex-col items-center text-center gap-2",
              activeRole === role.id 
                ? "border-emerald-deep bg-emerald-light/5 shadow-sm" 
                : "border-slate-100 hover:border-slate-200"
            )}
          >
            <div className={cn("p-2 rounded-lg", role.bg, role.color)}>
              <role.icon size={20} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider leading-tight">
              {role.title.split(" ").join("\n")}
            </span>
          </button>
        ))}
      </div>

      <Card className="p-4 bg-slate-50 border-none shadow-inner">
        <p className="text-xs text-slate-600 italic leading-relaxed">
          "{roles.find(r => r.id === activeRole)?.desc}"
        </p>
      </Card>
      
      <p className="text-center text-[10px] text-muted-foreground">
        *Kepala Keluarga yang pertama kali membuat grup tidak dapat mengubah perannya sendiri.
      </p>
    </div>
  );
}
