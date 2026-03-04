"use client";

import React, { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import type { Task, TaskStatus } from "@/types";
import KanbanColumn from "./KanbanColumn";
import KanbanCard from "./KanbanCard";

interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskStatusChange: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  onAddTask?: () => void;
}

const STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE", "ON_HOLD"];

export default function KanbanBoard({
  tasks,
  onTaskClick,
  onTaskStatusChange,
  onAddTask,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column
    if (overId.startsWith("column-")) {
      const newStatus = overId.replace("column-", "") as TaskStatus;
      const task = tasks.find((t) => t.id === taskId);

      if (task && task.status !== newStatus) {
        await onTaskStatusChange(taskId, newStatus);
      }
    }
  };

  const tasksByStatus = (status: TaskStatus): Task[] => {
    return tasks.filter((t) => t.status === status);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasksByStatus(status)}
            onTaskClick={onTaskClick}
            onAddTask={onAddTask}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <KanbanCard
            task={activeTask}
            onClick={() => {}}
            isDragging
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
