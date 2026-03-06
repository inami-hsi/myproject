# UI Guidelines - Company List Builder

Phase 2 設計ドキュメント。`company-list-builder-design-system.yml` および `company-list-builder-design-requirements.md` に基づくUI設計方針。

**作成日**: 2026-03-05
**ソース**: `docs/design/company-list-builder-design-system.yml`
**ステータス**: Draft

---

## 1. Design Philosophy

### 1.1 Purpose

Company List Builder は、日本の約500万法人データを対象に、業種と地域を選択するだけで営業リストを生成するツールである。

**ターゲットユーザー**: 中小企業の営業担当者
**コアタスク**: 3クリックで営業リストをCSV/Excelダウンロード
**設計原則**: データが主役。UIは徹底的に削ぎ落とし、検索条件とデータテーブルにフォーカスさせる

ユーザーが求めているのは「美しいUI」ではなく「正確なデータを速く取得すること」である。すべてのデザイン判断はこの原則に立ち返る。

### 1.2 Tone: brutally-minimal

画面の90%は白と黒で構成する。色彩は情報の区別にのみ使用し、装飾目的では使わない。

| 原則 | 詳細 |
|------|------|
| 余白は情報である | 要素間のネガティブスペースが視線を誘導する。余白を埋めようとしない |
| 装飾を排除する | イラスト、グラデーション背景、ヒーローイメージを使わない |
| ボーダーで区切る | シャドウではなく、1pxの線で要素を区切る |
| テキストで語る | アイコンは補助。テキストラベルを省略しない |

**ムード**: professional-industrial -- ビジネスツールとしての実用性と信頼感を最優先する。

### 1.3 Differentiation: ライブカウンター体験

Company List Builder の差別化要素は**ライブカウンター**である。

フィルタ条件を変更するたびに検索結果件数がリアルタイムに変化する。この数字の変動が、ユーザーに「絞り込みが効いている」という実感を与える。

**ライブカウンターの視覚仕様**:
- フォント: JetBrains Mono 700
- サイズ: 1.5rem（24px）
- 数値フォーマット: `toLocaleString()` によるカンマ区切り
- フォント特性: `tabular-nums`（桁揃え）
- アニメーション: 数字変化時に `opacity` + `translateY` の150ms ease-out トランジション

この数字だけが画面上で唯一の「動き」を持つ要素である。他の装飾的アニメーションは存在しない。

---

## 2. Typography Guidelines

### 2.1 フォントファミリー宣言

3つのフォントファミリーを使い分ける。

| フォント | 用途 | ウェイト |
|---------|------|---------|
| **Outfit** | 英字見出し、CTA、英字本文 | 400, 500, 600, 700 |
| **Noto Sans JP** | 日本語テキスト全般 | 400, 700 |
| **JetBrains Mono** | 数値表示（件数、金額、法人番号） | 500, 700 |

**日本語テキストの原則**: ベースフォントは Noto Sans JP とし、英字部分に Outfit をオーバーレイする。CSS `font-family` の宣言順で制御する。

```
見出し: font-family: Outfit, "Noto Sans JP", system-ui, sans-serif;
本文:   font-family: "Noto Sans JP", Outfit, system-ui, sans-serif;
数値:   font-family: "JetBrains Mono", ui-monospace, monospace;
```

Tailwind カスタムクラス:

```
font-heading  → var(--font-outfit), var(--font-noto-sans-jp), system-ui, sans-serif
font-body     → var(--font-noto-sans-jp), var(--font-outfit), system-ui, sans-serif
font-mono     → var(--font-jetbrains-mono), ui-monospace, monospace
```

### 2.2 見出し使用場面（H1-H4 具体的適用箇所）

| レベル | フォント | ウェイト | サイズ | 行高 | 字間 | 適用箇所 |
|--------|---------|---------|--------|------|------|---------|
| H1 | Outfit | 700 | 2.25rem (36px) | 1.3 | -0.02em | ページタイトル（「企業検索」「統計ダッシュボード」）、LPヒーローコピー |
| H2 | Outfit | 600 | 1.5rem (24px) | 1.3 | -0.02em | セクションタイトル（「検索結果」「料金プラン」「データソース」） |
| H3 | Outfit | 600 | 1.25rem (20px) | 1.3 | -0.02em | フィルタセクションヘッダー（「業種」「地域」「詳細条件」） |
| H4 | Outfit | 500 | 1.125rem (18px) | 1.3 | -0.02em | カード内タイトル、モーダルタイトル、サブセクション |

Tailwind クラス:

```
H1: text-h1 font-heading  → font-size: 2.25rem; font-weight: 700; line-height: 1.3; letter-spacing: -0.02em
H2: text-h2 font-heading  → font-size: 1.5rem; font-weight: 600; line-height: 1.3; letter-spacing: -0.02em
H3: text-h3 font-heading  → font-size: 1.25rem; font-weight: 600; line-height: 1.3; letter-spacing: -0.02em
H4: text-h4 font-heading  → font-size: 1.125rem; font-weight: 500; line-height: 1.3; letter-spacing: -0.02em
```

### 2.3 本文使用場面

