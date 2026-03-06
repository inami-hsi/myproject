# 結合テスト設計書 -- Company List Builder

**プロジェクト名**: Company List Builder（企業リストビルダー）
**Phase**: 5 - Testing（結合テスト設計）
**作成日**: 2026-03-05
**入力ドキュメント**:
- `docs/requirements/company-list-builder-requirements.md`
- `docs/design/company-list-builder-spec.md`

---

## 概要

| 項目 | 値 |
|------|-----|
| テストケース総数 | 98 |
| API連携 | 38 |
| DB連携 | 28 |
| 外部連携 | 32 |
| テスト環境 | Docker Compose（PostgreSQL + Next.js） |
| テストフレームワーク | Vitest + supertest |
| 外部APIモック | msw (Mock Service Worker) |

---

## テスト対象一覧

| # | テスト対象シナリオ | 関連コンポーネント | テストケース数 |
|---|-------------------|-------------------|-------------|
| 1 | API→DB連携（検索API→PostgreSQLクエリ→レスポンス） | API Routes, Supabase, PostgreSQL | 14 |
| 2 | Clerk Webhook→usersテーブル同期 | Clerk, Webhook Handler, Supabase | 10 |
| 3 | Stripe Webhook→サブスクリプション更新 | Stripe, Webhook Handler, Supabase | 14 |
| 4 | gBizINFO API→companiesテーブル同期バッチ | gBizINFO API, バッチ処理, Supabase | 12 |
| 5 | 国税庁CSV→companiesテーブルインポートバッチ | CSVパーサー, バッチ処理, Supabase | 10 |
| 6 | Materialized View更新→検索結果への反映 | PostgreSQL MV, API Routes | 8 |
| 7 | ダウンロードAPI→ファイル生成→download_logsレコード作成 | API Routes, ファイル生成, Supabase Storage | 14 |
| 8 | RLSポリシーの動作検証（user_idベースのアクセス制御） | Supabase RLS, PostgreSQL | 16 |

---

## テスト環境

### Docker Compose構成

```yaml
services:
  postgres:
    image: supabase/postgres:15
    ports:
      - "54322:5432"
    environment:
      POSTGRES_PASSWORD: postgres
    volumes:
      - ./supabase/migrations:/docker-entrypoint-initdb.d

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/postgres
      SUPABASE_URL: http://supabase-kong:8000
      SUPABASE_SERVICE_ROLE_KEY: ${TEST_SERVICE_ROLE_KEY}
    depends_on:
      - postgres
```

### テストデータ

| テーブル | フィクスチャ件数 | 内容 |
|---------|-------------|------|
| companies | 1,000 | 東京都500件、大阪府300件、愛知県200件。業種・資本金等を分散 |
| company_industry_mapping | 1,400 | 1企業あたり平均1.4業種マッピング |
| industry_classifications | 300 | 日本標準産業分類（大分類20+中分類99+小分類181） |
| prefectures | 47 | 全都道府県 |
| cities | 200 | 主要市区町村 |
| users | 5 | Free x2, Starter x2, Pro x1 |
| saved_searches | 10 | 各ユーザーに保存検索条件 |
| download_logs | 20 | ダウンロード履歴 |
| gbiz_industry_mapping | 50 | edaCode→JSICマッピング |

---

## IT-001: API→DB連携（検索API→PostgreSQLクエリ→レスポンス）

**関連コンポーネント**: `POST /api/search`, `GET /api/search/count`, `GET /api/search/preview`, PostgreSQL, Supabase Client
**関連仕様**: FR-001, FR-002, FR-003, FR-004, spec 5.2-5.3節

### テストケース

