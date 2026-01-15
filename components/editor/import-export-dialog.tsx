"use client";

import { useState, useCallback, useRef } from "react";
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
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileUp,
  Download,
  FileText,
  FileJson,
  FileCode,
  Copy,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/stores/editor-store";
import { useDocumentStore } from "@/stores/document-store";

interface ImportExportDialogProps {
  onComplete?: () => void;
}

type ExportFormat = "html" | "markdown" | "json" | "text";

const exportFormats: { id: ExportFormat; label: string; icon: React.ElementType; ext: string }[] = [
  { id: "html", label: "HTML", icon: FileCode, ext: ".html" },
  { id: "markdown", label: "Markdown", icon: FileText, ext: ".md" },
  { id: "json", label: "JSON", icon: FileJson, ext: ".json" },
  { id: "text", label: "Plain Text", icon: FileText, ext: ".txt" },
];

export function ImportExportDialog({ onComplete }: ImportExportDialogProps) {
  const { editor } = useEditorStore();
  const { metadata } = useDocumentStore();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"import" | "export">("export");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("markdown");
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get content in specified format
  const getExportContent = useCallback((format: ExportFormat): string => {
    if (!editor) return "";

    switch (format) {
      case "html":
        return editor.getHTML();
      case "markdown":
        // Convert HTML to basic markdown (simplified)
        const html = editor.getHTML();
        return htmlToMarkdown(html);
      case "json":
        return JSON.stringify(editor.getJSON(), null, 2);
      case "text":
        return editor.getText();
      default:
        return "";
    }
  }, [editor]);

  // Simple HTML to Markdown converter
  const htmlToMarkdown = (html: string): string => {
    let md = html;
    
    // Headings
    md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n");
    md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n");
    md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n");
    md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, "#### $1\n\n");
    md = md.replace(/<h5[^>]*>(.*?)<\/h5>/gi, "##### $1\n\n");
    md = md.replace(/<h6[^>]*>(.*?)<\/h6>/gi, "###### $1\n\n");
    
    // Text formatting
    md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**");
    md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**");
    md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*");
    md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*");
    md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`");
    md = md.replace(/<s[^>]*>(.*?)<\/s>/gi, "~~$1~~");
    md = md.replace(/<del[^>]*>(.*?)<\/del>/gi, "~~$1~~");
    
    // Links
    md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)");
    
    // Images
    md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, "![$2]($1)");
    md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, "![]($1)");
    
    // Lists
    md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, content) => {
      return content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n");
    });
    md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, content) => {
      let counter = 0;
      return content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, () => {
        counter++;
        return `${counter}. $1\n`;
      });
    });
    
    // Blockquotes
    md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (match, content) => {
      return "> " + content.replace(/<[^>]+>/g, "").trim() + "\n\n";
    });
    
    // Code blocks
    md = md.replace(/<pre[^>]*><code[^>]*class="language-([^"]*)"[^>]*>([\s\S]*?)<\/code><\/pre>/gi, 
      "```$1\n$2\n```\n\n");
    md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, "```\n$1\n```\n\n");
    
    // Horizontal rules
    md = md.replace(/<hr[^>]*\/?>/gi, "\n---\n\n");
    
    // Paragraphs
    md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n");
    
    // Line breaks
    md = md.replace(/<br[^>]*\/?>/gi, "\n");
    
    // Remove remaining HTML tags
    md = md.replace(/<[^>]+>/g, "");
    
    // Decode HTML entities
    md = md.replace(/&nbsp;/g, " ");
    md = md.replace(/&amp;/g, "&");
    md = md.replace(/&lt;/g, "<");
    md = md.replace(/&gt;/g, ">");
    md = md.replace(/&quot;/g, '"');
    
    // Clean up extra whitespace
    md = md.replace(/\n{3,}/g, "\n\n");
    md = md.trim();
    
    return md;
  };

  // Handle export
  const handleExport = useCallback(async () => {
    setIsExporting(true);
    
    try {
      const content = getExportContent(exportFormat);
      const formatInfo = exportFormats.find((f) => f.id === exportFormat)!;
      const filename = `${metadata.title || "document"}${formatInfo.ext}`;
      
      // Create blob and download
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setOpen(false);
      onComplete?.();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  }, [exportFormat, getExportContent, metadata.title, onComplete]);

  // Handle copy to clipboard
  const handleCopy = useCallback(async () => {
    const content = getExportContent(exportFormat);
    
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  }, [exportFormat, getExportContent]);

  // Handle file import
  const handleImport = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;
    
    setIsImporting(true);
    setImportError(null);
    
    try {
      const content = await file.text();
      const ext = file.name.split(".").pop()?.toLowerCase();
      
      switch (ext) {
        case "html":
        case "htm":
          editor.chain().focus().setContent(content).run();
          break;
          
        case "md":
        case "markdown":
          // For markdown, we'd ideally use a markdown parser
          // For now, just set as text content (TipTap will parse basic markdown)
          editor.chain().focus().setContent(content).run();
          break;
          
        case "json":
          try {
            const json = JSON.parse(content);
            if (json.type === "doc" && json.content) {
              editor.chain().focus().setContent(json).run();
            } else {
              throw new Error("Invalid document format");
            }
          } catch {
            throw new Error("Invalid JSON document format");
          }
          break;
          
        case "txt":
          // Plain text - wrap in paragraphs
          const paragraphs = content.split(/\n{2,}/).filter(Boolean);
          const htmlContent = paragraphs
            .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
            .join("");
          editor.chain().focus().setContent(htmlContent).run();
          break;
          
        default:
          throw new Error(`Unsupported file format: .${ext}`);
      }
      
      setOpen(false);
      onComplete?.();
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [editor, onComplete]);

  const previewContent = getExportContent(exportFormat);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileUp className="h-4 w-4 mr-2" />
          Import/Export
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Import / Export Document</DialogTitle>
          <DialogDescription>
            Import documents from files or export in various formats
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "import" | "export")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">
              <Download className="h-4 w-4 mr-2" />
              Export
            </TabsTrigger>
            <TabsTrigger value="import">
              <FileUp className="h-4 w-4 mr-2" />
              Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4 mt-4">
            {/* Format Selection */}
            <div className="space-y-2">
              <Label>Export Format</Label>
              <div className="grid grid-cols-4 gap-2">
                {exportFormats.map((format) => {
                  const Icon = format.icon;
                  return (
                    <button
                      key={format.id}
                      onClick={() => setExportFormat(format.id)}
                      className={cn(
                        "p-3 border rounded-lg text-center transition-all",
                        exportFormat === format.id
                          ? "border-primary bg-primary/10"
                          : "hover:border-muted-foreground"
                      )}
                    >
                      <Icon className="h-6 w-6 mx-auto mb-1" />
                      <span className="text-sm font-medium">{format.label}</span>
                      <span className="text-xs text-muted-foreground block">
                        {format.ext}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Preview</Label>
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  {copied ? (
                    <Check className="h-4 w-4 mr-1" />
                  ) : (
                    <Copy className="h-4 w-4 mr-1" />
                  )}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
              <ScrollArea className="h-48 border rounded-lg">
                <pre className="p-4 text-xs font-mono whitespace-pre-wrap">
                  {previewContent || "(Empty document)"}
                </pre>
              </ScrollArea>
            </div>

            {/* Export Button */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleExport} disabled={isExporting}>
                {isExporting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Download className="h-4 w-4 mr-2" />
                Export as {exportFormats.find((f) => f.id === exportFormat)?.label}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-4 mt-4">
            {/* File Drop Zone */}
            <div className="space-y-2">
              <Label>Import File</Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                  "hover:border-primary hover:bg-muted/50"
                )}
              >
                <FileUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Click to select a file</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supported formats: .html, .md, .json, .txt
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".html,.htm,.md,.markdown,.json,.txt"
                  onChange={handleImport}
                  className="hidden"
                />
              </div>

              {isImporting && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Importing...
                </div>
              )}

              {importError && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {importError}
                </div>
              )}
            </div>

            <Separator />

            {/* Format Info */}
            <div className="space-y-2">
              <Label>Supported Formats</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 border rounded-lg">
                  <h4 className="text-sm font-medium">HTML (.html, .htm)</h4>
                  <p className="text-xs text-muted-foreground">
                    Full HTML document with formatting
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="text-sm font-medium">Markdown (.md)</h4>
                  <p className="text-xs text-muted-foreground">
                    Standard Markdown syntax
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="text-sm font-medium">JSON (.json)</h4>
                  <p className="text-xs text-muted-foreground">
                    TipTap JSON document format
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="text-sm font-medium">Plain Text (.txt)</h4>
                  <p className="text-xs text-muted-foreground">
                    Plain text content
                  </p>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-xs">
                <p className="font-medium text-yellow-600">Warning</p>
                <p className="text-muted-foreground">
                  Importing a file will replace the current document content.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
