"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Editor } from "@tiptap/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  SpellCheck,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Lightbulb,
  BookOpen,
  ChevronDown,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Common misspellings and their corrections
const commonMisspellings: Record<string, string[]> = {
  teh: ["the"],
  thier: ["their", "there"],
  recieve: ["receive"],
  occured: ["occurred"],
  seperate: ["separate"],
  definately: ["definitely"],
  accomodate: ["accommodate"],
  occassion: ["occasion"],
  embarass: ["embarrass"],
  priviledge: ["privilege"],
  grammer: ["grammar"],
  wierd: ["weird"],
  acheive: ["achieve"],
  beleive: ["believe"],
  concious: ["conscious"],
  foriegn: ["foreign"],
  freind: ["friend"],
  goverment: ["government"],
  happend: ["happened"],
  immediatly: ["immediately"],
  judgement: ["judgment"],
  knowlege: ["knowledge"],
  liason: ["liaison"],
  mispell: ["misspell"],
  neccessary: ["necessary"],
  occurence: ["occurrence"],
  peice: ["piece"],
  persue: ["pursue"],
  posession: ["possession"],
  prefered: ["preferred"],
  publically: ["publicly"],
  recomend: ["recommend"],
  refered: ["referred"],
  relevent: ["relevant"],
  rythm: ["rhythm"],
  suprise: ["surprise"],
  tendancy: ["tendency"],
  truely: ["truly"],
  untill: ["until"],
  usefull: ["useful"],
  vaccuum: ["vacuum"],
  wierdly: ["weirdly"],
  writting: ["writing"],
};

