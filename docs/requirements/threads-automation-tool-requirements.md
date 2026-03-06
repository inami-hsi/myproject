# Threads自動化ツール 要件定義書

**プロジェクト名**: Threads Automation Platform
**Phase**: 1 - Requirements
**作成日**: 2026-03-04
**ステータス**: Draft

---

## 1. プロジェクト概要

### 1.1 目的

Meta Threads公式APIを活用し、ユーザーのアクション（リプライ、いいね、リポスト）をトリガーとして自動リプライを送信するSaaS型の自動化ツール。抽選キャンペーン、予約投稿、投票（ポール）、分析機能を備え、Threads運用とビジネス成果を最大化する。

### 1.2 X自動化ツールとの差分

| 項目 | X版 | Threads版 | 理由 |
|------|-----|-----------|------|
| オートDM | ✅ | ❌ 除外 | Threads DM APIが未公開 |
| オートリプライ | ✅ | ✅ | Reply Management API利用可能 |
| シークレットリプライ | ✅ | ❌ 除外 | Threadsにこの概念なし |
| 固定リプライ | ✅ | ❌ 除外 | Threads APIに固定機能なし |
| 抽選キャンペーン | ✅ (3種) | ✅ (2種) | DM型は除外、リプライ型+Web型 |
| 予約投稿 | ✅ | ✅ | Publishing API利用可能 |
| ステップ配信 | ✅ (DM) | ❌ 除外 | DM API未公開のため不可 |
| 投票（ポール） | ❌ | ✅ 新規 | Threads API 2025年7月追加 |
| Threads同時投稿 | ✅ (X→Threads) | ❌ 不要 | Threads単体のため |
| 分析・レポート | ✅ | ✅ | Insights API利用可能 |
| Webhook | ❌ (ポーリング) | ✅ | Threads APIでWebhook対応 |
| API費用 | $100〜$5,000/月 | **無料** | Meta Graph APIは無料 |

### 1.3 ビジネスモデル

| 項目 | 内容 |
|------|------|
| 収益モデル | 月額サブスクリプション |
| ターゲット価格 | ¥4,980〜¥14,800/月 |
| 無料プラン | あり（機能制限付き） |
| 無料トライアル | 14日間（全機能利用可能） |
| キャンペーン実施回数 | プランに応じた制限 |

> **価格設定の根拠**: Threads APIが無料のため、X版（¥9,800〜）より大幅に安価設定が可能。API費用ゼロの利点を価格競争力に転換。

### 1.4 ターゲットユーザー

| ユーザー種別 | 説明 |
|-------------|------|
| **個人インフルエンサー** | Threadsでのフォロワー拡大・エンゲージメント強化 |
| **中小企業マーケター** | キャンペーン運用・ブランド認知向上 |
| **ECサイト運営者** | 商品告知・クーポン配布（リプライ経由） |
| **SNS運用代行者** | 複数アカウントの効率的な運用管理 |

### 1.5 競合分析

| ツール | 月額 | Threads対応 | 特徴 |
|--------|------|------------|------|
| Buffer | $6〜 | 予約投稿のみ | マルチプラットフォーム |
| Hootsuite | $99〜 | 予約投稿のみ | 企業向け |
| Later | $25〜 | 予約投稿のみ | ビジュアルプランナー |
| Metricool | $22〜 | 予約+分析 | 分析重視 |
| **本ツール** | **¥4,980〜** | **自動化+抽選+分析** | 自動リプライ・抽選が差別化 |

> Threads専用の自動リプライ・抽選キャンペーンツールは現時点でほぼ存在せず、先行者優位を取れる市場。

---

## 2. 機能要件

### FR-001: オートリプライ（自動リプライ送信）

