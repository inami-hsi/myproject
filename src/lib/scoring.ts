import { Recommendation, Auto } from '@/types';
import { insuranceCompanies } from '@/data/companies';

/**
 * 自動車保険向けのスコアリング軸
 * 各軸で保険会社がどの程度優れているかを定義
 */
const autoScoringAxes = {
  'accident-response': {
    label: '事故対応力',
    weight: 1.2,
  },
  'insurance-cost': {
    label: '保険料競争力',
    weight: 0.8,
  },
  'features': {
    label: '特約の充実',
    weight: 1.0,
  },
  'digital': {
    label: 'デジタル対応',
    weight: 0.9,
  },
  'network': {
    label: '代理店ネット',
    weight: 1.1,
  },
  'added-value': {
    label: '付加価値',
    weight: 0.7,
  },
};

/**
 * ユーザーの回答からスコアリング優先度を抽出
 */
function extractScoringPriorities(answers: Record<number, string | string[]>) {
  const priorities: Record<string, number> = {};

  // 質問6: 優先する補償内容
  const q6Answers = answers[6];
  if (Array.isArray(q6Answers)) {
    q6Answers.forEach((answer, index) => {
      const weight = 3 - index; // 最優先: 3, 次点: 2, 3番目: 1
      if (answer === 'cost') {
        priorities['insurance-cost'] = (priorities['insurance-cost'] || 0) + weight;
      } else if (answer === 'accident-response') {
        priorities['accident-response'] = (priorities['accident-response'] || 0) + weight;
      } else if (answer === 'lawyer-fee' || answer === 'digital' || answer === 'roadside-service' || answer === 'rental-car') {
        priorities['features'] = (priorities['features'] || 0) + weight * 0.5;
      }
    });
  }

  // 質問7: 相談方式
  const q7Answer = answers[7];
  if (q7Answer === 'face-to-face') {
    priorities['network'] = (priorities['network'] || 0) + 2;
  } else if (q7Answer === 'online' || q7Answer === 'web-self') {
    priorities['digital'] = (priorities['digital'] || 0) + 2;
  }

  // 質問8: 付加サービス
  const q8Answers = answers[8];
  if (Array.isArray(q8Answers) && q8Answers.length > 0 && q8Answers[0] !== 'none') {
    priorities['added-value'] = (priorities['added-value'] || 0) + 1;
  }

  return priorities;
}

/**
 * 企業スコアを計算
 */
function calculateCompanyScore(
  company: any,
  userPriorities: Record<string, number>
): Record<string, number> {
  const scores: Record<string, number> = {};

  Object.entries(autoScoringAxes).forEach(([axisId, axis]) => {
    const baseScore = company.scoring[axisId] || 3; // default: 3
    const priorityWeight = userPriorities[axisId] || 1;
    const normalizedScore = (baseScore / 5) * 100; // 0-100に正規化
    const weightedScore = normalizedScore * axis.weight * priorityWeight;

    scores[axisId] = parseFloat(weightedScore.toFixed(1));
  });

  return scores;
}

/**
 * 総合スコアを計算
 */
function calculateTotalScore(breakdownScores: Record<string, number>): number {
  const scores = Object.values(breakdownScores);
  if (scores.length === 0) return 0;

  const total = scores.reduce((sum, score) => sum + score, 0);
  const average = total / scores.length;

  return parseFloat(average.toFixed(1));
}

/**
 * 推奨理由テンプレート
 */
function generateRecommendationReason(
  companyName: string,
  rank: 1 | 2 | 3,
  matchScore: number,
  topAxisScore: { axis: string; label: string; value: number },
  userAnswers: Record<number, string | string[]>
): { summary: string; detailed: string } {
  const reasonTemplates = {
    1: {
      summary: `${companyName}があなたのニーズに最適です。事故対応と特約充実度で業界トップクラスです。`,
      detailed: `
## あなたの選択内容と推奨企業のマッチ度

${companyName}はあなたのニーズに完全にマッチした推奨プランです。

### マッチ度スコア: ${matchScore}点 / 100点

**あなたが重視した項目:**
- 事故対応の丁寧さ・スピード
- 代理店での対面相談
- 特約の充実

**${companyName}の強み:**
✓ 顧客満足度: 業界最高水準
✓ 損害サービススタッフ: 業界最大規模
✓ 事故対応: 24時間365日対応
✓ 特約: 30種類以上のオプション特約
✓ 代理店ネットワーク: 全国1,700以上

### 他社との比較

${companyName}は「事故対応」「代理店ネットワーク」で業界第1位です。

### 推奨の理由

あなたが「対面相談」「事故対応」を重視されていることから、${companyName}が最適です。
代理店で丁寧にカスタマイズプランをご提案いただくことをお勧めします。
      `,
    },
    2: {
      summary: `${companyName}も検討の価値が高い選択肢です。コストパフォーマンスが優れています。`,
      detailed: `
## ${companyName}の詳細

${companyName}は第2候補として、コストパフォーマンスに優れた選択肢です。

### マッチ度スコア: ${matchScore}点 / 100点

保険料が手頃でありながら、必要な補償機能を備えています。

### 推奨シーン

- コストを重視される方
- デジタル手続きに抵抗がない方
- 基本的な補償で問題ないケース
      `,
    },
    3: {
      summary: `${companyName}も選択肢として検討いただけます。特定の補償面で優れています。`,
      detailed: `
## ${companyName}の詳細

${companyName}は第3候補です。特定の補償機能で業界トップクラスです。

### マッチ度スコア: ${matchScore}点 / 100点

### 推奨シーン

特定の補償を重視される場合に検討いただけます。
      `,
    },
  };

  return {
    summary: reasonTemplates[rank].summary,
    detailed: reasonTemplates[rank].detailed,
  };
}

/**
 * 自動車保険の推奨を計算
 */
export function calculateAutoRecommendations(
  answers: Record<number, string | string[]>
): Recommendation[] {
  const lossCompanies = insuranceCompanies.loss;
  const userPriorities = extractScoringPriorities(answers);

  // 各企業のスコアを計算
  const companyScores = lossCompanies.map((company) => {
    const breakdownScores = calculateCompanyScore(company, userPriorities);
    const totalScore = calculateTotalScore(breakdownScores);

    return {
      company,
      breakdownScores,
      totalScore,
    };
  });

  // スコアでソート
  companyScores.sort((a, b) => b.totalScore - a.totalScore);

  // 上位3社を推奨結果に変換
  const recommendations: Recommendation[] = companyScores
    .slice(0, 3)
    .map((item, index) => {
      const rank = (index + 1) as 1 | 2 | 3;
      const topAxis = Object.entries(item.breakdownScores).sort(
        ([, a], [, b]) => b - a
      )[0];

      const reasoning = generateRecommendationReason(
        item.company.name,
        rank,
        item.totalScore,
        {
          axis: topAxis[0],
          label: autoScoringAxes[topAxis[0] as keyof typeof autoScoringAxes]?.label || '',
          value: topAxis[1],
        },
        answers
      );

      return {
        rank,
        companyId: item.company.id,
        companyName: item.company.name,
        productName: `${item.company.name}自動車保険`,
        estimatedPremium: '月額 ¥4,500～ (目安)',
        reasoning,
        matchScore: item.totalScore,
        scoringBreakdown: item.breakdownScores,
      };
    });

  return recommendations;
}

/**
 * スコアリング軸の定義を取得（UI表示用）
 */
export function getScoringAxes() {
  return autoScoringAxes;
}
