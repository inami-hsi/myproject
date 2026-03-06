# Company List Builder - レスポンシブガイドライン

Phase 2 設計ドキュメント。モバイルファースト・レスポンシブ設計の詳細方針。

**作成日**: 2026-03-05
**ソース**: `docs/design/company-list-builder-design-system.yml`

---

## 1. 概要

Company List Builder はモバイルファースト（`min-width` 方式）で設計する。
主要切替点は `lg`（1024px）で、フィルタサイドバーの表示形式とテーブル/カード切替をここで行う。

**設計原則**:
- モバイルを基本とし、デスクトップ向けに拡張する
- データテーブルの情報密度はデスクトップで最大化する
- モバイルではカード表示でスキャナビリティを確保する
- タッチ操作を前提とした十分なターゲットサイズを確保する

---

## 2. ブレークポイント定義

Tailwind CSS 標準のブレークポイントを使用する。

| 名前 | 最小幅 | 対象デバイス | 主な変化 |
|------|--------|-------------|---------|
| `base` | - | モバイル (375px+) | 基本レイアウト |
| `sm` | 640px | ラージフォン | カードの2列化 |
| `md` | 768px | タブレット | 余白拡大、フォントサイズ微増 |
| `lg` | **1024px** | デスクトップ | **主要切替点**: フィルタ常時表示、テーブル表示 |
| `xl` | 1280px | ラージデスクトップ | テーブル列の追加表示 |
| `2xl` | 1536px | エクストララージ | 最大幅コンテナ |

### Tailwindクラスでの記述ルール

```tsx
{/* モバイルファースト: 基本 → sm → md → lg → xl の順に記述 */}
<div className="px-4 sm:px-6 md:px-8 lg:px-0">
  {/* ... */}
</div>
```

---

## 3. 画面別レスポンシブ対応

### 3.1 検索画面（/search）

最重要画面。フィルタとテーブルの2カラム構成が中心。

#### レイアウト構造

```
モバイル (base):
┌──────────────────────┐
│ [HEADER]             │
├──────────────────────┤
│ [フィルタボタン] [件数]│
├──────────────────────┤
│ [FilterChipBar]      │
├──────────────────────┤
│ ┌──────────────────┐ │
│ │ カード1           │ │
│ ├──────────────────┤ │
│ │ カード2           │ │
│ ├──────────────────┤ │
│ │ カード3           │ │
│ └──────────────────┘ │
├──────────────────────┤
│ [StickyDownloadBar]  │  ← 画面下部固定
└──────────────────────┘

デスクトップ (lg+):
┌──────────────────────────────────────────┐
│ [HEADER]                                 │
├──────────────────────────────────────────┤
│ [FilterChipBar]                          │
├───────────┬──────────────────────────────┤
│ [FILTER]  │ [MAIN: テーブル]              │
│ 280px     │                              │
│           │  検索結果: 12,345 件          │
│ 地域      │  ┌──────────────────────┐    │
│ ☑ 東京都  │  │ テーブル（CompanyTable）│    │
│ ...       │  └──────────────────────┘    │
│           │                              │
│ 業種      │  ページネーション             │
│ ☑ 製造業  │                              │
│ ...       │  [DownloadPanel]             │
│           │                              │
└───────────┴──────────────────────────────┘
```

#### Tailwindクラス例

```tsx
{/* SearchLayout */}
<div className="min-h-screen">
  <AppHeader />

  {/* FilterChipBar: 全幅 */}
  <div className="border-b border-border px-4 lg:px-6">
    <FilterChipBar />
  </div>

  {/* メインコンテンツ */}
  <div className="lg:grid lg:grid-cols-[280px_1fr]">
    {/* フィルタサイドバー: モバイルは非表示 → Sheet (ドロワー) */}
    <aside className="hidden lg:block border-r border-border bg-background-filter overflow-y-auto h-[calc(100dvh-57px)] sticky top-[57px]">
      <FilterSidebar />
    </aside>

    {/* メインエリア */}
    <main className="px-4 py-4 lg:px-6 lg:py-6">
      {/* モバイル: フィルタ開閉ボタン + 件数 */}
      <div className="flex items-center justify-between mb-4 lg:mb-0">
        <button className="lg:hidden flex items-center gap-2 px-3 py-2 border border-border rounded-button">
          <SlidersHorizontal className="size-4" />
          フィルタ
        </button>
        <LiveCounter count={resultCount} prefix="検索結果:" suffix="件" size="large" />
      </div>

      {/* モバイル: カード表示 / デスクトップ: テーブル表示 */}
      <div className="lg:hidden">
        <CompanyCardList data={companies} />
      </div>
      <div className="hidden lg:block">
        <CompanyTable data={companies} compact />
      </div>

      {/* DownloadPanel: デスクトップのみ */}
      <div className="hidden lg:block mt-6">
        <DownloadPanel />
      </div>
    </main>
  </div>

  {/* StickyDownloadBar: モバイルのみ */}
  <StickyDownloadBar className="lg:hidden" />

  {/* MobileFilterDrawer: モバイルのみ */}
  <MobileFilterDrawer open={filterOpen} onClose={closeFilter} />
</div>
```

