"use client";

import { useState, useEffect, useCallback } from "react";
import { useTaskStore } from "@/stores/taskStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Calendar,
  Clock,
  Link2,
  MessageSquare,
  Pencil,
  Check,
  X,
  Send,
  Loader2,
} from "lucide-react";
import type { Task, TaskStatus, Priority, Comment } from "@/types";
import {
  cn,
  formatDate,
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
} from "@/lib/utils";

interface TaskDetailProps {
  task: Task;
  onClose: () => void;
}

type EditingField =
  | "title"
  | "description"
  | "status"
  | "priority"
  | "startDate"
  | "endDate"
  | "dueDate"
  | null;

export function TaskDetail({ task, onClose }: TaskDetailProps) {
  const { updateTask } = useTaskStore();

  // Inline editing state
  const [editingField, setEditingField] = useState<EditingField>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  // Progress
  const [progress, setProgress] = useState(task.progress);

  // Comments
  const [comments, setComments] = useState<Comment[]>(task.comments ?? []);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);

  // Sync progress when task prop changes
  useEffect(() => {
    setProgress(task.progress);
  }, [task.progress]);

  // Fetch comments on mount
  const fetchComments = useCallback(async () => {
    setLoadingComments(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch {
      // Keep existing comments on error
    } finally {
      setLoadingComments(false);
    }
  }, [task.id]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Start editing a field
  const startEditing = (field: EditingField, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingField(null);
    setEditValue("");
  };

  // Save inline edit
  const saveField = async (field: EditingField) => {
    if (!field) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {};

      if (field === "title") {
        if (!editValue.trim()) {
          cancelEditing();
          return;
        }
        payload.title = editValue.trim();
      } else if (field === "description") {
        payload.description = editValue.trim() || undefined;
      } else if (field === "status") {
        payload.status = editValue;
      } else if (field === "priority") {
        payload.priority = editValue;
      } else if (field === "startDate" || field === "endDate" || field === "dueDate") {
        payload[field] = editValue || undefined;
      }

      await updateTask(task.id, payload);
      setEditingField(null);
      setEditValue("");
    } catch {
      // Keep editing state on error so user can retry
    } finally {
      setSaving(false);
    }
  };

  // Save progress on commit (mouse up / pointer up)
  const handleProgressCommit = async (value: number[]) => {
    const newProgress = value[0];
    setProgress(newProgress);
    try {
      await updateTask(task.id, { progress: newProgress });
    } catch {
      setProgress(task.progress);
    }
  };

  // Add comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSendingComment(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      if (response.ok) {
        const comment = await response.json();
        setComments((prev) => [...prev, comment]);
        setNewComment("");
      }
    } catch {
      // Keep comment text on error
    } finally {
      setSendingComment(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, field: EditingField) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      saveField(field);
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  };

  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";

  const dependencyCount =
    (task.dependencies?.length ?? 0) + (task.dependents?.length ?? 0);

  return (
    <SheetContent side="right" className="w-full sm:max-w-lg p-0">
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6">
          {/* Header */}
          <SheetHeader className="space-y-3">
            {/* Title - click to edit */}
            {editingField === "title" ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, "title")}
                  autoFocus
                  className="font-heading text-lg font-semibold"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 shrink-0"
                  onClick={() => saveField("title")}
                  disabled={saving}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 shrink-0"
                  onClick={cancelEditing}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <SheetTitle
                className="cursor-pointer group flex items-center gap-2"
                onClick={() => startEditing("title", task.title)}
              >
                <span
                  className={cn(
                    task.status === "DONE" && "line-through text-muted-foreground"
                  )}
                >
                  {task.title}
                </span>
                <Pencil className="h-3.5 w-3.5 opacity-0 group-hover:opacity-50 transition-opacity duration-200" />
              </SheetTitle>
            )}
            <SheetDescription className="sr-only">
              Task detail panel
            </SheetDescription>

            {/* Status & Priority Badges */}
            <div className="flex flex-wrap gap-2">
              {/* Status badge - click to edit */}
              {editingField === "status" ? (
                <Select
                  value={editValue}
                  onValueChange={(v) => {
                    setEditValue(v);
                    // Auto-save on selection
                    setSaving(true);
                    updateTask(task.id, { status: v as TaskStatus })
                      .then(() => setEditingField(null))
                      .finally(() => setSaving(false));
                  }}
                >
                  <SelectTrigger className="w-[140px] h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge
                  className={cn(
                    "cursor-pointer text-xs px-2 py-0.5 font-normal",
                    STATUS_COLORS[task.status]
                  )}
                  onClick={() => startEditing("status", task.status)}
                >
                  {STATUS_LABELS[task.status]}
                </Badge>
              )}

              {/* Priority badge - click to edit */}
              {editingField === "priority" ? (
                <Select
                  value={editValue}
                  onValueChange={(v) => {
                    setEditValue(v);
                    setSaving(true);
                    updateTask(task.id, { priority: v as Priority })
                      .then(() => setEditingField(null))
                      .finally(() => setSaving(false));
                  }}
                >
                  <SelectTrigger className="w-[120px] h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(PRIORITY_LABELS) as Priority[]).map((p) => (
                      <SelectItem key={p} value={p}>
                        {PRIORITY_LABELS[p]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge
                  className={cn(
                    "cursor-pointer text-xs px-2 py-0.5 font-normal",
                    PRIORITY_COLORS[task.priority]
                  )}
                  onClick={() => startEditing("priority", task.priority)}
                >
                  {PRIORITY_LABELS[task.priority]}
                </Badge>
              )}
            </div>
          </SheetHeader>

          <Separator />

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                進捗
              </span>
              <span className="text-sm font-medium tabular-nums">
                {progress}%
              </span>
            </div>
            <Slider
              value={[progress]}
              onValueChange={(value) => setProgress(value[0])}
              onValueCommit={handleProgressCommit}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-2">
            <span className="text-sm font-medium text-muted-foreground">
              説明
            </span>
            {editingField === "description" ? (
              <div className="space-y-2">
                <Textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") cancelEditing();
                  }}
                  rows={4}
                  autoFocus
                  placeholder="説明を入力..."
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={cancelEditing}
                  >
                    キャンセル
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => saveField("description")}
                    disabled={saving}
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    {saving && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
                    保存
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className="cursor-pointer group rounded-md p-2 -mx-2 hover:bg-muted/50 transition-colors duration-200 min-h-[2rem]"
                onClick={() =>
                  startEditing("description", task.description ?? "")
                }
              >
                {task.description ? (
                  <p className="text-sm whitespace-pre-wrap">
                    {task.description}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    説明を追加...
                  </p>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Dates */}
          <div className="space-y-3">
            <span className="text-sm font-medium text-muted-foreground">
              日程
            </span>
            <div className="grid grid-cols-3 gap-3">
              {/* Start Date */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  開始日
                </label>
                {editingField === "startDate" ? (
                  <Input
                    type="date"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => saveField("startDate")}
                    onKeyDown={(e) => handleKeyDown(e, "startDate")}
                    autoFocus
                    className="h-8 text-xs tabular-nums"
                  />
                ) : (
                  <button
                    className="text-xs tabular-nums text-left w-full rounded px-1 py-0.5 hover:bg-muted/50 transition-colors duration-200"
                    onClick={() =>
                      startEditing(
                        "startDate",
                        task.startDate?.split("T")[0] ?? ""
                      )
                    }
                  >
                    {task.startDate ? formatDate(task.startDate) : "---"}
                  </button>
                )}
              </div>

              {/* End Date */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  終了日
                </label>
                {editingField === "endDate" ? (
                  <Input
                    type="date"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => saveField("endDate")}
                    onKeyDown={(e) => handleKeyDown(e, "endDate")}
                    autoFocus
                    className="h-8 text-xs tabular-nums"
                  />
                ) : (
                  <button
                    className="text-xs tabular-nums text-left w-full rounded px-1 py-0.5 hover:bg-muted/50 transition-colors duration-200"
                    onClick={() =>
                      startEditing(
                        "endDate",
                        task.endDate?.split("T")[0] ?? ""
                      )
                    }
                  >
                    {task.endDate ? formatDate(task.endDate) : "---"}
                  </button>
                )}
              </div>

              {/* Due Date */}
              <div className="space-y-1">
                <label
                  className={cn(
                    "text-xs flex items-center gap-1",
                    isOverdue ? "text-destructive" : "text-muted-foreground"
                  )}
                >
                  <Calendar className="h-3 w-3" />
                  期限
                </label>
                {editingField === "dueDate" ? (
                  <Input
                    type="date"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => saveField("dueDate")}
                    onKeyDown={(e) => handleKeyDown(e, "dueDate")}
                    autoFocus
                    className="h-8 text-xs tabular-nums"
                  />
                ) : (
                  <button
                    className={cn(
                      "text-xs tabular-nums text-left w-full rounded px-1 py-0.5 hover:bg-muted/50 transition-colors duration-200",
                      isOverdue && "text-destructive font-medium"
                    )}
                    onClick={() =>
                      startEditing(
                        "dueDate",
                        task.dueDate?.split("T")[0] ?? ""
                      )
                    }
                  >
                    {task.dueDate ? formatDate(task.dueDate) : "---"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">
                  タグ
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {task.tags.map((tagOnTask) => (
                    <span
                      key={tagOnTask.tagId}
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-normal"
                      style={{
                        backgroundColor: tagOnTask.tag?.color
                          ? `${tagOnTask.tag.color}20`
                          : undefined,
                        color: tagOnTask.tag?.color,
                      }}
                    >
                      {tagOnTask.tag?.name}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Dependencies */}
          {dependencyCount > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <Link2 className="h-3.5 w-3.5" />
                  依存関係
                </span>
                <div className="space-y-1.5">
                  {task.dependencies && task.dependencies.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">
                        先行タスク
                      </span>
                      {task.dependencies.map((dep) => (
                        <div
                          key={dep.id}
                          className="flex items-center gap-2 text-xs rounded px-2 py-1 bg-muted/30"
                        >
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1 py-0 font-normal"
                          >
                            {dep.type}
                          </Badge>
                          <span className="tabular-nums text-muted-foreground truncate">
                            {dep.dependencyId}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {task.dependents && task.dependents.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">
                        後続タスク
                      </span>
                      {task.dependents.map((dep) => (
                        <div
                          key={dep.id}
                          className="flex items-center gap-2 text-xs rounded px-2 py-1 bg-muted/30"
                        >
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1 py-0 font-normal"
                          >
                            {dep.type}
                          </Badge>
                          <span className="tabular-nums text-muted-foreground truncate">
                            {dep.dependentId}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Comments */}
          <div className="space-y-3">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              コメント
              {comments.length > 0 && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 font-normal tabular-nums"
                >
                  {comments.length}
                </Badge>
              )}
            </span>

            {/* Comment list */}
            {loadingComments ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="rounded-md bg-muted/30 p-3 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">
                        {comment.user?.name ?? comment.user?.email ?? "Unknown"}
                      </span>
                      <span className="text-[10px] text-muted-foreground tabular-nums">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic py-2">
                コメントはまだありません
              </p>
            )}

            {/* Add comment */}
            <div className="flex gap-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
                placeholder="コメントを追加..."
                rows={2}
                className="text-sm resize-none"
              />
              <Button
                size="icon"
                variant="ghost"
                className="shrink-0 self-end h-9 w-9"
                onClick={handleAddComment}
                disabled={sendingComment || !newComment.trim()}
              >
                {sendingComment ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Metadata */}
          <Separator />
          <div className="flex items-center justify-between text-[10px] text-muted-foreground tabular-nums">
            <span>
              作成: {formatDate(task.createdAt)}
            </span>
            <span>
              更新: {formatDate(task.updatedAt)}
            </span>
          </div>
        </div>
      </ScrollArea>
    </SheetContent>
  );
}
