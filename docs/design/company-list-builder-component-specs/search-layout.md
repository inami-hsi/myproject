# SearchLayout コンポーネント仕様

P0コンポーネント。検索画面2カラムレイアウト。

**作成日**: 2026-03-05
**ソース**: `docs/design/company-list-builder-design-system.yml`、`docs/design/company-list-builder-component-library.md`

---

## 1. 概要

| 項目 | 内容 |
|------|------|
| 役割 | メイン検索画面の2カラムレイアウト（左フィルタサイドバー + 右メインエリア）を提供する |
| 使用画面 | メイン検索画面（`/search`） |
| ベース技術 | CSS Grid + shadcn/ui Sheet（モバイルドロワー） |
| ティア | Tier 3（レイアウトコンポーネント） |
| 優先度 | P0 |
| 関連課題 | C-01解決: 機能的レイアウトとして左フィルタ+右テーブルを許容 |

---

## 2. Props定義

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
  /** 選択中のフィルタ件数（モバイルバッジ表示用） */
  activeFilterCount?: number;
}
```

---

## 3. ビジュアル仕様

### デスクトップ（lg: 1024px以上）

```
┌──────────────────────────────────────────────────────────┐
│  [HEADER h-14]  Logo    検索   統計   料金     ログイン  │
├──────────────────────────────────────────────────────────┤
│  ┌─FilterChipBar (filterBar)─────────────────────────┐  │
│  │ [E 製造業 x] [東京都 x] [資本金:1000万〜 x]      │  │  ← px-lg
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──SIDEBAR──────┐  ┌──MAIN─────────────────────────┐  │
│  │ w-[280px]     │  │ flex-1  min-w-0               │  │
│  │               │  │                               │  │
│  │ bg-filter     │  │ LiveCounter                   │  │
│  │ border-r      │  │ CompanyTable                  │  │
│  │ overflow-y    │  │ Pagination                    │  │
│  │ auto          │  │ DownloadPanel                 │  │
│  │               │  │                               │  │
│  │ [IndustryTree]│  │                               │  │
│  │ [RegionCasc.] │  │                               │  │
│  │ [DetailFilter]│  │                               │  │
│  │               │  │                               │  │
│  │ [リセット]    │  │                               │  │
│  └───────────────┘  └───────────────────────────────┘  │
│                                                          │
│  gap-0 (サイドバーのborder-rで区切り)                    │
└──────────────────────────────────────────────────────────┘
```

### モバイル（lg未満）

```
┌────────────────────────────┐
│ [HEADER h-14]  Logo   [=]  │
├────────────────────────────┤
│ ┌─FilterChipBar──────────┐ │  ← 横スクロール
│ │ [製造業 x] [東京都 x]  │ │
│ └────────────────────────┘ │
│                             │
│ 検索結果: 12,345件          │  ← LiveCounter
│ ┌────────────────────────┐ │
│ │ [フィルタ] 2件選択中   │ │  ← フィルタ開閉ボタン
│ └────────────────────────┘ │
│                             │
│  (MAIN: children)           │
│  CompanyCardList            │
│         ...                 │
│                             │
├────────────────────────────┤
│ [StickyDownloadBar]         │
└────────────────────────────┘

       + Sheet (left)