- **優先度**: P0-Critical
- **説明**: 自分の投稿に対するユーザーアクションをトリガーに、自動でリプライを送信する
- **受入基準**:
  - [ ] 以下のトリガー条件でリプライ自動送信が動作する:
    - リプライ（特定キーワード含む）
    - いいね
    - リポスト
    - 引用リポスト
    - メンション
  - [ ] Webhookによるリアルタイムトリガー検知
  - [ ] リプライ内容をテンプレートでカスタマイズ可能
  - [ ] 複数のリプライテンプレートからランダム送信対応
  - [ ] テンプレート変数（ユーザー名、日時等）の埋め込み
  - [ ] 画像・リンクを含むリプライの送信
  - [ ] Threads API上限（250投稿/24時間）の管理
  - [ ] 送信ログの確認
  - [ ] リプライ送信の有効/無効切り替え
  - [ ] リプライ対象のフィルタリング（新規フォロワーのみ、全員等）

### FR-002: リプライ管理

- **優先度**: P1-High
- **説明**: 投稿へのリプライを管理・モデレーションする
- **受入基準**:
  - [ ] 投稿ごとのリプライ一覧表示
  - [ ] リプライの非表示/表示切替
  - [ ] リプライ制限設定（全員 / フォロワーのみ / 投稿者のみ）
  - [ ] キーワードベースのリプライ自動非表示（NGワードフィルタ）
  - [ ] リプライへの一括返信

### FR-003: 抽選キャンペーン

- **優先度**: P0-Critical
- **説明**: フォロワー獲得・エンゲージメント向上のための抽選キャンペーンを実施する
- **受入基準**:
  - [ ] **即時抽選（オートリプライ型）**: アクション即時に当落結果をリプライで通知
  - [ ] **即時抽選（Web遷移型）**: 当落結果確認用のWebページへURLリプライでリダイレクト
  - [ ] 当選確率の設定（例: 10%、固定当選数）
  - [ ] 当選条件の設定（リプライ必須、リポスト必須、特定キーワード含む等）
  - [ ] 当選メッセージ・落選メッセージのカスタマイズ
  - [ ] 重複参加の防止
  - [ ] 当選者一覧のCSVエクスポート
  - [ ] キャンペーン期間の設定（開始日時・終了日時）
  - [ ] キャンペーン回数はプランに応じた制限

> **X版との差分**: DM型抽選（後日抽選でDM通知）はThreads DM APIが未公開のため除外。全てリプライベースで実施。

### FR-004: 予約投稿

- **優先度**: P0-Critical
- **説明**: 指定日時に自動でThreads投稿を行う
- **受入基準**:
  - [ ] 日時を指定して投稿を予約できる
  - [ ] テキスト投稿
  - [ ] 画像投稿（最大20枚のカルーセル対応）
  - [ ] 動画投稿
  - [ ] GIF投稿
  - [ ] 投票（ポール）付き投稿
  - [ ] ハッシュタグ（1投稿1つまで）
  - [ ] トピックタグ付き投稿
  - [ ] 位置情報タグ付き投稿（対応アカウントのみ）
  - [ ] 予約投稿にオートリプライ設定を紐付け可能
  - [ ] 予約一覧の確認・編集・削除
  - [ ] タイムゾーン対応
  - [ ] Threads API上限（250投稿/24時間）の事前チェック
  - [ ] スレッドストーム（連続投稿）の予約

### FR-005: 投票（ポール）機能

- **優先度**: P1-High
- **説明**: 投票付き投稿の作成・結果管理を行う
- **受入基準**:
  - [ ] 投票付き投稿の作成（選択肢2〜4個）
  - [ ] 投票結果のリアルタイム集計・表示
  - [ ] 予約投稿での投票作成対応
  - [ ] 投票結果に基づくオートリプライ（例: 特定選択肢に投票した人へ）

### FR-006: 分析・レポート

