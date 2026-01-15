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
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sigma, Plus, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";
import { mathTemplates } from "@/lib/editor/extensions/math-node";
import { useEditorStore } from "@/stores/editor-store";

export interface MathDialogProps {
  mode?: "inline" | "block";
  onInsert?: () => void;
}

export function MathDialog({ mode = "block", onInsert }: MathDialogProps = {}) {
  const { editor } = useEditorStore();
  const [open, setOpen] = useState(false);
  const [latex, setLatex] = useState("");
  const [preview, setPreview] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Render preview
  const updatePreview = async (code: string) => {
    if (!code.trim()) {
      setPreview("");
      setError(null);
      return;
    }

    try {
      // Dynamic import for katex
      const katex = (await import("katex")).default;
      const html = katex.renderToString(code, {
        throwOnError: true,
        displayMode: mode === "block",
      });
      setPreview(html);
      setError(null);
    } catch (e: any) {
      setError(e.message || "Invalid LaTeX");
      setPreview("");
    }
  };

  const handleInsert = () => {
    if (!editor || !latex.trim()) return;

    if (mode === "inline") {
      editor.chain().focus().insertContent({
        type: "mathInline",
        attrs: { latex },
      }).run();
    } else {
      editor.chain().focus().insertContent({
        type: "mathBlock",
        attrs: { latex },
      }).run();
    }

    setLatex("");
    setPreview("");
    setError(null);
    setOpen(false);
  };

  const handleTemplateSelect = (template: string) => {
    setLatex(template);
    updatePreview(template);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Insert Math Equation">
          <Sigma className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sigma className="h-5 w-5" />
            Insert Math Equation
          </DialogTitle>
          <DialogDescription>
            Enter LaTeX code to create a math equation
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="editor" className="mt-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="latex">LaTeX Code</Label>
              <div className="relative">
                <Input
                  id="latex"
                  value={latex}
                  onChange={(e) => {
                    setLatex(e.target.value);
                    updatePreview(e.target.value);
                  }}
                  placeholder="e.g., \\frac{a}{b}, x^2, \\sqrt{x}"
                  className="font-mono"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Use standard LaTeX math notation
              </p>
            </div>

            <div className="space-y-2">
              <Label>Preview</Label>
              <div
                className={cn(
                  "p-4 border rounded-lg min-h-[80px] flex items-center justify-center",
                  mode === "block" ? "text-center" : "text-left",
                  error ? "border-destructive bg-destructive/5" : "bg-muted/30"
                )}
              >
                {error ? (
                  <p className="text-sm text-destructive">{error}</p>
                ) : preview ? (
                  <div dangerouslySetInnerHTML={{ __html: preview }} />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Enter LaTeX to see preview
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Mode</Label>
              <div className="flex gap-2">
                <Button
                  variant={mode === "inline" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updatePreview(latex)}
                >
                  Inline ($...$)
                </Button>
                <Button
                  variant={mode === "block" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updatePreview(latex)}
                >
                  Block ($$...$$)
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="mt-4">
            <ScrollArea className="h-[300px]">
              <div className="space-y-4 pr-4">
                {Object.entries(mathTemplates).map(([category, templates]) => (
                  <div key={category}>
                    <h4 className="text-sm font-medium capitalize mb-2">
                      {category.replace(/([A-Z])/g, " $1").trim()}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {templates.map((template) => (
                        <button
                          key={template.name}
                          onClick={() => handleTemplateSelect(template.latex)}
                          className={cn(
                            "p-3 text-left border rounded-lg hover:bg-muted transition-colors",
                            latex === template.latex && "border-primary bg-primary/5"
                          )}
                        >
                          <p className="text-sm font-medium">{template.name}</p>
                          <code className="text-xs text-muted-foreground truncate block mt-1">
                            {template.latex}
                          </code>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleInsert} disabled={!latex.trim() || !!error}>
            <Plus className="h-4 w-4 mr-2" />
            Insert Equation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Quick math symbols bar
export function QuickMathSymbols({ editor }: { editor: Editor | null }) {
  const symbols = [
    { symbol: "α", latex: "\\alpha" },
    { symbol: "β", latex: "\\beta" },
    { symbol: "γ", latex: "\\gamma" },
    { symbol: "π", latex: "\\pi" },
    { symbol: "σ", latex: "\\sigma" },
    { symbol: "∑", latex: "\\sum" },
    { symbol: "∫", latex: "\\int" },
    { symbol: "√", latex: "\\sqrt{}" },
    { symbol: "∞", latex: "\\infty" },
    { symbol: "≠", latex: "\\neq" },
    { symbol: "≤", latex: "\\leq" },
    { symbol: "≥", latex: "\\geq" },
    { symbol: "×", latex: "\\times" },
    { symbol: "÷", latex: "\\div" },
    { symbol: "±", latex: "\\pm" },
  ];

  const insertSymbol = (latex: string) => {
    if (!editor) return;
    editor.chain().focus().insertContent({
      type: "mathInline",
      attrs: { latex },
    }).run();
  };

  return (
    <div className="flex flex-wrap gap-1 p-2 border rounded-lg bg-muted/30">
      {symbols.map(({ symbol, latex }) => (
        <button
          key={symbol}
          onClick={() => insertSymbol(latex)}
          className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded text-lg transition-colors"
          title={latex}
        >
          {symbol}
        </button>
      ))}
    </div>
  );
}
