import { Question } from '@/types';

export const autoInsuranceQuestions: Question[] = [
  {
    step: 1,
    question: '年齢条件をお選びください。',
    type: 'single-select',
    tip: 'この情報は保険料に大きく影響するため重要です。',
    options: [
      {
        id: 'age-18-20',
        label: '18～20歳',
        score: { 'accident-risk': 3, 'service-priority': 0 },
      },
      {
        id: 'age-21-25',
        label: '21～25歳',
        score: { 'accident-risk': 2, 'service-priority': 1 },
      },
      {
        id: 'age-26-34',
        label: '26～34歳',
        score: { 'accident-risk': 1, 'service-priority': 2 },
      },
      {
        id: 'age-60+',
        label: '60歳以上',
        score: { 'accident-risk': 2, 'service-priority': 4 },
      },
    ],
  },
  {
    step: 2,
    question: 'あなたの運転パターンに最も近いものを選んでください。',
    type: 'single-select',
    tip: '使用目的により保険料が異なります。',
    options: [
      {
        id: 'business',
        label: '業務使用',
        score: { 'accident-risk': 3, 'usage-rate': 3 },
      },
      {
        id: 'commute',
        label: '通勤・通学使用',
        score: { 'accident-risk': 2, 'usage-rate': 2 },
      },
      {
        id: 'leisure',
        label: '日常・レジャー使用',
        score: { 'accident-risk': 1, 'usage-rate': 1 },
      },
    ],
  },
  {
    step: 3,
    question: '実際に車を運転する方は何人ですか？',
    type: 'single-select',
    tip: '複数ドライバーの管理方法に影響します。',
    options: [
      {
        id: 'solo',
        label: '本人のみ（限定特約の対象）',
        score: { 'driver-management': 0 },
      },
      {
        id: 'couple',
        label: '本人＋配偶者（配偶者特約の対象）',
        score: { 'driver-management': 1 },
      },
      {
        id: 'family',
        label: '本人＋配偶者＋成人の子ども',
        score: { 'driver-management': 2 },
      },
      {
        id: 'multi',
        label: '本人＋同居の親や複数の家族',
        score: { 'driver-management': 3 },
      },
    ],
  },
  {
    step: 4,
    question: '過去3年間の事故経歴をお聞きします。',
    type: 'single-select',
    tip: '等級制度と割引に大きく影響します。',
    options: [
      {
        id: 'none',
        label: '事故なし（優良ドライバー）',
        score: { 'accident-history': 0, 'discount-eligible': 5 },
      },
      {
        id: 'property-one',
        label: '物損事故のみ（1件）',
        score: { 'accident-history': 1, 'discount-eligible': 3 },
      },
      {
        id: 'property-multi',
        label: '物損事故複数件（2件以上）',
        score: { 'accident-history': 2, 'discount-eligible': 1 },
      },
      {
        id: 'injury',
        label: '人身事故経験あり',
        score: { 'accident-history': 3, 'discount-eligible': 0 },
      },
    ],
  },
  {
    step: 5,
    question: '加入する車はどのような車ですか？',
    type: 'single-select',
    tip: '車種により保険会社の取り扱いが異なります。',
    options: [
      {
        id: 'standard',
        label: '普通乗用車（セダン・SUV）',
        score: { 'vehicle-category': 0 },
      },
      {
        id: 'light',
        label: '軽自動車',
        score: { 'vehicle-category': 1 },
      },
      {
        id: 'commercial',
        label: '商用車・トラック（事業中心利用）',
        score: { 'vehicle-category': 2 },
      },
      {
        id: 'highvalue',
        label: '高額車両（500万円以上含む）',
        score: { 'vehicle-category': 3 },
      },
    ],
  },
  {
    step: 6,
    question: 'あなたが重視する補償内容を、優先順位で選んでください。',
    type: 'multi-select',
    tip: 'この質問が最もスコアリング上重要です。上位3つを選択してください。',
    options: [
      {
        id: 'accident-response',
        label: '事故対応の丁寧さ・スピード（対応力重視）',
        score: { 'accident-response-priority': 5 },
      },
      {
        id: 'cost',
        label: '保険料の安さ（コスト重視）',
        score: { 'cost-priority': 5 },
      },
      {
        id: 'lawyer-fee',
        label: '弁護士費用特約の充実度',
        score: { 'lawyer-fee-priority': 5 },
      },
      {
        id: 'roadside-service',
        label: 'ロードサービス・24時間サポート（安心重視）',
        score: { 'roadside-service-priority': 5 },
      },
      {
        id: 'digital',
        label: 'デジタル対応・オンライン手続き（利便性重視）',
        score: { 'digital-priority': 5 },
      },
      {
        id: 'rental-car',
        label: 'レンタカー・代車費用特約',
        score: { 'rental-car-priority': 5 },
      },
    ],
  },
  {
    step: 7,
    question: '保険加入時の相談方式をどのようにされたいですか？',
    type: 'single-select',
    tip: '代理店ネットワークやデジタル対応の充実度に関連します。',
    options: [
      {
        id: 'face-to-face',
        label: '対面で代理店スタッフに相談したい（信頼性重視）',
        score: { 'counseling-preference': 3 },
      },
      {
        id: 'online',
        label: 'オンライン（チャット・Zoom）で相談したい（手軽さ重視）',
        score: { 'counseling-preference': 1 },
      },
      {
        id: 'web-self',
        label: 'Webで自分で見積・加入したい（独立性重視）',
        score: { 'counseling-preference': 2 },
      },
      {
        id: 'no-preference',
        label: '特にこだわらない',
        score: { 'counseling-preference': 0 },
      },
    ],
  },
  {
    step: 8,
    question: '以下の付加サービスにご関心はありますか？',
    type: 'multi-select',
    tip: '複数選択可能です。関心のあるものをお選びください。',
    options: [
      {
        id: 'health-check',
        label: '健康診断・運転能力診断（無料受診）',
        score: { 'added-value-interest': 1 },
      },
      {
        id: 'safe-driving-app',
        label: '自動運転支援アプリ（安全運転でポイント還元）',
        score: { 'added-value-interest': 1 },
      },
      {
        id: 'driving-analysis',
        label: '走行データ分析（リアルタイム安全アドバイス）',
        score: { 'added-value-interest': 1 },
      },
      {
        id: 'none',
        label: '特になし',
        score: { 'added-value-interest': 0 },
      },
    ],
  },
 ];