- **優先度**: P1-High
- **説明**: 投稿パフォーマンスとアカウントの成長を分析する
- **受入基準**:
  - [ ] 投稿ごとのインサイト（ビュー、いいね、リプライ、リポスト、引用、クリック、シェア）
  - [ ] フォロワーデモグラフィック（年齢、性別、地域）
  - [ ] エンゲージメントトレンド（日別・週別・月別）
  - [ ] オートリプライ送信数・成功率
  - [ ] キャンペーン参加者数・当選者数
  - [ ] API利用量（残り投稿可能数）
  - [ ] ベストタイム分析（最もエンゲージメントが高い投稿時間帯）
  - [ ] CSVエクスポート
  - [ ] トピックタグ別パフォーマンス

### FR-007: ユーザー認証・課金

- **優先度**: P0-Critical
- **説明**: ユーザー登録・ログイン・サブスクリプション課金を行う
- **受入基準**:
  - [ ] メール + パスワードでのユーザー登録・ログイン
  - [ ] Google OAuth ログイン対応
  - [ ] Stripe月額サブスクリプション課金
  - [ ] 無料プラン（機能制限付き）
  - [ ] 14日間無料トライアル（全機能）
  - [ ] プラン変更・解約の自動処理
  - [ ] 請求書・領収書の発行

### FR-008: Threadsアカウント連携

- **優先度**: P0-Critical
- **説明**: ユーザーのThreadsアカウントをMeta OAuth 2.0で連携する
- **受入基準**:
  - [ ] Meta/Instagram OAuth 2.0認証フロー
  - [ ] Threads Publishing APIへのアクセス許可取得
  - [ ] アクセストークン・リフレッシュトークンの安全な保管
  - [ ] トークン自動更新（長期トークン: 60日有効）
  - [ ] 複数Threadsアカウントの管理対応
  - [ ] 連携解除機能
  - [ ] 必要なスコープ: `threads_basic`, `threads_content_publish`, `threads_manage_insights`, `threads_manage_replies`, `threads_read_replies`

### FR-009: 管理ダッシュボード

- **優先度**: P0-Critical
- **説明**: 全機能を一元管理するダッシュボード
- **受入基準**:
  - [ ] 有効なオートリプライ設定の一覧
  - [ ] アクティブなキャンペーン一覧
  - [ ] API利用状況（残り投稿数 X/250）のリアルタイム表示
  - [ ] 直近の送信ログ
  - [ ] クイックアクション（新規投稿作成、キャンペーン作成）
  - [ ] アカウント切替（複数アカウント対応）

---

## 3. 非機能要件

### NFR-001: パフォーマンス

| 指標 | 目標値 |
|------|--------|
| ダッシュボード初期表示 | < 2s |
| API応答時間 | < 500ms |
| Webhookイベント処理遅延 | < 3s（トリガーからリプライ送信まで） |
| 同時接続ユーザー | 1,000+ |

### NFR-002: 可用性

| 指標 | 目標値 |
|------|--------|
| 稼働率 | 99.9% |
| Webhookエンドポイント | 24時間365日受信可能 |
| ジョブ処理 | 障害時自動リトライ（最大3回） |

### NFR-003: セキュリティ

| 項目 | 対策 |
|------|------|
| Meta OAuth トークン | AES-256暗号化してDB保存 |
| API通信 | 全てHTTPS |
| ユーザーデータ | Supabase RLS + 暗号化 |
| 決済 | Stripe PCI DSS準拠 |
| Webhook検証 | Meta App Secretによる署名検証 |
| CSRF/XSS | Next.js標準 + CSP |

### NFR-004: Threads API制限の管理

| リソース | 制限 | 対策 |
|---------|------|------|
| 投稿（リプライ含む） | 250投稿/24時間 | カウンター管理 + キューイング |
| メディアコンテナ作成 | レートリミットあり | リトライ + バックオフ |
| Insights取得 | レートリミットあり | キャッシュ（1時間） |

### NFR-005: スケーラビリティ

| 項目 | 対応 |
|------|------|
| ユーザー増加 | Vercel自動スケール + Supabase接続プール |
| Webhook処理 | キューベースの非同期処理 |
| ジョブ実行 | Supabase Edge Functions + pg_cron |

---

## 4. 技術制約

