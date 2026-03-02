import { calculateRecommendations } from '@/lib/scoring';

const answers = { 1: '30-39', 2: 'commute', 3: '1', 4: 'sedan', 5: ['accident-response', 'cost'] };
const recs = calculateRecommendations('auto', answers);

console.log('========================================');
console.log('推奨結果と詳細理由（自動車保険）');
console.log('========================================\n');

recs.forEach((rec, index) => {
  console.log(`【第${index + 1}位】${rec.companyName}`);
  console.log(`総合スコア: ${rec.matchScore}点`);
  console.log('\n--- サマリー ---');
  console.log(rec.reasoning.summary);
  console.log('\n--- 詳細理由 ---');
  console.log(rec.reasoning.detailed);
  console.log('\n');
});
