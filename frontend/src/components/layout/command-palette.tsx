"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Calculator,
  Calendar,
  CreditCard,
  MessageSquare,
  Search,
  Settings,
  Smile,
  User,
  Plus,
  Zap,
  Wallet as WalletIcon,
  Moon,
  Users,
  History as HistoryIcon,
  MessageSquare as MessageIcon,
  Sparkles,
  Heart,
  BookOpen,
  FileText,
  Shield,
} from "lucide-react"

import { useSakinah } from "@/components/providers/sakinah-provider"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const { isSakinahMode, toggleSakinahMode } = useSakinah()
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Cari menu atau perintah..." />
      <CommandList>
        <CommandEmpty>Hasil tidak ditemukan.</CommandEmpty>
        <CommandGroup heading="Aksi Cepat">
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/islamic-tools"))}>
            <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
            <span>Pusat Alat Islami Hub</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/chat"))}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Catat Transaksi (AI Chat)</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/wallets"))}>
            <WalletIcon className="mr-2 h-4 w-4" />
            <span>Kelola Dompet</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/zakat"))}>
            <Calculator className="mr-2 h-4 w-4" />
            <span>Kalkulator & Pusat Zakat</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/religi"))}>
            <Moon className="mr-2 h-4 w-4" />
            <span>Pusat Ibadah (Religi Hub)</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/zakat/waris"))}>
            <Users className="mr-2 h-4 w-4" />
            <span>Kalkulator Waris (Faraid)</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/debts"))}>
            <HistoryIcon className="mr-2 h-4 w-4" />
            <span>Manajemen Hutang Sunnah</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/syura"))}>
            <MessageIcon className="mr-2 h-4 w-4" />
            <span>Catatan Syura Keluarga</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => toggleSakinahMode())}>
            <Zap className="mr-2 h-4 w-4" />
            <span>{isSakinahMode ? "Matikan Sakinah Mode" : "Aktifkan Sakinah Mode"}</span>
            <CommandShortcut>M</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigasi">
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
            <Search className="mr-2 h-4 w-4" />
            <span>Dashboard Beranda</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/tasks"))}>
            <Calendar className="mr-2 h-4 w-4" />
            <span>Agenda & Tugas</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/events"))}>
            <Heart className="mr-2 h-4 w-4 text-rose-500" />
            <span>Momen Keluarga (Hari Jadi & Rapat)</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/notes"))}>
            <FileText className="mr-2 h-4 w-4 text-amber-500" />
            <span>Wiki & Catatan Keluarga</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/reports/generator"))}>
            <BookOpen className="mr-2 h-4 w-4 text-blue-500" />
            <span>Generator Laporan (PDF / CSV / Pajak)</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/help"))}>
            <Search className="mr-2 h-4 w-4 text-purple-500" />
            <span>Pusat Bantuan & FAQ</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/privacy"))}>
            <Shield className="mr-2 h-4 w-4 text-slate-400" />
            <span>Kebijakan Privasi</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/profile"))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Setelan Profil</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
