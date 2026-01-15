"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings2,
  FileText,
  Tags,
  User,
  Calendar,
  Globe,
  Lock,
  Image,
  Hash,
} from "lucide-react";
import { useDocumentStore } from "@/stores/document-store";

interface DocumentMetadata {
  title: string;
  author: string;
  description: string;
  keywords: string[];
  language: string;
  createdAt: string;
  modifiedAt: string;
  version: string;
  status: "draft" | "review" | "published" | "archived";
  category: string;
  tags: string[];
  coverImage: string;
  wordCount: number;
  estimatedReadTime: number;
  isPublic: boolean;
  license: string;
  customFields: Record<string, string>;
}

const defaultMetadata: DocumentMetadata = {
  title: "",
  author: "",
  description: "",
  keywords: [],
  language: "en",
  createdAt: new Date().toISOString(),
  modifiedAt: new Date().toISOString(),
  version: "1.0.0",
  status: "draft",
  category: "",
  tags: [],
  coverImage: "",
  wordCount: 0,
  estimatedReadTime: 0,
  isPublic: false,
  license: "All Rights Reserved",
  customFields: {},
};

const statusOptions = [
  { value: "draft", label: "Draft", color: "bg-yellow-500" },
  { value: "review", label: "In Review", color: "bg-blue-500" },
  { value: "published", label: "Published", color: "bg-green-500" },
  { value: "archived", label: "Archived", color: "bg-gray-500" },
];

const languageOptions = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "pt", label: "Portuguese" },
  { value: "it", label: "Italian" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "zh", label: "Chinese" },
  { value: "ru", label: "Russian" },
  { value: "ar", label: "Arabic" },
];

const licenseOptions = [
  "All Rights Reserved",
  "CC BY",
  "CC BY-SA",
  "CC BY-NC",
  "CC BY-NC-SA",
  "CC0 (Public Domain)",
  "MIT",
  "Apache 2.0",
  "GPL v3",
];