export const fireInsuranceQuestions: Question[] = [
  {
    step: 1,
    question: '加入する建物の種別をお選びください。',
    type: 'single-select',
    tip: '建物の種類により対応商品が異なります。',
    options: [
      { id: 'house', label: '戸建て（一戸建て住宅・持家）' },
      { id: 'apartment', label: 'マンション（分譲マンション・持家）' },
      { id: 'rental', label: '賃貸住宅（アパート・賃貸マンション）' },
      { id: 'mixed', label: '併用住宅（住宅＋店舗等）' },
    ],
  },
  {
    step: 2,
    question: '建物の築年数はどのくらいですか？',
    type: 'single-select',
    tip: '築年数が古いほどリスクが上がり、保険料に影響します。',
    options: [
      { id: 'under-5', label: '5年未満（新築・新しい）' },
      { id: '5-15', label: '5～15年' },
      { id: '15-30', label: '15～30年' },
      { id: 'over-30', label: '30年以上（老朽化懸念）' },
    ],
  },
  {
    step: 3,
    question: '保険で守りたい対象物をお選びください。',
    type: 'single-select',
    tip: '建物・家財のどちらを重視するか教えてください。',
    options: [
      { id: 'building-only', label: '建物のみ（家の躯体・構造体）' },
      { id: 'furniture-only', label: '家財のみ（家具・家電・衣類等）' },
      { id: 'both', label: '建物＋家財（両方）' },
      { id: 'includes-business', label: '什器備品や商品も含む' },
    ],
  },
  {
    step: 4,
    question: '補償してほしい災害をお選びください（複選、上位2つ）。',
    type: 'multi-select',
    tip: '主に発生しやすい災害を選択してください。',
    options: [
      { id: 'flood', label: '豪雨・洪水・内水氾濫（床上浸水等）' },
      { id: 'hail', label: '雹（ひょう）による被害（屋根・窓被害）' },
      { id: 'snow', label: '雪害（積雪による重み）' },
      { id: 'landslide', label: '土砂崩れ' },
      { id: 'earthquake', label: '地震（別途地震保険が必要）' },
      { id: 'typhoon', label: '台風（高風）' },
      { id: 'theft', label: '盗難' },
    ],
  },
  {
    step: 5,
    question: '建物の構造と防火対策をお答えください。',
    type: 'single-select',
    tip: '構造や防火設備で保険料に割引があります。',
    options: [
      { id: 'wood-low', label: '木造・防火性低い' },
      { id: 'wood-mid', label: '木造・防火対策あり（火災警報器等）' },
      { id: 'steel', label: '鉄骨造・防火性中程度' },
      { id: 'concrete-high', label: '鉄筋コンクリート造・防火性高い' },
    ],
  },
  {
    step: 6,
    question: 'あなたが重視する補償をお選びください（上位3つ）。',
    type: 'multi-select',
    tip: '優先順位をつけてください。',
    options: [
      { id: 'basic-coverage', label: '基本補償を手厚く（火災・破裂爆発・落雷）' },
      { id: 'water-damage', label: '水災補償を厚く（豪雨・洪水対応）' },
      { id: 'theft', label: '盗難補償を追加したい' },
      { id: 'breakage', label: '破損・汚損補償を追加したい' },
      { id: 'cost', label: '保険料の安さ（基本補償に限定）' },
      { id: 'custom', label: '特約の豊富さ（カスタマイズ重視）' },
      { id: 'earthquake', label: '地震補償を厚くしたい（東京海上の超保険）' },
    ],
  },
  {
    step: 7,
    question: '火災保険の契約期間をどのようにお考えですか？',
    type: 'single-select',
    tip: '長期契約で割引がある場合があります。',
    options: [
      { id: '1year', label: '1年契約（毎年更新）' },
      { id: '2-3years', label: '2～3年契約' },
      { id: '5years', label: '5年契約（長期割引がある）' },
      { id: '10years+', label: '10年以上（最長期間）' },
    ],
  },
  {
    step: 8,
    question: '加入時と加入後のサービスについてお聞きします。',
    type: 'single-select',
    tip: '相談方式や損害サービスに関する質問です。',
    options: [
      { id: 'face-to-face', label: '対面で代理店に相談し、提案を受けたい' },
      { id: 'online', label: 'オンラインで見積・加入したい（簡単）' },
      { id: 'claim-first', label: '損害サービスの充実度が最優先' },
      { id: 'noPreference', label: '特にこだわらない' },
    ],
  },
];

