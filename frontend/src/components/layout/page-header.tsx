import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  className,
  children,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-1 px-6 pt-10 pb-6", className)}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-display text-emerald-deep">
          {title}
        </h1>
        {children}
      </div>
      {description && (
        <p className="text-muted-foreground text-sm font-medium">
          {description}
        </p>
      )}
    </div>
  );
}
