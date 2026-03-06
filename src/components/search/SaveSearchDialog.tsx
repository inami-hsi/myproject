"use client";

import { useState } from "react";
import { Bookmark, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSearchStore } from "@/hooks/useSearch";

// ============================================================
// Helpers
// ============================================================

function buildFilterSummary(filters: {
  industries: string[];
  prefectures: string[];
  keyword: string;
}): string {
  const parts: string[] = [];

  if (filters.keyword) {
    parts.push(`"${filters.keyword}"`);
  }
  if (filters.industries.length > 0) {
    parts.push(`業種: ${filters.industries.length}件`);
  }
  if (filters.prefectures.length > 0) {
    parts.push(`地域: ${filters.prefectures.length}件`);
  }

  return parts.length > 0 ? parts.join(" / ") : "フィルターなし";
}

// ============================================================
// Component
// ============================================================

export function SaveSearchDialog() {
  const filters = useSearchStore((s) => s.filters);
  const totalCount = useSearchStore((s) => s.totalCount);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filterSummary = buildFilterSummary(filters);

  const handleSave = async () => {
    if (!name.trim()) return;

    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/saved-searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          search_params: {
            industries: filters.industries.length > 0 ? filters.industries : undefined,
            prefectures: filters.prefectures.length > 0 ? filters.prefectures : undefined,
            cities: filters.cities.length > 0 ? filters.cities : undefined,
            capital_min: filters.capital_min,
            capital_max: filters.capital_max,
            employee_min: filters.employee_min,
            employee_max: filters.employee_max,
            keyword: filters.keyword || undefined,
            has_website: filters.has_website,
            status: filters.status,
            sort_by: filters.sort_by,
            sort_order: filters.sort_order,
          },
          result_count: totalCount,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        const message =
          typeof data.error === "object" && data.error.message
            ? data.error.message
            : typeof data.error === "string"
              ? data.error
              : "保存に失敗しました";
        setError(message);
        return;
      }

      // Success
      setName("");
      setOpen(false);
    } catch {
      setError("保存に失敗しました。もう一度お試しください。");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Bookmark className="h-4 w-4" />
          検索を保存
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>検索条件を保存</DialogTitle>
          <DialogDescription>
            現在の検索条件に名前を付けて保存します。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name input */}
          <div className="space-y-2">
            <label
              htmlFor="saved-search-name"
              className="text-sm font-medium text-foreground"
            >
              名前
            </label>
            <Input
              id="saved-search-name"
              placeholder="例: 東京都のIT企業"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && name.trim()) {
                  handleSave();
                }
              }}
              aria-label="保存検索の名前"
            />
          </div>

          {/* Filter summary */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              現在のフィルター
            </p>
            <p className="rounded-md bg-secondary/50 px-3 py-2 text-sm text-foreground">
              {filterSummary}
            </p>
            {totalCount !== null && (
              <p className="text-xs text-muted-foreground">
                約 {totalCount.toLocaleString("ja-JP")} 件の結果
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSaving}
          >
            キャンセル
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || isSaving}
            className="gap-2"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
