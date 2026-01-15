"use client";

import { useState } from "react";
import { Editor } from "@tiptap/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Copy,
  FileText,
  FileCode,
  FileJson,
  File,
  Check,
  Clipboard,
} from "lucide-react";
import TurndownService from "turndown";

interface CopyAsFormatProps {
  editor: Editor | null;
}

type CopyFormat = "plain" | "html" | "markdown" | "json" | "rtf";

export function CopyAsFormat({ editor }: CopyAsFormatProps) {
  const [copied, setCopied] = useState<CopyFormat | null>(null);
  const { toast } = useToast();

  const getPlainText = (): string => {
    if (!editor) return "";
    return editor.getText();
  };

  const getHTML = (): string => {
    if (!editor) return "";
    return editor.getHTML();
  };

  const getMarkdown = (): string => {
    if (!editor) return "";
    const html = editor.getHTML();
    
    const turndownService = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
      bulletListMarker: "-",
      emDelimiter: "*",
      strongDelimiter: "**",
    });

    // Custom rules for better conversion
    turndownService.addRule("strikethrough", {
      filter: (node: Node) => {
        const tagName = (node as HTMLElement).tagName?.toLowerCase();
        return tagName === "del" || tagName === "s" || tagName === "strike";
      },
      replacement: (content) => `~~${content}~~`,
    });

    turndownService.addRule("taskList", {
      filter: (node) => {
        return (
          node.nodeName === "LI" &&
          node.parentElement?.getAttribute("data-type") === "taskList"
        );
      },
      replacement: (content, node) => {
        const checkbox = (node as HTMLElement).querySelector('input[type="checkbox"]');
        const checked = checkbox?.hasAttribute("checked") ? "x" : " ";
        return `- [${checked}] ${content.trim()}\n`;
      },
    });

    return turndownService.turndown(html);
  };

  const getJSON = (): string => {
    if (!editor) return "{}";
    return JSON.stringify(editor.getJSON(), null, 2);
  };

  const getRTF = (): string => {
    if (!editor) return "";
    const text = editor.getText();
    // Basic RTF conversion
    return `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}\\f0\\fs24 ${text.replace(/\n/g, "\\par ")}}`;
  };

  const copyToClipboard = async (format: CopyFormat) => {
    let content: string;
    let mimeType: string;
    let label: string;

    switch (format) {
      case "plain":
        content = getPlainText();
        mimeType = "text/plain";
        label = "Plain Text";
        break;
      case "html":
        content = getHTML();
        mimeType = "text/html";
        label = "HTML";
        break;
      case "markdown":
        content = getMarkdown();
        mimeType = "text/plain";
        label = "Markdown";
        break;
      case "json":
        content = getJSON();
        mimeType = "application/json";
        label = "JSON";
        break;
      case "rtf":
        content = getRTF();
        mimeType = "text/rtf";
        label = "Rich Text";
        break;
      default:
        return;
    }

    try {
      // For HTML, try to use the Clipboard API with multiple formats
      if (format === "html") {
        const blob = new Blob([content], { type: "text/html" });
        const plainBlob = new Blob([getPlainText()], { type: "text/plain" });
        
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              "text/html": blob,
              "text/plain": plainBlob,
            }),
          ]);
        } catch {
          // Fallback to text copy
          await navigator.clipboard.writeText(content);
        }
      } else {
        await navigator.clipboard.writeText(content);
      }

      setCopied(format);
      setTimeout(() => setCopied(null), 2000);

      toast({
        title: "Copied!",
        description: `Content copied as ${label}`,
      });
    } catch (error) {
      console.error("Failed to copy:", error);
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const formats: { id: CopyFormat; label: string; icon: React.ReactNode }[] = [
    { id: "plain", label: "Plain Text", icon: <FileText className="h-4 w-4" /> },
    { id: "markdown", label: "Markdown", icon: <File className="h-4 w-4" /> },
    { id: "html", label: "HTML", icon: <FileCode className="h-4 w-4" /> },
    { id: "json", label: "JSON", icon: <FileJson className="h-4 w-4" /> },
    { id: "rtf", label: "Rich Text (RTF)", icon: <FileText className="h-4 w-4" /> },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2" title="Copy As...">
          <Copy className="h-4 w-4" />
          <span className="hidden sm:inline">Copy As</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {formats.map((format) => (
          <DropdownMenuItem
            key={format.id}
            onClick={() => copyToClipboard(format.id)}
            className="gap-2"
          >
            {copied === format.id ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              format.icon
            )}
            {format.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            if (!editor) return;
            editor.chain().focus().selectAll().run();
            document.execCommand("copy");
            toast({
              title: "Copied!",
              description: "Content copied with formatting",
            });
          }}
          className="gap-2"
        >
          <Clipboard className="h-4 w-4" />
          Copy with Formatting
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Selection-based copy with format choice
export function CopySelectionAsFormat({ editor }: CopyAsFormatProps) {
  const { toast } = useToast();

  const copySelection = async (format: "plain" | "markdown" | "html") => {
    if (!editor) return;

    const { from, to } = editor.state.selection;
    if (from === to) {
      toast({
        title: "No selection",
        description: "Please select some text first",
      });
      return;
    }

    let content: string;

    switch (format) {
      case "plain":
        content = editor.state.doc.textBetween(from, to, "\n");
        break;
      case "html":
        // Get HTML of selection
        const slice = editor.state.selection.content();
        const div = document.createElement("div");
        const fragment = slice.content;
        // @ts-ignore
        div.innerHTML = editor.view.nodeDOM(0)?.innerHTML || "";
        content = div.innerHTML;
        break;
      case "markdown":
        const text = editor.state.doc.textBetween(from, to, "\n");
        content = text;
        break;
      default:
        return;
    }

    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied!",
        description: `Selection copied as ${format}`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" title="Copy Selection As...">
          <Copy className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => copySelection("plain")}>
          Plain Text
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => copySelection("markdown")}>
          Markdown
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => copySelection("html")}>
          HTML
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
