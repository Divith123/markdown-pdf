"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Printer,
  Settings,
  ZoomIn,
  ZoomOut,
  Download,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PrintPreviewDialogProps {
  onPrint?: () => void;
}

export function PrintPreviewDialog({ onPrint }: PrintPreviewDialogProps) {
  const { editor } = useEditorStore();
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [isPrinting, setIsPrinting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handlePrint = useCallback(() => {
    setIsPrinting(true);
    
    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow || !editor) {
      setIsPrinting(false);
      return;
    }

    const content = editor.getHTML();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Document</title>
          <style>
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            
            body {
              font-family: 'Times New Roman', Times, serif;
              font-size: 12pt;
              line-height: 1.6;
              color: #000;
              background: #fff;
              padding: 1in;
            }

            h1 { font-size: 24pt; margin-bottom: 12pt; }
            h2 { font-size: 18pt; margin-bottom: 10pt; margin-top: 18pt; }
            h3 { font-size: 14pt; margin-bottom: 8pt; margin-top: 14pt; }
            h4, h5, h6 { font-size: 12pt; margin-bottom: 6pt; margin-top: 12pt; }

            p { margin-bottom: 10pt; text-align: justify; }

            ul, ol { margin-left: 24pt; margin-bottom: 10pt; }
            li { margin-bottom: 4pt; }

            blockquote {
              margin: 12pt 0;
              padding-left: 12pt;
              border-left: 3pt solid #ccc;
              font-style: italic;
            }

            pre {
              font-family: 'Courier New', monospace;
              font-size: 10pt;
              background: #f5f5f5;
              padding: 12pt;
              margin: 12pt 0;
              overflow-x: auto;
            }

            code {
              font-family: 'Courier New', monospace;
              font-size: 10pt;
              background: #f5f5f5;
              padding: 1pt 3pt;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin: 12pt 0;
            }

            th, td {
              border: 1pt solid #000;
              padding: 6pt;
              text-align: left;
            }

            th { background: #f5f5f5; font-weight: bold; }

            img { max-width: 100%; height: auto; }

            hr { 
              border: none; 
              border-top: 1pt solid #000; 
              margin: 18pt 0; 
            }

            a { color: #000; text-decoration: underline; }

            .page-break { 
              page-break-after: always; 
              break-after: page; 
            }

            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Wait for content to load
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
      setIsPrinting(false);
      setOpen(false);
      onPrint?.();
    };

    // Fallback if onload doesn't fire
    setTimeout(() => {
      if (printWindow && !printWindow.closed) {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
      setIsPrinting(false);
    }, 1000);
  }, [editor, onPrint]);

  const zoomIn = () => setZoom((prev) => Math.min(200, prev + 25));
  const zoomOut = () => setZoom((prev) => Math.max(50, prev - 25));

  if (!editor) return null;

  const content = editor.getHTML();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Print Preview
          </DialogTitle>
          <DialogDescription>
            Preview how your document will look when printed
          </DialogDescription>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex items-center justify-between py-2 border-b">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={zoomOut} disabled={zoom <= 50}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm w-16 text-center">{zoom}%</span>
            <Button variant="outline" size="sm" onClick={zoomIn} disabled={zoom >= 200}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <Button onClick={handlePrint} disabled={isPrinting}>
            {isPrinting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Printer className="h-4 w-4 mr-2" />
            )}
            Print
          </Button>
        </div>

        {/* Preview Area */}
        <ScrollArea className="flex-1">
          <div className="p-8 bg-muted/50 min-h-full flex justify-center">
            <div
              ref={previewRef}
              className="bg-white shadow-lg"
              style={{
                width: `${8.5 * zoom}px`,
                minHeight: `${11 * zoom}px`,
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top center",
                padding: `${zoom * 0.75}px`,
              }}
            >
              <div
                className="prose prose-sm max-w-none"
                style={{
                  fontFamily: "'Times New Roman', Times, serif",
                  fontSize: "12pt",
                  lineHeight: 1.6,
                }}
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          </div>
        </ScrollArea>

        {/* Page Info */}
        <div className="flex items-center justify-between py-2 border-t text-xs text-muted-foreground">
          <span>Paper size: Letter (8.5" × 11")</span>
          <span>Margins: 0.75" all sides</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
