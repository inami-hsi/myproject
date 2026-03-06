# CompanyTable コンポーネント仕様

P0コンポーネント。メインデータテーブル + モバイルカード変換。

**作成日**: 2026-03-05
**ソース**: `docs/design/company-list-builder-design-system.yml`、`docs/design/company-list-builder-component-library.md`

---

## 1. 概要

| 項目 | 内容 |
|------|------|
| 役割 | 検索結果の企業データを一覧表示するメインテーブル |
| 使用画面 | メイン検索画面（SearchLayout のメインエリア） |
| ベース技術 | TanStack Table v8 + shadcn/ui Table |
| ティア | Tier 2（ビジネスロジック含むカスタムコンポーネント） |
| 優先度 | P0（最重要） |

---

## 2. Props定義

```typescript
import { SortingState, VisibilityState } from "@tanstack/react-table";

interface Company {
  id: string;
  corporateNumber: string;      // 法人番号（13桁）
  name: string;                 // 法人名
  prefectureName: string;       // 都道府県
  cityName: string;             // 市区町村
  industryNames: string[];      // 業種名（複数可）
  capital: number | null;       // 資本金（円）
  employeeCount: number | null; // 従業員数
  representativeName: string | null; // 代表者名
  websiteUrl: string | null;    // Webサイト
  establishmentDate: string | null; // 設立年月日
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
  /** 行クリックコールバック（企業詳細モーダル表示） */
  onRowClick?: (company: Company) => void;
  /** コンパクトモード（デスクトップのみ） */
  compact?: boolean;
  /** 読み込み中 */
  loading?: boolean;
}
```

---

## 3. ビジュアル仕様

### デスクトップ（lg: 1024px以上）

```
┌─────────────────────────────────────────────────────────────┐
│ 法人名         │ 業種     │ 所在地   │ 資本金    │ 従業員  │
│ ▲▼             │ ▲▼      │ ▲▼      │ ▲▼       │ ▲▼     │
├─────────────────────────────────────────────────────────────┤
│ ABC株式会社    │ E 製造業 │ 東京都   │ 10,000万 │ 250    │ ← bg-white
│                │          │ 千代田区 │          │        │
├─────────────────────────────────────────────────────────────┤
│ DEF株式会社    │ I 卸小売 │ 東京都   │  5,000万 │ 120    │ ← bg-surface
│                │          │ 中央区   │          │        │
├─────────────────────────────────────────────────────────────┤
│ GHI株式会社    │ G 情報   │ 大阪府   │  1,000万 │  45    │ ← bg-white
│                │ 通信業   │ 大阪市   │          │        │
├─────────────────────────────────────────────────────────────┤
│                              ...                            │
└─────────────────────────────────────────────────────────────┘
  < 前へ   1  2  3  ...  247   次へ >     50件/ページ ▼
```

### モバイル（lg未満）: カード表示（H-03解決）

```
┌────────────────────────────────┐
│  ABC株式会社                   │
│  ─────────────────             │
│  業種: E 製造業                │
│  所在地: 東京都 千代田区       │
│  資本金: 10,000万円            │
│  従業員: 250人                 │
│                          [>]  │
└────────────────────────────────┘
        gap-md (16px)
┌────────────────────────────────┐
│  DEF株式会社                   │
│  ─────────────────             │
│  業種: I 卸売業、小売業        │
│  所在地: 東京都 中央区         │
│  資本金: 5,000万円             │
│  従業員: 120人                 │
│                          [>]  │
└────────────────────────────────┘
```

---

## 4. スタイル仕様

### テーブル本体（デスクトップ）

```tsx
<div className="border border-border rounded-lg overflow-hidden">
  <table
    className="w-full text-table-data font-body"
    aria-label="企業検索結果テーブル"
    aria-rowcount={totalCount}
    aria-colcount={visibleColumnCount}
  >
    <thead>
      <tr className="border-b border-border bg-background-surface">
        <th className="px-md py-sm text-left font-heading text-body font-semibold text-primary">
          ...
        </th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-border transition-colors duration-fast hover:bg-background-surface h-[44px] cursor-pointer">
        ...
      </tr>
    </tbody>
  </table>
</div>
```

### カード表示（モバイル）

