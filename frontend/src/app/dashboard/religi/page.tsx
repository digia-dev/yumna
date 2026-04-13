"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Moon, 
  Calendar, 
  Star, 
  Navigation, 
  MapPin, 
  CheckCircle2, 
  Plus,
  Flame,
  Award,
  ChevronRight,
  Utensils
} from "lucide-react";
import useSWR from "swr";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

const fetcher = (url: string) => apiClient.get(url).then(res => res.data);

export default function ReligiHubPage() {
  const { data: userData } = useSWR("/auth/me", fetcher);
  const [activeTab, setActiveTab] = useState("overview");
  const [dzikirCount, setDzikirCount] = useState(0);
  const [dzikirTarget, setDzikirTarget] = useState(33);
  const [dzikirPhrase, setDzikirPhrase] = useState("Subhanallah");

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pusat Ibadah Keluarga</h1>
          <p className="text-muted-foreground mt-1">Konsistensi dalam ketaatan, ketenangan dalam iman.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="gap-2 border-emerald-200 text-emerald-700">
             <Navigation size={16} /> Qiblat
           </Button>
           <Button variant="outline" className="gap-2 border-emerald-200 text-emerald-700">
             <MapPin size={16} /> Masjid Terdekat
           </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto h-auto bg-transparent border-b rounded-none p-0">
          <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm">Ikhtisar</TabsTrigger>
          <TabsTrigger value="quran" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm">Khatam Quran</TabsTrigger>
          <TabsTrigger value="fasting" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm">Puasa</TabsTrigger>
          <TabsTrigger value="habits" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm">Habit Islami</TabsTrigger>
          <TabsTrigger value="dzikir" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm">Dzikir</TabsTrigger>
          <TabsTrigger value="children" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm">Sholat Anak</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-emerald-50 border-emerald-100">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider">Streak Tahajjud</p>
                      <h4 className="text-2xl font-bold text-emerald-950 mt-1">12 Hari</h4>
                    </div>
                    <Flame className="text-amber-500" size={20} />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-100">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-blue-800 tracking-wider">Progress Khatam</p>
                      <h4 className="text-2xl font-bold text-blue-950 mt-1">Juz 18</h4>
                    </div>
                    <BookOpen className="text-blue-500" size={20} />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border-purple-100">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-purple-800 tracking-wider">Poin Keluarga</p>
                      <h4 className="text-2xl font-bold text-purple-950 mt-1">2,450 XP</h4>
                    </div>
                    <Award className="text-purple-500" size={20} />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-amber-50 border-amber-100">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-amber-800 tracking-wider">Next Event</p>
                      <h4 className="text-lg font-bold text-amber-950 mt-1 leading-tight">Idul Adha</h4>
                      <p className="text-[10px] text-amber-700 font-medium">10 Dzulhijjah (65 Hari lagi)</p>
                    </div>
                    <Calendar className="text-amber-500" size={20} />
                  </div>
                </CardContent>
              </Card>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                 <CardHeader>
                    <CardTitle className="text-lg">Kalender Hijriah & Event</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <div className="space-y-4">
                       {[
                         { date: '1 Ramadhan', title: 'Awal Puasa Ramadhan', color: 'bg-emerald-100 text-emerald-700' },
                         { date: '17 Ramadhan', title: 'Nuzulul Quran', color: 'bg-emerald-50 text-emerald-600' },
                         { date: '1 Syawal', title: 'Hari Raya Idul Fitri', color: 'bg-amber-100 text-amber-700' },
                         { date: '9 Dzulhijjah', title: 'Puasa Arafah', color: 'bg-blue-100 text-blue-700' },
                       ].map((ev, i) => (
                         <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                            <div className={`w-20 text-center py-2 rounded-lg font-bold text-xs ${ev.color}`}>
                               {ev.date}
                            </div>
                            <div className="flex-1">
                               <h5 className="text-sm font-semibold">{ev.title}</h5>
                               <p className="text-[10px] text-muted-foreground italic">Momen ketaatan dan kebersamaan keluarga.</p>
                            </div>
                            <ChevronRight size={16} className="text-muted-foreground" />
                         </div>
                       ))}
                    </div>
                 </CardContent>
              </Card>

              <Card>
                 <CardHeader>
                    <CardTitle className="text-lg">Merchant Halal Terdekat</CardTitle>
                    <CardDescription>Cari pilihan konsumsi sehat & berkah.</CardDescription>
                 </CardHeader>
                 <CardContent>
                    <div className="space-y-4">
                       <div className="aspect-square bg-muted rounded-xl relative overflow-hidden flex items-center justify-center">
                          <MapPin size={40} className="text-muted-foreground/20" />
                          <div className="absolute inset-0 bg-emerald-900/10" />
                          <Badge className="absolute top-2 right-2 bg-emerald-600">Maps Active</Badge>
                       </div>
                       <Button className="w-full gap-2 border-emerald-deep text-emerald-800" variant="outline">
                         Cari Restoran Halal
                       </Button>
                    </div>
                 </CardContent>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="quran" className="mt-6">
           <Card>
             <CardHeader>
               <CardTitle>Rencana Khatam Quran</CardTitle>
               <CardDescription>Target: Ramadhan (Tinggal 45 hari)</CardDescription>
             </CardHeader>
             <CardContent className="space-y-6">
                <div className="space-y-2">
                   <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-primary">Progress Saat Ini: Juz 18</span>
                      <span className="text-muted-foreground">60%</span>
                   </div>
                   <Progress value={60} className="h-3" />
                </div>
                
                <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                   {Array.from({length: 30}).map((_, i) => (
                     <div 
                       key={i} 
                       className={`aspect-square rounded-md flex items-center justify-center text-[10px] font-bold border ${i+1 <= 18 ? 'bg-emerald-100 border-emerald-200 text-emerald-700' : 'bg-muted/50 border-border text-muted-foreground'}`}
                     >
                       {i+1}
                     </div>
                   ))}
                </div>

                <Button className="w-full">Update Progress (Lanjut Juz 19)</Button>
             </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="fasting" className="mt-6 space-y-4">
           <Card>
             <CardHeader>
               <CardTitle>Log Puasa Sunnah & Wajib</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="flex gap-4 items-center justify-between mb-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="flex items-center gap-3">
                      <Utensils className="text-amber-600" size={24} />
                      <div>
                        <h4 className="font-bold text-amber-900">Besok Kamis!</h4>
                        <p className="text-xs text-amber-700">Waktunya Puasa Sunnah Senin-Kamis.</p>
                      </div>
                    </div>
                    <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">Niat Puasa</Button>
                </div>

                <div className="space-y-3">
                   <h5 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Riwayat Terakhir</h5>
                   {[
                     { name: 'Puasa Ayyamul Bidh', date: '14-15 Syawal', status: 'Selesai' },
                     { name: 'Hutang Puasa (Qadha)', date: '10 Syawal', status: 'Selesai' },
                   ].map((p, i) => (
                     <div key={i} className="flex justify-between items-center p-3 border rounded-xl">
                        <div className="flex items-center gap-3">
                           <CheckCircle2 className="text-emerald-500" size={16} />
                           <div>
                              <p className="text-sm font-semibold">{p.name}</p>
                              <p className="text-[10px] text-muted-foreground">{p.date}</p>
                           </div>
                        </div>
                        <Badge variant="outline" className="text-[10px]">{p.status}</Badge>
                     </div>
                   ))}
                </div>
             </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="habits" className="mt-6">
           <Card>
             <CardHeader>
               <CardTitle>Habit Tracker Keluarga</CardTitle>
               <CardDescription>Bangun konsistensi dalam kebaikan.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
                {[
                  { name: 'Sholat Tahajjud', xp: '+50 XP', icon: <Moon size={16} /> },
                  { name: 'Sholat Dhuha', xp: '+30 XP', icon: <Star size={16} /> },
                  { name: 'Dzikir Pagi/Petang', xp: '+20 XP', icon: <CheckCircle2 size={16} /> },
                  { name: 'Sedekah Subuh', xp: '+40 XP', icon: <Plus size={16} /> },
                ].map((h, i) => (
                   <div key={i} className="flex items-center justify-between p-4 border rounded-2xl group hover:border-primary transition-colors">
                      <div className="flex items-center gap-4">
                         <div className="p-2 bg-muted rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                            {h.icon}
                         </div>
                         <div>
                            <h5 className="font-semibold text-sm">{h.name}</h5>
                            <p className="text-[10px] text-muted-foreground">Dilakukan hari ini</p>
                         </div>
                      </div>
                      <Button size="sm" variant="ghost" className="text-xs font-bold text-primary">{h.xp}</Button>
                   </div>
                ))}
             </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="dzikir" className="mt-6">
           <Card className="overflow-hidden">
             <div className="bg-emerald-900 p-8 text-center text-white space-y-4">
                <p className="text-emerald-300 text-sm uppercase tracking-widest font-bold">{dzikirPhrase}</p>
                <div 
                   className="w-48 h-48 rounded-full border-8 border-emerald-800 flex items-center justify-center mx-auto cursor-pointer active:scale-95 transition-transform bg-emerald-950/50 shadow-2xl"
                   onClick={() => {
                     setDzikirCount(prev => prev >= dzikirTarget ? 0 : prev + 1);
                     if (dzikirCount + 1 === dzikirTarget) {
                        toast.success("Barakallah! Target dzikir tercapai.");
                     }
                   }}
                >
                   <span className="text-6xl font-black">{dzikirCount}</span>
                </div>
                <div className="flex justify-center gap-4 pt-4">
                   {["Subhanallah", "Alhamdulillah", "Allahu Akbar"].map(p => (
                     <Button 
                       key={p} 
                       size="sm" 
                       variant={dzikirPhrase === p ? "secondary" : "ghost"} 
                       className={dzikirPhrase === p ? "bg-amber-400 text-emerald-950" : "text-emerald-200"}
                       onClick={() => {
                         setDzikirPhrase(p);
                         setDzikirCount(0);
                       }}
                     >
                       {p}
                     </Button>
                   ))}
                </div>
             </div>
             <CardContent className="p-6 flex justify-between items-center bg-muted/30">
                <div>
                   <p className="text-xs font-medium text-muted-foreground uppercase">Target Sesi</p>
                   <p className="text-lg font-bold">{dzikirTarget}x</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setDzikirCount(0)}>Reset</Button>
             </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="children" className="mt-6">
           <Card className="border-t-4 border-amber-400">
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 < Award size={20} className="text-amber-500" />
                 Papan Skor Sholat Anak (Gamified)
               </CardTitle>
               <CardDescription>Beri apresiasi atas setiap sujud mereka.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-6">
                {[
                  { name: 'Aisyah', level: 'Prajurit Surga', progress: 85, avatar: 'A' },
                  { name: 'Hasan', level: 'Penghafal Quran Muda', progress: 45, avatar: 'H' },
                ].map((child, i) => (
                  <div key={i} className="p-4 border rounded-2xl bg-gradient-to-r from-amber-50/50 to-transparent">
                     <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-amber-200 flex items-center justify-center font-bold text-amber-700 text-xl border-2 border-white shadow-sm">
                           {child.avatar}
                        </div>
                        <div className="flex-1">
                           <h4 className="font-bold text-emerald-950">{child.name}</h4>
                           <p className="text-xs text-amber-700 font-medium">{child.level}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-lg font-bold text-emerald-900">{child.progress}%</p>
                           <p className="text-[10px] text-muted-foreground uppercase">Kepatuhan Sholat</p>
                        </div>
                     </div>
                     <Progress value={child.progress} className="h-2 bg-amber-200" />
                     <div className="flex justify-between mt-4">
                        <div className="flex gap-1">
                           {['S', 'D', 'A', 'M', 'I'].map(p => (
                             <div key={p} className="w-6 h-6 rounded-md bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                               {p}
                             </div>
                           ))}
                        </div>
                        <Button size="sm" variant="outline" className="h-7 text-[10px] border-amber-300 text-amber-800">Beri Hadiah</Button>
                     </div>
                  </div>
                ))}
             </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
