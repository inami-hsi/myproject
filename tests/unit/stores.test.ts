import { describe, it, expect, vi, beforeEach } from "vitest";
import { act } from "@testing-library/react";
import { useUIStore } from "@/stores/uiStore";
import { useProjectStore } from "@/stores/projectStore";
import { useTaskStore } from "@/stores/taskStore";
import type { Project, Task } from "@/types";

// ---------------------------------------------------------------------------
// Global fetch mock
// ---------------------------------------------------------------------------
const mockFetch = vi.fn();
global.fetch = mockFetch;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockProject(overrides: Partial<Project> = {}): Project {
  return {
    id: "proj-1",
    name: "Test Project",
    description: "A test project",
    color: "#ff0000",
    archived: false,
    userId: "user-1",
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function createMockTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-1",
    title: "Test Task",
    description: "A test task",
    status: "TODO",
    priority: "MEDIUM",
    progress: 0,
    startDate: "2025-01-01",
    endDate: "2025-01-10",
    dueDate: "2025-01-10",
    sortOrder: 0,
    projectId: "proj-1",
    assigneeId: null,
    parentId: null,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function mockJsonResponse(data: unknown, ok = true, status = 200) {
  return Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(data),
  });
}

// ===========================================================================
// UIStore
// ===========================================================================
describe("UIStore", () => {
  const initialState = {
    viewMode: "gantt" as const,
    timeScale: "week" as const,
    sidebarOpen: true,
    taskDetailOpen: false,
    searchQuery: "",
    filterStatus: [] as string[],
    filterPriority: [] as string[],
  };

  beforeEach(() => {
    act(() => {
      useUIStore.setState(initialState);
    });
  });

  // ---- Initial state ----
  describe("initial state", () => {
    it("has viewMode set to 'gantt'", () => {
      expect(useUIStore.getState().viewMode).toBe("gantt");
    });

    it("has timeScale set to 'week'", () => {
      expect(useUIStore.getState().timeScale).toBe("week");
    });

    it("has sidebarOpen set to true", () => {
      expect(useUIStore.getState().sidebarOpen).toBe(true);
    });

    it("has taskDetailOpen set to false", () => {
      expect(useUIStore.getState().taskDetailOpen).toBe(false);
    });

    it("has searchQuery set to empty string", () => {
      expect(useUIStore.getState().searchQuery).toBe("");
    });

    it("has filterStatus set to empty array", () => {
      expect(useUIStore.getState().filterStatus).toEqual([]);
    });

    it("has filterPriority set to empty array", () => {
      expect(useUIStore.getState().filterPriority).toEqual([]);
    });
  });

  // ---- setViewMode ----
  describe("setViewMode", () => {
    it("changes viewMode to 'kanban'", () => {
      act(() => {
        useUIStore.getState().setViewMode("kanban");
      });
      expect(useUIStore.getState().viewMode).toBe("kanban");
    });

    it("changes viewMode to 'calendar'", () => {
      act(() => {
        useUIStore.getState().setViewMode("calendar");
      });
      expect(useUIStore.getState().viewMode).toBe("calendar");
    });

    it("changes viewMode to 'list'", () => {
      act(() => {
        useUIStore.getState().setViewMode("list");
      });
      expect(useUIStore.getState().viewMode).toBe("list");
    });
  });

  // ---- setTimeScale ----
  describe("setTimeScale", () => {
    it("changes timeScale to 'day'", () => {
      act(() => {
        useUIStore.getState().setTimeScale("day");
      });
      expect(useUIStore.getState().timeScale).toBe("day");
    });

    it("changes timeScale to 'month'", () => {
      act(() => {
        useUIStore.getState().setTimeScale("month");
      });
      expect(useUIStore.getState().timeScale).toBe("month");
    });
  });

  // ---- toggleSidebar ----
  describe("toggleSidebar", () => {
    it("toggles sidebarOpen from true to false", () => {
      act(() => {
        useUIStore.getState().toggleSidebar();
      });
      expect(useUIStore.getState().sidebarOpen).toBe(false);
    });

    it("toggles sidebarOpen from false to true", () => {
      act(() => {
        useUIStore.setState({ sidebarOpen: false });
      });
      act(() => {
        useUIStore.getState().toggleSidebar();
      });
      expect(useUIStore.getState().sidebarOpen).toBe(true);
    });
  });

  // ---- setTaskDetailOpen ----
  describe("setTaskDetailOpen", () => {
    it("sets taskDetailOpen to true", () => {
      act(() => {
        useUIStore.getState().setTaskDetailOpen(true);
      });
      expect(useUIStore.getState().taskDetailOpen).toBe(true);
    });

    it("sets taskDetailOpen to false", () => {
      act(() => {
        useUIStore.setState({ taskDetailOpen: true });
      });
      act(() => {
        useUIStore.getState().setTaskDetailOpen(false);
      });
      expect(useUIStore.getState().taskDetailOpen).toBe(false);
    });
  });

  // ---- setSearchQuery ----
  describe("setSearchQuery", () => {
    it("sets searchQuery to a value", () => {
      act(() => {
        useUIStore.getState().setSearchQuery("find this");
      });
      expect(useUIStore.getState().searchQuery).toBe("find this");
    });

    it("clears searchQuery with empty string", () => {
      act(() => {
        useUIStore.getState().setSearchQuery("query");
      });
      act(() => {
        useUIStore.getState().setSearchQuery("");
      });
      expect(useUIStore.getState().searchQuery).toBe("");
    });
  });

  // ---- setFilterStatus ----
  describe("setFilterStatus", () => {
    it("sets filterStatus to an array of statuses", () => {
      act(() => {
        useUIStore.getState().setFilterStatus(["TODO", "DONE"]);
      });
      expect(useUIStore.getState().filterStatus).toEqual(["TODO", "DONE"]);
    });

    it("clears filterStatus with empty array", () => {
      act(() => {
        useUIStore.getState().setFilterStatus(["TODO"]);
      });
      act(() => {
        useUIStore.getState().setFilterStatus([]);
      });
      expect(useUIStore.getState().filterStatus).toEqual([]);
    });
  });

  // ---- setFilterPriority ----
  describe("setFilterPriority", () => {
    it("sets filterPriority to an array of priorities", () => {
      act(() => {
        useUIStore.getState().setFilterPriority(["HIGH", "CRITICAL"]);
      });
      expect(useUIStore.getState().filterPriority).toEqual([
        "HIGH",
        "CRITICAL",
      ]);
    });

    it("clears filterPriority with empty array", () => {
      act(() => {
        useUIStore.getState().setFilterPriority(["LOW"]);
      });
      act(() => {
        useUIStore.getState().setFilterPriority([]);
      });
      expect(useUIStore.getState().filterPriority).toEqual([]);
    });
  });
});

