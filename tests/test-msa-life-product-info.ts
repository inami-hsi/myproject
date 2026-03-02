/**
 * 三井住友海上あいおい生命の商品固有情報が推奨理由に含まれるかテスト
 */
import { calculateRecommendations } from '../src/lib/scoring';

console.log('=== 三井住友海上あいおい生命 商品情報テスト ===\n');

// 医療保険テスト
console.log('--- 医療保険 (medical) ---');
const medicalAnswers: Record<number, string | string[]> = {
  1: '40代',
  2: '会社員',
  3: '独身',
  4: '入院保障重視',
  5: '持病なし',
  6: ['claim-handling', 'counseling'],
};
const medicalRecs = calculateRecommendations('medical', medicalAnswers);
const msaMedical = medicalRecs.find(r => r.companyId === 'msa-life');
if (msaMedical) {
  console.log(`順位: ${msaMedical.rank}位`);
  console.log(`スコア: ${msaMedical.matchScore}点`);
  const hasProductInfo = msaMedical.reasoning.detailed.includes('医療保険Aセレクト');
  console.log(`商品名「医療保険Aセレクト」含む: ${hasProductInfo ? '✓' : '✗'}`);
  const hasFeature = msaMedical.reasoning.detailed.includes('日帰り入院');
  console.log(`特徴「日帰り入院」含む: ${hasFeature ? '✓' : '✗'}`);
  const hasICU = msaMedical.reasoning.detailed.includes('ICU');
  console.log(`特徴「ICU給付金」含む: ${hasICU ? '✓' : '✗'}`);
  if (hasProductInfo && hasFeature) {
    console.log('✅ 医療保険: 商品情報が正しく含まれています');
  } else {
    console.log('⚠️ 医療保険: 商品情報が不足しています');
  }
} else {
  console.log('❌ 三井住友海上あいおい生命が推奨に含まれていません');
}

console.log('\n--- 収入保障保険 (income) ---');
const incomeAnswers: Record<number, string | string[]> = {
  1: '30代',
  2: '会社員',
  3: '既婚・子供あり',
  4: '家族の生活保障',
  5: 'メンタル疾患も対象',
  6: ['benefit-amount', 'mental-coverage'],
};
const incomeRecs = calculateRecommendations('income', incomeAnswers);
const msaIncome = incomeRecs.find(r => r.companyId === 'msa-life');
if (msaIncome) {
  console.log(`順位: ${msaIncome.rank}位`);
  console.log(`スコア: ${msaIncome.matchScore}点`);
  const hasProductInfo = msaIncome.reasoning.detailed.includes('収入保障Wセレクト');
  console.log(`商品名「収入保障Wセレクト」含む: ${hasProductInfo ? '✓' : '✗'}`);
  const hasMental = msaIncome.reasoning.detailed.includes('ストレス・メンタル');
  console.log(`特徴「ストレス・メンタル疾病」含む: ${hasMental ? '✓' : '✗'}`);
  const hasMultiType = msaIncome.reasoning.detailed.includes('3型');
  console.log(`特徴「3型選択」含む: ${hasMultiType ? '✓' : '✗'}`);
  if (hasProductInfo && hasMental) {
    console.log('✅ 収入保障保険: 商品情報が正しく含まれています');
  } else {
    console.log('⚠️ 収入保障保険: 商品情報が不足しています');
  }
} else {
  console.log('❌ 三井住友海上あいおい生命が推奨に含まれていません');
}

console.log('\n--- 介護保険 (nursing) ---');
const nursingAnswers: Record<number, string | string[]> = {
  1: '50代',
  2: '会社員',
  3: '既婚',
  4: '介護保障',
  5: '認知症対応も重視',
  6: ['benefit-conditions', 'claim-handling'],
};
const nursingRecs = calculateRecommendations('nursing', nursingAnswers);
const msaNursing = nursingRecs.find(r => r.companyId === 'msa-life');
if (msaNursing) {
  console.log(`順位: ${msaNursing.rank}位`);
  console.log(`スコア: ${msaNursing.matchScore}点`);
  const hasProductInfo = msaNursing.reasoning.detailed.includes('介護保険Cセレクト');
  console.log(`商品名「介護保険Cセレクト」含む: ${hasProductInfo ? '✓' : '✗'}`);
  if (hasProductInfo) {
    console.log('✅ 介護保険: 商品情報が正しく含まれています');
  } else {
    console.log('⚠️ 介護保険: 商品情報が不足しています（商品情報未定義の可能性）');
  }
} else {
  console.log('❌ 三井住友海上あいおい生命が推奨に含まれていません');
}

console.log('\n--- 就業不能保険 (disability) ---');
const disabilityAnswers: Record<number, string | string[]> = {
  1: '30代',
  2: '会社員',
  3: '既婚',
  4: '就業不能保障',
  5: '精神疾患対応',
  6: ['mental-coverage', 'benefit-conditions'],
};
const disabilityRecs = calculateRecommendations('disability', disabilityAnswers);
const msaDisability = disabilityRecs.find(r => r.companyId === 'msa-life');
if (msaDisability) {
  console.log(`順位: ${msaDisability.rank}位`);
  console.log(`スコア: ${msaDisability.matchScore}点`);
  const hasProductInfo = msaDisability.reasoning.detailed.includes('くらしの応援ほけん');
  console.log(`商品名「くらしの応援ほけんWセレクト」含む: ${hasProductInfo ? '✓' : '✗'}`);
  const hasMental = msaDisability.reasoning.detailed.includes('ストレス・メンタル');
  console.log(`特徴「ストレス・メンタル疾病」含む: ${hasMental ? '✓' : '✗'}`);
  if (hasProductInfo || hasMental) {
    console.log('✅ 就業不能保険: 商品情報が正しく含まれています');
  } else {
    console.log('⚠️ 就業不能保険: 商品情報が不足しています');
  }
} else {
  console.log('❌ 三井住友海上あいおい生命が推奨に含まれていません');
}

console.log('\n=== テスト完了 ===');

// 詳細表示（オプション）
if (process.argv.includes('--verbose')) {
  console.log('\n=== 収入保障保険の推奨理由詳細 ===');
  if (msaIncome) {
    console.log(msaIncome.reasoning.detailed);
  }
}
