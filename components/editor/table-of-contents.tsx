"use client";

import { useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useEditorStore } from "@/stores/editor-store";
import { List, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  level: number;
  text: string;
  pos: number;
}

export function TableOfContents() {
  const { editor } = useEditorStore();

  const tocItems = useMemo(() => {
    if (!editor) return [];

    const items: TocItem[] = [];
    const { doc } = editor.state;

    doc.descendants((node, pos) => {
      if (node.type.name === "heading") {
        const level = node.attrs.level || 1;
        const text = node.textContent;
        const id = `heading-${pos}`;

        if (text) {
          items.push({ id, level, text, pos });
        }
      }
    });

    return items;
  }, [editor?.state.doc]);

  const handleClick = useCallback((pos: number) => {
    if (!editor) return;
    
    editor.chain()
      .focus()
      .setTextSelection(pos)
      .scrollIntoView()
      .run();
  }, [editor]);

  if (!editor) return null;

  const hasHeadings = tocItems.length > 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <List className="h-4 w-4" />
          Table of Contents
        </h4>
        {hasHeadings && (
          <span className="text-xs text-muted-foreground">
            {tocItems.length} headings
          </span>
        )}
      </div>

      {hasHeadings ? (
        <ScrollArea className="h-64">
          <div className="space-y-1 pr-4">
            {tocItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleClick(item.pos)}
                className={cn(
                  "w-full text-left text-sm py-1.5 px-2 rounded hover:bg-muted transition-colors",
                  "flex items-center gap-2 group"
                )}
                style={{ paddingLeft: `${(item.level - 1) * 12 + 8}px` }}
              >
                <span className="text-xs text-muted-foreground font-mono w-6">
                  H{item.level}
                </span>
                <span className="flex-1 truncate">{item.text}</span>
                <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="text-sm text-muted-foreground p-4 text-center border rounded-lg border-dashed">
          No headings found.
          <br />
          <span className="text-xs">Add headings to generate a table of contents.</span>
        </div>
      )}
    </div>
  );
}

// Generate markdown TOC
export function generateMarkdownToc(editor: ReturnType<typeof useEditorStore.getState>["editor"]): string {
  if (!editor) return "";

  const items: TocItem[] = [];
  const { doc } = editor.state;

  doc.descendants((node, pos) => {
    if (node.type.name === "heading") {
      const level = node.attrs.level || 1;
      const text = node.textContent;
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      if (text) {
        items.push({ id, level, text, pos });
      }
    }
  });

  if (items.length === 0) return "";

  const lines = items.map((item) => {
    const indent = "  ".repeat(item.level - 1);
    return `${indent}- [${item.text}](#${item.id})`;
  });

  return `## Table of Contents\n\n${lines.join("\n")}`;
}

// Insert TOC into document
export function insertTocIntoDocument(editor: ReturnType<typeof useEditorStore.getState>["editor"]) {
  if (!editor) return;

  const toc = generateMarkdownToc(editor);
  if (!toc) return;

  // Insert at beginning of document
  editor.chain()
    .focus()
    .setTextSelection(0)
    .insertContent({
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Table of Contents" }],
    })
    .insertContent({ type: "paragraph" })
    .run();
}
