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
