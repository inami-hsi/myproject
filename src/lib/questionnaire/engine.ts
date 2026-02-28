import { prisma } from "@/lib/prisma";
import { logComplianceAction } from "@/lib/auth";
import type {
  Question,
  NextStep,
  QuestionnaireResponse,
  ScoringInput,
} from "@/types/questionnaire";

/**
 * 自動車保険の質問フロー設定
 */
const AUTO_INSURANCE_QUESTIONS: Question[] = [
  {
    id: "vehicle_ownership",
    insuranceType: "auto",
    step: 1,
    type: "single_choice",
    title: "お車をお持ちですか？",
    description: "現在、自動車を所有・使用していますか？",
    options: [
      {
        value: "yes",
        label: "はい、持っています",
        description: "現在使用している自動車がある",
      },
      {
        value: "no",
        label: "いいえ、持っていません",
        description: "現在自動車を所有していない",
      },
    ],
    required: true,
  },
  {
    id: "driving_frequency",
    insuranceType: "auto",
    step: 2,
    type: "single_choice",
    title: "運転の頻度を教えてください",
    description: "週にどのくらい運転しますか？",
    options: [
      { value: "daily", label: "毎日" },
      { value: "weekly", label: "週に数回" },
      { value: "occasionally", label: "月に数回" },
      { value: "rarely", label: "ほとんど乗らない" },
    ],
    required: true,
  },
  {
    id: "annual_mileage",
    insuranceType: "auto",
    step: 3,
    type: "single_choice",
    title: "年間走行距離は？",
    description: "1年間で走る距離の目安を教えてください",
    options: [
      {
        value: "less_5000",
        label: "5,000km 未満",
        description: "低走行",
      },
      {
        value: "5000_10000",
        label: "5,000～10,000km",
        description: "標準走行",
      },
      {
        value: "10000_20000",
        label: "10,000～20,000km",
        description: "標準から高走行",
      },
      {
        value: "20000_plus",
        label: "20,000km 以上",
        description: "高走行",
      },
    ],
    required: true,
  },
  {
    id: "vehicle_type",
    insuranceType: "auto",
    step: 4,
    type: "single_choice",
    title: "車種を選択してください",
    options: [
      { value: "sedan", label: "セダン" },
      { value: "suv", label: "SUV・クロスオーバー" },
      { value: "minivan", label: "ミニバン" },
      { value: "truck", label: "トラック" },
      { value: "other", label: "その他" },
    ],
    required: true,
  },
  {
    id: "past_accidents",
    insuranceType: "auto",
    step: 5,
    type: "multiple_choice",
    title: "過去の事故歴を教えてください",
    description: "過去10年以内の事故があれば選択してください",
    options: [
      {
        value: "minor_recent",
        label: "軽い事故（最近3年以内）",
      },
      {
        value: "minor_old",
        label: "軽い事故（3～10年前）",
      },
      {
        value: "major_recent",
        label: "重大な事故（最近3年以内）",
      },
      {
        value: "major_old",
        label: "重大な事故（3～10年前）",
      },
      {
        value: "none",
        label: "事故歴なし",
      },
    ],
    required: true,
  },
  {
    id: "drivers",
    insuranceType: "auto",
    step: 6,
    type: "multiple_choice",
    title: "運転者について",
    description: "このお車を運転する人を教えてください",
    options: [
      {
        value: "self",
        label: "本人のみ",
        description: "本人以外は運転しない",
      },
      {
        value: "spouse",
        label: "配偶者",
        description: "配偶者が運転することがある",
      },
      {
        value: "family",
        label: "その他の家族",
        description: "家族の他のメンバーが運転",
      },
      {
        value: "employees",
        label: "従業員",
        description: "業務用：従業員が運転",
      },
    ],
    required: true,
  },
  {
    id: "coverage_needs",
    insuranceType: "auto",
    step: 7,
    type: "single_choice",
    title: "希望する補償内容は？",
    description: "どのレベルの補償を希望しますか？",
    options: [
      {
        value: "basic",
        label: "基本的な補償",
        description: "最小限の補償で保険料を抑える",
      },
      {
        value: "standard",
        label: "標準的な補償",
        description: "バランス取れた補償内容",
      },
      {
        value: "comprehensive",
        label: "充実した補償",
        description: "手厚い補償で安心をプラス",
      },
      {
        value: "premium",
        label: "プレミアム補償",
        description: "最高レベルの補償内容",
      },
    ],
    required: true,
  },
  {
    id: "budget",
    insuranceType: "auto",
    step: 8,
    type: "single_choice",
    title: "保険料の予算は？",
    description: "年間の保険料予算を教えてください",
    options: [
      { value: "budget_under_30000", label: "30,000円未満" },
      { value: "budget_30000_50000", label: "30,000～50,000円" },
      { value: "budget_50000_80000", label: "50,000～80,000円" },
      { value: "budget_80000_plus", label: "80,000円以上" },
    ],
    required: true,
  },
];

/**
 * 火災保険の質問フロー設定
 */
