"use client";

import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileUp, Table, Upload, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import { mutate } from "swr";

export function ImportCSVModal({ walletId }: { walletId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Array<{ date?: string; amount?: number; description?: string; type?: string }>>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const text = e.target?.result as string;
      const lines = text.split("\n");
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
      
      const data = lines.slice(1).map(line => {
        const values = line.split(",").map(v => v.trim());
        if (values.length < 3) return null;
        
        // Basic mapping: date, amount, description, type
        // Expecting columns in some order or searching by header
        const obj: { date?: string; amount?: number; description?: string; type?: string } = {};
        headers.forEach((h, i) => {
          if (h.includes("date")) obj.date = values[i];
          if (h.includes("amount")) obj.amount = Number(values[i].replace(/[^0-9.-]+/g, ""));
          if (h.includes("desc")) obj.description = values[i];
          if (h.includes("type")) obj.type = values[i].toUpperCase();
        });

        // Default type if missing
        if (!obj.type) obj.type = (obj.amount || 0) > 0 ? "INCOME" : "EXPENSE";
        if ((obj.amount || 0) < 0) obj.amount = Math.abs(obj.amount || 0);
        
        return obj;
      }).filter(Boolean);

      setPreview(data.slice(0, 5) as any); // Show first 5
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!file) return;
    try {
      setLoading(true);
      // We parse the full file here for the actual import
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        const lines = text.split("\n");
        const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
        
        const transactions = lines.slice(1).map(line => {
          const values = line.split(",").map(v => v.trim());
          if (values.length < 3) return null;
          const obj: { date?: string; amount?: number; description?: string; type?: string } = {};
          headers.forEach((h, i) => {
            if (h.includes("date")) obj.date = values[i];
            if (h.includes("amount")) obj.amount = Number(values[i].replace(/[^0-9.-]+/g, ""));
            if (h.includes("desc")) obj.description = values[i];
            if (h.includes("type")) obj.type = values[i].toUpperCase();
          });
          if (!obj.type) obj.type = (obj.amount || 0) > 0 ? "INCOME" : "EXPENSE";
          if ((obj.amount || 0) < 0) obj.amount = Math.abs(obj.amount || 0);
          return obj;
        }).filter(Boolean);

        const res = await apiClient.post(`/finance/wallets/${walletId}/import`, { transactions: transactions as any });
        toast.success(`Import berhasil! ${res.data.imported} transaksi baru ditambahkan, ${res.data.skipped} duplikat dilewati.`);
        mutate("/finance/wallets");
        mutate("/finance/transactions");
        setOpen(false);
      };
      reader.readAsText(file);
    } catch {
      toast.error("Gagal melakukan import.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileUp size={14} />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Table className="text-primary" />
            Rekonsiliasi Otomatis (CSV)
          </DialogTitle>
          <DialogDescription>
            Unggah mutasi rekening (CSV) untuk mencatat transaksi secara otomatis. Kami akan mendeteksi duplikat agar data tetap akurat.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="border-2 border-dashed border-muted rounded-xl p-8 text-center hover:bg-muted/50 transition-colors relative">
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileChange} 
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
            <div className="text-sm font-medium">
              {file ? file.name : "Klik atau seret file CSV ke sini"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Kolom wajib: date, amount, description</p>
          </div>

          {preview.length > 0 && (
            <div className="text-sm">
              <div className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle size={14} className="text-amber-500" />
                Preview Data (5 baris pertama):
              </div>
              <div className="bg-muted rounded-lg p-3 space-y-2 overflow-auto max-h-40 text-xs">
                {preview.map((p, i) => (
                  <div key={i} className="flex justify-between border-b border-border pb-1 last:border-0">
                    <span>{p.date} - {p.description}</span>
                    <span className={p.type === "INCOME" ? "text-emerald-500" : "text-rose-500"}>
                      {p.type === "INCOME" ? "+" : "-"}{(p.amount || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
          <Button onClick={handleImport} disabled={loading || !file} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 size={16} />}
            Mulai Sinkronisasi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
