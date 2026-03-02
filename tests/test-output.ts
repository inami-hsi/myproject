import { calculateRecommendations } from '@/lib/scoring';

const answers = { 1: '30-39', 2: 'commute', 3: '1', 4: 'sedan', 5: ['accident-response'] };
const recs = calculateRecommendations('auto', answers);

console.log('=== 推奨結果（自動車保険） ===');
console.log('1位:', recs[0].companyName, '- スコア:', recs[0].matchScore);
console.log('2位:', recs[1].companyName, '- スコア:', recs[1].matchScore);
console.log('\n=== 推奨理由（1位） ===');
console.log(recs[0].reasoning.summary);
console.log('\n=== スコア内訳 ===');
Object.entries(recs[0].scoringBreakdown).forEach(([axis, score]) => {
  console.log(`  ${axis}: ${score}`);
});

const now = new Date();
const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
console.log('\n=== タイムスタンプ例 ===');
console.log('作成日時:', dateStr);

const fileDate = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
console.log('ファイル名例:', `自動車保険比較レポート_${fileDate}.txt`);
console.log('CSV例:', `自動車保険比較_${fileDate}.csv`);
