"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useAppStore, type RecentFile } from "@/stores/app-store";
import { useDocumentStore } from "@/stores/document-store";
import {
  X,
  Save,
  Clock,
  Trash2,
  FileText,
  Settings,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface MobileSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecentFile?: (file: RecentFile) => void;
}

export function MobileSettingsPanel({
  isOpen,
  onClose,
  onSelectRecentFile,
}: MobileSettingsPanelProps) {
  const {
    autoSaveEnabled,
    setAutoSaveEnabled,
    autoSaveInterval,
    setAutoSaveInterval,
    recentFiles,
    removeRecentFile,
    clearRecentFiles,
  } = useAppStore();

  const { resetDocument } = useDocumentStore();
  const { theme, setTheme } = useTheme();

  const formatInterval = (ms: number) => {
    const seconds = ms / 1000;
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m`;
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString();
  };

  const handleNewDocument = () => {
    resetDocument();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl shadow-2xl flex flex-col max-h-[92vh] animate-in slide-in-from-bottom duration-300">
        {/* Handle */}
        <div className="flex flex-col items-center pt-3 pb-1">
          <div className="h-1.5 w-12 rounded-full bg-muted" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors"
            title="Close settings"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-8 scrollbar-hide">
          {/* Auto-save Section */}
          <div className="px-6 py-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
              Auto-save
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-card border rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Save className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Enable Auto-save</p>
                    <p className="text-xs text-muted-foreground">
                      Automatically save to browser storage
                    </p>
                  </div>
                </div>
                <Switch
                  checked={autoSaveEnabled}
                  onCheckedChange={setAutoSaveEnabled}
                />
              </div>

              {autoSaveEnabled && (
                <div className="p-4 bg-card border rounded-xl">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-bold">Save Interval</span>
                    </div>
                    <span className="text-sm font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {formatInterval(autoSaveInterval)}
                    </span>
                  </div>
                  <Slider
                    value={[autoSaveInterval / 1000]}
                    onValueChange={([v]) => setAutoSaveInterval(v * 1000)}
                    min={5}
                    max={60}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                    <span>5 sec</span>
                    <span>60 sec</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="h-px bg-border mx-6" />

          {/* Theme Section */}
          <div className="px-6 py-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
              Appearance
            </h3>

            <div className="flex gap-3">
              <button
                onClick={() => setTheme("light")}
                className={cn(
                  "flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                  theme === "light"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <Sun className="h-6 w-6" />
                <span className="text-sm font-bold">Light</span>
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={cn(
                  "flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                  theme === "dark"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <Moon className="h-6 w-6" />
                <span className="text-sm font-bold">Dark</span>
              </button>
            </div>
          </div>

          <div className="h-px bg-border mx-6" />

          {/* Recent Files Section */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                Recent Files
              </h3>
              {recentFiles.length > 0 && (
                <button
                  onClick={clearRecentFiles}
                  className="text-xs text-destructive hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            {recentFiles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent files</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 bg-card border rounded-xl group hover:border-primary/30 transition-colors"
                  >
                    <FileText className="h-8 w-8 text-primary shrink-0" />
                    <button
                      onClick={() => {
                        onSelectRecentFile?.(file);
                        onClose();
                      }}
                      className="flex-1 text-left min-w-0"
                    >
                      <p className="text-sm font-bold truncate">{file.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {file.preview}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatDate(file.lastOpened)}
                      </p>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRecentFile(file.id);
                      }}
                      className="p-2 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="h-px bg-border mx-6" />

          {/* New Document Button */}
          <div className="px-6 py-4">
            <Button
              variant="outline"
              onClick={handleNewDocument}
              className="w-full h-12 rounded-xl"
            >
              <FileText className="h-4 w-4 mr-2" />
              New Document
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
