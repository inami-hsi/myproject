/**
 * Questionnaire types for Insurance project
 */

// 質問のタイプ
export type QuestionType = "single_choice" | "multiple_choice" | "slider" | "text";

// 選択肢
export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
}

// 質問定義
export interface Question {
  id: string;
  insuranceType: "auto" | "fire" | "liability";
  step: number;
  type: QuestionType;
  title: string;
  description?: string;
  options: QuestionOption[];
  required: boolean;
  skipCondition?: {
    field: string;
    value: string;
  };
}

// 次のステップの計算結果
export interface NextStep {
  stepId: string;
  insuranceType: "auto" | "fire" | "liability";
  action: "next" | "skip" | "complete";
}

// ユーザーの回答
export interface UserAnswer {
  questionId: string;
  value: string | string[] | number;
  timestamp: Date;
}

// 質問への回答セット
export interface QuestionnaireResponse {
  userId: string;
  insuranceType: "auto" | "fire" | "liability";
  responses: Record<string, string | string[] | number>;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// スコアリング用の回答セット（フラット構造）
export interface ScoringInput {
  drivingFrequency?: string;
  annualMileage?: number;
  vehicleType?: string;
  pastAccidents?: string[];
  drivers?: string[];
  coverageNeeds?: string;
  budget?: number;
  targetObject?: string;
  disasterRisks?: string[];
  location?: string;
}
