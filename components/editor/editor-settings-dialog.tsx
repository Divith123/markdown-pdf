"use client";

import { useCallback, useRef, useState } from "react";
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Keyboard,
  Type,
  Moon,
  Sun,
  BookOpen,
  Focus,
  Pencil,
  Eye,
  Volume2,
  VolumeX,
  Monitor,
  Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

interface EditorSettingsDialogProps {
  onSettingsChange?: () => void;
}

interface EditorSettings {
  // Display
  theme: "light" | "dark" | "system";
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  showLineNumbers: boolean;
  showWordCount: boolean;
  
  // Editor Behavior
  autoSave: boolean;
  autoSaveInterval: number;
  spellCheck: boolean;
  smartQuotes: boolean;
  smartDashes: boolean;
  
  // Focus Mode
  focusMode: boolean;
  typewriterMode: boolean;
  
  // Reading Mode
  readingMode: "light" | "sepia" | "dark" | "night";
  
  // Sounds
  enableSounds: boolean;
  typingSounds: boolean;
}

const defaultSettings: EditorSettings = {
  theme: "system",
  fontSize: 16,
  lineHeight: 1.6,
  fontFamily: "system",
  showLineNumbers: false,
  showWordCount: true,
  autoSave: true,
  autoSaveInterval: 30,
  spellCheck: true,
  smartQuotes: true,
  smartDashes: true,
  focusMode: false,
  typewriterMode: false,
  readingMode: "light",
  enableSounds: false,
  typingSounds: false,
};

const fontFamilies = [
  { id: "system", label: "System Default" },
  { id: "serif", label: "Serif (Times New Roman)" },
  { id: "sans", label: "Sans-serif (Arial)" },
  { id: "mono", label: "Monospace (Courier)" },
  { id: "georgia", label: "Georgia" },
  { id: "palatino", label: "Palatino" },
];

const themes = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
];

const readingModes = [
  { id: "light", label: "Light", color: "#ffffff" },
  { id: "sepia", label: "Sepia", color: "#f4ecd8" },
  { id: "dark", label: "Dark", color: "#1a1a1a" },
  { id: "night", label: "Night", color: "#0a0a0a" },
];

