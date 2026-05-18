import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none", {
  defaultVariants: { variant: "default" },
  variants: {
    variant: {
      amber: "border-amber/16 bg-amber/10 text-amber",
      blue: "border-skyline/16 bg-skyline/10 text-skyline",
      danger: "border-danger/16 bg-danger/10 text-danger",
      default: "border-white/8 bg-white/[0.035] text-muted-foreground",
      mint: "border-mint/18 bg-mint/10 text-mint",
      violet: "border-violet-400/16 bg-violet-400/10 text-violet-300"
    }
  }
});

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ className, variant }))} {...props} />;
}
