# フローテスト設計書 --- Company List Builder

**プロジェクト名**: Company List Builder（企業リストビルダー）
**Phase**: 5 - Testing (Flow Test Design)
**作成日**: 2026-03-05
**入力ドキュメント**:
- `docs/requirements/company-list-builder-requirements.md`
- `docs/design/company-list-builder-spec.md`

---

## 概要

| 項目 | 値 |
|------|-----|
| フローシナリオ数 | 10 |
| 認証フロー | FLOW-001（サインアップ〜オンボーディング） |
| ビジネスフロー | FLOW-002（検索〜条件保存〜復元） |
| 課金フロー | FLOW-003（アップグレード）、FLOW-004（ダウングレード）、FLOW-005（キャンセル）、FLOW-006（月次リセット） |
| データ同期フロー | FLOW-007（gBizINFO日次同期）、FLOW-008（国税庁月次インポート） |
| 通知フロー | FLOW-009（新規法人通知） |
| ダウンロードフロー | FLOW-010（非同期ダウンロード） |

### テスト環境

| 項目 | 値 |
|------|-----|
| フレームワーク | Playwright |
| テスト実行環境 | Docker（Supabase Local + Next.js） |
| 認証モック | Clerk Testing Token |
| 課金モック | Stripe Test Mode（`sk_test_xxx`） |
| メールモック | Resend Test Mode / Mailpit |
| 外部API | gBizINFO/国税庁 のスタブサーバー（MSW） |

---

## FLOW-001: 新規サインアップ → Clerk認証 → usersテーブル作成 → Stripe Customer作成 → オンボーディング

### 目的

新規ユーザーがサインアップからオンボーディング完了までのフルフローを検証する。Clerk Webhook経由でusersテーブルにレコードが作成され、Stripe Customerが自動生成されることを確認する。

### フローステップ

| Step | 操作 | API | 期待結果 |
|------|------|-----|----------|
| 1 | LPページ（`/`）にアクセス | - | LP画面が表示される。「無料で始める」CTAボタンが表示される |
| 2 | 「無料で始める」CTAをクリック | - | `/sign-up` 画面に遷移する |
| 3 | メール+パスワードでサインアップ | Clerk API | Clerkにユーザーが作成される。メール確認が送信される |
| 4 | メール確認を完了 | Clerk API | Clerk側のユーザーステータスがactiveになる |
| 5 | Clerk Webhook `user.created` がアプリに送信される | `POST /api/webhooks/clerk` | Webhook署名検証が成功し、200が返る |
| 6 | usersテーブルにレコードが作成される | (Webhook内部処理) | `clerk_user_id`, `email`, `plan='free'`, `monthly_download_count=0` が設定される |
| 7 | Stripe Customer が自動作成される | Stripe API (`stripe.customers.create`) | `stripe_customer_id` がusersテーブルに保存される |
| 8 | サインアップ完了後、検索画面（`/search`）にリダイレクト | - | 検索画面が表示される。ヘッダーにユーザー名が表示される |
| 9 | ダッシュボード（`/dashboard`）にアクセス | `GET /api/usage` | プラン=Free、ダウンロード残数=50件、保存検索0件が表示される |

### 検証ポイント

- [ ] Clerk Webhook (`user.created`) が正常に受信・処理される
- [ ] usersテーブルに正しいカラム値でレコードが作成される（plan='free', status='active'）
- [ ] Stripe Customerが作成され、`stripe_customer_id`がusersレコードに紐付く
- [ ] サインアップ後にClerk JWTが発行され、APIリクエストに使用できる
- [ ] `/api/usage` が Free プランの制限値を正しく返す
- [ ] Google OAuthでのサインアップでも同じフローが機能する

### エラー分岐

| Step | 失敗パス | 期待される挙動 |
|------|---------|---------------|
| 3 | 既存メールアドレスで登録 | Clerkがエラー表示「このメールアドレスは既に使用されています」 |
| 4 | メール確認リンク期限切れ | 再送リンクが表示される |
| 5 | Webhook署名検証失敗 | 400レスポンス返却。Sentryアラート発報 |
| 6 | usersテーブルへのINSERT失敗（DB接続エラー等） | Webhook 500レスポンス。Clerkがリトライする。次回API呼び出し時にupsertで回復 |
| 7 | Stripe Customer作成失敗 | usersテーブルの`stripe_customer_id`はNULL。課金開始時に再作成を試みる |

### テストデータ要件

| データ | 値 |
|--------|-----|
| テストメール | `flow001-test@example.com` |
| テストパスワード | `Test1234!@#` |
| Google OAuthテスト | Clerk Testing Token使用 |

---

## FLOW-002: ログイン → 検索操作 → 条件保存 → ログアウト → 再ログイン → 保存検索復元

### 目的

認証済みユーザーが検索→条件保存→ログアウト→再ログイン後に保存検索が正しく復元されるフルフローを検証する。

### 前提条件

- FLOW-001で作成されたユーザー（Freeプラン）が存在すること
- companiesテーブルにテストデータ（東京都の製造業企業）が投入済みであること

### フローステップ

