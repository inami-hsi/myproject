// 保険の種類定義
export type InsuranceCategory = 'auto' | 'fire' | 'liability' | 'injury' | 'term' | 'whole' | 'medical' | 'cancer' | 'annuity' | 'variable' | 'endowment' | 'education' | 'income' | 'nursing' | 'disability';
export type InsuranceType = 'loss' | 'life';

// 生命保険カテゴリのリスト
export const lifeInsuranceCategories: InsuranceCategory[] = ['term', 'whole', 'medical', 'cancer', 'annuity', 'variable', 'endowment', 'education', 'income', 'nursing', 'disability'];
export const lossInsuranceCategories: InsuranceCategory[] = ['auto', 'fire', 'liability', 'injury'];

// 保険会社定義
export interface InsuranceCompany {
  id: string;
  name: string;
  category: InsuranceType;
  url: string;
  scoring: Record<string, number>;
}

// 質問定義
export interface QuestionOption {
  id: string;
  label: string;
  score?: Record<string, number>;
}

export interface Question {
  step: number;
  question: string;
  type: 'single-select' | 'multi-select' | 'slider';
  options: QuestionOption[];
  tip?: string;
}

// ユーザー回答
export interface UserAnswers {
  insuranceType: InsuranceCategory;
  answers: Record<number, string | string[]>;
  timestamp?: number;
}

// 推奨結果
export interface RecommendationReason {
  summary: string;
  detailed: string;
}

export interface Recommendation {
  rank: 1 | 2;
  companyId: string;
  companyName: string;
  productName: string;
  estimatedPremium?: string;
  reasoning: RecommendationReason;
  matchScore: number;
  scoringBreakdown: Record<string, number>;
}

// スコアリング軸
export interface ScoringAxis {
  id: string;
  label: string;
  weight: number; // 重み係数
}

// L自動車保険特定の型
export namespace Auto {
  export interface AnswerModel {
    ageRange: 'age-18-20' | 'age-21-25' | 'age-26-34' | 'age-60+' | null;
    usageType: 'business' | 'commute' | 'leisure' | null;
    driverCount: 'solo' | 'couple' | 'family' | 'multi' | null;
    accidentHistory: 'none' | 'property-one' | 'property-multi' | 'injury' | null;
    vehicleType: 'standard' | 'light' | 'commercial' | 'highvalue' | null;
    priorityFeatures: ('accident-response' | 'cost' | 'lawyer-fee' | 'roadside-service' | 'digital' | 'rental-car')[];
    counselingPreference: 'face-to-face' | 'online' | 'web-self' | 'no-preference' | null;
    additionalServices: ('health-check' | 'safe-driving-app' | 'driving-analysis' | 'none')[];
  }
}

// 火災保険特定の型
export namespace Fire {
  export interface AnswerModel {
    buildingType: 'house' | 'apartment' | 'rental' | 'mixed' | null;
    ageOfBuilding: 'under-5' | '5-15' | '15-30' | 'over-30' | null;
    coverageTarget: 'building-only' | 'furniture-only' | 'both' | 'includes-business' | null;
    desiredDisasters: ('flood' | 'hail' | 'snow' | 'landslide' | 'earthquake' | 'typhoon' | 'theft')[];
    buildingStructure: 'wood-low' | 'wood-mid' | 'steel' | 'concrete-high' | null;
    priorityFeatures: ('basic-coverage' | 'water-damage' | 'theft' | 'breakage' | 'cost' | 'custom' | 'earthquake')[];
    contractLength: '1year' | '2-3years' | '5years' | '10years+' | null;
    counselingPreference: 'face-to-face' | 'online' | 'claim-first' | 'no-preference' | null;
  }
}

// 賠償責任保険特定の型
export namespace Liability {
  export interface AnswerModel {
    coverageTarget: 'daily-life' | 'sports-hobby' | 'pet' | 'all' | null;
    areaAndRisk: 'urban' | 'residential' | 'rural' | 'high-risk' | null;
    householdMembers: 'solo' | 'couple' | 'family-3' | 'multigenerational' | null;
    activityLevel: 'passive' | 'moderate' | 'active' | 'professional' | null;
    priorityFeatures: ('coverage-limit' | 'cost' | 'personal-injury' | 'legal-support' | 'quick-settlement' | 'custom')[];
    counselingPreference: 'face-to-face' | 'online' | 'web-self' | 'no-preference' | null;
    annualBudget: 'budget-1k' | 'budget-2k' | 'budget-3k' | 'unlimited' | null;
  }
}

// 傷害保険特定の型
export namespace Injury {
  export interface AnswerModel {
    occupation: 'office' | 'service' | 'construction' | 'dangerous' | 'other' | null;
    employmentType: 'employed' | 'part-time' | 'self-employed' | 'freelance' | 'unemployed' | null;
    riskLevel: 'low' | 'moderate' | 'high' | 'very-high' | null;
    hospitalDailyBenefit: '5000' | '10000' | '20000' | '30000+' | null;
    priorityFeatures: ('hospitalization' | 'occupational' | 'life-insurance' | 'recovery' | 'cost' | 'service')[];
    annualBudget: 'budget-500' | 'budget-1k' | 'budget-2k' | 'unlimited' | null;
    counselingPreference: 'face-to-face' | 'online' | 'web-self' | 'no-preference' | null;
  }
}
