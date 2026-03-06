"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSearchStore } from "@/hooks/useSearch";
import type { RegionGroup } from "@/types/search";

export function RegionCascader() {
  const [regions, setRegions] = useState<RegionGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const selectedPrefectures = useSearchStore((s) => s.filters.prefectures);
  const setPrefectures = useSearchStore((s) => s.setPrefectures);
  const togglePrefecture = useSearchStore((s) => s.togglePrefecture);

  // Fetch region data
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    fetch("/api/regions")
      .then((res) => res.json())
      .then((data: RegionGroup[]) => {
        if (!cancelled) {
          setRegions(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedCount = selectedPrefectures.length;

  // Bulk-select / deselect all prefectures in a region
  const toggleRegion = (region: RegionGroup) => {
    const codes = region.prefectures.map((p) => p.code);
    const allSelected = codes.every((c) => selectedPrefectures.includes(c));

    if (allSelected) {
      setPrefectures(selectedPrefectures.filter((c) => !codes.includes(c)));
    } else {
      const merged = new Set([...selectedPrefectures, ...codes]);
      setPrefectures(Array.from(merged));
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-heading font-semibold text-foreground">
          地域
        </h3>
        {selectedCount > 0 && (
          <Badge variant="secondary" className="text-[10px] tabular-nums">
            {selectedCount}
          </Badge>
        )}
      </div>

      <ScrollArea className="h-[280px]">
        {isLoading ? (
          <RegionSkeleton />
        ) : (
          <div className="space-y-3 pr-2">
            {regions.map((region) => {
              const codes = region.prefectures.map((p) => p.code);
              const selectedInRegion = codes.filter((c) =>
                selectedPrefectures.includes(c),
              ).length;
              const allSelected =
                codes.length > 0 && selectedInRegion === codes.length;

              return (
                <div key={region.name} className="space-y-1">
                  {/* Region header button */}
                  <button
                    type="button"
                    onClick={() => toggleRegion(region)}
                    className={cn(
                      "w-full rounded-md px-2 py-1 text-left text-xs font-heading font-semibold transition-colors duration-150",
                      allSelected
                        ? "bg-sage/10 text-sage"
                        : selectedInRegion > 0
                          ? "bg-secondary text-foreground"
                          : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    <span className="flex items-center justify-between">
                      {region.name}
                      {selectedInRegion > 0 && (
                        <span className="text-[10px] tabular-nums">
                          {selectedInRegion}/{codes.length}
                        </span>
                      )}
                    </span>
                  </button>

                  {/* Prefecture checkboxes */}
                  <div className="flex flex-wrap gap-x-1 gap-y-0.5 pl-1">
                    {region.prefectures.map((pref) => {
                      const isChecked = selectedPrefectures.includes(pref.code);
                      return (
                        <label
                          key={pref.code}
                          className={cn(
                            "flex cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 text-xs transition-colors duration-150",
                            isChecked
                              ? "bg-sage/10 text-sage"
                              : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePrefecture(pref.code)}
                            className="h-3 w-3 shrink-0 rounded border-border accent-sage"
                          />
                          {pref.name}
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

// ============================================================
// Skeleton
// ============================================================

function RegionSkeleton() {
  return (
    <div className="space-y-3 pr-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-1">
          <div className="h-6 w-16 animate-pulse rounded bg-muted" />
          <div className="flex flex-wrap gap-1 pl-1">
            {Array.from({ length: 4 + (i % 3) }).map((_, j) => (
              <div
                key={j}
                className="h-5 animate-pulse rounded bg-muted"
                style={{ width: `${36 + (j % 2) * 12}px` }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
