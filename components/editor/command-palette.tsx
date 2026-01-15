"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Minus,
  Link2,
  Image,
  Table2,
  FileText,
  Search,
  Replace,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Download,
  Upload,
  Printer,
  Settings,
  History,
  Moon,
  Sun,
  Focus,
  Type,
  Palette,
  Trash2,
  Copy,
  Clipboard,
  Save,
  FolderOpen,
  FileUp,
  Smile,
  Hash,
  Info,
  AlertTriangle,
  Lightbulb,
  AlertCircle,
  Play,
  Video,
  Music,
  Code2,
  Subscript,
  Superscript,
  CaseSensitive,
} from "lucide-react";
import { useEditorStore } from "@/stores/editor-store";

interface CommandPaletteProps {
  onOpenFindReplace?: () => void;
  onOpenImageDialog?: () => void;
  onOpenLinkDialog?: () => void;
  onOpenTableDialog?: () => void;
  onOpenTemplates?: () => void;
  onOpenExport?: () => void;
  onOpenPrint?: () => void;
  onOpenSettings?: () => void;
  onOpenHistory?: () => void;
  onToggleFocusMode?: () => void;
  onToggleTheme?: () => void;
}

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string;
  keywords?: string[];
  action: () => void;
  category: string;
}

export function CommandPalette({
  onOpenFindReplace,
  onOpenImageDialog,
  onOpenLinkDialog,
  onOpenTableDialog,
  onOpenTemplates,
  onOpenExport,
  onOpenPrint,
  onOpenSettings,
  onOpenHistory,
  onToggleFocusMode,
  onToggleTheme,
}: CommandPaletteProps) {
  const { editor } = useEditorStore();
  const [open, setOpen] = useState(false);

  // Open with Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const runCommand = useCallback((action: () => void) => {
    setOpen(false);
    action();
  }, []);

  const commands: CommandItem[] = useMemo(() => {
    if (!editor) return [];

    return [
      // Formatting
      {
        id: "bold",
        label: "Bold",
        icon: <Bold className="h-4 w-4" />,
        shortcut: "Ctrl+B",
        keywords: ["format", "strong"],
        action: () => editor.chain().focus().toggleBold().run(),
        category: "Formatting",
      },
      {
        id: "italic",
        label: "Italic",
        icon: <Italic className="h-4 w-4" />,
        shortcut: "Ctrl+I",
        keywords: ["format", "emphasis"],
        action: () => editor.chain().focus().toggleItalic().run(),
        category: "Formatting",
      },
      {
        id: "underline",
        label: "Underline",
        icon: <Underline className="h-4 w-4" />,
        shortcut: "Ctrl+U",
        keywords: ["format"],
        action: () => editor.chain().focus().toggleUnderline().run(),
        category: "Formatting",
      },
      {
        id: "strikethrough",
        label: "Strikethrough",
        icon: <Strikethrough className="h-4 w-4" />,
        keywords: ["format", "strike", "delete"],
        action: () => editor.chain().focus().toggleStrike().run(),
        category: "Formatting",
      },
      {
        id: "code",
        label: "Inline Code",
        icon: <Code className="h-4 w-4" />,
        shortcut: "Ctrl+E",
        keywords: ["format", "monospace"],
        action: () => editor.chain().focus().toggleCode().run(),
        category: "Formatting",
      },
      {
        id: "subscript",
        label: "Subscript",
        icon: <Subscript className="h-4 w-4" />,
        keywords: ["format", "sub"],
        action: () => editor.chain().focus().toggleSubscript().run(),
        category: "Formatting",
      },
      {
        id: "superscript",
        label: "Superscript",
        icon: <Superscript className="h-4 w-4" />,
        keywords: ["format", "super"],
        action: () => editor.chain().focus().toggleSuperscript().run(),
        category: "Formatting",
      },

      // Headings
      {
        id: "heading1",
        label: "Heading 1",
        icon: <Heading1 className="h-4 w-4" />,
        shortcut: "Ctrl+Alt+1",
        keywords: ["title", "h1"],
        action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        category: "Headings",
      },
      {
        id: "heading2",
        label: "Heading 2",
        icon: <Heading2 className="h-4 w-4" />,
        shortcut: "Ctrl+Alt+2",
        keywords: ["subtitle", "h2"],
        action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        category: "Headings",
      },
      {
        id: "heading3",
        label: "Heading 3",
        icon: <Heading3 className="h-4 w-4" />,
        shortcut: "Ctrl+Alt+3",
        keywords: ["section", "h3"],
        action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        category: "Headings",
      },

      // Lists
      {
        id: "bulletList",
        label: "Bullet List",
        icon: <List className="h-4 w-4" />,
        keywords: ["ul", "unordered"],
        action: () => editor.chain().focus().toggleBulletList().run(),
        category: "Lists",
      },
      {
        id: "numberedList",
        label: "Numbered List",
        icon: <ListOrdered className="h-4 w-4" />,
        keywords: ["ol", "ordered"],
        action: () => editor.chain().focus().toggleOrderedList().run(),
        category: "Lists",
      },
      {
        id: "taskList",
        label: "Task List",
        icon: <CheckSquare className="h-4 w-4" />,
        keywords: ["todo", "checkbox"],
        action: () => editor.chain().focus().toggleTaskList().run(),
        category: "Lists",
      },

      // Blocks
      {
        id: "blockquote",
        label: "Blockquote",
        icon: <Quote className="h-4 w-4" />,
        keywords: ["quote", "cite"],
        action: () => editor.chain().focus().toggleBlockquote().run(),
        category: "Blocks",
      },
      {
        id: "codeblock",
        label: "Code Block",
        icon: <Code2 className="h-4 w-4" />,
        keywords: ["pre", "syntax"],
        action: () => editor.chain().focus().toggleCodeBlock().run(),
        category: "Blocks",
      },
      {
        id: "divider",
        label: "Horizontal Divider",
        icon: <Minus className="h-4 w-4" />,
        keywords: ["hr", "line", "separator"],
        action: () => editor.chain().focus().setHorizontalRule().run(),
        category: "Blocks",
      },

      // Callouts
      {
        id: "infoCallout",
        label: "Info Callout",
        icon: <Info className="h-4 w-4 text-blue-500" />,
        keywords: ["note", "information"],
        action: () => editor.chain().focus().setCallout("info").run(),
        category: "Callouts",
      },
      {
        id: "warningCallout",
        label: "Warning Callout",
        icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
        keywords: ["alert", "caution"],
        action: () => editor.chain().focus().setCallout("warning").run(),
        category: "Callouts",
      },
      {
        id: "tipCallout",
        label: "Tip Callout",
        icon: <Lightbulb className="h-4 w-4 text-green-500" />,
        keywords: ["hint", "suggestion"],
        action: () => editor.chain().focus().setCallout("tip").run(),
        category: "Callouts",
      },
      {
        id: "dangerCallout",
        label: "Danger Callout",
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
        keywords: ["error", "critical"],
        action: () => editor.chain().focus().setCallout("danger").run(),
        category: "Callouts",
      },

      // Insert
      {
        id: "link",
        label: "Insert Link",
        icon: <Link2 className="h-4 w-4" />,
        shortcut: "Ctrl+K",
        keywords: ["url", "href"],
        action: () => onOpenLinkDialog?.(),
        category: "Insert",
      },
      {
        id: "image",
        label: "Insert Image",
        icon: <Image className="h-4 w-4" />,
        keywords: ["picture", "photo"],
        action: () => onOpenImageDialog?.(),
        category: "Insert",
      },
      {
        id: "table",
        label: "Insert Table",
        icon: <Table2 className="h-4 w-4" />,
        keywords: ["grid", "cells"],
        action: () => onOpenTableDialog?.(),
        category: "Insert",
      },

      // Alignment
      {
        id: "alignLeft",
        label: "Align Left",
        icon: <AlignLeft className="h-4 w-4" />,
        keywords: ["justify"],
        action: () => editor.chain().focus().setTextAlign("left").run(),
        category: "Alignment",
      },
      {
        id: "alignCenter",
        label: "Align Center",
        icon: <AlignCenter className="h-4 w-4" />,
        keywords: ["middle"],
        action: () => editor.chain().focus().setTextAlign("center").run(),
        category: "Alignment",
      },
      {
        id: "alignRight",
        label: "Align Right",
        icon: <AlignRight className="h-4 w-4" />,
        action: () => editor.chain().focus().setTextAlign("right").run(),
        category: "Alignment",
      },
      {
        id: "alignJustify",
        label: "Justify",
        icon: <AlignJustify className="h-4 w-4" />,
        action: () => editor.chain().focus().setTextAlign("justify").run(),
        category: "Alignment",
      },

      // Edit
      {
        id: "undo",
        label: "Undo",
        icon: <Undo className="h-4 w-4" />,
        shortcut: "Ctrl+Z",
        action: () => editor.chain().focus().undo().run(),
        category: "Edit",
      },
      {
        id: "redo",
        label: "Redo",
        icon: <Redo className="h-4 w-4" />,
        shortcut: "Ctrl+Y",
        action: () => editor.chain().focus().redo().run(),
        category: "Edit",
      },
      {
        id: "findReplace",
        label: "Find and Replace",
        icon: <Search className="h-4 w-4" />,
        shortcut: "Ctrl+H",
        keywords: ["search"],
        action: () => onOpenFindReplace?.(),
        category: "Edit",
      },
      {
        id: "clearFormatting",
        label: "Clear Formatting",
        icon: <Type className="h-4 w-4" />,
        keywords: ["remove", "reset"],
        action: () => editor.chain().focus().clearNodes().unsetAllMarks().run(),
        category: "Edit",
      },

      // Document
      {
        id: "templates",
        label: "Document Templates",
        icon: <FileText className="h-4 w-4" />,
        keywords: ["new", "start"],
        action: () => onOpenTemplates?.(),
        category: "Document",
      },
      {
        id: "history",
        label: "Document History",
        icon: <History className="h-4 w-4" />,
        keywords: ["versions", "restore"],
        action: () => onOpenHistory?.(),
        category: "Document",
      },
      {
        id: "export",
        label: "Export Document",
        icon: <Download className="h-4 w-4" />,
        keywords: ["save", "download"],
        action: () => onOpenExport?.(),
        category: "Document",
      },
      {
        id: "print",
        label: "Print",
        icon: <Printer className="h-4 w-4" />,
        shortcut: "Ctrl+P",
        action: () => onOpenPrint?.(),
        category: "Document",
      },

      // View
      {
        id: "focusMode",
        label: "Toggle Focus Mode",
        icon: <Focus className="h-4 w-4" />,
        keywords: ["distraction", "zen"],
        action: () => onToggleFocusMode?.(),
        category: "View",
      },
      {
        id: "theme",
        label: "Toggle Theme",
        icon: <Moon className="h-4 w-4" />,
        keywords: ["dark", "light", "mode"],
        action: () => onToggleTheme?.(),
        category: "View",
      },
      {
        id: "settings",
        label: "Editor Settings",
        icon: <Settings className="h-4 w-4" />,
        keywords: ["preferences", "options"],
        action: () => onOpenSettings?.(),
        category: "View",
      },
    ];
  }, [editor, onOpenFindReplace, onOpenImageDialog, onOpenLinkDialog, onOpenTableDialog, onOpenTemplates, onOpenExport, onOpenPrint, onOpenSettings, onOpenHistory, onToggleFocusMode, onToggleTheme]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    commands.forEach((cmd) => {
      if (!groups[cmd.category]) {
        groups[cmd.category] = [];
      }
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [commands]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {Object.entries(groupedCommands).map(([category, items], index) => (
          <CommandGroup key={category} heading={category}>
            {items.map((item) => (
              <CommandItem
                key={item.id}
                value={`${item.label} ${item.keywords?.join(" ") || ""}`}
                onSelect={() => runCommand(item.action)}
              >
                {item.icon}
                <span className="ml-2">{item.label}</span>
                {item.shortcut && (
                  <CommandShortcut>{item.shortcut}</CommandShortcut>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
