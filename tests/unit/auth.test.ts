import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSupabase = vi.hoisted(() => ({
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
}));

const mockAuth = vi.hoisted(() => vi.fn());
const mockCurrentUser = vi.hoisted(() => vi.fn());

vi.mock("@clerk/nextjs/server", () => ({
  auth: mockAuth,
  currentUser: mockCurrentUser,
}));

vi.mock("@/lib/supabase/server", () => ({
  createServiceRoleClient: () => mockSupabase,
}));

import {
  getCurrentUser,
  requireUser,
  getClerkProfile,
  updateUserProfile,
  logComplianceAction,
} from "@/lib/auth";

describe("auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from.mockReturnThis();
    mockSupabase.select.mockReturnThis();
    mockSupabase.eq.mockReturnThis();
  });

  describe("getCurrentUser", () => {
    it("returns null when not authenticated", async () => {
      mockAuth.mockResolvedValueOnce({ userId: null });

      const user = await getCurrentUser();
      expect(user).toBeNull();
    });

    it("returns user data when authenticated", async () => {
      mockAuth.mockResolvedValueOnce({ userId: "clerk_123" });
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: "u1", clerk_user_id: "clerk_123", email: "test@example.com" },
      });

      const user = await getCurrentUser();
      expect(user).toEqual({
        id: "u1",
        clerk_user_id: "clerk_123",
        email: "test@example.com",
      });
      expect(mockSupabase.from).toHaveBeenCalledWith("users");
      expect(mockSupabase.eq).toHaveBeenCalledWith("clerk_user_id", "clerk_123");
    });

    it("returns null when user not found in database", async () => {
      mockAuth.mockResolvedValueOnce({ userId: "clerk_123" });
      mockSupabase.single.mockResolvedValueOnce({ data: null });

      const user = await getCurrentUser();
      expect(user).toBeNull();
    });
  });

  describe("requireUser", () => {
    it("returns user when authenticated", async () => {
      mockAuth.mockResolvedValueOnce({ userId: "clerk_123" });
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: "u1", clerk_user_id: "clerk_123" },
      });

      const user = await requireUser();
      expect(user).toEqual({ id: "u1", clerk_user_id: "clerk_123" });
    });

    it("throws when not authenticated", async () => {
      mockAuth.mockResolvedValueOnce({ userId: null });

      await expect(requireUser()).rejects.toThrow("Unauthorized");
    });
  });

  describe("getClerkProfile", () => {
    it("returns null when no clerk user", async () => {
      mockCurrentUser.mockResolvedValueOnce(null);

      const profile = await getClerkProfile();
      expect(profile).toBeNull();
    });

    it("returns mapped profile from clerk user", async () => {
      mockCurrentUser.mockResolvedValueOnce({
        id: "clerk_123",
        emailAddresses: [{ emailAddress: "test@example.com" }],
        firstName: "Taro",
        lastName: "Yamada",
        imageUrl: "https://example.com/avatar.png",
      });

      const profile = await getClerkProfile();
      expect(profile).toEqual({
        id: "clerk_123",
        email: "test@example.com",
        firstName: "Taro",
        lastName: "Yamada",
        imageUrl: "https://example.com/avatar.png",
      });
    });
  });

  describe("updateUserProfile", () => {
    it("is a no-op stub that does not throw", async () => {
      await expect(
        updateUserProfile("u1", { age: 30, occupation: "engineer" })
      ).resolves.toBeUndefined();
    });
  });

  describe("logComplianceAction", () => {
    it("is a no-op stub that does not throw", async () => {
      await expect(
        logComplianceAction("test_action", "u1", { key: "value" })
      ).resolves.toBeUndefined();
    });
  });
});