export const liabilityInsuranceQuestions: Question[] = [
  {
    step: 1,
    question: '補償してほしい主な補償対象をお選びください。',
    type: 'single-select',
    tip: '日常生活のリスクの中で最も関心のある対象を選んでください。',
    options: [
      { id: 'daily-life', label: '日常生活での事故（物を壊した、けがさせた等）' },
      { id: 'sports-hobby', label: '趣味・スポーツ活動での事故' },
      { id: 'pet', label: 'ペット飼育による事故（ペットが他人に害を加えた）' },
      { id: 'all', label: 'すべてカバーしたい' },
    ],
  },
  {
    step: 2,
    question: 'ご自身の居住エリアと賠償リスク意識をお答えください。',
    type: 'single-select',
    tip: '都市部は訴訟リスク、地方は物損リスクが異なります。',
    options: [
      { id: 'urban', label: '都市部（東京・大阪等）- 訴訟リスク高' },
      { id: 'residential', label: '住宅地 - 標準的なリスク' },
      { id: 'rural', label: '地方 - リスク低い' },
      { id: 'high-risk', label: 'テーマパーク、遊園地によく行く - リスク高' },
    ],
  },
  {
    step: 3,
    question: 'ご同居のご家族は何人ですか？',
    type: 'single-select',
    tip: 'ご家族が増えるほど、事故リスクが上がります。',
    options: [
      { id: 'solo', label: '1人（ご本人のみ）' },
      { id: 'couple', label: '2人（ご本人＋配偶者）' },
      { id: 'family-3', label: '3人以上（お子さん含む）' },
      { id: 'multigenerational', label: 'こんな住んでいる（祖父母等含む）' },
    ],
  },
  {
    step: 4,
    question: 'あなたの趣味・スポーツ活動のレベルをお答えください。',
    type: 'single-select',
    tip: 'アクティブな趣味はリスク評価に影響します。',
    options: [
      { id: 'passive', label: 'あまり活動しない（観賞系、読書等）' },
      { id: 'moderate', label: '月1-2回程度のスポーツ・アウトドア' },
      { id: 'active', label: '週1回以上のアクティブなスポーツ' },
      { id: 'professional', label: 'セミプロ・競技レベルのスポーツ' },
    ],
  },
  {
    step: 5,
    question: 'あなたが重視する補償内容を、優先順位で選んでください（上位3つ）。',
    type: 'multi-select',
    tip: '賠償責任保険に期待する主な機能を選択してください。',
    options: [
      { id: 'coverage-limit', label: '補償額の手厚さ（1億円以上）' },
      { id: 'cost', label: '保険料の安さ' },
      { id: 'personal-injury', label: 'ご自身のケガも補償する特約' },
      { id: 'legal-support', label: 'トラブル時の法律相談・弁護士委任' },
      { id: 'quick-settlement', label: 'スピード示談' },
      { id: 'custom', label: 'カスタマイズの自由度' },
    ],
  },
  {
    step: 6,
    question: '保険加入時の相談方式をどのようにされたいですか？',
    type: 'single-select',
    tip: 'ご希望の相談方法を選択してください。',
    options: [
      { id: 'face-to-face', label: '対面で代理店スタッフに相談したい' },
      { id: 'online', label: 'オンライン（チャット・Zoom）で相談したい' },
      { id: 'web-self', label: 'Webで自分で見積・加入したい' },
      { id: 'no-preference', label: '特にこだわらない' },
    ],
  },
  {
    step: 7,
    question: '年間の保険料予算はおおよそどのくらい想定していますか？',
    type: 'single-select',
    tip: '予算で対応商品が絞られる場合があります。',
    options: [
      { id: 'budget-1k', label: '月額1,000円程度（年間1万2千円）' },
      { id: 'budget-2k', label: '月額2,000円程度（年間2万4千円）' },
      { id: 'budget-3k', label: '月額3,000円程度（年間3万6千円）' },
      { id: 'unlimited', label: '予算はこうわらない - 内容重視' },
    ],
  },
];

export const injuryInsuranceQuestions: Question[] = [
  {
    step: 1,
    question: 'あなたのご職業をお選びください。',
    type: 'single-select',
    tip: '職業によってリスク評価が異なります。',
    options: [
      { id: 'office', label: 'オフィスワーク（事務、営業等）' },
      { id: 'service', label: 'サービス業（飲食、小売、ホテル等）' },
      { id: 'construction', label: '建設・製造業（現場作業）' },
      { id: 'dangerous', label: '危険作業（鉱業、爆発物取扱い等）' },
      { id: 'other', label: 'その他' },
    ],
  },
  {
    step: 2,
    question: 'あなたの就業形態をお選びください。',
    type: 'single-select',
    tip: '就業形態によって保険対象が決まります。',
    options: [
      { id: 'employed', label: '正社員・常勤職員' },
      { id: 'part-time', label: 'パート・アルバイト' },
      { id: 'self-employed', label: '自営業・個人事業主' },
      { id: 'freelance', label: 'フリーランス' },
      { id: 'unemployed', label: '無職・学生' },
    ],
  },
  {
    step: 3,
    question: '仕事内容のリスクレベルをお答えください。',
    type: 'single-select',
    tip: 'リスクが高いほど保険料が上がる可能性があります。',
    options: [
      { id: 'low', label: '低リスク（デスクワーク中心）' },
      { id: 'moderate', label: '中程度（出張、営業活動含む）' },
      { id: 'high', label: '高リスク（機械操作、重量物取扱い等）' },
      { id: 'very-high', label: '非常に高リスク（危険物等）' },
    ],
  },
  {
    step: 4,
    question: '入院が発生した場合の給付金日額ニーズは？',
    type: 'single-select',
    tip: '給付日額が高いほど安心ですが、保険料も上がります。',
    options: [
      { id: '5000', label: '5,000円/日' },
      { id: '10000', label: '10,000円/日' },
      { id: '20000', label: '20,000円/日' },
      { id: '30000+', label: '30,000円以上/日' },
    ],
  },
  {
    step: 5,
    question: 'あなたが重視する特約・補償をお選びください（上位3つ）。',
    type: 'multi-select',
    tip: '優先度をつけて選択してください。',
    options: [
      { id: 'hospitalization', label: '入院・手術補償の手厚さ' },
      { id: 'occupational', label: '職業病補償（業務関連疾病）' },
      { id: 'life-insurance', label: '死亡時の保障（一時金）' },
      { id: 'recovery', label: 'リハビリ費用特約' },
      { id: 'cost', label: '保険料の安さ' },
      { id: 'service', label: 'サポート・相談サービス' },
    ],
  },
  {
    step: 6,
    question: '年間の保険料予算をどのように想定していますか？',
    type: 'single-select',
    tip: '予算で商品選択肢が限定される場合があります。',
    options: [
      { id: 'budget-500', label: '月額500円程度（年間6千円）' },
      { id: 'budget-1k', label: '月額1,000円程度（年間1万2千円）' },
      { id: 'budget-2k', label: '月額2,000円程度（年間2万4千円）' },
      { id: 'unlimited', label: '予算はこうわらない - 内容重視' },
    ],
  },
  {
    step: 7,
    question: '保険加入時の相談方式をどのようにされたいですか？',
    type: 'single-select',
    tip: 'ご希望のサポート方法を選択してください。',
    options: [
      { id: 'face-to-face', label: '対面で代理店スタッフに相談したい' },
      { id: 'online', label: 'オンライン（チャット・Zoom）で相談したい' },
      { id: 'web-self', label: 'Webで自分で見積・加入したい' },
      { id: 'no-preference', label: '特にこだわらない' },
    ],
  },
];