| ID | シナリオ | 関連コンポーネント | 前提条件 | テスト手順 | 期待結果 |
|----|---------|-------------------|---------|----------|---------|
| IT-001-01 | 業種検索→DB→レスポンス | POST /api/search → PostgreSQL | 認証済みユーザー、companies 1,000件 | `{ industries: ["E"] }` でPOST | 製造業（大分類E配下）の企業のみ返却。レスポンスに`total_count_approx`、`companies`配列、`has_more`が含まれる |
| IT-001-02 | 地域検索→DB→レスポンス | POST /api/search → PostgreSQL | 認証済みユーザー | `{ prefectures: ["13"] }` でPOST | 東京都の企業のみ返却。パーティションプルーニングが適用される（EXPLAINで確認） |
| IT-001-03 | 複合検索（業種+地域+詳細フィルタ）→DB | POST /api/search → PostgreSQL | 認証済みユーザー | `{ industries: ["E"], prefectures: ["13"], capital_min: 10000000 }` でPOST | 3条件すべてを満たす企業のみ返却 |
| IT-001-04 | キーワード全文検索→DB | POST /api/search → PostgreSQL (tsvector) | search_vector構築済み | `{ keyword: "ソフトウェア" }` でPOST | `search_vector`に「ソフトウェア」を含む企業が返却される |
| IT-001-05 | ページネーション（cursor方式） | POST /api/search → PostgreSQL | 結果が50件超 | 1回目: cursor=null → 2回目: 返却されたnext_cursorを使用 | 2回目は1回目と重複しないデータが返却される |
| IT-001-06 | ソート（法人名昇順） | POST /api/search → PostgreSQL | 認証済みユーザー | `{ sort_by: "name", sort_order: "asc" }` でPOST | 法人名の五十音順で並んだ結果が返却される |
| IT-001-07 | ソート（資本金降順） | POST /api/search → PostgreSQL | 認証済みユーザー | `{ sort_by: "capital", sort_order: "desc" }` でPOST | 資本金の大きい順で返却。NULL値は末尾 |
| IT-001-08 | 件数取得API（MVベース） | GET /api/search/count → mv_prefecture_industry_count | MV構築済み | `?prefectures=13&industries=E` | `{ total_count_approx: N, source: "materialized_view" }` が返却される |
| IT-001-09 | 件数取得API（詳細フィルタあり、推定行数） | GET /api/search/count → estimate_count() | 認証済みユーザー | `?prefectures=13&industries=E&capital_min=10000000` | `total_count_approx` が正の整数で返却される |
| IT-001-10 | 検索プレビュー（未認証） | GET /api/search/preview → PostgreSQL | 認証なし | `?prefectures=13&industries=E&limit=5` | 件数+先頭5件（代表者名・資本金・従業員数・HPがマスク済み）が返却される |
| IT-001-11 | 企業詳細取得 | GET /api/company/{corporateNumber} → PostgreSQL | 認証済みユーザー | 有効な法人番号でGET | 企業全情報 + 外部リンク（NTA, gBizINFO）が返却される |
| IT-001-12 | 未認証でのAPI呼び出し | POST /api/search（認証なし） | 認証なし | Authorization ヘッダーなしでPOST | `401 { error: { code: "UNAUTHORIZED" } }` |
| IT-001-13 | レートリミット超過 | POST /api/search（連続100回超） | 認証済みユーザー | 1分間に101回POST | `429 Too Many Requests` |
| IT-001-14 | 結果0件の検索 | POST /api/search → PostgreSQL | 認証済みユーザー | 該当企業が存在しない条件でPOST | `{ total_count_approx: 0, companies: [], has_more: false }` |

---

## IT-002: Clerk Webhook→usersテーブル同期

**関連コンポーネント**: Clerk Webhook, `POST /api/webhooks/clerk`, Supabase `users` テーブル
**関連仕様**: FR-008, spec 6.1節

### テストケース

