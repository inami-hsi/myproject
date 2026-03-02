/**
 * 統合推薦シミュレーション
 * 各保険カテゴリに対してサンプル回答で推奨を生成し、形式とスコア範囲を検証します。
 */

import { calculateRecommendations, getScoringAxes } from '@/lib/scoring';
import { InsuranceCategory } from '@/types';

const samples: Record<InsuranceCategory, Record<number, string | string[]>> = {
  auto: {
    1: '30-39',
    2: 'commute',
    3: '1',
    4: 'sedan',
    5: ['accident-response', 'cost', 'digital'],
    6: ['rental-car', 'roadside-service'],
    7: 'face-to-face',
    8: ['none'],
  },
  fire: {
    1: 'house',
    2: 'under-5',
    3: 'both',
    4: ['flood', 'typhoon'],
    5: 'wood-low',
    6: ['basic-coverage', 'cost', 'water-damage'],
    7: '5years',
    8: 'claim-first',
  },
  liability: {
    1: 'daily-life',
    2: 'urban',
    3: 'family-3',
    4: 'moderate',
    5: ['legal-support', 'coverage-limit', 'cost'],
    6: 'face-to-face',
    7: 'budget-2k',
  },
  injury: {
    1: 'office',
    2: 'employed',
    3: 'low',
    4: '10000',
    5: ['hospitalization', 'cost', 'service'],
    6: 'budget-1k',
    7: 'online',
  },
  term: {
    1: '30-39',
    2: 'married-child',
    3: '20years',
    4: '30m',
    5: ['cost', 'coverage', 'claim-handling'],
    6: '3k-5k',
    7: 'online',
  },
  whole: {
    1: '40-49',
    2: 'savings',
    3: 'pay-65',
    4: '10m',
    5: ['return-rate', 'reputation', 'counseling'],
    6: '20k-30k',
    7: 'face-to-face',
  },
  medical: {
    1: '30-39',
    2: 'healthy',
    3: '5000',
    4: 'lifetime',
    5: ['hospitalization', 'surgery', 'cost'],
    6: '2k-5k',
    7: 'online',
  },
  cancer: {
    1: '40-49',
    2: 'diagnosis-lump',
    3: '1m',
    4: 'full',
    5: ['diagnosis-benefit', 'claim-handling', 'cost'],
    6: '2k-5k',
    7: 'online',
  },
  annuity: {
    1: 'fixed',
    2: 'after-60',
    3: 'lifetime',
    4: '50k',
    5: 'lump-sum',
  },
  variable: {
    1: 'capital-gain',
    2: 'moderate',
    3: 'over-10m',
    4: 'switch-free',
    5: 'whole-variable',
  },
  endowment: {
    1: 'maturity',
    2: '20years',
    3: '5m',
    4: '10k-20k',
    5: 'monthly',
  },
  education: {
    1: '0',
    2: '18',
    3: '3m',
    4: 'waiver',
    5: 'high',
  },
  income: {
    1: 'family-income',
    2: '15m',
    3: '60',
    4: '2years',
    5: 'annuity',
  },
  nursing: {
    1: 'self-care',
    2: 'care-2',
    3: 'lump-sum',
    4: '5m',
    5: 'lifetime',
  },
  disability: {
    1: 'income-loss',
    2: '15m',
    3: 'wide',
    4: '60days',
    5: '65',
  },
};

function validateRecommendations(category: InsuranceCategory, recs: any[]) {
  if (!Array.isArray(recs) || recs.length !== 2) {
    throw new Error(`${category}: 推奨は2件であるべきです（実際: ${recs.length}件）`);
  }

  const axes = Object.keys(getScoringAxes(category));

  recs.forEach((r) => {
    if (typeof r.matchScore !== 'number' || r.matchScore < 0 || r.matchScore > 100) {
      throw new Error(`${category}: matchScore が 0-100 の範囲外です (${r.matchScore})`);
    }
    const breakdownKeys = Object.keys(r.scoringBreakdown || {});
    if (breakdownKeys.length === 0) {
      throw new Error(`${category}: scoringBreakdown が空です`);
    }
    // 簡易チェック: 少なくとも1つの軸は定義済みの軸と一致する
    if (!breakdownKeys.some((k) => axes.includes(k))) {
      throw new Error(`${category}: scoringBreakdown に既知の軸が含まれていません (${breakdownKeys.join(',')})`);
    }
  });
}

(async () => {
  console.log('=== 統合推薦シミュレーション開始 ===\n');

  for (const cat of Object.keys(samples) as InsuranceCategory[]) {
    console.log(`--- ${cat} ---`);
    const answers = samples[cat];
    const recs = calculateRecommendations(cat, answers as Record<number, string | string[]>);
    try {
      validateRecommendations(cat, recs);
      console.log(`${cat}: 推奨生成 OK`);
      recs.forEach((r) => {
        console.log(`  ${r.rank}位 ${r.companyName} - スコア: ${r.matchScore}`);
      });
    } catch (e) {
      console.error(`${cat}: 検証エラー:`, e);
      process.exit(1);
    }
    console.log('');
  }

  console.log('=== 全カテゴリの統合推薦シミュレーション完了 ===');
})();
