"use client";

import React, { useState } from "react";
import type { DependencyType } from "@/types";

interface TaskPosition {
  x: number;
  y: number;
  width: number;
}

interface GanttDependencyArrowProps {
  fromTask: TaskPosition;
  toTask: TaskPosition;
  type: DependencyType;
}

const ARROW_SIZE = 5;
const ROW_HEIGHT = 40;
const BAR_PADDING_Y = 6;
const BAR_HEIGHT = 28;

function buildPath(
  from: TaskPosition,
  to: TaskPosition,
  type: DependencyType
): string {
  const barMidY = BAR_PADDING_Y + BAR_HEIGHT / 2;

  let startX: number;
  let startY: number;
  let endX: number;
  let endY: number;

  switch (type) {
    case "FS": // Finish-to-Start
      startX = from.x + from.width;
      startY = from.y + barMidY;
      endX = to.x;
      endY = to.y + barMidY;
      break;
    case "SS": // Start-to-Start
      startX = from.x;
      startY = from.y + barMidY;
      endX = to.x;
      endY = to.y + barMidY;
      break;
    case "FF": // Finish-to-Finish
      startX = from.x + from.width;
      startY = from.y + barMidY;
      endX = to.x + to.width;
      endY = to.y + barMidY;
      break;
    case "SF": // Start-to-Finish
      startX = from.x;
      startY = from.y + barMidY;
      endX = to.x + to.width;
      endY = to.y + barMidY;
      break;
    default:
      startX = from.x + from.width;
      startY = from.y + barMidY;
      endX = to.x;
      endY = to.y + barMidY;
  }

  const offsetX = 12;

  // Route with right-angle connectors
  if (type === "FS") {
    if (endX > startX + offsetX * 2) {
      // Straight-ish path with horizontal segment
      return `M ${startX} ${startY} L ${startX + offsetX} ${startY} L ${startX + offsetX} ${endY} L ${endX} ${endY}`;
    }
    // Need to go around
    const detourY =
      startY < endY
        ? Math.max(startY, endY) + ROW_HEIGHT / 2
        : Math.min(startY, endY) - ROW_HEIGHT / 2;
    return `M ${startX} ${startY} L ${startX + offsetX} ${startY} L ${startX + offsetX} ${detourY} L ${endX - offsetX} ${detourY} L ${endX - offsetX} ${endY} L ${endX} ${endY}`;
  }

  if (type === "SS") {
    const leftX = Math.min(startX, endX) - offsetX;
    return `M ${startX} ${startY} L ${leftX} ${startY} L ${leftX} ${endY} L ${endX} ${endY}`;
  }

  if (type === "FF") {
    const rightX = Math.max(startX, endX) + offsetX;
    return `M ${startX} ${startY} L ${rightX} ${startY} L ${rightX} ${endY} L ${endX} ${endY}`;
  }

  // SF
  if (startX < endX) {
    const leftX = startX - offsetX;
    return `M ${startX} ${startY} L ${leftX} ${startY} L ${leftX} ${endY} L ${endX} ${endY}`;
  }
  return `M ${startX} ${startY} L ${startX - offsetX} ${startY} L ${startX - offsetX} ${endY} L ${endX} ${endY}`;
}

function getArrowHead(
  to: TaskPosition,
  type: DependencyType
): { points: string } {
  const barMidY = BAR_PADDING_Y + BAR_HEIGHT / 2;
  let tipX: number;
  let tipY: number;
  let direction: 1 | -1;

  switch (type) {
    case "FS":
    case "SS":
      tipX = to.x;
      tipY = to.y + barMidY;
      direction = 1; // pointing right
      break;
    case "FF":
    case "SF":
      tipX = to.x + to.width;
      tipY = to.y + barMidY;
      direction = -1; // pointing left
      break;
    default:
      tipX = to.x;
      tipY = to.y + barMidY;
      direction = 1;
  }

  const p1 = `${tipX},${tipY}`;
  const p2 = `${tipX - direction * ARROW_SIZE},${tipY - ARROW_SIZE}`;
  const p3 = `${tipX - direction * ARROW_SIZE},${tipY + ARROW_SIZE}`;

  return { points: `${p1} ${p2} ${p3}` };
}

export default function GanttDependencyArrow({
  fromTask,
  toTask,
  type,
}: GanttDependencyArrowProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Don't render if either task has no position
  if (fromTask.width <= 0 || toTask.width <= 0) return null;

  const path = buildPath(fromTask, toTask, type);
  const arrowHead = getArrowHead(toTask, type);
  const color = isHovered ? "#e07a5f" : "#9ca3af";

  return (
    <g
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon points={arrowHead.points} fill={color} />
      {/* Wider hover area */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={8}
      />
    </g>
  );
}
