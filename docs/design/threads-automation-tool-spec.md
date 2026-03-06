# Threads Automation Platform 機能仕様書

**プロジェクト名**: Threads Automation Platform
**Phase**: 2 - Design (Functional Specification)
**作成日**: 2026-03-04
**ステータス**: Draft
**入力ドキュメント**:
- `docs/requirements/threads-automation-tool-requirements.md`
- `docs/requirements/x-automation-tool-design-requirements.md`

---

## 1. 概要

### 1.1 プロジェクト概要

Meta Threads公式APIを活用し、ユーザーのアクション（リプライ、いいね、リポスト、メンション）をトリガーとして自動リプライを送信するSaaS型自動化ツール。抽選キャンペーン、予約投稿、投票（ポール）、分析機能を備え、Threads運用とビジネス成果を最大化する。

Threads APIが**完全無料**であることを最大の利点として活用し、X版（月額¥15,000+のAPI費用）と比較して**99%のコスト削減**を実現する。

### 1.2 技術スタック

| カテゴリ | 技術 | バージョン | 用途 |
|----------|------|-----------|------|
| フレームワーク | Next.js | 15 (App Router) | フロントエンド + API Routes |
| 言語 | TypeScript | 5.3+ | strict mode |
| バックエンド/DB | Supabase | - | PostgreSQL DB, Edge Functions, Realtime |
| デプロイ | Vercel | - | ホスティング, Serverless Functions |
| DNS/CDN | Cloudflare | - | DNS, WAF |
| 認証 | Clerk | - | ユーザー認証 (10,000 MAU無料枠) |
| 決済 | Stripe | - | サブスクリプション課金 |
| メール | Resend | - | 通知メール (3,000通/月無料枠) |
| キャッシュ/キュー | Upstash Redis | - | ジョブキュー (10,000 req/日無料枠) |
| エラー監視 | Sentry | - | エラートラッキング |
| UIライブラリ | shadcn/ui | - | Radix UI + Tailwind |
| アニメーション | motion/react | - | UIトランジション |
| チャート | Recharts | - | 分析グラフ描画 |
| アイコン | Lucide React | - | UIアイコン |
| Threads API | Meta Graph API | v21.0+ | コア機能 (**無料**) |

### 1.3 ディレクトリ構成

```
threads-automation-platform/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (marketing)/              # LP・公開ページ
│   │   │   ├── page.tsx              # LP (S-001)
│   │   │   ├── pricing/page.tsx      # 料金ページ
│   │   │   └── layout.tsx
│   │   ├── (auth)/                   # 認証ページ
│   │   │   ├── sign-up/page.tsx      # S-002
│   │   │   ├── sign-in/page.tsx      # S-003
│   │   │   └── layout.tsx
│   │   ├── dashboard/                # ダッシュボード (認証必須)
│   │   │   ├── page.tsx              # S-010
│   │   │   ├── connect/page.tsx      # S-011
│   │   │   ├── auto-reply/
│   │   │   │   ├── page.tsx          # S-020
│   │   │   │   ├── new/page.tsx      # S-021
│   │   │   │   └── [id]/page.tsx     # S-021 (編集)
│   │   │   ├── replies/page.tsx      # S-030
│   │   │   ├── campaigns/
│   │   │   │   ├── page.tsx          # S-040
│   │   │   │   ├── new/page.tsx      # S-041
│   │   │   │   ├── [id]/page.tsx     # S-041 (編集)
│   │   │   │   └── [id]/results/page.tsx  # S-042
│   │   │   ├── posts/
│   │   │   │   ├── page.tsx          # S-050
│   │   │   │   └── new/page.tsx      # S-051
│   │   │   ├── analytics/page.tsx    # S-060
│   │   │   ├── logs/page.tsx         # S-070
│   │   │   └── settings/
│   │   │       ├── page.tsx          # S-080
│   │   │       └── billing/page.tsx  # S-081
│   │   ├── lottery/
│   │   │   └── [campaignId]/page.tsx # W-001
│   │   ├── api/
│   │   │   ├── webhooks/
│   │   │   │   ├── threads/route.ts  # Meta Webhook受信
│   │   │   │   └── stripe/route.ts   # Stripe Webhook
│   │   │   ├── auth/
│   │   │   │   └── threads/callback/route.ts  # OAuth callback
│   │   │   ├── threads-accounts/
│   │   │   ├── auto-replies/
│   │   │   ├── campaigns/
│   │   │   ├── posts/
│   │   │   ├── replies/
│   │   │   ├── analytics/
│   │   │   ├── logs/
│   │   │   ├── usage/
│   │   │   └── cron/
│   │   │       ├── process-queue/route.ts
│   │   │       ├── scheduled-posts/route.ts
│   │   │       ├── token-refresh/route.ts
│   │   │       ├── usage-aggregate/route.ts
│   │   │       └── engagement-polling/route.ts  # 追加: ポーリングジョブ
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                       # shadcn/ui コンポーネント
│   │   ├── dashboard/                # ダッシュボード固有
│   │   ├── campaigns/                # キャンペーン固有
│   │   ├── auto-reply/               # オートリプライ固有
│   │   └── shared/                   # 共有コンポーネント
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # ブラウザ用クライアント
│   │   │   ├── server.ts             # サーバー用クライアント
│   │   │   └── admin.ts              # サービスロール用
│   │   ├── threads/
│   │   │   ├── api.ts                # Threads API クライアント
│   │   │   ├── webhook.ts            # Webhook署名検証
│   │   │   ├── oauth.ts              # OAuth フロー
│   │   │   └── types.ts              # Threads API型定義
│   │   ├── stripe/
│   │   │   ├── client.ts             # Stripe クライアント
│   │   │   └── webhooks.ts           # Webhook処理
│   │   ├── queue/
│   │   │   ├── redis.ts              # Upstash Redis接続
│   │   │   └── jobs.ts               # ジョブ定義
│   │   ├── encryption.ts             # AES-256-GCM暗号化
│   │   ├── rate-limiter.ts           # レートリミット管理
│   │   └── utils.ts                  # ユーティリティ
│   ├── hooks/                        # カスタムフック
│   └── types/                        # 共有型定義
├── supabase/
│   ├── migrations/                   # DBマイグレーション
│   ├── functions/                    # Edge Functions
│   └── seed.sql                      # 初期データ
├── public/
├── docs/
├── .env.local
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 2. システムアーキテクチャ

### 2.1 全体構成図

```
                                    ┌─────────────────────┐
                                    │   Cloudflare DNS/WAF │
                                    └──────────┬──────────┘
                                               │
                                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         Vercel Platform                              │
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  Next.js Frontend │  │  API Routes       │  │  Cron Jobs        │  │
│  │  (App Router SSR) │  │  (Serverless)     │  │  (Vercel Cron)    │  │
│  │                    │  │                    │  │                    │  │
│  │  - Dashboard       │  │  - /api/webhooks/ │  │  - process-queue  │  │
│  │  - Auto Reply UI   │  │  - /api/auto-     │  │  - scheduled-     │  │
│  │  - Campaign UI     │  │    replies/        │  │    posts          │  │
│  │  - Analytics UI    │  │  - /api/campaigns/ │  │  - token-refresh  │  │
│  │  - Settings UI     │  │  - /api/posts/     │  │  - engagement-    │  │
│  │                    │  │  - /api/analytics/ │  │    polling         │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  │
│           │                      │                      │            │
└───────────┼──────────────────────┼──────────────────────┼────────────┘
            │                      │                      │
            ▼                      ▼                      ▼
┌───────────────────┐  ┌───────────────────┐  ┌───────────────────────┐
│   Clerk            │  │  Supabase          │  │  Upstash Redis        │
│   (認証)           │  │  (PostgreSQL)      │  │  (ジョブキュー)       │
│                    │  │                    │  │                       │
│  - ユーザー認証    │  │  - データベース    │  │  - リプライ送信キュー │
│  - セッション管理  │  │  - RLS            │  │  - キャンペーン処理   │
│  - JWT発行         │  │  - Edge Functions │  │  - レートリミット     │
│                    │  │  - pg_cron        │  │    カウンター          │
└───────────────────┘  └────────┬──────────┘  └───────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  Supabase Edge         │
                    │  Functions             │
                    │                        │
                    │  - Webhook処理         │
                    │  - バッチジョブ         │
                    └───────────────────────┘

  外部サービス連携:

  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐
  │  Meta Threads API  │  │  Stripe            │  │  Resend            │
  │                    │  │  (決済)            │  │  (メール)          │
  │  - Publishing API  │  │                    │  │                    │
  │  - Reply Mgmt API  │  │  - サブスクリプ    │  │  - トークン期限    │
  │  - Insights API    │  │    ション管理      │  │    通知              │
  │  - Webhook         │  │  - Webhook         │  │  - キャンペーン    │
  │  - OAuth 2.0       │  │    (課金イベント)  │  │    結果通知          │
  └────────┬──────────┘  └───────────────────┘  └───────────────────┘
           │
           │  Webhook (HTTPS POST)
           ▼
  ┌───────────────────┐
  │  /api/webhooks/    │
  │  threads           │
  │                    │
  │  署名検証          │
  │  (X-Hub-Signature  │
  │   -256)            │
  └───────────────────┘
```

### 2.2 データフロー概要

```
[ユーザーアクション on Threads]
    │
    ├── mentions / replies ──── Webhook ──────────────┐
    │                                                   │
    ├── likes / reposts / quotes ── ポーリング ────────┤
    │                              (5分間隔)           │
    │                                                   ▼
    │                                          ┌─────────────────┐
    │                                          │ イベント正規化   │
    │                                          │ (共通形式に変換) │
    │                                          └────────┬────────┘
    │                                                   │
    │                                                   ▼
    │                                          ┌─────────────────┐
    │                                          │ トリガーマッチ   │
    │                                          │ (auto_replies    │
    │                                          │  / campaigns)    │
    │                                          └────────┬────────┘
    │                                                   │
    │                                          ┌────────┴────────┐
    │                                          ▼                  ▼
    │                                   ┌───────────┐    ┌───────────┐
    │                                   │ リプライ   │    │ 抽選処理  │
    │                                   │ キュー投入 │    │ 実行      │
    │                                   └─────┬─────┘    └─────┬─────┘
    │                                         │                  │
    │                                         ▼                  ▼
    │                                   ┌───────────┐    ┌───────────┐
    │                                   │ レートリミ │    │ 結果リプ  │
    │                                   │ ットチェック│    │ ライ送信  │
    │                                   └─────┬─────┘    └───────────┘
    │                                         │
    │                                         ▼
    │                                   ┌───────────┐
    │                                   │ Threads    │
    │                                   │ Reply API  │
    │                                   │ 送信       │
    │                                   └─────┬─────┘
    │                                         │
    │                                         ▼
    │                                   ┌───────────┐
    │                                   │ action_    │
    │                                   │ logs記録   │
    │                                   └───────────┘
```

---

## 3. Threads API統合仕様

### 3.1 トリガー検知方式（FR-001参照）

CoordinatorAgent分析結果(C1)を反映: Meta Threads Webhookは `mentions` と `replies` のみ確実にサポート。いいね・リポスト・引用RTはWebhook非対応のため、**ハイブリッド方式**を採用する。

| トリガー種別 | 検知方式 | 遅延 | 備考 |
|-------------|---------|------|------|
| リプライ (reply) | **Webhook** | < 3s | `replies` フィールド購読 |
| メンション (mention) | **Webhook** | < 3s | `mentions` フィールド購読 |
| いいね (like) | **ポーリング** | 最大5分 | Engagement Polling Cronジョブ |
| リポスト (repost) | **ポーリング** | 最大5分 | Engagement Polling Cronジョブ |
| 引用リポスト (quote) | **ポーリング** | 最大5分 | Engagement Polling Cronジョブ |

### 3.2 Webhookエンドポイント仕様

**エンドポイント**: `POST /api/webhooks/threads`

#### Webhook検証 (GET) - サブスクリプション登録時

```
GET /api/webhooks/threads?hub.mode=subscribe&hub.verify_token=<VERIFY_TOKEN>&hub.challenge=<CHALLENGE>
```

レスポンス: `hub.challenge` の値をそのまま返す（200 OK、Content-Type: text/plain）

#### イベント受信 (POST) - 署名検証

**署名検証手順**:
1. リクエストヘッダー `X-Hub-Signature-256` を取得
2. リクエストボディを `App Secret` でHMAC-SHA256ハッシュ生成
3. `sha256=<hash>` 形式で比較
4. 不一致の場合は `403 Forbidden` を返す

```typescript
// lib/threads/webhook.ts
import crypto from 'crypto';

interface WebhookVerifyParams {
  mode: string;
  verifyToken: string;
  challenge: string;
}

interface WebhookPayload {
  object: 'instagram'; // Threads WebhookはInstagramオブジェクトとして配信
  entry: WebhookEntry[];
}

interface WebhookEntry {
  id: string;        // Threads User ID
  time: number;      // Unix timestamp
  changes: WebhookChange[];
}

interface WebhookChange {
  field: 'mentions' | 'replies';
  value: {
    from: {
      id: string;
      username: string;
    };
    media: {
      id: string;       // Media ID (投稿ID)
      media_product_type: 'THREADS';
    };
    text?: string;      // リプライ本文（含まれない場合あり → H3対応）
    timestamp: string;
  };
}

