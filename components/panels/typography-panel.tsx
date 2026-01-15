"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useDocumentStore } from "@/stores/document-store";

export function TypographyPanel() {
  const { typography, setTypography } = useDocumentStore();

  return (
    <div className="space-y-6 p-4">
      <div>
        <h3 className="text-sm font-semibold mb-4">Typography</h3>
        
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

      <Separator />

      {/* Letter Spacing */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Letter Spacing</Label>
          <span className="text-xs text-muted-foreground">
            {typography.letterSpacing}em
          </span>
        </div>
        <Slider
          value={[typography.letterSpacing * 100]}
          onValueChange={([value]) =>
            setTypography({ letterSpacing: value / 100 })
          }
          min={-5}
          max={20}
          step={1}
          className="w-full"
        />
      </div>

      <Separator />

      {/* Paragraph Spacing */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Paragraph Spacing</Label>
          <span className="text-xs text-muted-foreground">
            {typography.paragraphSpacing}em
          </span>
        </div>
        <Slider
          value={[typography.paragraphSpacing * 10]}
          onValueChange={([value]) =>
            setTypography({ paragraphSpacing: value / 10 })
          }
          min={5}
          max={30}
          step={1}
          className="w-full"
        />
      </div>

      <Separator />

      {/* Heading Sizes */}
      <div className="space-y-4">
        <Label className="text-xs font-semibold">Heading Sizes</Label>
        {(["h1", "h2", "h3", "h4", "h5", "h6"] as const).map((heading) => (
          <div key={heading} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs uppercase">{heading}</Label>
              <span className="text-xs text-muted-foreground">
                {typography.headingSizes[heading]}rem
              </span>
            </div>
            <Slider
              value={[typography.headingSizes[heading] * 10]}
              onValueChange={([value]) =>
                setTypography({
                  headingSizes: {
                    ...typography.headingSizes,
                    [heading]: value / 10,
                  },
                })
              }
              min={10}
              max={40}
              step={1}
              className="w-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
