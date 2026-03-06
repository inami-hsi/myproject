# 機能仕様書 - Evergreen Launch Platform

**Phase**: 2 - Design
**作成日**: 2026-03-04
**ソース**: `docs/requirements/evergreen-launch-requirements.md`
**ステータス**: Draft

---

## 1. システムアーキテクチャ

### 1.1 全体構成

```
┌─────────────────────────────────────────────────────────────────┐
│                          Client (Browser)                       │
│  Next.js 15 App Router (React 19 / TypeScript)                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐            │
│  │   LP    │ │  Watch  │ │  Offer  │ │  Admin   │            │
│  │  Page   │ │  Page   │ │  Page   │ │Dashboard │            │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬─────┘            │
└───────┼───────────┼───────────┼────────────┼──────────────────┘
        │           │           │            │
        ▼           ▼           ▼            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Vercel Edge Network                         │
│  ┌──────────────────────────────────────────────────────┐      │
│  │            Next.js API Routes (Serverless)           │      │
│  │  /api/campaigns/*  /api/registrations  /api/cron/*   │      │
│  │  /api/admin/*      /api/events         /api/webhooks │      │
│  └─────────┬──────────────┬──────────────┬──────────────┘      │
│            │              │              │                      │
└────────────┼──────────────┼──────────────┼──────────────────────┘
             │              │              │
    ┌────────┼──────────────┼──────────────┼────────┐
    │        ▼              ▼              ▼        │
    │  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
    │  │ Supabase │  │  Clerk   │  │  Stripe  │   │
    │  │ DB + RLS │  │  Auth    │  │ Payments │   │
    │  │ Storage  │  └──────────┘  └──────────┘   │
    │  └──────────┘                                │
    │        │         ┌──────────┐                │
    │        │         │  Resend  │                │
    │        │         │  Email   │                │
    │        │         └──────────┘                │
    │        │                                     │
    │  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
    │  │Cloudflare│  │ Upstash  │  │ PostHog  │  │
    │  │ R2 (CDN) │  │  Redis   │  │Analytics │  │
    │  └──────────┘  └──────────┘  └──────────┘  │
    │              External Services              │
    └─────────────────────────────────────────────┘
```

### 1.2 ディレクトリ構造

```
src/
├── app/                          # Next.js App Router
│   ├── (public)/                 # 公開ページ（認証不要）
│   │   ├── c/[slug]/             # キャンペーンLP
│   │   │   ├── page.tsx          # LP本体
│   │   │   ├── thanks/page.tsx   # 登録完了ページ
│   │   │   ├── watch/[sessionId]/page.tsx  # 動画視聴ページ
│   │   │   └── offer/page.tsx    # オファーページ
│   │   ├── checkout/
│   │   │   └── success/page.tsx  # 決済完了ページ
│   │   └── c/[slug]/checkout/success/page.tsx  # キャンペーン別決済完了
│   │
│   ├── (admin)/                  # 管理画面（Clerk認証必須）
│   │   ├── layout.tsx            # 管理画面レイアウト
│   │   ├── admin/
│   │   │   ├── page.tsx          # ダッシュボード
│   │   │   ├── campaigns/
│   │   │   │   ├── page.tsx      # キャンペーン一覧
│   │   │   │   ├── new/page.tsx  # 新規作成
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx       # キャンペーン編集
│   │   │   │       ├── emails/page.tsx # メール設定
│   │   │   │       └── registrations/page.tsx # 登録者一覧
│   │   │   ├── videos/page.tsx   # 動画管理
│   │   │   └── analytics/page.tsx # 分析
│   │   └── sign-in/[[...sign-in]]/page.tsx  # Clerkログイン
│   │
│   ├── api/                      # API Routes
│   │   ├── campaigns/
│   │   │   └── [slug]/
│   │   │       ├── route.ts      # GET キャンペーン情報
│   │   │       └── sessions/route.ts  # GET セッション一覧
│   │   ├── registrations/route.ts  # POST 登録
│   │   ├── watch/[sessionId]/route.ts  # GET 視聴情報
│   │   ├── events/route.ts       # POST 視聴イベント
│   │   ├── checkout/route.ts      # POST Stripe Checkout Session作成
│   │   ├── admin/                # 管理API（Clerk middleware）
│   │   │   ├── campaigns/route.ts
│   │   │   ├── videos/
│   │   │   │   ├── route.ts
│   │   │   │   └── upload/route.ts
│   │   │   ├── emails/[id]/route.ts
│   │   │   └── analytics/route.ts
│   │   ├── webhooks/
│   │   │   ├── stripe/route.ts
│   │   │   └── resend/route.ts
│   │   └── cron/
│   │       ├── send-emails/route.ts
│   │       ├── generate-sessions/route.ts
│   │       └── cleanup/route.ts
│   │
│   ├── layout.tsx                # ルートレイアウト
│   └── globals.css               # グローバルスタイル
│
├── components/
│   ├── ui/                       # shadcn/ui コンポーネント
│   ├── landing/                  # LP用コンポーネント
│   │   ├── hero-section.tsx
│   │   ├── session-selector.tsx
│   │   ├── registration-form.tsx
│   │   ├── countdown-timer.tsx
│   │   ├── benefits-section.tsx
│   │   └── testimonials.tsx
│   ├── watch/                    # 視聴ページ用
│   │   ├── video-player.tsx
│   │   ├── countdown-screen.tsx
│   │   └── offer-cta.tsx
│   ├── admin/                    # 管理画面用
│   │   ├── sidebar.tsx
│   │   ├── campaign-form.tsx
│   │   ├── email-editor.tsx
│   │   ├── video-uploader.tsx
│   │   ├── stats-card.tsx
│   │   └── data-table.tsx
│   └── email/                    # メールテンプレート (react-email)
│       ├── confirmation.tsx
│       ├── reminder.tsx
│       ├── session-start.tsx
│       ├── followup.tsx
│       └── replay.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Supabase ブラウザクライアント
│   │   ├── server.ts             # Supabase サーバークライアント
│   │   ├── admin.ts              # Supabase Admin クライアント
│   │   └── types.ts              # DB型定義（自動生成）
│   ├── stripe.ts                 # Stripe クライアント
│   ├── resend.ts                 # Resend クライアント
│   ├── redis.ts                  # Upstash Redis クライアント
│   ├── r2.ts                     # Cloudflare R2 クライアント
│   └── utils.ts                  # ユーティリティ
│
├── hooks/
│   ├── use-countdown.ts          # カウントダウンフック
│   ├── use-video-tracking.ts     # 視聴トラッキングフック
│   └── use-session-schedule.ts   # セッション日程計算フック
│
├── types/
│   └── index.ts                  # 共通型定義
│
└── emails/                       # react-email テンプレート
    ├── confirmation.tsx
    ├── reminder-24h.tsx
    ├── reminder-1h.tsx
    ├── session-start.tsx
    ├── followup.tsx
    └── replay.tsx
```