┌──────────────────┐
│ フィルタ    [x]  │
│                  │
│ [IndustryTree]   │
│ [RegionCascader] │
│ [DetailFilter]   │
│                  │
│ [リセット]       │
│                  │
│ ┌──────────────┐ │
│ │ 12,345件表示 │ │  ← フィルタ適用ボタン
│ └──────────────┘ │
└──────────────────┘
```

---

## 4. スタイル仕様

### ルートレイアウト

```tsx
export function SearchLayout({
  sidebar,
  children,
  filterBar,
  filterOpen,
  onFilterToggle,
  activeFilterCount,
}: SearchLayoutProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return (
    <div className="min-h-[calc(100dvh-56px)]">
      {/* FilterChipBar */}
      {filterBar && (
        <div className="px-md lg:px-lg border-b border-border">
          {filterBar}
        </div>
      )}

      {/* 2カラムレイアウト（デスクトップ）*/}
      {isDesktop ? (
        <div className="grid grid-cols-[280px_1fr]">
          {/* サイドバー */}
          <aside className="bg-background-filter border-r border-border overflow-y-auto h-[calc(100dvh-56px)] px-md py-md sticky top-14">
            {sidebar}
          </aside>
          {/* メインエリア */}
          <main className="min-w-0 px-lg py-md">
            {children}
          </main>
        </div>
      ) : (
        <>
          {/* モバイル: フィルタボタン + メインコンテンツ */}
          <div className="px-md py-md">
            <MobileFilterButton
              activeCount={activeFilterCount ?? 0}
              onClick={onFilterToggle}
            />
            <main className="mt-md">
              {children}
            </main>
          </div>
          {/* モバイル: フィルタドロワー */}
          <MobileFilterDrawer
            open={filterOpen ?? false}
            onClose={() => onFilterToggle?.()}
          >
            {sidebar}
          </MobileFilterDrawer>
        </>
      )}
    </div>
  );
}
```

### サイドバー

| プロパティ | 値 | 説明 |
|-----------|-----|------|
| 幅 | `w-[280px]` | 固定幅。280pxはフィルタUIに十分かつテーブルを圧迫しない |
| 背景色 | `bg-background-filter`（#f1f5f9） | メインエリアとの視覚的区別 |
| 右ボーダー | `border-r border-border`（#e2e8f0） | 2カラムの区切り |
| スクロール | `overflow-y-auto` | フィルタ項目が多い場合にスクロール可能 |
| 高さ | `h-[calc(100dvh-56px)]` | ヘッダー高（56px）を引いたビューポート全高 |
| 固定 | `sticky top-14` | スクロール時もサイドバーは固定 |
| パディング | `px-md py-md`（16px） | 内部のネガティブスペース確保 |

### メインエリア

| プロパティ | 値 | 説明 |
|-----------|-----|------|
| 幅 | `flex-1 min-w-0` | 残りスペースを使用。テーブルのオーバーフロー防止 |
| パディング | `px-lg py-md`（24px / 16px） | サイドバーとの視覚的バランス |

### モバイルフィルタボタン

```tsx
function MobileFilterButton({
  activeCount,
  onClick,
}: {
  activeCount: number;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-xs rounded-button border border-border px-md py-sm text-body font-body text-primary hover:bg-background-surface transition-colors duration-fast min-h-[44px]"
      aria-label="フィルタを開く"
      aria-expanded={false}
    >
      <SlidersHorizontal className="size-4" />
      フィルタ
      {activeCount > 0 && (
        <span className="inline-flex items-center justify-center rounded-full bg-accent text-white text-xs size-5">
          {activeCount}
        </span>
      )}
    </button>
  );
}
```

---

## 5. 状態仕様

| 状態 | 視覚表現 |
|------|---------|
| default（デスクトップ） | 2カラムグリッド表示。サイドバー常時表示 |
| default（モバイル） | 1カラム。フィルタはドロワーで非表示 |
| filter-open（モバイル） | Sheet（ドロワー）が左からスライドイン |
| filter-closed（モバイル） | Sheet 非表示 |
| has-filters | FilterChipBar がボーダーの下に表示される |
| no-filters | FilterChipBar 非表示（空間を空けない） |
| scrolled | サイドバーが `sticky` で固定。メインエリアのみスクロール |

---

## 6. アニメーション仕様

| シーン | プロパティ | 値 |
|--------|-----------|-----|
| モバイルドロワー開閉 | `transform` | Sheet コンポーネントのデフォルト（translateX） |
| フィルタボタンホバー | `background-color` | 100ms ease-out |

レイアウト自体にはアニメーションを設けない。サイドバーの表示/非表示はブレークポイントで制御し、トランジションは使用しない。

---

## 7. アクセシビリティ仕様

### ARIA属性

| 要素 | 属性 | 値 |
|------|------|-----|
| サイドバー | `role` | `"complementary"`（`<aside>` の暗黙ロール） |
| サイドバー | `aria-label` | `"検索フィルタ"` |
| メインエリア | `role` | `"main"`（`<main>` の暗黙ロール） |
| モバイルフィルタボタン | `aria-label` | `"フィルタを開く"` |
| モバイルフィルタボタン | `aria-expanded` | `true` / `false` |
| MobileFilterDrawer | `aria-label` | `"検索フィルタ"` |

### ランドマーク構造

```
<header>  → AppHeader
<div>     → SearchLayout ルート
  <aside> → フィルタサイドバー（role="complementary"）
  <main>  → メインコンテンツ（role="main"）
