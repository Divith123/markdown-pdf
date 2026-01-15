"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Keyboard, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { defaultShortcuts, getShortcutLabel } from "@/lib/hooks/use-keyboard-shortcuts";

interface ShortcutCategory {
  name: string;
  shortcuts: {
    action: string;
    keys: string;
    description?: string;
  }[];
}

const shortcutCategories: ShortcutCategory[] = [
  {
    name: "Text Formatting",
    shortcuts: [
      { action: "Bold", keys: "Ctrl+B", description: "Make text bold" },
      { action: "Italic", keys: "Ctrl+I", description: "Make text italic" },
      { action: "Underline", keys: "Ctrl+U", description: "Underline text" },
      { action: "Strikethrough", keys: "Ctrl+Shift+S", description: "Strike through text" },
      { action: "Inline Code", keys: "Ctrl+E", description: "Format as code" },
      { action: "Subscript", keys: "Ctrl+,", description: "Subscript text" },
      { action: "Superscript", keys: "Ctrl+.", description: "Superscript text" },
      { action: "Clear Formatting", keys: "Ctrl+\\", description: "Remove all formatting" },
    ],
  },
  {
    name: "Headings",
    shortcuts: [
      { action: "Heading 1", keys: "Ctrl+Alt+1", description: "Large heading" },
      { action: "Heading 2", keys: "Ctrl+Alt+2", description: "Medium heading" },
      { action: "Heading 3", keys: "Ctrl+Alt+3", description: "Small heading" },
      { action: "Heading 4", keys: "Ctrl+Alt+4", description: "Smaller heading" },
      { action: "Heading 5", keys: "Ctrl+Alt+5", description: "Smallest heading" },
      { action: "Heading 6", keys: "Ctrl+Alt+6", description: "Tiny heading" },
      { action: "Normal Text", keys: "Ctrl+Alt+0", description: "Convert to paragraph" },
    ],
  },
  {
    name: "Lists & Blocks",
    shortcuts: [
      { action: "Bullet List", keys: "Ctrl+Shift+8", description: "Create bullet list" },
      { action: "Numbered List", keys: "Ctrl+Shift+7", description: "Create numbered list" },
      { action: "Task List", keys: "Ctrl+Shift+9", description: "Create task list" },
      { action: "Blockquote", keys: "Ctrl+Shift+B", description: "Create quote block" },
      { action: "Code Block", keys: "Ctrl+Shift+C", description: "Create code block" },
      { action: "Horizontal Rule", keys: "Ctrl+Shift+-", description: "Insert divider" },
    ],
  },
  {
    name: "Text Alignment",
    shortcuts: [
      { action: "Align Left", keys: "Ctrl+Shift+L", description: "Left align text" },
      { action: "Align Center", keys: "Ctrl+Shift+E", description: "Center align text" },
      { action: "Align Right", keys: "Ctrl+Shift+R", description: "Right align text" },
      { action: "Justify", keys: "Ctrl+Shift+J", description: "Justify text" },
    ],
  },
  {
    name: "Insert & Links",
    shortcuts: [
      { action: "Insert Link", keys: "Ctrl+K", description: "Add or edit link" },
      { action: "Insert Table", keys: "Ctrl+Shift+T", description: "Insert table" },
    ],
  },
  {
    name: "Edit & History",
    shortcuts: [
      { action: "Undo", keys: "Ctrl+Z", description: "Undo last action" },
      { action: "Redo", keys: "Ctrl+Y", description: "Redo undone action" },
      { action: "Redo (Alt)", keys: "Ctrl+Shift+Z", description: "Redo undone action" },
      { action: "Find", keys: "Ctrl+F", description: "Open find dialog" },
      { action: "Find & Replace", keys: "Ctrl+H", description: "Open find and replace" },
      { action: "Select All", keys: "Ctrl+A", description: "Select all content" },
    ],
  },
  {
    name: "Document",
    shortcuts: [
      { action: "Save", keys: "Ctrl+S", description: "Save document" },
      { action: "Print", keys: "Ctrl+P", description: "Print document" },
      { action: "Command Palette", keys: "Ctrl+K", description: "Open command palette" },
    ],
  },
  {
    name: "Navigation",
    shortcuts: [
      { action: "Go to Start", keys: "Ctrl+Home", description: "Go to document start" },
      { action: "Go to End", keys: "Ctrl+End", description: "Go to document end" },
      { action: "Move Line Up", keys: "Alt+↑", description: "Move line up" },
      { action: "Move Line Down", keys: "Alt+↓", description: "Move line down" },
    ],
  },
];

export function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredCategories = shortcutCategories
    .map((category) => ({
      ...category,
      shortcuts: category.shortcuts.filter(
        (shortcut) =>
          shortcut.action.toLowerCase().includes(search.toLowerCase()) ||
          shortcut.keys.toLowerCase().includes(search.toLowerCase()) ||
          shortcut.description?.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((category) => category.shortcuts.length > 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Keyboard Shortcuts">
          <Keyboard className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Quick reference for all available keyboard shortcuts
          </DialogDescription>
        </DialogHeader>

        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search shortcuts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <ScrollArea className="h-[50vh] mt-4">
          <div className="space-y-6 pr-4">
            {filteredCategories.map((category) => (
              <div key={category.name}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  {category.name}
                </h3>
                <div className="space-y-2">
                  {category.shortcuts.map((shortcut) => (
                    <div
                      key={shortcut.action}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium">{shortcut.action}</p>
                        {shortcut.description && (
                          <p className="text-xs text-muted-foreground">
                            {shortcut.description}
                          </p>
                        )}
                      </div>
                      <kbd className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs font-mono">
                        {shortcut.keys.split("+").map((key, i) => (
                          <span key={i}>
                            {i > 0 && <span className="text-muted-foreground mx-0.5">+</span>}
                            <span className="px-1 py-0.5 bg-background rounded border">
                              {key}
                            </span>
                          </span>
                        ))}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {filteredCategories.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Keyboard className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No shortcuts found for "{search}"</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="mt-4 pt-4 border-t text-xs text-muted-foreground text-center">
          Tip: On Mac, use <kbd className="px-1 bg-muted rounded">⌘</kbd> instead of{" "}
          <kbd className="px-1 bg-muted rounded">Ctrl</kbd>
        </div>
      </DialogContent>
    </Dialog>
  );
}
