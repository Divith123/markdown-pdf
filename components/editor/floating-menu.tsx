"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { type Editor } from "@tiptap/core";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code2,
  Minus,
  Table,
  Image,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingMenuProps {
  editor: Editor | null;
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick: () => void;
}

function MenuItem({ icon, label, description, onClick }: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-muted rounded-md transition-colors"
    >
      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded bg-muted">
        {icon}
      </div>
      <div>
        <div className="text-sm font-medium">{label}</div>
        {description && (
          <div className="text-xs text-muted-foreground">{description}</div>
        )}
      </div>
    </button>
  );
}

export function FloatingMenu({ editor }: FloatingMenuProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const checkShouldShow = useCallback(() => {
    if (!editor) return false;
    
    const { from, empty } = editor.state.selection;
    
    // Only show on empty paragraphs at the start of a line
    if (!empty) return false;
    
    const $pos = editor.state.doc.resolve(from);
    const parent = $pos.parent;
    
    // Check if we're in an empty paragraph
    if (parent.type.name !== "paragraph" || parent.textContent.length > 0) {
      return false;
    }
    
    // Check if it's at the beginning of the block
    const isAtStart = $pos.parentOffset === 0;
    
    return isAtStart;
  }, [editor]);

  const updatePosition = useCallback(() => {
    if (!editor) return;
    
    const shouldShow = checkShouldShow();
    
    if (!shouldShow) {
      setIsVisible(false);
      return;
    }

    // Get the cursor coordinates
    const { from } = editor.state.selection;
    const view = editor.view;
    const coords = view.coordsAtPos(from);
    
    setPosition({ 
      top: coords.top,
      left: coords.left - 40, // Position to the left of cursor
    });
    setIsVisible(true);
  }, [editor, checkShouldShow]);

  useEffect(() => {
    if (!editor) return;

    editor.on("selectionUpdate", updatePosition);
    editor.on("transaction", updatePosition);
    editor.on("blur", () => setIsVisible(false));

    return () => {
      editor.off("selectionUpdate", updatePosition);
      editor.off("transaction", updatePosition);
      editor.off("blur", () => setIsVisible(false));
    };
  }, [editor, updatePosition]);

  if (!editor || !isVisible) return null;

  const menuItems = [
    {
      icon: <Heading1 className="h-4 w-4" />,
      label: "Heading 1",
      description: "Large section heading",
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      icon: <Heading2 className="h-4 w-4" />,
      label: "Heading 2",
      description: "Medium section heading",
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      icon: <Heading3 className="h-4 w-4" />,
      label: "Heading 3",
      description: "Small section heading",
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      icon: <List className="h-4 w-4" />,
      label: "Bullet List",
      description: "Create a bullet list",
      onClick: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      icon: <ListOrdered className="h-4 w-4" />,
      label: "Numbered List",
      description: "Create a numbered list",
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      icon: <CheckSquare className="h-4 w-4" />,
      label: "Task List",
      description: "Create a task list",
      onClick: () => editor.chain().focus().toggleTaskList().run(),
    },
    {
      icon: <Quote className="h-4 w-4" />,
      label: "Blockquote",
      description: "Create a quote block",
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      icon: <Code2 className="h-4 w-4" />,
      label: "Code Block",
      description: "Create a code block",
      onClick: () => editor.chain().focus().toggleCodeBlock().run(),
    },
    {
      icon: <Minus className="h-4 w-4" />,
      label: "Divider",
      description: "Insert horizontal rule",
      onClick: () => editor.chain().focus().setHorizontalRule().run(),
    },
    {
      icon: <AlertCircle className="h-4 w-4" />,
      label: "Callout",
      description: "Create an info callout",
      onClick: () => {
        editor.chain().focus().insertContent({
          type: "callout",
          attrs: { type: "info" },
          content: [{ type: "paragraph" }],
        }).run();
      },
    },
  ];

  return (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        zIndex: 50,
      }}
      className="w-64 max-h-80 overflow-auto p-2 bg-popover border rounded-lg shadow-lg"
    >
      <div className="text-xs font-medium text-muted-foreground px-2 py-1 mb-1">
        Add a block
      </div>
      {menuItems.map((item, index) => (
        <MenuItem
          key={index}
          icon={item.icon}
          label={item.label}
          description={item.description}
          onClick={() => {
            item.onClick();
            setIsVisible(false);
          }}
        />
      ))}
    </div>
  );
}

// Simple inline trigger button for floating menu
export function FloatingMenuTrigger({ editor }: { editor: Editor | null }) {
  const [showMenu, setShowMenu] = useState(false);
  
  if (!editor) return null;
  
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowMenu(!showMenu)}
        className="w-6 h-6 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground"
        title="Add block"
      >
        +
      </button>
      {showMenu && (
        <div className="absolute top-full left-0 mt-1 z-50">
          <FloatingMenu editor={editor} />
        </div>
      )}
    </div>
  );
}
