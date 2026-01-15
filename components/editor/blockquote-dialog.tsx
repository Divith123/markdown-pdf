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
import { Label } from "@/components/ui/label";
import { Quote, User, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/stores/editor-store";

interface BlockquoteStyle {
  id: string;
  name: string;
  className: string;
  preview: React.ReactNode;
}

const blockquoteStyles: BlockquoteStyle[] = [
  {
    id: "default",
    name: "Default",
    className: "blockquote-default",
    preview: (
      <div className="border-l-4 border-muted-foreground/30 pl-4 py-2 italic text-muted-foreground">
        "Default quote style with left border"
      </div>
    ),
  },
  {
    id: "modern",
    name: "Modern",
    className: "blockquote-modern",
    preview: (
      <div className="bg-muted/50 rounded-lg p-4 text-muted-foreground">
        <span className="text-3xl text-muted-foreground/30">"</span>
        <span className="italic">Modern quote with background</span>
      </div>
    ),
  },
  {
    id: "classic",
    name: "Classic",
    className: "blockquote-classic",
    preview: (
      <div className="text-center italic text-muted-foreground py-4">
        <span className="text-4xl leading-none">"</span>
        <span>Classic centered quote</span>
        <span className="text-4xl leading-none">"</span>
      </div>
    ),
  },
  {
    id: "fancy",
    name: "Fancy",
    className: "blockquote-fancy",
    preview: (
      <div className="border-l-4 border-r-4 border-primary/30 px-6 py-4 text-center italic text-muted-foreground">
        "Fancy style with double borders"
      </div>
    ),
  },
  {
    id: "pull",
    name: "Pull Quote",
    className: "blockquote-pull",
    preview: (
      <div className="border-t-2 border-b-2 border-primary py-4 text-xl font-serif italic text-center text-muted-foreground">
        "Large pull quote style"
      </div>
    ),
  },
  {
    id: "academic",
    name: "Academic",
    className: "blockquote-academic",
    preview: (
      <div className="pl-8 border-l border-muted-foreground/20 text-sm text-muted-foreground">
        "Academic citation style with thin border"
        <div className="mt-1 text-xs">— Source, 2024</div>
      </div>
    ),
  },
];

export interface BlockquoteDialogProps {
  onInsert?: () => void;
}

export function BlockquoteDialog({ onInsert }: BlockquoteDialogProps = {}) {
  const { editor } = useEditorStore();
  const [open, setOpen] = useState(false);
  const [quoteText, setQuoteText] = useState("");
  const [author, setAuthor] = useState("");
  const [source, setSource] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("default");

  const insertBlockquote = () => {
    if (!editor || !quoteText.trim()) return;

    let content = quoteText;
    
    // Add attribution if provided
    if (author || source) {
      content += "\n";
      if (author) content += `— ${author}`;
      if (source) content += author ? `, ${source}` : `— ${source}`;
    }

    const style = blockquoteStyles.find((s) => s.id === selectedStyle);
    
    editor
      .chain()
      .focus()
      .insertContent({
        type: "blockquote",
        attrs: {
          class: style?.className || "",
        },
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: content }],
          },
        ],
      })
      .run();

    // Reset form
    setQuoteText("");
    setAuthor("");
    setSource("");
    setOpen(false);
  };

  const applyStyleToSelection = (styleId: string) => {
    if (!editor) return;
    
    const style = blockquoteStyles.find((s) => s.id === styleId);
    if (!style) return;

    // Toggle blockquote with style
    if (editor.isActive("blockquote")) {
      editor.chain().focus().updateAttributes("blockquote", {
        class: style.className,
      }).run();
    } else {
      editor.chain().focus().setBlockquote().updateAttributes("blockquote", {
        class: style.className,
      }).run();
    }

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Insert Blockquote">
          <Quote className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Quote className="h-5 w-5" />
            Insert Blockquote
          </DialogTitle>
          <DialogDescription>
            Add a styled quote to your document
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Style Selection */}
          <div className="space-y-2">
            <Label>Style</Label>
            <div className="grid grid-cols-2 gap-2">
              {blockquoteStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={cn(
                    "p-3 border rounded-lg text-left transition-colors",
                    selectedStyle === style.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  )}
                >
                  <p className="text-xs font-medium mb-2">{style.name}</p>
                  <div className="scale-75 origin-left">{style.preview}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quote Text */}
          <div className="space-y-2">
            <Label htmlFor="quote">Quote Text</Label>
            <textarea
              id="quote"
              value={quoteText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setQuoteText(e.target.value)}
              placeholder="Enter the quote text..."
              rows={3}
              className="w-full min-h-20 p-3 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
          </div>

          {/* Attribution */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="author" className="flex items-center gap-1">
                <User className="h-3 w-3" />
                Author
              </Label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Author name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source" className="flex items-center gap-1">
                <LinkIcon className="h-3 w-3" />
                Source
              </Label>
              <Input
                id="source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Book, article, etc."
              />
            </div>
          </div>

          {/* Quick Apply */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2">
              Or apply style to selected text:
            </p>
            <div className="flex flex-wrap gap-2">
              {blockquoteStyles.map((style) => (
                <Button
                  key={style.id}
                  variant="outline"
                  size="sm"
                  onClick={() => applyStyleToSelection(style.id)}
                >
                  {style.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={insertBlockquote} disabled={!quoteText.trim()}>
            Insert Quote
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// CSS for blockquote styles
export const blockquoteCSS = `
.ProseMirror blockquote {
  margin: 1em 0;
}

.ProseMirror blockquote.blockquote-default {
  border-left: 4px solid rgba(0, 0, 0, 0.1);
  padding-left: 1rem;
  font-style: italic;
  color: rgba(0, 0, 0, 0.7);
}

.ProseMirror blockquote.blockquote-modern {
  background: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  padding: 1.5rem;
  position: relative;
}

.ProseMirror blockquote.blockquote-modern::before {
  content: """;
  font-size: 4rem;
  line-height: 1;
  position: absolute;
  top: 0;
  left: 0.5rem;
  color: rgba(0, 0, 0, 0.1);
}

.ProseMirror blockquote.blockquote-classic {
  text-align: center;
  font-style: italic;
  padding: 1rem 2rem;
}

.ProseMirror blockquote.blockquote-classic::before,
.ProseMirror blockquote.blockquote-classic::after {
  font-size: 2rem;
  opacity: 0.3;
}

.ProseMirror blockquote.blockquote-classic::before {
  content: """;
}

.ProseMirror blockquote.blockquote-classic::after {
  content: """;
}

.ProseMirror blockquote.blockquote-fancy {
  border-left: 4px solid var(--primary, #3b82f6);
  border-right: 4px solid var(--primary, #3b82f6);
  padding: 1rem 1.5rem;
  text-align: center;
  font-style: italic;
}

.ProseMirror blockquote.blockquote-pull {
  border-top: 2px solid var(--primary, #3b82f6);
  border-bottom: 2px solid var(--primary, #3b82f6);
  padding: 1.5rem 1rem;
  text-align: center;
  font-size: 1.25rem;
  font-family: serif;
  font-style: italic;
}

.ProseMirror blockquote.blockquote-academic {
  border-left: 1px solid rgba(0, 0, 0, 0.1);
  padding-left: 2rem;
  font-size: 0.9rem;
  color: rgba(0, 0, 0, 0.7);
}

@media print {
  .ProseMirror blockquote {
    page-break-inside: avoid;
  }
}
`;