export function EditorSettingsDialog({ onSettingsChange }: EditorSettingsDialogProps) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<EditorSettings>(() => {
    // Load from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("editorSettings");
      if (saved) {
        try {
          return { ...defaultSettings, ...JSON.parse(saved) };
        } catch {
          // Use defaults
        }
      }
    }
    return defaultSettings;
  });

  const updateSetting = useCallback(<K extends keyof EditorSettings>(
    key: K,
    value: EditorSettings[K]
  ) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem("editorSettings", JSON.stringify(updated));
      return updated;
    });
    onSettingsChange?.();
  }, [onSettingsChange]);

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    updateSetting("theme", newTheme);
    setTheme(newTheme);
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    localStorage.setItem("editorSettings", JSON.stringify(defaultSettings));
    onSettingsChange?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Editor Settings">
          <Palette className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editor Settings</DialogTitle>
          <DialogDescription>
            Customize your writing experience
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="display" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="display">Display</TabsTrigger>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="focus">Focus</TabsTrigger>
            <TabsTrigger value="reading">Reading</TabsTrigger>
          </TabsList>

          <TabsContent value="display" className="space-y-4 mt-4">
            {/* Theme */}
            <div className="space-y-2">
              <Label>Theme</Label>
              <div className="grid grid-cols-3 gap-2">
                {themes.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleThemeChange(t.id as "light" | "dark" | "system")}
                      className={cn(
                        "flex items-center justify-center gap-2 p-3 border rounded-lg transition-all",
                        settings.theme === t.id
                          ? "border-primary bg-primary/10"
                          : "hover:border-muted-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Font Size */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Font Size</Label>
                <span className="text-sm text-muted-foreground">{settings.fontSize}px</span>
              </div>
              <input
                type="range"
                min={12}
                max={24}
                value={settings.fontSize}
                onChange={(e) => updateSetting("fontSize", parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Line Height */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Line Height</Label>
                <span className="text-sm text-muted-foreground">{settings.lineHeight.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min={1}
                max={2.5}
                step={0.1}
                value={settings.lineHeight}
                onChange={(e) => updateSetting("lineHeight", parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Font Family */}
            <div className="space-y-2">
              <Label>Font Family</Label>
              <select
                value={settings.fontFamily}
                onChange={(e) => updateSetting("fontFamily", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {fontFamilies.map((font) => (
                  <option key={font.id} value={font.id}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>

            <Separator />

            {/* Toggles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="showWordCount">Show Word Count</Label>
                <Switch
                  id="showWordCount"
                  checked={settings.showWordCount}
                  onCheckedChange={(checked) => updateSetting("showWordCount", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showLineNumbers">Show Line Numbers</Label>
                <Switch
                  id="showLineNumbers"
                  checked={settings.showLineNumbers}
                  onCheckedChange={(checked) => updateSetting("showLineNumbers", checked)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="editor" className="space-y-4 mt-4">
            {/* Auto Save */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoSave">Auto Save</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically save your work
                  </p>
                </div>
                <Switch
                  id="autoSave"
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => updateSetting("autoSave", checked)}
                />
              </div>

              {settings.autoSave && (
                <div className="space-y-2 pl-4 border-l-2">
                  <div className="flex items-center justify-between">
                    <Label>Save Interval</Label>
                    <span className="text-sm text-muted-foreground">
                      {settings.autoSaveInterval}s
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={120}
                    step={10}
                    value={settings.autoSaveInterval}
                    onChange={(e) => updateSetting("autoSaveInterval", parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            <Separator />

            {/* Spell Check */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="spellCheck">Spell Check</Label>
                <p className="text-xs text-muted-foreground">
                  Highlight potential spelling errors
                </p>
              </div>
              <Switch
                id="spellCheck"
                checked={settings.spellCheck}
                onCheckedChange={(checked) => updateSetting("spellCheck", checked)}
              />
            </div>

            {/* Smart Typography */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="smartQuotes">Smart Quotes</Label>
                  <p className="text-xs text-muted-foreground">
                    Convert straight quotes to curly quotes
                  </p>
                </div>
                <Switch
                  id="smartQuotes"
                  checked={settings.smartQuotes}
                  onCheckedChange={(checked) => updateSetting("smartQuotes", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="smartDashes">Smart Dashes</Label>
                  <p className="text-xs text-muted-foreground">
                    Convert -- to em dashes
                  </p>
                </div>
                <Switch
                  id="smartDashes"
                  checked={settings.smartDashes}
                  onCheckedChange={(checked) => updateSetting("smartDashes", checked)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="focus" className="space-y-4 mt-4">
            {/* Focus Mode */}
            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Focus className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <Label>Focus Mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Hide all distractions and center your content
                  </p>
                </div>
                <Switch
                  checked={settings.focusMode}
                  onCheckedChange={(checked) => updateSetting("focusMode", checked)}
                />
              </div>
            </div>

            {/* Typewriter Mode */}
            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Pencil className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <Label>Typewriter Mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Keep the current line centered on screen
                  </p>
                </div>
                <Switch
                  checked={settings.typewriterMode}
                  onCheckedChange={(checked) => updateSetting("typewriterMode", checked)}
                />
              </div>
            </div>

            <Separator />

            {/* Sounds */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableSounds" className="flex items-center gap-2">
                    {settings.enableSounds ? (
                      <Volume2 className="h-4 w-4" />
                    ) : (
                      <VolumeX className="h-4 w-4" />
                    )}
                    Enable Sounds
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Play ambient sounds while writing
                  </p>
                </div>
                <Switch
                  id="enableSounds"
                  checked={settings.enableSounds}
                  onCheckedChange={(checked) => updateSetting("enableSounds", checked)}
                />
              </div>

              {settings.enableSounds && (
                <div className="flex items-center justify-between pl-4 border-l-2">
                  <div>
                    <Label htmlFor="typingSounds">Typing Sounds</Label>
                    <p className="text-xs text-muted-foreground">
                      Mechanical keyboard sounds
                    </p>
                  </div>
                  <Switch
                    id="typingSounds"
                    checked={settings.typingSounds}
                    onCheckedChange={(checked) => updateSetting("typingSounds", checked)}
                  />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="reading" className="space-y-4 mt-4">
            {/* Reading Mode */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Reading Mode
              </Label>
              <p className="text-xs text-muted-foreground mb-3">
                Choose a comfortable reading theme
              </p>
              <div className="grid grid-cols-4 gap-2">
                {readingModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => updateSetting("readingMode", mode.id as EditorSettings["readingMode"])}
                    className={cn(
                      "p-3 border rounded-lg transition-all flex flex-col items-center gap-2",
                      settings.readingMode === mode.id
                        ? "border-primary ring-2 ring-primary/20"
                        : "hover:border-muted-foreground"
                    )}
                  >
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: mode.color }}
                    />
                    <span className="text-xs">{mode.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Reading Mode Benefits
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• <strong>Light:</strong> Standard bright display</li>
                <li>• <strong>Sepia:</strong> Warm tones, reduced eye strain</li>
                <li>• <strong>Dark:</strong> Reduced brightness for low light</li>
                <li>• <strong>Night:</strong> Minimal blue light for late night</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="mt-4" />

        <div className="flex justify-between pt-4">
          <Button variant="ghost" onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
          <Button onClick={() => setOpen(false)}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
