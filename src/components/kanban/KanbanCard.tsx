"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/types";
import { cn, PRIORITY_COLORS, PRIORITY_LABELS } from "@/lib/utils";
import { Clock, AlertTriangle } from "lucide-react";

interface KanbanCardProps {
  task: Task;
  onClick: () => void;
}

function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
}

const PRIORITY_DOT_COLORS: Record<string, string> = {
  CRITICAL: "#c44e4e",
  HIGH: "#e07a5f",
  MEDIUM: "#d4a843",
  LOW: "#9ca3af",
};

export default function KanbanCard({ task, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const overdue = task.status !== "DONE" && isOverdue(task.dueDate);
  const tags = task.tags ?? [];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "group rounded-lg border border-border bg-card p-3 cursor-pointer",
        "hover:border-primary/30 hover:shadow-sm",
        "transition-all duration-150",
        isDragging && "opacity-50 shadow-lg rotate-1 scale-105 z-50"
      )}
    >
      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex items-center gap-1.5 mb-2">
          {tags.slice(0, 3).map((tagOnTask) => (
            <span
              key={tagOnTask.tagId}
              className="inline-block w-2 h-2 rounded-full"
              style={{
                backgroundColor: tagOnTask.tag?.color ?? "#9ca3af",
              }}
              title={tagOnTask.tag?.name}
            />
          ))}
          {tags.length > 3 && (
            <span className="text-[10px] text-muted-foreground font-heading">
              +{tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Title */}
      <p className="text-sm font-heading font-medium text-foreground leading-snug mb-2 line-clamp-2">
        {task.title}
      </p>

      {/* Bottom row */}
      <div className="flex items-center justify-between gap-2">
        {/* Priority badge */}
        <span
          className={cn(
            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-heading font-medium",
            PRIORITY_COLORS[task.priority]
          )}
        >
          {task.priority === "CRITICAL" && (
            <AlertTriangle className="h-2.5 w-2.5" />
          )}
          {PRIORITY_LABELS[task.priority]}
        </span>

        {/* Due date */}
        {task.dueDate && (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-[10px] font-heading",
              overdue ? "text-danger font-semibold" : "text-muted-foreground"
            )}
          >
            <Clock className="h-2.5 w-2.5" />
            {formatShortDate(task.dueDate)}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {task.progress > 0 && (
        <div className="mt-2 h-1 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-200"
            style={{
              width: `${task.progress}%`,
              backgroundColor:
                task.progress === 100 ? "#6d8b74" : "#e07a5f",
            }}
          />
        </div>
      )}
    </div>
  );
}