| ID | シナリオ | 関連コンポーネント | 前提条件 | テスト手順 | 期待結果 |
|----|---------|-------------------|---------|----------|---------|
| IT-002-01 | user.created→usersテーブル作成 | Clerk Webhook → users INSERT | usersテーブル空 | `user.created` イベントをSvix署名付きでPOST | usersテーブルに新規レコード作成。`clerk_user_id`、`email`が正しく設定、`plan="free"`、`monthly_download_count=0` |
| IT-002-02 | user.created→重複時UPSERT | Clerk Webhook → users UPSERT | 同じclerk_user_idが既存 | 同一clerk_user_idで`user.created`をPOST | エラーにならず既存レコードが更新される |
| IT-002-03 | user.updated→emailの更新 | Clerk Webhook → users UPDATE | ユーザーが既存 | `user.updated` イベント（新しいemail）をPOST | usersテーブルのemailが更新される |
| IT-002-04 | user.deleted→ステータス更新 | Clerk Webhook → users UPDATE | ユーザーが既存 | `user.deleted` イベントをPOST | `users.status = "deleted"` に更新（物理削除ではない） |
| IT-002-05 | Svix署名検証成功 | Clerk Webhook → 署名検証 | 有効なSvixシークレット | 正しい署名ヘッダーでPOST | 200 OK |
| IT-002-06 | Svix署名検証失敗 | Clerk Webhook → 署名検証 | 有効なSvixシークレット | 不正な署名ヘッダーでPOST | 400 Bad Request（処理は実行されない） |
| IT-002-07 | 不正なイベントタイプ | Clerk Webhook → イベント処理 | - | 未対応のイベントタイプでPOST | 200 OK（無視して正常応答） |
| IT-002-08 | user.created→Stripe Customer自動作成 | Clerk Webhook → Stripe API → users UPDATE | Stripe APIモック設定 | `user.created` イベントをPOST | usersテーブルに`stripe_customer_id`が設定される |
| IT-002-09 | Webhook再送時の冪等性 | Clerk Webhook → users UPSERT | 同一イベントを2回受信 | 同一Webhook IDで2回POST | 2回目も正常応答。データが2重に作成されない |
| IT-002-10 | タイムスタンプ検証（リプレイ攻撃防御） | Clerk Webhook → 署名検証 | - | 古いタイムスタンプ（5分超前）のイベントをPOST | 400 Bad Request |

---

## IT-003: Stripe Webhook→サブスクリプション更新

**関連コンポーネント**: Stripe Webhook, `POST /api/webhooks/stripe`, Supabase `users` テーブル
**関連仕様**: FR-008, spec 6.3節

### テストケース

| ID | シナリオ | 関連コンポーネント | 前提条件 | テスト手順 | 期待結果 |
|----|---------|-------------------|---------|----------|---------|
| IT-003-01 | checkout.session.completed→プラン更新（Starter） | Stripe Webhook → users UPDATE | Freeユーザーが既存 | metadata.plan="starter" の `checkout.session.completed` をPOST | `users.plan = "starter"`, `stripe_customer_id` と `stripe_subscription_id` が設定される |
| IT-003-02 | checkout.session.completed→プラン更新（Pro） | Stripe Webhook → users UPDATE | Freeユーザーが既存 | metadata.plan="pro" の `checkout.session.completed` をPOST | `users.plan = "pro"` |
| IT-003-03 | subscription.updated→アップグレード（Starter→Pro） | Stripe Webhook → users UPDATE | Starterユーザーが既存 | Pro price_idの `customer.subscription.updated` をPOST | `users.plan = "pro"` に更新 |
| IT-003-04 | subscription.updated→ダウングレード（Pro→Starter） | Stripe Webhook → users UPDATE | Proユーザーが既存 | Starter price_idの `customer.subscription.updated` をPOST | `users.plan = "starter"` に更新 |
| IT-003-05 | subscription.deleted→Freeプラン戻り | Stripe Webhook → users UPDATE | Starterユーザーが既存 | `customer.subscription.deleted` をPOST | `users.plan = "free"`, `stripe_subscription_id = null` |
| IT-003-06 | invoice.payment_succeeded→ログ記録 | Stripe Webhook → ログ | 有料ユーザーが既存 | `invoice.payment_succeeded` をPOST | 200 OK（支払い成功ログが記録される） |
| IT-003-07 | invoice.payment_failed→メール通知 | Stripe Webhook → Resend API | 有料ユーザーが既存、Resendモック | `invoice.payment_failed` をPOST | Resend APIが呼び出され、支払い失敗通知メールが送信される |
| IT-003-08 | Stripe署名検証成功 | Stripe Webhook → 署名検証 | 有効なWebhookシークレット | 正しいStripe署名でPOST | 200 OK `{ received: true }` |
| IT-003-09 | Stripe署名検証失敗 | Stripe Webhook → 署名検証 | 有効なWebhookシークレット | 不正な署名でPOST | 400 Bad Request（処理は実行されない） |
| IT-003-10 | 存在しないユーザーへのイベント | Stripe Webhook → users UPDATE | clerk_user_idが不在 | `checkout.session.completed` をPOST | エラーハンドリング（Sentryに記録、200応答） |
| IT-003-11 | プラン更新後のダウンロード上限反映 | Stripe Webhook → users → download API | Freeユーザー(上限50) | checkout完了(Starter)→ダウンロードAPI呼び出し | ダウンロード上限が3,000に変更されている |
| IT-003-12 | プラン更新後の保存検索上限反映 | Stripe Webhook → users → saved-searches API | Freeユーザー(上限3) | checkout完了(Starter)→保存検索API呼び出し | 保存上限が20に変更されている |
| IT-003-13 | Webhook冪等性（同一イベント2回受信） | Stripe Webhook → users UPDATE | - | 同一event IDで2回POST | 2回目も正常応答。planが正しい値を維持 |
| IT-003-14 | 不明なイベントタイプの無視 | Stripe Webhook → イベントルーター | - | 未対応のイベントタイプでPOST | 200 OK `{ received: true }`（処理スキップ） |

