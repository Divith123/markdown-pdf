"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Typography } from "@tiptap/extension-typography";
import { Underline } from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { FontFamily } from "@tiptap/extension-font-family";
import { Highlight } from "@tiptap/extension-highlight";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { CharacterCount } from "@tiptap/extension-character-count";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";
import { common, createLowlight } from "lowlight";
import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import markdownit from "markdown-it";

import { 
  FontSize, 
  LineHeight, 
  TextAlign,
  // Text Formatting
  Subscript,
  Superscript,
  SmallCaps,
  TextTransform,
  HighlightColor,
  // Blocks
  Callout,
  PageBreak,
  // Media
  Youtube,
  Video,
  Audio,
  // Commands
  SlashCommands,
  // Reading modes
  FocusMode,
  TypewriterMode,
  ReadingMode,
  // Advanced editing
  FootnoteReference,
  FootnoteContent,
  Comment,
  SmartTypography,
  // Table enhancements
  CollapsibleBlock,
  CollapsibleSummary,
  CollapsibleContent,
  StyledHorizontalRule,
  // Typography layout
  DropCap,
  Columns,
  PrintStyles,
} from "@/lib/editor/extensions";
import { useEditorStore } from "@/stores/editor-store";
import { useDocumentStore } from "@/stores/document-store";
import { cn } from "@/lib/utils";

const lowlight = createLowlight(common);
const mdParser = markdownit({ html: true, breaks: true });

interface EditorCanvasProps {
  className?: string;
  onReady?: (editor: Editor) => void;
}

