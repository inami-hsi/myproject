/**
 * 賠償責任保険フロー シミュレーション
 * 7つの質問に対する回答から推奨企業を算出
 */

import { calculateRecommendations } from '@/lib/scoring';

// テストケース：賠償責任保険ユーザー
const liabilityUserAnswers = {
  1: 'daily-life', // Q1: 補償対象 - 日常生活
  2: 'urban', // Q2: 地域のリスク - 都市部
  3: 'family-3', // Q3: 世帯員 - 3人家族
  4: 'moderate', // Q4: 趣味レベル - 中程度
  5: ['legal-support', 'coverage-limit', 'cost'], // Q5: 優先補償（上位3つ）
  6: 'face-to-face', // Q6: 相談方式 - 対面
  7: 'budget-2k', // Q7: 年間予算 - 2,000円
};

// テストケース：傷害保険ユーザー
const injuryUserAnswers = {
  1: 'office', // Q1: 職業 - オフィスワーク
  2: 'employed', // Q2: 雇用形態 - 正社員
  3: 'low', // Q3: 職業リスク - 低
  4: '10000', // Q4: 日額給付金 - 10,000円
  5: ['hospitalization', 'cost', 'service'], // Q5: 優先補償（上位3つ）
  6: 'budget-1k', // Q6: 年間予算 - 1,000円
  7: 'online', // Q7: 相談方式 - オンライン
};

console.log('====================================');
console.log('賠償責任保険 推奨シミュレーション');
console.log('====================================\n');

try {
  const liabilityRecommendations = calculateRecommendations('liability', liabilityUserAnswers);

  console.log('📋 ユーザー回答:');
  console.log('Q1. 補償対象:', liabilityUserAnswers[1]);
  console.log('Q2. 地域リスク:', liabilityUserAnswers[2]);
  console.log('Q3. 世帯員:', liabilityUserAnswers[3]);
  console.log('Q4. 趣味レベル:', liabilityUserAnswers[4]);
  console.log('Q5. 優先補償:', liabilityUserAnswers[5]);
  console.log('Q6. 相談方式:', liabilityUserAnswers[6]);
  console.log('Q7. 予算:', liabilityUserAnswers[7]);
  console.log();

  liabilityRecommendations.forEach((rec) => {
    console.log(`🏆 ${rec.rank}位: ${rec.companyName}`);
    console.log(`   推奨スコア: ${rec.matchScore}/100`);
    console.log(`   商品名: ${rec.productName}`);
    console.log(`   月額概算: ${rec.estimatedPremium}`);
    console.log(`   スコア内訳:`, rec.scoringBreakdown);
    console.log();
  });
} catch (error) {
  console.error('❌ エラーが発生しました:', error);
  process.exit(1);
}

console.log('====================================');
console.log('傷害保険 推奨シミュレーション');
console.log('====================================\n');

try {
  const injuryRecommendations = calculateRecommendations('injury', injuryUserAnswers);

  console.log('📋 ユーザー回答:');
  console.log('Q1. 職業:', injuryUserAnswers[1]);
  console.log('Q2. 雇用形態:', injuryUserAnswers[2]);
  console.log('Q3. 職業リスク:', injuryUserAnswers[3]);
  console.log('Q4. 日額給付金:', injuryUserAnswers[4]);
  console.log('Q5. 優先補償:', injuryUserAnswers[5]);
  console.log('Q6. 予算:', injuryUserAnswers[6]);
  console.log('Q7. 相談方式:', injuryUserAnswers[7]);
  console.log();

  injuryRecommendations.forEach((rec) => {
    console.log(`🏆 ${rec.rank}位: ${rec.companyName}`);
    console.log(`   推奨スコア: ${rec.matchScore}/100`);
    console.log(`   商品名: ${rec.productName}`);
    console.log(`   月額概算: ${rec.estimatedPremium}`);
    console.log(`   スコア内訳:`, rec.scoringBreakdown);
    console.log();
  });
} catch (error) {
  console.error('❌ エラーが発生しました:', error);
  process.exit(1);
}

console.log('✅ 両フローのシミュレーションが正常に完了しました');
