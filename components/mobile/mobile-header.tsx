"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDocumentStore } from "@/stores/document-store";
import { useEditorStore } from "@/stores/editor-store";
import { ArrowLeft, Cloud, CloudOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface MobileHeaderProps {
  onExportClick?: () => void;
}

export function MobileHeader({ onExportClick }: MobileHeaderProps) {
  const router = useRouter();
  const { metadata, setMetadata } = useDocumentStore();
  const { isSaving, lastSaved } = useEditorStore();

  const getSyncStatus = () => {
    if (isSaving) return { icon: Loader2, text: "Saving...", className: "animate-spin" };
    if (lastSaved) return { icon: Cloud, text: "Synced", className: "" };
    return { icon: CloudOff, text: "Not saved", className: "" };
  };

  const status = getSyncStatus();
  const StatusIcon = status.icon;

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-background shrink-0 z-20 md:hidden">
      <button 
        onClick={() => router.back()}
        className="flex items-center justify-center size-10 rounded-full hover:bg-muted transition-colors group"
        title="Go back"
      >
        <ArrowLeft className="h-5 w-5 group-active:scale-95 transition-transform" />
      </button>

      <div className="flex flex-col items-center flex-1 min-w-0 px-2">
        <Input
          value={metadata.title}
          onChange={(e) => setMetadata({ title: e.target.value })}
          className="h-auto border-none bg-transparent p-0 text-center text-base font-bold tracking-tight focus-visible:ring-0 truncate"
          placeholder="Untitled Document"
        />
        <div className="flex items-center gap-1.5 opacity-60">
          <StatusIcon className={`h-2.5 w-2.5 text-primary ${status.className}`} />
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            {status.text}
          </span>
        </div>
      </div>

      <Button
        onClick={onExportClick}
        variant="ghost"
        size="sm"
        className="rounded-full bg-primary/10 hover:bg-primary/20 text-primary font-bold"
      >
        Export
      </Button>
    </header>
  );
}
