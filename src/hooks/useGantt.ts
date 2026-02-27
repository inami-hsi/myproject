"use client";

import { useMemo } from "react";
import type { Task, Milestone, TimeScale } from "@/types";
import { daysBetween, addDays } from "@/lib/utils";

interface TaskBar {
  task: Task;
  x: number;
  width: number;
  y: number;
}

interface MilestoneMarker {
  milestone: Milestone;
  x: number;
  y: number;
}

export interface UseGanttReturn {
  timelineStart: Date;
  timelineEnd: Date;
  dayWidth: number;
  totalWidth: number;
  totalHeight: number;
  taskBars: TaskBar[];
  milestoneMarkers: MilestoneMarker[];
  todayX: number;
  getDateFromX: (x: number) => Date;
  getXFromDate: (date: Date) => number;
}

const ROW_HEIGHT = 40;
const PADDING_DAYS = 7;

function getDayWidth(timeScale: TimeScale): number {
  switch (timeScale) {
    case "day":
      return 40;
    case "week":
      return 60 / 7;
    case "month":
      return 80 / 30;
  }
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function useGantt(
  tasks: Task[],
  milestones: Milestone[],
  timeScale: TimeScale
): UseGanttReturn {
  const dayWidth = getDayWidth(timeScale);

  const { timelineStart, timelineEnd } = useMemo(() => {
    const dates: Date[] = [];
    const today = new Date();
    dates.push(today);

    for (const task of tasks) {
      if (task.startDate) dates.push(new Date(task.startDate));
      if (task.endDate) dates.push(new Date(task.endDate));
      if (task.dueDate) dates.push(new Date(task.dueDate));
    }

    for (const ms of milestones) {
      if (ms.date) dates.push(new Date(ms.date));
    }

    if (dates.length === 0) {
      return {
        timelineStart: addDays(today, -PADDING_DAYS),
        timelineEnd: addDays(today, 30 + PADDING_DAYS),
      };
    }

    const minTime = Math.min(...dates.map((d) => d.getTime()));
    const maxTime = Math.max(...dates.map((d) => d.getTime()));

    return {
      timelineStart: startOfDay(addDays(new Date(minTime), -PADDING_DAYS)),
      timelineEnd: startOfDay(addDays(new Date(maxTime), PADDING_DAYS)),
    };
  }, [tasks, milestones]);

  const totalDays = useMemo(
    () => daysBetween(timelineStart, timelineEnd),
    [timelineStart, timelineEnd]
  );

  const totalWidth = useMemo(
    () => Math.max(totalDays * dayWidth, 800),
    [totalDays, dayWidth]
  );

  const getXFromDate = useMemo(() => {
    return (date: Date): number => {
      const days = daysBetween(timelineStart, startOfDay(date));
      return days * dayWidth;
    };
  }, [timelineStart, dayWidth]);

  const getDateFromX = useMemo(() => {
    return (x: number): Date => {
      const days = Math.round(x / dayWidth);
      return addDays(timelineStart, days);
    };
  }, [timelineStart, dayWidth]);

  const todayX = useMemo(() => {
    return getXFromDate(new Date());
  }, [getXFromDate]);

  const taskBars = useMemo(() => {
    const bars: TaskBar[] = [];
    let rowIndex = 0;

    for (const task of tasks) {
      const y = rowIndex * ROW_HEIGHT;

      if (task.startDate && task.endDate) {
        const start = new Date(task.startDate);
        const end = new Date(task.endDate);
        const x = getXFromDate(start);
        const endX = getXFromDate(end);
        const width = Math.max(endX - x, dayWidth);

        bars.push({ task, x, width, y });
      } else if (task.startDate && task.dueDate) {
        const start = new Date(task.startDate);
        const due = new Date(task.dueDate);
        const x = getXFromDate(start);
        const endX = getXFromDate(due);
        const width = Math.max(endX - x, dayWidth);

        bars.push({ task, x, width, y });
      } else {
        bars.push({ task, x: 0, width: 0, y });
      }

      rowIndex++;
    }

    return bars;
  }, [tasks, getXFromDate, dayWidth]);

  const milestoneMarkers = useMemo(() => {
    const taskCount = tasks.length;

    return milestones.map((milestone, index) => {
      const x = getXFromDate(new Date(milestone.date));
      const y = (taskCount + index) * ROW_HEIGHT;
      return { milestone, x, y };
    });
  }, [milestones, tasks.length, getXFromDate]);

  const totalHeight = (tasks.length + milestones.length) * ROW_HEIGHT;

  return {
    timelineStart,
    timelineEnd,
    dayWidth,
    totalWidth,
    totalHeight,
    taskBars,
    milestoneMarkers,
    todayX,
    getDateFromX,
    getXFromDate,
  };
}
