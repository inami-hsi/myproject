-- =============================================================
-- サンプル企業データ（50社）
-- テスト・デモ用。検索機能の動作確認に使用。
-- =============================================================

-- 東京都 (13)
INSERT INTO companies (corporate_number, name, name_kana, prefecture_code, prefecture_name, city_code, city_name, address, full_address, representative_name, capital, employee_count, business_summary, website_url, status) VALUES
('1010001000001', '株式会社テクノソリューションズ', 'テクノソリューションズ', '13', '東京都', '13101', '千代田区', '丸の内1-1-1', '東京都千代田区丸の内1-1-1', '山田太郎', 100000000, 250, 'システム開発・ITコンサルティング', 'https://example-techno.co.jp', 'active'),
('1010001000002', '株式会社グローバルトレード', 'グローバルトレード', '13', '東京都', '13103', '港区', '赤坂2-2-2', '東京都港区赤坂2-2-2', '佐藤花子', 50000000, 120, '輸出入貿易・国際物流', 'https://example-global.co.jp', 'active'),
('1010001000003', '東京建設工業株式会社', 'トウキョウケンセツコウギョウ', '13', '東京都', '13104', '新宿区', '西新宿3-3-3', '東京都新宿区西新宿3-3-3', '鈴木一郎', 300000000, 500, '総合建設・土木工事', 'https://example-kensetsu.co.jp', 'active'),
('1010001000004', '株式会社フードデリバリー', 'フードデリバリー', '13', '東京都', '13113', '渋谷区', '渋谷4-4-4', '東京都渋谷区渋谷4-4-4', '田中美咲', 10000000, 80, '飲食店向け食材配達サービス', 'https://example-food.co.jp', 'active'),
('1010001000005', '株式会社メディカルケア', 'メディカルケア', '13', '東京都', '13102', '中央区', '日本橋5-5-5', '東京都中央区日本橋5-5-5', '高橋健一', 80000000, 300, '医療機器販売・介護サービス', 'https://example-medical.co.jp', 'active'),
('1010001000006', '株式会社クリエイティブデザイン', 'クリエイティブデザイン', '13', '東京都', '13113', '渋谷区', '神宮前6-6-6', '東京都渋谷区神宮前6-6-6', '伊藤直子', 10000000, 25, 'Webデザイン・ブランディング', 'https://example-creative.co.jp', 'active'),
('1010001000007', '太平洋物産株式会社', 'タイヘイヨウブッサン', '13', '東京都', '13103', '港区', '芝公園7-7-7', '東京都港区芝公園7-7-7', '渡辺大輔', 500000000, 800, '総合商社・資源開発', NULL, 'active'),
('1010001000008', '株式会社サイバーセキュリティ', 'サイバーセキュリティ', '13', '東京都', '13101', '千代田区', '神田8-8-8', '東京都千代田区神田8-8-8', '中村翔太', 200000000, 150, '情報セキュリティコンサルティング', 'https://example-cyber.co.jp', 'active'),
('1010001000009', '日本教育サービス株式会社', 'ニホンキョウイクサービス', '13', '東京都', '13116', '豊島区', '池袋9-9-9', '東京都豊島区池袋9-9-9', '小林裕子', 30000000, 200, 'プログラミング教育・学習塾運営', 'https://example-edu.co.jp', 'active'),
('1010001000010', '株式会社エコエナジー', 'エコエナジー', '13', '東京都', '13104', '新宿区', '高田馬場10-10', '東京都新宿区高田馬場10-10', '加藤誠', 150000000, 100, '太陽光発電・再生可能エネルギー', 'https://example-eco.co.jp', 'active'),

