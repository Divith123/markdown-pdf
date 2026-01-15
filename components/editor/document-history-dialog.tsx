"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  History,
  Clock,
  FileText,
  Trash2,
  ExternalLink,
  Search,
  FolderOpen,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/stores/editor-store";
import { getAllDocuments, loadDocument, deleteDocument, getDocumentHistory, DocumentVersion } from "@/lib/hooks/use-auto-save";

interface SavedDocument {
  id: string;
  title: string;
  lastModified: string;
  wordCount: number;
  preview: string;
}

export function DocumentHistoryDialog() {
  const { editor } = useEditorStore();
  const [open, setOpen] = useState(false);
  const [documents, setDocuments] = useState<SavedDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [view, setView] = useState<"documents" | "versions">("documents");

  // Load documents on open
  useEffect(() => {
    if (open) {
      loadDocuments();
    }
  }, [open]);

  const loadDocuments = () => {
    const docs = getAllDocuments();
    const parsedDocs: SavedDocument[] = [];

    for (const [key, value] of Object.entries(docs)) {
      if (key.startsWith("suzume_doc_") && !key.includes("_history")) {
        try {
          const content = typeof value === "string" ? JSON.parse(value) : value;
          
          // Extract text preview
          let preview = "";
          if (content?.content) {
            const extractText = (nodes: any[]): string => {
              return nodes.map((node: any) => {
                if (node.type === "text") return node.text || "";
                if (node.content) return extractText(node.content);
                return "";
              }).join(" ");
            };
            preview = extractText(content.content).slice(0, 100);
          }

          // Word count
          const wordCount = preview.split(/\s+/).filter(Boolean).length;

          parsedDocs.push({
            id: key.replace("suzume_doc_", ""),
            title: content.title || key.replace("suzume_doc_", ""),
            lastModified: content.lastModified || new Date().toISOString(),
            wordCount,
            preview: preview || "(Empty document)",
          });
        } catch (e) {
          // Skip invalid documents
        }
      }
    }

    // Sort by last modified (newest first)
    parsedDocs.sort((a, b) => 
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    );

    setDocuments(parsedDocs);
  };

  const loadVersions = (docId: string) => {
    const history = getDocumentHistory(docId);
    setVersions(history);
    setSelectedDoc(docId);
    setView("versions");
  };

  const handleLoadDocument = useCallback((docId: string) => {
    if (!editor) return;

    const doc = loadDocument(docId);
    if (doc) {
      editor.chain().focus().setContent(doc).run();
      setOpen(false);
    }
  }, [editor]);

  const handleLoadVersion = useCallback((version: DocumentVersion) => {
    if (!editor) return;

    // Load the document associated with this version
    const doc = loadDocument(version.documentId);
    if (doc) {
      editor.chain().focus().setContent(doc.content || doc).run();
      setOpen(false);
    }
  }, [editor]);

  const handleDelete = (docId: string) => {
    deleteDocument(docId);
    setDeleteConfirm(null);
    loadDocuments();
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(search.toLowerCase()) ||
    doc.preview.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    // Less than 24 hours
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      if (hours < 1) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
      }
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    }

    // Less than 7 days
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days} day${days !== 1 ? "s" : ""} ago`;
    }

    // Full date
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <History className="h-4 w-4 mr-2" />
          History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            {view === "versions" && selectedDoc ? (
              <button
                onClick={() => setView("documents")}
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <FolderOpen className="h-5 w-5" />
                Documents
              </button>
            ) : (
              <>
                <FolderOpen className="h-5 w-5 inline-block mr-2" />
                Saved Documents
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {view === "versions"
              ? "View and restore previous versions"
              : "Browse and restore saved documents"}
          </DialogDescription>
        </DialogHeader>

        {view === "documents" ? (
          <div className="space-y-4 mt-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Document List */}
            <ScrollArea className="h-[400px]">
              {filteredDocuments.length > 0 ? (
                <div className="space-y-2 pr-4">
                  {filteredDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="border rounded-lg p-4 hover:border-primary transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{doc.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {doc.preview}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(doc.lastModified)}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {doc.wordCount} words
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => loadVersions(doc.id)}
                            title="View versions"
                          >
                            <History className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLoadDocument(doc.id)}
                            title="Open document"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          {deleteConfirm === doc.id ? (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(doc.id)}
                              >
                                Delete
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteConfirm(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirm(doc.id)}
                              title="Delete document"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                  <FolderOpen className="h-12 w-12 mb-2" />
                  <p>No saved documents found</p>
                  <p className="text-xs mt-1">
                    Documents are automatically saved as you type
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {/* Back button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView("documents")}
            >
              ← Back to documents
            </Button>

            {/* Version List */}
            <ScrollArea className="h-[400px]">
              {versions.length > 0 ? (
                <div className="space-y-2 pr-4">
                  {versions.map((version, index) => (
                    <div
                      key={version.id}
                      className="border rounded-lg p-4 hover:border-primary transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {new Date(version.timestamp).toLocaleString()}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {version.wordCount} words
                            {index === 0 && (
                              <span className="ml-2 text-primary">(Current)</span>
                            )}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLoadVersion(version)}
                          disabled={index === 0}
                        >
                          Restore
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                  <History className="h-12 w-12 mb-2" />
                  <p>No version history available</p>
                </div>
              )}
            </ScrollArea>

            {/* Info */}
            <div className="flex items-start gap-2 p-3 bg-muted rounded-lg text-xs">
              <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p className="text-muted-foreground">
                Versions are automatically saved as you edit. Up to 50 versions
                are kept per document.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
