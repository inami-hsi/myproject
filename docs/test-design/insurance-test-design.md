# 保険商品推奨ポータル - テスト設計書

**プロジェクト名**: 保険商品推奨ポータルサイト構築  
**バージョン**: v1.0  
**作成日**: 2026年2月28日  
**対象Phase**: Phase 5（テスト）

---

## 概要

本ドキュメントは、Insurance プロジェクトのテスト戦略・テスト設計を定めます。  
`insurance-spec.md` の機能要件をベースに、ユニット・統合・E2E・フローテストを網羅します。

---

## 1. テスト戦略

### 1.1 テストピラミッド

```
          🔺 E2E Tests
         🟩 Integration Tests
        🟦 Unit Tests
```

**配分目標:**
- ユニットテスト: 60%（スピード・つながりやすさ）
- 統合テスト: 25%（モジュール間連携）
- E2Eテスト: 15%（ユーザージャーニー）

### 1.2 テストカバレッジ目標

```
全体カバレッジ:  80%以上
クリティカルパス: 100%
```

### 1.3 テスト実行環境

| テストタイプ | 環境 | ツール |
|-------------|------|--------|
| ユニットテスト | ローカル | Vitest |
| 統合テスト | Docker (ローカル) | Vitest + Docker Compose |
| E2E テスト | Docker / AWS | Playwright |
| フローテスト | AWS 開発環境 | Playwright + CC-Auth |

---

## 2. ユニットテスト

### 2.1 対象コンポーネント

#### M1: 顧客情報管理

```typescript
// tests/unit/auth.test.ts
describe('Authentication Module', () => {
  
  test('新規ユーザー登録 - 正常系', async () => {
    const result = await registerUser({
      email: 'user@example.com',
      name: 'Taro Yamada',
      age: 35,
    });
    expect(result.status).toBe('success');
    expect(result.userId).toBeDefined();
  });

  test('新規ユーザー登録 - 重複メール', async () => {
    // メールアドレスが既に登録済みの場合
    const result = await registerUser({
      email: 'existing@example.com',
      name: 'Hanako Yamada',
      age: 30,
    });
    expect(result.status).toBe('error');
    expect(result.message).toContain('既に登録済み');
  });

  test('新規ユーザー登録 - 無効なメール形式', async () => {
    const result = await registerUser({
      email: 'invalid-email',
      name: 'Invalid User',
      age: 25,
    });
    expect(result.status).toBe('error');
    expect(result.errors.email).toBeDefined();
  });

  test('プロフィール更新', async () => {
    const userId = 'usr_test_123';
    const result = await updateProfile(userId, {
      age: 36,
      occupation: 'company_employee',
    });
    expect(result.status).toBe('success');
  });
});
```

#### M2: ヒアリングエンジン

```typescript
// tests/unit/questionnaire.test.ts
describe('Questionnaire Module - Auto Insurance', () => {
  
  test('自動車保険フロー - 運転頻度質問', () => {
    const question = getQuestion('auto_insurance', 'driving_frequency');
    expect(question.type).toBe('single_choice');
    expect(question.options.length).toBe(4);
    expect(question.options[0].value).toBe('daily');
  });

  test('条件分岐 - 「車を持っていない」→ スキップ', () => {
    const nextStep = getNextStep(
      'auto_insurance',
      'vehicle_ownership',
      'no'  // 車を持っていない
    );
    expect(nextStep.flow).toBe('skip_to_fire_insurance');
  });

  test('火災保険フロー - 対象物選択', () => {
    const question = getQuestion('fire_insurance', 'target_object');
    expect(question.type).toBe('single_choice');
    expect(question.options).toContainEqual({
      value: 'detached_house',
      label: '戸建住宅',
    });
  });

  test('回答の保存と復元', async () => {
    const userId = 'usr_test_123';
    const responses = {
      driving_frequency: 'daily',
      annual_mileage: '20000_plus',
      vehicle_type: 'car',
    };
    
    await saveResponses(userId, 'auto_insurance', responses);
    const retrieved = await getResponses(userId, 'auto_insurance');
    
    expect(retrieved).toEqual(responses);
  });
});
```

#### M3: マッチングエンジン