-- 大阪府 (27)
('2010001000001', '株式会社大阪テック', 'オオサカテック', '27', '大阪府', '27128', '中央区', '本町1-1-1', '大阪府大阪市中央区本町1-1-1', '松本康弘', 50000000, 180, 'IoTデバイス開発・製造', 'https://example-osaka-tech.co.jp', 'active'),
('2010001000002', '関西食品株式会社', 'カンサイショクヒン', '27', '大阪府', '27102', '北区', '梅田2-2-2', '大阪府大阪市北区梅田2-2-2', '吉田真理', 80000000, 350, '食料品製造・卸売', 'https://example-kansai-food.co.jp', 'active'),
('2010001000003', '株式会社不動産パートナーズ', 'フドウサンパートナーズ', '27', '大阪府', '27127', '西区', '肥後橋3-3-3', '大阪府大阪市西区肥後橋3-3-3', '山本隆司', 100000000, 60, '不動産仲介・管理', 'https://example-fudosan.co.jp', 'active'),
('2010001000004', '堺製造株式会社', 'サカイセイゾウ', '27', '大阪府', '27140', '堺市堺区', '大仙町4-4-4', '大阪府堺市堺区大仙町4-4-4', '井上修', 200000000, 420, '金属加工・精密機械部品製造', NULL, 'active'),
('2010001000005', '株式会社なにわ観光', 'ナニワカンコウ', '27', '大阪府', '27102', '北区', '角田町5-5-5', '大阪府大阪市北区角田町5-5-5', '木村恵美', 20000000, 90, '旅行代理店・ホテル運営', 'https://example-naniwa.co.jp', 'active'),

-- 神奈川県 (14)
('3010001000001', '横浜エンジニアリング株式会社', 'ヨコハマエンジニアリング', '14', '神奈川県', '14101', '横浜市中区', '山下町1-1-1', '神奈川県横浜市中区山下町1-1-1', '林正樹', 300000000, 600, '自動車部品設計・製造', 'https://example-yokohama-eng.co.jp', 'active'),
('3010001000002', '湘南ソフトウェア株式会社', 'ショウナンソフトウェア', '14', '神奈川県', '14205', '藤沢市', '鵠沼2-2-2', '神奈川県藤沢市鵠沼2-2-2', '清水有紀', 30000000, 45, 'モバイルアプリ開発', 'https://example-shonan-sw.co.jp', 'active'),
('3010001000003', '川崎化学工業株式会社', 'カワサキカガクコウギョウ', '14', '神奈川県', '14131', '川崎市川崎区', '扇町3-3-3', '神奈川県川崎市川崎区扇町3-3-3', '森田浩二', 500000000, 700, '化学製品製造・研究開発', 'https://example-kawasaki-chem.co.jp', 'active'),
('3010001000004', '株式会社横須賀マリン', 'ヨコスカマリン', '14', '神奈川県', '14201', '横須賀市', '本町4-4-4', '神奈川県横須賀市本町4-4-4', '佐々木洋介', 50000000, 30, '船舶修理・マリンレジャー', NULL, 'active'),

-- 愛知県 (23)
('4010001000001', '名古屋自動車部品株式会社', 'ナゴヤジドウシャブヒン', '23', '愛知県', '23106', '名古屋市中区', '栄1-1-1', '愛知県名古屋市中区栄1-1-1', '近藤正義', 1000000000, 1200, '自動車部品製造・開発', 'https://example-nagoya-auto.co.jp', 'active'),
('4010001000002', '三河工業株式会社', 'ミカワコウギョウ', '23', '愛知県', '23202', '豊田市', '挙母町2-2-2', '愛知県豊田市挙母町2-2-2', '岡田武志', 500000000, 800, '産業用ロボット製造', 'https://example-mikawa.co.jp', 'active'),
('4010001000003', '株式会社東海物流', 'トウカイブツリュウ', '23', '愛知県', '23105', '名古屋市中村区', '名駅3-3-3', '愛知県名古屋市中村区名駅3-3-3', '後藤美穂', 80000000, 250, '物流・倉庫管理', 'https://example-tokai-logistics.co.jp', 'active'),

-- 北海道 (01)
('5010001000001', '北海道農産株式会社', 'ホッカイドウノウサン', '01', '北海道', '01101', '札幌市中央区', '大通1-1-1', '北海道札幌市中央区大通1-1-1', '藤田豊', 60000000, 150, '農産物生産・加工・販売', 'https://example-hokkaido-nousan.co.jp', 'active'),
('5010001000002', '株式会社サッポロIT', 'サッポロアイティー', '01', '北海道', '01101', '札幌市中央区', '北5条西2-2-2', '北海道札幌市中央区北5条西2-2-2', '中島健太', 20000000, 40, 'クラウドサービス開発', 'https://example-sapporo-it.co.jp', 'active'),
('5010001000003', '旭川木材工業株式会社', 'アサヒカワモクザイコウギョウ', '01', '北海道', '01204', '旭川市', '忠和3-3-3', '北海道旭川市忠和3-3-3', '石井一夫', 40000000, 80, '木材加工・住宅建材製造', NULL, 'active'),