---

## 2. 機能仕様 - 公開画面

### 2.1 SP-001: ランディングページ（LP）

**対応要件**: FR-001, FR-002
**パス**: `/c/[slug]`
**認証**: 不要

#### 2.1.1 表示仕様

| セクション | 内容 | データソース |
|-----------|------|-------------|
| Hero | カウントダウンタイマー + キャッチコピー | campaigns.session_rules |
| Session Selection | セッション日程カード（最大3件） | sessions (動的生成) |
| Registration Form | 名前 + メールアドレス入力 | - |
| Benefits | 特典一覧（3〜5項目） | campaigns.description (JSON) |
| Social Proof | テスティモニアル | campaigns 設定 |

#### 2.1.2 セッション日程の動的生成ロジック

```typescript
interface SessionRule {
  daysAfter: number[];     // アクセス日からの日数 例: [3, 5, 7]
  timeSlots: string[];     // 開始時刻（UTC） 例: ["11:00", "20:00"]
  maxSeatsDisplay: number; // 表示上の残席数上限
  seatDecayRate: number;   // 残席数の減少速度（0-1）
}

function generateSessions(
  rule: SessionRule,
  accessTime: Date,
  timezone: string
): Session[] {
  // 1. アクセス日を基準にdaysAfterの日程を算出
  // 2. 各日のtimeSlotsで開始時刻を設定
  // 3. 過去の日程を除外
  // 4. 最大3件を返す
  // 5. 残席数はmaxSeatsDisplayから時間経過で減少
}
```

**残席数の演出ロジック**:
- 表示専用（実際の席数制限はない）
- アクセスごとにブラウザCookieで一貫した数値を維持
- `maxSeatsDisplay`から`seatDecayRate`で徐々に減少
- 最小値は3（ゼロにはしない）

#### 2.1.3 登録フォーム仕様

| フィールド | 型 | バリデーション | 必須 |
|-----------|-----|-------------|------|
| name | text | 1〜100文字 | Yes |
| email | email | RFC 5322準拠 | Yes |
| session_id | uuid | 有効なセッションID | Yes (hidden) |

**送信処理フロー**:
```
1. クライアントバリデーション（Zod）
2. POST /api/registrations
3. Supabase: registrations テーブルにINSERT
4. Resend: 登録確認メールを送信
5. Supabase: email_logs にログ記録
6. PostHog: registration イベント送信
7. リダイレクト → /c/[slug]/thanks?session=[sessionId]
```

**重複登録処理**:
- 同一メール + 同一キャンペーンの場合、既存登録を更新（セッション変更可能）
- 別キャンペーンの場合は新規登録として扱う

#### 2.1.4 UTMパラメータ処理

| パラメータ | 保存先 |
|-----------|--------|
| utm_source | registrations.utm_source |
| utm_medium | registrations.utm_medium |
| utm_campaign | registrations.utm_campaign |

URLクエリパラメータから自動取得し、hidden fieldとして保持。

---

### 2.2 SP-002: 登録確認ページ

**対応要件**: FR-001
**パス**: `/c/[slug]/thanks`
**認証**: 不要（セッションIDで表示制御）

#### 2.2.1 表示仕様

| セクション | 内容 |
|-----------|------|
| 確認メッセージ | 「登録が完了しました」 |
| セッション情報 | 選択した日時・視聴URL |
| カウントダウン | セッション開始までの残り時間 |
| カレンダー追加 | Google Calendar / Apple Calendar リンク |
| メール確認 | 「確認メールをお送りしました」表示 |

