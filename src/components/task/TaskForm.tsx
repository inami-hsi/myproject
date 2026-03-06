"use client";

import { useState } from "react";
import { useTaskStore } from "@/stores/taskStore";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { Task, TaskStatus, Priority } from "@/types";
import { STATUS_LABELS, PRIORITY_LABELS } from "@/lib/utils";

interface TaskFormProps {
  projectId: string;
  task?: Task;
  onSuccess?: () => void;
}

export function TaskForm({ projectId, task, onSuccess }: TaskFormProps) {
  const { createTask, updateTask } = useTaskStore();
  const isEditing = !!task;

  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "TODO");
  const [priority, setPriority] = useState<Priority>(task?.priority ?? "MEDIUM");
  const [startDate, setStartDate] = useState(task?.startDate?.split("T")[0] ?? "");
  const [endDate, setEndDate] = useState(task?.endDate?.split("T")[0] ?? "");
  const [dueDate, setDueDate] = useState(task?.dueDate?.split("T")[0] ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // 日付を ISO datetime形式に変換するヘルパー
  const toISODateTime = (dateStr: string): string | undefined => {
    if (!dateStr) return undefined;
    return new Date(dateStr).toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("タイトルは必須です");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (isEditing && task) {
        await updateTask(task.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          status,
          priority,
          startDate: toISODateTime(startDate),
          endDate: toISODateTime(endDate),
          dueDate: toISODateTime(dueDate),
        });
      } else {
        await createTask({
          title: title.trim(),
          description: description.trim() || undefined,
          status,
          priority,
          startDate: toISODateTime(startDate),
          endDate: toISODateTime(endDate),
          dueDate: toISODateTime(dueDate),
          projectId,
        });
      }
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "エラーが発生しました"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>{isEditing ? "タスクを編集" : "タスクを作成"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "タスクの詳細を更新してください。"
              : "新しいタスクの詳細を入力してください。"}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="task-title">タイトル</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="タスクのタイトルを入力"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="task-description">説明</Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="タスクの内容を入力..."
              rows={3}
            />
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ステータス</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as TaskStatus)}
              >
                <SelectTrigger>
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
            </div>

            <div className="space-y-2">
              <Label>優先度</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as Priority)}
              >
                <SelectTrigger>
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
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="task-start">開始</Label>
              <Input
                id="task-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-end">終了</Label>
              <Input
                id="task-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-due">期限</Label>
              <Input
                id="task-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button type="submit" disabled={saving} className="bg-accent text-accent-foreground hover:bg-accent/90">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "変更を保存" : "タスクを作成"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
