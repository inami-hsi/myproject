"use client";

import React, { useState, useCallback, useRef } from "react";
import type { Task, TaskStatus } from "@/types";

interface GanttBarProps {
  task: Task;
  x: number;
  width: number;
  y: number;
  height?: number;
  dayWidth: number;
  onClick: () => void;
  onDragEnd?: (deltaDays: number) => void;
  onResizeEnd?: (deltaDays: number) => void;
}

const BAR_HEIGHT = 28;
const BAR_PADDING_Y = 6;
const RESIZE_HANDLE_WIDTH = 6;

const STATUS_BAR_COLORS: Record<TaskStatus, string> = {
  TODO: "#d1d5db",
  IN_PROGRESS: "#e07a5f",
  DONE: "#6d8b74",
  ON_HOLD: "#d4a843",
};

const STATUS_BAR_FILL_COLORS: Record<TaskStatus, string> = {
  TODO: "#d1d5db",
  IN_PROGRESS: "#f4b8a5",
  DONE: "#a8c5b0",
  ON_HOLD: "#e8ce8a",
};

export default function GanttBar({
  task,
  x,
  width,
  y,
  height = BAR_HEIGHT,
  dayWidth,
  onClick,
  onDragEnd,
  onResizeEnd,
}: GanttBarProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [resizeOffset, setResizeOffset] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const dragStartRef = useRef<number>(0);
  const actionRef = useRef<"drag" | "resize" | null>(null);

  if (width <= 0) return null;

  const barY = y + BAR_PADDING_Y;
  const barColor = STATUS_BAR_COLORS[task.status];
  const fillColor = STATUS_BAR_FILL_COLORS[task.status];
  const progressWidth = (width * task.progress) / 100;
  const showText = width > 60;

  const currentX = isDragging ? x + dragOffset : x;
  const currentWidth = isResizing ? width + resizeOffset : width;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const isResizeHandle =
        e.nativeEvent.offsetX > width - RESIZE_HANDLE_WIDTH;
      dragStartRef.current = e.clientX;

      if (isResizeHandle) {
        actionRef.current = "resize";
        setIsResizing(true);
      } else {
        actionRef.current = "drag";
        setIsDragging(true);
      }

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const delta = moveEvent.clientX - dragStartRef.current;
        if (actionRef.current === "drag") {
          setDragOffset(delta);
        } else if (actionRef.current === "resize") {
          setResizeOffset(Math.max(delta, -width + dayWidth));
        }
      };

      const handleMouseUp = (upEvent: MouseEvent) => {
        const delta = upEvent.clientX - dragStartRef.current;
        const deltaDays = Math.round(delta / dayWidth);

        if (actionRef.current === "drag" && onDragEnd && deltaDays !== 0) {
          onDragEnd(deltaDays);
        } else if (
          actionRef.current === "resize" &&
          onResizeEnd &&
          deltaDays !== 0
        ) {
          onResizeEnd(deltaDays);
        } else if (Math.abs(delta) < 3) {
          onClick();
        }

        setIsDragging(false);
        setIsResizing(false);
        setDragOffset(0);
        setResizeOffset(0);
        actionRef.current = null;

        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [width, dayWidth, onClick, onDragEnd, onResizeEnd]
  );

  const tooltipText = [
    task.title,
    task.startDate && task.endDate
      ? `${task.startDate} ~ ${task.endDate}`
      : "",
    `${task.progress}%`,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <g
      role="button"
      aria-label={`Task: ${task.title}, ${task.status}, ${task.progress}% complete. Drag to reschedule.`}
      onMouseEnter={() => {
        setIsHovered(true);
        setShowTooltip(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowTooltip(false);
      }}
      style={{
        cursor: isDragging ? "grabbing" : isResizing ? "ew-resize" : "pointer",
        opacity: isDragging || isResizing ? 0.8 : 1,
      }}
    >
      {/* Background bar */}
      <rect
        x={currentX}
        y={barY}
        width={Math.max(currentWidth, 4)}
        height={height}
        rx={6}
        ry={6}
        fill={fillColor}
        stroke={isHovered ? barColor : "transparent"}
        strokeWidth={isHovered ? 1.5 : 0}
        onMouseDown={handleMouseDown}
      />

      {/* Progress fill */}
      {task.progress > 0 && (
        <rect
          x={currentX}
          y={barY}
          width={Math.min(
            (Math.max(currentWidth, 4) * task.progress) / 100,
            Math.max(currentWidth, 4)
          )}
          height={height}
          rx={6}
          ry={6}
          fill={barColor}
          opacity={0.85}
          pointerEvents="none"
        />
      )}

      {/* Right-side clip fix for progress bar rounded corners */}
      {task.progress > 0 && task.progress < 100 && (
        <rect
          x={
            currentX +
            (Math.max(currentWidth, 4) * task.progress) / 100 -
            6
          }
          y={barY}
          width={6}
          height={height}
          fill={barColor}
          opacity={0.85}
          pointerEvents="none"
        />
      )}

      {/* Text label */}
      {showText && (
        <text
          x={currentX + 8}
          y={barY + height / 2}
          dominantBaseline="central"
          fontSize={11}
          fontFamily="DM Sans, sans-serif"
          fontWeight={500}
          fill="#ffffff"
          pointerEvents="none"
          style={{ userSelect: "none" }}
        >
          {task.title.length > Math.floor(currentWidth / 7)
            ? task.title.slice(0, Math.floor(currentWidth / 7) - 2) + "..."
            : task.title}
        </text>
      )}

      {/* Resize handle (right edge) */}
      <rect
        x={currentX + Math.max(currentWidth, 4) - RESIZE_HANDLE_WIDTH}
        y={barY}
        width={RESIZE_HANDLE_WIDTH}
        height={height}
        fill="transparent"
        style={{ cursor: "ew-resize" }}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          dragStartRef.current = e.clientX;
          actionRef.current = "resize";
          setIsResizing(true);

          const handleMouseMove = (moveEvent: MouseEvent) => {
            const delta = moveEvent.clientX - dragStartRef.current;
            setResizeOffset(Math.max(delta, -width + dayWidth));
          };

          const handleMouseUp = (upEvent: MouseEvent) => {
            const delta = upEvent.clientX - dragStartRef.current;
            const deltaDays = Math.round(delta / dayWidth);

            if (onResizeEnd && deltaDays !== 0) {
              onResizeEnd(deltaDays);
            }

            setIsResizing(false);
            setResizeOffset(0);
            actionRef.current = null;

            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
          };

          document.addEventListener("mousemove", handleMouseMove);
          document.addEventListener("mouseup", handleMouseUp);
        }}
      />

      {/* Tooltip */}
      {showTooltip && !isDragging && !isResizing && (
        <g>
          <rect
            x={currentX}
            y={barY - 52}
            width={180}
            height={44}
            rx={6}
            fill="hsl(var(--popover))"
            stroke="hsl(var(--border))"
            strokeWidth={1}
            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
          />
          <text
            x={currentX + 8}
            y={barY - 38}
            fontSize={11}
            fontFamily="DM Sans, sans-serif"
            fontWeight={600}
            fill="hsl(var(--foreground))"
          >
            {task.title.length > 24
              ? task.title.slice(0, 22) + "..."
              : task.title}
          </text>
          <text
            x={currentX + 8}
            y={barY - 18}
            fontSize={10}
            fontFamily="DM Sans, sans-serif"
            fill="hsl(var(--muted-foreground))"
          >
            {task.startDate && task.endDate
              ? `${task.startDate.slice(5)} ~ ${task.endDate.slice(5)}`
              : "No date set"}{" "}
            | {task.progress}%
          </text>
        </g>
      )}
    </g>
  );
}
