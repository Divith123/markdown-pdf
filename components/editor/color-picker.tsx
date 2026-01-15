"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEditorStore } from "@/stores/editor-store";
import { highlightColors, textColors } from "@/lib/editor/extensions";
import { Highlighter, Palette, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  type: "text" | "highlight";
  currentColor?: string;
  onColorChange?: (color: string) => void;
  trigger?: React.ReactNode;
}

export function ColorPicker({ type, currentColor, onColorChange, trigger }: ColorPickerProps) {
  const { editor } = useEditorStore();
  const [open, setOpen] = useState(false);

  const colors = type === "text" ? textColors : highlightColors;

  const handleColorSelect = useCallback((color: string) => {
    if (onColorChange) {
      onColorChange(color);
    } else if (editor) {
      if (type === "text") {
        if (color === "inherit") {
          editor.chain().focus().unsetColor().run();
        } else {
          editor.chain().focus().setColor(color).run();
        }
      } else {
        editor.chain().focus().toggleHighlight({ color }).run();
      }
    }
    setOpen(false);
  }, [editor, type, onColorChange]);

  const handleRemove = useCallback(() => {
    if (editor) {
      if (type === "text") {
        editor.chain().focus().unsetColor().run();
      } else {
        editor.chain().focus().unsetHighlight().run();
      }
    }
    setOpen(false);
  }, [editor, type]);

  // Get current color from editor
  const activeColor = useMemo(() => {
    if (currentColor) return currentColor;
    if (!editor) return null;
    
    if (type === "text") {
      return editor.getAttributes("textStyle").color || null;
    } else {
      return editor.getAttributes("highlight").color || null;
    }
  }, [editor, type, currentColor, open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
            {type === "text" ? (
              <Palette className="h-4 w-4" />
            ) : (
              <Highlighter className="h-4 w-4" />
            )}
            {activeColor && activeColor !== "inherit" && (
              <span
                className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full"
                style={{ backgroundColor: activeColor }}
              />
            )}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="start">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            {type === "text" ? "Text Color" : "Highlight Color"}
          </p>
          
          <div className="grid grid-cols-5 gap-1">
            {colors.map((color) => (
              <button
                key={color.value}
                onClick={() => handleColorSelect(color.value)}
                className={cn(
                  "w-7 h-7 rounded-md flex items-center justify-center transition-all",
                  "hover:scale-110 hover:shadow-md",
                  "ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                )}
                style={{ 
                  backgroundColor: color.value === "inherit" ? "transparent" : color.value,
                  border: color.value === "inherit" ? "1px dashed currentColor" : "none",
                }}
                title={color.name}
              >
                {activeColor === color.value && (
                  <Check className={cn(
                    "h-4 w-4",
                    isLightColor(color.value) ? "text-gray-800" : "text-white"
                  )} />
                )}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleRemove}
          >
            Remove {type === "text" ? "Color" : "Highlight"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Helper to determine if color is light
function isLightColor(color: string): boolean {
  if (color === "inherit" || !color) return true;
  
  // Convert hex to RGB
  let hex = color.replace("#", "");
  if (hex.length === 3) {
    hex = hex.split("").map(c => c + c).join("");
  }
  
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5;
}
