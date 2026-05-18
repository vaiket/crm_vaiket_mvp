"use client";

import type { LucideIcon } from "lucide-react";
import { SidebarHeader } from "@/components/sidebar/sidebar-header";
import { SidebarItem } from "@/components/sidebar/sidebar-item";

type NavigationItem = {
  href: string;
  icon: LucideIcon;
  label: string;
};

type SidebarProps = {
  collapsed: boolean;
  currentPath: string;
  items: NavigationItem[];
  onCloseMobile?: () => void;
  onToggle: () => void;
};

const sidebarGroups = [
  {
    items: ["Dashboard", "My Leads", "Followups", "Call History", "My Performance", "Profile"],
    label: "Telecalling"
  },
  {
    items: ["Dashboard", "Leads", "Clients", "Sales", "Finance", "Appointments", "Team"],
    label: "Workspace"
  },
  {
    items: ["Staff Access", "User Management", "Lead Distribution", "Telecallers", "Performance"],
    label: "Access"
  },
  {
    items: ["Call Center", "Call Logs", "WhatsApp CRM", "Email Campaigns"],
    label: "Communication"
  },
  {
    items: ["Followups", "Tasks", "Reports", "Files", "Support"],
    label: "Operations"
  },
  {
    items: ["Notifications", "Team Chat", "Settings", "Admin Control"],
    label: "System"
  }
];

function isActivePath(pathname: string, href: string) {
  return href === pathname || (href !== "/" && pathname.startsWith(href));
}

export function Sidebar({ collapsed, currentPath, items, onCloseMobile, onToggle }: SidebarProps) {
  return (
    <div className="relative flex h-full flex-col overflow-visible bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(11,18,32,0.98))]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_50%_0%,rgba(20,184,166,0.08),transparent_60%)]" />
      <div className="relative z-10 flex h-full flex-col">
        <SidebarHeader collapsed={collapsed} onCloseMobile={onCloseMobile} onToggle={onToggle} />

        <nav aria-label="Primary navigation" className="sidebar-scrollbar min-h-0 flex-1 overflow-y-auto px-3 pb-3 pt-1">
          <div className="space-y-4">
            {sidebarGroups.map((group) => {
              const groupItems = items.filter((item) => {
                const isTelecallerItem = item.href === "/telecaller" || item.href.startsWith("/telecaller/");
                if (group.label === "Telecalling") return isTelecallerItem && group.items.includes(item.label);
                return !isTelecallerItem && group.items.includes(item.label);
              });
              if (!groupItems.length) return null;

              return (
                <section aria-label={group.label} className="space-y-1.5" key={group.label}>
                  {!collapsed ? (
                    <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-600">{group.label}</div>
                  ) : null}
                  <div className="space-y-1.5">
                    {groupItems.map((item) => (
                      <SidebarItem
                        collapsed={collapsed}
                        href={item.href}
                        icon={item.icon}
                        isActive={isActivePath(currentPath, item.href)}
                        key={item.href}
                        label={item.label}
                        onNavigate={onCloseMobile}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
