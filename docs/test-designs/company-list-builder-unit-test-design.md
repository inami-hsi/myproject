# 単体テスト設計書 -- Company List Builder

**プロジェクト名**: Company List Builder（企業リストビルダー）
**Phase**: 5 - Testing（単体テスト設計）
**作成日**: 2026-03-05
**入力ドキュメント**:
- `docs/requirements/company-list-builder-requirements.md`
- `docs/design/company-list-builder-spec.md`

---

## 概要

| 項目 | 値 |
|------|-----|
| テストケース総数 | 142 |
| 正常系 | 68 |
| 異常系 | 44 |
| 境界値 | 30 |
| カバレッジ目標 | 80% |
| テストフレームワーク | Vitest |
| モックライブラリ | vitest mock / msw |

---

## テスト対象一覧

| # | テスト対象 | ファイル（想定） | テストケース数 |
|---|-----------|----------------|-------------|
| 1 | 検索クエリビルダー | `lib/search-query-builder.ts` | 22 |
| 2 | ダウンロード件数カウント関数 | `lib/download-counter.ts` | 16 |
| 3 | 名寄せロジック | `lib/merge-company.ts` | 14 |
| 4 | 産業分類マッピング | `lib/industry-mapping.ts` | 12 |
| 5 | search_vector生成トリガー | `supabase/functions/update-search-vector.sql` | 10 |
| 6 | プラン制限チェック | `lib/plan-limits.ts` | 20 |
| 7 | CSV/Excel生成関数 | `lib/file-generator.ts` | 18 |
| 8 | gBizINFO APIクライアント | `lib/gbizinfo-client.ts` | 16 |
| 9 | 国税庁CSVパーサー | `lib/nta-csv-parser.ts` | 14 |

---

## UT-001: 検索クエリビルダー

**テスト対象**: `lib/search-query-builder.ts` -- `buildSearchQuery(params: SearchParams)`
**関連仕様**: FR-001, FR-002, FR-003, spec 4章, 7.1節

### テストケース

| ID | 分類 | テスト名 | 入力 | 期待結果 |
|----|------|---------|------|---------|
| UT-001-01 | 正常系 | 業種単一指定（大分類） | `{ industries: ["E"] }` | `WHERE cim.jsic_code LIKE 'E%'` を含むSQL生成 |
| UT-001-02 | 正常系 | 業種複数指定（OR条件） | `{ industries: ["E", "G39"] }` | `WHERE (cim.jsic_code LIKE 'E%' OR cim.jsic_code LIKE 'G39%')` を含むSQL生成 |
| UT-001-03 | 正常系 | 都道府県単一指定 | `{ prefectures: ["13"] }` | `WHERE c.prefecture_code = '13'` を含む（パーティションプルーニング有効） |
| UT-001-04 | 正常系 | 都道府県複数指定 | `{ prefectures: ["13", "14", "27"] }` | `WHERE c.prefecture_code IN ('13','14','27')` を含むSQL生成 |
| UT-001-05 | 正常系 | 市区町村指定 | `{ prefectures: ["13"], cities: ["13101","13102"] }` | `WHERE c.prefecture_code = '13' AND c.city_code IN ('13101','13102')` を含む |
| UT-001-06 | 正常系 | 資本金範囲指定 | `{ capital_min: 10000000, capital_max: 100000000 }` | `WHERE c.capital >= 10000000 AND c.capital <= 100000000` を含む |
| UT-001-07 | 正常系 | 従業員数範囲指定 | `{ employee_min: 10, employee_max: 100 }` | `WHERE c.employee_count >= 10 AND c.employee_count <= 100` を含む |
| UT-001-08 | 正常系 | 設立年範囲指定 | `{ establishment_year_min: 2010, establishment_year_max: 2020 }` | `WHERE c.establishment_date >= '2010-01-01' AND c.establishment_date <= '2020-12-31'` を含む |
| UT-001-09 | 正常系 | 法人種別複数選択 | `{ corporate_types: ["株式会社","合同会社"] }` | `WHERE c.corporate_type IN ('株式会社','合同会社')` を含む |
| UT-001-10 | 正常系 | Webサイト有無フィルタ | `{ has_website: true }` | `WHERE c.website_url IS NOT NULL AND c.website_url != ''` を含む |
| UT-001-11 | 正常系 | キーワード検索（全文検索） | `{ keyword: "ソフトウェア 開発" }` | `WHERE c.search_vector @@ plainto_tsquery('simple', 'ソフトウェア 開発')` を含む |
| UT-001-12 | 正常系 | 複合条件（業種+地域+資本金） | `{ industries: ["E"], prefectures: ["13"], capital_min: 10000000 }` | 3条件すべてAND結合されたSQL生成 |
| UT-001-13 | 正常系 | ソート指定（法人名昇順） | `{ sort_by: "name", sort_order: "asc" }` | `ORDER BY c.name ASC` を含む |
| UT-001-14 | 正常系 | ソート指定（資本金降順） | `{ sort_by: "capital", sort_order: "desc" }` | `ORDER BY c.capital DESC NULLS LAST` を含む |
| UT-001-15 | 正常系 | カーソルページネーション | `{ cursor: "eyJpZCI6IjU1MGU4NDAwLi4uIn0=", limit: 50 }` | cursorデコード後の `WHERE c.id > '{decoded_id}'` + `LIMIT 50` を含む |
| UT-001-16 | 正常系 | 全条件空（フィルタなし） | `{}` | `WHERE c.status = 'active'` のみ（全件対象） |
| UT-001-17 | 正常系 | statusフィルタデフォルト | `{ prefectures: ["13"] }` | `AND c.status = 'active'` が常に付与される |
| UT-001-18 | 境界値 | limit=0 | `{ limit: 0 }` | デフォルト値50が適用される |
| UT-001-19 | 境界値 | limit=最大値超過 | `{ limit: 10000 }` | 最大値（例: 1000）にクランプされる |
| UT-001-20 | 異常系 | 不正なソートカラム | `{ sort_by: "DROP TABLE" }` | バリデーションエラー（許可リスト外） |
| UT-001-21 | 異常系 | SQLインジェクション試行 | `{ keyword: "'; DROP TABLE companies;--" }` | パラメータバインドで安全にエスケープ |
| UT-001-22 | 異常系 | 不正な都道府県コード | `{ prefectures: ["99"] }` | バリデーションエラー（01-47の範囲外） |