-- 福岡県 (40)
('6010001000001', '株式会社福岡フィンテック', 'フクオカフィンテック', '40', '福岡県', '40133', '福岡市中央区', '天神1-1-1', '福岡県福岡市中央区天神1-1-1', '宮崎陽介', 100000000, 80, '金融系システム開発・決済サービス', 'https://example-fukuoka-fintech.co.jp', 'active'),
('6010001000002', '九州運輸株式会社', 'キュウシュウウンユ', '40', '福岡県', '40131', '福岡市東区', '箱崎2-2-2', '福岡県福岡市東区箱崎2-2-2', '原田剛', 150000000, 400, '一般貨物運送・引越サービス', 'https://example-kyushu-unyu.co.jp', 'active'),
('6010001000003', '博多屋台食品株式会社', 'ハカタヤタイショクヒン', '40', '福岡県', '40132', '福岡市博多区', '中洲3-3-3', '福岡県福岡市博多区中洲3-3-3', '大塚真由美', 10000000, 35, '冷凍食品製造・屋台プロデュース', 'https://example-hakata-food.co.jp', 'active'),

-- 京都府 (26)
('7010001000001', '京都伝統工芸株式会社', 'キョウトデントウコウゲイ', '26', '京都府', '26104', '京都市中京区', '烏丸1-1-1', '京都府京都市中京区烏丸1-1-1', '西田雅彦', 30000000, 50, '伝統工芸品製造・販売', 'https://example-kyoto-craft.co.jp', 'active'),
('7010001000002', '株式会社宿泊京都', 'シュクハクキョウト', '26', '京都府', '26105', '京都市東山区', '祇園2-2-2', '京都府京都市東山区祇園2-2-2', '三浦由紀子', 80000000, 120, '旅館・ホテル運営', 'https://example-shukuhaku-kyoto.co.jp', 'active'),

-- 広島県 (34)
('8010001000001', '広島精密機械株式会社', 'ヒロシマセイミツキカイ', '34', '広島県', '34101', '広島市中区', '紙屋町1-1-1', '広島県広島市中区紙屋町1-1-1', '村上和彦', 200000000, 350, '精密機械部品製造', 'https://example-hiroshima-seimitsu.co.jp', 'active'),
('8010001000002', '呉造船工業株式会社', 'クレゾウセンコウギョウ', '34', '広島県', '34202', '呉市', '中央2-2-2', '広島県呉市中央2-2-2', '松井英二', 800000000, 900, '造船・船舶修理', NULL, 'active'),

-- 宮城県 (04)
('9010001000001', '仙台IT株式会社', 'センダイアイティー', '04', '宮城県', '04101', '仙台市青葉区', '一番町1-1-1', '宮城県仙台市青葉区一番町1-1-1', '菊池亮', 20000000, 60, 'AI・機械学習ソリューション', 'https://example-sendai-it.co.jp', 'active'),
('9010001000002', '東北水産加工株式会社', 'トウホクスイサンカコウ', '04', '宮城県', '04101', '仙台市青葉区', '中央2-2-2', '宮城県仙台市青葉区中央2-2-2', '遠藤洋子', 50000000, 100, '水産物加工・冷凍食品', 'https://example-tohoku-suisan.co.jp', 'active'),

-- 埼玉県 (11)
('1110001000001', '株式会社さいたまロジスティクス', 'サイタマロジスティクス', '11', '埼玉県', '11101', 'さいたま市西区', '指扇1-1-1', '埼玉県さいたま市西区指扇1-1-1', '坂本浩', 40000000, 180, '物流センター運営・配送サービス', 'https://example-saitama-logistics.co.jp', 'active'),
('1110001000002', '川口鋳物工業株式会社', 'カワグチイモノコウギョウ', '11', '埼玉県', '11203', '川口市', '芝2-2-2', '埼玉県川口市芝2-2-2', '橋本鉄男', 100000000, 200, '鋳物・金属加工製品製造', NULL, 'active'),

-- 千葉県 (12)
('1210001000001', '幕張テクノパーク株式会社', 'マクハリテクノパーク', '12', '千葉県', '12101', '千葉市中央区', '幕張1-1-1', '千葉県千葉市中央区幕張1-1-1', '石川聡', 150000000, 300, 'データセンター運営・クラウドホスティング', 'https://example-makuhari-tech.co.jp', 'active'),

