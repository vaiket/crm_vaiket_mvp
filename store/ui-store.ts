"use client";

import { create } from "zustand";

type UIState = {
  sidebarCollapsed: boolean;
  commandOpen: boolean;
  notificationsOpen: boolean;
  leadDrawerOpen: boolean;
  selectedLeadId: string | null;
  toggleSidebar: () => void;
  setCommandOpen: (open: boolean) => void;
  setNotificationsOpen: (open: boolean) => void;
  openLeadDrawer: (leadId: string) => void;
  closeLeadDrawer: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  commandOpen: false,
  leadDrawerOpen: false,
  notificationsOpen: false,
  selectedLeadId: null,
  sidebarCollapsed: false,
  closeLeadDrawer: () => set({ leadDrawerOpen: false }),
  openLeadDrawer: (leadId) => set({ leadDrawerOpen: true, selectedLeadId: leadId }),
  setCommandOpen: (commandOpen) => set({ commandOpen }),
  setNotificationsOpen: (notificationsOpen) => set({ notificationsOpen }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }))
}));