| Step | 操作 | API | 期待結果 |
|------|------|-----|----------|
| 1 | `/sign-in` でログイン | Clerk API | Clerk JWTが発行される。`/search` にリダイレクト |
| 2 | 業種フィルタで「E: 製造業」を選択 | `GET /api/search/count` | ライブカウンターに概算件数が表示される（例: 「約 12,345 件」） |
| 3 | 地域フィルタで「東京都」を選択 | `GET /api/search/count` | カウンターが更新される（例: 「約 3,456 件」） |
| 4 | 検索結果テーブルを確認 | `POST /api/search` | 最初の50件が表示される。法人名、所在地、業種、資本金等のカラムが表示される |
| 5 | 「検索条件を保存」ボタンをクリック | - | 保存ダイアログが表示される |
| 6 | 条件名「東京都の製造業」を入力して保存 | `POST /api/saved-searches` | 201レスポンス。search_paramsに `{"industries":["E"],"prefectures":["13"]}` が保存される |
| 7 | ダッシュボード（`/dashboard`）に遷移 | `GET /api/saved-searches` | 保存検索一覧に「東京都の製造業」が表示される |
| 8 | ログアウト | Clerk API | セッション破棄。`/` にリダイレクト |
| 9 | 再度 `/sign-in` でログイン | Clerk API | Clerk JWTが再発行される |
| 10 | ダッシュボード（`/dashboard`）にアクセス | `GET /api/saved-searches` | 保存検索一覧に「東京都の製造業」が表示される |
| 11 | 保存検索「東京都の製造業」をクリック | `POST /api/search` | 検索画面にフィルタ条件が復元され、結果が表示される |

### 検証ポイント

- [ ] フィルタ変更時にライブカウンター（MV経由）が300msデバウンス後に更新される
- [ ] 検索結果がkeyset paginationで正しくページネーションされる
- [ ] saved_searchesテーブルにsearch_paramsがJSONBで正しく保存される
- [ ] ログアウト後にAPIアクセスが401で拒否される
- [ ] 再ログイン後に保存検索が完全に復元される（パラメータが一致する）
- [ ] Freeプランで保存検索3件目まで保存でき、4件目でエラーが返る

### エラー分岐

| Step | 失敗パス | 期待される挙動 |
|------|---------|---------------|
| 4 | 検索APIタイムアウト（10秒超） | 「検索に時間がかかっています。条件を絞り込んでください。」が表示される |
| 6 | 保存上限超過（Freeプラン4件目） | 403エラー `SAVED_SEARCH_LIMIT`。「保存上限(3件)に達しました。」表示 |
| 6 | 同名の検索条件保存 | 保存成功（同名は許可される。IDで区別） |
| 9 | パスワード間違い | Clerkエラー表示。ログイン失敗 |

### テストデータ要件

| データ | 値 |
|--------|-----|
| テストユーザー | FLOW-001で作成済みユーザー |
| companiesテストデータ | 東京都(prefecture_code='13')の製造業(jsic_code LIKE 'E%')企業 100件以上 |
| industry_classificationsマスタ | 大分類E（製造業）配下のマスタデータ |
| prefecturesマスタ | 47都道府県マスタ |

---

## FLOW-003: Free → Starter → Pro プランアップグレード（Stripe Checkout → Webhook → エンタイトルメント更新）

### 目的

Freeプランユーザーが Stripe Checkout 経由で Starter にアップグレードし、さらに Pro にアップグレードするフローを検証する。各ステップで usersテーブルの plan カラムとエンタイトルメント（制限値）が正しく更新されることを確認する。

### 前提条件

- FLOW-001で作成されたFreeプランユーザーが存在すること
- Stripe Test Mode が有効であること

### フローステップ

| Step | 操作 | API | 期待結果 |
|------|------|-----|----------|
| 1 | `/pricing` ページにアクセス | - | Free / Starter / Pro の3プランが表示される。Freeプランに「現在のプラン」バッジ |
| 2 | Starterプランの「アップグレード」をクリック | `POST /api/checkout` | Stripe Checkout Session が作成される。Stripe Checkout画面にリダイレクト |
| 3 | Stripe Checkout画面でテストカード（`4242424242424242`）を入力して支払い完了 | Stripe API | `checkout.session.completed` イベントが発行される |
| 4 | Stripe Webhook `checkout.session.completed` がアプリに送信される | `POST /api/webhooks/stripe` | Webhook署名検証成功。usersテーブルの `plan='starter'`, `stripe_customer_id`, `stripe_subscription_id` が更新される |
| 5 | `/dashboard?checkout=success` にリダイレクト | `GET /api/usage` | プラン=Starter、ダウンロード上限=3,000件に更新されている |
| 6 | 検索画面でExcelダウンロードが選択可能になる | - | フォーマット選択にCSVとExcelが表示される（Free時はCSVのみだった） |
| 7 | 保存検索上限が20件に拡大される | `POST /api/saved-searches` | 4件目以降の保存が可能になる |
| 8 | `/pricing` ページにアクセス | - | Starterプランに「現在のプラン」バッジ。Proプランに「アップグレード」ボタン |
| 9 | Proプランの「アップグレード」をクリック | Stripe Customer Portal or `POST /api/checkout` | プラン変更処理が開始される |
| 10 | Stripe Webhook `customer.subscription.updated` がアプリに送信される | `POST /api/webhooks/stripe` | usersテーブルの `plan='pro'` に更新される |
| 11 | ダッシュボードで確認 | `GET /api/usage` | プラン=Pro、ダウンロード上限=30,000件、保存検索上限=無制限 |

### 検証ポイント

- [ ] Stripe Checkout Session に正しい `metadata`（`clerk_user_id`, `plan`）が含まれる
- [ ] `checkout.session.completed` Webhook処理で usersテーブルが正しく更新される
- [ ] `stripe_customer_id` と `stripe_subscription_id` がusersレコードに保存される
- [ ] プランアップグレード後にエンタイトルメント（ダウンロード上限、保存検索上限、フォーマット、通知）が即座に反映される
- [ ] Starter → Pro のアップグレードで `customer.subscription.updated` が正しく処理される
- [ ] Price ID (`STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO`) による plan 判定ロジックが正しく動作する