const FIRE_INSURANCE_QUESTIONS: Question[] = [
  {
    id: "target_object",
    insuranceType: "fire",
    step: 1,
    type: "single_choice",
    title: "対象の建物はどれですか？",
    options: [
      {
        value: "detached_house",
        label: "戸建住宅",
      },
      {
        value: "condominium",
        label: "マンション（分譲）",
      },
      {
        value: "rental_apartment",
        label: "賃貸住宅（アパート・借家）",
      },
      {
        value: "other",
        label: "その他",
      },
    ],
    required: true,
  },
];

/**
 * 質問定義を取得
 */
function getQuestionsForType(insuranceType: string): Question[] {
  switch (insuranceType) {
    case "auto":
      return AUTO_INSURANCE_QUESTIONS;
    case "fire":
      return FIRE_INSURANCE_QUESTIONS;
    default:
      return [];
  }
}

/**
 * 指定IDの質問を取得
 * @param insuranceType 保険種別
 * @param questionId 質問ID
 */
export function getQuestion(
  insuranceType: string,
  questionId: string
): Question | null {
  const questions = getQuestionsForType(insuranceType);
  return questions.find((q) => q.id === questionId) ?? null;
}

/**
 * ステップから質問を取得
 */
export function getQuestionByStep(
  insuranceType: string,
  step: number
): Question | null {
  const questions = getQuestionsForType(insuranceType);
  return questions.find((q) => q.step === step) ?? null;
}

/**
 * 次のステップを計算（分岐ロジック対応）
 * @param insuranceType 保険種別
 * @param questionId 現在の質問ID
 * @param answer ユーザーの回答
 */
export function getNextStep(
  insuranceType: string,
  questionId: string,
  answer: string | string[]
): NextStep {
  // 自動車保険の分岐ロジック
  if (insuranceType === "auto") {
    // ステップ1: 車の所有確認
    if (questionId === "vehicle_ownership" && answer === "no") {
      return {
        stepId: "complete_auto_and_redirect",
        insuranceType: "auto",
        action: "skip",
      };
    }

    // 標準フロー: 次のステップへ
    const currentQuestion = getQuestion(insuranceType, questionId);
    if (currentQuestion) {
      const nextStep = currentQuestion.step + 1;
      const nextQuestion = getQuestionByStep(insuranceType, nextStep);
      if (nextQuestion) {
        return {
          stepId: nextQuestion.id,
          insuranceType: "auto",
          action: "next",
        };
      }
      // 最後のステップに達した
      return {
        stepId: "complete",
        insuranceType: "auto",
        action: "complete",
      };
    }
  }

  // 火災保険
  if (insuranceType === "fire") {
    const currentQuestion = getQuestion(insuranceType, questionId);
    if (currentQuestion && currentQuestion.step === 1) {
      return {
        stepId: "complete",
        insuranceType: "fire",
        action: "complete",
      };
    }
  }

  return {
    stepId: "error",
    insuranceType: (insuranceType as "auto" | "fire" | "liability") ?? "auto",
    action: "next",
  };
}

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
        // Prismaでユニーク条件を複数フィールドで指定
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

    // ロ方式コンプライアンスログ
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
    return response?.responses ?? null;
  } catch (error) {
    console.error("Failed to get questionnaire responses:", error);
    return null;
  }
}

/**
 * 全てのステップをスキップできるか確認
 */
export function canSkipToEnd(
  insuranceType: string,
  questionId: string,
  answer: string | string[]
): boolean {
  const nextStep = getNextStep(insuranceType, questionId, answer);
  return nextStep.action === "skip";
}

/**
 * 質問フロー全体を取得
 */
export function getQuestionFlow(insuranceType: string): Question[] {
  return getQuestionsForType(insuranceType);
}

/**
 * 質問への回答から スコアリング用の構造化入力を生成
 */
export function normalizeResponsesToScoringInput(
  responses: Record<string, string | string[] | number>,
  insuranceType: string
): ScoringInput {
  const input: ScoringInput = {};

  if (insuranceType === "auto") {
    if (responses.driving_frequency) {
      input.drivingFrequency = responses.driving_frequency as string;
    }
    if (responses.annual_mileage) {
      const mileageValue = responses.annual_mileage as string;
      const mileageMap: Record<string, number> = {
        less_5000: 2500,
        "5000_10000": 7500,
        "10000_20000": 15000,
        "20000_plus": 25000,
      };
      input.annualMileage = mileageMap[mileageValue] ?? 10000;
    }
    if (responses.vehicle_type) {
      input.vehicleType = responses.vehicle_type as string;
    }
    if (responses.past_accidents) {
      input.pastAccidents = Array.isArray(responses.past_accidents)
        ? (responses.past_accidents as string[])
        : [responses.past_accidents as string];
    }
    if (responses.drivers) {
      input.drivers = Array.isArray(responses.drivers)
        ? (responses.drivers as string[])
        : [responses.drivers as string];
    }
    if (responses.coverage_needs) {
      input.coverageNeeds = responses.coverage_needs as string;
    }
    if (responses.budget) {
      input.budget = parseInt(responses.budget as string) ?? 50000;
    }
  }

  return input;
}