```typescript
// tests/unit/matching.test.ts
describe('Matching Engine', () => {
  
  test('自動車保険 - 高走行ドライバーマッチング', () => {
    const responses = {
      drivingFrequency: 'daily',
      annualMileage: 20000,
      pastAccidents: ['minor_10years_ago'],
      drivers: ['self'],
    };
    
    const ranking = calculateMatching('auto_insurance', responses);
    
    // 1位は三井住友海上（高走行対応）
    expect(ranking[0].company).toBe('msig');
    expect(ranking[0].score).toBeGreaterThan(90);
  });

  test('火災保険 - リスク地域判定', () => {
    const responses = {
      targetObject: 'detached_house',
      disasterRisks: ['heavy_rain', 'hail'],
      location: 'niigata',  // 豪雪地帯
    };
    
    const ranking = calculateMatching('fire_insurance', responses);
    
    // 水害対応が強い保険会社が上位
    expect(ranking[0].score).toBeGreaterThan(85);
  });

  test('スコアリング計算式の検証', () => {
    const score = calculateScore({
      needsMatch: 90,
      companyReputation: 85,
      priceCompetitiveness: 75,
    });
    
    // score = (90 * 0.4) + (85 * 0.3) + (75 * 0.3) = 84
    expect(score).toBe(84);
  });
});
```

#### M4: 推奨結果表示

```typescript
// tests/unit/recommendation.test.ts
describe('Recommendation Display', () => {
  
  test('推奨理由텍스트生成', () => {
    const recommendation = generateRecommendationText({
      insurer: 'msig',
      score: 92,
      reasons: {
        drivingFrequency: 'daily',
        annualMileage: 20000,
        pastAccidents: [],
      },
    });
    
    expect(recommendation).toContain('三井住友海上');
    expect(recommendation).toContain('高走行ドライバー向け');
  });

  test('比較表データ生成', () => {
    const comparison = generateComparisonTable([
      { id: 'msig', score: 92 },
      { id: 'aioi', score: 88 },
    ]);
    
    expect(comparison.length).toBe(2);
    expect(comparison[0].company).toBe('msig');
    expect(comparison[0].premium).toBeDefined();
  });
});
```

### 2.2 ユニットテスト実行コマンド

```bash
# 全テスト
npm run test:unit

# 特定モジュール
npm run test:unit -- auth.test.ts
npm run test:unit -- matching.test.ts

# カバレッジ計測
npm run test:unit -- --coverage
```

---

## 3. 統合テスト

### 3.1 対象: API + データベース統合

```typescript
// tests/integration/user-registration.test.ts
describe('User Registration Flow (API + DB)', () => {
  
  test('新規ユーザー登録 → DB保存 → ログイン確認', async () => {
    // Step 1: ユーザー登録 API
    const registerResponse = await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'newuser@test.com',
        name: 'Test User',
        age: 30,
      }),
    });
    expect(registerResponse.status).toBe(201);
    const { userId } = await registerResponse.json();
    
    // Step 2: DB から確認
    const dbUser = await db.users.findOne({ id: userId });
    expect(dbUser.email).toBe('newuser@test.com');
    
    // Step 3: ログイン テスト
    const loginResponse = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'newuser@test.com',
        password: 'securePassword123',
      }),
    });
    expect(loginResponse.status).toBe(200);
  });
});
```

### 3.2 対象: ヒアリング → マッチング → 結果表示

```typescript
// tests/integration/questionnaire-to-result.test.ts
describe('Questionnaire to Recommendation Flow', () => {
  
  test('自動車保険フロー全一通り → 推奨結果', async () => {
    const userId = 'usr_integration_test';
    
    // Step 1: ユーザー登録
    await registerUser({ email: 'test@example.com', age: 35, name: 'Taro' });
    
    // Step 2: ヒアリング回答提出
    const saveResponse = await fetch(`/api/questionnaire/${userId}/auto-insurance`, {
      method: 'POST',
      body: JSON.stringify({
        drivingFrequency: 'daily',
        annualMileage: 20000,
        pastAccidents: [],
        drivers: ['self'],
        coverageNeeds: ['vehicle', 'liability'],
      }),
    });
    expect(saveResponse.status).toBe(200);
    
    // Step 3: 推奨結果取得
    const resultResponse = await fetch(`/api/recommendation/${userId}/auto-insurance`);
    const result = await resultResponse.json();
    
    expect(result.ranking).toBeDefined();
    expect(result.ranking.length).toBeGreaterThanOrEqual(3);
    expect(result.ranking[0].score).toBeGreaterThan(85);
  });
});
```

### 3.3 統合テスト実行コマンド

