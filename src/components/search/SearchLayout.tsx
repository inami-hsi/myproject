"use client";

import { useCallback, useEffect, useState } from "react";
import { Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useSearchStore } from "@/hooks/useSearch";
import { LiveCounter } from "./LiveCounter";
import { FilterChipBar } from "./FilterChipBar";
import { IndustryTree } from "./IndustryTree";
import { RegionCascader } from "./RegionCascader";
import { CompanyTable } from "./CompanyTable";
import { DownloadPanel } from "./DownloadPanel";

export function SearchLayout() {
  const keyword = useSearchStore((s) => s.filters.keyword);
  const setKeyword = useSearchStore((s) => s.setKeyword);
  const fetchResults = useSearchStore((s) => s.fetchResults);
  const fetchCount = useSearchStore((s) => s.fetchCount);
  const industries = useSearchStore((s) => s.filters.industries);
  const prefectures = useSearchStore((s) => s.filters.prefectures);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Initial load
  useEffect(() => {
    fetchCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-search when filters change
  useEffect(() => {
    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [industries, prefectures, keyword]);

  const handleKeywordSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      fetchResults();
    },
    [fetchResults],
  );

  const activeFilterCount = industries.length + prefectures.length;

  return (
    <div className="flex h-full flex-col gap-6">
      {/* Top bar: keyword + counter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            企業リスト
          </h1>
          <LiveCounter />
        </div>

        <form
          onSubmit={handleKeywordSubmit}
          className="flex w-full max-w-sm items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="キーワード検索..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-9"
              aria-label="キーワード検索"
            />
          </div>
          <Button type="submit" size="default">
            検索
          </Button>
        </form>
      </div>

      {/* Filter chips */}
      <FilterChipBar />

      {/* Main grid */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        {/* Desktop sidebar */}
        <aside className="hidden space-y-6 lg:block">
          <FilterPanel />
        </aside>

        {/* Mobile filter trigger */}
        <div className="lg:hidden">
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                フィルター
                {activeFilterCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-terracotta text-[10px] font-bold text-white tabular-nums">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] overflow-y-auto sm:w-[340px]">
              <SheetHeader>
                <SheetTitle>フィルター</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <FilterPanel />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Results */}
        <main className="min-w-0">
          <CompanyTable />
        </main>
      </div>

      {/* Download bar */}
      <DownloadPanel />
    </div>
  );
}

// ============================================================
// Shared filter panel (used in sidebar + mobile sheet)
// ============================================================

function FilterPanel() {
  return (
    <div className="space-y-6">
      <IndustryTree />
      <div className="border-t" />
      <RegionCascader />
    </div>
  );
}
