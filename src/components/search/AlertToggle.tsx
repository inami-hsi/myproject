"use client";

import { useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ============================================================
// Types
// ============================================================

interface AlertToggleProps {
  savedSearchId: string;
  initialEnabled?: boolean;
  initialFrequency?: "daily" | "weekly" | "monthly";
  onToggle?: (enabled: boolean) => void;
}

const FREQUENCY_LABELS: Record<string, string> = {
  daily: "毎日",
  weekly: "毎週",
  monthly: "毎月",
};

// ============================================================
// Component
// ============================================================

export function AlertToggle({
  savedSearchId,
  initialEnabled = false,
  initialFrequency = "daily",
  onToggle,
}: AlertToggleProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">(
    initialFrequency,
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);

    try {
      if (enabled) {
        // Disable alert
        const res = await fetch(`/api/alerts/${savedSearchId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setEnabled(false);
          onToggle?.(false);
        }
      } else {
        // Enable alert
        const res = await fetch("/api/alerts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            saved_search_id: savedSearchId,
            frequency,
          }),
        });
        if (res.ok) {
          setEnabled(true);
          onToggle?.(true);
        }
      }
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  };

  const handleFrequencyChange = async (
    value: "daily" | "weekly" | "monthly",
  ) => {
    setFrequency(value);

    if (!enabled) return;

    // Update frequency on the server
    try {
      await fetch(`/api/alerts/${savedSearchId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frequency: value }),
      });
    } catch {
      // Silently fail
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={enabled ? "default" : "outline"}
        size="sm"
        className="gap-1.5"
        onClick={handleToggle}
        disabled={isLoading}
        aria-label={enabled ? "通知をオフにする" : "通知をオンにする"}
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : enabled ? (
          <Bell className="h-3.5 w-3.5" />
        ) : (
          <BellOff className="h-3.5 w-3.5" />
        )}
        {enabled ? "通知ON" : "通知OFF"}
      </Button>

      {enabled && (
        <Select value={frequency} onValueChange={handleFrequencyChange}>
          <SelectTrigger
            className="h-8 w-[90px] text-xs"
            aria-label="通知頻度"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