export function MetadataEditor() {
  const { metadata: docMetadata, setMetadata: setDocMetadata } = useDocumentStore();
  const [open, setOpen] = useState(false);
  const [metadata, setMetadata] = useState<DocumentMetadata>(() => ({
    ...defaultMetadata,
    title: docMetadata.title || "",
    author: docMetadata.author || "",
  }));
  const [newTag, setNewTag] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const [customFieldKey, setCustomFieldKey] = useState("");
  const [customFieldValue, setCustomFieldValue] = useState("");

  // Sync with document store
  useEffect(() => {
    if (docMetadata.title) {
      setMetadata((prev) => ({ ...prev, title: docMetadata.title }));
    }
    if (docMetadata.author) {
      setMetadata((prev) => ({ ...prev, author: docMetadata.author }));
    }
  }, [docMetadata.title, docMetadata.author]);

  const handleSave = () => {
    setDocMetadata({
      title: metadata.title,
      author: metadata.author,
    });
    // In a real app, you'd persist all metadata to your backend/storage
    localStorage.setItem("documentMetadata", JSON.stringify(metadata));
    setOpen(false);
  };

  const addTag = () => {
    if (newTag && !metadata.tags.includes(newTag)) {
      setMetadata((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setMetadata((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const addKeyword = () => {
    if (newKeyword && !metadata.keywords.includes(newKeyword)) {
      setMetadata((prev) => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword],
      }));
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setMetadata((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k !== keyword),
    }));
  };

  const addCustomField = () => {
    if (customFieldKey && customFieldValue) {
      setMetadata((prev) => ({
        ...prev,
        customFields: {
          ...prev.customFields,
          [customFieldKey]: customFieldValue,
        },
      }));
      setCustomFieldKey("");
      setCustomFieldValue("");
    }
  };

  const removeCustomField = (key: string) => {
    setMetadata((prev) => {
      const { [key]: _, ...rest } = prev.customFields;
      return { ...prev, customFields: rest };
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="h-4 w-4 mr-2" />
          Metadata
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Document Metadata</DialogTitle>
          <DialogDescription>
            Manage document properties and metadata for better organization
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="publishing">Publishing</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px] mt-4">
            <TabsContent value="basic" className="space-y-4 pr-4">
              {/* Title */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Title
                </Label>
                <Input
                  value={metadata.title}
                  onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                  placeholder="Document title"
                />
              </div>

              {/* Author */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Author
                </Label>
                <Input
                  value={metadata.author}
                  onChange={(e) => setMetadata({ ...metadata, author: e.target.value })}
                  placeholder="Author name"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Description</Label>
                <textarea
                  className="w-full min-h-[80px] p-2 text-sm border rounded-md resize-none"
                  value={metadata.description}
                  onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                  placeholder="Brief description of the document"
                />
              </div>

              {/* Language */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Language
                </Label>
                <select
                  className="w-full p-2 text-sm border rounded-md"
                  value={metadata.language}
                  onChange={(e) => setMetadata({ ...metadata, language: e.target.value })}
                >
                  {languageOptions.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  value={metadata.category}
                  onChange={(e) => setMetadata({ ...metadata, category: e.target.value })}
                  placeholder="Document category"
                />
              </div>

              {/* Version */}
              <div className="space-y-2">
                <Label>Version</Label>
                <Input
                  value={metadata.version}
                  onChange={(e) => setMetadata({ ...metadata, version: e.target.value })}
                  placeholder="1.0.0"
                />
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4 pr-4">
              {/* Keywords */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Keywords
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addKeyword()}
                    placeholder="Add keyword"
                  />
                  <Button type="button" onClick={addKeyword} size="sm">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {metadata.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-sm"
                    >
                      {keyword}
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Tags className="h-4 w-4" />
                  Tags
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTag()}
                    placeholder="Add tag"
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {metadata.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
                    >
                      #{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-primary/60 hover:text-primary"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Cover Image */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Cover Image URL
                </Label>
                <Input
                  value={metadata.coverImage}
                  onChange={(e) => setMetadata({ ...metadata, coverImage: e.target.value })}
                  placeholder="https://example.com/cover.jpg"
                />
                {metadata.coverImage && (
                  <div className="mt-2 rounded-lg overflow-hidden border">
                    <img
                      src={metadata.coverImage}
                      alt="Cover preview"
                      className="w-full h-32 object-cover"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="publishing" className="space-y-4 pr-4">
              {/* Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="grid grid-cols-4 gap-2">
                  {statusOptions.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => setMetadata({ ...metadata, status: status.value as DocumentMetadata["status"] })}
                      className={`p-2 rounded-md border text-sm transition-all ${
                        metadata.status === status.value
                          ? "border-primary bg-primary/10"
                          : "hover:bg-muted"
                      }`}
                    >
                      <span className={`inline-block w-2 h-2 rounded-full ${status.color} mr-2`} />
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visibility */}
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  {metadata.isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  {metadata.isPublic ? "Public" : "Private"}
                </Label>
                <Switch
                  checked={metadata.isPublic}
                  onCheckedChange={(checked) => setMetadata({ ...metadata, isPublic: checked })}
                />
              </div>

              {/* License */}
              <div className="space-y-2">
                <Label>License</Label>
                <select
                  className="w-full p-2 text-sm border rounded-md"
                  value={metadata.license}
                  onChange={(e) => setMetadata({ ...metadata, license: e.target.value })}
                >
                  {licenseOptions.map((license) => (
                    <option key={license} value={license}>
                      {license}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dates */}
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Created
                  </Label>
                  <p className="text-sm">
                    {new Date(metadata.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Modified
                  </Label>
                  <p className="text-sm">
                    {new Date(metadata.modifiedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4 pr-4">
              <div className="space-y-2">
                <Label>Add Custom Field</Label>
                <div className="flex gap-2">
                  <Input
                    value={customFieldKey}
                    onChange={(e) => setCustomFieldKey(e.target.value)}
                    placeholder="Field name"
                    className="flex-1"
                  />
                  <Input
                    value={customFieldValue}
                    onChange={(e) => setCustomFieldValue(e.target.value)}
                    placeholder="Value"
                    className="flex-1"
                  />
                  <Button type="button" onClick={addCustomField} size="sm">
                    Add
                  </Button>
                </div>
              </div>

              {Object.entries(metadata.customFields).length > 0 ? (
                <div className="space-y-2">
                  <Label>Custom Fields</Label>
                  <div className="border rounded-lg divide-y">
                    {Object.entries(metadata.customFields).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-3"
                      >
                        <div>
                          <span className="font-medium text-sm">{key}</span>
                          <p className="text-sm text-muted-foreground">{value}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCustomField(key)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No custom fields added yet
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Metadata</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
