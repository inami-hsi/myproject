"use client";

import { useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchStore } from "@/hooks/useSearch";
import { CompanyDetailModal } from "./CompanyDetailModal";
import type { CompanyResult } from "@/types/search";

// ============================================================
// Column definitions
// ============================================================

const columnHelper = createColumnHelper<CompanyResult>();

const columns = [
  columnHelper.accessor("name", {
    header: "企業名",
    cell: (info) => (
      <span className="font-heading font-medium">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor(
    (row) =>
      row.city_name
        ? `${row.prefecture_name} ${row.city_name}`
        : row.prefecture_name,
    {
      id: "location",
      header: "所在地",
      cell: (info) => (
        <span className="text-muted-foreground">{info.getValue()}</span>
      ),
    },
  ),
  columnHelper.accessor(
    (row) => row.industry_names.join(", "),
    {
      id: "industry",
      header: "業種",
      cell: (info) => (
        <span className="text-muted-foreground">{info.getValue() || "---"}</span>
      ),
    },
  ),
  columnHelper.accessor("capital", {
    header: "資本金",
    cell: (info) => {
      const val = info.getValue();
      if (val === null) return <span className="text-muted-foreground">---</span>;
      return (
        <span className="font-mono text-xs tabular-nums">
          {formatCapital(val)}
        </span>
      );
    },
  }),
  columnHelper.accessor("employee_count", {
    header: "従業員数",
    cell: (info) => {
      const val = info.getValue();
      if (val === null) return <span className="text-muted-foreground">---</span>;
      return (
        <span className="font-mono text-xs tabular-nums">
          {val.toLocaleString("ja-JP")}名
        </span>
      );
    },
  }),
];

// ============================================================
// Helpers
// ============================================================

function formatCapital(yen: number): string {
  if (yen >= 1_0000_0000) {
    return `${(yen / 1_0000_0000).toLocaleString("ja-JP", { maximumFractionDigits: 1 })}億円`;
  }
  if (yen >= 1_0000) {
    return `${(yen / 1_0000).toLocaleString("ja-JP", { maximumFractionDigits: 0 })}万円`;
  }
  return `${yen.toLocaleString("ja-JP")}円`;
}

// ============================================================
// Component
// ============================================================

export function CompanyTable() {
  const results = useSearchStore((s) => s.results);
  const isLoading = useSearchStore((s) => s.isLoadingResults);
  const isLoadingMore = useSearchStore((s) => s.isLoadingMore);
  const hasMore = useSearchStore((s) => s.hasMore);
  const loadMore = useSearchStore((s) => s.loadMore);

  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleRowClick = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setDetailOpen(true);
  };

  const data = useMemo(() => results, [results]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // --- Loading state ---
  if (isLoading) {
    return <TableSkeleton />;
  }

  // --- Empty state ---
  if (results.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Desktop: table */}
      <div className="hidden lg:block overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b bg-secondary/50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-2.5 text-left text-xs font-heading font-semibold text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="cursor-pointer border-b transition-colors duration-150 hover:bg-secondary/30 last:border-0"
                onClick={() => handleRowClick(row.original.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleRowClick(row.original.id);
                  }
                }}
                aria-label={`${row.original.name}の詳細を表示`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: card view */}
      <div className="flex flex-col gap-3 lg:hidden">
        {results.map((company) => (
          <CompanyCard
            key={company.id}
            company={company}
            onClick={() => handleRowClick(company.id)}
          />
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={isLoadingMore}
            className="gap-2"
          >
            {isLoadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoadingMore ? "読み込み中..." : "さらに表示"}
          </Button>
        </div>
      )}

      {/* Company detail modal */}
      <CompanyDetailModal
        companyId={selectedCompanyId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}

// ============================================================
// Mobile card
// ============================================================

function CompanyCard({
  company,
  onClick,
}: {
  company: CompanyResult;
  onClick?: () => void;
}) {
  const location = company.city_name
    ? `${company.prefecture_name} ${company.city_name}`
    : company.prefecture_name;

  return (
    <div
      className="cursor-pointer rounded-md border bg-card p-4 space-y-2 transition-colors duration-150 hover:bg-secondary/30"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`${company.name}の詳細を表示`}
    >
      <h4 className="font-heading font-semibold text-sm leading-tight">
        {company.name}
      </h4>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>{location}</span>
        {company.industry_names.length > 0 && (
          <span>{company.industry_names.join(", ")}</span>
        )}
      </div>
      <div className="flex gap-4 text-xs">
        {company.capital !== null && (
          <span className="font-mono tabular-nums">
            資本金: {formatCapital(company.capital)}
          </span>
        )}
        {company.employee_count !== null && (
          <span className="font-mono tabular-nums">
            従業員: {company.employee_count.toLocaleString("ja-JP")}名
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Skeleton
// ============================================================

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {/* Table header skeleton */}
      <div className="hidden lg:block overflow-hidden rounded-md border">
        <div className="flex gap-4 border-b bg-secondary/50 px-4 py-2.5">
          {[120, 80, 100, 60, 60].map((w, i) => (
            <div
              key={i}
              className="h-3 animate-pulse rounded bg-muted"
              style={{ width: `${w}px` }}
            />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 border-b px-4 py-3 last:border-0"
          >
            {[140, 90, 110, 70, 50].map((w, j) => (
              <div
                key={j}
                className="h-3 animate-pulse rounded bg-muted"
                style={{ width: `${w + (i % 2) * 20}px` }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Mobile card skeleton */}
      <div className="flex flex-col gap-3 lg:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2 rounded-md border p-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
            <div className="flex gap-4">
              <div className="h-3 w-20 animate-pulse rounded bg-muted" />
              <div className="h-3 w-16 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Empty state
// ============================================================

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
        <Building2 className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h3 className="font-heading font-semibold text-foreground">
          企業が見つかりません
        </h3>
        <p className="text-sm text-muted-foreground">
          フィルターの条件を変更して再度検索してください。
        </p>
      </div>
    </div>
  );
}