```bash
# Docker環境でテスト実行
docker-compose -f docker-compose.test.yml up -d
npm run test:integration
docker-compose -f docker-compose.test.yml down

# または統合実行
npm run test:integration:all
```

---

## 4. E2Eテスト

### 4.1 ユースケース: UC001 ユーザー登録 → 診断開始

```typescript
// tests/e2e/auth-and-start-diagnosis.spec.ts
import { test, expect } from '@playwright/test';

test('ユーザー登録から診断開始まで', async ({ page }) => {
  // Step 1: ランディングページ表示
  await page.goto('http://localhost:3000');
  await expect(page.locator('h1')).toContainText('あなたにぴったりの保険を探す');
  
  // Step 2: 「推奨診断を始める」ボタンクリック
  await page.click('button:has-text("推奨診断を始める")');
  
  // Step 3: 登録フォーム表示
  await expect(page.locator('[data-testid="registration-form"]')).toBeVisible();
  
  // Step 4: メール入力
  await page.fill('input[name="email"]', 'e2etest@example.com');
  
  // Step 5: 名前入力
  await page.fill('input[name="name"]', 'E2E Test User');
  
  // Step 6: 年齢入力
  await page.fill('input[name="age"]', '35');
  
  // Step 7: 登録ボタンクリック
  await page.click('button:has-text("登録する")');
  
  // Step 8: 確認メール送信メッセージ表示
  await expect(page.locator('[role="alert"]')).toContainText('確認メールを送信しました');
  
  // Step 9: メール確認URL GET（本番環境では実際のメール確認）
  // テスト環境では DB から確認トークン取得
  const confirmToken = await getConfirmTokenFromDB('e2etest@example.com');
  
  // Step 10: 確認リンク訪問
  await page.goto(`http://localhost:3000/confirm?token=${confirmToken}`);
  
  // Step 11: プロフィール入力フォーム表示
  await expect(page.locator('[data-testid="profile-form"]')).toBeVisible();
  
  // Step 12: 職業選択
  await page.selectOption('select[name="occupation"]', 'company_employee');
  
  // Step 13: 確認ボタンクリック
  await page.click('button:has-text("診断を始める")');
  
  // Step 14: ホーム画面（保険種目選択）
  await expect(page.url()).toContain('/dashboard');
  await expect(page.locator('button:has-text("損害保険を探す")')).toBeVisible();
});
```

### 4.2 ユースケース: UC002 自動車保険ヒアリング完了 → 推奨結果表示

```typescript
// tests/e2e/auto-insurance-flow.spec.ts
import { test, expect } from '@playwright/test';

test('自動車保険ヒアリングから推奨表示まで', async ({ page }) => {
  // プリコンディション: ユーザーログイン
  await page.goto('http://localhost:3000/dashboard');
  await loginUser('testuser@example.com', 'password123');
  
  // Step 1: 「損害保険を探す」クリック
  await page.click('button:has-text("損害保険を探す")');
  
  // Step 2: 「自動車保険」選択
  await page.click('[data-testid="insurance-auto"]');
  
  // Step 3: ステップ1「保有車両状況」
  await expect(page.locator('h2')).toContainText('保有車両状況');
  await page.click('label:has-text("はい")');
  await page.click('button:has-text("次へ")');
  
  // Step 4: ステップ2「運転状況」
  await expect(page.locator('h2')).toContainText('運転状況');
  await page.click('label:has-text("毎日運転する")');
  await page.click('button:has-text("次へ")');
  
  // Step 5: ステップ3「年間走行距離」
  await page.click('label:has-text("20,000km以上")');
  await page.click('button:has-text("次へ")');
  
  // Step 6: ステップ4「車両タイプ」
  await page.click('label:has-text("普通乗用車")');
  await page.click('button:has-text("次へ")');
  
  // Step 7: ステップ5「過去事故歴」
  await page.click('label:has-text("事故なし")');
  await page.click('button:has-text("次へ")');
  
  // Step 8: ステップ6「運転者管理」
  await page.click('label:has-text("本人のみ")');
  await page.click('button:has-text("次へ")');
  
  // Step 9: ステップ7「補償内容」
  await page.click('label:has-text("対人賠償")');
  await page.click('label:has-text("車両保険")');
  await page.click('button:has-text("次へ")');
  
  // Step 10: ステップ8「保険料予算」
  await page.click('label:has-text("月5,000～10,000円")');
  await page.click('button:has-text("推奨を見る")');
  
  // Step 11: 推奨結果表示確認
  await expect(page.url()).toContain('/recommendation');
  await expect(page.locator('[data-testid="ranking-1st"]')).toBeVisible();
  await expect(page.locator('[data-testid="company-name"]')).toContainText('三井住友');
  
  // Step 12: スコア表示確認
  const score = await page.locator('[data-testid="score"]').textContent();
  expect(parseInt(score)).toBeGreaterThan(85);
  
  // Step 13: 推奨理由確認
  const reason = await page.locator('[data-testid="reason"]').textContent();
  expect(reason).toContain('高走行');
});
```

### 4.3 E2E テスト実行コマンド

```bash
# E2E テスト実行（ステージング環境）
npm run test:e2e

