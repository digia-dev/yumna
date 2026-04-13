"use client";

import { 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import useSWR from "swr";
import apiClient from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { PieChart, Loader2 } from "lucide-react";

const fetcher = (url: string) => apiClient.get(url).then((res) => res.data);

const COLORS = [
  '#0d4433', // Deep Emerald
  '#10b981', // Emerald
  '#f59e0b', // Amber/Gold
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#64748b'  // Slate
];

export function CategoryDonutChart() {
  const { data, isLoading } = useSWR("/finance/charts/category-spending", fetcher);

  if (isLoading) return (
    <div className="h-[300px] flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" />
    </div>
  );

  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="text-lg font-bold font-display flex items-center gap-2">
          <PieChart className="text-primary" size={20} />
          Alokasi Pengeluaran
        </CardTitle>
        <CardDescription>Berdasarkan kategori bulan ini</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {data && data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry: { name: string; value: number }, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => formatCurrency(Number(val) || 0)}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                />
              </RePieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground italic text-sm">
              <AlertCircle size={40} className="mb-2 opacity-20" />
              Belum ada data pengeluaran.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

import { AlertCircle } from "lucide-react";
