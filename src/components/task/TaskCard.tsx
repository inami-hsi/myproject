"use client";

import { useTaskStore } from "@/stores/taskStore";
import { useUIStore } from "@/stores/uiStore";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  formatDate,
} from "@/lib/utils";
import { Calendar, Clock } from "lucide-react";
import type { Task } from "@/types";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  compact?: boolean;
}

export function TaskCard({ task, compact = false }: TaskCardProps) {
  const { setSelectedTask } = useTaskStore();
  const { setTaskDetailOpen } = useUIStore();

  const handleClick = () => {
    setSelectedTask(task);
    setTaskDetailOpen(true);
  };

  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md hover:border-accent/30",
        isOverdue && "border-destructive/30"
      )}
      onClick={handleClick}
      role="button"
      aria-label={`タスクを開く: ${task.title}`}
    >
      <CardHeader className={cn("pb-2", compact && "p-3 pb-1")}>
        <div className="flex items-start justify-between gap-2">
          <h3
            className={cn(
              "font-medium font-heading leading-snug",
              compact ? "text-sm" : "text-base",
              task.status === "DONE" && "line-through text-muted-foreground"
            )}
          >
            {task.title}
          </h3>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          <Badge
            className={cn(
              "text-[10px] px-1.5 py-0 font-normal",
              STATUS_COLORS[task.status]
            )}
          >
            {STATUS_LABELS[task.status]}
          </Badge>
          <Badge
            className={cn(
              "text-[10px] px-1.5 py-0 font-normal",
              PRIORITY_COLORS[task.priority]
            )}
          >
            {PRIORITY_LABELS[task.priority]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className={cn(compact && "p-3 pt-0")}>
        {/* Progress */}
        {task.progress > 0 && (
          <div className="mb-2 flex items-center gap-2">
            <Progress value={task.progress} className="h-1.5 flex-1" />
            <span className="text-xs text-muted-foreground tabular-nums">
              {task.progress}%
            </span>
          </div>
        )}

        {/* Dates */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {task.dueDate && (
            <div
              className={cn(
                "flex items-center gap-1",
                isOverdue && "text-destructive"
              )}
            >
              <Calendar className="h-3 w-3" />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          )}
          {task.startDate && task.endDate && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>
                {formatDate(task.startDate)} - {formatDate(task.endDate)}
              </span>
            </div>
          )}
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {task.tags.map((tagOnTask) => (
              <span
                key={tagOnTask.tagId}
                className="inline-block rounded-full px-2 py-0.5 text-[10px]"
                style={{
                  backgroundColor: tagOnTask.tag?.color
                    ? `${tagOnTask.tag.color}20`
                    : undefined,
                  color: tagOnTask.tag?.color,
                }}
              >
                {tagOnTask.tag?.name}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