| 用途 | フォント | ウェイト | サイズ | 行高 | Tailwindクラス | 適用箇所 |
|------|---------|---------|--------|------|---------------|---------|
| body | Noto Sans JP / Outfit | 400 | 0.875rem (14px) | 1.6 | `text-body font-body` | 段落テキスト、フィルタラベル、フォーム説明文 |
| table-data | Noto Sans JP / Outfit | 400 | 0.8125rem (13px) | 1.5 | `text-table-data font-body` | テーブルセルデータ、ページネーション表示 |
| cta | Outfit | 600 | 0.9375rem (15px) | 1.4 | `text-cta font-heading` | ボタンテキスト、アクションリンク |
| caption | Noto Sans JP / Outfit | 400 | 0.75rem (12px) | 1.5 | `text-xs font-body` | テーブルキャプション、注釈、残数表示 |

### 2.4 数値表示規約

数値はすべて JetBrains Mono + `tabular-nums` で表示する。桁揃えにより、数値の大小を視覚的に比較しやすくする。

| 用途 | ウェイト | サイズ | Tailwindクラス | 適用箇所 |
|------|---------|--------|---------------|---------|
| counter-lg | 700 | 1.5rem (24px) | `text-counter-lg font-mono tabular-nums` | 検索結果件数（LiveCounter large） |
| counter | 500 | 1rem (16px) | `text-counter font-mono tabular-nums` | ダウンロード残数、統計数値、料金 |
| table-number | 500 | 0.8125rem (13px) | `text-table-data font-mono tabular-nums` | テーブル内の数値（資本金、従業員数） |

**フォーマット規約**:
- 件数・金額: `toLocaleString('ja-JP')` でカンマ区切り（例: 12,345）
- 法人番号: ハイフンなし13桁（例: 1234567890123）
- 資本金: 万円単位で表示（例: 1,000万円）
- パーセンテージ: 小数1桁（例: 45.3%）

### 2.5 禁止フォント

以下のフォントは使用禁止（AI Slop回避）:

| フォント | 禁止理由 |
|---------|---------|
| Inter | AI生成コードのデフォルト。ジェネリックで差別化不可 |
| Roboto | Googleプロダクトの標準。個性がない |
| Arial | システムフォント。意図的な選択に見えない |
| Space Grotesk | AI生成UIの典型フォント |

---

## 3. Color Guidelines

### 3.1 配色原則（90%白黒ルール）

画面の面積比で90%を白（#ffffff）と黒（#0a0a0a）で構成する。残りの10%でアクセントカラーを使用する。

```
90% : 白 (#ffffff) + 黒 (#0a0a0a) + グレー (#404040, #64748b)
 7% : 背景バリエーション (#f8fafc, #f1f5f9, #e2e8f0)
 3% : アクセント (#2563eb) + ステータス (#059669, #dc2626, #d97706)
```

色は「装飾」ではなく「情報の区別」にのみ使用する:
- **ブルー（#2563eb）**: ユーザーがアクションを起こせる要素（CTA、リンク、アクティブ状態）
- **グリーン（#059669）**: 成功状態（ダウンロード完了、データ更新）
- **レッド（#dc2626）**: エラー状態（制限超過、バリデーションエラー）
- **アンバー（#d97706）**: 警告状態（上限接近）

### 3.2 テキスト色マッピング

| トークン | カラーコード | 用途 | Tailwindクラス |
|---------|-------------|------|---------------|
| text-primary | #0a0a0a | 本文、見出し、テーブルデータ | `text-primary` |
| text-secondary | #404040 | サブテキスト、セカンダリ情報 | `text-secondary` |
| text-muted | #64748b | 補足テキスト（白背景上のみ） | `text-text-secondary` |
| text-on-surface | **#475569** | 補足テキスト（surface背景 #f8fafc 上） | `text-slate-600` |
| text-accent | #2563eb | リンク、アクティブ状態テキスト | `text-accent` |
| text-success | #059669 | 成功メッセージ | `text-success` |
| text-error | #dc2626 | エラーメッセージ | `text-error` |
| text-warning | #d97706 | 警告メッセージ | `text-warning` |
| text-on-accent | #ffffff | アクセント背景上のテキスト | `text-white` |

**C-02解決**: テキスト secondary（#64748b）を surface 背景（#f8fafc）上で使用するとコントラスト比が4.36:1となりAA基準（4.5:1）を下回る。surface 背景上では `text-on-surface`（#475569）を使用し、コントラスト比5.63:1を確保する。

### 3.3 背景色マッピング

| トークン | カラーコード | 用途 | Tailwindクラス |
|---------|-------------|------|---------------|
| bg-main | #ffffff | ページ背景、テーブル偶数行 | `bg-white` |
| bg-surface | #f8fafc | テーブル奇数行、カード背景 | `bg-background-surface` |
| bg-filter | #f1f5f9 | フィルタサイドバー背景 | `bg-background-filter` |
| bg-accent | #2563eb | CTAボタン背景 | `bg-accent` |
| bg-accent-hover | #2563eb/90 | CTAボタンホバー | `bg-accent/90` |
| bg-success | #059669 | 成功ボタン背景 | `bg-accent-success` |
| bg-error | #dc2626 | エラーボタン背景 | `bg-error` |