export function verifyWebhookSignature(
  body: string,
  signature: string,
  appSecret: string
): boolean {
  const expectedSignature = 'sha256=' +
    crypto.createHmac('sha256', appSecret).update(body).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export function verifySubscription(params: WebhookVerifyParams): string | null {
  if (
    params.mode === 'subscribe' &&
    params.verifyToken === process.env.THREADS_WEBHOOK_VERIFY_TOKEN
  ) {
    return params.challenge;
  }
  return null;
}
```

#### 複数アカウントWebhook (M2対応)

MetaアプリはWebhookエンドポイントを1つしか持てない。受信時に `entry[].id`（Threads User ID）で逆引きして `threads_accounts` テーブルに紐付ける。

```typescript
// Webhook受信時のアカウント特定
async function resolveAccount(threadsUserId: string) {
  const { data: account } = await supabase
    .from('threads_accounts')
    .select('*')
    .eq('threads_user_id', threadsUserId)
    .eq('is_active', true)
    .single();

  if (!account) {
    console.error(`Unknown threads_user_id: ${threadsUserId}`);
    return null;
  }
  return account;
}
```

### 3.3 エンゲージメントポーリング設計 (C1対応)

Webhook非対応のエンゲージメント（いいね、リポスト、引用RT）は、Cronジョブで定期ポーリングする。

**Cronジョブ**: `engagement-polling`
**実行間隔**: 5分ごと
**対象**: `is_active = true` かつ `trigger_config` にポーリング対象トリガーを含む `auto_replies` / `campaigns`

```typescript
// api/cron/engagement-polling/route.ts
interface EngagementPollingJob {
  // 処理フロー:
  // 1. auto_replies + campaigns からポーリング対象を取得
  // 2. 対象投稿ごとに Threads API でエンゲージメントを取得
  // 3. 前回ポーリング以降の新規いいね/リポスト/引用を検出
  // 4. 新規イベントをイベント正規化 → トリガーマッチへ流す
}

// ポーリング状態管理テーブル
// engagement_polling_state で最終チェック時刻を管理
```

**Threads API呼び出し**:
- `GET /{media-id}?fields=like_count,repost_count,quote_count` で集計値取得
- `GET /{media-id}/quotes` で引用リポスト一覧取得
- いいね/リポストの個別ユーザー一覧は取得不可 → 差分検出はカウント差分ベース

**制限事項**: いいね・リポストは個別ユーザーの特定ができないため、カウント増加を検出した場合にオートリプライのトリガーとしては使用できない場合がある。設計上は「リプライ・メンション」をWebhookで確実に処理し、いいね・リポストトリガーは**ベストエフォート**として位置づける。

### 3.4 Meta OAuth 2.0フロー（FR-008参照）

#### トークンライフサイクル (H4対応)

```
[ユーザー] ──→ [Meta Login Dialog]
                    │
              Authorization Code
                    │
                    ▼
        ┌───────────────────────┐
        │ 短期トークン取得       │  有効期間: 1時間
        │ POST /oauth/access_   │
        │ token                 │
        └───────────┬───────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │ 長期トークン交換       │  有効期間: 60日
        │ GET /access_token     │
        │ ?grant_type=          │
        │  th_exchange_token    │
        └───────────┬───────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │ AES-256-GCM暗号化    │
        │ → threads_accounts    │
        │   .access_token_      │
        │   encrypted に保存    │
        └───────────┬───────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │ 自動更新Cronジョブ     │  期限14日前に実行
        │ GET /access_token     │
        │ ?grant_type=          │
        │  th_exchange_token    │
        │                       │
        │ 失敗時: 最大3回リトライ│
        │ 3回失敗: ユーザーに   │
        │ 再連携通知メール送信   │
        │                       │
        │ 楽観的ロック:          │
        │ updated_at チェックで  │
        │ 競合防止               │
        └───────────────────────┘
```

#### OAuth必要スコープ

```
threads_basic              - プロフィール情報取得
threads_content_publish    - 投稿・リプライ送信
threads_manage_insights    - インサイト取得 + フォロワーデモグラフィック
threads_manage_replies     - リプライ管理（非表示等）
threads_read_replies       - リプライ読み取り
```

#### OAuth実装

```typescript
// lib/threads/oauth.ts
interface ThreadsOAuthConfig {
  clientId: string;       // THREADS_APP_ID
  clientSecret: string;   // THREADS_APP_SECRET
  redirectUri: string;    // /api/auth/threads/callback
  scopes: string[];
}

interface ShortLivedToken {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;     // 秒 (3600)
}

interface LongLivedToken {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;     // 秒 (5184000 = 60日)
}

// 認可URL生成
function getAuthorizationUrl(config: ThreadsOAuthConfig, state: string): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(','),
    response_type: 'code',
    state,
  });
  return `https://threads.net/oauth/authorize?${params.toString()}`;
}

// 短期トークン取得
async function exchangeCodeForToken(
  code: string,
  config: ThreadsOAuthConfig
): Promise<ShortLivedToken> {
  const response = await fetch('https://graph.threads.net/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: config.redirectUri,
      code,
    }),
  });
  return response.json();
}

// 長期トークン交換
async function exchangeForLongLivedToken(
  shortLivedToken: string,
  config: ThreadsOAuthConfig
): Promise<LongLivedToken> {
  const params = new URLSearchParams({
    grant_type: 'th_exchange_token',
    client_secret: config.clientSecret,
    access_token: shortLivedToken,
  });
  const response = await fetch(
    `https://graph.threads.net/access_token?${params.toString()}`
  );
  return response.json();
}

// トークン更新 (H4: 楽観的ロック付き)
async function refreshLongLivedToken(
  currentToken: string,
  accountId: string,
  expectedUpdatedAt: string
): Promise<LongLivedToken | null> {
  // 楽観的ロック: updated_atが変わっていないことを確認
  const { data: account } = await supabase
    .from('threads_accounts')
    .select('updated_at')
    .eq('id', accountId)
    .single();

  if (account?.updated_at !== expectedUpdatedAt) {
    // 他のプロセスが既に更新済み → スキップ
    return null;
  }

  const params = new URLSearchParams({
    grant_type: 'th_exchange_token',
    access_token: currentToken,
  });
  const response = await fetch(
    `https://graph.threads.net/refresh_access_token?${params.toString()}`
  );
  return response.json();
}
```

---

## 4. データベース詳細設計

### 4.1 テーブル定義 (DDL)

#### users テーブル

```sql
-- ユーザーテーブル (FR-007)
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id   TEXT NOT NULL UNIQUE,
  email           TEXT NOT NULL,
  display_name    TEXT,
  plan            TEXT NOT NULL DEFAULT 'free'
                    CHECK (plan IN ('free', 'starter', 'pro')),
  trial_ends_at   TIMESTAMPTZ,
  stripe_customer_id      TEXT UNIQUE,
  stripe_subscription_id  TEXT UNIQUE,
  stripe_price_id         TEXT,
  subscription_status     TEXT DEFAULT 'inactive'
                    CHECK (subscription_status IN (
                      'active', 'inactive', 'past_due', 'canceled', 'trialing'
                    )),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_clerk_user_id ON users (clerk_user_id);
CREATE INDEX idx_users_stripe_customer_id ON users (stripe_customer_id);
CREATE INDEX idx_users_plan ON users (plan);
```

#### threads_accounts テーブル

```sql
-- Threads連携アカウント (FR-008)
CREATE TABLE threads_accounts (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  threads_user_id         TEXT NOT NULL,
  threads_username        TEXT NOT NULL,
  profile_picture_url     TEXT,
  access_token_encrypted  TEXT NOT NULL,
  token_expires_at        TIMESTAMPTZ NOT NULL,
  token_refresh_attempts  INTEGER NOT NULL DEFAULT 0,
  webhook_subscription_id TEXT,
  is_active               BOOLEAN NOT NULL DEFAULT true,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (user_id, threads_user_id)
);

CREATE INDEX idx_threads_accounts_user_id ON threads_accounts (user_id);
CREATE INDEX idx_threads_accounts_threads_user_id ON threads_accounts (threads_user_id);
CREATE INDEX idx_threads_accounts_token_expires ON threads_accounts (token_expires_at)
  WHERE is_active = true;
