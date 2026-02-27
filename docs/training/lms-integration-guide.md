# 保険代理店向けLMS統合仕様書

## 📚 概要

Module 1-5（全18本、約500分）の研修プログラムをLMS上に構築・運用するための統合ガイドです。
Moodle（オープンソース）、Canvas（SaaS型）、Kajabi（オールインワン）の3プラットフォーム対応。

### プログラム概要

| 項目 | 内容 |
|------|------|
| **学習時間** | 約 6～8時間（全18動画） |
| **モジュール数** | 5つ（Module 1-5） |
| **動画本数** | 18本 |
| **推奨形式** | MP4 (H.264, 1920×1080) / WebM |
| **対応助成金** | 厚生労働省「人材開発支援助成金」 |

### 出力物一覧

```
docs/training/lms-integration-guide.md（本ドキュメント）
├── Moodle セットアップ＆コース構築
├── Canvas セットアップ＆コース構築
├── Kajabi セットアップ＆コース構築
├── 学習パス・進捗管理仕様
├── 修了証・バッジ発行システム
└── レポート・分析テンプレート
```

---

## 🎯 対象プラットフォーム比較表

| 項目 | Moodle | Canvas | Kajabi |
|------|--------|--------|--------|
| **タイプ** | オープンソース | クラウド（SaaS） | オールインワン |
| **カスタマイズ性** | 高（要開発） | 中 | 低（プリセット） |
| **初期導入コスト** | 低（サーバー費） | 中（SaaS契約） | 高（$119/月～） |
| **学習曲線** | 中-高 | 低-中 | 低 |
| **セキュリティ** | 自己管理 | 高（Instructure管理） | 高（SaaS） |
| **スケーラビリティ** | 中-高 | 高 | 中 |
| **API/連携** | 優秀 | 優秀 | 中程度 |
| **推奨規模** | 100～10,000名 | 50～100,000名+ | 50～1,000名 |
| **サポート体制** | コミュニティ | 日本語サポート | 日本語サポート（有償） |

---

# Part 1: Moodle セットアップ＆コース構築

## 1.1 インストール手順

### オプション A: 自社サーバーインストール（推奨、カスタマイズ性最高）

#### **システム要件**
```
サーバー：
- OS: Linux (Ubuntu 20.04 LTS 推奨)
- Webサーバー：Apache 2.4 / Nginx 1.18
- PHP: 7.4～8.1
- データベース：MySQL 5.7+ / PostgreSQL 9.6+
- ディスク容量：50GB以上（初期）
- 月間アクティブユーザー100名の場合：2GB RAM最小

クライアント側：
- ブラウザ：Chrome, Firefox, Safari 最新版
- 解像度：1024×768以上
- インターネット速度：10Mbps以上推奨
```

#### **ステップ1: サーバー環境構築（Ubuntu 20.04）**

```bash
# 1. OSアップデート
sudo apt-get update
sudo apt-get upgrade -y

# 2. 必要なパッケージインストール
sudo apt-get install -y php php-fpm php-mysql php-curl \
  php-gd php-intl php-mbstring php-soap php-xml php-xmlrpc \
  mysql-server mysql-client apache2 libapache2-mod-php \
  git curl wget unzip

# 3. Apache有効化
sudo a2enmod rewrite
sudo a2enmod proxy
sudo a2enmod proxy_fcgi
sudo systemctl restart apache2

# 4. MySQLセキュリティ設定
sudo mysql_secure_installation
  # 以下の質問に Y/n で回答：
  # - Remove anonymous users? → Y
  # - Disable remote root login? → Y
  # - Remove test database? → Y
  # - Reload privilege tables now? → Y

# 5. Moodle用データベース＆ユーザー作成
sudo mysql -u root -p
```

```sql
-- MySQLコマンドライン上で実行
CREATE DATABASE moodle DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'moodleuser'@'localhost' IDENTIFIED BY 'SECURE_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON moodle.* TO 'moodleuser'@'localhost';
FLUSH PRIVILEGES;
exit;
```

#### **ステップ2: Moodleダウンロード＆インストール**

```bash
# 1. Moodleディレクトリ作成
cd /var/www
sudo mkdir moodle
cd moodle

# 2. Moodle最新版ダウンロード（LTS 4.2推奨）
# https://download.moodle.org より最新版を確認
sudo wget https://download.moodle.org/download.php/direct/stable42/moodle-latest-42.zip
sudo unzip moodle-latest-42.zip
sudo rm moodle-latest-42.zip

# 3. moodledata ディレクトリ作成（ユーザーアップロードデータ保存）
sudo mkdir -p /var/moodledata
sudo chown -R www-data:www-data /var/moodledata
sudo chmod -R 770 /var/moodledata

# 4. パーミッション設定
sudo chown -R www-data:www-data /var/www/moodle
sudo chmod -R 755 /var/www/moodle

# 5. PHP設定
sudo nano /etc/php/7.4/fpm/php.ini
  # 以下を編集：
  # upload_max_filesize = 500M
  # post_max_size = 500M
  # memory_limit = 512M
  # max_execution_time = 300
```

#### **ステップ3: Webサーバー設定**

```bash
# Apache仮想ホスト設定
sudo nano /etc/apache2/sites-available/moodle.conf
```

```apache
<VirtualHost *:80>
  ServerName moodle.yourdomain.com
  ServerAlias www.moodle.yourdomain.com
  
  DocumentRoot /var/www/moodle/moodle
  
  <Directory /var/www/moodle/moodle>
    Options -Indexes FollowSymLinks
    AllowOverride All
    Require all granted
  </Directory>
  
  # ログ設定
  ErrorLog ${APACHE_LOG_DIR}/moodle-error.log
  CustomLog ${APACHE_LOG_DIR}/moodle-access.log combined
  
  # HTTPS自動リダイレクト（外部 Let's Encrypt など）
  # RewriteEngine On
  # RewriteCond %{HTTPS} off
  # RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</VirtualHost>
```

```bash
# 設定有効化
sudo a2ensite moodle.conf
sudo systemctl restart apache2
```

#### **ステップ4: Moodleインストール実行**

ブラウザで以下にアクセス：
```
http://moodle.yourdomain.com/install.php
```

**インストール画面の設定**:
1. **言語選択**: 日本語（がある場合） or English
2. **データベース設定**
   - データベースドライバ: MySQL
   - ホスト: localhost
   - ユーザー: moodleuser
   - パスワード: SECURE_PASSWORD_HERE
   - データベース: moodle
3. **データディレクトリ**: /var/moodledata
4. **管理者アカウント作成**
   - ユーザー名: admin
   - 新しいパスワード: STRONG_PASSWORD
   - メールアドレス: admin@yourdomain.com

インストール完了後、ダッシュボードが表示されます。

---

### オプション B: Moodle Cloudホスティング（推奨しない、利便性重視の場合）

Moodleが公式提供するマネージドクラウド（自動バックアップ、スケーラビリティ優先）

- **URL**: https://moodlecloud.com
- **料金**: $50/月～（100名まで）
- **セットアップ**: 数分で完了（詳細設定は限定）
- **デメリット**: カスタマイズ性が低い

---

## 1.2 初期設定

### 1.2.1 言語・タイムゾーン・メール設定

**ダッシュボードにログイン後**:

1. **管理画面へ移動**: 左上のメニュー → 「サイト管理」

2. **言語設定**
   ```
   サイト管理 → 言語 → 言語カスタマイズ
   ```
   - システム言語: 日本語
   - ユーザー言語切り替え: 有効

3. **タイムゾーン設定**
   ```
   サイト管理 → 位置情報 → タイムゾーン
   ```
   - デフォルトタイムゾーン: Asia/Tokyo