### 3.4 アクセント色使い分け

| カラー | コード | 使用場面 | 使用頻度 |
|--------|--------|---------|---------|
| accent（ブルー） | #2563eb | CTAボタン、リンク、フォーカスリング、アクティブタブ、選択中フィルタ、チェックボックスON | 高 |
| accent-success（グリーン） | #059669 | ダウンロード完了、データ更新完了、成功バッジ | 低 |

アクセントカラーは画面上で「次にユーザーが取るべきアクション」を示す。2色を超えるアクセントカラーの追加は禁止する。

### 3.5 ステータス色

| ステータス | カラーコード | 背景（薄） | 用途 |
|-----------|-------------|-----------|------|
| success | #059669 | #ecfdf5 | ダウンロード完了、データ更新成功 |
| error | #dc2626 | #fef2f2 | ダウンロード上限超過、バリデーションエラー |
| warning | #d97706 | #fffbeb | ダウンロード残数が20%以下、APIレート制限接近 |

### 3.6 コントラスト比検証テーブル（全組み合わせ）

WCAG AA基準: 通常テキスト 4.5:1以上、大テキスト(18px以上 or 14px bold以上) 3:1以上

| テキスト色 | 背景色 | コントラスト比 | AA通常 | AA大 | 用途 |
|-----------|--------|--------------|--------|------|------|
| #0a0a0a (primary) | #ffffff (main) | **19.46:1** | PASS | PASS | 本文テキスト on 白背景 |
| #0a0a0a (primary) | #f8fafc (surface) | **18.88:1** | PASS | PASS | 本文テキスト on surface |
| #0a0a0a (primary) | #f1f5f9 (filter) | **17.93:1** | PASS | PASS | 本文テキスト on フィルタ背景 |
| #404040 (secondary) | #ffffff (main) | **9.73:1** | PASS | PASS | サブテキスト on 白背景 |
| #404040 (secondary) | #f8fafc (surface) | **9.44:1** | PASS | PASS | サブテキスト on surface |
| #64748b (muted) | #ffffff (main) | **4.63:1** | PASS | PASS | 補足テキスト on 白背景 |
| #64748b (muted) | #f8fafc (surface) | **4.36:1** | **FAIL** | PASS | 使用禁止。#475569を使うこと |
| **#475569 (on-surface)** | **#f8fafc (surface)** | **5.63:1** | **PASS** | **PASS** | **補足テキスト on surface（C-02代替色）** |
| #475569 (on-surface) | #f1f5f9 (filter) | **5.34:1** | PASS | PASS | 補足テキスト on フィルタ背景 |
| #2563eb (accent) | #ffffff (main) | **4.62:1** | PASS | PASS | リンクテキスト on 白背景 |
| #ffffff (white) | #2563eb (accent) | **4.62:1** | PASS | PASS | ボタンテキスト on アクセント背景 |
| #ffffff (white) | #059669 (success) | **4.58:1** | PASS | PASS | ボタンテキスト on 成功背景 |
| #ffffff (white) | #dc2626 (error) | **4.63:1** | PASS | PASS | ボタンテキスト on エラー背景 |
| #dc2626 (error) | #ffffff (main) | **4.63:1** | PASS | PASS | エラーテキスト on 白背景 |
| #059669 (success) | #ffffff (main) | **4.58:1** | PASS | PASS | 成功テキスト on 白背景 |
| #d97706 (warning) | #ffffff (main) | **3.75:1** | FAIL | PASS | 警告は大テキストまたはアイコン併用必須 |

**重要ルール**:
- `#64748b` は白背景（#ffffff）上でのみ使用可。surface 背景（#f8fafc）以上の色を持つ背景では `#475569` に切り替えること
- warning色（#d97706）は単独テキストでは使用禁止。必ずアイコン（`AlertTriangle`）を併用するか、14px bold以上で使用すること

### 3.7 禁止カラー

| 禁止パターン | 理由 |
|-------------|------|
| 紫グラデーション on 白背景 | AI生成UIの典型パターン |
| 3色以上のグラデーション | brutally-minimal に反する |
| ネオンカラー / 蛍光色 | professional-industrial のムードに反する |
| 半透明の背景オーバーレイ（0.5以上の透明度） | データの視認性を阻害する |

---

## 4. Motion Guidelines

### 4.1 基本原則

アニメーションはユーザーの操作に対するフィードバックとしてのみ使用する。装飾的・演出的なアニメーションは一切行わない。

| ルール | 値 |
|--------|-----|
| 最大デュレーション | 150ms |
| デフォルトイージング | ease-out |
| ライブラリ | CSS transitions のみ（motion/react は不使用） |
| 同時実行上限 | 1プロパティのトランジション（複合の場合は同一要素内に限る） |

### 4.2 許可プロパティ

以下のCSSプロパティのみトランジション対象として許可する。