#### 2.2.2 カレンダー追加

```typescript
function generateCalendarUrl(session: Session, campaign: Campaign): string {
  // Google Calendar URL生成
  const gcalUrl = new URL('https://calendar.google.com/calendar/render');
  gcalUrl.searchParams.set('action', 'TEMPLATE');
  gcalUrl.searchParams.set('text', campaign.name);
  gcalUrl.searchParams.set('dates', formatDateRange(session.starts_at, duration));
  gcalUrl.searchParams.set('details', `視聴URL: ${watchUrl}`);
  return gcalUrl.toString();
}
```

---

### 2.3 SP-003: 動画視聴ページ

**対応要件**: FR-004
**パス**: `/c/[slug]/watch/[sessionId]`
**認証**: 不要（登録メール + セッションIDで認証）

#### 2.3.1 状態遷移

```
[BEFORE]         [LIVE]           [ENDED]         [REPLAY]
カウントダウン → 動画再生中    → オファー表示  → リプレイ視聴
                                                  (期間限定)
```

| 状態 | 条件 | 表示内容 |
|------|------|---------|
| BEFORE | now < session.starts_at | カウントダウンタイマー |
| LIVE | session.starts_at <= now < session.starts_at + video.duration | 動画プレーヤー |
| ENDED | now >= session.starts_at + video.duration | オファーCTA |
| REPLAY | リプレイ許可期間内 | 動画プレーヤー + オファー |

#### 2.3.2 アクセス制御

```typescript
async function validateAccess(sessionId: string, email?: string) {
  // 1. セッションIDの存在確認
  // 2. 登録メールの照合（クエリパラメータ or Cookie）
  // 3. セッション状態の判定
  // 4. リプレイ期限の確認
  return { status, registration, session, campaign, video };
}
```

**認証方式**:
- 初回アクセス: メール内リンクにトークン付き（`?token=xxx`）
- トークン検証後、HttpOnly Cookieにセッション情報を保存
- 以降はCookieで認証（24時間有効）

#### 2.3.3 動画プレーヤー仕様

| 項目 | 仕様 |
|------|------|
| プレーヤー | react-player (video.js fallback) |
| フォーマット | HLS (m3u8) / MP4 fallback |
| アスペクト比 | 16:9 |
| コントロール | カスタム（再生/一時停止、プログレスバー、音量、全画面、PiP） |
| 自動再生 | セッション開始時にミュートで自動再生 |
| ダウンロード防止 | contextmenu無効、URL署名付き（有効期限30分） |

#### 2.3.4 視聴トラッキング

```typescript
interface ViewEvent {
  registration_id: string;
  event_type: 'play' | 'pause' | 'seek' | 'progress' | 'complete';
  progress_percent: number;      // 0-100
  current_time_seconds: number;  // 再生位置
  timestamp: string;
}
```

**送信間隔**:
- `play` / `pause` / `seek` / `complete`: 即時送信
- `progress`: 30秒間隔でバッチ送信（`navigator.sendBeacon` 使用）

#### 2.3.5 オファーCTA仕様

動画終了後に表示:

| 要素 | 仕様 |
|------|------|
| タイミング | 動画再生完了後 or 動画時間の90%到達時 |
| 表示方法 | motion/react slideUp アニメーション |
| CTA文言 | campaigns設定から取得 |
| カウントダウン | 期間限定オファーの残り時間 |
| リンク先 | `/c/[slug]/offer` or 外部URL |

---

### 2.4 SP-004: オファーページ

**対応要件**: FR-006
**パス**: `/c/[slug]/offer`
**認証**: 不要（登録Cookie使用）

#### 2.4.1 表示仕様

| セクション | 内容 |
|-----------|------|
| オファーヘッダー | 商品名・価格・期間限定表示 |
| 商品詳細 | 説明・特典一覧 |
| 価格テーブル | 一括払い / 分割払い選択 |
| カウントダウン | オファー期限 |
| Checkout | Stripe Checkout Sessionへリダイレクト |

#### 2.4.2 Stripe決済フロー

```
1. ユーザーが「購入する」をクリック
2. POST /api/checkout (stripe.checkout.sessions.create)
3. Stripe Checkout Session URLへリダイレクト
4. Stripe上で決済処理
5. 成功 → /c/[slug]/checkout/success にリダイレクト
6. Webhook → /api/webhooks/stripe で決済確認
7. payments テーブルにINSERT
8. 購入確認メール送信
```

#### 2.4.3 決済オプション

| 種別 | Stripe設定 | 備考 |
|------|-----------|------|
| 一括払い | `payment_mode: 'payment'` | 即時決済 |
| 分割払い | `payment_mode: 'payment'` + installments | 最大12回 |
| サブスク | `payment_mode: 'subscription'` | 月額/年額 |

#### 2.4.4 クーポン処理

```typescript
// Stripe Promotionコード適用
const session = await stripe.checkout.sessions.create({
  // ...
  allow_promotion_codes: true,
  // or 特定のクーポンを適用
  discounts: [{ coupon: couponId }],
});
```

---

## 3. 機能仕様 - 管理画面

### 3.1 SP-010: 管理者認証