---

## UT-002: ダウンロード件数カウント関数

**テスト対象**: `lib/download-counter.ts` -- `checkAndConsumeDownload(userId, recordCount)`, `increment_download_count(p_user_id, p_count)`
**関連仕様**: FR-005, spec 6.4節（H-004解決）

### テストケース

| ID | 分類 | テスト名 | 入力 | 期待結果 |
|----|------|---------|------|---------|
| UT-002-01 | 正常系 | Freeプラン上限内ダウンロード | userId(Free), recordCount=30, 現在count=10 | `{ allowed: true, remaining: 10, limit: 50 }` |
| UT-002-02 | 正常系 | Starterプラン上限内ダウンロード | userId(Starter), recordCount=500, 現在count=1000 | `{ allowed: true, remaining: 1500, limit: 3000 }` |
| UT-002-03 | 正常系 | Proプラン上限内ダウンロード | userId(Pro), recordCount=10000, 現在count=5000 | `{ allowed: true, remaining: 15000, limit: 30000 }` |
| UT-002-04 | 正常系 | カウント加算のアトミック性 | userId, recordCount=100 | `monthly_download_count` が正確に100加算される |
| UT-002-05 | 正常系 | 月次リセット（リセット日超過） | download_reset_at が先月、recordCount=10 | count=0にリセット後、`{ allowed: true, remaining: limit-10 }` |
| UT-002-06 | 正常系 | 月次リセット日の更新 | リセット発動 | `download_reset_at` が次月1日に更新される |
| UT-002-07 | 境界値 | 上限ぴったりのダウンロード | userId(Free), recordCount=50, 現在count=0 | `{ allowed: true, remaining: 0, limit: 50 }` |
| UT-002-08 | 境界値 | 上限を1件超過 | userId(Free), recordCount=1, 現在count=50 | `{ allowed: false, remaining: 0, limit: 50 }` |
| UT-002-09 | 境界値 | 残り件数未満のダウンロード要求 | userId(Free), recordCount=51, 現在count=0 | `{ allowed: false, remaining: 50, limit: 50 }` |
| UT-002-10 | 境界値 | recordCount=0 | userId, recordCount=0 | `{ allowed: true, remaining: 現在の残り, limit: limit }` |
| UT-002-11 | 境界値 | Proプラン上限30000ぴったり | userId(Pro), recordCount=30000, 現在count=0 | `{ allowed: true, remaining: 0, limit: 30000 }` |
| UT-002-12 | 異常系 | 存在しないユーザーID | 不正なuserId | エラー（ユーザー不在） |
| UT-002-13 | 異常系 | 負のrecordCount | userId, recordCount=-1 | バリデーションエラー |
| UT-002-14 | 異常系 | DB接続エラー | Supabase接続不可 | エラーをスローし、カウントは変更されない |
| UT-002-15 | 正常系 | increment_download_count RPC正常 | p_user_id=有効UUID, p_count=100 | `monthly_download_count` が100加算 |
| UT-002-16 | 正常系 | increment_download_count updated_at更新 | p_user_id=有効UUID, p_count=50 | `updated_at` が現在時刻に更新 |