### エラー分岐

| Step | 失敗パス | 期待される挙動 |
|------|---------|---------------|
| 3 | 支払い失敗（カード拒否） | Stripe Checkout画面でエラー表示。`/pricing?checkout=cancel` にリダイレクト |
| 4 | Webhook署名検証失敗 | 400レスポンス。Sentryアラート。Stripeが再送する |
| 4 | usersテーブル更新失敗 | 500レスポンス。Stripeが再送する。冪等性を確認（2回目の処理で重複更新しない） |
| 10 | subscription.updated で Price ID不明 | ログ記録 + Sentryアラート。plan更新はスキップ |

### テストデータ要件

| データ | 値 |
|--------|-----|
| テストユーザー | FLOW-001で作成済みFreeプランユーザー |
| Stripeテストカード | `4242 4242 4242 4242`（成功）、`4000 0000 0000 0002`（拒否） |
| Stripe Price ID | `price_starter_monthly`, `price_pro_monthly` (テスト環境) |

---

## FLOW-004: プランダウングレード（Stripe Customer Portal → Webhook → 期間終了時変更）

### 目的

有料プランユーザーが Stripe Customer Portal 経由でダウングレードし、現在の請求期間終了時にプランが変更されるフローを検証する。ダウングレード予約中は現プランの制限が維持されることを確認する。

### 前提条件

- Proプランのユーザーが存在すること（FLOW-003完了済み）
- Stripe サブスクリプションがアクティブであること

### フローステップ

| Step | 操作 | API | 期待結果 |
|------|------|-----|----------|
| 1 | `/dashboard/settings/billing` にアクセス | - | 「課金管理」画面が表示される。Stripe Customer Portalへのリンクボタンがある |
| 2 | 「プラン管理」ボタンをクリック | Stripe API (`billingPortal.sessions.create`) | Stripe Customer Portal画面にリダイレクト |
| 3 | Customer Portalで「Starter に変更」を選択 | Stripe API | ダウングレード予約が作成される（現請求期間終了時に適用） |
| 4 | Stripe Webhook `customer.subscription.updated` が送信される（schedule_change） | `POST /api/webhooks/stripe` | subscription の `cancel_at_period_end` 等のスケジュール情報を検知。現時点ではplan変更しない |
| 5 | アプリに戻る。ダッシュボードを確認 | `GET /api/usage` | プラン=Pro（現在有効）。「次回更新時に Starter に変更されます」の表示 |
| 6 | 請求期間終了（テスト環境ではStripe CLIでシミュレーション） | Stripe API | `customer.subscription.updated` が再送され、Price IDがStarterに変更される |
| 7 | Stripe Webhook `customer.subscription.updated` がアプリに送信される | `POST /api/webhooks/stripe` | usersテーブルの `plan='starter'` に更新される |
| 8 | ダッシュボードを確認 | `GET /api/usage` | プラン=Starter、ダウンロード上限=3,000件に変更されている |
| 9 | 保存検索条件が20件を超えていた場合 | `GET /api/saved-searches` | 既存の保存検索は維持される（削除されない）。新規追加時に上限チェック |

### 検証ポイント

- [ ] ダウングレード予約中は現プラン（Pro）のエンタイトルメントが維持される
- [ ] 請求期間終了時に `customer.subscription.updated` で正しいPrice IDが通知される
- [ ] usersテーブルの plan が Starter に正しく更新される
- [ ] ダウングレード後のダウンロード上限が 3,000件/月 に変更される
- [ ] 既存の保存検索（20件超の場合）は削除されない。新規追加のみ制限される
- [ ] 通知頻度が Pro の日次から Starter の週次に制限される

### エラー分岐

| Step | 失敗パス | 期待される挙動 |
|------|---------|---------------|
| 3 | Customer Portalでキャンセル操作を中断 | 変更なし。元のプランが維持される |
| 7 | Webhook処理失敗（DB接続エラー） | 500レスポンス。Stripeがリトライ。冪等性を確認 |
| 8 | ダウングレード後にダウンロード数が新上限を超えている | 超過分は許容（既にダウンロード済み）。追加ダウンロードが制限される |

### テストデータ要件

| データ | 値 |
|--------|-----|
| テストユーザー | FLOW-003で作成済みProプランユーザー |
| Stripe CLIコマンド | `stripe trigger customer.subscription.updated` |

---

## FLOW-005: サブスクリプションキャンセル → 期間終了 → Freeプラン復帰 → ダウンロード制限適用

### 目的

有料プランユーザーがサブスクリプションをキャンセルし、請求期間終了後にFreeプランに復帰した際に、ダウンロード制限が正しく適用されることを検証する。

### 前提条件

- Starterプランのユーザーが存在すること
- 当月のダウンロード件数が100件（Free上限50件超）であること

### フローステップ