**対応要件**: FR-008
**パス**: `/admin/sign-in`
**認証**: Clerk

#### 3.1.1 認証フロー

```
1. /admin/* へアクセス
2. Clerk middleware が認証チェック
3. 未認証 → /admin/sign-in へリダイレクト
4. Clerkログイン（Email/Password or Google OAuth）
5. 認証成功 → /admin へリダイレクト
```

#### 3.1.2 Clerk Middleware設定

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isApiAdminRoute = createRouteMatcher(['/api/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req) || isApiAdminRoute(req)) {
    await auth.protect();
  }
});
```

---

### 3.2 SP-011: ダッシュボード

**対応要件**: FR-007
**パス**: `/admin`
**認証**: Clerk必須

#### 3.2.1 表示仕様

| カード | 表示内容 | データソース |
|--------|---------|------------|
| 総登録者数 | 全キャンペーン合計 | COUNT(registrations) |
| 今月の登録者 | 当月の新規登録 | WHERE registered_at >= month_start |
| 視聴完了率 | 動画を最後まで視聴した割合 | view_events (complete / total) |
| 売上 | 当月の売上合計 | SUM(payments.amount) WHERE status = 'succeeded' |
| アクティブキャンペーン | 有効なキャンペーン数 | COUNT(campaigns) WHERE is_active = true |

#### 3.2.2 グラフ

| グラフ | 種類 | 期間 |
|--------|------|------|
| 登録者推移 | 折れ線グラフ | 直近30日 |
| キャンペーン別登録者 | 棒グラフ | 全期間 |
| ファネル | ファネルチャート | 登録→視聴→購入 |

---

### 3.3 SP-012: キャンペーン管理

**対応要件**: FR-009
**パス**: `/admin/campaigns`

#### 3.3.1 キャンペーン一覧テーブル

| カラム | 内容 |
|--------|------|
| キャンペーン名 | リンク付き |
| ステータス | Active / Inactive バッジ |
| 登録者数 | 累計 |
| 視聴率 | % |
| 作成日 | YYYY-MM-DD |
| 操作 | 編集 / 複製 / 削除 |

#### 3.3.2 キャンペーン作成・編集フォーム

| フィールド | 型 | バリデーション | 説明 |
|-----------|-----|-------------|------|
| name | text | 1〜200文字 | キャンペーン名 |
| slug | text | a-z, 0-9, hyphen | URL用スラッグ（自動生成 + 手動編集） |
| description | textarea | 〜5000文字 | LP用説明文 |
| video_id | select | 既存動画から選択 | 紐付ける動画 |
| is_active | toggle | - | 有効/無効 |
| session_rules | JSON editor | SessionRule型 | セッション日程生成ルール |
| offer_config | JSON editor | OfferConfig型 | オファー設定 |

#### 3.3.3 SessionRuleエディタ

```typescript
interface SessionRule {
  daysAfter: number[];        // [3, 5, 7]
  timeSlots: string[];        // ["11:00", "20:00"]
  maxSeatsDisplay: number;    // 20
  seatDecayRate: number;      // 0.3
  replayEnabled: boolean;     // true
  replayDurationHours: number; // 48
}
```

UIはフォーム形式で、daysAfter / timeSlotsは動的に追加・削除可能。

---

### 3.4 SP-014: 動画管理

**対応要件**: FR-003
**パス**: `/admin/videos`

#### 3.4.1 動画アップロードフロー

```
1. 管理画面でファイル選択（ドラッグ&ドロップ対応）
2. ファイルバリデーション
   - 対応形式: mp4, webm, mov
   - 最大サイズ: 2GB（Cloudflare R2制限）
   - 動画長: 制限なし
