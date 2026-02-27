import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function daysBetween(start: Date, end: Date): number {
  const diff = end.getTime() - start.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export const STATUS_LABELS: Record<string, string> = {
  TODO: "未着手",
  IN_PROGRESS: "進行中",
  DONE: "完了",
  ON_HOLD: "保留",
};

export const PRIORITY_LABELS: Record<string, string> = {
  CRITICAL: "緊急",
  HIGH: "高",
  MEDIUM: "中",
  LOW: "低",
};

export const STATUS_COLORS: Record<string, string> = {
  TODO: "bg-gray-200 text-gray-700",
  IN_PROGRESS: "bg-terracotta/10 text-terracotta",
  DONE: "bg-sage/10 text-sage",
  ON_HOLD: "bg-warning/10 text-warning",
};

export const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: "bg-danger/10 text-danger",
  HIGH: "bg-terracotta/10 text-terracotta",
  MEDIUM: "bg-warning/10 text-warning",
  LOW: "bg-gray-100 text-gray-600",
};
