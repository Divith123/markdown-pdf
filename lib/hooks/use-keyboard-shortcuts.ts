"use client";

import { useEffect, useCallback } from "react";
import type { Editor } from "@tiptap/react";

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: (editor: Editor) => void;
  description: string;
}

const defaultShortcuts: KeyboardShortcut[] = [
  // Text formatting
  { key: "b", ctrlKey: true, action: (e) => e.chain().focus().toggleBold().run(), description: "Bold" },
  { key: "i", ctrlKey: true, action: (e) => e.chain().focus().toggleItalic().run(), description: "Italic" },
  { key: "u", ctrlKey: true, action: (e) => e.chain().focus().toggleUnderline().run(), description: "Underline" },
  { key: "e", ctrlKey: true, action: (e) => e.chain().focus().toggleCode().run(), description: "Inline Code" },
  { key: "h", ctrlKey: true, shiftKey: true, action: (e) => e.chain().focus().toggleHighlight().run(), description: "Highlight" },
  { key: "x", ctrlKey: true, shiftKey: true, action: (e) => e.chain().focus().toggleStrike().run(), description: "Strikethrough" },
  
  // Headings
  { key: "1", ctrlKey: true, altKey: true, action: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(), description: "Heading 1" },
  { key: "2", ctrlKey: true, altKey: true, action: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(), description: "Heading 2" },
  { key: "3", ctrlKey: true, altKey: true, action: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(), description: "Heading 3" },
  { key: "4", ctrlKey: true, altKey: true, action: (e) => e.chain().focus().toggleHeading({ level: 4 }).run(), description: "Heading 4" },
  { key: "5", ctrlKey: true, altKey: true, action: (e) => e.chain().focus().toggleHeading({ level: 5 }).run(), description: "Heading 5" },
  { key: "6", ctrlKey: true, altKey: true, action: (e) => e.chain().focus().toggleHeading({ level: 6 }).run(), description: "Heading 6" },
  { key: "0", ctrlKey: true, altKey: true, action: (e) => e.chain().focus().setParagraph().run(), description: "Paragraph" },
  
  // Lists
  { key: "8", ctrlKey: true, shiftKey: true, action: (e) => e.chain().focus().toggleBulletList().run(), description: "Bullet List" },
  { key: "7", ctrlKey: true, shiftKey: true, action: (e) => e.chain().focus().toggleOrderedList().run(), description: "Numbered List" },
  { key: "9", ctrlKey: true, shiftKey: true, action: (e) => e.chain().focus().toggleTaskList().run(), description: "Task List" },
  
  // Blocks
  { key: "q", ctrlKey: true, shiftKey: true, action: (e) => e.chain().focus().toggleBlockquote().run(), description: "Blockquote" },
  { key: "`", ctrlKey: true, shiftKey: true, action: (e) => e.chain().focus().toggleCodeBlock().run(), description: "Code Block" },
  { key: "-", ctrlKey: true, action: (e) => e.chain().focus().setHorizontalRule().run(), description: "Horizontal Rule" },
  
  // Alignment
  { key: "l", ctrlKey: true, shiftKey: true, action: (e) => e.chain().focus().setTextAlign("left").run(), description: "Align Left" },
  { key: "e", ctrlKey: true, shiftKey: true, action: (e) => e.chain().focus().setTextAlign("center").run(), description: "Align Center" },
  { key: "r", ctrlKey: true, shiftKey: true, action: (e) => e.chain().focus().setTextAlign("right").run(), description: "Align Right" },
  { key: "j", ctrlKey: true, shiftKey: true, action: (e) => e.chain().focus().setTextAlign("justify").run(), description: "Justify" },
  
  // Undo/Redo
  { key: "z", ctrlKey: true, action: (e) => e.chain().focus().undo().run(), description: "Undo" },
  { key: "y", ctrlKey: true, action: (e) => e.chain().focus().redo().run(), description: "Redo" },
  { key: "z", ctrlKey: true, shiftKey: true, action: (e) => e.chain().focus().redo().run(), description: "Redo (Alt)" },
  
  // Selection
  { key: "a", ctrlKey: true, action: (e) => e.chain().focus().selectAll().run(), description: "Select All" },
  
  // Clear formatting
  { key: "\\", ctrlKey: true, action: (e) => e.chain().focus().clearNodes().unsetAllMarks().run(), description: "Clear Formatting" },
];

export function useKeyboardShortcuts(editor: Editor | null, customShortcuts?: KeyboardShortcut[]) {
  const shortcuts = customShortcuts ?? defaultShortcuts;
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!editor) return;
    
    for (const shortcut of shortcuts) {
      const ctrlMatch = shortcut.ctrlKey ? (event.ctrlKey || event.metaKey) : !(event.ctrlKey || event.metaKey);
      const shiftMatch = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
      const altMatch = shortcut.altKey ? event.altKey : !event.altKey;
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
      
      if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
        event.preventDefault();
        shortcut.action(editor);
        return;
      }
    }
  }, [editor, shortcuts]);
  
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
  
  return { shortcuts };
}

export function getShortcutLabel(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];
  if (shortcut.ctrlKey) parts.push("Ctrl");
  if (shortcut.shiftKey) parts.push("Shift");
  if (shortcut.altKey) parts.push("Alt");
  parts.push(shortcut.key.toUpperCase());
  return parts.join("+");
}

export { defaultShortcuts };
