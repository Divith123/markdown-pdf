"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GitBranch, Plus, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { diagramTemplates } from "@/lib/editor/extensions/mermaid-diagram";
import mermaid from "mermaid";
import { useEditorStore } from "@/stores/editor-store";

export interface DiagramDialogProps {
  onInsert?: () => void;
}

const diagramCategories = [
  { id: "flowchart", name: "Flowchart", templates: ["flowchartLR", "flowchartTD"] },
  { id: "sequence", name: "Sequence", templates: ["sequence"] },
  { id: "class", name: "Class", templates: ["classDiagram"] },
  { id: "state", name: "State", templates: ["stateDiagram"] },
  { id: "er", name: "ER Diagram", templates: ["erDiagram"] },
  { id: "gantt", name: "Gantt Chart", templates: ["gantt"] },
  { id: "pie", name: "Pie Chart", templates: ["pie"] },
  { id: "git", name: "Git Graph", templates: ["gitGraph"] },
  { id: "mindmap", name: "Mind Map", templates: ["mindmap"] },
];

const templateNames: Record<string, string> = {
  flowchartLR: "Flowchart (Left to Right)",
  flowchartTD: "Flowchart (Top to Down)",
  sequence: "Sequence Diagram",
  classDiagram: "Class Diagram",
  stateDiagram: "State Diagram",
  erDiagram: "Entity Relationship",
  gantt: "Gantt Chart",
  pie: "Pie Chart",
  gitGraph: "Git Graph",
  mindmap: "Mind Map",
};

export function DiagramDialog({ onInsert }: DiagramDialogProps = {}) {
  const { editor } = useEditorStore();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [preview, setPreview] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("flowchart");
  const [copied, setCopied] = useState(false);

  // Render preview
  const updatePreview = useCallback(async (mermaidCode: string) => {
    if (!mermaidCode.trim()) {
      setPreview("");
      setError(null);
      return;
    }

    try {
      const id = `mermaid-preview-${Date.now()}`;
      const { svg } = await mermaid.render(id, mermaidCode);
      setPreview(svg);
      setError(null);
    } catch (e: any) {
      console.error("Mermaid error:", e);
      setError(e.message || "Invalid diagram syntax");
      setPreview("");
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      updatePreview(code);
    }, 500);
    return () => clearTimeout(timeout);
  }, [code, updatePreview]);

  const handleInsert = () => {
    if (!editor || !code.trim()) return;

    editor.chain().focus().insertContent({
      type: "mermaidDiagram",
      attrs: { code },
    }).run();

    setCode("");
    setPreview("");
    setError(null);
    setOpen(false);
  };

  const handleTemplateSelect = (templateKey: string) => {
    const template = diagramTemplates[templateKey as keyof typeof diagramTemplates];
    if (template) {
      setCode(template);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Insert Diagram">
          <GitBranch className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Insert Mermaid Diagram
          </DialogTitle>
          <DialogDescription>
            Create flowcharts, sequence diagrams, and more using Mermaid syntax
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="editor" className="mt-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4 h-[400px]">
              {/* Code Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Mermaid Code</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyCode}
                    disabled={!code}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 mr-1" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1" />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={`Enter Mermaid diagram code...

Example:
graph LR
    A[Start] --> B{Decision}
    B -->|Yes| C[Action]
    B -->|No| D[End]`}
                  className="w-full h-[350px] p-3 font-mono text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <Label>Preview</Label>
                <div
                  className={cn(
                    "h-[350px] border rounded-lg overflow-auto flex items-center justify-center p-4",
                    error ? "border-destructive bg-destructive/5" : "bg-muted/30"
                  )}
                >
                  {error ? (
                    <div className="text-sm text-destructive text-center">
                      <p className="font-medium mb-2">Syntax Error</p>
                      <p className="text-xs">{error}</p>
                    </div>
                  ) : preview ? (
                    <div
                      className="max-w-full overflow-auto"
                      dangerouslySetInnerHTML={{ __html: preview }}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Enter code to see preview
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Syntax Help */}
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Tips:</strong> Use{" "}
                <code className="px-1 bg-muted rounded">graph LR</code> for
                left-to-right flowcharts,{" "}
                <code className="px-1 bg-muted rounded">graph TD</code> for
                top-to-down. Connect nodes with{" "}
                <code className="px-1 bg-muted rounded">--&gt;</code> or{" "}
                <code className="px-1 bg-muted rounded">---</code>.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="mt-4">
            <div className="grid grid-cols-4 gap-4 h-[450px]">
              {/* Category List */}
              <div className="space-y-1">
                {diagramCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                      selectedCategory === category.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              {/* Template Grid */}
              <div className="col-span-3">
                <ScrollArea className="h-[450px]">
                  <div className="space-y-4 pr-4">
                    {diagramCategories
                      .find((c) => c.id === selectedCategory)
                      ?.templates.map((templateKey) => {
                        const template =
                          diagramTemplates[
                            templateKey as keyof typeof diagramTemplates
                          ];
                        return (
                          <button
                            key={templateKey}
                            onClick={() => handleTemplateSelect(templateKey)}
                            className={cn(
                              "w-full p-4 border rounded-lg text-left hover:bg-muted/50 transition-colors",
                              code === template && "border-primary bg-primary/5"
                            )}
                          >
                            <p className="font-medium mb-2">
                              {templateNames[templateKey] || templateKey}
                            </p>
                            <pre className="text-xs text-muted-foreground bg-muted p-2 rounded overflow-x-auto">
                              {template.slice(0, 200)}
                              {template.length > 200 && "..."}
                            </pre>
                          </button>
                        );
                      })}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleInsert} disabled={!code.trim() || !!error}>
            <Plus className="h-4 w-4 mr-2" />
            Insert Diagram
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Quick diagram type selector for toolbar
export function QuickDiagramSelector({ editor }: { editor: Editor | null }) {
  const insertDiagram = (templateKey: string) => {
    if (!editor) return;
    const template = diagramTemplates[templateKey as keyof typeof diagramTemplates];
    if (template) {
      editor.chain().focus().insertContent({
        type: "mermaidDiagram",
        attrs: { code: template },
      }).run();
    }
  };

  return (
    <Select onValueChange={insertDiagram}>
      <SelectTrigger className="w-[160px]">
        <SelectValue placeholder="Insert Diagram" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(templateNames).map(([key, name]) => (
          <SelectItem key={key} value={key}>
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
