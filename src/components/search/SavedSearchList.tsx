"use client";

import { useCallback, useEffect, useState } from "react";
import { BookmarkX, FolderSearch, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchStore } from "@/hooks/useSearch";
import type { SearchFilters } from "@/types/search";
import { DEFAULT_FILTERS } from "@/types/search";

// ============================================================
// Types
// ============================================================

interface SavedSearch {
  id: string;
  name: string;
  search_params: Partial<SearchFilters>;
  result_count: number | null;
  created_at: string;
}

// ============================================================
// Component
// ============================================================

export function SavedSearchList() {
  const setIndustries = useSearchStore((s) => s.setIndustries);
  const setPrefectures = useSearchStore((s) => s.setPrefectures);
  const setKeyword = useSearchStore((s) => s.setKeyword);
  const fetchResults = useSearchStore((s) => s.fetchResults);

  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch saved searches
  const fetchSearches = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/saved-searches");
      if (!res.ok) return;
      const data = await res.json();
      setSearches(data.saved_searches ?? []);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSearches();
  }, [fetchSearches]);

  // Load a saved search into the search store
  const handleLoad = useCallback(
    (search: SavedSearch) => {
      const params = search.search_params;

      // Apply filters from saved search, defaulting to empty
      setIndustries(params.industries ?? DEFAULT_FILTERS.industries);
      setPrefectures(params.prefectures ?? DEFAULT_FILTERS.prefectures);
      setKeyword(params.keyword ?? DEFAULT_FILTERS.keyword);

      // Trigger search
      // Small delay to let zustand state propagate
      setTimeout(() => {
        fetchResults();
      }, 50);
    },
    [setIndustries, setPrefectures, setKeyword, fetchResults],
  );

  // Delete a saved search
  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      try {
        const res = await fetch(`/api/saved-searches/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setSearches((prev) => prev.filter((s) => s.id !== id));
        }
      } catch {
        // silently fail
      } finally {
        setDeletingId(null);
      }
    },
    [],
  );

  // --- Loading state ---
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // --- Empty state ---
  if (searches.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <BookmarkX className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          保存された検索条件はありません
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        保存した検索
      </h3>
      <ul className="space-y-1" role="list">
        {searches.map((search) => (
          <li key={search.id}>
            <div className="group flex items-center gap-1 rounded-md transition-colors duration-150 hover:bg-secondary/50">
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5 text-left"
                onClick={() => handleLoad(search)}
                aria-label={`検索条件「${search.name}」を読み込む`}
              >
                <FolderSearch className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {search.name}
                  </p>
                  {search.result_count !== null && (
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {search.result_count.toLocaleString("ja-JP")}件
                    </p>
                  )}
                </div>
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 flex-shrink-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(search.id);
                }}
                disabled={deletingId === search.id}
                aria-label={`検索条件「${search.name}」を削除`}
              >
                {deletingId === search.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