```

#### auto_replies テーブル

```sql
-- オートリプライ設定 (FR-001)
CREATE TABLE auto_replies (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  threads_account_id  UUID NOT NULL REFERENCES threads_accounts(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  trigger_config      JSONB NOT NULL,
  target_post_id      TEXT,               -- null = 全投稿対象
  message_templates   JSONB NOT NULL,
  reply_restriction   TEXT NOT NULL DEFAULT 'all'
                        CHECK (reply_restriction IN ('all', 'followers_only')),
  include_media       BOOLEAN NOT NULL DEFAULT false,
  media_url           TEXT,
  is_active           BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_auto_replies_user_id ON auto_replies (user_id);
CREATE INDEX idx_auto_replies_threads_account_id ON auto_replies (threads_account_id);
CREATE INDEX idx_auto_replies_active ON auto_replies (threads_account_id, is_active)
  WHERE is_active = true;
CREATE INDEX idx_auto_replies_target_post ON auto_replies (target_post_id)
  WHERE target_post_id IS NOT NULL;
```

#### campaigns テーブル

```sql
-- 抽選キャンペーン (FR-003)
CREATE TABLE campaigns (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  threads_account_id  UUID NOT NULL REFERENCES threads_accounts(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  type                TEXT NOT NULL
                        CHECK (type IN ('instant_reply', 'instant_web')),
  target_post_id      TEXT NOT NULL,
  trigger_config      JSONB NOT NULL,
  win_rate            DECIMAL(5,4) NOT NULL CHECK (win_rate >= 0 AND win_rate <= 1),
  max_winners         INTEGER,            -- null = 無制限
  current_winners     INTEGER NOT NULL DEFAULT 0,
  win_message         TEXT NOT NULL,
  lose_message        TEXT NOT NULL,
  web_result_config   JSONB,              -- instant_web用設定
  starts_at           TIMESTAMPTZ NOT NULL,
  ends_at             TIMESTAMPTZ NOT NULL,
  status              TEXT NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft', 'active', 'paused', 'ended')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT campaigns_dates_check CHECK (ends_at > starts_at)
);

CREATE INDEX idx_campaigns_user_id ON campaigns (user_id);
CREATE INDEX idx_campaigns_threads_account_id ON campaigns (threads_account_id);
CREATE INDEX idx_campaigns_status ON campaigns (status);
CREATE INDEX idx_campaigns_active ON campaigns (threads_account_id, status, starts_at, ends_at)
  WHERE status = 'active';
CREATE INDEX idx_campaigns_target_post ON campaigns (target_post_id);
```

#### campaign_entries テーブル (H2: lottery_token追加)

```sql
-- キャンペーン参加者 (FR-003)
CREATE TABLE campaign_entries (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id         UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  threads_user_id     TEXT NOT NULL,
  threads_username    TEXT NOT NULL,
  action_type         TEXT NOT NULL,       -- reply / repost / like / quote
  is_winner           BOOLEAN,             -- null = 未抽選, true = 当選, false = 落選
  notified            BOOLEAN NOT NULL DEFAULT false,
  lottery_token       UUID,                -- H2: Web遷移型抽選トークン
  lottery_token_expires_at TIMESTAMPTZ,    -- H2: トークン有効期限 (24時間)
  lottery_result_viewed BOOLEAN NOT NULL DEFAULT false,
  entry_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (campaign_id, threads_user_id)   -- 重複参加防止
);

CREATE INDEX idx_campaign_entries_campaign_id ON campaign_entries (campaign_id);
CREATE INDEX idx_campaign_entries_threads_user ON campaign_entries (threads_user_id);
CREATE INDEX idx_campaign_entries_lottery_token ON campaign_entries (lottery_token)
  WHERE lottery_token IS NOT NULL;
CREATE INDEX idx_campaign_entries_winner ON campaign_entries (campaign_id, is_winner)
  WHERE is_winner = true;
```

#### scheduled_posts テーブル

```sql
-- 予約投稿 (FR-004)
CREATE TABLE scheduled_posts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  threads_account_id  UUID NOT NULL REFERENCES threads_accounts(id) ON DELETE CASCADE,
  content             TEXT NOT NULL,
  media_type          TEXT NOT NULL DEFAULT 'text'
                        CHECK (media_type IN (
                          'text', 'image', 'video', 'carousel', 'gif'
                        )),
  media_urls          JSONB,               -- メディアURL配列
  poll_options        JSONB,               -- 投票選択肢 (FR-005)
  hashtag             TEXT,                -- ハッシュタグ (1つまで)
  topic_tag           TEXT,                -- トピックタグ
  location_id         TEXT,                -- 位置情報ID
  scheduled_at        TIMESTAMPTZ NOT NULL,
  timezone            TEXT NOT NULL DEFAULT 'Asia/Tokyo',
  auto_reply_id       UUID REFERENCES auto_replies(id) ON DELETE SET NULL,
  is_threadstorm      BOOLEAN NOT NULL DEFAULT false,
  threadstorm_posts   JSONB,               -- 連続投稿内容配列
  status              TEXT NOT NULL DEFAULT 'scheduled'
                        CHECK (status IN (
                          'scheduled', 'publishing', 'posted', 'failed', 'canceled'
                        )),
  threads_post_id     TEXT,                -- 投稿後のThreads投稿ID
  error_message       TEXT,
  retry_count         INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_scheduled_posts_user_id ON scheduled_posts (user_id);
CREATE INDEX idx_scheduled_posts_scheduled ON scheduled_posts (scheduled_at, status)
  WHERE status = 'scheduled';
CREATE INDEX idx_scheduled_posts_threads_account ON scheduled_posts (threads_account_id);
```

#### action_logs テーブル

```sql
-- 送信ログ (FR-001, FR-003, FR-004)
-- ※要件定義からの変更:
--   reply_sent → auto_reply_sent（明示性向上）
--   FR-002対応で reply_hidden / reply_unhidden を追加
CREATE TABLE action_logs (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  threads_account_id        UUID NOT NULL REFERENCES threads_accounts(id) ON DELETE CASCADE,
  auto_reply_id             UUID REFERENCES auto_replies(id) ON DELETE SET NULL,
  campaign_id               UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  scheduled_post_id         UUID REFERENCES scheduled_posts(id) ON DELETE SET NULL,
  action_type               TEXT NOT NULL
                              CHECK (action_type IN (
                                'auto_reply_sent', 'campaign_reply_sent',
                                'post_published', 'reply_hidden', 'reply_unhidden'
                              )),
  target_threads_user_id    TEXT,
  target_threads_username   TEXT,
  trigger_type              TEXT,            -- reply / mention / like / repost / quote
  trigger_detection_method  TEXT,            -- webhook / polling
  message_content           TEXT,
  status                    TEXT NOT NULL DEFAULT 'queued'
                              CHECK (status IN (
                                'success', 'failed', 'queued', 'rate_limited', 'retrying'
                              )),
  error_message             TEXT,
  threads_api_response_id   TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_action_logs_user_id ON action_logs (user_id);
CREATE INDEX idx_action_logs_created ON action_logs (user_id, created_at DESC);
CREATE INDEX idx_action_logs_status ON action_logs (status)
  WHERE status IN ('queued', 'retrying', 'rate_limited');
CREATE INDEX idx_action_logs_auto_reply ON action_logs (auto_reply_id)
  WHERE auto_reply_id IS NOT NULL;
CREATE INDEX idx_action_logs_campaign ON action_logs (campaign_id)
  WHERE campaign_id IS NOT NULL;
```

#### api_usage_hourly テーブル (H1: ローリングウィンドウ対応)

```sql
-- API利用量 (NFR-004) - 時間単位分割 (H1対応)
CREATE TABLE api_usage_hourly (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  threads_account_id  UUID NOT NULL REFERENCES threads_accounts(id) ON DELETE CASCADE,
  hour_bucket         TIMESTAMPTZ NOT NULL,  -- 時間バケット (例: 2026-03-04 14:00:00)
  post_count          INTEGER NOT NULL DEFAULT 0,
  reply_count         INTEGER NOT NULL DEFAULT 0,
  api_call_count      INTEGER NOT NULL DEFAULT 0,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (threads_account_id, hour_bucket)
);

CREATE INDEX idx_api_usage_hourly_account ON api_usage_hourly (threads_account_id, hour_bucket DESC);

-- 直近24時間の利用量を高速取得するView
CREATE OR REPLACE VIEW api_usage_rolling_24h AS
SELECT
  threads_account_id,
  SUM(post_count) AS total_posts_24h,
  SUM(reply_count) AS total_replies_24h,
  SUM(api_call_count) AS total_api_calls_24h,
  250 - SUM(post_count + reply_count) AS remaining_posts
FROM api_usage_hourly
WHERE hour_bucket > now() - INTERVAL '24 hours'
GROUP BY threads_account_id;
```

#### engagement_polling_state テーブル (C1追加)

```sql
-- エンゲージメントポーリング状態管理 (C1対応)
CREATE TABLE engagement_polling_state (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  threads_account_id  UUID NOT NULL REFERENCES threads_accounts(id) ON DELETE CASCADE,
  target_post_id      TEXT NOT NULL,
  last_like_count     INTEGER NOT NULL DEFAULT 0,
  last_repost_count   INTEGER NOT NULL DEFAULT 0,
  last_quote_count    INTEGER NOT NULL DEFAULT 0,
  last_polled_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (threads_account_id, target_post_id)
);

CREATE INDEX idx_engagement_polling_account ON engagement_polling_state (threads_account_id);
```

#### ng_words テーブル

```sql
-- NGワード (FR-002)
CREATE TABLE ng_words (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  word        TEXT NOT NULL,
  is_regex    BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (user_id, word)
);

CREATE INDEX idx_ng_words_user_id ON ng_words (user_id);
```

#### post_insights テーブル

```sql
-- 投稿インサイト (FR-006)
CREATE TABLE post_insights (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  threads_account_id  UUID NOT NULL REFERENCES threads_accounts(id) ON DELETE CASCADE,
  threads_post_id     TEXT NOT NULL,
  views               INTEGER NOT NULL DEFAULT 0,
  likes               INTEGER NOT NULL DEFAULT 0,
  replies             INTEGER NOT NULL DEFAULT 0,
  reposts             INTEGER NOT NULL DEFAULT 0,
  quotes              INTEGER NOT NULL DEFAULT 0,
  shares              INTEGER NOT NULL DEFAULT 0,
  fetched_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (threads_account_id, threads_post_id)
);

CREATE INDEX idx_post_insights_account ON post_insights (threads_account_id);
CREATE INDEX idx_post_insights_fetched ON post_insights (fetched_at);
```

#### follower_demographics テーブル

```sql
-- フォロワーデモグラフィック (FR-006, C2対応)
CREATE TABLE follower_demographics (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  threads_account_id  UUID NOT NULL REFERENCES threads_accounts(id) ON DELETE CASCADE,
  demographic_type    TEXT NOT NULL
                        CHECK (demographic_type IN ('age', 'gender', 'country', 'city')),
  breakdown           JSONB NOT NULL,     -- { "25-34": 35, "35-44": 28, ... }
  fetched_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (threads_account_id, demographic_type)
);

CREATE INDEX idx_follower_demographics_account ON follower_demographics (threads_account_id);
```

### 4.2 RLSポリシー (Clerk JWT連携)

```sql
-- RLS有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_hourly ENABLE ROW LEVEL SECURITY;
ALTER TABLE ng_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE follower_demographics ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_polling_state ENABLE ROW LEVEL SECURITY;

-- Clerk JWT からユーザーIDを取得する関数
CREATE OR REPLACE FUNCTION auth.clerk_user_id()
RETURNS TEXT AS $$
  SELECT coalesce(
    current_setting('request.jwt.claims', true)::json->>'sub',
    ''
  );
$$ LANGUAGE sql STABLE;

-- ユーザーIDをUUIDで取得するヘルパー関数
CREATE OR REPLACE FUNCTION auth.current_user_id()
RETURNS UUID AS $$
  SELECT id FROM users WHERE clerk_user_id = auth.clerk_user_id();
$$ LANGUAGE sql STABLE;

-- users テーブル RLS
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (clerk_user_id = auth.clerk_user_id());
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (clerk_user_id = auth.clerk_user_id());

-- threads_accounts テーブル RLS
CREATE POLICY "threads_accounts_select_own" ON threads_accounts
  FOR SELECT USING (user_id = auth.current_user_id());
CREATE POLICY "threads_accounts_insert_own" ON threads_accounts
  FOR INSERT WITH CHECK (user_id = auth.current_user_id());
CREATE POLICY "threads_accounts_update_own" ON threads_accounts
  FOR UPDATE USING (user_id = auth.current_user_id());
CREATE POLICY "threads_accounts_delete_own" ON threads_accounts
  FOR DELETE USING (user_id = auth.current_user_id());

-- auto_replies テーブル RLS
CREATE POLICY "auto_replies_select_own" ON auto_replies
  FOR SELECT USING (user_id = auth.current_user_id());
CREATE POLICY "auto_replies_insert_own" ON auto_replies
  FOR INSERT WITH CHECK (user_id = auth.current_user_id());
CREATE POLICY "auto_replies_update_own" ON auto_replies
  FOR UPDATE USING (user_id = auth.current_user_id());
CREATE POLICY "auto_replies_delete_own" ON auto_replies
  FOR DELETE USING (user_id = auth.current_user_id());

-- campaigns テーブル RLS
CREATE POLICY "campaigns_select_own" ON campaigns
  FOR SELECT USING (user_id = auth.current_user_id());
CREATE POLICY "campaigns_insert_own" ON campaigns
  FOR INSERT WITH CHECK (user_id = auth.current_user_id());
CREATE POLICY "campaigns_update_own" ON campaigns
  FOR UPDATE USING (user_id = auth.current_user_id());
CREATE POLICY "campaigns_delete_own" ON campaigns
  FOR DELETE USING (user_id = auth.current_user_id());

-- campaign_entries RLS (キャンペーンオーナーのみ閲覧)
-- campaign_entries: INSERTはCronジョブ（service_role）のみ。ユーザーからの直接INSERTは不可。
CREATE POLICY "campaign_entries_select_own" ON campaign_entries
  FOR SELECT USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE user_id = auth.current_user_id()
    )
  );

-- scheduled_posts テーブル RLS
CREATE POLICY "scheduled_posts_select_own" ON scheduled_posts
  FOR SELECT USING (user_id = auth.current_user_id());
CREATE POLICY "scheduled_posts_insert_own" ON scheduled_posts
  FOR INSERT WITH CHECK (user_id = auth.current_user_id());
CREATE POLICY "scheduled_posts_update_own" ON scheduled_posts
  FOR UPDATE USING (user_id = auth.current_user_id());
CREATE POLICY "scheduled_posts_delete_own" ON scheduled_posts
  FOR DELETE USING (user_id = auth.current_user_id());

-- action_logs テーブル RLS
CREATE POLICY "action_logs_select_own" ON action_logs
  FOR SELECT USING (user_id = auth.current_user_id());

-- api_usage_hourly テーブル RLS
CREATE POLICY "api_usage_hourly_select_own" ON api_usage_hourly
  FOR SELECT USING (
    threads_account_id IN (
      SELECT id FROM threads_accounts WHERE user_id = auth.current_user_id()
    )
  );

-- ng_words テーブル RLS
CREATE POLICY "ng_words_all_own" ON ng_words
  FOR ALL USING (user_id = auth.current_user_id());

-- post_insights テーブル RLS
CREATE POLICY "post_insights_select_own" ON post_insights
  FOR SELECT USING (
    threads_account_id IN (
      SELECT id FROM threads_accounts WHERE user_id = auth.current_user_id()
    )
  );

-- follower_demographics テーブル RLS
CREATE POLICY "follower_demographics_select_own" ON follower_demographics
  FOR SELECT USING (
    threads_account_id IN (
      SELECT id FROM threads_accounts WHERE user_id = auth.current_user_id()
    )
  );

-- engagement_polling_state テーブル RLS
-- 注: Cronジョブはservice_roleでアクセスするためRLSバイパス
CREATE POLICY "Users can view own polling state" ON engagement_polling_state
  FOR SELECT USING (
    threads_account_id IN (
      SELECT id FROM threads_accounts WHERE user_id = auth.current_user_id()
    )
  );

-- サービスロール用ポリシー (Webhook処理, Cronジョブ用)
-- service_role はRLSをバイパス (supabase admin client)
```

### 4.3 JSONBスキーマ TypeScript型定義 (M1対応)

```typescript
// types/database.ts

/** auto_replies.trigger_config の型定義 */
export interface TriggerConfig {
  events: TriggerEvent[];
  condition: 'any' | 'all';           // いずれか or すべて
  keywords?: string[];                 // キーワードフィルタ (リプライ時)
  keyword_match?: 'contains' | 'exact'; // キーワード一致方式
  filter_new_followers_only?: boolean; // 新規フォロワーのみ
}

export type TriggerEvent = 'reply' | 'mention' | 'like' | 'repost' | 'quote';

/** auto_replies.message_templates の型定義 */
export interface MessageTemplate {
  id: string;                          // テンプレートID (uuid)
  content: string;                     // テンプレート本文 (変数埋め込み可)
  weight: number;                      // ランダム選択時の重み (1-100)
  media_url?: string;                  // 画像URL (任意)
  link_url?: string;                   // リンクURL (任意)
}

/** campaigns.trigger_config の型定義 */
export interface CampaignTriggerConfig {
  required_actions: TriggerEvent[];    // 必須アクション
  condition: 'any' | 'all';
  required_keywords?: string[];        // 必須キーワード
  must_follow?: boolean;               // フォロー必須
}

/** campaigns.web_result_config の型定義 (instant_web用) */
export interface WebResultConfig {
  win_page_title: string;              // 当選ページタイトル
  win_page_body: string;               // 当選ページ本文
  win_page_image_url?: string;         // 当選ページ画像
  win_page_cta_text?: string;          // CTAボタンテキスト
  win_page_cta_url?: string;           // CTAリンク先
  lose_page_title: string;             // 落選ページタイトル
  lose_page_body: string;              // 落選ページ本文
  lose_page_image_url?: string;        // 落選ページ画像
}

/** scheduled_posts.media_urls の型定義 */
export type MediaUrls = string[];      // メディアURL配列 (最大20)

/** scheduled_posts.poll_options の型定義 (FR-005) */
export interface PollOptions {
  question?: string;                   // 投票の質問文 (任意)
  options: string[];                   // 選択肢 (2-4個)
}

/** scheduled_posts.threadstorm_posts の型定義 */
export interface ThreadstormPost {
  order: number;                       // 投稿順序 (1-based)
  content: string;                     // テキスト内容
  media_type?: 'image' | 'video' | 'gif';
  media_url?: string;
}

/** follower_demographics.breakdown の型定義 */
export type DemographicBreakdown = Record<string, number>;
// 例: { "25-34": 35, "35-44": 28, "18-24": 20, "45+": 17 }

/** テンプレート変数の定義 */
export interface TemplateVariables {
  username: string;       // {{username}} - Threadsユーザー名
  display_name: string;   // {{display_name}} - 表示名
  date: string;           // {{date}} - 日付 (YYYY-MM-DD)
  time: string;           // {{time}} - 時刻 (HH:MM)
  post_url: string;       // {{post_url}} - 対象投稿URL
  campaign_name: string;  // {{campaign_name}} - キャンペーン名
}
```

---

## 5. 認証・認可仕様

### 5.1 二層認証構造 (FR-007, FR-008)

```
┌────────────────────────────────────────────────────────┐
│                    認証レイヤー構造                      │
│                                                         │
│  Layer 1: Clerk認証 (ユーザー認証)                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │  - メール+パスワード                              │   │
│  │  - Google OAuth                                   │   │
│  │  - セッション管理                                  │   │
│  │  - JWT発行 → Supabase RLS連携                     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Layer 2: Meta OAuth 2.0 (Threads API認証)             │
│  ┌─────────────────────────────────────────────────┐   │
│  │  - Authorization Codeフロー                       │   │
│  │  - 短期→長期トークン交換                          │   │
│  │  - AES-256-GCM暗号化保存                          │   │
│  │  - 自動更新 (60日周期)                            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└────────────────────────────────────────────────────────┘
```

### 5.2 Clerk JWT → Supabase RLS連携方式

```typescript
// lib/supabase/server.ts
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

export async function createSupabaseServerClient() {
  const { getToken } = await auth();
  const supabaseToken = await getToken({ template: 'supabase' });

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${supabaseToken}`,
        },
      },
    }
  );
}
```

**Clerk JWT テンプレート設定** (Supabase用):
```json
{
  "sub": "{{user.id}}",
  "iss": "clerk",
  "iat": "{{time.now}}",
  "exp": "{{time.now + 3600}}"
}
```

### 5.3 トークン暗号化仕様 (AES-256-GCM)

```typescript
// lib/encryption.ts
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const ENCODING: BufferEncoding = 'hex';

export function encrypt(plaintext: string): string {
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'); // 32 bytes
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', ENCODING);
  encrypted += cipher.final(ENCODING);

  const tag = cipher.getAuthTag();

  // 形式: iv:tag:encrypted
  return [
    iv.toString(ENCODING),
    tag.toString(ENCODING),
    encrypted,
  ].join(':');
}

export function decrypt(encryptedData: string): string {
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
  const [ivHex, tagHex, encrypted] = encryptedData.split(':');

  const iv = Buffer.from(ivHex, ENCODING);
  const tag = Buffer.from(tagHex, ENCODING);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted, ENCODING, 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
```

**鍵管理**:
- 暗号化鍵は環境変数 `ENCRYPTION_KEY` に保存 (32バイト = 64文字hex)
- Vercel環境変数で管理 (暗号化済み)
- 鍵ローテーション時は全トークンの再暗号化が必要

---

## 6. コア機能仕様

### SP-001: オートリプライ (FR-001)

#### 概要

自分の投稿に対するユーザーアクション（リプライ、メンション、いいね、リポスト、引用RT）をトリガーに、自動でリプライを送信する。

#### トリガー種別ごとの検知方式

| トリガー | 検知方式 | 遅延 | ユーザー特定 | 備考 |
|---------|---------|------|-------------|------|
| reply | Webhook | < 3s | 可能 | Webhook `replies` フィールド |
| mention | Webhook | < 3s | 可能 | Webhook `mentions` フィールド |
| like | ポーリング | 最大5分 | 不可 | カウント差分のみ検出 |
| repost | ポーリング | 最大5分 | 不可 | カウント差分のみ検出 |
| quote | ポーリング | 最大5分 | 可能 | Quotes APIでユーザー特定可 |

**重要**: like/repostトリガーはユーザー特定不可のため、「リプライした人のうち、いいねもした人」のような条件での個別リプライ送信はできない。like/repostトリガーのオートリプライは元投稿へのセルフリプライ（全体向けお知らせ）として設計する。

#### テンプレート変数仕様

```typescript
// テンプレート変数の展開
const TEMPLATE_VARIABLES: Record<string, (ctx: ReplyContext) => string> = {
  '{{username}}':      (ctx) => ctx.triggerUser.username,
  '{{display_name}}':  (ctx) => ctx.triggerUser.displayName || ctx.triggerUser.username,
  '{{date}}':          (ctx) => formatDate(ctx.triggeredAt, 'YYYY-MM-DD'),
  '{{time}}':          (ctx) => formatDate(ctx.triggeredAt, 'HH:mm'),
  '{{post_url}}':      (ctx) => `https://threads.net/t/${ctx.targetPostId}`,
  '{{campaign_name}}': (ctx) => ctx.campaignName || '',
};

function expandTemplate(template: string, ctx: ReplyContext): string {
  let result = template;
  for (const [variable, resolver] of Object.entries(TEMPLATE_VARIABLES)) {
    result = result.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), resolver(ctx));
  }
  return result;
}
```

#### 送信キュー制御

```
[トリガー検知]
    │
    ▼
