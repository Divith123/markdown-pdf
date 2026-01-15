"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEditorStore } from "@/stores/editor-store";
import {
  Image,
  Upload,
  Link,
  X,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImageDialog({ open, onOpenChange }: ImageDialogProps) {
  const { editor } = useEditorStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [width, setWidth] = useState("");
  const [alignment, setAlignment] = useState<"left" | "center" | "right">("center");
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setUrl("");
    setAlt("");
    setWidth("");
    setAlignment("center");
    setPreview(null);
    setError(null);
    setMode("upload");
  }, []);

  const handleOpen = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      resetState();
    }
    onOpenChange(isOpen);
  }, [onOpenChange, resetState]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10MB");
      return;
    }

    setError(null);
    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
      setIsLoading(false);
    };
    reader.onerror = () => {
      setError("Failed to read file");
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleUrlChange = useCallback((value: string) => {
    setUrl(value);
    setError(null);
    
    if (value && isValidImageUrl(value)) {
      setPreview(value);
    } else {
      setPreview(null);
    }
  }, []);

  const handleInsert = useCallback(() => {
    if (!editor) return;

    const src = mode === "upload" ? preview : url;
    if (!src) return;

    const imageOptions = {
      src,
      alt: alt || undefined,
    };

    editor.chain().focus().setImage(imageOptions).run();
    handleOpen(false);
  }, [editor, mode, preview, url, alt, handleOpen]);

  const isValid = mode === "upload" ? !!preview : (url && isValidImageUrl(url));

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Insert Image
          </DialogTitle>
          <DialogDescription>
            Upload an image or paste a URL
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mode Selector */}
          <div className="flex gap-2">
            <Button
              variant={mode === "upload" ? "default" : "outline"}
              onClick={() => setMode("upload")}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
            <Button
              variant={mode === "url" ? "default" : "outline"}
              onClick={() => setMode("url")}
              className="flex-1"
            >
              <Link className="h-4 w-4 mr-2" />
              URL
            </Button>
          </div>

          {/* Upload Mode */}
          {mode === "upload" && (
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-20 border-dashed"
                disabled={isLoading}
              >
                {isLoading ? (
                  "Loading..."
                ) : (
                  <>
                    <Upload className="h-6 w-6 mr-2" />
                    Click to upload or drag and drop
                  </>
                )}
              </Button>
            </div>
          )}

          {/* URL Mode */}
          {mode === "url" && (
            <div className="space-y-2">
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {/* Preview */}
          {preview && (
            <div className="relative">
              <Label className="text-xs text-muted-foreground">Preview</Label>
              <div className="relative mt-1 rounded-lg border overflow-hidden">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-48 w-auto mx-auto"
                  onError={() => setError("Failed to load image")}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-background/80"
                  onClick={() => {
                    setPreview(null);
                    setUrl("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Options */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="alt">Alt text</Label>
              <Input
                id="alt"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                placeholder="Image description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="auto, 50%, 300px"
              />
            </div>
          </div>

          {/* Alignment */}
          <div className="space-y-2">
            <Label>Alignment</Label>
            <div className="flex gap-2">
              {(["left", "center", "right"] as const).map((align) => (
                <Button
                  key={align}
                  variant={alignment === align ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAlignment(align)}
                  className="flex-1"
                >
                  {align === "left" && <AlignLeft className="h-4 w-4" />}
                  {align === "center" && <AlignCenter className="h-4 w-4" />}
                  {align === "right" && <AlignRight className="h-4 w-4" />}
                </Button>
              ))}
            </div>
          </div>

          {/* Insert Button */}
          <Button onClick={handleInsert} disabled={!isValid} className="w-full">
            <Image className="h-4 w-4 mr-2" />
            Insert Image
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      (parsed.protocol === "http:" || parsed.protocol === "https:") &&
      /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(parsed.pathname)
    );
  } catch {
    return false;
  }
}