---

## IT-004: gBizINFO API→companiesテーブル同期バッチ

**関連コンポーネント**: `POST /api/cron/sync-gbizinfo`, gBizINFO APIクライアント, Supabase `companies`/`sync_logs`テーブル
**関連仕様**: spec 2.1節, 2.5節

### テストケース

| ID | シナリオ | 関連コンポーネント | 前提条件 | テスト手順 | 期待結果 |
|----|---------|-------------------|---------|----------|---------|
| IT-004-01 | 日次差分同期→新規企業INSERT | gBizINFO API → companies INSERT | gBizINFO APIモック（新規企業10件） | `/api/cron/sync-gbizinfo` をPOST | companiesテーブルに10件追加。`gbizinfo_updated_at`が更新される |
| IT-004-02 | 日次差分同期→既存企業UPDATE | gBizINFO API → companies UPSERT | 既存企業のデータ変更（資本金変更） | `/api/cron/sync-gbizinfo` をPOST | 既存企業の`capital`が更新される。gBizINFO優先フィールドのみ更新 |
| IT-004-03 | 都道府県ローテーション（7県/日） | sync-gbizinfo → gBizINFO API | - | 同期バッチ実行 | 対象7県分のみAPIリクエストが発行される。レスポンスに`target_prefectures`が含まれる |
| IT-004-04 | 業種マッピング連携 | gBizINFO API → gbiz_industry_mapping → company_industry_mapping | edaCodeありの企業データ | 同期バッチ実行 | `company_industry_mapping` にJSICコードが登録される |
| IT-004-05 | 未マッピング業種の記録 | gBizINFO API → unmapped_industries | 未知のedaCode | 同期バッチ実行 | `unmapped_industries` テーブルに記録される |
| IT-004-06 | sync_logsへの記録（成功） | sync-gbizinfo → sync_logs INSERT | 正常完了 | 同期バッチ実行 | `sync_logs` に `status="completed"`, `records_processed`/`inserted`/`updated` が記録される |
| IT-004-07 | sync_logsへの記録（失敗） | sync-gbizinfo → sync_logs INSERT | gBizINFO API 500エラー | 同期バッチ実行 | `sync_logs` に `status="failed"`, `error_message` が記録される |
| IT-004-08 | レートリミット対策（リクエスト間隔） | sync-gbizinfo → gBizINFO API | - | 同期バッチ実行中のリクエストタイミング記録 | 連続リクエスト間隔が最低1000ms以上 |
| IT-004-09 | リトライ（指数バックオフ） | sync-gbizinfo → gBizINFO API | 1回目500エラー、2回目成功 | 同期バッチ実行 | 2秒後にリトライし成功。最終結果は正常完了 |
| IT-004-10 | 429応答時の自動適応 | sync-gbizinfo → gBizINFO API | 429レスポンスモック | 同期バッチ実行 | 間隔拡大+待機後にリトライ。sync_logsに429発生が記録される |
| IT-004-11 | search_vector自動更新 | gBizINFO同期 → trg_search_vector トリガー | 新規企業INSERT | 同期バッチ実行 | 追加された企業の`search_vector`がトリガーで自動生成される |
| IT-004-12 | 名寄せ整合性（gBizINFO→国税庁優先フィールド保持） | gBizINFO同期 → companies UPSERT | 国税庁データで先行登録済み | gBizINFO同期実行 | 国税庁優先フィールド（name, prefecture_code等）は上書きされない |