[トリガーマッチング]
    │ auto_replies テーブルから
    │ 条件一致する設定を検索
    ▼
[テンプレート選択]
    │ weight に基づく
    │ 加重ランダム選択
    ▼
[変数展開]
    │
    ▼
[レートリミットチェック]
    │ api_usage_hourly参照
    │ 残量あり?
    ├── Yes ──→ [Upstash Redis キュー投入]
    │                   │
    │                   ▼ (process-queue Cronが取得)
    │              [Threads Reply API送信]
    │                   │
    │                   ▼
    │              [action_logs記録]
    │              [api_usage_hourly更新]
    │
    └── No ───→ [action_logs記録 (status: rate_limited)]
                [キューに保留 (次回リセット後に再試行)]
```

#### Threads Reply API呼び出し

```typescript
// lib/threads/api.ts

interface ThreadsReplyParams {
  userId: string;       // Threads User ID
  mediaId: string;      // リプライ先のMedia ID
  text: string;         // リプライ本文
  imageUrl?: string;    // 画像URL (任意)
  linkUrl?: string;     // リンクURL (任意)
  accessToken: string;  // 復号済みアクセストークン
}

// Step 1: メディアコンテナ作成
async function createReplyContainer(params: ThreadsReplyParams): Promise<string> {
  const body: Record<string, string> = {
    media_type: params.imageUrl ? 'IMAGE' : 'TEXT',
    text: params.text,
    reply_to_id: params.mediaId,
    access_token: params.accessToken,
  };

  if (params.imageUrl) {
    body.image_url = params.imageUrl;
  }

  const response = await fetch(
    `https://graph.threads.net/v21.0/${params.userId}/threads`,
    { method: 'POST', body: new URLSearchParams(body) }
  );
  const data = await response.json();
  return data.id; // container_id
}

// Step 2: 公開
async function publishReply(
  userId: string,
  containerId: string,
  accessToken: string
): Promise<string> {
  const response = await fetch(
    `https://graph.threads.net/v21.0/${userId}/threads_publish`,
    {
      method: 'POST',
      body: new URLSearchParams({
        creation_id: containerId,
        access_token: accessToken,
      }),
    }
  );
  const data = await response.json();
  return data.id; // published media_id
}
```

### SP-002: リプライ管理 (FR-002)

#### 概要

投稿へのリプライを管理・モデレーションする。リプライの非表示/表示、NGワードフィルタによる自動非表示を含む。

#### リプライ非表示/表示 API

```typescript
// リプライの非表示切替
async function setReplyVisibility(
  mediaId: string,
  hide: boolean,
  accessToken: string
): Promise<void> {
  await fetch(
    `https://graph.threads.net/v21.0/${mediaId}/manage_reply`,
    {
      method: 'POST',
      body: new URLSearchParams({
        hide: hide.toString(),
        access_token: accessToken,
      }),
    }
  );
}
```

#### NGワードフィルタ

```typescript
interface NGWordFilter {
  checkMessage(text: string, userId: string): Promise<NGWordMatch[]>;
}

interface NGWordMatch {
  word: string;
  position: number;
  isRegex: boolean;
}

// Webhook受信時にリプライ本文をNGワードチェック
// マッチした場合は自動的に非表示にしてaction_logsに記録
```

#### リプライ本文取得 (H3対応)

Webhookペイロードにリプライ本文が含まれない場合、追加のGet APIコールで取得する。

```typescript
// H3: Webhookペイロードにtextが含まれない場合の追加取得
async function fetchReplyContent(
  mediaId: string,
  accessToken: string
): Promise<string> {
  const response = await fetch(
    `https://graph.threads.net/v21.0/${mediaId}?fields=text,username,timestamp&access_token=${accessToken}`
  );
  const data = await response.json();
  return data.text;
}
```

#### 一括返信 (H3対応)

一括返信はループ逐次送信で実装。250投稿/24h制限を消費することに注意。

```typescript
async function bulkReply(
  replies: Array<{ mediaId: string; text: string }>,
  threadsAccountId: string
): Promise<BulkReplyResult> {
  const results: BulkReplyResult = { success: 0, failed: 0, rateLimited: 0 };

  for (const reply of replies) {
    // 各送信前にレートリミットチェック
    const remaining = await getRemainingPosts(threadsAccountId);
    if (remaining <= 0) {
      results.rateLimited += (replies.length - results.success - results.failed);
      break;
    }

    try {
      await sendReply(reply);
      results.success++;
      // API負荷軽減のため最低100msウェイト
      await sleep(100);
    } catch (error) {
      results.failed++;
    }
  }

  return results;
}
```

### SP-003: 抽選キャンペーン (FR-003)

#### 即時抽選（リプライ型）フロー図

```
[ユーザーがキャンペーン投稿にアクション]
    │
    ▼
[Webhook / ポーリングで検知]
    │
    ▼
[campaigns テーブル照合]
    │ target_post_id 一致 & status = 'active'
    │ & starts_at <= now() <= ends_at
    ▼
[参加条件チェック]
    │ trigger_config.required_actions を満たすか
    │ must_follow チェック (Threads API)
    ▼
[重複チェック]
    │ campaign_entries の UNIQUE制約
    │ (campaign_id, threads_user_id)
    ├── 重複 ──→ [無視 (既に参加済み)]
    │
    ▼
[抽選処理]
    │ max_winners チェック
    │ (current_winners < max_winners)
    │
    │ ランダム判定: Math.random() < win_rate
    │
    ├── 当選 ──→ [is_winner = true]
    │              [current_winners + 1]
    │              [当選メッセージ リプライ送信]
    │
    └── 落選 ──→ [is_winner = false]
                  [落選メッセージ リプライ送信]
    │
    ▼
[campaign_entries 記録]
[action_logs 記録]
```

#### 即時抽選（Web遷移型）フロー図 + lottery_token仕様 (H2)

```
[ユーザーがキャンペーン投稿にアクション]
    │
    ▼
[Webhook / ポーリングで検知]
    │
    ▼
[campaigns テーブル照合 (type = 'instant_web')]
    │
    ▼
[参加条件チェック + 重複チェック]
    │
    ▼
[抽選処理]
    │ 当選/落選を判定 → campaign_entries に記録
    │
    ▼
[lottery_token 生成]
    │ UUID v4 生成
    │ lottery_token_expires_at = now() + 24時間
    │ campaign_entries に保存
    │
    ▼
[結果確認URLをリプライ送信]
    │ 「結果はこちら: https://{domain}/lottery/{campaignId}?token={lottery_token}」
    │
    ▼
[ユーザーがURLアクセス]
    │
    ▼
[W-001 抽選結果ページ]
    │ GET /api/lottery/{campaignId}?token={lottery_token}
    │
    │ 検証:
    │ 1. lottery_token が存在するか
    │ 2. lottery_token_expires_at > now() (有効期限内か)
    │ 3. 既に閲覧済みでないか (lottery_result_viewed)
    │
    ├── 有効 ──→ [当選/落選ページ表示]
    │             [lottery_result_viewed = true に更新]
    │             [web_result_config の内容で表示]
    │
    └── 無効 ──→ [期限切れ/無効ページ表示]
```

```typescript
// lottery_token 生成
async function generateLotteryToken(entryId: string): Promise<string> {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24時間後

  await supabase
    .from('campaign_entries')
    .update({
      lottery_token: token,
      lottery_token_expires_at: expiresAt.toISOString(),
    })
    .eq('id', entryId);

  return token;
}

// lottery_token 検証
async function validateLotteryToken(
  campaignId: string,
  token: string
): Promise<CampaignEntry | null> {
  const { data: entry } = await supabase
    .from('campaign_entries')
    .select('*, campaigns(*)')
    .eq('campaign_id', campaignId)
    .eq('lottery_token', token)
    .gt('lottery_token_expires_at', new Date().toISOString())
    .single();

  return entry;
}
```

### SP-004: 予約投稿 (FR-004)

#### Publishing API 2ステップフロー

```
[ユーザーが予約投稿作成]
    │
    ▼
[scheduled_posts テーブルに保存]
    │ status = 'scheduled'
    │
    ▼
[scheduled-posts Cronジョブ (1分間隔)]
    │ scheduled_at <= now() AND status = 'scheduled'
    │
    ▼
[status = 'publishing' に更新]
    │
    ▼
[レートリミットチェック]
    │
    ├── 残量なし ──→ [status = 'failed', error_message = 'rate_limit_exceeded']
    │
    ▼
[Step 1: メディアコンテナ作成]
    │ POST /{user_id}/threads
    │ {
    │   media_type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'CAROUSEL',
    │   text: content,
    │   image_url?: media_urls[0],
    │   video_url?: media_urls[0],
    │   children?: [carousel_item_ids],  // カルーセル時
    │   access_token
    │ }
    │
    ▼
[ステータス確認 (動画/カルーセルの場合)]
    │ GET /{container_id}?fields=status
    │ status = 'FINISHED' まで待機 (最大30秒)
    │
    ▼
[Step 2: 公開]
    │ POST /{user_id}/threads_publish
    │ { creation_id: container_id, access_token }
    │
    ▼
[成功]
    │ status = 'posted'
    │ threads_post_id = 返却されたmedia_id
    │ api_usage_hourly 更新
    │ action_logs 記録
    │
    ▼
[オートリプライ紐付け (auto_reply_id != null の場合)]
    │ auto_replies を有効化 (target_post_id = threads_post_id)
```

#### 投票付き投稿 (FR-005)

```typescript
// 投票付き投稿のコンテナ作成
async function createPollContainer(
  userId: string,
  text: string,
  pollOptions: PollOptions,
  accessToken: string
): Promise<string> {
  const body: Record<string, string> = {
    media_type: 'TEXT',
    text,
    access_token: accessToken,
  };

  // 投票選択肢を設定
  pollOptions.options.forEach((option, index) => {
    body[`poll_option_${index + 1}`] = option;
  });

  const response = await fetch(
    `https://graph.threads.net/v21.0/${userId}/threads`,
    { method: 'POST', body: new URLSearchParams(body) }
  );
  const data = await response.json();
  return data.id;
}
```

#### スレッドストーム仕様

```
[スレッドストーム予約]
    │ is_threadstorm = true
    │ threadstorm_posts = [{order: 1, content: ...}, {order: 2, content: ...}, ...]
    │
    ▼
[1件目投稿]
    │ 通常の予約投稿として投稿
    │ threads_post_id を記録
    │
    ▼
[2件目以降]
    │ reply_to_id = 前の投稿のmedia_id
    │ 順次リプライとして投稿
    │ 各投稿間に1秒ウェイト
    │
    ▼
[全件完了]
    │ status = 'posted'
    │ api_usage_hourly を投稿数分更新
```

### SP-005: 投票 (FR-005)

#### 概要

投票付き投稿の作成・結果管理を行う。Threads APIの投票機能（2025年7月追加）を活用する。

#### 投票結果取得

```typescript
// 投票結果取得
async function getPollResults(
  mediaId: string,
  accessToken: string
): Promise<PollResult> {
  const response = await fetch(
    `https://graph.threads.net/v21.0/${mediaId}?fields=poll&access_token=${accessToken}`
  );
  const data = await response.json();
  return data.poll;
}

interface PollResult {
  options: Array<{
    text: string;
    vote_count: number;
  }>;
  total_votes: number;
  is_voting_open: boolean;
}
```

#### 投票結果に基づくオートリプライ

投票者リストはAPI経由で取得不可（C2対応）。投票結果に基づくオートリプライは、投票数変化をトリガーとして元投稿へのセルフリプライ（「多くの方が選択肢Aを選びました!」等）として設計する。

### SP-006: 分析・レポート (FR-006)

#### 概要

投稿パフォーマンスとアカウントの成長を分析する。Threads Insights APIを活用し、データをキャッシュする。

#### データ取得仕様

```typescript
// 投稿インサイト取得
async function fetchPostInsights(
  mediaId: string,
  accessToken: string
): Promise<PostInsight> {
  const response = await fetch(
    `https://graph.threads.net/v21.0/${mediaId}/insights?metric=views,likes,replies,reposts,quotes,shares&access_token=${accessToken}`
  );
  return response.json();
}

// フォロワーデモグラフィック取得 (C2: threads_manage_insights スコープで取得)
async function fetchFollowerDemographics(
  userId: string,
  accessToken: string
): Promise<Demographics> {
  const metrics = ['follower_demographics'];
  const breakdowns = ['age', 'gender', 'country', 'city'];

  const response = await fetch(
    `https://graph.threads.net/v21.0/${userId}/threads_insights?metric=${metrics.join(',')}&breakdown=${breakdowns.join(',')}&access_token=${accessToken}`
  );
  return response.json();
}