| Step | 操作 | API | 期待結果 |
|------|------|-----|----------|
| 1 | `/dashboard/settings/billing` でStripe Customer Portalに遷移 | Stripe API | Customer Portal画面が表示される |
| 2 | 「サブスクリプションをキャンセル」を選択 | Stripe API | キャンセル予約が作成される（期間終了時に有効化） |
| 3 | アプリに戻る。ダッシュボードを確認 | `GET /api/usage` | プラン=Starter（キャンセル予約中）。「次回更新時にキャンセルされます」の表示 |
| 4 | キャンセル予約中にダウンロードを実行（残り枠内） | `POST /api/download` | ダウンロード成功。Starterプランの制限が引き続き適用される |
| 5 | 請求期間終了（Stripe CLIでシミュレーション） | Stripe API | `customer.subscription.deleted` イベントが発行される |
| 6 | Stripe Webhook `customer.subscription.deleted` がアプリに送信される | `POST /api/webhooks/stripe` | usersテーブルの `plan='free'`, `stripe_subscription_id=NULL` に更新される |
| 7 | ダッシュボードを確認 | `GET /api/usage` | プラン=Free、ダウンロード上限=50件/月。今月の使用済み件数=100件 |
| 8 | ダウンロードを試行 | `POST /api/download` | 403エラー `DOWNLOAD_LIMIT_EXCEEDED`。「今月のダウンロード上限(50件)に達しました。」 |
| 9 | 検索画面でExcel形式を選択しようとする | - | Excel形式がグレーアウト。「Starterプラン以上で利用できます」ツールチップ |
| 10 | `/pricing` ページにアクセス | - | Freeプランに「現在のプラン」バッジ。再アップグレードCTAが表示される |

### 検証ポイント

- [ ] キャンセル予約中は現プランのエンタイトルメントが維持される
- [ ] `customer.subscription.deleted` で plan が 'free' に正しく更新される
- [ ] `stripe_subscription_id` が NULL に更新される（`stripe_customer_id` は維持）
- [ ] Freeプラン復帰後、当月の使用済みダウンロード件数（100件）がFree上限（50件）を超えているため即時制限される
- [ ] Excel形式がFreeプランで利用不可になる
- [ ] 通知機能がFreeプランで無効化される
- [ ] 保存検索は既存分が維持される（3件超の場合でも削除されない）

### エラー分岐

| Step | 失敗パス | 期待される挙動 |
|------|---------|---------------|
| 2 | キャンセル操作を途中で中断 | 変更なし。サブスクリプション継続 |
| 6 | Webhook処理失敗 | Stripeリトライ。失敗継続時はSentryアラート |
| 8 | Freeプラン復帰後にAPI直叩きでダウンロード試行 | 403 `DOWNLOAD_LIMIT_EXCEEDED` レスポンス |

### テストデータ要件

| データ | 値 |
|--------|-----|
| テストユーザー | Starterプラン、monthly_download_count=100 |
| Stripe CLIコマンド | `stripe trigger customer.subscription.deleted` |

---

## FLOW-006: 月次ダウンロード件数リセット（月初 → カウンターリセット → 制限解除）

### 目的

月初のCronジョブによりダウンロードカウンターがリセットされ、制限が解除されるフローを検証する。

### 前提条件

- 複数プランのユーザーが存在すること
- 各ユーザーの`monthly_download_count`がゼロでないこと

### フローステップ

| Step | 操作 | API | 期待結果 |
|------|------|-----|----------|
| 1 | 月末時点のユーザー状態を確認 | DB直接確認 | User A: Free, download_count=50 (上限到達), User B: Starter, download_count=2800, User C: Pro, download_count=15000 |
| 2 | User Aがダウンロードを試行 | `POST /api/download` | 403 `DOWNLOAD_LIMIT_EXCEEDED`。上限到達のためダウンロード不可 |
| 3 | 月次リセットCronジョブを実行（毎月1日 00:00 JST） | `POST /api/cron/reset-download-counts` | 200レスポンス。`users_reset` に全ユーザー数が返る |
| 4 | 全ユーザーの `monthly_download_count` を確認 | DB直接確認 | 全ユーザーの `monthly_download_count=0`, `download_reset_at` が更新されている |
| 5 | User Aがダウンロードを再試行 | `POST /api/download` | ダウンロード成功。残り49件 |
| 6 | User Bがダッシュボードを確認 | `GET /api/usage` | ダウンロード使用量=0件 / 3,000件、reset_atが翌月1日に更新 |

### 検証ポイント

- [ ] Cron APIの認証（Vercel Cron Secret ヘッダー）が正しく検証される
- [ ] 全ユーザーの `monthly_download_count` が0にリセットされる
- [ ] `download_reset_at` が翌月1日に更新される
- [ ] リセット後にダウンロード制限が正しく解除される
- [ ] 大量ユーザー（数千件）でもCronジョブがタイムアウトしない（Vercel 10秒制限内）
- [ ] リセット実行のログが記録される

### エラー分岐

| Step | 失敗パス | 期待される挙動 |
|------|---------|---------------|
| 3 | Cron認証ヘッダー欠落 | 401レスポンス。リセット実行されない |
| 3 | DB接続エラーでリセット失敗 | 500レスポンス。Sentryアラート。次のスケジュールでリトライ |
| 3 | Cronジョブの二重実行 | 冪等性担保。2回目は既にリセット済みなので実質的な影響なし |
| 5 | リセット直後のレースコンディション（リセット中にダウンロード試行） | アトミック更新（`increment_download_count` RPC）によりデータ整合性を維持 |

### テストデータ要件

| データ | 値 |
|--------|-----|
| User A | Free, monthly_download_count=50 |
| User B | Starter, monthly_download_count=2800 |
| User C | Pro, monthly_download_count=15000 |
| download_reset_at | 現在の月の1日に設定 |

---

## FLOW-007: gBizINFO日次同期フロー（API取得 → UPSERT → MV更新 → ライブカウンター反映）

### 目的

gBizINFO REST APIからの日次差分同期フロー全体を検証する。データ取得→companiesテーブルUPSERT→company_industry_mappingの更新→Materialized View更新→検索結果への反映までを確認する。

