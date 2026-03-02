import { Recommendation, InsuranceCategory, lifeInsuranceCategories } from '@/types';
import { insuranceCompanies } from '@/data/companies';

/**
 * スコアリング軸定義 (カテゴリー別)
 */
const scoringAxesByCategory: Record<InsuranceCategory, Record<string, { label: string; weight: number }>> = {
  auto: {
    'accident-response': { label: '事故対応力', weight: 1.2 },
    'insurance-cost': { label: '保険料競争力', weight: 0.8 },
    features: { label: '特約の充実', weight: 1.0 },
    digital: { label: 'デジタル対応', weight: 0.9 },
    network: { label: '代理店ネット', weight: 1.1 },
    'added-value': { label: '付加価値', weight: 0.7 },
  },
  fire: {
    coverage: { label: '補償の手厚さ', weight: 1.2 },
    'insurance-cost': { label: '保険料競争力', weight: 1.0 },
    'water-response': { label: '水災対応', weight: 1.1 },
    'claim-service': { label: '損害サービス', weight: 1.3 },
    network: { label: '代理店ネット', weight: 1.1 },
    'longterm-discount': { label: '長期割引', weight: 0.9 },
  },
  liability: {
    'coverage-limit': { label: '補償限度額', weight: 1.2 },
    'legal-support': { label: '示談代行サービス', weight: 1.3 },
    'claim-speed': { label: 'クレーム対応速度', weight: 1.1 },
    'service-quality': { label: 'サービス品質', weight: 1.0 },
    'digital-support': { label: 'デジタル対応', weight: 0.8 },
    'insurance-cost': { label: '保険料競争力', weight: 0.9 },
  },
  injury: {
    'hospitalization-coverage': { label: '入院補償', weight: 1.3 },
    'occupational-coverage': { label: '職業別対応', weight: 1.2 },
    'life-insurance': { label: '生命保険連携', weight: 0.9 },
    recovery: { label: 'リハビリ支援', weight: 1.1 },
    'service-quality': { label: 'サービス品質', weight: 1.0 },
    'insurance-cost': { label: '保険料競争力', weight: 0.8 },
  },
  // 生命保険カテゴリ
  term: {
    'product-variety': { label: '商品バリエーション', weight: 1.0 },
    'claim-handling': { label: '給付金支払い対応', weight: 1.3 },
    digital: { label: 'デジタル対応', weight: 1.0 },
    counseling: { label: '相談サポート', weight: 1.1 },
    cost: { label: '保険料競争力', weight: 1.2 },
    reputation: { label: '会社の信頼性', weight: 0.9 },
  },
  whole: {
    'product-variety': { label: '商品バリエーション', weight: 1.1 },
    'claim-handling': { label: '給付金支払い対応', weight: 1.2 },
    digital: { label: 'デジタル対応', weight: 0.9 },
    counseling: { label: '相談サポート', weight: 1.2 },
    cost: { label: '保険料競争力', weight: 0.8 },
    reputation: { label: '会社の信頼性', weight: 1.3 },
  },
  medical: {
    'product-variety': { label: '商品バリエーション', weight: 1.0 },
    'claim-handling': { label: '給付金支払い対応', weight: 1.4 },
    digital: { label: 'デジタル対応', weight: 1.0 },
    counseling: { label: '相談サポート', weight: 1.0 },
    cost: { label: '保険料競争力', weight: 1.1 },
    reputation: { label: '会社の信頼性', weight: 1.0 },
  },
  cancer: {
    'product-variety': { label: '商品バリエーション', weight: 1.0 },
    'claim-handling': { label: '給付金支払い対応', weight: 1.5 },
    digital: { label: 'デジタル対応', weight: 0.9 },
    counseling: { label: '相談サポート', weight: 1.0 },
    cost: { label: '保険料競争力', weight: 1.0 },
    reputation: { label: '会社の信頼性', weight: 1.1 },
  },
  annuity: {
    'return-rate': { label: '運用利回り', weight: 1.3 },
    stability: { label: '財務安定性', weight: 1.4 },
    flexibility: { label: '受取方法の柔軟性', weight: 1.1 },
    counseling: { label: '相談サポート', weight: 1.0 },
    cost: { label: '手数料競争力', weight: 1.0 },
    reputation: { label: '会社の信頼性', weight: 1.2 },
  },
  variable: {
    'investment-options': { label: '運用商品の充実度', weight: 1.2 },
    performance: { label: '運用実績', weight: 1.1 },
    flexibility: { label: '運用変更の柔軟性', weight: 1.0 },
    counseling: { label: '相談サポート', weight: 1.2 },
    cost: { label: '手数料競争力', weight: 1.0 },
    reputation: { label: '会社の信頼性', weight: 1.4 },
    stability: { label: '財務安定性', weight: 1.3 },
  },
  endowment: {
    'maturity-benefit': { label: '満期保険金の確実性', weight: 1.2 },
    'return-rate': { label: '返戻率', weight: 1.1 },
    stability: { label: '財務安定性', weight: 1.4 },
    counseling: { label: '相談サポート', weight: 1.1 },
    cost: { label: '保険料競争力', weight: 0.9 },
    reputation: { label: '会社の信頼性', weight: 1.3 },
  },
  education: {
    'return-rate': { label: '返戻率', weight: 1.3 },
    'waiver-options': { label: '払込免除特約', weight: 1.1 },
    flexibility: { label: '受取時期の柔軟性', weight: 1.0 },
    counseling: { label: '相談サポート', weight: 1.1 },
    cost: { label: '保険料競争力', weight: 1.0 },
    reputation: { label: '会社の信頼性', weight: 1.4 },
    stability: { label: '財務安定性', weight: 1.3 },
  },
  income: {
    'benefit-amount': { label: '年金月額設定', weight: 1.2 },
    'coverage-period': { label: '保障期間設定', weight: 1.1 },
    'minimum-guarantee': { label: '最低保証期間', weight: 1.0 },
    counseling: { label: '相談サポート', weight: 1.1 },
    cost: { label: '保険料競争力', weight: 1.3 },
    reputation: { label: '会社の信頼性', weight: 1.0 },
  },
  nursing: {
    'benefit-conditions': { label: '給付条件の幅広さ', weight: 1.3 },
    'benefit-amount': { label: '給付金額設定', weight: 1.1 },
    'claim-handling': { label: '給付金支払い対応', weight: 1.4 },
    counseling: { label: '相談サポート', weight: 1.1 },
    cost: { label: '保険料競争力', weight: 1.0 },
    reputation: { label: '会社の信頼性', weight: 1.1 },
  },
  disability: {
    'mental-coverage': { label: '精神疾患対応', weight: 1.2 },
    'benefit-conditions': { label: '給付条件', weight: 1.3 },
    'waiting-period': { label: '免責期間設定', weight: 1.0 },
    counseling: { label: '相談サポート', weight: 1.0 },
    cost: { label: '保険料競争力', weight: 1.2 },
    reputation: { label: '会社の信頼性', weight: 1.1 },
  },
};

