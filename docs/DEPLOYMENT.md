# Vercelデプロイガイド

## 前提条件

- GitHubアカウント
- Vercelアカウント（https://vercel.com）
- リポジトリがGitHubにプッシュ済み

## デプロイ手順

### 1. Vercelにログイン

https://vercel.com にアクセスし、GitHubアカウントでログイン

### 2. プロジェクトをインポート

1. 「Add New...」→「Project」をクリック
2. 「Import Git Repository」でリポジトリを選択
3. 「Import」をクリック

### 3. プロジェクト設定

| 設定項目 | 値 |
|----------|-----|
| Framework Preset | Next.js |
| Root Directory | ./ |
| Build Command | npm run build |
| Output Directory | .next |
| Install Command | npm ci |

### 4. 環境変数設定

「Environment Variables」セクションで以下を設定：

| 変数名 | 値 | 必須 |
|--------|-----|------|
| NEXT_PUBLIC_APP_URL | https://your-domain.vercel.app | ○ |
| NEXT_PUBLIC_APP_NAME | 保険比較推奨システム | - |

### 5. デプロイ

「Deploy」ボタンをクリックしてデプロイを開始

## 自動デプロイ設定

### ブランチ設定

| ブランチ | デプロイ先 |
|----------|-----------|
| main | 本番環境 |
| develop | プレビュー環境 |

### プレビューデプロイ

PRを作成すると自動的にプレビューURLが発行されます。

## カスタムドメイン設定

1. Vercelダッシュボードで「Settings」→「Domains」
2. ドメインを追加
3. DNSレコードを設定（CNAME または A レコード）

```
# CNAME設定例
your-domain.com  CNAME  cname.vercel-dns.com
```

## 環境別設定

### 本番環境 (Production)

- ブランチ: main
- URL: https://your-domain.vercel.app
- 環境変数: Production

### プレビュー環境 (Preview)

- ブランチ: develop, feature/*
- URL: https://your-project-xxx.vercel.app
- 環境変数: Preview

### 開発環境 (Development)

- ローカル: npm run dev
- URL: http://localhost:3000
- 環境変数: .env.local

## ビルド最適化

### 現在の設定

- **React Strict Mode**: 有効
- **SWC Minify**: 有効
- **Powered By Header**: 無効（セキュリティ）
- **Image Optimization**: AVIF/WebP対応

### ビルドキャッシュ

Vercelは自動的にビルドキャッシュを管理します。
キャッシュをクリアする場合は、ダッシュボードから「Redeploy」→「Redeploy with existing Build Cache」のチェックを外す。

## モニタリング

### Vercel Analytics（オプション）

```bash
npm install @vercel/analytics
```

```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Speed Insights（オプション）

```bash
npm install @vercel/speed-insights
```

## トラブルシューティング

### ビルドエラー

```bash
# ローカルで本番ビルドを確認
npm run build
npm start
```

### 環境変数が反映されない

1. ダッシュボードで環境変数を確認
2. 「Redeploy」で再デプロイ

### 404エラー

Next.js App Routerのルーティングを確認
- ファイル名: `page.tsx`
- ディレクトリ構造が正しいか確認

## セキュリティヘッダー

vercel.jsonで以下のセキュリティヘッダーを設定済み：

- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

## リージョン設定

デフォルトリージョン: `hnd1`（東京）

変更する場合は `vercel.json` の `regions` を編集：

```json
{
  "regions": ["hnd1", "sfo1"]
}
```