---

## UT-003: 名寄せロジック

**テスト対象**: `lib/merge-company.ts` -- `mergeCompanyData(ntaRecord, gbizRecord)`, UPSERT SQL
**関連仕様**: spec 2.3節（H-002解決）

### テストケース

| ID | 分類 | テスト名 | 入力 | 期待結果 |
|----|------|---------|------|---------|
| UT-003-01 | 正常系 | 国税庁優先フィールドのマージ（法人名） | NTA: name="株式会社新名称", gBiz: name="株式会社旧名称" | `name = "株式会社新名称"`（国税庁優先） |
| UT-003-02 | 正常系 | 国税庁優先フィールドのマージ（所在地） | NTA: prefecture_code="13", gBiz: prefecture_code="14" | `prefecture_code = "13"`（国税庁優先） |
| UT-003-03 | 正常系 | gBizINFO優先フィールドの保持（代表者名） | NTA: representative_name=null, gBiz: representative_name="山田太郎" | `representative_name = "山田太郎"`（gBizINFO優先、国税庁上書きなし） |
| UT-003-04 | 正常系 | gBizINFO優先フィールドの保持（資本金） | NTA: capital=null, gBiz: capital=50000000 | `capital = 50000000`（gBizINFO優先） |
| UT-003-05 | 正常系 | gBizINFO優先フィールドの保持（従業員数） | NTA上書きなし, gBiz: employee_count=45 | `employee_count = 45`（gBizINFO値を保持） |
| UT-003-06 | 正常系 | 新規法人（gBizINFOのみ） | NTA: なし, gBiz: 全フィールドあり | INSERTされ全フィールドがgBizINFOの値 |
| UT-003-07 | 正常系 | 新規法人（国税庁のみ） | NTA: 基本3情報あり, gBiz: なし | INSERTされ基本3情報のみ、他はNULL |
| UT-003-08 | 正常系 | 両方存在する法人の統合 | NTA: 基本情報, gBiz: 詳細情報 | 優先ルールに従い全フィールドが正しくマージ |
| UT-003-09 | 正常系 | 法人番号による一意性 | 同一corporate_number | UPSERT（ON CONFLICT）でUPDATE実行 |
| UT-003-10 | 正常系 | statusフィールド（国税庁優先） | NTA: status="closed" | `status = "closed"`（国税庁が閉鎖判定） |
| UT-003-11 | 正常系 | nta_updated_at更新 | 国税庁データ取込 | `nta_updated_at = NOW()` |
| UT-003-12 | 正常系 | gbizinfo_updated_at更新 | gBizINFOデータ取込 | `gbizinfo_updated_at = NOW()` |
| UT-003-13 | 境界値 | 法人番号13桁ぴったり | corporate_number="1234567890123" | 正常にUPSERT |
| UT-003-14 | 異常系 | 法人番号12桁（不足） | corporate_number="123456789012" | バリデーションエラー |

---

## UT-004: 産業分類マッピング

**テスト対象**: `lib/industry-mapping.ts` -- `mapEdaCodeToJsic(edaCode)`, `getIndustryHierarchy(jsicCode)`
**関連仕様**: spec 2.4節（C-004解決）

### テストケース

