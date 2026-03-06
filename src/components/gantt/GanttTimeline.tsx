"use client";

import React, { useMemo } from "react";
import type { TimeScale } from "@/types";
import { addDays, daysBetween } from "@/lib/utils";

interface GanttTimelineProps {
  startDate: Date;
  endDate: Date;
  timeScale: TimeScale;
}

const HEADER_HEIGHT = 52;
const TOP_ROW_HEIGHT = 24;
const BOTTOM_ROW_HEIGHT = 28;

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function getMonthLabel(date: Date): string {
  return date.toLocaleDateString("ja-JP", { year: "numeric", month: "long" });
}

function getYearLabel(date: Date): string {
  return date.toLocaleDateString("ja-JP", { year: "numeric" });
}

interface TopGroup {
  label: string;
  x: number;
  width: number;
}

interface BottomCell {
  label: string;
  x: number;
  width: number;
  isWeekend: boolean;
}

export default function GanttTimeline({
  startDate,
  endDate,
  timeScale,
}: GanttTimelineProps) {
  const totalDays = daysBetween(startDate, endDate);

  const { topGroups, bottomCells, totalWidth } = useMemo(() => {
    const groups: TopGroup[] = [];
    const cells: BottomCell[] = [];

    if (timeScale === "day") {
      const actualDayWidth = 40;
      let currentMonth = -1;
      let groupStart = 0;
      let groupLabel = "";

      for (let i = 0; i < totalDays; i++) {
        const date = addDays(startDate, i);
        const month = date.getMonth();
        const x = i * actualDayWidth;

        if (month !== currentMonth) {
          if (currentMonth !== -1) {
            groups.push({
              label: groupLabel,
              x: groupStart,
              width: x - groupStart,
            });
          }
          currentMonth = month;
          groupStart = x;
          groupLabel = getMonthLabel(date);
        }

        cells.push({
          label: String(date.getDate()),
          x,
          width: actualDayWidth,
          isWeekend: isWeekend(date),
        });
      }

      if (currentMonth !== -1) {
        groups.push({
          label: groupLabel,
          x: groupStart,
          width: totalDays * actualDayWidth - groupStart,
        });
      }

      return {
        topGroups: groups,
        bottomCells: cells,
        totalWidth: totalDays * actualDayWidth,
      };
    }

    if (timeScale === "week") {
      const weekWidth = 60;
      let currentMonth = -1;
      let groupStart = 0;
      let groupLabel = "";
      let weekIndex = 0;

      for (let i = 0; i < totalDays; i += 7) {
        const date = addDays(startDate, i);
        const month = date.getMonth();
        const x = weekIndex * weekWidth;

        if (month !== currentMonth) {
          if (currentMonth !== -1) {
            groups.push({
              label: groupLabel,
              x: groupStart,
              width: x - groupStart,
            });
          }
          currentMonth = month;
          groupStart = x;
          groupLabel = getMonthLabel(date);
        }

        cells.push({
          label: `W${weekIndex + 1}`,
          x,
          width: weekWidth,
          isWeekend: false,
        });

        weekIndex++;
      }

      const tw = weekIndex * weekWidth;
      if (currentMonth !== -1) {
        groups.push({
          label: groupLabel,
          x: groupStart,
          width: tw - groupStart,
        });
      }

      return { topGroups: groups, bottomCells: cells, totalWidth: tw };
    }

    // month
    const monthWidth = 80;
    let currentYear = -1;
    let groupStart = 0;
    let groupLabel = "";
    let monthIndex = 0;

    const tempDate = new Date(startDate);
    while (tempDate <= endDate) {
      const year = tempDate.getFullYear();
      const x = monthIndex * monthWidth;

      if (year !== currentYear) {
        if (currentYear !== -1) {
          groups.push({
            label: groupLabel,
            x: groupStart,
            width: x - groupStart,
          });
        }
        currentYear = year;
        groupStart = x;
        groupLabel = getYearLabel(tempDate);
      }

      cells.push({
        label: `${tempDate.getMonth() + 1}月`,
        x,
        width: monthWidth,
        isWeekend: false,
      });

      monthIndex++;
      tempDate.setMonth(tempDate.getMonth() + 1);
    }

    const tw = monthIndex * monthWidth;
    if (currentYear !== -1) {
      groups.push({
        label: groupLabel,
        x: groupStart,
        width: tw - groupStart,
      });
    }

    return { topGroups: groups, bottomCells: cells, totalWidth: tw };
  }, [startDate, endDate, timeScale, totalDays]);

  return (
    <svg width={totalWidth} height={HEADER_HEIGHT} className="select-none">
      {/* Background */}
      <rect width={totalWidth} height={HEADER_HEIGHT} fill="hsl(var(--card))" />

      {/* Top row - month/year groups */}
      {topGroups.map((group, i) => (
        <g key={`top-${i}`}>
          <rect
            x={group.x}
            y={0}
            width={group.width}
            height={TOP_ROW_HEIGHT}
            fill="hsl(var(--card))"
            stroke="hsl(var(--border))"
            strokeWidth={0.5}
          />
          <text
            x={group.x + group.width / 2}
            y={TOP_ROW_HEIGHT / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={11}
            fontFamily="DM Sans, sans-serif"
            fontWeight={600}
            fill="hsl(var(--foreground))"
          >
            {group.label}
          </text>
        </g>
      ))}

      {/* Bottom row - day/week/month cells */}
      {bottomCells.map((cell, i) => (
        <g key={`bottom-${i}`}>
          <rect
            x={cell.x}
            y={TOP_ROW_HEIGHT}
            width={cell.width}
            height={BOTTOM_ROW_HEIGHT}
            fill={cell.isWeekend ? "#f5f5f4" : "hsl(var(--card))"}
            stroke="hsl(var(--border))"
            strokeWidth={0.5}
          />
          <text
            x={cell.x + cell.width / 2}
            y={TOP_ROW_HEIGHT + BOTTOM_ROW_HEIGHT / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={10}
            fontFamily="DM Sans, sans-serif"
            fontWeight={400}
            fill={
              cell.isWeekend
                ? "hsl(var(--muted-foreground))"
                : "hsl(var(--foreground))"
            }
          >
            {cell.label}
          </text>
        </g>
      ))}

      {/* Bottom border */}
      <line
        x1={0}
        y1={HEADER_HEIGHT}
        x2={totalWidth}
        y2={HEADER_HEIGHT}
        stroke="hsl(var(--border))"
        strokeWidth={1}
      />
    </svg>
  );
}
