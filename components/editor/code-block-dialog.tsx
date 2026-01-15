"use client";

import { useState, useCallback } from "react";
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
  Code2,
  Terminal,
  Braces,
  FileCode,
  Copy,
  Check,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/stores/editor-store";

interface CodeBlockDialogProps {
  onInsert?: () => void;
}

const languages = [
  // Popular
  { id: "javascript", label: "JavaScript", aliases: ["js"] },
  { id: "typescript", label: "TypeScript", aliases: ["ts"] },
  { id: "python", label: "Python", aliases: ["py"] },
  { id: "java", label: "Java", aliases: [] },
  { id: "csharp", label: "C#", aliases: ["cs", "c#"] },
  { id: "cpp", label: "C++", aliases: ["c++"] },
  { id: "c", label: "C", aliases: [] },
  { id: "go", label: "Go", aliases: ["golang"] },
  { id: "rust", label: "Rust", aliases: ["rs"] },
  { id: "php", label: "PHP", aliases: [] },
  { id: "ruby", label: "Ruby", aliases: ["rb"] },
  { id: "swift", label: "Swift", aliases: [] },
  { id: "kotlin", label: "Kotlin", aliases: ["kt"] },
  
  // Web
  { id: "html", label: "HTML", aliases: [] },
  { id: "css", label: "CSS", aliases: [] },
  { id: "scss", label: "SCSS", aliases: ["sass"] },
  { id: "jsx", label: "JSX", aliases: ["react"] },
  { id: "tsx", label: "TSX", aliases: ["react-ts"] },
  { id: "vue", label: "Vue", aliases: [] },
  { id: "svelte", label: "Svelte", aliases: [] },
  
  // Data & Config
  { id: "json", label: "JSON", aliases: [] },
  { id: "yaml", label: "YAML", aliases: ["yml"] },
  { id: "toml", label: "TOML", aliases: [] },
  { id: "xml", label: "XML", aliases: [] },
  { id: "ini", label: "INI", aliases: [] },
  { id: "env", label: "ENV", aliases: ["dotenv"] },
  
  // Shell & Scripts
  { id: "bash", label: "Bash", aliases: ["sh", "shell", "zsh"] },
  { id: "powershell", label: "PowerShell", aliases: ["ps1", "ps"] },
  { id: "batch", label: "Batch", aliases: ["bat", "cmd"] },
  
  // Database
  { id: "sql", label: "SQL", aliases: ["mysql", "postgresql", "sqlite"] },
  { id: "graphql", label: "GraphQL", aliases: ["gql"] },
  { id: "prisma", label: "Prisma", aliases: [] },
  
  // Others
  { id: "markdown", label: "Markdown", aliases: ["md"] },
  { id: "dockerfile", label: "Dockerfile", aliases: ["docker"] },
  { id: "nginx", label: "Nginx", aliases: [] },
  { id: "makefile", label: "Makefile", aliases: ["make"] },
  { id: "regex", label: "Regex", aliases: ["regexp"] },
  { id: "diff", label: "Diff", aliases: ["patch"] },
  { id: "plaintext", label: "Plain Text", aliases: ["text", "txt"] },
];

const languageCategories = [
  { id: "popular", label: "Popular", ids: ["javascript", "typescript", "python", "java", "csharp", "go", "rust"] },
  { id: "web", label: "Web", ids: ["html", "css", "scss", "jsx", "tsx", "vue", "svelte"] },
  { id: "data", label: "Data & Config", ids: ["json", "yaml", "toml", "xml", "ini", "env"] },
  { id: "shell", label: "Shell", ids: ["bash", "powershell", "batch"] },
  { id: "database", label: "Database", ids: ["sql", "graphql", "prisma"] },
  { id: "other", label: "Other", ids: ["markdown", "dockerfile", "nginx", "makefile", "diff", "plaintext"] },
];