-- 兵庫県 (28)
('2810001000001', '神戸港運株式会社', 'コウベコウウン', '28', '兵庫県', '28110', '神戸市中央区', '波止場町1-1-1', '兵庫県神戸市中央区波止場町1-1-1', '黒田直人', 200000000, 500, '港湾運送・国際物流', 'https://example-kobe-port.co.jp', 'active'),
('2810001000002', '姫路鉄鋼株式会社', 'ヒメジテッコウ', '28', '兵庫県', '28201', '姫路市', '飾磨区2-2-2', '兵庫県姫路市飾磨区2-2-2', '田辺勇一', 300000000, 450, '鉄鋼製品製造・加工', 'https://example-himeji-steel.co.jp', 'active'),

-- 静岡県 (22)
('2210001000001', '浜松楽器株式会社', 'ハママツガッキ', '22', '静岡県', '22202', '浜松市中区', '中央1-1-1', '静岡県浜松市中区中央1-1-1', '市川誠二', 100000000, 250, '楽器製造・音響機器開発', 'https://example-hamamatsu-gakki.co.jp', 'active'),

-- 新潟県 (15)
('1510001000001', '越後米穀株式会社', 'エチゴベイコク', '15', '新潟県', '15104', '新潟市中央区', '万代1-1-1', '新潟県新潟市中央区万代1-1-1', '五十嵐豊', 30000000, 70, '米穀卸売・食品加工', 'https://example-echigo-rice.co.jp', 'active'),

-- 長野県 (20)
('2010001100001', '信州精密機器株式会社', 'シンシュウセイミツキキ', '20', '長野県', '20201', '長野市', '南千歳1-1-1', '長野県長野市南千歳1-1-1', '小山弘志', 200000000, 280, '精密光学機器・レンズ製造', 'https://example-shinshu-seimitsu.co.jp', 'active'),

-- 石川県 (17)
('1710001000001', '金沢漆器工芸株式会社', 'カナザワシッキコウゲイ', '17', '石川県', '17201', '金沢市', '東山1-1-1', '石川県金沢市東山1-1-1', '前田美智子', 15000000, 20, '漆器製造・伝統工芸品販売', 'https://example-kanazawa-shikki.co.jp', 'active'),

-- 沖縄県 (47)
('4710001000001', '沖縄リゾート開発株式会社', 'オキナワリゾートカイハツ', '47', '沖縄県', '47201', '那覇市', '久茂地1-1-1', '沖縄県那覇市久茂地1-1-1', '仲村渠勝', 100000000, 150, 'リゾートホテル・観光施設開発', 'https://example-okinawa-resort.co.jp', 'active'),
('4710001000002', '琉球IT株式会社', 'リュウキュウアイティー', '47', '沖縄県', '47201', '那覇市', '前島2-2-2', '沖縄県那覇市前島2-2-2', '大城健', 10000000, 20, 'Webシステム開発・デジタルマーケティング', 'https://example-ryukyu-it.co.jp', 'active'),

-- 閉鎖企業の例
('9910001000001', '旧日本通商株式会社', 'キュウニホンツウショウ', '13', '東京都', '13101', '千代田区', '大手町1-1-1', '東京都千代田区大手町1-1-1', '元山一夫', 100000000, 0, '貿易商社（2023年解散）', NULL, 'closed'),
('9910001000002', '合併済み物産株式会社', 'ガッペイズミブッサン', '27', '大阪府', '27102', '北区', '堂島1-1-1', '大阪府大阪市北区堂島1-1-1', '元田次郎', 50000000, 0, '総合商社（2024年合併）', NULL, 'merged')

ON CONFLICT (corporate_number, prefecture_code) DO NOTHING;

-- =============================================================
-- 企業×業種マッピング
-- =============================================================
-- ※ company_idはUUID自動生成のため、corporate_numberで引く

DO $$
DECLARE
  cid UUID;