### TC-001: 技術スタック

> **方針**: 無料枠を最大限活用し、初期コストを最小化する。Threads APIが無料であることを最大の利点として活用。

| カテゴリ | 技術 | 無料枠 | 用途 |
|----------|------|--------|------|
| **フレームワーク** | Next.js 15 (App Router) | - | フロントエンド + API Routes |
| **言語** | TypeScript 5.3+ | - | strict mode |
| **バックエンド/DB** | Supabase | 500MB DB, 50K MAU | DB・認証・Realtime |
| **デプロイ** | Vercel | 100GB帯域/月 | ホスティング・Serverless |
| **DNS/CDN** | Cloudflare | 無制限 | DNS・WAF |
| **認証** | Clerk | 10,000 MAU | ユーザー認証 |
| **決済** | Stripe | 売上の3.6% | サブスクリプション |
| **メール** | Resend | 3,000通/月 | 通知メール |
| **キャッシュ/キュー** | Upstash Redis | 10,000 req/日 | ジョブキュー |
| **エラー監視** | Sentry | 5,000イベント/月 | エラートラッキング |
| **Threads API** | Meta Graph API | **無料** | コア機能 |

### TC-002: Threads API の優位性（X APIとの比較）

| 項目 | X API (Basic) | Threads API | 影響 |
|------|---------------|-------------|------|
| 月額費用 | $100 (¥15,000) | **無料** | 固定費大幅削減 |
| Webhook | ❌ 廃止 | ✅ 利用可能 | リアルタイム検知可能 |
| 投稿上限 | 複雑な制限体系 | 250投稿/24h | シンプルな管理 |
| DM送信 | 100通/24h | ❌ API未公開 | DM機能は不可 |
| インサイト | 別途課金 | ✅ 無料 | 分析コスト0 |

### TC-003: Webhookアーキテクチャ

X APIとは異なり、Threads APIは**公式Webhook**をサポート。ポーリング不要。

```
[Threadsユーザーのアクション]
    │
    ▼
[Meta Webhook] → HTTPS POST → [/api/webhooks/threads]
    │
    ▼
[署名検証（App Secret）]
    │
    ▼
[Upstash Redis Queue] ← ジョブ登録
    │
    ▼
[Vercel Serverless / Supabase Edge Functions]
    │
    ├── リプライ送信ジョブ（レートリミット考慮）
    ├── 抽選処理ジョブ
    └── 分析データ記録ジョブ
```

**Webhookイベント種別**:
- `mentions` — 自分のアカウントがメンションされた
- `replies` — 自分の投稿にリプライがあった
- その他のエンゲージメント（いいね、リポスト等）はWebhookまたはポーリングで検知

### TC-004: Meta OAuth 2.0認証フロー

```
[ユーザー] → [本ツール] → [Meta Login Dialog]
                                │
                          OAuth 2.0 Authorization
                                │
                                ▼
                        [Authorization Code]
                                │
                                ▼
                    [短期トークン取得（1時間）]
                                │
                                ▼
                    [長期トークン交換（60日）]
                                │
                                ▼
                    [暗号化してDB保存]
                                │
                                ▼
                    [期限前に自動更新]
```

---

## 5. データモデル概要

### users（ユーザー）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK |
| clerk_user_id | text | Clerk ユーザーID (UNIQUE) |
| email | text | メールアドレス |
| plan | text | プラン (free/starter/pro) |
| trial_ends_at | timestamptz | トライアル終了日 |
| stripe_customer_id | text | Stripe顧客ID |
| stripe_subscription_id | text | StripeサブスクID |
| created_at | timestamptz | 作成日時 |

### threads_accounts（Threads連携アカウント）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK |
| user_id | uuid | FK → users |
| threads_user_id | text | Threads ユーザーID |
| threads_username | text | Threadsユーザー名 |
| access_token_encrypted | text | 暗号化アクセストークン |
| token_expires_at | timestamptz | トークン有効期限 |
| webhook_subscription_id | text | Webhook登録ID |
| is_active | boolean | 有効/無効 |
| created_at | timestamptz | 連携日時 |