export function CodeBlockDialog({ onInsert }: CodeBlockDialogProps) {
  const { editor } = useEditorStore();
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [filename, setFilename] = useState("");
  const [search, setSearch] = useState("");
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [copied, setCopied] = useState(false);

  const filteredLanguages = languages.filter((lang) => {
    const searchLower = search.toLowerCase();
    return (
      lang.label.toLowerCase().includes(searchLower) ||
      lang.id.toLowerCase().includes(searchLower) ||
      lang.aliases.some((alias) => alias.toLowerCase().includes(searchLower))
    );
  });

  const handleInsert = useCallback(() => {
    if (!editor) return;

    editor.chain()
      .focus()
      .setCodeBlock({ language })
      .insertContent(code || "// Your code here")
      .run();

    setOpen(false);
    setCode("");
    setFilename("");
    onInsert?.();
  }, [editor, language, code, onInsert]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const selectedLanguage = languages.find((l) => l.id === language);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Code2 className="h-4 w-4 mr-2" />
          Code Block
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Insert Code Block</DialogTitle>
          <DialogDescription>
            Add a syntax-highlighted code block to your document
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Language Selection */}
          <div className="space-y-2">
            <Label>Language</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Search languages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1"
              />
              <div className="flex items-center gap-2 px-3 bg-muted rounded-md">
                <FileCode className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {selectedLanguage?.label || language}
                </span>
              </div>
            </div>
            
            {search ? (
              <ScrollArea className="h-32 border rounded-md">
                <div className="p-2 space-y-1">
                  {filteredLanguages.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => {
                        setLanguage(lang.id);
                        setSearch("");
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                        language === lang.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      )}
                    >
                      {lang.label}
                      {lang.aliases.length > 0 && (
                        <span className="text-xs text-muted-foreground ml-2">
                          ({lang.aliases.join(", ")})
                        </span>
                      )}
                    </button>
                  ))}
                  {filteredLanguages.length === 0 && (
                    <p className="text-sm text-muted-foreground p-2">
                      No languages found
                    </p>
                  )}
                </div>
              </ScrollArea>
            ) : (
              <Tabs defaultValue="popular" className="w-full">
                <TabsList className="w-full justify-start h-auto flex-wrap">
                  {languageCategories.map((cat) => (
                    <TabsTrigger key={cat.id} value={cat.id} className="text-xs">
                      {cat.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {languageCategories.map((cat) => (
                  <TabsContent key={cat.id} value={cat.id} className="mt-2">
                    <div className="flex flex-wrap gap-1">
                      {cat.ids.map((langId) => {
                        const lang = languages.find((l) => l.id === langId);
                        if (!lang) return null;
                        return (
                          <Button
                            key={lang.id}
                            variant={language === lang.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setLanguage(lang.id)}
                            className="text-xs"
                          >
                            {lang.label}
                          </Button>
                        );
                      })}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </div>

          <Separator />

          {/* Filename (optional) */}
          <div className="space-y-2">
            <Label htmlFor="filename">Filename (optional)</Label>
            <Input
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="e.g., example.js"
            />
          </div>

          {/* Code Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="code">Code</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
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
            <div className="relative">
              <textarea
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={cn(
                  "w-full h-48 p-4 font-mono text-sm border rounded-lg resize-none",
                  "bg-muted/50 focus:bg-background transition-colors"
                )}
                placeholder={`// Paste or type your ${selectedLanguage?.label || "code"} here...`}
                spellCheck={false}
              />
              {filename && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-muted rounded text-xs text-muted-foreground">
                  {filename}
                </div>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showLineNumbers}
                onChange={(e) => setShowLineNumbers(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Show line numbers</span>
            </label>
          </div>

          {/* Insert Button */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInsert}>
              <Code2 className="h-4 w-4 mr-2" />
              Insert Code Block
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Inline code helper
export function InlineCodeButton() {
  const { editor } = useEditorStore();

  if (!editor) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => editor.chain().focus().toggleCode().run()}
      className={cn(
        editor.isActive("code") && "bg-muted"
      )}
      title="Inline Code (Ctrl+E)"
    >
      <Braces className="h-4 w-4" />
    </Button>
  );
}
