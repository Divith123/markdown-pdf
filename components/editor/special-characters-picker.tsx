"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEditorStore } from "@/stores/editor-store";
import { Hash, Search } from "lucide-react";
import { cn } from "@/lib/utils";

// Special character categories
const characterCategories = {
  currency: {
    name: "Currency",
    chars: ["$", "€", "£", "¥", "¢", "₹", "₽", "₿", "₩", "₱", "฿", "₫", "₴", "₦", "₲"],
  },
  math: {
    name: "Math",
    chars: [
      "±", "×", "÷", "=", "≠", "≈", "≡", "≤", "≥", "<", ">",
      "∞", "∑", "∏", "∫", "∂", "√", "∛", "∜", "∝", "∴",
      "∵", "∈", "∉", "∋", "∅", "∩", "∪", "⊂", "⊃", "⊆",
      "⊇", "⊕", "⊗", "⊥", "∠", "∟", "°", "′", "″", "‰",
      "π", "φ", "θ", "λ", "μ", "σ", "Σ", "Δ", "Ω", "α",
      "β", "γ", "δ", "ε", "ζ", "η", "ι", "κ", "ν", "ξ",
    ],
  },
  arrows: {
    name: "Arrows",
    chars: [
      "←", "→", "↑", "↓", "↔", "↕", "↖", "↗", "↘", "↙",
      "⇐", "⇒", "⇑", "⇓", "⇔", "⇕", "⇖", "⇗", "⇘", "⇙",
      "↩", "↪", "↰", "↱", "↲", "↳", "↴", "↵", "↶", "↷",
      "⟵", "⟶", "⟷", "⟸", "⟹", "⟺", "➔", "➜", "➝", "➞",
      "➟", "➠", "➡", "➢", "➣", "➤", "➥", "➦", "➧", "➨",
    ],
  },
  punctuation: {
    name: "Punctuation",
    chars: [
      "\u2013", "\u2014", "\u2015", "\u2016", "\u2026", "\u00B7", "\u2022", "\u2023", "\u2043", "\u25E6",
      "\u300C", "\u300D", "\u300E", "\u300F", "\u3010", "\u3011", "\u3016", "\u3017", "\u3018", "\u3019",
      "\u2039", "\u203A", "\u00AB", "\u00BB", "\u201C", "\u201D", "\u2018", "\u2019", "\u201E", "\u201A",
      "\u2020", "\u2021", "\u00A7", "\u00B6", "\u203B", "\u2042", "\u261E", "\u261C", "\u261B", "\u261A",
    ],
  },
  typography: {
    name: "Typography",
    chars: [
      "©", "®", "™", "℠", "℗", "№", "℃", "℉", "Å", "Ω",
      "℮", "⅛", "¼", "⅜", "½", "⅝", "¾", "⅞", "⅓", "⅔",
      "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹", "⁰",
      "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉", "₀",
    ],
  },
  shapes: {
    name: "Shapes",
    chars: [
      "■", "□", "▢", "▣", "▤", "▥", "▦", "▧", "▨", "▩",
      "▪", "▫", "▬", "▭", "▮", "▯", "▰", "▱", "▲", "△",
      "▴", "▵", "▶", "▷", "▸", "▹", "►", "▻", "▼", "▽",
      "▾", "▿", "◀", "◁", "◂", "◃", "◄", "◅", "◆", "◇",
      "◈", "◉", "◊", "○", "◌", "◍", "◎", "●", "◐", "◑",
      "◒", "◓", "◔", "◕", "◖", "◗", "★", "☆", "✦", "✧",
    ],
  },
  misc: {
    name: "Miscellaneous",
    chars: [
      "✓", "✔", "✕", "✖", "✗", "✘", "♠", "♣", "♥", "♦",
      "♤", "♧", "♡", "♢", "☀", "☁", "☂", "☃", "☄", "★",
      "☆", "☎", "☏", "✉", "☑", "☒", "☐", "☮", "☯", "☪",
      "☭", "☢", "☣", "⚛", "⚠", "⚡", "⚪", "⚫", "⚬", "⚭",
      "♩", "♪", "♫", "♬", "♭", "♮", "♯", "⌘", "⌥", "⇧",
      "⌃", "⎋", "⏎", "⌫", "⌦", "⇥", "⇤", "↹", "⇪", "⏏",
    ],
  },
};

type CharCategory = keyof typeof characterCategories;

interface SpecialCharactersPickerProps {
  onCharacterSelect?: (char: string) => void;
  trigger?: React.ReactNode;
}

export function SpecialCharactersPicker({ onCharacterSelect, trigger }: SpecialCharactersPickerProps) {
  const { editor } = useEditorStore();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<CharCategory>("currency");

  const filteredChars = useMemo(() => {
    if (!search) {
      return characterCategories[activeCategory].chars;
    }

    // Search across all categories
    const allChars = Object.values(characterCategories).flatMap((cat) => cat.chars);
    return allChars;
  }, [search, activeCategory]);

  const handleCharClick = useCallback((char: string) => {
    if (onCharacterSelect) {
      onCharacterSelect(char);
    } else if (editor) {
      editor.chain().focus().insertContent(char).run();
    }
    setOpen(false);
    setSearch("");
  }, [editor, onCharacterSelect]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Hash className="h-4 w-4" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search characters..."
              className="pl-8 h-8"
            />
          </div>
        </div>

        {!search && (
          <ScrollArea className="w-full">
            <div className="flex border-b p-1 gap-1">
              {(Object.keys(characterCategories) as CharCategory[]).map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    "px-2 py-1 text-xs rounded hover:bg-muted transition-colors whitespace-nowrap",
                    activeCategory === category && "bg-muted font-medium"
                  )}
                >
                  {characterCategories[category].name}
                </button>
              ))}
            </div>
          </ScrollArea>
        )}

        <ScrollArea className="h-48">
          <div className="p-2">
            <div className="grid grid-cols-10 gap-1">
              {filteredChars.map((char, index) => (
                <button
                  key={`${char}-${index}`}
                  onClick={() => handleCharClick(char)}
                  className="w-7 h-7 flex items-center justify-center text-base hover:bg-muted rounded transition-colors font-mono"
                  title={`Insert ${char}`}
                >
                  {char}
                </button>
              ))}
            </div>
          </div>
        </ScrollArea>

        <div className="p-2 border-t text-xs text-muted-foreground">
          Click a character to insert
        </div>
      </PopoverContent>
    </Popover>
  );
}
