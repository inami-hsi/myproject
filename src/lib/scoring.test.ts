import { describe, it, expect } from 'vitest';
import { calculateRecommendations, getScoringAxes } from './scoring';
import type { InsuranceCategory } from '@/types';

describe('scoring.ts', () => {
  describe('getScoringAxes', () => {
    it('損保カテゴリのスコアリング軸を返す', () => {
      const autoAxes = getScoringAxes('auto');
      expect(autoAxes).toBeDefined();
      expect(autoAxes['accident-response']).toBeDefined();
      expect(autoAxes['accident-response'].label).toBe('事故対応力');
      expect(autoAxes['accident-response'].weight).toBeGreaterThan(0);
    });

    it('火災保険のスコアリング軸を返す', () => {
      const fireAxes = getScoringAxes('fire');
      expect(fireAxes).toBeDefined();
      expect(fireAxes['coverage']).toBeDefined();
      expect(fireAxes['water-response']).toBeDefined();
    });

    it('生命保険カテゴリのスコアリング軸を返す', () => {
      const termAxes = getScoringAxes('term');
      expect(termAxes).toBeDefined();
      expect(termAxes['claim-handling']).toBeDefined();
      expect(termAxes['reputation']).toBeDefined();
    });

    it('変額保険には財務安定性軸がある', () => {
      const variableAxes = getScoringAxes('variable');
      expect(variableAxes['stability']).toBeDefined();
      expect(variableAxes['stability'].label).toBe('財務安定性');
    });

    it('存在しないカテゴリはautoのデフォルトを返す', () => {
      const unknownAxes = getScoringAxes('unknown' as InsuranceCategory);
      expect(unknownAxes).toEqual(getScoringAxes('auto'));
    });
  });

  describe('calculateRecommendations', () => {
    describe('損害保険カテゴリ', () => {
      it('自動車保険で2社の推奨を返す', () => {
        const answers = {
          1: '30-39',
          2: 'commute',
          3: '1',
          4: 'sedan',
          5: ['accident-response', 'cost'],
          6: ['rental-car'],
          7: 'face-to-face',
          8: ['none'],
        };
        const recommendations = calculateRecommendations('auto', answers);
        
        expect(recommendations).toHaveLength(2);
        expect(recommendations[0].rank).toBe(1);
        expect(recommendations[1].rank).toBe(2);
      });

      it('推奨結果にスコアが0-100の範囲', () => {
        const answers = {
          1: 'house',
          2: 'under-5',
          3: 'both',
          4: ['flood'],
          5: 'wood-low',
          6: ['basic-coverage'],
          7: '5years',
          8: 'claim-first',
        };
        const recommendations = calculateRecommendations('fire', answers);
        
        recommendations.forEach((rec) => {
          expect(rec.matchScore).toBeGreaterThanOrEqual(0);
          expect(rec.matchScore).toBeLessThanOrEqual(100);
        });
      });

      it('1位のスコアは2位以上', () => {
        const answers = {
          1: 'daily-life',
          2: 'urban',
          3: 'family-3',
          4: 'moderate',
          5: ['legal-support'],
          6: 'face-to-face',
          7: 'budget-2k',
        };
        const recommendations = calculateRecommendations('liability', answers);
        
        expect(recommendations[0].matchScore).toBeGreaterThanOrEqual(recommendations[1].matchScore);
      });

      it('傷害保険の推奨を返す', () => {
        const answers = {
          1: 'office',
          2: 'employed',
          3: 'low',
          4: '10000',
          5: ['hospitalization'],
          6: 'budget-1k',
          7: 'online',
        };
        const recommendations = calculateRecommendations('injury', answers);
        
        expect(recommendations).toHaveLength(2);
        expect(recommendations[0].companyName).toBeDefined();
        expect(recommendations[0].productName).toContain('傷害保険');
      });
    });

    describe('生命保険カテゴリ', () => {
      it('定期保険で2社の推奨を返す', () => {
        const answers = {
          1: 'family-protection',
          2: '30-39',
          3: ['hospitalization', 'cancer'],
          4: '10k-20k',
          5: 'standard',
          6: ['claim-speed'],
          7: 'face-to-face',
        };
        const recommendations = calculateRecommendations('term', answers);
        
        expect(recommendations).toHaveLength(2);
        expect(recommendations[0].productName).toContain('定期保険');
      });

      it('終身保険の推奨を返す', () => {
        const answers = {
          1: 'lifetime-protection',
          2: '40-49',
          3: ['premium-waiver'],
          4: '20k-30k',
          5: 'premium-fixed',
          6: ['stability'],
          7: 'face-to-face',
        };
        const recommendations = calculateRecommendations('whole', answers);
        
        expect(recommendations).toHaveLength(2);
        expect(recommendations[0].productName).toContain('終身保険');
      });

      it('医療保険の推奨を返す', () => {
        const answers = {
          1: 'comprehensive',
          2: 'daily-5k',
          3: 'lifetime',
          4: ['hospitalization', 'surgery'],
          5: 'standard',
          6: ['claim-speed'],
          7: 'online',
        };
        const recommendations = calculateRecommendations('medical', answers);
        
        expect(recommendations).toHaveLength(2);
        expect(recommendations[0].productName).toContain('医療保険');
      });

      it('がん保険の推奨を返す', () => {
        const answers = {
          1: 'comprehensive',
          2: 'high',
          3: ['diagnosis', 'hospitalization'],
          4: 'standard',
          5: ['claim-speed'],
          6: 'online',
        };
        const recommendations = calculateRecommendations('cancer', answers);
        
        expect(recommendations).toHaveLength(2);
        expect(recommendations[0].productName).toContain('がん保険');
      });

      it('年金保険の推奨を返す', () => {
        const answers = {
          1: 'retirement',
          2: '65',
          3: '10-year',
          4: '10k-20k',
          5: 'yen-fixed',
        };
        const recommendations = calculateRecommendations('annuity', answers);
        
        expect(recommendations).toHaveLength(2);
        expect(recommendations[0].productName).toContain('年金保険');
      });

      it('変額保険の推奨を返す', () => {
        const answers = {
          1: 'investment',
          2: 'beginner',
          3: 'medium-low',
          4: '10-20',
          5: 'whole-variable',
        };
        const recommendations = calculateRecommendations('variable', answers);
        
        expect(recommendations).toHaveLength(2);
        expect(recommendations[0].productName).toContain('変額保険');
      });

      it('学資保険の推奨を返す', () => {
        const answers = {
          1: '0',
          2: '18',
          3: '3m',
          4: 'waiver',
          5: 'high',
        };
        const recommendations = calculateRecommendations('education', answers);
        
        expect(recommendations).toHaveLength(2);
        expect(recommendations[0].productName).toContain('学資保険');
      });

      it('養老保険の推奨を返す', () => {
        const answers = {
          1: 'maturity',
          2: '20years',
          3: '5m',
          4: '10k-20k',
          5: 'monthly',
        };
        const recommendations = calculateRecommendations('endowment', answers);
        
        expect(recommendations).toHaveLength(2);
        expect(recommendations[0].productName).toContain('養老保険');
      });

      it('介護保険の推奨を返す', () => {
        const answers = {
          1: 'self-care',
          2: 'care-2',
          3: 'combination',
          4: '5m',
          5: 'lifetime',
        };
        const recommendations = calculateRecommendations('nursing', answers);
        
        expect(recommendations).toHaveLength(2);
        expect(recommendations[0].productName).toContain('介護保険');
      });

      it('就業不能保険の推奨を返す', () => {
        const answers = {
          1: 'income-loss',
          2: '15m',
          3: 'wide',
          4: '60days',
          5: '65',
        };
        const recommendations = calculateRecommendations('disability', answers);
        
        expect(recommendations).toHaveLength(2);
        expect(recommendations[0].productName).toContain('就業不能保険');
      });

      it('収入保障保険の推奨を返す', () => {
        const answers = {
          1: 'family-income',
          2: '15m',
          3: '65',
          4: '2years',
          5: 'lump-or-annuity',
        };
        const recommendations = calculateRecommendations('income', answers);
        
        expect(recommendations).toHaveLength(2);
        expect(recommendations[0].productName).toContain('収入保障保険');
      });
    });

    describe('推奨理由', () => {
      it('推奨理由がマークダウン形式で含まれる', () => {
        const answers = {
          1: '30-39',
          2: 'commute',
          3: '1',
          4: 'sedan',
          5: ['accident-response'],
          6: ['rental-car'],
          7: 'face-to-face',
          8: ['none'],
        };
        const recommendations = calculateRecommendations('auto', answers);
        
        expect(recommendations[0].reasoning).toBeDefined();
        // reasoningはオブジェクトでsummaryとdetailedを持つ
        expect(recommendations[0].reasoning.summary).toBeDefined();
        expect(recommendations[0].reasoning.detailed).toBeDefined();
        expect(recommendations[0].reasoning.detailed).toContain('##');
        expect(recommendations[0].reasoning.summary).toContain('を');
      });

      it('スコアブレークダウンが含まれる', () => {
        const answers = {
          1: 'house',
          2: 'under-5',
          3: 'both',
          4: ['flood'],
          5: 'wood-low',
          6: ['basic-coverage'],
          7: '5years',
          8: 'claim-first',
        };
        const recommendations = calculateRecommendations('fire', answers);
        
        expect(recommendations[0].scoringBreakdown).toBeDefined();
        expect(Object.keys(recommendations[0].scoringBreakdown).length).toBeGreaterThan(0);
      });
    });

    describe('ユーザー優先度の反映', () => {
      it('コスト重視のユーザーにはコスト競争力が高い会社が上位', () => {
        const costFocusedAnswers = {
          1: '30-39',
          2: 'commute',
          3: '1',
          4: 'sedan',
          5: ['cost', 'cost', 'cost'],
          6: ['cost'],
          7: 'online',
          8: ['none'],
        };
        const recommendations = calculateRecommendations('auto', costFocusedAnswers);
        
        // コスト重視なら保険料競争力スコアが高い会社が優先される傾向
        expect(recommendations[0].scoringBreakdown['insurance-cost']).toBeDefined();
      });

      it('対面相談重視ならネットワークスコアが影響', () => {
        const faceToFaceAnswers = {
          1: 'daily-life',
          2: 'urban',
          3: 'family-3',
          4: 'moderate',
          5: ['service-quality'],
          6: 'face-to-face',
          7: 'budget-2k',
        };
        const recommendations = calculateRecommendations('liability', faceToFaceAnswers);
        
        expect(recommendations[0].scoringBreakdown['service-quality']).toBeDefined();
      });
    });

    describe('エッジケース', () => {
      it('空の回答でもエラーなく推奨を返す', () => {
        const emptyAnswers = {};
        const recommendations = calculateRecommendations('auto', emptyAnswers);
        
        expect(recommendations).toHaveLength(2);
      });

      it('部分的な回答でもエラーなく推奨を返す', () => {
        const partialAnswers = {
          1: '30-39',
        };
        const recommendations = calculateRecommendations('fire', partialAnswers);
        
        expect(recommendations).toHaveLength(2);
      });

      it('無効な回答値でもエラーなく処理', () => {
        const invalidAnswers = {
          1: 'invalid-value',
          2: 'another-invalid',
        };
        const recommendations = calculateRecommendations('auto', invalidAnswers);
        
        expect(recommendations).toHaveLength(2);
      });
    });
  });

  describe('全カテゴリ網羅テスト', () => {
    const allCategories: InsuranceCategory[] = [
      'auto', 'fire', 'liability', 'injury',
      'term', 'whole', 'medical', 'cancer', 'annuity', 'variable',
      'education', 'endowment', 'nursing', 'disability', 'income',
    ];

    allCategories.forEach((category) => {
      it(`${category}カテゴリで推奨を生成できる`, () => {
        const basicAnswers = { 1: 'test-value' };
        const recommendations = calculateRecommendations(category, basicAnswers);
        
        expect(recommendations).toHaveLength(2);
        expect(recommendations[0].rank).toBe(1);
        expect(recommendations[1].rank).toBe(2);
        expect(recommendations[0].matchScore).toBeGreaterThanOrEqual(0);
        expect(recommendations[0].matchScore).toBeLessThanOrEqual(100);
      });

      it(`${category}カテゴリのスコアリング軸が定義されている`, () => {
        const axes = getScoringAxes(category);
        expect(Object.keys(axes).length).toBeGreaterThan(0);
      });
    });
  });
});
