import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-main/30 bg-main/15 text-main",
        neutral: "border-border bg-surface2 text-muted",
        success: "border-success/30 bg-success/15 text-success",
        danger: "border-danger/30 bg-danger/15 text-danger",
        warning: "border-warning/30 bg-warning/15 text-warning",
        info: "border-info/30 bg-info/15 text-info",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