4. **メール設定**
   ```
   サイト管理 → サーバー → メール → メール設定
   ```
   - メールプロトコル: SMTP
   - SMTPHOST: mail.yourdomain.com（または smtp.gmail.com）
   - SMTPport: 587
   - SMTPユーザー: noreply@yourdomain.com
   - SMTPパスワード: ▲▲▲▲
   - メールエンコーディング: UTF-8
   
   **テスト送信**:
   ```
   サイト管理 → メンテナンス → メール → テストメール送信
   ```
   管理者メールアドレスに確認メールが届くか確認

---

### 1.2.2 ユーザー管理・ロール設定

#### **ユーザー作成方法：3パターン**

**パターン1: 手動入力（少数の場合）**
```
サイト管理 → ユーザー → ユーザーの追加
```

| 項目 | 値 | 説明 |
|------|-----|------|
| ユーザー名 | student001 | 英数字、アンダースコア、ドット可 |
| パスワード | Auto Gen | Moodle自動生成（ユーザーが変更） |
| 名前 | 佐藤 太郎 | 日本語対応 |
| メール | satoh.taro@... | 本人確認・パスワード送信用 |
| 国 | Japan | ユーザー登録画面のロケール |

**パターン2: CSVインポート（推奨、50名以上）**

```bash
# userlist.csv を作成
username,password,firstname,lastname,email,course1,enrolment1,course2,enrolment2
student001,AUTOGEN,佐藤,太郎,satoh.taro@company.com,Module1,student,Module2,student
student002,AUTOGEN,山田,花子,yamada.hanako@company.com,Module1,student,Module2,student
```

アップロード箇所:
```
サイト管理 → ユーザー → アカウント → ユーザーのアップロード
```

**パターン3: LDAP/Active Directory連携（推奨、企業内ディレクトリある場合）**

```
サイト管理 → プラグイン → 認証 → LDAP サーバー
```

- LDAP サーバーホスト: ldap.yourdomain.com
- LDAP ポート: 389 (SSL: 636)
- LDAP ベース DN: ou=Users,dc=yourdomain,dc=com
- LDAP ユーザーオブジェクトクラス: person

---

#### **ロール設定（権限管理）**

| ロール | 権限レベル | 用途 | 主な操作 |
|--------|----------|------|--------|
| **Administrator（管理者）** | 最高 | システム統括 | ユーザー管理、サイト設定、All |
| **Manager（マネージャー）** | 高 | 組織管理 | カテゴリ管理、複数コース管理 |
| **Course Creator（コース作成者）** | 中高 | コース管理 | コース作成・編集 |
| **Teacher（講師）** | 中 | コース運営 | 動画アップロード、テスト採点、成績管理 |
| **Student（学習者）** | 低 | 学習 | 動画視聴、テスト受験、提出物作成 |
| **Guest（ゲスト）** | 最低 | 試験閲覧 | 公開コースの閲覧のみ |

**ロール割当て**:
```
サイト管理 → 権限 → ロールの定義と権限の割当
```

**推奨:**
- 研修プログラム管理者 1名 → Administrator
- 講師・運営チーム 2-3名 → Manager or Teacher
- 学習者（保険代理店スタッフ） → Student

---

## 1.3 コース構成設定

### 1.3.1 コースカテゴリ作成

```
サイト管理 → コース → カテゴリの管理
```

**階層構造**:
```
保険代理店DX研修プログラム（メインカテゴリ）
├── Module 1: BCP基礎
├── Module 2: 政府様式・策定ガイド
├── Module 3: CSR基礎
├── Module 4: CSV実践
└── Module 5: サイバーセキュリティ基礎
```

---

### 1.3.2 Module別コース作成

**一般設定**:

```
サイト管理 → コース → 新しいコースを追加
```

#### **Module 1: BCP基礎**

| 項目 | 値 |
|------|-----|
| コース名 | Module 1: BCP基礎 |
| 短い名前 | BCP基礎 |
| コース ID | BCP-001 |
| コース概要 | BCP（事業継続計画）の基本概念、リスク評価手法、業務フロー分析を習得します。全6本の動画（約140分） |
| コース時間 | 150分（動画視聴 + ワークシート） |
| カテゴリ | 保険代理店DX研修プログラム > Module 1: BCP基礎 |
| 開始日 | 2026-03-01 |
| 終了日 | 2026-12-31 |
| コースフォーマット | **トピック形式**（セクション機能） |

**トピック形式の構造**:
```
Module 1: BCP基礎
├─ Section 0: コース概要＆ガイダンス
├─ Section 1: 1-1. BCP って何？（基礎用語解説）
├─ Section 2: 1-2. なぜ BCP が必要か
├─ Section 3: 1-3. BCP と事業継続力強化計画の違い
├─ Section 4: 1-4. リスク評価手法①（SWOT分析）
├─ Section 5: 1-5. リスク評価手法②（ハザード分析）
└─ Section 6: 1-6. 業務フロー分析と優先度付け
```

**追加設定**:
```
コース管理 → 設定 → コース設定
```

- コースの開始日: 2026-03-01
- 進捗追跡の有効化: ✅ 有効
- 修了課題の有効化: ✅ 有効
- グループモード: グループなし（全員で学習）
- 強制ログイン: ✅ 有効（ゲストを許可しない）

---

### 1.3.3 動画ファイル埋め込み

#### **推奨形式**
```
動画形式: MP4 (H.264, 1920×1080, 30fps)
ビットレート: 5-8 Mbps（ストリーミング最適）
音声: AAC 128kbps（モノラル or ステレオ）
ファイルサイズ: 10分 ≈ 100～150MB
```

#### **方法 A: Moodle内蔵メディアプレイヤー**

**動画ファイルアップロード**:

1. コース画面で「編集を有効にする」をクリック
2. 該当セクション（例: 1-1）の「コンテンツを追加」 → 「ビデオ」を選択
3. 動画ファイル選択 → 「 アップロード」
4. 動画タイトル: 「1-1. BCP って何？（7分）」
5. 説明（オプション）: 学習目標・キーポイント記載
6. 「保存」

**Moodle内蔵プレイヤーの機能**:
- 再生速度調整（0.75x, 1x, 1.25x, 1.5x）
- 字幕表示（SRT形式アップロード可）
- 再生位置記憶（離脱時の続きから再开始）

#### **方法 B: 外部プラットフォーム埋め込み（推奨、帯域幅節約）**

**YouTube埋め込み**:
```
コンテンツ追加 → URL を埋め込む → YouTube URL 貼り付け
```

例：`https://www.youtube.com/watch?v=dQw4w9WgXcQ`

**メリット**:
- YouTube サーバーから配信（帯域幅コスト削減）
- 自動字幕生成、コメント機能
- YouTube Analytics で視聴統計確認可能

**デメリット**:
- YouTube 公開/限定公開が必須
- オフライン視聴不可
- 学習管理（中断位置保存等）は限定的

**Vimeo埋め込み**（プロフェッショナル向け）:
```
コンテンツ追加 → URL を埋め込む → Vimeo URL 貼り付け
```

- 学習者にはビデオを非表示にできる
- 詳細な視聴統計（再生位置、巻き戻し箇所等）
- Moodle とのシームレス連携

---

### 1.3.4 ワークシート配布（PDF/Word）

#### **PDF埋め込み方法**

```
コンテンツ追加 → ファイル
```

1. ファイル選択: `Module1-1-worksheet.pdf`
2. タイトル: 「ワークシート：1-1. BCP って何？」
3. 説明: 「動画視聴後、このワークシートを記入してください。提出期限: 2026-03-08」
4. 「保存」

**学習者側**: ファイルクリック → ブラウザで PDF 表示 → 印刷 or デジタル記入

#### **Wordファイル配布方法**

```
コンテンツ追加 → ファイル
```

DOCX ファイルを直接アップロード。
学習者は PC でダウンロード → Word で編集 → 提出。

#### **より高度な方法: Moodle課題機能**

```
コンテンツ追加 → 課題
```

