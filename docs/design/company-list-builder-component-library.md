# Company List Builder - コンポーネントライブラリ

Phase 2 設計ドキュメント。`company-list-builder-design-system.yml` に基づくコンポーネント設計。

**作成日**: 2026-03-05
**ソース**: `docs/design/company-list-builder-design-system.yml`

---

## 1. 概要

Company List Builder のUIコンポーネントを3つのティアに分類する。

| ティア | 説明 | 例 |
|--------|------|----|
| **Tier 1** | shadcn/ui をそのまま、またはテーマカスタマイズのみで使用 | Button, Input, Dialog, Sheet |
| **Tier 2** | ビジネスロジックを含むカスタムコンポーネント | IndustryTree, CompanyTable, LiveCounter |
| **Tier 3** | レイアウト・ページ構造コンポーネント | SearchLayout, DashboardLayout |

**技術スタック**:
- shadcn/ui（Radix UI + Tailwind CSS）
- TanStack Table v8
- Recharts
- react-simple-maps
- Lucide React
- CSS transitions（motion/react は不使用）

---

## 2. インストール手順

### 2.1 shadcn/ui 初期化

```bash
npx shadcn@latest init
```

### 2.2 必要な shadcn/ui コンポーネント

```bash
npx shadcn@latest add button input checkbox label badge \
  dialog sheet dropdown-menu select separator scroll-area \
  table tooltip tabs command popover accordion skeleton \
  progress card alert
```

### 2.3 追加依存パッケージ

```bash
npm install @tanstack/react-table recharts react-simple-maps \
  lucide-react topojson-client
npm install -D @types/topojson-client
```

### 2.4 フォント設定（next/font）

```typescript
// src/lib/fonts.ts
import { Outfit, Noto_Sans_JP, JetBrains_Mono } from "next/font/google";

export const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

export const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});
```

---

