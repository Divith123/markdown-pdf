"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import type { PageSize, PageOrientation } from "@/types/document";

export function PageSettingsPanel() {
  const { pageSettings, headerFooter, setPageSettings, setHeaderFooter } =
    useDocumentStore();

  return (
    <div className="space-y-6 p-4">
      <div>
        <h3 className="text-sm font-semibold mb-4">Page Settings</h3>

        {/* Page Size */}
        <div className="space-y-2">
          <Label className="text-xs">Page Size</Label>
          <Select
            value={pageSettings.size}
            onValueChange={(value: PageSize) =>
              setPageSettings({ size: value })
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a4">A4 (210 × 297 mm)</SelectItem>
              <SelectItem value="letter">Letter (8.5 × 11 in)</SelectItem>
              <SelectItem value="legal">Legal (8.5 × 14 in)</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Orientation */}
      <div className="space-y-2">
        <Label className="text-xs">Orientation</Label>
        <Select
          value={pageSettings.orientation}
          onValueChange={(value: PageOrientation) =>
            setPageSettings({ orientation: value })
          }
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="portrait">Portrait</SelectItem>
            <SelectItem value="landscape">Landscape</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Margins */}
      <div className="space-y-4">
        <Label className="text-xs font-semibold">Margins (pt)</Label>

        {(["top", "right", "bottom", "left"] as const).map((side) => (
          <div key={side} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs capitalize">{side}</Label>
              <span className="text-xs text-muted-foreground">
                {pageSettings.margins[side]}pt
              </span>
            </div>
            <Slider
              value={[pageSettings.margins[side]]}
              onValueChange={([value]) =>
                setPageSettings({
                  margins: { ...pageSettings.margins, [side]: value },
                })
              }
              min={18}
              max={144}
              step={1}
              className="w-full"
            />
          </div>
        ))}
      </div>

      <Separator />

      {/* Header & Footer */}
      <div className="space-y-4">
        <Label className="text-xs font-semibold">Header & Footer</Label>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showHeader"
            checked={headerFooter.showHeader}
            onChange={(e) =>
              setHeaderFooter({ showHeader: e.target.checked })
            }
            className="h-4 w-4 rounded border-gray-300"
            aria-label="Show Header"
          />
          <Label htmlFor="showHeader" className="text-xs">
            Show Header
          </Label>
        </div>

        {headerFooter.showHeader && (
          <Input
            value={headerFooter.headerContent}
            onChange={(e) =>
              setHeaderFooter({ headerContent: e.target.value })
            }
            placeholder="Header content..."
            className="h-8 text-xs"
            aria-label="Header content"
          />
        )}

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showFooter"
            checked={headerFooter.showFooter}
            onChange={(e) =>
              setHeaderFooter({ showFooter: e.target.checked })
            }
            className="h-4 w-4 rounded border-gray-300"
            aria-label="Show Footer"
          />
          <Label htmlFor="showFooter" className="text-xs">
            Show Footer
          </Label>
        </div>

        {headerFooter.showFooter && (
          <Input
            value={headerFooter.footerContent}
            onChange={(e) =>
              setHeaderFooter({ footerContent: e.target.value })
            }
            placeholder="Footer content..."
            className="h-8 text-xs"
            aria-label="Footer content"
          />
        )}

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showPageNumbers"
            checked={headerFooter.showPageNumbers}
            onChange={(e) =>
              setHeaderFooter({ showPageNumbers: e.target.checked })
            }
            className="h-4 w-4 rounded border-gray-300"
            aria-label="Show Page Numbers"
          />
          <Label htmlFor="showPageNumbers" className="text-xs">
            Show Page Numbers
          </Label>
        </div>

        {headerFooter.showPageNumbers && (
          <Select
            value={headerFooter.pageNumberPosition}
            onValueChange={(value: "left" | "center" | "right") =>
              setHeaderFooter({ pageNumberPosition: value })
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}