### 前提条件

- companiesテーブルに既存データが存在すること
- gBizINFO APIスタブサーバー（MSW）が稼働していること
- 都道府県ローテーション: 本テストではprefecture_code='01'(北海道)を対象

### フローステップ

| Step | 操作 | API | 期待結果 |
|------|------|-----|----------|
| 1 | gBizINFO日次同期Cronを実行 | `POST /api/cron/sync-gbizinfo` | 同期処理が開始される。sync_logsに `status='running'` のレコードが作成される |
| 2 | gBizINFO APIへリクエスト（都道府県='01', page=1） | `GET https://info.gbiz.go.jp/hojin/v1/hojin?prefecture=01&page=1` | スタブから法人データJSONが返る（新規10件、更新5件を含む） |
| 3 | レスポンスの `location` フィールドから都道府県・市区町村をパース | (内部処理) | `prefecture_code`, `prefecture_name`, `city_code`, `city_name`, `address` が正しくパースされる |
| 4 | companiesテーブルにUPSERT | DB | 新規10件がINSERT、既存5件がUPDATE。`gbizinfo_updated_at` が更新される |
| 5 | edaCodeから産業分類マッピングを実行 | DB (`gbiz_industry_mapping` JOIN) | `company_industry_mapping` テーブルに新規法人の業種マッピングがINSERTされる |
| 6 | edaCodeがマッピングテーブルに存在しない法人 | DB | `unmapped_industries` テーブルにレコードが追加される |
| 7 | search_vectorトリガーが発火 | DB (トリガー) | UPSERT対象レコードの `search_vector` が自動再計算される |
| 8 | 全ページ取得完了。sync_logsを更新 | DB | `status='completed'`, `records_processed`, `records_inserted`, `records_updated` が記録される |
| 9 | MV更新Cronを実行 | `POST /api/cron/refresh-materialized-views` | `mv_prefecture_industry_count`, `mv_prefecture_summary`, `mv_industry_summary` が更新される |
| 10 | 検索画面でライブカウンターを確認 | `GET /api/search/count` | 新規追加分がカウンターに反映されている |

### 検証ポイント

- [ ] gBizINFO APIリクエストに正しいヘッダー（`X-hojinInfo-api-token`）が設定される
- [ ] リクエスト間隔が1,000ms以上（レートリミット対策）
- [ ] ページネーション（`totalPage` まで全ページ取得）が正しく動作する
- [ ] UPSERTで新規法人がINSERT、既存法人がUPDATE（gBizINFO優先フィールドのみ）される
- [ ] 国税庁優先フィールド（name, prefecture_code, city_code等）がgBizINFO同期で上書きされない
- [ ] edaCode → JSIC マッピングが正しく動作する（`gbiz_industry_mapping` テーブル経由）
- [ ] `unmapped_industries` にマッピング不在の業種が記録される
- [ ] search_vectorトリガーが全パーティションで正しく発火する
- [ ] sync_logsに同期結果が正しく記録される
- [ ] MV更新後にライブカウンターの件数が変化する

### エラー分岐

| Step | 失敗パス | 期待される挙動 |
|------|---------|---------------|
| 2 | gBizINFO API 429レスポンス（レートリミット） | リクエスト間隔を2倍に拡大 + 10分待機。指数バックオフでリトライ |
| 2 | gBizINFO API 500エラー | 指数バックオフ（2s→4s→8s→16s→32s）で最大5回リトライ |
| 2 | gBizINFO API 認証エラー（401） | sync_logs に `status='failed'`, `error_message` を記録。Sentryアラート |
| 4 | UPSERTでDB制約違反 | 該当レコードをスキップ。`records_failed` をインクリメント |
| 8 | 同期途中でジョブがタイムアウト | sync_logs に `status='failed'` を記録。次回実行時に途中から再開（最後の成功都道府県の次から） |
| 9 | MV更新がタイムアウト | Sentryアラート。旧MVデータのまま動作する（古いカウンター値） |

### テストデータ要件

| データ | 値 |
|--------|-----|
| gBizINFO APIスタブ | MSWで `/hojin/v1/hojin?prefecture=01` をモック。新規10件、更新5件のレスポンス |
| 既存companiesデータ | prefecture_code='01' に50件の既存データ |
| gbiz_industry_mappingマスタ | edaCode '01'〜'11' のマッピングデータ + 未マッピング用のedaCode '99' |
| industry_classificationsマスタ | 大分類A, E, G等のマスタデータ |

---

## FLOW-008: 国税庁月次インポートフロー（CSV取得 → ステージング → 名寄せ → 本番反映）

### 目的

国税庁法人番号CSVの月次全件インポートフロー全体を検証する。GitHub Actions（テスト環境ではスクリプト直接実行）でCSVダウンロード→前処理→Supabase Edge Function経由UPSERT→名寄せ→後処理の一連のフローが正しく動作することを確認する。

### 前提条件

- companiesテーブルに既存データ（gBizINFO由来）が存在すること
- 国税庁CSVスタブファイル（テスト用3都道府県分）が用意されていること

### フローステップ