#### フィルタの切替

| 要素 | モバイル (base) | デスクトップ (lg+) |
|------|-----------------|-------------------|
| フィルタ全体 | `Sheet side="left"` ドロワー | 左サイドバー常時表示 |
| 地域選択 | アコーディオン展開式 | チェックボックスツリー常時表示 |
| 業種選択 | アコーディオン展開式 | ツリー常時表示 |
| 詳細フィルタ | アコーディオン展開式 | 折りたたみ可能なセクション |
| フィルタ展開アニメーション | `max-height` + `opacity` (150ms) | `max-height` + `opacity` (150ms) |

#### テーブル/カード切替

| 要素 | モバイル (base) | デスクトップ (lg+) |
|------|-----------------|-------------------|
| データ表示 | カード形式（1列） | フルテーブル（CompanyTable） |
| 表示カラム | 法人名、業種、所在地 | 全カラム（可視性設定対応） |
| ソート | セレクトボックスで選択 | テーブルヘッダークリック |
| 行クリック | カードタップ → 詳細 | 行クリック → モーダル |
| ページネーション | 「もっと見る」ボタン | ページ番号ナビ |

---

### 3.2 LP（/）

#### Hero セクション

```
モバイル (base):
┌──────────────────────┐
│                      │
│ 日本500万法人を、     │
│ 3クリックで。         │
│                      │
│ 業種と地域を選ぶだけで│
│ 営業リストが即完成    │
│                      │
│ ┌──────────────────┐ │
│ │ 業種: [製造業 ▼]  │ │
│ ├──────────────────┤ │
│ │ 地域: [東京都 ▼]  │ │
│ ├──────────────────┤ │
│ │ [  今すぐ検索  ]  │ │
│ └──────────────────┘ │
│                      │
│ → 12,345件           │
└──────────────────────┘

デスクトップ (lg+):
┌──────────────────────────────────────────┐
│                                          │
│   日本500万法人を、3クリックで。           │
│                                          │
│   業種と地域を選ぶだけで営業リストが即完成 │
│                                          │
│   ┌──────────────────────────────┐       │
│   │ 業種: [製造業 ▼]  地域: [東京都 ▼]   │
│   │            [  今すぐ検索  ]   │       │
│   └──────────────────────────────┘       │
│                                          │
│   → 12,345件見つかりました               │
└──────────────────────────────────────────┘
```

#### Tailwindクラス例

```tsx
{/* Hero */}
<section className="px-4 py-16 sm:py-20 md:py-24 lg:py-32 text-center">
  <h1 className="text-2xl sm:text-3xl lg:text-h1 font-bold font-heading text-balance">
    日本500万法人を、3クリックで。
  </h1>
  <p className="mt-4 text-body text-text-secondary max-w-md mx-auto lg:max-w-lg">
    業種と地域を選ぶだけで営業リストが即完成
  </p>

  {/* SearchPreview */}
  <div className="mt-8 max-w-md mx-auto lg:max-w-xl">
    <div className="flex flex-col gap-3 lg:flex-row lg:gap-4 lg:items-end">
      <Select />  {/* 業種 */}
      <Select />  {/* 地域 */}
      <Button className="w-full lg:w-auto">今すぐ検索</Button>
    </div>
  </div>
</section>
```

#### 数字セクション

```tsx
{/* 数字で示す信頼性 */}
<section className="px-4 py-12 lg:py-16 bg-background-surface">
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
    <div>
      <span className="text-counter-lg font-mono tabular-nums">500万</span>
      <p className="mt-1 text-body text-text-secondary">法人データ</p>
    </div>
    <div>
      <span className="text-counter-lg font-mono tabular-nums">47</span>
      <p className="mt-1 text-body text-text-secondary">都道府県</p>
    </div>
    <div>
      <span className="text-counter-lg font-mono tabular-nums">20</span>
      <p className="mt-1 text-body text-text-secondary">業種大分類</p>
    </div>
  </div>
</section>
```

