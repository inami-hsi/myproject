'use client';

import React, { useState } from 'react';
import { Recommendation } from '@/types';
import { Card, Badge } from './Card';
import { Button } from './Button';
import { scoreToStars } from '@/lib/utils';
import Link from 'next/link';

interface RecommendationResultProps {
  recommendations: Recommendation[];
  insuranceType: string;
  onReset?: () => void;
}

export const RecommendationResult: React.FC<RecommendationResultProps> = ({
  recommendations,
  insuranceType,
  onReset,
}) => {
  const [expandedCompany, setExpandedCompany] = useState<string | null>(
    recommendations[0]?.companyId || null
  );

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-neutral-900 mb-2">
          推奨結果
        </h1>
        <p className="text-lg text-neutral-600">
          あなたにぴったりの保険会社トップ3
        </p>
      </div>

      {/* 推奨結果カード */}
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <Card
            key={rec.companyId}
            variant="elevated"
            className="border-l-4"
            style={{
              borderLeftColor:
                rec.rank === 1
                  ? '#27AE60'
                  : rec.rank === 2
                    ? '#F39C12'
                    : '#999',
            }}
          >
            {/* ヘッダー */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge
                    variant={
                      rec.rank === 1
                        ? 'success'
                        : rec.rank === 2
                          ? 'warning'
                          : 'default'
                    }
                  >
                    {rec.rank === 1
                      ? '🥇 1位推奨'
                      : rec.rank === 2
                        ? '🥈 2位候補'
                        : '🥉 3位候補'}
                  </Badge>
                </div>
                <h2 className="text-2xl font-bold text-neutral-900">
                  {rec.companyName}
                </h2>
                <p className="text-neutral-600 mt-1">{rec.productName}</p>
              </div>

              {/* マッチスコア */}
              <div className="text-right">
                <p className="text-4xl font-bold text-primary-500">
                  {Math.round(rec.matchScore)}
                </p>
                <p className="text-sm text-neutral-600">マッチ度</p>
              </div>
            </div>

            {/* 推奨保険料 */}
            {rec.estimatedPremium && (
              <div className="bg-primary-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-neutral-600">推奨保険料</p>
                <p className="text-lg font-semibold text-primary-700">
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
              className="text-primary-500 hover:text-primary-600 text-sm font-medium mb-4 flex items-center gap-1"
            >
              {expandedCompany === rec.companyId ? '▼' : '▶'} 詳しく見る
            </button>

            {/* 詳細説明 */}
            {expandedCompany === rec.companyId && (
              <div className="border-t pt-4 mt-4 space-y-4">
                <div>
                  <h3 className="font-bold text-neutral-900 mb-2">推奨理由</h3>
                  <p className="text-neutral-700 whitespace-pre-wrap text-sm leading-relaxed">
                    {rec.reasoning.detailed}
                  </p>
                </div>

                {/* スコアリング詳細 */}
                <div>
                  <h3 className="font-bold text-neutral-900 mb-3">評価スコア</h3>
                  <div className="space-y-2">
                    {Object.entries(rec.scoringBreakdown).map(([axis, score]) => (
                      <div key={axis} className="flex justify-between items-center">
                        <span className="text-sm text-neutral-600 capitalize">
                          {axis.replace('-', ' ')}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-neutral-200 rounded-full h-2">
                            <div
                              className="bg-primary-500 h-full rounded-full"
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
            <div className="flex gap-2 mt-4 border-t pt-4">
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

      {/* 下部アクション */}
      <div className="flex gap-3 justify-center mt-8">
        <Button variant="ghost" onClick={onReset}>
          最初に戻る
        </Button>
        <Link href="/insurance/loss">
          <Button variant="outline">別の保険を探す</Button>
        </Link>
      </div>
    </div>
  );
};

RecommendationResult.displayName = 'RecommendationResult';
