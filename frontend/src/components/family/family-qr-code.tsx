"use client";

import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, Share2, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface FamilyQRCodeProps {
  familyId: string;
  familyName: string;
}

export function FamilyQRCode({ familyId, familyName }: FamilyQRCodeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(familyId);
    setCopied(true);
    toast.success("ID Keluarga berhasil disalin!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <QrCode size={18} />
          Bagikan ID
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle>ID Keluarga {familyName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-6 py-6">
          <div className="p-4 bg-white rounded-2xl shadow-inner border">
            <QRCodeSVG 
              value={familyId} 
              size={200}
              level="H"
              includeMargin={false}
              fgColor="#0d4433"
            />
          </div>
          <div className="space-y-2 w-full">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Kode Unik</p>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg font-mono text-lg break-all">
              <span className="flex-1 truncate">{familyId}</span>
              <Button size="icon" variant="ghost" onClick={handleCopy}>
                {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground italic">
            &quot;Pindai atau bagikan kode ini untuk mengundang anggota keluarga baru secara instan.&quot;
          </p>
          <Button className="w-full gap-2">
            <Share2 size={18} />
            Bagikan Link Undangan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
