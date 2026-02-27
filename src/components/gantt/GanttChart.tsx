"use client";

import React, { useRef, useMemo, useState, useCallback } from "react";
import type { Task, Milestone, TimeScale, TaskDependency } from "@/types";
import { cn, addDays, STATUS_LABELS, formatDate } from "@/lib/utils";
import { useGantt } from "@/hooks/useGantt";
import GanttTimeline from "./GanttTimeline";
import GanttBar from "./GanttBar";
import GanttDependencyArrow from "./GanttDependencyArrow";
import GanttMilestone from "./GanttMilestone";
import {
  CalendarDays,
  CalendarRange,
  Calendar,
  ChevronsRight,
} from "lucide-react";

interface GanttChartProps {
  tasks: Task[];
  milestones: Milestone[];
  onTaskClick: (task: Task) => void;
  onTaskUpdate: (
    id: string,
    updates: { startDate?: string; endDate?: string }
  ) => void;
}

const ROW_HEIGHT = 40;
const SIDEBAR_WIDTH = 250;
const HEADER_HEIGHT = 52;

const STATUS_DOT_COLORS: Record<string, string> = {
  TODO: "#d1d5db",
  IN_PROGRESS: "#e07a5f",
  DONE: "#6d8b74",
  ON_HOLD: "#d4a843",
};

const TIME_SCALE_OPTIONS: { value: TimeScale; label: string; icon: React.ReactNode }[] = [
  { value: "day", label: "日", icon: <CalendarDays className="h-3.5 w-3.5" /> },
  { value: "week", label: "週", icon: <CalendarRange className="h-3.5 w-3.5" /> },
  { value: "month", label: "月", icon: <Calendar className="h-3.5 w-3.5" /> },
];

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function formatDateISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

