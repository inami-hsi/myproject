# スコアリングロジック詳細

## 概要

本システムは、ユーザーの回答に基づいて保険会社をスコアリングし、最適な2社を推奨します。

## スコアリングフロー

```
ユーザー回答 → 優先度抽出 → 会社スコア計算 → ソート → 上位2社推奨
```

## 評価軸定義

### 損害保険

#### 自動車保険 (auto)
| 評価軸 | 重み | 説明 |
|--------|------|------|
| accident-response | 1.2 | 事故対応力 |
| insurance-cost | 0.8 | 保険料競争力 |
| features | 1.0 | 特約の充実 |
| digital | 0.9 | デジタル対応 |
| network | 1.1 | 代理店ネットワーク |
| added-value | 0.7 | 付加価値 |

#### 火災保険 (fire)
| 評価軸 | 重み | 説明 |
|--------|------|------|
| coverage | 1.2 | 補償の手厚さ |
| insurance-cost | 1.0 | 保険料競争力 |
| water-response | 1.1 | 水災対応 |
| claim-service | 1.3 | 損害サービス |
| network | 1.1 | 代理店ネットワーク |
| longterm-discount | 0.9 | 長期割引 |

#### 賠償責任保険 (liability)
| 評価軸 | 重み | 説明 |
|--------|------|------|
| coverage-limit | 1.2 | 補償限度額 |
| legal-support | 1.3 | 示談代行サービス |
| claim-speed | 1.1 | クレーム対応速度 |
| service-quality | 1.0 | サービス品質 |
| digital-support | 0.8 | デジタル対応 |
| insurance-cost | 0.9 | 保険料競争力 |

#### 傷害保険 (injury)
| 評価軸 | 重み | 説明 |
|--------|------|------|
| hospitalization-coverage | 1.3 | 入院補償 |
| occupational-coverage | 1.2 | 職業別対応 |
| life-insurance | 0.9 | 生命保険連携 |
| recovery | 1.1 | リハビリ支援 |
| service-quality | 1.0 | サービス品質 |
| insurance-cost | 0.8 | 保険料競争力 |

### 生命保険

#### 定期保険 (term)
| 評価軸 | 重み | 説明 |
|--------|------|------|
| product-variety | 1.0 | 商品バリエーション |
| claim-handling | 1.3 | 給付金支払い対応 |
| digital | 1.0 | デジタル対応 |
| counseling | 1.1 | 相談サポート |
| cost | 1.2 | 保険料競争力 |
| reputation | 0.9 | 会社の信頼性 |

#### 終身保険 (whole)
| 評価軸 | 重み | 説明 |
|--------|------|------|
| product-variety | 1.1 | 商品バリエーション |
| claim-handling | 1.2 | 給付金支払い対応 |
| digital | 0.9 | デジタル対応 |
| counseling | 1.2 | 相談サポート |
| cost | 0.8 | 保険料競争力 |
| reputation | 1.3 | 会社の信頼性 |

#### 変額保険 (variable)
| 評価軸 | 重み | 説明 |
|--------|------|------|
| investment-options | 1.2 | 運用商品の充実度 |
| performance | 1.1 | 運用実績 |
| flexibility | 1.0 | 運用変更の柔軟性 |
| counseling | 1.2 | 相談サポート |
| cost | 1.0 | 手数料競争力 |
| reputation | 1.4 | 会社の信頼性 |
| stability | 1.3 | 財務安定性 |

## スコア計算式

### 1. 基本スコア

各保険会社は評価軸ごとに1〜5の基本スコアを持ちます。

```
基本スコア = companies[companyId].scoring[axisId]
```

### 2. 正規化スコア (0-100)

```
正規化スコア = ((基本スコア - 1) / 4) * 100
```

### 3. 重み付けスコア

```
重み付けスコア = 正規化スコア * 軸の重み * ユーザー優先度
```

### 4. 総合スコア

```
総合スコア = Σ(重み付けスコア) / Σ(重み)
```

## ユーザー優先度の抽出

ユーザーの回答から優先度を抽出します。

### 例: 自動車保険

```typescript
// 質問6: 優先する補償内容
if (answer === 'cost') {
  priorities['insurance-cost'] += weight;
}
if (answer === 'accident-response') {
  priorities['accident-response'] += weight;
}

// 質問7: 相談方式
if (answer === 'face-to-face') {
  priorities['network'] += 2;
} else if (answer === 'online') {
  priorities['digital'] += 2;
}
```

## 推奨理由生成

推奨理由は以下の要素で構成されます：

1. **結論** - 推奨会社名、順位、マッチ度
2. **合理的根拠** - ユーザー重視項目との適合度
3. **強み分析** - 上位3つの評価軸
4. **スコア詳細** - 全評価軸のスコア表
5. **留意事項** - 改善の余地がある点
6. **免責事項** - 参考情報である旨

## API

### calculateRecommendations

```typescript
function calculateRecommendations(
  category: InsuranceCategory,
  answers: Record<number, string | string[]>
): Recommendation[]
```

**引数:**
- `category`: 保険カテゴリ
- `answers`: ユーザーの回答（ステップ番号 → 回答値）

**戻り値:**
- `Recommendation[]`: 推奨2社の配列

### getScoringAxes

```typescript
function getScoringAxes(
  category: InsuranceCategory
): Record<string, { label: string; weight: number }>
```

**引数:**
- `category`: 保険カテゴリ

**戻り値:**
- 評価軸の定義オブジェクト