// 定期保険の質問
export const termInsuranceQuestions: Question[] = [
  {
    step: 1,
    question: '現在の年齢をお選びください。',
    type: 'single-select',
    tip: '年齢により保険料や加入可能なプランが異なります。',
    options: [
      { id: '20-29', label: '20～29歳' },
      { id: '30-39', label: '30～39歳' },
      { id: '40-49', label: '40～49歳' },
      { id: '50-59', label: '50～59歳' },
      { id: '60-plus', label: '60歳以上' },
    ],
  },
  {
    step: 2,
    question: 'ご家族構成をお選びください。',
    type: 'single-select',
    tip: '必要な保障額の目安に影響します。',
    options: [
      { id: 'single', label: '独身' },
      { id: 'married-no-child', label: '既婚（子供なし）' },
      { id: 'married-child', label: '既婚（子供あり）' },
      { id: 'single-parent', label: 'シングルペアレント' },
    ],
  },
  {
    step: 3,
    question: '希望する保障期間をお選びください。',
    type: 'single-select',
    tip: '保障期間により保険料が変わります。',
    options: [
      { id: '10years', label: '10年' },
      { id: '20years', label: '20年' },
      { id: '30years', label: '30年' },
      { id: 'until-60', label: '60歳まで' },
      { id: 'until-65', label: '65歳まで' },
    ],
  },
  {
    step: 4,
    question: '希望する死亡保障額をお選びください。',
    type: 'single-select',
    tip: '遺族の生活費や教育費を考慮して選びましょう。',
    options: [
      { id: '10m', label: '1,000万円' },
      { id: '20m', label: '2,000万円' },
      { id: '30m', label: '3,000万円' },
      { id: '50m', label: '5,000万円以上' },
    ],
  },
  {
    step: 5,
    question: '重視するポイントを選んでください（最大3つ）。',
    type: 'multi-select',
    tip: '優先順位の高いものから選んでください。',
    options: [
      { id: 'cost', label: '保険料の安さ' },
      { id: 'coverage', label: '保障の手厚さ' },
      { id: 'convertible', label: '終身保険への変換' },
      { id: 'claim-handling', label: '給付金支払い対応' },
      { id: 'digital', label: 'オンライン手続き' },
      { id: 'counseling', label: '相談サポート' },
    ],
  },
  {
    step: 6,
    question: '月々の保険料予算をお選びください。',
    type: 'single-select',
    tip: '継続的に支払える金額を選びましょう。',
    options: [
      { id: 'under-3k', label: '3,000円未満' },
      { id: '3k-5k', label: '3,000～5,000円' },
      { id: '5k-10k', label: '5,000～10,000円' },
      { id: 'over-10k', label: '10,000円以上' },
    ],
  },
  {
    step: 7,
    question: '相談方式の希望をお選びください。',
    type: 'single-select',
    tip: '対面相談かオンライン相談か選べます。',
    options: [
      { id: 'face-to-face', label: '対面相談希望' },
      { id: 'online', label: 'オンライン相談希望' },
      { id: 'app', label: 'アプリで完結したい' },
      { id: 'no-preference', label: '特にこだわらない' },
    ],
  },
];

// 終身保険の質問
export const wholeInsuranceQuestions: Question[] = [
  {
    step: 1,
    question: '現在の年齢をお選びください。',
    type: 'single-select',
    tip: '年齢により保険料が大きく異なります。',
    options: [
      { id: '20-29', label: '20～29歳' },
      { id: '30-39', label: '30～39歳' },
      { id: '40-49', label: '40～49歳' },
      { id: '50-59', label: '50～59歳' },
      { id: '60-plus', label: '60歳以上' },
    ],
  },
  {
    step: 2,
    question: '終身保険の主な目的をお選びください。',
    type: 'single-select',
    tip: '目的に応じた商品選びが重要です。',
    options: [
      { id: 'death-benefit', label: '死亡保障（家族への備え）' },
      { id: 'savings', label: '貯蓄・資産形成' },
      { id: 'inheritance', label: '相続対策' },
      { id: 'funeral', label: '葬儀費用の準備' },
    ],
  },
  {
    step: 3,
    question: '保険料の払込期間をお選びください。',
    type: 'single-select',
    tip: '払込期間が短いほど月々の保険料は高くなります。',
    options: [
      { id: 'pay-60', label: '60歳払込満了' },
      { id: 'pay-65', label: '65歳払込満了' },
      { id: 'pay-70', label: '70歳払込満了' },
      { id: 'lifetime', label: '終身払い' },
    ],
  },
  {
    step: 4,
    question: '希望する死亡保障額をお選びください。',
    type: 'single-select',
    tip: '目的に応じた保障額を選びましょう。',
    options: [
      { id: '2m', label: '200万円' },
      { id: '5m', label: '500万円' },
      { id: '10m', label: '1,000万円' },
      { id: 'over-10m', label: '1,000万円以上' },
    ],
  },
  {
    step: 5,
    question: '重視するポイントを選んでください（最大3つ）。',
    type: 'multi-select',
    tip: '優先順位の高いものから選んでください。',
    options: [
      { id: 'return-rate', label: '解約返戻金の返戻率' },
      { id: 'claim-handling', label: '給付金支払い対応' },
      { id: 'cost', label: '保険料の安さ' },
      { id: 'reputation', label: '会社の信頼性・実績' },
      { id: 'digital', label: 'オンライン手続き' },
      { id: 'counseling', label: '相談サポート' },
    ],
  },
  {
    step: 6,
    question: '月々の保険料予算をお選びください。',
    type: 'single-select',
    tip: '継続的に支払える金額を選びましょう。',
    options: [
      { id: 'under-10k', label: '10,000円未満' },
      { id: '10k-20k', label: '10,000～20,000円' },
      { id: '20k-30k', label: '20,000～30,000円' },
      { id: 'over-30k', label: '30,000円以上' },
    ],
  },
  {
    step: 7,
    question: '相談方式の希望をお選びください。',
    type: 'single-select',
    tip: '対面相談かオンライン相談か選べます。',
    options: [
      { id: 'face-to-face', label: '対面相談希望' },
      { id: 'online', label: 'オンライン相談希望' },
      { id: 'app', label: 'アプリで完結したい' },
      { id: 'no-preference', label: '特にこだわらない' },
    ],
  },
];

