"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEditorStore } from "@/stores/editor-store";
import { Code2, Eye, FileCode } from "lucide-react";
import type { EditorMode } from "@/types/editor";

export function ModeSwitcher() {
  const { mode, setMode } = useEditorStore();

  const handleModeChange = (value: string) => {
    setMode(value as EditorMode);
  };

  return (
    <Tabs value={mode} onValueChange={handleModeChange}>
      <TabsList className="h-9">
        <TabsTrigger value="visual" className="gap-1.5 text-xs">
          <Eye className="h-3.5 w-3.5" />
          Visual
        </TabsTrigger>
        <TabsTrigger value="markdown" className="gap-1.5 text-xs">
          <FileCode className="h-3.5 w-3.5" />
          Markdown
        </TabsTrigger>
        <TabsTrigger value="html" className="gap-1.5 text-xs">
          <Code2 className="h-3.5 w-3.5" />
          HTML
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
