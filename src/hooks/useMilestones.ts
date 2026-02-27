import { useState, useEffect, useCallback } from "react";
import type { Milestone, CreateMilestoneInput } from "@/types";

export function useMilestones(projectId: string | null) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMilestones = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/milestones?projectId=${projectId}`);
      if (!response.ok) throw new Error("Failed to fetch milestones");
      const data = await response.json();
      setMilestones(data);
    } catch (error) {
      console.error("Failed to fetch milestones:", error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  const createMilestone = useCallback(
    async (input: CreateMilestoneInput) => {
      const response = await fetch("/api/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to create milestone");
      }
      const milestone = await response.json();
      setMilestones((prev) => [...prev, milestone]);
      return milestone;
    },
    [],
  );

  const updateMilestone = useCallback(
    async (id: string, input: Partial<Omit<CreateMilestoneInput, "projectId">>) => {
      const response = await fetch(`/api/milestones/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to update milestone");
      }
      const updated = await response.json();
      setMilestones((prev) =>
        prev.map((m) => (m.id === id ? updated : m)),
      );
      return updated;
    },
    [],
  );

  const deleteMilestone = useCallback(async (id: string) => {
    const response = await fetch(`/api/milestones/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to delete milestone");
    }
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return {
    milestones,
    loading,
    fetchMilestones,
    createMilestone,
    updateMilestone,
    deleteMilestone,
  };
}