// 医療保険の質問
export const medicalInsuranceQuestions: Question[] = [
  {
    step: 1,
    question: '現在の年齢をお選びください。',
    type: 'single-select',
    tip: '年齢により保険料が異なります。',
    options: [
      { id: '20-29', label: '20～29歳' },
      { id: '30-39', label: '30～39歳' },
      { id: '40-49', label: '40～49歳' },
      { id: '50-59', label: '50～59歳' },
      { id: '60-plus', label: '60歳以上' },
    ],
  },
  {
    step: 2,
    question: '現在の健康状態をお選びください。',
    type: 'single-select',
    tip: '健康状態により加入できる商品が変わります。',
    options: [
      { id: 'healthy', label: '健康（持病なし）' },
      { id: 'minor-condition', label: '軽度の持病あり' },
      { id: 'chronic', label: '慢性疾患あり（通院中）' },
      { id: 'history', label: '過去に大きな病気あり' },
    ],
  },
  {
    step: 3,
    question: '入院給付金日額をお選びください。',
    type: 'single-select',
    tip: '一般的に5,000～10,000円が目安です。',
    options: [
      { id: '3000', label: '3,000円/日' },
      { id: '5000', label: '5,000円/日' },
      { id: '10000', label: '10,000円/日' },
      { id: '15000', label: '15,000円/日以上' },
    ],
  },
  {
    step: 4,
    question: '保障期間をお選びください。',
    type: 'single-select',
    tip: '終身保障は保険料が変わりません。',
    options: [
      { id: 'term-10', label: '定期（10年更新型）' },
      { id: 'until-80', label: '80歳まで' },
      { id: 'lifetime', label: '終身保障' },
    ],
  },
  {
    step: 5,
    question: '重視するポイントを選んでください（最大3つ）。',
    type: 'multi-select',
    tip: '優先順位の高いものから選んでください。',
    options: [
      { id: 'hospitalization', label: '入院保障の充実' },
      { id: 'surgery', label: '手術保障の充実' },
      { id: 'outpatient', label: '通院保障' },
      { id: 'advanced-medical', label: '先進医療保障' },
      { id: 'cost', label: '保険料の安さ' },
      { id: 'claim-handling', label: '給付金支払い対応' },
    ],
  },
  {
    step: 6,
    question: '月々の保険料予算をお選びください。',
    type: 'single-select',
    tip: '継続的に支払える金額を選びましょう。',
    options: [
      { id: 'under-2k', label: '2,000円未満' },
      { id: '2k-5k', label: '2,000～5,000円' },
      { id: '5k-10k', label: '5,000～10,000円' },
      { id: 'over-10k', label: '10,000円以上' },
    ],
  },
  {
    step: 7,
    question: '相談方式の希望をお選びください。',
    type: 'single-select',
    tip: '対面相談かオンライン相談か選べます。',
    options: [
      { id: 'face-to-face', label: '対面相談希望' },
      { id: 'online', label: 'オンライン相談希望' },
      { id: 'app', label: 'アプリで完結したい' },
      { id: 'no-preference', label: '特にこだわらない' },
    ],
  },
];

// がん保険の質問
export const cancerInsuranceQuestions: Question[] = [
  {
    step: 1,
    question: '現在の年齢をお選びください。',
    type: 'single-select',
    tip: '年齢により保険料が異なります。',
    options: [
      { id: '20-29', label: '20～29歳' },
      { id: '30-39', label: '30～39歳' },
      { id: '40-49', label: '40～49歳' },
      { id: '50-59', label: '50～59歳' },
      { id: '60-plus', label: '60歳以上' },
    ],
  },
  {
    step: 2,
    question: 'がん保険加入の主な目的をお選びください。',
    type: 'single-select',
    tip: '目的に応じた商品選びが重要です。',
    options: [
      { id: 'diagnosis-lump', label: '診断一時金の確保' },
      { id: 'treatment-cost', label: '治療費の補填' },
      { id: 'income-loss', label: '収入減少への備え' },
      { id: 'family-history', label: '家族歴があるため' },
    ],
  },
  {
    step: 3,
    question: '診断一時金の希望額をお選びください。',
    type: 'single-select',
    tip: 'がん診断時に一括で受け取れる金額です。',
    options: [
      { id: '500k', label: '50万円' },
      { id: '1m', label: '100万円' },
      { id: '2m', label: '200万円' },
      { id: '3m-plus', label: '300万円以上' },
    ],
  },
  {
    step: 4,
    question: '上皮内新生物（初期がん）の保障をお選びください。',
    type: 'single-select',
    tip: '初期がんも保障対象にするかどうかです。',
    options: [
      { id: 'full', label: '悪性新生物と同額保障' },
      { id: 'half', label: '悪性新生物の半額保障' },
      { id: 'none', label: '保障不要' },
    ],
  },
  {
    step: 5,
    question: '重視するポイントを選んでください（最大3つ）。',
    type: 'multi-select',
    tip: '優先順位の高いものから選んでください。',
    options: [
      { id: 'diagnosis-benefit', label: '診断給付金の充実' },
      { id: 'treatment-benefit', label: '治療給付金の充実' },
      { id: 'advanced-medical', label: '先進医療保障' },
      { id: 'recurrence', label: '再発・転移の保障' },
      { id: 'cost', label: '保険料の安さ' },
      { id: 'claim-handling', label: '給付金支払い対応' },
    ],
  },
  {
    step: 6,
    question: '月々の保険料予算をお選びください。',
    type: 'single-select',
    tip: '継続的に支払える金額を選びましょう。',
    options: [
      { id: 'under-2k', label: '2,000円未満' },
      { id: '2k-5k', label: '2,000～5,000円' },
      { id: '5k-10k', label: '5,000～10,000円' },
      { id: 'over-10k', label: '10,000円以上' },
    ],
  },
  {
    step: 7,
    question: '相談方式の希望をお選びください。',
    type: 'single-select',
    tip: '対面相談かオンライン相談か選べます。',
    options: [
      { id: 'face-to-face', label: '対面相談希望' },
      { id: 'online', label: 'オンライン相談希望' },
      { id: 'app', label: 'アプリで完結したい' },
      { id: 'no-preference', label: '特にこだわらない' },
    ],
  },
];

