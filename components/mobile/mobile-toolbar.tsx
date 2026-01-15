"use client";

import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/stores/editor-store";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  CheckSquare,
  Image,
  Link,
  Code,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Keyboard,
} from "lucide-react";

interface MobileToolbarProps {
  onKeyboardHide?: () => void;
  className?: string;
}

export function MobileToolbar({ onKeyboardHide, className }: MobileToolbarProps) {
  const { editor } = useEditorStore();

  if (!editor) return null;

  const formatButtons = [
    { 
      icon: Heading1, 
      label: "Heading 1", 
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive("heading", { level: 1 }),
    },
    { 
      icon: Heading2, 
      label: "Heading 2", 
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive("heading", { level: 2 }),
    },
    { 
      icon: Heading3, 
      label: "Heading 3", 
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor.isActive("heading", { level: 3 }),
    },
    { type: "divider" as const },
    {
      icon: Bold,
      label: "Bold",
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive("bold"),
    },
    {
      icon: Italic,
      label: "Italic",
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive("italic"),
    },
    {
      icon: Underline,
      label: "Underline",
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive("underline"),
    },
    {
      icon: Strikethrough,
      label: "Strikethrough",
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive("strike"),
    },
    { type: "divider" as const },
    {
      icon: List,
      label: "Bullet List",
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive("bulletList"),
    },
    {
      icon: ListOrdered,
      label: "Numbered List",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive("orderedList"),
    },
    {
      icon: CheckSquare,
      label: "Task List",
      action: () => editor.chain().focus().toggleTaskList().run(),
      isActive: editor.isActive("taskList"),
    },
    { type: "divider" as const },
    {
      icon: Quote,
      label: "Quote",
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive("blockquote"),
    },
    {
      icon: Code,
      label: "Code",
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: editor.isActive("codeBlock"),
    },
    {
      icon: Link,
      label: "Link",
      action: () => {
        const url = window.prompt("Enter URL");
        if (url) {
          editor.chain().focus().setLink({ href: url }).run();
        }
      },
      isActive: editor.isActive("link"),
    },
    {
      icon: Image,
      label: "Image",
      action: () => {
        const url = window.prompt("Enter image URL");
        if (url) {
          // Insert image as HTML since setImage may not be available
          editor.chain().focus().insertContent(`<img src="${url}" alt="Image" />`).run();
        }
      },
      isActive: false,
    },
  ];

  return (
    <div className={cn("fixed bottom-0 left-0 right-0 z-50 md:hidden", className)}>
      <div className="bg-background/95 backdrop-blur-xl border-t shadow-lg pb-6 pt-3 px-2">
        {/* Handle bar */}
        <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-3" />
        
        <div className="flex items-center justify-between max-w-2xl mx-auto gap-2">
          {/* Scrollable Format Tools */}
          <div className="flex-1 overflow-x-auto flex items-center gap-1 pr-4 scrollbar-hide">
            {formatButtons.map((item, index) => {
              if ("type" in item && item.type === "divider") {
                return (
                  <div
                    key={`divider-${index}`}
                    className="w-px h-6 bg-border mx-1 shrink-0"
                  />
                );
              }

              const Icon = item.icon;
              return (
                <Button
                  key={item.label}
                  variant="ghost"
                  size="sm"
                  onClick={item.action}
                  className={cn(
                    "p-2 rounded-lg shrink-0 h-auto",
                    item.isActive && "bg-primary/10 text-primary"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </Button>
              );
            })}
          </div>

          {/* Keyboard Dismiss Button */}
          {onKeyboardHide && (
            <Button
              variant="secondary"
              size="icon"
              onClick={onKeyboardHide}
              className="rounded-full shrink-0 ml-2"
            >
              <Keyboard className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