3. クライアントから直接 R2 へ署名付きURLでアップロード
4. アップロード完了後、メタデータをSupabaseに保存
5. (オプション) サムネイル自動生成
```

#### 3.4.2 署名付きアップロード

```typescript
// API: /api/admin/videos/upload
export async function POST(req: Request) {
  // 1. Clerk認証確認
  // 2. R2の署名付きPUT URLを生成（有効期限60分）
  const signedUrl = await r2Client.getSignedUrl(key, {
    expiresIn: 3600,
    method: 'PUT',
  });
  // 3. URLとkeyをレスポンス
  return Response.json({ uploadUrl: signedUrl, key });
}
```

#### 3.4.3 動画配信

| 項目 | 仕様 |
|------|------|
| 配信方式 | Cloudflare R2 + CDN |
| URL | 署名付きURL（有効期限30分、アクセスごとに再生成） |
| キャッシュ | Cloudflare CDNキャッシュ（TTL: 1日） |
| フォーマット | MP4 ストリーミング（Range Request対応） |

---

### 3.5 SP-015: メールテンプレート管理

**対応要件**: FR-005
**パス**: `/admin/campaigns/[id]/emails`

#### 3.5.1 テンプレート一覧

キャンペーン作成時に以下のデフォルトテンプレートが自動生成される:

| trigger_type | デフォルト件名 | delay_minutes | 送信対象 |
|-------------|--------------|---------------|---------|
| confirmation | 「ご登録ありがとうございます」 | 0 | 全員 |
| reminder_24h | 「明日のセッションのご案内」 | -1440 | 全員 |
| reminder_1h | 「まもなく開始です」 | -60 | 全員 |
| start | 「今すぐご視聴ください」 | 0 (セッション開始) | 全員 |
| followup | 「特別なご提案があります」 | +60 | 視聴完了者 |
| replay | 「見逃した方へ：リプレイのご案内」 | +1440 | 未視聴者 |

#### 3.5.2 テンプレートエディタ

| フィールド | 型 | 説明 |
|-----------|-----|------|
| subject | text | メール件名 |
| body_html | rich text | HTML本文 |
| delay_minutes | number | 送信タイミング |
| is_active | toggle | 有効/無効 |

**変数プレースホルダー**:

| 変数 | 置換内容 |
|------|---------|
| `{{name}}` | 登録者名 |
| `{{session_date}}` | セッション日時 |
| `{{watch_url}}` | 視聴ページURL |
| `{{offer_url}}` | オファーページURL |
| `{{campaign_name}}` | キャンペーン名 |
| `{{replay_url}}` | リプレイURL |
| `{{unsubscribe_url}}` | 配信停止URL |

---

### 3.6 SP-017: 分析画面

**対応要件**: FR-010
**パス**: `/admin/analytics`
**認証**: Clerk必須

#### 3.6.1 表示仕様

| セクション | 表示内容 | データソース |
|-----------|---------|------------|
| KPIカード | LP訪問数(PV)、登録率(CVR)、視聴完了率、購入CVR | PostHog + DB集計 |
| ファネルチャート | 訪問→登録→視聴→購入 の変換率 | registrations, view_events, payments |
| 登録者推移 | 日別登録者数（折れ線グラフ） | registrations |
| メール効果 | 開封率・クリック率（棒グラフ） | email_logs |
| キャンペーン比較 | キャンペーン別の主要指標テーブル | 全テーブル横断 |
| UTM分析 | 流入元別の登録者数・CVR | registrations.utm_* |

#### 3.6.2 フィルター

| フィルター | 型 | デフォルト |
|-----------|-----|----------|
| 期間 | date range | 直近30日 |
| キャンペーン | select | 全キャンペーン |
| UTMソース | select | 全て |

#### 3.6.3 API: GET /api/admin/analytics

Query Parameters:

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| campaign_id | uuid (optional) | キャンペーン絞り込み |
| from | date | 開始日 |
| to | date | 終了日 |
| utm_source | string (optional) | UTMソース絞り込み |

Response (200):
```json
{
  "kpi": {
    "total_registrations": 342,
    "registration_rate": 12.5,
    "view_completion_rate": 68.3,
    "purchase_rate": 4.2,
    "total_revenue": 1520000
  },
  "funnel": {
    "visits": 2736,
    "registrations": 342,
    "viewers": 234,
    "completions": 160,
    "purchases": 15
  },
  "daily_registrations": [
    { "date": "2026-03-01", "count": 12 }
  ],
  "email_stats": {
    "confirmation": { "sent": 342, "delivered": 340, "opened": 280, "clicked": 195 },
    "reminder_24h": { "sent": 330, "delivered": 328, "opened": 250, "clicked": 180 },
    "start": { "sent": 330, "delivered": 328, "opened": 260, "clicked": 220 }
  },
  "campaigns": [
    {
      "id": "uuid",
      "name": "Spring Campaign",
      "registrations": 120,
      "view_rate": 72.5,
      "purchase_rate": 5.0
    }
  ],
  "utm_breakdown": [
    { "source": "facebook", "registrations": 150, "purchase_rate": 3.8 }
  ]
}
```

#### 3.6.4 PostHog連携

| イベント名 | トリガー | プロパティ |
|-----------|---------|-----------|
| `page_view` | LP表示時 | campaign_slug, utm_* |
| `registration` | 登録完了時 | campaign_slug, session_id |
| `video_play` | 動画再生開始 | campaign_slug, registration_id |
| `video_complete` | 動画再生完了 | campaign_slug, progress_percent |
| `offer_view` | オファーページ表示 | campaign_slug |
| `purchase` | 決済完了 | campaign_slug, amount |

```typescript
import posthog from 'posthog-js';

