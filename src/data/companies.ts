export const insuranceCompanies = {
  loss: [
    {
      id: 'tokio-marine',
      name: '東京海上日動火災保険',
      category: 'loss',
      url: 'https://www.tokiomarine-nichido.co.jp/',
      scoring: {
        'accident-response': 5,
        'insurance-cost': 2,
        'features': 4,
        'digital': 3,
        'network': 5,
        'added-value': 4,
        // fire-specific axes
        coverage: 4,
        'water-response': 4,
        'claim-service': 5,
        'longterm-discount': 3,
      },
    },
    {
      id: 'mitsui-sumitomo',
      name: '三井住友海上火災保険',
      category: 'loss',
      url: 'https://www.ms-ad-hoken.com/',
      scoring: {
        'accident-response': 4,
        'insurance-cost': 3,
        'features': 4,
        'digital': 4,
        'network': 5,
        'added-value': 4,
        coverage: 5,
        'water-response': 5,
        'claim-service': 4,
        'longterm-discount': 4,
      },
    },
    {
      id: 'aioi-nissay',
      name: 'あいおいニッセイ同和損保',
      category: 'loss',
      url: 'https://www.aioinissaydowa.co.jp/',
      scoring: {
        'accident-response': 3,
        'insurance-cost': 4,
        'features': 3,
        'digital': 3,
        'network': 4,
        'added-value': 2,
        coverage: 3,
        'water-response': 4,
        'claim-service': 2,
        'longterm-discount': 3,
      },
    },
    {
      id: 'sompo-japan',
      name: '損保ジャパン',
      category: 'loss',
      url: 'https://www.sompo-japan.co.jp/',
      scoring: {
        'accident-response': 3,
        'insurance-cost': 4,
        'features': 5,
        'digital': 4,
        'network': 4,
        'added-value': 2,
        coverage: 4,
        'water-response': 4,
        'claim-service': 3,
        'longterm-discount': 4,
      },
    },
    {
      id: 'nissin-fire',
      name: '日新火災海上保険',
      category: 'loss',
      url: 'https://www.nissinfire.co.jp/',
      scoring: {
        'accident-response': 2,
        'insurance-cost': 3,
        'features': 3,
        'digital': 2,
        'network': 3,
        'added-value': 2,
        coverage: 3,
        'water-response': 3,
        'claim-service': 3,
        'longterm-discount': 3,
      },
    },
  ],
  life: [
    {
      id: 'msa-life',
      name: '三井住友海上あいおい生命保険',
      category: 'life',
      url: 'https://www.msa-life.co.jp/',
      // 商品強み:
      // ・医療保険Aセレクトup (2026年3月2日発売): 日帰り入院から一律5日分支給、八大疾病対応、ICU給付金、放射線治療給付金
      //   【新特約】がん遺伝子パネル検査特約 - 100以上の遺伝子異常を解析しゲノム医療（分子標的薬）を探す検査を保障
      // ・収入保障Wセレクト: 介護・障害状態もカバー、ストレス・メンタル疾病サポート特則、在宅医療対応
      // ・健康優良割引/健康診断料率適用特約で保険料割引可能
      scoring: {
        'product-variety': 5,
        'claim-handling': 5, // 給付金支払い対応の良さ
        'digital': 4,
        'counseling': 5, // MS&ADグループの代理店網
        'cost': 4, // 健康優良割引で保険料抑制可能
        'reputation': 5,
        // 年金・変額保険軸
        'return-rate': 3, // 学資保険取扱なし
        'stability': 5,
        'flexibility': 4,
        // 養老・学資保険軸 - ※養老・学資保険の取扱なし
        'maturity-benefit': 3,
        'waiver-options': 4, // 払込免除特約は通常商品で有り
        // 収入保障保険軸 - Wセレクトの強み
        'benefit-amount': 5, // 死亡・高度障害・介護障害の3型から選択可能
        'coverage-period': 5, // 保険期間満了まで毎月年金支給
        'minimum-guarantee': 5, // 短期継続入院・在宅医療サポート給付金あり
        // 介護・就業不能保険軸
        'benefit-conditions': 5, // 身体障害者手帳1-4級、国民年金障害等級1-2級、要介護1以上で支給
        'mental-coverage': 5, // ストレス・メンタル疾病サポート特則対応(30日継続で一時金)
        'waiting-period': 4,
        // 変額保険軸 - ※変額保険の取扱なし（MS&ADグループの信頼性は維持）
        'investment-options': 3,
        'performance': 3,
      },
    },
    {
      id: 'ms-primary',
      name: '三井住友海上プライマリー生命保険',
      category: 'life',
      url: 'https://www.ms-primary.com/',
      // 商品強み:
      // ・変額保険・外貨建保険に特化（銀行窓販専門）
      // ・しあわせねんきん（変額個人年金）: 多様な特別勘定、死亡給付金保証
      // ・変額終身保険: 運用実績連動型
      scoring: {
        'product-variety': 3, // 変額・年金特化のため限定的
        'claim-handling': 4,
        'digital': 4,
        'counseling': 4, // 銀行窓口経由
        'cost': 3, // 変額保険は手数料がかかる
        'reputation': 4,
        'return-rate': 5, // 変額・外貨建ての高リターン可能性
        'stability': 5, // MS&ADグループの安定性
        'flexibility': 5, // 特別勘定の選択肢が豊富
        'maturity-benefit': 5, // 外貨建養老保険
        'waiver-options': 3,
        'benefit-amount': 3,
        'coverage-period': 3,
        'minimum-guarantee': 3,
        'benefit-conditions': 3,
        'mental-coverage': 2,
        'waiting-period': 4,
        'investment-options': 5, // 特別勘定が豊富
        'performance': 5, // 運用実績良好
      },
    },
    {
      id: 'aflac',
      name: 'アフラック生命保険',
      category: 'life',
      url: 'https://www.aflac.co.jp/',
      // 商品強み:
      // ・医療保険 EVER Prime: 通院保障充実、三大疾病一時金
      // ・がん保険 ALL-in: 上皮内がん同額保障、治療継続サポート
      // ・給与サポート保険: 精神疾患も保障対象
      scoring: {
        'product-variety': 5,
        'claim-handling': 5,
        'digital': 5,
        'counseling': 4,
        'cost': 4,
        'reputation': 5,
        'return-rate': 3,
        'stability': 4,
        'flexibility': 4,
        'maturity-benefit': 3, // 養老・学資取扱なし（会社としての信頼性は高い）
        'waiver-options': 5,
        'benefit-amount': 4,
        'coverage-period': 4,
        'minimum-guarantee': 5,
        'benefit-conditions': 5,
        'mental-coverage': 4,
        'waiting-period': 4,
        'investment-options': 3, // 変額保険取扱なし（医療・がん保険では高評価）
        'performance': 3, // 変額保険取扱なし（医療・がん保険では高評価）
      },
    },
    {
      id: 'axa-life',
      name: 'アクサ生命保険',
      category: 'life',
      url: 'https://www.axa.co.jp/',
      // 商品強み:
      // ・ユニット・リンク保険: 10種類以上の特別勘定、運用自在
      // ・就業不能保険: 精神疾患も保障対象
      // ・グローバル保険グループの知見
      scoring: {
        'product-variety': 5,
        'claim-handling': 4,
        'digital': 5, // オンライン手続き充実
        'counseling': 4,
        'cost': 3, // 変額保険中心で手数料あり
        'reputation': 4, // グローバルブランド
        'return-rate': 4,
        'stability': 4,
        'flexibility': 5, // 特別勘定の変更自在
        'maturity-benefit': 4,
        'waiver-options': 5, // 三大疾病払込免除特約充実
        'benefit-amount': 4,
        'coverage-period': 4,
        'minimum-guarantee': 3,
        'benefit-conditions': 4,
        'mental-coverage': 5, // 就業不能保険で精神疾患対応
        'waiting-period': 4, // 短い免責期間
        'investment-options': 5, // ユニットリンクの運用選択肢
        'performance': 4,
      },
    },
    {
      id: 'neofirst-life',
      name: 'ネオファースト生命保険',
      category: 'life',
      url: 'https://neofirst.co.jp/',
      // 商品強み:
      // ・ネオdeシリーズ: コストパフォーマンス重視
      // ・ネオde健康: 健康状態で最大30%割引
      // ・WEB完結型申込み
      scoring: {
        'product-variety': 3, // ネオdeシリーズ中心
        'claim-handling': 4,
        'digital': 5, // WEB申込完結が強み
        'counseling': 2, // 対面チャネル限定的
        'cost': 5, // 業界最安水準の保険料
        'reputation': 3, // 新興生保
        'return-rate': 3,
        'stability': 4, // 第一生命グループ
        'flexibility': 4,
        'maturity-benefit': 3,
        'waiver-options': 4,
        'benefit-amount': 3,
        'coverage-period': 4,
        'minimum-guarantee': 3,
        'benefit-conditions': 4,
        'mental-coverage': 4, // ネオdeからだエールで精神疾患対応
        'waiting-period': 4,
        'investment-options': 3, // 変額保険取扱なし（コスパ重視の会社評価は維持）
        'performance': 3, // 変額保険取扱なし（コスパ重視の会社評価は維持）
      },
    },
    {
      id: 'tmn-anshin',
      name: '東京海上日動あんしん生命保険',
      category: 'life',
      url: 'https://www.tmn-anshin.co.jp/',
      // 商品強み:
      // ・家計保障定期保険NEO: 就業不能保障オプション、健康優良割引
      // ・あんしん介護: 要介護1から給付
      // ・夢終身（一時払い終身保険）: 一時払いで一生涯の死亡保障
      // ・個人年金保険: 円建て確定年金
      scoring: {
        'product-variety': 5,
        'claim-handling': 5,
        'digital': 4,
        'counseling': 5,
        'cost': 3,
        'reputation': 5,
        'return-rate': 3, // 学資保険取扱なし
        'stability': 5,
        'flexibility': 4,
        'maturity-benefit': 3, // 養老保険取扱なし
        'waiver-options': 4, // 学資向け払込免除なし
        'benefit-amount': 5,
        'coverage-period': 5,
        'minimum-guarantee': 5,
        'benefit-conditions': 5,
        'mental-coverage': 4,
        'waiting-period': 4,
        'investment-options': 3, // 変額は取扱なし
        'performance': 3,
      },
    },
    {
      id: 'nippon-life',
      name: '日本生命保険相互会社',
      category: 'life',
      url: 'https://www.nissay.co.jp/',
      // 商品強み:
      // ・国内生保最大手の信頼性・安定性
      // ・みらいのカタチ: 総合的な商品ラインナップ
      // ・ニッセイトータルパートナーによる対面サポート
      // ・保険金支払能力格付AA+
      scoring: {
        'product-variety': 5, // みらいのカタチで総合対応
        'claim-handling': 5, // 大手ならではの確実な支払い
        'digital': 3, // 対面重視でデジタルは普通
        'counseling': 5, // トータルパートナーの丁寧なサポート
        'cost': 3, // 大手相応の保険料
        'reputation': 5, // 国内最大手の信頼性
        'return-rate': 5, // ニッセイ学資保険の高い返戻率
        'stability': 5, // 最高水準の財務健全性
        'flexibility': 5, // 学資の受取時期柔軟性
        'maturity-benefit': 3, // 養老保険取扱なし（大手の信頼性は維持）
        'waiver-options': 5, // 学資保険の払込免除特約充実
        'benefit-amount': 4,
        'coverage-period': 5,
        'minimum-guarantee': 4,
        'benefit-conditions': 4,
        'mental-coverage': 3,
        'waiting-period': 4,
        'investment-options': 3, // 変額保険取扱なし（大手の信頼性は維持）
        'performance': 3, // 変額保険取扱なし（大手の信頼性は維持）
      },
    },
  ],
};
