import { cn } from "@/lib/utils";

// ── 418 Skeleton Loading Primitives ──────────────────────────────────────────

export function SkeletonLine({ className }: { className?: string }) {
  return (
    <div className={cn("h-4 bg-slate-100 rounded-lg animate-pulse", className)} />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-[24px] bg-slate-50 border border-slate-100 p-5 space-y-3 animate-pulse", className)}>
      <div className="h-3 w-24 bg-slate-200 rounded-lg" />
      <div className="h-7 w-40 bg-slate-200 rounded-lg" />
      <div className="h-3 w-full bg-slate-100 rounded-lg" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-3 pb-2 border-b border-slate-100">
        {Array(cols).fill(0).map((_, i) => (
          <div key={i} className="flex-1 h-3 bg-slate-200 rounded animate-pulse" />
        ))}
      </div>
      {Array(rows).fill(0).map((_, i) => (
        <div key={i} className="flex gap-3 py-1">
          {Array(cols).fill(0).map((_, j) => (
            <div key={j} className="flex-1 h-4 bg-slate-100 rounded animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonWidget() {
  return (
    <div className="rounded-[28px] bg-slate-50 border border-slate-100 p-6 animate-pulse space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 bg-slate-200 rounded" />
          <div className="h-5 w-36 bg-slate-200 rounded" />
        </div>
      </div>
      <div className="h-2 bg-slate-200 rounded-full" />
      <div className="grid grid-cols-2 gap-2">
        <div className="h-10 bg-slate-100 rounded-xl" />
        <div className="h-10 bg-slate-100 rounded-xl" />
      </div>
    </div>
  );
}
