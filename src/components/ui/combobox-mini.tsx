"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandInput } from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LuCheck, LuDot } from "react-icons/lu";
import { useDebouncedCallback } from "use-debounce";

interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  allOptions: ComboboxOption[];
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  onSearch: (value: string) => void;
  isFetching?: boolean;
}

export function ComboboxMini({
  allOptions,
  options,
  value,
  onChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyText = "No option found.",
  disabled,
  className,
  onSearch,
  isFetching,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [contentWidth, setContentWidth] = React.useState<string>("auto");
  const [search, setSearch] = React.useState<string>("");
  const [highlightedIndex, setHighlightedIndex] = React.useState<number>(-1);
  const debouncedSearch = useDebouncedCallback((value: string) => {
    onSearch(value);
  }, 300);

  // Reset highlighted index when options change
  React.useEffect(() => {
    setHighlightedIndex(-1);
  }, [options]);

  React.useEffect(() => {
    if (open && triggerRef.current) {
      const width = triggerRef.current.offsetWidth;
      setContentWidth(`${width}px`);
    }
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (options.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < options.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          const selectedOption = options[highlightedIndex];
          if (selectedOption) {
            onChange(selectedOption.value);
            setOpen(false);
          }
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between overflow-hidden", className)}
          disabled={disabled}
        >
          <p className="text-ellipsis line-clamp-1">
            {value
              ? allOptions.find((option) => option.value === value)?.label
              : placeholder}
          </p>
          <ChevronDown
            className={cn(
              "ml-2 h-4 w-4 shrink-0 opacity-50 duration-200",
              open && "-rotate-180",
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 z-[64]" style={{ width: contentWidth }}>
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={(e) => {
              setSearch(e);
              setHighlightedIndex(-1);
            }}
            onKeyUp={(e) => {
              debouncedSearch(e.currentTarget.value);
            }}
            onKeyDown={handleKeyDown}
          />
          <div className="flex flex-col gap-1 h-[150px] md:h-[200px] overflow-auto p-1 text-sm font-medium text-neutral-700">
            {isFetching ? (
              <p className="text-center p-2">Loading...</p>
            ) : options.length == 0 ? (
              <p className="text-center p-2">{emptyText}</p>
            ) : (
              options.map((d, idx) => (
                <div
                  key={d.value}
                  className={cn(
                    "cursor-pointer rounded-sm px-2 py-1 flex items-center justify-between gap-1",
                    d.value === value &&
                      "font-semibold bg-primary/10 text-black",
                    idx === highlightedIndex && "bg-primary/10 text-black",
                  )}
                  onClick={() => {
                    onChange(d.value);
                    setOpen(false);
                  }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  onMouseLeave={() => setHighlightedIndex(-1)}
                >
                  <div className="flex items-center gap-2">
                    <LuDot className="shrink-0" />
                    <p className="text-sm">{d.label}</p>
                  </div>
                  {d.value === value && <LuCheck className="shrink-0" />}
                </div>
              ))
            )}
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
