"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Loader2, Plus, Tag as TagIcon } from "lucide-react";
import type { Tag } from "@/types";

interface TagManagerProps {
  projectId: string;
}

const PRESET_COLORS = [
  "#d97757",
  "#6a9bcc",
  "#788c5d",
  "#e4572e",
  "#2a9d8f",
  "#e9c46a",
  "#9b5de5",
  "#264653",
];

export function TagManager({ projectId }: TagManagerProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [submitting, setSubmitting] = useState(false);

  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tags?projectId=${projectId}`);
      if (!response.ok) throw new Error("Failed to fetch tags");
      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleAdd = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, color, projectId }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to create tag");
      }
      const tag = await response.json();
      setTags((prev) => [...prev, tag]);
      setName("");
      setColor(PRESET_COLORS[0]);
    } catch (error) {
      console.error("Failed to create tag:", error);
    } finally {
      setSubmitting(false);
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
      {/* Tag chips */}
      {tags.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
          <TagIcon className="mb-2 h-8 w-8" />
          <p className="text-sm">タグがありません</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
              style={{
                backgroundColor: `${tag.color}20`,
                color: tag.color,
              }}
            >
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: tag.color }}
              />
              {tag.name}
            </span>
          ))}
        </div>
      )}

      <Separator />

      {/* Add tag form */}
      <div className="space-y-3">
        <Input
          placeholder="タグ名"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="text-sm"
        />

        {/* Color picker */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground shrink-0">カラー:</span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_COLORS.map((c) => (
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
          disabled={!name.trim() || submitting}
          className="w-full gap-1.5"
        >
          {submitting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
          タグを追加
        </Button>
      </div>
    </div>
  );
}
