"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useSearchStore } from "@/hooks/useSearch";

export function LiveCounter() {
  const totalCount = useSearchStore((s) => s.totalCount);
  const isLoading = useSearchStore((s) => s.isLoadingCount);

  const [displayCount, setDisplayCount] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevCountRef = useRef<number | null>(null);

  useEffect(() => {
    if (totalCount === null) {
      setDisplayCount(null);
      return;
    }

    if (prevCountRef.current !== totalCount) {
      setIsAnimating(true);
      // Brief pause to let CSS transition the exit state
      const timer = setTimeout(() => {
        setDisplayCount(totalCount);
        prevCountRef.current = totalCount;
        setIsAnimating(false);
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [totalCount]);

  const formatted =
    displayCount !== null
      ? displayCount.toLocaleString("ja-JP")
      : "---";

  return (
    <div className="flex items-baseline gap-2" aria-live="polite">
      <span className="text-sm text-muted-foreground select-none">約</span>
      <span
        className={cn(
          "font-mono font-bold text-3xl tabular-nums transition-all duration-150",
          isAnimating
            ? "opacity-0 translate-y-1"
            : "opacity-100 translate-y-0",
          isLoading && "opacity-50",
        )}
      >
        {formatted}
      </span>
      <span className="text-sm text-muted-foreground select-none">社</span>
    </div>
  );
}
