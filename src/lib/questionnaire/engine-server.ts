import { prisma } from "@/lib/prisma";
import { logComplianceAction } from "@/lib/auth";

/**
 * ユーザーの回答を保存
 */
export async function saveResponses(
  userId: string,
  insuranceType: string,
  responses: Record<string, string | string[] | number>
): Promise<void> {
  try {
    await prisma.questionnaireResponse.upsert({
      where: {
        userId_insuranceType: {
          userId,
          insuranceType: insuranceType as "auto" | "fire" | "liability",
        },
      },
      update: {
        responses,
        updatedAt: new Date(),
      },
      create: {
        userId,
        insuranceType: insuranceType as "auto" | "fire" | "liability",
        responses,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await logComplianceAction("questionnaire_updated", userId, {
      insuranceType,
      questionCount: Object.keys(responses).length,
    });
  } catch (error) {
    console.error("Failed to save questionnaire responses:", error);
    throw error;
  }
}

/**
 * ユーザーの回答を取得
 */
export async function getResponses(
  userId: string,
  insuranceType: string
): Promise<Record<string, string | string[] | number> | null> {
  try {
    const response = await prisma.questionnaireResponse.findUnique({
      where: {
        userId_insuranceType: {
          userId,
          insuranceType: insuranceType as "auto" | "fire" | "liability",
        },
      },
    });
    return (response?.responses as Record<string, string | string[] | number>) ?? null;
  } catch (error) {
    console.error("Failed to get questionnaire responses:", error);
    return null;
  }
}
