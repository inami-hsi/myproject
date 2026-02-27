"use client";

import { useUIStore } from "@/stores/uiStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { TaskStatus, Priority } from "@/types";
import {
  cn,
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
} from "@/lib/utils";

const STATUS_OPTIONS: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE", "ON_HOLD"];
const PRIORITY_OPTIONS: Priority[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

export function TaskFilters() {
  const {
    filterStatus,
    filterPriority,
    setFilterStatus,
    setFilterPriority,
  } = useUIStore();

  const activeCount = filterStatus.length + filterPriority.length;

  const toggleStatus = (status: string) => {
    if (filterStatus.includes(status)) {
      setFilterStatus(filterStatus.filter((s) => s !== status));
    } else {
      setFilterStatus([...filterStatus, status]);
    }
  };

  const togglePriority = (priority: string) => {
    if (filterPriority.includes(priority)) {
      setFilterPriority(filterPriority.filter((p) => p !== priority));
    } else {
      setFilterPriority([...filterPriority, priority]);
    }
  };

  const clearAll = () => {
    setFilterStatus([]);
    setFilterPriority([]);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Status filters */}
      <span className="text-xs text-muted-foreground shrink-0">
        ステータス:
      </span>
      <div className="flex flex-wrap gap-1">
        {STATUS_OPTIONS.map((status) => {
          const isActive = filterStatus.includes(status);
          return (
            <button
              key={status}
              onClick={() => toggleStatus(status)}
              aria-label={`Filter by ${STATUS_LABELS[status]}`}
              aria-pressed={isActive}
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-normal transition-all duration-200",
                isActive
                  ? STATUS_COLORS[status]
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              {STATUS_LABELS[status]}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="h-4 w-px bg-border shrink-0" />

      {/* Priority filters */}
      <span className="text-xs text-muted-foreground shrink-0">
        優先度:
      </span>
      <div className="flex flex-wrap gap-1">
        {PRIORITY_OPTIONS.map((priority) => {
          const isActive = filterPriority.includes(priority);
          return (
            <button
              key={priority}
              onClick={() => togglePriority(priority)}
              aria-label={`Filter by ${PRIORITY_LABELS[priority]}`}
              aria-pressed={isActive}
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-normal transition-all duration-200",
                isActive
                  ? PRIORITY_COLORS[priority]
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              {PRIORITY_LABELS[priority]}
            </button>
          );
        })}
      </div>

      {/* Clear all + active count */}
      {activeCount > 0 && (
        <>
          <div className="h-4 w-px bg-border shrink-0" />
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            aria-label="Clear all filters"
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1 h-3 w-3" />
            クリア
            <Badge
              variant="outline"
              className="ml-1.5 text-[10px] px-1 py-0 font-normal tabular-nums"
            >
              {activeCount}
            </Badge>
          </Button>
        </>
      )}
    </div>
  );
}