/**
 * ユーザーの回答からスコアリング優先度を抽出
 */
function extractScoringPriorities(
  category: InsuranceCategory,
  answers: Record<number, string | string[]>
) {
  const priorities: Record<string, number> = {};

  if (category === 'auto') {
    // 質問6: 優先する補償内容
    const q6Answers = answers[6];
    if (Array.isArray(q6Answers)) {
      q6Answers.forEach((answer, index) => {
        const weight = 3 - index;
        if (answer === 'cost') {
          priorities['insurance-cost'] = (priorities['insurance-cost'] || 0) + weight;
        } else if (answer === 'accident-response') {
          priorities['accident-response'] = (priorities['accident-response'] || 0) + weight;
        } else if (
          answer === 'lawyer-fee' ||
          answer === 'digital' ||
          answer === 'roadside-service' ||
          answer === 'rental-car'
        ) {
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
  } else if (category === 'fire') {
    // 問6: 補償内容の優先度（上位3つ）
    const q6 = answers[6];
    if (Array.isArray(q6)) {
      q6.forEach((ans, idx) => {
        const weight = 3 - idx;
        switch (ans) {
          case 'cost':
            priorities['insurance-cost'] = (priorities['insurance-cost'] || 0) + weight;
            break;
          case 'basic-coverage':
            priorities['coverage'] = (priorities['coverage'] || 0) + weight;
            break;
          case 'water-damage':
            priorities['water-response'] = (priorities['water-response'] || 0) + weight;
            break;
          case 'earthquake':
            priorities['coverage'] = (priorities['coverage'] || 0) + weight * 0.8;
            break;
          case 'custom':
            priorities['coverage'] = (priorities['coverage'] || 0) + weight * 0.5;
            break;
          default:
            // theft, breakage etc. treat as coverage
            priorities['coverage'] = (priorities['coverage'] || 0) + weight * 0.5;
        }
      });
    }

    // 問7: 長期契約
    const q7 = answers[7];
    if (q7 === '5years' || q7 === '10years+') {
      priorities['longterm-discount'] = (priorities['longterm-discount'] || 0) + 2;
    }

    // 問8: サービス・相談方式
    const q8 = answers[8];
    if (q8 === 'face-to-face') {
      priorities['network'] = (priorities['network'] || 0) + 2;
    } else if (q8 === 'online') {
      priorities['digital'] = (priorities['digital'] || 0) + 2;
    } else if (q8 === 'claim-first') {
      priorities['claim-service'] = (priorities['claim-service'] || 0) + 2;
    }
  }

    else if (category === 'liability') {
      // 問5: 優先する補償内容（上位3つ）
      const q5 = answers[5];
      if (Array.isArray(q5)) {
        q5.forEach((ans, idx) => {
          const weight = 3 - idx;
          switch (ans) {
            case 'coverage-limit':
              priorities['coverage-limit'] = (priorities['coverage-limit'] || 0) + weight;
              break;
            case 'legal-support':
              priorities['legal-support'] = (priorities['legal-support'] || 0) + weight;
              break;
            case 'personal-injury':
              priorities['coverage-limit'] = (priorities['coverage-limit'] || 0) + weight * 0.8;
              break;
            case 'quick-settlement':
              priorities['claim-speed'] = (priorities['claim-speed'] || 0) + weight;
              break;
            case 'cost':
              priorities['insurance-cost'] = (priorities['insurance-cost'] || 0) + weight;
              break;
            case 'custom':
              priorities['service-quality'] = (priorities['service-quality'] || 0) + weight * 0.5;
              break;
          }
        });
      }

      // 問6: 相談方式
      const q6 = answers[6];
      if (q6 === 'face-to-face') {
        priorities['service-quality'] = (priorities['service-quality'] || 0) + 2;
      } else if (q6 === 'online') {
        priorities['digital-support'] = (priorities['digital-support'] || 0) + 2;
      }

      // 問1: 補償対象（カバレッジを強化）
      const q1 = answers[1];
      if (q1 === 'all' || q1 === 'pet') {
        priorities['coverage-limit'] = (priorities['coverage-limit'] || 0) + 1;
      }
    } else if (category === 'injury') {
      // 問4: 日額給付金額
      const q4 = answers[4];
      if (q4 === '20000' || q4 === '30000+') {
        priorities['hospitalization-coverage'] = (priorities['hospitalization-coverage'] || 0) + 2;
      }

      // 問5: 優先する補償内容（上位3つ）
      const q5 = answers[5];
      if (Array.isArray(q5)) {
        q5.forEach((ans, idx) => {
          const weight = 3 - idx;
          switch (ans) {
            case 'hospitalization':
              priorities['hospitalization-coverage'] = (priorities['hospitalization-coverage'] || 0) + weight;
              break;
            case 'occupational':
              priorities['occupational-coverage'] = (priorities['occupational-coverage'] || 0) + weight;
              break;
            case 'life-insurance':
              priorities['life-insurance'] = (priorities['life-insurance'] || 0) + weight;
              break;
            case 'recovery':
              priorities['recovery'] = (priorities['recovery'] || 0) + weight;
              break;
            case 'cost':
              priorities['insurance-cost'] = (priorities['insurance-cost'] || 0) + weight;
              break;
            case 'service':
              priorities['service-quality'] = (priorities['service-quality'] || 0) + weight;
              break;
          }
        });
      }

      // 問7: 相談方式
      const q7 = answers[7];
      if (q7 === 'face-to-face') {
        priorities['service-quality'] = (priorities['service-quality'] || 0) + 2;
      } else if (q7 === 'online') {
        priorities['hospitalization-coverage'] = (priorities['hospitalization-coverage'] || 0) + 1;
      }

      // 問3: リスク分析（職業上のリスク）
      const q3 = answers[3];
      if (q3 === 'high' || q3 === 'very-high') {
        priorities['occupational-coverage'] = (priorities['occupational-coverage'] || 0) + 2;
      }
    } else if (category === 'term' || category === 'whole' || category === 'medical' || category === 'cancer') {
      // 生命保険カテゴリ共通の優先度抽出

      // 問5: 重視するポイント（上位3つ）
      const q5 = answers[5];
      if (Array.isArray(q5)) {
        q5.forEach((ans, idx) => {
          const weight = 3 - idx;
          switch (ans) {
            case 'cost':
              priorities['cost'] = (priorities['cost'] || 0) + weight;
              break;
            case 'coverage':
            case 'return-rate':
            case 'hospitalization':
            case 'surgery':
            case 'diagnosis-benefit':
            case 'treatment-benefit':
              priorities['product-variety'] = (priorities['product-variety'] || 0) + weight;
              break;
            case 'claim-handling':
              priorities['claim-handling'] = (priorities['claim-handling'] || 0) + weight;
              break;
            case 'digital':
            case 'app':
              priorities['digital'] = (priorities['digital'] || 0) + weight;
              break;
            case 'counseling':
              priorities['counseling'] = (priorities['counseling'] || 0) + weight;
              break;
            case 'reputation':
            case 'convertible':
              priorities['reputation'] = (priorities['reputation'] || 0) + weight;
              break;
            case 'advanced-medical':
            case 'recurrence':
            case 'outpatient':
              priorities['product-variety'] = (priorities['product-variety'] || 0) + weight * 0.8;
              break;
          }
        });
      }

      // 問7: 相談方式
      const q7 = answers[7];
      if (q7 === 'face-to-face') {
        priorities['counseling'] = (priorities['counseling'] || 0) + 2;
      } else if (q7 === 'online' || q7 === 'app') {
        priorities['digital'] = (priorities['digital'] || 0) + 2;
      }

      // 問6: 予算（安さを重視するか）
      const q6 = answers[6];
      if (q6 && (q6.toString().includes('under') || q6.toString().includes('2k'))) {
        priorities['cost'] = (priorities['cost'] || 0) + 1;
      }
    }

  return priorities;
}

/**
 * 企業スコアを計算
 */
function calculateCompanyScore(
  company: any,
  userPriorities: Record<string, number>,
  axes: Record<string, { label: string; weight: number }>
): Record<string, number> {
  const scores: Record<string, number> = {};

  Object.entries(axes).forEach(([axisId, axis]) => {
    const baseScore = company.scoring[axisId] || 3;
    const priorityWeight = userPriorities[axisId] || 1;
    const normalizedScore = (baseScore / 5) * 100;
    // 軸の重みと優先度を分離：
    // - axis.weight: 軸の重要度（0.7-1.3）
    // - priorityWeight: ユーザーの優先度調整（1-3）
    // - 最終スコア = normalizedScore * (1 + (axis.weight - 1) * priorityWeight) で標準化
    const priorityAdjustment = 1 + (axis.weight - 1) * Math.min(priorityWeight, 2);
    const weightedScore = normalizedScore * Math.min(priorityAdjustment, 2);

    scores[axisId] = parseFloat(Math.min(100, weightedScore).toFixed(1));
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

  // 総合スコアを 0-100 に正規化
  return parseFloat(Math.min(100, Math.max(0, average)).toFixed(1));
}

/**
 * 会社・カテゴリ別の具体的商品特徴を取得
 */
function getProductSpecificInfo(companyId: string, category: InsuranceCategory): string {
  const productInfo: Record<string, Partial<Record<InsuranceCategory, string>>> = {
    'msa-life': {
      medical: `
#### 商品特徴：&LIFE 医療保険Aセレクトup（2026年3月2日発売）
- **がん遺伝子パネル検査特約【新特約】** - がん組織や血液を用いて100以上の遺伝子異常を一度に解析し、患者一人ひとりの遺伝子変化に合わせた分子標的薬（ゲノム医療）を探す検査費用を保障
- **日帰り入院から一律5日分支給** - 短期入院でも手厚い保障
- **八大疾病対応** - ガン・心疾患・脳血管疾患・高血圧性疾患・糖尿病・肝疾患・腎疾患・膵疾患をカバー
- **集中治療給付金（ICU給付金）** - ICU管理時に一時金支給（他社では珍しい保障）
- **放射線治療給付金** - 入院・手術の有無にかかわらず支給
- **豊富な特約オプション** - 三大疾病や女性向けなど、ニーズに合わせたカスタマイズ可能`,
      income: `
#### 商品特徴：&LIFE 収入保障Wセレクト / 総合収入保障Wセレクト
- **多様な保障型** - 死亡・高度障害・介護障害状態の3型から選択可能
- **介護・障害就労不能年金** - 身体障害者手帳(1〜4級)、国民年金障害等級(1〜2級)、要介護1以上で年金支給
- **ストレス・メンタル疾病サポート特則** - 精神疾患での30日以上継続入院・在宅医療に一時金支給（業界屈指の保障）
- **入院・在宅医療サポート** - 10日以上/30日以上継続で一時金支給
- **保険料割引オプション** - 健康診断料率適用特約・健康優良割引で保険料を抑制可能
- **保険料払込免除** - ガン診断・心疾患・脳血管疾患で以後の保険料不要`,
      nursing: `
#### 商品特徴：&LIFE 介護保険Cセレクト
- **幅広い給付条件** - 公的介護保険の要介護1以上で給付
- **選べる保障タイプ** - 介護年金・介護一時金から選択可能
- **認知症対応** - 認知症特則で手厚い保障
- **終身保障** - 一生涯の介護保障を確保`,
      disability: `
#### 商品特徴：&LIFE くらしの応援ほけんWセレクト
- **就労不能に特化** - 死亡保障なしの就労不能保障専用型
- **ストレス・メンタル疾病対応** - 精神疾患でも給付対象
- **幅広い支払条件** - 身体障害者手帳(1〜4級)、国民年金障害等級(1〜2級)、要介護1以上で支給
- **健康優良割引適用** - 非喫煙者・健康体割引で保険料を抑制`,
      whole: `
#### 商品特徴：&LIFE 終身保険（低解約返戻金型）
- **一生涯の死亡保障** - 終身にわたる死亡・高度障害保障
- **低解約返戻金型** - 保険料を抑えながら保障を確保
- **貯蓄機能** - 解約返戻金を老後資金等に活用可能
- **保険料払込免除特約** - 三大疾病診断で以後の保険料不要`,
      annuity: `
#### 商品特徴：&LIFE 個人年金保険
- **円建て確定年金** - 確実に年金を受け取れる計画的な老後準備
- **保険料控除対象** - 個人年金保険料控除の税制メリット
- **年金受取方法選択** - 確定年金・終身年金から選択可能`,
      term: `
#### 商品特徴：&LIFE 逓減定期保険 / 定期保険
- **必要保障額に合わせた設計** - ライフステージに応じた保障額設定
- **保険料払込免除特約** - 三大疾病診断で以後の保険料不要
- **逓減タイプ選択可能** - 保障が逓減するタイプで保険料を抑制`,
      cancer: `
#### 商品特徴：&LIFE ガン保険Sセレクト
- **上皮内ガンも保障** - 早期のガンから手厚くサポート
- **ガン診断給付金** - ガン診断確定時に一時金を支給
- **抗ガン剤治療給付金** - 抗ガン剤治療を受けたとき給付
- **先進医療特約** - ガンの先進医療にも対応`,
    },
    'tmn-anshin': {
      income: `
#### 商品特徴：家計保障定期保険NEO
- **就業不能保障オプション** - 働けなくなったときも年金支給
- **保険料払込免除特約** - 三大疾病診断で以後の保険料不要
- **健康優良割引** - 非喫煙者・健康体割引適用可能`,
      nursing: `
#### 商品特徴：あんしん介護
- **要介護1から給付** - 早期の介護状態から保障
- **終身介護年金** - 一生涯の介護保障`,
      whole: `
#### 商品特徴：夢終身（一時払終身保険）
- **一時払いで一生涯保障** - まとまった資金で終身の死亡保障を確保
- **相続対策に最適** - 死亡保険金の非課税枠を活用可能
- **解約返戻金あり** - 資金化も可能な貯蓄性
- **東京海上グループの信頼性** - 大手損保系の安定した財務基盤`,
      annuity: `
#### 商品特徴：個人年金保険
- **円建て確定年金** - 確実な年金受取りで老後資金を計画的に準備
- **保険料控除対象** - 個人年金保険料控除の税制メリット
- **年金受取方法選択可能** - 確定年金・終身年金から選択`,
    },
    'aflac': {
      medical: `
#### 商品特徴：医療保険 EVER Prime
- **通院保障が充実** - 入院前後の通院も幅広くカバー
- **三大疾病一時金** - ガン・心疾患・脳血管疾患診断で一時金支給
- **先進医療特約** - 先進医療の技術料を全額保障`,
      cancer: `
#### 商品特徴：生きるためのがん保険 ALL-in
- **上皮内がんも同額保障** - 早期がんでも手厚い保障
- **治療継続に寄り添う保障** - 通院・抗がん剤治療も幅広くカバー
- **がん専門相談サービス** - 専門スタッフによる相談支援`,
      whole: `
#### 商品特徴：アフラックの終身保険
- **一生涯の死亡保障** - 終身にわたる死亡・高度障害保障を確保
- **解約返戻金あり** - 貯蓄性を持った終身保険
- **保険料払込免除特約** - 三大疾病診断で以後の保険料不要
- **告知が簡単なタイプも** - 健康状態に不安がある方向けの引受基準緩和型も用意`,
      term: `
#### 商品特徴：アフラックの定期保険
- **シンプルな死亡保障** - 必要な期間だけ大きな保障を確保
- **保険料が手頃** - 掛け捨てタイプで保険料を抑制
- **ネット申込可能** - オンラインで手軽に加入`,
      disability: `
#### 商品特徴：アフラックの給与サポート保険
- **働けなくなったときの収入保障** - 病気やケガで働けなくなったとき毎月給付
- **短期・長期の両方に対応** - 短期の入院から長期の就業不能まで幅広くカバー
- **精神疾患も保障対象** - うつ病等のメンタル疾患による就業不能もカバー`,
    },
    'ms-primary': {
      variable: `
#### 商品特徴：変額保険（有期型）/ 変額終身保険
- **特別勘定による運用** - 国内外の株式・債券等で積極的に運用
- **豊富な運用コース** - リスク許容度に応じた複数の特別勘定から選択可能
- **運用実績連動** - 運用成果が保険金額・解約返戻金に反映
- **一時払・平準払選択可能** - お客様の資金状況に合わせた払込方法`,
      annuity: `
#### 商品特徴：私のしあわせねんきん（変額個人年金保険）
- **運用と年金の両立** - 特別勘定での運用と将来の年金受取りを同時に実現
- **死亡給付金保証** - 運用状況にかかわらず払込保険料相当額を最低保証
- **多様な受取方法** - 確定年金・終身年金・一時金受取りから選択可能
- **金融機関窓口で契約** - 銀行・証券会社等で加入手続きが可能`,
      endowment: `
#### 商品特徴：外貨建養老保険
- **外貨建て運用** - 米ドル・豪ドル等の高金利通貨で運用
- **満期保険金設定** - 保険期間満了時に満期保険金を受取り
- **為替差益の可能性** - 円安時には為替差益も期待`,
    },
    'axa-life': {
      variable: `
#### 商品特徴：ユニット・リンク保険（有期型）
- **自分で選ぶ運用スタイル** - 10種類以上の特別勘定から自由に選択・変更可能
- **最低保証なしの積極運用** - 運用実績がそのまま反映される変額保険
- **保険料払込免除特約** - 三大疾病診断で以後の保険料不要
- **長期の資産形成に最適** - 投資と保障を組み合わせた商品設計`,
      nursing: `
#### 商品特徴：ユニット・リンク介護保険
- **介護と運用を両立** - 変額保険の仕組みで介護保障を確保
- **要介護2以上で給付** - 介護年金・介護一時金を支給
- **運用成果が反映** - 特別勘定での運用実績が給付に影響`,
      annuity: `
#### 商品特徴：変額個人年金保険
- **変額年金タイプ** - 特別勘定で積極運用し年金原資を形成
- **豊富な運用オプション** - 複数の特別勘定から選択可能`,
      disability: `
#### 商品特徴：アクサのどえらイー / 就業不能保険
- **精神疾患も保障対象** - うつ病等のメンタル疾患による就業不能もカバー
- **短い免責期間** - 60日間の免責期間で早期から給付
- **在宅療養も対象** - 入院だけでなく在宅療養でも給付`,
      whole: `
#### 商品特徴：アップサイドプラス（一時払終身保険）/ 終身保険
- **一時払い終身保険「アップサイドプラス」** - まとまった資金で終身保障を確保
- **解約返戻金の運用連動** - 市場金利に応じた運用成果
- **低解約返戻金型終身保険** - 保険料を抑えながら一生涯の死亡保障`,
      medical: `
#### 商品特徴：アクサの「一生保障」の医療保険
- **終身医療保障** - 一生涯の入院・手術保障を確保
- **先進医療特約** - 先進医療の技術料を通算2,000万円まで保障
- **三大疾病払込免除** - ガン診断・心疾患・脳血管疾患で保険料免除`,
    },
    'neofirst-life': {
      medical: `
#### 商品特徴：ネオde健康（医療保険）
- **健康状態による保険料割引** - 健康な方は保険料が最大30%割引
- **入院一時金型** - 日額型に加え、入院一時金型も選択可能
- **デジタル完結** - WEB申込・契約手続きがスムーズ`,
      term: `
#### 商品特徴：ネオde定期
- **業界最安水準の保険料** - シンプルな保障内容で保険料を抑制
- **健康体割引** - 非喫煙者・健康体の方は大幅割引
- **WEB申込完結** - 来店不要でオンライン手続き完了`,
      disability: `
#### 商品特徴：ネオdeからだエール
- **就業不能保障** - 働けなくなったときの収入を保障
- **精神疾患対応** - メンタル疾患による就業不能もカバー
- **コストパフォーマンス重視** - 必要な保障を手頃な保険料で`,
    },
    'nippon-life': {
      whole: `
#### 商品特徴：みらいのカタチ 終身保険
- **大手ならではの安心感** - 国内生保最大手の信頼性
- **対面コンサルティング** - ニッセイトータルパートナーによる丁寧なサポート
- **保険金支払い能力AA+** - 格付機関から高評価を獲得`,
      medical: `
#### 商品特徴：みらいのカタチ 医療保険（入院総合保険）
- **入院・手術を総合保障** - 病気・ケガによる入院・手術を幅広くカバー
- **三大疾病特約** - ガン・心疾患・脳血管疾患に手厚い保障
- **対面サポート充実** - 給付金請求も担当者がフォロー`,
      term: `
#### 商品特徴：みらいのカタチ 定期保険
- **シンプルな死亡保障** - 必要な期間だけ大きな保障を確保
- **保険料払込免除特約** - 所定の状態で以後の保険料不要
- **更新型・全期型選択可能** - ライフプランに合わせて選択`,
      annuity: `
#### 商品特徴：みらいのカタチ 年金保険
- **計画的な老後資金準備** - 確実に年金を受け取れる
- **確定年金・終身年金** - 受取方法を選択可能
- **個人年金保険料控除対象** - 税制メリットあり`,
      education: `
#### 商品特徴：ニッセイ学資保険
- **計画的な教育資金準備** - お子さまの進学時期に合わせて祝金受取り
- **契約者死亡時の払込免除** - 万一の際も教育資金を確保
- **大手の安心感** - 確実な保険金支払い`,
    },
  };

  const companyInfo = productInfo[companyId];
  if (companyInfo && companyInfo[category]) {
    return companyInfo[category];
  }
  return '';
}

/**
 * 推奨理由テンプレート
 */
function generateRecommendationReason(
  category: InsuranceCategory,
  companyId: string,
  companyName: string,
  rank: 1 | 2,
  matchScore: number,
  topAxisScore: { axis: string; label: string; value: number },
  userAnswers: Record<number, string | string[]>,
  scoringBreakdown: Record<string, number>,
  axes: Record<string, { label: string; weight: number }>,
  userPriorities: Record<string, number>
): { summary: string; detailed: string } {
  const categoryLabelMap: Record<InsuranceCategory, string> = {
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
  const categoryLabel = categoryLabelMap[category];

  // ユーザーが重視している軸を抽出（優先度が高い順）
  const userPriorityAxes = Object.entries(userPriorities)
    .filter(([, priority]) => priority > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([axis, priority]) => ({
      axis,
      label: axes[axis]?.label || axis,
      priority,
      companyScore: scoringBreakdown[axis] || 0,
    }));

  // ユーザー優先軸と会社スコアの適合度を計算
  const priorityMatchText = userPriorityAxes.length > 0
    ? userPriorityAxes.map(p => 
        `• **${p.label}**（お客様重視度: ${p.priority > 1.5 ? '高' : p.priority > 1.0 ? '中' : '標準'}）\n  → ${companyName}のスコア: ${p.companyScore}点${p.companyScore >= 80 ? '（高評価）' : p.companyScore >= 60 ? '（良好）' : '（標準）'}`
      ).join('\n')
    : '• 全般的にバランス重視の選択をされています';

  // スコアリング軸の詳細を生成
  const axisDetails = Object.entries(scoringBreakdown)
    .sort((a, b) => b[1] - a[1])
    .map(([axis, score]) => {
      const axisInfo = axes[axis];
      const label = axisInfo?.label || axis;
      const weight = axisInfo?.weight || 1.0;
      const userPriority = userPriorities[axis] || 1.0;
      const rating = score >= 90 ? '◎ 非常に優れている' : score >= 70 ? '○ 優れている' : score >= 50 ? '△ 標準的' : '▽ 改善の余地あり';
      const isUserPriority = userPriority > 1.0;
      return { axis, label, score, weight, rating, isUserPriority };
    });

  // 上位3つの強みを抽出
  const topStrengths = axisDetails.slice(0, 3);
  const strengthsText = topStrengths.map(s => 
    `• ${s.label}: ${s.score}点 ${s.rating}${s.isUserPriority ? ' ★お客様重視項目' : ''}`
  ).join('\n');

  // ユーザー重視軸での適合状況
  const userPriorityMatch = axisDetails.filter(a => a.isUserPriority && a.score >= 70);
  const priorityMatchRate = userPriorityAxes.length > 0 
    ? Math.round((userPriorityMatch.length / userPriorityAxes.length) * 100)
    : 100;

  // 弱みがあれば抽出（50点未満）
  const weaknesses = axisDetails.filter(a => a.score < 50);
  const weaknessText = weaknesses.length > 0 
    ? weaknesses.map(w => `• ${w.label}: ${w.score}点${w.isUserPriority ? '（※お客様重視項目）' : ''}`).join('\n')
    : '特になし';

  // 全軸スコア一覧
  const allScoresText = axisDetails.map(a => 
    `| ${a.label}${a.isUserPriority ? ' ★' : ''} | ${a.score}点 | ${a.rating} |`
  ).join('\n');

  // 商品固有の特徴情報を取得
  const productSpecificInfo = getProductSpecificInfo(companyId, category);
  const productInfoSection = productSpecificInfo 
    ? `\n### 商品別の具体的な特徴\n${productSpecificInfo}\n`
    : '';

  // 推奨の合理的根拠
  const rationaleBasis = userPriorityAxes.length > 0
    ? `お客様が重視された「${userPriorityAxes.map(p => p.label).join('」「')}」の観点において、${companyName}は${userPriorityMatch.length > 0 ? `${userPriorityMatch.length}項目で70点以上の高評価を獲得` : '一定の水準を維持'}しています。`
    : `各評価軸において${companyName}はバランスの取れた高い評価を獲得しています。`;

  const reasonTemplates = {
    1: {
      summary: `${companyName}があなたのニーズに最適です。${topAxisScore.label}で${topAxisScore.value}点を獲得し、お客様の重視項目との適合率は${priorityMatchRate}%です。`,
      detailed: `
## 推奨理由の詳細分析

### 1. 推奨結論

**${companyName}** を${categoryLabel}の第1候補として推奨します。

| 評価項目 | 結果 |
|----------|------|
| 総合マッチ度 | **${matchScore}点 / 100点** |
| 推奨順位 | **第1位** |
| お客様重視項目との適合率 | **${priorityMatchRate}%** |
| 最高評価軸 | ${topAxisScore.label} (${topAxisScore.value}点) |

### 2. 推奨の合理的根拠

${rationaleBasis}

#### お客様の重視項目と当社評価の照合

${priorityMatchText}
${productInfoSection}
### 3. ${companyName}の強み分析

${strengthsText}
### 4. 評価軸別スコア詳細

★印はお客様が重視された項目です。

| 評価軸 | スコア | 評価 |
|--------|--------|------|
${allScoresText}

### 5. 推奨判断のロジック

${companyName}を第1位として推奨する論理的根拠：

1. **お客様ニーズとの高い適合性**
   お客様の回答内容から抽出した重視項目において、${companyName}は${priorityMatchRate}%の適合率を達成しています。これは比較対象企業の中で最も高い水準です。

2. **主要評価軸での優位性**
   「${topAxisScore.label}」において${topAxisScore.value}点を獲得しており、この分野での信頼性と実績が高いことを示しています。

3. **総合的なバランス**
   単一の軸だけでなく、複数の評価軸で安定した高スコアを維持しており、総合的な保険サービス品質が優れています。

4. **リスク要因の少なさ**
   ${weaknesses.length === 0 ? '50点未満の評価軸がなく、重大な弱点が見当たりません。' : `一部改善の余地がある項目がありますが、総合評価には大きな影響を与えない水準です。`}

### 6. 留意事項

**改善の余地がある点:**
${weaknessText}

### 7. 免責事項

本推奨は、お客様の回答内容に基づく参考情報です。最終的な保険選択の際は、以下を必ずご確認ください：
• 実際の保険料見積もり
• 保険約款・重要事項説明書
• 保険金支払い条件の詳細
• ご自身のライフプランとの整合性
      `,
    },
    2: {
      summary: `${companyName}も有力な選択肢です。${topAxisScore.label}で${topAxisScore.value}点を獲得しています。`,
      detailed: `
## 推奨理由の詳細分析

### 1. 推奨結論

**${companyName}** を${categoryLabel}の第2候補として推奨します。

| 評価項目 | 結果 |
|----------|------|
| 総合マッチ度 | **${matchScore}点 / 100点** |
| 推奨順位 | **第2位** |
| お客様重視項目との適合率 | **${priorityMatchRate}%** |
| 最高評価軸 | ${topAxisScore.label} (${topAxisScore.value}点) |

### 2. 第2位推奨の合理的根拠

${rationaleBasis}

第1位候補と僅差であり、特定の条件下では第1位候補を上回る可能性があります。

#### お客様の重視項目と当社評価の照合

${priorityMatchText}
${productInfoSection}
### 3. ${companyName}の強み分析

${strengthsText}

### 4. 評価軸別スコア詳細

★印はお客様が重視された項目です。

| 評価軸 | スコア | 評価 |
|--------|--------|------|
${allScoresText}

### 5. 第1位との比較検討ポイント

${companyName}を選択すべきケース：

1. **特定軸の重視度がより高い場合**
   「${topAxisScore.label}」を最も重視される場合、${companyName}が最適な選択となる可能性があります。

2. **保険料とのバランス**
   実際の見積もり比較で、${companyName}がより有利な保険料を提示する可能性があります。

3. **既存契約との関係**
   既にグループ会社の保険に加入されている場合、割引等の優遇を受けられる可能性があります。

### 6. 留意事項

**改善の余地がある点:**
${weaknessText}

### 7. 免責事項

本推奨は、お客様の回答内容に基づく参考情報です。最終的な保険選択の際は、実際の商品内容、保険料、契約条件等を必ずご確認ください。
      `,
    },
  };

  return {
    summary: reasonTemplates[rank].summary,
    detailed: reasonTemplates[rank].detailed,
  };
}

/**
 * 保険の推奨を計算
 */
export function calculateRecommendations(
  category: InsuranceCategory,
  answers: Record<number, string | string[]>
): Recommendation[] {
  // 生命保険カテゴリの場合はlife会社を使用
  const isLifeCategory = lifeInsuranceCategories.includes(category);
  const companies = isLifeCategory ? insuranceCompanies.life : insuranceCompanies.loss;
  const axes = scoringAxesByCategory[category] || scoringAxesByCategory.auto;
  const userPriorities = extractScoringPriorities(category, answers);

  const companyScores = companies.map((company) => {
    const breakdownScores = calculateCompanyScore(company, userPriorities, axes);
    const totalScore = calculateTotalScore(breakdownScores);
    return { company, breakdownScores, totalScore };
  });

  companyScores.sort((a, b) => b.totalScore - a.totalScore);

  const recommendations: Recommendation[] = companyScores.slice(0, 2).map((item, index) => {
    const rank = (index + 1) as 1 | 2;
    const topAxis = Object.entries(item.breakdownScores).sort(([, a], [, b]) => b - a)[0];

    const reasoning = generateRecommendationReason(
      category,
      item.company.id,
      item.company.name,
      rank,
      item.totalScore,
      {
        axis: topAxis[0],
        label: axes[topAxis[0]]?.label || '',
        value: topAxis[1],
      },
      answers,
      item.breakdownScores,
      axes,
      userPriorities
    );

    const suffixMap: Record<InsuranceCategory, string> = {
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
    return {
      rank,
      companyId: item.company.id,
      companyName: item.company.name,
      productName: `${item.company.name} ${suffixMap[category] || '保険'}`,
      estimatedPremium: isLifeCategory ? '保険料（目安）月額 ￥3,000～' : '保険料（目安）月額 ￥4,500～',
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
export function getScoringAxes(category: InsuranceCategory) {
  return scoringAxesByCategory[category] || scoringAxesByCategory.auto;
}
