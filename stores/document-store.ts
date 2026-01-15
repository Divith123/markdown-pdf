import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { JSONContent } from "@tiptap/react";
import type { TypographySettings } from "@/types/typography";
import type { ThemePreset, Theme } from "@/types/theme";
import type { PageSettings, HeaderFooterSettings, DocumentMetadata } from "@/types/document";
import { defaultTypography } from "@/types/typography";
import { themePresets } from "@/types/theme";
import { defaultPageSettings, defaultHeaderFooter } from "@/types/document";

interface DocumentStore {
  // Document metadata
  metadata: DocumentMetadata;
  
  // Document content
  content: JSONContent;
  
  // Styling
  typography: TypographySettings;
  themePreset: ThemePreset;
  customTheme: Theme | null;
  
  // Page settings
  pageSettings: PageSettings;
  headerFooter: HeaderFooterSettings;
  
  // Computed
  currentTheme: () => Theme;
  
  // Actions
  setMetadata: (metadata: Partial<DocumentMetadata>) => void;
  setContent: (content: JSONContent) => void;
  setTypography: (typography: Partial<TypographySettings>) => void;
  setThemePreset: (preset: ThemePreset) => void;
  setCustomTheme: (theme: Theme | null) => void;
  setPageSettings: (settings: Partial<PageSettings>) => void;
  setHeaderFooter: (settings: Partial<HeaderFooterSettings>) => void;
  resetDocument: () => void;
}

const defaultMetadata: DocumentMetadata = {
  id: crypto.randomUUID(),
  title: "Untitled Document",
  author: "",
  createdAt: new Date(),
  updatedAt: new Date(),
  version: 1,
};

const defaultContent: JSONContent = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "Untitled Document" }],
    },
    {
      type: "paragraph",
      content: [{ type: "text", text: "Start writing your document here..." }],
    },
  ],
};

export const useDocumentStore = create<DocumentStore>()(
  persist(
    (set, get) => ({
      // Initial state
      metadata: defaultMetadata,
      content: defaultContent,
      typography: defaultTypography,
      themePreset: "minimal",
      customTheme: null,
      pageSettings: defaultPageSettings,
      headerFooter: defaultHeaderFooter,
      
      // Computed
      currentTheme: () => {
        const state = get();
        return state.customTheme ?? themePresets[state.themePreset];
      },
      
      // Actions
      setMetadata: (metadata) =>
        set((state) => ({
          metadata: {
            ...state.metadata,
            ...metadata,
            updatedAt: new Date(),
          },
        })),
      
      setContent: (content) =>
        set((state) => ({
          content,
          metadata: {
            ...state.metadata,
            updatedAt: new Date(),
          },
        })),
      
      setTypography: (typography) =>
        set((state) => ({
          typography: { ...state.typography, ...typography },
        })),
      
      setThemePreset: (themePreset) => set({ themePreset, customTheme: null }),
      
      setCustomTheme: (customTheme) => set({ customTheme }),
      
      setPageSettings: (settings) =>
        set((state) => ({
          pageSettings: { ...state.pageSettings, ...settings },
        })),
      
      setHeaderFooter: (settings) =>
        set((state) => ({
          headerFooter: { ...state.headerFooter, ...settings },
        })),
      
      resetDocument: () =>
        set({
          metadata: { ...defaultMetadata, id: crypto.randomUUID() },
          content: defaultContent,
          typography: defaultTypography,
          themePreset: "minimal",
          customTheme: null,
          pageSettings: defaultPageSettings,
          headerFooter: defaultHeaderFooter,
        }),
    }),
    {
      name: "document-store",
      partialize: (state) => ({
        metadata: state.metadata,
        content: state.content,
        typography: state.typography,
        themePreset: state.themePreset,
        customTheme: state.customTheme,
        pageSettings: state.pageSettings,
        headerFooter: state.headerFooter,
      }),
    }
  )
);
