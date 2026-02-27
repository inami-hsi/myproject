"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useProjectStore } from "@/stores/projectStore";
import { useTaskStore } from "@/stores/taskStore";
import { useUIStore } from "@/stores/uiStore";
import { TaskDetail } from "@/components/task/TaskDetail";
import { TaskFilters } from "@/components/task/TaskFilters";
import { TaskForm } from "@/components/task/TaskForm";
import { ProjectSidebar } from "@/components/project/ProjectSidebar";
import { useMilestones } from "@/hooks/useMilestones";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  GanttChart,
  Kanban,
  Calendar,
  List,
  Plus,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";
import type { ViewMode } from "@/types";

// Lazy-loaded view components
const GanttView = dynamic(
  () => import("@/components/gantt/GanttChart"),
  { ssr: false }
);

const KanbanView = dynamic(
  () => import("@/components/kanban/KanbanColumn"),
  { ssr: false }
);

const CalendarView = dynamic(
  () => import("@/components/calendar/CalendarView"),
  { ssr: false }
);

const ListView = dynamic(
  () => import("@/components/list/ListView"),
  { ssr: false }
);

const VIEW_ICONS: Record<ViewMode, React.ReactNode> = {
  gantt: <GanttChart className="h-4 w-4" />,
  kanban: <Kanban className="h-4 w-4" />,
  calendar: <Calendar className="h-4 w-4" />,
  list: <List className="h-4 w-4" />,
};

const VIEW_LABELS: Record<ViewMode, string> = {
  gantt: "ガント",
  kanban: "カンバン",
  calendar: "カレンダー",
  list: "リスト",
};

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const { currentProject, fetchProject, loading: projectLoading } =
    useProjectStore();
  const { tasks, selectedTask, fetchTasks, setSelectedTask, updateTask, loading: taskLoading } =
    useTaskStore();
  const { viewMode, setViewMode, taskDetailOpen, setTaskDetailOpen } =
    useUIStore();
  const { milestones, fetchMilestones } = useMilestones(projectId);

  const [createOpen, setCreateOpen] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
      fetchTasks(projectId);
      fetchMilestones();
    }
  }, [projectId, fetchProject, fetchTasks, fetchMilestones]);

  const loading = projectLoading || taskLoading;

  if (loading && !currentProject) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Project Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {currentProject && (
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: currentProject.color }}
            />
          )}
          <h1 className="text-2xl font-bold font-heading tracking-tight">
            {currentProject?.name ?? "プロジェクト"}
          </h1>
          <span className="text-sm text-muted-foreground">
            {tasks.length}件のタスク
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFiltersVisible(!filtersVisible)}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            フィルター
          </Button>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                タスクを追加
              </Button>
            </DialogTrigger>
            <TaskForm
              projectId={projectId}
              onSuccess={() => setCreateOpen(false)}
            />
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      {filtersVisible && <TaskFilters />}

      {/* View Tabs */}
      <Tabs
        value={viewMode}
        onValueChange={(v) => setViewMode(v as ViewMode)}
      >
        <TabsList>
          {(Object.keys(VIEW_LABELS) as ViewMode[]).map((mode) => (
            <TabsTrigger key={mode} value={mode} className="gap-2">
              {VIEW_ICONS[mode]}
              <span className="hidden sm:inline">{VIEW_LABELS[mode]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="gantt">
          <GanttView
            tasks={tasks}
            milestones={milestones}
            onTaskClick={(task) => {
              setSelectedTask(task);
              setTaskDetailOpen(true);
            }}
            onTaskUpdate={(id, updates) => updateTask(id, updates)}
          />
        </TabsContent>
        <TabsContent value="kanban">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(["TODO", "IN_PROGRESS", "DONE", "ON_HOLD"] as const).map((status) => (
              <KanbanView
                key={status}
                status={status}
                tasks={tasks.filter((t) => t.status === status)}
                onTaskClick={(task) => {
                  setSelectedTask(task);
                  setTaskDetailOpen(true);
                }}
                onAddTask={() => setCreateOpen(true)}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="calendar">
          <CalendarView />
        </TabsContent>
        <TabsContent value="list">
          <ListView />
        </TabsContent>
      </Tabs>

      {/* Task Detail Side Panel */}
      <Sheet
        open={taskDetailOpen && selectedTask !== null}
        onOpenChange={(open) => {
          setTaskDetailOpen(open);
          if (!open) setSelectedTask(null);
        }}
      >
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>タスク詳細</SheetTitle>
          </SheetHeader>
          {selectedTask && (
            <TaskDetail
              task={selectedTask}
              onClose={() => {
                setTaskDetailOpen(false);
                setSelectedTask(null);
              }}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Project Sidebar Info (on larger screens, shown as aside) */}
      <div className="mt-6 lg:hidden">
        <ProjectSidebar project={currentProject} tasks={tasks} />
      </div>
    </div>
  );
}