// ===========================================================================
// ProjectStore
// ===========================================================================
describe("ProjectStore", () => {
  const initialState = {
    projects: [] as Project[],
    currentProject: null as Project | null,
    loading: false,
  };

  beforeEach(() => {
    act(() => {
      useProjectStore.setState(initialState);
    });
    mockFetch.mockReset();
  });

  // ---- Initial state ----
  describe("initial state", () => {
    it("has empty projects array", () => {
      expect(useProjectStore.getState().projects).toEqual([]);
    });

    it("has null currentProject", () => {
      expect(useProjectStore.getState().currentProject).toBeNull();
    });

    it("has loading set to false", () => {
      expect(useProjectStore.getState().loading).toBe(false);
    });
  });

  // ---- fetchProjects ----
  describe("fetchProjects", () => {
    it("fetches projects and sets them in state", async () => {
      const projects = [
        createMockProject({ id: "p1", name: "Project 1" }),
        createMockProject({ id: "p2", name: "Project 2" }),
      ];
      mockFetch.mockReturnValueOnce(mockJsonResponse(projects));

      await act(async () => {
        await useProjectStore.getState().fetchProjects();
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/projects");
      expect(useProjectStore.getState().projects).toEqual(projects);
      expect(useProjectStore.getState().loading).toBe(false);
    });

    it("sets loading to true during fetch", async () => {
      let loadingDuringFetch = false;
      mockFetch.mockImplementationOnce(() => {
        loadingDuringFetch = useProjectStore.getState().loading;
        return mockJsonResponse([]);
      });

      await act(async () => {
        await useProjectStore.getState().fetchProjects();
      });

      expect(loadingDuringFetch).toBe(true);
    });

    it("sets loading to false after fetch failure", async () => {
      mockFetch.mockReturnValueOnce(
        mockJsonResponse(null, false, 500)
      );

      await act(async () => {
        await useProjectStore.getState().fetchProjects();
      });

      expect(useProjectStore.getState().loading).toBe(false);
    });
  });

  // ---- createProject ----
  describe("createProject", () => {
    it("creates a project and prepends it to the list", async () => {
      const existing = createMockProject({ id: "p1", name: "Existing" });
      act(() => {
        useProjectStore.setState({ projects: [existing] });
      });

      const newProject = createMockProject({ id: "p2", name: "New Project" });
      mockFetch.mockReturnValueOnce(mockJsonResponse(newProject));

      await act(async () => {
        const result = await useProjectStore.getState().createProject({
          name: "New Project",
          description: "desc",
          color: "#00ff00",
        });
        expect(result).toEqual(newProject);
      });

      const projects = useProjectStore.getState().projects;
      expect(projects).toHaveLength(2);
      expect(projects[0].id).toBe("p2");
      expect(projects[1].id).toBe("p1");
    });

    it("sends POST request with correct headers and body", async () => {
      const newProject = createMockProject();
      mockFetch.mockReturnValueOnce(mockJsonResponse(newProject));

      const input = { name: "Test", description: "desc", color: "#000" };
      await act(async () => {
        await useProjectStore.getState().createProject(input);
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
    });

    it("throws when response is not ok", async () => {
      mockFetch.mockReturnValueOnce(
        mockJsonResponse({ error: "Bad request" }, false, 400)
      );

      await expect(
        act(async () => {
          await useProjectStore.getState().createProject({ name: "fail" });
        })
      ).rejects.toThrow("Bad request");
    });
  });

  // ---- updateProject ----
  describe("updateProject", () => {
    it("updates a project in the list", async () => {
      const project = createMockProject({ id: "p1", name: "Old Name" });
      act(() => {
        useProjectStore.setState({ projects: [project] });
      });

      const updated = { ...project, name: "New Name" };
      mockFetch.mockReturnValueOnce(mockJsonResponse(updated));

      await act(async () => {
        await useProjectStore.getState().updateProject("p1", {
          name: "New Name",
        });
      });

      expect(useProjectStore.getState().projects[0].name).toBe("New Name");
    });

    it("updates currentProject if it matches the updated project", async () => {
      const project = createMockProject({ id: "p1", name: "Old" });
      act(() => {
        useProjectStore.setState({
          projects: [project],
          currentProject: project,
        });
      });

      const updated = { ...project, name: "Updated" };
      mockFetch.mockReturnValueOnce(mockJsonResponse(updated));

      await act(async () => {
        await useProjectStore.getState().updateProject("p1", {
          name: "Updated",
        });
      });

      expect(useProjectStore.getState().currentProject?.name).toBe("Updated");
    });

    it("does not change currentProject if ids do not match", async () => {
      const project1 = createMockProject({ id: "p1", name: "P1" });
      const project2 = createMockProject({ id: "p2", name: "P2" });
      act(() => {
        useProjectStore.setState({
          projects: [project1, project2],
          currentProject: project1,
        });
      });

      const updatedP2 = { ...project2, name: "Updated P2" };
      mockFetch.mockReturnValueOnce(mockJsonResponse(updatedP2));

      await act(async () => {
        await useProjectStore.getState().updateProject("p2", {
          name: "Updated P2",
        });
      });

      expect(useProjectStore.getState().currentProject?.name).toBe("P1");
    });

    it("sends PUT request with correct parameters", async () => {
      const project = createMockProject({ id: "p1" });
      act(() => {
        useProjectStore.setState({ projects: [project] });
      });
      mockFetch.mockReturnValueOnce(mockJsonResponse(project));

      const input = { name: "New" };
      await act(async () => {
        await useProjectStore.getState().updateProject("p1", input);
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/projects/p1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
    });

    it("throws when response is not ok", async () => {
      const project = createMockProject({ id: "p1" });
      act(() => {
        useProjectStore.setState({ projects: [project] });
      });

      mockFetch.mockReturnValueOnce(
        mockJsonResponse({ error: "Not found" }, false, 404)
      );

      await expect(
        act(async () => {
          await useProjectStore.getState().updateProject("p1", { name: "X" });
        })
      ).rejects.toThrow("Not found");
    });
  });

  // ---- deleteProject ----
  describe("deleteProject", () => {
    it("removes the project from the list", async () => {
      const p1 = createMockProject({ id: "p1" });
      const p2 = createMockProject({ id: "p2" });
      act(() => {
        useProjectStore.setState({ projects: [p1, p2] });
      });

      mockFetch.mockReturnValueOnce(mockJsonResponse(null));

      await act(async () => {
        await useProjectStore.getState().deleteProject("p1");
      });

      const projects = useProjectStore.getState().projects;
      expect(projects).toHaveLength(1);
      expect(projects[0].id).toBe("p2");
    });

    it("clears currentProject if the deleted project was current", async () => {
      const project = createMockProject({ id: "p1" });
      act(() => {
        useProjectStore.setState({
          projects: [project],
          currentProject: project,
        });
      });

      mockFetch.mockReturnValueOnce(mockJsonResponse(null));

      await act(async () => {
        await useProjectStore.getState().deleteProject("p1");
      });

      expect(useProjectStore.getState().currentProject).toBeNull();
    });

    it("keeps currentProject if deleted project is different", async () => {
      const p1 = createMockProject({ id: "p1" });
      const p2 = createMockProject({ id: "p2" });
      act(() => {
        useProjectStore.setState({
          projects: [p1, p2],
          currentProject: p1,
        });
      });

      mockFetch.mockReturnValueOnce(mockJsonResponse(null));

      await act(async () => {
        await useProjectStore.getState().deleteProject("p2");
      });

      expect(useProjectStore.getState().currentProject?.id).toBe("p1");
    });

    it("sends DELETE request", async () => {
      const project = createMockProject({ id: "p1" });
      act(() => {
        useProjectStore.setState({ projects: [project] });
      });

      mockFetch.mockReturnValueOnce(mockJsonResponse(null));

      await act(async () => {
        await useProjectStore.getState().deleteProject("p1");
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/projects/p1", {
        method: "DELETE",
      });
    });

    it("throws when response is not ok", async () => {
      const project = createMockProject({ id: "p1" });
      act(() => {
        useProjectStore.setState({ projects: [project] });
      });

      mockFetch.mockReturnValueOnce(
        mockJsonResponse({ error: "Forbidden" }, false, 403)
      );

      await expect(
        act(async () => {
          await useProjectStore.getState().deleteProject("p1");
        })
      ).rejects.toThrow("Forbidden");
    });
  });

  // ---- setCurrentProject ----
  describe("setCurrentProject", () => {
    it("sets the currentProject", () => {
      const project = createMockProject({ id: "p1" });
      act(() => {
        useProjectStore.getState().setCurrentProject(project);
      });
      expect(useProjectStore.getState().currentProject).toEqual(project);
    });

    it("clears currentProject when set to null", () => {
      const project = createMockProject({ id: "p1" });
      act(() => {
        useProjectStore.setState({ currentProject: project });
      });
      act(() => {
        useProjectStore.getState().setCurrentProject(null);
      });
      expect(useProjectStore.getState().currentProject).toBeNull();
    });
  });
});

// ===========================================================================
// TaskStore
// ===========================================================================
describe("TaskStore", () => {
  const initialState = {
    tasks: [] as Task[],
    selectedTask: null as Task | null,
    loading: false,
  };

  beforeEach(() => {
    act(() => {
      useTaskStore.setState(initialState);
    });
    mockFetch.mockReset();
  });

  // ---- Initial state ----
  describe("initial state", () => {
    it("has empty tasks array", () => {
      expect(useTaskStore.getState().tasks).toEqual([]);
    });

    it("has null selectedTask", () => {
      expect(useTaskStore.getState().selectedTask).toBeNull();
    });

    it("has loading set to false", () => {
      expect(useTaskStore.getState().loading).toBe(false);
    });
  });

  // ---- fetchTasks ----
  describe("fetchTasks", () => {
    it("fetches tasks with projectId query param", async () => {
      const tasks = [
        createMockTask({ id: "t1", title: "Task 1" }),
        createMockTask({ id: "t2", title: "Task 2" }),
      ];
      mockFetch.mockReturnValueOnce(mockJsonResponse(tasks));

      await act(async () => {
        await useTaskStore.getState().fetchTasks("proj-1");
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/tasks?projectId=proj-1");
      expect(useTaskStore.getState().tasks).toEqual(tasks);
    });

    it("sets loading to true during fetch", async () => {
      let loadingDuringFetch = false;
      mockFetch.mockImplementationOnce(() => {
        loadingDuringFetch = useTaskStore.getState().loading;
        return mockJsonResponse([]);
      });

      await act(async () => {
        await useTaskStore.getState().fetchTasks("proj-1");
      });

      expect(loadingDuringFetch).toBe(true);
    });

    it("sets loading to false after fetch completes", async () => {
      mockFetch.mockReturnValueOnce(mockJsonResponse([]));

      await act(async () => {
        await useTaskStore.getState().fetchTasks("proj-1");
      });

      expect(useTaskStore.getState().loading).toBe(false);
    });

    it("sets loading to false after fetch failure", async () => {
      mockFetch.mockReturnValueOnce(
        mockJsonResponse(null, false, 500)
      );

      await act(async () => {
        await useTaskStore.getState().fetchTasks("proj-1");
      });

      expect(useTaskStore.getState().loading).toBe(false);
    });
  });

  // ---- createTask ----
  describe("createTask", () => {
    it("creates a task and appends it to the list", async () => {
      const existing = createMockTask({ id: "t1", title: "Existing" });
      act(() => {
        useTaskStore.setState({ tasks: [existing] });
      });

      const newTask = createMockTask({ id: "t2", title: "New Task" });
      mockFetch.mockReturnValueOnce(mockJsonResponse(newTask));

      await act(async () => {
        const result = await useTaskStore.getState().createTask({
          title: "New Task",
          projectId: "proj-1",
        });
        expect(result).toEqual(newTask);
      });

      const tasks = useTaskStore.getState().tasks;
      expect(tasks).toHaveLength(2);
      expect(tasks[0].id).toBe("t1");
      expect(tasks[1].id).toBe("t2");
    });

    it("sends POST request with correct headers and body", async () => {
      const newTask = createMockTask();
      mockFetch.mockReturnValueOnce(mockJsonResponse(newTask));

      const input = { title: "Test", projectId: "proj-1" };
      await act(async () => {
        await useTaskStore.getState().createTask(input);
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
    });

    it("throws when response is not ok", async () => {
      mockFetch.mockReturnValueOnce(
        mockJsonResponse({ error: "Validation error" }, false, 400)
      );

      await expect(
        act(async () => {
          await useTaskStore.getState().createTask({
            title: "",
            projectId: "proj-1",
          });
        })
      ).rejects.toThrow("Validation error");
    });
  });

  // ---- updateTask ----
  describe("updateTask", () => {
    it("updates a task in the list", async () => {
      const task = createMockTask({ id: "t1", title: "Old Title" });
      act(() => {
        useTaskStore.setState({ tasks: [task] });
      });

      const updated = { ...task, title: "New Title" };
      mockFetch.mockReturnValueOnce(mockJsonResponse(updated));

      await act(async () => {
        await useTaskStore.getState().updateTask("t1", {
          title: "New Title",
        });
      });

      expect(useTaskStore.getState().tasks[0].title).toBe("New Title");
    });

    it("updates selectedTask if it matches the updated task", async () => {
      const task = createMockTask({ id: "t1", status: "TODO" });
      act(() => {
        useTaskStore.setState({ tasks: [task], selectedTask: task });
      });

      const updated = { ...task, status: "DONE" as const };
      mockFetch.mockReturnValueOnce(mockJsonResponse(updated));

      await act(async () => {
        await useTaskStore.getState().updateTask("t1", { status: "DONE" });
      });

      expect(useTaskStore.getState().selectedTask?.status).toBe("DONE");
    });

    it("does not change selectedTask if ids do not match", async () => {
      const t1 = createMockTask({ id: "t1", title: "T1" });
      const t2 = createMockTask({ id: "t2", title: "T2" });
      act(() => {
        useTaskStore.setState({ tasks: [t1, t2], selectedTask: t1 });
      });

      const updatedT2 = { ...t2, title: "Updated T2" };
      mockFetch.mockReturnValueOnce(mockJsonResponse(updatedT2));

      await act(async () => {
        await useTaskStore.getState().updateTask("t2", {
          title: "Updated T2",
        });
      });

      expect(useTaskStore.getState().selectedTask?.title).toBe("T1");
    });

    it("sends PUT request with correct parameters", async () => {
      const task = createMockTask({ id: "t1" });
      act(() => {
        useTaskStore.setState({ tasks: [task] });
      });
      mockFetch.mockReturnValueOnce(mockJsonResponse(task));

      const input = { title: "Updated" };
      await act(async () => {
        await useTaskStore.getState().updateTask("t1", input);
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/tasks/t1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
    });

    it("throws when response is not ok", async () => {
      const task = createMockTask({ id: "t1" });
      act(() => {
        useTaskStore.setState({ tasks: [task] });
      });

      mockFetch.mockReturnValueOnce(
        mockJsonResponse({ error: "Server error" }, false, 500)
      );

      await expect(
        act(async () => {
          await useTaskStore.getState().updateTask("t1", { title: "X" });
        })
      ).rejects.toThrow("Server error");
    });
  });

  // ---- deleteTask ----
  describe("deleteTask", () => {
    it("removes the task from the list", async () => {
      const t1 = createMockTask({ id: "t1" });
      const t2 = createMockTask({ id: "t2" });
      act(() => {
        useTaskStore.setState({ tasks: [t1, t2] });
      });

      mockFetch.mockReturnValueOnce(mockJsonResponse(null));

      await act(async () => {
        await useTaskStore.getState().deleteTask("t1");
      });

      const tasks = useTaskStore.getState().tasks;
      expect(tasks).toHaveLength(1);
      expect(tasks[0].id).toBe("t2");
    });

    it("clears selectedTask if the deleted task was selected", async () => {
      const task = createMockTask({ id: "t1" });
      act(() => {
        useTaskStore.setState({ tasks: [task], selectedTask: task });
      });

      mockFetch.mockReturnValueOnce(mockJsonResponse(null));

      await act(async () => {
        await useTaskStore.getState().deleteTask("t1");
      });

      expect(useTaskStore.getState().selectedTask).toBeNull();
    });

    it("keeps selectedTask if deleted task is different", async () => {
      const t1 = createMockTask({ id: "t1" });
      const t2 = createMockTask({ id: "t2" });
      act(() => {
        useTaskStore.setState({ tasks: [t1, t2], selectedTask: t1 });
      });

      mockFetch.mockReturnValueOnce(mockJsonResponse(null));

      await act(async () => {
        await useTaskStore.getState().deleteTask("t2");
      });

      expect(useTaskStore.getState().selectedTask?.id).toBe("t1");
    });

    it("sends DELETE request", async () => {
      const task = createMockTask({ id: "t1" });
      act(() => {
        useTaskStore.setState({ tasks: [task] });
      });

      mockFetch.mockReturnValueOnce(mockJsonResponse(null));

      await act(async () => {
        await useTaskStore.getState().deleteTask("t1");
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/tasks/t1", {
        method: "DELETE",
      });
    });

    it("throws when response is not ok", async () => {
      const task = createMockTask({ id: "t1" });
      act(() => {
        useTaskStore.setState({ tasks: [task] });
      });

      mockFetch.mockReturnValueOnce(
        mockJsonResponse({ error: "Forbidden" }, false, 403)
      );

      await expect(
        act(async () => {
          await useTaskStore.getState().deleteTask("t1");
        })
      ).rejects.toThrow("Forbidden");
    });
  });

  // ---- setSelectedTask ----
  describe("setSelectedTask", () => {
    it("sets the selectedTask", () => {
      const task = createMockTask({ id: "t1" });
      act(() => {
        useTaskStore.getState().setSelectedTask(task);
      });
      expect(useTaskStore.getState().selectedTask).toEqual(task);
    });

    it("clears selectedTask when set to null", () => {
      const task = createMockTask({ id: "t1" });
      act(() => {
        useTaskStore.setState({ selectedTask: task });
      });
      act(() => {
        useTaskStore.getState().setSelectedTask(null);
      });
      expect(useTaskStore.getState().selectedTask).toBeNull();
    });
  });

  // ---- reorderTasks ----
  describe("reorderTasks", () => {
    it("replaces tasks with reordered list", () => {
      const t1 = createMockTask({ id: "t1", sortOrder: 0 });
      const t2 = createMockTask({ id: "t2", sortOrder: 1 });
      const t3 = createMockTask({ id: "t3", sortOrder: 2 });
      act(() => {
        useTaskStore.setState({ tasks: [t1, t2, t3] });
      });

      const reordered = [
        { ...t3, sortOrder: 0 },
        { ...t1, sortOrder: 1 },
        { ...t2, sortOrder: 2 },
      ];
      act(() => {
        useTaskStore.getState().reorderTasks(reordered);
      });

      const tasks = useTaskStore.getState().tasks;
      expect(tasks[0].id).toBe("t3");
      expect(tasks[1].id).toBe("t1");
      expect(tasks[2].id).toBe("t2");
      expect(tasks[0].sortOrder).toBe(0);
      expect(tasks[1].sortOrder).toBe(1);
      expect(tasks[2].sortOrder).toBe(2);
    });

    it("can set an empty task list", () => {
      const t1 = createMockTask({ id: "t1" });
      act(() => {
        useTaskStore.setState({ tasks: [t1] });
      });
      act(() => {
        useTaskStore.getState().reorderTasks([]);
      });
      expect(useTaskStore.getState().tasks).toEqual([]);
    });
  });
});
