import { calculateRecommendations } from '../src/lib/scoring';
import { InsuranceCategory } from '../src/types';

/**
 * 火災保険フローのシミュレーションテスト
 * 実際のユーザー回答をシミュレートして推奨結果を検証
 */

// テストケース：マンション、新しい、建物＋家財、水災重視
const fireTestAnswers: Record<number, string | string[]> = {
  1: 'apartment',      // Q1: マンション
  2: '5-15',          // Q2: 築年数 5～15年
  3: 'both',          // Q3: 保障対象 建物＋家財
  4: ['flood', 'typhoon'],  // Q4: 補償災害（豪雨、台風）
  5: 'wood-mid',      // Q5: 建物構造 木造・防火対策あり
  6: ['basic-coverage', 'water-damage', 'cost'], // Q6: 補償内容優先度（上位3つ）
  7: '5years',        // Q7: 長期契約 5年契約
  8: 'face-to-face',  // Q8: サービス 対面相談
};

console.log('🔥 火災保険フロー シミュレーションテスト開始\n');
console.log('📋 入力回答データ:');
console.log(JSON.stringify(fireTestAnswers, null, 2));
console.log('\n' + '='.repeat(60) + '\n');

try {
  // 推奨結果を計算
  const recommendations = calculateRecommendations('fire', fireTestAnswers);

  console.log('✅ 推奨結果計算完了\n');

  // 結果を表示
  recommendations.forEach((rec, idx) => {
    console.log(`\n【${idx + 1}位】${rec.rank === 1 ? '🥇 推奨' : rec.rank === 2 ? '🥈 候補' : '🥉 候補'}`);
    console.log('━'.repeat(60));
    console.log(`企業: ${rec.companyName}`);
    console.log(`商品: ${rec.productName}`);
    console.log(`マッチスコア: ${rec.matchScore}/100`);
    console.log(`推奨保険料: ${rec.estimatedPremium}`);

    console.log('\n評価スコア（6軸）:');
    Object.entries(rec.scoringBreakdown).forEach(([axis, score]) => {
      // スコアを0-100の範囲に正規化
      const normalizedScore = Math.min(100, Math.max(0, score));
      const barLength = Math.round(normalizedScore / 5);
      const bar = '█'.repeat(barLength) + '░'.repeat(20 - barLength);
      console.log(`  ${axis.padEnd(20)} ${bar} ${score.toFixed(1)}`);
    });

    console.log('\n推奨理由（要約）:');
    console.log(`  ${rec.reasoning.summary}\n`);
  });

  console.log('='.repeat(60));
  console.log('📊 スコアリング結果サマリー\n');

  // ランキング比較
  console.log('企業別マッチスコアランキング:');
  recommendations
    .sort((a, b) => b.matchScore - a.matchScore)
    .forEach((rec) => {
      console.log(`  ${rec.rank === 1 ? '🥇' : rec.rank === 2 ? '🥈' : '🥉'} ${rec.companyName.padEnd(20)} : ${rec.matchScore.toFixed(1)} 点`);
    });

  console.log('\n✅ 火災保険フロー テスト完了');
  process.exit(0);
} catch (error) {
  console.error('❌ テスト失敗:');
  console.error(error);
  process.exit(1);
}