// ベストタイム分析
interface BestTimeAnalysis {
  hourOfDay: number;      // 0-23
  dayOfWeek: number;      // 0-6
  avgEngagement: number;  // 平均エンゲージメント
}
```

#### データキャッシュ戦略

| データ種別 | キャッシュ有効期間 | 更新トリガー |
|-----------|------------------|-------------|
| 投稿インサイト | 1時間 | insights取得Cronジョブ (6時間間隔) |
| フォロワーデモグラフィック | 24時間 | insights取得Cronジョブ |
| API利用量 | リアルタイム | 各送信時に更新 |
| 送信ログ | リアルタイム | 各送信時に記録 |

### SP-007: 課金 (FR-007)

#### Stripe統合

```typescript
// lib/stripe/client.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

// プラン定義
export const PLANS = {
  free: {
    name: 'Free',
    priceId: null,
    limits: {
      threads_accounts: 1,
      auto_replies: 3,
      campaigns_per_month: 1,
      scheduled_posts_per_month: 10,
      analytics: 'basic',
      csv_export: false,
    },
  },
  starter: {
    name: 'Starter',
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    price: 4980,  // JPY
    limits: {
      threads_accounts: 3,
      auto_replies: Infinity,
      campaigns_per_month: Infinity,
      scheduled_posts_per_month: Infinity,
      analytics: 'detailed',
      csv_export: false,
    },
  },
  pro: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    price: 14800,  // JPY
    limits: {
      threads_accounts: 10,
      auto_replies: Infinity,
      campaigns_per_month: Infinity,
      scheduled_posts_per_month: Infinity,
      analytics: 'advanced',
      csv_export: true,
    },
  },
} as const;

export type PlanType = keyof typeof PLANS;
```

#### プラン制限チェック (M3対応)

```typescript
// 作成時にプラン制限をチェック
async function checkPlanLimit(
  userId: string,
  resource: 'threads_accounts' | 'auto_replies' | 'campaigns' | 'scheduled_posts'
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const user = await getUser(userId);
  const plan = PLANS[user.plan as PlanType];
  const limits = plan.limits;

  let current: number;
  let limit: number;

  switch (resource) {
    case 'threads_accounts':
      current = await countUserResource(userId, 'threads_accounts');
      limit = limits.threads_accounts;
      break;
    case 'auto_replies':
      current = await countUserResource(userId, 'auto_replies');
      limit = limits.auto_replies;
      break;
    case 'campaigns':
      current = await countMonthlyResource(userId, 'campaigns');
      limit = limits.campaigns_per_month;
      break;
    case 'scheduled_posts':
      current = await countMonthlyResource(userId, 'scheduled_posts');
      limit = limits.scheduled_posts_per_month;
      break;
  }

  return { allowed: current < limit, current, limit };
}

// ダウングレード時の処理 (M3)
// 既存設定を保持するが、制限超過分を無効化 (is_active = false)
async function handlePlanDowngrade(userId: string, newPlan: PlanType): Promise<void> {
  const limits = PLANS[newPlan].limits;

  // threads_accounts: 上限超過分を無効化
  const accounts = await supabase
    .from('threads_accounts')
    .select('id, created_at')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (accounts.data && accounts.data.length > limits.threads_accounts) {
    const toDeactivate = accounts.data.slice(limits.threads_accounts);
    await supabase
      .from('threads_accounts')
      .update({ is_active: false })
      .in('id', toDeactivate.map(a => a.id));
  }

  // auto_replies: 上限超過分を無効化
  if (limits.auto_replies !== Infinity) {
    const replies = await supabase
      .from('auto_replies')
      .select('id, created_at')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (replies.data && replies.data.length > limits.auto_replies) {
      const toDeactivate = replies.data.slice(limits.auto_replies);
      await supabase
        .from('auto_replies')
        .update({ is_active: false })
        .in('id', toDeactivate.map(a => a.id));
    }
  }
}
```

#### Stripe Webhook処理

```typescript
// api/webhooks/stripe/route.ts
const HANDLED_EVENTS = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
] as const;

async function handleStripeWebhook(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      await activateSubscription(session);
      break;
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      await updateSubscription(subscription);
      // プランダウングレードの場合は handlePlanDowngrade を呼ぶ
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await cancelSubscription(subscription);
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      await handlePaymentFailure(invoice);
      break;
    }
  }
}
```

### SP-008: Threadsアカウント連携 (FR-008)

#### 概要

Meta OAuth 2.0を用いてユーザーのThreadsアカウントを連携する。詳細なOAuthフローはセクション3.4参照。

#### 連携フロー

```
[ダッシュボード S-011]
    │
    ├── [アカウント連携ボタン]
    │       │
    │       ▼
    │   [Meta Login Dialog]
    │       │ 認可コード取得
    │       ▼
    │   [/api/auth/threads/callback]
    │       │ 短期トークン取得
    │       │ 長期トークン交換
    │       │ AES-256-GCM暗号化
    │       │ threads_accounts に保存
    │       │ Webhook購読登録
    │       ▼
    │   [ダッシュボードにリダイレクト]
    │
    ├── [連携済みアカウント一覧]
    │       │
    │       ├── アカウント切替
    │       ├── 連携解除 → トークン削除 + Webhook解除
    │       └── トークン状態表示
    │
    └── [複数アカウント管理]
            │ プランに応じた上限チェック (M3)
            │ Free: 1, Starter: 3, Pro: 10
```

### SP-009: ダッシュボード (FR-009)

#### 概要

全機能を一元管理するダッシュボード。API利用状況のリアルタイム表示、クイックアクション、直近の送信ログを含む。

#### ダッシュボードデータ取得

```typescript
// api/dashboard/route.ts
interface DashboardData {
  // API利用状況
  apiUsage: {
    postsUsed24h: number;
    postsLimit: number;        // 250
    remainingPosts: number;
    resetEstimate: string;     // 最も古いバケットの期限切れ時刻
    usagePercentage: number;
  };

  // 統計
  stats: {
    todayRepliesSent: number;
    todayCampaignEntries: number;
    activeAutoReplies: number;
    activeCampaigns: number;
    scheduledPosts: number;
  };

  // 直近の送信ログ (最新10件)
  recentLogs: ActionLog[];

  // アクティブなキャンペーンサマリー
  activeCampaigns: CampaignSummary[];

  // アカウント情報
  currentAccount: ThreadsAccount;
  allAccounts: ThreadsAccount[];
}
```

---

## 7. ジョブスケジューリング設計

### 7.1 Cronジョブ一覧

| ジョブ | エンドポイント | 実行間隔 | 処理内容 | FR参照 |
|--------|-------------|---------|---------|--------|
| 送信キュー処理 | `/api/cron/process-queue` | 1分 | Redis キューからリプライを取得し送信 | FR-001 |
| 予約投稿実行 | `/api/cron/scheduled-posts` | 1分 | 予定時刻に達した投稿を実行 | FR-004 |
| トークン更新 | `/api/cron/token-refresh` | 1日1回 | 期限14日前のOAuthトークンを更新 (H4) | FR-008 |
| API利用量集計 | `/api/cron/usage-aggregate` | 1時間 | 古いバケットのクリーンアップ | NFR-004 |
| インサイト取得 | `/api/cron/fetch-insights` | 6時間 | 投稿インサイト + デモグラフィック取得 | FR-006 |
| **エンゲージメントポーリング** | `/api/cron/engagement-polling` | **5分** | **いいね/リポスト/引用RT検知 (C1追加)** | FR-001 |
| キャンペーン終了処理 | `/api/cron/campaign-cleanup` | 1時間 | 期限切れキャンペーンのステータス更新 | FR-003 |

### 7.2 Vercel Cron設定

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/process-queue",
      "schedule": "* * * * *"
    },
    {
      "path": "/api/cron/scheduled-posts",
      "schedule": "* * * * *"
    },
    {
      "path": "/api/cron/token-refresh",
      "schedule": "0 3 * * *"
    },
    {
      "path": "/api/cron/usage-aggregate",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/fetch-insights",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/cron/engagement-polling",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/campaign-cleanup",
      "schedule": "0 * * * *"
    }
  ]
}
```

### 7.3 エンゲージメントポーリングジョブ詳細 (C1追加)

```typescript
// api/cron/engagement-polling/route.ts
export async function POST(request: Request) {
  // Cronジョブ認証チェック
  verifyAuthorizationHeader(request);

  // 1. ポーリング対象を取得
  //    - auto_replies で like/repost/quote トリガーが設定されているもの
  //    - campaigns で like/repost/quote が参加条件に含まれるもの
  const targets = await getPollingTargets();

  // 2. 対象ごとにエンゲージメントを取得
  for (const target of targets) {
    const account = await getThreadsAccount(target.threads_account_id);
    const token = decrypt(account.access_token_encrypted);

    // 現在のエンゲージメント数を取得
    const currentMetrics = await fetchMediaMetrics(target.target_post_id, token);

    // 前回の状態と比較
    const prevState = await getPollingState(
      target.threads_account_id,
      target.target_post_id
    );

    // 差分検出
    const likesDiff = currentMetrics.like_count - (prevState?.last_like_count ?? 0);
    const repostsDiff = currentMetrics.repost_count - (prevState?.last_repost_count ?? 0);
    const quotesDiff = currentMetrics.quote_count - (prevState?.last_quote_count ?? 0);

    // 引用RTの場合は個別ユーザーを特定可能
    if (quotesDiff > 0) {
      const newQuotes = await fetchNewQuotes(target.target_post_id, token, prevState?.last_polled_at);
      for (const quote of newQuotes) {
        await dispatchTriggerEvent({
          type: 'quote',
          threadsUserId: quote.from.id,
          threadsUsername: quote.from.username,
          targetPostId: target.target_post_id,
          detectionMethod: 'polling',
        });
      }
    }

    // いいね/リポストはカウント差分のみ (個別ユーザー特定不可)
    if (likesDiff > 0) {
      await dispatchAggregatedTriggerEvent({
        type: 'like',
        count: likesDiff,
        targetPostId: target.target_post_id,
        detectionMethod: 'polling',
      });
    }

    if (repostsDiff > 0) {
      await dispatchAggregatedTriggerEvent({
        type: 'repost',
        count: repostsDiff,
        targetPostId: target.target_post_id,
        detectionMethod: 'polling',
      });
    }

    // 状態更新
    await upsertPollingState(target.threads_account_id, target.target_post_id, {
      last_like_count: currentMetrics.like_count,
      last_repost_count: currentMetrics.repost_count,
      last_quote_count: currentMetrics.quote_count,
    });
  }

  return Response.json({ ok: true });
}
```

---

## 8. レートリミット管理仕様

### 8.1 250投稿/24h ローリングウィンドウ (H1対応)

Threads APIの制限は「直近24時間で250投稿（リプライ含む）」。固定日付ではなく**ローリングウィンドウ**方式で管理する。

#### ローリングウィンドウ設計

```
時間軸 →
  ┌───┬───┬───┬───┬───┬───┬───┬───┐
  │ H1│ H2│ H3│...│H22│H23│H24│NOW│
  │ 5 │ 3 │ 8 │   │ 2 │ 7 │ 4 │ * │  ← 各時間バケットの投稿数
  └───┴───┴───┴───┴───┴───┴───┴───┘
  ← 24時間前                     現在 →

  合計: SUM(post_count) for H1..NOW
  残量: 250 - 合計
  次回リセット: H1バケットが24時間経過する時刻
```

#### 実装

```typescript
// lib/rate-limiter.ts

interface RateLimitStatus {
  used: number;
  limit: number;
  remaining: number;
  nextResetAt: Date;          // 最も古いバケットが期限切れになる時刻
  usagePercentage: number;
  status: 'ok' | 'warning' | 'critical' | 'exceeded';
}

async function getRateLimitStatus(threadsAccountId: string): Promise<RateLimitStatus> {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // 直近24時間の利用量を集計
  const { data } = await supabaseAdmin
    .from('api_usage_hourly')
    .select('hour_bucket, post_count, reply_count')
    .eq('threads_account_id', threadsAccountId)
    .gte('hour_bucket', twentyFourHoursAgo.toISOString())
    .order('hour_bucket', { ascending: true });

  const used = (data || []).reduce(
    (sum, row) => sum + row.post_count + row.reply_count, 0
  );
  const remaining = Math.max(0, 250 - used);

  // 次回リセット: 最も古いバケットの期限切れ時刻
  const oldestBucket = data?.[0]?.hour_bucket;
  const nextResetAt = oldestBucket
    ? new Date(new Date(oldestBucket).getTime() + 24 * 60 * 60 * 1000)
    : new Date();

  const usagePercentage = (used / 250) * 100;
  let status: RateLimitStatus['status'];
  if (usagePercentage >= 100) status = 'exceeded';
  else if (usagePercentage >= 90) status = 'critical';
  else if (usagePercentage >= 70) status = 'warning';
  else status = 'ok';

  return { used, limit: 250, remaining, nextResetAt, usagePercentage, status };
}

// 投稿/リプライ送信時のレートリミット記録
async function recordApiUsage(
  threadsAccountId: string,
  type: 'post' | 'reply'
): Promise<void> {
  const hourBucket = new Date();
  hourBucket.setMinutes(0, 0, 0); // 時間単位に丸める

  const column = type === 'post' ? 'post_count' : 'reply_count';

  // UPSERT: 存在すればインクリメント、なければ作成
  await supabaseAdmin.rpc('increment_api_usage', {
    p_threads_account_id: threadsAccountId,
    p_hour_bucket: hourBucket.toISOString(),
    p_column: column,
  });
}

// Meta APIの X-App-Usage ヘッダー併用 (H1)
function parseAppUsageHeader(headers: Headers): AppUsage | null {
  const usage = headers.get('x-app-usage');
  if (!usage) return null;
  return JSON.parse(usage) as AppUsage;
}

interface AppUsage {
  call_count: number;           // アプリ全体のAPI呼び出し割合 (%)
  total_cputime: number;        // CPU時間割合 (%)
  total_time: number;           // 処理時間割合 (%)
}
```

#### PostgreSQL関数