export default function GanttChart({
  tasks,
  milestones,
  onTaskClick,
  onTaskUpdate,
}: GanttChartProps) {
  const [timeScale, setTimeScale] = useState<TimeScale>("day");
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    timelineStart,
    timelineEnd,
    dayWidth,
    totalWidth,
    totalHeight,
    taskBars,
    milestoneMarkers,
    todayX,
    getXFromDate,
  } = useGantt(tasks, milestones, timeScale);

  const actualDayWidth = timeScale === "day" ? 40 : timeScale === "week" ? 60 / 7 : 80 / 30;

  // Build dependency arrows data
  const dependencyArrows = useMemo(() => {
    const arrows: Array<{
      key: string;
      fromTask: { x: number; y: number; width: number };
      toTask: { x: number; y: number; width: number };
      type: TaskDependency["type"];
    }> = [];

    const barMap = new Map(taskBars.map((b) => [b.task.id, b]));

    for (const bar of taskBars) {
      const deps = bar.task.dependencies ?? [];
      for (const dep of deps) {
        const fromBar = barMap.get(dep.dependencyId);
        if (fromBar && fromBar.width > 0 && bar.width > 0) {
          arrows.push({
            key: dep.id,
            fromTask: { x: fromBar.x, y: fromBar.y, width: fromBar.width },
            toTask: { x: bar.x, y: bar.y, width: bar.width },
            type: dep.type,
          });
        }
      }
    }

    return arrows;
  }, [taskBars]);

  // Weekend column backgrounds (day view only)
  const weekendColumns = useMemo(() => {
    if (timeScale !== "day") return [];

    const columns: Array<{ x: number; width: number }> = [];
    const totalDays = Math.ceil(
      (timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24)
    );

    for (let i = 0; i < totalDays; i++) {
      const date = addDays(timelineStart, i);
      if (isWeekend(date)) {
        columns.push({ x: i * 40, width: 40 });
      }
    }

    return columns;
  }, [timeScale, timelineStart, timelineEnd]);

  const handleScrollToToday = useCallback(() => {
    if (scrollRef.current) {
      const containerWidth = scrollRef.current.clientWidth;
      scrollRef.current.scrollLeft = Math.max(
        0,
        todayX - containerWidth / 2
      );
    }
  }, [todayX]);

  const handleDragEnd = useCallback(
    (task: Task, deltaDays: number) => {
      if (!task.startDate || !task.endDate) return;

      const newStart = addDays(new Date(task.startDate), deltaDays);
      const newEnd = addDays(new Date(task.endDate), deltaDays);

      onTaskUpdate(task.id, {
        startDate: formatDateISO(newStart),
        endDate: formatDateISO(newEnd),
      });
    },
    [onTaskUpdate]
  );

  const handleResizeEnd = useCallback(
    (task: Task, deltaDays: number) => {
      if (!task.endDate) return;

      const newEnd = addDays(new Date(task.endDate), deltaDays);

      onTaskUpdate(task.id, {
        endDate: formatDateISO(newEnd),
      });
    },
    [onTaskUpdate]
  );

  const contentHeight = Math.max(totalHeight, 200);

  return (
    <div className="flex flex-col h-full border border-border rounded-lg overflow-hidden bg-card">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
        <div className="flex items-center gap-1">
          {TIME_SCALE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeScale(option.value)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-heading font-medium transition-colors duration-150",
                timeScale === option.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
              )}
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleScrollToToday}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-heading font-medium text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors duration-150"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
          今日
        </button>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - task list */}
        <div
          className="flex-shrink-0 border-r border-border bg-card overflow-y-auto"
          style={{ width: SIDEBAR_WIDTH }}
        >
          {/* Sidebar header */}
          <div
            className="flex items-center px-4 border-b border-border bg-card sticky top-0 z-10"
            style={{ height: HEADER_HEIGHT }}
          >
            <span className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider">
              タスク
            </span>
          </div>

          {/* Task rows */}
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center px-4 gap-2 border-b border-border/50 hover:bg-secondary/50 cursor-pointer transition-colors duration-150"
              style={{ height: ROW_HEIGHT }}
              onClick={() => onTaskClick(task)}
            >
              <span
                className="flex-shrink-0 w-2 h-2 rounded-full"
                style={{ backgroundColor: STATUS_DOT_COLORS[task.status] }}
              />
              <span className="text-sm font-heading truncate text-foreground">
                {task.title}
              </span>
            </div>
          ))}

          {/* Milestone rows */}
          {milestones.map((milestone) => (
            <div
              key={milestone.id}
              className="flex items-center px-4 gap-2 border-b border-border/50"
              style={{ height: ROW_HEIGHT }}
            >
              <span className="flex-shrink-0 text-xs" style={{ color: milestone.color || "#8b7ec8" }}>
                &#9670;
              </span>
              <span className="text-sm font-heading truncate text-muted-foreground italic">
                {milestone.name}
              </span>
            </div>
          ))}

          {/* Empty state */}
          {tasks.length === 0 && milestones.length === 0 && (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground font-heading">
              表示するタスクがありません
            </div>
          )}
        </div>

        {/* Right side - timeline */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-auto"
        >
          {/* Timeline header */}
          <div className="sticky top-0 z-10">
            <GanttTimeline
              startDate={timelineStart}
              endDate={timelineEnd}
              timeScale={timeScale}
              dayWidth={actualDayWidth}
            />
          </div>

          {/* SVG chart area */}
          <svg
            width={totalWidth}
            height={contentHeight}
            className="select-none"
          >
            {/* Row grid lines */}
            {tasks.map((_, i) => (
              <line
                key={`grid-${i}`}
                x1={0}
                y1={(i + 1) * ROW_HEIGHT}
                x2={totalWidth}
                y2={(i + 1) * ROW_HEIGHT}
                stroke="hsl(var(--border))"
                strokeWidth={0.5}
                opacity={0.5}
              />
            ))}

            {/* Weekend backgrounds (day view) */}
            {weekendColumns.map((col, i) => (
              <rect
                key={`weekend-${i}`}
                x={col.x}
                y={0}
                width={col.width}
                height={contentHeight}
                fill="#f5f5f4"
                opacity={0.5}
              />
            ))}

            {/* Today line */}
            <line
              x1={todayX}
              y1={0}
              x2={todayX}
              y2={contentHeight}
              stroke="#c44e4e"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              opacity={0.7}
            />

            {/* Dependency arrows */}
            {dependencyArrows.map((arrow) => (
              <GanttDependencyArrow
                key={arrow.key}
                fromTask={arrow.fromTask}
                toTask={arrow.toTask}
                type={arrow.type}
              />
            ))}

            {/* Task bars */}
            {taskBars.map((bar) => (
              <GanttBar
                key={bar.task.id}
                task={bar.task}
                x={bar.x}
                width={bar.width}
                y={bar.y}
                dayWidth={actualDayWidth}
                onClick={() => onTaskClick(bar.task)}
                onDragEnd={(deltaDays) => handleDragEnd(bar.task, deltaDays)}
                onResizeEnd={(deltaDays) =>
                  handleResizeEnd(bar.task, deltaDays)
                }
              />
            ))}

            {/* Milestones */}
            {milestoneMarkers.map((marker) => (
              <GanttMilestone
                key={marker.milestone.id}
                milestone={marker.milestone}
                x={marker.x}
                y={marker.y}
                onClick={() => {}}
              />
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}
