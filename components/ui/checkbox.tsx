"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Checkbox({ className, ...props }: React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root className={cn("grid h-4 w-4 place-items-center rounded-md border border-border bg-white/[0.035] transition data-[state=checked]:border-primary data-[state=checked]:bg-primary", className)} {...props}>
      <CheckboxPrimitive.Indicator>
        <Check className="h-3 w-3 text-primary-foreground" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
