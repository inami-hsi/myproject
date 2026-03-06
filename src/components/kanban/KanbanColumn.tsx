"use client";

import React from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import type { Task, TaskStatus } from "@/types";
import { cn, STATUS_LABELS } from "@/lib/utils";
import KanbanCard from "./KanbanCard";
import { Plus } from "lucide-react";

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask?: () => void;
}

const COLUMN_ACCENT_COLORS: Record<TaskStatus, string> = {
  TODO: "#d1d5db",
  IN_PROGRESS: "#e07a5f",
  DONE: "#6d8b74",
  ON_HOLD: "#d4a843",
};

export default function KanbanColumn({
  status,
  tasks,
  onTaskClick,
  onAddTask,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status}`,
    data: { status },
  });

  const taskIds = tasks.map((t) => t.id);

  return (
    <div
      className={cn(
        "flex flex-col min-w-[280px] max-w-[320px] rounded-lg bg-secondary/30 transition-colors duration-150",
        isOver && "bg-secondary/60 ring-2 ring-primary/20"
      )}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: COLUMN_ACCENT_COLORS[status] }}
          />
          <h3 className="text-sm font-heading font-semibold text-foreground">
            {STATUS_LABELS[status]}
          </h3>
          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-secondary text-[10px] font-heading font-medium text-muted-foreground">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Scrollable task list */}
      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto px-2 pb-2 space-y-2"
        style={{ maxHeight: "calc(100vh - 220px)" }}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </SortableContext>

        {/* Empty state */}
        {tasks.length === 0 && (
          <div className="flex items-center justify-center py-8 text-xs text-muted-foreground font-heading">
            タスクなし
          </div>
        )}
      </div>

      {/* Add task button */}
      {(status === "TODO" || status === "IN_PROGRESS") && onAddTask && (
        <div className="px-2 pb-2">
          <button
            onClick={onAddTask}
            className="flex items-center gap-1.5 w-full px-3 py-2 rounded-md text-xs font-heading text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors duration-150"
          >
            <Plus className="h-3.5 w-3.5" />
            タスクを追加
          </button>
        </div>
      )}
    </div>
  );
}