#### PricingTable

```tsx
{/* 料金プラン */}
<section className="px-4 py-12 lg:py-16">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
    {plans.map((plan) => (
      <Card key={plan.id} className={cn(
        "p-6",
        plan.recommended && "border-accent border-2 relative"
      )}>
        {/* モバイル: 縦積み / md+: 3列 */}
        <h3 className="text-h3 font-heading">{plan.name}</h3>
        <p className="mt-2 text-counter-lg font-mono tabular-nums">
          &yen;{plan.price.toLocaleString()}
          <span className="text-body text-text-secondary">/月</span>
        </p>
        {/* 機能リスト */}
        <ul className="mt-6 space-y-3 text-body">
          {/* ... */}
        </ul>
        <Button className="mt-6 w-full" variant={plan.recommended ? "default" : "secondary"}>
          {plan.price === 0 ? "無料で始める" : "申し込む"}
        </Button>
      </Card>
    ))}
  </div>
</section>
```

---

### 3.3 地域統計（/stats）

#### レイアウト構造

```
モバイル (base):
┌──────────────────────┐
│ [HEADER]             │
├──────────────────────┤
│ [JapanHeatmap]       │
│ （幅いっぱい、高さ自動）│
├──────────────────────┤
│ [業種別棒グラフ]      │
│ （幅いっぱい）         │
├──────────────────────┤
│ [クロス集計表]        │
│ （横スクロール対応）    │
└──────────────────────┘

デスクトップ (lg+):
┌──────────────────────────────────────────┐
│ [HEADER]                                 │
├──────────────────────────────────────────┤
│ ┌──────────────────┐ ┌────────────────┐ │
│ │ [JapanHeatmap]   │ │ [業種別棒グラフ] │ │
│ │                  │ │                │ │
│ │                  │ │                │ │
│ └──────────────────┘ └────────────────┘ │
├──────────────────────────────────────────┤
│ [クロス集計表（フル幅）]                    │
└──────────────────────────────────────────┘
```

#### Tailwindクラス例

```tsx
<div className="px-4 py-6 lg:px-8 lg:py-8">
  {/* ヒートマップ + 棒グラフ */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Card className="p-4">
      <JapanHeatmap
        data={prefectureStats}
        height={undefined}  {/* レスポンシブ: コンテナ幅に追従 */}
      />
    </Card>
    <Card className="p-4">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={industryStats} />
      </ResponsiveContainer>
    </Card>
  </div>

  {/* クロス集計表 */}
  <Card className="mt-6 p-4 overflow-x-auto">
    <table className="min-w-[800px] w-full text-table-data">
      {/* 横スクロール対応 */}
    </table>
  </Card>
</div>
```

#### ヒートマップのレスポンシブ

| 項目 | モバイル | デスクトップ |
|------|---------|------------|
| 地図サイズ | コンテナ幅100%、高さ自動 | 幅50%カラム、高さ400-500px |
| ツールチップ | タップで表示 | ホバーで表示 |
| 凡例 | 地図下に配置 | 地図右に配置 |
| インタラクション | タップで都道府県選択 | クリックで都道府県選択 |

---

### 3.4 ダッシュボード（/dashboard）

#### レイアウト構造

```
モバイル (base):
┌──────────────────────┐
│ [HEADER] [メニュー]   │
├──────────────────────┤
│ [利用状況カード]      │
├──────────────────────┤
│ [保存済み検索一覧]    │
├──────────────────────┤
│ [ダウンロード履歴]    │
└──────────────────────┘

デスクトップ (lg+):
┌──────────────────────────────────────────┐
│ [HEADER]                                 │
├──────────┬───────────────────────────────┤
│ [SIDENAV]│ [ダッシュボード]               │
│ 240px    │                               │
│          │ ┌──────┐┌──────┐┌──────┐      │
│ 概要     │ │DL残数 ││保存数 ││プラン │      │
│ DL履歴   │ └──────┘└──────┘└──────┘      │
│ 保存検索 │                               │
│ 設定     │ [保存済み検索一覧]             │
│          │                               │
│          │ [最近のダウンロード]            │
└──────────┴───────────────────────────────┘
```

#### Tailwindクラス例