// 年金保険の質問
export const annuityInsuranceQuestions: Question[] = [
  {
    step: 1,
    question: '年金保険に加入する主な目的は何ですか？',
    type: 'single-select',
    tip: '老後の生活資金準備が主な目的です。',
    options: [
      { id: 'retirement', label: '老後の生活資金の準備' },
      { id: 'supplement', label: '公的年金の補完' },
      { id: 'tax-saving', label: '節税対策（個人年金保険料控除）' },
      { id: 'inheritance', label: '相続対策・資産承継' },
    ],
  },
  {
    step: 2,
    question: '年金の受取開始希望時期はいつですか？',
    type: 'single-select',
    tip: '一般的には60歳または65歳からの受取が多いです。',
    options: [
      { id: '55', label: '55歳から' },
      { id: '60', label: '60歳から' },
      { id: '65', label: '65歳から' },
      { id: '70', label: '70歳以降' },
    ],
  },
  {
    step: 3,
    question: '年金の受取期間の希望をお選びください。',
    type: 'single-select',
    tip: '終身年金は長生きリスクに対応できます。',
    options: [
      { id: '5-year', label: '5年確定年金' },
      { id: '10-year', label: '10年確定年金' },
      { id: '15-year', label: '15年確定年金' },
      { id: 'lifetime', label: '終身年金（一生涯受取）' },
    ],
  },
  {
    step: 4,
    question: '月々の保険料はどの程度を想定していますか？',
    type: 'single-select',
    tip: '無理のない範囲で長期継続できる金額を選びましょう。',
    options: [
      { id: 'under-10k', label: '1万円未満' },
      { id: '10k-20k', label: '1万円～2万円' },
      { id: '20k-30k', label: '2万円～3万円' },
      { id: 'over-30k', label: '3万円以上' },
    ],
  },
  {
    step: 5,
    question: '年金保険のタイプをお選びください。',
    type: 'single-select',
    tip: '外貨建ては為替リスクがありますが、運用利回りが高い傾向があります。',
    options: [
      { id: 'yen-fixed', label: '円建て・定額型（安定重視）' },
      { id: 'yen-variable', label: '円建て・変額型（運用重視）' },
      { id: 'foreign-usd', label: '外貨建て（米ドル）' },
      { id: 'foreign-aud', label: '外貨建て（豪ドル）' },
    ],
  },
];

// 変額保険の質問
export const variableInsuranceQuestions: Question[] = [
  {
    step: 1,
    question: '変額保険に加入する主な目的は何ですか？',
    type: 'single-select',
    tip: '変額保険は保障と資産運用を兼ね備えた商品です。',
    options: [
      { id: 'investment', label: '資産運用・資産形成' },
      { id: 'protection-plus', label: '死亡保障＋運用' },
      { id: 'retirement', label: '老後資金の準備' },
      { id: 'education', label: '教育資金の準備' },
    ],
  },
  {
    step: 2,
    question: '投資経験についてお聞かせください。',
    type: 'single-select',
    tip: '変額保険は投資リスクを伴うため、経験に応じた商品選びが重要です。',
    options: [
      { id: 'none', label: '投資経験なし' },
      { id: 'beginner', label: '投資信託など少し経験あり' },
      { id: 'intermediate', label: '株式投資など経験あり' },
      { id: 'advanced', label: '積極的に投資している' },
    ],
  },
  {
    step: 3,
    question: 'リスク許容度をお選びください。',
    type: 'single-select',
    tip: '元本割れリスクをどの程度許容できるかがポイントです。',
    options: [
      { id: 'low', label: '低リスク（元本重視）' },
      { id: 'medium-low', label: 'やや低リスク' },
      { id: 'medium-high', label: 'やや高リスク（リターン重視）' },
      { id: 'high', label: '高リスク（積極運用）' },
    ],
  },
  {
    step: 4,
    question: '運用期間の想定をお選びください。',
    type: 'single-select',
    tip: '長期運用ほどリスクが分散される傾向があります。',
    options: [
      { id: 'under-10', label: '10年未満' },
      { id: '10-20', label: '10年～20年' },
      { id: '20-30', label: '20年～30年' },
      { id: 'over-30', label: '30年以上' },
    ],
  },
  {
    step: 5,
    question: '変額保険のタイプをお選びください。',
    type: 'single-select',
    tip: '有期型は満期があり、終身型は一生涯の保障があります。',
    options: [
      { id: 'term-variable', label: '有期型変額保険' },
      { id: 'whole-variable', label: '終身型変額保険' },
      { id: 'variable-annuity', label: '変額個人年金保険' },
      { id: 'unit-linked', label: 'ユニットリンク保険' },
    ],
  },
];

