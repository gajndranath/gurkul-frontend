import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  // Entity Drawer State
  isEntityDrawerOpen: boolean;
  selectedEntity: any | null;
  openEntityDrawer: (entity: any) => void;
  closeEntityDrawer: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),
  // Entity Drawer
  isEntityDrawerOpen: false,
  selectedEntity: null,
  openEntityDrawer: (entity) => set({ isEntityDrawerOpen: true, selectedEntity: entity }),
  closeEntityDrawer: () => set({ isEntityDrawerOpen: false, selectedEntity: null }),
}));