```sql
-- api_usage_hourly のインクリメント関数
CREATE OR REPLACE FUNCTION increment_api_usage(
  p_threads_account_id UUID,
  p_hour_bucket TIMESTAMPTZ,
  p_column TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO api_usage_hourly (threads_account_id, hour_bucket, post_count, reply_count)
  VALUES (p_threads_account_id, p_hour_bucket, 0, 0)
  ON CONFLICT (threads_account_id, hour_bucket) DO NOTHING;

  IF p_column = 'post_count' THEN
    UPDATE api_usage_hourly
    SET post_count = post_count + 1, updated_at = now()
    WHERE threads_account_id = p_threads_account_id
      AND hour_bucket = p_hour_bucket;
  ELSIF p_column = 'reply_count' THEN
    UPDATE api_usage_hourly
    SET reply_count = reply_count + 1, updated_at = now()
    WHERE threads_account_id = p_threads_account_id
      AND hour_bucket = p_hour_bucket;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 古いバケットのクリーンアップ (usage-aggregate Cronで実行)
CREATE OR REPLACE FUNCTION cleanup_old_api_usage() RETURNS VOID AS $$
BEGIN
  DELETE FROM api_usage_hourly
  WHERE hour_bucket < now() - INTERVAL '48 hours';
END;
$$ LANGUAGE plpgsql;
```

---

## 9. API仕様詳細

### 9.1 Public API（認証不要）

#### GET /api/lottery/[campaignId]

抽選結果ページ用データ取得 (FR-003, SP-003)

**クエリパラメータ**:
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| token | string | Yes | lottery_token (UUID) |

**リクエスト例**:
```
GET /api/lottery/550e8400-e29b-41d4-a716-446655440000?token=7c9e6679-7425-40de-944b-e07fc1f90ae7
```

**レスポンス例 (200 OK - 当選)**:
```json
{
  "status": "winner",
  "campaign": {
    "name": "フォロー&リプライキャンペーン",
    "brandName": "Sample Brand"
  },
  "result": {
    "title": "おめでとうございます!",
    "body": "Amazonギフト券1,000円分が当選しました!",
    "imageUrl": "https://example.com/win-image.jpg",
    "ctaText": "ギフト券を受け取る",
    "ctaUrl": "https://example.com/claim"
  }
}
```

**レスポンス例 (200 OK - 落選)**:
```json
{
  "status": "loser",
  "campaign": {
    "name": "フォロー&リプライキャンペーン",
    "brandName": "Sample Brand"
  },
  "result": {
    "title": "残念...",
    "body": "今回は落選でした。次回もチャレンジしてください!",
    "imageUrl": null
  }
}
```

**レスポンス例 (410 Gone)**:
```json
{
  "error": "token_expired",
  "message": "抽選結果の閲覧期限が切れました"
}
```

### 9.2 User API（Clerk認証必須）

全エンドポイントに `Authorization: Bearer <clerk_session_token>` が必要。

#### GET /api/threads-accounts

Threads連携アカウント一覧取得 (FR-008, SP-008)

**レスポンス例 (200 OK)**:
```json
{
  "accounts": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "threadsUserId": "123456789",
      "threadsUsername": "myaccount",
      "profilePictureUrl": "https://scontent.cdninstagram.com/...",
      "isActive": true,
      "tokenExpiresAt": "2026-05-01T00:00:00Z",
      "tokenStatus": "valid",
      "createdAt": "2026-03-04T10:00:00Z"
    }
  ]
}
```

#### POST /api/threads-accounts

Threadsアカウント連携開始（OAuth認可URL取得） (FR-008, SP-008)

**リクエスト例**:
```json
{
  "action": "initiate_oauth"
}
```

**レスポンス例 (200 OK)**:
```json
{
  "authorizationUrl": "https://threads.net/oauth/authorize?client_id=...&redirect_uri=...&scope=...&state=...",
  "state": "random-state-string"
}
```

#### DELETE /api/threads-accounts/[id]

連携解除 (FR-008, SP-008)

**レスポンス例 (200 OK)**:
```json
{
  "message": "アカウント連携を解除しました",
  "deactivated": {
    "autoReplies": 2,
    "campaigns": 1
  }
}
```

#### GET /api/auto-replies

オートリプライ設定一覧取得 (FR-001, SP-001)

**クエリパラメータ**:
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| threadsAccountId | string | No | フィルタ用 |
| isActive | boolean | No | 有効/無効フィルタ |
| page | number | No | ページ番号 (default: 1) |
| limit | number | No | 取得件数 (default: 20) |

**レスポンス例 (200 OK)**:
```json
{
  "autoReplies": [
    {
      "id": "ar-001",
      "name": "お礼リプライ",
      "threadsAccountId": "ta-001",
      "triggerConfig": {
        "events": ["reply", "mention"],
        "condition": "any",
        "keywords": ["ありがとう", "素晴らしい"],
        "keywordMatch": "contains"
      },
      "targetPostId": null,
      "messageTemplates": [
        {
          "id": "tmpl-001",
          "content": "{{username}}さん、ありがとうございます!",
          "weight": 50
        },
        {
          "id": "tmpl-002",
          "content": "{{username}}さん、嬉しいお言葉ありがとう!",
          "weight": 50
        }
      ],
      "replyRestriction": "all",
      "isActive": true,
      "stats": {
        "totalSent": 143,
        "successRate": 0.97,
        "last24hSent": 12
      },
      "createdAt": "2026-03-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "totalPages": 1
  }
}
```

#### POST /api/auto-replies

オートリプライ設定作成 (FR-001, SP-001)

**リクエスト例**:
```json
{
  "threadsAccountId": "ta-001",
  "name": "フォロワー感謝リプライ",
  "triggerConfig": {
    "events": ["reply"],
    "condition": "any",
    "keywords": ["最高", "素敵"],
    "keywordMatch": "contains"
  },
  "targetPostId": "17890012345678901",
  "messageTemplates": [
    {
      "content": "{{username}}さん、コメントありがとう! {{date}}",
      "weight": 100
    }
  ],
  "replyRestriction": "all",
  "isActive": true
}
```

**レスポンス例 (201 Created)**:
```json
{
  "id": "ar-002",
  "name": "フォロワー感謝リプライ",
  "createdAt": "2026-03-04T12:00:00Z"
}
```

#### GET /api/campaigns

キャンペーン一覧取得 (FR-003, SP-003)

**レスポンス例 (200 OK)**:
```json
{
  "campaigns": [
    {
      "id": "camp-001",
      "name": "春のフォロワー感謝祭",
      "type": "instant_reply",
      "status": "active",
      "targetPostId": "17890012345678901",
      "winRate": 0.1,
      "maxWinners": 100,
      "currentWinners": 23,
      "totalEntries": 456,
      "startsAt": "2026-03-01T00:00:00Z",
      "endsAt": "2026-03-31T23:59:59Z",
      "createdAt": "2026-02-28T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "totalPages": 1
  }
}
```

#### POST /api/campaigns

キャンペーン作成 (FR-003, SP-003)

**リクエスト例 (instant_reply型)**:
```json
{
  "threadsAccountId": "ta-001",
  "name": "GWキャンペーン",
  "type": "instant_reply",
  "targetPostId": "17890012345678901",
  "triggerConfig": {
    "requiredActions": ["reply"],
    "condition": "any",
    "requiredKeywords": ["参加"],
    "mustFollow": true
  },
  "winRate": 0.1,
  "maxWinners": 50,
  "winMessage": "{{username}}さん、おめでとうございます! 当選です! 詳細はプロフィールのリンクをご確認ください。",
  "loseMessage": "{{username}}さん、参加ありがとうございます! 残念ながら今回は落選でした。",
  "startsAt": "2026-04-29T00:00:00+09:00",
  "endsAt": "2026-05-06T23:59:59+09:00"
}
```

**リクエスト例 (instant_web型)**:
```json
{
  "threadsAccountId": "ta-001",
  "name": "Web抽選キャンペーン",
  "type": "instant_web",
  "targetPostId": "17890012345678901",
  "triggerConfig": {
    "requiredActions": ["reply", "repost"],
    "condition": "all"
  },
  "winRate": 0.05,
  "maxWinners": 10,
  "winMessage": "{{username}}さん、結果はこちらからご確認ください!",
  "loseMessage": "{{username}}さん、結果はこちらからご確認ください!",
  "webResultConfig": {
    "winPageTitle": "当選おめでとうございます!",
    "winPageBody": "Amazonギフト券 1,000円分をプレゼント!",
    "winPageImageUrl": "https://example.com/win.jpg",
    "winPageCtaText": "ギフト券を受け取る",
    "winPageCtaUrl": "https://example.com/claim",
    "losePageTitle": "残念...",
    "losePageBody": "今回は落選でした。次回もお待ちしています!"
  },
  "startsAt": "2026-04-01T00:00:00+09:00",
  "endsAt": "2026-04-30T23:59:59+09:00"
}
```

**レスポンス例 (201 Created)**:
```json
{
  "id": "camp-002",
  "name": "GWキャンペーン",
  "status": "draft",
  "createdAt": "2026-03-04T12:00:00Z"
}
```

#### GET /api/campaigns/[id]/entries

キャンペーン参加者一覧 (FR-003, SP-003)

**クエリパラメータ**:
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| isWinner | boolean | No | 当選者のみフィルタ |
| page | number | No | ページ番号 |
| limit | number | No | 取得件数 |
| format | string | No | `csv` でCSVエクスポート |

**レスポンス例 (200 OK)**:
```json
{
  "entries": [
    {
      "id": "entry-001",
      "threadsUserId": "user-123",
      "threadsUsername": "participant1",
      "actionType": "reply",
      "isWinner": true,
      "notified": true,
      "entryAt": "2026-03-02T14:30:00Z"
    }
  ],
  "summary": {
    "totalEntries": 456,
    "winners": 23,
    "losers": 433,
    "pending": 0
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 456,
    "totalPages": 23
  }
}
```

#### GET /api/posts

予約投稿一覧取得 (FR-004, SP-004)

