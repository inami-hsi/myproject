import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockPrisma, mockCookies } = vi.hoisted(() => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    session: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    emailConfirmation: {
      create: vi.fn(),
      findFirst: vi.fn(),
      delete: vi.fn(),
    },
    complianceLog: {
      create: vi.fn(),
    },
  };

  const mockCookies = vi.fn();

  return { mockPrisma, mockCookies };
});

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

vi.mock("next/headers", () => ({
  cookies: mockCookies,
}));

import {
  createSession,
  destroySession,
  getCurrentUser,
  registerUser,
  sendConfirmationEmail,
  updateUserProfile,
  verifyConfirmationToken,
} from "@/lib/auth";

describe("auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("registerUser", () => {
    it("returns validation errors for invalid inputs", async () => {
      const result = await registerUser({
        email: "bad-email",
        name: "",
        age: 10,
        authMethod: "EMAIL",
      });

      expect(result.status).toBe("error");
      expect(result.errors).toMatchObject({
        email: "正しいメール形式を入力してください",
        name: "氏名を入力してください",
        age: "18～99歳の年齢を入力してください",
      });
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    });

    it("returns duplicate email error", async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: "u1" });

      const result = await registerUser({
        email: "existing@example.com",
        name: "Taro",
        age: 30,
        authMethod: "EMAIL",
      });

      expect(result.status).toBe("error");
      expect(result.message).toContain("既に登録済み");
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it("creates a user and logs compliance", async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      mockPrisma.user.create.mockResolvedValueOnce({ id: "u2" });
      mockPrisma.complianceLog.create.mockResolvedValueOnce({ id: "c1" });

      const result = await registerUser({
        email: "new@example.com",
        name: "Hanako",
        age: 28,
        authMethod: "EMAIL",
      });

      expect(result).toMatchObject({
        status: "success",
        userId: "u2",
      });
      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(mockPrisma.complianceLog.create).toHaveBeenCalled();
    });
  });

  describe("sendConfirmationEmail", () => {
    it("stores token and returns success", async () => {
      mockPrisma.emailConfirmation.create.mockResolvedValueOnce({ id: "ec1" });

      const result = await sendConfirmationEmail("u1", "u1@example.com");

      expect(result.status).toBe("success");
      expect(mockPrisma.emailConfirmation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: "u1",
            email: "u1@example.com",
          }),
        })
      );
    });
  });

  describe("verifyConfirmationToken", () => {
    it("returns error when token not found or expired", async () => {
      mockPrisma.emailConfirmation.findFirst.mockResolvedValueOnce(null);

      const result = await verifyConfirmationToken("invalid-token");

      expect(result.status).toBe("error");
      expect(result.message).toContain("無効");
    });

    it("verifies token, updates user, and deletes token", async () => {
      mockPrisma.emailConfirmation.findFirst.mockResolvedValueOnce({
        id: "ec1",
        userId: "u1",
        email: "u1@example.com",
      });
      mockPrisma.user.update.mockResolvedValueOnce({ id: "u1" });
      mockPrisma.emailConfirmation.delete.mockResolvedValueOnce({ id: "ec1" });
      mockPrisma.complianceLog.create.mockResolvedValueOnce({ id: "c2" });

      const result = await verifyConfirmationToken("valid-token");

      expect(result).toMatchObject({
        status: "success",
        userId: "u1",
      });
      expect(mockPrisma.user.update).toHaveBeenCalled();
      expect(mockPrisma.emailConfirmation.delete).toHaveBeenCalledWith({
        where: { id: "ec1" },
      });
    });
  });

  describe("updateUserProfile", () => {
    it("maps fields and updates profile", async () => {
      mockPrisma.user.update.mockResolvedValueOnce({ id: "u1" });
      mockPrisma.complianceLog.create.mockResolvedValueOnce({ id: "c3" });

      const result = await updateUserProfile("u1", {
        age: 40,
        gender: "M",
        occupation: "会社員",
        children: 2,
        spouse: true,
        prefecture: "東京都",
        existingInsurance: false,
      });

      expect(result.status).toBe("success");
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "u1" },
          data: expect.objectContaining({
            childrenCount: 2,
            hasSpouse: true,
            hasExistingInsurance: false,
          }),
        })
      );
    });
  });

  describe("session", () => {
    it("returns null when no cookie is present", async () => {
      mockCookies.mockResolvedValueOnce({
        get: vi.fn().mockReturnValue(undefined),
      });

      const user = await getCurrentUser();

      expect(user).toBeNull();
    });

    it("returns null when session expired", async () => {
      mockCookies.mockResolvedValueOnce({
        get: vi.fn().mockReturnValue({ value: "u1" }),
      });
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: "u1" });
      mockPrisma.session.findUnique.mockResolvedValueOnce({
        userId: "u1",
        expiresAt: new Date(Date.now() - 1000),
      });

      const user = await getCurrentUser();

      expect(user).toBeNull();
    });

    it("creates session and returns userId", async () => {
      mockPrisma.session.upsert.mockResolvedValueOnce({ userId: "u1" });

      const sessionId = await createSession("u1");

      expect(sessionId).toBe("u1");
      expect(mockPrisma.session.upsert).toHaveBeenCalled();
    });

    it("destroySession does not throw when session does not exist", async () => {
      mockPrisma.session.delete.mockRejectedValueOnce(new Error("not found"));

      await expect(destroySession("u1")).resolves.toBeUndefined();
    });
  });
});
