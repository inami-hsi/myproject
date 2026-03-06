"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  formatDate,
} from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  CheckCircle2,
  CircleDot,
  Clock,
  ListTodo,
  Target,
} from "lucide-react";
import type { Project, Task, TaskStatus, Priority } from "@/types";

interface ProjectSidebarProps {
  project: Project | null;
  tasks: Task[];
}

export function ProjectSidebar({ project, tasks }: ProjectSidebarProps) {
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "DONE").length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    const statusCounts: Record<TaskStatus, number> = {
      TODO: 0,
      IN_PROGRESS: 0,
      DONE: 0,
      ON_HOLD: 0,
    };
    const priorityCounts: Record<Priority, number> = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    };

    for (const task of tasks) {
      statusCounts[task.status]++;
      priorityCounts[task.priority]++;
    }

    const recentTasks = [...tasks]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, 5);

    return { total, completed, percentage, statusCounts, priorityCounts, recentTasks };
  }, [tasks]);

  if (!project) {
    return (
      <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
        プロジェクトが選択されていません
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Project Info */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div
              className="h-4 w-4 rounded-full shrink-0"
              style={{ backgroundColor: project.color }}
            />
            <CardTitle className="text-lg">{project.name}</CardTitle>
          </div>
          {project.description && (
            <p className="text-sm text-muted-foreground pt-1">
              {project.description}
            </p>
          )}
        </CardHeader>
      </Card>

      {/* Completion Stats */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm">進捗</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">完了</span>
              <span className="font-medium tabular-nums">
                {stats.completed}/{stats.total}件
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Progress value={stats.percentage} className="h-2 flex-1" />
              <span className="text-sm font-medium tabular-nums w-10 text-right">
                {stats.percentage}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm">ステータス</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(
              Object.entries(stats.statusCounts) as [TaskStatus, number][]
            ).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <Badge
                  className={cn(
                    "text-[10px] px-1.5 py-0 font-normal",
                    STATUS_COLORS[status]
                  )}
                >
                  {STATUS_LABELS[status]}
                </Badge>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Priority Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ListTodo className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm">優先度</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(
              Object.entries(stats.priorityCounts) as [Priority, number][]
            ).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between">
                <Badge
                  className={cn(
                    "text-[10px] px-1.5 py-0 font-normal",
                    PRIORITY_COLORS[priority]
                  )}
                >
                  {PRIORITY_LABELS[priority]}
                </Badge>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {stats.recentTasks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm">最近のアクティビティ</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentTasks.map((task, index) => (
                <div key={task.id}>
                  <div className="flex items-start gap-2">
                    {task.status === "DONE" ? (
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sage" />
                    ) : (
                      <CircleDot className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "truncate text-sm",
                          task.status === "DONE" && "text-muted-foreground line-through"
                        )}
                      >
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(task.updatedAt)}
                      </p>
                    </div>
                  </div>
                  {index < stats.recentTasks.length - 1 && (
                    <Separator className="mt-3" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