// Grammar patterns to check
const grammarPatterns = [
  { pattern: /\bi\s/gi, suggestion: "I", message: "Capitalize 'I'" },
  {
    pattern: /\s{2,}/g,
    suggestion: " ",
    message: "Multiple spaces detected",
  },
  {
    pattern: /\b(a)\s+([aeiou])/gi,
    suggestion: "an",
    message: "Use 'an' before vowels",
  },
  {
    pattern: /\b(their|there|they're)\b/gi,
    suggestion: null,
    message: "Check: their (possessive), there (location), they're (they are)",
  },
  {
    pattern: /\b(your|you're)\b/gi,
    suggestion: null,
    message: "Check: your (possessive), you're (you are)",
  },
  {
    pattern: /\b(its|it's)\b/gi,
    suggestion: null,
    message: "Check: its (possessive), it's (it is)",
  },
  {
    pattern: /\b(affect|effect)\b/gi,
    suggestion: null,
    message: "Check: affect (verb), effect (noun)",
  },
  {
    pattern: /\.\s*[a-z]/g,
    suggestion: null,
    message: "Capitalize after period",
  },
];

interface SpellCheckIssue {
  id: string;
  type: "spelling" | "grammar";
  word: string;
  position: number;
  suggestions: string[];
  message: string;
}

interface SpellCheckDialogProps {
  editor: Editor | null;
}

export function SpellCheckDialog({ editor }: SpellCheckDialogProps) {
  const [open, setOpen] = useState(false);
  const [issues, setIssues] = useState<SpellCheckIssue[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [autoCheck, setAutoCheck] = useState(true);
  const [ignoredWords, setIgnoredWords] = useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ignoredSpellCheckWords");
      if (saved) {
        try {
          return new Set(JSON.parse(saved));
        } catch {}
      }
    }
    return new Set();
  });

  // Run spell check
  const runCheck = useCallback(() => {
    if (!editor) return;

    setIsChecking(true);
    const text = editor.getText();
    const foundIssues: SpellCheckIssue[] = [];
    let issueId = 0;

    // Check for misspellings
    const words = text.split(/\s+/);
    let position = 0;

    words.forEach((word) => {
      const cleanWord = word.toLowerCase().replace(/[^a-z]/g, "");
      
      if (cleanWord && commonMisspellings[cleanWord] && !ignoredWords.has(cleanWord)) {
        foundIssues.push({
          id: `spell-${issueId++}`,
          type: "spelling",
          word: cleanWord,
          position: text.indexOf(word, position),
          suggestions: commonMisspellings[cleanWord],
          message: `"${word}" may be misspelled`,
        });
      }
      position += word.length + 1;
    });

    // Check for grammar issues
    grammarPatterns.forEach(({ pattern, suggestion, message }) => {
      let match;
      const regex = new RegExp(pattern.source, pattern.flags);
      
      while ((match = regex.exec(text)) !== null) {
        foundIssues.push({
          id: `grammar-${issueId++}`,
          type: "grammar",
          word: match[0],
          position: match.index,
          suggestions: suggestion ? [suggestion] : [],
          message,
        });
      }
    });

    // Sort by position
    foundIssues.sort((a, b) => a.position - b.position);

    setIssues(foundIssues);
    setIsChecking(false);
  }, [editor, ignoredWords]);

  // Auto-check when content changes
  useEffect(() => {
    if (!autoCheck || !editor) return;

    const handler = () => {
      const timeout = setTimeout(runCheck, 1000);
      return () => clearTimeout(timeout);
    };

    editor.on("update", handler);
    return () => {
      editor.off("update", handler);
    };
  }, [editor, autoCheck, runCheck]);

  // Initial check when dialog opens
  useEffect(() => {
    if (open) {
      runCheck();
    }
  }, [open, runCheck]);

  const fixIssue = (issue: SpellCheckIssue, replacement: string) => {
    if (!editor) return;

    const text = editor.getText();
    const { state, view } = editor;
    
    // Find the position in the document
    let docPos = 0;
    let textPos = 0;
    
    state.doc.descendants((node, pos) => {
      if (node.isText && textPos <= issue.position) {
        const nodeText = node.text || "";
        if (textPos + nodeText.length >= issue.position) {
          docPos = pos + (issue.position - textPos);
        }
        textPos += nodeText.length;
      } else if (node.isBlock) {
        textPos += 1; // Account for newlines
      }
    });

    // Replace the text
    editor
      .chain()
      .focus()
      .setTextSelection({ from: docPos, to: docPos + issue.word.length })
      .insertContent(replacement)
      .run();

    // Remove from issues
    setIssues((prev) => prev.filter((i) => i.id !== issue.id));
  };

  const ignoreWord = (word: string) => {
    const newIgnored = new Set(ignoredWords).add(word.toLowerCase());
    setIgnoredWords(newIgnored);
    localStorage.setItem(
      "ignoredSpellCheckWords",
      JSON.stringify([...newIgnored])
    );
    setIssues((prev) =>
      prev.filter((i) => i.word.toLowerCase() !== word.toLowerCase())
    );
  };

  const dismissIssue = (issueId: string) => {
    setIssues((prev) => prev.filter((i) => i.id !== issueId));
  };

  const spellingIssues = issues.filter((i) => i.type === "spelling");
  const grammarIssues = issues.filter((i) => i.type === "grammar");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "gap-2",
            issues.length > 0 && "text-orange-600"
          )}
          title="Spell Check"
        >
          <SpellCheck className="h-4 w-4" />
          {issues.length > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              {issues.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SpellCheck className="h-5 w-5" />
            Spelling & Grammar
          </DialogTitle>
          <DialogDescription>
            Review and fix spelling and grammar issues
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <Switch
              id="auto-check"
              checked={autoCheck}
              onCheckedChange={setAutoCheck}
            />
            <Label htmlFor="auto-check" className="text-sm">
              Auto-check while typing
            </Label>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={runCheck}
            disabled={isChecking}
          >
            {isChecking ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Recheck
          </Button>
        </div>

        <ScrollArea className="h-[400px] mt-4">
          {issues.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <h4 className="font-medium">No issues found</h4>
              <p className="text-sm text-muted-foreground">
                Your document looks good!
              </p>
            </div>
          ) : (
            <div className="space-y-6 pr-4">
              {/* Spelling Issues */}
              {spellingIssues.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    Spelling Issues ({spellingIssues.length})
                  </h4>
                  <div className="space-y-2">
                    {spellingIssues.map((issue) => (
                      <IssueCard
                        key={issue.id}
                        issue={issue}
                        onFix={fixIssue}
                        onIgnore={ignoreWord}
                        onDismiss={dismissIssue}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Grammar Issues */}
              {grammarIssues.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    Grammar Suggestions ({grammarIssues.length})
                  </h4>
                  <div className="space-y-2">
                    {grammarIssues.map((issue) => (
                      <IssueCard
                        key={issue.id}
                        issue={issue}
                        onFix={fixIssue}
                        onIgnore={ignoreWord}
                        onDismiss={dismissIssue}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            {ignoredWords.size} words in personal dictionary
          </p>
          {ignoredWords.size > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIgnoredWords(new Set());
                localStorage.removeItem("ignoredSpellCheckWords");
                runCheck();
              }}
            >
              Clear Dictionary
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Issue card component
function IssueCard({
  issue,
  onFix,
  onIgnore,
  onDismiss,
}: {
  issue: SpellCheckIssue;
  onFix: (issue: SpellCheckIssue, replacement: string) => void;
  onIgnore: (word: string) => void;
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "font-mono text-sm px-1.5 py-0.5 rounded",
                issue.type === "spelling"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              )}
            >
              {issue.word}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{issue.message}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => onDismiss(issue.id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {issue.suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {issue.suggestions.map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              onClick={() => onFix(issue, suggestion)}
              className="h-7"
            >
              {suggestion}
            </Button>
          ))}
          {issue.type === "spelling" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onIgnore(issue.word)}
              className="h-7 text-muted-foreground"
            >
              <BookOpen className="h-3 w-3 mr-1" />
              Add to Dictionary
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Inline spell check indicator for toolbar
export function SpellCheckIndicator({ editor }: { editor: Editor | null }) {
  const [issueCount, setIssueCount] = useState(0);

  useEffect(() => {
    if (!editor) return;

    const checkSpelling = () => {
      const text = editor.getText();
      const words = text.split(/\s+/);
      let count = 0;

      words.forEach((word) => {
        const cleanWord = word.toLowerCase().replace(/[^a-z]/g, "");
        if (cleanWord && commonMisspellings[cleanWord]) {
          count++;
        }
      });

      setIssueCount(count);
    };

    checkSpelling();
    editor.on("update", checkSpelling);
    return () => {
      editor.off("update", checkSpelling);
    };
  }, [editor]);

  if (issueCount === 0) return null;

  return (
    <span className="text-xs text-orange-600 flex items-center gap-1">
      <AlertCircle className="h-3 w-3" />
      {issueCount}
    </span>
  );
}