# 特定のテストケースのみ実行
npm run test:e2e -- auto-insurance-flow.spec.ts

# ブラウザで視覚的にデバッグ
npm run test:e2e -- --debug

# ビデオ記録有効
npm run test:e2e -- --video=on
```

---

## 5. フローテスト（ユーザージャーニー）

### 5.1 フロー: FLW001 新規ユーザー → 診断 → 相談予約

```typescript
// tests/flow/new-user-consultation-journey.spec.ts
import { test, expect } from '@playwright/test';

test('新規ユーザー → 診断 → 相談予約まで', async ({ page }) => {
  // シーン1: ランディング → 登録
  await page.goto('http://localhost:3000');
  await page.click('button:has-text("推奨診断を始める")');
  
  // ユーザー登録
  const email = `flow-test-${Date.now()}@example.com`;
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="name"]', 'Flow Test User');
  await page.fill('input[name="age"]', '40');
  await page.click('button:has-text("登録する")');
  
  // メール確認（テスト用ショートカット）
  const token = await getConfirmTokenFromDB(email);
  await page.goto(`http://localhost:3000/confirm?token=${token}`);
  
  // シーン2: プロフィール入力 → ホーム
  await page.selectOption('select[name="occupation"]', 'company_employee');
  await page.click('button:has-text("診断を始める")');
  
  // シーン3: 診断実行（簡略版: 自動車保険のみ）
  await page.click('button:has-text("損害保険を探す")');
  await page.click('[data-testid="insurance-auto"]');
  
  // 自動車保険フロー簡略（スキップして推奨結果へ）
  // ※ 実際には全ステップ実行
  await fillAutoInsuranceQuickPath(page);
  
  // シーン4: 推奨結果 → 相談予約
  await expect(page.locator('[data-testid="ranking-1st"]')).toBeVisible();
  
  // 「相談を予約」ボタンクリック
  await page.click('button:has-text("相談を予約")');
  
  // 相談方法選択
  await expect(page.locator('[data-testid="consultation-modal"]')).toBeVisible();
  await page.click('label:has-text("Zoom")');
  
  // 専門家選択
  const experts = await page.locator('[data-testid="expert-item"]').count();
  expect(experts).toBeGreaterThan(0);
  await page.click('[data-testid="expert-item"]:first-child');
  
  // 日時選択
  const calendarDates = await page.locator('[data-testid="available-date"]').count();
  expect(calendarDates).toBeGreaterThan(0);
  await page.click('[data-testid="available-date"]:first-child');
  
  // 予約確認
  await page.click('button:has-text("予約確定")');
  
  // シーン5: 予約完了メッセージ + メール送信確認
  await expect(page.locator('[role="alert"]')).toContainText('予約が完了しました');
  
  // メール送信確認（DB確認）
  const sentEmail = await getEmailFromDB(email);
  expect(sentEmail.subject).toContain('予約確認');
});
```

### 5.2 フロー: FLW002 既存顧客 → 見直し診断 → 乗り換え申込

```typescript
// tests/flow/existing-customer-switch.spec.ts
test('既存顧客 → 保険見直し診断 → 乗り換え申込', async ({ page }) => {
  // シーン1: ログイン（既存顧客）
  await page.goto('http://localhost:3000/login');
  await page.fill('input[name="email"]', 'existing-customer@example.com');
  await page.fill('input[name="password"]', 'existingPassword123');
  await page.click('button:has-text("ログイン")');
  
  // シーン2: ダッシュボード → 見直し診断
  await expect(page.url()).toContain('/dashboard');
  await page.click('button:has-text("保険を見直す")');
  
  // シーン3: 現在の保険情報確認
  await expect(page.locator('[data-testid="current-insurance"]')).toBeVisible();
  
  // シーン4: 新規ヒアリング開始
  await page.click('button:has-text("新規診断を開始")');
  
  // ヒアリング実行（詳細は省略）
  await fillAutoInsuranceQuickPath(page);
  
  // シーン5: 乗り換え推奨表示
  const switchRecommendation = await page.locator('[data-testid="switch-recommendation"]').textContent();
  expect(switchRecommendation).toContain('乗り換え可能');
  
  // シーン6: 乗り換え申込ボタン
  await page.click('button:has-text("乗り換え申込へ")');
  
  // シーン7: 申込フォーム
  await expect(page.locator('[data-testid="application-form"]')).toBeVisible();
  await page.fill('input[name="phone"]', '09012345678');
  await page.fill('input[name="address"]', '東京都渋谷区');
  
  // 申込確認
  await page.click('button:has-text("申込確定")');
  
  // シーン8: 申込完了
  await expect(page.locator('[role="alert"]')).toContainText('申込が完了しました');
});
```

### 5.3 フロー実行コマンド

```bash
# 全フローテスト
npm run test:flow