---

## IT-005: 国税庁CSV→companiesテーブルインポートバッチ

**関連コンポーネント**: 国税庁CSVパーサー, `scripts/nta-csv-import.js`, Supabase `companies`/`sync_logs`テーブル
**関連仕様**: spec 2.2節（H-001解決）

### テストケース

| ID | シナリオ | 関連コンポーネント | 前提条件 | テスト手順 | 期待結果 |
|----|---------|-------------------|---------|----------|---------|
| IT-005-01 | CSVインポート→companiesテーブルINSERT | CSVパーサー → companies UPSERT | 空のcompaniesテーブル | テスト用CSV（100件）でインポート実行 | 100件がcompaniesテーブルに追加される |
| IT-005-02 | CSVインポート→既存企業UPSERT | CSVパーサー → companies UPSERT | 50件が既存 | 100件CSVインポート（50件重複） | 50件INSERT + 50件UPDATE。国税庁優先フィールドが更新される |
| IT-005-03 | Shift-JIS→UTF-8変換の正確性 | CSV変換 → companies INSERT | Shift-JISエンコードCSV | インポート実行 | 日本語文字が正しくUTF-8で格納される。文字化けなし |
| IT-005-04 | バッチサイズ分割（5,000件/リクエスト） | CSVインポート → Supabase Edge Function | 10,000件CSV | インポート実行 | 2バッチに分割されて実行される |
| IT-005-05 | 閉鎖法人の処理 | CSVパーサー（処理区分"71"） → companies UPDATE | 既存企業（status=active） | 処理区分"71"の行を含むCSVインポート | `status = "closed"` に更新される |
| IT-005-06 | sync_logsへの記録 | CSVインポート → sync_logs INSERT | - | インポート実行 | `sync_logs` に `source="nta"`, `sync_type="full"`, `records_processed`/`inserted`/`updated` が記録 |
| IT-005-07 | search_vector再計算 | CSVインポート後 → search_vector更新 | トリガー設定済み | インポート実行 | 追加・更新されたレコードの`search_vector`が再計算される |
| IT-005-08 | 名寄せ整合性（国税庁優先フィールド上書き） | CSVインポート → companies UPSERT | gBizINFOデータで先行登録済み | 国税庁CSVインポート実行 | 国税庁優先フィールド（name, 住所等）が上書きされ、gBizINFO優先フィールド（代表者、資本金等）は保持される |
| IT-005-09 | 不正行のスキップとログ | CSVパーサー → エラーログ | カラム不足行を含むCSV | インポート実行 | 不正行はスキップされ、エラーログに行番号とエラー内容が記録。正常行は正しくインポートされる |
| IT-005-10 | 都道府県別パーティションへの振り分け | CSVインポート → companies パーティション | パーティションテーブル構築済み | 複数都道府県の混在CSVインポート | 各レコードが正しい都道府県パーティションに格納される |

---

## IT-006: Materialized View更新→検索結果への反映

**関連コンポーネント**: `POST /api/cron/refresh-materialized-views`, `mv_prefecture_industry_count`, `mv_prefecture_summary`, `mv_industry_summary`, `GET /api/search/count`, `GET /api/stats/*`
**関連仕様**: spec 3.5節（H-003, H-005解決）

### テストケース

