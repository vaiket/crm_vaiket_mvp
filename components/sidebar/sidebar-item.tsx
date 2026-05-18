"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type SidebarItemProps = {
  collapsed: boolean;
  href: string;
  icon: LucideIcon;
  isActive: boolean;
  label: string;
  onNavigate?: () => void;
};

export function SidebarItem({ collapsed, href, icon: Icon, isActive, label, onNavigate }: SidebarItemProps) {
  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      aria-label={collapsed ? label : undefined}
      className={cn(
        "group/item relative flex h-10 items-center gap-3 rounded-lg px-3 text-[14px] font-medium outline-none transition duration-200 focus-visible:ring-2 focus-visible:ring-primary/40",
        isActive ? "bg-white/[0.07] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]" : "text-slate-400 hover:bg-white/[0.035] hover:text-slate-100",
        !isActive && !collapsed && "hover:translate-x-0.5",
        collapsed && "justify-center px-0"
      )}
      href={href}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
    >
      <span
        className={cn(
          "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary transition duration-200",
          isActive ? "opacity-100" : "opacity-0"
        )}
      />
      <Icon className={cn("h-[18px] w-[18px] shrink-0 transition", isActive ? "text-primary" : "text-slate-500 group-hover/item:text-slate-200")} strokeWidth={2} />
      {!collapsed ? <span className="min-w-0 flex-1 truncate">{label}</span> : null}
      {collapsed ? (
        <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 hidden -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/8 bg-ink-850 px-2.5 py-1.5 text-xs font-medium text-slate-200 shadow-panel group-hover/item:block">
          {label}
        </span>
      ) : null}
    </Link>
  );
}
