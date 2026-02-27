import { useEffect, useCallback } from "react";
import { useProjectStore } from "@/stores/projectStore";
import type { CreateProjectInput } from "@/types";

export function useProjects() {
  const {
    projects,
    currentProject,
    loading,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    setCurrentProject,
  } = useProjectStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const selectProject = useCallback(
    (id: string) => {
      fetchProject(id);
    },
    [fetchProject],
  );

  const addProject = useCallback(
    async (input: CreateProjectInput) => {
      const project = await createProject(input);
      return project;
    },
    [createProject],
  );

  const editProject = useCallback(
    async (id: string, input: Partial<CreateProjectInput>) => {
      await updateProject(id, input);
    },
    [updateProject],
  );

  const removeProject = useCallback(
    async (id: string) => {
      await deleteProject(id);
    },
    [deleteProject],
  );

  return {
    projects,
    currentProject,
    loading,
    selectProject,
    addProject,
    editProject,
    removeProject,
    setCurrentProject,
  };
}
