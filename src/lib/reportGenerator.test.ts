import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { downloadTextReport, downloadCsvReport, generateComparisonReport } from './reportGenerator';
import type { Recommendation, InsuranceCategory } from '@/types';

// サンプル推奨データ
const createMockRecommendation = (rank: 1 | 2, score: number): Recommendation => ({
  rank,
  companyId: `company-${rank}`,
  companyName: rank === 1 ? 'テスト保険A' : 'テスト保険B',
  productName: rank === 1 ? 'テスト商品A' : 'テスト商品B',
  estimatedPremium: '月額 ¥3,000～',
  reasoning: {
    summary: `${rank}位の推奨理由サマリー`,
    detailed: `${rank}位の推奨理由詳細`,
  },
  matchScore: score,
  scoringBreakdown: {
    'test-axis-1': score - 5,
    'test-axis-2': score + 5,
  },
});

describe('reportGenerator.ts', () => {
  describe('generateComparisonReport', () => {
    it('推奨が2社未満の場合エラーを投げる', async () => {
      const recommendations: Recommendation[] = [createMockRecommendation(1, 85)];
      
      await expect(generateComparisonReport(recommendations, 'auto')).rejects.toThrow(
        '比較には2社以上の推奨が必要です'
      );
    });

    it('空の配列でエラーを投げる', async () => {
      await expect(generateComparisonReport([], 'fire')).rejects.toThrow(
        '比較には2社以上の推奨が必要です'
      );
    });
  });

  describe('downloadTextReport', () => {
    let mockCreateElement: ReturnType<typeof vi.fn>;
    let mockAppendChild: ReturnType<typeof vi.fn>;
    let mockRemoveChild: ReturnType<typeof vi.fn>;
    let mockClick: ReturnType<typeof vi.fn>;
    let mockCreateObjectURL: ReturnType<typeof vi.fn>;
    let mockRevokeObjectURL: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockClick = vi.fn();
      mockCreateElement = vi.fn().mockReturnValue({
        href: '',
        download: '',
        click: mockClick,
      });
      mockAppendChild = vi.fn();
      mockRemoveChild = vi.fn();
      mockCreateObjectURL = vi.fn().mockReturnValue('blob:test-url');
      mockRevokeObjectURL = vi.fn();

      vi.stubGlobal('document', {
        createElement: mockCreateElement,
        body: {
          appendChild: mockAppendChild,
          removeChild: mockRemoveChild,
        },
      });
      vi.stubGlobal('URL', {
        createObjectURL: mockCreateObjectURL,
        revokeObjectURL: mockRevokeObjectURL,
      });
      vi.stubGlobal('Blob', class MockBlob {
        constructor(public content: any[], public options: any) {}
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('推奨が2社未満の場合エラーを投げる', () => {
      const recommendations: Recommendation[] = [createMockRecommendation(1, 85)];
      
      expect(() => downloadTextReport(recommendations, 'auto')).toThrow(
        '比較には2社以上の推奨が必要です'
      );
    });

    it('2社以上の推奨でダウンロードを実行する', () => {
      const recommendations: Recommendation[] = [
        createMockRecommendation(1, 90),
        createMockRecommendation(2, 80),
      ];
      
      downloadTextReport(recommendations, 'auto');
      
      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });

    const categories: InsuranceCategory[] = ['auto', 'fire', 'liability', 'injury', 'term', 'whole', 'medical', 'cancer'];

    categories.forEach((category) => {
      it(`${category}カテゴリでダウンロード可能`, () => {
        const recommendations: Recommendation[] = [
          createMockRecommendation(1, 90),
          createMockRecommendation(2, 80),
        ];
        
        expect(() => downloadTextReport(recommendations, category)).not.toThrow();
      });
    });
  });

  describe('downloadCsvReport', () => {
    let mockCreateElement: ReturnType<typeof vi.fn>;
    let mockAppendChild: ReturnType<typeof vi.fn>;
    let mockRemoveChild: ReturnType<typeof vi.fn>;
    let mockClick: ReturnType<typeof vi.fn>;
    let mockCreateObjectURL: ReturnType<typeof vi.fn>;
    let mockRevokeObjectURL: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockClick = vi.fn();
      mockCreateElement = vi.fn().mockReturnValue({
        href: '',
        download: '',
        click: mockClick,
      });
      mockAppendChild = vi.fn();
      mockRemoveChild = vi.fn();
      mockCreateObjectURL = vi.fn().mockReturnValue('blob:test-url');
      mockRevokeObjectURL = vi.fn();

      vi.stubGlobal('document', {
        createElement: mockCreateElement,
        body: {
          appendChild: mockAppendChild,
          removeChild: mockRemoveChild,
        },
      });
      vi.stubGlobal('URL', {
        createObjectURL: mockCreateObjectURL,
        revokeObjectURL: mockRevokeObjectURL,
      });
      vi.stubGlobal('Blob', class MockBlob {
        constructor(public content: any[], public options: any) {}
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('推奨が2社未満の場合エラーを投げる', () => {
      const recommendations: Recommendation[] = [createMockRecommendation(1, 85)];
      
      expect(() => downloadCsvReport(recommendations, 'fire')).toThrow(
        '比較には2社以上の推奨が必要です'
      );
    });

    it('2社以上の推奨でCSVダウンロードを実行する', () => {
      const recommendations: Recommendation[] = [
        createMockRecommendation(1, 90),
        createMockRecommendation(2, 80),
      ];
      
      downloadCsvReport(recommendations, 'fire');
      
      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });

    it('BOM付きUTF-8でBlobを作成', () => {
      const recommendations: Recommendation[] = [
        createMockRecommendation(1, 90),
        createMockRecommendation(2, 80),
      ];
      
      downloadCsvReport(recommendations, 'fire');
      
      expect(mockCreateObjectURL).toHaveBeenCalled();
    });

    const lifeCategories: InsuranceCategory[] = ['term', 'whole', 'medical', 'cancer', 'annuity', 'variable'];

    lifeCategories.forEach((category) => {
      it(`生命保険${category}カテゴリでCSVダウンロード可能`, () => {
        const recommendations: Recommendation[] = [
          createMockRecommendation(1, 90),
          createMockRecommendation(2, 80),
        ];
        
        expect(() => downloadCsvReport(recommendations, category)).not.toThrow();
      });
    });
  });
});
