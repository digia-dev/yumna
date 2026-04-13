"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scissors, Users, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function SplitBillModal() {
  const [amount, setAmount] = useState("");
  const [personCount, setPersonCount] = useState("2");
  const [result, setResult] = useState<number | null>(null);

  const handleCalculate = () => {
    const total = parseFloat(amount.replace(/[^\d]/g, ''));
    const count = parseInt(personCount);
    if (total && count) {
      setResult(total / count);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-2">
          <Scissors size={18} />
          Bagi Tagihan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scissors className="text-primary" size={20} />
            Bagi Tagihan (Split Bill)
          </DialogTitle>
          <DialogDescription>
            Hitung pembagian pengeluaran bersama anggota keluarga atau tamu.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="total">Total Tagihan</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">Rp</span>
              <Input 
                id="total" 
                placeholder="0" 
                className="pl-10"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="people">Jumlah Orang</Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input 
                id="people" 
                type="number"
                min="2"
                className="pl-10"
                value={personCount}
                onChange={(e) => setPersonCount(e.target.value)}
              />
            </div>
          </div>

          {result !== null && (
            <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2 animate-in fade-in slide-in-from-top-4">
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Masing-masing Membayar:</p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(result)}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleCalculate} className="w-full gap-2">
            Hitung Sekarang <ArrowRight size={16} />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
