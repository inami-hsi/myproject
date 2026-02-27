import { describe, it, expect } from "vitest";
import {
  cn,
  formatDate,
  daysBetween,
  addDays,
  STATUS_LABELS,
  PRIORITY_LABELS,
  STATUS_COLORS,
  PRIORITY_COLORS,
} from "@/lib/utils";

// ---------------------------------------------------------------------------
// cn()
// ---------------------------------------------------------------------------
describe("cn", () => {
  it("merges simple class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("resolves Tailwind conflicts (last wins)", () => {
    const result = cn("px-2", "px-4");
    expect(result).toBe("px-4");
  });

  it("merges conditional classes", () => {
    const result = cn("base", false && "hidden", "extra");
    expect(result).toBe("base extra");
  });

  it("handles undefined and null inputs", () => {
    const result = cn("base", undefined, null, "extra");
    expect(result).toBe("base extra");
  });

  it("returns empty string when called with no arguments", () => {
    expect(cn()).toBe("");
  });

  it("returns empty string when all inputs are falsy", () => {
    expect(cn(false, null, undefined)).toBe("");
  });

  it("handles arrays of classes", () => {
    const result = cn(["px-2", "py-1"], "mx-auto");
    expect(result).toBe("px-2 py-1 mx-auto");
  });

  it("handles complex Tailwind conflict resolution", () => {
    const result = cn(
      "bg-red-500 text-white",
      "bg-blue-500"
    );
    expect(result).toBe("text-white bg-blue-500");
  });
});

// ---------------------------------------------------------------------------
// formatDate()
// ---------------------------------------------------------------------------
describe("formatDate", () => {
  it("formats a Date object", () => {
    const date = new Date(2025, 0, 15); // Jan 15 2025
    const result = formatDate(date);
    // Japanese locale uses short month format
    expect(result).toContain("2025");
    expect(result).toContain("15");
  });

  it("formats an ISO string", () => {
    const result = formatDate("2025-06-01T00:00:00.000Z");
    expect(result).toContain("2025");
  });

  it("formats a date-only string", () => {
    const result = formatDate("2025-12-25");
    expect(result).toContain("2025");
    expect(result).toContain("25");
  });

  it("returns a string type", () => {
    expect(typeof formatDate(new Date())).toBe("string");
  });
});

