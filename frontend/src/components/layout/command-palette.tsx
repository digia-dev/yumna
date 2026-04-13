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
          <CommandItem onSelect={() => runCommand(() => router.push("/chat"))}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Catat Transaksi (AI Chat)</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/wallets"))}>
            <WalletIcon className="mr-2 h-4 w-4" />
            <span>Kelola Dompet</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/calculator"))}>
            <Calculator className="mr-2 h-4 w-4" />
            <span>Kalkulator Zakat</span>
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
          <CommandItem onSelect={() => runCommand(() => router.push("/tasks"))}>
            <Calendar className="mr-2 h-4 w-4" />
            <span>Agenda & Tugas</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/settings"))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Setelan Keluarga</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
