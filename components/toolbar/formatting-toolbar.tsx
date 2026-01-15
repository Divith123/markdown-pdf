"use client";

import { useState } from "react";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEditorStore } from "@/stores/editor-store";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Highlighter,
  List,
  ListOrdered,
  ListTodo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Image as ImageIcon,
  Table,
  Minus,
  Undo,
  Redo,
  Subscript,
  Superscript,
  Smile,
  Hash,
  Quote,
  Sigma,
  GitBranch,
  Code2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Import component dialogs
import {
  EmojiPicker,
  ColorPicker,
  TableDialog,
  ImageDialog,
  LinkDialog,
  CodeBlockDialog,
  MathDialog,
  DiagramDialog,
  BlockquoteDialog,
  HorizontalRuleDialog,
  SpecialCharactersPicker,
} from "@/components/editor";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export function FormattingToolbar() {
  const { editor, isReady } = useEditorStore();

  if (!editor || !isReady) {
    return (
      <div className="flex h-10 items-center gap-1 rounded-lg border bg-background px-2">
        <div className="h-5 w-20 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  const isActive = (name: string, attrs?: Record<string, unknown>) => {
    return editor.isActive(name, attrs);
  };

  const handleHeadingChange = (value: string) => {
    if (value === "paragraph") {
      editor.chain().focus().setParagraph().run();
    } else {
      const level = parseInt(value.replace("h", "")) as HeadingLevel;
      editor.chain().focus().toggleHeading({ level }).run();
    }
  };

  const getCurrentHeading = () => {
    for (let i = 1; i <= 6; i++) {
      if (isActive("heading", { level: i })) {
        return `h${i}`;
      }
    }
    return "paragraph";
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-wrap items-center gap-0.5 rounded-lg border bg-background p-1">
        {/* Undo/Redo */}
        <ToolbarButton
          icon={<Undo className="h-4 w-4" />}
          tooltip="Undo (Ctrl+Z)"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        />
        <ToolbarButton
          icon={<Redo className="h-4 w-4" />}
          tooltip="Redo (Ctrl+Y)"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        />

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Block Type */}
        <Select value={getCurrentHeading()} onValueChange={handleHeadingChange}>
          <SelectTrigger className="h-8 w-28 text-xs">
            <SelectValue placeholder="Paragraph" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="paragraph">Paragraph</SelectItem>
            <SelectItem value="h1">Heading 1</SelectItem>
            <SelectItem value="h2">Heading 2</SelectItem>
            <SelectItem value="h3">Heading 3</SelectItem>
            <SelectItem value="h4">Heading 4</SelectItem>
            <SelectItem value="h5">Heading 5</SelectItem>
            <SelectItem value="h6">Heading 6</SelectItem>
          </SelectContent>
        </Select>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Text Formatting */}
        <ToolbarToggle
          icon={<Bold className="h-4 w-4" />}
          tooltip="Bold (Ctrl+B)"
          pressed={isActive("bold")}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarToggle
          icon={<Italic className="h-4 w-4" />}
          tooltip="Italic (Ctrl+I)"
          pressed={isActive("italic")}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarToggle
          icon={<Underline className="h-4 w-4" />}
          tooltip="Underline (Ctrl+U)"
          pressed={isActive("underline")}
          onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
        />
        <ToolbarToggle
          icon={<Strikethrough className="h-4 w-4" />}
          tooltip="Strikethrough"
          pressed={isActive("strike")}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        />
        <ToolbarToggle
          icon={<Code className="h-4 w-4" />}
          tooltip="Inline Code"
          pressed={isActive("code")}
          onPressedChange={() => editor.chain().focus().toggleCode().run()}
        />
        <ToolbarToggle
          icon={<Highlighter className="h-4 w-4" />}
          tooltip="Highlight"
          pressed={isActive("highlight")}
          onPressedChange={() => editor.chain().focus().toggleHighlight().run()}
        />
        
        {/* Subscript/Superscript */}
        <ToolbarToggle
          icon={<Subscript className="h-4 w-4" />}
          tooltip="Subscript"
          pressed={isActive("subscript")}
          onPressedChange={() => editor.chain().focus().toggleSubscript().run()}
        />
        <ToolbarToggle
          icon={<Superscript className="h-4 w-4" />}
          tooltip="Superscript"
          pressed={isActive("superscript")}
          onPressedChange={() => editor.chain().focus().toggleSuperscript().run()}
        />
        
        {/* Color Pickers */}
        <ColorPicker type="text" />
        <ColorPicker type="highlight" />

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Alignment */}
        <ToolbarToggle
          icon={<AlignLeft className="h-4 w-4" />}
          tooltip="Align Left"
          pressed={isActive("paragraph", { textAlign: "left" })}
          onPressedChange={() => editor.chain().focus().setTextAlign("left").run()}
        />
        <ToolbarToggle
          icon={<AlignCenter className="h-4 w-4" />}
          tooltip="Align Center"
          pressed={isActive("paragraph", { textAlign: "center" })}
          onPressedChange={() => editor.chain().focus().setTextAlign("center").run()}
        />
        <ToolbarToggle
          icon={<AlignRight className="h-4 w-4" />}
          tooltip="Align Right"
          pressed={isActive("paragraph", { textAlign: "right" })}
          onPressedChange={() => editor.chain().focus().setTextAlign("right").run()}
        />
        <ToolbarToggle
          icon={<AlignJustify className="h-4 w-4" />}
          tooltip="Justify"
          pressed={isActive("paragraph", { textAlign: "justify" })}
          onPressedChange={() => editor.chain().focus().setTextAlign("justify").run()}
        />

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Lists */}
        <ToolbarToggle
          icon={<List className="h-4 w-4" />}
          tooltip="Bullet List"
          pressed={isActive("bulletList")}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarToggle
          icon={<ListOrdered className="h-4 w-4" />}
          tooltip="Ordered List"
          pressed={isActive("orderedList")}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarToggle
          icon={<ListTodo className="h-4 w-4" />}
          tooltip="Task List"
          pressed={isActive("taskList")}
          onPressedChange={() => editor.chain().focus().toggleTaskList().run()}
        />

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Block Elements */}
        <BlockquoteDialog />
        <HorizontalRuleDialog />
        <TableDialog />
        
        <Separator orientation="vertical" className="mx-1 h-6" />
        
        {/* Insert */}
        <LinkToolbarButton />
        <ImageToolbarButton />
        <CodeBlockDialog />
        <EmojiPicker />
        <SpecialCharactersPicker />
        
        <Separator orientation="vertical" className="mx-1 h-6" />
        
        {/* Advanced Insert */}
        <MathDialog />
        <DiagramDialog />
      </div>
    </TooltipProvider>
  );
}

// Wrapper components for dialogs with open/close state
function LinkToolbarButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setOpen(true)}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Insert Link</p>
        </TooltipContent>
      </Tooltip>
      <LinkDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

function ImageToolbarButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setOpen(true)}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Insert Image</p>
        </TooltipContent>
      </Tooltip>
      <ImageDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

interface ToolbarButtonProps {
  icon: React.ReactNode;
  tooltip: string;
  onClick: () => void;
  disabled?: boolean;
}

function ToolbarButton({
  icon,
  tooltip,
  onClick,
  disabled,
}: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors",
            "hover:bg-muted hover:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:pointer-events-none disabled:opacity-50"
          )}
        >
          {icon}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

interface ToolbarToggleProps {
  icon: React.ReactNode;
  tooltip: string;
  pressed: boolean;
  onPressedChange: () => void;
}

function ToolbarToggle({
  icon,
  tooltip,
  pressed,
  onPressedChange,
}: ToolbarToggleProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Toggle
          size="sm"
          pressed={pressed}
          onPressedChange={onPressedChange}
          className="h-8 w-8 p-0"
        >
          {icon}
        </Toggle>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}
