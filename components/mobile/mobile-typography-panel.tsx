"use client";

import { useState } from "react";
import { FontPicker } from "@/components/editor/font-picker";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDocumentStore } from "@/stores/document-store";
import { fontWeightLabels, type FontWeight } from "@/types/typography";
import { X, Check, Type, Space, AlignVerticalSpaceAround } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileTypographyPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileTypographyPanel({ isOpen, onClose }: MobileTypographyPanelProps) {
  const { typography, setTypography } = useDocumentStore();
  const [localTypography, setLocalTypography] = useState(typography);

  const handleApply = () => {
    setTypography(localTypography);
    onClose();
  };

  const handleReset = () => {
    setLocalTypography(typography);
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
          <h2 className="text-xl font-extrabold tracking-tight">Typography</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pb-24 scrollbar-hide">
          {/* Live Preview */}
          <div className="px-6 pb-6">
            <div className="bg-card border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-1 rounded">
                  Preview
                </span>
                <span className="text-xs font-medium text-muted-foreground">Live Update</span>
              </div>
              <p
                className="text-2xl leading-relaxed"
                style={{
                  fontFamily: localTypography.bodyFont.family,
                  fontSize: `${localTypography.baseFontSize}px`,
                  lineHeight: localTypography.baseLineHeight,
                  fontWeight: localTypography.bodyFont.weight,
                }}
              >
                The quick brown fox jumps over the lazy dog.
              </p>
              <div className="flex items-center gap-2 mt-4">
                <div className="h-px flex-1 bg-border" />
                <p className="text-xs text-muted-foreground font-mono">
                  {localTypography.bodyFont.family} • {localTypography.baseFontSize}px
                </p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-8 px-6">
            {/* Font Families */}
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">Heading Font</label>
                <FontPicker
                  value={localTypography.headingFont.family}
                  onValueChange={(family) =>
                    setLocalTypography({
                      ...localTypography,
                      headingFont: { ...localTypography.headingFont, family, source: "google" },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Body Font</label>
                <FontPicker
                  value={localTypography.bodyFont.family}
                  onValueChange={(family) =>
                    setLocalTypography({
                      ...localTypography,
                      bodyFont: { ...localTypography.bodyFont, family, source: "google" },
                    })
                  }
                />
              </div>
            </div>

            {/* Font Weight */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold">Weight</label>
              <Select
                value={String(localTypography.bodyFont.weight)}
                onValueChange={(v) =>
                  setLocalTypography({
                    ...localTypography,
                    bodyFont: {
                      ...localTypography.bodyFont,
                      weight: parseInt(v) as FontWeight,
                    },
                  })
                }
              >
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(fontWeightLabels).map(([weight, label]) => (
                    <SelectItem key={weight} value={weight}>
                      {label} ({weight})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Font Size Slider */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-bold">Size</label>
                </div>
                <span className="text-sm font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {localTypography.baseFontSize}px
                </span>
              </div>
              <Slider
                value={[localTypography.baseFontSize]}
                onValueChange={([v]) =>
                  setLocalTypography({ ...localTypography, baseFontSize: v })
                }
                min={12}
                max={32}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                <span>12px</span>
                <span>32px</span>
              </div>
            </div>

            {/* Line Height Slider */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <AlignVerticalSpaceAround className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-bold">Line Height</label>
                </div>
                <span className="text-sm font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {localTypography.baseLineHeight.toFixed(1)}
                </span>
              </div>
              <Slider
                value={[localTypography.baseLineHeight * 10]}
                onValueChange={([v]) =>
                  setLocalTypography({ ...localTypography, baseLineHeight: v / 10 })
                }
                min={10}
                max={25}
                step={1}
                className="w-full"
              />
            </div>

            {/* Paragraph Spacing Slider */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Space className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-bold">Paragraph Spacing</label>
                </div>
                <span className="text-sm font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {localTypography.paragraphSpacing}px
                </span>
              </div>
              <Slider
                value={[localTypography.paragraphSpacing]}
                onValueChange={([v]) =>
                  setLocalTypography({ ...localTypography, paragraphSpacing: v })
                }
                min={0}
                max={48}
                step={4}
                className="w-full"
              />
            </div>

            <div className="h-8" />
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="absolute bottom-0 left-0 w-full bg-background border-t p-4 pb-8 flex items-center gap-4">
          <Button variant="ghost" onClick={handleReset} className="px-4">
            Reset
          </Button>
          <Button onClick={handleApply} className="flex-1 h-12 rounded-xl font-bold gap-2">
            <Check className="h-4 w-4" />
            Apply Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