BEGIN
  -- テクノソリューションズ → 情報サービス業(39)
  SELECT id INTO cid FROM companies WHERE corporate_number = '1010001000001' LIMIT 1;
  IF cid IS NOT NULL THEN INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '39') ON CONFLICT DO NOTHING; END IF;

  -- グローバルトレード → その他の卸売業(55)
  SELECT id INTO cid FROM companies WHERE corporate_number = '1010001000002' LIMIT 1;
  IF cid IS NOT NULL THEN INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '55') ON CONFLICT DO NOTHING; END IF;

  -- 東京建設工業 → 総合工事業(06)
  SELECT id INTO cid FROM companies WHERE corporate_number = '1010001000003' LIMIT 1;
  IF cid IS NOT NULL THEN INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '06') ON CONFLICT DO NOTHING; END IF;

  -- フードデリバリー → 飲食料品卸売業(52), 飲食店(76)
  SELECT id INTO cid FROM companies WHERE corporate_number = '1010001000004' LIMIT 1;
  IF cid IS NOT NULL THEN
    INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '52') ON CONFLICT DO NOTHING;
    INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '76') ON CONFLICT DO NOTHING;
  END IF;

  -- メディカルケア → 医療業(83)
  SELECT id INTO cid FROM companies WHERE corporate_number = '1010001000005' LIMIT 1;
  IF cid IS NOT NULL THEN INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '83') ON CONFLICT DO NOTHING; END IF;

  -- クリエイティブデザイン → 広告業(73)
  SELECT id INTO cid FROM companies WHERE corporate_number = '1010001000006' LIMIT 1;
  IF cid IS NOT NULL THEN INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '73') ON CONFLICT DO NOTHING; END IF;

  -- 太平洋物産 → その他の卸売業(55)
  SELECT id INTO cid FROM companies WHERE corporate_number = '1010001000007' LIMIT 1;
  IF cid IS NOT NULL THEN INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '55') ON CONFLICT DO NOTHING; END IF;

  -- サイバーセキュリティ → 情報サービス業(39)
  SELECT id INTO cid FROM companies WHERE corporate_number = '1010001000008' LIMIT 1;
  IF cid IS NOT NULL THEN INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '39') ON CONFLICT DO NOTHING; END IF;

  -- 日本教育サービス → 情報サービス業(39)（プログラミング教育）
  SELECT id INTO cid FROM companies WHERE corporate_number = '1010001000009' LIMIT 1;
  IF cid IS NOT NULL THEN INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '39') ON CONFLICT DO NOTHING; END IF;

  -- エコエナジー → 電気業（大分類F扱い、中分類なし）
  SELECT id INTO cid FROM companies WHERE corporate_number = '1010001000010' LIMIT 1;
  IF cid IS NOT NULL THEN INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, 'F') ON CONFLICT DO NOTHING; END IF;

  -- 大阪テック → 情報サービス業(39), 電子部品製造(28)
  SELECT id INTO cid FROM companies WHERE corporate_number = '2010001000001' LIMIT 1;
  IF cid IS NOT NULL THEN
    INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '39') ON CONFLICT DO NOTHING;
    INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '28') ON CONFLICT DO NOTHING;
  END IF;

  -- 関西食品 → 食料品製造業(09), 飲食料品卸売業(52)
  SELECT id INTO cid FROM companies WHERE corporate_number = '2010001000002' LIMIT 1;
  IF cid IS NOT NULL THEN
    INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '09') ON CONFLICT DO NOTHING;
    INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '52') ON CONFLICT DO NOTHING;
  END IF;

  -- 不動産パートナーズ → 不動産取引業(68)
  SELECT id INTO cid FROM companies WHERE corporate_number = '2010001000003' LIMIT 1;
  IF cid IS NOT NULL THEN INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '68') ON CONFLICT DO NOTHING; END IF;

  -- 堺製造 → 金属製品製造業(24)
  SELECT id INTO cid FROM companies WHERE corporate_number = '2010001000004' LIMIT 1;
  IF cid IS NOT NULL THEN INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '24') ON CONFLICT DO NOTHING; END IF;

  -- なにわ観光 → 宿泊業(75)
  SELECT id INTO cid FROM companies WHERE corporate_number = '2010001000005' LIMIT 1;
  IF cid IS NOT NULL THEN INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '75') ON CONFLICT DO NOTHING; END IF;

  -- 横浜エンジニアリング → 輸送用機械器具製造業(31)
  SELECT id INTO cid FROM companies WHERE corporate_number = '3010001000001' LIMIT 1;
  IF cid IS NOT NULL THEN INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '31') ON CONFLICT DO NOTHING; END IF;

  -- 湘南ソフトウェア → 情報サービス業(39)
  SELECT id INTO cid FROM companies WHERE corporate_number = '3010001000002' LIMIT 1;
  IF cid IS NOT NULL THEN INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '39') ON CONFLICT DO NOTHING; END IF;

  -- 川崎化学工業 → 化学工業(16)
  SELECT id INTO cid FROM companies WHERE corporate_number = '3010001000003' LIMIT 1;
  IF cid IS NOT NULL THEN INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '16') ON CONFLICT DO NOTHING; END IF;

  -- 横須賀マリン → 漁業(大分類B)
  SELECT id INTO cid FROM companies WHERE corporate_number = '3010001000004' LIMIT 1;
  IF cid IS NOT NULL THEN INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, 'B') ON CONFLICT DO NOTHING; END IF;

  -- 名古屋自動車部品 → 輸送用機械器具製造業(31)
  SELECT id INTO cid FROM companies WHERE corporate_number = '4010001000001' LIMIT 1;
  IF cid IS NOT NULL THEN INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '31') ON CONFLICT DO NOTHING; END IF;

  -- 三河工業 → 生産用機械器具製造業(26)
  SELECT id INTO cid FROM companies WHERE corporate_number = '4010001000002' LIMIT 1;
  IF cid IS NOT NULL THEN INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '26') ON CONFLICT DO NOTHING; END IF;

  -- 東海物流 → 運輸業(大分類H)
  SELECT id INTO cid FROM companies WHERE corporate_number = '4010001000003' LIMIT 1;
  IF cid IS NOT NULL THEN INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, 'H') ON CONFLICT DO NOTHING; END IF;

  -- 北海道農産 → 農業(大分類A)
  SELECT id INTO cid FROM companies WHERE corporate_number = '5010001000001' LIMIT 1;
  IF cid IS NOT NULL THEN INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, 'A') ON CONFLICT DO NOTHING; END IF;

  -- サッポロIT → 情報サービス業(39)
  SELECT id INTO cid FROM companies WHERE corporate_number = '5010001000002' LIMIT 1;
  IF cid IS NOT NULL THEN INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '39') ON CONFLICT DO NOTHING; END IF;

  -- 旭川木材工業 → 木材・木製品製造業(12)
  SELECT id INTO cid FROM companies WHERE corporate_number = '5010001000003' LIMIT 1;
  IF cid IS NOT NULL THEN INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '12') ON CONFLICT DO NOTHING; END IF;

  -- 福岡フィンテック → 情報サービス業(39), 金融業(大分類J)
  SELECT id INTO cid FROM companies WHERE corporate_number = '6010001000001' LIMIT 1;
  IF cid IS NOT NULL THEN
    INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '39') ON CONFLICT DO NOTHING;
    INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, 'J') ON CONFLICT DO NOTHING;
  END IF;

  -- 九州運輸 → 運輸業(大分類H)
  SELECT id INTO cid FROM companies WHERE corporate_number = '6010001000002' LIMIT 1;
  IF cid IS NOT NULL THEN INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, 'H') ON CONFLICT DO NOTHING; END IF;

  -- 博多屋台食品 → 食料品製造業(09), 飲食店(76)
  SELECT id INTO cid FROM companies WHERE corporate_number = '6010001000003' LIMIT 1;
  IF cid IS NOT NULL THEN
    INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '09') ON CONFLICT DO NOTHING;
    INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '76') ON CONFLICT DO NOTHING;
  END IF;

  -- 京都伝統工芸 → その他の製造業(32)
  SELECT id INTO cid FROM companies WHERE corporate_number = '7010001000001' LIMIT 1;
  IF cid IS NOT NULL THEN INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '32') ON CONFLICT DO NOTHING; END IF;

  -- 宿泊京都 → 宿泊業(75)
  SELECT id INTO cid FROM companies WHERE corporate_number = '7010001000002' LIMIT 1;
  IF cid IS NOT NULL THEN INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '75') ON CONFLICT DO NOTHING; END IF;

  -- 広島精密機械 → 業務用機械器具製造業(27)
  SELECT id INTO cid FROM companies WHERE corporate_number = '8010001000001' LIMIT 1;
  IF cid IS NOT NULL THEN INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '27') ON CONFLICT DO NOTHING; END IF;

  -- 呉造船工業 → 輸送用機械器具製造業(31)
  SELECT id INTO cid FROM companies WHERE corporate_number = '8010001000002' LIMIT 1;
  IF cid IS NOT NULL THEN INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '31') ON CONFLICT DO NOTHING; END IF;

  -- 仙台IT → 情報サービス業(39)
  SELECT id INTO cid FROM companies WHERE corporate_number = '9010001000001' LIMIT 1;
  IF cid IS NOT NULL THEN INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '39') ON CONFLICT DO NOTHING; END IF;

  -- 東北水産加工 → 食料品製造業(09)
  SELECT id INTO cid FROM companies WHERE corporate_number = '9010001000002' LIMIT 1;
  IF cid IS NOT NULL THEN INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '09') ON CONFLICT DO NOTHING; END IF;

  -- さいたまロジスティクス → 運輸業(大分類H)
  SELECT id INTO cid FROM companies WHERE corporate_number = '1110001000001' LIMIT 1;
  IF cid IS NOT NULL THEN INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, 'H') ON CONFLICT DO NOTHING; END IF;

  -- 川口鋳物工業 → 鉄鋼業(22)
  SELECT id INTO cid FROM companies WHERE corporate_number = '1110001000002' LIMIT 1;
  IF cid IS NOT NULL THEN INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '22') ON CONFLICT DO NOTHING; END IF;

  -- 幕張テクノパーク → 情報サービス業(39), 通信業(37)
  SELECT id INTO cid FROM companies WHERE corporate_number = '1210001000001' LIMIT 1;
  IF cid IS NOT NULL THEN
    INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '39') ON CONFLICT DO NOTHING;
    INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '37') ON CONFLICT DO NOTHING;
  END IF;

  -- 神戸港運 → 運輸業(大分類H)
  SELECT id INTO cid FROM companies WHERE corporate_number = '2810001000001' LIMIT 1;
  IF cid IS NOT NULL THEN INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, 'H') ON CONFLICT DO NOTHING; END IF;

  -- 姫路鉄鋼 → 鉄鋼業(22)
  SELECT id INTO cid FROM companies WHERE corporate_number = '2810001000002' LIMIT 1;
  IF cid IS NOT NULL THEN INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '22') ON CONFLICT DO NOTHING; END IF;

  -- 浜松楽器 → その他の製造業(32)
  SELECT id INTO cid FROM companies WHERE corporate_number = '2210001000001' LIMIT 1;
  IF cid IS NOT NULL THEN INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '32') ON CONFLICT DO NOTHING; END IF;

  -- 越後米穀 → 飲食料品卸売業(52)
  SELECT id INTO cid FROM companies WHERE corporate_number = '1510001000001' LIMIT 1;
  IF cid IS NOT NULL THEN INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '52') ON CONFLICT DO NOTHING; END IF;

  -- 信州精密機器 → 業務用機械器具製造業(27)
  SELECT id INTO cid FROM companies WHERE corporate_number = '2010001100001' LIMIT 1;
  IF cid IS NOT NULL THEN INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '27') ON CONFLICT DO NOTHING; END IF;

  -- 金沢漆器工芸 → その他の製造業(32)
  SELECT id INTO cid FROM companies WHERE corporate_number = '1710001000001' LIMIT 1;
  IF cid IS NOT NULL THEN INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '32') ON CONFLICT DO NOTHING; END IF;

  -- 沖縄リゾート開発 → 宿泊業(75), 不動産取引業(68)
  SELECT id INTO cid FROM companies WHERE corporate_number = '4710001000001' LIMIT 1;
  IF cid IS NOT NULL THEN
    INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '75') ON CONFLICT DO NOTHING;
    INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '68') ON CONFLICT DO NOTHING;
  END IF;

  -- 琉球IT → 情報サービス業(39), インターネット附随サービス業(40)
  SELECT id INTO cid FROM companies WHERE corporate_number = '4710001000002' LIMIT 1;
  IF cid IS NOT NULL THEN
    INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '39') ON CONFLICT DO NOTHING;
    INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '40') ON CONFLICT DO NOTHING;
  END IF;

  -- 旧日本通商（閉鎖）→ その他の卸売業(55)
  SELECT id INTO cid FROM companies WHERE corporate_number = '9910001000001' LIMIT 1;
  IF cid IS NOT NULL THEN INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '55') ON CONFLICT DO NOTHING; END IF;

  -- 合併済み物産（合併）→ その他の卸売業(55)
  SELECT id INTO cid FROM companies WHERE corporate_number = '9910001000002' LIMIT 1;
  IF cid IS NOT NULL THEN INSERT INTO company_industry_mapping (company_id, jsic_code) VALUES (cid, '55') ON CONFLICT DO NOTHING; END IF;

END $$;

-- =============================================================
-- マテリアライズドビュー更新
-- =============================================================
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_prefecture_industry_count;