| ID | 分類 | テスト名 | 入力 | 期待結果 |
|----|------|---------|------|---------|
| UT-004-01 | 正常系 | edaCode→JSIC変換（1対1） | edaCode="01" | `{ jsic_code: "A", jsic_level: "major", confidence: 1.00 }` |
| UT-004-02 | 正常系 | edaCode→JSIC変換（信頼度付き） | edaCode="10" | `{ jsic_code: "G39", jsic_level: "middle", confidence: 0.90 }` |
| UT-004-03 | 正常系 | edaCode→JSIC変換（複数マッピング） | edaCode="05"（複数JSIC対応） | 複数の`{ jsic_code, confidence }` を配列で返却 |
| UT-004-04 | 正常系 | 業種階層取得（大分類） | jsicCode="E" | `{ code: "E", name: "製造業", level: "major", parent: null }` |
| UT-004-05 | 正常系 | 業種階層取得（中分類→大分類） | jsicCode="E09" | `{ code: "E09", name: "食料品製造業", level: "middle", parent: { code: "E", name: "製造業" } }` |
| UT-004-06 | 正常系 | 業種階層取得（小分類→中分類→大分類） | jsicCode="E091" | 3階層の親子チェーンが返される |
| UT-004-07 | 正常系 | バージョン指定取得 | jsicCode="A", version=14 | version=14のレコードが返される |
| UT-004-08 | 正常系 | 最新バージョン自動取得 | jsicCode="A", version未指定 | 最新バージョン（MAX(version)）のレコード |
| UT-004-09 | 正常系 | company_industry_mappingへの登録 | company_id, jsic_code="G39", source="gbizinfo" | 中間テーブルにINSERT成功 |
| UT-004-10 | 異常系 | 未マッピングのedaCode | edaCode="99"（マッピング不在） | `unmapped_industries`テーブルに記録、NULLを返却 |
| UT-004-11 | 異常系 | 存在しないJSICコード | jsicCode="Z99" | NULL返却 |
| UT-004-12 | 境界値 | edaCodeが空文字 | edaCode="" | NULL返却（エラーにならない） |

---

## UT-005: search_vector生成トリガー

**テスト対象**: `update_search_vector()` トリガー関数（PostgreSQL）
**関連仕様**: spec 3.6節

### テストケース

| ID | 分類 | テスト名 | 入力 | 期待結果 |
|----|------|---------|------|---------|
| UT-005-01 | 正常系 | 法人名の重みA設定 | name="株式会社サンプル" | `search_vector`に'A'重みで`株式会社`と`サンプル`が含まれる |
| UT-005-02 | 正常系 | 法人名カナの重みA設定 | name_kana="カブシキガイシャサンプル" | `search_vector`に'A'重みでカナが含まれる |
| UT-005-03 | 正常系 | 事業概要の重みB設定 | business_summary="ソフトウェアの開発" | `search_vector`に'B'重みで含まれる |
| UT-005-04 | 正常系 | 営業品目の重みB設定 | gbiz_business_items="情報処理サービス" | `search_vector`に'B'重みで含まれる |
| UT-005-05 | 正常系 | 住所の重みC設定 | full_address="東京都千代田区" | `search_vector`に'C'重みで含まれる |
| UT-005-06 | 正常系 | 代表者名の重みC設定 | representative_name="山田太郎" | `search_vector`に'C'重みで含まれる |
| UT-005-07 | 正常系 | INSERT時のトリガー発火 | 新規レコードINSERT | `search_vector`が自動生成される |
| UT-005-08 | 正常系 | UPDATE時のトリガー発火 | name変更のUPDATE | `search_vector`が再生成される |
| UT-005-09 | 境界値 | NULLフィールド | name=NULL, business_summary=NULL | COALESCE('')により空文字でtsvector生成（エラーにならない） |
| UT-005-10 | 境界値 | 全フィールドNULL | 全対象フィールドNULL | 空のtsvectorが生成される |

---

## UT-006: プラン制限チェック

**テスト対象**: `lib/plan-limits.ts` -- `PLAN_LIMITS`, `checkPlanAccess(plan, feature)`, `getPlanLimit(plan, limitType)`
**関連仕様**: FR-005, FR-006, FR-007, FR-008, spec 6.2節

### テストケース

