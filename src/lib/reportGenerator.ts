'use client';

import { jsPDF } from 'jspdf';
import { Recommendation, InsuranceCategory } from '@/types';
import { getScoringAxes } from '@/lib/scoring';

const categoryLabels: Record<InsuranceCategory, string> = {
  auto: '自動車保険',
  fire: '火災保険',
  liability: '賠償責任保険',
  injury: '傷害保険',
  term: '定期保険',
  whole: '終身保険',
  medical: '医療保険',
  cancer: 'がん保険',
  annuity: '年金保険',
  variable: '変額保険',
  endowment: '養老保険',
  education: '学資保険',
  income: '収入保障保険',
  nursing: '介護保険',
  disability: '就業不能保険',
};

/**
 * 比較レポートをPDF形式で出力
 */
export async function generateComparisonReport(
  recommendations: Recommendation[],
  category: InsuranceCategory,
  userAnswers: Record<number, string | string[]> = {},
  userName?: string
): Promise<void> {
  if (recommendations.length < 2) {
    throw new Error('比較には2社以上の推奨が必要です');
  }

  const [first, second] = recommendations;
  const axes = getScoringAxes(category);
  const categoryLabel = categoryLabels[category];
  const now = new Date();
  const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

  // jsPDFインスタンス作成（A4縦）
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // 日本語フォント対応のため、シンプルな英数字とBase64埋め込みを回避
  // 代わりに印刷用HTMLを生成してブラウザで出力する方式に変更
  
  // HTML形式のレポートを生成して印刷ダイアログを開く
  const reportHtml = generateReportHtml(
    first,
    second,
    category,
    categoryLabel,
    axes,
    dateStr,
    userName
  );

  // 新しいウィンドウでレポートを開いて印刷
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (printWindow) {
    printWindow.document.write(reportHtml);
    printWindow.document.close();
    printWindow.focus();
    // 少し待ってから印刷ダイアログを表示
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
}

/**
 * レポートHTML生成
 */
function generateReportHtml(
  first: Recommendation,
  second: Recommendation,
  category: InsuranceCategory,
  categoryLabel: string,
  axes: Record<string, { label: string; weight: number }>,
  dateStr: string,
  userName?: string
): string {
  const axisEntries = Object.entries(axes);

  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>${categoryLabel}比較レポート</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Hiragino Kaku Gothic ProN', 'メイリオ', sans-serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #333;
      padding: 20mm;
      background: white;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #4a7c59;
      padding-bottom: 15px;
      margin-bottom: 25px;
    }
    .header h1 {
      font-size: 24pt;
      color: #4a7c59;
      margin-bottom: 5px;
    }
    .header .subtitle {
      font-size: 14pt;
      color: #666;
    }
    .header .date {
      font-size: 10pt;
      color: #999;
      margin-top: 10px;
    }
    .section {
      margin-bottom: 25px;
    }
    .section h2 {
      font-size: 14pt;
      color: #4a7c59;
      border-left: 4px solid #4a7c59;
      padding-left: 10px;
      margin-bottom: 15px;
    }
    .company-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
      background: #fafafa;
    }
    .company-card.rank-1 {
      border-left: 4px solid #6d8b74;
    }
    .company-card.rank-2 {
      border-left: 4px solid #e07a5f;
    }
    .company-name {
      font-size: 16pt;
      font-weight: bold;
      color: #333;
      margin-bottom: 5px;
    }
    .product-name {
      font-size: 11pt;
      color: #666;
      margin-bottom: 10px;
    }
    .match-score {
      font-size: 24pt;
      font-weight: bold;
      color: #e07a5f;
    }
    .match-label {
      font-size: 10pt;
      color: #999;
    }
    .reason {
      background: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      font-size: 11pt;
      line-height: 1.8;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px 12px;
      text-align: center;
    }
    th {
      background: #4a7c59;
      color: white;
      font-weight: bold;
    }
    th.item {
      text-align: left;
      width: 35%;
    }
    td.item {
      text-align: left;
      font-weight: bold;
    }
    .winner {
      background: #e8f5e9;
      font-weight: bold;
    }
    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #ddd;
      font-size: 9pt;
      color: #999;
      text-align: center;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10pt;
      margin-right: 8px;
    }
    .badge-1 {
      background: #6d8b74;
      color: white;
    }
    .badge-2 {
      background: #e07a5f;
      color: white;
    }
    @media print {
      body {
        padding: 15mm;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${categoryLabel}比較レポート</h1>
    <p class="subtitle">あなたに最適な保険会社の比較結果</p>
    ${userName ? `<p class="date">対象者: ${userName}</p>` : ''}
    <p class="date">作成日時: ${dateStr}</p>
  </div>

  <div class="section">
    <h2>推奨会社</h2>
    
    <div class="company-card rank-1">
      <span class="badge badge-1">🥇 1位推奨</span>
      <div class="company-name">${first.companyName}</div>
      <div class="product-name">${first.productName}</div>
      <div>
        <span class="match-score">${Math.round(first.matchScore)}</span>
        <span class="match-label">点 / マッチ度</span>
      </div>
      <div style="margin-top: 10px;">
        <strong>保険料（目安）:</strong> ${first.estimatedPremium || '-'}
      </div>
    </div>

    <div class="company-card rank-2">
      <span class="badge badge-2">🥈 2位候補</span>
      <div class="company-name">${second.companyName}</div>
      <div class="product-name">${second.productName}</div>
      <div>
        <span class="match-score">${Math.round(second.matchScore)}</span>
        <span class="match-label">点 / マッチ度</span>
      </div>
      <div style="margin-top: 10px;">
        <strong>保険料（目安）:</strong> ${second.estimatedPremium || '-'}
      </div>
    </div>
  </div>

  <div class="section">
    <h2>選定理由</h2>
    
    <h3 style="font-size: 12pt; margin: 10px 0;">【${first.companyName}】</h3>
    <div class="reason">
      ${first.reasoning.summary}
    </div>

    <h3 style="font-size: 12pt; margin: 15px 0 10px;">【${second.companyName}】</h3>
    <div class="reason">
      ${second.reasoning.summary}
    </div>
  </div>

  <div class="section">
    <h2>評価軸別スコア比較</h2>
    <table>
      <thead>
        <tr>
          <th class="item">評価項目</th>
          <th>${first.companyName}</th>
          <th>${second.companyName}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="item">マッチ度</td>
          <td class="${first.matchScore >= second.matchScore ? 'winner' : ''}">${Math.round(first.matchScore)}点</td>
          <td class="${second.matchScore > first.matchScore ? 'winner' : ''}">${Math.round(second.matchScore)}点</td>
        </tr>
        ${axisEntries.map(([axisId, axis]) => {
          const firstScore = first.scoringBreakdown[axisId] || 0;
          const secondScore = second.scoringBreakdown[axisId] || 0;
          return `
        <tr>
          <td class="item">${axis.label}</td>
          <td class="${firstScore >= secondScore ? 'winner' : ''}">${Math.round(firstScore)}点</td>
          <td class="${secondScore > firstScore ? 'winner' : ''}">${Math.round(secondScore)}点</td>
        </tr>
          `;
        }).join('')}
      </tbody>
    </table>
    <p style="font-size: 9pt; color: #999; margin-top: 5px;">※スコアは100点満点。背景色付きは優位な項目。</p>
  </div>

  <div class="footer">
    <p>本レポートは保険選びの参考情報として提供されています。</p>
    <p>実際のご契約前には、各保険会社の約款・重要事項説明書をご確認ください。</p>
  </div>

  <div class="no-print" style="text-align: center; margin-top: 20px;">
    <button onclick="window.print()" style="padding: 10px 30px; font-size: 14pt; cursor: pointer;">
      印刷 / PDF保存
    </button>
    <button onclick="window.close()" style="padding: 10px 30px; font-size: 14pt; cursor: pointer; margin-left: 10px;">
      閉じる
    </button>
  </div>
</body>
</html>
  `;
}

/**
 * レポートをテキスト形式でダウンロード
 */
export function downloadTextReport(
  recommendations: Recommendation[],
  category: InsuranceCategory,
  userName?: string
): void {
  if (recommendations.length < 2) {
    throw new Error('比較には2社以上の推奨が必要です');
  }

  const [first, second] = recommendations;
  const axes = getScoringAxes(category);
  const categoryLabel = categoryLabels[category];
  const now = new Date();
  const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

  let text = `
================================================================================
${categoryLabel}比較レポート
================================================================================
${userName ? `対象者: ${userName}
` : ''}作成日時: ${dateStr}

【推奨会社】

■ 1位推奨: ${first.companyName}
  商品名: ${first.productName}
  マッチ度: ${Math.round(first.matchScore)}点
  保険料（目安）: ${first.estimatedPremium || '-'}

■ 2位候補: ${second.companyName}
  商品名: ${second.productName}
  マッチ度: ${Math.round(second.matchScore)}点
  保険料（目安）: ${second.estimatedPremium || '-'}

--------------------------------------------------------------------------------
【選定理由】
--------------------------------------------------------------------------------

◆ ${first.companyName}
${first.reasoning.summary}

◆ ${second.companyName}
${second.reasoning.summary}

--------------------------------------------------------------------------------
【評価軸別スコア比較】
--------------------------------------------------------------------------------

${'評価項目'.padEnd(20)}${first.companyName.padEnd(15)}${second.companyName}
${'─'.repeat(60)}
${'マッチ度'.padEnd(18)}${String(Math.round(first.matchScore) + '点').padEnd(15)}${Math.round(second.matchScore)}点
`;

  Object.entries(axes).forEach(([axisId, axis]) => {
    const firstScore = first.scoringBreakdown[axisId] || 0;
    const secondScore = second.scoringBreakdown[axisId] || 0;
    text += `${axis.label.padEnd(18)}${String(Math.round(firstScore) + '点').padEnd(15)}${Math.round(secondScore)}点\n`;
  });

  text += `
================================================================================
本レポートは保険選びの参考情報として提供されています。
実際のご契約前には、各保険会社の約款・重要事項説明書をご確認ください。
================================================================================
`;

  // ダウンロード
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${categoryLabel}比較レポート_${dateStr.replace(/\//g, '-')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * レポートをCSV形式でダウンロード（スプレッドシート連携用）
 */
export function downloadCsvReport(
  recommendations: Recommendation[],
  category: InsuranceCategory,
  userName?: string
): void {
  if (recommendations.length < 2) {
    throw new Error('比較には2社以上の推奨が必要です');
  }

  const [first, second] = recommendations;
  const axes = getScoringAxes(category);
  const categoryLabel = categoryLabels[category];
  const now = new Date();
  const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  const fileDate = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;

  // CSVヘッダー行
  const headers = [
    '項目',
    `1位推奨: ${first.companyName}`,
    `2位候補: ${second.companyName}`,
  ];

  // データ行
  const rows: string[][] = [
    ['保険種別', categoryLabel, categoryLabel],
    ...(userName ? [['対象者', userName, userName]] : []),
    ['作成日時', dateStr, dateStr],
    ['商品名', first.productName, second.productName],
    ['マッチ度（点）', Math.round(first.matchScore).toString(), Math.round(second.matchScore).toString()],
    ['保険料（目安）', first.estimatedPremium || '-', second.estimatedPremium || '-'],
    ['推奨理由', first.reasoning.summary, second.reasoning.summary],
  ];

  // 評価軸スコア
  Object.entries(axes).forEach(([axisId, axis]) => {
    const firstScore = first.scoringBreakdown[axisId] || 0;
    const secondScore = second.scoringBreakdown[axisId] || 0;
    rows.push([
      `評価: ${axis.label}`,
      Math.round(firstScore).toString(),
      Math.round(secondScore).toString(),
    ]);
  });

  // CSVエスケープ関数
  const escapeCsv = (value: string): string => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  // CSV文字列生成
  const csvContent = [
    headers.map(escapeCsv).join(','),
    ...rows.map(row => row.map(escapeCsv).join(',')),
  ].join('\n');

  // BOM付きUTF-8でダウンロード（Excelで文字化け防止）
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${categoryLabel}比較レポート_${fileDate}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