```tsx
{/* DashboardLayout */}
<div className="min-h-screen">
  <AppHeader />
  <div className="lg:grid lg:grid-cols-[240px_1fr]">
    {/* サイドナビ */}
    <nav className="hidden lg:block border-r border-border p-4 h-[calc(100dvh-57px)] sticky top-[57px]">
      <ul className="space-y-1">
        <li><a className="block px-3 py-2 rounded-button hover:bg-background-surface text-body">概要</a></li>
        <li><a className="block px-3 py-2 rounded-button hover:bg-background-surface text-body">ダウンロード履歴</a></li>
        <li><a className="block px-3 py-2 rounded-button hover:bg-background-surface text-body">保存済み検索</a></li>
        <li><a className="block px-3 py-2 rounded-button hover:bg-background-surface text-body">設定</a></li>
      </ul>
    </nav>

    {/* メインコンテンツ */}
    <main className="px-4 py-6 lg:px-8 lg:py-8">
      {/* 統計カード */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-body text-text-secondary">今月のダウンロード</p>
          <p className="mt-1 text-counter-lg font-mono tabular-nums">150 / 3,000</p>
          <Progress value={5} className="mt-2" />
        </Card>
        {/* ... */}
      </div>
    </main>
  </div>
</div>
```

---

## 4. コンポーネント別ブレークポイント対応表

各コンポーネントがどのブレークポイントでどう変化するかの一覧。

| コンポーネント | base (モバイル) | sm (640px) | md (768px) | lg (1024px) | xl (1280px) |
|-------------|----------------|-----------|-----------|------------|------------|
| **AppHeader** | ハンバーガーメニュー | 同左 | 同左 | ナビ横並び表示 | 同左 |
| **FilterSidebar** | Sheet(ドロワー) | 同左 | 同左 | 左カラム常時表示 (280px) | 同左 |
| **CompanyTable** | カード表示 | 同左 | 同左 | フルテーブル | 列追加表示 |
| **DownloadPanel** | StickyDownloadBar | 同左 | 同左 | テーブル下配置 | 同左 |
| **FilterChipBar** | 横スクロール | 同左 | 折返し表示 | 折返し表示 | 同左 |
| **IndustryTree** | アコーディオン | 同左 | 同左 | ツリー常時展開 | 同左 |
| **RegionCascader** | アコーディオン | 同左 | 同左 | カスケード常時表示 | 同左 |
| **LiveCounter** | ヘッダー内(小) | 同左 | 同左 | メインエリア上部(大) | 同左 |
| **PricingTable** | 縦積み(1列) | 同左 | 3列横並び | 同左 | 同左 |
| **JapanHeatmap** | 全幅、凡例下 | 同左 | 同左 | 2列の左側、凡例右 | 同左 |
| **SearchPreview** | 縦積みフォーム | 同左 | 同左 | 横並びフォーム | 同左 |
| **DashboardNav** | ハンバーガー | 同左 | 同左 | サイドナビ常時表示 | 同左 |
| **StatsTable** | 横スクロール | 同左 | 横スクロール | フル表示 | 同左 |

---

## 5. タッチターゲット規約

### 最小サイズ: 44px x 44px

すべてのインタラクティブ要素は、タッチターゲットとして最低 44px x 44px を確保する。

| 要素 | 視覚サイズ | タッチターゲット | 実装方法 |
|------|-----------|----------------|---------|
| ボタン（default） | 40px高 | 44px | `min-h-[44px]` |
| ボタン（sm） | 32px高 | 44px | パディング拡張 `py-[6px]` + `min-h-[44px]` |
| チェックボックス | 16px | 44px | ラベル全体をタップ領域に |
| フィルタチップ削除 | 16px | 44px | `p-3` でパディング拡張 |
| テーブル行 | 36px高 | 44px | モバイルカードは `min-h-[44px]` |
| ページネーション | 32px | 44px | `min-w-[44px] min-h-[44px]` |
| ハンバーガーメニュー | 24px | 44px | `p-2.5` |
| アコーディオントリガー | 可変 | 44px | `min-h-[44px]` |

### Tailwindクラス例

```tsx
{/* チェックボックス: ラベル全体をタッチ領域に */}
<label className="flex items-center gap-3 min-h-[44px] px-2 cursor-pointer hover:bg-background-surface rounded-button">
  <Checkbox id={item.code} />
  <span className="text-body">{item.name}</span>
</label>

{/* フィルタチップの削除ボタン */}
<button
  className="ml-1 p-1.5 -mr-1 rounded-full hover:bg-black/10 min-w-[44px] min-h-[44px] flex items-center justify-center"
  aria-label={`${chip.label}を削除`}
>
  <X className="size-3" />
</button>
```

