"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDocumentStore } from "@/stores/document-store";
import { useEditorStore } from "@/stores/editor-store";
import { 
  ArrowLeft, 
  FileText, 
  FileType, 
  Settings2, 
  ListOrdered,
  Droplets,
  Lock,
  Share,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExportFormat } from "@/types/export";

interface MobileExportPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileExportPanel({ isOpen, onClose }: MobileExportPanelProps) {
  const [format, setFormat] = useState<"pdf" | "docx">("pdf");
  const [pageSize, setPageSize] = useState("A4");
  const [margins, setMargins] = useState("normal");
  const [pageNumbers, setPageNumbers] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const { metadata, pageSettings } = useDocumentStore();
  const { editor } = useEditorStore();

  const handleExport = async () => {
    if (!editor) return;
    
    setIsExporting(true);
    
    try {
      const htmlContent = editor.getHTML();

      if (format === "pdf") {
        const { generatePdfBlob } = await import("@/lib/pdf-export");
        const blob = await generatePdfBlob({
          title: metadata.title,
          htmlContent,
        });
        downloadBlob(blob, `${metadata.title || "document"}.pdf`);
      } else {
        const { generateDocx } = await import("@/lib/docx-export");
        const blob = await generateDocx({
          title: metadata.title,
          htmlContent,
          margins: pageSettings.margins,
        });
        downloadBlob(blob, `${metadata.title || "document"}.docx`);
      }
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
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
    onClose();
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col md:hidden animate-in slide-in-from-right duration-300">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 shrink-0">
        <button
          onClick={onClose}
          title="Go back"
          className="flex items-center justify-center p-2 rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h2 className="text-lg font-bold tracking-tight flex-1 text-center">
          Export Document
        </h2>
        <button title="Help" className="text-primary font-bold text-sm p-2">Help</button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Preview Section */}
        <section className="relative w-full py-8 px-6 flex flex-col items-center justify-center bg-muted/30 min-h-[300px] shrink-0">
          {/* Document Preview */}
          <div className="relative w-full max-w-[280px] aspect-[1/1.414] bg-white shadow-2xl rounded-sm overflow-hidden">
            <div className="p-6 flex flex-col h-full">
              <div className="h-5 w-3/4 bg-foreground/80 mb-4 rounded-sm" />
              <div className="space-y-1.5 mb-6">
                <div className="h-1.5 w-full bg-muted rounded-sm" />
                <div className="h-1.5 w-full bg-muted rounded-sm" />
                <div className="h-1.5 w-5/6 bg-muted rounded-sm" />
                <div className="h-1.5 w-full bg-muted rounded-sm" />
              </div>
              <div className="w-full aspect-video bg-muted/50 rounded-sm mb-4 flex items-end justify-between p-2 gap-1">
                <div className="w-1/5 bg-primary/40 h-1/2 rounded-t-sm" />
                <div className="w-1/5 bg-primary/60 h-3/4 rounded-t-sm" />
                <div className="w-1/5 bg-primary/80 h-full rounded-t-sm" />
                <div className="w-1/5 bg-primary h-2/3 rounded-t-sm" />
              </div>
              <div className="space-y-1.5">
                <div className="h-1.5 w-full bg-muted rounded-sm" />
                <div className="h-1.5 w-11/12 bg-muted rounded-sm" />
              </div>
              <div className="mt-auto flex justify-center pt-3 border-t border-muted">
                <span className="text-[8px] text-muted-foreground font-mono">
                  Page 1 of 1
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Configuration Panel */}
        <section className="flex-1 bg-background rounded-t-3xl shadow-lg border-t z-10 pb-24">
          <div className="w-full flex justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 bg-muted rounded-full" />
          </div>

          {/* Format Selector */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                Format
              </h3>
            </div>
            <div className="flex p-1 bg-muted rounded-xl">
              <button
                onClick={() => setFormat("pdf")}
                className={cn(
                  "flex-1 py-2.5 rounded-lg text-center text-sm font-semibold transition-all",
                  format === "pdf"
                    ? "text-primary-foreground bg-primary shadow-sm"
                    : "text-muted-foreground"
                )}
              >
                PDF
              </button>
              <button
                onClick={() => setFormat("docx")}
                className={cn(
                  "flex-1 py-2.5 rounded-lg text-center text-sm font-semibold transition-all",
                  format === "docx"
                    ? "text-primary-foreground bg-primary shadow-sm"
                    : "text-muted-foreground"
                )}
              >
                DOCX
              </button>
            </div>
          </div>

          <div className="h-px bg-border mx-6 my-2" />

          {/* Layout Settings */}
          <div className="px-6 py-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
              Layout Settings
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-start justify-between p-4 bg-muted/50 border rounded-2xl text-left group hover:border-primary/30 transition-colors">
                <div className="flex w-full justify-between items-start mb-2">
                  <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <Settings2 className="h-3 w-3 text-muted-foreground/50" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-0.5">
                    Page Size
                  </p>
                  <p className="text-sm font-bold">{pageSize}</p>
                </div>
              </button>
              <button className="flex flex-col items-start justify-between p-4 bg-muted/50 border rounded-2xl text-left group hover:border-primary/30 transition-colors">
                <div className="flex w-full justify-between items-start mb-2">
                  <FileType className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <Settings2 className="h-3 w-3 text-muted-foreground/50" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-0.5">
                    Margins
                  </p>
                  <p className="text-sm font-bold capitalize">{margins}</p>
                </div>
              </button>
            </div>
          </div>

          {/* Toggles */}
          <div className="px-6 py-2 space-y-4">
            <div className="flex items-center justify-between p-2 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <ListOrdered className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Page Numbers</span>
                  <span className="text-xs text-muted-foreground">
                    Add footer numbering
                  </span>
                </div>
              </div>
              <Switch checked={pageNumbers} onCheckedChange={setPageNumbers} />
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg opacity-60">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg text-muted-foreground">
                  <Droplets className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Watermark</span>
                  <span className="text-xs text-muted-foreground">
                    Upgrade to Pro
                  </span>
                </div>
              </div>
              <Lock className="h-5 w-5 text-muted-foreground/50" />
            </div>
          </div>
        </section>
      </main>

      {/* Fixed Bottom Bar */}
      <div className="absolute bottom-0 w-full bg-background border-t p-4 pb-6 z-30 shadow-lg">
        <div className="flex justify-between items-center mb-4 px-2">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase font-semibold">
              Est. File Size
            </span>
            <span className="text-sm font-bold">~1.4 MB</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-xs text-muted-foreground uppercase font-semibold">
              Pages
            </span>
            <span className="text-sm font-bold">1</span>
          </div>
        </div>
        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full h-12 rounded-xl font-bold text-lg shadow-lg gap-2"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              Export {format.toUpperCase()}
              <Share className="h-5 w-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