**レスポンス例 (200 OK)**:
```json
{
  "posts": [
    {
      "id": "post-001",
      "content": "新商品のご紹介です! #新作",
      "mediaType": "image",
      "mediaUrls": ["https://example.com/product.jpg"],
      "scheduledAt": "2026-03-05T10:00:00+09:00",
      "timezone": "Asia/Tokyo",
      "status": "scheduled",
      "autoReplyId": "ar-001",
      "isThreadstorm": false,
      "createdAt": "2026-03-04T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

#### POST /api/posts

予約投稿作成 (FR-004, SP-004)

**リクエスト例 (投票付き)**:
```json
{
  "threadsAccountId": "ta-001",
  "content": "今週の金曜日のランチ、どれがいい?",
  "mediaType": "text",
  "pollOptions": {
    "options": ["ラーメン", "カレー", "寿司", "パスタ"]
  },
  "scheduledAt": "2026-03-07T11:00:00+09:00",
  "timezone": "Asia/Tokyo"
}
```

**リクエスト例 (スレッドストーム)**:
```json
{
  "threadsAccountId": "ta-001",
  "content": "スレッドストームの1件目: はじめに",
  "mediaType": "text",
  "isThreadstorm": true,
  "threadstormPosts": [
    { "order": 1, "content": "はじめに: 今日はスレッドマーケティングについて語ります。" },
    { "order": 2, "content": "ポイント1: エンゲージメントの重要性" },
    { "order": 3, "content": "ポイント2: タイミングの最適化" },
    { "order": 4, "content": "まとめ: 以上のポイントを押さえて運用しましょう!" }
  ],
  "scheduledAt": "2026-03-06T09:00:00+09:00",
  "timezone": "Asia/Tokyo"
}
```

#### GET /api/replies

リプライ一覧取得 (FR-002, SP-002)

**クエリパラメータ**:
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| threadsAccountId | string | Yes | 対象アカウント |
| postId | string | No | 特定投稿のリプライ |
| hidden | boolean | No | 非表示リプライのみ |

**レスポンス例 (200 OK)**:
```json
{
  "replies": [
    {
      "id": "reply-001",
      "mediaId": "17890012345678999",
      "text": "素晴らしい投稿ですね!",
      "username": "user123",
      "timestamp": "2026-03-04T10:30:00Z",
      "isHidden": false,
      "ngWordMatched": false
    }
  ]
}
```

#### PUT /api/replies/[id]/hide

リプライ非表示/表示切替 (FR-002, SP-002)

**リクエスト例**:
```json
{
  "hide": true
}
```

**レスポンス例 (200 OK)**:
```json
{
  "mediaId": "17890012345678999",
  "hidden": true
}
```

#### GET /api/analytics

分析データ取得 (FR-006, SP-006)

**クエリパラメータ**:
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| threadsAccountId | string | Yes | 対象アカウント |
| period | string | No | `7d`, `30d`, `90d` (default: `30d`) |
| type | string | No | `overview`, `posts`, `demographics`, `best_time` |

**レスポンス例 (200 OK, type=overview)**:
```json
{
  "period": "30d",
  "overview": {
    "totalViews": 125000,
    "totalLikes": 3400,
    "totalReplies": 890,
    "totalReposts": 234,
    "followerGrowth": 156,
    "engagementRate": 3.6
  },
  "dailyTrend": [
    { "date": "2026-03-03", "views": 4200, "likes": 120, "replies": 34, "reposts": 8 },
    { "date": "2026-03-04", "views": 3800, "likes": 98, "replies": 28, "reposts": 5 }
  ],
  "autoReplyStats": {
    "totalSent": 234,
    "successRate": 0.96,
    "avgResponseTime": 2.3
  },
  "campaignStats": {
    "totalEntries": 1200,
    "totalWinners": 45,
    "activeCampaigns": 2
  }
}
```

#### GET /api/usage

API利用状況取得 (NFR-004, SP-009)

**レスポンス例 (200 OK)**:
```json
{
  "threadsAccountId": "ta-001",
  "usage": {
    "postsUsed24h": 67,
    "postsLimit": 250,
    "remainingPosts": 183,
    "usagePercentage": 26.8,
    "status": "ok",
    "nextResetAt": "2026-03-05T10:00:00Z",
    "hourlyBreakdown": [
      { "hour": "2026-03-04T10:00:00Z", "posts": 5, "replies": 8 },
      { "hour": "2026-03-04T11:00:00Z", "posts": 2, "replies": 12 }
    ]
  }
}
```

#### GET /api/logs

送信ログ取得 (SP-009)

**クエリパラメータ**:
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| threadsAccountId | string | No | フィルタ |
| actionType | string | No | フィルタ |
| status | string | No | フィルタ |
| page | number | No | ページ番号 |
| limit | number | No | 取得件数 |

**レスポンス例 (200 OK)**:
```json
{
  "logs": [
    {
      "id": "log-001",
      "actionType": "auto_reply_sent",
      "targetThreadsUsername": "user123",
      "triggerType": "reply",
      "triggerDetectionMethod": "webhook",
      "messageContent": "user123さん、ありがとうございます!",
      "status": "success",
      "threadsApiResponseId": "17890012345679000",
      "createdAt": "2026-03-04T12:30:00Z"
    },
    {
      "id": "log-002",
      "actionType": "auto_reply_sent",
      "targetThreadsUsername": "user456",
      "triggerType": "reply",
      "triggerDetectionMethod": "webhook",
      "messageContent": "user456さん、嬉しいお言葉ありがとう!",
      "status": "rate_limited",
      "errorMessage": "250 posts/24h limit exceeded",
      "createdAt": "2026-03-04T12:31:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 234,
    "totalPages": 12
  }
}
```

### 9.3 Webhook API

#### POST /api/webhooks/threads

Meta Threads Webhookイベント受信 (FR-001, SP-001)

**ヘッダー検証**: `X-Hub-Signature-256`（セクション3.2参照）

**リクエスト例**:
```json
{
  "object": "instagram",
  "entry": [
    {
      "id": "123456789",
      "time": 1709553600,
      "changes": [
        {
          "field": "replies",
          "value": {
            "from": {
              "id": "987654321",
              "username": "replier_user"
            },
            "media": {
              "id": "17890012345678901",
              "media_product_type": "THREADS"
            },
            "text": "素晴らしい投稿ですね!",
            "timestamp": "1709553600"
          }
        }
      ]
    }
  ]
}
```

**レスポンス**: `200 OK`（本文なし、即時返却してバックグラウンド処理）

#### POST /api/webhooks/stripe

Stripe決済イベント受信 (FR-007, SP-007)

**ヘッダー検証**: `Stripe-Signature`

### 9.4 Internal API（Cron / Background）

全Cronエンドポイントは `Authorization: Bearer <CRON_SECRET>` で認証。

| Method | Path | 実行間隔 | 説明 |
|--------|------|---------|------|
| POST | `/api/cron/process-queue` | 1分 | 送信キュー処理 |
| POST | `/api/cron/scheduled-posts` | 1分 | 予約投稿実行 |
| POST | `/api/cron/token-refresh` | 1日1回 | OAuthトークン更新 |
| POST | `/api/cron/usage-aggregate` | 1時間 | API利用量集計/クリーンアップ |
| POST | `/api/cron/fetch-insights` | 6時間 | インサイト取得 |
| POST | `/api/cron/engagement-polling` | 5分 | エンゲージメントポーリング |
| POST | `/api/cron/campaign-cleanup` | 1時間 | キャンペーン終了処理 |

### 9.5 エラーコード一覧

| コード | HTTPステータス | 説明 |
|--------|-------------|------|
| `AUTH_REQUIRED` | 401 | 認証が必要 |
| `AUTH_INVALID` | 401 | トークンが無効 |
| `FORBIDDEN` | 403 | アクセス権限なし |
| `NOT_FOUND` | 404 | リソースが見つからない |
| `VALIDATION_ERROR` | 422 | バリデーションエラー |
| `PLAN_LIMIT_EXCEEDED` | 403 | プラン制限超過 |
| `RATE_LIMIT_EXCEEDED` | 429 | Threads APIレートリミット超過 |
| `THREADS_API_ERROR` | 502 | Threads APIエラー |
| `THREADS_TOKEN_EXPIRED` | 401 | Threadsトークン期限切れ |
| `THREADS_ACCOUNT_NOT_FOUND` | 404 | 連携アカウントが見つからない |
| `CAMPAIGN_ENDED` | 410 | キャンペーン終了済み |
| `CAMPAIGN_NOT_STARTED` | 422 | キャンペーン未開始 |
| `DUPLICATE_ENTRY` | 409 | 重複参加 |
| `TOKEN_EXPIRED` | 410 | lottery_token期限切れ |
| `WEBHOOK_SIGNATURE_INVALID` | 403 | Webhook署名不正 |
| `STRIPE_WEBHOOK_ERROR` | 400 | Stripe Webhookエラー |
| `INTERNAL_ERROR` | 500 | サーバー内部エラー |

**エラーレスポンス共通形式**:
```json
{
  "error": {
    "code": "PLAN_LIMIT_EXCEEDED",
    "message": "Freeプランではオートリプライ設定は3件までです。Starterプランにアップグレードしてください。",
    "details": {
      "current": 3,
      "limit": 3,
      "plan": "free",
      "upgradeTo": "starter"
    }
  }
}
```

---

## 10. 画面仕様

### 10.1 画面一覧

| 画面ID | 画面名 | パス | 認証 | FR参照 |
|--------|--------|------|------|--------|
| S-001 | LP（トップページ） | `/` | 不要 | - |
| S-002 | ユーザー登録 | `/sign-up` | 不要 | FR-007 |
| S-003 | ログイン | `/sign-in` | 不要 | FR-007 |
| S-010 | ダッシュボード | `/dashboard` | 必要 | FR-009 |
| S-011 | Threadsアカウント連携 | `/dashboard/connect` | 必要 | FR-008 |
| S-020 | オートリプライ設定一覧 | `/dashboard/auto-reply` | 必要 | FR-001 |
| S-021 | オートリプライ作成/編集 | `/dashboard/auto-reply/new`, `[id]` | 必要 | FR-001 |
| S-030 | リプライ管理 | `/dashboard/replies` | 必要 | FR-002 |
| S-040 | キャンペーン一覧 | `/dashboard/campaigns` | 必要 | FR-003 |
| S-041 | キャンペーン作成/編集 | `/dashboard/campaigns/new`, `[id]` | 必要 | FR-003 |
| S-042 | キャンペーン結果 | `/dashboard/campaigns/[id]/results` | 必要 | FR-003 |
| S-050 | 予約投稿一覧 | `/dashboard/posts` | 必要 | FR-004 |
| S-051 | 予約投稿作成 | `/dashboard/posts/new` | 必要 | FR-004,005 |
| S-060 | 分析 | `/dashboard/analytics` | 必要 | FR-006 |
| S-070 | 送信ログ | `/dashboard/logs` | 必要 | FR-001 |
| S-080 | 設定 | `/dashboard/settings` | 必要 | FR-007 |
| S-081 | プラン・課金 | `/dashboard/settings/billing` | 必要 | FR-007 |
| W-001 | 即時抽選結果ページ | `/lottery/[campaignId]` | 不要 | FR-003 |

### 10.2 主要画面ASCIIワイヤーフレーム

#### S-010: ダッシュボード

```
┌─────────────────────────────────────────────────────────────┐
│ [SIDEBAR]              │ [HEADER]                            │
│                        │  Dashboard    [account: @myaccount] │
│  Logo                  ├────────────────────────────────────┤
│                        │                                     │
│  Dashboard        *    │  ┌───────────────────────────────┐ │
│  Auto Reply            │  │ API Usage (250 posts / 24h)    │ │
│  Reply Mgmt            │  │                                │ │
│  Campaigns             │  │ Posts+Replies: [====----] 67   │ │
│  Scheduled             │  │                  /250 (27%)    │ │
│  Analytics             │  │                                │ │
│  Logs                  │  │ Next reset: 4h 23m             │ │
│  Settings              │  └───────────────────────────────┘ │
│                        │                                     │
│  ──────────────        │  ┌─────────┐ ┌─────────┐          │
│  API: 67/250           │  │ Replies  │ │ Active  │          │
│  [====------]          │  │ Today    │ │ Campaigns│          │
│                        │  │   34     │ │   2      │          │
│  Plan: Starter         │  └─────────┘ └─────────┘          │
│  [Upgrade]             │                                     │
│                        │  ┌─────────┐ ┌─────────┐          │
│                        │  │ Auto    │ │ Scheduled│          │
│                        │  │ Replies │ │ Posts    │          │
│                        │  │ Active:5│ │   8      │          │
│                        │  └─────────┘ └─────────┘          │
│                        │                                     │
│                        │  ┌───────────────────────────────┐ │
│                        │  │ Recent Activity                │ │
│                        │  │                                │ │
│                        │  │ + Reply -> @user1   success    │ │
│                        │  │ + Reply -> @user2   success    │ │
│                        │  │ + Campaign -> @user3 winner    │ │
│                        │  │ ! Reply -> @user4   rate_limit │ │
│                        │  │                                │ │
│                        │  │ [View All Logs]                │ │
│                        │  └───────────────────────────────┘ │
│                        │                                     │
│                        │  [+ New Post]  [+ New Campaign]    │
└────────────────────────┴────────────────────────────────────┘
```

#### S-021: オートリプライ作成/編集

```
┌─────────────────────────────────────────────────────────────┐
│ [SIDEBAR] │ <- Back    Auto Reply Settings                   │
│           ├─────────────────────────────────────────────────┤
│           │                                                  │
│           │  Name: [________________________]                │
│           │                                                  │
│           │  Account: [v @myaccount        ]                │
│           │                                                  │
│           │  --- Trigger Settings ---                        │
│           │                                                  │
│           │  Target Post: [Post URL or ID (optional)___]    │
│           │                                                  │
│           │  Trigger Events:                                 │
│           │  [x Reply] [x Mention] [ Like*] [ Repost*]     │
│           │  [ Quote*]                                       │
│           │                                                  │
│           │  * Polling-based (up to 5min delay)             │
│           │                                                  │
│           │  Condition: (o) Any  ( ) All                    │
│           │                                                  │
│           │  Keywords (for reply trigger):                   │
│           │  [keyword1] [keyword2] [+ Add]                  │
│           │                                                  │
│           │  --- Message Templates ---                       │
│           │                                                  │
│           │  Template 1:                     Weight: [50]    │
│           │  ┌──────────────────────────────────────┐      │
│           │  │ {{username}}さん、ありがとうございます!│      │
│           │  │ こちらもチェックしてみてください。     │      │
│           │  └──────────────────────────────────────┘      │
│           │                                                  │
│           │  Template 2:                     Weight: [50]    │
│           │  ┌──────────────────────────────────────┐      │
│           │  │ {{username}}さん、嬉しいお言葉       │      │
│           │  │ ありがとう!                          │      │
│           │  └──────────────────────────────────────┘      │
│           │                                                  │
│           │  [+ Add Template]                                │
│           │                                                  │
│           │  Variables: {{username}} {{display_name}}        │
│           │             {{date}} {{time}} {{post_url}}      │
│           │                                                  │
│           │  --- Status ---                                  │
│           │  [*] Active  [ ] Inactive                       │
│           │                                                  │
│           │  [    Save    ]   [ Cancel ]                     │
│           │                                                  │
└───────────┴─────────────────────────────────────────────────┘
```

#### S-041: キャンペーン作成（ウィザード）

```
┌─────────────────────────────────────────────────────────────┐
│ [SIDEBAR] │ <- Back    New Campaign                          │
│           ├─────────────────────────────────────────────────┤
│           │                                                  │
│           │  Step [1]---[2]---[3]---[4]                     │
│           │  Type  Trigger Prize  Confirm                    │
│           │                                                  │
│           │  === Step 1: Campaign Type ===                   │
│           │                                                  │
│           │  ┌──────────────────┐ ┌──────────────────┐     │
│           │  │                  │ │                  │     │
│           │  │  Instant Reply   │ │  Instant Web     │     │
│           │  │                  │ │                  │     │
│           │  │  Auto-reply with │ │  Send URL for    │     │
│           │  │  result directly │ │  web-based       │     │
│           │  │  in thread       │ │  result page     │     │
│           │  │                  │ │                  │     │
│           │  │  [  Select  ]    │ │  [  Select  ]    │     │
│           │  └──────────────────┘ └──────────────────┘     │
│           │                                                  │
└───────────┴─────────────────────────────────────────────────┘
```

#### S-060: 分析

```
┌─────────────────────────────────────────────────────────────┐
│ [SIDEBAR] │ Analytics          Period: [v 30 days]           │
│           ├─────────────────────────────────────────────────┤
│           │                                                  │
│           │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐  │
│           │  │ Views  │ │ Likes  │ │Replies │ │Reposts │  │
│           │  │ 125K   │ │ 3.4K   │ │  890   │ │  234   │  │
│           │  │ +12%   │ │ +8%    │ │ +15%   │ │ +3%    │  │
│           │  └────────┘ └────────┘ └────────┘ └────────┘  │
│           │                                                  │
│           │  ┌─────────────────────────────────────────┐   │
│           │  │ Engagement Trend                         │   │
│           │  │                                          │   │
│           │  │     /\    /\                             │   │
│           │  │    /  \  /  \   /\                       │   │
│           │  │   /    \/    \ /  \                      │   │
│           │  │  /            V    \___                  │   │
│           │  │ /                                        │   │
│           │  │ Mar 1  Mar 8  Mar 15  Mar 22  Mar 29    │   │
│           │  └─────────────────────────────────────────┘   │
│           │                                                  │
│           │  ┌──────────────────┐ ┌──────────────────┐     │
│           │  │ Best Time        │ │ Demographics     │     │
│           │  │                  │ │                  │     │
│           │  │ Weekday: Tue    │ │ Age: 25-34 (35%) │     │
│           │  │ Time: 12:00-    │ │ Gender: M (52%)  │     │
│           │  │       13:00     │ │ Country: JP (78%)│     │
│           │  └──────────────────┘ └──────────────────┘     │
│           │                                                  │
│           │  [Export CSV]                                    │
│           │                                                  │
└───────────┴─────────────────────────────────────────────────┘
```

#### W-001: 即時抽選結果ページ (当選)

```
┌──────────────────────────────────────┐
│                                      │
│          [Brand Logo]                │
│                                      │
│    ┌──────────────────────────┐     │
│    │                          │     │
│    │    CONGRATULATIONS!      │     │
│    │                          │     │
│    │    [Win Image]           │     │
│    │                          │     │
│    │    Amazonギフト券         │     │
│    │    1,000円分              │     │
│    │    当選しました!          │     │
│    │                          │     │
│    │    [  ギフト券を受け取る  ]│     │
│    │                          │     │
│    └──────────────────────────┘     │
│                                      │
│    Campaign: 春のフォロワー感謝祭    │
│    Powered by Threads Automation     │
│                                      │
└──────────────────────────────────────┘
```

---

## 11. セキュリティ仕様

### 11.1 認証セキュリティ (NFR-003)

| 項目 | 対策 | 実装 |
|------|------|------|
| ユーザー認証 | Clerk管理 | セッショントークン + JWT |
| Meta OAuthトークン | AES-256-GCM暗号化 | `lib/encryption.ts` |
| Stripe API Key | 環境変数のみ | Vercel Environment Variables |
| CRON_SECRET | Bearer認証 | Cronエンドポイント認証 |

### 11.2 通信セキュリティ

| 項目 | 対策 |
|------|------|
| API通信 | 全てHTTPS (Vercel強制) |
| Webhook受信 | 署名検証 (X-Hub-Signature-256, Stripe-Signature) |
| CORS | Next.js デフォルト (同一オリジンのみ) |
| CSP | Content-Security-Policy ヘッダー設定 |

### 11.3 データセキュリティ

| 項目 | 対策 |
|------|------|
| DB行レベルセキュリティ | Supabase RLS (Clerk JWT連携) |
| トークン暗号化 | AES-256-GCM (セクション5.3参照) |
| 個人情報 | Supabase暗号化at rest |
| 決済情報 | Stripeが管理 (PCI DSS準拠) |
| バックアップ | Supabase自動バックアップ |

### 11.4 アプリケーションセキュリティ

| 項目 | 対策 |
|------|------|
| XSS | React自動エスケープ + CSP |
| CSRF | Next.js SameSite Cookie |
| SQLi | Supabase パラメータバインディング |
| IDOR | RLSによるオブジェクトレベル認可 |
| レートリミット | Vercel Edge + Upstash Rate Limiter |
| Bot対策 | Cloudflare WAF |

### 11.5 Webhook検証の実装

```typescript
// Threads Webhook
// X-Hub-Signature-256 ヘッダーで HMAC-SHA256 検証 (セクション3.2参照)

// Stripe Webhook
import Stripe from 'stripe';

async function verifyStripeWebhook(
  body: string,
  signature: string
): Promise<Stripe.Event> {
  return stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}
```

### 11.6 環境ごとのセキュリティポリシー

| 環境 | HTTPS | RLS | 暗号化 | WAF | 監査ログ |
|------|-------|-----|--------|-----|---------|
| ローカル開発 | No (localhost) | Yes | Yes | No | No |
| プレビュー | Yes | Yes | Yes | Yes | No |
| 本番 | Yes | Yes | Yes | Yes | Yes |

---

## 12. エラーハンドリング

### 12.1 エラーハンドリング方針

| レイヤー | 方針 | 実装 |
|---------|------|------|
| API Routes | try-catch + 統一エラーレスポンス | `lib/errors.ts` |
| Webhook | 即時200返却 + バックグラウンドエラー処理 | Sentry通知 |
| Cronジョブ | 自動リトライ (最大3回) + エラーログ | DB記録 + Sentry |
| Threads API | レスポンスコード別ハンドリング | リトライ + ユーザー通知 |
| フロントエンド | Error Boundary + トースト通知 | React Error Boundary |

### 12.2 Threads APIエラーハンドリング

```typescript
// lib/threads/api.ts

interface ThreadsApiError {
  error: {
    message: string;
    type: string;
    code: number;
    fbtrace_id: string;
  };
}

async function handleThreadsApiResponse(response: Response): Promise<any> {
  if (!response.ok) {
    const error: ThreadsApiError = await response.json();

    switch (error.error.code) {
      case 4:   // Application request limit reached
        throw new RateLimitError('Threads API rate limit reached');

      case 10:  // Application does not have permission
        throw new PermissionError('Insufficient Threads permissions');

      case 100: // Invalid parameter
        throw new ValidationError(`Invalid parameter: ${error.error.message}`);

      case 190: // Invalid OAuth token
        // トークン期限切れ → 自動更新を試行
        throw new TokenExpiredError('Threads OAuth token expired');

      case 368: // Content policy violation
        throw new ContentPolicyError('Content violates Threads policies');

      default:
        throw new ThreadsApiError(
          `Threads API error: ${error.error.message} (code: ${error.error.code})`
        );
    }
  }

  return response.json();
}
```

### 12.3 リトライ戦略

```typescript
// lib/retry.ts

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;     // ms
  maxDelay: number;      // ms
  backoffFactor: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffFactor: 2,
};

