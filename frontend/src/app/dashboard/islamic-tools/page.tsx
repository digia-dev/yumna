"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Coins, 
  Moon, 
  History, 
  Users, 
  MessageSquare, 
  BookOpen, 
  Sparkles,
  ArrowLeft
} from "lucide-react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function IslamicToolsHub() {
  const router = useRouter();

  const tools = [
    { 
      name: 'Zakat Hub', 
      desc: 'Kalkulator Zakat Maal, Profesi, dan Fitrah.',
      icon: <Coins size={24} />, 
      href: '/dashboard/zakat', 
      color: 'bg-emerald-50 text-emerald-700',
      border: 'border-emerald-100'
    },
    { 
      name: 'Ibadah Hub', 
      desc: 'Tracker Sholat, Puasa, Quran, dan Dzikir.',
      icon: <Moon size={24} />, 
      href: '/dashboard/religi', 
      color: 'bg-blue-50 text-blue-700',
      border: 'border-blue-100'
    },
    { 
      name: 'Hutang Sunnah', 
      desc: 'Catatan hutang piutang dengan adab Islami.',
      icon: <History size={24} />, 
      href: '/dashboard/debts', 
      color: 'bg-red-50 text-red-700',
      border: 'border-red-100'
    },
    { 
      name: 'Waris (Faraid)', 
      desc: 'Kalkulator pembagian warisan sesuai Syariat.',
      icon: <Users size={24} />, 
      href: '/dashboard/zakat/waris', 
      color: 'bg-amber-50 text-amber-700',
      border: 'border-amber-100'
    },
    { 
      name: 'Syura Notes', 
      desc: 'Catatan hasil musyawarah anggota keluarga.',
      icon: <MessageSquare size={24} />, 
      href: '/dashboard/syura', 
      color: 'bg-purple-50 text-purple-700',
      border: 'border-purple-100'
    },
    { 
      name: 'Glosarium', 
      desc: 'Kamus istilah keuangan dan ibadah Islami.',
      icon: <BookOpen size={24} />, 
      href: '/dashboard/zakat/glossary', 
      color: 'bg-slate-50 text-slate-700',
      border: 'border-slate-100'
    },
  ];

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="text-amber-500" />
            Alat Islami
          </h1>
          <p className="text-muted-foreground">Pusat keberkahan dan ketaatan keluarga dalam satu tempat.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool, i) => (
          <Link key={i} href={tool.href}>
            <Card className={`h-full hover:shadow-lg transition-all border ${tool.border} group cursor-pointer overflow-hidden`}>
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-xl ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {tool.icon}
                </div>
                <h3 className="text-lg font-bold mb-1">{tool.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{tool.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="bg-emerald-900 text-white border-none overflow-hidden relative premium-gradient">
        <CardContent className="p-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-2xl font-bold">Wujudkan Keluarga Sakinah</h2>
              <p className="text-emerald-100/80 text-sm max-w-md">
                Gunakan alat-alat ini untuk memastikan setiap aspek keuangan dan ibadah keluarga Anda berjalan sesuai nilai-nilai Islami.
              </p>
            </div>
            <Button size="lg" className="bg-amber-400 text-emerald-950 hover:bg-amber-500 font-bold px-8">
              Konsultasi AI
            </Button>
          </div>
        </CardContent>
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sparkles size={120} />
        </div>
      </Card>
    </div>
  );
}
