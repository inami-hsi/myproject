"use client";

import { useState } from "react";
import { Check, Copy, Link2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useSearchStore } from "@/hooks/useSearch";

export function ShareButton() {
  const filters = useSearchStore((s) => s.filters);

  const [open, setOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateLink = async () => {
    setIsLoading(true);
    setError(null);
    setCopied(false);

    try {
      const res = await fetch("/api/search/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate share link");
      }

      const data = await res.json();
      setShareUrl(data.url);
    } catch {
      setError("共有リンクの生成に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("コピーに失敗しました");
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      handleGenerateLink();
    } else {
      // Reset state when closing
      setShareUrl(null);
      setCopied(false);
      setError(null);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Link2 className="h-4 w-4" />
          共有
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-3">
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-foreground">
              検索条件を共有
            </h4>
            <p className="text-xs text-muted-foreground">
              このリンクを共有すると、同じ検索条件で検索できます。
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : shareUrl ? (
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={shareUrl}
                className="text-xs"
                aria-label="共有リンク"
              />
              <Button
                variant="outline"
                size="icon"
                className="flex-shrink-0"
                onClick={handleCopy}
                aria-label={copied ? "コピーしました" : "リンクをコピー"}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-sage" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
