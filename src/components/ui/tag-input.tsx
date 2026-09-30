"use client";

import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function TagInput({
  value,
  onChange,
  placeholder = "Ketik lalu tekan Enter",
  className,
}: TagInputProps) {
  const [text, setText] = React.useState("");

  const addTags = (raw: string) => {
    const tags = raw
      .split(/[,]/)
      .map((t) => t.trim())
      .filter((t) => t && !value.includes(t));
    if (!tags.length) return;
    onChange([...value, ...tags]);
    setText("");
  };

  return (
    <div
      className={cn(
        "border-input dark:bg-input/30 flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border bg-transparent px-2 py-1",
        className,
      )}
    >
      {value.map((tag) => (
        <Badge key={tag} variant="secondary">
          {tag}
          <button
            type="button"
            aria-label={`Hapus tag ${tag}`}
            onClick={() => onChange(value.filter((t) => t !== tag))}
            className="ml-1 hover:text-destructive"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTags(text);
          } else if (e.key === "Backspace" && !text && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={() => addTags(text)}
        placeholder={value.length ? "" : placeholder}
        className="h-7 flex-1 min-w-[120px] border-0 bg-transparent shadow-none focus-visible:ring-0"
      />
    </div>
  );
}