| ID | シナリオ | 関連コンポーネント | 前提条件 | テスト手順 | 期待結果 |
|----|---------|-------------------|---------|----------|---------|
| IT-006-01 | MV更新→件数カウンター反映 | refresh MV → GET /api/search/count | companiesに新規データ追加済み、MVは旧データ | 1. `/api/search/count` で旧カウント取得 → 2. MV更新 → 3. 再度カウント取得 | 3のカウントが1より増加している |
| IT-006-02 | MV更新→地域統計反映 | refresh MV → GET /api/stats/map | companiesに東京都の企業追加済み | MV更新 → GET /api/stats/map | 東京都のcompany_countが増加している |
| IT-006-03 | MV更新→業種統計反映 | refresh MV → GET /api/stats/industry | companiesに製造業の企業追加済み | MV更新 → GET /api/stats/industry?prefecture=13 | 製造業のcompany_countが増加している |
| IT-006-04 | CONCURRENTLY更新中の検索可用性 | refresh MV CONCURRENTLY → GET /api/search/count | MV存在 | MV更新中に `/api/search/count` を呼び出し | 旧データで正常にレスポンスが返却される（ブロックされない） |
| IT-006-05 | refresh_all_materialized_views関数 | refresh関数 → 3つのMV | 全MV構築済み | `SELECT refresh_all_materialized_views()` 実行 | 3つのMVすべてが更新される |
| IT-006-06 | Cronエンドポイントからのリフレッシュ | POST /api/cron/refresh-materialized-views → 全MV | 認証（Cron secret）設定済み | `/api/cron/refresh-materialized-views` をPOST | 200 OK。レスポンスに全MV名と`duration_ms`が含まれる |
| IT-006-07 | MV更新失敗時のエラーハンドリング | refresh MV → エラー | 不整合データ | 不正データ状態でMV更新 | エラーがキャッチされ、Sentryに送信される。旧MVデータは維持される |
| IT-006-08 | last_refreshed日時の正確性 | MV更新 → API レスポンス | - | MV更新 → GET /api/search/count | レスポンスの`last_refreshed`が更新直後の時刻を示す |

---

## IT-007: ダウンロードAPI→ファイル生成→download_logsレコード作成

**関連コンポーネント**: `POST /api/download`, `GET /api/download/{id}`, ファイル生成, Supabase Storage, `download_logs`テーブル, `users.monthly_download_count`
**関連仕様**: FR-005, spec 5.3節, 6.4節, 7.3節（H-004, H-006解決）

### テストケース

| ID | シナリオ | 関連コンポーネント | 前提条件 | テスト手順 | 期待結果 |
|----|---------|-------------------|---------|----------|---------|
| IT-007-01 | CSV同期ダウンロード（5,000件以下） | POST /api/download → ファイル生成 → Storage → download_logs | Starterユーザー、検索結果100件 | `{ format: "csv", encoding: "utf8" }` でPOST | 200。`status: "completed"`, `download_url`が返却。download_logsにレコード作成 |
| IT-007-02 | Excel同期ダウンロード | POST /api/download → ファイル生成 → Storage | Starterユーザー | `{ format: "xlsx" }` でPOST | 200。有効な.xlsxファイルのURLが返却される |
| IT-007-03 | Shift-JIS CSV同期ダウンロード | POST /api/download → ファイル生成 | Starterユーザー | `{ format: "csv", encoding: "sjis" }` でPOST | Shift-JISエンコードのCSVファイルが生成される |
| IT-007-04 | 非同期ダウンロード（5,000件超） | POST /api/download → download_logs → Edge Function | Proユーザー、検索結果10,000件 | `{ format: "csv" }` でPOST | 202。`status: "pending"` が返却。download_logsに`status: "pending"`で記録 |
| IT-007-05 | 非同期ダウンロード完了確認 | GET /api/download/{id} | IT-007-04の完了後 | download_idでGET | `status: "completed"`, `download_url`が返却される |
| IT-007-06 | ダウンロード件数カウント加算 | POST /api/download → users.monthly_download_count | Starterユーザー、現在count=100 | 200件のダウンロード実行 | `monthly_download_count` が100→300に加算される |
| IT-007-07 | ダウンロード上限超過エラー | POST /api/download → プランチェック | Freeユーザー、count=50（上限到達） | 10件のダウンロードリクエスト | 403 `{ error: { code: "DOWNLOAD_LIMIT_EXCEEDED" } }` |
| IT-007-08 | Freeプランでxlsx要求エラー | POST /api/download → プランチェック | Freeユーザー | `{ format: "xlsx" }` でPOST | 403 `{ error: { code: "FORMAT_NOT_AVAILABLE" } }` |
| IT-007-09 | Freeプランでsjis要求エラー | POST /api/download → プランチェック | Freeユーザー | `{ encoding: "sjis" }` でPOST | 403エラーまたはutf8にフォールバック |
| IT-007-10 | ダウンロードファイルURL有効期限 | Storage → 署名付きURL | ダウンロード完了済み | 24時間超過後にdownload_urlにアクセス | 403/410エラー（期限切れ） |
| IT-007-11 | download_logsへの記録内容 | POST /api/download → download_logs INSERT | - | ダウンロード実行 | `search_params`, `format`, `encoding`, `record_count`, `status` が正しく記録される |
| IT-007-12 | カラム選択のダウンロード | POST /api/download → ファイル生成 | - | `{ columns: ["name","full_address","capital"] }` でPOST | 指定3カラムのみのCSVが生成される |
| IT-007-13 | remaining_downloadsの返却 | POST /api/download → レスポンス | Starterユーザー、count=1000 | 500件のダウンロードリクエスト | レスポンスに `remaining_downloads: 1500` が含まれる |
| IT-007-14 | 未認証でのダウンロード要求 | POST /api/download（認証なし） | - | Authorization ヘッダーなしでPOST | 401エラー |

