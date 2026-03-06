import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  questionnaireResponse: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
  complianceLog: {
    create: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

vi.mock("@/lib/auth", () => ({
  logComplianceAction: vi.fn(),
}));

import {
  canSkipToEnd,
  getNextStep,
  getQuestion,
  getQuestionByStep,
  getQuestionFlow,
  getResponses,
  normalizeResponsesToScoringInput,
  saveResponses,
} from "@/lib/questionnaire/engine";

describe("Questionnaire Engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getQuestion", () => {
    it("retrieves auto insurance questions by ID", () => {
      const question = getQuestion("auto", "vehicle_ownership");
      expect(question).not.toBeNull();
      expect(question?.title).toContain("お車をお持ちですか");
      expect(question?.step).toBe(1);
    });

    it("returns null for non-existent question", () => {
      const question = getQuestion("auto", "non_existent");
      expect(question).toBeNull();
    });

    it("retrieves fire insurance questions", () => {
      const question = getQuestion("fire", "target_object");
      expect(question).not.toBeNull();
      expect(question?.title).toContain("対象の建物");
    });
  });

  describe("getQuestionByStep", () => {
    it("retrieves question by step number", () => {
      const question = getQuestionByStep("auto", 1);
      expect(question?.id).toBe("vehicle_ownership");
    });

    it("gets driving frequency at step 2", () => {
      const question = getQuestionByStep("auto", 2);
      expect(question?.id).toBe("driving_frequency");
    });

    it("returns null for invalid step", () => {
      const question = getQuestionByStep("auto", 999);
      expect(question).toBeNull();
    });
  });

  describe("Branching Logic", () => {
    it("skips auto insurance when user answers NO to vehicle ownership", () => {
      const nextStep = getNextStep("auto", "vehicle_ownership", "no");
      expect(nextStep.action).toBe("skip");
      expect(nextStep.stepId).toContain("complete");
    });

    it("continues to step 2 when answering YES", () => {
      const nextStep = getNextStep("auto", "vehicle_ownership", "yes");
      expect(nextStep.action).toBe("next");
      expect(nextStep.stepId).toBe("driving_frequency");
    });

    it("progresses through auto insurance steps sequentially", () => {
      // Test that we can progress from step 1 → 2 → 3
      const step1to2 = getNextStep("auto", "vehicle_ownership", "yes");
      expect(step1to2.stepId).toBe("driving_frequency");

      const step2to3 = getNextStep("auto", "driving_frequency", "daily");
      expect(step2to3.stepId).toBe("annual_mileage");

      const step3to4 = getNextStep("auto", "annual_mileage", "20000_plus");
      expect(step3to4.stepId).toBe("vehicle_type");
    });

    it("completes after step 8 of auto insurance", () => {
      const nextStep = getNextStep("auto", "budget", "budget_30000_50000");
      expect(nextStep.action).toBe("complete");
    });

    it("completes fire insurance after step 1", () => {
      const nextStep = getNextStep("fire", "target_object", "detached_house");
      expect(nextStep.action).toBe("complete");
    });
  });

  describe("canSkipToEnd", () => {
    it("returns true when answering NO to vehicle ownership", () => {
      const canSkip = canSkipToEnd("auto", "vehicle_ownership", "no");
      expect(canSkip).toBe(true);
    });

    it("returns false when answering YES", () => {
      const canSkip = canSkipToEnd("auto", "vehicle_ownership", "yes");
      expect(canSkip).toBe(false);
    });
  });

  describe("Responses Management", () => {
    it("saves questionnaire responses", async () => {
      mockPrisma.questionnaireResponse.upsert.mockResolvedValueOnce({
        userId: "u1",
        insuranceType: "auto",
        responses: { vehicle_ownership: "yes" },
      });

      await saveResponses("u1", "auto", { vehicle_ownership: "yes" });

      expect(mockPrisma.questionnaireResponse.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId_insuranceType: {
              userId: "u1",
              insuranceType: "auto",
            },
          }),
        })
      );
    });

    it("retrieves questionnaire responses", async () => {
      mockPrisma.questionnaireResponse.findUnique.mockResolvedValueOnce({
        userId: "u1",
        insuranceType: "auto",
        responses: { vehicle_ownership: "yes", driving_frequency: "daily" },
      });

      const responses = await getResponses("u1", "auto");

      expect(responses).toEqual({
        vehicle_ownership: "yes",
        driving_frequency: "daily",
      });
    });

    it("returns null when no responses found", async () => {
      mockPrisma.questionnaireResponse.findUnique.mockResolvedValueOnce(null);

      const responses = await getResponses("u1", "nonexistent");

      expect(responses).toBeNull();
    });
  });

  describe("Question Flow", () => {
    it("returns 8 questions for auto insurance", () => {
      const flow = getQuestionFlow("auto");
      expect(flow).toHaveLength(8);
    });

    it("returns 1 question for fire insurance", () => {
      const flow = getQuestionFlow("fire");
      expect(flow).toHaveLength(1);
    });

    it("returns empty array for unknown insurance type", () => {
      const flow = getQuestionFlow("unknown");
      expect(flow).toHaveLength(0);
    });
  });

  describe("Response Normalization", () => {
    it("normalizes auto insurance responses to scoring input", () => {
      const responses = {
        driving_frequency: "daily",
        annual_mileage: "20000_plus",
        vehicle_type: "sedan",
        past_accidents: "none",
        drivers: "self",
        coverage_needs: "standard",
        budget: "50000",
      };

      const scoringInput = normalizeResponsesToScoringInput(
        responses,
        "auto"
      );

      expect(scoringInput.drivingFrequency).toBe("daily");
      expect(scoringInput.annualMileage).toBe(25000);
      expect(scoringInput.vehicleType).toBe("sedan");
      expect(scoringInput.coverageNeeds).toBe("standard");
      expect(scoringInput.budget).toBe(50000);
    });

    it("handles array values in normalization", () => {
      const responses = {
        driving_frequency: "weekly",
        annual_mileage: "10000_20000",
        drivers: ["self", "spouse"],
        past_accidents: ["minor_recent", "none"],
      };

      const scoringInput = normalizeResponsesToScoringInput(
        responses,
        "auto"
      );

      expect(Array.isArray(scoringInput.drivers)).toBe(true);
      expect(Array.isArray(scoringInput.pastAccidents)).toBe(true);
    });
  });

  describe("Question Properties", () => {
    it("vehicle_ownership is marked as required", () => {
      const question = getQuestion("auto", "vehicle_ownership");
      expect(question?.required).toBe(true);
    });

    it("driving_frequency has 4 options", () => {
      const question = getQuestion("auto", "driving_frequency");
      expect(question?.options).toHaveLength(4);
    });

    it("annual_mileage options include descriptions", () => {
      const question = getQuestion("auto", "annual_mileage");
      const optionWithDesc = question?.options.find((o) => o.description);
      expect(optionWithDesc?.description).toBeDefined();
    });

    it("past_accidents allows multiple choices", () => {
      const question = getQuestion("auto", "past_accidents");
      expect(question?.type).toBe("multiple_choice");
    });

    it("budget question is the last step", () => {
      const question = getQuestion("auto", "budget");
      expect(question?.step).toBe(8);
    });
  });
});