</div>
```

### キーボード操作マップ

| キー | 動作 |
|------|------|
| `Tab` | サイドバー内要素 → メインエリア内要素 の順にフォーカス移動 |
| `Escape` | モバイルドロワーを閉じる |
| `F6` (オプション) | サイドバーとメインエリア間のフォーカス切替（ランドマーク間移動） |

---

## 8. レスポンシブ仕様

| ブレークポイント | レイアウト | サイドバー | メインエリアパディング |
|----------------|-----------|-----------|---------------------|
| base (0-639px) | 1カラム | Sheet ドロワー | `px-md`（16px） |
| sm (640-767px) | 1カラム | Sheet ドロワー | `px-md`（16px） |
| md (768-1023px) | 1カラム | Sheet ドロワー | `px-md`（16px） |
| lg (1024-1279px) | 2カラム `grid-cols-[280px_1fr]` | 常時表示 | `px-lg`（24px） |
| xl (1280px+) | 2カラム `grid-cols-[280px_1fr]` | 常時表示 | `px-lg`（24px） |

### 高さ計算

```css
/* ヘッダー高: 56px (h-14) */
/* サイドバー高: ビューポート高 - ヘッダー高 */
.sidebar {
  height: calc(100dvh - 56px);
}

/* dvh を使用（モバイルのアドレスバー考慮） */
```

### MobileFilterDrawer の詳細

| プロパティ | 値 |
|-----------|-----|
| 方向 | `side="left"` |
| 幅 | `w-[85vw] max-w-[360px]` |
| ヘッダー | 「フィルタ」タイトル + X 閉じるボタン |
| フッター | 「{resultCount}件を表示」ボタン（フィルタ適用 + ドロワー閉じ） |
| スクロール | `ScrollArea` で縦スクロール |
| Safe Area | `pb-[env(safe-area-inset-bottom)]` |

---

## 9. 依存関係

| パッケージ | 用途 |
|-----------|------|
| `shadcn/ui Sheet` | モバイルフィルタドロワー |
| `shadcn/ui ScrollArea` | サイドバーのスクロール |
| `lucide-react` | SlidersHorizontal, X アイコン |
| `@/hooks/use-media-query` | ブレークポイント判定 |

---

## 10. 使用例

```tsx
import { SearchLayout } from "@/components/search-layout";
import { FilterChipBar } from "@/components/filter-chip-bar";
import { IndustryTree } from "@/components/industry-tree";
import { RegionCascader } from "@/components/region-cascader";
import { LiveCounter } from "@/components/live-counter";
import { CompanyTable } from "@/components/company-table";
import { DownloadPanel } from "@/components/download-panel";

export function SearchPage() {
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <SearchLayout
      sidebar={
        <div className="space-y-md">
          <IndustryTree {...industryProps} />
          <Separator />
          <RegionCascader {...regionProps} />
          <Separator />
          <DetailFilters {...detailProps} />
          <Button
            variant="ghost"
            className="w-full"
            onClick={resetFilters}
          >
            リセット
          </Button>
        </div>
      }
      filterBar={
        <FilterChipBar
          chips={activeFilters}
          onRemove={removeFilter}
          onClearAll={clearAllFilters}
        />
      }
      filterOpen={filterOpen}
      onFilterToggle={() => setFilterOpen(!filterOpen)}
      activeFilterCount={activeFilters.length}
    >
      <div className="space-y-md">
        <LiveCounter
          count={totalCount}
          prefix="検索結果:"
          suffix="件"
          size="large"
          loading={isLoading}
        />
        <CompanyTable {...tableProps} />
        <DownloadPanel {...downloadProps} />
      </div>
    </SearchLayout>
  );
}
```

---

## 11. 禁止事項

| 禁止 | 理由 |
|------|------|
| サイドバー幅の可変リサイズ（ドラッグ） | 固定280pxで統一。リサイズの複雑性を排除 |
| サイドバーの折りたたみ（デスクトップ） | デスクトップではフィルタ常時表示がUX最適 |
| 3カラム以上のレイアウト | 2カラム（フィルタ+テーブル）で十分 |
| レイアウトのアニメーション遷移 | ブレークポイントで即時切替 |
| `position: fixed` のサイドバー | `sticky` を使用。fixedはスクロールコンテキストを破壊する |
| z-index: 50 以上の使用 | サイドバー: z-0、ドロワー: Sheet デフォルト値 |
| CSS Grid の `fr` 単位でのサイドバー幅指定 | `280px` の固定値を使用。`fr` はメインエリアのみ |

---

*Generated by CodeGenAgent (Gen) - Phase 2: Design*
*Project: Company List Builder*