| 設定項目 | 値 | 説明 |
|---------|-----|------|
| 課題名 | ワークシート：1-1 BCP基礎 | - |
| 説明 | 以下のワークシートの問1-5を記入し、提出してください。 | - |
| ファイル提出許可 | ✅ 有効 | Word / PDF で提出可能 |
| 提出期限 | 2026-03-08 | - |
| 提出ファイル数上限 | 1ファイル | 誤字修正等での再提出を許可 |
| 採点方法 | 手動採点 | 講師が評価（10点満点） |

**学習者チェックリスト**:
```
☐ 動画視聴（1-1）完了
☐ ワークシート記入完了
☐ ファイル提出完了
☐ 採点結果確認（〇日以内）
```

---

### 1.3.5 確認テスト・最終試験の自動採点設定

#### **確認テスト（Module内テスト、各回 5-10問）**

```
コンテンツ追加 → テスト
```

**テスト作成手順**:

1. **基本設定**
   | 項目 | 値 |
   |------|-----|
   | テスト名 | 確認テスト：1-1 BCP基礎 |
   | 説明 | 動画視聴後、理解度を測定します。制限時間: 10分 |
   | 時間制限 | ✅ 有効 / 10分 |
   | 実施回数 | 3回（復習用） |
   | 採点方法 | 第1回目の得点を記録 |
   | 不可解な動作 | テスト開始後は戻る不可 |

2. **問題追加**

   **Q1: 選択問題（1点）**
   ```
   BCP の基本的な役割として、最も適切なものはどれか？
   
   - A) 企業の売上を増加させるための計画
   - B) 予測不可能な災害やトラブル発生時に、事業を素早く復旧し被害を最小化する計画 ✅ 正答
   - C) 社員の研修やスキル向上を目的とした計画
   - D) 企業の組織構造を変更するための計画
   ```

   **Q2: 短答問題（2点）**
   ```
   防災計画と BCP の主な違いを、30～50字で説明してください。
   
   自動採点: 正規表現マッチング
   キーワード: "防災|予防|災害を予防", "BCP|事業継続|事業復旧"
   両キーワード含む = ✅ 正答 (2点)
   片方のみ = ⚠️ 部分正答 (1点)
   ```

   **Q3: マッチング問題（2点）**
   ```
   左側の用語と右側の説明をマッチングしてください。
   
   BCP          → 予測不可能な事態時の事業継続計画
   防災計画      → 災害の予防・軽減
   BCM          → 事業継続のマネジメント体系
   ```

3. **採点表示**
   - 即座に採点結果を表示: ✅ 有効
   - 正解を表示: 試験終了後
   - 説明を表示: 試験終了後

---

#### **最終試験（全Module 70% 以上で修了認定）**

```
コンテンツ追加 → テスト
```

**最終試験設定**:

| 項目 | 値 |
|------|-----|
| テスト名 | 最終試験：保険代理店DX研修 |
| 説明 | Module 1-5から出題。70点以上で修了認定。 |
| 設問数 | 50問（Module別に各10問） |
| 時間制限 | ✅ 有効 / 90分 |
| 実施回数 | 1回（本試験） |
| 採点基準 | 70点以上で合格 |
| パスマーク | 70 |

**出題構成**:
```
Module 1: BCP基礎（10問）
Module 2: 政府様式・策定ガイド（10問）
Module 3: CSR基礎（10問）
Module 4: CSV実践（10問）
Module 5: サイバーセキュリティ基礎（10問）
```

**テスト受験フロー**:
```
学習者
  ↓
Module 1-5 すべて視聴 ✅
  ↓
確認テスト 実施（3回可） ✅
  ↓
最終試験 受験可能に ッジ開始
  ↓
試験実施（90分制限）
  ↓
自動採点
  ↓
70点以上 → 修了認定 → 修了証発行
70点未満 → 不合格通知 → 再受験推奨（7日後に再受験可）
```

---

## 1.4 学習パス・進捗管理

### 1.4.1 順序制御（前提条件）

**Module 1 完了まで Module 2 へ進めない設定**:

```
コース管理 → 完了トラッキング
```

1. **Module 1に対して**:
   - 完了トラッキング: ✅ 有効
   - 活動の完了条件: 「確認テスト: 1-1」の採点が必須

2. **Module 2に対して**:
   - 前提条件を設定: ✅ Module 1 コースの完了
   - 制限メッセージ: 「Module 1 を完了してください。」

3. **同様に設定**:
   ```
   Module 2 → Module 3
   Module 3 → Module 4
   Module 4 → Module 5
   ```

**学習者画面での見え方**:
```
Module 1: BCP基礎 ✅ 完了可能
Module 2: 政府様式・策定ガイド 🔒 ロック（Module 1 完了後に開放）
Module 3: CSR基礎 🔒 ロック
Module 4: CSV実践 🔒 ロック
Module 5: サイバーセキュリティ基礎 🔒 ロック
```

---

### 1.4.2 進捗バー表示

```
コース管理 → コース設定 → 進捗追跡
```

**進捗トラッキング設定**:
- テーマ: Default（進捗バーが表示されるものを選択）
- 進捗の計算方法: 活動の完了による自動計算
- ダッシュボード表示: ✅ 学習者の全体進捗を％で表示

**進捗計算の仕組み**:
```
総完了活動数 / 設定した活動数 = 進捗率

例：Module 1 の場合
- 6本の動画視聴 = 6
- 6個のワークシート提出 = 6
- 確認テスト 6個 = 6
→ 18個/18個 完了時点で 100%
```

**学習者ダッシュボード表示**:
```
┌─────────────────────────────────┐
│ Module 1: BCP基礎                │
│ 進捗: ████████░░ 75%             │
│ 完了: 15/20                       │
│ 次のステップ: ワークシート 1-4   │
└─────────────────────────────────┘
```

---

### 1.4.3 修了条件設定

**A方式: Module 別修了**

```
コース管理 → 完了トラッキング → 修了条件
```

| 条件 | 設定値 |
|------|--------|
| すべての視聴活動を完了 | ✅ 6本の動画 |
| すべてのワークシートを提出 | ✅ 6個 |
| 確認テスト平均スコア | ✅ 60%以上 |

**修了判定式**: AND（全て満たす必要）
```
(動画6本完了) AND (ワークシート6個提出) AND (確認テスト平均≥60%)
```

**B方式: 全体プログラム修了**

プログラム全体のメタコース を作成：

```
新規コース: 「保険代理店DX研修プログラム（全体）」
├─ コース完了条件：以下をすべて満たす
│  ├─ Module 1 コース完了
│  ├─ Module 2 コース完了
│  ├─ Module 3 コース完了
│  ├─ Module 4 コース完了
│  ├─ Module 5 コース完了
│  └─ 最終試験 70点以上
```

このメタコース の完了をもって、全プログラム修了認定。

---

## 1.5 修了証・バッジ自動発行（Moodle）

### 1.5.1 デジタル修了証（PDF + デジタル署名）

Moodle標準機能の「証明書」を使用。

```
コース管理 → その他 → 証明書
```

#### **証明書テンプレート作成**

```
証明書の追加
```

| 項目 | 値 |
|------|-----|
| 証明書名 | BCP基礎 修了証 |
| テンプレート | カスタムPDF |
| 有効化 | ✅ 有効 |

**テンプレートHTML（オプション）**:
```html
<html>
<head>
  <style>
    body { font-family: 'Yu Gothic', sans-serif; }
    .certificate { 
      border: 10px solid #1a5490;
      padding: 40px;
      text-align: center;
      width: 850px; height: 600px;
    }
    h1 { font-size: 48px; color: #1a5490; }
    .student { font-size: 32px; font-weight: bold; }
    .date { font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <div class="certificate">
    <h1>修了証</h1>
    <p>以下の者が</p>
    <h2 class="student">%%FULLNAME%%</h2>
    <p>保険代理店向けDX研修プログラム Module 1: BCP基礎</p>
    <p>を修了したことを証明する。</p>
    <p class="date">発行日: %%DATE%%</p>
    <p>発行機関: 保険代理店DX研修センター</p>
  </div>
</body>
</html>
```