| ID | 分類 | テスト名 | 入力 | 期待結果 |
|----|------|---------|------|---------|
| UT-006-01 | 正常系 | Freeプランのダウンロード上限 | plan="free" | `download_limit = 50` |
| UT-006-02 | 正常系 | Starterプランのダウンロード上限 | plan="starter" | `download_limit = 3000` |
| UT-006-03 | 正常系 | Proプランのダウンロード上限 | plan="pro" | `download_limit = 30000` |
| UT-006-04 | 正常系 | Freeプランの保存検索上限 | plan="free" | `saved_search_limit = 3` |
| UT-006-05 | 正常系 | Starterプランの保存検索上限 | plan="starter" | `saved_search_limit = 20` |
| UT-006-06 | 正常系 | Proプランの保存検索上限 | plan="pro" | `saved_search_limit = Infinity` |
| UT-006-07 | 正常系 | Freeプランのダウンロード形式 | plan="free" | `formats = ["csv"]` |
| UT-006-08 | 正常系 | Starterプランのダウンロード形式 | plan="starter" | `formats = ["csv", "xlsx"]` |
| UT-006-09 | 正常系 | Freeプランの文字コード | plan="free" | `encodings = ["utf8"]` |
| UT-006-10 | 正常系 | Starterプランの文字コード | plan="starter" | `encodings = ["utf8", "sjis"]` |
| UT-006-11 | 正常系 | Freeプランの通知機能 | plan="free" | `notification = false` |
| UT-006-12 | 正常系 | Starterプランの通知頻度 | plan="starter" | `max_notify_frequency = "weekly"` |
| UT-006-13 | 正常系 | Proプランの通知頻度 | plan="pro" | `max_notify_frequency = "daily"` |
| UT-006-14 | 正常系 | Freeプランの共有リンク日数 | plan="free" | `share_link_days = 0`（利用不可） |
| UT-006-15 | 正常系 | Starterプランの共有リンク日数 | plan="starter" | `share_link_days = 7` |
| UT-006-16 | 正常系 | Proプランの共有リンク日数 | plan="pro" | `share_link_days = 30` |
| UT-006-17 | 正常系 | FreeプランでExcelダウンロード可否 | plan="free", format="xlsx" | `false`（利用不可） |
| UT-006-18 | 正常系 | StarterプランでExcelダウンロード可否 | plan="starter", format="xlsx" | `true`（利用可） |
| UT-006-19 | 異常系 | 不正なプラン名 | plan="enterprise" | エラー（未定義プラン） |
| UT-006-20 | 異常系 | プラン名空文字 | plan="" | エラー |

---

## UT-007: CSV/Excel生成関数

**テスト対象**: `lib/file-generator.ts` -- `generateCSV(data, columns, encoding)`, `generateXLSX(data, columns)`
**関連仕様**: FR-005, spec 7.3節（H-006解決）

### テストケース

| ID | 分類 | テスト名 | 入力 | 期待結果 |
|----|------|---------|------|---------|
| UT-007-01 | 正常系 | CSV生成（UTF-8 BOM付き） | データ10件, encoding="utf8" | UTF-8 BOM (0xEF,0xBB,0xBF) で始まるCSVバイナリ |
| UT-007-02 | 正常系 | CSV生成（Shift-JIS） | データ10件, encoding="sjis" | Shift-JISエンコードのCSVバイナリ |
| UT-007-03 | 正常系 | CSV生成（カラム選択） | columns=["name","full_address","capital"] | 選択された3カラムのみ出力 |
| UT-007-04 | 正常系 | CSV生成（ヘッダー行） | 任意データ | 1行目がカラム名のヘッダー行 |
| UT-007-05 | 正常系 | CSV生成（カンマ含む値のエスケープ） | name="株式会社A,B" | `"株式会社A,B"` とダブルクォートで囲まれる |
| UT-007-06 | 正常系 | CSV生成（改行含む値のエスケープ） | address="東京都\n千代田区" | ダブルクォートで囲まれて改行が保持される |
| UT-007-07 | 正常系 | CSV生成（ダブルクォート含む値のエスケープ） | name='株式会社"テスト"' | `"株式会社""テスト"""` とエスケープ |
| UT-007-08 | 正常系 | Excel生成 | データ10件, 全カラム | 有効な.xlsxバイナリ（マジックバイト検証） |
| UT-007-09 | 正常系 | Excel生成（カラム選択） | columns=["name","capital"] | 選択された2カラムのみのシート |
| UT-007-10 | 正常系 | Excel生成（数値型の保持） | capital=50000000 | 数値セルとして出力（文字列ではない） |
| UT-007-11 | 正常系 | Excel生成（日付型の保持） | establishment_date="2010-04-01" | 日付セルとして出力 |
| UT-007-12 | 境界値 | 空データ（0件） | data=[], columns=[...] | ヘッダー行のみのファイル生成 |
| UT-007-13 | 境界値 | 大量データ（5000件） | データ5000件 | 正常に生成（同期生成の上限） |
| UT-007-14 | 境界値 | NULLフィールド | capital=null | 空セル（CSVでは空文字、Excelでは空セル） |
| UT-007-15 | 異常系 | 不正なencoding指定 | encoding="euc-jp" | バリデーションエラー（utf8/sjisのみ許可） |
| UT-007-16 | 異常系 | 不正なformat指定 | format="pdf" | バリデーションエラー（csv/xlsxのみ許可） |
| UT-007-17 | 異常系 | 存在しないカラム名 | columns=["invalid_column"] | バリデーションエラー |
| UT-007-18 | 正常系 | Shift-JISで表現できない文字の処理 | name="株式会社𠮷野家" | 代替文字への置換またはフォールバック |

