"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  ChevronRight,
  Command,
  Gauge,
  LayoutGrid,
  Menu,
  Search,
  Settings,
  Sparkles,
  UserRound,
  X
} from "lucide-react";
import { navigation, activities } from "@/data/crm";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sidebar } from "@/components/sidebar/sidebar";
import { LogoutButton } from "@/components/auth/logout-button";

type AppShellUser = {
  email: string;
  name: string;
  role: string;
};

type AppShellProps = {
  allowedPaths: string[];
  children: React.ReactNode;
  currentUser: AppShellUser | null;
};

function getInitials(name?: string) {
  return (name ?? "User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function AppShell({ allowedPaths, children, currentUser }: AppShellProps) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const {
    commandOpen,
    notificationsOpen,
    setCommandOpen,
    setNotificationsOpen,
    sidebarCollapsed,
    toggleSidebar
  } = useUIStore();

  const allowedNavigation = navigation.filter((item) => allowedPaths.includes(item.href));
  const active = allowedNavigation.find((item) => item.href === pathname || (item.href !== "/" && pathname.startsWith(item.href)));
  const pageTitle = active?.label ?? "Dashboard";

  if (pathname === "/login") {
    return <div className="min-h-screen bg-ink-950 text-slate-100 subtle-grid">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-ink-950 text-slate-100 subtle-grid">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden overflow-visible border-r border-white/[0.06] bg-ink-900/96 backdrop-blur-2xl transition-[width] duration-300 ease-out lg:block",
          sidebarCollapsed ? "w-[72px]" : "w-[248px]"
        )}
      >
        <Sidebar collapsed={sidebarCollapsed} currentPath={pathname} items={allowedNavigation} onToggle={toggleSidebar} />
      </aside>

      <AnimatePresence>
        {mobileSidebarOpen ? (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-label="Close navigation" onClick={() => setMobileSidebarOpen(false)} />
            <motion.aside
              animate={{ x: 0 }}
              className="absolute inset-y-0 left-0 w-[min(88vw,292px)] overflow-visible border-r border-white/[0.05] bg-ink-900/96 shadow-panel backdrop-blur-2xl"
              exit={{ x: "-100%" }}
              initial={{ x: "-100%" }}
              transition={{ duration: 0.22 }}
            >
              <Sidebar collapsed={false} currentPath={pathname} items={allowedNavigation} onCloseMobile={() => setMobileSidebarOpen(false)} onToggle={toggleSidebar} />
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className={cn("min-h-screen transition-[padding] duration-300 ease-out", sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-[248px]")}>
        <header className="sticky top-0 z-30 border-b border-border bg-ink-950/86 shadow-[0_1px_0_rgba(255,255,255,0.025)] backdrop-blur-2xl">
          <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-2 md:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Button className="lg:hidden" size="icon" variant="ghost" onClick={() => setMobileSidebarOpen(true)}>
                <Menu size={18} />
              </Button>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <LayoutGrid size={13} />
                  <span>CRM</span>
                  <ChevronRight size={13} />
                  <span className="truncate text-slate-300">{pageTitle}</span>
                </div>
                <div className="flex items-center gap-3">
                  <h1 className="truncate text-xl font-semibold tracking-normal text-white">{pageTitle}</h1>
                  <Badge className="hidden lg:inline-flex" variant="mint">
                    <Gauge size={12} /> System ok
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="hidden h-10 min-w-[320px] items-center gap-3 rounded-lg border border-border bg-white/[0.025] px-3 text-left text-sm text-muted-foreground shadow-sm transition hover:border-white/12 hover:bg-white/[0.045] md:flex"
                onClick={() => setCommandOpen(true)}
              >
                <Search size={16} />
                <span className="flex-1">Search lead, client, task...</span>
                <kbd className="rounded-md border border-border bg-white/[0.035] px-1.5 py-0.5 text-[10px] text-slate-400">Ctrl K</kbd>
              </button>
              <Button size="icon" variant="outline" onClick={() => setNotificationsOpen(true)}>
                <Bell size={17} />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="hidden md:inline-flex" variant="outline">
                    <span className="grid h-6 w-6 place-items-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">{getInitials(currentUser?.name) || "U"}</span>
                    {currentUser?.role ?? "Profile"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <UserRound className="mr-2 h-4 w-4" /> My profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" /> Workspace settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Sparkles className="mr-2 h-4 w-4" /> Release notes
                  </DropdownMenuItem>
                  <LogoutButton />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <motion.main
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto w-full max-w-[1680px] px-4 py-5 md:px-6"
          initial={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.28 }}
        >
          {children}
        </motion.main>
      </div>

      <AnimatePresence>
        {commandOpen ? (
          <motion.div className="fixed inset-0 z-50 bg-black/70 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className="glass-panel mx-auto mt-20 max-w-2xl overflow-hidden rounded-xl"
              initial={{ scale: 0.96, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 10 }}
            >
              <div className="flex items-center gap-3 border-b border-border p-4">
                <Command size={18} className="text-primary" />
                <Input className="border-0 bg-transparent" placeholder="Module, lead, client ya report search karein..." autoFocus />
                <Button size="icon" variant="ghost" onClick={() => setCommandOpen(false)}>
                  <X size={16} />
                </Button>
              </div>
              <div className="grid gap-2 p-3 md:grid-cols-2">
                {allowedNavigation.slice(0, 10).map((item) => (
                  <Link className="flex items-center gap-3 rounded-xl p-3 text-sm text-slate-300 transition hover:bg-white/[0.06] hover:text-white" href={item.href} key={item.href} onClick={() => setCommandOpen(false)}>
                    <item.icon className="text-primary" size={17} />
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {notificationsOpen ? (
          <motion.aside
            animate={{ x: 0 }}
            className="fixed bottom-0 right-0 top-0 z-50 w-full max-w-md border-l border-border bg-ink-950/95 p-5 shadow-panel backdrop-blur-xl"
            exit={{ x: "100%" }}
            initial={{ x: "100%" }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Notifications</h2>
                <p className="text-xs text-muted-foreground">Follow-up, payment aur team alerts</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setNotificationsOpen(false)}>
                <X size={16} />
              </Button>
            </div>
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <div className="rounded-lg border border-border bg-white/[0.025] p-4" key={activity.title}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{activity.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{activity.detail}</p>
                    </div>
                    <Badge variant={index < 2 ? "mint" : "blue"}>{activity.time}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
