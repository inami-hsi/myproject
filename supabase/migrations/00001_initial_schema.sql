-- =============================================================
-- Company List Builder - Initial Schema Migration
-- =============================================================
-- Generated from: docs/design/company-list-builder-spec.md §3.2-3.7
-- =============================================================

-- =============================================================
-- Extension有効化
-- =============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- trigram (LIKE検索高速化)

-- =============================================================
-- 都道府県マスタ
-- =============================================================
CREATE TABLE prefectures (
  code    TEXT PRIMARY KEY,          -- 2桁 ('01'〜'47')
  name    TEXT NOT NULL,             -- '北海道', '東京都' 等
  region  TEXT NOT NULL              -- '北海道', '東北', '関東' 等
);

COMMENT ON TABLE prefectures IS '都道府県マスタ（47件固定）';

-- =============================================================
-- 市区町村マスタ
-- =============================================================
CREATE TABLE cities (
  code            TEXT PRIMARY KEY,      -- 5桁 ('01100'等)
  prefecture_code TEXT NOT NULL REFERENCES prefectures(code),
  name            TEXT NOT NULL           -- '札幌市中央区' 等
);

CREATE INDEX idx_cities_prefecture ON cities(prefecture_code);

COMMENT ON TABLE cities IS '市区町村マスタ（総務省全国地方公共団体コード準拠）';

-- =============================================================
-- 日本標準産業分類マスタ（H-007: バージョン管理対応）
-- =============================================================
CREATE TABLE industry_classifications (
  id          SERIAL PRIMARY KEY,
  code        TEXT NOT NULL,                -- 分類コード ('A', 'E09', 'E091' 等)
  name        TEXT NOT NULL,                -- '農業,林業', '食料品製造業' 等
  level       TEXT NOT NULL                 -- 'major' / 'middle' / 'minor' / 'detail'
    CHECK (level IN ('major', 'middle', 'minor', 'detail')),
  parent_code TEXT,                         -- 親分類コード
  version     INTEGER NOT NULL DEFAULT 14,  -- 産業分類版番号（現行: 第14回改定）
  valid_from  DATE NOT NULL DEFAULT '2024-04-01', -- 適用開始日
  UNIQUE(code, version)
);

CREATE INDEX idx_ic_parent ON industry_classifications(parent_code);
CREATE INDEX idx_ic_level ON industry_classifications(level);
CREATE INDEX idx_ic_version ON industry_classifications(version, valid_from);

COMMENT ON TABLE industry_classifications IS '日本標準産業分類マスタ（バージョン管理対応 H-007）';

-- =============================================================
-- gBizINFO業種コード→JSIC マッピング（C-004）
-- =============================================================
CREATE TABLE gbiz_industry_mapping (
  id          SERIAL PRIMARY KEY,
  eda_code    TEXT NOT NULL,
  eda_name    TEXT NOT NULL,
  jsic_code   TEXT NOT NULL,
  jsic_level  TEXT NOT NULL
    CHECK (jsic_level IN ('major', 'middle', 'minor', 'detail')),
  confidence  DECIMAL(3,2) NOT NULL DEFAULT 1.00
    CHECK (confidence >= 0 AND confidence <= 1),
  is_manual   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(eda_code, jsic_code)
);

COMMENT ON TABLE gbiz_industry_mapping IS 'gBizINFO edaCode→日本標準産業分類マッピング (C-004)';

-- =============================================================
-- 未マッピング業種ログ（C-004 手動レビュー用）
-- =============================================================
CREATE TABLE unmapped_industries (
  id              SERIAL PRIMARY KEY,
  eda_code        TEXT,
  business_items  TEXT,
  corporate_number TEXT NOT NULL,
  reviewed        BOOLEAN NOT NULL DEFAULT false,
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE unmapped_industries IS 'マッピング不在の業種コード記録（手動レビュー対象）';

-- =============================================================
-- 法人データ（パーティショニング対応）
-- =============================================================
CREATE TABLE companies (
  id                    UUID NOT NULL DEFAULT uuid_generate_v4(),
  corporate_number      TEXT NOT NULL,
  name                  TEXT NOT NULL,
  name_kana             TEXT,
  postal_code           TEXT,
  prefecture_code       TEXT NOT NULL,
  prefecture_name       TEXT NOT NULL,
  city_code             TEXT,
  city_name             TEXT,
  address               TEXT,
  full_address          TEXT,
  representative_name   TEXT,
  capital               BIGINT,
  employee_count        INTEGER,
  business_summary      TEXT,
  gbiz_business_items   TEXT,          -- gBizINFO営業品目（自由テキスト保持）
  website_url           TEXT,
  corporate_type        TEXT,
  establishment_date    DATE,
  status                TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'closed', 'merged')),
  search_vector         TSVECTOR,
  gbizinfo_updated_at   TIMESTAMPTZ,
  nta_updated_at        TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, prefecture_code),
  UNIQUE (corporate_number, prefecture_code)
) PARTITION BY LIST (prefecture_code);

