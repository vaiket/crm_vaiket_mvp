"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type SidebarProfileProps = {
  collapsed: boolean;
};

export function SidebarProfile({ collapsed }: SidebarProfileProps) {
  return (
    <div className="border-t border-white/[0.05] p-3">
      <button
        aria-label="Current user: Rajesh Kumar, Super Admin"
        className={cn(
          "group flex w-full items-center gap-3 rounded-lg border border-white/[0.055] bg-white/[0.025] p-2.5 text-left transition duration-200 hover:border-white/[0.09] hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          collapsed && "justify-center border-transparent bg-transparent p-1.5"
        )}
        type="button"
      >
        <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-800 text-xs font-semibold text-white ring-1 ring-white/10">
          RK
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-ink-900 bg-success" />
        </span>
        {!collapsed ? (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-white">Rajesh Kumar</span>
              <span className="block truncate text-xs font-medium text-slate-500">Super Admin</span>
            </span>
            <ChevronRight className="h-4 w-4 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-slate-400" />
          </>
        ) : null}
      </button>
    </div>
  );
}
