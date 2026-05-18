"use client";

import Link from "next/link";
import { PanelLeftClose, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SidebarHeaderProps = {
  collapsed: boolean;
  onCloseMobile?: () => void;
  onToggle: () => void;
};

export function SidebarHeader({ collapsed, onCloseMobile, onToggle }: SidebarHeaderProps) {
  return (
    <div className="flex h-[68px] items-center justify-between px-3">
      <Link
        aria-label="Vaiket CRM home"
        className={cn("group flex min-w-0 items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-white/[0.035]", collapsed && "justify-center px-0")}
        href="/"
        onClick={onCloseMobile}
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/[0.06] text-primary ring-1 ring-white/8 transition group-hover:bg-white/[0.08]">
          <Zap size={18} strokeWidth={2.2} />
        </span>
        {!collapsed ? (
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold tracking-tight text-white">Vaiket CRM</span>
            <span className="block truncate text-xs font-medium text-slate-500">Enterprise workspace</span>
          </span>
        ) : null}
      </Link>

      {!collapsed ? (
        <Button aria-label="Collapse sidebar" className="hidden h-8 w-8 rounded-xl lg:inline-flex" size="icon" variant="ghost" onClick={onToggle}>
          <PanelLeftClose size={16} />
        </Button>
      ) : (
        <Button aria-label="Expand sidebar" className="hidden h-8 w-8 rounded-xl lg:inline-flex" size="icon" variant="ghost" onClick={onToggle}>
          <PanelLeftClose className="rotate-180" size={16} />
        </Button>
      )}

      <Button aria-label="Close navigation" className="h-8 w-8 rounded-xl lg:hidden" size="icon" variant="ghost" onClick={onCloseMobile}>
        <X size={16} />
      </Button>
    </div>
  );
}
