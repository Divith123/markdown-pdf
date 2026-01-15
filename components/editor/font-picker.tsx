"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { popularGoogleFonts } from "@/lib/google-fonts";
import { loadGoogleFont } from "@/stores/font-store";

interface FontPickerProps {
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
}

export function FontPicker({ value, onValueChange, label }: FontPickerProps) {
  const [open, setOpen] = React.useState(false);

  // Load the initial font if it's a google font
  React.useEffect(() => {
    if (value && popularGoogleFonts.includes(value)) {
      loadGoogleFont(value);
    }
  }, [value]);

  const handleSelect = (currentValue: string) => {
    // If the font is a Google font, load it
    if (popularGoogleFonts.includes(currentValue)) {
      loadGoogleFont(currentValue);
    }
    
    onValueChange(currentValue);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-xs font-medium">{label}</span>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            <span style={{ fontFamily: value }}>{value || "Select font..."}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="Search font..." />
            <CommandList>
              <CommandEmpty>No font found.</CommandEmpty>
              <CommandGroup>
                {popularGoogleFonts.map((font) => (
                  <CommandItem
                    key={font}
                    value={font}
                    onSelect={handleSelect}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === font ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span style={{ fontFamily: font }}>{font}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