# 特定フロー
npm run test:flow -- new-user-consultation-journey.spec.ts

# スローモーション（デバッグ用）
npm run test:flow -- --headed --slow-mo=1000
```

---

## 6. テストデータ・フィクスチャ

### 6.1 テストユーザーデータ

```typescript
// tests/fixtures/test-users.ts
export const testUsers = {
  newUser: {
    email: 'newuser@test.com',
    name: 'New User',
    age: 30,
    password: 'TestPassword123!',
  },
  existingUser: {
    email: 'existing@test.com',
    name: 'Existing User',
    age: 45,
    password: 'ExistingPass456!',
  },
  adminUser: {
    email: 'admin@test.com',
    name: 'Admin User',
    password: 'AdminPass789!',
  },
};
```

### 6.2 テスト用保険者データ

```typescript
// tests/fixtures/insurers.ts
export const testInsurers = [
  {
    id: 'msig',
    name: '三井住友海上火災保険',
    strengths: ['high_mileage', 'accident_support'],
    avgScore: 92,
  },
  {
    id: 'aioi',
    name: 'あいおいニッセイ同和損害保険',
    strengths: ['network', 'price'],
    avgScore: 88,
  },
  {
    id: 'tokio',
    name: '東京海上日動火災保険',
    strengths: ['response_quality', 'special_coverage'],
    avgScore: 85,
  },
];
```

---

## 7. テスト実行スケジュール

### 7.1 開発中

```
ローカル開発:
  └─ npm run test:unit   (毎回コミット前)
  └─ npm run test:unit -- --watch

PRレビュー:
  └─ npm run test:unit
  └─ npm run test:integration
```

### 7.2 CI/CD パイプライン

```yaml
# .github/workflows/test.yml
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - run: npm run test:unit:report

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: test
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run build
      - run: npm run test:e2e
```

### 7.3 リリース前

```
本番環境デプロイ前チェックリスト:
  □ ユニットテスト: 100% PASS
  □ 統合テスト: 100% PASS
  □ E2E テスト: 100% PASS
  □ カバレッジ: 80%以上
  □ パフォーマンステスト: PASS
  □ セキュリティスキャン: PASS
```

---

## 8. テスト品質基準

| 項目 | 基準 |
|------|------|
| 全テスト成功率 | 100% |
| ユニットテストカバレッジ | 80%以上 |
| クリティカルパスカバレッジ | 100% |
| E2E実行時間 | 15分以内 |
| バグ検出率 | 本番バグ数 < 5件/100機能 |

---

## 9. トラブルシューティング

### 9.1 テスト失敗時の対応

```
1. ログ確認
   └─ npm run test:unit -- --reporter=verbose

2. デバッグモード
   └─ npm run test:unit -- --debug

3. 特定テストのみ実行
   └─ npm run test:unit -- matching.test.ts

4. テストデータリセット
   └─ npm run test:db:reset
```

---

## 関連ドキュメント

- `insurance-spec.md` - 機能仕様書
- `insurance-ui-guidelines.md` - UI/UX設計方針
- `docs/LABEL_SYSTEM_GUIDE.md` - GitHub Issue ラベル体系

---

*Version 1.0 - 2026年2月28日 生成*
