"use client";

import { FontPicker } from "@/components/editor/font-picker";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { useDocumentStore } from "@/stores/document-store";

export function TypographyPanel() {
  const { typography, setTypography } = useDocumentStore();

  return (
    <div className="space-y-6 p-4">
      <div>
        <h3 className="text-sm font-semibold mb-4">Typography</h3>
        
        {/* Font Families */}
        <div className="space-y-4 mb-6">
          <FontPicker
            label="Headings Font"
            value={typography.headingFont.family}
            onValueChange={(value) => 
              setTypography({ 
                headingFont: { ...typography.headingFont, family: value, source: "google" } 
              })
            }
          />
          
          <FontPicker
            label="Body Font"
            value={typography.bodyFont.family}
            onValueChange={(value) => 
              setTypography({ 
                bodyFont: { ...typography.bodyFont, family: value, source: "google" } 
              })
            }
          />
        </div>

        {/* Base Font Size */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Base Font Size</Label>
            <span className="text-xs text-muted-foreground">
              {typography.baseFontSize}px
            </span>
          </div>
          <Slider
            value={[typography.baseFontSize]}
            onValueChange={([value]) => setTypography({ baseFontSize: value })}
            min={12}
            max={24}
            step={1}
            className="w-full"
          />
        </div>
      </div>

      <Separator />

      {/* Line Height */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Line Height</Label>
          <span className="text-xs text-muted-foreground">
            {typography.baseLineHeight}
          </span>
        </div>
        <Slider
          value={[typography.baseLineHeight * 10]}
          onValueChange={([value]) =>
            setTypography({ baseLineHeight: value / 10 })
          }
          min={10}
          max={25}
          step={1}
          className="w-full"
        />
      </div>
    </div>
  );
}