## 3. tailwind.config.ts

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // ライトモード固定だが将来拡張のため残す
  content: [
    "./src/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0a0a0a",
        secondary: "#404040",
        accent: "#2563eb",
        "accent-success": "#059669",
        background: {
          DEFAULT: "#ffffff",
          surface: "#f8fafc",
          filter: "#f1f5f9",
        },
        border: "#e2e8f0",
        "text-primary": "#0a0a0a",
        "text-secondary": "#64748b",
        success: "#059669",
        error: "#dc2626",
        warning: "#d97706",
      },
      fontFamily: {
        heading: ["var(--font-outfit)", "var(--font-noto-sans-jp)", "system-ui", "sans-serif"],
        body: ["var(--font-noto-sans-jp)", "var(--font-outfit)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        h1: ["2.25rem", { lineHeight: "1.3", letterSpacing: "-0.02em", fontWeight: "700" }],
        h2: ["1.5rem", { lineHeight: "1.3", letterSpacing: "-0.02em", fontWeight: "600" }],
        h3: ["1.25rem", { lineHeight: "1.3", letterSpacing: "-0.02em", fontWeight: "600" }],
        h4: ["1.125rem", { lineHeight: "1.3", letterSpacing: "-0.02em", fontWeight: "500" }],
        body: ["0.875rem", { lineHeight: "1.6" }],
        "table-data": ["0.8125rem", { lineHeight: "1.5" }],
        cta: ["0.9375rem", { lineHeight: "1.4", fontWeight: "600" }],
        "counter-lg": ["1.5rem", { lineHeight: "1.4", fontWeight: "700" }],
        counter: ["1rem", { lineHeight: "1.4", fontWeight: "500" }],
      },
      borderRadius: {
        button: "6px",
        card: "8px",
        modal: "12px",
        input: "6px",
        chip: "9999px",
        dropdown: "8px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0, 0, 0, 0.05)",
        dropdown: "0 4px 6px rgba(0, 0, 0, 0.07)",
        modal: "0 20px 25px rgba(0, 0, 0, 0.1)",
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
        "3xl": "64px",
      },
      transitionDuration: {
        fast: "100ms",
        DEFAULT: "150ms",
      },
      transitionTimingFunction: {
        DEFAULT: "ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

---

## 4. globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* カラー変数 */
    --color-primary: #0a0a0a;
    --color-secondary: #404040;
    --color-accent: #2563eb;
    --color-accent-success: #059669;
    --color-bg-main: #ffffff;
    --color-bg-surface: #f8fafc;
    --color-bg-filter: #f1f5f9;
    --color-border: #e2e8f0;
    --color-text-primary: #0a0a0a;
    --color-text-secondary: #64748b;
    --color-success: #059669;
    --color-error: #dc2626;
    --color-warning: #d97706;

    /* タイポグラフィ変数 */
    --font-heading: var(--font-outfit), var(--font-noto-sans-jp), system-ui, sans-serif;
    --font-body: var(--font-noto-sans-jp), var(--font-outfit), system-ui, sans-serif;
    --font-mono: var(--font-jetbrains-mono), ui-monospace, monospace;

    /* Shadows - tailwind.config.ts の boxShadow 拡張で定義済み */
    /* shadow-card: 0 1px 2px rgba(0, 0, 0, 0.05) */
    /* shadow-dropdown: 0 4px 6px rgba(0, 0, 0, 0.07) */
    /* shadow-modal: 0 20px 25px rgba(0, 0, 0, 0.1) */
  }

  body {
    font-family: var(--font-body);
    color: var(--color-text-primary);
    background-color: var(--color-bg-main);
    font-size: 0.875rem;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4 {
    font-family: var(--font-heading);
    letter-spacing: -0.02em;
  }
}

@layer utilities {
  /* 数値表示用: tabular-nums + 等幅フォント */
  .tabular-nums {
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
  }

  /* テキストバランス */
  .text-balance {
    text-wrap: balance;
  }

  /* フォーカスリング統一 */
  .focus-ring {
    @apply outline-none ring-2 ring-accent ring-offset-2;
  }

  /* テーブルのコンパクト行 */
  .table-compact tr {
    height: 36px;
  }

  /* スクロールバー非表示（モバイルドロワー用） */
  .scrollbar-none {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .scrollbar-none::-webkit-scrollbar {
    display: none;
  }
}

/* reduced-motion対応 */
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

---

## 5. Tier 1: shadcn/ui コンポーネント

shadcn/ui をそのまま使用し、テーマカスタマイズのみ適用するコンポーネント一覧。

| コンポーネント | 用途 | カスタマイズ内容 |
|-------------|------|----------------|
| `Button` | CTA、セカンダリアクション | `rounded-button` 適用、accent/primary バリアント |
| `Input` | テキスト入力、検索窓 | `rounded-input` 適用、focus: ring-accent |
| `Checkbox` | 業種・地域の選択 | accent カラー適用 |
| `Label` | フォームラベル | text-secondary、font-body |
| `Badge` | ステータス表示 | success/error/warning バリアント追加 |
| `Dialog` | 企業詳細モーダル | `rounded-modal`、shadow-modal 適用 |
| `Sheet` | モバイルフィルタドロワー | 左からスライドイン |
| `DropdownMenu` | カラム選択、ソート選択 | `rounded-dropdown`、shadow-dropdown |
| `Select` | 文字コード選択、ダウンロード形式 | accent カラー適用 |
| `Separator` | セクション区切り | border カラー適用 |
| `ScrollArea` | フィルタサイドバーのスクロール | スクロールバー最小化 |
| `Table` | テーブルのベーススタイル | TanStack Table と組み合わせ使用 |
| `Tooltip` | 操作ヒント | 150ms delay |
| `Tabs` | ダッシュボードのタブ切替 | accent カラー適用 |
| `Command` | 業種・地域のオートコンプリート検索 | フィルタ内で使用 |
| `Popover` | フィルタ詳細の展開 | shadow-dropdown |
| `Accordion` | モバイルのフィルタセクション展開 | CSS transition: max-height + opacity |
| `Skeleton` | データ読み込み中 | surface カラー適用 |
| `Progress` | ダウンロード残数バー | accent/warning カラー |
| `Card` | ダッシュボードカード、料金カード | `rounded-card`、shadow-card + border |
| `Alert` | エラー・警告表示 | error/warning バリアント |

### Button バリアント定義

```typescript
// buttonVariants カスタマイズ
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-button text-cta font-semibold transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-accent text-white hover:bg-accent/90",
        secondary: "bg-background-surface text-primary border border-border hover:bg-background-filter",
        destructive: "bg-error text-white hover:bg-error/90",
        ghost: "hover:bg-background-surface",
        link: "text-accent underline-offset-4 hover:underline",
        success: "bg-accent-success text-white hover:bg-accent-success/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-body",
        lg: "h-12 px-6",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

---

## 6. Tier 2: カスタムコンポーネント

### 6.1 IndustryTree（業種ツリー）

日本標準産業分類の階層構造をチェックボックスツリーで表示する。

```typescript
interface IndustryNode {
  code: string;           // 分類コード
  name: string;           // 分類名（例: "E 製造業"）
  level: "major" | "middle" | "minor" | "detail";
  children?: IndustryNode[];
}

interface IndustryTreeProps {
  /** 業種分類データ */
  industries: IndustryNode[];
  /** 選択中の業種コード配列 */
  selectedCodes: string[];
  /** 選択変更コールバック */
  onSelectionChange: (codes: string[]) => void;
  /** テキスト検索でのフィルタリング */
  searchQuery?: string;
  /** 最大表示階層（デフォルト: 全階層） */
  maxDepth?: number;
  /** 読み込み中 */
  loading?: boolean;
}
```

**構成**:
- `Command` コンポーネントで業種名のオートコンプリート検索
- `Checkbox` + インデントで階層表示
- 親ノード選択時に子ノードを全選択/全解除
- 展開/折りたたみは `max-height` + `opacity` の CSS transition（150ms ease-out）

**使用例**:

```tsx
<IndustryTree
  industries={industryData}
  selectedCodes={selectedIndustries}
  onSelectionChange={setSelectedIndustries}
  searchQuery={industrySearch}
/>
```

---

### 6.2 RegionCascader（地域カスケード選択）

都道府県 → 市区町村のカスケード選択を提供する。

```typescript
interface Prefecture {
  code: string;       // 都道府県コード（2桁）
  name: string;       // 都道府県名
  region: string;     // 地方区分（北海道、東北、関東、中部、近畿、中国、四国、九州・沖縄）
}

interface City {
  code: string;       // 市区町村コード（5桁）
  prefectureCode: string;
  name: string;
}

interface RegionCascaderProps {
  /** 都道府県データ */
  prefectures: Prefecture[];
  /** 市区町村データ（選択した都道府県に対応） */
  cities: City[];
  /** 選択中の都道府県コード */
  selectedPrefectures: string[];
  /** 選択中の市区町村コード */
  selectedCities: string[];
  /** 都道府県選択コールバック */
  onPrefectureChange: (codes: string[]) => void;
  /** 市区町村選択コールバック */
  onCityChange: (codes: string[]) => void;
  /** テキスト検索クエリ */
  searchQuery?: string;
  /** 読み込み中 */
  loading?: boolean;
}
```

**構成**:
- 地方区分ヘッダーで一括選択ボタン（例: 「関東すべて」）
- 都道府県 `Checkbox` リスト
- 都道府県選択後、市区町村がカスケード表示
- `Command` でテキスト検索対応

**使用例**:

```tsx
<RegionCascader
  prefectures={prefectureData}
  cities={cityData}
  selectedPrefectures={selectedPrefs}
  selectedCities={selectedCities}
  onPrefectureChange={setSelectedPrefs}
  onCityChange={setSelectedCities}
/>
```

---

### 6.3 LiveCounter（ライブカウンター）

検索結果件数をリアルタイムで表示し、変化時にカウントアップアニメーションを行う。

```typescript
interface LiveCounterProps {
  /** 表示する件数 */
  count: number;
  /** 件数のラベル（例: "件"） */
  suffix?: string;
  /** プレフィックスラベル（例: "検索結果:"） */
  prefix?: string;
  /** サイズバリアント */
  size?: "default" | "large";
  /** 読み込み中 */
  loading?: boolean;
}
```

**構成**:
- `font-mono tabular-nums` で桁揃え表示
- `toLocaleString()` でカンマ区切り
- 件数変化時に `opacity` + `transform` の CSS transition（150ms ease-out）
- `size="large"` で `text-counter-lg`（検索結果ヘッダー用）

**使用例**:

```tsx
<LiveCounter
  count={12345}
  prefix="検索結果:"
  suffix="件"
  size="large"
/>
{/* 出力: 検索結果: 12,345 件 */}
```

---

### 6.4 CompanyTable（企業テーブル）

TanStack Table を使用した高機能データテーブル。

```typescript
interface Company {
  id: string;
  corporateNumber: string;
  name: string;
  prefectureName: string;
  cityName: string;
  industryNames: string[];
  capital: number | null;
  employeeCount: number | null;
  representativeName: string | null;
  websiteUrl: string | null;
  establishmentDate: string | null;
}

interface CompanyTableProps {
  /** 企業データ配列 */
  data: Company[];
  /** 総件数（ページネーション用） */
  totalCount: number;
  /** 現在ページ（0始まり） */
  pageIndex: number;
  /** ページサイズ */
  pageSize: number;
  /** ページ変更コールバック */
  onPageChange: (pageIndex: number) => void;
  /** ページサイズ変更コールバック */
  onPageSizeChange: (pageSize: number) => void;
  /** ソート状態 */
  sorting: SortingState;
  /** ソート変更コールバック */
  onSortingChange: (sorting: SortingState) => void;
  /** 表示カラム制御 */
  columnVisibility: VisibilityState;
  /** カラム表示変更コールバック */
  onColumnVisibilityChange: (visibility: VisibilityState) => void;
  /** 行クリックコールバック（企業詳細表示） */
  onRowClick?: (company: Company) => void;
  /** コンパクトモード */
  compact?: boolean;
  /** 読み込み中 */
  loading?: boolean;
}
```

**構成**:
- TanStack Table v8 のヘッドレスUI + shadcn/ui `Table` コンポーネント
- `text-table-data`（0.8125rem）でデータ密度最大化
- カラム幅リサイズ対応（`columnResizeMode: "onChange"`）
- ソートアイコン（Lucide `ArrowUpDown`）
- ページネーション: keyset pagination 対応
- 行ホバー: `background-color` transition（100ms ease-out）
- 交互色: `bg-background-surface`
- コンパクトモード: 行高 36px
- `aria-label` 必須（スクリーンリーダー対応）

**使用例**:

```tsx
<CompanyTable
  data={companies}
  totalCount={totalCount}
  pageIndex={page}
  pageSize={50}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
  sorting={sorting}
  onSortingChange={setSorting}
  columnVisibility={columnVisibility}
  onColumnVisibilityChange={setColumnVisibility}
  onRowClick={handleCompanyClick}
  compact
/>
```

---

### 6.5 FilterChipBar（フィルタチップバー）

選択中のフィルタ条件をpill型バッジで表示し、個別・一括削除を提供する。

```typescript
interface FilterChip {
  id: string;
  category: "industry" | "region" | "detail";
  label: string;        // 表示テキスト（例: "E 製造業", "東京都"）
  value: string;         // フィルタ値（コード等）
}

interface FilterChipBarProps {
  /** 表示するフィルタチップ配列 */
  chips: FilterChip[];
  /** チップ削除コールバック */
  onRemove: (chipId: string) => void;
  /** 全クリアコールバック */
  onClearAll: () => void;
  /** 最大表示数（超過時は "+N" 表示） */
  maxVisible?: number;
}
```

**構成**:
- `Badge` コンポーネントベース、`rounded-chip`（pill型）
- カテゴリ別のカラーコーディング（業種: accent、地域: accent-success、詳細: secondary）
- 各チップに `X` ボタン（Lucide `X` アイコン）
- 右端に「すべてクリア」ボタン
- `maxVisible` 超過時は「+3件」のようなサマリーチップ

**使用例**:

```tsx
<FilterChipBar
  chips={activeFilters}
  onRemove={handleRemoveFilter}
  onClearAll={handleClearAll}
  maxVisible={8}
/>
```

---

### 6.6 DownloadPanel（ダウンロードパネル）

ダウンロード形式・文字コード選択とダウンロード残数を表示する。

```typescript
interface DownloadPanelProps {
  /** 検索結果件数 */
  resultCount: number;
  /** 今月のダウンロード済み件数 */
  downloadedCount: number;
  /** プラン別上限 */
  downloadLimit: number;
  /** ダウンロード実行コールバック */
  onDownload: (options: DownloadOptions) => void;
  /** ダウンロード中フラグ */
  downloading?: boolean;
  /** 大量件数の非同期生成中 */
  asyncProcessing?: boolean;
}

interface DownloadOptions {
  format: "csv" | "xlsx";
  encoding: "utf-8" | "shift-jis";
  columns: string[];     // ダウンロード対象カラム
}
```

**構成**:
- 形式選択: `Select`（CSV / Excel）
- 文字コード選択: `Select`（UTF-8 / Shift-JIS）
- 残数プログレスバー: `Progress`（accent カラー、上限接近時は warning）
- ダウンロードボタン: `Button variant="default"`
- 5,000件超の場合は非同期生成の案内テキスト表示
- ダウンロード完了時にチェックマーク CSS animation

**使用例**:

```tsx
<DownloadPanel
  resultCount={12345}
  downloadedCount={150}
  downloadLimit={3000}
  onDownload={handleDownload}
/>
```

---

### 6.7 JapanHeatmap（日本地図ヒートマップ）

都道府県別の企業数を日本地図上にヒートマップ表示する。

```typescript
interface PrefectureStat {
  code: string;           // 都道府県コード
  name: string;           // 都道府県名
  companyCount: number;   // 企業数
}

interface JapanHeatmapProps {
  /** 都道府県別データ */
  data: PrefectureStat[];
  /** 都道府県クリックコールバック */
  onPrefectureClick?: (prefectureCode: string) => void;
  /** カラーレンジ（最小→最大） */
  colorRange?: [string, string];
  /** 高さ */
  height?: number;
  /** 読み込み中 */
  loading?: boolean;
}
```

**構成**:
- `react-simple-maps` で日本地図 TopoJSON を描画
- 企業数の多寡で `accent`（#2563eb）の濃淡を変化
- ツールチップ: 都道府県名 + 件数（`Tooltip` コンポーネント）
- ホバー時に `opacity` transition（150ms ease-out）
- 凡例バー: 最小値 → 最大値のグラデーション

**使用例**:

```tsx
<JapanHeatmap
  data={prefectureStats}
  onPrefectureClick={handlePrefectureSelect}
  colorRange={["#dbeafe", "#2563eb"]}
  height={500}
/>
```

---

### 6.8 PricingTable（料金プランテーブル）

3プランの比較テーブル。

```typescript
interface PricingPlan {
  id: string;
  name: string;          // "Free" | "Starter" | "Pro"
  price: number;         // 月額（円）
  downloadLimit: number; // 月間ダウンロード上限
  features: {
    searchLimit: string;
    savedSearches: string;
    notification: string;
    formats: string;
  };
  recommended?: boolean;
}

interface PricingTableProps {
  /** プラン配列 */
  plans: PricingPlan[];
  /** 現在のプラン */
  currentPlan?: string;
  /** プラン選択コールバック */
  onSelectPlan: (planId: string) => void;
}
```

**構成**:
- 3カラム横並び（モバイルは縦積み）
- 推奨プランに `border-accent` ハイライト + 「おすすめ」バッジ
- 価格は `font-mono tabular-nums text-h2`
- 現在のプランは「現在のプラン」表示 + ボタン無効化
- 各プランに `Card` コンポーネント使用

**使用例**:

```tsx
<PricingTable
  plans={pricingPlans}
  currentPlan={user?.plan}
  onSelectPlan={handleSelectPlan}
/>
```

---

### 6.9 SearchPreview（検索プレビュー）

LP のヒーローセクションに配置するミニ検索フォーム。

```typescript
interface SearchPreviewProps {
  /** 業種選択肢 */
  industries: { code: string; name: string }[];
  /** 都道府県選択肢 */
  prefectures: { code: string; name: string }[];
  /** 検索プレビュー結果件数 */
  previewCount: number | null;
  /** 業種変更コールバック */
  onIndustryChange: (code: string) => void;
  /** 都道府県変更コールバック */
  onPrefectureChange: (code: string) => void;
  /** 検索実行コールバック */
  onSearch: () => void;
  /** 読み込み中 */
  loading?: boolean;
}
```

**構成**:
- 業種 `Select` + 都道府県 `Select` + 検索 `Button`
- 件数結果を `LiveCounter` で表示（「12,345件見つかりました」）
- コンパクトなフォーム配置（1行または2行）
- 未認証でもプレビュー件数表示可能

**使用例**:

```tsx
<SearchPreview
  industries={majorIndustries}
  prefectures={prefectureList}
  previewCount={previewCount}
  onIndustryChange={setSelectedIndustry}
  onPrefectureChange={setSelectedPrefecture}
  onSearch={handleSearch}
/>
```

---

## 7. Tier 3: レイアウトコンポーネント

### 7.1 SearchLayout

メイン検索画面のレイアウト。左サイドバー（フィルタ）+ 右メインエリア（テーブル）の2カラム構成。

```typescript
interface SearchLayoutProps {
  /** フィルタサイドバーの内容 */
  sidebar: React.ReactNode;
  /** メインコンテンツ（テーブル等） */
  children: React.ReactNode;
  /** フィルタチップバー */
  filterBar?: React.ReactNode;
  /** モバイルでフィルタ表示中か */
  filterOpen?: boolean;
  /** フィルタ開閉コールバック */
  onFilterToggle?: () => void;
}
```

**レイアウト**:
- デスクトップ（`lg` 以上）: `grid grid-cols-[280px_1fr]`
- モバイル: フィルタは `Sheet`（ドロワー）として左からスライドイン
- フィルタサイドバー: `bg-background-filter` + `overflow-y-auto`

---

### 7.2 DashboardLayout

ダッシュボード画面のレイアウト。サイドナビ + メインエリア。

```typescript
interface DashboardLayoutProps {
  /** サイドナビゲーションの内容 */
  navigation: React.ReactNode;
  /** メインコンテンツ */
  children: React.ReactNode;
  /** ページタイトル */
  title: string;
}
```

**レイアウト**:
- デスクトップ: `grid grid-cols-[240px_1fr]`
- モバイル: ハンバーガーメニュー + `Sheet` ナビ

---

### 7.3 AppHeader

全ページ共通のヘッダーコンポーネント。

```typescript
interface AppHeaderProps {
  /** 現在の認証状態 */
  isAuthenticated: boolean;
  /** 現在のプラン */
  currentPlan?: string;
  /** ナビゲーション項目 */
  navItems: { label: string; href: string; active?: boolean }[];
}
```

**構成**:
- ロゴ（左端）
- ナビゲーション: 検索 | 統計 | 料金（中央、デスクトップのみ）
- 認証ボタン: ログイン/ユーザーメニュー（右端）
- モバイル: ハンバーガーメニュー
- `border-b border-border` で下線区切り
- 高さ: `h-14`（56px）

---

### 7.4 MobileFilterDrawer

モバイル用フィルタドロワー。`Sheet` コンポーネントをラップする。

```typescript
interface MobileFilterDrawerProps {
  /** 開閉状態 */
  open: boolean;
  /** 閉じるコールバック */
  onClose: () => void;
  /** フィルタ内容 */
  children: React.ReactNode;
  /** 選択中のフィルタ件数 */
  activeFilterCount: number;
  /** 検索結果件数 */
  resultCount: number;
}
```

**構成**:
- `Sheet side="left"` で左からスライドイン
- ヘッダー: 「フィルタ」タイトル + 閉じるボタン
- フッター: 「{resultCount}件を表示」ボタン（フィルタ適用 + ドロワー閉じ）
- スクロール: `ScrollArea` で縦スクロール
- 幅: `w-[85vw] max-w-[360px]`

---

### 7.5 StickyDownloadBar

モバイルでの画面下部固定ダウンロードバー。

```typescript
interface StickyDownloadBarProps {
  /** 検索結果件数 */
  resultCount: number;
  /** ダウンロード残数 */
  remainingDownloads: number;
  /** ダウンロードボタンクリック */
  onDownload: () => void;
  /** 表示するかどうか（検索結果がある場合のみ） */
  visible: boolean;
}
```

**構成**:
- `fixed bottom-0 left-0 right-0` で画面下固定
- `bg-white border-t border-border shadow-card`
- `pb-[env(safe-area-inset-bottom)]` でiOSのSafe Area対応
- 件数表示 + ダウンロードボタン（横並び）
- `lg` 以上では非表示（DownloadPanel をテーブル下に配置）

---

## 8. アイコン規約（Lucide React）

全アイコンは Lucide React を使用する。独自SVGの追加は禁止。

### 用途別アイコンマッピング

| 用途 | アイコン名 | 使用箇所 |
|------|-----------|---------|
| 検索 | `Search` | 検索窓、ナビ |
| フィルタ | `SlidersHorizontal` | モバイルフィルタボタン |
| 業種 | `Factory` | 業種セクションヘッダー |
| 地域 | `MapPin` | 地域セクションヘッダー |
| 詳細フィルタ | `Settings2` | 詳細フィルタセクション |
| ダウンロード | `Download` | ダウンロードボタン |
| CSV | `FileSpreadsheet` | CSV形式 |
| Excel | `FileSpreadsheet` | Excel形式 |
| 展開 | `ChevronDown` | ツリー展開 |
| 折りたたみ | `ChevronRight` | ツリー折りたたみ |
| 削除 | `X` | フィルタチップ削除 |
| 全クリア | `XCircle` | フィルタ全クリア |
| ソート | `ArrowUpDown` | テーブルヘッダーソート |
| 外部リンク | `ExternalLink` | gBizINFO・法人番号リンク |
| 保存 | `Bookmark` | 検索条件保存 |
| 通知 | `Bell` | 新規法人通知 |
| 設定 | `Settings` | 設定画面 |
| ユーザー | `User` | アカウントメニュー |
| チェック | `Check` | ダウンロード完了 |
| 警告 | `AlertTriangle` | 上限接近 |
| エラー | `AlertCircle` | エラー表示 |
| 成功 | `CheckCircle` | 成功表示 |
| メニュー | `Menu` | ハンバーガーメニュー |
| 閉じる | `X` | モーダル・ドロワー閉じ |

### アイコンサイズ規約

| コンテキスト | サイズ | Tailwindクラス |
|-------------|--------|---------------|
| インラインテキスト | 16px | `size-4` |
| ボタン内 | 16px | `size-4` |
| セクションヘッダー | 20px | `size-5` |
| 大きなアクション | 24px | `size-6` |

---

## 9. 禁止パターン（Anti-Patterns）

### フォント

| 禁止 | 理由 |
|------|------|
| Inter | AI Slop - ジェネリックフォント |
| Roboto | AI Slop - ジェネリックフォント |
| Arial | AI Slop - ジェネリックフォント |
| Space Grotesk | AI Slop - AI生成の典型フォント |

### カラー・エフェクト

| 禁止 | 理由 |
|------|------|
| 紫グラデーション on 白背景 | AI生成の典型パターン |
| 過剰なドロップシャドウ | brutally-minimal に反する |
| グロー効果 | brutally-minimal に反する |
| 過度な装飾・イラスト | データツールに不要な装飾 |

### レイアウト

| 禁止 | 理由 |
|------|------|
| cookie-cutter design | 差別化不足 |
| 予測可能なレイアウトパターン | 参照サイトと差別化できない |
| ヒーローに大きな画像/イラスト | テキストと数字で訴求する方針 |

### アニメーション

| 禁止 | 理由 |
|------|------|
| motion/react ライブラリ | CSS transitions のみ使用（C-01確定方針） |
| bounce / spring エフェクト | ツール系UIに過度な演出は不要 |
| 3秒以上の連続アニメーション | ユーザー操作を阻害 |
| height の直接 transition | max-height + opacity を使用（C-02確定方針） |
| layout属性のアニメーション | compositor props（transform, opacity）のみ許可 |

### コンポーネント

| 禁止 | 理由 |
|------|------|
| Lucide React 以外のアイコンライブラリ | 統一性確保 |
| shadcn/ui 以外のUIライブラリ混在 | 依存関係の肥大化防止 |
| カスタムスクロールバー実装 | ブラウザネイティブを尊重 |

---

*Generated by CodeGenAgent (Gen) - Phase 2: Design*
*Project: Company List Builder*
