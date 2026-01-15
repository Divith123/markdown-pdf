import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface RecentFile {
  id: string;
  title: string;
  lastOpened: Date;
  preview: string;
}

interface AppSettings {
  autoSaveEnabled: boolean;
  autoSaveInterval: number; // in milliseconds
  recentFiles: RecentFile[];
  maxRecentFiles: number;
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  activePanel: "typography" | "theme" | "page" | "export";
}

interface AppStore extends AppSettings {
  // Actions
  setAutoSaveEnabled: (enabled: boolean) => void;
  setAutoSaveInterval: (interval: number) => void;
  addRecentFile: (file: RecentFile) => void;
  removeRecentFile: (id: string) => void;
  clearRecentFiles: () => void;
  setSidebarOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setActivePanel: (panel: AppSettings["activePanel"]) => void;
}

const defaultSettings: AppSettings = {
  autoSaveEnabled: true,
  autoSaveInterval: 5000, // 5 seconds
  recentFiles: [],
  maxRecentFiles: 10,
  sidebarOpen: true,
  mobileMenuOpen: false,
  activePanel: "typography",
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      setAutoSaveEnabled: (autoSaveEnabled) => set({ autoSaveEnabled }),
      
      setAutoSaveInterval: (autoSaveInterval) => set({ autoSaveInterval }),
      
      addRecentFile: (file) => {
        const { recentFiles, maxRecentFiles } = get();
        // Remove if already exists
        const filtered = recentFiles.filter((f) => f.id !== file.id);
        // Add to beginning
        const updated = [file, ...filtered].slice(0, maxRecentFiles);
        set({ recentFiles: updated });
      },
      
      removeRecentFile: (id) => {
        const { recentFiles } = get();
        set({ recentFiles: recentFiles.filter((f) => f.id !== id) });
      },
      
      clearRecentFiles: () => set({ recentFiles: [] }),
      
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      
      setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
      
      setActivePanel: (activePanel) => set({ activePanel }),
    }),
    {
      name: "app-settings",
      partialize: (state) => ({
        autoSaveEnabled: state.autoSaveEnabled,
        autoSaveInterval: state.autoSaveInterval,
        recentFiles: state.recentFiles,
        maxRecentFiles: state.maxRecentFiles,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
