"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchStore, useFilterChips } from "@/hooks/useSearch";
import type { FilterCategory, FilterChip } from "@/types/search";

const categoryStyles: Record<FilterCategory, string> = {
  industry: "bg-terracotta/10 text-terracotta border-terracotta/20",
  region: "bg-sage/10 text-sage border-sage/20",
  other: "bg-lavender/10 text-lavender border-lavender/20",
};

export function FilterChipBar() {
  const chips = useFilterChips();
  const removeFilter = useSearchStore((s) => s.removeFilter);
  const clearAllFilters = useSearchStore((s) => s.clearAllFilters);

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2" role="list" aria-label="適用中のフィルター">
      {chips.map((chip) => (
        <Chip key={`${chip.category}-${chip.id}`} chip={chip} onRemove={removeFilter} />
      ))}

      {chips.length > 2 && (
        <button
          type="button"
          onClick={clearAllFilters}
          className="text-xs text-muted-foreground underline underline-offset-2 transition-colors duration-150 hover:text-foreground"
        >
          すべてクリア
        </button>
      )}
    </div>
  );
}

function Chip({
  chip,
  onRemove,
}: {
  chip: FilterChip;
  onRemove: (chip: FilterChip) => void;
}) {
  return (
    <span
      role="listitem"
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-heading font-medium transition-colors duration-150",
        categoryStyles[chip.category],
      )}
    >
      {chip.label}
      <button
        type="button"
        onClick={() => onRemove(chip)}
        className="ml-0.5 rounded-full p-0.5 transition-opacity duration-150 hover:opacity-70"
        aria-label={`${chip.label} を解除`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