COMMENT ON TABLE companies IS '法人データ（都道府県別パーティショニング）';

-- パーティション作成（47都道府県 + デフォルト）
CREATE TABLE companies_01 PARTITION OF companies FOR VALUES IN ('01');  -- 北海道
CREATE TABLE companies_02 PARTITION OF companies FOR VALUES IN ('02');  -- 青森県
CREATE TABLE companies_03 PARTITION OF companies FOR VALUES IN ('03');  -- 岩手県
CREATE TABLE companies_04 PARTITION OF companies FOR VALUES IN ('04');  -- 宮城県
CREATE TABLE companies_05 PARTITION OF companies FOR VALUES IN ('05');  -- 秋田県
CREATE TABLE companies_06 PARTITION OF companies FOR VALUES IN ('06');  -- 山形県
CREATE TABLE companies_07 PARTITION OF companies FOR VALUES IN ('07');  -- 福島県
CREATE TABLE companies_08 PARTITION OF companies FOR VALUES IN ('08');  -- 茨城県
CREATE TABLE companies_09 PARTITION OF companies FOR VALUES IN ('09');  -- 栃木県
CREATE TABLE companies_10 PARTITION OF companies FOR VALUES IN ('10');  -- 群馬県
CREATE TABLE companies_11 PARTITION OF companies FOR VALUES IN ('11');  -- 埼玉県
CREATE TABLE companies_12 PARTITION OF companies FOR VALUES IN ('12');  -- 千葉県
CREATE TABLE companies_13 PARTITION OF companies FOR VALUES IN ('13');  -- 東京都
CREATE TABLE companies_14 PARTITION OF companies FOR VALUES IN ('14');  -- 神奈川県
CREATE TABLE companies_15 PARTITION OF companies FOR VALUES IN ('15');  -- 新潟県
CREATE TABLE companies_16 PARTITION OF companies FOR VALUES IN ('16');  -- 富山県
CREATE TABLE companies_17 PARTITION OF companies FOR VALUES IN ('17');  -- 石川県
CREATE TABLE companies_18 PARTITION OF companies FOR VALUES IN ('18');  -- 福井県
CREATE TABLE companies_19 PARTITION OF companies FOR VALUES IN ('19');  -- 山梨県
CREATE TABLE companies_20 PARTITION OF companies FOR VALUES IN ('20');  -- 長野県
CREATE TABLE companies_21 PARTITION OF companies FOR VALUES IN ('21');  -- 岐阜県
CREATE TABLE companies_22 PARTITION OF companies FOR VALUES IN ('22');  -- 静岡県
CREATE TABLE companies_23 PARTITION OF companies FOR VALUES IN ('23');  -- 愛知県
CREATE TABLE companies_24 PARTITION OF companies FOR VALUES IN ('24');  -- 三重県
CREATE TABLE companies_25 PARTITION OF companies FOR VALUES IN ('25');  -- 滋賀県
CREATE TABLE companies_26 PARTITION OF companies FOR VALUES IN ('26');  -- 京都府
CREATE TABLE companies_27 PARTITION OF companies FOR VALUES IN ('27');  -- 大阪府
CREATE TABLE companies_28 PARTITION OF companies FOR VALUES IN ('28');  -- 兵庫県
CREATE TABLE companies_29 PARTITION OF companies FOR VALUES IN ('29');  -- 奈良県
CREATE TABLE companies_30 PARTITION OF companies FOR VALUES IN ('30');  -- 和歌山県
CREATE TABLE companies_31 PARTITION OF companies FOR VALUES IN ('31');  -- 鳥取県
CREATE TABLE companies_32 PARTITION OF companies FOR VALUES IN ('32');  -- 島根県
CREATE TABLE companies_33 PARTITION OF companies FOR VALUES IN ('33');  -- 岡山県
CREATE TABLE companies_34 PARTITION OF companies FOR VALUES IN ('34');  -- 広島県
CREATE TABLE companies_35 PARTITION OF companies FOR VALUES IN ('35');  -- 山口県
CREATE TABLE companies_36 PARTITION OF companies FOR VALUES IN ('36');  -- 徳島県
CREATE TABLE companies_37 PARTITION OF companies FOR VALUES IN ('37');  -- 香川県
CREATE TABLE companies_38 PARTITION OF companies FOR VALUES IN ('38');  -- 愛媛県
CREATE TABLE companies_39 PARTITION OF companies FOR VALUES IN ('39');  -- 高知県
CREATE TABLE companies_40 PARTITION OF companies FOR VALUES IN ('40');  -- 福岡県
CREATE TABLE companies_41 PARTITION OF companies FOR VALUES IN ('41');  -- 佐賀県
CREATE TABLE companies_42 PARTITION OF companies FOR VALUES IN ('42');  -- 長崎県
CREATE TABLE companies_43 PARTITION OF companies FOR VALUES IN ('43');  -- 熊本県
CREATE TABLE companies_44 PARTITION OF companies FOR VALUES IN ('44');  -- 大分県
CREATE TABLE companies_45 PARTITION OF companies FOR VALUES IN ('45');  -- 宮崎県
CREATE TABLE companies_46 PARTITION OF companies FOR VALUES IN ('46');  -- 鹿児島県
CREATE TABLE companies_47 PARTITION OF companies FOR VALUES IN ('47');  -- 沖縄県
CREATE TABLE companies_default PARTITION OF companies DEFAULT;