---

## UT-008: gBizINFO APIクライアント

**テスト対象**: `lib/gbizinfo-client.ts` -- `fetchCompanies(prefectureCode, page)`, `parseGbizResponse(response)`, リトライロジック
**関連仕様**: spec 2.1節, 2.5節

### テストケース

| ID | 分類 | テスト名 | 入力 | 期待結果 |
|----|------|---------|------|---------|
| UT-008-01 | 正常系 | レスポンスパース（基本フィールド） | gBizINFO JSON応答 | `{ corporate_number, name, full_address, ... }` に正しく変換 |
| UT-008-02 | 正常系 | レスポンスパース（employee_number文字列→数値） | `"employee_number": "50"` | `employee_count: 50`（数値変換） |
| UT-008-03 | 正常系 | レスポンスパース（capital_stock→bigint） | `"capital_stock": 10000000` | `capital: 10000000` |
| UT-008-04 | 正常系 | レスポンスパース（edaCode抽出） | edaCode付きレスポンス | edaCodeが正しく抽出される |
| UT-008-05 | 正常系 | レスポンスパース（location→都道府県/市区町村分解） | `"location": "東京都千代田区永田町一丁目1番1号"` | prefecture_code="13", prefecture_name="東京都", city_name="千代田区", address="永田町一丁目1番1号" |
| UT-008-06 | 正常系 | ページネーション情報取得 | totalCount=450000, totalPage=90, pageNumber=1 | `{ total: 450000, totalPages: 90, currentPage: 1 }` |
| UT-008-07 | 正常系 | リクエスト間隔遵守（1000ms） | 連続リクエスト | 最低1000ms間隔で送信 |
| UT-008-08 | 正常系 | リトライ（指数バックオフ） | 1回目500エラー→2回目成功 | 2秒後にリトライし成功 |
| UT-008-09 | 正常系 | 429応答時の待機 | 429レスポンス | 間隔を2倍に拡大 + 10分待機後リトライ |
| UT-008-10 | 正常系 | 日次上限チェック | 10000リクエスト到達 | 以降のリクエストを翌日まで停止 |
| UT-008-11 | 境界値 | 空のhojin-infos配列 | `{ "hojin-infos": [], "totalCount": 0 }` | 空配列を返却（エラーにならない） |
| UT-008-12 | 境界値 | employee_numberが空文字 | `"employee_number": ""` | `employee_count: null` |
| UT-008-13 | 境界値 | capital_stockが0 | `"capital_stock": 0` | `capital: 0` |
| UT-008-14 | 異常系 | APIトークン無効 | 401レスポンス | 認証エラーをスロー（リトライしない） |
| UT-008-15 | 異常系 | ネットワークタイムアウト | 30秒タイムアウト | タイムアウトエラー後リトライ |
| UT-008-16 | 異常系 | 不正なJSONレスポンス | パース不可能なレスポンス | パースエラーをスロー |

---

## UT-009: 国税庁CSVパーサー

