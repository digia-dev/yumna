import { cn } from "@/lib/utils"

interface TimelineItem {
  id: string
  title: string
  description?: string
  date?: string
  isCompleted: boolean
  isCurrent?: boolean
}

interface LegacyTimelineProps {
  items: TimelineItem[]
  className?: string
}

export function LegacyTimeline({ items, className }: LegacyTimelineProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {items.map((item, index) => (
        <div key={item.id} className="relative flex gap-6 pb-8 last:pb-0">
          {/* Connector Line */}
          {index !== items.length - 1 && (
            <div
              className={cn(
                "absolute left-[11px] top-6 h-full w-[2px]",
                item.isCompleted ? "bg-emerald-deep" : "bg-muted"
              )}
            />
          )}

          {/* Node */}
          <div
            className={cn(
              "z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-white transition-all",
              item.isCompleted
                ? "border-emerald-deep bg-emerald-deep/10"
                : item.isCurrent
                ? "border-gold-islamic bg-gold-islamic/10 ring-4 ring-gold-islamic/5"
                : "border-muted"
            )}
          >
            {item.isCompleted && (
              <div className="h-2 w-2 rounded-full bg-emerald-deep" />
            )}
            {item.isCurrent && !item.isCompleted && (
              <div className="h-2 w-2 rounded-full bg-gold-islamic animate-pulse" />
            )}
          </div>

          <div className="flex flex-col gap-1">
            <h3
              className={cn(
                "font-display text-sm font-semibold tracking-tight",
                item.isCompleted ? "text-emerald-deep" : "text-foreground"
              )}
            >
              {item.title}
            </h3>
            {item.description && (
              <p className="max-w-[280px] text-xs leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            )}
            {item.date && (
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50">
                {item.date}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
