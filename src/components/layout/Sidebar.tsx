"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useProjectStore } from "@/stores/projectStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CheckSquare,
  FolderOpen,
  Plus,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const params = useParams();
  const activeProjectId = params.projectId as string | undefined;
  const { projects, fetchProjects } = useProjectStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleClick = () => {
    onNavigate?.();
  };

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
          <CheckSquare className="h-4 w-4 text-accent-foreground" />
        </div>
        <span className="text-lg font-bold font-heading tracking-tight">
          TaskFlow
        </span>
      </div>

      {/* Navigation */}
      <div className="px-3 py-4">
        <Link href="/dashboard" onClick={handleClick}>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2",
              pathname === "/dashboard" && "bg-secondary"
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Button>
        </Link>
      </div>

      <Separator />

      {/* Projects */}
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-heading">
          Projects
        </span>
        <Link href="/dashboard" onClick={handleClick}>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 pb-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              onClick={handleClick}
            >
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2 text-sm",
                  activeProjectId === project.id && "bg-secondary"
                )}
              >
                <div
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: project.color }}
                />
                <span className="truncate">{project.name}</span>
                {project._count && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {project._count.tasks}
                  </span>
                )}
              </Button>
            </Link>
          ))}

          {projects.length === 0 && (
            <p className="px-2 py-4 text-center text-xs text-muted-foreground">
              No projects yet
            </p>
          )}
        </div>
      </ScrollArea>

      <Separator />

      {/* Bottom Nav */}
      <div className="p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-sm"
          onClick={handleClick}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </div>
    </div>
  );
}
