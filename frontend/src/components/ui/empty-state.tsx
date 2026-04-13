import { Wallet, CheckSquare, Calculator, Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  type: "wallet" | "task" | "zakat" | "search"
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

const illustrations = {
  wallet: Wallet,
  task: CheckSquare,
  zakat: Calculator,
  search: Search,
}

export function EmptyState({
  type,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  const Icon = illustrations[type]

  return (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center", className)}>
      <div className="relative mb-6">
        <div className="absolute inset-0 scale-150 bg-emerald-deep/5 blur-3xl rounded-full" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-surface-container-high text-emerald-deep/40 transition-colors group-hover:bg-emerald-deep/5 group-hover:text-emerald-deep/60">
          <Icon className="h-12 w-12" strokeWidth={1.5} />
        </div>
      </div>
      
      <h3 className="font-display text-xl font-bold text-emerald-deep tracking-tight">
        {title}
      </h3>
      <p className="mt-2 max-w-[260px] text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
      
      {actionLabel && (
        <button
          onClick={onAction}
          className="mt-8 rounded-full bg-emerald-deep px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
