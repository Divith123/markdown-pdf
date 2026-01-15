import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Editor } from "@tiptap/react";
import type { EditorMode } from "@/types/editor";

interface EditorStore {
  // State
  editor: Editor | null;
  mode: EditorMode;
  isReady: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  
  // Markdown source for markdown mode
  markdownSource: string;
  
  // Actions
  setEditor: (editor: Editor | null) => void;
  setMode: (mode: EditorMode) => void;
  setIsReady: (isReady: boolean) => void;
  setIsSaving: (isSaving: boolean) => void;
  setLastSaved: (lastSaved: Date | null) => void;
  setMarkdownSource: (source: string) => void;
}

export const useEditorStore = create<EditorStore>()((set) => ({
  // Initial state
  editor: null,
  mode: "visual",
  isReady: false,
  isSaving: false,
  lastSaved: null,
  markdownSource: "",
  
  // Actions
  setEditor: (editor) => set({ editor }),
  setMode: (mode) => set({ mode }),
  setIsReady: (isReady) => set({ isReady }),
  setIsSaving: (isSaving) => set({ isSaving }),
  setLastSaved: (lastSaved) => set({ lastSaved }),
  setMarkdownSource: (markdownSource) => set({ markdownSource }),
}));

// Persisted preferences
interface EditorPreferences {
  defaultMode: EditorMode;
  autoSaveInterval: number;
  showLineNumbers: boolean;
  spellCheck: boolean;
}

interface EditorPreferencesStore extends EditorPreferences {
  setDefaultMode: (mode: EditorMode) => void;
  setAutoSaveInterval: (interval: number) => void;
  setShowLineNumbers: (show: boolean) => void;
  setSpellCheck: (enabled: boolean) => void;
}

export const useEditorPreferences = create<EditorPreferencesStore>()(
  persist(
    (set) => ({
      defaultMode: "visual",
      autoSaveInterval: 30000,
      showLineNumbers: true,
      spellCheck: true,
      
      setDefaultMode: (defaultMode) => set({ defaultMode }),
      setAutoSaveInterval: (autoSaveInterval) => set({ autoSaveInterval }),
      setShowLineNumbers: (showLineNumbers) => set({ showLineNumbers }),
      setSpellCheck: (spellCheck) => set({ spellCheck }),
    }),
    {
      name: "editor-preferences",
    }
  )
);
