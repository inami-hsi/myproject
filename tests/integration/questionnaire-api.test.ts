import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { getQuestion, getNextStep } from "@/lib/questionnaire/engine";

/**
 * Integration Tests: Questionnaire API
 *
 * Tests the questionnaire flow through the database layer:
 * 1. Fetch questions by step
 * 2. Save user responses
 * 3. Retrieve saved responses
 * 4. Navigate through steps with branching logic
 */

describe("Questionnaire API Integration", () => {
  let testUserId: string;

  beforeAll(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: `qa-test-${Date.now()}@example.com`,
        name: "QA Test User",
        age: 35,
        cognitoId: `cognito-test-${Date.now()}`,
        emailVerified: new Date(),
      },
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    // Cleanup: Delete test data
    await prisma.questionnaireResponse.deleteMany({
      where: { userId: testUserId },
    });
    await prisma.user.delete({ where: { id: testUserId } });
  });

  describe("Step Navigation", () => {
    it("should return step 1 question for auto insurance", async () => {
      const question = getQuestion("auto", "vehicle_ownership");
      expect(question).not.toBeNull();
      expect(question!.id).toBe("vehicle_ownership");
      expect(question!.step).toBe(1);
      expect(question!.type).toBe("single_choice");
      expect(question!.options.length).toBeGreaterThan(0);
    });

    it("should return options with labels and values", async () => {
      const question = getQuestion("auto", "vehicle_ownership");
      expect(question!.options).toContainEqual(
        expect.objectContaining({
          value: "yes",
          label: expect.any(String),
        })
      );
    });

    it("should provide next step when answering yes to vehicle ownership", async () => {
      const nextStep = getNextStep("auto", "vehicle_ownership", "yes");
      expect(nextStep.action).toBe("next");
      expect(nextStep.stepId).toBe("driving_frequency");
    });

    it("should skip to completion when answering no to vehicle ownership", async () => {
      const nextStep = getNextStep("auto", "vehicle_ownership", "no");
      expect(nextStep.action).toBe("skip");
      expect(nextStep.stepId).toBe("complete_auto_and_redirect");
    });
  });

  describe("Response Persistence", () => {
    it("should save single response to database", async () => {
      const responses = {
        vehicle_ownership: "yes",
      };

      await prisma.questionnaireResponse.upsert({
        where: {
          userId_insuranceType: {
            userId: testUserId,
            insuranceType: "auto",
          },
        },
        create: {
          userId: testUserId,
          insuranceType: "auto",
          responses: responses,
        },
        update: {
          responses: responses,
        },
      });

      const saved = await prisma.questionnaireResponse.findUnique({
        where: {
          userId_insuranceType: {
            userId: testUserId,
            insuranceType: "auto",
          },
        },
      });

      expect(saved).toBeDefined();
      expect(saved?.responses).toEqual(responses);
    });

    it("should accumulate responses over multiple saves", async () => {
      // First response
      let responses: Record<string, string | string[]> = {
        vehicle_ownership: "yes",
        driving_frequency: "daily",
      };

      await prisma.questionnaireResponse.upsert({
        where: {
          userId_insuranceType: {
            userId: testUserId,
            insuranceType: "auto",
          },
        },
        create: {
          userId: testUserId,
          insuranceType: "auto",
          responses: responses,
        },
        update: {
          responses: responses,
        },
      });

      // Add more responses
      responses = {
        ...responses,
        annual_mileage: "20000_plus",
        vehicle_type: "car",
      };

      await prisma.questionnaireResponse.upsert({
        where: {
          userId_insuranceType: {
            userId: testUserId,
            insuranceType: "auto",
          },
        },
        create: {
          userId: testUserId,
          insuranceType: "auto",
          responses: responses,
        },
        update: {
          responses: responses,
        },
      });

      const saved = await prisma.questionnaireResponse.findUnique({
        where: {
          userId_insuranceType: {
            userId: testUserId,
            insuranceType: "auto",
          },
        },
      });

      expect(saved?.responses).toEqual(responses);
      expect(Object.keys(saved?.responses || {}).length).toBe(4);
    });

    it("should retrieve all responses for user and insurance type", async () => {
      const responses = {
        vehicle_ownership: "yes",
        driving_frequency: "weekly",
        annual_mileage: "10000_19999",
        vehicle_type: "suv",
        past_accidents: "none",
        drivers: "self_only",
        coverage_needs: ["liability", "vehicle"],
        budget: "monthly_5000_10000",
      };

      await prisma.questionnaireResponse.upsert({
        where: {
          userId_insuranceType: {
            userId: testUserId,
            insuranceType: "auto",
          },
        },
        create: {
          userId: testUserId,
          insuranceType: "auto",
          responses: responses,
        },
        update: {
          responses: responses,
        },
      });

      const saved = await prisma.questionnaireResponse.findUnique({
        where: {
          userId_insuranceType: {
            userId: testUserId,
            insuranceType: "auto",
          },
        },
      });

      expect(saved?.responses).toMatchObject({
        vehicle_ownership: "yes",
        driving_frequency: "weekly",
        annual_mileage: "10000_19999",
        vehicle_type: "suv",
      });
    });
  });

  describe("Multi-step Flow", () => {
    it("should handle 8-step auto insurance flow", async () => {
      const steps = [
        { q: "vehicle_ownership", answer: "yes", nextQ: "driving_frequency" },
        { q: "driving_frequency", answer: "daily", nextQ: "annual_mileage" },
        { q: "annual_mileage", answer: "20000_plus", nextQ: "vehicle_type" },
        { q: "vehicle_type", answer: "car", nextQ: "past_accidents" },
        { q: "past_accidents", answer: "none", nextQ: "drivers" },
        { q: "drivers", answer: "self_only", nextQ: "coverage_needs" },
      ];

      for (const step of steps) {
        const next = getNextStep("auto", step.q, step.answer);
        expect(next.stepId).toBe(step.nextQ);
        expect(next.action).toBe("next");
      }
    });

    it("should complete flow on step 8", async () => {
      const nextStep = getNextStep("auto", "budget", "monthly_5000_10000");
      expect(nextStep.action).toBe("complete");
    });
  });

  describe("Multiple Insurance Types", () => {
    it("should handle auto insurance independently", async () => {
      const autoResponses = { vehicle_ownership: "yes" };
      await prisma.questionnaireResponse.upsert({
        where: {
          userId_insuranceType: {
            userId: testUserId,
            insuranceType: "auto",
          },
        },
        create: {
          userId: testUserId,
          insuranceType: "auto",
          responses: autoResponses,
        },
        update: {
          responses: autoResponses,
        },
      });

      const auto = await prisma.questionnaireResponse.findUnique({
        where: {
          userId_insuranceType: {
            userId: testUserId,
            insuranceType: "auto",
          },
        },
      });

      expect(auto?.insuranceType).toBe("auto");
      expect(auto?.responses).toEqual(autoResponses);
    });

    it("should handle fire insurance independently", async () => {
      const fireResponses = { target_object: "detached_house" };
      await prisma.questionnaireResponse.upsert({
        where: {
          userId_insuranceType: {
            userId: testUserId,
            insuranceType: "fire",
          },
        },
        create: {
          userId: testUserId,
          insuranceType: "fire",
          responses: fireResponses,
        },
        update: {
          responses: fireResponses,
        },
      });

      const fire = await prisma.questionnaireResponse.findUnique({
        where: {
          userId_insuranceType: {
            userId: testUserId,
            insuranceType: "fire",
          },
        },
      });

      expect(fire?.insuranceType).toBe("fire");
      expect(fire?.responses).toEqual(fireResponses);
    });

    it("should maintain separate responses for different insurance types", async () => {
      const autoResponses = { vehicle_ownership: "yes" };
      const fireResponses = { target_object: "apartment" };

      await prisma.questionnaireResponse.upsert({
        where: {
          userId_insuranceType: {
            userId: testUserId,
            insuranceType: "auto",
          },
        },
        create: {
          userId: testUserId,
          insuranceType: "auto",
          responses: autoResponses,
        },
        update: {
          responses: autoResponses,
        },
      });

      await prisma.questionnaireResponse.upsert({
        where: {
          userId_insuranceType: {
            userId: testUserId,
            insuranceType: "fire",
          },
        },
        create: {
          userId: testUserId,
          insuranceType: "fire",
          responses: fireResponses,
        },
        update: {
          responses: fireResponses,
        },
      });

      const auto = await prisma.questionnaireResponse.findUnique({
        where: {
          userId_insuranceType: {
            userId: testUserId,
            insuranceType: "auto",
          },
        },
      });

      const fire = await prisma.questionnaireResponse.findUnique({
        where: {
          userId_insuranceType: {
            userId: testUserId,
            insuranceType: "fire",
          },
        },
      });

      expect(auto?.responses).toEqual(autoResponses);
      expect(fire?.responses).toEqual(fireResponses);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty responses", async () => {
      const emptyResponses = {};
      await prisma.questionnaireResponse.upsert({
        where: {
          userId_insuranceType: {
            userId: testUserId,
            insuranceType: "auto",
          },
        },
        create: {
          userId: testUserId,
          insuranceType: "auto",
          responses: emptyResponses,
        },
        update: {
          responses: emptyResponses,
        },
      });

      const saved = await prisma.questionnaireResponse.findUnique({
        where: {
          userId_insuranceType: {
            userId: testUserId,
            insuranceType: "auto",
          },
        },
      });

      expect(saved?.responses).toEqual(emptyResponses);
    });

    it("should handle array values in responses (multiple choice)", async () => {
      const multiChoiceResponses = {
        vehicle_ownership: "yes",
        coverage_needs: ["liability", "vehicle", "passenger"],
      };

      await prisma.questionnaireResponse.upsert({
        where: {
          userId_insuranceType: {
            userId: testUserId,
            insuranceType: "auto",
          },
        },
        create: {
          userId: testUserId,
          insuranceType: "auto",
          responses: multiChoiceResponses,
        },
        update: {
          responses: multiChoiceResponses,
        },
      });

      const saved = await prisma.questionnaireResponse.findUnique({
        where: {
          userId_insuranceType: {
            userId: testUserId,
            insuranceType: "auto",
          },
        },
      });

      const responses = saved?.responses as Record<string, unknown>;
      expect(Array.isArray(responses?.coverage_needs)).toBe(true);
      expect(responses?.coverage_needs).toHaveLength(3);
    });

    it("should update existing responses without creating duplicates", async () => {
      const initialResponses = { vehicle_ownership: "yes" };
      const updatedResponses = {
        vehicle_ownership: "yes",
        driving_frequency: "daily",
      };

      await prisma.questionnaireResponse.upsert({
        where: {
          userId_insuranceType: {
            userId: testUserId,
            insuranceType: "auto",
          },
        },
        create: {
          userId: testUserId,
          insuranceType: "auto",
          responses: initialResponses,
        },
        update: {
          responses: initialResponses,
        },
      });

      await prisma.questionnaireResponse.upsert({
        where: {
          userId_insuranceType: {
            userId: testUserId,
            insuranceType: "auto",
          },
        },
        create: {
          userId: testUserId,
          insuranceType: "auto",
          responses: updatedResponses,
        },
        update: {
          responses: updatedResponses,
        },
      });

      const allRecords = await prisma.questionnaireResponse.findMany({
        where: {
          userId: testUserId,
          insuranceType: "auto",
        },
      });

      // Should only have one record
      expect(allRecords).toHaveLength(1);
      expect(allRecords[0].responses).toEqual(updatedResponses);
    });
  });
});
