"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EditorCanvas } from "@/components/editor/editor-canvas";
import { ModeSwitcher } from "@/components/editor/mode-switcher";
import { FormattingToolbar } from "@/components/toolbar/formatting-toolbar";
import { ExportPanel } from "@/components/panels/export-panel";
import { TypographyPanel } from "@/components/panels/typography-panel";
import { ThemePanel } from "@/components/panels/theme-panel";
import { PageSettingsPanel } from "@/components/panels/page-settings-panel";
import {
  MobileHeader,
  MobileToolbar,
  MobileTypographyPanel,
  MobileExportPanel,
  MobileSettingsPanel,
} from "@/components/mobile";
import { useDocumentStore } from "@/stores/document-store";
import { useEditorStore } from "@/stores/editor-store";
import { useAppStore } from "@/stores/app-store";
import {
  Type,
  Palette,
  FileText,
  Settings,
  PanelRight,
  PanelRightClose,
  FilePlus,
  Cloud,
  CloudOff,
  Menu,
  Settings2,
} from "lucide-react";

export default function EditorPage() {
  // Desktop state
  const [showSidebar, setShowSidebar] = useState(true);
  const [activePanel, setActivePanel] = useState<string>("typography");

  // Mobile panel states
  const [showMobileExport, setShowMobileExport] = useState(false);
  const [showMobileTypography, setShowMobileTypography] = useState(false);
  const [showMobileSettings, setShowMobileSettings] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Stores
  const { metadata, setMetadata, setContent, resetDocument } = useDocumentStore();
  const { editor, isReady, isSaving, setIsSaving, lastSaved, setLastSaved } = useEditorStore();
  const { autoSaveEnabled, autoSaveInterval, addRecentFile } = useAppStore();

  // Auto-save effect
  useEffect(() => {
    if (!autoSaveEnabled || !editor) return;

    const saveDocument = () => {
      if (!editor) return;
      setIsSaving(true);
      const jsonContent = editor.getJSON();
      setContent(jsonContent);
      addRecentFile({
        id: metadata.id,
        title: metadata.title,
        lastOpened: new Date(),
        preview: editor.getText().slice(0, 100),
      });
      setTimeout(() => {
        setIsSaving(false);
        setLastSaved(new Date());
      }, 300);
    };

    const interval = setInterval(saveDocument, autoSaveInterval);
    return () => clearInterval(interval);
  }, [autoSaveEnabled, autoSaveInterval, editor, metadata.id, metadata.title, setIsSaving, setLastSaved, setContent, addRecentFile]);

  const formatLastSaved = useCallback(() => {
    if (!lastSaved) return "Not saved";
    const now = new Date();
    const diff = now.getTime() - lastSaved.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just saved";
    if (minutes < 60) return `${minutes}m ago`;
    return lastSaved.toLocaleTimeString();
  }, [lastSaved]);

  // Mobile menu component
  const MobileMenuSheet = () => {
    if (!showMobileMenu) return null;
    return (
      <div className="fixed inset-0 z-50 md:hidden">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowMobileMenu(false)} />
        <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300">
          <div className="flex flex-col items-center pt-3 pb-1">
            <div className="h-1.5 w-12 rounded-full bg-muted" />
          </div>
          <div className="p-6 space-y-3">
            <button onClick={() => { setShowMobileMenu(false); setShowMobileTypography(true); }} className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-muted transition-colors">
              <Type className="h-6 w-6 text-primary" />
              <div className="text-left">
                <p className="font-bold">Typography</p>
                <p className="text-sm text-muted-foreground">Fonts, sizes, spacing</p>
              </div>
            </button>
            <button onClick={() => { setShowMobileMenu(false); setShowMobileSettings(true); }} className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-muted transition-colors">
              <Settings2 className="h-6 w-6 text-primary" />
              <div className="text-left">
                <p className="font-bold">Settings</p>
                <p className="text-sm text-muted-foreground">Auto-save, recent files</p>
              </div>
            </button>
            <button onClick={() => { setShowMobileMenu(false); resetDocument(); }} className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-muted transition-colors">
              <FilePlus className="h-6 w-6 text-primary" />
              <div className="text-left">
                <p className="font-bold">New Document</p>
                <p className="text-sm text-muted-foreground">Start fresh</p>
              </div>
            </button>
          </div>
          <div className="pb-8" />
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Mobile Header */}
      <MobileHeader onExportClick={() => setShowMobileExport(true)} />

      {/* Desktop Header */}
      <header className="hidden md:flex h-14 items-center justify-between border-b px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">Markdown Pro</span>
          </div>
          <Separator orientation="vertical" className="h-6" />
          <Input
            value={metadata.title}
            onChange={(e) => setMetadata({ title: e.target.value })}
            className="h-8 w-64 border-none bg-transparent px-2 text-sm font-medium focus-visible:ring-1"
            placeholder="Untitled Document"
          />
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {isSaving ? (
                    <>
                      <Cloud className="h-4 w-4 animate-pulse" />
                      Saving...
                    </>
                  ) : lastSaved ? (
                    <>
                      <Cloud className="h-4 w-4" />
                      {formatLastSaved()}
                    </>
                  ) : (
                    <>
                      <CloudOff className="h-4 w-4" />
                      Not saved
                    </>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{autoSaveEnabled ? "Auto-save enabled" : "Auto-save disabled"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Separator orientation="vertical" className="h-6" />
          <ModeSwitcher />
          <Separator orientation="vertical" className="h-6" />
          <ExportPanel />
          <Button variant="ghost" size="icon" onClick={() => setShowSidebar(!showSidebar)} className="h-8 w-8">
            {showSidebar ? <PanelRightClose className="h-4 w-4" /> : <PanelRight className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      {/* Desktop Toolbar */}
      <div className="hidden md:flex items-center justify-between border-b px-4 py-2">
        <FormattingToolbar />
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => resetDocument()} className="gap-1.5 text-xs">
            <FilePlus className="h-3.5 w-3.5" />
            New
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-auto bg-muted/30 p-4 md:p-8 pb-32 md:pb-8">
          {/* Mobile Live Preview Indicator */}
          <div className="flex justify-end pt-2 pb-4 sticky top-0 z-10 pointer-events-none md:hidden">
            <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm pl-2 pr-3 py-1 rounded-full shadow-sm border pointer-events-auto">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/75 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
              </span>
              <span className="text-xs font-semibold text-muted-foreground tracking-wide">Live Preview</span>
            </div>
          </div>
          <div className="mx-auto max-w-4xl">
            <EditorCanvas className="min-h-[calc(100vh-200px)] bg-background rounded-xl shadow-lg border p-6 md:p-12" />
          </div>
        </main>

        {/* Desktop Sidebar */}
        {showSidebar && (
          <aside className="hidden md:block w-80 border-l bg-background">
            <Tabs value={activePanel} onValueChange={setActivePanel} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-3 rounded-none border-b">
                <TabsTrigger value="typography" className="gap-1.5 text-xs">
                  <Type className="h-3.5 w-3.5" />
                  Type
                </TabsTrigger>
                <TabsTrigger value="theme" className="gap-1.5 text-xs">
                  <Palette className="h-3.5 w-3.5" />
                  Theme
                </TabsTrigger>
                <TabsTrigger value="page" className="gap-1.5 text-xs">
                  <Settings className="h-3.5 w-3.5" />
                  Page
                </TabsTrigger>
              </TabsList>
              <ScrollArea className="flex-1">
                <TabsContent value="typography" className="m-0"><TypographyPanel /></TabsContent>
                <TabsContent value="theme" className="m-0"><ThemePanel /></TabsContent>
                <TabsContent value="page" className="m-0"><PageSettingsPanel /></TabsContent>
              </ScrollArea>
            </Tabs>
          </aside>
        )}
      </div>

      {/* Mobile Floating Menu Button */}
      <button onClick={() => setShowMobileMenu(true)} className="fixed bottom-24 right-4 z-40 md:hidden p-4 bg-primary text-primary-foreground rounded-full shadow-lg">
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile Components */}
      <MobileToolbar />
      <MobileMenuSheet />
      <MobileExportPanel isOpen={showMobileExport} onClose={() => setShowMobileExport(false)} />
      <MobileTypographyPanel isOpen={showMobileTypography} onClose={() => setShowMobileTypography(false)} />
      <MobileSettingsPanel isOpen={showMobileSettings} onClose={() => setShowMobileSettings(false)} />

      {/* Desktop Status Bar */}
      <footer className="hidden md:flex h-6 items-center justify-between border-t bg-muted/50 px-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>{isReady ? "Ready" : "Loading..."}</span>
          <span>{autoSaveEnabled ? "Auto-save on" : "Auto-save off"}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>v{metadata.version}</span>
        </div>
      </footer>
    </div>
  );
}
