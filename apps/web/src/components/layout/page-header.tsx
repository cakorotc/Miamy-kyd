import * as React from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  sub,
  children,
  className,
}: {
  title: string;
  sub?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3", className)}>
      <div className="min-w-0">
        <h1 className="text-2xl font-heading tracking-tight">{title}</h1>
        {sub && <p className="mt-0.5 text-sm text-muted">{sub}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}