**署名フィールド**:
- 受取人: 学習者
- 発行者署名: デジタル署名追加（X.509証明書）
- 有効期限: （オプション）発行日から1年

#### **修了証発行トリガー**

```
コース設定 → グレード → 修了条件
```

修了条件を満たしたユーザーに自動メール送信：

```
メール設定 → 証明書メール通知
```

- 宛先: 学習者メールアドレス
- タイトル: 「Module 1: BCP基礎 修了証」
- 本文: 修了証PDF（自動添付）

---

### 1.5.2 スキルバッジ（LinkedIn等への共有）

Moodleの「バッジ」機能を使用。

```
サイト管理 → バッジ → バッジの管理
```

#### **バッジ作成**

| 項目 | 値 |
|------|-----|
| バッジ名 | BCP基礎マスター |
| 説明 | BCP（事業継続計画）の基本概念、リスク評価手法を習得した者に授与 |
| ロゴ画像 | (256×256px PNG) |
| 発行基準 | Module 1 コース 完了 + 確認テスト 80% 以上 |
| 有効期限 | 3年 |
| バッジクラス | Open Badges v2.0 |

**複数バッジ構成** (全モジュール):

```
1️⃣ BCP基礎マスター (Module 1)
2️⃣ 政府様式エキスパート (Module 2)
3️⃣ CSR戦略家 (Module 3)
4️⃣ CSV実装者 (Module 4)
5️⃣ サイバーセキュリティスペシャリスト (Module 5)
⭐ DX人材育成認定者 (全Module + 最終試験 70%+)
```

#### **バッジの共有**

学習者がバッジ取得後：

1. **Moodle プロフィールに表示**
   - 学習者プロフィール → バッジ セクション

2. **LinkedIn に共有** (Open Badges対応)
   ```
   マイバッジ → [バッジ] → 共有 → LinkedIn
   ```
   認証トークン自動生成され、LinkedIn のバッジ欄に表示

3. **デジタルウォレット保存**
   - Mozilla Backpack
   - Credential Wallet

---

### 1.5.3 修了データ CSV 出力（政府申請用）

```
レポート → コース参加者 → エクスポート
```

#### **CSV フォーマット**

```csv
username,fullname,email,status,completion_date,final_score,modules_completed
student001,佐藤 太郎,satoh.taro@company.com,修了,2026-04-15,82,5/5
student002,山田 花子,yamada.hanako@company.com,修了,2026-04-20,76,5/5
student003,鈴木 次郎,suzuki.jiro@company.com,進行中,未完了,58,3/5
```

**厚生労働省「人材開発支援助成金」申請用データ**:

```
助成金申請に必要な情報：
- 訓練対象者氏名
- 訓練開始日 / 修了日
- 訓練時間（合計）
- 訓練内容
- 訓練修了判定（合格/不合格）
```

**カスタムレポート**:

```
サイト管理 → レポート → カスタムレポートビルダー
```

以下のカラムを抽出：

```
SELECT 
  u.firstname || ' ' || u.lastname as student_name,
  u.email,
  cc.timecompleted,
  (SELECT AVG(g.finalgrade) FROM mdl_grade_grades g 
   WHERE g.userid = u.id AND g.itemtype = 'test') as average_score,
  CASE WHEN cc.timecompleted IS NOT NULL 
       THEN '修了' 
       ELSE '進行中' 
  END as status
FROM mdl_user u
JOIN mdl_course_completions cc ON u.id = cc.userid
WHERE cc.course IN (SELECT id FROM mdl_course WHERE shortname LIKE 'Module%')
ORDER BY u.id;
```

出力 → CSV ダウンロード → 政府申請システムに載せ替え

---

## 1.6 レポート・分析（Moodle）

### 1.6.1 学習時間追跡

```
レポート → コース参加者 → 活動レポート
```

**表示内容**:

| ユーザー | 初回アクセス | 最終アクセス | 視聴時間 | テスト実施 | ステータス |
|---------|------------|-----------|---------|----------|-----------|
| 佐藤太郎 | 03/01 10:30 | 04/15 15:45 | 7h28m | 6回 | 修了 ✅ |
| 山田花子 | 03/02 09:15 | 04/20 14:20 | 6h52m | 5回 | 修了 ✅ |
| 鈴木次郎 | 03/05 11:00 | 04/10 16:30 | 3h15m | 2回 | 進行中 |

**グローバル見方**:

```
レポート → サイトレポート → ユーザーアクティビティ
```

全ユーザー、全コースの時系列グラフ表示：
- X軸: 日付（03/01 ~ 04/30）
- Y軸: アクティブユーザー数
- 折れ線グラフ: ログイン数の推移

---

### 1.6.2 テスト成績レポート

```
レポート → テスト統計
```

**出力表**:

| 問題 | 正解率 | 平均スコア | 最高スコア | 区別度* |
|------|--------|----------|----------|--------|
| Q1: BCP定義 | 94% | 9.4/10 | 10/10 | 0.85 |
| Q2: 防災との違い | 78% | 7.8/10 | 10/10 | 0.72 |
| Q3: マッチング | 65% | 6.5/10 | 10/10 | 0.58 |
| **平均** | **79%** | **7.9/10** | **10/10** | - |

*区別度: 上位群と下位群でどの程度正解率が異なるか（0.0-1.0）
- 0.7以上: 良い問題
- 0.3-0.7: 中程度
- 0.3以下: 問題あり（出題の見直し推奨）

**改善提案**:
- Q3 の区別度が低い → 設問文が不明確な可能性
- 出題見直し、選択肢の整理を推奨

---

### 1.6.3 離脱率・修了率分析

```
レポート → コース参加者 → コース修了レポート
```

**修了率ダッシュボード**:

```
Module 1: BCP基礎
┌──────────────────────────────┐
│ 登録者数: 50名               │
│ 修了者数: 42名               │
│ 修了率: 84%                  │
│ 中途退出: 8名 (16%)          │
│ 平均学習時間: 7時間32分      │
│ 平均スコア: 78点             │
└──────────────────────────────┘
```

**離脱ポイント分析**:

```
Module 1（修了率 84%）
  ↓
Module 2（修了率 79%）ー 5% 離脱
  ↓
Module 3（修了率 75%）ー 4% 離脱
  ↓
Module 4（修了率 68%）ー 7% 離脱 ⚠️
  ↓
Module 5（修了率 62%）ー 6% 離脱
```

**Module 4 の高離脱率への対策**:
- 動画長を確認（長すぎないか？）
- ワークシート難易度を確認
- 学習者フィードバック収集
- 追加資料配布

---

# Part 2: Canvas セットアップ＆コース構築

## 2.1 Canvas 概要

Canvas は Instructure 社が提供するSaaS型 LMS。
自動スケーリング、充実した日本語サポート、シンプルな UI が特徴。

### 契約・ライセンス取得

#### **プラン選択**

| プラン | 規模 | 料金 | 機能 |
|--------|------|------|------|
| **Essentials** | 50～300名 | $50/月 | 基本機能（コース、テスト、成績） |
| **Professional** | 300～3,000名 | $150/月 | + 高度な分析、API、統合 |
| **Enterprise** | 3,000名+ | カスタム | + カスタマイズ、SLA保証 |

**推奨**: 保険代理店スタッフ 100～200名 → **Professional** ($150/月 ≈ $1,800/年)

#### **申し込みフロー**

1. **Canvas 公式ページへアクセス**
   ```
   https://www.canvaslearning.com
   ```

2. **「無料トライアル」or「お問い合わせ」をクリック**