| Step | 操作 | API | 期待結果 |
|------|------|-----|----------|
| 1 | 国税庁CSVインポートスクリプトを実行 | `node scripts/nta-csv-import.js` | 処理が開始される。sync_logsに `source='nta', sync_type='full', status='running'` が記録される |
| 2 | テスト用CSVファイルをダウンロード（スタブ） | HTTP GET | Shift-JIS の都道府県別CSVファイルが取得される |
| 3 | CSV前処理: Shift-JIS → UTF-8変換 | (スクリプト内部) | UTF-8に正しく変換される。文字化けなし |
| 4 | CSV前処理: ヘッダー正規化 | (スクリプト内部) | CSVカラムが正しくマッピングされる（位置ベース） |
| 5 | CSV前処理: 処理区分による閉鎖法人判定 | (スクリプト内部) | 処理区分='04'（閉鎖）の法人に `status='closed'` がセットされる |
| 6 | Supabase Edge Function にバッチ送信（5,000件/リクエスト） | Supabase API | UPSERT (ON CONFLICT corporate_number) が実行される |
| 7 | 名寄せルール適用: 国税庁優先フィールドの上書き | DB | `name`, `prefecture_code`, `city_code`, `address`, `postal_code`, `corporate_type`, `status` が国税庁データで上書きされる |
| 8 | gBizINFO優先フィールドの保持確認 | DB | `representative_name`, `capital`, `employee_count`, `business_summary`, `website_url`, `establishment_date` が保持される（上書きされない） |
| 9 | 新規法人（gBizINFOに未存在）のINSERT | DB | 国税庁にのみ存在する法人が基本3情報（法人番号・法人名・所在地）のみでINSERTされる |
| 10 | search_vector再計算 | DB | 更新されたレコードのtsvectorが再計算される |
| 11 | Materialized View更新 | DB | `refresh_all_materialized_views()` が実行される |
| 12 | sync_logs更新 | DB | `status='completed'`, `records_processed`, `records_inserted`, `records_updated` が記録される |

### 検証ポイント

- [ ] Shift-JIS → UTF-8 変換が正しく行われる（特殊文字・旧字体を含む法人名）
- [ ] CSVカラム位置（2=法人番号, 7=商号, 9=都道府県, 10=市区町村, 11=番地, 13=都道府県コード, 14=市区町村コード, 15=郵便番号, 22=法人種別）が正しくパースされる
- [ ] 名寄せルール: 国税庁優先フィールドが上書きされ、gBizINFO優先フィールドが保持される
- [ ] 閉鎖法人の `status` が 'closed' に更新される
- [ ] 新規法人（gBizINFO未存在）が正しくINSERTされ、gBizINFO由来フィールドはNULL
- [ ] バッチサイズ（5,000件/リクエスト）で正しく分割送信される
- [ ] nta_updated_at が更新される
- [ ] パーティショニング（prefecture_code別）に正しくデータが配置される

### エラー分岐

| Step | 失敗パス | 期待される挙動 |
|------|---------|---------------|
| 2 | CSVダウンロード失敗（ネットワークエラー） | 該当都道府県をスキップ。他の都道府県は継続。sync_logsにエラー記録 |
| 3 | 不正なShift-JISエンコーディング | 文字化け検出ログ出力。該当行をスキップして処理続行 |
| 6 | Supabase Edge Function タイムアウト | バッチを小分けにリトライ（5,000→2,500→1,000件） |
| 6 | UPSERT制約違反（不正なprefecture_code等） | 該当レコードをスキップ。`records_failed` をインクリメント |
| 12 | GitHub Actionsタイムアウト（180分超） | sync_logs に `status='failed'` を記録。手動再実行で途中から再開可能 |

### テストデータ要件

| データ | 値 |
|--------|-----|
| テスト用国税庁CSV | 3都道府県分（01:北海道, 13:東京都, 27:大阪府）、各100件 |
| CSV内容 | 新規法人50件、既存法人更新30件、閉鎖法人20件 |
| 既存companiesデータ | gBizINFO由来のデータ（representative_name, capital等が設定済み）200件 |
| 文字コード | Shift-JIS（旧字体・特殊文字を含む法人名のテストケース含む） |

---

## FLOW-009: 新規法人通知フロー（新規法人検出 → 保存検索条件マッチ → メール通知）

### 目的

gBizINFO/国税庁データ同期で新規追加された法人が、ユーザーの保存検索条件にマッチした場合にメール通知が送信されるフローを検証する。

### 前提条件

- 保存検索条件を持つユーザー（Starter/Proプラン、notify_enabled=true）が存在すること
- 前日のデータ同期で新規法人が追加されていること
- Resendテストモード（Mailpit）が稼働していること

### フローステップ

| Step | 操作 | API | 期待結果 |
|------|------|-----|----------|
| 1 | 新規法人がcompaniesテーブルに追加される（FLOW-007/008で実行済み） | DB | `created_at` が前日以降の新規法人が複数件存在する |
| 2 | 通知Cronジョブを実行（毎日 08:00 JST） | `POST /api/cron/notify-new-companies` | 通知処理が開始される |
| 3 | notify_enabled=true の保存検索条件を取得 | DB SELECT | `saved_searches` から通知有効かつ頻度条件を満たすレコードを取得 |
| 4 | 各保存検索条件で新規法人をマッチング | DB SELECT | search_paramsの条件（業種、都道府県等）に一致する新規法人を検索 |
| 5 | マッチ結果が0件の保存検索 | - | メール送信しない。`last_notified_at` を更新 |
| 6 | マッチ結果が1-20件の保存検索 | Resend API | メールに新規法人リスト（法人名・業種・所在地）を含めて送信 |
| 7 | マッチ結果が1,000件超の保存検索 | Resend API | メールに上位20件 + 「1,000件以上の新規法人があります」メッセージ + サイトリンクを送信 |
| 8 | Freeプランユーザーの保存検索 | - | スキップ（Freeプランは通知機能なし） |
| 9 | Starterプランで日次通知設定の保存検索 | - | スキップ（Starterは週次のみ。月曜でない場合は実行しない） |
| 10 | Cronレスポンス返却 | `POST /api/cron/notify-new-companies` | `notifications_sent`, `notifications_skipped`, `errors` が返る |