// 養老保険の質問
export const endowmentInsuranceQuestions: Question[] = [
  {
    step: 1,
    question: '養老保険に加入する主な目的は何ですか？',
    type: 'single-select',
    tip: '養老保険は死亡保障と満期保険金の両方を備えた保険です。',
    options: [
      { id: 'maturity', label: '満期時の資金準備（老後資金・まとまった資金）' },
      { id: 'protection', label: '万が一の死亡保障を確保しつつ貯蓄' },
      { id: 'gift', label: '満期金を贈与目的で活用' },
      { id: 'balanced', label: '保障と貯蓄のバランスを重視' },
    ],
  },
  {
    step: 2,
    question: '保険期間（満期）の希望をお選びください。',
    type: 'single-select',
    tip: '一般的に10年～30年の満期が選べます。',
    options: [
      { id: '10years', label: '10年満期' },
      { id: '15years', label: '15年満期' },
      { id: '20years', label: '20年満期' },
      { id: '60age', label: '60歳満期' },
      { id: '65age', label: '65歳満期' },
    ],
  },
  {
    step: 3,
    question: '希望する保険金額をお選びください。',
    type: 'single-select',
    tip: '死亡保険金と満期保険金は同額です。',
    options: [
      { id: '3m', label: '300万円' },
      { id: '5m', label: '500万円' },
      { id: '10m', label: '1,000万円' },
      { id: '20m', label: '2,000万円以上' },
    ],
  },
  {
    step: 4,
    question: '月々の保険料はどの程度を想定していますか？',
    type: 'single-select',
    tip: '養老保険は貯蓄性があるため保険料は高めです。',
    options: [
      { id: 'under-10k', label: '1万円未満' },
      { id: '10k-20k', label: '1万円～2万円' },
      { id: '20k-50k', label: '2万円～5万円' },
      { id: 'over-50k', label: '5万円以上' },
    ],
  },
  {
    step: 5,
    question: '保険料の払込方法をお選びください。',
    type: 'single-select',
    tip: '一時払いは保険料総額が抑えられます。',
    options: [
      { id: 'monthly', label: '月払い' },
      { id: 'yearly', label: '年払い' },
      { id: 'lump-sum', label: '一時払い' },
      { id: 'limited', label: '短期払い（10年など）' },
    ],
  },
];

// こども保険/学資保険の質問
export const educationInsuranceQuestions: Question[] = [
  {
    step: 1,
    question: 'お子さまの現在の年齢をお選びください。',
    type: 'single-select',
    tip: '加入時期が早いほど月々の保険料は抑えられます。',
    options: [
      { id: '0', label: '0歳（出生前加入含む）' },
      { id: '1-3', label: '1～3歳' },
      { id: '4-6', label: '4～6歳' },
      { id: '7-9', label: '7～9歳' },
      { id: '10plus', label: '10歳以上' },
    ],
  },
  {
    step: 2,
    question: '学資金を受け取りたい時期をお選びください。',
    type: 'single-select',
    tip: '大学入学時の18歳受取が一般的です。',
    options: [
      { id: '15', label: '15歳（高校入学時）' },
      { id: '18', label: '18歳（大学入学時）' },
      { id: '18-22', label: '18歳～22歳（分割受取）' },
      { id: '22', label: '22歳（大学卒業時）' },
    ],
  },
  {
    step: 3,
    question: '目標とする学資金総額をお選びください。',
    type: 'single-select',
    tip: '私立大学4年間で約400～500万円が目安です。',
    options: [
      { id: '2m', label: '200万円' },
      { id: '3m', label: '300万円' },
      { id: '5m', label: '500万円' },
      { id: '7m', label: '700万円以上' },
    ],
  },
  {
    step: 4,
    question: '契約者（親）の死亡保障についてお選びください。',
    type: 'single-select',
    tip: '払込免除特約があると万が一の際も学資金が確保できます。',
    options: [
      { id: 'waiver', label: '払込免除特約付き（万が一の際、以後の保険料免除）' },
      { id: 'with-death', label: '死亡保障付き（育英年金付き）' },
      { id: 'savings-only', label: '貯蓄重視（保障なし）' },
      { id: 'basic', label: '基本的な払込免除のみ' },
    ],
  },
  {
    step: 5,
    question: '返戻率（受取総額÷払込総額）の重視度をお選びください。',
    type: 'single-select',
    tip: '返戻率が高いほど貯蓄効率が良いです。',
    options: [
      { id: 'high', label: '返戻率重視（100%以上必須）' },
      { id: 'balance', label: 'バランス重視（95%以上）' },
      { id: 'protection', label: '保障重視（返戻率は気にしない）' },
      { id: 'flexible', label: '柔軟性重視（中途解約しやすい）' },
    ],
  },
];

// 収入保障保険の質問
export const incomeInsuranceQuestions: Question[] = [
  {
    step: 1,
    question: '収入保障保険に加入する主な目的は何ですか？',
    type: 'single-select',
    tip: '遺族の生活費を年金形式で受け取れる保険です。',
    options: [
      { id: 'family-income', label: '遺族の生活費を確保' },
      { id: 'loan', label: '住宅ローン返済の備え' },
      { id: 'education', label: 'こどもの教育費確保' },
      { id: 'all', label: '上記すべてを総合的にカバー' },
    ],
  },
  {
    step: 2,
    question: '毎月の年金受取額の希望をお選びください。',
    type: 'single-select',
    tip: '現在の生活費の7～8割程度が目安です。',
    options: [
      { id: '10m', label: '月額10万円' },
      { id: '15m', label: '月額15万円' },
      { id: '20m', label: '月額20万円' },
      { id: '30m', label: '月額30万円以上' },
    ],
  },
  {
    step: 3,
    question: '保険期間（保障期間）をお選びください。',
    type: 'single-select',
    tip: '一般的にお子さまの独立や定年までを設定します。',
    options: [
      { id: '55', label: '55歳まで' },
      { id: '60', label: '60歳まで' },
      { id: '65', label: '65歳まで' },
      { id: '70', label: '70歳まで' },
    ],
  },
  {
    step: 4,
    question: '年金受取の最低保証期間をお選びください。',
    type: 'single-select',
    tip: '保険期間終了間際に万が一があっても最低保証期間分は受取可能です。',
    options: [
      { id: '1year', label: '1年' },
      { id: '2years', label: '2年' },
      { id: '5years', label: '5年' },
      { id: 'none', label: '最低保証不要' },
    ],
  },
  {
    step: 5,
    question: '受取方法の希望をお選びください。',
    type: 'single-select',
    tip: '年金形式以外に一時金での受取も選べる商品があります。',
    options: [
      { id: 'annuity', label: '年金形式のみ' },
      { id: 'lump-or-annuity', label: '一時金か年金か選択可能' },
      { id: 'combination', label: '一時金＋年金の組み合わせ' },
      { id: 'flexible', label: '状況に応じて柔軟に選びたい' },
    ],
  },
];

