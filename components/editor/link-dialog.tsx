"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEditorStore } from "@/stores/editor-store";
import { ensureProtocol, isValidUrl } from "@/lib/editor/extensions";
import {
  Link,
  ExternalLink,
  Unlink,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LinkDialog({ open, onOpenChange }: LinkDialogProps) {
  const { editor } = useEditorStore();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [openInNewTab, setOpenInNewTab] = useState(true);

  // Get current link attributes if selection has a link
  const getCurrentLink = useCallback(() => {
    if (!editor) return null;
    const attrs = editor.getAttributes("link");
    return attrs.href ? attrs : null;
  }, [editor]);

  const handleOpen = useCallback((isOpen: boolean) => {
    if (isOpen) {
      const currentLink = getCurrentLink();
      if (currentLink) {
        setUrl(currentLink.href || "");
        setTitle(currentLink.title || "");
        setOpenInNewTab(currentLink.target === "_blank");
      } else {
        setUrl("");
        setTitle("");
        setOpenInNewTab(true);
      }
    }
    onOpenChange(isOpen);
  }, [getCurrentLink, onOpenChange]);

  const handleSetLink = useCallback(() => {
    if (!editor || !url) return;

    const finalUrl = ensureProtocol(url);
    
    if (!isValidUrl(finalUrl)) {
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href: finalUrl,
        target: openInNewTab ? "_blank" : null,
      })
      .run();

    onOpenChange(false);
  }, [editor, url, openInNewTab, onOpenChange]);

  const handleUnsetLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
    onOpenChange(false);
  }, [editor, onOpenChange]);

  const isValid = url && isValidUrl(ensureProtocol(url));
  const hasLink = getCurrentLink() !== null;

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            {hasLink ? "Edit Link" : "Insert Link"}
          </DialogTitle>
          <DialogDescription>
            Add a link to selected text. Ctrl+Click to open links.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              autoFocus
              className={cn(
                !url || isValid ? "" : "border-red-500 focus-visible:ring-red-500"
              )}
            />
            {url && !isValid && (
              <p className="text-xs text-red-500">Please enter a valid URL</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Link title for accessibility"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="new-tab" className="text-sm">
              Open in new tab
            </Label>
            <Switch
              id="new-tab"
              checked={openInNewTab}
              onCheckedChange={setOpenInNewTab}
            />
          </div>

          {/* Preview */}
          {url && isValid && (
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-xs text-muted-foreground mb-1">Preview</p>
              <a
                href={ensureProtocol(url)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
                onClick={(e) => e.preventDefault()}
              >
                {title || url}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            {hasLink && (
              <Button variant="destructive" onClick={handleUnsetLink}>
                <Unlink className="h-4 w-4 mr-2" />
                Remove Link
              </Button>
            )}
            <Button onClick={handleSetLink} disabled={!isValid}>
              <Check className="h-4 w-4 mr-2" />
              {hasLink ? "Update" : "Insert"} Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Inline link popover for quick editing
export function LinkPopover() {
  const { editor } = useEditorStore();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");

  const handleSetLink = () => {
    if (!editor || !url) return;
    
    const finalUrl = ensureProtocol(url);
    editor.chain().focus().setLink({ href: finalUrl }).run();
    setOpen(false);
    setUrl("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Link className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="flex gap-2">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSetLink();
              }
            }}
          />
          <Button size="sm" onClick={handleSetLink}>
            <Check className="h-4 w-4" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
