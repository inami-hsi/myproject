"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSearchStore } from "@/hooks/useSearch";
import type { IndustryNode } from "@/types/search";

export function IndustryTree() {
  const [nodes, setNodes] = useState<IndustryNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");

  const selectedIndustries = useSearchStore((s) => s.filters.industries);
  const toggleIndustry = useSearchStore((s) => s.toggleIndustry);
  const setIndustries = useSearchStore((s) => s.setIndustries);

  // Fetch industry tree
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    fetch("/api/industries")
      .then((res) => res.json())
      .then((data: { industries?: IndustryNode[] }) => {
        if (!cancelled) {
          setNodes(data.industries ?? []);
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

  // Filter nodes by search query
  const filteredNodes = useMemo(() => {
    if (!query.trim()) return nodes;
    const q = query.toLowerCase();
    return nodes
      .map((major) => {
        const matchesMajor = major.name.toLowerCase().includes(q);
        const matchingChildren = (major.children ?? []).filter((child) =>
          child.name.toLowerCase().includes(q),
        );
        if (matchesMajor) return major;
        if (matchingChildren.length > 0) {
          return { ...major, children: matchingChildren };
        }
        return null;
      })
      .filter((n): n is IndustryNode => n !== null);
  }, [nodes, query]);

  const selectedCount = selectedIndustries.length;

  // Parent toggle: select / deselect all children
  const toggleMajor = useCallback(
    (major: IndustryNode) => {
      const childCodes = (major.children ?? []).map((c) => c.code);
      const allSelected = childCodes.every((c) => selectedIndustries.includes(c));

      if (allSelected) {
        // Deselect all children
        setIndustries(selectedIndustries.filter((c) => !childCodes.includes(c)));
      } else {
        // Select all children
        const merged = new Set([...selectedIndustries, ...childCodes]);
        setIndustries(Array.from(merged));
      }
    },
    [selectedIndustries, setIndustries],
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-heading font-semibold text-foreground">
          業種
        </h3>
        {selectedCount > 0 && (
          <Badge variant="secondary" className="text-[10px] tabular-nums">
            {selectedCount}
          </Badge>
        )}
      </div>

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="業種を検索..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-8 pl-8 text-xs"
          aria-label="業種を検索"
        />
      </div>

      {/* Tree */}
      <ScrollArea className="h-[280px]">
        {isLoading ? (
          <TreeSkeleton />
        ) : filteredNodes.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">
            該当する業種がありません
          </p>
        ) : (
          <ul role="tree" aria-label="業種ツリー" className="space-y-0.5 pr-2">
            {filteredNodes.map((major) => (
              <MajorItem
                key={major.code}
                node={major}
                selectedCodes={selectedIndustries}
                onToggleMajor={toggleMajor}
                onToggleChild={toggleIndustry}
              />
            ))}
          </ul>
        )}
      </ScrollArea>
    </div>
  );
}

// ============================================================
// Major category item (expandable)
// ============================================================

function MajorItem({
  node,
  selectedCodes,
  onToggleMajor,
  onToggleChild,
}: {
  node: IndustryNode;
  selectedCodes: string[];
  onToggleMajor: (node: IndustryNode) => void;
  onToggleChild: (code: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const children = node.children ?? [];
  const selectedChildCount = children.filter((c) =>
    selectedCodes.includes(c.code),
  ).length;
  const allSelected = children.length > 0 && selectedChildCount === children.length;
  const someSelected = selectedChildCount > 0 && !allSelected;

  return (
    <li role="treeitem" aria-expanded={expanded} aria-selected={allSelected}>
      <div className="flex items-center gap-1.5 rounded-md px-1 py-1 transition-colors duration-150 hover:bg-secondary">
        {/* Expand toggle */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded transition-transform duration-150"
          aria-label={expanded ? "折りたたむ" : "展開する"}
        >
          <ChevronRight
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground transition-transform duration-150",
              expanded && "rotate-90",
            )}
          />
        </button>

        {/* Checkbox */}
        <label className="flex flex-1 cursor-pointer items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = someSelected;
            }}
            onChange={() => onToggleMajor(node)}
            className="h-3.5 w-3.5 shrink-0 rounded border-border accent-terracotta"
          />
          <span className="font-heading font-medium leading-tight">
            {node.code} {node.name}
          </span>
          {selectedChildCount > 0 && (
            <span className="ml-auto shrink-0 text-[10px] tabular-nums text-muted-foreground">
              {selectedChildCount}/{children.length}
            </span>
          )}
        </label>
      </div>

      {/* Children */}
      {expanded && children.length > 0 && (
        <ul role="group" className="ml-6 space-y-0.5 border-l border-border pl-2">
          {children.map((child) => (
            <li key={child.code} role="treeitem" aria-selected={selectedCodes.includes(child.code)}>
              <label className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 text-xs transition-colors duration-150 hover:bg-secondary">
                <input
                  type="checkbox"
                  checked={selectedCodes.includes(child.code)}
                  onChange={() => onToggleChild(child.code)}
                  className="h-3.5 w-3.5 shrink-0 rounded border-border accent-terracotta"
                />
                <span className="leading-tight">
                  {child.code} {child.name}
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

// ============================================================
// Skeleton
// ============================================================

function TreeSkeleton() {
  return (
    <div className="space-y-2 pr-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 px-1 py-1">
          <div className="h-3.5 w-3.5 animate-pulse rounded bg-muted" />
          <div
            className="h-3 animate-pulse rounded bg-muted"
            style={{ width: `${60 + (i % 3) * 20}%` }}
          />
        </div>
      ))}
    </div>
  );
}
