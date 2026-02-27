import { create } from "zustand";
import type { Project, CreateProjectInput } from "@/types";

interface ProjectStore {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  createProject: (input: CreateProjectInput) => Promise<Project>;
  updateProject: (id: string, input: Partial<CreateProjectInput>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  currentProject: null,
  loading: false,

  fetchProjects: async () => {
    set({ loading: true });
    try {
      const response = await fetch("/api/projects");
      if (!response.ok) throw new Error("Failed to fetch projects");
      const projects = await response.json();
      set({ projects });
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      set({ loading: false });
    }
  },

  fetchProject: async (id: string) => {
    set({ loading: true });
    try {
      const response = await fetch(`/api/projects/${id}`);
      if (!response.ok) throw new Error("Failed to fetch project");
      const project = await response.json();
      set({ currentProject: project });
    } catch (error) {
      console.error("Failed to fetch project:", error);
    } finally {
      set({ loading: false });
    }
  },

  createProject: async (input: CreateProjectInput) => {
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to create project");
    }
    const project = await response.json();
    set({ projects: [project, ...get().projects] });
    return project;
  },

  updateProject: async (id: string, input: Partial<CreateProjectInput>) => {
    const response = await fetch(`/api/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to update project");
    }
    const updated = await response.json();
    set({
      projects: get().projects.map((p) => (p.id === id ? updated : p)),
      currentProject:
        get().currentProject?.id === id ? updated : get().currentProject,
    });
  },

  deleteProject: async (id: string) => {
    const response = await fetch(`/api/projects/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to delete project");
    }
    set({
      projects: get().projects.filter((p) => p.id !== id),
      currentProject:
        get().currentProject?.id === id ? null : get().currentProject,
    });
  },

  setCurrentProject: (project: Project | null) => {
    set({ currentProject: project });
  },
}));
