import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    className={cn(
      "h-10 w-full rounded-lg border border-input bg-white/[0.025] px-3 text-sm text-slate-100 placeholder:text-slate-500 transition duration-200 focus:border-primary/50 focus:bg-white/[0.04] focus:ring-2 focus:ring-primary/15",
      className
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";
