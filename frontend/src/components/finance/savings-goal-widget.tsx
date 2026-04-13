"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { Target, TrendingUp, Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
}

export function SavingsGoalWidget() {
  // Mock data for initial design
  const goals: SavingsGoal[] = [
    {
      id: "1",
      name: "Tabungan Haji Ayah & Ibu",
      targetAmount: 100000000,
      currentAmount: 45000000,
      deadline: "2027-12-31",
    },
    {
      id: "2",
      name: "Pendidikan Anak",
      targetAmount: 50000000,
      currentAmount: 12000000,
      deadline: "2030-06-01",
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {goals.map((goal) => {
        const percentage = (goal.currentAmount / goal.targetAmount) * 100;
        return (
          <Card key={goal.id} className="border-secondary/20 bg-secondary/5">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                    <Target size={20} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{goal.name}</CardTitle>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
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
              <div className="flex justify-between text-sm">
                <span className="font-bold text-lg">{formatCurrency(goal.currentAmount)}</span>
                <span className="text-muted-foreground self-end">Tujuan: {formatCurrency(goal.targetAmount)}</span>
              </div>
              <Progress value={percentage} indicatorClassName="bg-secondary" className="h-2 bg-secondary/10" />
              <p className="text-[10px] text-center text-muted-foreground italic">
                {Math.round(percentage)}% dari target tercapai. InshaAllah segera terpenuhi.
              </p>
            </CardContent>
          </Card>
        );
      })}
      
      <Button variant="outline" className="h-full border-dashed border-2 flex flex-col gap-2 py-8 hover:bg-secondary/5 text-muted-foreground hover:text-secondary hover:border-secondary/50">
        <Plus size={24} />
        <span className="text-sm font-medium">Tambah Target Impian</span>
      </Button>
    </div>
  );
}