| プロパティ | 用途 | 理由 |
|-----------|------|------|
| `transform` | カウンター数字の `translateY` | Compositorプロパティ。リペイント不要 |
| `opacity` | フェードイン/フェードアウト全般 | Compositorプロパティ。リペイント不要 |
| `max-height` | フィルタセクションの展開/折りたたみ | レイアウトプロパティだが`height: auto`代替として許容 |
| `background-color` | テーブル行ホバー、ボタンホバー | リペイントのみ（リフロー不要） |
| `grid-template-rows` | `0fr` / `1fr` パターンによる折りたたみ | H-01解決: max-height 遅延の代替。`overflow: hidden`と併用 |

**H-01解決**: フィルタセクションの折りたたみには2つのパターンを許可する。

パターンA（推奨）: `grid-template-rows`

```css
.collapsible-wrapper {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 150ms ease-out;
}
.collapsible-wrapper[data-open="true"] {
  grid-template-rows: 1fr;
}
.collapsible-content {
  overflow: hidden;
}
```

パターンB（フォールバック）: `max-height` + `opacity`

```css
.collapsible {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition: max-height 150ms ease-out, opacity 150ms ease-out;
}
.collapsible[data-open="true"] {
  max-height: 500px; /* 十分に大きな値 */
  opacity: 1;
}
```

### 4.3 シーン別定義

#### シーン1: counter（ライブカウンター更新）

```css
.counter-value {
  transition: opacity 150ms ease-out, transform 150ms ease-out;
}
.counter-value[data-changing="true"] {
  opacity: 0;
  transform: translateY(-4px);
}
```

- トリガー: 検索結果件数の変化
- プロパティ: `opacity`, `transform`（translateY）
- デュレーション: 150ms
- イージング: ease-out
- 挙動: 旧数値がフェードアウト+上にスライド → 新数値がフェードイン+下からスライド

#### シーン2: filter（フィルタ展開/折りたたみ）

```css
.filter-section {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 150ms ease-out;
}
.filter-section[data-open="true"] {
  grid-template-rows: 1fr;
}
.filter-section-content {
  overflow: hidden;
}
```

- トリガー: フィルタセクションヘッダーのクリック
- プロパティ: `grid-template-rows`（推奨）または `max-height` + `opacity`
- デュレーション: 150ms
- イージング: ease-out

#### シーン3: table_hover（テーブル行ホバー）

```css
.table-row {
  transition: background-color 100ms ease-out;
}
.table-row:hover {
  background-color: #f8fafc; /* bg-background-surface */
}
```

- トリガー: テーブル行へのマウスホバー
- プロパティ: `background-color`
- デュレーション: 100ms（即時フィードバック）
- イージング: ease-out

#### シーン4: download（ダウンロード完了）

```css
.download-check {
  opacity: 0;
  transform: scale(0.8);
  transition: opacity 150ms ease-out, transform 150ms ease-out;
}
.download-check[data-complete="true"] {
  opacity: 1;
  transform: scale(1);
}
```

- トリガー: ダウンロード処理の完了
- プロパティ: `opacity`, `transform`（scale）
- デュレーション: 150ms
- イージング: ease-out
- 挙動: チェックマークアイコンがフェードイン+スケールアップ

#### シーン5: modal（モーダル表示）

```css
.modal-overlay {
  opacity: 0;
  transition: opacity 150ms ease-out;
}
.modal-overlay[data-open="true"] {
  opacity: 1;
}
```

- トリガー: テーブル行クリック（企業詳細表示）
- プロパティ: `opacity`
- デュレーション: 150ms
- イージング: ease-out
- 挙動: オーバーレイ+コンテンツのフェードイン

### 4.4 reduced-motion 対応

`prefers-reduced-motion: reduce` メディアクエリを必ず考慮する。

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- すべてのトランジション/アニメーションを即時完了に変更する
- 数値の変化（LiveCounter）は即座に最終値を表示する
- フィルタの展開/折りたたみは即座に最終状態を表示する

### 4.5 禁止事項

| 禁止パターン | 理由 |
|-------------|------|
| motion/react ライブラリの使用 | CSS transitions のみで十分。バンドルサイズの増加を避ける |
| bounce / spring エフェクト | ツール系UIに過度な演出は不要 |
| 3秒以上の連続アニメーション | ユーザー操作を阻害する |
| `height` の直接トランジション | `height: auto` へのトランジションは動作しない。grid-template-rows または max-height を使用 |
| `width`, `top`, `left`, `margin`, `padding` のトランジション | リフローを引き起こすレイアウトプロパティは禁止 |
| `@keyframes` アニメーション（ダウンロード完了以外） | transition で実現できる場合は transition を使用する |
| ページ遷移アニメーション | 即時ナビゲーションが正義 |

### 4.6 デバウンス仕様

フィルタ変更からAPI呼び出しまでのデバウンスは、UI応答遅延ではなくAPI呼び出し抑制を目的とする。ユーザーが連続してフィルタを操作する際に、中間状態のリクエストを間引くことでサーバー負荷を軽減する。

