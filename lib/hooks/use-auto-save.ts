"use client";

import { useEffect, useRef, useCallback } from "react";
import { useDocumentStore } from "@/stores/document-store";
import { useEditorStore } from "@/stores/editor-store";
import { useAppStore } from "@/stores/app-store";
import debounce from "lodash/debounce";

const STORAGE_KEY_PREFIX = "suzume_doc_";
const HISTORY_KEY = "suzume_doc_history";
const MAX_HISTORY_ENTRIES = 50;

export interface DocumentVersion {
  id: string;
  documentId: string;
  title: string;
  timestamp: Date;
  wordCount: number;
  preview: string;
}

export function useAutoSave() {
  const { editor, setIsSaving, setLastSaved } = useEditorStore();
  const { content, metadata, setContent } = useDocumentStore();
  const { autoSaveEnabled, autoSaveInterval, addRecentFile } = useAppStore();
  
  const saveRef = useRef<ReturnType<typeof debounce> | null>(null);
  
  const saveDocument = useCallback(() => {
    if (!editor) return;
    
    setIsSaving(true);
    
    try {
      const jsonContent = editor.getJSON();
      const htmlContent = editor.getHTML();
      const textContent = editor.getText();
      
      // Save to localStorage
      const docData = {
        id: metadata.id,
        title: metadata.title,
        content: jsonContent,
        html: htmlContent,
        updatedAt: new Date().toISOString(),
      };
      
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${metadata.id}`, JSON.stringify(docData));
      
      // Update document store
      setContent(jsonContent);
      
      // Add to recent files
      addRecentFile({
        id: metadata.id,
        title: metadata.title,
        lastOpened: new Date(),
        preview: textContent.slice(0, 150),
      });
      
      // Save version history
      saveVersionHistory(metadata.id, metadata.title, textContent);
      
      setLastSaved(new Date());
    } catch (error) {
      console.error("Auto-save failed:", error);
    } finally {
      setIsSaving(false);
    }
  }, [editor, metadata.id, metadata.title, setContent, setIsSaving, setLastSaved, addRecentFile]);
  
  // Create debounced save function
  useEffect(() => {
    if (saveRef.current) {
      saveRef.current.cancel();
    }
    
    saveRef.current = debounce(saveDocument, 1000);
    
    return () => {
      if (saveRef.current) {
        saveRef.current.cancel();
      }
    };
  }, [saveDocument]);
  
  // Auto-save on interval
  useEffect(() => {
    if (!autoSaveEnabled || !editor) return;
    
    const interval = setInterval(() => {
      if (saveRef.current) {
        saveRef.current();
      }
    }, autoSaveInterval);
    
    return () => clearInterval(interval);
  }, [autoSaveEnabled, autoSaveInterval, editor]);
  
  // Save on content change (debounced)
  useEffect(() => {
    if (!editor || !autoSaveEnabled) return;
    
    const handleUpdate = () => {
      if (saveRef.current) {
        saveRef.current();
      }
    };
    
    editor.on("update", handleUpdate);
    
    return () => {
      editor.off("update", handleUpdate);
    };
  }, [editor, autoSaveEnabled]);
  
  // Manual save function
  const manualSave = useCallback(() => {
    if (saveRef.current) {
      saveRef.current.cancel();
    }
    saveDocument();
  }, [saveDocument]);
  
  return { manualSave };
}

function saveVersionHistory(documentId: string, title: string, textContent: string) {
  try {
    const historyStr = localStorage.getItem(HISTORY_KEY);
    const history: DocumentVersion[] = historyStr ? JSON.parse(historyStr) : [];
    
    const version: DocumentVersion = {
      id: crypto.randomUUID(),
      documentId,
      title,
      timestamp: new Date(),
      wordCount: textContent.split(/\s+/).filter(Boolean).length,
      preview: textContent.slice(0, 100),
    };
    
    // Add new version at beginning
    history.unshift(version);
    
    // Keep only recent versions
    const trimmedHistory = history.slice(0, MAX_HISTORY_ENTRIES);
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error("Failed to save version history:", error);
  }
}

export function getDocumentHistory(documentId?: string): DocumentVersion[] {
  try {
    const historyStr = localStorage.getItem(HISTORY_KEY);
    const history: DocumentVersion[] = historyStr ? JSON.parse(historyStr) : [];
    
    if (documentId) {
      return history.filter((v) => v.documentId === documentId);
    }
    
    return history;
  } catch {
    return [];
  }
}

export function loadDocument(documentId: string) {
  try {
    const docStr = localStorage.getItem(`${STORAGE_KEY_PREFIX}${documentId}`);
    if (!docStr) return null;
    
    return JSON.parse(docStr);
  } catch {
    return null;
  }
}

export function getAllDocuments() {
  const documents: Array<{ id: string; title: string; updatedAt: string }> = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_KEY_PREFIX)) {
      try {
        const doc = JSON.parse(localStorage.getItem(key) ?? "");
        documents.push({
          id: doc.id,
          title: doc.title,
          updatedAt: doc.updatedAt,
        });
      } catch {
        // Skip invalid entries
      }
    }
  }
  
  return documents.sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function deleteDocument(documentId: string) {
  localStorage.removeItem(`${STORAGE_KEY_PREFIX}${documentId}`);
}
