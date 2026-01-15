"use client";

import { useEditorStore } from "@/stores/editor-store";
import { useAppStore } from "@/stores/app-store";
import { cn } from "@/lib/utils";
import {
  Maximize,
  Minimize,
  Clock,
  Type,
  AlignLeft,
  Cloud,
  CloudOff,
  Keyboard,
  Target,
  Sparkles,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  KeyboardShortcutsDialog,
  WritingGoalsDialog,
  WritingGoalProgress,
  SpellCheckDialog,
  SpellCheckIndicator,
  ReadingLevelIndicator,
  CommandPalette,
} from "@/components/editor";

interface StatusBarProps {
  className?: string;
  lastSaved?: Date | null;
  isSaving: boolean;
  onToggleFocus: () => void;
  isFocusMode: boolean;
}

export function StatusBar({
  className,
  lastSaved,
  isSaving,
  onToggleFocus,
  isFocusMode,
}: StatusBarProps) {
  const { editor } = useEditorStore();

  if (!editor) return null;

  const wordCount = editor.storage.characterCount?.words() || 0;
  const characterCount = editor.storage.characterCount?.characters() || 0;
  
  // Estimate reading time: 200 words per minute
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const formatLastSaved = () => {
    if (isSaving) return "Saving...";
    if (!lastSaved) return "Not saved";
    
    return `Saved ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div
      className={cn(
        "flex h-10 w-full items-center justify-between border-t bg-background px-4 text-xs text-muted-foreground transition-all",
        className
      )}
    >
      {/* Left Section - Stats */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5" title="Word count">
          <AlignLeft className="h-3.5 w-3.5" />
          <span className="tabular-nums font-medium">{wordCount.toLocaleString()}</span> words
        </div>
        
        <Separator orientation="vertical" className="h-4" />
        
        <div className="flex items-center gap-1.5" title="Character count">
          <Type className="h-3.5 w-3.5" />
          <span className="tabular-nums">{characterCount.toLocaleString()}</span> chars
        </div>

        <Separator orientation="vertical" className="h-4" />

        <div className="flex items-center gap-1.5" title="Estimated reading time">
          <Clock className="h-3.5 w-3.5" />
          <span className="tabular-nums">{readingTime}</span> min read
        </div>
        
        <Separator orientation="vertical" className="h-4" />
        
        {/* Reading Level */}
        <ReadingLevelIndicator editor={editor} />
      </div>

      {/* Center Section - Tools */}
      <div className="flex items-center gap-1">
        <WritingGoalsDialog />
        <SpellCheckDialog editor={editor} />
        <KeyboardShortcutsDialog />
        <CommandPalette />
      </div>

      {/* Right Section - Save Status & Focus */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          {isSaving ? (
            <Cloud className="h-3.5 w-3.5 animate-pulse text-primary" />
          ) : lastSaved ? (
            <Cloud className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <CloudOff className="h-3.5 w-3.5" />
          )}
          <span>{formatLastSaved()}</span>
        </div>

        <Separator orientation="vertical" className="h-4" />

        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 px-2 text-xs font-medium hover:bg-muted hover:text-foreground"
          onClick={onToggleFocus}
        >
          {isFocusMode ? (
            <>
              <Minimize className="h-3.5 w-3.5" />
              Exit Focus
            </>
          ) : (
            <>
              <Maximize className="h-3.5 w-3.5" />
              Focus Mode
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