```tsx
<div className="flex flex-col gap-md">
  <div
    className="border border-border rounded-card p-md bg-white"
    role="button"
    tabIndex={0}
    aria-label={`${company.name} の詳細を表示`}
  >
    <h3 className="text-body font-heading font-semibold text-primary">
      {company.name}
    </h3>
    <Separator className="my-sm" />
    <dl className="text-table-data font-body text-secondary space-y-xs">
      <div className="flex justify-between">
        <dt className="text-slate-600">業種</dt>
        <dd>{company.industryNames.join("、")}</dd>
      </div>
      ...
    </dl>
  </div>
</div>
```

### 数値セルのスタイル

```tsx
<td className="px-md py-sm text-right font-mono tabular-nums text-table-data">
  {capital ? `${(capital / 10000).toLocaleString("ja-JP")}万` : "—"}
</td>
```

---

## 5. 状態仕様

| 状態 | 視覚表現 |
|------|---------|
| default | 交互色: 偶数行 `bg-white`、奇数行 `bg-background-surface` |
| hover | `bg-background-surface`（偶数行）/ `bg-background-filter`（奇数行）。`transition-colors duration-fast` |
| focus | `ring-2 ring-accent ring-offset-2`（行全体） |
| active | `bg-background-filter` |
| disabled | 該当なし（テーブルは常にインタラクティブ） |
| loading | `Skeleton` で行数分のプレースホルダー表示。カラムヘッダーは表示 |
| error | テーブル領域全体に `Alert variant="destructive"` を表示 |
| empty | 「条件に一致する企業が見つかりませんでした。フィルタ条件を変更してください。」テキスト表示 |
| compact | 行高 36px。`table-compact` クラス適用。デスクトップのみ |

---

## 6. アニメーション仕様

| シーン | プロパティ | 値 |
|--------|-----------|-----|
| 行ホバー | `background-color` | `transition-colors duration-fast ease-out`（100ms） |
| ソートアイコン回転 | `transform` | `transition-transform duration-150 ease-out` |
| ページ切替 | なし | 即時レンダリング（アニメーション不要） |
| ローディング | `opacity` | Skeleton コンポーネントのパルスアニメーション |

---

## 7. アクセシビリティ仕様

### ARIA属性

```tsx
{/* WAI-ARIA grid パターン準拠。roving tabindex で行間移動を制御 */}
<table
  role="grid"
  aria-label="企業検索結果テーブル"
  aria-rowcount={totalCount}
  aria-colcount={visibleColumnCount}
>
  <thead role="rowgroup">
    <tr role="row">
      <th role="columnheader" aria-sort="ascending|descending|none">
        法人名
      </th>
    </tr>
  </thead>
  <tbody role="rowgroup">
    <tr
      role="row"
      aria-rowindex={absoluteRowIndex}
      tabIndex={isFocusedRow ? 0 : -1}
      onClick={() => onRowClick?.(company)}
      onKeyDown={handleRowKeyDown}
    >
      <td role="gridcell">...</td>
    </tr>
  </tbody>
</table>
```

### キーボード操作マップ（WAI-ARIA grid パターン準拠）

テーブルのキーボードナビゲーションは WAI-ARIA grid パターンに準拠し、roving tabindex 方式を採用する。テーブル全体は1つの Tab ストップとして扱い、テーブル内の行移動は Arrow キーで行う。

| キー | 動作 |
|------|------|
| `Tab` | テーブルに入る（最初の行、または最後にフォーカスしていた行にフォーカス）。テーブル内にフォーカスがある状態で再度 `Tab` を押すとテーブルから出て、次のフォーカス可能な要素（ページネーション等）に移動する |
| `Shift + Tab` | テーブルから出て、前のフォーカス可能な要素に移動する |
| `Arrow Down` | テーブル内: 次の行へフォーカス移動（roving tabindex）。最終行では移動しない |
| `Arrow Up` | テーブル内: 前の行へフォーカス移動（roving tabindex）。先頭行では移動しない |
| `Home` | テーブル内: 先頭行へフォーカス移動 |
| `End` | テーブル内: 最終行へフォーカス移動 |
| `Enter` | 選択行の企業詳細モーダルを開く |

