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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRightLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import { mutate } from "swr";
import useSWR from "swr";

const fetcher = (url: string) => apiClient.get(url).then((res) => res.data);

const formSchema = z.object({
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Jumlah harus lebih dari 0"),
  fromWalletId: z.string().min(1, "Pilih dompet asal"),
  toWalletId: z.string().min(1, "Pilih dompet tujuan"),
  description: z.string().optional(),
}).refine(data => data.fromWalletId !== data.toWalletId, {
  message: "Dompet asal dan tujuan tidak boleh sama",
  path: ["toWalletId"],
});

export function TransferFundsModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: wallets } = useSWR("/finance/wallets", fetcher);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      fromWalletId: "",
      toWalletId: "",
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      await apiClient.post("/finance/transfer", {
        ...values,
        amount: Number(values.amount),
      });
      toast.success("Pemindahan dana berhasil! Saldo telah diperbarui.");
      mutate("/finance/transactions");
      mutate("/finance/wallets");
      setOpen(false);
      form.reset();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error ? (error as { response?: { data?: { message?: string } } }).response?.data?.message : undefined;
      toast.error(errorMessage || "Gagal memindahkan dana.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-secondary hover:bg-secondary/10 text-secondary">
          <ArrowRightLeft size={18} className="mr-2" />
          Pindah Dana
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="text-secondary" />
            Pindah Dana Antar Dompet
          </DialogTitle>
          <DialogDescription>
            Pindahkan dana dari satu dompet ke dompet lainnya dalam keluarga.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="fromWalletId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dari Dompet</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih dompet asal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {wallets?.filter((w: { isDeleted?: boolean }) => !w.isDeleted).map((w: { id: string; name: string; balance: number }) => (
                          <SelectItem key={w.id} value={w.id}>
                            {w.name} (Rp {Number(w.balance).toLocaleString()})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="toWalletId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ke Dompet</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih dompet tujuan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {wallets?.filter((w: { isDeleted?: boolean }) => !w.isDeleted).map((w: { id: string; name: string }) => (
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

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah (Rp)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keterangan (Opsional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Tujuan pemindahan dana..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Pindahkan Dana Sekarang
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