// LP訪問時
posthog.capture('page_view', {
  campaign_slug: slug,
  utm_source: searchParams.get('utm_source'),
  utm_medium: searchParams.get('utm_medium'),
  utm_campaign: searchParams.get('utm_campaign'),
});
```

---

## 4. バックグラウンドジョブ仕様

### 4.1 メール送信ジョブ

**パス**: `/api/cron/send-emails`
**実行間隔**: Supabase pg_cron 5分ごと

#### 4.1.1 処理フロー

```typescript
async function processPendingEmails() {
  const now = new Date();

  // 1. 送信対象の取得
  //    - registrations × email_templates のクロス結合
  //    - email_logsにまだ記録がないもの
  //    - delay_minutesを考慮して送信タイミングに達したもの
  const pendingEmails = await supabase.rpc('get_pending_emails', { now });

  // 2. 各メールを送信
  for (const email of pendingEmails) {
    try {
      // テンプレート変数の置換
      const html = replaceVariables(email.body_html, email.registration);

      // Resend APIで送信
      const result = await resend.emails.send({
        from: 'noreply@example.com',
        to: email.registration.email,
        subject: replaceVariables(email.subject, email.registration),
        html,
      });

      // ログ記録
      await supabase.from('email_logs').insert({
        registration_id: email.registration.id,
        template_id: email.template.id,
        status: 'sent',
        resend_id: result.id,
      });
    } catch (error) {
      await supabase.from('email_logs').insert({
        registration_id: email.registration.id,
        template_id: email.template.id,
        status: 'failed',
      });
    }
  }
}
```

#### 4.1.2 送信タイミング算出SQL

```sql
-- get_pending_emails RPC
CREATE OR REPLACE FUNCTION get_pending_emails(p_now timestamptz)
RETURNS TABLE (...) AS $$
  SELECT
    r.id AS registration_id,
    r.name,
    r.email,
    et.id AS template_id,
    et.subject,
    et.body_html,
    et.trigger_type,
    s.starts_at AS session_starts_at
  FROM registrations r
  JOIN sessions s ON r.session_id = s.id
  JOIN email_templates et ON et.campaign_id = r.campaign_id
  WHERE et.is_active = true
    -- 送信タイミングに達している
    AND (
      -- confirmation: 即時（登録後）
      (et.trigger_type = 'confirmation' AND r.registered_at <= p_now)
      -- reminder系: セッション開始 + delay_minutes
      OR (et.trigger_type IN ('reminder_24h', 'reminder_1h')
          AND (s.starts_at + (et.delay_minutes || ' minutes')::interval) <= p_now)
      -- start: セッション開始時
      OR (et.trigger_type = 'start' AND s.starts_at <= p_now)
      -- followup: 視聴完了者のみ
      OR (et.trigger_type = 'followup'
          AND (s.starts_at + (et.delay_minutes || ' minutes')::interval) <= p_now
          AND EXISTS (SELECT 1 FROM view_events ve
                      WHERE ve.registration_id = r.id AND ve.event_type = 'complete'))
      -- replay: 未視聴者のみ
      OR (et.trigger_type = 'replay'
          AND (s.starts_at + (et.delay_minutes || ' minutes')::interval) <= p_now
          AND NOT EXISTS (SELECT 1 FROM view_events ve
                          WHERE ve.registration_id = r.id AND ve.event_type = 'play'))
    )
    -- まだ送信していない
    AND NOT EXISTS (
      SELECT 1 FROM email_logs el
      WHERE el.registration_id = r.id AND el.template_id = et.id
    )
  LIMIT 100; -- バッチサイズ
$$ LANGUAGE sql;
```

#### 4.1.3 Resend無料枠管理

```typescript
// 月間送信数チェック
async function checkEmailQuota(): Promise<boolean> {
  const monthStart = startOfMonth(new Date());
  const { count } = await supabase
    .from('email_logs')
    .select('*', { count: 'exact', head: true })
    .gte('sent_at', monthStart.toISOString())
    .eq('status', 'sent');

  const FREE_LIMIT = 3000;
  return (count ?? 0) < FREE_LIMIT;
}
```

### 4.2 セッション生成ジョブ

**パス**: `/api/cron/generate-sessions` (Supabase pg_cron)
**実行間隔**: 1時間ごと

```typescript
async function generateUpcomingSessions() {
  // 1. アクティブなキャンペーンを取得
  // 2. 各キャンペーンのsession_rulesを取得
  // 3. 今後7日間のセッションを生成（存在しないもののみ）
  // 4. sessions テーブルにINSERT
}
```

### 4.3 クリーンアップジョブ

**パス**: `/api/cron/cleanup` (Supabase pg_cron)
**実行間隔**: 毎日03:00 UTC

```typescript
async function cleanup() {
  // 1. 30日以上前の未使用セッションを削除
  // 2. 90日以上前のview_eventsを集約・削除
  // 3. R2の孤立ファイル検出（DBに参照のない動画）
}
```

---

## 5. データベース仕様

### 5.1 Supabase設定

#### Row Level Security (RLS)

| テーブル | ポリシー名 | 操作 | ルール |
|---------|-----------|------|--------|
| campaigns | public_read_active | SELECT | `is_active = true` |
| campaigns | admin_all | ALL | Clerk JWT verified |
| sessions | public_read | SELECT | 紐付くcampaignがactive |
| registrations | self_read | SELECT | `email = current_user_email()` |
| registrations | public_insert | INSERT | 常に許可 |
| email_templates | admin_all | ALL | Clerk JWT verified |
| videos | admin_all | ALL | Clerk JWT verified |
| view_events | public_insert | INSERT | 常に許可 |
| payments | admin_read | SELECT | Clerk JWT verified |

#### インデックス

```sql
-- 高頻度クエリ用インデックス
CREATE INDEX idx_campaigns_slug ON campaigns(slug) WHERE is_active = true;
CREATE INDEX idx_sessions_campaign_starts ON sessions(campaign_id, starts_at);
CREATE INDEX idx_registrations_campaign_email ON registrations(campaign_id, email);
CREATE INDEX idx_registrations_session ON registrations(session_id);
CREATE INDEX idx_email_logs_registration_template ON email_logs(registration_id, template_id);
CREATE INDEX idx_view_events_registration ON view_events(registration_id);
CREATE INDEX idx_payments_registration ON payments(registration_id);
```

### 5.2 マイグレーション

Supabase Dashboard の SQL Editor または `supabase db push` で管理。

```sql
-- 初期マイグレーション
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE campaigns (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  video_id uuid,
  is_active boolean DEFAULT false,
  offer_url text,
  session_rules jsonb DEFAULT '{}',
  offer_config jsonb DEFAULT '{}',
  lp_config jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE videos (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  title text NOT NULL,
  description text,
  storage_key text NOT NULL,
  storage_url text,
  thumbnail_url text,
  duration_seconds integer,
  file_size_bytes bigint,
  mime_type text,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE campaigns
  ADD CONSTRAINT fk_campaigns_video
  FOREIGN KEY (video_id) REFERENCES videos(id)
  ON DELETE SET NULL;

CREATE TABLE sessions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  is_generated boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE registrations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  access_token text DEFAULT encode(gen_random_bytes(32), 'hex'),
  registered_at timestamptz DEFAULT now(),
  UNIQUE(campaign_id, email)
);

CREATE TABLE email_templates (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  trigger_type text NOT NULL CHECK (
    trigger_type IN ('confirmation','reminder_24h','reminder_1h','start','followup','replay')
  ),
  subject text NOT NULL,
  body_html text NOT NULL,
  delay_minutes integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(campaign_id, trigger_type)
);

CREATE TABLE email_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  registration_id uuid NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  template_id uuid NOT NULL REFERENCES email_templates(id) ON DELETE CASCADE,
  sent_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent','failed','bounced','delivered','opened','clicked')),
  resend_id text,
  error_message text,
  UNIQUE(registration_id, template_id)
);

