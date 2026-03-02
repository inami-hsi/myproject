# 保険比較推奨システム

保険商品の比較・推奨を行うWebアプリケーションです。ユーザーの回答に基づいて最適な保険会社を提案します。

## 🎯 機能概要

### 対応保険種別

**損害保険（4カテゴリ）**
- 自動車保険 (auto)
- 火災保険 (fire)
- 賠償責任保険 (liability)
- 傷害保険 (injury)

**生命保険（11カテゴリ）**
- 定期保険 (term)
- 終身保険 (whole)
- 医療保険 (medical)
- がん保険 (cancer)
- 年金保険 (annuity)
- 変額保険 (variable)
- 養老保険 (endowment)
- 学資保険 (education)
- 収入保障保険 (income)
- 介護保険 (nursing)
- 就業不能保険 (disability)

### 主な機能
- 質問形式による保険ニーズの把握
- スコアリングに基づく保険会社推奨
- 推奨理由の詳細表示
- 比較レポートのダウンロード（PDF/CSV/テキスト）

## 🚀 セットアップ

### 必要環境
- Node.js 20.x 以上
- npm 10.x 以上

### インストール

```bash
# リポジトリをクローン
git clone <repository-url>
cd insurance-recommendation

# 依存関係のインストール
npm install

# Playwrightブラウザのインストール（E2Eテスト用）
npx playwright install
```

### 開発サーバー起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

## 📁 プロジェクト構成

```
insurance-recommendation/
├── app/                    # Next.js App Router
│   ├── page.tsx           # トップページ
│   └── insurance/
│       ├── life/          # 生命保険
│       │   └── [category]/questions/[step]/
│       └── loss/          # 損害保険
│           └── [category]/questions/[step]/
├── src/
│   ├── components/        # UIコンポーネント
│   ├── data/
│   │   ├── companies.ts   # 保険会社データ
│   │   └── questions.ts   # 質問データ
│   ├── lib/
│   │   ├── scoring.ts     # スコアリングロジック
│   │   ├── reportGenerator.ts # レポート生成
│   │   └── utils.ts       # ユーティリティ
│   ├── stores/
│   │   └── insuranceStore.ts # Zustand状態管理
│   └── types/
│       └── index.ts       # 型定義
├── tests/
│   └── e2e/               # Playwright E2Eテスト
├── .github/
│   └── workflows/
│       └── ci.yml         # GitHub Actions CI
└── vitest.config.ts       # Vitest設定
```

## 🧪 テスト

### 単体テスト（Vitest）

```bash
# テスト実行
npm test

# ウォッチモード
npm run test:watch

# カバレッジ付き
npm run test:coverage
```

### E2Eテスト（Playwright）

```bash
# 開発サーバー起動後
npm run dev

# 別ターミナルでE2Eテスト実行
BASE_URL=http://localhost:3000 npm run test:e2e

# ブラウザ表示付き
npm run test:e2e:headed
```

### テストカバレッジ

| ファイル | カバレッジ |
|----------|-----------|
| utils.ts | 100% |
| reportGenerator.ts | 74% |
| scoring.ts | 74% |

## 📋 npm スクリプト一覧

| コマンド | 説明 |
|----------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm start` | 本番サーバー起動 |
| `npm run lint` | ESLint実行 |
| `npm run type-check` | TypeScript型チェック |
| `npm test` | 単体テスト実行 |
| `npm run test:watch` | 単体テスト（ウォッチモード） |
| `npm run test:coverage` | カバレッジ付きテスト |
| `npm run test:e2e` | E2Eテスト実行 |
| `npm run test:e2e:headed` | E2Eテスト（ブラウザ表示付き） |

## 🔧 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **状態管理**: Zustand
- **フォーム**: React Hook Form + Zod
- **アニメーション**: Framer Motion
- **チャート**: Recharts
- **単体テスト**: Vitest
- **E2Eテスト**: Playwright
- **CI/CD**: GitHub Actions

## 🏢 スコアリングロジック

各保険カテゴリに対して以下の評価軸でスコアリングを行います：

### 評価例（自動車保険）
- 事故対応力 (weight: 1.2)
- 保険料競争力 (weight: 0.8)
- 特約の充実 (weight: 1.0)
- デジタル対応 (weight: 0.9)
- 代理店ネットワーク (weight: 1.1)
- 付加価値 (weight: 0.7)

ユーザーの回答に基づいて優先度を調整し、各社のスコアを算出。上位2社を推奨として表示します。

## 📄 ライセンス

Private
