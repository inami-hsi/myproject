import { create } from "zustand";
import type { Task, CreateTaskInput, UpdateTaskInput } from "@/types";

interface TaskStore {
  tasks: Task[];
  selectedTask: Task | null;
  loading: boolean;
  fetchTasks: (projectId: string) => Promise<void>;
  createTask: (input: CreateTaskInput) => Promise<Task>;
  updateTask: (id: string, input: UpdateTaskInput) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setSelectedTask: (task: Task | null) => void;
  reorderTasks: (tasks: Task[]) => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  selectedTask: null,
  loading: false,

  fetchTasks: async (projectId: string) => {
    set({ loading: true });
    try {
      const response = await fetch(`/api/tasks?projectId=${projectId}`);
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const tasks = await response.json();
      set({ tasks });
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      set({ loading: false });
    }
  },

  createTask: async (input: CreateTaskInput) => {
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to create task");
    }
    const task = await response.json();
    set({ tasks: [...get().tasks, task] });
    return task;
  },

  updateTask: async (id: string, input: UpdateTaskInput) => {
    const response = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to update task");
    }
    const updated = await response.json();
    set({
      tasks: get().tasks.map((t) => (t.id === id ? updated : t)),
      selectedTask:
        get().selectedTask?.id === id ? updated : get().selectedTask,
    });
  },

  deleteTask: async (id: string) => {
    const response = await fetch(`/api/tasks/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to delete task");
    }
    set({
      tasks: get().tasks.filter((t) => t.id !== id),
      selectedTask:
        get().selectedTask?.id === id ? null : get().selectedTask,
    });
  },

  setSelectedTask: (task: Task | null) => {
    set({ selectedTask: task });
  },

  reorderTasks: (tasks: Task[]) => {
    set({ tasks });
  },
}));
