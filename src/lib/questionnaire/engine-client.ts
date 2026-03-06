/**
 * Questionnaire Engine - Client-safe functions
 * These functions can be imported in client components
 */

import type {
  Question,
  NextStep,
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
    description: "過去3年以内の事故を選択してください（複数選択可）",
    options: [
      { value: "none", label: "事故なし" },
      { value: "minor", label: "軽微な事故（物損のみ）" },
      { value: "major", label: "大きな事故（人身事故を含む）" },
      { value: "at_fault", label: "自分に過失があった事故" },
    ],
    required: true,
  },
  {
    id: "drivers",
    insuranceType: "auto",
    step: 6,
    type: "multiple_choice",
    title: "運転する方を選択してください",
    description: "この車を運転する可能性がある方（複数選択可）",
    options: [
      { value: "self", label: "契約者本人" },
      { value: "spouse", label: "配偶者" },
      { value: "family", label: "同居の家族" },
      { value: "child", label: "別居の未婚の子" },
      { value: "other", label: "その他の方" },
    ],
    required: true,
  },
  {
    id: "coverage_needs",
    insuranceType: "auto",
    step: 7,
    type: "single_choice",
    title: "補償の重視ポイントは？",
    description: "補償内容で特に重視するものを選んでください",
    options: [
      {
        value: "basic",
        label: "最低限の補償",
        description: "対人・対物賠償のみ",
      },
      {
        value: "standard",
        label: "標準的な補償",
        description: "対人・対物賠償 + 車両保険",
      },
      {
        value: "comprehensive",
        label: "手厚い補償",
        description: "対人・対物賠償 + 車両保険 + 各種特約",
      },
    ],
    required: true,
  },
  {
    id: "budget",
    insuranceType: "auto",
    step: 8,
    type: "single_choice",
    title: "年間の保険料予算は？",
    description: "支払い可能な年間保険料の上限",
    options: [
      { value: "30000", label: "3万円以下" },
      { value: "50000", label: "5万円以下" },
      { value: "80000", label: "8万円以下" },
      { value: "100000", label: "10万円以下" },
      { value: "unlimited", label: "予算の上限なし" },
    ],
    required: true,
  },
];

/**
 * 火災保険の質問フロー設定（簡易版）
 */
const FIRE_INSURANCE_QUESTIONS: Question[] = [
  {
    id: "building_type",
    insuranceType: "fire",
    step: 1,
    type: "single_choice",
    title: "建物の種類を教えてください",
    options: [
      {
        value: "detached_house",
        label: "一戸建て（持家）",
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