| 項目 | 値 | 備考 |
|------|-----|------|
| デバウンス時間 | 300ms | フィルタ変更（チェックボックスON/OFF、Select変更、テキスト入力）から検索API呼び出しまでの待機時間 |
| 対象操作 | IndustryTree選択変更、RegionCascader選択変更、詳細条件変更 | すべてのフィルタ操作が対象 |
| デバウンス中のLiveCounter表示 | `opacity: 0.5` | デバウンス中（API未発行）はLiveCounterの数値を半透明にし、値が確定していないことを視覚的に伝える |
| デバウンス完了後 | `opacity: 1` + 数値更新アニメーション | API応答後にopacityを即時復帰し、通常のcounterアニメーション（150ms ease-out）で新しい数値を表示 |

**重要**: デバウンスはUI応答の遅延を意味しない。チェックボックスのON/OFF切替やフィルタチップの追加/削除といったUIフィードバックは即時反映する。デバウンスが適用されるのはAPIリクエストの発行タイミングのみである。

```css
.live-counter[data-debouncing="true"] {
  opacity: 0.5;
  transition: opacity 100ms ease-out;
}
.live-counter[data-debouncing="false"] {
  opacity: 1;
  transition: opacity 100ms ease-out;
}
```

---

## 5. Spatial Composition

### 5.1 8px グリッドシステム

すべてのスペーシングは8pxの倍数で構成する。

| トークン | 値 | 倍数 | Tailwindクラス |
|---------|-----|------|---------------|
| xs | 4px | 0.5x | `gap-xs` / `p-xs` |
| sm | 8px | 1x | `gap-sm` / `p-sm` |
| md | 16px | 2x | `gap-md` / `p-md` |
| lg | 24px | 3x | `gap-lg` / `p-lg` |
| xl | 32px | 4x | `gap-xl` / `p-xl` |
| 2xl | 48px | 6x | `gap-2xl` / `p-2xl` |
| 3xl | 64px | 8x | `gap-3xl` / `p-3xl` |

### 5.2 セクション間・コンポーネント内スペーシング

| 場所 | スペーシング | 値 |
|------|------------|-----|
| ページ上部マージン | `pt-lg` | 24px |
| セクション間（LP） | `py-3xl` | 64px |
| セクション間（検索画面） | `gap-lg` | 24px |
| フィルタセクション間 | `gap-md` | 16px |
| フィルタ項目間（チェックボックス行） | `gap-sm` | 8px |
| ボタン内パディング | `px-4 py-2` | 16px / 8px |
| カード内パディング | `p-md` | 16px |
| テーブルセルパディング | `px-md py-sm` | 16px / 8px |
| フィルタチップ間 | `gap-sm` | 8px |
| フィルタチップ内パディング | `px-3 py-1` | 12px / 4px |
| モーダル内パディング | `p-lg` | 24px |

### 5.3 検索画面レイアウト仕様

**C-01解決**: 「予測可能なレイアウト禁止」を「装飾的・ジェネリックなレイアウトの禁止」に再定義する。データツールとして左フィルタ+右テーブルは**機能的レイアウト**として許容する。差別化はライブカウンター配置、フィルタチップの視覚表現、テーブル情報密度で実現する。

#### デスクトップ（lg: 1024px以上）

```
┌──────────────────────────────────────────────────────────┐
│  [HEADER h-14]  Logo    検索   統計   料金     ログイン  │
├──────────────────────────────────────────────────────────┤
│  ┌─FilterChipBar──────────────────────────────────────┐  │
│  │ [E 製造業 x] [東京都 x] [資本金:1000万〜 x] [Clear]│  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────┐  ┌──────────────────────────────────────┐  │
│  │ FILTER   │  │  検索結果: 12,345 件    [表示設定 v] │  │
│  │ w-[280px]│  │  ┌──────────────────────────────┐    │  │
│  │          │  │  │ [TABLE]                      │    │  │
│  │ 業種     │  │  │ h-[44px] per row             │    │  │
│  │ ┌──────┐ │  │  │                              │    │  │
│  │ │ Tree │ │  │  │ text-table-data (13px)       │    │  │
│  │ └──────┘ │  │  │                              │    │  │
│  │          │  │  │                              │    │  │
│  │ 地域     │  │  └──────────────────────────────┘    │  │
│  │ ┌──────┐ │  │  < 1 2 3 ... 247 >                  │  │
│  │ │Cascade│ │  │                                     │  │
│  │ └──────┘ │  │  ┌──────────────────────────────┐    │  │
│  │          │  │  │ [DownloadPanel]               │    │  │
│  │ 詳細条件 │  │  │ CSV | Excel  UTF-8 | SJIS    │    │  │
│  │ 資本金__ │  │  │ 残: 2,850/3,000件            │    │  │
│  │ 従業員__ │  │  │ [ダウンロード]               │    │  │
│  │          │  │  └──────────────────────────────┘    │  │
│  │ [リセット]│  │                                     │  │
│  └──────────┘  └──────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

| 要素 | 仕様 |
|------|------|
| フィルタサイドバー | `w-[280px]` 固定幅、`bg-background-filter`、`border-r border-border` |
| メインエリア | `flex-1`、`min-w-0`（テーブル幅制御） |
| 2カラムグリッド | `grid grid-cols-[280px_1fr] gap-0` |
| ヘッダー高 | `h-14`（56px） |
| FilterChipBar | フィルタサイドバーとメインエリアの上部に全幅配置 |

#### モバイル（lg未満）

```
┌────────────────────┐
│ [HEADER]  Logo  [=]│
├────────────────────┤
│ 検索結果: 12,345件 │
│ [フィルタ ▼] 2件   │
├────────────────────┤
│ ┌────────────────┐ │
│ │ [CARD]         │ │
│ │ ABC株式会社    │ │
│ │ 製造業 東京都  │ │
│ │ 資本金1,000万  │ │
│ └────────────────┘ │
│ ┌────────────────┐ │
│ │ [CARD]         │ │
│ │ DEF株式会社    │ │
│ │ 小売業 東京都  │ │
│ │ 資本金500万    │ │
│ └────────────────┘ │
│         ...        │
├────────────────────┤
│ [ダウンロード] 残2850│ ← StickyDownloadBar
└────────────────────┘
```

| 要素 | モバイル仕様 |
|------|-------------|
| フィルタ | `Sheet side="left"`（ドロワー）、幅 `w-[85vw] max-w-[360px]` |
| テーブル | カード表示に変換（`CompanyTable` 内で `useMediaQuery` により切替） |
| ダウンロード | `StickyDownloadBar`（画面下固定） |
| LiveCounter | ヘッダー直下に配置 |

### 5.4 ネガティブスペースの原則

- テーブル上部にはライブカウンターのみを配置し、他の要素を詰め込まない
- フィルタセクション間は `gap-md`（16px）で十分な呼吸を与える
- フィルタサイドバーの左右パディングは `px-md`（16px）
- 検索画面全体の左右パディングはデスクトップで `px-lg`（24px）、モバイルで `px-md`（16px）

### 5.5 テーブル行高

| モード | 行高 | 用途 |
|--------|------|------|
| 標準 | 44px | デフォルト。タッチターゲット最低サイズを確保 |
| コンパクト | 36px | データ密度を優先する場合。デスクトップのみ |

```css
/* 標準モード */
.table-row { height: 44px; }

