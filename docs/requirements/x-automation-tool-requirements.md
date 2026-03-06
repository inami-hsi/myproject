# X自動化ツール 要件定義書

**プロジェクト名**: X Automation Platform（XStep型ツール）
**Phase**: 1 - Requirements
**作成日**: 2026-03-04
**参考**: [XTEP（エックステップ）](https://xtep.tools/)
**ステータス**: Draft

---

## 1. プロジェクト概要

### 1.1 目的

X（旧Twitter）公式APIを活用し、ユーザーのアクション（フォロー、いいね、リポスト、リプライ）をトリガーとして自動DM・自動リプライを送信するSaaS型の自動化ツール。抽選キャンペーン、予約投稿、分析機能を備え、X運用とビジネス成果を最大化する。

### 1.2 ビジネスモデル

| 項目 | 内容 |
|------|------|
| 収益モデル | 月額サブスクリプション |
| ターゲット価格 | ¥9,800〜¥22,000/月 |
| 無料トライアル | 7日間（全機能利用可能） |
| 最低契約期間 | なし（月額課金） |
| キャンペーン実施回数 | 無制限 |

### 1.3 ターゲットユーザー

| ユーザー種別 | 説明 |
|-------------|------|
| **個人インフルエンサー** | Xでのフォロワー拡大・マネタイズ |
| **中小企業マーケター** | プロモーション・キャンペーン運用 |
| **ECサイト運営者** | 商品告知・クーポン配布 |
| **コンテンツクリエイター** | 有料コンテンツの配布・告知 |

### 1.4 競合分析

| ツール | 初期費用 | 月額 | 特徴 |
|--------|---------|------|------|
| XTEP | ¥0 | ¥22,000 | X公式API、全機能セット |
| ATELU | ¥100,000 | ¥45,000〜 | 法人向け |
| キャンつく | ¥50,000〜 | ¥50,000〜 | 抽選特化 |
| **本ツール** | ¥0 | ¥9,800〜 | 無料枠最大活用、低価格 |

---

## 2. 機能要件

### FR-001: オートDM（自動DM送信）

- **優先度**: P0-Critical
- **説明**: ユーザーのアクションをトリガーにDMを自動送信する
- **受入基準**:
  - [ ] 以下のトリガー条件でDM自動送信が動作する:
    - フォロー
    - いいね
    - リポスト
    - リプライ（特定キーワード含む）
    - 引用リポスト
  - [ ] 複数トリガー条件のAND組み合わせに対応（例: フォロー AND リポスト）
  - [ ] DM本文にテンプレート変数（ユーザー名、日時等）を使用できる
  - [ ] 画像・リンクを含むDMを送信できる
  - [ ] 送信対象の投稿（ポスト）を指定できる
  - [ ] X API上限（24時間100通）に達した場合のキューイング・繰り越し処理
  - [ ] 送信ログの確認
  - [ ] DM送信の有効/無効切り替え

### FR-002: オートリプライ（自動リプライ送信）

- **優先度**: P0-Critical
- **説明**: ユーザーのアクションをトリガーにリプライを自動送信する
- **受入基準**:
  - [ ] 以下のトリガー条件でリプライ自動送信が動作する:
    - いいね
    - リポスト
    - リプライ
    - フォロー
    - ハッシュタグ（指定ハッシュタグを含む投稿）
    - 引用リポスト
  - [ ] リプライ内容をテンプレートでカスタマイズ可能
  - [ ] 複数のリプライテンプレートからランダム送信対応
  - [ ] X API上限（24時間2,400通 / 3時間300通）の管理
  - [ ] 送信ログの確認

### FR-003: シークレットリプライ

- **優先度**: P0-Critical
- **説明**: タイムラインの「ポストと返信」欄に表示されない特殊リプライを送信する
- **受入基準**:
  - [ ] リプライがタイムライン上に表示されない
  - [ ] リプライ通知は対象ユーザーにのみ届く
  - [ ] リプライ内にURLリンクを含められる
  - [ ] 限定特典配布や外部サイト誘導に使用可能
  - [ ] オートリプライの送信モードとしてシークレットを選択可能

### FR-004: 固定リプライ

- **優先度**: P1-High
- **説明**: 投稿が一定の条件に達したときに自動でリプライを固定表示する
- **受入基準**:
  - [ ] 条件設定（例: いいね100件達成、リポスト50件達成）
  - [ ] 条件達成時に指定リプライを自動的に固定
  - [ ] 固定するリプライ内容をカスタマイズ可能
  - [ ] 条件達成のリアルタイム監視

### FR-005: 抽選キャンペーン

- **優先度**: P0-Critical
- **説明**: フォロワー獲得・エンゲージメント向上のための抽選キャンペーンを実施する
- **受入基準**:
  - [ ] **即時抽選（オートリプライ型）**: アクション即時に当落結果をリプライで通知
  - [ ] **即時抽選（Web遷移型）**: 当落結果確認用のWebページへURLでリダイレクト
  - [ ] **後日抽選**: 指定期日に当選者を自動選出し、DMで通知
  - [ ] 当選確率の設定（例: 10%、固定当選数）
  - [ ] 当選条件の設定（フォロー必須、リポスト必須等）
  - [ ] 当選メッセージ・落選メッセージのカスタマイズ
  - [ ] 重複参加の防止
  - [ ] 当選者一覧のCSVエクスポート
  - [ ] キャンペーン回数無制限

### FR-006: 予約投稿

- **優先度**: P1-High
- **説明**: 指定日時に自動で投稿（ポスト）を行う
- **受入基準**:
  - [ ] 日時を指定して投稿を予約できる
  - [ ] テキスト + 画像（最大4枚）の投稿
  - [ ] 予約投稿にオートDM/オートリプライ設定を紐付け可能
  - [ ] 予約一覧の確認・編集・削除
  - [ ] タイムゾーン対応

### FR-007: Threads同時投稿

- **優先度**: P2-Medium
- **説明**: X投稿と同時にThreadsにも同じ内容を投稿する
- **受入基準**:
  - [ ] Threads APIとの連携
  - [ ] X投稿時にThreadsへの同時投稿をON/OFFできる
  - [ ] Threads用にテキストを別途カスタマイズ可能

### FR-008: ステップ配信

- **優先度**: P1-High
- **説明**: トリガーアクション後に時間差で複数メッセージを順次配信する
- **受入基準**:
  - [ ] ステップの設定（メッセージ1 → 30分後にメッセージ2 → 1日後にメッセージ3）
  - [ ] 各ステップごとに送信内容（DM/リプライ）をカスタマイズ
  - [ ] ステップ間隔を分・時間・日単位で設定可能
  - [ ] 配信停止条件の設定（特定アクションで配信中止）
  - [ ] ステップ配信の進捗確認

### FR-009: 分析・レポート

- **優先度**: P1-High
- **説明**: キャンペーンや自動返信のパフォーマンスを分析する
- **受入基準**:
  - [ ] DM送信数・成功率
  - [ ] リプライ送信数・成功率
  - [ ] キャンペーン参加者数
  - [ ] 当選者数
  - [ ] フォロワー増減数
  - [ ] インプレッション数（対象投稿）
  - [ ] API利用量（残り送信可能数）
  - [ ] 日別・週別・月別のトレンドグラフ
  - [ ] CSVエクスポート

### FR-010: ユーザー認証・課金

- **優先度**: P0-Critical
- **説明**: ユーザー登録・ログイン・サブスクリプション課金を行う
- **受入基準**:
  - [ ] メール + パスワードでのユーザー登録・ログイン
  - [ ] Google OAuth ログイン対応
  - [ ] Stripe月額サブスクリプション課金
  - [ ] 7日間無料トライアル
  - [ ] プラン変更・解約の自動処理
  - [ ] 請求書・領収書の発行

### FR-011: X（Twitter）アカウント連携

- **優先度**: P0-Critical
- **説明**: ユーザーのXアカウントをOAuthで連携する
- **受入基準**:
  - [ ] X OAuth 2.0 PKCE認証フロー
  - [ ] アクセストークン・リフレッシュトークンの安全な保管
  - [ ] トークン自動更新
  - [ ] 複数Xアカウントの管理対応（将来拡張）
  - [ ] 連携解除機能
  - [ ] 必要なスコープ: `tweet.read`, `tweet.write`, `dm.read`, `dm.write`, `users.read`, `follows.read`, `like.read`

### FR-012: 管理ダッシュボード

- **優先度**: P0-Critical
- **説明**: 全機能を一元管理するダッシュボード
- **受入基準**:
  - [ ] 有効なオートDM/オートリプライ設定の一覧
  - [ ] アクティブなキャンペーン一覧
  - [ ] API利用状況（DM残数 / リプライ残数）のリアルタイム表示
  - [ ] 直近の送信ログ
  - [ ] クイックアクション（新規設定作成）

---

## 3. 非機能要件

### NFR-001: パフォーマンス

| 指標 | 目標値 |
|------|--------|
| ダッシュボード初期表示 | < 2s |
| API応答時間 | < 500ms |
| Webhook処理遅延 | < 5s（トリガーからDM/リプライ送信まで） |
| 同時接続ユーザー | 1,000+ |

### NFR-002: 可用性

| 指標 | 目標値 |
|------|--------|
| 稼働率 | 99.9% |
| Webhook受信 | 24時間365日 |
| ジョブ処理 | 障害時自動リトライ（最大3回） |

### NFR-003: セキュリティ

| 項目 | 対策 |
|------|------|
| X OAuth トークン | AES-256暗号化してDB保存 |
| API通信 | 全てHTTPS |
| ユーザーデータ | Supabase RLS + 暗号化 |
| 決済 | Stripe PCI DSS準拠 |
| Webhook検証 | X-Webhook-Signatureの検証 |
| CSRF/XSS | Next.js標準 + CSP |

### NFR-004: X API制限の管理

| リソース | 制限 | 対策 |
|---------|------|------|
| DM送信 | 100通/24時間 | キューイング + 24h後繰り越し |
| リプライ送信 | 2,400通/24時間（300通/3時間） | レートリミッター |
| API呼び出し | プランに応じた制限 | Upstash Redisでカウント管理 |
| ツイート取得 | プランに応じた制限 | キャッシュ + バッチ処理 |

### NFR-005: スケーラビリティ

| 項目 | 対応 |
|------|------|
| ユーザー増加 | Vercel自動スケール + Supabase接続プール |
| Webhook処理 | キューベースの非同期処理 |
| ジョブ実行 | Supabase Edge Functions + pg_cron |

---

## 4. 技術制約

### TC-001: 技術スタック

> **方針**: 無料枠を最大限活用し、初期コストを最小化する

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
| **キャッシュ/キュー** | Upstash Redis | 10,000 req/日 | API制限管理・ジョブキュー |
| **エラー監視** | Sentry | 5,000イベント/月 | エラートラッキング |
| **X API** | X API (Basic) | - | コア機能 |

### TC-002: X API プラン選定

| プラン | 月額 | ポスト取得 | ポスト作成 | 用途 |
|--------|------|-----------|-----------|------|
| Free | $0 | 1,500/月 | 投稿のみ | 開発・テスト |
| Basic | $100 | 10,000/月 | 50,000ツイート読取/月 | 最小プロダクション |
| Pro | $5,000 | 1,000,000/月 | 300,000ツイート読取/月 | 本格運用 |

**推奨**: 初期は **Basic ($100/月)** で開始。ユーザー数に応じてProへ移行。

### TC-003: X API Webhookの代替

X API v2 ではWebhookが廃止されており、Account Activity API (Premium v1.1) は高額。

**代替戦略**:
| 方式 | 仕組み | メリット | デメリット |
|------|--------|---------|-----------|
| **ポーリング** | 定期的にAPIを叩いてアクション検知 | 実装シンプル | API呼び出し消費、遅延あり |
| **Filtered Stream** | X API v2のリアルタイムストリーム | リアルタイム検知 | 接続維持が必要 |
| **組み合わせ** | ストリーム（リプライ・メンション検知）+ ポーリング（いいね・フォロー検知） | バランス良い | 実装やや複雑 |

**推奨**: Filtered Stream + ポーリングの組み合わせ。
- リプライ・メンション → Filtered Stream（リアルタイム）
- いいね・リポスト・フォロー → ポーリング（1〜5分間隔）

### TC-004: ジョブ処理アーキテクチャ

```
[トリガー検知]
    │
    ▼
[Upstash Redis Queue]  ← ジョブ登録
    │
    ▼
[Vercel Serverless / Supabase Edge Functions]
    │
    ├── DM送信ジョブ（レートリミット考慮）
    ├── リプライ送信ジョブ（レートリミット考慮）
    ├── ステップ配信ジョブ（遅延実行）
    └── 抽選処理ジョブ
```

---

## 5. データモデル概要

### users（ユーザー）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK |
| clerk_user_id | text | Clerk ユーザーID (UNIQUE) |
| email | text | メールアドレス |
| plan | text | プラン (free_trial/basic/pro) |
| trial_ends_at | timestamptz | トライアル終了日 |
| stripe_customer_id | text | Stripe顧客ID |
| stripe_subscription_id | text | StripeサブスクID |
| created_at | timestamptz | 作成日時 |

### x_accounts（X連携アカウント）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK |
| user_id | uuid | FK → users |
| x_user_id | text | X ユーザーID |
| x_username | text | Xユーザー名 (@xxx) |
| x_display_name | text | X表示名 |
| access_token_encrypted | text | 暗号化アクセストークン |
| refresh_token_encrypted | text | 暗号化リフレッシュトークン |
| token_expires_at | timestamptz | トークン有効期限 |
| is_active | boolean | 有効/無効 |
| created_at | timestamptz | 連携日時 |

### automations（自動化設定）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK |
| user_id | uuid | FK → users |
| x_account_id | uuid | FK → x_accounts |
| name | text | 設定名 |
| type | text | auto_dm / auto_reply / secret_reply / pinned_reply |
| trigger_config | jsonb | トリガー設定 |
| target_post_id | text | 対象投稿ID（任意） |
| message_templates | jsonb | メッセージテンプレート配列 |
| is_active | boolean | 有効/無効 |
| created_at | timestamptz | 作成日時 |
| updated_at | timestamptz | 更新日時 |

### campaigns（抽選キャンペーン）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK |
| user_id | uuid | FK → users |
| x_account_id | uuid | FK → x_accounts |
| name | text | キャンペーン名 |
| type | text | instant_reply / instant_web / delayed |
| target_post_id | text | 対象投稿ID |
| trigger_config | jsonb | 参加条件 |
| win_rate | decimal | 当選確率 (0.0-1.0) |
| max_winners | integer | 最大当選者数（null=無制限） |
| win_message | text | 当選メッセージ |
| lose_message | text | 落選メッセージ |
| starts_at | timestamptz | 開始日時 |
| ends_at | timestamptz | 終了日時 |
| draw_at | timestamptz | 抽選日時（後日抽選用） |
| status | text | draft / active / ended / drawn |
| created_at | timestamptz | 作成日時 |

### campaign_entries（キャンペーン参加者）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK |
| campaign_id | uuid | FK → campaigns |
| x_user_id | text | 参加者のXユーザーID |
| x_username | text | 参加者のXユーザー名 |
| is_winner | boolean | 当選フラグ |
| notified | boolean | 通知済みフラグ |
| entry_at | timestamptz | 参加日時 |

### scheduled_posts（予約投稿）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK |
| user_id | uuid | FK → users |
| x_account_id | uuid | FK → x_accounts |
| content | text | 投稿テキスト |
| media_urls | jsonb | 画像URL配列 |
| scheduled_at | timestamptz | 投稿予定日時 |
| automation_id | uuid | FK → automations（紐付ける自動化設定） |
| post_to_threads | boolean | Threads同時投稿フラグ |
| status | text | scheduled / posted / failed |
| x_post_id | text | 投稿後のX投稿ID |
| created_at | timestamptz | 作成日時 |

### step_sequences（ステップ配信設定）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK |
| automation_id | uuid | FK → automations |
| step_order | integer | ステップ順序 |
| delay_minutes | integer | 前ステップからの遅延（分） |
| message_type | text | dm / reply |
| message_content | text | メッセージ内容 |
| is_active | boolean | 有効/無効 |

### step_progress（ステップ配信進捗）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK |
| step_sequence_id | uuid | FK → step_sequences |
| x_user_id | text | 対象ユーザーのXID |
| current_step | integer | 現在のステップ |
| next_send_at | timestamptz | 次回送信予定日時 |
| status | text | in_progress / completed / stopped |
| started_at | timestamptz | 開始日時 |

### action_logs（送信ログ）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK |
| user_id | uuid | FK → users |
| x_account_id | uuid | FK → x_accounts |
| automation_id | uuid | FK → automations（任意） |
| campaign_id | uuid | FK → campaigns（任意） |
| action_type | text | dm_sent / reply_sent / secret_reply_sent / pinned_reply |
| target_x_user_id | text | 対象ユーザーのXID |
| target_x_username | text | 対象ユーザー名 |
| trigger_type | text | トリガー種別 |
| message_content | text | 送信内容 |
| status | text | success / failed / queued / rate_limited |
| error_message | text | エラー詳細 |
| x_api_response_id | text | X APIレスポンスID |
| created_at | timestamptz | 実行日時 |

### api_usage（API利用量）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK |
| x_account_id | uuid | FK → x_accounts |
| date | date | 日付 |
| dm_sent_count | integer | DM送信数 |
| reply_sent_count | integer | リプライ送信数 |
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
| S-011 | Xアカウント連携 | `/dashboard/connect` | OAuth連携 |
| S-020 | オートDM設定 | `/dashboard/auto-dm` | DM自動送信設定一覧 |
| S-021 | オートDM作成/編集 | `/dashboard/auto-dm/new` or `[id]` | DM設定フォーム |
| S-030 | オートリプライ設定 | `/dashboard/auto-reply` | リプライ自動送信設定一覧 |
| S-031 | オートリプライ作成/編集 | `/dashboard/auto-reply/new` or `[id]` | リプライ設定フォーム |
| S-040 | キャンペーン一覧 | `/dashboard/campaigns` | 抽選キャンペーン一覧 |
| S-041 | キャンペーン作成/編集 | `/dashboard/campaigns/new` or `[id]` | キャンペーン設定 |
| S-042 | キャンペーン結果 | `/dashboard/campaigns/[id]/results` | 当選者一覧 |
| S-050 | 予約投稿 | `/dashboard/posts` | 予約投稿一覧 |
| S-051 | 予約投稿作成 | `/dashboard/posts/new` | 投稿作成フォーム |
| S-060 | ステップ配信 | `/dashboard/steps` | ステップ配信設定一覧 |
| S-061 | ステップ配信作成/編集 | `/dashboard/steps/new` or `[id]` | ステップ設定 |
| S-070 | 分析 | `/dashboard/analytics` | レポート・グラフ |
| S-080 | 送信ログ | `/dashboard/logs` | 送信履歴 |
| S-090 | 設定 | `/dashboard/settings` | アカウント・プラン管理 |
| S-091 | プラン・課金 | `/dashboard/settings/billing` | Stripe管理 |
| W-001 | 即時抽選結果ページ | `/lottery/[campaignId]` | Web遷移型の当落結果 |

---

## 7. ユーザーストーリー

| ID | ストーリー | 優先度 |
|----|-----------|--------|
| US-001 | インフルエンサーとして、フォローしてくれた人に自動でDMを送り、LINEやリンクを案内したい | P0 |
| US-002 | 企業マーケターとして、キャンペーン投稿にいいね+リポストした人に即時抽選結果をリプライしたい | P0 |
| US-003 | EC運営者として、投稿にリプライした人にクーポンURLをシークレットリプライで送りたい | P0 |
| US-004 | クリエイターとして、投稿が100いいねを超えたら自動で特典リプライを固定表示したい | P1 |
| US-005 | マーケターとして、フォロー後に3段階のステップDMで教育コンテンツを配信したい | P1 |
| US-006 | 運営者として、毎日決まった時間にXに投稿を予約し、その投稿にオートリプライを紐付けたい | P1 |
| US-007 | 管理者として、DM・リプライの送信数やAPI残量をリアルタイムで確認したい | P0 |
| US-008 | ユーザーとして、7日間の無料トライアルで全機能を試してから課金を判断したい | P0 |

---

## 8. API設計概要

### Public API（認証不要）

| Method | Path | 説明 |
|--------|------|------|
| GET | `/api/lottery/[campaignId]` | 抽選結果ページ用データ取得 |

### User API（Clerk認証必須）

| Method | Path | 説明 |
|--------|------|------|
| GET/POST | `/api/x-accounts` | Xアカウント連携管理 |
| GET/POST | `/api/automations` | 自動化設定CRUD |
| PUT/DELETE | `/api/automations/[id]` | 自動化設定更新/削除 |
| GET/POST | `/api/campaigns` | キャンペーンCRUD |
| PUT/DELETE | `/api/campaigns/[id]` | キャンペーン更新/削除 |
| GET | `/api/campaigns/[id]/entries` | キャンペーン参加者 |
| POST | `/api/campaigns/[id]/draw` | 後日抽選実行 |
| GET/POST | `/api/posts` | 予約投稿CRUD |
| DELETE | `/api/posts/[id]` | 予約投稿削除 |
| GET/POST | `/api/steps` | ステップ配信CRUD |
| GET | `/api/analytics` | 分析データ取得 |
| GET | `/api/logs` | 送信ログ取得 |
| GET | `/api/usage` | API利用状況 |

### Internal API（Cron / Background）

| Method | Path | 説明 |
|--------|------|------|
| POST | `/api/cron/poll-actions` | いいね・フォロー等のポーリング |
| POST | `/api/cron/process-queue` | 送信キュー処理 |
| POST | `/api/cron/scheduled-posts` | 予約投稿実行 |
| POST | `/api/cron/step-delivery` | ステップ配信処理 |
| POST | `/api/cron/campaign-draw` | 後日抽選実行 |
| POST | `/api/cron/token-refresh` | OAuthトークン更新 |

### Webhook

| Source | Path | 説明 |
|--------|------|------|
| Stripe | `/api/webhooks/stripe` | 課金イベント |
| X API | `/api/webhooks/x-stream` | Filtered Streamエンドポイント |

---

## 9. バックグラウンドジョブ設計

| ジョブ | 実行間隔 | 処理内容 |
|--------|---------|---------|
| アクションポーリング | 1〜5分ごと | X APIでいいね・フォロー・リポストを検知 |
| 送信キュー処理 | 1分ごと | キューのDM/リプライを送信（レートリミット考慮） |
| 予約投稿実行 | 1分ごと | 予定時刻に達した投稿を実行 |
| ステップ配信 | 5分ごと | 次回送信時刻に達したステップを処理 |
| 後日抽選 | 1時間ごと | 抽選日時に達したキャンペーンを処理 |
| トークン更新 | 6時間ごと | 期限切れ近いOAuthトークンを更新 |
| API利用量集計 | 1時間ごと | 日次API利用量を集計 |

**実装**: Supabase pg_cron + Edge Functions（Vercel Cron Jobsは無料枠1回/日のため）

---

## 10. 月額ランニングコスト見積もり

### 初期フェーズ（〜50ユーザー）

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
| **X API** | **Basic** | **¥15,000（$100）** |
| ドメイン | Namecheap | ¥150 |
| **合計（固定費）** | | **約¥15,150** |

### スケールフェーズ（〜500ユーザー）

| サービス | プラン | 月額 |
|---------|--------|------|
| Supabase | Pro | ¥3,750（$25） |
| Vercel | Pro | ¥3,000（$20） |
| Upstash Redis | Pay as you go | ¥1,500 |
| X API | Pro | ¥750,000（$5,000） |
| Resend | Pro | ¥3,000（$20） |
| **合計** | | **約¥761,400** |

> X API Proプランのコストが大きいため、ユーザー課金でカバーする必要あり。
> 500ユーザー × ¥22,000 = ¥11,000,000/月 → 十分な利益。

### 売上シミュレーション

| ユーザー数 | 月額単価 | 月間売上 | 固定費 | 粗利 |
|-----------|---------|---------|--------|------|
| 10 | ¥9,800 | ¥98,000 | ¥15,150 | ¥82,850 |
| 50 | ¥9,800 | ¥490,000 | ¥15,150 | ¥474,850 |
| 100 | ¥15,000 | ¥1,500,000 | ¥100,000 | ¥1,400,000 |
| 500 | ¥22,000 | ¥11,000,000 | ¥761,400 | ¥10,238,600 |

---

## 11. 開発フェーズ

### Phase 1: MVP

| 機能 | 優先度 |
|------|--------|
| ユーザー認証（Clerk） | P0 |
| Xアカウント連携（OAuth 2.0） | P0 |
| オートDM（基本トリガー） | P0 |
| オートリプライ（基本トリガー） | P0 |
| シークレットリプライ | P0 |
| API利用量管理 | P0 |
| ダッシュボード | P0 |
| Stripe課金（トライアル付き） | P0 |
| 送信ログ | P0 |

### Phase 2: キャンペーン

| 機能 | 優先度 |
|------|--------|
| 即時抽選（オートリプライ型） | P0 |
| 即時抽選（Web遷移型） | P0 |
| 後日抽選 | P0 |
| 予約投稿 | P1 |
| 固定リプライ | P1 |

### Phase 3: 高度機能

| 機能 | 優先度 |
|------|--------|
| ステップ配信 | P1 |
| 分析・レポート | P1 |
| Threads同時投稿 | P2 |
| CSVエクスポート | P2 |

---

## 12. ドメイン設定

### サブドメイン定義

| 環境 | ドメイン | 備考 |
|------|---------|------|
| 開発環境 | `xauto-dev.aidreams-factory.com` | Vercel Preview |
| 本番環境 | `xauto.aidreams-factory.com` または独自ドメイン | Vercel Production |

---

## 13. リスクと対策

| リスク | 影響 | 対策 |
|--------|------|------|
| X API仕様変更 | 機能停止 | APIバージョン監視、抽象化レイヤー |
| X API料金改定 | コスト増加 | 価格転嫁、プラン見直し |
| アカウント凍結 | ユーザー離反 | 公式API準拠、利用ガイドライン |
| レートリミット超過 | 送信遅延 | キューイング、ユーザーへの通知 |
| 競合の低価格化 | 売上減少 | 機能差別化、UX向上 |

---

## 受入基準チェックリスト

- [ ] Xアカウント連携（OAuth 2.0）が動作する
- [ ] オートDMが各トリガーで正しく送信される
- [ ] オートリプライが各トリガーで正しく送信される
- [ ] シークレットリプライがタイムライン非表示で送信される
- [ ] API制限（DM 100通/日、リプライ 2,400通/日）が正しく管理される
- [ ] 抽選キャンペーン3種が正しく動作する
- [ ] Stripe課金・トライアルが正しく動作する
- [ ] 送信ログが全アクションで記録される
- [ ] TypeScript strict mode でビルドエラー 0件

---

*Generated by CCAGI SDK - Phase 1: Requirements*
*Project: X Automation Platform*
