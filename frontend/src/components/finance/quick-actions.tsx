"use client";

import { Button } from "@/components/ui/button";
import { Coffee, Home, Zap, Heart } from "lucide-react";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";
import { mutate } from "swr";

const QUICK_ACTIONS = [
  { name: "Sembako", amount: 150000, category: "Pangan", icon: Home, color: "text-emerald-500" },
  { name: "Listrik", amount: 200000, category: "Utilitas", icon: Zap, color: "text-amber-500" },
  { name: "Sedekah", amount: 50000, category: "Sedekah", icon: Heart, color: "text-rose-500" },
  { name: "Kopi/Jajan", amount: 25000, category: "Pangan", icon: Coffee, color: "text-blue-500" },
];

export function QuickTransactionActions({ walletId }: { walletId?: string }) {
  const handleQuickAdd = async (action: typeof QUICK_ACTIONS[0]) => {
    if (!walletId) {
      toast.error("Pilih dompet terlebih dahulu atau tambah dompet baru.");
      return;
    }

    try {
      await apiClient.post("/finance/transactions", {
        walletId,
        amount: action.amount,
        type: "EXPENSE",
        category: action.category,
        description: action.name,
      });
      toast.success(`Berhasil mencatatkan ${action.name}.`);
      mutate("/finance/transactions");
      mutate("/finance/wallets");
      mutate("/finance/charts/cash-flow");
      mutate("/finance/charts/category-spending");
    } catch {
      toast.error("Gagal menambahkan transaksi cepat.");
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {QUICK_ACTIONS.map((action) => (
        <Button
          key={action.name}
          variant="outline"
          className="h-auto py-3 px-4 flex flex-col items-center gap-1 hover:border-primary/50 transition-all border-2"
          onClick={() => handleQuickAdd(action)}
        >
          <action.icon size={20} className={action.color} />
          <span className="text-[10px] uppercase tracking-wider font-bold">{action.name}</span>
          <span className="text-xs font-semibold">Rp {(action.amount/1000)}rb</span>
        </Button>
      ))}
    </div>
  );
}
