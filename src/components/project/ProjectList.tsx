"use client";

import Link from "next/link";
import type { Project } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen } from "lucide-react";

interface ProjectListProps {
  projects: Project[];
}

export function ProjectList({ projects }: ProjectListProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Link key={project.id} href={`/projects/${project.id}`}>
          <Card className="group cursor-pointer transition-shadow duration-200 hover:shadow-md">
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-3">
                <div
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                <CardTitle className="truncate font-heading text-base">
                  {project.name}
                </CardTitle>
              </div>
              {project.description && (
                <CardDescription className="line-clamp-2 text-sm">
                  {project.description}
                </CardDescription>
              )}
              <div className="flex items-center gap-2 pt-1">
                <Badge variant="secondary" className="gap-1 text-xs">
                  <FolderOpen className="h-3 w-3" />
                  {project._count?.tasks ?? 0} tasks
                </Badge>
                {project.archived && (
                  <Badge variant="outline" className="text-xs">
                    Archived
                  </Badge>
                )}
              </div>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}