-- =============================================================
-- 法人×産業分類 中間テーブル
-- =============================================================
-- NOTE: companiesテーブルはパーティショニングされているため、標準的なFOREIGN KEY制約は使用不可。
-- アプリケーション層でcompany_idの存在チェックを実施する。
-- バッチ同期時にはorphanレコードの定期クリーンアップジョブで整合性を担保する。
CREATE TABLE company_industry_mapping (
  company_id  UUID NOT NULL,
  jsic_code   TEXT NOT NULL,
  source      TEXT NOT NULL DEFAULT 'gbizinfo'
    CHECK (source IN ('gbizinfo', 'manual')),
  confidence  DECIMAL(3,2) NOT NULL DEFAULT 1.00,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (company_id, jsic_code)
);

COMMENT ON TABLE company_industry_mapping IS '法人×産業分類の多対多マッピング';

-- =============================================================
-- ユーザー
-- =============================================================
CREATE TABLE users (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id           TEXT NOT NULL UNIQUE,
  email                   TEXT NOT NULL,
  plan                    TEXT NOT NULL DEFAULT 'free'
    CHECK (plan IN ('free', 'starter', 'pro')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  stripe_customer_id      TEXT,
  stripe_subscription_id  TEXT,
  monthly_download_count  INTEGER NOT NULL DEFAULT 0,
  download_reset_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE users IS 'アプリケーションユーザー（Clerk連携）';

-- =============================================================
-- 保存済み検索条件（H-008: share_token対応）
-- =============================================================
CREATE TABLE saved_searches (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  search_params     JSONB NOT NULL,
  share_token       UUID UNIQUE,            -- 共有リンク用トークン (H-008)
  share_expires_at  TIMESTAMPTZ,            -- 共有リンク有効期限 (H-008)
  result_count      INTEGER,
  notify_enabled    BOOLEAN NOT NULL DEFAULT false,
  notify_frequency  TEXT DEFAULT 'weekly'
    CHECK (notify_frequency IN ('daily', 'weekly', 'monthly')),
  last_notified_at  TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ss_user ON saved_searches(user_id);
CREATE INDEX idx_ss_share_token ON saved_searches(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX idx_ss_notify ON saved_searches(notify_enabled, notify_frequency)
  WHERE notify_enabled = true;

COMMENT ON TABLE saved_searches IS '保存済み検索条件（共有リンク対応 H-008）';

-- =============================================================
-- ダウンロード履歴
-- =============================================================
CREATE TABLE download_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  search_params   JSONB NOT NULL,
  format          TEXT NOT NULL CHECK (format IN ('csv', 'xlsx')),
  encoding        TEXT NOT NULL DEFAULT 'utf8' CHECK (encoding IN ('utf8', 'sjis')),
  record_count    INTEGER NOT NULL,
  file_url        TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'generating', 'completed', 'failed', 'expired')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dl_user ON download_logs(user_id, created_at DESC);

COMMENT ON TABLE download_logs IS 'ダウンロード履歴（件数=レコード数累計 H-004）';

-- =============================================================
-- 同期ログ
-- =============================================================
CREATE TABLE sync_logs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source              TEXT NOT NULL CHECK (source IN ('gbizinfo', 'nta')),
  sync_type           TEXT NOT NULL CHECK (sync_type IN ('full', 'incremental')),
  records_processed   INTEGER NOT NULL DEFAULT 0,
  records_inserted    INTEGER NOT NULL DEFAULT 0,
  records_updated     INTEGER NOT NULL DEFAULT 0,
  records_failed      INTEGER NOT NULL DEFAULT 0,
  status              TEXT NOT NULL DEFAULT 'running'
    CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  target_prefecture   TEXT,           -- 対象都道府県コード（NULL=全国）
  started_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at        TIMESTAMPTZ,
  error_message       TEXT
);

CREATE INDEX idx_sl_source_status ON sync_logs(source, status, started_at DESC);

COMMENT ON TABLE sync_logs IS 'データソース同期ログ';

-- =============================================================
-- §3.3 インデックス戦略
-- =============================================================

-- 法人番号ユニークインデックス（パーティションキー含む）
-- → CREATE TABLE の UNIQUE 制約で自動作成

-- 都道府県+市区町村の複合インデックス（地域検索用）
CREATE INDEX idx_companies_location ON companies(prefecture_code, city_code);

-- 全文検索用GINインデックス
CREATE INDEX idx_companies_search ON companies USING GIN(search_vector);

-- 法人名 trigram インデックス（LIKE部分一致検索用）
CREATE INDEX idx_companies_name_trgm ON companies USING GIN(name gin_trgm_ops);

-- 資本金の範囲検索用（NULLを除外する部分インデックス）
CREATE INDEX idx_companies_capital ON companies(capital)
  WHERE capital IS NOT NULL;

-- 従業員数の範囲検索用（NULLを除外する部分インデックス）
CREATE INDEX idx_companies_employee ON companies(employee_count)
  WHERE employee_count IS NOT NULL;

-- 設立年の範囲検索用（NULLを除外する部分インデックス）
CREATE INDEX idx_companies_establishment ON companies(establishment_date)
  WHERE establishment_date IS NOT NULL;

-- 法人種別フィルタ用
CREATE INDEX idx_companies_type ON companies(corporate_type)
  WHERE corporate_type IS NOT NULL;

-- ステータスフィルタ用（activeのみの部分インデックス）
CREATE INDEX idx_companies_active ON companies(prefecture_code)
  WHERE status = 'active';

-- website_url有無フィルタ用
CREATE INDEX idx_companies_has_website ON companies(prefecture_code)
  WHERE website_url IS NOT NULL AND website_url != '';

-- 更新日時（差分同期用）
CREATE INDEX idx_companies_updated ON companies(updated_at DESC);

-- company_industry_mapping のインデックス
CREATE INDEX idx_cim_jsic ON company_industry_mapping(jsic_code);
CREATE INDEX idx_cim_company ON company_industry_mapping(company_id);

-- =============================================================
-- §3.5 Materialized View設計（H-003, H-005解決）
-- =============================================================

-- MV1: 都道府県×業種別 企業件数集計（ライブカウンター用）
CREATE MATERIALIZED VIEW mv_prefecture_industry_count AS
SELECT
  c.prefecture_code,
  p.name AS prefecture_name,
  p.region,
  cim.jsic_code,
  ic.name AS industry_name,
  ic.level AS industry_level,
  COUNT(*) AS company_count
FROM companies c
JOIN company_industry_mapping cim ON cim.company_id = c.id
JOIN industry_classifications ic ON ic.code = cim.jsic_code AND ic.version = (
  SELECT MAX(version) FROM industry_classifications
)
JOIN prefectures p ON p.code = c.prefecture_code
WHERE c.status = 'active'
GROUP BY c.prefecture_code, p.name, p.region, cim.jsic_code, ic.name, ic.level
WITH DATA;

CREATE UNIQUE INDEX idx_mv_pref_ind ON mv_prefecture_industry_count(prefecture_code, jsic_code);
CREATE INDEX idx_mv_jsic ON mv_prefecture_industry_count(jsic_code);
CREATE INDEX idx_mv_region ON mv_prefecture_industry_count(region);

COMMENT ON MATERIALIZED VIEW mv_prefecture_industry_count
  IS 'ライブカウンター用事前集計 (H-005)。日次04:00にCONCURRENTLYリフレッシュ';

-- MV2: 都道府県別 企業総数（地域統計ダッシュボード用）
CREATE MATERIALIZED VIEW mv_prefecture_summary AS
SELECT
  c.prefecture_code,
  p.name AS prefecture_name,
  p.region,
  COUNT(*) AS total_companies,
  COUNT(*) FILTER (WHERE c.website_url IS NOT NULL AND c.website_url != '') AS with_website,
  AVG(c.capital) FILTER (WHERE c.capital IS NOT NULL) AS avg_capital,
  AVG(c.employee_count) FILTER (WHERE c.employee_count IS NOT NULL) AS avg_employees
FROM companies c
JOIN prefectures p ON p.code = c.prefecture_code
WHERE c.status = 'active'
GROUP BY c.prefecture_code, p.name, p.region
WITH DATA;

CREATE UNIQUE INDEX idx_mv_pref_summary ON mv_prefecture_summary(prefecture_code);

-- MV3: 業種大分類別 企業総数（統計ダッシュボード用）
CREATE MATERIALIZED VIEW mv_industry_summary AS
SELECT
  ic.code AS major_code,
  ic.name AS major_name,
  COUNT(DISTINCT cim.company_id) AS company_count
FROM company_industry_mapping cim
JOIN industry_classifications ic ON ic.code = cim.jsic_code AND ic.level = 'major'
JOIN companies c ON c.id = cim.company_id
WHERE c.status = 'active'
GROUP BY ic.code, ic.name
WITH DATA;

CREATE UNIQUE INDEX idx_mv_ind_summary ON mv_industry_summary(major_code);

-- MV更新関数
CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_prefecture_industry_count;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_prefecture_summary;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_industry_summary;
END;
$$ LANGUAGE plpgsql;

-- =============================================================
-- §3.6 全文検索設計
-- =============================================================

-- search_vector 更新トリガー関数
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.name_kana, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.business_summary, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.gbiz_business_items, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.full_address, '')), 'C') ||
    setweight(to_tsvector('simple', COALESCE(NEW.representative_name, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 各パーティションにトリガーを設定
-- (パーティションテーブルにはトリガーが継承されないため、個別設定が必要)
DO $$
DECLARE
  pref_code TEXT;
BEGIN
  FOR pref_code IN SELECT generate_series(1, 47) LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_search_vector_%s
       BEFORE INSERT OR UPDATE OF name, name_kana, business_summary, gbiz_business_items, full_address, representative_name
       ON companies_%s
       FOR EACH ROW EXECUTE FUNCTION update_search_vector()',
      LPAD(pref_code::TEXT, 2, '0'),
      LPAD(pref_code::TEXT, 2, '0')
    );
  END LOOP;
END;
$$;

-- companies_default パーティションにもトリガーを設定
CREATE TRIGGER trg_search_vector_default
  BEFORE INSERT OR UPDATE OF name, name_kana, business_summary, gbiz_business_items, full_address, representative_name
  ON companies_default
  FOR EACH ROW EXECUTE FUNCTION update_search_vector();

-- =============================================================
-- §3.7 RLS設計
-- =============================================================

-- companiesテーブル: 全ユーザー読み取り可（公開データ）
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "companies_read_all" ON companies
  FOR SELECT USING (true);

-- companies書き込みはサービスロールのみ
CREATE POLICY "companies_write_service" ON companies
  FOR ALL USING (auth.role() = 'service_role');

-- usersテーブル: 自分自身のレコードのみ
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_read" ON users
  FOR SELECT USING (clerk_user_id = auth.jwt()->>'sub');
CREATE POLICY "users_own_update" ON users
  FOR UPDATE USING (clerk_user_id = auth.jwt()->>'sub');

-- saved_searches: 自分の保存検索 + 共有トークンでの閲覧
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ss_own" ON saved_searches
  FOR ALL USING (user_id = (
    SELECT id FROM users WHERE clerk_user_id = auth.jwt()->>'sub'
  ));
-- 共有リンクでの閲覧はEdge Function経由（service_role）で処理

-- download_logs: 自分のダウンロード履歴のみ
ALTER TABLE download_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dl_own_read" ON download_logs
  FOR SELECT USING (user_id = (
    SELECT id FROM users WHERE clerk_user_id = auth.jwt()->>'sub'
  ));

-- sync_logs: 管理者のみ（service_role）
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sync_service_only" ON sync_logs
  FOR ALL USING (auth.role() = 'service_role');