// Convert HTML to Markdown
function htmlToMarkdown(html: string): string {
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
    .replace(/<u[^>]*>(.*?)<\/u>/gi, "<u>$1</u>")
    .replace(/<s[^>]*>(.*?)<\/s>/gi, "~~$1~~")
    .replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n")
    .replace(/<ul[^>]*>/gi, "")
    .replace(/<\/ul>/gi, "\n")
    .replace(/<ol[^>]*>/gi, "")
    .replace(/<\/ol>/gi, "\n")
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, "> $1\n\n")
    .replace(/<hr\s*\/?>/gi, "\n---\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Format HTML with proper indentation
function formatHTML(html: string): string {
  let formatted = "";
  let indent = 0;
  const tab = "  ";
  const selfClosingTags = ["br", "hr", "img", "input", "meta", "link"];

  html.split(/(<[^>]+>)/g).forEach((element) => {
    const trimmed = element.trim();
    if (!trimmed) return;

    // Check if it's an end tag
    if (trimmed.match(/^<\/\w/)) {
      indent = Math.max(0, indent - 1);
      formatted += tab.repeat(indent) + trimmed + "\n";
    }
    // Check if it's a start tag (not self-closing)
    else if (trimmed.match(/^<\w/) && !selfClosingTags.some(tag => trimmed.toLowerCase().startsWith(`<${tag}`))) {
      formatted += tab.repeat(indent) + trimmed + "\n";
      if (!trimmed.match(/\/>/)) {
        indent++;
      }
    }
    // Self-closing tags or text content
    else {
      formatted += tab.repeat(indent) + trimmed + "\n";
    }
  });

  return formatted.trim();
}

export function EditorCanvas({ className, onReady }: EditorCanvasProps) {
  const { setEditor, setIsReady, mode } = useEditorStore();
  const { content, setContent, typography } = useDocumentStore();
  const currentTheme = useDocumentStore((state) => state.currentTheme());
  
  const [markdownContent, setMarkdownContent] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [copied, setCopied] = useState(false);
  
  // Refs to track state inside callbacks
  const modeRef = useRef(mode);
  const prevModeRef = useRef(mode);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // Commit markdown changes when switching away from markdown mode
  useEffect(() => {
    if (prevModeRef.current === "markdown" && mode !== "markdown" && editor) {
      const html = mdParser.render(markdownContent);
      editor.commands.setContent(html);
    }
    prevModeRef.current = mode;
  }, [mode, markdownContent]); // eslint-disable-line react-hooks/exhaustive-deps

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder: "Start writing your document...",
        emptyEditorClass: "is-editor-empty",
      }),
      Typography,
      Underline,
      TextStyle,
      Color,
      FontFamily,
      Highlight.configure({
        multicolor: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: "javascript",
      }),
      FontSize,
      LineHeight,
      TextAlign,
      CharacterCount,
      // Link and Image
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: "rounded-lg max-w-full",
        },
      }),
      // Text Formatting Extensions
      Subscript,
      Superscript,
      SmallCaps,
      TextTransform,
      HighlightColor,
      // Block Extensions
      Callout,
      PageBreak,
      // Media Extensions
      Youtube,
      Video,
      Audio,
      // Slash Commands
      SlashCommands,
      // Reading & Focus Modes
      FocusMode,
      TypewriterMode,
      ReadingMode,
      // Advanced Editing
      FootnoteReference,
      FootnoteContent,
      Comment,
      SmartTypography,
      // Collapsible Blocks
      CollapsibleBlock,
      CollapsibleSummary,
      CollapsibleContent,
      StyledHorizontalRule,
      // Typography & Layout
      DropCap,
      Columns,
      PrintStyles,
    ],
    content,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-lg max-w-none focus:outline-none min-h-[500px] px-8 py-6",
          "prose-headings:font-semibold",
          "prose-p:my-3",
          "prose-ul:my-3 prose-ol:my-3",
          "prose-li:my-1",
          "prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-blockquote:italic",
          "prose-code:rounded prose-code:px-1 prose-code:py-0.5",
          "prose-pre:rounded-lg prose-pre:p-4",
          "prose-table:border-collapse",
          "prose-th:border prose-th:p-2 prose-th:bg-muted",
          "prose-td:border prose-td:p-2"
        ),
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      setContent(json);
      // Update HTML view
      const html = editor.getHTML();
      setHtmlContent(formatHTML(html));
      
      // Update markdown view only if NOT in markdown mode
      // This allows the user to edit markdown without it being overwritten by formatting normalization
      if (modeRef.current !== "markdown") {
        setMarkdownContent(htmlToMarkdown(html));
      }
    },
    onCreate: ({ editor }) => {
      setEditor(editor);
      setIsReady(true);
      // Initialize markdown and HTML content
      const html = editor.getHTML();
      setHtmlContent(formatHTML(html));
      setMarkdownContent(htmlToMarkdown(html));
      onReady?.(editor);
    },
    onDestroy: () => {
      setEditor(null);
      setIsReady(false);
    },
    immediatelyRender: false,
  });

  // Sync content from store to editor when content changes externally
  useEffect(() => {
    if (editor && content) {
      const currentContent = editor.getJSON();
      if (JSON.stringify(currentContent) !== JSON.stringify(content)) {
        editor.commands.setContent(content);
      }
    }
  }, [editor, content]);

  // Copy to clipboard
  const handleCopy = useCallback(async () => {
    const textToCopy = mode === "markdown" ? markdownContent : htmlContent;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [mode, markdownContent, htmlContent]);

  // Apply theme styles
  const themeStyles = {
    "--editor-bg": currentTheme.colors.background,
    "--editor-fg": currentTheme.colors.foreground,
    "--editor-heading": currentTheme.colors.headingColor,
    "--editor-body": currentTheme.colors.bodyColor,
    "--editor-link": currentTheme.colors.linkColor,
    "--editor-code-bg": currentTheme.colors.codeBackground,
    "--editor-code-color": currentTheme.colors.codeColor,
    "--editor-blockquote-border": currentTheme.colors.blockquoteBorder,
    "--editor-blockquote-bg": currentTheme.colors.blockquoteBackground,
    "--editor-font-size": `${typography.baseFontSize}px`,
    "--editor-line-height": typography.baseLineHeight,
    "--editor-letter-spacing": `${typography.letterSpacing}em`,
    "--editor-heading-font": typography.headingFont.family,
    "--editor-body-font": typography.bodyFont.family,
    "--editor-code-font": typography.codeFont.family,
  } as React.CSSProperties;

  // Render Visual Mode (WYSIWYG)
  if (mode === "visual") {
    return (
      <div
        className={cn(
          "editor-canvas relative rounded-lg border bg-background shadow-sm",
          className
        )}
        style={themeStyles}
      >
        <EditorContent
          editor={editor}
          className="editor-content"
          style={{
            fontFamily: `var(--editor-body-font), system-ui, sans-serif`,
            fontSize: `var(--editor-font-size)`,
            lineHeight: `var(--editor-line-height)`,
            letterSpacing: `var(--editor-letter-spacing)`,
            color: `var(--editor-body)`,
            backgroundColor: `var(--editor-bg)`,
          }}
        />
      </div>
    );
  }

  // Render Markdown View (Editable)
  if (mode === "markdown") {
    return (
      <div
        className={cn(
          "editor-canvas relative rounded-lg border bg-background shadow-sm overflow-hidden flex flex-col",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-primary/5 border-b px-4 py-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Markdown Editor
            </span>
            <span className="text-xs text-muted-foreground">
              ({markdownContent.split("\n").length} lines)
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-7 gap-1.5 text-xs border-primary/30 hover:bg-primary/10"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-500" />
                <span className="text-green-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy Code
              </>
            )}
          </Button>
        </div>
        
        {/* Editable Textarea */}
        <div className="flex-1 overflow-hidden relative bg-muted/30">
          <textarea
            value={markdownContent}
            onChange={(e) => setMarkdownContent(e.target.value)}
            className="w-full h-full resize-none p-6 text-sm font-mono leading-relaxed bg-transparent border-none outline-none text-foreground"
            spellCheck={false}
            placeholder="# Start typing markdown..."
          />
        </div>

        {/* Hidden editor to keep state aligned if needed */}
        <div className="hidden">
           <EditorContent editor={editor} /> 
        </div>
      </div>
    );
  }

  // Render HTML View (Read Only)
  return (
    <div
      className={cn(
        "editor-canvas relative rounded-lg border bg-background shadow-sm overflow-hidden",
        className
      )}
    >
      {/* Code header with copy button */}
      <div className="flex items-center justify-between bg-secondary/50 border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            HTML Source
          </span>
          <span className="text-xs text-muted-foreground">
            ({htmlContent.split("\n").length} lines)
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="h-7 gap-1.5 text-xs border-primary/30 hover:bg-primary/10"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-500" />
              <span className="text-green-600">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy Code
            </>
          )}
        </Button>
      </div>

      {/* Code content */}
      <div className="code-view-container overflow-auto max-h-[calc(100vh-280px)] bg-muted/30">
        <pre className="p-6 text-sm font-mono leading-relaxed whitespace-pre-wrap break-words">
          <code className="language-html text-foreground">{htmlContent}</code>
        </pre>
      </div>

      {/* Hidden editor to keep state */}
      <div className="hidden">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
