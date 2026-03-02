# 開発ガイド

## 開発環境セットアップ

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev
```

## コーディング規約

### TypeScript
- strict モードを使用
- any の使用は避ける
- 関数の戻り値型は明示する

### ファイル命名
- コンポーネント: PascalCase (`Button.tsx`)
- ユーティリティ: camelCase (`scoring.ts`)
- テスト: `*.test.ts` または `*.spec.ts`

### コミットメッセージ
```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント更新
test: テスト追加・修正
refactor: リファクタリング
chore: ビルド・設定変更
```

## テスト追加ガイド

### 単体テスト (Vitest)

```typescript
// src/lib/example.test.ts
import { describe, it, expect } from 'vitest';
import { myFunction } from './example';

describe('myFunction', () => {
  it('正常系のテスト', () => {
    expect(myFunction('input')).toBe('expected');
  });
  
  it('エッジケースのテスト', () => {
    expect(myFunction('')).toBeNull();
  });
});
```

### E2Eテスト (Playwright)

```typescript
// tests/e2e/example.spec.ts
import { test, expect } from '@playwright/test';

test('ページが表示される', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});
```

## 新しい保険カテゴリの追加方法

### 1. 型定義を更新

```typescript
// src/types/index.ts
export type InsuranceCategory = 
  | 'auto' | 'fire' | ... 
  | 'new-category';  // 追加
```

### 2. 質問データを追加

```typescript
// src/data/questions.ts
export const newCategoryQuestions: Question[] = [
  {
    step: 1,
    question: '質問テキスト',
    type: 'single-select',
    options: [
      { id: 'option1', label: '選択肢1' },
      // ...
    ],
  },
  // ...
];
```

### 3. スコアリング軸を定義

```typescript
// src/lib/scoring.ts
const scoringAxesByCategory = {
  // ...
  'new-category': {
    'axis-1': { label: '評価軸1', weight: 1.2 },
    'axis-2': { label: '評価軸2', weight: 1.0 },
  },
};
```

### 4. テストを追加

```typescript
// src/lib/scoring.test.ts
it('新カテゴリの推奨を返す', () => {
  const answers = { 1: 'answer' };
  const recommendations = calculateRecommendations('new-category', answers);
  expect(recommendations).toHaveLength(2);
});
```

## CI/CD

### GitHub Actions ワークフロー

PRを作成すると以下が自動実行されます：

1. **Lint & Type Check** - ESLint + TypeScript
2. **Unit Tests** - Vitest単体テスト
3. **E2E Tests** - Playwright E2Eテスト
4. **Build** - Next.jsビルド

すべてパスするとマージ可能になります。

## トラブルシューティング

### E2Eテストが失敗する

```bash
# Playwrightブラウザを再インストール
npx playwright install --with-deps chromium

# サーバーが起動しているか確認
curl http://localhost:3000
```

### 型エラーが出る

```bash
# node_modulesを再インストール
rm -rf node_modules package-lock.json
npm install

# 型チェック
npm run type-check
```

### テストがタイムアウトする

```bash
# タイムアウトを延長して実行
npx playwright test --timeout=60000
```
