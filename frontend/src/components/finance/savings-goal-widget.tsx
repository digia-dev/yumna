"use client";

import { useState } from "react";
import useSWR from "swr";
import { Loader2, Target, TrendingUp, Calendar, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog as ShadcnDialog, 
  DialogContent as ShadcnDialogContent, 
  DialogHeader as ShadcnDialogHeader, 
  DialogTitle as ShadcnDialogTitle,
  DialogFooter as ShadcnDialogFooter 
} from "@/components/ui/dialog";
import apiClient from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export function SavingsGoalWidget() {
  const { data: goals, isLoading, mutate: mutateGoals } = useSWR("/finance/savings-goals", (url) => 
    apiClient.get(url).then(res => res.data)
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: "", targetAmount: "", deadline: "" });
  const [loading, setLoading] = useState(false);

  const handleAddGoal = async () => {
    if (!newGoal.name || !newGoal.targetAmount) {
      toast.error("Nama dan target harus diisi.");
      return;
    }
    try {
      setLoading(true);
      await apiClient.post("/finance/savings-goals", {
        ...newGoal,
        targetAmount: Number(newGoal.targetAmount)
      });
      toast.success("Target impian berhasil ditambahkan!");
      mutateGoals();
      setShowAddModal(false);
      setNewGoal({ name: "", targetAmount: "", deadline: "" });
    } catch (e) {
      toast.error("Gagal menambahkan target.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return (
    <div className="flex justify-center p-8">
      <Loader2 className="animate-spin text-secondary" size={32} />
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals && goals.length > 0 ? goals.map((goal: any) => {
          const percentage = (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100;
          return (
            <Card key={goal.id} className="border-secondary/20 bg-secondary/5 group hover:border-secondary/50 transition-all">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-secondary/10 rounded-lg text-secondary group-hover:scale-110 transition-transform">
                      <Target size={20} />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold">{goal.name}</CardTitle>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-tight">
                        <Calendar size={10} />
                        Target: {goal.deadline ? new Date(goal.deadline).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' }) : "Tanpa Tenggat"}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary">
                    <TrendingUp size={16} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="font-black text-2xl text-secondary">{formatCurrency(Number(goal.currentAmount))}</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">TUJUAN: {formatCurrency(Number(goal.targetAmount))}</span>
                </div>
                <Progress value={percentage} indicatorClassName="bg-secondary" className="h-2 bg-secondary/20" />
                <p className="text-[10px] text-center text-muted-foreground font-medium italic">
                  {Math.round(percentage)}% tercapai. {percentage >= 100 ? "Alhamdulillah, target terpenuhi!" : "InshaAllah segera terwujud."}
                </p>
              </CardContent>
            </Card>
          );
        }) : (
          <div className="col-span-full py-8 text-center bg-muted/20 border-2 border-dashed rounded-xl text-muted-foreground italic text-xs">
             Belum ada target impian. Klik tombol di samping untuk memulai.
          </div>
        )}
        
        <Button 
          variant="outline" 
          onClick={() => setShowAddModal(true)}
          className="h-full border-dashed border-2 flex flex-col gap-2 py-8 bg-slate-50/50 hover:bg-secondary/5 text-muted-foreground hover:text-secondary hover:border-secondary/50 transition-all"
        >
          <div className="p-3 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
            <Plus size={24} />
          </div>
          <span className="text-sm font-bold uppercase tracking-widest">Tambah Target Impian</span>
        </Button>
      </div>

      <ShadcnDialog open={showAddModal} onOpenChange={setShowAddModal}>
        <ShadcnDialogContent>
          <ShadcnDialogHeader>
            <ShadcnDialogTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
              <Target className="text-secondary" />
              Target Impian Baru
            </ShadcnDialogTitle>
          </ShadcnDialogHeader>
          <div className="space-y-4 py-4">
             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nama Impian (e.g. Tabungan Haji)</label>
               <Input 
                 placeholder="Masukkan nama..." 
                 value={newGoal.name}
                 onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
               />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nominal Target (IDR)</label>
                 <Input 
                   type="number" 
                   placeholder="Rp" 
                   value={newGoal.targetAmount}
                   onChange={(e) => setNewGoal({...newGoal, targetAmount: e.target.value})}
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tenggat Waktu</label>
                 <Input 
                   type="date" 
                   value={newGoal.deadline}
                   onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                 />
               </div>
             </div>
          </div>
          <ShadcnDialogFooter>
             <Button className="w-full bg-secondary hover:bg-secondary/90 h-12 font-black uppercase tracking-widest" onClick={handleAddGoal} disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Target"}
             </Button>
          </ShadcnDialogFooter>
        </ShadcnDialogContent>
      </ShadcnDialog>
    </>
  );
}
