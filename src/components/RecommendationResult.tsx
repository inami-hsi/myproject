'use client';

import React, { useState } from 'react';
import { Recommendation, InsuranceCategory } from '@/types';
import { Card, Badge } from './Card';
import { Button } from './Button';
import { ComparisonTable } from './ComparisonTable';
import { generateComparisonReport, downloadTextReport, downloadCsvReport } from '@/lib/reportGenerator';
import Link from 'next/link';

// Markdownの推奨理由をパースして構造化するヘルパー
const parseReasoningMarkdown = (markdown: string) => {
  const sections: { title: string; content: string; type: 'table' | 'list' | 'text' }[] = [];
  const lines = markdown.split('\n');
  
  let currentSection: { title: string; content: string[]; type: 'table' | 'list' | 'text' } | null = null;
  
  for (const line of lines) {
    // H3セクション
    if (line.startsWith('### ')) {
      if (currentSection) {
        sections.push({
          title: currentSection.title,
          content: currentSection.content.join('\n').trim(),
          type: currentSection.type
        });
      }
      currentSection = { title: line.replace('### ', '').trim(), content: [], type: 'text' };
    } else if (currentSection) {
      if (line.startsWith('|')) {
        currentSection.type = 'table';
      } else if (line.startsWith('•') || line.startsWith('-') || line.match(/^\d+\./)) {
        currentSection.type = 'list';
      }
      currentSection.content.push(line);
    }
  }
  
  if (currentSection) {
    sections.push({
      title: currentSection.title,
      content: currentSection.content.join('\n').trim(),
      type: currentSection.type
    });
  }
  
  return sections;
};

// テーブルをパースしてReact要素に変換
const renderTable = (content: string) => {
  const rows = content.split('\n').filter(line => line.startsWith('|'));
  if (rows.length < 2) return <p className="text-neutral-700 text-sm">{content}</p>;
  
  const headerRow = rows[0].split('|').filter(cell => cell.trim());
  const dataRows = rows.slice(2).map(row => row.split('|').filter(cell => cell.trim()));
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-neutral-100">
            {headerRow.map((cell, i) => (
              <th key={i} className="border border-neutral-200 px-3 py-2 text-left font-semibold text-neutral-900">
                {cell.trim()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataRows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}>
              {row.map((cell, j) => (
                <td key={j} className="border border-neutral-200 px-3 py-2 text-neutral-700">
                  {cell.trim().replace(/\*\*/g, '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// リストをパースしてReact要素に変換
const renderList = (content: string) => {
  const items = content.split('\n').filter(line => line.trim());
  return (
    <ul className="space-y-2">
      {items.map((item, i) => {
        const cleanItem = item.replace(/^[•\-\d+\.]\s*/, '').replace(/\*\*/g, '');
        return (
          <li key={i} className="text-sm text-neutral-700 flex items-start gap-2">
            <span className="text-accent-500 mt-1">•</span>
            <span>{cleanItem}</span>
          </li>
        );
      })}
    </ul>
  );
};

// テキストをパースしてReact要素に変換
const renderText = (content: string) => {
  const paragraphs = content.split('\n\n').filter(p => p.trim());
  return (
    <div className="space-y-3">
      {paragraphs.map((p, i) => {
        // H4サブセクション
        if (p.startsWith('#### ')) {
          return (
            <h4 key={i} className="font-semibold text-primary-800 text-sm mt-4">
              {p.replace('#### ', '').replace(/\*\*/g, '')}
            </h4>
          );
        }
        // 番号付きリスト
        if (p.match(/^\d+\.\s/)) {
          return renderList(p);
        }
        // 通常テキスト
        const cleanText = p.replace(/\*\*/g, '').replace(/^\s+/gm, '');
        return (
          <p key={i} className="text-sm text-neutral-700 leading-relaxed">
            {cleanText}
          </p>
        );
      })}
    </div>
  );
};

interface RecommendationResultProps {
  recommendations: Recommendation[];
  category: string;
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
              <div className="border-t border-neutral-200 pt-5 mt-5 space-y-4">
                {/* 構造化された推奨理由 */}
                {(() => {
                  const sections = parseReasoningMarkdown(rec.reasoning.detailed);
                  // 主要セクションのみ表示（1-5を表示、6-7は折りたたみ）
                  const mainSections = sections.filter(s => 
                    s.title.includes('推奨結論') ||
                    s.title.includes('合理的根拠') ||
                    s.title.includes('強み') ||
                    s.title.includes('スコア')
                  );
                  const otherSections = sections.filter(s => 
                    s.title.includes('留意') ||
                    s.title.includes('判断') ||
                    s.title.includes('免責')
                  );
                  
                  return (
                    <>
                      {mainSections.map((section, idx) => (
                        <div key={idx} className="bg-neutral-50 rounded-lg p-4 border border-neutral-100">
                          <h3 className="font-bold text-primary-900 mb-3 flex items-center gap-2">
                            <span className="w-6 h-6 bg-accent-500 text-white rounded-full flex items-center justify-center text-xs">
                              {idx + 1}
                            </span>
                            {section.title.replace(/^\d+\.\s*/, '')}
                          </h3>
                          {section.type === 'table' ? renderTable(section.content) :
                           section.type === 'list' ? renderList(section.content) :
                           renderText(section.content)}
                        </div>
                      ))}
                      
                      {otherSections.length > 0 && (
                        <details className="bg-neutral-50 rounded-lg border border-neutral-100">
                          <summary className="p-4 cursor-pointer text-sm font-semibold text-neutral-600 hover:text-neutral-900">
                            その他の情報を見る（留意事項・免責事項）
                          </summary>
                          <div className="px-4 pb-4 space-y-4">
                            {otherSections.map((section, idx) => (
                              <div key={idx}>
                                <h4 className="font-semibold text-neutral-700 mb-2 text-sm">
                                  {section.title.replace(/^\d+\.\s*/, '')}
                                </h4>
                                {section.type === 'list' ? renderList(section.content) : renderText(section.content)}
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </>
                  );
                })()}
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