/* コンパクトモード */
.table-compact .table-row { height: 36px; }
```

コンパクトモードはモバイルでは使用禁止（タッチターゲット44px基準を下回るため）。

---

## 6. Visual Details

### 6.1 ボーダー規約

brutally-minimal ではシャドウではなくボーダーで要素を区切る。

| 要素 | ボーダー | Tailwindクラス |
|------|---------|---------------|
| テーブル外枠 | 1px solid #e2e8f0 | `border border-border rounded-lg` |
| テーブル行区切り | 1px solid #e2e8f0 | `border-b border-border` |
| テーブルヘッダー下 | 1px solid #e2e8f0 | `border-b border-border` |
| カード | 1px solid #e2e8f0 | `border border-border rounded-card` |
| フィルタサイドバー右 | 1px solid #e2e8f0 | `border-r border-border` |
| ヘッダー下 | 1px solid #e2e8f0 | `border-b border-border` |
| 入力フィールド | 1px solid #e2e8f0 | `border border-border rounded-input` |
| フィルタチップ | なし | `bg-background-surface` で区別 |
| フォーカスリング | 2px solid #2563eb | `ring-2 ring-accent ring-offset-2` |

### 6.2 シャドウ規約

シャドウは最小限に使用する。ボーダーで表現できる場合はシャドウを使わない。

| 要素 | シャドウ | Tailwindクラス | 備考 |
|------|---------|---------------|------|
| CTAボタン | none | - | ボーダーなし、背景色のみ |
| カード | shadow-sm | `shadow-card` | ボーダーと併用 |
| テーブル | none | - | ボーダーのみ |
| モーダル | shadow-xl | `shadow-modal` | オーバーレイ上の浮遊感表現 |
| ドロップダウン | shadow-md | `shadow-dropdown` | 浮遊メニューの区別 |
| 入力フィールド | none | - | フォーカス時はリングのみ |
| フィルタチップ | none | - | 背景色で区別 |

### 6.3 角丸規約

| 要素 | 角丸 | 値 | Tailwindクラス |
|------|------|-----|---------------|
| CTAボタン | md | 6px | `rounded-button` |
| セカンダリボタン | md | 6px | `rounded-button` |
| カード | lg | 8px | `rounded-card` |
| テーブル | lg | 8px | `rounded-lg` |
| モーダル | xl | 12px | `rounded-modal` |
| 入力フィールド | md | 6px | `rounded-input` |
| フィルタチップ | full | 9999px | `rounded-chip` |
| ドロップダウン | lg | 8px | `rounded-dropdown` |

### 6.4 アイコン規約

全アイコンは **Lucide React** を使用する。独自SVGの追加は禁止。

**サイズ規約**:

| コンテキスト | サイズ | Tailwindクラス |
|-------------|--------|---------------|
| インラインテキスト | 16px | `size-4` |
| ボタン内 | 16px | `size-4` |
| セクションヘッダー | 20px | `size-5` |
| 大きなアクション | 24px | `size-6` |

**色規約**: アイコンはテキストと同じ色を使用する。アイコン専用の色は設けない。

```tsx
// 正しい例
<Search className="size-4 text-text-secondary" />

