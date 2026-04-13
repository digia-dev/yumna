"use client";

import { Trash2, Edit2, Wallet as WalletIcon, ShoppingCart, Car, Zap, CreditCard, Heart, GraduationCap, Utensils, Activity, MoreHorizontal } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TransactionRowProps {
  transaction: {
    id: string;
    amount: number;
    type: "INCOME" | "EXPENSE";
    category: string;
    description: string;
    date: string;
    wallet: {
      name: string;
    };
  };
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

const categoryIcons: Record<string, ({ size, className }: { size?: number; className?: string }) => any> = {
  "Pangan": Utensils,
  "Transportasi": Car,
  "Utilitas": Zap,
  "Cicilan": CreditCard,
  "Sedekah": Heart,
  "Pendidikan": GraduationCap,
  "Hiburan": ShoppingCart,
  "Kesehatan": Activity,
  "Lainnya": WalletIcon,
};

export function TransactionRow({ transaction, onDelete, onEdit }: TransactionRowProps) {
  const Icon = categoryIcons[transaction.category] || categoryIcons["Lainnya"];
  const isIncome = transaction.type === "INCOME";

  return (
    <div className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors group">
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-xl ${isIncome ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="font-semibold text-sm md:text-base">{transaction.description || transaction.category}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-muted-foreground">{new Date(transaction.date).toLocaleDateString('id-ID')}</p>
            <span className="text-[10px] text-muted-foreground/50">•</span>
            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
              <WalletIcon size={12} className="text-primary/60" />
              {transaction.wallet.name}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className={`text-right font-bold text-sm md:text-base ${isIncome ? 'text-emerald-600' : 'text-foreground'}`}>
          {isIncome ? '+' : '-'} {formatCurrency(Number(transaction.amount))}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(transaction.id)}>
              <Edit2 size={14} className="mr-2" />
              Ubah
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive" 
              onClick={() => onDelete?.(transaction.id)}
            >
              <Trash2 size={14} className="mr-2" />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
