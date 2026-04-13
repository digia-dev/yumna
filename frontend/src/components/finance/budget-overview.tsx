"use client";

import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { Loader2, AlertCircle } from "lucide-react";
import useSWR from "swr";
import apiClient from "@/lib/api-client";

const fetcher = (url: string) => apiClient.get(url).then((res) => res.data);

export function BudgetingOverview() {
  const { data: budgets, error, isLoading } = useSWR("/budgeting/status", fetcher);

  if (isLoading) return (
    <div className="flex justify-center p-8">
      <Loader2 className="animate-spin text-primary" />
    </div>
  );

  if (error) return (
    <div className="flex items-center gap-2 text-destructive p-4 border border-destructive/20 rounded-lg bg-destructive/5">
      <AlertCircle size={18} />
      <p className="text-sm">Gagal memuat data anggaran.</p>
    </div>
  );

  if (!budgets || budgets.length === 0) return (
    <div className="text-center p-8 border-2 border-dashed rounded-xl">
      <p className="text-muted-foreground text-sm">Belum ada anggaran yang diatur bulan ini.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {budgets.map((b: { category: string; spent: number; limit: number; percentage: number; remaining: number }) => (
        <div key={b.category} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{b.category}</span>
            <span className="text-muted-foreground">
              {formatCurrency(b.spent)} / {formatCurrency(b.limit)}
            </span>
          </div>
          <Progress 
            value={b.percentage} 
            className={`h-2 ${b.percentage >= 100 ? "bg-destructive/20" : b.percentage >= 80 ? "bg-amber-200" : ""}`}
            indicatorClassName={b.percentage >= 100 ? "bg-destructive" : b.percentage >= 80 ? "bg-amber-500" : "bg-primary"}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground italic">
            <span>Sisa: {formatCurrency(b.remaining)}</span>
            <span>{Math.round(b.percentage)}% terpakai</span>
          </div>
        </div>
      ))}
    </div>
  );
}
