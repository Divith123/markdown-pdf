"use client";

import { useState } from "react";
import { Editor } from "@tiptap/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/stores/editor-store";

interface HorizontalRuleStyle {
  id: string;
  name: string;
  preview: React.ReactNode;
  className: string;
  style?: Record<string, string>;
}

const hrStyles: HorizontalRuleStyle[] = [
  {
    id: "solid",
    name: "Solid Line",
    preview: <div className="w-full h-0.5 bg-border" />,
    className: "hr-solid",
  },
  {
    id: "dashed",
    name: "Dashed Line",
    preview: <div className="w-full h-0.5 border-t-2 border-dashed border-border" />,
    className: "hr-dashed",
  },
  {
    id: "dotted",
    name: "Dotted Line",
    preview: <div className="w-full h-0.5 border-t-2 border-dotted border-border" />,
    className: "hr-dotted",
  },
  {
    id: "double",
    name: "Double Line",
    preview: (
      <div className="w-full space-y-0.5">
        <div className="h-0.5 bg-border" />
        <div className="h-0.5 bg-border" />
      </div>
    ),
    className: "hr-double",
  },
  {
    id: "thick",
    name: "Thick Line",
    preview: <div className="w-full h-1 bg-border" />,
    className: "hr-thick",
  },
  {
    id: "thin",
    name: "Thin Line",
    preview: <div className="w-full h-px bg-border/50" />,
    className: "hr-thin",
  },
  {
    id: "gradient",
    name: "Gradient",
    preview: (
      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-border to-transparent" />
    ),
    className: "hr-gradient",
  },
  {
    id: "stars",
    name: "Stars",
    preview: (
      <div className="w-full flex items-center justify-center gap-4 text-muted-foreground">
        <span>✦</span>
        <span>✦</span>
        <span>✦</span>
      </div>
    ),
    className: "hr-stars",
  },
  {
    id: "asterisks",
    name: "Asterisks",
    preview: (
      <div className="w-full flex items-center justify-center gap-4 text-muted-foreground">
        <span>*</span>
        <span>*</span>
        <span>*</span>
      </div>
    ),
    className: "hr-asterisks",
  },
  {
    id: "flourish",
    name: "Flourish",
    preview: (
      <div className="w-full flex items-center justify-center text-muted-foreground">
        <span>❧</span>
      </div>
    ),
    className: "hr-flourish",
  },
  {
    id: "ornament",
    name: "Ornament",
    preview: (
      <div className="w-full flex items-center justify-center gap-2 text-muted-foreground">
        <span className="flex-1 h-px bg-border" />
        <span>◆</span>
        <span className="flex-1 h-px bg-border" />
      </div>
    ),
    className: "hr-ornament",
  },
  {
    id: "wave",
    name: "Wave",
    preview: (
      <div className="w-full text-center text-muted-foreground text-lg">
        ～～～～～～～
      </div>
    ),
    className: "hr-wave",
  },
];

export interface HorizontalRuleDialogProps {
  onInsert?: () => void;
}

export function HorizontalRuleDialog({ onInsert }: HorizontalRuleDialogProps = {}) {
  const { editor } = useEditorStore();
  const [open, setOpen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("solid");

  const insertHorizontalRule = (styleId: string) => {
    if (!editor) return;

    const style = hrStyles.find((s) => s.id === styleId);
    if (!style) return;

    // Insert a styled horizontal rule
    editor
      .chain()
      .focus()
      .insertContent({
        type: "styledHorizontalRule",
        attrs: { style: styleId },
      })
      .run();

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Insert Horizontal Rule">
          <Minus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Insert Horizontal Rule</DialogTitle>
          <DialogDescription>
            Choose a divider style for your document
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 mt-4">
          {hrStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => insertHorizontalRule(style.id)}
              className={cn(
                "p-4 border rounded-lg hover:bg-muted/50 transition-colors text-left",
                selectedStyle === style.id && "border-primary bg-primary/5"
              )}
              onMouseEnter={() => setSelectedStyle(style.id)}
            >
              <div className="mb-2">{style.preview}</div>
              <p className="text-xs text-muted-foreground text-center">
                {style.name}
              </p>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Quick horizontal rule insert
export function QuickHorizontalRule({ editor }: { editor: Editor | null }) {
  const insertRule = () => {
    if (!editor) return;
    editor.chain().focus().setHorizontalRule().run();
  };

  return (
    <Button variant="ghost" size="sm" onClick={insertRule} title="Insert Horizontal Rule">
      <Minus className="h-4 w-4" />
    </Button>
  );
}

// CSS for styled horizontal rules
export const horizontalRuleCSS = `
.ProseMirror hr {
  border: none;
  margin: 1.5em 0;
}

.ProseMirror hr.hr-solid {
  height: 1px;
  background: currentColor;
  opacity: 0.2;
}

.ProseMirror hr.hr-dashed {
  height: 0;
  border-top: 2px dashed currentColor;
  opacity: 0.2;
}

.ProseMirror hr.hr-dotted {
  height: 0;
  border-top: 2px dotted currentColor;
  opacity: 0.2;
}

.ProseMirror hr.hr-double {
  height: 6px;
  background: linear-gradient(currentColor 1px, transparent 1px, transparent 4px, currentColor 4px);
  opacity: 0.2;
}

.ProseMirror hr.hr-thick {
  height: 4px;
  background: currentColor;
  opacity: 0.2;
}

.ProseMirror hr.hr-thin {
  height: 1px;
  background: currentColor;
  opacity: 0.1;
}

.ProseMirror hr.hr-gradient {
  height: 1px;
  background: linear-gradient(to right, transparent, currentColor, transparent);
  opacity: 0.2;
}

.ProseMirror hr.hr-stars::before {
  content: "✦  ✦  ✦";
  display: block;
  text-align: center;
  font-size: 0.875em;
  opacity: 0.4;
}

.ProseMirror hr.hr-asterisks::before {
  content: "*  *  *";
  display: block;
  text-align: center;
  font-size: 1em;
  letter-spacing: 0.5em;
  opacity: 0.4;
}

.ProseMirror hr.hr-flourish::before {
  content: "❧";
  display: block;
  text-align: center;
  font-size: 1.25em;
  opacity: 0.4;
}

.ProseMirror hr.hr-ornament {
  display: flex;
  align-items: center;
  height: 1em;
}

.ProseMirror hr.hr-ornament::before,
.ProseMirror hr.hr-ornament::after {
  content: "";
  flex: 1;
  height: 1px;
  background: currentColor;
  opacity: 0.2;
}

.ProseMirror hr.hr-ornament::before {
  margin-right: 0.5em;
}

.ProseMirror hr.hr-ornament::after {
  margin-left: 0.5em;
  content: "";
}

.ProseMirror hr.hr-wave::before {
  content: "～～～～～";
  display: block;
  text-align: center;
  opacity: 0.4;
}

@media print {
  .ProseMirror hr.hr-stars::before,
  .ProseMirror hr.hr-asterisks::before,
  .ProseMirror hr.hr-flourish::before {
    color: black;
  }
}
`;