---

## IT-008: RLSポリシーの動作検証（user_idベースのアクセス制御）

**関連コンポーネント**: PostgreSQL RLS, Supabase Auth (JWT), `users`/`saved_searches`/`download_logs`/`companies`/`sync_logs` テーブル
**関連仕様**: spec 3.7節

### テストケース

| ID | シナリオ | 関連コンポーネント | 前提条件 | テスト手順 | 期待結果 |
|----|---------|-------------------|---------|----------|---------|
| IT-008-01 | companiesテーブル：全ユーザー読み取り可 | RLS: companies_read_all | 認証済みユーザー | `SELECT * FROM companies LIMIT 10` | 10件取得成功（パブリックデータ） |
| IT-008-02 | companiesテーブル：匿名ユーザー読み取り可 | RLS: companies_read_all | 匿名（anon key） | `SELECT * FROM companies LIMIT 10` | 10件取得成功 |
| IT-008-03 | companiesテーブル：一般ユーザーは書き込み不可 | RLS: companies_write_service | 認証済みユーザー（非service_role） | `INSERT INTO companies (...)` | RLSにより拒否される |
| IT-008-04 | companiesテーブル：service_roleは書き込み可 | RLS: companies_write_service | service_role key | `INSERT INTO companies (...)` | 正常にINSERT成功 |
| IT-008-05 | usersテーブル：自分自身のレコードのみ読み取り可 | RLS: users_own_read | ユーザーA認証 | `SELECT * FROM users` | ユーザーAのレコードのみ返却される |
| IT-008-06 | usersテーブル：他人のレコード読み取り不可 | RLS: users_own_read | ユーザーA認証 | ユーザーBのレコードをSELECT | 0件返却（アクセス拒否ではなく空結果） |
| IT-008-07 | usersテーブル：自分自身のレコード更新可 | RLS: users_own_update | ユーザーA認証 | `UPDATE users SET email = ... WHERE clerk_user_id = A` | 更新成功 |
| IT-008-08 | usersテーブル：他人のレコード更新不可 | RLS: users_own_update | ユーザーA認証 | `UPDATE users SET email = ... WHERE clerk_user_id = B` | 0行更新（更新されない） |
| IT-008-09 | saved_searchesテーブル：自分の保存検索のみ取得 | RLS: ss_own | ユーザーA認証（保存検索3件） | `SELECT * FROM saved_searches` | ユーザーAの3件のみ返却 |
| IT-008-10 | saved_searchesテーブル：他人の保存検索取得不可 | RLS: ss_own | ユーザーA認証 | ユーザーBの保存検索IDでSELECT | 0件返却 |
| IT-008-11 | saved_searchesテーブル：自分の保存検索作成可 | RLS: ss_own | ユーザーA認証 | `INSERT INTO saved_searches (user_id, ...)` | INSERT成功 |
| IT-008-12 | saved_searchesテーブル：他人のuser_idで作成不可 | RLS: ss_own | ユーザーA認証 | ユーザーBのuser_idでINSERT | RLSにより拒否 |
| IT-008-13 | download_logsテーブル：自分の履歴のみ閲覧 | RLS: dl_own_read | ユーザーA認証（履歴5件） | `SELECT * FROM download_logs` | ユーザーAの5件のみ返却 |
| IT-008-14 | download_logsテーブル：他人の履歴閲覧不可 | RLS: dl_own_read | ユーザーA認証 | ユーザーBのdownload_log IDでSELECT | 0件返却 |
| IT-008-15 | sync_logsテーブル：一般ユーザーアクセス不可 | RLS: sync_service_only | 認証済みユーザー（非service_role） | `SELECT * FROM sync_logs` | 0件返却（アクセス不可） |
| IT-008-16 | sync_logsテーブル：service_roleアクセス可 | RLS: sync_service_only | service_role key | `SELECT * FROM sync_logs` | 全レコード取得成功 |