### auto_replies（オートリプライ設定）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK |
| user_id | uuid | FK → users |
| threads_account_id | uuid | FK → threads_accounts |
| name | text | 設定名 |
| trigger_config | jsonb | トリガー設定（イベント種別、キーワード等） |
| target_post_id | text | 対象投稿ID（任意、null=全投稿） |
| message_templates | jsonb | メッセージテンプレート配列 |
| reply_restriction | text | all / followers_only |
| is_active | boolean | 有効/無効 |
| created_at | timestamptz | 作成日時 |
| updated_at | timestamptz | 更新日時 |

### campaigns（抽選キャンペーン）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK |
| user_id | uuid | FK → users |
| threads_account_id | uuid | FK → threads_accounts |
| name | text | キャンペーン名 |
| type | text | instant_reply / instant_web |
| target_post_id | text | 対象投稿ID |
| trigger_config | jsonb | 参加条件 |
| win_rate | decimal | 当選確率 (0.0-1.0) |
| max_winners | integer | 最大当選者数（null=無制限） |
| win_message | text | 当選メッセージ |
| lose_message | text | 落選メッセージ |
| starts_at | timestamptz | 開始日時 |
| ends_at | timestamptz | 終了日時 |
| status | text | draft / active / ended |
| created_at | timestamptz | 作成日時 |

### campaign_entries（キャンペーン参加者）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK |
| campaign_id | uuid | FK → campaigns |
| threads_user_id | text | 参加者のThreadsユーザーID |
| threads_username | text | 参加者のユーザー名 |
| is_winner | boolean | 当選フラグ |
| notified | boolean | 通知済みフラグ |
| entry_at | timestamptz | 参加日時 |

### scheduled_posts（予約投稿）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK |
| user_id | uuid | FK → users |
| threads_account_id | uuid | FK → threads_accounts |
| content | text | 投稿テキスト |
| media_type | text | text / image / video / carousel / gif |
| media_urls | jsonb | メディアURL配列 |
| poll_options | jsonb | 投票選択肢配列（null=投票なし） |
| hashtag | text | ハッシュタグ（1つまで） |
| topic_tag | text | トピックタグ |
| location_id | text | 位置情報ID |
| scheduled_at | timestamptz | 投稿予定日時 |
| auto_reply_id | uuid | FK → auto_replies（紐付ける自動化設定） |
| is_threadstorm | boolean | スレッドストームフラグ |
| threadstorm_posts | jsonb | 連続投稿の内容配列 |
| status | text | scheduled / posted / failed |
| threads_post_id | text | 投稿後のThreads投稿ID |
| created_at | timestamptz | 作成日時 |

### action_logs（送信ログ）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK |
| user_id | uuid | FK → users |
| threads_account_id | uuid | FK → threads_accounts |
| auto_reply_id | uuid | FK → auto_replies（任意） |
| campaign_id | uuid | FK → campaigns（任意） |
| action_type | text | reply_sent / campaign_reply / post_published |
| target_threads_user_id | text | 対象ユーザーID |
| target_threads_username | text | 対象ユーザー名 |
| trigger_type | text | トリガー種別 |
| message_content | text | 送信内容 |
| status | text | success / failed / queued / rate_limited |
| error_message | text | エラー詳細 |
| threads_api_response_id | text | Threads APIレスポンスID |
| created_at | timestamptz | 実行日時 |

### api_usage（API利用量）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK |
| threads_account_id | uuid | FK → threads_accounts |
| date | date | 日付 |
| post_count | integer | 投稿数（リプライ含む） |
| api_call_count | integer | API呼び出し数 |
| updated_at | timestamptz | 最終更新 |

---

## 6. 画面一覧

