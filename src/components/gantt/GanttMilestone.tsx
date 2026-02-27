"use client";

import React, { useState } from "react";
import type { Milestone } from "@/types";

interface GanttMilestoneProps {
  milestone: Milestone;
  x: number;
  y: number;
  onClick: () => void;
}

const DIAMOND_SIZE = 12;
const BAR_PADDING_Y = 6;
const BAR_HEIGHT = 28;

export default function GanttMilestone({
  milestone,
  x,
  y,
  onClick,
}: GanttMilestoneProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const centerY = y + BAR_PADDING_Y + BAR_HEIGHT / 2;
  const half = DIAMOND_SIZE / 2;
  const color = milestone.color || "#8b7ec8";

  // Diamond points (rotated square)
  const points = [
    `${x},${centerY - half}`,
    `${x + half},${centerY}`,
    `${x},${centerY + half}`,
    `${x - half},${centerY}`,
  ].join(" ");

  const formattedDate = new Date(milestone.date).toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
  });

  return (
    <g
      onMouseEnter={() => {
        setIsHovered(true);
        setShowTooltip(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowTooltip(false);
      }}
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      {/* Diamond shape */}
      <polygon
        points={points}
        fill={color}
        stroke={isHovered ? "hsl(var(--foreground))" : "transparent"}
        strokeWidth={isHovered ? 1.5 : 0}
      />

      {/* Label */}
      <text
        x={x + half + 6}
        y={centerY}
        dominantBaseline="central"
        fontSize={11}
        fontFamily="DM Sans, sans-serif"
        fontWeight={500}
        fill="hsl(var(--foreground))"
        style={{ userSelect: "none" }}
      >
        {milestone.name}
      </text>

      {/* Tooltip */}
      {showTooltip && (
        <g>
          <rect
            x={x - 10}
            y={centerY - 46}
            width={160}
            height={36}
            rx={6}
            fill="hsl(var(--popover))"
            stroke="hsl(var(--border))"
            strokeWidth={1}
            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
          />
          <text
            x={x - 2}
            y={centerY - 32}
            fontSize={11}
            fontFamily="DM Sans, sans-serif"
            fontWeight={600}
            fill="hsl(var(--foreground))"
          >
            {milestone.name.length > 20
              ? milestone.name.slice(0, 18) + "..."
              : milestone.name}
          </text>
          <text
            x={x - 2}
            y={centerY - 16}
            fontSize={10}
            fontFamily="DM Sans, sans-serif"
            fill="hsl(var(--muted-foreground))"
          >
            {formattedDate}
          </text>
        </g>
      )}
    </g>
  );
}