3. **組織情報入力**
   - 組織名: 保険代理店DX研修センター
   - メールアドレス: admin@yourdomain.com
   - ユーザー数: 150名
   - 用途: 従業員研修

4. **Instruct Japan（推奨）に確認**
   - Instructure Japan: https://www.instructure.co.jp
   - 契約内容交渉可能（大人数割引等）

5. **契約書署名 → ライセンス割り当て → サブドメイン提供**
   ```
   youracademy.instructure.com
   ```

---

## 2.2 Canvas 初期設定

### 2.2.1 サイト設定

Canvas にログイン後、管理画面へ：

**管理** → **設定**

| 設定項目 | 値 |
|---------|-----|
| アカウント名 | 保険代理店DX研修プログラム |
| タイムゾーン | Asia/Tokyo（日本時間） |
| 言語 | 日本語 |
| ロゴ | (組織ロゴ画像) |

### 2.2.2 メール設定

**管理** → **Email Configuration**

```
SMTP Host: smtp.yourdomain.com (or smtp.gmail.com)
SMTP Port: 587
Username: noreply@yourdomain.com
Password: ▲▲▲▲
From Address: noreply@yourdomain.com
```

テスト送信: 管理者メールに確認メール送信 → SUCCESS

---

### 2.2.3 ユーザー管理・ロール設定

#### **ユーザー追加方法**

**管理** → **ユーザー** → **+ ユーザーを追加**

| ユーザータイプ | ロール | 権限 |
|-------------|--------|------|
| **Admin** | 管理者 | 最高権限 |
| **Teacher** | 講師 | コース作成・管理・採点 |
| **StudentEnrollment** | 学習者 | コース受講・テスト受験 |

**推奨配置**:
- Admin: 1名（プログラム総合責任者）
- Teacher: 2-3名（講師・運営チーム）
- StudentEnrollment: 150名（保険代理店スタッフ）

#### **CSV一括インポート**

```
管理 → アカウント管理 → ユーザーのインポート
```

user_import.csv:
```csv
user_id,login_id,name,email,status
1001,student001,佐藤 太郎,satoh.taro@company.com,active
1002,student002,山田 花子,yamada.hanako@company.com,active
1003,student003,鈴木 次郎,suzuki.jiro@company.com,active
```

---

## 2.3 Canvas コース構成設定

### 2.3.1 コース作成

**管理** → **コース** → **+ 新しいコース**

#### **Module 1: BCP基礎**

| 項目 | 値 |
|------|-----|
| コース名 | Module 1: BCP基礎 |
| コースコード | BCP-001 |
| 開始日 | 2026-03-01 |
| 終了日 | 2026-12-31 |

### 2.3.2 コンテンツ構成（Modules機能）

Canvas の「Modules」機能で、教材を階層化：

```
Module 1: BCP基礎
├─ モジュール 0: コース概要＆ガイダンス
├─ モジュール 1: 1-1. BCP って何？
├─ モジュール 2: 1-2. なぜ BCP が必要か
├─ モジュール 3: 1-3. BCP と事業継続力強化計画の違い
├─ モジュール 4: 1-4. リスク評価手法①
├─ モジュール 5: 1-5. リスク評価手法②
└─ モジュール 6: 1-6. 業務フロー分析と優先度付け
```

### 2.3.3 動画埋め込み（YouTube / Vimeo / Canvas ファイルストレージ）

#### **方法A: Canvas ファイルストレージ（推奨、シンプル）**

```
コース → ファイル → ファイルアップロード
```

MP4 ファイル直接アップロード:
```
1-1_BCP_Basics.mp4 [150 MB]
```

モジュール内で「ファイル」として追加：

```
モジュール追加 → アイテムを追加 → ファイル
```

Canvas内蔵プレイヤーで再生。

#### **方法B: YouTube 埋め込み（推奨、帯域幅節約）**

```
モジュール追加 → アイテムを追加 → URL
```

YouTube リンク：
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

Canvas 内で再生プレビュー機能あり。

#### **方法C: Vimeo 統合（プロフェッショナル向け）**

Canvas は Vimeo ネイティブ連携対応：

```
管理 → 外部アプリ → Vimeo を検索・追加
```

設定後：
```
モジュール追加 → アイテムを追加 → Vimeo ビデオを検索
```

---

### 2.3.4 ワークシート配布＆提出

#### **方法A: ファイル配布**

```
モジュール追加 → アイテムを追加 → ファイル
```

```
キーファイル: 1-1_Worksheet.pdf
```

学習者はダウンロード → 印刷 or デジタル編集

#### **方法B: 課題機能（推奨、提出・採点が統合）**

```
コース → 課題 → + 課題を作成
```

| 項目 | 値 |
|------|-----|
| タイトル | ワークシート 1-1: BCP基礎 |
| 説明 | 以下のワークシートを記入し、PDF で提出してください |
| ファイルアップロード許可 | ✅ 有効 |
| 提出期限 | 2026-03-08 |
| 配点 | 10点 |
| ルーブリック | (採点基準を設定) |

**ルーブリック例** (4段階):
```
• Excellent (9-10点): 5問全て正答、記述が明確
• Good (7-8点): 4問正答、記述に不明確な部分あり
• Adequate (5-6点): 3問正答、または記述が不十分
• Needs Improvement (0-4点): 3問以下正答
```

---

### 2.3.5 確認テスト・最終試験

```
コース → クイズ → + クイズを作成
```

#### **確認テスト設定（Module 1-1 用）**

| 項目 | 値 |
|------|-----|
| クイズ名 | 確認テスト: 1-1 BCP基礎 |
| 説明 | 動画視聴後の理解度確認 |
| 出題数 | 5問 |
| 制限時間 | 10分 |
| 実施可能回数 | 3回 |
| 採点方法 | 最高得点を記録 |

**問題追加**:

```
+ 問題を追加

【Q1: 選択問題】1点
BCP の基本的な役割として、最も適切なものはどれか？
- A) 企業の売上増加計画
- B) 予測不可能な災害時に、事業復旧と被害最小化を目指す計画 [正答]
- C) 従業員研修計画
- D) 組織構造変更計画
```

Canvas では詳細な問題タイプをサポート：
- 択一問題（MCQ）
- 複数選択問題
- 短答問題（正規表現マッチング可）
- エッセイ問題（手動採点）
- マッチング問題

---

#### **最終試験設定**

```
コース → クイズ → + クイズを作成
```

| 項目 | 値 |
|------|-----|
| クイズ名 | 最終試験：保険代理店DX研修 |
| 説明 | Module 1-5 全体の修了テスト。70点以上で修了認定。 |
| 出題数 | 50問（Module別 10問×5） |
| 制限時間 | 90分 |
| パスマーク | 70点 |
| 公開設定 | Module 1-5 全コース完了後のみ実施可能 |

---

## 2.4 Canvas 学習パス・進捗管理

### 2.4.1 前提条件・順序制御

Canvas Modules で「前提条件」を設定：

```
Module 1: BCP基礎
  ├─ [必須] モジュール 0: コース概要
  ├─ [次に進む] モジュール 1: 1-1 BCP って何？
  │  └─ [必須完了条件] ビデオ再生 + 確認テスト実施
  ├─ [次に進む] モジュール 2: 1-2 なぜ BCP が必要か
  │  └─ [前提] モジュール 1 完了
  ...
```

**設定手順**:

```
モジュール編集 → 前提条件を追加
```

```
「モジュール 2 は モジュール 1 を完了した後にのみアクセス可能」
```

学習者には以下のように表示：
```
✅ モジュール 1: BCP基礎 （完了済み）
🔒 モジュール 2: 政府様式・策定ガイド （モジュール 1 を完了してください）
```

---

### 2.4.2 進捗追跡

Canvas の「Student Interaction Report」で進捗を可視化：

```
管理 → Analytics → Student Interaction Report
```

グラフ表示：
- X軸: 日付
- Y軸: コース参加者数
- ラインチャート: 日々のログイン数と課題提出数