async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // リトライ不可能なエラー
      if (error instanceof PermissionError ||
          error instanceof ContentPolicyError ||
          error instanceof ValidationError) {
        throw error;
      }

      if (attempt < config.maxRetries) {
        const delay = Math.min(
          config.baseDelay * Math.pow(config.backoffFactor, attempt),
          config.maxDelay
        );
        await sleep(delay);
      }
    }
  }

  throw lastError!;
}
```

### 12.4 トークン期限切れ時の自動回復 (H4)

```
[Threads API呼び出し]
    │
    ├── 成功 ──→ [正常処理]
    │
    └── TokenExpiredError ──→ [トークン自動更新試行]
                                    │
                                    ├── 更新成功 ──→ [リトライ]
                                    │
                                    └── 更新失敗 (3回) ──→ [ユーザー通知]
                                                            │
                                                            ├── Resendメール送信
                                                            │   「Threadsアカウントの再連携が必要です」
                                                            │
                                                            └── threads_accounts.is_active = false
                                                                関連auto_replies/campaigns一時停止
```

### 12.5 ユーザー通知が必要なエラー

| エラー | 通知方法 | メッセージ |
|--------|---------|----------|
| トークン期限切れ (更新失敗) | メール + ダッシュボードバナー | 「Threadsアカウントの再連携が必要です」 |
| レートリミット超過 | ダッシュボードバナー | 「24時間の投稿上限に達しました。X時間後にリセットされます」 |
| Stripe決済失敗 | メール | 「お支払いの処理に失敗しました。お支払い情報をご確認ください」 |
| キャンペーン異常終了 | ダッシュボード通知 | 「キャンペーン'XX'がエラーにより停止しました」 |
| Webhook配信停止 | メール + ダッシュボードバナー | 「リアルタイム通知が停止しています。設定をご確認ください」 |

---

## 13. 環境変数一覧

### 13.1 必須環境変数

| 変数名 | 説明 | 例 | 用途 |
|--------|------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクトURL | `https://xxx.supabase.co` | DB接続 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名キー | `eyJ...` | クライアント用DB |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase サービスロールキー | `eyJ...` | サーバー用DB (RLSバイパス) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk 公開キー | `pk_test_...` | フロント認証 |
| `CLERK_SECRET_KEY` | Clerk シークレットキー | `sk_test_...` | サーバー認証 |
| `THREADS_APP_ID` | Meta App ID | `123456789` | Threads OAuth |
| `THREADS_APP_SECRET` | Meta App Secret | `abc123...` | Threads OAuth + Webhook署名 |
| `THREADS_WEBHOOK_VERIFY_TOKEN` | Webhook検証トークン | `my-verify-token` | Webhook購読登録 |
| `ENCRYPTION_KEY` | トークン暗号化鍵 (32bytes hex) | `aabbcc...` (64文字) | AES-256-GCM |
| `STRIPE_SECRET_KEY` | Stripe シークレットキー | `sk_test_...` | 決済処理 |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook署名シークレット | `whsec_...` | Webhook検証 |
| `STRIPE_STARTER_PRICE_ID` | Starter プラン Price ID | `price_...` | Stripe課金 |
| `STRIPE_PRO_PRICE_ID` | Pro プラン Price ID | `price_...` | Stripe課金 |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL | `https://xxx.upstash.io` | ジョブキュー |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis トークン | `AX...` | ジョブキュー |
| `RESEND_API_KEY` | Resend API キー | `re_...` | メール送信 |
| `CRON_SECRET` | Cronジョブ認証シークレット | `cron-secret-xxx` | Cronエンドポイント認証 |
| `SENTRY_DSN` | Sentry DSN | `https://xxx@sentry.io/xxx` | エラー監視 |

### 13.2 オプション環境変数

| 変数名 | 説明 | デフォルト |
|--------|------|-----------|
| `NEXT_PUBLIC_APP_URL` | アプリケーションURL | `http://localhost:3000` |
| `THREADS_API_VERSION` | Threads API バージョン | `v21.0` |
| `RATE_LIMIT_POSTS_24H` | 24h投稿上限 | `250` |
| `TOKEN_REFRESH_DAYS_BEFORE` | トークン更新開始日数 | `14` |
| `TOKEN_REFRESH_MAX_RETRIES` | トークン更新最大リトライ | `3` |
| `LOTTERY_TOKEN_EXPIRY_HOURS` | lottery_token有効期限(時間) | `24` |
| `POLLING_INTERVAL_MINUTES` | エンゲージメントポーリング間隔 | `5` |
| `LOG_LEVEL` | ログレベル | `info` |

### 13.3 環境別設定

| 変数 | 開発 (local) | プレビュー | 本番 |
|------|-------------|-----------|------|
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | `https://preview-xxx.vercel.app` | `https://threads-auto.aidreams-factory.com` |
| `STRIPE_SECRET_KEY` | `sk_test_...` | `sk_test_...` | `sk_live_...` |
| `THREADS_APP_ID` | テスト用App | テスト用App | 本番App |

---

## 14. トレーサビリティマトリックス

### 14.1 FR → SP マッピング

| FR (機能要件) | SP (仕様パッケージ) | 優先度 |
|--------------|-------------------|--------|
| FR-001: オートリプライ | SP-001 | P0-Critical |
| FR-002: リプライ管理 | SP-002 | P1-High |
| FR-003: 抽選キャンペーン | SP-003 | P0-Critical |
| FR-004: 予約投稿 | SP-004 | P0-Critical |
| FR-005: 投票 | SP-005 | P1-High |
| FR-006: 分析・レポート | SP-006 | P1-High |
| FR-007: ユーザー認証・課金 | SP-007 | P0-Critical |
| FR-008: Threadsアカウント連携 | SP-008 | P0-Critical |
| FR-009: 管理ダッシュボード | SP-009 | P0-Critical |

### 14.2 FR → 画面マッピング

| FR | 関連画面 |
|----|---------|
| FR-001 | S-020, S-021, S-070 |
| FR-002 | S-030 |
| FR-003 | S-040, S-041, S-042, W-001 |
| FR-004 | S-050, S-051 |
| FR-005 | S-051 |
| FR-006 | S-060 |
| FR-007 | S-002, S-003, S-080, S-081 |
| FR-008 | S-011 |
| FR-009 | S-010 |

### 14.3 FR → API マッピング

| FR | API エンドポイント |
|----|-------------------|
| FR-001 | `GET/POST /api/auto-replies`, `PUT/DELETE /api/auto-replies/[id]`, `POST /api/webhooks/threads`, `POST /api/cron/process-queue`, `POST /api/cron/engagement-polling` |
| FR-002 | `GET /api/replies`, `PUT /api/replies/[id]/hide` |
| FR-003 | `GET/POST /api/campaigns`, `PUT/DELETE /api/campaigns/[id]`, `GET /api/campaigns/[id]/entries`, `GET /api/lottery/[campaignId]`, `POST /api/cron/campaign-cleanup` |
| FR-004 | `GET/POST /api/posts`, `PUT/DELETE /api/posts/[id]`, `POST /api/cron/scheduled-posts` |
| FR-005 | `POST /api/posts` (pollOptions), `GET /api/analytics` |
| FR-006 | `GET /api/analytics`, `GET /api/usage`, `POST /api/cron/fetch-insights` |
| FR-007 | `POST /api/webhooks/stripe`, Clerk認証 |
| FR-008 | `GET/POST /api/threads-accounts`, `DELETE /api/threads-accounts/[id]`, `POST /api/cron/token-refresh` |
| FR-009 | `GET /api/usage`, `GET /api/logs` |

### 14.4 FR → テーブルマッピング

| FR | 関連テーブル |
|----|-------------|
| FR-001 | `auto_replies`, `action_logs`, `api_usage_hourly`, `engagement_polling_state` |
| FR-002 | `ng_words`, `action_logs` |
| FR-003 | `campaigns`, `campaign_entries`, `action_logs` |
| FR-004 | `scheduled_posts`, `action_logs`, `api_usage_hourly` |
| FR-005 | `scheduled_posts` (poll_options) |
| FR-006 | `post_insights`, `follower_demographics`, `action_logs` |
| FR-007 | `users` |
| FR-008 | `threads_accounts` |
| FR-009 | `users`, `threads_accounts`, `api_usage_hourly`, `action_logs` |

### 14.5 CoordinatorAgent分析課題 → 仕様反映マッピング

| 課題ID | 課題内容 | 反映セクション |
|--------|---------|--------------|
| C1 | Webhook vs ポーリングハイブリッド | 3.1, 3.3, 7.1 (engagement-polling), SP-001 |
| C2 | フォロワーデモグラフィック/投票者リスト | 4.1 (follower_demographics), SP-005, SP-006 |
| H1 | 250投稿/24hローリングウィンドウ | 4.1 (api_usage_hourly), 8.1, 8.2 |
| H2 | Web遷移型抽選トークン | 4.1 (campaign_entries.lottery_token), SP-003 |
| H3 | リプライ管理 (本文取得/一括返信) | SP-002 |
| H4 | Metaトークンライフサイクル | 3.4, 12.4, 7.1 (token-refresh) |
| M1 | JSONBスキーマTypeScript型定義 | 4.3 |
| M2 | 複数アカウントWebhook | 3.2 |
| M3 | プラン制限/ダウングレード | SP-007 |

### 14.6 完全トレーサビリティ表

| FR | SP | 画面 | API | テーブル | Cronジョブ | 課題対応 |
|----|----|------|-----|---------|-----------|---------|
| FR-001 | SP-001 | S-020,S-021,S-070 | auto-replies, webhooks/threads, cron/process-queue, cron/engagement-polling | auto_replies, action_logs, api_usage_hourly, engagement_polling_state | process-queue, engagement-polling | C1 |
| FR-002 | SP-002 | S-030 | replies, replies/[id]/hide | ng_words, action_logs | - | H3 |
| FR-003 | SP-003 | S-040,S-041,S-042,W-001 | campaigns, campaigns/[id]/entries, lottery/[campaignId], cron/campaign-cleanup | campaigns, campaign_entries, action_logs | campaign-cleanup | H2 |
| FR-004 | SP-004 | S-050,S-051 | posts, cron/scheduled-posts | scheduled_posts, action_logs, api_usage_hourly | scheduled-posts | H1 |
| FR-005 | SP-005 | S-051 | posts (pollOptions), analytics | scheduled_posts | - | C2 |
| FR-006 | SP-006 | S-060 | analytics, usage, cron/fetch-insights | post_insights, follower_demographics, action_logs | fetch-insights | C2 |
| FR-007 | SP-007 | S-002,S-003,S-080,S-081 | webhooks/stripe | users | - | M3 |
| FR-008 | SP-008 | S-011 | threads-accounts, cron/token-refresh | threads_accounts | token-refresh | H4,M2 |
| FR-009 | SP-009 | S-010 | usage, logs | users, threads_accounts, api_usage_hourly, action_logs | - | - |

---

*Generated by CCAGI SDK - Phase 2: Design (Functional Specification)*
*Project: Threads Automation Platform*
*CodeGenAgent: Gen*
*Date: 2026-03-04*

