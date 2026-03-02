/**
 * 全7社の商品固有情報が正しく表示されるかテスト
 */
import { calculateRecommendations } from '../src/lib/scoring';

interface TestCase {
  category: string;
  company: string;
  keywords: string[];
  description: string;
}

const testCases: TestCase[] = [
  // 三井住友海上あいおい生命
  { category: 'medical', company: 'msa-life', keywords: ['Aセレクトup', 'がん遺伝子パネル検査'], description: '医療保険Aセレクトup' },
  { category: 'income', company: 'msa-life', keywords: ['収入保障Wセレクト', 'メンタル疾病'], description: '収入保障Wセレクト' },
  
  // 三井住友海上プライマリー生命
  { category: 'variable', company: 'ms-primary', keywords: ['特別勘定', '運用'], description: '変額保険' },
  { category: 'annuity', company: 'ms-primary', keywords: ['しあわせねんきん'], description: '変額個人年金' },
  
  // アフラック生命
  { category: 'medical', company: 'aflac', keywords: ['EVER Prime'], description: '医療保険EVER Prime' },
  { category: 'cancer', company: 'aflac', keywords: ['ALL-in', '上皮内がん'], description: 'がん保険ALL-in' },
  
  // アクサ生命
  { category: 'variable', company: 'axa-life', keywords: ['ユニット・リンク'], description: 'ユニットリンク保険' },
  { category: 'disability', company: 'axa-life', keywords: ['精神疾患'], description: '就業不能保険' },
  
  // ネオファースト生命
  { category: 'medical', company: 'neofirst-life', keywords: ['ネオde健康'], description: 'ネオde健康' },
  { category: 'term', company: 'neofirst-life', keywords: ['ネオde定期'], description: 'ネオde定期' },
  
  // 東京海上日動あんしん生命
  { category: 'income', company: 'tmn-anshin', keywords: ['家計保障定期保険'], description: '家計保障定期保険NEO' },
  { category: 'nursing', company: 'tmn-anshin', keywords: ['あんしん介護'], description: 'あんしん介護' },
  
  // 日本生命
  { category: 'whole', company: 'nippon-life', keywords: ['みらいのカタチ', 'AA+'], description: 'みらいのカタチ終身保険' },
  { category: 'medical', company: 'nippon-life', keywords: ['みらいのカタチ'], description: 'みらいのカタチ医療保険' },
  { category: 'education', company: 'nippon-life', keywords: ['ニッセイ学資'], description: 'ニッセイ学資保険' },
];

console.log('=== 全7社の商品固有情報テスト ===\n');

let passCount = 0;
let failCount = 0;

for (const tc of testCases) {
  const result = calculateRecommendations(tc.category as any, []);
  const companyResult = result.find(r => r.companyId === tc.company);
  
  if (companyResult) {
    const detailed = companyResult.reasoning?.detailed || '';
    const matches = tc.keywords.map(kw => ({
      keyword: kw,
      found: detailed.includes(kw)
    }));
    
    const allFound = matches.every(m => m.found);
    
    if (allFound) {
      console.log(`✅ ${tc.description} (${tc.category}/${tc.company})`);
      passCount++;
    } else {
      console.log(`❌ ${tc.description} (${tc.category}/${tc.company})`);
      matches.filter(m => !m.found).forEach(m => {
        console.log(`   - '${m.keyword}' が見つかりません`);
      });
      failCount++;
    }
  } else {
    console.log(`⚠️ ${tc.description} - ${tc.company} が結果に含まれません`);
    failCount++;
  }
}

console.log(`\n=== 結果: ${passCount}/${passCount + failCount} テストパス ===`);

if (failCount > 0) {
  process.exit(1);
}