CREATE TABLE view_events (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  registration_id uuid NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (
    event_type IN ('play','pause','seek','progress','complete')
  ),
  progress_percent integer CHECK (progress_percent BETWEEN 0 AND 100),
  current_time_seconds integer,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE payments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  registration_id uuid NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  stripe_payment_id text UNIQUE,
  stripe_checkout_session_id text,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'jpy',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','succeeded','failed','refunded')),
  product_name text,
  created_at timestamptz DEFAULT now()
);

-- updated_at自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## 6. API仕様（詳細）

### 6.1 POST /api/registrations

**登録処理**

Request:
```json
{
  "campaign_slug": "my-campaign",
  "session_id": "uuid",
  "name": "山田太郎",
  "email": "taro@example.com",
  "utm_source": "facebook",
  "utm_medium": "cpc",
  "utm_campaign": "spring2026"
}
```

Response (201):
```json
{
  "id": "uuid",
  "session": {
    "id": "uuid",
    "starts_at": "2026-03-10T11:00:00Z"
  },
  "watch_url": "/c/my-campaign/watch/uuid?token=xxx",
  "redirect_url": "/c/my-campaign/thanks?session=uuid"
}
```

Errors:
| Status | 条件 |
|--------|------|
| 400 | バリデーションエラー |
| 404 | キャンペーンが存在しない or 非アクティブ |
| 409 | 同一メール + キャンペーンで既に登録済み（更新処理へ） |
| 429 | レート制限（10 req/分/IP） |

### 6.2 GET /api/campaigns/[slug]/sessions

**セッション日程取得**

Query Parameters:
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| tz | string | タイムゾーン（例: Asia/Tokyo） |
| limit | number | 取得件数（デフォルト3） |

Response (200):
```json
{
  "sessions": [
    {
      "id": "uuid",
      "starts_at": "2026-03-10T11:00:00+09:00",
      "display_date": "3月10日(火)",
      "display_time": "20:00",
      "seats_remaining": 12
    }
  ]
}
```

### 6.3 POST /api/events

**視聴イベント送信**

Request:
```json
{
  "registration_id": "uuid",
  "events": [
    {
      "event_type": "progress",
      "progress_percent": 45,
      "current_time_seconds": 810,
      "timestamp": "2026-03-10T11:13:30Z"
    }
  ]
}
```

Response (204): No Content

### 6.4 POST /api/webhooks/stripe

**Stripe Webhook処理**

処理するイベント:
| イベント | 処理 |
|---------|------|
| `checkout.session.completed` | payments テーブルに記録、確認メール送信 |
| `payment_intent.succeeded` | payments ステータス更新 |
| `payment_intent.payment_failed` | payments ステータス更新 |
| `customer.subscription.created` | サブスク開始記録 |

Webhook署名検証:
```typescript
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET!
);
```

### 6.5 POST /api/webhooks/resend

**Resend Webhook処理**

処理するイベント:
| イベント | 処理 |
|---------|------|
| `email.delivered` | email_logs.status = 'delivered' |
| `email.opened` | email_logs.status = 'opened' |
| `email.clicked` | email_logs.status = 'clicked' |
| `email.bounced` | email_logs.status = 'bounced' |

---

## 7. セキュリティ仕様

### 7.1 認証・認可