| 画面ID | 画面名 | パス | 説明 |
|--------|--------|------|------|
| S-001 | LP（トップページ） | `/` | サービス紹介・料金・CTA |
| S-002 | ユーザー登録 | `/sign-up` | Clerk認証 |
| S-003 | ログイン | `/sign-in` | Clerk認証 |
| S-010 | ダッシュボード | `/dashboard` | 概要・API利用状況 |
| S-011 | Threadsアカウント連携 | `/dashboard/connect` | Meta OAuth連携 |
| S-020 | オートリプライ設定 | `/dashboard/auto-reply` | 自動リプライ設定一覧 |
| S-021 | オートリプライ作成/編集 | `/dashboard/auto-reply/new` or `[id]` | 設定フォーム |
| S-030 | リプライ管理 | `/dashboard/replies` | リプライ一覧・モデレーション |
| S-040 | キャンペーン一覧 | `/dashboard/campaigns` | 抽選キャンペーン一覧 |
| S-041 | キャンペーン作成/編集 | `/dashboard/campaigns/new` or `[id]` | キャンペーン設定 |
| S-042 | キャンペーン結果 | `/dashboard/campaigns/[id]/results` | 当選者一覧 |
| S-050 | 予約投稿 | `/dashboard/posts` | 予約投稿一覧・カレンダー |
| S-051 | 予約投稿作成 | `/dashboard/posts/new` | 投稿作成フォーム |
| S-060 | 分析 | `/dashboard/analytics` | レポート・グラフ |
| S-070 | 送信ログ | `/dashboard/logs` | 送信履歴 |
| S-080 | 設定 | `/dashboard/settings` | アカウント・プラン管理 |
| S-081 | プラン・課金 | `/dashboard/settings/billing` | Stripe管理 |
| W-001 | 即時抽選結果ページ | `/lottery/[campaignId]` | Web遷移型の当落結果 |

---

## 7. ユーザーストーリー

| ID | ストーリー | 優先度 |
|----|-----------|--------|
| US-001 | インフルエンサーとして、投稿にリプライした人に自動でお礼リプライを送り、エンゲージメントを高めたい | P0 |
| US-002 | マーケターとして、キャンペーン投稿にリプライした人に即時抽選結果をリプライで知らせたい | P0 |
| US-003 | EC運営者として、投稿にリポストした人にクーポンURLをリプライで送りたい | P0 |
| US-004 | 運用者として、毎日決まった時間にThreadsに投稿を予約し、その投稿にオートリプライを紐付けたい | P0 |
| US-005 | 管理者として、リプライ送信数やAPI残量をリアルタイムで確認したい | P0 |
| US-006 | マーケターとして、投票機能を使ってフォロワーの意見を集め、結果を分析したい | P1 |
| US-007 | 運用者として、不適切なリプライを自動検出して非表示にしたい | P1 |
| US-008 | ユーザーとして、無料プランで基本機能を試してから有料プランにアップグレードしたい | P0 |

---

## 8. API設計概要

### Public API（認証不要）

| Method | Path | 説明 |
|--------|------|------|
| GET | `/api/lottery/[campaignId]` | 抽選結果ページ用データ取得 |

### User API（Clerk認証必須）

| Method | Path | 説明 |
|--------|------|------|
| GET/POST | `/api/threads-accounts` | Threadsアカウント連携管理 |
| DELETE | `/api/threads-accounts/[id]` | 連携解除 |
| GET/POST | `/api/auto-replies` | オートリプライ設定CRUD |
| PUT/DELETE | `/api/auto-replies/[id]` | 設定更新/削除 |
| GET/POST | `/api/campaigns` | キャンペーンCRUD |
| PUT/DELETE | `/api/campaigns/[id]` | キャンペーン更新/削除 |
| GET | `/api/campaigns/[id]/entries` | キャンペーン参加者 |
| GET/POST | `/api/posts` | 予約投稿CRUD |
| PUT/DELETE | `/api/posts/[id]` | 予約投稿更新/削除 |
| GET | `/api/replies` | リプライ一覧取得 |
| PUT | `/api/replies/[id]/hide` | リプライ非表示/表示 |
| GET | `/api/analytics` | 分析データ取得 |
| GET | `/api/logs` | 送信ログ取得 |
| GET | `/api/usage` | API利用状況 |

