import { cn } from "@/lib/utils";

export function Footer({ className }: { className?: string }) {
  return (
    <footer className={cn("px-6 py-12 border-t border-emerald-deep/5 bg-surface-container-low", className)}>
      <div className="flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex flex-col gap-2">
          <span className="text-xl font-bold font-display text-emerald-deep">Yumna</span>
          <p className="text-sm text-muted-foreground max-w-xs">
            Asisten Keuangan Keluarga Islami. Membantu mengelola amanah harta dengan penuh keberkahan.
          </p>
        </div>
        
        <div className="flex gap-8 text-sm font-medium text-muted-foreground">
          <a href="#" className="hover:text-emerald-deep transition-colors">Kebijakan Privasi</a>
          <a href="#" className="hover:text-emerald-deep transition-colors">Syarat & Ketentuan</a>
          <a href="#" className="hover:text-emerald-deep transition-colors">Bantuan</a>
        </div>
      </div>
      
      <div className="mt-12 pt-6 border-t border-emerald-deep/5 flex flex-col sm:flex-row gap-4 justify-between items-center text-[10px] text-muted-foreground/60 tracking-widest uppercase">
        <span>© 2026 PT Digi Antara Masa</span>
        <span>Made with Sakinah in mind</span>
      </div>
    </footer>
  );
}