---

## 2.5 Canvas 修了証・バッジ発行

### 2.5.1 デジタル修了証（Credly 統合）

Canvas は Credly （デジタルバッジ発行プラットフォーム）と統合：

```
管理 → 外部連携 → Credly を検索・追加
```

#### **修了証テンプレート作成（Credly）**

Credly ダッシュボードへ：

1. **バッジテンプレート作成**
   ```
   New Badge
   Name: BCP基礎 修了証
   Description: BCP（事業継続計画）の基本概念を習得
   Design: テンプレート選択（Credly提供）
     or カスタムロゴアップロード
   ```

2. **発行条件設定**
   ```
   Issuing Criteria:
   - Module 1 コース完了
   - 確認テスト平均 60% 以上
   ```

3. **Canvas との連携**
   ```
   アカウント ID と API Key テストして接続
   ```

#### **自動発行フロー**

修了条件を満たしたとき：

```
学習者が Module 1 修了
  ↓
Canvas → Credly API 呼び出し
  ↓
バッジ自動発行
  ↓
学習者メールに通知
  「BCP基礎 修了証 を取得しました」
```

---

### 2.5.2 バッジの共有

**学習者側**:

1. Credly アカウント → マイバッジ
2. [BCP基礎 修了証バッジ] → 「共有」
3. LinkedIn / Twitter / Facebook / Email いずれかを選択
4. 自動的にバッジが公開プロフィールに表示

---

### 2.5.3 修了データ CSV 出力

```
管理 → Analytics → Canvas Data Portal
```

SQL クエリで修了者リスト抽出：

```sql
SELECT 
  u.name,
  u.email,
  c.course_code,
  cc.completed_at,
  g.final_score,
  CASE WHEN cc.completed_at IS NOT NULL 
       THEN '修了' 
       ELSE '進行中' 
  END as status
FROM users u
JOIN course_memberships cm ON u.id = cm.user_id
JOIN courses c ON cm.course_id = c.id
LEFT JOIN course_completions cc ON u.id = cc.user_id 
  AND c.id = cc.course_id
LEFT JOIN grades g ON u.id = g.user_id AND c.id = g.course_id
WHERE c.course_code LIKE 'Module%'
ORDER BY u.id;
```

結果を CSV エクスポート → 政府申請用ドキュメント作成

---

## 2.6 Canvas レポート・分析

### 2.6.1 学習時間追跡

Canvas の「Course Statistics」で自動集計：

```
コース → Settings → Course Details → Course Statistics
```

表示内容：
```
Total Activity Time: 7h 32m (students)
Median Student Activity Time: 6h 15m
Students with less than 1 hour engagement: 3
```

---

### 2.6.2 テスト成績分析

```
コース → クイズ → 分析キューブを表示
```

Tableau で統計グラフ自動生成：

```
・問題別正解率 (%)
・設問難易度 (Item Difficulty)
・判別力 (discrimination index)
・平均スコア推移
```

---

### 2.6.3 離脱率・修了率分析

```
管理 → Analytics → Course Analytics
```

ダッシュボード表示：

```
┌─────────────────────────────┐
│ Course Completion Dashboard │
│ Module 1: BCP基礎         │
├─────────────────────────────┤
│ Enrollment: 50              │
│ Completion: 42 (84%)        │
│ At Risk: 5 (10%)            │
│ Not Participating: 3 (6%)   │
│ Median Score: 78%           │
└─────────────────────────────┘
```

**At Risk の学習者への自動フォロー**:

Canvas では「早期警告システム」が機能：

```
管理 → Early Warning System
```

設定例：
```
IF (ログイン 回数 < 5回 in 14日間)
  AND (提出物 < 50%)
THEN
  → 講師に通知 + 学習者にリマインダーメール自動送信
```

---

# Part 3: Kajabi セットアップ＆コース構築

## 3.1 Kajabi 概要

Kajabi は「オールインワン」プラットフォーム：
- LMS（学習管理）
- メールマーケティング
- 決済・請求管理
- ウェビナーホスティング
- CRM

### 契約・ライセンス取得

#### **プラン選択**

| プラン | 月額 | 機能 |
|--------|------|------|
| **Growth** | $119 | 基本的なコース、メール |
| **Pro** | $159 | + アドバンス分析、API |
| **Premium** | $399 | + カスタムドメイン、優先サポート |

**推奨**: 保険代理店研修（150名） → **Pro** ($159/月)

#### **申し込みフロー**

1. **Kajabi 公式サイト**
   ```
   https://www.kajabi.com
   ```

2. **「Get Started」をクリック**

3. **メール＆パスワード登録**

4. **支払い情報入力** (クレジットカード)

5. **アカウント有効化** → ダッシュボードアクセス

---

## 3.2 Kajabi 初期設定

### 3.2.1 プロフィール設定

Kajabi ダッシュボード → **Settings** → **Profile**

| 項目 | 値 |
|------|-----|
| Site Name | 保険代理店DX研修プログラム |
| Email | admin@yourdomain.com |
| Site URL | youracademy.kajabi.com |
| Custom Domain | (オプション) academy.yourdomain.com |
| Timezone | Asia/Tokyo |
| Language | 日本語（オプション） |

### 3.2.2 メール設定

**Settings** → **Email**

```
From Email: noreply@yourdomain.com
From Name: 保険代理店DX研修プログラム
SMTP: (Kajabi 自動設定、変更不要)
```

---

## 3.3 Kajabi コース構築

### 3.3.1 コース作成

**Products** → **Add Product** → **Online Course**

```
Course Name: Module 1: BCP基礎
Description: BCP の基本概念、リスク評価手法、
             業務フロー分析を習得します。全6本の動画（約140分）
Course Code: BCP-001
Price: Free (企業研修のため無料)
Enrollment: Closed (管理者招待のみ)
```

### 3.3.2 モジュール＆レッスン構成

Kajabi では階層が以下：
```
Course
├─ Module (セクション)
│  └─ Lesson (個別教材)
│     ├─ Video
│     ├─ Document
│     └─ Quiz
```

**Module 1: BCP基礎 の構成**:

```
Module 1: BCP基礎
├─ Module 0: コース概要＆ガイダンス
│  └─ Lesson: イントロダクションビデオ (2分)
├─ Module 1: 1-1. BCP って何？
│  ├─ Lesson: ビデオ講義 (7分)
│  ├─ Lesson: ワークシート (PDF)
│  └─ Lesson: 確認テスト (5問)
├─ Module 2: 1-2. なぜ BCP が必要か
│  ├─ Lesson: ビデオ講義 (10分)
│  ├─ Lesson: ワークシート
│  └─ Lesson: 確認テスト等
```

**モジュール追加手順**:

```
コース編集 → + Module を追加
Module 名: 1-1. BCP って何？
Module 説明: (オプション)
Lesson 追加: ビデオ、ドキュメント、クイズを追加
```

---

### 3.3.3 動画埋め込み

#### **方法A: Kajabi ファイルアップロード**

```
モジュール → レッスン → Video を追加
```

MP4 ファイル選択 → アップロード

```
Video Title: 1-1. BCP って何？
Duration: 7分
Thumbnail: (自動生成 or カスタム画像)
```

#### **方法B: YouTube または Vimeo 埋め込み**

```
モジュール → レッスン → Video を追加
```

**YouTube 選択**:
```
YouTube URL: https://www.youtube.com/watch?v=xxx
```

Kajabi が自動埋め込み。

---

### 3.3.4 ワークシート配布

#### **方法A: PDF ドキュメント配布**

```
モジュール → レッスン → Document を追加
```

PDF ファイル: `Module1-1-Worksheet.pdf`

学習者はダウンロード可能。

#### **方法B: Google Forms (オプション、オンライン記入)**

Google Forms にワークシートを作成：

```
https://forms.gle/xxxxx
```