### 検証ポイント

- [ ] `saved_searches` から `notify_enabled=true` かつ通知頻度条件を満たすレコードのみ取得される
- [ ] 新規法人の判定が正しい（`created_at > last_notified_at`）
- [ ] search_paramsの条件（業種、都道府県、その他フィルタ）で正しくマッチングされる
- [ ] Freeプランユーザーの通知がスキップされる
- [ ] Starterプランは週次（月曜のみ）、Proプランは日次/週次/月次で正しくスケジュールされる
- [ ] 通知メールの内容が正しい（法人名・業種・所在地、最大20件）
- [ ] 1,000件超の場合のメール表現が正しい
- [ ] `last_notified_at` が更新される
- [ ] Resend APIの送信が成功する

### エラー分岐

| Step | 失敗パス | 期待される挙動 |
|------|---------|---------------|
| 4 | マッチングクエリのタイムアウト | 該当保存検索をスキップ。`errors` をインクリメント |
| 6 | Resend APIエラー（レートリミット） | 3回リトライ。全失敗時はsync_logsに記録 |
| 6 | Resend API送信失敗（不正なメールアドレス） | エラーログ記録。他のユーザーへの通知は継続 |
| 10 | Cronジョブ全体のタイムアウト（Vercel 10秒制限） | 対象ユーザーをバッチ分割して実行。Edge Function経由で非同期処理 |

### テストデータ要件

| データ | 値 |
|--------|-----|
| User A (Pro) | notify_enabled=true, notify_frequency='daily', search_params: 東京都の製造業 |
| User B (Starter) | notify_enabled=true, notify_frequency='weekly', search_params: 大阪府の情報通信業 |
| User C (Free) | notify_enabled=true（プラン制限で実質無効） |
| 新規法人 | created_at が前日以降。東京都の製造業5件、大阪府の情報通信業3件、その他2件 |
| last_notified_at | 前日以前に設定 |

---

## FLOW-010: 非同期ダウンロードフロー（リクエスト → Edge Function → ファイル生成 → Storage保存 → メール通知 → DL → 自動削除）

### 目的

5,000件超の大量ダウンロードにおける非同期生成フロー全体を検証する。リクエスト→バックグラウンド生成→Supabase Storage保存→メール通知→ダウンロード→24時間後の自動削除までのライフサイクルを確認する。

### 前提条件

- Proプランユーザーが存在すること（ダウンロード枠に十分な残り）
- 検索条件に一致する企業が10,000件以上存在すること
- Supabase Storageバケット（`downloads`）が設定済みであること

### フローステップ

| Step | 操作 | API | 期待結果 |
|------|------|-----|----------|
| 1 | 検索画面で条件を設定（東京都の全業種）。結果件数が10,000件以上 | `GET /api/search/count` | 概算件数「約 XX,XXX 件」が表示される |
| 2 | 「CSVダウンロード」ボタンをクリック。カラム選択し確定 | `POST /api/download` | 202レスポンス。`status='pending'`, `download_id` が返る |
| 3 | download_logsテーブルにレコード作成 | DB | `status='pending'`, `record_count`, `search_params`, `format='csv'` が記録される |
| 4 | ダッシュボードにリダイレクト | `GET /api/downloads` | ダウンロード一覧に `status='pending'` のエントリが表示される |
| 5 | Supabase Edge Functionがバックグラウンドで起動 | Edge Function | download_logsの `status='generating'` に更新 |
| 6 | Edge FunctionがPostgreSQLからデータをストリーミング取得 | DB | 検索条件に一致するレコードをカーソルベースで順次取得 |
| 7 | CSV/Excelファイル生成 | Edge Function | 選択カラムに基づいてファイルを生成。UTF-8 BOM付き |
| 8 | 生成ファイルをSupabase Storageにアップロード | Supabase Storage API | `downloads/dl-{id}.csv` にファイルが保存される |
| 9 | download_logsを更新 | DB | `status='completed'`, `file_url`（署名付きURL）が設定される |
| 10 | users.monthly_download_countをインクリメント | DB (`increment_download_count` RPC) | レコード数分（例: 10,000件）がカウントに加算される |
| 11 | Resendでメール通知送信 | Resend API | ダウンロードリンク付きのメールが送信される |
| 12 | ダッシュボードを確認 | `GET /api/downloads` | ステータスが `completed` に変わり、ダウンロードリンクが表示される |
| 13 | ダウンロードリンクをクリック | `GET /api/download/{id}` | 署名付きURLにリダイレクトされ、ファイルがダウンロードされる |
| 14 | ダウンロードしたCSVファイルを検証 | - | カラム数、レコード数、文字コード（UTF-8 BOM）、日本語文字列が正しい |
| 15 | 24時間後にファイル自動削除 | Cron / Storage Policy | Supabase Storageからファイルが削除される。download_logsの `status='expired'` に更新 |
| 16 | 期限切れリンクにアクセス | `GET /api/download/{id}` | 「リンクの有効期限が切れました。再度ダウンロードしてください。」エラー |

### 検証ポイント