| 対象 | 方式 | 実装 |
|------|------|------|
| 管理画面 | Clerk JWT | middleware.ts |
| Admin API | Clerk JWT | API Route内でauth()チェック |
| 視聴ページ | アクセストークン（Cookie） | カスタムミドルウェア |
| Public API | レート制限のみ | Upstash ratelimit |

### 7.2 レート制限

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 req/min
});
```

| エンドポイント | 制限 |
|--------------|------|
| POST /api/registrations | 10 req/分/IP |
| POST /api/events | 60 req/分/IP |
| GET /api/campaigns/* | 30 req/分/IP |

### 7.3 動画保護

| 対策 | 実装 |
|------|------|
| URL署名 | R2署名付きURL（有効期限30分） |
| 右クリック無効 | `onContextMenu={e => e.preventDefault()}` |
| DevTools検出 | 開発者ツール検出時に警告表示 |
| Referrer制限 | 自サイトからのリクエストのみ許可 |

### 7.4 CSPヘッダー

```typescript
// next.config.ts
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://clerk.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https://*.supabase.co https://*.cloudflare.com;
  media-src 'self' https://*.r2.cloudflarestorage.com;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://*.supabase.co https://api.stripe.com https://api.resend.com;
  frame-src https://js.stripe.com https://clerk.com;
`;
```

---

## 8. エラーハンドリング

### 8.1 エラーレスポンス形式

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "メールアドレスの形式が正しくありません",
    "details": [
      { "field": "email", "message": "有効なメールアドレスを入力してください" }
    ]
  }
}
```

### 8.2 エラーコード一覧

| コード | HTTP Status | 説明 |
|--------|------------|------|
| VALIDATION_ERROR | 400 | バリデーションエラー |
| CAMPAIGN_NOT_FOUND | 404 | キャンペーン未発見 |
| SESSION_NOT_FOUND | 404 | セッション未発見 |
| SESSION_EXPIRED | 410 | セッション期限切れ |
| ALREADY_REGISTERED | 409 | 重複登録 |
| RATE_LIMITED | 429 | レート制限超過 |
| EMAIL_QUOTA_EXCEEDED | 503 | メール送信枠超過 |
| UPLOAD_TOO_LARGE | 413 | ファイルサイズ超過 |
| UNAUTHORIZED | 401 | 認証エラー |
| INTERNAL_ERROR | 500 | サーバーエラー |

### 8.3 Sentryエラー報告

```typescript
import * as Sentry from '@sentry/nextjs';

// API Route エラーハンドリング
export async function POST(req: Request) {
  try {
    // ... 処理
  } catch (error) {
    Sentry.captureException(error);
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'サーバーエラーが発生しました' } },
      { status: 500 }
    );
  }
}
```

---

## 9. 環境変数

| 変数名 | 用途 | 取得先 |
|--------|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL | Supabase Dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | Supabase Dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role | Supabase Dashboard |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Public Key | Clerk Dashboard |
| `CLERK_SECRET_KEY` | Clerk Secret | Clerk Dashboard |
| `STRIPE_SECRET_KEY` | Stripe Secret | Stripe Dashboard |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook | Stripe Dashboard |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Public | Stripe Dashboard |
| `RESEND_API_KEY` | Resend API Key | Resend Dashboard |
| `UPSTASH_REDIS_REST_URL` | Upstash URL | Upstash Console |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Token | Upstash Console |
| `R2_ACCOUNT_ID` | Cloudflare Account | Cloudflare Dashboard |
| `R2_ACCESS_KEY_ID` | R2 Access Key | Cloudflare Dashboard |
| `R2_SECRET_ACCESS_KEY` | R2 Secret Key | Cloudflare Dashboard |
| `R2_BUCKET_NAME` | R2 Bucket | Cloudflare Dashboard |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog Key | PostHog Dashboard |
| `SENTRY_DSN` | Sentry DSN | Sentry Dashboard |
| `CRON_SECRET` | Cron認証用Secret | 手動生成 |

---

## 10. 要件トレーサビリティマトリクス

| 要件ID | 仕様ID | 画面 | API | テーブル |
|--------|--------|------|-----|---------|
| FR-001 | SP-001, SP-002 | S-001, S-002 | POST /api/registrations, GET /api/campaigns/[slug]/sessions | campaigns, sessions, registrations |
| FR-002 | SP-001 | S-001 | GET /api/campaigns/[slug]/sessions | sessions |
| FR-003 | SP-014 | S-014 | POST /api/admin/videos/upload, GET /api/admin/videos | videos |
| FR-004 | SP-003 | S-003 | GET /api/watch/[sessionId], POST /api/events | view_events |
| FR-005 | SP-015 | S-015 | Cron /api/cron/send-emails | email_templates, email_logs |
| FR-006 | SP-004 | S-004, S-005 | POST /api/webhooks/stripe | payments |
| FR-007 | SP-011 | S-011 | GET /api/admin/analytics | 全テーブル |
| FR-008 | SP-010 | S-010 | Clerk middleware | - |
| FR-009 | SP-012, SP-013 | S-012, S-013 | CRUD /api/admin/campaigns | campaigns |
| FR-010 | SP-017 | S-017 | GET /api/admin/analytics | view_events, registrations, payments, email_logs |

---

*Generated by CCAGI SDK - Phase 2: Spec Create*
*Project: Evergreen Launch Platform*
