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
import { Plus, Wallet, Loader2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import { mutate } from "swr";

const formSchema = z.object({
  name: z.string().min(2, "Nama dompet minimal 2 karakter"),
  balance: z.string().refine((val) => !isNaN(Number(val)), "Saldo harus berupa angka"),
  currency: z.string().min(1, "Pilih mata uang"),
  type: z.string().min(1, "Pilih tipe dompet"),
});

export function AddWalletModal({ wallet }: { wallet?: { id: string; name?: string; balance?: number; currency?: string; type?: string } }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isEditing = !!wallet;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: wallet?.name || "",
      balance: wallet?.balance?.toString() || "0",
      currency: wallet?.currency || "IDR",
      type: wallet?.type || "CASH",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      if (isEditing) {
        await apiClient.put(`/finance/wallets/${wallet.id}`, {
          ...values,
          balance: Number(values.balance),
        });
        toast.success("Dompet berhasil diperbarui.");
      } else {
        await apiClient.post("/finance/wallets", {
          ...values,
          balance: Number(values.balance),
        });
        toast.success("Dompet berhasil ditambahkan! Barakallah.");
      }
      mutate("/finance/wallets");
      setOpen(false);
      if (!isEditing) form.reset();
    } catch {
      toast.error(isEditing ? "Gagal memperbarui dompet." : "Gagal menambahkan dompet.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditing ? (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
            <Edit2 size={14} />
          </Button>
        ) : (
          <Button variant="outline" className="border-primary/20 text-primary">
            <Plus size={18} className="mr-2" />
            Tambah Dompet
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="text-primary" />
            {isEditing ? "Edit Dompet" : "Tambah Dompet Baru"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Perbarui informasi sumber dana Anda." 
              : "Catat sumber dana keluarga Anda untuk pengelolaan yang lebih amanah."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Dompet</FormLabel>
                  <FormControl>
                    <Input placeholder="Misal: Tabungan Haji, Dompet Utama" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                          <SelectValue placeholder="Pilih tipe" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CASH">Tunai</SelectItem>
                        <SelectItem value="BANK">Rekening Bank</SelectItem>
                        <SelectItem value="SAVINGS">Tabungan</SelectItem>
                        <SelectItem value="INVESTMENT">Investasi</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mata Uang</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Mata uang" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="IDR">IDR (Rp)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="SAR">SAR (﷼)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Saldo Awal</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Dompet
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
