"use client";

import { useState } from "react";
import { useMilestones } from "@/hooks/useMilestones";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import {
  CalendarDays,
  Loader2,
  Milestone as MilestoneIcon,
  Plus,
  Trash2,
} from "lucide-react";

interface MilestoneManagerProps {
  projectId: string;
}

const MILESTONE_COLORS = [
  "#d97757",
  "#6a9bcc",
  "#788c5d",
  "#b0aea5",
  "#e4572e",
  "#2a9d8f",
  "#e9c46a",
  "#264653",
];

export function MilestoneManager({ projectId }: MilestoneManagerProps) {
  const { milestones, loading, createMilestone, deleteMilestone } =
    useMilestones(projectId);

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [color, setColor] = useState(MILESTONE_COLORS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleAdd = async () => {
    const trimmed = name.trim();
    if (!trimmed || !date) return;

    setSubmitting(true);
    try {
      await createMilestone({
        name: trimmed,
        date,
        color,
        projectId,
      });
      setName("");
      setDate("");
      setColor(MILESTONE_COLORS[0]);
    } catch (error) {
      console.error("Failed to create milestone:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }

    setDeletingId(id);
    setConfirmDeleteId(null);
    try {
      await deleteMilestone(id);
    } catch (error) {
      console.error("Failed to delete milestone:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Milestone list */}
      {milestones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
          <MilestoneIcon className="mb-2 h-8 w-8" />
          <p className="text-sm">マイルストーンがありません</p>
        </div>
      ) : (
        <div className="space-y-2">
          {milestones.map((milestone) => (
            <div
              key={milestone.id}
              className="flex items-center gap-3 rounded-md border px-3 py-2"
            >
              <div
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: milestone.color }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium font-heading">
                  {milestone.name}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarDays className="h-3 w-3" />
                  <span>{formatDate(milestone.date)}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label={confirmDeleteId === milestone.id ? `マイルストーンを削除確認: ${milestone.name}` : `マイルストーンを削除: ${milestone.name}`}
                className={cn(
                  "h-7 w-7 shrink-0",
                  confirmDeleteId === milestone.id &&
                    "text-destructive hover:text-destructive"
                )}
                onClick={() => handleDelete(milestone.id)}
                disabled={deletingId === milestone.id}
              >
                {deletingId === milestone.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          ))}
        </div>
      )}

      <Separator />

      {/* Add milestone form */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Input
            placeholder="マイルストーン名"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-sm"
          />
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-40 shrink-0 text-sm"
          />
        </div>

        {/* Color picker */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground shrink-0">カラー:</span>
          <div className="flex flex-wrap gap-1.5">
            {MILESTONE_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`カラーを選択: ${c}`}
                className={cn(
                  "h-5 w-5 rounded-full border-2 transition-all duration-200",
                  color === c
                    ? "border-foreground scale-110"
                    : "border-transparent hover:border-muted-foreground/40"
                )}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>

        <Button
          size="sm"
          onClick={handleAdd}
          disabled={!name.trim() || !date || submitting}
          className="w-full gap-1.5"
        >
          {submitting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
          マイルストーンを追加
        </Button>
      </div>
    </div>
  );
}
