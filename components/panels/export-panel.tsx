"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDocumentStore } from "@/stores/document-store";
import { useEditorStore } from "@/stores/editor-store";
import { 
  Download, 
  FileText, 
  FileCode, 
  FileType, 
  Loader2, 
  Copy, 
  Check,
  FileDown
} from "lucide-react";
import type { ExportFormat, ExportProgress } from "@/types/export";

export function ExportPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ExportFormat>("pdf");
  const [progress, setProgress] = useState<ExportProgress>({
    status: "idle",
    progress: 0,
    message: "",
  });

  const { metadata, typography, pageSettings } = useDocumentStore();
  const { editor } = useEditorStore();

  const handleExport = async (format: ExportFormat) => {
    if (!editor) return;

    setProgress({
      status: "preparing",
      progress: 10,
      message: "Preparing document...",
    });

    try {
      switch (format) {
        case "pdf":
          await exportPDF();
          break;
        case "docx":
          await exportDOCX();
          break;
        case "markdown":
          await exportMarkdown();
          break;
        case "html":
          await exportHTML();
          break;
      }

      setProgress({
        status: "complete",
        progress: 100,
        message: "Export complete!",
      });

      setTimeout(() => {
        setProgress({ status: "idle", progress: 0, message: "" });
      }, 1500);
    } catch (error) {
      setProgress({
        status: "error",
        progress: 0,
        message: "Export failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const exportPDF = async () => {
    setProgress({
      status: "generating",
      progress: 50,
      message: "Generating PDF...",
    });

    try {
      const { generatePdfBlob } = await import("@/lib/pdf-export");
      const htmlContent = editor?.getHTML() ?? "";
      
      const blob = await generatePdfBlob({
        title: metadata.title,
        htmlContent,
      });

      downloadBlob(blob, `${metadata.title || "document"}.pdf`);
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const exportDOCX = async () => {
    setProgress({
      status: "generating",
      progress: 50,
      message: "Generating DOCX...",
    });

    try {
      const { generateDocx } = await import("@/lib/docx-export");
      const htmlContent = editor?.getHTML() ?? "";
      
      const blob = await generateDocx({
        title: metadata.title,
        htmlContent,
        margins: pageSettings.margins,
      });

      downloadBlob(blob, `${metadata.title || "document"}.docx`);
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const exportMarkdown = async () => {
    setProgress({
      status: "generating",
      progress: 50,
      message: "Generating Markdown...",
    });

    // Simple HTML to Markdown conversion
    const htmlContent = editor?.getHTML() ?? "";
    const markdown = htmlToMarkdown(htmlContent);

    const blob = new Blob([markdown], { type: "text/markdown" });
    downloadBlob(blob, `${metadata.title || "document"}.md`);
  };

  const exportHTML = async () => {
    setProgress({
      status: "generating",
      progress: 50,
      message: "Generating HTML...",
    });

    const htmlContent = editor?.getHTML() ?? "";
    const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${metadata.title}</title>
  <style>
    body {
      font-family: ${typography.bodyFont.family}, system-ui, sans-serif;
      font-size: ${typography.baseFontSize}px;
      line-height: ${typography.baseLineHeight};
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;

    const blob = new Blob([fullHTML], { type: "text/html" });
    downloadBlob(blob, `${metadata.title || "document"}.html`);
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const htmlToMarkdown = (html: string): string => {
    // Basic HTML to Markdown conversion
    return html
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n")
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n")
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n")
      .replace(/<h4[^>]*>(.*?)<\/h4>/gi, "#### $1\n\n")
      .replace(/<h5[^>]*>(.*?)<\/h5>/gi, "##### $1\n\n")
      .replace(/<h6[^>]*>(.*?)<\/h6>/gi, "###### $1\n\n")
      .replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n")
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
      .replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**")
      .replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*")
      .replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*")
      .replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .trim();
  };

  const [copiedFormat, setCopiedFormat] = useState<ExportFormat | null>(null);

  const copyContent = async (contentFormat: ExportFormat) => {
    const html = editor?.getHTML() || "";
    let content = "";
    
    if (contentFormat === "markdown") {
      content = htmlToMarkdown(html);
    } else if (contentFormat === "html") {
      content = html;
    }
    
    await navigator.clipboard.writeText(content);
    setCopiedFormat(contentFormat);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const formatDescriptions: Record<ExportFormat, string> = {
    pdf: "Export as a formatted PDF document with your selected typography and page settings.",
    docx: "Export as a Microsoft Word document with rich text formatting preserved.",
    markdown: "Export as plain Markdown text for use in other editors or documentation.",
    html: "Export as HTML markup for web publishing or further processing.",
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Export Document</DialogTitle>
          <DialogDescription>
            Choose a format to export your document.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ExportFormat)} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pdf" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              PDF
            </TabsTrigger>
            <TabsTrigger value="docx" className="gap-1.5">
              <FileType className="h-3.5 w-3.5" />
              DOCX
            </TabsTrigger>
            <TabsTrigger value="markdown" className="gap-1.5">
              <FileCode className="h-3.5 w-3.5" />
              MD
            </TabsTrigger>
            <TabsTrigger value="html" className="gap-1.5">
              <FileCode className="h-3.5 w-3.5" />
              HTML
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pdf" className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">{formatDescriptions.pdf}</p>
            <div className="flex gap-2">
              <Button
                onClick={() => handleExport("pdf")}
                disabled={progress.status === "generating"}
                className="flex-1 gap-2"
              >
                {progress.status === "generating" && activeTab === "pdf" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4" />
                )}
                Download PDF
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="docx" className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">{formatDescriptions.docx}</p>
            <div className="flex gap-2">
              <Button
                onClick={() => handleExport("docx")}
                disabled={progress.status === "generating"}
                className="flex-1 gap-2"
              >
                {progress.status === "generating" && activeTab === "docx" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4" />
                )}
                Download DOCX
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="markdown" className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">{formatDescriptions.markdown}</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => copyContent("markdown")}
                className="gap-2"
              >
                {copiedFormat === "markdown" ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copiedFormat === "markdown" ? "Copied!" : "Copy"}
              </Button>
              <Button
                onClick={() => handleExport("markdown")}
                disabled={progress.status === "generating"}
                className="flex-1 gap-2"
              >
                {progress.status === "generating" && activeTab === "markdown" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4" />
                )}
                Download .md
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="html" className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">{formatDescriptions.html}</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => copyContent("html")}
                className="gap-2"
              >
                {copiedFormat === "html" ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copiedFormat === "html" ? "Copied!" : "Copy"}
              </Button>
              <Button
                onClick={() => handleExport("html")}
                disabled={progress.status === "generating"}
                className="flex-1 gap-2"
              >
                {progress.status === "generating" && activeTab === "html" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4" />
                )}
                Download .html
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {progress.status !== "idle" && (
          <div className="space-y-2 mt-4">
            <div className="flex items-center justify-between text-sm">
              <span>{progress.message}</span>
              <span>{progress.progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress.progress}%` }}
              />
            </div>
            {progress.error && (
              <p className="text-sm text-destructive">{progress.error}</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
