import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useGantt } from "@/hooks/useGantt";
import { useMilestones } from "@/hooks/useMilestones";
import type { Task, Milestone, TimeScale } from "@/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-1",
    title: "Test Task",
    description: null,
    status: "TODO",
    priority: "MEDIUM",
    progress: 0,
    startDate: null,
    endDate: null,
    dueDate: null,
    sortOrder: 0,
    projectId: "proj-1",
    assigneeId: null,
    parentId: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeMilestone(overrides: Partial<Milestone> = {}): Milestone {
  return {
    id: "ms-1",
    name: "Milestone 1",
    date: "2026-02-01T00:00:00.000Z",
    color: "#FF0000",
    projectId: "proj-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// useGantt
// ---------------------------------------------------------------------------

describe("useGantt", () => {
  // -- dayWidth per timeScale -------------------------------------------------

  describe("dayWidth", () => {
    it('returns 40 for "day" time scale', () => {
      const { result } = renderHook(() => useGantt([], [], "day"));
      expect(result.current.dayWidth).toBe(40);
    });

    it('returns 60/7 for "week" time scale', () => {
      const { result } = renderHook(() => useGantt([], [], "week"));
      expect(result.current.dayWidth).toBeCloseTo(60 / 7, 5);
    });

    it('returns 80/30 for "month" time scale', () => {
      const { result } = renderHook(() => useGantt([], [], "month"));
      expect(result.current.dayWidth).toBeCloseTo(80 / 30, 5);
    });
  });

  // -- timeline bounds --------------------------------------------------------

  describe("timeline bounds", () => {
    it("creates a default timeline around today when tasks and milestones are empty", () => {
      const { result } = renderHook(() => useGantt([], [], "day"));
      const now = new Date();

      // Today is always added to the dates array, so min=max=today.
      // timelineStart = startOfDay(addDays(today, -PADDING_DAYS))  => ~7 days before
      // timelineEnd   = startOfDay(addDays(today, +PADDING_DAYS))  => ~7 days after
      const diffStart =
        (now.getTime() - result.current.timelineStart.getTime()) /
        (1000 * 60 * 60 * 24);
      expect(diffStart).toBeGreaterThanOrEqual(6);
      expect(diffStart).toBeLessThanOrEqual(8);

      const diffEnd =
        (result.current.timelineEnd.getTime() - now.getTime()) /
        (1000 * 60 * 60 * 24);
      expect(diffEnd).toBeGreaterThanOrEqual(5);
      expect(diffEnd).toBeLessThanOrEqual(8);
    });

    it("expands timeline to include task start/end dates with padding", () => {
      const tasks = [
        makeTask({
          startDate: "2026-03-01T00:00:00.000Z",
          endDate: "2026-04-01T00:00:00.000Z",
        }),
      ];

      const { result } = renderHook(() => useGantt(tasks, [], "day"));

      // The timeline should start at least 7 days before the earliest date
      // (earliest could be today or 2026-03-01, whichever is smaller)
      expect(result.current.timelineStart).toBeInstanceOf(Date);
      expect(result.current.timelineEnd).toBeInstanceOf(Date);
      expect(
        result.current.timelineEnd.getTime()
      ).toBeGreaterThan(
        result.current.timelineStart.getTime()
      );
    });

    it("includes milestone dates in timeline range", () => {
      const farFutureMilestone = makeMilestone({
        date: "2027-06-01T00:00:00.000Z",
      });

      const { result } = renderHook(() =>
        useGantt([], [farFutureMilestone], "day")
      );

      // The timeline end must be at or past the milestone date (plus padding)
      const msDate = new Date("2027-06-01T00:00:00.000Z");
      expect(result.current.timelineEnd.getTime()).toBeGreaterThanOrEqual(
        msDate.getTime()
      );
    });
  });

  // -- totalWidth -------------------------------------------------------------

  describe("totalWidth", () => {
    it("returns at least 800 even for a narrow timeline", () => {
      const { result } = renderHook(() => useGantt([], [], "month"));
      expect(result.current.totalWidth).toBeGreaterThanOrEqual(800);
    });

    it("grows with more days in day scale", () => {
      const tasks = [
        makeTask({
          startDate: "2025-01-01T00:00:00.000Z",
          endDate: "2026-12-31T00:00:00.000Z",
        }),
      ];
      const { result } = renderHook(() => useGantt(tasks, [], "day"));
      // ~730 days * 40px = ~29200, certainly more than 800
      expect(result.current.totalWidth).toBeGreaterThan(800);
    });
  });

  // -- totalHeight ------------------------------------------------------------

  describe("totalHeight", () => {
    it("is 0 for no tasks and no milestones", () => {
      const { result } = renderHook(() => useGantt([], [], "day"));
      expect(result.current.totalHeight).toBe(0);
    });

    it("equals (tasks + milestones) * 40", () => {
      const tasks = [makeTask({ id: "t1" }), makeTask({ id: "t2" })];
      const milestones = [makeMilestone({ id: "m1" })];

      const { result } = renderHook(() =>
        useGantt(tasks, milestones, "day")
      );
      expect(result.current.totalHeight).toBe(3 * 40);
    });
  });

  // -- getXFromDate / getDateFromX round-trip ---------------------------------

  describe("getXFromDate and getDateFromX", () => {
    it("round-trips a date through x and back", () => {
      const tasks = [
        makeTask({
          startDate: "2026-03-01T00:00:00.000Z",
          endDate: "2026-03-15T00:00:00.000Z",
        }),
      ];

      const { result } = renderHook(() => useGantt(tasks, [], "day"));

      const testDate = new Date("2026-03-10T00:00:00.000Z");
      const x = result.current.getXFromDate(testDate);
      const recoveredDate = result.current.getDateFromX(x);

      // Dates should match to the day (both start-of-day)
      expect(recoveredDate.getFullYear()).toBe(testDate.getFullYear());
      expect(recoveredDate.getMonth()).toBe(testDate.getMonth());
      expect(recoveredDate.getDate()).toBe(testDate.getDate());
    });

    it("getXFromDate returns 0 for the timeline start date", () => {
      const { result } = renderHook(() => useGantt([], [], "day"));

      const x = result.current.getXFromDate(result.current.timelineStart);
      expect(x).toBe(0);
    });

    it("getXFromDate returns positive value for dates after timeline start", () => {
      const { result } = renderHook(() => useGantt([], [], "day"));

      const futureDate = new Date(
        result.current.timelineStart.getTime() + 10 * 24 * 60 * 60 * 1000
      );
      const x = result.current.getXFromDate(futureDate);
      expect(x).toBeGreaterThan(0);
    });
  });

  // -- todayX -----------------------------------------------------------------

  describe("todayX", () => {
    it("is a non-negative number", () => {
      const { result } = renderHook(() => useGantt([], [], "day"));
      expect(result.current.todayX).toBeGreaterThanOrEqual(0);
    });

    it("matches getXFromDate for today", () => {
      const { result } = renderHook(() => useGantt([], [], "day"));
      // todayX is computed from getXFromDate(new Date()), so they should
      // be very close (within 1 day-width because of timing)
      const todayX = result.current.getXFromDate(new Date());
      expect(Math.abs(result.current.todayX - todayX)).toBeLessThanOrEqual(
        result.current.dayWidth
      );
    });
  });

  // -- taskBars ---------------------------------------------------------------

  describe("taskBars", () => {
    it("returns one bar per task", () => {
      const tasks = [
        makeTask({ id: "t1", startDate: "2026-03-01T00:00:00.000Z", endDate: "2026-03-10T00:00:00.000Z" }),
        makeTask({ id: "t2", startDate: "2026-03-05T00:00:00.000Z", endDate: "2026-03-15T00:00:00.000Z" }),
      ];

      const { result } = renderHook(() => useGantt(tasks, [], "day"));
      expect(result.current.taskBars).toHaveLength(2);
    });

    it("assigns incremental y positions (rows)", () => {
      const tasks = [
        makeTask({ id: "t1", startDate: "2026-03-01T00:00:00.000Z", endDate: "2026-03-10T00:00:00.000Z" }),
        makeTask({ id: "t2", startDate: "2026-03-05T00:00:00.000Z", endDate: "2026-03-15T00:00:00.000Z" }),
        makeTask({ id: "t3", startDate: "2026-03-08T00:00:00.000Z", endDate: "2026-03-20T00:00:00.000Z" }),
      ];

      const { result } = renderHook(() => useGantt(tasks, [], "day"));
      expect(result.current.taskBars[0].y).toBe(0);
      expect(result.current.taskBars[1].y).toBe(40);
      expect(result.current.taskBars[2].y).toBe(80);
    });

    it("uses startDate + dueDate when endDate is missing", () => {
      const tasks = [
        makeTask({
          startDate: "2026-03-01T00:00:00.000Z",
          endDate: null,
          dueDate: "2026-03-10T00:00:00.000Z",
        }),
      ];

      const { result } = renderHook(() => useGantt(tasks, [], "day"));
      const bar = result.current.taskBars[0];
      expect(bar.width).toBeGreaterThan(0);
      expect(bar.x).toBeGreaterThan(0);
    });

    it("sets x=0, width=0 for tasks without date information", () => {
      const tasks = [
        makeTask({ startDate: null, endDate: null, dueDate: null }),
      ];

      const { result } = renderHook(() => useGantt(tasks, [], "day"));
      const bar = result.current.taskBars[0];
      expect(bar.x).toBe(0);
      expect(bar.width).toBe(0);
    });

    it("enforces minimum bar width of dayWidth", () => {
      // Start and end on the same day => endX - x = 0, but should be clamped to dayWidth
      const tasks = [
        makeTask({
          startDate: "2026-03-05T00:00:00.000Z",
          endDate: "2026-03-05T00:00:00.000Z",
        }),
      ];

      const { result } = renderHook(() => useGantt(tasks, [], "day"));
      const bar = result.current.taskBars[0];
      expect(bar.width).toBeGreaterThanOrEqual(result.current.dayWidth);
    });
  });

  // -- milestoneMarkers -------------------------------------------------------

  describe("milestoneMarkers", () => {
    it("returns one marker per milestone", () => {
      const milestones = [
        makeMilestone({ id: "m1" }),
        makeMilestone({ id: "m2", date: "2026-03-15T00:00:00.000Z" }),
      ];

      const { result } = renderHook(() => useGantt([], milestones, "day"));
      expect(result.current.milestoneMarkers).toHaveLength(2);
    });

    it("places milestones below all task rows", () => {
      const tasks = [
        makeTask({ id: "t1" }),
        makeTask({ id: "t2" }),
      ];
      const milestones = [makeMilestone({ id: "m1" })];

      const { result } = renderHook(() =>
        useGantt(tasks, milestones, "day")
      );

      // First milestone y should be tasks.length * ROW_HEIGHT = 2 * 40 = 80
      expect(result.current.milestoneMarkers[0].y).toBe(80);
    });

    it("computes x from milestone date", () => {
      const milestones = [
        makeMilestone({ date: "2026-03-10T00:00:00.000Z" }),
      ];

      const { result } = renderHook(() => useGantt([], milestones, "day"));
      const marker = result.current.milestoneMarkers[0];

      const expectedX = result.current.getXFromDate(
        new Date("2026-03-10T00:00:00.000Z")
      );
      expect(marker.x).toBeCloseTo(expectedX, 0);
    });
  });

  // -- reactivity on time scale changes ---------------------------------------

  describe("reactivity", () => {
    it("recalculates dayWidth when timeScale changes", () => {
      const { result, rerender } = renderHook(
        ({ scale }: { scale: TimeScale }) => useGantt([], [], scale),
        { initialProps: { scale: "day" as TimeScale } }
      );

      expect(result.current.dayWidth).toBe(40);

      rerender({ scale: "week" });
      expect(result.current.dayWidth).toBeCloseTo(60 / 7, 5);

      rerender({ scale: "month" });
      expect(result.current.dayWidth).toBeCloseTo(80 / 30, 5);
    });
  });
});

// ---------------------------------------------------------------------------
// useMilestones (fetch-based hook)
// ---------------------------------------------------------------------------

describe("useMilestones", () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    mockFetch.mockReset();
    vi.stubGlobal("fetch", mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // -- fetchMilestones --------------------------------------------------------

  describe("fetchMilestones (via initial effect)", () => {
    it("fetches milestones on mount when projectId is provided", async () => {
      const milestoneData = [makeMilestone()];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => milestoneData,
      });

      const { result } = renderHook(() => useMilestones("proj-1"));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/milestones?projectId=proj-1"
      );
      expect(result.current.milestones).toEqual(milestoneData);
    });

    it("does not fetch when projectId is null", async () => {
      const { result } = renderHook(() => useMilestones(null));

      // Give time for any potential fetch
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result.current.milestones).toEqual([]);
    });

    it("handles fetch errors gracefully", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Server error" }),
      });

      const { result } = renderHook(() => useMilestones("proj-1"));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.milestones).toEqual([]);
      consoleSpy.mockRestore();
    });
  });

  // -- createMilestone --------------------------------------------------------

  describe("createMilestone", () => {
    it("creates a milestone and appends it to the list", async () => {
      // Initial fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const { result } = renderHook(() => useMilestones("proj-1"));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newMilestone = makeMilestone({ id: "ms-new", name: "New MS" });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => newMilestone,
      });

      await act(async () => {
        await result.current.createMilestone({
          name: "New MS",
          date: "2026-03-01T00:00:00.000Z",
          projectId: "proj-1",
        });
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "New MS",
          date: "2026-03-01T00:00:00.000Z",
          projectId: "proj-1",
        }),
      });
      expect(result.current.milestones).toHaveLength(1);
      expect(result.current.milestones[0].id).toBe("ms-new");
    });

    it("throws on server error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const { result } = renderHook(() => useMilestones("proj-1"));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Validation failed" }),
      });

      await expect(
        act(async () => {
          await result.current.createMilestone({
            name: "",
            date: "2026-03-01T00:00:00.000Z",
            projectId: "proj-1",
          });
        })
      ).rejects.toThrow("Validation failed");
    });
  });

  // -- updateMilestone --------------------------------------------------------

  describe("updateMilestone", () => {
    it("updates a milestone in the list", async () => {
      const existing = makeMilestone({ id: "ms-1", name: "Old Name" });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [existing],
      });

      const { result } = renderHook(() => useMilestones("proj-1"));

      await waitFor(() => {
        expect(result.current.milestones).toHaveLength(1);
      });

      const updated = { ...existing, name: "New Name" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updated,
      });

      await act(async () => {
        await result.current.updateMilestone("ms-1", { name: "New Name" });
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/milestones/ms-1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "New Name" }),
      });
      expect(result.current.milestones[0].name).toBe("New Name");
    });

    it("throws on server error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [makeMilestone()],
      });

      const { result } = renderHook(() => useMilestones("proj-1"));

      await waitFor(() => {
        expect(result.current.milestones).toHaveLength(1);
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Not found" }),
      });

      await expect(
        act(async () => {
          await result.current.updateMilestone("ms-1", { name: "X" });
        })
      ).rejects.toThrow("Not found");
    });
  });

  // -- deleteMilestone --------------------------------------------------------

  describe("deleteMilestone", () => {
    it("removes the milestone from the list", async () => {
      const existing = makeMilestone({ id: "ms-1" });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [existing],
      });

      const { result } = renderHook(() => useMilestones("proj-1"));

      await waitFor(() => {
        expect(result.current.milestones).toHaveLength(1);
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await act(async () => {
        await result.current.deleteMilestone("ms-1");
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/milestones/ms-1", {
        method: "DELETE",
      });
      expect(result.current.milestones).toHaveLength(0);
    });

    it("throws on server error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [makeMilestone()],
      });

      const { result } = renderHook(() => useMilestones("proj-1"));

      await waitFor(() => {
        expect(result.current.milestones).toHaveLength(1);
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Delete failed" }),
      });

      await expect(
        act(async () => {
          await result.current.deleteMilestone("ms-1");
        })
      ).rejects.toThrow("Delete failed");
    });
  });

  // -- refetch on projectId change --------------------------------------------

  describe("projectId reactivity", () => {
    it("refetches milestones when projectId changes", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [makeMilestone({ id: "ms-a" })],
      });

      const { result, rerender } = renderHook(
        ({ pid }: { pid: string | null }) => useMilestones(pid),
        { initialProps: { pid: "proj-1" as string | null } }
      );

      await waitFor(() => {
        expect(result.current.milestones).toHaveLength(1);
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [
          makeMilestone({ id: "ms-b" }),
          makeMilestone({ id: "ms-c" }),
        ],
      });

      rerender({ pid: "proj-2" });

      await waitFor(() => {
        expect(result.current.milestones).toHaveLength(2);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/milestones?projectId=proj-2"
      );
    });
  });
});
