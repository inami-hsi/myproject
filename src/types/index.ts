export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "ON_HOLD";
export type Priority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type DependencyType = "FS" | "SS" | "FF" | "SF";
export type ViewMode = "gantt" | "kanban" | "calendar" | "list";
export type TimeScale = "day" | "week" | "month";

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  cognitoId: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  archived: boolean;
  userId: string;
  tasks?: Task[];
  milestones?: Milestone[];
  _count?: { tasks: number };
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  progress: number;
  startDate: string | null;
  endDate: string | null;
  dueDate: string | null;
  sortOrder: number;
  projectId: string;
  assigneeId: string | null;
  parentId: string | null;
  tags?: TagOnTask[];
  comments?: Comment[];
  dependencies?: TaskDependency[];
  dependents?: TaskDependency[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskDependency {
  id: string;
  type: DependencyType;
  dependentId: string;
  dependencyId: string;
}

export interface Milestone {
  id: string;
  name: string;
  date: string;
  color: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface TagOnTask {
  taskId: string;
  tagId: string;
  tag?: Tag;
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

// Form types
export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  startDate?: string;
  endDate?: string;
  dueDate?: string;
  projectId: string;
  parentId?: string;
  tagIds?: string[];
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  progress?: number;
  sortOrder?: number;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  color?: string;
}

export interface CreateMilestoneInput {
  name: string;
  date: string;
  color?: string;
  projectId: string;
}

// Gantt specific
export interface GanttTask extends Task {
  barStart: number;
  barWidth: number;
  y: number;
}