Kajabi レッスンに埋め込み（URL貼り付け）。

学習者は Google Forms で直接記入 → 自動集計 (スプレッドシート)

---

### 3.3.5 確認テスト・最終試験

```
モジュール → レッスン → Quiz を追加
```

#### **確認テスト作成**

| 項目 | 値 |
|------|-----|
| Quiz 名 | 確認テスト: 1-1 BCP基礎 |
| 説明 | 動画視聴後の理解度テスト |
| 問題数 | 5問 |
| Time Limit | 10分 |
| Pass Score | 60% |

**問題追加**:

```
+ Add Question

Question Type: Multiple Choice
Question: BCP の基本的な役割として...

Option A) 企業の売上増加
Option B) 予測不可能な災害時...  [✓ Correct]
Option C) 従業員研修
Option D) 組織変更
```

---

## 3.4 Kajabi 学習パス・進捗管理

### 3.4.1 前提条件・順序制御

Kajabi では「Prerequisites」で次のモジュールへの進行制御：

```
Module 2: 政府様式・策定ガイド
Prerequisites: ☑ Module 1: BCP基礎 を完了
```

設定:

```
Course Settings → Course Flow
Module 1 → Mark as Required
Module 2 → Prerequisites: Module 1 必須
Module 3 → Prerequisites: Module 2 必須
```

学習者画面：
```
✅ Module 1 完了 (unlock Module 2)
🔒 Module 2 (Module 1 完了待ち)
🔒 Module 3
```

---

### 3.4.2 進捗表示

Kajabi は学習者の進捗を自動表示：

```
学習者ダッシュボード
├─ My Courses
│  └─ Module 1: BCP基礎
│     Progress Bar: ████░░░░░░ 40%
│     Next: Lesson 1-2 (ワークシート)
```

---

## 3.5 Kajabi 修了証・バッジ自動発行

### 3.5.1 修了証テンプレート

**Settings** → **Certificates**

```
+ Add Certificate Template

Certificate Name: BCP基礎 修了証
Template Design: Kajabi テンプレート選択
  or PDFをアップロード
```

**修了証に含める情報**:
- 学習者名: {{user.name}}
- 修了日: {{completion.date}}
- コース名: Module 1: BCP基礎
- スコア: {{quiz.score}}
- 発行機関: 保険代理店DX研修センター
- デジタル署名: (Kajabi自動生成)

### 3.5.2 修了証の自動発行

```
Course → Completion
```

修了条件設定：

```
Completion Criteria:
☑ All modules completed
☑ Final quiz passed (70+ points)

On Completion:
☑ Issue certificate automatically
☑ Send completion email
```

学習者が条件を満たすと：
```
1. PDF修了証自動生成
2. ユーザーダッシュボードにダウンロードリンク表示
3. メール送信（修了証PDF添付）
```

### 3.5.3 デジタルバッジ（オプション）

Kajabi は Credly との連携に未対応。Badgr を使用：

```
Settings → Integration → Badgr
```

連携後、修了時に Badgr バッジ自動発行。

---

## 3.6 Kajabi レポート・分析

### 3.6.1 学習時間・参加度分析

**Analytics** → **Students**

表示：

```
Student Name | Total Time | Lessons Completed | Last Active
佐藤太郎      | 7h 32m    | 18/18（100%）     | 2026-04-15
山田花子      | 6h 52m    | 18/18（100%）     | 2026-04-20
鈴木次郎      | 3h 15m    | 10/18（56%）      | 2026-04-10
```

---

### 3.6.2 テスト成績・修了率

**Analytics** → **Progress**

グラフ表示：

```
・Module 別修了率（棒グラフ）
  Module 1: 84%
  Module 2: 79%
  Module 3: 75%
  Module 4: 68%
  Module 5: 62%

・テスト平均スコア（折れ線グラフ）
  確認テスト平均: 78点
  最終試験平均: 76点
```

---

### 3.6.3 修了者リスト CSV 出力

**Analytics** → **Reports → Export**

```
Export as CSV
```

ファイル: `participants_report.csv`

```csv
name,email,enrollment_date,completion_date,total_time_minutes,status
佐藤太郎,satoh.taro@company.com,2026-03-01,2026-04-15,452,completed
山田花子,yamada.hanako@company.com,2026-03-02,2026-04-20,412,completed
鈴木次郎,suzuki.jiro@company.com,2026-03-05,,195,in_progress
```

---

---

# Part 4: 3 プラットフォーム比較＆選定ガイド

## 4.1 機能比較表

| 機能 | Moodle | Canvas | Kajabi |
|------|--------|--------|--------|
| **基本機能** | | | |
| コース作成・階層化 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 動画埋め込み | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| テスト・クイズ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **学習管理** | | | |
| 進捗追跡 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 前提条件制御 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| 修了証発行 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **分析・レポート** | | | |
| 学習時間追跡 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| テスト分析 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| CSV出力 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **その他** | | | |
| API/カスタマイズ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| セキュリティ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 日本語サポート | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| UI/UX使いやすさ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 4.2 選定ガイド

### Moodle 選定: こんな場合

✅ **推奨する理由**
- カスタマイズ性最高（独自機能追加可能）
- テスト・採点機能が充実
- 低コスト（サーバーレンタル費のみ）
- オープンソース（将来の拡張性）
- 大規模運用（1,000名以上）

❌ **不向きなケース**
- IT サポート体制が不十分
- カスタマイズ開発費用がない
- サーバー管理の負担が大きい

**推奨規模**: 500名以上 / **年間コスト**: 30～50万円

---

### Canvas 選定: こんな場合

✅ **推奨する理由**
- UI/UX が直感的で使いやすい
- SaaS 型（サーバー管理不要）
- 自動スケーリング（ユーザー数拡張に強い）
- 充実した日本語サポート
- Apple / Google との統合が深い

❌ **不向きなケース**
- 独自カスタマイズが必要
- API連携が複雑
- 月額コストを抑えたい

**推奨規模**: 50～5,000名 / **年間コスト**: 70～150万円

---

### Kajabi 選定: こんな場合

✅ **推奨する理由**
- オールインワン（LMS + メール + CRM）
- セットアップが最短（数日で運用開始）
- 初心者向け（技術知識不要）
- メール自動化機能が強い
- 中小企業向け

❌ **不向きなケース**
- テスト機能が充実していない
- 大規模な学習者管理
- 複雑な分析レポート
- API 連携が限定的

**推奨規模**: 10～500名 / **年間コスト**: 150～200万円

---

## 4.3 保険代理店研修での推奨

### **最優先推奨: Canvas (SaaS型)**

**理由**:
1. ユーザー体験が優れている（学習者の満足度高）
2. 日本語サポートが充実（トラブル時の即時対応）
3. 修了率追跡・早期警告システムが自動（学習者フォロー効率化）
4. 外部ツール連携が豊富（Google Workspace等と統合可能）
5. スケーラビリティが高い（将来の拡張に対応）

**導入フロー**: 契約 → セットアップ（1-2週間） → 運用開始

---

### **第2選肢: Kajabi (オールインワン)**

**推奨する特殊ケース**:
- 修了者への営業フォローメールが必要な場合
- CRM 機能を活用したい場合
- 最初は小規模（50名）から開始したい場合

**注意**: テスト・採点機能が限定的なため、詳細な学習分析には向かない。

---

### **第3選肢: Moodle (フルカスタマイズ)**

**推奨する特殊ケース**:
- 大規模（1,000名以上）の長期的運用が確定している
- 独自の学習管理システム連携が必要
- IT 開発チームが社内にある

**課題**: 初期構築に 300～500万円、保守費用が嵩む。

---

---

# Part 5: 実装チェックリスト＆納期目安

## 5.1 Moodle 実装チェックリスト