**テスト対象**: `lib/nta-csv-parser.ts` -- `parseNtaCsv(csvBuffer, prefectureCode)`, `convertEncoding(buffer)`, `mapNtaRecord(row)`
**関連仕様**: spec 2.2節

### テストケース

| ID | 分類 | テスト名 | 入力 | 期待結果 |
|----|------|---------|------|---------|
| UT-009-01 | 正常系 | Shift-JIS→UTF-8変換 | Shift-JISエンコードのCSVバッファ | UTF-8文字列に正しく変換 |
| UT-009-02 | 正常系 | CSVカラムマッピング（法人番号） | CSV 2列目="1234567890123" | `corporate_number = "1234567890123"` |
| UT-009-03 | 正常系 | CSVカラムマッピング（商号） | CSV 7列目="株式会社テスト" | `name = "株式会社テスト"` |
| UT-009-04 | 正常系 | CSVカラムマッピング（都道府県） | CSV 9列目="東京都", 13列目="13" | `prefecture_name = "東京都"`, `prefecture_code = "13"` |
| UT-009-05 | 正常系 | CSVカラムマッピング（市区町村） | CSV 10列目="千代田区", 14列目="13101" | `city_name = "千代田区"`, `city_code = "13101"` |
| UT-009-06 | 正常系 | CSVカラムマッピング（番地以降） | CSV 11列目="永田町一丁目1番1号" | `address = "永田町一丁目1番1号"` |
| UT-009-07 | 正常系 | CSVカラムマッピング（郵便番号） | CSV 15列目="1000014" | `postal_code = "1000014"` |
| UT-009-08 | 正常系 | CSVカラムマッピング（法人種別） | CSV 22列目="301" | `corporate_type = "株式会社"`（コード変換） |
| UT-009-09 | 正常系 | 処理区分による判定（新規） | 処理区分="01" | INSERTとして処理 |
| UT-009-10 | 正常系 | 処理区分による判定（変更） | 処理区分="12" | UPDATEとして処理 |
| UT-009-11 | 正常系 | 処理区分による判定（閉鎖） | 処理区分="71" | `status = "closed"` として処理 |
| UT-009-12 | 境界値 | 空行のスキップ | CSV中に空行あり | 空行をスキップして次の行を処理 |
| UT-009-13 | 境界値 | ヘッダー行のスキップ | 1行目がヘッダー | ヘッダー行を除外してデータ行のみ処理 |
| UT-009-14 | 異常系 | 不正なCSV形式（カラム不足） | カラム数が規定未満 | パースエラーをスロー（行番号付きログ） |

---

## テスト実行方針

### ディレクトリ構成

```
__tests__/
  unit/
    search-query-builder.test.ts    # UT-001
    download-counter.test.ts        # UT-002
    merge-company.test.ts           # UT-003
    industry-mapping.test.ts        # UT-004
    search-vector.test.ts           # UT-005 (SQLテスト)
    plan-limits.test.ts             # UT-006
    file-generator.test.ts          # UT-007
    gbizinfo-client.test.ts         # UT-008
    nta-csv-parser.test.ts          # UT-009
```

### モック戦略

| テスト対象 | モック対象 | モック方法 |
|-----------|----------|-----------|
| 検索クエリビルダー | なし（純粋関数） | モック不要 |
| ダウンロード件数カウント | Supabase Client | vitest mock |
| 名寄せロジック | Supabase Client | vitest mock |
| 産業分類マッピング | Supabase Client | vitest mock |
| search_vector | PostgreSQLトリガー | テストDB（Docker） |
| プラン制限チェック | なし（純粋関数/定数） | モック不要 |
| CSV/Excel生成 | なし（純粋関数） | モック不要 |
| gBizINFO APIクライアント | HTTP通信 | msw (Mock Service Worker) |
| 国税庁CSVパーサー | ファイルI/O | テストフィクスチャCSV |

### 実行コマンド

```bash
# 全単体テスト
npx vitest run --config vitest.config.ts __tests__/unit/

# 個別テスト
npx vitest run __tests__/unit/search-query-builder.test.ts

# カバレッジ付き
npx vitest run --coverage __tests__/unit/
```

---

*Generated by CCAGI SDK - Phase 5: Unit Test Design*
*Project: Company List Builder*