### Webhook

| Source | Path | 説明 |
|--------|------|------|
| Stripe | `/api/webhooks/stripe` | 課金イベント |
| Meta/Threads | `/api/webhooks/threads` | リプライ・メンション通知 |

### Internal API（Cron / Background）

| Method | Path | 説明 |
|--------|------|------|
| POST | `/api/cron/process-queue` | 送信キュー処理 |
| POST | `/api/cron/scheduled-posts` | 予約投稿実行 |
| POST | `/api/cron/token-refresh` | OAuthトークン更新 |
| POST | `/api/cron/usage-aggregate` | API利用量集計 |

---

## 9. バックグラウンドジョブ設計

| ジョブ | 実行間隔 | 処理内容 |
|--------|---------|---------|
| 送信キュー処理 | 1分ごと | キューのリプライを送信（レートリミット考慮） |
| 予約投稿実行 | 1分ごと | 予定時刻に達した投稿を実行 |
| トークン更新 | 1日1回 | 期限切れ近いOAuthトークンを更新（60日有効） |
| API利用量集計 | 1時間ごと | 日次API利用量を集計 |
| インサイト取得 | 6時間ごと | 投稿ごとのインサイトデータを取得・保存 |

**実装**: Supabase pg_cron + Edge Functions

> **X版との差分**: Webhookが使えるため、ポーリングジョブが不要。ジョブ数が大幅に減少（X版7ジョブ → Threads版5ジョブ）。

---

## 10. プラン設計

### 料金プラン

| プラン | 月額 | 連携アカウント | オートリプライ | キャンペーン | 予約投稿 | 分析 |
|--------|------|-------------|-------------|------------|---------|------|
| **Free** | ¥0 | 1 | 3設定 | 1回/月 | 10件/月 | 基本のみ |
| **Starter** | ¥4,980 | 3 | 無制限 | 無制限 | 無制限 | 詳細分析 |
| **Pro** | ¥14,800 | 10 | 無制限 | 無制限 | 無制限 | 高度分析+CSV |

---

## 11. 月額ランニングコスト見積もり

### 初期フェーズ（〜100ユーザー）

| サービス | プラン | 月額 |
|---------|--------|------|
| Supabase | Free | ¥0 |
| Vercel | Hobby | ¥0 |
| Cloudflare | Free | ¥0 |
| Clerk | Free (10K MAU) | ¥0 |
| Stripe | 売上の3.6% | 変動 |
| Resend | Free (3,000通) | ¥0 |
| Upstash Redis | Free (10K req/日) | ¥0 |
| Sentry | Free | ¥0 |
| **Threads API** | **Free** | **¥0** |
| ドメイン | Namecheap | ¥150 |
| **合計（固定費）** | | **約¥150** |

> **X版との比較**: X版は¥15,150/月（X API Basic $100が支配的）。Threads版は**¥150/月**で運用可能。**約99%のコスト削減**。

### スケールフェーズ（〜1,000ユーザー）

| サービス | プラン | 月額 |
|---------|--------|------|
| Supabase | Pro | ¥3,750（$25） |
| Vercel | Pro | ¥3,000（$20） |
| Upstash Redis | Pay as you go | ¥1,500 |
| Resend | Pro | ¥3,000（$20） |
| Threads API | **Free** | **¥0** |
| **合計** | | **約¥11,400** |

> **X版との比較**: X版スケールフェーズは¥761,400/月（X API Pro $5,000が支配的）。Threads版は**¥11,400/月**。

### 売上シミュレーション