- [ ] 5,000件超のリクエストで202（非同期）レスポンスが返る
- [ ] 5,000件以下のリクエストで200（同期）レスポンスが返る
- [ ] download_logsのステータス遷移: `pending` → `generating` → `completed` が正しい
- [ ] Edge Functionでのファイル生成がタイムアウトしない（Vercel 10秒制限を回避してEdge Functionで実行）
- [ ] CSVファイルがUTF-8 BOM付きで生成される
- [ ] Shift-JIS選択時にShift-JISで正しくエンコードされる
- [ ] 選択カラムのみがファイルに含まれる
- [ ] `monthly_download_count` がレコード数分正しくインクリメントされる（アトミック更新）
- [ ] Resendメール通知が正しく送信される
- [ ] 署名付きURLの有効期限が24時間
- [ ] 24時間後にファイルが自動削除され、`status='expired'` に更新される
- [ ] Excel（.xlsx）形式でも同じフローが動作する（Starter/Pro限定）

### エラー分岐

| Step | 失敗パス | 期待される挙動 |
|------|---------|---------------|
| 2 | ダウンロード上限超過 | 403 `DOWNLOAD_LIMIT_EXCEEDED`。非同期処理は開始されない |
| 2 | FreeプランでExcel形式を指定 | 403 `FORMAT_NOT_AVAILABLE`。「Excel形式はStarterプラン以上で利用できます。」 |
| 5 | Edge Function起動失敗 | download_logsの `status='failed'` に更新。ユーザーにエラーメール通知 |
| 7 | ファイル生成中のメモリ不足 | ストリーミング生成でメモリ使用量を制御。それでも失敗時は `status='failed'` |
| 8 | Supabase Storageアップロード失敗 | 3回リトライ。全失敗時は `status='failed'` + Sentryアラート |
| 10 | ダウンロードカウント更新失敗 | ファイル生成は成功。カウント更新をリトライ。不整合時はdownload_logsから再集計で回復 |
| 11 | メール送信失敗 | ファイル生成自体は成功。ダッシュボードからダウンロード可能。メール送信を3回リトライ |

### テストデータ要件

| データ | 値 |
|--------|-----|
| テストユーザー | Proプラン、monthly_download_count=0 |
| companiesテストデータ | 東京都（prefecture_code='13'）に10,000件以上 |
| 選択カラム | `name`, `full_address`, `representative_name`, `capital`, `employee_count`, `website_url` |
| ファイル形式 | CSV（UTF-8 BOM付き）、Excel（.xlsx） |
| Supabase Storageバケット | `downloads`（署名付きURL有効期限: 24時間） |

---

## 付録A: テストデータセットアップ

### シードデータ

全フローテストに共通して必要なマスタデータおよびテストデータ。

| テーブル | データ内容 | 件数 |
|---------|-----------|------|
| `prefectures` | 47都道府県 + 地方区分 | 47件 |
| `cities` | テスト用市区町村（東京都23区 + 大阪市24区 + 北海道主要市） | 約70件 |
| `industry_classifications` | 日本標準産業分類（大分類20種 + 中分類50種 + 小分類100種） | 約170件 |
| `gbiz_industry_mapping` | edaCode → JSIC マッピング | 約30件 |
| `companies` | テスト法人（東京都10,000件、大阪府5,000件、北海道1,000件） | 16,000件 |
| `company_industry_mapping` | テスト法人の業種マッピング | 約20,000件 |

### テスト用外部サービス

| サービス | テスト方法 |
|---------|-----------|
| Clerk | Testing Token（`CLERK_TESTING_TOKEN`環境変数） |
| Stripe | Test Mode（`sk_test_xxx`） + Stripe CLI |
| Resend | Mailpit（ローカルSMTPサーバー） |
| gBizINFO API | MSW（Mock Service Worker）でスタブ |
| 国税庁CSV | テスト用CSVファイル（fixtures/） |
| Supabase | supabase local（Docker） |

---

## 付録B: フロー間依存関係

```
FLOW-001 (サインアップ)
    │
    ├── FLOW-002 (検索・条件保存)
    │
    ├── FLOW-003 (アップグレード)
    │     │
    │     ├── FLOW-004 (ダウングレード)
    │     │
    │     └── FLOW-005 (キャンセル)
    │
    └── FLOW-006 (月次リセット) ← FLOW-005 の後に実行推奨

FLOW-007 (gBizINFO同期) ← 独立実行可能
    │
    └── FLOW-009 (新規法人通知) ← FLOW-007 or FLOW-008 の後

FLOW-008 (国税庁インポート) ← 独立実行可能
    │
    └── FLOW-009 (新規法人通知) ← FLOW-007 or FLOW-008 の後

FLOW-010 (非同期ダウンロード) ← FLOW-001 + テストデータ存在が前提
```

### 推奨実行順序

1. マスタデータ・テストデータセットアップ
2. FLOW-007（gBizINFO同期）--- データ投入
3. FLOW-008（国税庁インポート）--- データ投入・名寄せ
4. FLOW-001（サインアップ）
5. FLOW-002（検索・条件保存）
6. FLOW-003（アップグレード）
7. FLOW-009（新規法人通知）
8. FLOW-010（非同期ダウンロード）
9. FLOW-004（ダウングレード）
10. FLOW-005（キャンセル）
11. FLOW-006（月次リセット）

---

## 付録C: 品質基準

| 指標 | 目標値 |
|------|--------|
| フローテスト合格率 | 100% |
| エラー分岐カバレッジ | 全分岐パスの80%以上 |
| 実行時間（全フロー） | 10分以内 |
| データ整合性 | 全フロー完了後にDB不整合0件 |

---

*Generated by CCAGI SDK - Phase 5: Flow Test Design*
*Project: Company List Builder*