---

## テスト実行方針

### ディレクトリ構成

```
__tests__/
  integration/
    search-api-db.test.ts           # IT-001
    clerk-webhook-sync.test.ts      # IT-002
    stripe-webhook-sync.test.ts     # IT-003
    gbizinfo-sync-batch.test.ts     # IT-004
    nta-csv-import-batch.test.ts    # IT-005
    materialized-view-refresh.test.ts  # IT-006
    download-api-flow.test.ts       # IT-007
    rls-policy.test.ts              # IT-008
  fixtures/
    companies.json                  # 企業テストデータ（1,000件）
    industry_classifications.json   # 産業分類マスタ
    users.json                      # ユーザーテストデータ
    nta-sample.csv                  # 国税庁CSVサンプル（Shift-JIS）
    gbizinfo-response.json          # gBizINFO APIレスポンスモック
  helpers/
    setup-db.ts                     # テストDB初期化
    seed-data.ts                    # テストデータ投入
    auth-helper.ts                  # 認証ヘルパー（Clerk JWT生成）
    stripe-helper.ts                # Stripe署名生成ヘルパー
    clerk-helper.ts                 # Svix署名生成ヘルパー
```

### 外部サービスモック戦略

| 外部サービス | モック方法 | 理由 |
|-------------|----------|------|
| gBizINFO REST API | msw (Mock Service Worker) | テスト環境でAPIアクセス不可 |
| 国税庁CSV | テストフィクスチャファイル | ダウンロード不要 |
| Clerk認証 | JWTモック生成 | テスト環境にClerkインスタンス不要 |
| Clerk Webhook | Svix署名手動生成 | 署名検証のテスト |
| Stripe Webhook | Stripe署名手動生成 | 署名検証のテスト |
| Stripe API | msw | Checkout Session等のモック |
| Resend (メール) | msw | メール送信の検証 |
| Supabase Storage | ローカルファイルシステム | ファイルアップロードのモック |

### テストDB管理

| フェーズ | 処理 |
|---------|------|
| テストスイート開始前 | Docker Composeでテスト用PostgreSQL起動 |
| 各テストファイル開始前 | マイグレーション適用 + テストデータ投入 |
| 各テストケース終了後 | トランザクションロールバック |
| テストスイート終了後 | Docker Composeでテスト用PostgreSQL停止 |

### 実行コマンド

```bash
# Docker環境起動
docker compose -f docker-compose.test.yml up -d

# 全結合テスト
npx vitest run --config vitest.integration.config.ts __tests__/integration/

# 個別テスト
npx vitest run __tests__/integration/search-api-db.test.ts

# RLSテストのみ
npx vitest run __tests__/integration/rls-policy.test.ts

# Docker環境停止
docker compose -f docker-compose.test.yml down
```

---

*Generated by CCAGI SDK - Phase 5: Integration Test Design*
*Project: Company List Builder*