| ユーザー数 | 月額単価 | 月間売上 | 固定費 | 粗利 | 利益率 |
|-----------|---------|---------|--------|------|--------|
| 10 | ¥4,980 | ¥49,800 | ¥150 | ¥49,650 | 99.7% |
| 50 | ¥4,980 | ¥249,000 | ¥150 | ¥248,850 | 99.9% |
| 100 | ¥7,000 | ¥700,000 | ¥5,000 | ¥695,000 | 99.3% |
| 500 | ¥9,800 | ¥4,900,000 | ¥11,400 | ¥4,888,600 | 99.8% |
| 1,000 | ¥9,800 | ¥9,800,000 | ¥11,400 | ¥9,788,600 | 99.9% |

> **驚異的な利益率**: Threads APIが無料のため、ほぼ全額が粗利。

---

## 12. 開発フェーズ

### Phase 1: MVP

| 機能 | 優先度 |
|------|--------|
| ユーザー認証（Clerk） | P0 |
| Threadsアカウント連携（Meta OAuth） | P0 |
| オートリプライ（基本トリガー） | P0 |
| Webhook連携（リプライ・メンション検知） | P0 |
| API利用量管理 | P0 |
| ダッシュボード | P0 |
| Stripe課金（無料プラン+トライアル） | P0 |
| 送信ログ | P0 |

### Phase 2: キャンペーン + 投稿

| 機能 | 優先度 |
|------|--------|
| 即時抽選（オートリプライ型） | P0 |
| 即時抽選（Web遷移型） | P0 |
| 予約投稿（テキスト・画像・動画） | P0 |
| カルーセル投稿 | P1 |
| 投票（ポール）機能 | P1 |

### Phase 3: 高度機能

| 機能 | 優先度 |
|------|--------|
| リプライ管理・モデレーション | P1 |
| 分析・レポート | P1 |
| スレッドストーム予約 | P1 |
| CSVエクスポート | P2 |
| 複数アカウント管理 | P2 |

---

## 13. ドメイン設定

### サブドメイン定義

| 環境 | ドメイン | 備考 |
|------|---------|------|
| 開発環境 | `threads-auto-dev.aidreams-factory.com` | Vercel Preview |
| 本番環境 | `threads-auto.aidreams-factory.com` | Vercel Production |

---

## 14. リスクと対策

| リスク | 影響 | 対策 |
|--------|------|------|
| Meta API仕様変更 | 機能停止 | APIバージョン監視、抽象化レイヤー |
| Threads API有料化 | コスト増加 | 価格転嫁、段階的移行計画 |
| アカウント制限 | 自動化停止 | 公式API準拠、利用ガイドライン遵守 |
| レートリミット超過 | 送信遅延 | キューイング、ユーザーへの通知 |
| 競合参入 | 売上減少 | 先行者優位確保、機能差別化 |
| Threads DM API公開 | 追加開発必要 | DM機能拡張をロードマップに含める |
| Meta App審査 | リリース遅延 | 早期にApp Review申請 |

---

## 15. 将来拡張（Threads DM API公開後）

Threads DM APIが公開された場合に追加予定の機能:

| 機能 | 説明 | 対応するX版機能 |
|------|------|----------------|
| オートDM | トリガーに基づくDM自動送信 | FR-001 |
| 後日抽選（DM通知型） | 当選者にDMで通知 | FR-005 |
| ステップ配信 | 時間差DM配信 | FR-008 |

---

## 受入基準チェックリスト

- [ ] Threadsアカウント連携（Meta OAuth 2.0）が動作する
- [ ] Webhook受信でリプライ・メンションを検知できる
- [ ] オートリプライが各トリガーで正しく送信される
- [ ] API制限（250投稿/24時間）が正しく管理される
- [ ] 抽選キャンペーン2種が正しく動作する
- [ ] 予約投稿が指定時刻に正しく実行される
- [ ] Stripe課金・無料プラン・トライアルが正しく動作する
- [ ] 送信ログが全アクションで記録される
- [ ] TypeScript strict mode でビルドエラー 0件

---

*Generated by CCAGI SDK - Phase 1: Requirements*
*Project: Threads Automation Platform*
