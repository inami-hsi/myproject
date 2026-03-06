"use client";

import { useEffect, useState } from "react";
import { useProjectStore } from "@/stores/projectStore";
import { ProjectList } from "@/components/project/ProjectList";
import { ProjectForm } from "@/components/project/ProjectForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { projects, loading, fetchProjects } = useProjectStore();
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading tracking-tight">
            プロジェクト
          </h1>
          <p className="text-sm text-muted-foreground">
            プロジェクトとタスクを管理
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="mr-2 h-4 w-4" />
              新規プロジェクト
            </Button>
          </DialogTrigger>
          <ProjectForm onSuccess={() => setCreateOpen(false)} />
        </Dialog>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <p className="mb-4 text-muted-foreground">
            プロジェクトがまだありません。最初のプロジェクトを作成してください。
          </p>
          <Button
            onClick={() => setCreateOpen(true)}
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" />
            プロジェクトを作成
          </Button>
        </div>
      ) : (
        <ProjectList projects={projects} />
      )}
    </div>
  );
}