**roving tabindex 実装方針**:
- テーブル内の現在フォーカス行のみ `tabindex="0"`、他の行は `tabindex="-1"` を設定する
- フォーカス行の状態はコンポーネント内で管理し、Arrow Up/Down で更新する
- テーブルを離れて再度 Tab で戻った際は、最後にフォーカスしていた行にフォーカスを復帰する

### スクリーンリーダー対応

- テーブルに `aria-label="企業検索結果テーブル"` を設定
- ソート可能ヘッダーに `aria-sort` を設定（ascending / descending / none）
- 総件数とページ情報を `aria-rowcount` で伝達
- ページネーションに `aria-label="ページネーション"` を設定
- カード表示時は各カードに `aria-label="${法人名} の詳細を表示"` を設定

---

## 8. レスポンシブ仕様（H-03解決）

`useMediaQuery` フックを使用し、`lg`（1024px）未満でカードレンダリングに切り替える。

| ブレークポイント | 表示形式 | 行高 | 備考 |
|----------------|---------|------|------|
| base (0-639px) | カード | - | 1カラムカードリスト |
| sm (640-767px) | カード | - | 1カラムカードリスト |
| md (768-1023px) | カード | - | 2カラムグリッドカード |
| lg (1024-1279px) | テーブル | 44px | フルテーブル |
| xl (1280px+) | テーブル | 44px (標準) / 36px (compact) | フルテーブル + コンパクトモード選択可 |

### テーブル→カード変換の実装方針

```tsx
import { useMediaQuery } from "@/hooks/use-media-query";

export function CompanyTable(props: CompanyTableProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  if (!isDesktop) {
    return <CompanyCardList {...props} />;
  }

  return <CompanyDataTable {...props} />;
}
```

### モバイルカード表示の詳細

- 各カードの高さは内容に応じて可変
- カード内の情報は `<dl>` で構造化
- カード右下に Chevron アイコン（`ChevronRight size-4`）で詳細遷移を示唆
- md（768px）以上では `grid grid-cols-2 gap-md` の2カラムグリッド

---

## 9. 依存関係

| パッケージ | バージョン | 用途 |
|-----------|-----------|------|
| `@tanstack/react-table` | v8 | ヘッドレステーブルロジック |
| `shadcn/ui Table` | - | テーブルスタイルベース |
| `shadcn/ui Skeleton` | - | ローディング表示 |
| `shadcn/ui Select` | - | ページサイズ選択 |
| `lucide-react` | - | ArrowUpDown, ChevronRight アイコン |

---

## 10. 使用例

```tsx
import { CompanyTable } from "@/components/company-table";
import { useState } from "react";
import { SortingState, VisibilityState } from "@tanstack/react-table";

export function SearchResults() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const { data, totalCount, isLoading } = useCompanySearch({
    pageIndex,
    pageSize,
    sorting,
  });

  return (
    <CompanyTable
      data={data ?? []}
      totalCount={totalCount ?? 0}
      pageIndex={pageIndex}
      pageSize={pageSize}
      onPageChange={setPageIndex}
      onPageSizeChange={setPageSize}
      sorting={sorting}
      onSortingChange={setSorting}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={setColumnVisibility}
      onRowClick={(company) => openDetailModal(company)}
      compact={false}
      loading={isLoading}
    />
  );
}
```

---

## 11. 禁止事項

| 禁止 | 理由 |
|------|------|
| 仮想スクロール（react-virtual）の使用 | サーバーサイドページネーションで十分。クライアントサイドの複雑性を避ける |
| テーブル行のドラッグ&ドロップ | 検索結果テーブルに並べ替え機能は不要 |
| インラインセル編集 | 読み取り専用データ。編集は別画面 |
| カスタムスクロールバー | ブラウザネイティブを尊重 |
| モバイルでのコンパクトモード | タッチターゲット44px基準違反 |
| テーブルヘッダー固定（position: sticky）のz-index:50以上 | z-indexの乱用防止。最大 `z-10` |
| 行選択チェックボックス（一括操作） | MVP スコープ外。ダウンロードは検索結果全体が対象 |

---

*Generated by CodeGenAgent (Gen) - Phase 2: Design*
*Project: Company List Builder*
