"use client";

import { useState, useEffect, useMemo } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Search,
  Clock,
  Star,
  StarOff,
  MoreVertical,
  Trash2,
  Copy,
  FolderOpen,
  SortAsc,
  SortDesc,
  Calendar,
  FileType,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface RecentDocument {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  wordCount: number;
  isFavorite: boolean;
  preview: string;
}

type SortOption = "recent" | "name" | "created" | "words";
type SortOrder = "asc" | "desc";

interface RecentDocumentsPanelProps {
  onOpenDocument?: (content: string, title: string) => void;
}

export function RecentDocumentsPanel({ onOpenDocument }: RecentDocumentsPanelProps) {
  const [open, setOpen] = useState(false);
  const [documents, setDocuments] = useState<RecentDocument[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Load documents from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedDocs = localStorage.getItem("recentDocuments");
      if (savedDocs) {
        try {
          setDocuments(JSON.parse(savedDocs));
        } catch (e) {
          console.error("Failed to parse recent documents:", e);
        }
      }
    }
  }, [open]);

  // Save documents to localStorage
  const saveDocuments = (docs: RecentDocument[]) => {
    setDocuments(docs);
    localStorage.setItem("recentDocuments", JSON.stringify(docs));
  };

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    let result = [...documents];

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchLower) ||
          doc.preview.toLowerCase().includes(searchLower)
      );
    }

    // Filter by favorites
    if (showFavoritesOnly) {
      result = result.filter((doc) => doc.isFavorite);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "recent":
          comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          break;
        case "name":
          comparison = a.title.localeCompare(b.title);
          break;
        case "created":
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
        case "words":
          comparison = b.wordCount - a.wordCount;
          break;
      }
      return sortOrder === "desc" ? comparison : -comparison;
    });

    return result;
  }, [documents, search, sortBy, sortOrder, showFavoritesOnly]);

  const toggleFavorite = (id: string) => {
    const updated = documents.map((doc) =>
      doc.id === id ? { ...doc, isFavorite: !doc.isFavorite } : doc
    );
    saveDocuments(updated);
  };

  const deleteDocument = (id: string) => {
    const updated = documents.filter((doc) => doc.id !== id);
    saveDocuments(updated);
  };

  const duplicateDocument = (doc: RecentDocument) => {
    const newDoc: RecentDocument = {
      ...doc,
      id: `doc_${Date.now()}`,
      title: `${doc.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
    };
    saveDocuments([newDoc, ...documents]);
  };

  const handleOpenDocument = (doc: RecentDocument) => {
    if (onOpenDocument) {
      onOpenDocument(doc.content, doc.title);
    }
    setOpen(false);
  };

  const clearAll = () => {
    if (confirm("Are you sure you want to clear all recent documents?")) {
      saveDocuments([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Recent Documents">
          <FolderOpen className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Documents
          </DialogTitle>
          <DialogDescription>
            Browse and manage your recently edited documents
          </DialogDescription>
        </DialogHeader>

        {/* Search and Filters */}
        <div className="flex gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Button
            variant={showFavoritesOnly ? "default" : "outline"}
            size="icon"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            title="Show favorites only"
          >
            <Star className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                {sortOrder === "desc" ? (
                  <SortDesc className="h-4 w-4" />
                ) : (
                  <SortAsc className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy("recent")}>
                <Clock className="h-4 w-4 mr-2" />
                Last Modified
                {sortBy === "recent" && " ✓"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("name")}>
                <FileType className="h-4 w-4 mr-2" />
                Name
                {sortBy === "name" && " ✓"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("created")}>
                <Calendar className="h-4 w-4 mr-2" />
                Date Created
                {sortBy === "created" && " ✓"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("words")}>
                <FileText className="h-4 w-4 mr-2" />
                Word Count
                {sortBy === "words" && " ✓"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              >
                {sortOrder === "desc" ? "Ascending" : "Descending"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Documents List */}
        <ScrollArea className="h-[50vh] mt-4">
          {filteredDocuments.length > 0 ? (
            <div className="space-y-2 pr-4">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="group p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleOpenDocument(doc)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <h4 className="font-medium truncate">{doc.title}</h4>
                        {doc.isFavorite && (
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {doc.preview}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>
                          {formatDistanceToNow(new Date(doc.updatedAt), {
                            addSuffix: true,
                          })}
                        </span>
                        <span>•</span>
                        <span>{doc.wordCount.toLocaleString()} words</span>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(doc.id);
                          }}
                        >
                          {doc.isFavorite ? (
                            <>
                              <StarOff className="h-4 w-4 mr-2" />
                              Remove from Favorites
                            </>
                          ) : (
                            <>
                              <Star className="h-4 w-4 mr-2" />
                              Add to Favorites
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateDocument(doc);
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteDocument(doc.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              {documents.length === 0 ? (
                <>
                  <h4 className="font-medium">No recent documents</h4>
                  <p className="text-sm text-muted-foreground">
                    Documents you edit will appear here
                  </p>
                </>
              ) : (
                <>
                  <h4 className="font-medium">No matching documents</h4>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search or filters
                  </p>
                </>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {documents.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <span className="text-sm text-muted-foreground">
              {filteredDocuments.length} of {documents.length} documents
            </span>
            <Button variant="outline" size="sm" onClick={clearAll}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Helper to save a document to recent documents
export function saveToRecentDocuments(
  content: string,
  title: string = "Untitled Document"
) {
  if (typeof window === "undefined") return;

  const savedDocs = localStorage.getItem("recentDocuments");
  let documents: RecentDocument[] = [];
  
  if (savedDocs) {
    try {
      documents = JSON.parse(savedDocs);
    } catch (e) {
      console.error("Failed to parse recent documents:", e);
    }
  }

  // Create preview (first 150 chars of plain text)
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = content;
  const plainText = tempDiv.textContent || tempDiv.innerText || "";
  const preview = plainText.slice(0, 150).trim() + (plainText.length > 150 ? "..." : "");

  // Count words
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;

  // Check if document already exists (by title)
  const existingIndex = documents.findIndex((doc) => doc.title === title);

  if (existingIndex >= 0) {
    // Update existing document
    documents[existingIndex] = {
      ...documents[existingIndex],
      content,
      updatedAt: new Date().toISOString(),
      wordCount,
      preview,
    };
  } else {
    // Add new document
    const newDoc: RecentDocument = {
      id: `doc_${Date.now()}`,
      title,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      wordCount,
      isFavorite: false,
      preview,
    };
    documents = [newDoc, ...documents];
  }

  // Keep only last 50 documents
  documents = documents.slice(0, 50);

  localStorage.setItem("recentDocuments", JSON.stringify(documents));
}
