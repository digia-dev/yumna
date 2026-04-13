"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import { mutate } from "swr";
import useSWR from "swr";

const fetcher = (url: string) => apiClient.get(url).then((res) => res.data);

const formSchema = z.object({
  amount: z.string().refine((val) => !isNaN(Number(val)), "Jumlah harus berupa angka"),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(1, "Pilih kategori"),
  description: z.string().min(1, "Cantumkan keterangan"),
  walletId: z.string().min(1, "Pilih dompet"),
  status: z.enum(["HALAL", "SUBHAT", "HARAM"]),
});

export function AddTransactionModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState("");
  const [showAiInput, setShowAiInput] = useState(true);

  const { data: wallets } = useSWR("/finance/wallets", fetcher);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      type: "EXPENSE",
      category: "Lainnya",
      description: "",
      walletId: "",
      status: "HALAL",
    },
  });

  const handleAiExtract = async () => {
    if (!aiText) return;
    try {
      setAiLoading(true);
      const res = await apiClient.post("/ai/extract", { text: aiText });
      const data: { amount: number; type: string; category: string; description: string; walletName?: string } = res.data;

      form.setValue("amount", data.amount.toString());
      form.setValue("type", data.type as "INCOME" | "EXPENSE");
      form.setValue("category", data.category);
      form.setValue("description", data.description);
      
      const walletName = data.walletName;
      if (walletName && wallets) {
        const foundWallet = wallets.find((w: { name: string; id: string }) => 
          w.name.toLowerCase().includes(walletName.toLowerCase())
        );
        if (foundWallet) form.setValue("walletId", foundWallet.id);
      }

      setShowAiInput(false);
      toast.success("Yumna berhasil mengekstrak data. Silakan konfirmasi.");
    } catch {
      toast.error("Maaf, Yumna kesulitan memahami pesan tersebut. Coba manual ya?");
    } finally {
      setAiLoading(false);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      await apiClient.post("/finance/transactions", {
        ...values,
        amount: Number(values.amount),
      });
      toast.success("Transaksi berhasil dicatat! Semoga berkah.");
      mutate("/finance/transactions");
      mutate("/finance/wallets");
      setOpen(false);
      form.reset();
      setShowAiInput(true);
      setAiText("");
    } catch {
      toast.error("Gagal mencatat transaksi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <TrendingUp size={18} className="mr-2" />
          Catat Transaksi
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="text-primary" />
            Catat Keuangan Keluarga
          </DialogTitle>
          <DialogDescription>
            Masukkan transaksi secara manual atau biarkan Yumna membantu mengekstrak pesan Anda.
          </DialogDescription>
        </DialogHeader>

        {showAiInput ? (
          <div className="space-y-4 pt-4">
            <div className="relative">
              <Input
                placeholder="Contoh: 'Beli token listrik 200rb dari Dompet Utama'"
                value={aiText}
                onChange={(e) => setAiText(e.target.value)}
                className="pr-10"
                onKeyDown={(e) => e.key === 'Enter' && handleAiExtract()}
              />
              <Sparkles className="absolute right-3 top-2.5 h-5 w-5 text-primary animate-pulse" />
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground italic">
              <span>Gunakan bahasa sehari-hari.</span>
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => setShowAiInput(false)}
                className="h-auto p-0"
              >
                Atau input manual <ArrowRight size={12} className="ml-1" />
              </Button>
            </div>
            <Button 
              className="w-full bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 border" 
              onClick={handleAiExtract}
              disabled={aiLoading || !aiText}
            >
              {aiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Minta Yumna Ekstrak
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipe</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Tipe" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="EXPENSE">Pengeluaran</SelectItem>
                          <SelectItem value="INCOME">Pemasukan</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="walletId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dompet</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih dompet" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {wallets?.map((w: { id: string; name: string }) => (
                            <SelectItem key={w.id} value={w.id}>
                              {w.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah (Rp)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["Pangan", "Transportasi", "Utilitas", "Cicilan", "Sedekah", "Pendidikan", "Hiburan", "Kesehatan", "Lainnya"].map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Kehalalan (Self-Audit)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className={
                          field.value === 'HALAL' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          field.value === 'SUBHAT' ? "bg-amber-50 text-amber-700 border-amber-200" :
                          "bg-red-50 text-red-700 border-red-200"
                        }>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="HALAL">Halal (Murni)</SelectItem>
                        <SelectItem value="SUBHAT">Subhat (Ragu-ragu)</SelectItem>
                        <SelectItem value="HARAM">Haram (Wajib Dihindari/Dibersihkan)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-[10px]">
                      Pembedaan ini membantu Anda memantau keberkahan harta keluarga.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keterangan</FormLabel>
                    <FormControl>
                      <Input placeholder="Beli apa?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between items-center pt-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowAiInput(true)}
                >
                  Gunakan AI lagi
                </Button>
                <DialogFooter>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Konfirmasi & Simpan
                  </Button>
                </DialogFooter>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