| Step | タスク | 担当 | 完了 | 備考 |
|------|--------|------|------|------|
| 1 | Linux サーバー構築 | DevOps | ☐ | AWS EC2 or GCP Compute |
| 2 | Moodle インストール | DevOps | ☐ | PHP 7.4+ 必須 |
| 3 | 初期設定（言語、メール） | Admin | ☐ | 2時間程度 |
| 4 | ユーザーインポート | Admin | ☐ | CSV 一括処理 |
| 5 | Module 1-5 コース作成 | Course Creator | ☐ | 1 コース = 4-6時間 |
| 6 | 動画ファイルアップロード | Course Creator | ☐ | 18本 × 150MB = 2.7GB |
| 7 | テスト・問題作成 | Course Creator | ☐ | 5 Module × 6 テスト = 30個 |
| 8 | 進捗トラッキング設定 | Admin | ☐ | 完了条件の細部設定 |
| 9 | 修了証テンプレート | Course Creator | ☐ | HTML カスタム設定 |
| 10 | テストユーザーで動作確認 | QA | ☐ | 動画再生、テスト受験等 |

**合計実装時間**: 80～120時間（2.5～4週間）

---

## 5.2 Canvas 実装チェックリスト

| Step | タスク | 担当 | 完了 | 備考 |
|------|--------|------|------|------|
| 1 | Canvas 契約・設定 | Admin | ☐ | Instructure Japan との契約 |
| 2 | サイト言語・タイムゾーン設定 | Admin | ☐ | 1時間 |
| 3 | ユーザー追加（CSV import） | Admin | ☐ | 30分 |
| 4 | Module 1-5 コース作成 | Course Creator | ☐ | 1 コース = 2-3時間（UI シンプル） |
| 5 | 動画埋め込み（YouTube or Canvas） | Course Creator | ☐ | 18本 × 15分 = 4.5時間 |
| 6 | ワークシート配布＆課題設定 | Course Creator | ☐ | 6個 × 30分 = 3時間 |
| 7 | クイズ・テスト作成 | Course Creator | ☐ | 30 クイズ × 20分 = 10時間 |
| 8 | 前提条件・順序制御設定 | Admin | ☐ | 2時間 |
| 9 | Credly 統合（修了証発行） | Admin | ☐ | 1時間 |
| 10 | テストユーザーで動作確認 | QA | ☐ | 4時間 |

**合計実装時間**: 40～50時間（1.5～2週間）

---

## 5.3 Kajabi 実装チェックリスト

| Step | タスク | 担当 | 完了 | 備考 |
|------|--------|------|------|------|
| 1 | Kajabi 契約・初期設定 | Admin | ☐ | 30分 |
| 2 | サイト情報設定 | Admin | ☐ | 1時間 |
| 3 | ユーザー（学習者）招待 | Admin | ☐ | メール送信 |
| 4 | Module 1-5 コース作成 | Course Creator | ☐ | 1 コース = 1.5-2時間 |
| 5 | 動画埋め込み | Course Creator | ☐ | YouTube 埋め込みが最速 |
| 6 | ワークシート / PDF 配布 | Course Creator | ☐ | 2時間 |
| 7 | クイズ作成 | Course Creator | ☐ | 30 クイズ × 10分 = 5時間 |
| 8 | 前提条件設定 | Admin | ☐ | 1時間 |
| 9 | 修了証テンプレート作成 | Admin | ☐ | 1時間 |
| 10 | テストユーザーで動作確認 | QA | ☐ | 2時間 |

**合計実装時間**: 20～30時間（1週間～10日）

---

## 5.4 全体納期目安

| プラットフォーム | セットアップ | 実装 | テスト | 本番開始 |
|-----------------|------------|------|--------|---------|
| **Moodle** | 1-2週 | 3-4週 | 1週 | 5-7週間 |
| **Canvas** | 3-5日 | 2-3週 | 5日 | 3-4週間 |
| **Kajabi** | 1-2日 | 1-1.5週 | 3日 | 2-3週間 |

---

---

# Part 6: よくある質問 (FAQ) 

## 動画のビットレート（ファイルサイズ）を削減したい

**推奨設定**:
```
解像度: 1280×720 (HD)
ビットレート: 3-4 Mbps
フレームレート: 24fps
コーデック: H.264

結果: 10分動画 ≈ 50MB（元の 1/3）
```

**変換コマンド** (FFmpeg):
```bash
ffmpeg -i input.mp4 -c:v libx264 -preset slow \
  -crf 28 -s 1280:720 -r 24 \
  -c:a aac -b:a 96k output.mp4
```

---

## 学習者が動画を再生できない

**チェックリスト**:
- ブラウザのキャッシュクリア → 再ロード
- ビデオコーデック対応確認
  ```
  Canvas: WebM, MP4, M3U8 対応
  Moodle: MP4, WebM 対応
  Kajabi: MP4, YouTube, Vimeo 対応
  ```
- 帯域幅不足？ → 解像度を下げて再アップロード

---

## 修了証に独自書式（署名画像等）を入れたい

**Moodle**:
```
コース → 証明書 → HTMLエディタで編集
<img src="/path/to/signature.png" />
```

**Canvas**:
```
Credly → Badge Design → カスタムテンプレートアップロード
```

**Kajabi**:
```
Settings → Certificates → PDF をアップロード
```

---

## テスト受験時のカンニング防止

**対策**:
1. **時間制限**: 1時間以上の時間制限で焦りを軽減
2. **シャッフル設問**: 全学習者で問題の順序を変える
3. **スクリーン監視**: Moodle Proctoring Plugin を使用
   ```
   ProctorU, Respondus Lockdown Browser 連携
   ```

---

## 修了証の法的有効性

```
💡 注意：修了証は「学習完了の証明」です。
資格認定証（国家資格等）ではありません。

✅ 有効な使用例
- 企業研修の実施記録
- 昇進要件の充足証明
- スキル習得の実績記録

❌ 使用不可
- 資格試験の免除
- 業務独占権の取得
```

政府申請（人材開発支援助成金等）では CSV データが必須です。

---

## 学習者のデータ保護（GDPR/個人情報保護法）

**重要事項**:
1. **データ保持期限**: 3年を超えて保有しない
2. **削除権対応**: 修了後 X 年で学習データを削除
3. **暗号化**: ユーザーパスワードは bcrypt 等で暗号化
4. **バックアップ**: 月1回の自動バックアップ

**Moodle設定**:
```
サイト管理 → グローバル検索 → GDPR
☑ プライバシー対応を有効化
```

**Canvas設定**:
```
管理 → セキュリティ → FERPA 準拠
```

---

# Part 7: 技術サポート＆リソース

## サポートチャネル

| LMS | サポート | 連絡先 | 対応時間 |
|-----|---------|----------|---------|
| **Moodle** | コミュニティ＆有償 | moodle.org / MoodlePartners | 平日営業時間 |
| **Canvas** | 日本語 24/7 | Instructure Japan support | 24時間 |
| **Kajabi** | チケット＆チャット | help.kajabi.com | 平日営業時間 |

---

## 参考ドキュメント

```
docs/training/lms-integration-guide.md （本ドキュメント）
docs/training/video-curriculum.md       （カリキュラム詳細）
docs/training/production-guide.md       （動画制作ガイド）
docs/training/worksheets.md             （ワークシート集）
```

---

## 実装後のベストプラクティス

1. **初回実施後の改善サイクル**
   - 修了率 < 70% なら動画長を短縮
   - テスト正解率 < 60% なら問題文を簡潔に
   - ドロップアウト率が高い Module を特定

2. **学習者フィードバック収集**
   ```
   最終試験後に 1-2分のアンケート実施
   - 動画の難易度
   - 字幕の必要性
   - 改善提案
   ```

3. **年1回の大規模改定**
   - 法令改正への対応（BCP, CSR 関連）
   - 実例・事例の更新

---

**本ドキュメント作成日**: 2026-02-27（CCAGI SDK ワークフロー対応）