// 介護保険の質問
export const nursingInsuranceQuestions: Question[] = [
  {
    step: 1,
    question: '介護保険に加入する主な目的は何ですか？',
    type: 'single-select',
    tip: '公的介護保険を補完し、介護費用の自己負担に備えます。',
    options: [
      { id: 'self-care', label: '自分自身の介護費用に備える' },
      { id: 'family-burden', label: '家族の介護負担を軽減' },
      { id: 'facility', label: '介護施設入所費用の準備' },
      { id: 'home-care', label: '在宅介護の費用に備える' },
    ],
  },
  {
    step: 2,
    question: '給付金の受取条件をお選びください。',
    type: 'single-select',
    tip: '要介護認定の基準は保険会社により異なります。',
    options: [
      { id: 'care-2', label: '要介護2以上で給付' },
      { id: 'care-1', label: '要介護1以上で給付' },
      { id: 'support', label: '要支援でも一部給付' },
      { id: 'company-standard', label: '保険会社独自基準' },
    ],
  },
  {
    step: 3,
    question: '給付金の受取方法をお選びください。',
    type: 'single-select',
    tip: '一時金と年金の組み合わせが一般的です。',
    options: [
      { id: 'lump-sum', label: '一時金のみ' },
      { id: 'annuity', label: '年金形式（毎月受取）' },
      { id: 'combination', label: '一時金＋年金' },
      { id: 'flexible', label: '状況に応じて選択' },
    ],
  },
  {
    step: 4,
    question: '希望する保険金額をお選びください。',
    type: 'single-select',
    tip: '介護施設の入所一時金は300万円～500万円程度が目安です。',
    options: [
      { id: '3m', label: '一時金300万円程度' },
      { id: '5m', label: '一時金500万円程度' },
      { id: '10m', label: '一時金1,000万円程度' },
      { id: 'annuity-10', label: '年金月額10万円程度' },
    ],
  },
  {
    step: 5,
    question: '保険期間をお選びください。',
    type: 'single-select',
    tip: '介護リスクは高齢になるほど高まります。',
    options: [
      { id: 'lifetime', label: '終身（一生涯）' },
      { id: '80', label: '80歳まで' },
      { id: '90', label: '90歳まで' },
      { id: 'term', label: '10年・20年などの定期' },
    ],
  },
];

// 就業不能保険の質問
export const disabilityInsuranceQuestions: Question[] = [
  {
    step: 1,
    question: '就業不能保険に加入する主な目的は何ですか？',
    type: 'single-select',
    tip: '病気やケガで働けなくなった場合の収入減に備えます。',
    options: [
      { id: 'income-loss', label: '収入減少への備え' },
      { id: 'loan', label: '住宅ローン返済の継続' },
      { id: 'family', label: '家族の生活費確保' },
      { id: 'all', label: '上記すべて' },
    ],
  },
  {
    step: 2,
    question: '月々の給付金額の希望をお選びください。',
    type: 'single-select',
    tip: '現在の手取り月収の50～70%程度が目安です。',
    options: [
      { id: '10m', label: '月額10万円' },
      { id: '15m', label: '月額15万円' },
      { id: '20m', label: '月額20万円' },
      { id: '30m', label: '月額30万円以上' },
    ],
  },
  {
    step: 3,
    question: '就業不能の認定基準をお選びください。',
    type: 'single-select',
    tip: '精神疾患の対象有無は商品により異なります。',
    options: [
      { id: 'wide', label: '幅広くカバー（精神疾患含む）' },
      { id: 'physical', label: '身体的な病気・ケガのみ' },
      { id: 'severe', label: '重度の就業不能のみ' },
      { id: 'flexible', label: '複数の基準から選びたい' },
    ],
  },
  {
    step: 4,
    question: '給付金の支払い開始時期をお選びください。',
    type: 'single-select',
    tip: '免責期間が長いほど保険料は安くなります。',
    options: [
      { id: '60days', label: '60日経過後' },
      { id: '90days', label: '90日経過後' },
      { id: '180days', label: '180日経過後' },
      { id: 'immediate', label: '即時（免責なし）' },
    ],
  },
  {
    step: 5,
    question: '保険期間をお選びください。',
    type: 'single-select',
    tip: '働いている期間をカバーする設定が一般的です。',
    options: [
      { id: '60', label: '60歳まで' },
      { id: '65', label: '65歳まで' },
      { id: '70', label: '70歳まで' },
      { id: 'term-10', label: '10年更新型' },
    ],
  },
];

export const questionsByCategory: Record<string, Question[]> = {
  auto: autoInsuranceQuestions,
  fire: fireInsuranceQuestions,
  liability: liabilityInsuranceQuestions,
  injury: injuryInsuranceQuestions,
  term: termInsuranceQuestions,
  whole: wholeInsuranceQuestions,
  medical: medicalInsuranceQuestions,
  cancer: cancerInsuranceQuestions,
  annuity: annuityInsuranceQuestions,
  variable: variableInsuranceQuestions,
  endowment: endowmentInsuranceQuestions,
  education: educationInsuranceQuestions,
  income: incomeInsuranceQuestions,
  nursing: nursingInsuranceQuestions,
  disability: disabilityInsuranceQuestions,
};
