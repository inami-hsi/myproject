"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Download, FileSpreadsheet, Loader2, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSearchStore } from "@/hooks/useSearch";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UserDownloadInfo {
  plan: "free" | "starter" | "pro";
  monthly_download_count: number;
  limit: number;
}

interface DownloadError {
  code: string;
  message: string;
  limit: number;
  used: number;
  requested: number;
  plan: string;
}

// ---------------------------------------------------------------------------
// Plan limits (mirrored from server for display only)
// ---------------------------------------------------------------------------

const PLAN_LIMITS: Record<string, number> = {
  free: 50,
  starter: 3000,
  pro: 30000,
};

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
};

// ---------------------------------------------------------------------------
// DownloadPanel
// ---------------------------------------------------------------------------

export function DownloadPanel() {
  const totalCount = useSearchStore((s) => s.totalCount);
  const filters = useSearchStore((s) => s.filters);

  const [isDownloading, setIsDownloading] = useState(false);
  const [userInfo, setUserInfo] = useState<UserDownloadInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch user download info on mount
  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const res = await fetch("/api/user/profile");
        if (!res.ok) return;
        const data = await res.json();
        if (data.plan) {
          setUserInfo({
            plan: data.plan,
            monthly_download_count: data.monthly_download_count ?? 0,
            limit: PLAN_LIMITS[data.plan] ?? 50,
          });
        }
      } catch {
        // Silently fail - panel will show without usage info
      }
    }
    fetchUserInfo();
  }, []);

  const handleDownload = useCallback(async () => {
    setIsDownloading(true);
    setError(null);

    try {
      const searchParams: Record<string, unknown> = {};
      if (filters.industries.length > 0) searchParams.industries = filters.industries;
      if (filters.prefectures.length > 0) searchParams.prefectures = filters.prefectures;
      if (filters.cities.length > 0) searchParams.cities = filters.cities;
      if (filters.capital_min !== undefined) searchParams.capital_min = filters.capital_min;
      if (filters.capital_max !== undefined) searchParams.capital_max = filters.capital_max;
      if (filters.employee_min !== undefined) searchParams.employee_min = filters.employee_min;
      if (filters.employee_max !== undefined) searchParams.employee_max = filters.employee_max;
      if (filters.keyword) searchParams.keyword = filters.keyword;
      if (filters.has_website !== undefined) searchParams.has_website = filters.has_website;
      if (filters.status) searchParams.status = filters.status;

      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          search_params: searchParams,
          format: "csv",
          encoding: "utf8",
          columns: [
            "name",
            "full_address",
            "representative_name",
            "capital",
            "employee_count",
            "website_url",
            "business_summary",
          ],
        }),
      });

      if (res.status === 403) {
        const data = await res.json();
        const err = data.error as DownloadError;
        setError(err.message);
        return;
      }

      if (res.status === 202) {
        const data = await res.json();
        setError(data.message ?? "非同期処理が必要です。");
        return;
      }

      if (!res.ok) {
        setError("ダウンロードに失敗しました。");
        return;
      }

      // Trigger file download from response body
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        res.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] ??
        "companies.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Update local usage info
      const recordCount = Number(res.headers.get("X-Record-Count") ?? 0);
      const remaining = Number(res.headers.get("X-Remaining-Downloads") ?? 0);
      if (userInfo) {
        setUserInfo({
          ...userInfo,
          monthly_download_count: userInfo.monthly_download_count + recordCount,
          limit: userInfo.limit,
        });
      }
      // Use remaining to suppress unused variable warning in strict mode
      void remaining;
    } catch {
      setError("ダウンロード中にエラーが発生しました。");
    } finally {
      setIsDownloading(false);
    }
  }, [filters, userInfo]);

  const used = userInfo?.monthly_download_count ?? 0;
  const limit = userInfo?.limit ?? 0;
  const usagePercent = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const isFree = userInfo?.plan === "free";
  const resultCount = totalCount ?? 0;

  return (
    <div className="sticky bottom-0 z-10 flex h-14 items-center gap-4 border-t bg-background px-4 sm:px-6">
      {/* Download buttons */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          onClick={handleDownload}
          disabled={isDownloading || resultCount === 0}
          size="sm"
          className="gap-2"
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          CSV
        </Button>

        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="gap-2"
                  aria-label="Excel ダウンロード（近日公開）"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              <p>Coming soon - Starter/Pro プラン向け</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Result count */}
      <span className="text-sm text-muted-foreground tabular-nums shrink-0">
        {resultCount.toLocaleString()}件
      </span>

      {/* Usage bar */}
      {userInfo && (
        <div className="hidden sm:flex items-center gap-3 flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0 flex-1 max-w-xs">
            <Progress
              value={used}
              max={limit}
              className="h-1.5 flex-1"
              indicatorClassName={usagePercent > 80 ? "bg-destructive" : undefined}
            />
            <span className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
              {used.toLocaleString()}/{limit.toLocaleString()}
            </span>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {PLAN_LABELS[userInfo.plan] ?? userInfo.plan}
          </span>
        </div>
      )}

      {/* Upgrade CTA for free users */}
      {isFree && (
        <Link
          href="/pricing"
          className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline whitespace-nowrap shrink-0"
        >
          {"\u30D7\u30E9\u30F3\u30A2\u30C3\u30D7\u30B0\u30EC\u30FC\u30C9"}
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      )}

      {/* Error message */}
      {error && (
        <p className="text-xs text-destructive truncate min-w-0" title={error}>
          {error}
        </p>
      )}
    </div>
  );
}
