"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  isToday,
  addWeeks,
  subWeeks,
} from "date-fns";
import { ja } from "date-fns/locale";
import type { Task } from "@/types";
import { cn } from "@/lib/utils";
import { useTaskStore } from "@/stores/taskStore";
import { useUIStore } from "@/stores/uiStore";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  CalendarDays,
} from "lucide-react";

type CalendarMode = "month" | "week";

const PRIORITY_DOT_COLORS: Record<string, string> = {
  CRITICAL: "#c44e4e",
  HIGH: "#e07a5f",
  MEDIUM: "#d4a843",
  LOW: "#9ca3af",
};

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getTasksForDate(tasks: Task[], date: Date): Task[] {
  return tasks.filter((task) => {
    if (!task.dueDate) return false;
    return isSameDay(new Date(task.dueDate), date);
  });
}

export default function CalendarView() {
  const { tasks } = useTaskStore();
  const { setTaskDetailOpen } = useUIStore();
  const setSelectedTask = useTaskStore((s) => s.setSelectedTask);

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [mode, setMode] = useState<CalendarMode>("month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Calculate grid days based on mode
  const calendarDays = useMemo(() => {
    if (mode === "month") {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
      const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
      return eachDayOfInterval({ start: gridStart, end: gridEnd });
    } else {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
      return eachDayOfInterval({ start: weekStart, end: weekEnd });
    }
  }, [currentDate, mode]);

  // Tasks for the selected date panel
  const selectedDateTasks = useMemo(() => {
    if (!selectedDate) return [];
    return getTasksForDate(tasks, selectedDate);
  }, [tasks, selectedDate]);

  const handlePrev = useCallback(() => {
    setCurrentDate((prev) =>
      mode === "month" ? subMonths(prev, 1) : subWeeks(prev, 1)
    );
  }, [mode]);

  const handleNext = useCallback(() => {
    setCurrentDate((prev) =>
      mode === "month" ? addMonths(prev, 1) : addWeeks(prev, 1)
    );
  }, [mode]);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const handleDateClick = useCallback((date: Date) => {
    setSelectedDate((prev) =>
      prev && isSameDay(prev, date) ? null : date
    );
  }, []);

  const handleTaskClick = useCallback(
    (task: Task) => {
      setSelectedTask(task);
      setTaskDetailOpen(true);
    },
    [setSelectedTask, setTaskDetailOpen]
  );

  const titleText = useMemo(() => {
    if (mode === "month") {
      return format(currentDate, "yyyy年 M月", { locale: ja });
    }
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    return `${format(weekStart, "M/d", { locale: ja })} - ${format(weekEnd, "M/d", { locale: ja })}`;
  }, [currentDate, mode]);

  return (
    <div className="flex flex-col h-full border border-border rounded-lg overflow-hidden bg-card">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMode("month")}
            aria-label="Switch to month view"
            aria-pressed={mode === "month"}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-heading font-medium transition-colors duration-150",
              mode === "month"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
            )}
          >
            <Calendar className="h-3.5 w-3.5" />
            Month
          </button>
          <button
            onClick={() => setMode("week")}
            aria-label="Switch to week view"
            aria-pressed={mode === "week"}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-heading font-medium transition-colors duration-150",
              mode === "week"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
            )}
          >
            <CalendarDays className="h-3.5 w-3.5" />
            Week
          </button>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            aria-label={`Go to previous ${mode}`}
            className="inline-flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors duration-150"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="text-sm font-heading font-semibold text-foreground min-w-[140px] text-center">
            {titleText}
          </h2>
          <button
            onClick={handleNext}
            aria-label={`Go to next ${mode}`}
            className="inline-flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors duration-150"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={handleToday}
            aria-label="Jump to today"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-heading font-medium text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors duration-150 ml-1"
          >
            Today
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-auto">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-border bg-card sticky top-0 z-10">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="px-2 py-2 text-center text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div
          className={cn(
            "grid grid-cols-7",
            mode === "week" ? "flex-1" : ""
          )}
        >
          {calendarDays.map((day) => {
            const dayTasks = getTasksForDate(tasks, day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const today = isToday(day);
            const isSelected = selectedDate
              ? isSameDay(day, selectedDate)
              : false;

            return (
              <div
                key={day.toISOString()}
                onClick={() => handleDateClick(day)}
                role="button"
                aria-label={`${format(day, "M月d日")} ${dayTasks.length > 0 ? `${dayTasks.length} tasks` : "no tasks"}`}
                className={cn(
                  "border-b border-r border-border/50 p-1.5 cursor-pointer transition-colors duration-150",
                  mode === "month" ? "min-h-[100px]" : "min-h-[200px]",
                  !isCurrentMonth && mode === "month" && "bg-secondary/20",
                  isSelected && "bg-primary/5 ring-1 ring-inset ring-primary/20",
                  !isSelected && "hover:bg-secondary/40"
                )}
              >
                {/* Day number */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn(
                      "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-heading font-medium",
                      today && "bg-primary text-primary-foreground",
                      !today && isCurrentMonth && "text-foreground",
                      !today && !isCurrentMonth && "text-muted-foreground/50"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] font-heading text-muted-foreground">
                      {dayTasks.length}
                    </span>
                  )}
                </div>

                {/* Task chips */}
                <div className="space-y-0.5">
                  {dayTasks.slice(0, mode === "month" ? 3 : 8).map((task) => (
                    <button
                      key={task.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTaskClick(task);
                      }}
                      aria-label={`Open task: ${task.title}`}
                      className="flex items-center gap-1 w-full px-1 py-0.5 rounded text-left hover:bg-secondary transition-colors duration-150 group/chip"
                    >
                      <span
                        className="flex-shrink-0 w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor:
                            PRIORITY_DOT_COLORS[task.priority],
                        }}
                      />
                      <span className="text-[10px] font-heading text-foreground truncate group-hover/chip:text-primary">
                        {task.title}
                      </span>
                    </button>
                  ))}
                  {dayTasks.length > (mode === "month" ? 3 : 8) && (
                    <span className="block text-[10px] font-heading text-muted-foreground pl-3">
                      +{dayTasks.length - (mode === "month" ? 3 : 8)} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected date detail panel */}
      {selectedDate && (
        <div className="border-t border-border bg-card px-4 py-3 max-h-[200px] overflow-y-auto">
          <h3 className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {format(selectedDate, "M月d日 (EEEE)", { locale: ja })}
          </h3>
          {selectedDateTasks.length === 0 ? (
            <p className="text-xs text-muted-foreground font-heading">
              No tasks for this date
            </p>
          ) : (
            <div className="space-y-1.5">
              {selectedDateTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => handleTaskClick(task)}
                  aria-label={`Open task: ${task.title}, ${task.progress}% complete`}
                  className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-secondary transition-colors duration-150 text-left"
                >
                  <span
                    className="flex-shrink-0 w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        PRIORITY_DOT_COLORS[task.priority],
                    }}
                  />
                  <span className="text-sm font-heading text-foreground truncate flex-1">
                    {task.title}
                  </span>
                  <span className="text-[10px] font-heading text-muted-foreground flex-shrink-0">
                    {task.progress}%
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
