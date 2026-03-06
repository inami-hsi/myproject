"use client";

import { useCallback, useMemo, useState } from "react";
import { Globe, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchStore } from "@/hooks/useSearch";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Capital presets in yen */
const CAPITAL_PRESETS = [
  { label: "100万", value: 1_000_000 },
  { label: "1000万", value: 10_000_000 },
  { label: "1億", value: 100_000_000 },
  { label: "10億", value: 1_000_000_000 },
] as const;

/** Slider min/max bounds (yen) */
const CAPITAL_SLIDER_MIN = 0;
const CAPITAL_SLIDER_MAX = 10_000_000_000; // 100億

/** Map raw yen to a log-like slider step (0-100) for UX */
const CAPITAL_STEPS = [
  0, // 0
  1_000_000, // 100万
  3_000_000, // 300万
  5_000_000, // 500万
  10_000_000, // 1000万
  30_000_000, // 3000万
  50_000_000, // 5000万
  100_000_000, // 1億
  300_000_000, // 3億
  500_000_000, // 5億
  1_000_000_000, // 10億
  3_000_000_000, // 30億
  5_000_000_000, // 50億
  10_000_000_000, // 100億
] as const;

const STATUS_OPTIONS = [
  { value: "active", label: "営業中" },
  { value: "closed", label: "閉鎖" },
  { value: "merged", label: "合併" },
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCapitalDisplay(yen: number): string {
  if (yen === 0) return "0円";
  if (yen >= 100_000_000) {
    const oku = yen / 100_000_000;
    return Number.isInteger(oku) ? `${oku}億円` : `${oku.toFixed(1)}億円`;
  }
  if (yen >= 10_000) {
    const man = yen / 10_000;
    return Number.isInteger(man) ? `${man}万円` : `${man.toFixed(0)}万円`;
  }
  return `${yen.toLocaleString()}円`;
}

/** Convert a yen value to the nearest CAPITAL_STEPS index */
function yenToStepIndex(yen: number): number {
  for (let i = CAPITAL_STEPS.length - 1; i >= 0; i--) {
    if (yen >= CAPITAL_STEPS[i]) return i;
  }
  return 0;
}

/** Convert a CAPITAL_STEPS index back to yen */
function stepIndexToYen(index: number): number {
  return CAPITAL_STEPS[Math.min(index, CAPITAL_STEPS.length - 1)] ?? 0;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdvancedFilters() {
  const filters = useSearchStore((s) => s.filters);
  const setCapitalRange = useSearchStore((s) => s.setCapitalRange);
  const setEmployeeRange = useSearchStore((s) => s.setEmployeeRange);
  const setHasWebsite = useSearchStore((s) => s.setHasWebsite);
  const setStatus = useSearchStore((s) => s.setStatus);

  return (
    <div className="space-y-5">
      <p className="text-xs font-heading font-medium uppercase tracking-wider text-muted-foreground">
        詳細フィルター
      </p>

      {/* Capital range */}
      <CapitalRangeFilter
        min={filters.capital_min}
        max={filters.capital_max}
        onChange={setCapitalRange}
      />

      {/* Employee range */}
      <EmployeeRangeFilter
        min={filters.employee_min}
        max={filters.employee_max}
        onChange={setEmployeeRange}
      />

      {/* Has website */}
      <HasWebsiteFilter
        value={filters.has_website}
        onChange={setHasWebsite}
      />

      {/* Status */}
      <StatusFilter
        value={filters.status}
        onChange={setStatus}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Capital range
// ---------------------------------------------------------------------------

function CapitalRangeFilter({
  min,
  max,
  onChange,
}: {
  min?: number;
  max?: number;
  onChange: (min?: number, max?: number) => void;
}) {
  const minIdx = useMemo(() => yenToStepIndex(min ?? CAPITAL_SLIDER_MIN), [min]);
  const maxIdx = useMemo(
    () => yenToStepIndex(max ?? CAPITAL_SLIDER_MAX),
    [max],
  );

  const handleSliderChange = useCallback(
    (values: number[]) => {
      const newMin = stepIndexToYen(values[0]);
      const newMax = stepIndexToYen(values[1]);
      onChange(
        newMin > 0 ? newMin : undefined,
        newMax < CAPITAL_SLIDER_MAX ? newMax : undefined,
      );
    },
    [onChange],
  );

  const handlePresetClick = useCallback(
    (presetYen: number, type: "min" | "max") => {
      if (type === "min") {
        onChange(presetYen, max);
      } else {
        onChange(min, presetYen);
      }
    },
    [onChange, min, max],
  );

  const handleClear = useCallback(() => {
    onChange(undefined, undefined);
  }, [onChange]);

  const hasValue = min !== undefined || max !== undefined;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs">資本金</Label>
        {hasValue && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[10px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            クリア
          </button>
        )}
      </div>

      {/* Display */}
      <div className="flex items-center justify-between text-xs tabular-nums text-muted-foreground">
        <span>{min !== undefined ? formatCapitalDisplay(min) : "下限なし"}</span>
        <span className="text-[10px]">〜</span>
        <span>{max !== undefined ? formatCapitalDisplay(max) : "上限なし"}</span>
      </div>

      {/* Slider */}
      <Slider
        value={[minIdx, maxIdx]}
        min={0}
        max={CAPITAL_STEPS.length - 1}
        step={1}
        onValueChange={handleSliderChange}
        aria-label="資本金範囲"
      />

      {/* Preset buttons */}
      <div className="flex flex-wrap gap-1">
        {CAPITAL_PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => handlePresetClick(preset.value, "min")}
            className={cn(
              "rounded-md border px-2 py-0.5 text-[10px] transition-colors duration-150",
              min === preset.value
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted-foreground hover:border-accent/50 hover:text-foreground",
            )}
          >
            {preset.label}〜
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Employee range
// ---------------------------------------------------------------------------

function EmployeeRangeFilter({
  min,
  max,
  onChange,
}: {
  min?: number;
  max?: number;
  onChange: (min?: number, max?: number) => void;
}) {
  const [localMin, setLocalMin] = useState(min?.toString() ?? "");
  const [localMax, setLocalMax] = useState(max?.toString() ?? "");

  const handleMinBlur = useCallback(() => {
    const parsed = localMin ? parseInt(localMin, 10) : undefined;
    const validMin = parsed !== undefined && !isNaN(parsed) && parsed >= 0 ? parsed : undefined;
    onChange(validMin, max);
  }, [localMin, max, onChange]);

  const handleMaxBlur = useCallback(() => {
    const parsed = localMax ? parseInt(localMax, 10) : undefined;
    const validMax = parsed !== undefined && !isNaN(parsed) && parsed >= 0 ? parsed : undefined;
    onChange(min, validMax);
  }, [localMax, min, onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        (e.target as HTMLInputElement).blur();
      }
    },
    [],
  );

  const handleClear = useCallback(() => {
    setLocalMin("");
    setLocalMax("");
    onChange(undefined, undefined);
  }, [onChange]);

  const hasValue = min !== undefined || max !== undefined;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs">従業員数</Label>
        {hasValue && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[10px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            クリア
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={0}
          placeholder="下限"
          value={localMin}
          onChange={(e) => setLocalMin(e.target.value)}
          onBlur={handleMinBlur}
          onKeyDown={handleKeyDown}
          className="h-8 text-xs tabular-nums"
          aria-label="従業員数 下限"
        />
        <span className="shrink-0 text-xs text-muted-foreground">〜</span>
        <Input
          type="number"
          min={0}
          placeholder="上限"
          value={localMax}
          onChange={(e) => setLocalMax(e.target.value)}
          onBlur={handleMaxBlur}
          onKeyDown={handleKeyDown}
          className="h-8 text-xs tabular-nums"
          aria-label="従業員数 上限"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Has website
// ---------------------------------------------------------------------------

function HasWebsiteFilter({
  value,
  onChange,
}: {
  value?: boolean;
  onChange: (value?: boolean) => void;
}) {
  const handleToggle = useCallback(() => {
    // Cycle: undefined -> true -> false -> undefined
    if (value === undefined) {
      onChange(true);
    } else if (value === true) {
      onChange(false);
    } else {
      onChange(undefined);
    }
  }, [value, onChange]);

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          "flex w-full items-center gap-2 rounded-md border px-3 py-2 text-xs transition-colors duration-150",
          value === true
            ? "border-accent bg-accent/10 text-accent"
            : value === false
              ? "border-destructive/30 bg-destructive/5 text-destructive"
              : "border-border text-muted-foreground hover:border-accent/50 hover:text-foreground",
        )}
        aria-label="Webサイトフィルター"
        aria-pressed={value === true ? "true" : value === false ? "false" : "mixed"}
      >
        <Globe className="h-3.5 w-3.5 shrink-0" />
        <span>
          {value === true
            ? "Webサイトあり"
            : value === false
              ? "Webサイトなし"
              : "Webサイト (指定なし)"}
        </span>
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

function StatusFilter({
  value,
  onChange,
}: {
  value?: "active" | "closed" | "merged";
  onChange: (value?: "active" | "closed" | "merged") => void;
}) {
  const handleChange = useCallback(
    (newValue: string) => {
      if (newValue === "all") {
        onChange(undefined);
      } else {
        onChange(newValue as "active" | "closed" | "merged");
      }
    },
    [onChange],
  );

  return (
    <div className="space-y-2">
      <Label className="text-xs">ステータス</Label>
      <Select
        value={value ?? "all"}
        onValueChange={handleChange}
      >
        <SelectTrigger className="h-8 text-xs" aria-label="ステータスフィルター">
          <Building2 className="mr-2 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <SelectValue placeholder="すべて" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs">
            すべて
          </SelectItem>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="text-xs">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