// ---------------------------------------------------------------------------
// daysBetween()
// ---------------------------------------------------------------------------
describe("daysBetween", () => {
  it("returns positive days when end is after start", () => {
    const start = new Date(2025, 0, 1);
    const end = new Date(2025, 0, 11);
    expect(daysBetween(start, end)).toBe(10);
  });

  it("returns negative days when end is before start", () => {
    const start = new Date(2025, 0, 11);
    const end = new Date(2025, 0, 1);
    expect(daysBetween(start, end)).toBe(-10);
  });

  it("returns 0 for the same date", () => {
    const date = new Date(2025, 5, 15);
    expect(daysBetween(date, date)).toBe(0);
  });

  it("returns 1 for consecutive days", () => {
    const start = new Date(2025, 0, 1);
    const end = new Date(2025, 0, 2);
    expect(daysBetween(start, end)).toBe(1);
  });

  it("handles month boundaries", () => {
    const start = new Date(2025, 0, 31); // Jan 31
    const end = new Date(2025, 1, 1); // Feb 1
    expect(daysBetween(start, end)).toBe(1);
  });

  it("handles year boundaries", () => {
    const start = new Date(2024, 11, 31); // Dec 31 2024
    const end = new Date(2025, 0, 1); // Jan 1 2025
    expect(daysBetween(start, end)).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// addDays()
// ---------------------------------------------------------------------------
describe("addDays", () => {
  it("adds positive days", () => {
    const date = new Date(2025, 0, 1);
    const result = addDays(date, 10);
    expect(result.getDate()).toBe(11);
    expect(result.getMonth()).toBe(0);
  });

  it("subtracts with negative days", () => {
    const date = new Date(2025, 0, 11);
    const result = addDays(date, -10);
    expect(result.getDate()).toBe(1);
    expect(result.getMonth()).toBe(0);
  });

  it("returns same date when adding zero days", () => {
    const date = new Date(2025, 5, 15);
    const result = addDays(date, 0);
    expect(result.getTime()).toBe(date.getTime());
  });

  it("does not mutate the original date", () => {
    const date = new Date(2025, 0, 1);
    const original = date.getTime();
    addDays(date, 10);
    expect(date.getTime()).toBe(original);
  });

  it("rolls over month boundaries", () => {
    const date = new Date(2025, 0, 31); // Jan 31
    const result = addDays(date, 1);
    expect(result.getMonth()).toBe(1); // Feb
    expect(result.getDate()).toBe(1);
  });

  it("rolls over year boundaries", () => {
    const date = new Date(2024, 11, 31); // Dec 31 2024
    const result = addDays(date, 1);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// STATUS_LABELS
// ---------------------------------------------------------------------------
describe("STATUS_LABELS", () => {
  it("has all four status entries", () => {
    expect(Object.keys(STATUS_LABELS)).toHaveLength(4);
  });

  it("contains TODO", () => {
    expect(STATUS_LABELS.TODO).toBe("未着手");
  });

  it("contains IN_PROGRESS", () => {
    expect(STATUS_LABELS.IN_PROGRESS).toBe("進行中");
  });

  it("contains DONE", () => {
    expect(STATUS_LABELS.DONE).toBe("完了");
  });

  it("contains ON_HOLD", () => {
    expect(STATUS_LABELS.ON_HOLD).toBe("保留");
  });
});

// ---------------------------------------------------------------------------
// PRIORITY_LABELS
// ---------------------------------------------------------------------------
describe("PRIORITY_LABELS", () => {
  it("has all four priority entries", () => {
    expect(Object.keys(PRIORITY_LABELS)).toHaveLength(4);
  });

  it("contains CRITICAL", () => {
    expect(PRIORITY_LABELS.CRITICAL).toBe("緊急");
  });

  it("contains HIGH", () => {
    expect(PRIORITY_LABELS.HIGH).toBe("高");
  });

  it("contains MEDIUM", () => {
    expect(PRIORITY_LABELS.MEDIUM).toBe("中");
  });

  it("contains LOW", () => {
    expect(PRIORITY_LABELS.LOW).toBe("低");
  });
});

// ---------------------------------------------------------------------------
// STATUS_COLORS
// ---------------------------------------------------------------------------
describe("STATUS_COLORS", () => {
  it("has all four status entries", () => {
    expect(Object.keys(STATUS_COLORS)).toHaveLength(4);
  });

  it("TODO has valid Tailwind classes", () => {
    expect(STATUS_COLORS.TODO).toMatch(/^bg-\S+\s+text-\S+$/);
  });

  it("IN_PROGRESS has valid Tailwind classes", () => {
    expect(STATUS_COLORS.IN_PROGRESS).toMatch(/^bg-\S+\s+text-\S+$/);
  });

  it("DONE has valid Tailwind classes", () => {
    expect(STATUS_COLORS.DONE).toMatch(/^bg-\S+\s+text-\S+$/);
  });

  it("ON_HOLD has valid Tailwind classes", () => {
    expect(STATUS_COLORS.ON_HOLD).toMatch(/^bg-\S+\s+text-\S+$/);
  });
});

// ---------------------------------------------------------------------------
// PRIORITY_COLORS
// ---------------------------------------------------------------------------
describe("PRIORITY_COLORS", () => {
  it("has all four priority entries", () => {
    expect(Object.keys(PRIORITY_COLORS)).toHaveLength(4);
  });

  it("CRITICAL has valid Tailwind classes", () => {
    expect(PRIORITY_COLORS.CRITICAL).toMatch(/^bg-\S+\s+text-\S+$/);
  });

  it("HIGH has valid Tailwind classes", () => {
    expect(PRIORITY_COLORS.HIGH).toMatch(/^bg-\S+\s+text-\S+$/);
  });

  it("MEDIUM has valid Tailwind classes", () => {
    expect(PRIORITY_COLORS.MEDIUM).toMatch(/^bg-\S+\s+text-\S+$/);
  });

  it("LOW has valid Tailwind classes", () => {
    expect(PRIORITY_COLORS.LOW).toMatch(/^bg-\S+\s+text-\S+$/);
  });
});