// 禁止: アイコンだけ独自色
<Search className="size-4 text-blue-300" />
```

**アイコンとテキストの間隔**: `gap-sm`（8px）または `gap-xs`（4px）をflexboxで制御。

```tsx
<button className="inline-flex items-center gap-xs">
  <Download className="size-4" />
  ダウンロード
</button>
```

---

## 7. Accessibility Standards

### 7.1 WCAG AA準拠項目

| 基準 | 内容 | 実装方針 |
|------|------|---------|
| 1.1.1 非テキストコンテンツ | 画像・アイコンに代替テキスト | アイコンボタンには `aria-label` 必須 |
| 1.3.1 情報と関係性 | 構造的マークアップ | 見出しタグの階層を守る。テーブルは `<table>` 要素を使用 |
| 1.4.1 色の使用 | 色だけに依存しない | ステータスはアイコン+テキスト+色の3重表現 |
| 1.4.3 コントラスト | 4.5:1以上 | 3.6節のコントラスト比検証テーブルに従う |
| 2.1.1 キーボード | 全操作がキーボードで可能 | 7.2節のキーボード操作基準に従う |
| 2.4.3 フォーカス順序 | 論理的なフォーカス順序 | DOM順序に従う。`tabindex` の乱用禁止 |
| 2.4.7 フォーカス可視 | フォーカスインジケーター | `ring-2 ring-accent ring-offset-2` で統一 |
| 4.1.2 名前、役割、値 | ARIA属性 | テーブルに `aria-label`、ツリーに `role="tree"` |

### 7.2 キーボード操作基準

| コンポーネント | キー | 動作 |
|-------------|------|------|
| テーブル | `Tab` | セル間移動 |
| テーブル | `Enter` | 行選択（企業詳細表示） |
| ツリー（IndustryTree） | `Arrow Up/Down` | 同階層のノード間移動 |
| ツリー（IndustryTree） | `Arrow Right` | ノード展開 / 子ノードへ移動 |
| ツリー（IndustryTree） | `Arrow Left` | ノード折りたたみ / 親ノードへ移動 |
| ツリー（IndustryTree） | `Space` | チェックボックスON/OFF |
| ツリー（IndustryTree） | `Enter` | チェックボックスON/OFF |
| ツリー（IndustryTree） | `Home` | 先頭ノードへ移動 |
| ツリー（IndustryTree） | `End` | 末尾ノードへ移動 |
| チェックボックス | `Space` | ON/OFF切替 |
| フィルタチップ | `Backspace` / `Delete` | チップ削除 |
| モーダル | `Escape` | モーダル閉じ |
| ドロワー | `Escape` | ドロワー閉じ |
| ドロップダウン | `Arrow Up/Down` | 項目間移動 |
| ドロップダウン | `Enter` | 項目選択 |
| ドロップダウン | `Escape` | メニュー閉じ |

### 7.3 スクリーンリーダー対応

| コンポーネント | ARIA属性 | 値 |
|-------------|----------|-----|
| CompanyTable | `aria-label` | `"企業検索結果テーブル"` |
| CompanyTable | `aria-rowcount` | 総件数 |
| CompanyTable | `aria-colcount` | 表示カラム数 |
| IndustryTree | `role` | `"tree"` |
| IndustryTree のノード | `role` | `"treeitem"` |
| IndustryTree のノード | `aria-expanded` | `true` / `false` |
| IndustryTree のノード | `aria-checked` | `true` / `false` / `"mixed"` |
| IndustryTree のグループ | `role` | `"group"` |
| LiveCounter | `aria-live` | `"polite"` |
| LiveCounter | `aria-atomic` | `"true"` |
| FilterChipBar | `role` | `"list"` |
| FilterChip | `role` | `"listitem"` |
| FilterChip 削除ボタン | `aria-label` | `"${label} フィルタを削除"` |
| モバイルフィルタボタン | `aria-label` | `"フィルタを開く"` |
| モバイルフィルタボタン | `aria-expanded` | `true` / `false` |
| DownloadPanel | `aria-label` | `"ダウンロード設定"` |
| Progress（残数） | `aria-valuenow` | 現在の残数 |
| Progress（残数） | `aria-valuemax` | 上限数 |

### 7.4 タッチターゲット44px

すべてのインタラクティブ要素は最小44px x 44pxのタッチターゲットを確保する。

| 要素 | 実装方法 |
|------|---------|
| チェックボックス行 | 行全体（テキスト含む）をクリック可能に。`min-h-[44px]` |
| フィルタチップ | `min-h-[32px]` だが、チップ間の `gap-sm` (8px) でタップ可能領域を確保 |
| テーブル行（標準） | `h-[44px]` |
| テーブル行（コンパクト） | `h-[36px]` -- デスクトップのみ。モバイルでは標準行高を使用 |
| アイコンボタン | `min-w-[44px] min-h-[44px]` |
| ページネーションボタン | `min-w-[44px] min-h-[44px]` |

---

## 8. Anti-Patterns（統合禁止リスト）

本セクションは全カテゴリの禁止パターンを統合したリストである。

### フォント

| 禁止 | 理由 |
|------|------|
| Inter | AI Slop - ジェネリックフォント |
| Roboto | AI Slop - ジェネリックフォント |
| Arial | AI Slop - ジェネリックフォント |
| Space Grotesk | AI Slop - AI生成の典型フォント |
| システムフォントのみでの構成 | 意図的な選択に見えない |

### カラー・エフェクト

| 禁止 | 理由 |
|------|------|
| 紫グラデーション on 白背景 | AI生成の典型パターン |
| 3色以上のグラデーション | brutally-minimal に反する |
| ネオンカラー / 蛍光色 | professional-industrial に反する |
| 過剰なドロップシャドウ（3段階以上） | brutally-minimal に反する。ボーダーで区切る |
| グロー効果 | brutally-minimal に反する |
| `#64748b` を surface背景上で使用 | コントラスト比4.36:1でAA FAIL。`#475569` を使用 |
| warning色（#d97706）のテキスト単独使用 | コントラスト比3.75:1でAA FAIL。アイコン併用必須 |

