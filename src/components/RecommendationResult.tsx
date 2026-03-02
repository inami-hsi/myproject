'use client';

import React, { useState } from 'react';
import { Recommendation, InsuranceCategory } from '@/types';
import { Card, Badge } from './Card';
import { Button } from './Button';
import { ComparisonTable } from './ComparisonTable';
import { generateComparisonReport, downloadTextReport, downloadCsvReport } from '@/lib/reportGenerator';
import Link from 'next/link';

interface RecommendationResultProps {
  recommendations: Recommendation[];
  category: string; // insurance category (auto, fire, etc.)
  onReset?: () => void;
}

export const RecommendationResult: React.FC<RecommendationResultProps> = ({
  recommendations,
  category,
  onReset,
}) => {
  const [expandedCompany, setExpandedCompany] = useState<string | null>(
    recommendations[0]?.companyId || null
  );

  return (
    <div className="space-y-6">
      <div className="text-center mb-6 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-900 mb-2">
          推奨結果
        </h1>
        <p className="text-base sm:text-lg text-neutral-600">
          あなたにぴったりの{
            category === 'auto' ? '自動車' :
            category === 'fire' ? '火災' :
            category === 'liability' ? '賠償責任' :
            category === 'injury' ? '傷害' :
            category === 'term' ? '定期' :
            category === 'whole' ? '終身' :
            category === 'medical' ? '医療' :
            category === 'cancer' ? 'がん' :
            category === 'annuity' ? '年金' :
            category === 'variable' ? '変額' :
            category === 'endowment' ? '養老' :
            category === 'education' ? '学資' :
            category === 'income' ? '収入保障' :
            category === 'nursing' ? '介護' :
            category === 'disability' ? '就業不能' : ''
          }保険会社トップ2
        </p>
      </div>

      {/* 推奨結果カード */}
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <Card
            key={rec.companyId}
            variant="elevated"
            className="border-l-4 transition-all duration-200 hover:shadow-lg p-4 sm:p-6"
            style={{
              borderLeftColor:
                rec.rank === 1
                  ? '#6d8b74'
                  : '#e07a5f',
            }}
          >
            {/* ヘッダー */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-5">
              <div className="flex-1">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <Badge
                    variant={
                      rec.rank === 1
                        ? 'success'
                        : 'warning'
                    }
                  >
                    {rec.rank === 1
                      ? '🥇 1位推奨'
                      : '🥈 2位候補'}
                  </Badge>
                  {/* モバイルではスコアをバッジ横に表示 */}
                  <span className="sm:hidden text-2xl font-bold text-accent-500">
                    {Math.round(rec.matchScore)}点
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-primary-900">
                  {rec.companyName}
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 mt-1 sm:mt-2">{rec.productName}</p>
              </div>

              {/* マッチスコア - PCのみ */}
              <div className="hidden sm:block text-right">
                <p className="text-4xl md:text-5xl font-bold text-accent-500">
                  {Math.round(rec.matchScore)}
                </p>
                <p className="text-sm text-neutral-600 mt-1">マッチ度</p>
              </div>
            </div>

            {/* 保険料（目安） */}
            {rec.estimatedPremium && (
              <div className="bg-accent-50 p-3 sm:p-4 rounded-md mb-4 sm:mb-5 border border-accent-200">
                <p className="text-xs text-neutral-600 font-medium">保険料（目安）</p>
                <p className="text-base sm:text-lg font-semibold text-accent-700 mt-1">
                  {rec.estimatedPremium}
                </p>
              </div>
            )}

            {/* 詳細表示切り替え */}
            <button
              onClick={() =>
                setExpandedCompany(
                  expandedCompany === rec.companyId ? null : rec.companyId
                )
              }
              className="text-accent-600 hover:text-accent-700 text-sm font-semibold mb-4 flex items-center gap-2 transition-colors"
            >
              {expandedCompany === rec.companyId ? '▼' : '▶'} 詳しく見る
            </button>

            {/* 詳細説明 */}
            {expandedCompany === rec.companyId && (
              <div className="border-t border-neutral-200 pt-5 mt-5 space-y-5">
                <div>
                  <h3 className="font-bold text-primary-900 mb-3">推奨理由</h3>
                  <p className="text-neutral-700 whitespace-pre-wrap text-sm leading-relaxed">
                    {rec.reasoning.detailed}
                  </p>
                </div>

                {/* スコアリング詳細 */}
                <div>
                  <h3 className="font-bold text-primary-900 mb-4">評価スコア</h3>
                  <div className="space-y-3">
                    {Object.entries(rec.scoringBreakdown).map(([axis, score]) => (
                      <div key={axis} className="flex justify-between items-center">
                        <span className="text-sm text-neutral-600 capitalize font-medium">
                          {axis.replace('-', ' ')}
                        </span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-neutral-200 rounded-full h-2">
                            <div
                              className="bg-accent-500 h-full rounded-full"
                              style={{ width: `${(score / 100) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-neutral-900 w-10 text-right">
                            {score.toFixed(0)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* アクションボタン */}
            <div className="flex gap-3 mt-6 border-t border-neutral-200 pt-5">
              <Button variant="primary" size="sm" className="flex-1">
                詳しく見る
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                相談する
              </Button>
            </div>
          </Card>
        ))}
      </div>
      {/* 2社比較表 */}
      <div className="mt-6 sm:mt-8">
        <ComparisonTable
          recommendations={recommendations}
          category={category as InsuranceCategory}
        />
      </div>

      {/* レポート出力ボタン */}
      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-neutral-50 rounded-lg border border-neutral-200">
        <h3 className="font-bold text-sm sm:text-base text-primary-900 mb-3 text-center">📄 比較レポート出力</h3>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-center">
          <Button
            variant="primary"
            size="sm"
            onClick={() => generateComparisonReport(recommendations, category as InsuranceCategory)}
            className="w-full sm:w-auto"
          >
            🖨️ 印刷/PDF保存
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadCsvReport(recommendations, category as InsuranceCategory)}
            className="w-full sm:w-auto"
          >
            📊 スプレッドシート用
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadTextReport(recommendations, category as InsuranceCategory)}
            className="w-full sm:w-auto"
          >
            📝 テキスト形式
          </Button>
        </div>
        <p className="text-xs text-neutral-500 text-center mt-2">
          ※ スプレッドシート用はCSV形式でダウンロードされます
        </p>
      </div>

      {/* 下部アクション */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-center mt-6 sm:mt-10">
        <Button variant="ghost" onClick={onReset} className="w-full sm:w-auto">
          最初に戻る
        </Button>
        <Link 
          href={['term', 'whole', 'medical', 'cancer', 'annuity', 'variable', 'endowment', 'education', 'income', 'nursing', 'disability'].includes(category) ? '/insurance/life' : '/insurance/loss'} 
          className="w-full sm:w-auto"
        >
          <Button variant="outline" className="w-full">別の保険を探す</Button>
        </Link>
      </div>
    </div>
  );
};

RecommendationResult.displayName = 'RecommendationResult';
