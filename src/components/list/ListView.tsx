"use client";

import React, { useState, useMemo, useCallback } from "react";
import type { Task } from "@/types";
import {
  cn,
  STATUS_LABELS,
  PRIORITY_LABELS,
  STATUS_COLORS,
  PRIORITY_COLORS,
  formatDate,
} from "@/lib/utils";
import { useTaskStore } from "@/stores/taskStore";
import { useUIStore } from "@/stores/uiStore";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

type SortField = "title" | "status" | "priority" | "dueDate" | "progress";
type SortDirection = "asc" | "desc";

interface SortState {
  field: SortField;
  direction: SortDirection;
}

const STATUS_ORDER: Record<string, number> = {
  IN_PROGRESS: 0,
  TODO: 1,
  ON_HOLD: 2,
  DONE: 3,
};

const PRIORITY_ORDER: Record<string, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

const COLUMNS: { field: SortField; label: string; width: string }[] = [
  { field: "title", label: "タスク名", width: "flex-1 min-w-[200px]" },
  { field: "status", label: "ステータス", width: "w-[100px]" },
  { field: "priority", label: "優先度", width: "w-[80px]" },
  { field: "dueDate", label: "期限", width: "w-[120px]" },
  { field: "progress", label: "進捗", width: "w-[80px]" },
];

function isOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === "DONE") return false;
  return new Date(task.dueDate) < new Date();
}

function compareValues(a: Task, b: Task, field: SortField): number {
  switch (field) {
    case "title":
      return a.title.localeCompare(b.title, "ja");
    case "status":
      return (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99);
    case "priority":
      return (
        (PRIORITY_ORDER[a.priority] ?? 99) -
        (PRIORITY_ORDER[b.priority] ?? 99)
      );
    case "dueDate": {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    case "progress":
      return a.progress - b.progress;
    default:
      return 0;
  }
}

export default function ListView() {
  const { tasks } = useTaskStore();
  const { setTaskDetailOpen } = useUIStore();
  const setSelectedTask = useTaskStore((s) => s.setSelectedTask);

  const [sort, setSort] = useState<SortState>({
    field: "priority",
    direction: "asc",
  });

  const sortedTasks = useMemo(() => {
    const sorted = [...tasks].sort((a, b) => {
      const cmp = compareValues(a, b, sort.field);
      return sort.direction === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [tasks, sort]);

  const handleSort = useCallback((field: SortField) => {
    setSort((prev) => {
      if (prev.field === field) {
        return { field, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { field, direction: "asc" };
    });
  }, []);

  const handleRowClick = useCallback(
    (task: Task) => {
      setSelectedTask(task);
      setTaskDetailOpen(true);
    },
    [setSelectedTask, setTaskDetailOpen]
  );

  const renderSortIcon = (field: SortField) => {
    if (sort.field !== field) {
      return <ArrowUpDown className="h-3 w-3 opacity-0 group-hover/header:opacity-50" />;
    }
    return sort.direction === "asc" ? (
      <ArrowUp className="h-3 w-3" />
    ) : (
      <ArrowDown className="h-3 w-3" />
    );
  };

  return (
    <div className="flex flex-col h-full border border-border rounded-lg overflow-hidden bg-card">
      {/* Scrollable table wrapper */}
      <div className="flex-1 overflow-auto">
        <table className="w-full min-w-[700px]">
          {/* Header */}
          <thead className="sticky top-0 z-10 bg-card">
            <tr className="border-b border-border">
              {COLUMNS.map((col) => (
                <th
                  key={col.field}
                  onClick={() => handleSort(col.field)}
                  aria-sort={sort.field === col.field ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
                  aria-label={`Sort by ${col.label}`}
                  className={cn(
                    "group/header px-4 py-2.5 text-left text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition-colors duration-150",
                    col.width
                  )}
                >
                  <div className="inline-flex items-center gap-1.5">
                    {col.label}
                    {renderSortIcon(col.field)}
                  </div>
                </th>
              ))}
              {/* Tags column (not sortable) */}
              <th className="px-4 py-2.5 text-left text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider w-[140px]">
                Tags
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {sortedTasks.map((task) => {
              const overdue = isOverdue(task);
              const tags = task.tags ?? [];

              return (
                <tr
                  key={task.id}
                  onClick={() => handleRowClick(task)}
                  role="button"
                  aria-label={`Open task: ${task.title}`}
                  className="border-b border-border/50 hover:bg-secondary/50 cursor-pointer transition-colors duration-150"
                >
                  {/* Title */}
                  <td className="px-4 py-2.5 flex-1 min-w-[200px]">
                    <span className="text-sm font-heading font-medium text-foreground line-clamp-1">
                      {task.title}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-2.5 w-[100px]">
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-heading font-medium",
                        STATUS_COLORS[task.status]
                      )}
                    >
                      {STATUS_LABELS[task.status]}
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="px-4 py-2.5 w-[80px]">
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-heading font-medium",
                        PRIORITY_COLORS[task.priority]
                      )}
                    >
                      {PRIORITY_LABELS[task.priority]}
                    </span>
                  </td>

                  {/* Due Date */}
                  <td className="px-4 py-2.5 w-[120px]">
                    {task.dueDate ? (
                      <span
                        className={cn(
                          "text-xs font-heading",
                          overdue
                            ? "text-danger font-semibold"
                            : "text-muted-foreground"
                        )}
                      >
                        {formatDate(task.dueDate)}
                      </span>
                    ) : (
                      <span className="text-xs font-heading text-muted-foreground/50">
                        --
                      </span>
                    )}
                  </td>

                  {/* Progress */}
                  <td className="px-4 py-2.5 w-[80px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-200"
                          style={{
                            width: `${task.progress}%`,
                            backgroundColor:
                              task.progress === 100 ? "#6d8b74" : "#e07a5f",
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-heading text-muted-foreground tabular-nums w-[28px] text-right">
                        {task.progress}%
                      </span>
                    </div>
                  </td>

                  {/* Tags */}
                  <td className="px-4 py-2.5 w-[140px]">
                    {tags.length > 0 ? (
                      <div className="flex items-center gap-1 flex-wrap">
                        {tags.slice(0, 3).map((tagOnTask) => (
                          <span
                            key={tagOnTask.tagId}
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-heading font-medium bg-secondary text-secondary-foreground"
                            style={{
                              borderLeft: `2px solid ${tagOnTask.tag?.color ?? "#9ca3af"}`,
                            }}
                          >
                            {tagOnTask.tag?.name ?? "tag"}
                          </span>
                        ))}
                        {tags.length > 3 && (
                          <span className="text-[10px] font-heading text-muted-foreground">
                            +{tags.length - 3}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] font-heading text-muted-foreground/50">
                        --
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Empty state */}
        {tasks.length === 0 && (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground font-heading">
            No tasks to display
          </div>
        )}
      </div>
    </div>
  );
}