---

## 6. Safe Area 対応

### StickyDownloadBar

iOSのホームインジケーターなど、Safe Area を考慮する。

```tsx
{/* StickyDownloadBar */}
<div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-card lg:hidden">
  <div className="flex items-center justify-between px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
    <div>
      <span className="text-body text-text-secondary">検索結果</span>
      <span className="ml-2 font-mono tabular-nums font-bold">{count.toLocaleString()}件</span>
    </div>
    <Button size="sm" onClick={onDownload}>
      <Download className="size-4 mr-2" />
      ダウンロード
    </Button>
  </div>
</div>
```

### MobileFilterDrawer

```tsx
{/* ドロワーフッター */}
<div className="sticky bottom-0 bg-white border-t border-border px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
  <Button className="w-full" onClick={onApply}>
    {resultCount.toLocaleString()}件を表示
  </Button>
</div>
```

### viewport meta タグ

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

---

## 7. パフォーマンス

### 7.1 画像最適化

| 項目 | 方針 |
|------|------|
| フォーマット | WebP / AVIF 優先（`next/image` で自動変換） |
| ロゴ | SVG（インラインまたは `next/image`） |
| ヒートマップ | SVG ベース（react-simple-maps） |
| OGP画像 | 1200x630px、WebP |
| 遅延読み込み | ファーストビュー外は `loading="lazy"` |

### 7.2 フォント最適化

```typescript
// next/font で最適化読み込み
// font-display: swap で FOIT 回避
// サブセット指定で読み込みサイズ削減

export const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",      // FOIT回避
  variable: "--font-outfit",
});

export const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],    // 日本語はCDNから遅延読み込み
  display: "swap",
  variable: "--font-noto-sans-jp",
  preload: false,        // 日本語フォントはプリロードしない（サイズ大）
});
```

### 7.3 テーブルの仮想化

```typescript
// 大量行表示時は @tanstack/react-virtual で仮想スクロール
// 50行/ページのデフォルトでは不要、100行以上で検討
import { useVirtualizer } from "@tanstack/react-virtual";
```

### 7.4 CSS パフォーマンス

| 項目 | 方針 |
|------|------|
| `will-change` | アニメーション対象要素にのみ適用、常時指定は禁止 |
| `backdrop-filter: blur()` | 不使用（パフォーマンスコスト大） |
| `box-shadow` | 最小限（brutally-minimal方針） |
| `@layer` | base, components, utilities の3層で管理 |
| CSS変数 | `:root` に定義し、ランタイム変更を最小化 |

### 7.5 Core Web Vitals 対策

| 指標 | 目標 | 対策 |
|------|------|------|
| FCP < 1.5s | フォントの`display: swap`、重要CSSのインライン化 |
| LCP < 2.5s | ヒーローテキストのプリレンダリング、フォントプリロード（英字のみ） |
| CLS < 0.1 | フォントサイズの`size-adjust`、Skeleton表示、画像のアスペクト比固定 |

### 7.6 レスポンシブ画像

```tsx
{/* next/image によるレスポンシブ画像 */}
<Image
  src="/og-image.webp"
  alt="Company List Builder"
  width={1200}
  height={630}
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
  priority={isAboveFold}
  loading={isAboveFold ? undefined : "lazy"}
/>
```

---

## 8. 禁止パターン

レスポンシブ実装における禁止事項。

| 禁止 | 理由 | 代替手段 |
|------|------|---------|
| `display: none` で大量DOM非表示 | DOMサイズ肥大化 | 条件分岐でレンダリング自体を制御 |
| `position: fixed` + `overflow: hidden` on body | iOS Safari のバグ | `Sheet` コンポーネントの標準機能を使用 |
| ビューポート単位 `vh` 単体使用 | モバイルアドレスバーで高さ変動 | `dvh`（dynamic viewport height）を使用 |
| `user-scalable=no` | アクセシビリティ違反 | 使用禁止 |
| 横スクロール（ページ全体） | UX悪化 | `overflow-x-auto` を特定要素のみに限定 |
| `backdrop-filter: blur()` | パフォーマンスコスト大 | 半透明背景（`bg-white/80`）で代替 |
| レイアウトプロパティのアニメーション | リフロー発生 | `transform`, `opacity`, `max-height` のみ使用 |

---

*Generated by CodeGenAgent (Gen) - Phase 2: Design*
*Project: Company List Builder*
