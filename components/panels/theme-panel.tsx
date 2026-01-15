"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useDocumentStore } from "@/stores/document-store";
import { themePresets, type ThemePreset } from "@/types/theme";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemePanel() {
  const { themePreset, setThemePreset } = useDocumentStore();
  const currentTheme = useDocumentStore((state) => state.currentTheme());

  return (
    <div className="space-y-6 p-4">
      <div>
        <h3 className="text-sm font-semibold mb-2">Theme</h3>
        <p className="text-xs text-muted-foreground">
          Choose a theme for your document
        </p>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="grid gap-4">
          {(Object.keys(themePresets) as ThemePreset[]).map((preset) => {
            const theme = themePresets[preset];
            const isSelected = themePreset === preset;

            return (
              <button
                key={preset}
                onClick={() => setThemePreset(preset)}
                className={cn(
                  "relative rounded-lg border p-4 text-left transition-all hover:border-primary",
                  isSelected && "border-primary ring-1 ring-primary"
                )}
              >
                {isSelected && (
                  <div className="absolute right-2 top-2">
                    <Badge variant="default" className="h-5 px-1.5">
                      <Check className="h-3 w-3" />
                    </Badge>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium capitalize">{theme.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {theme.description}
                    </p>
                  </div>

                  {/* Theme Preview */}
                  <div
                    className="rounded-md border p-3"
                    style={{ backgroundColor: theme.colors.background }}
                  >
                    <div
                      className="text-sm font-semibold"
                      style={{ color: theme.colors.headingColor }}
                    >
                      Heading
                    </div>
                    <div
                      className="text-xs mt-1"
                      style={{ color: theme.colors.bodyColor }}
                    >
                      Body text with{" "}
                      <span style={{ color: theme.colors.linkColor }}>
                        a link
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <div
                        className="h-4 w-4 rounded-sm"
                        style={{ backgroundColor: theme.colors.primary }}
                        title="Primary"
                      />
                      <div
                        className="h-4 w-4 rounded-sm"
                        style={{ backgroundColor: theme.colors.accent }}
                        title="Accent"
                      />
                      <div
                        className="h-4 w-4 rounded-sm border"
                        style={{ backgroundColor: theme.colors.codeBackground }}
                        title="Code BG"
                      />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>

      <Separator />

      <div className="space-y-2">
        <h4 className="text-xs font-semibold">Current Theme Colors</h4>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(currentTheme.colors)
            .slice(0, 8)
            .map(([key, value]) => (
              <div key={key} className="text-center">
                <div
                  className="h-8 w-full rounded-md border"
                  style={{ backgroundColor: value }}
                />
                <span className="text-[10px] text-muted-foreground capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
