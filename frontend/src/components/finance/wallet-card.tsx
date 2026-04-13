"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Wallet as WalletIcon, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WalletCardProps {
  wallet: {
    id: string;
    name: string;
    balance: number;
    currency: string;
    type: string;
  };
}

// Mock conversion for UI demonstration (Tasks 205)
const MOCK_RATES: Record<string, number> = {
  USD: 16250,
  SGD: 12050,
  SAR: 4330
};

export function WalletCard({ wallet }: WalletCardProps) {
  const isIDR = wallet.currency === "IDR";
  const convertedValue = !isIDR ? wallet.balance * (MOCK_RATES[wallet.currency] || 1) : null;

  return (
    <Card className="hover:shadow-md transition-all cursor-pointer group border-2 hover:border-primary/30">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
            <WalletIcon size={20} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">{wallet.name}</p>
            <div className="flex items-center gap-1">
              <p className="text-lg font-bold">
                {wallet.currency} {Number(wallet.balance).toLocaleString('id-ID')}
              </p>
              {!isIDR && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info size={14} className="text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Est. {formatCurrency(convertedValue || 0)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>
        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 uppercase text-[10px] font-bold">
          {wallet.type || "Cash"}
        </Badge>
      </CardContent>
    </Card>
  );
}
