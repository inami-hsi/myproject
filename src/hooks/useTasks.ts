import { useEffect, useMemo, useCallback } from "react";
import { useTaskStore } from "@/stores/taskStore";
import { useUIStore } from "@/stores/uiStore";
import type { Task, CreateTaskInput, UpdateTaskInput } from "@/types";

export function useTasks(projectId: string | null) {
  const {
    tasks,
    selectedTask,
    loading,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    setSelectedTask,
    reorderTasks,
  } = useTaskStore();

  const { searchQuery, filterStatus, filterPriority } = useUIStore();

  useEffect(() => {
    if (projectId) {
      fetchTasks(projectId);
    }
  }, [projectId, fetchTasks]);

  const filteredTasks = useMemo(() => {
    let result = tasks;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query),
      );
    }

    if (filterStatus.length > 0) {
      result = result.filter((task) => filterStatus.includes(task.status));
    }

    if (filterPriority.length > 0) {
      result = result.filter((task) => filterPriority.includes(task.priority));
    }

    return result;
  }, [tasks, searchQuery, filterStatus, filterPriority]);

  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [filteredTasks]);

  const tasksByStatus = useMemo(() => {
    const grouped: Record<string, Task[]> = {
      TODO: [],
      IN_PROGRESS: [],
      DONE: [],
      ON_HOLD: [],
    };
    for (const task of filteredTasks) {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    }
    return grouped;
  }, [filteredTasks]);

  const addTask = useCallback(
    async (input: CreateTaskInput) => {
      const task = await createTask(input);
      return task;
    },
    [createTask],
  );

  const editTask = useCallback(
    async (id: string, input: UpdateTaskInput) => {
      await updateTask(id, input);
    },
    [updateTask],
  );

  const removeTask = useCallback(
    async (id: string) => {
      await deleteTask(id);
    },
    [deleteTask],
  );

  return {
    tasks: sortedTasks,
    filteredTasks,
    tasksByStatus,
    selectedTask,
    loading,
    addTask,
    editTask,
    removeTask,
    setSelectedTask,
    reorderTasks,
  };
}
