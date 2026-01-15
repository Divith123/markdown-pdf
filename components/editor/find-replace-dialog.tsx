"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Toggle } from "@/components/ui/toggle";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEditorStore } from "@/stores/editor-store";
import { useFindReplace } from "@/lib/hooks/use-find-replace";
import {
  Search,
  Replace,
  ChevronUp,
  ChevronDown,
  X,
  CaseSensitive,
  Regex,
  WholeWord,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FindReplaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FindReplaceDialog({ open, onOpenChange }: FindReplaceDialogProps) {
  const { editor } = useEditorStore();
  const {
    searchTerm,
    replaceTerm,
    isRegex,
    caseSensitive,
    wholeWord,
    currentMatch,
    totalMatches,
    setSearchTerm,
    setReplaceTerm,
    setOptions,
    findNext,
    findPrevious,
    replaceNext,
    replaceAll,
    clearSearch,
  } = useFindReplace(editor);

  const [showReplace, setShowReplace] = useState(false);

  // Keyboard shortcut to open find/replace
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        onOpenChange(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "h") {
        e.preventDefault();
        onOpenChange(true);
        setShowReplace(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onOpenChange]);

  // Handle Enter key in search input
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) {
        findPrevious();
      } else {
        findNext();
      }
    }
    if (e.key === "Escape") {
      onOpenChange(false);
    }
  };

  // Clear search when dialog closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      clearSearch();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find {showReplace && "& Replace"}
          </DialogTitle>
          <DialogDescription>
            Search through your document. Use Enter to find next, Shift+Enter for previous.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="space-y-2">
            <Label htmlFor="search">Find</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search..."
                  className="pr-20"
                  autoFocus
                />
                {totalMatches > 0 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    {currentMatch} / {totalMatches}
                  </span>
                )}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={findPrevious}
                disabled={totalMatches === 0}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={findNext}
                disabled={totalMatches === 0}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search Options */}
          <div className="flex items-center gap-2">
            <Toggle
              pressed={caseSensitive}
              onPressedChange={(pressed) => setOptions({ caseSensitive: pressed })}
              size="sm"
              aria-label="Case sensitive"
              title="Match case"
            >
              <CaseSensitive className="h-4 w-4" />
            </Toggle>
            <Toggle
              pressed={wholeWord}
              onPressedChange={(pressed) => setOptions({ wholeWord: pressed })}
              size="sm"
              aria-label="Whole word"
              title="Match whole word"
            >
              <WholeWord className="h-4 w-4" />
            </Toggle>
            <Toggle
              pressed={isRegex}
              onPressedChange={(pressed) => setOptions({ isRegex: pressed })}
              size="sm"
              aria-label="Use regex"
              title="Use regular expression"
            >
              <Regex className="h-4 w-4" />
            </Toggle>
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplace(!showReplace)}
            >
              <Replace className="h-4 w-4 mr-2" />
              {showReplace ? "Hide" : "Show"} Replace
            </Button>
          </div>

          {/* Replace Input */}
          {showReplace && (
            <div className="space-y-2">
              <Label htmlFor="replace">Replace with</Label>
              <div className="flex gap-2">
                <Input
                  id="replace"
                  value={replaceTerm}
                  onChange={(e) => setReplaceTerm(e.target.value)}
                  placeholder="Replace..."
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={replaceNext}
                  disabled={totalMatches === 0}
                >
                  Replace
                </Button>
                <Button
                  variant="outline"
                  onClick={replaceAll}
                  disabled={totalMatches === 0}
                >
                  Replace All
                </Button>
              </div>
            </div>
          )}

          {/* Results Info */}
          {searchTerm && (
            <div
              className={cn(
                "text-sm p-2 rounded",
                totalMatches > 0
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
              )}
            >
              {totalMatches > 0
                ? `Found ${totalMatches} match${totalMatches === 1 ? "" : "es"}`
                : "No matches found"}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
