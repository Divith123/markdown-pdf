"use client";

import { useState, useCallback, useRef } from "react";
import { Editor } from "@tiptap/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Paperclip,
  Upload,
  File,
  FileText,
  FileImage,
  FileArchive,
  FileAudio,
  FileVideo,
  Download,
  Trash2,
  MoreVertical,
  ExternalLink,
  Link as LinkIcon,
  Copy,
  Check,
  X,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  createdAt: string;
  isExternal: boolean;
}

interface FileAttachmentsDialogProps {
  editor: Editor | null;
  documentId?: string;
}

const getFileIcon = (type: string) => {
  if (type.startsWith("image/")) return FileImage;
  if (type.startsWith("audio/")) return FileAudio;
  if (type.startsWith("video/")) return FileVideo;
  if (type.includes("pdf") || type.includes("document") || type.includes("text"))
    return FileText;
  if (type.includes("zip") || type.includes("compressed")) return FileArchive;
  return File;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export function FileAttachmentsDialog({
  editor,
  documentId = "default",
}: FileAttachmentsDialogProps) {
  const [open, setOpen] = useState(false);
  const [attachments, setAttachments] = useState<FileAttachment[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`attachments_${documentId}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return [];
  });
  const [externalUrl, setExternalUrl] = useState("");
  const [externalName, setExternalName] = useState("");
  const [showExternalForm, setShowExternalForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveAttachments = (newAttachments: FileAttachment[]) => {
    setAttachments(newAttachments);
    localStorage.setItem(
      `attachments_${documentId}`,
      JSON.stringify(newAttachments)
    );
  };

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files) return;

      const newAttachments: FileAttachment[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Convert file to base64 for storage
        const reader = new FileReader();
        await new Promise<void>((resolve) => {
          reader.onload = () => {
            const attachment: FileAttachment = {
              id: `file_${Date.now()}_${i}`,
              name: file.name,
              size: file.size,
              type: file.type,
              url: reader.result as string,
              createdAt: new Date().toISOString(),
              isExternal: false,
            };
            newAttachments.push(attachment);
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }

      saveAttachments([...attachments, ...newAttachments]);
    },
    [attachments, documentId]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const addExternalLink = () => {
    if (!externalUrl.trim()) return;

    const attachment: FileAttachment = {
      id: `link_${Date.now()}`,
      name: externalName || externalUrl,
      size: 0,
      type: "external/link",
      url: externalUrl,
      createdAt: new Date().toISOString(),
      isExternal: true,
    };

    saveAttachments([...attachments, attachment]);
    setExternalUrl("");
    setExternalName("");
    setShowExternalForm(false);
  };

  const deleteAttachment = (id: string) => {
    saveAttachments(attachments.filter((a) => a.id !== id));
  };

  const downloadAttachment = (attachment: FileAttachment) => {
    if (attachment.isExternal) {
      window.open(attachment.url, "_blank");
      return;
    }

    const link = document.createElement("a");
    link.href = attachment.url;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyLink = (attachment: FileAttachment) => {
    navigator.clipboard.writeText(attachment.url);
    setCopiedId(attachment.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const insertAsLink = (attachment: FileAttachment) => {
    if (!editor) return;

    editor
      .chain()
      .focus()
      .insertContent({
        type: "text",
        marks: [
          {
            type: "link",
            attrs: {
              href: attachment.isExternal
                ? attachment.url
                : `#attachment-${attachment.id}`,
              target: attachment.isExternal ? "_blank" : null,
            },
          },
        ],
        text: attachment.name,
      })
      .run();

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2" title="Attachments">
          <Paperclip className="h-4 w-4" />
          {attachments.length > 0 && (
            <span className="text-xs">{attachments.length}</span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Paperclip className="h-5 w-5" />
            File Attachments
          </DialogTitle>
          <DialogDescription>
            Manage files attached to this document
          </DialogDescription>
        </DialogHeader>

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted hover:border-muted-foreground/50"
          )}
        >
          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Drag & drop files here, or{" "}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-primary hover:underline"
            >
              browse
            </button>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Supports any file type
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </div>

        {/* External Link Form */}
        {showExternalForm ? (
          <div className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <Label>Add External Link</Label>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowExternalForm(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Input
              placeholder="https://example.com/file.pdf"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
            />
            <Input
              placeholder="Display name (optional)"
              value={externalName}
              onChange={(e) => setExternalName(e.target.value)}
            />
            <Button onClick={addExternalLink} disabled={!externalUrl.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Link
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => setShowExternalForm(true)}
            className="w-full"
          >
            <LinkIcon className="h-4 w-4 mr-2" />
            Add External Link
          </Button>
        )}

        {/* Attachments List */}
        <ScrollArea className="h-[300px]">
          {attachments.length > 0 ? (
            <div className="space-y-2 pr-4">
              {attachments.map((attachment) => {
                const FileIcon = getFileIcon(attachment.type);
                return (
                  <div
                    key={attachment.id}
                    className="group flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className={cn(
                        "p-2 rounded",
                        attachment.isExternal
                          ? "bg-blue-100 text-blue-600"
                          : "bg-muted"
                      )}
                    >
                      {attachment.isExternal ? (
                        <ExternalLink className="h-5 w-5" />
                      ) : (
                        <FileIcon className="h-5 w-5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{attachment.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {attachment.size > 0 && (
                          <>
                            <span>{formatFileSize(attachment.size)}</span>
                            <span>•</span>
                          </>
                        )}
                        <span>
                          {formatDistanceToNow(new Date(attachment.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => insertAsLink(attachment)}
                        title="Insert as link"
                      >
                        <LinkIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyLink(attachment)}
                        title="Copy link"
                      >
                        {copiedId === attachment.id ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => downloadAttachment(attachment)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            {attachment.isExternal ? "Open Link" : "Download"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => insertAsLink(attachment)}
                          >
                            <LinkIcon className="h-4 w-4 mr-2" />
                            Insert as Link
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteAttachment(attachment.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <Paperclip className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h4 className="font-medium">No attachments</h4>
              <p className="text-sm text-muted-foreground">
                Upload files or add external links
              </p>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <p className="text-xs text-muted-foreground flex-1">
            {attachments.length} attachment{attachments.length !== 1 ? "s" : ""}{" "}
            •{" "}
            {formatFileSize(
              attachments
                .filter((a) => !a.isExternal)
                .reduce((acc, a) => acc + a.size, 0)
            )}
          </p>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Inline attachment button for quick upload
export function QuickAttachButton({
  editor,
  documentId = "default",
}: FileAttachmentsDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || !editor) return;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // For images, insert directly
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = () => {
            editor
              .chain()
              .focus()
              .setImage({ src: reader.result as string, alt: file.name })
              .run();
          };
          reader.readAsDataURL(file);
        } else {
          // For other files, insert as link
          const reader = new FileReader();
          reader.onload = () => {
            editor
              .chain()
              .focus()
              .insertContent({
                type: "text",
                marks: [
                  {
                    type: "link",
                    attrs: { href: reader.result as string },
                  },
                ],
                text: `📎 ${file.name}`,
              })
              .run();
          };
          reader.readAsDataURL(file);
        }
      }
    },
    [editor]
  );

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        title="Quick attach file"
      >
        <Upload className="h-4 w-4" />
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />
    </>
  );
}
