'use client';

import React from 'react';
import { Recommendation } from '@/types';
import { getScoringAxes } from '@/lib/scoring';
import { InsuranceCategory } from '@/types';

interface ComparisonTableProps {
  recommendations: Recommendation[];
  category: InsuranceCategory;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  recommendations,
  category,
}) => {
  const axes = getScoringAxes(category);
  const axisEntries = Object.entries(axes);

  if (recommendations.length < 2) {
    return null;
  }

  const [first, second] = recommendations;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-primary-500 text-white p-3 sm:p-4">
        <h3 className="text-lg sm:text-xl font-bold text-center">2社比較表</h3>
      </div>

      {/* モバイル: カード形式 / PC: テーブル形式 */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-neutral-100">
              <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700 w-1/3">
                比較項目
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-neutral-700 w-1/3">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-success-600 mb-1">🥇 1位推奨</span>
                  <span className="text-primary-900">{first.companyName}</span>
                </div>
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-neutral-700 w-1/3">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-warning-600 mb-1">🥈 2位候補</span>
                  <span className="text-primary-900">{second.companyName}</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {/* マッチ度 */}
            <tr className="border-b border-neutral-200 bg-accent-50">
              <td className="px-4 py-3 text-sm font-medium text-neutral-700">
                マッチ度
              </td>
              <td className="px-4 py-3 text-center">
                <span className="text-2xl font-bold text-accent-600">
                  {Math.round(first.matchScore)}
                </span>
                <span className="text-sm text-neutral-500">点</span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className="text-2xl font-bold text-accent-600">
                  {Math.round(second.matchScore)}
                </span>
                <span className="text-sm text-neutral-500">点</span>
              </td>
            </tr>

            {/* 保険料（目安） */}
            <tr className="border-b border-neutral-200">
              <td className="px-4 py-3 text-sm font-medium text-neutral-700">
                保険料（目安）
              </td>
              <td className="px-4 py-3 text-center text-sm text-neutral-800">
                {first.estimatedPremium || '-'}
              </td>
              <td className="px-4 py-3 text-center text-sm text-neutral-800">
                {second.estimatedPremium || '-'}
              </td>
            </tr>

            {/* 各評価軸 */}
            {axisEntries.map(([axisId, axis], index) => {
              const firstScore = first.scoringBreakdown[axisId] || 0;
              const secondScore = second.scoringBreakdown[axisId] || 0;
              const firstWins = firstScore > secondScore;
              const secondWins = secondScore > firstScore;

              return (
                <tr
                  key={axisId}
                  className={`border-b border-neutral-200 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-neutral-50'
                  }`}
                >
                  <td className="px-4 py-3 text-sm font-medium text-neutral-700">
                    {axis.label}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 bg-neutral-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            firstWins ? 'bg-success-500' : 'bg-primary-400'
                          }`}
                          style={{ width: `${firstScore}%` }}
                        />
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          firstWins ? 'text-success-600' : 'text-neutral-600'
                        }`}
                      >
                        {Math.round(firstScore)}
                      </span>
                      {firstWins && <span className="text-success-500">▲</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 bg-neutral-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            secondWins ? 'bg-success-500' : 'bg-primary-400'
                          }`}
                          style={{ width: `${secondScore}%` }}
                        />
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          secondWins ? 'text-success-600' : 'text-neutral-600'
                        }`}
                      >
                        {Math.round(secondScore)}
                      </span>
                      {secondWins && <span className="text-success-500">▲</span>}
                    </div>
                  </td>
                </tr>
              );
            })}

            {/* 商品名 */}
            <tr className="border-b border-neutral-200 bg-neutral-50">
              <td className="px-4 py-3 text-sm font-medium text-neutral-700">
                商品名
              </td>
              <td className="px-4 py-3 text-center text-sm text-neutral-800">
                {first.productName}
              </td>
              <td className="px-4 py-3 text-center text-sm text-neutral-800">
                {second.productName}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* モバイル用カード表示 */}
      <div className="sm:hidden p-3 space-y-4">
        {/* 1位推奨 */}
        <div className="border rounded-lg p-3 border-success-300 bg-success-50">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-success-600 font-medium">🥇 1位推奨</span>
            <span className="ml-auto text-xl font-bold text-accent-500">{Math.round(first.matchScore)}点</span>
          </div>
          <p className="font-bold text-primary-900">{first.companyName}</p>
          <p className="text-xs text-neutral-600 mb-2">{first.productName}</p>
          <p className="text-sm text-accent-700 font-medium">{first.estimatedPremium || '-'}</p>
          <div className="mt-3 space-y-2">
            {axisEntries.slice(0, 3).map(([axisId, axis]) => {
              const score = first.scoringBreakdown[axisId] || 0;
              return (
                <div key={axisId} className="flex items-center gap-2">
                  <span className="text-xs text-neutral-600 w-16 truncate">{axis.label}</span>
                  <div className="flex-1 bg-neutral-200 rounded-full h-1.5">
                    <div className="bg-success-500 h-1.5 rounded-full" style={{ width: `${score}%` }} />
                  </div>
                  <span className="text-xs font-medium w-8 text-right">{Math.round(score)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2位候補 */}
        <div className="border rounded-lg p-3 border-warning-300 bg-warning-50">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-warning-600 font-medium">🥈 2位候補</span>
            <span className="ml-auto text-xl font-bold text-accent-500">{Math.round(second.matchScore)}点</span>
          </div>
          <p className="font-bold text-primary-900">{second.companyName}</p>
          <p className="text-xs text-neutral-600 mb-2">{second.productName}</p>
          <p className="text-sm text-accent-700 font-medium">{second.estimatedPremium || '-'}</p>
          <div className="mt-3 space-y-2">
            {axisEntries.slice(0, 3).map(([axisId, axis]) => {
              const score = second.scoringBreakdown[axisId] || 0;
              return (
                <div key={axisId} className="flex items-center gap-2">
                  <span className="text-xs text-neutral-600 w-16 truncate">{axis.label}</span>
                  <div className="flex-1 bg-neutral-200 rounded-full h-1.5">
                    <div className="bg-warning-500 h-1.5 rounded-full" style={{ width: `${score}%` }} />
                  </div>
                  <span className="text-xs font-medium w-8 text-right">{Math.round(score)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 凡例 */}
      <div className="px-4 py-3 bg-neutral-100 text-xs text-neutral-600 flex items-center gap-4">
        <span className="flex items-center gap-1">
          <span className="text-success-500">▲</span> 優位な項目
        </span>
        <span>※スコアは100点満点で表示</span>
      </div>
    </div>
  );
};
