import { create } from "zustand";
import type { ViewMode, TimeScale } from "@/types";

interface UIStore {
  viewMode: ViewMode;
  timeScale: TimeScale;
  sidebarOpen: boolean;
  taskDetailOpen: boolean;
  searchQuery: string;
  filterStatus: string[];
  filterPriority: string[];
  setViewMode: (mode: ViewMode) => void;
  setTimeScale: (scale: TimeScale) => void;
  toggleSidebar: () => void;
  setTaskDetailOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: string[]) => void;
  setFilterPriority: (priority: string[]) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  viewMode: "gantt",
  timeScale: "week",
  sidebarOpen: true,
  taskDetailOpen: false,
  searchQuery: "",
  filterStatus: [],
  filterPriority: [],

  setViewMode: (mode: ViewMode) => set({ viewMode: mode }),
  setTimeScale: (scale: TimeScale) => set({ timeScale: scale }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTaskDetailOpen: (open: boolean) => set({ taskDetailOpen: open }),
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setFilterStatus: (status: string[]) => set({ filterStatus: status }),
  setFilterPriority: (priority: string[]) => set({ filterPriority: priority }),
}));
