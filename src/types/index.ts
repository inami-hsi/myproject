// 保険の種類定義
export type InsuranceCategory = 'auto' | 'fire' | 'liability' | 'injury';
export type InsuranceType = 'loss' | 'life';

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
  rank: 1 | 2 | 3;
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