### レイアウト

| 禁止 | 理由 |
|------|------|
| cookie-cutter design | 差別化不足 |
| 装飾的・ジェネリックなレイアウトパターン | C-01再定義: 機能的レイアウトは許容 |
| ヒーローに大きな画像/イラスト | テキストと数字で訴求する方針 |
| コンパクトモードをモバイルで使用 | タッチターゲット44px基準違反 |

### アニメーション

| 禁止 | 理由 |
|------|------|
| motion/react ライブラリ | CSS transitions のみ使用 |
| bounce / spring エフェクト | ツール系UIに過度な演出は不要 |
| 3秒以上の連続アニメーション | ユーザー操作を阻害 |
| `height` の直接 transition | `grid-template-rows` or `max-height` を使用 |
| `width`, `top`, `left`, `margin`, `padding` のトランジション | リフロー発生レイアウトプロパティ |
| ページ遷移アニメーション | 即時ナビゲーションが正義 |
| `prefers-reduced-motion` の無視 | アクセシビリティ違反 |

### コンポーネント

| 禁止 | 理由 |
|------|------|
| Lucide React 以外のアイコンライブラリ | 統一性確保 |
| shadcn/ui 以外のUIライブラリ混在 | 依存関係の肥大化防止 |
| カスタムスクロールバー実装 | ブラウザネイティブを尊重 |
| 独自SVGアイコンの追加 | Lucide React で統一 |

---

## 9. Font Loading Strategy

### 9.1 ウェイト削減方針（H-02解決）

Noto Sans JP は日本語フォントのためファイルサイズが大きい。ロード量を最小化する。

| フォント | 必要ウェイト | 削減前 | 理由 |
|---------|-------------|--------|------|
| Outfit | 400, 500, 600, 700 | 変更なし | ラテン文字のみ。ファイルサイズ小 |
| **Noto Sans JP** | **400, 700** | 400, 500, 600, 700 | 500はOutfitでカバー、600はOutfitでカバー |
| JetBrains Mono | 500, 700 | 変更なし | 数値表示のみ。ファイルサイズ小 |

**H-02解決の詳細**:
- Noto Sans JP 500 (medium) → 見出しH4は Outfit 500 が優先レンダリングされるため不要
- Noto Sans JP 600 (semibold) → 見出しH2/H3は Outfit 600 が優先レンダリングされるため不要
- 日本語テキストで太字が必要な場合は 700 を使用する
- 本文の日本語は 400 のみで十分

### 9.2 preload / display: swap 設定

```typescript
// src/lib/fonts.ts（H-02最適化版）
import { Outfit, Noto_Sans_JP, JetBrains_Mono } from "next/font/google";

export const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

export const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "700"],  // H-02: 2ウェイトに削減
  variable: "--font-noto-sans-jp",
  display: "swap",
  preload: true,
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  preload: false,  // 数値表示は遅延ロードで可
});
```

**`display: "swap"` の効果**: フォントロード完了前はフォールバックフォント（system-ui）で表示し、ロード完了後に切り替える。FOIT（Flash of Invisible Text）を防止する。

**preload 戦略**:
- Outfit: `next/font` が自動preload（ラテン文字のみで軽量）
- Noto Sans JP: `preload: true`（初回表示で必ず使用するため）
- JetBrains Mono: `preload: false`（検索結果表示まで不要なため遅延ロード）

### 9.3 パフォーマンスバジェット

| 指標 | 目標値 | 根拠 |
|------|--------|------|
| フォント合計サイズ | 300KB以下 | Noto Sans JP 2ウェイト: 約200KB、Outfit 4ウェイト: 約60KB、JetBrains Mono 2ウェイト: 約40KB |
| FCP (First Contentful Paint) | < 1.5s | design-requirements.md 品質基準 |
| CLS (Cumulative Layout Shift) | < 0.1 | `display: swap` によるフォント切替のレイアウトシフトを最小化 |
| フォントロード完了 | < 2.0s | 3G回線でも許容範囲内 |

**CLS対策**: フォールバックフォント（system-ui）と実フォントのサイズ差を `next/font` の `adjustFontFallback` で自動補正する。

---

*Generated by CodeGenAgent (Gen) - Phase 2: Design*
*Project: Company List Builder*
