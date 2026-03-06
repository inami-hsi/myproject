# FilterChipBar コンポーネント仕様

P0コンポーネント。フィルタ状態可視化バー。

**作成日**: 2026-03-05
**ソース**: `docs/design/company-list-builder-design-system.yml`、`docs/design/company-list-builder-component-library.md`

---

## 1. 概要

| 項目 | 内容 |
|------|------|
| 役割 | 選択中のフィルタ条件をpill型バッジで横一列に表示し、個別削除・一括クリア操作を提供する |
| 使用画面 | メイン検索画面のフィルタサイドバーとメインエリアの上部（全幅配置） |
| ベース技術 | shadcn/ui Badge + カスタムレイアウト |
| ティア | Tier 2（ビジネスロジック含むカスタムコンポーネント） |
| 優先度 | P0 |

---

## 2. Props定義

```typescript
interface FilterChip {
  /** 一意のID */
  id: string;
  /** フィルタカテゴリ */
  category: "industry" | "region" | "detail";
  /** 表示テキスト（例: "E 製造業", "東京都", "資本金: 1,000万〜"） */
  label: string;
  /** フィルタ値（コード等） */
  value: string;
}

interface FilterChipBarProps {
  /** 表示するフィルタチップ配列 */
  chips: FilterChip[];
  /** チップ削除コールバック */
  onRemove: (chipId: string) => void;
  /** 全クリアコールバック */
  onClearAll: () => void;
  /** 最大表示数（超過時は "+N" 表示）。デフォルト: 8 */
  maxVisible?: number;
}
```

---

## 3. ビジュアル仕様

### チップが少ない場合（8個以下）

```
┌──────────────────────────────────────────────────────────────┐
│ [E 製造業 ×] [I 卸小売 ×] [東京都 ×] [資本金:1000万〜 ×]  すべてクリア │
│  ^^^accent    ^^^accent    ^^^success   ^^^secondary                      │
└──────────────────────────────────────────────────────────────┘
```

### チップが多い場合（8個超過）

```
┌──────────────────────────────────────────────────────────────┐
│ [E 製造業 ×] [I 卸小売 ×] [東京都 ×] ... [+3件] すべてクリア│
└──────────────────────────────────────────────────────────────┘
```

### チップがない場合

FilterChipBar 自体を非表示にする（空のバーは表示しない）。

---

## 4. スタイル仕様

### バーコンテナ

```tsx
{chips.length > 0 && (
  <div
    role="list"
    aria-label="適用中のフィルタ"
    className="flex flex-wrap items-center gap-sm py-sm"
  >
    {visibleChips.map((chip) => (
      <FilterChipItem key={chip.id} chip={chip} onRemove={onRemove} />
    ))}
    {overflowCount > 0 && (
      <span className="text-table-data font-body text-secondary px-sm">
        +{overflowCount}件
      </span>
    )}
    <button
      onClick={onClearAll}
      className="text-table-data text-accent hover:underline ml-auto flex items-center gap-xs"
      aria-label="すべてのフィルタをクリア"
    >
      <XCircle className="size-4" />
      すべてクリア
    </button>
  </div>
)}
```

### 個別チップ

```tsx
<span
  role="listitem"
  className={cn(
    "inline-flex items-center gap-xs rounded-chip px-3 py-1 text-table-data font-body",
    categoryStyles[chip.category]
  )}
>
  {chip.label}
  <button
    onClick={() => onRemove(chip.id)}
    className="size-4 rounded-full hover:bg-black/10 flex items-center justify-center flex-shrink-0"
    aria-label={`${chip.label} フィルタを削除`}
  >
    <X className="size-3" />
  </button>
</span>
```

### カテゴリ別スタイル

| カテゴリ | 背景色 | テキスト色 | Tailwindクラス |
|---------|--------|-----------|---------------|
| industry（業種） | `#dbeafe` (blue-100) | `#1e40af` (blue-800) | `bg-blue-100 text-blue-800` |
| region（地域） | `#d1fae5` (emerald-100) | `#065f46` (emerald-800) | `bg-emerald-100 text-emerald-800` |
| detail（詳細条件） | `#f1f5f9` (slate-100) | `#334155` (slate-700) | `bg-slate-100 text-slate-700` |

```typescript
const categoryStyles: Record<FilterChip["category"], string> = {
  industry: "bg-blue-100 text-blue-800",
  region: "bg-emerald-100 text-emerald-800",
  detail: "bg-slate-100 text-slate-700",
};
```

---

## 5. 状態仕様

| 状態 | 視覚表現 |
|------|---------|
| default | チップがカテゴリ色で表示。各チップに X ボタン |
| empty | FilterChipBar 全体が非表示（`chips.length === 0` で条件分岐） |
| overflow | `maxVisible` を超えるチップは非表示。「+N件」テキストで超過数を表示 |
| chip-hover | チップ自体のホバーは無し。X ボタンのホバーで `bg-black/10` |
| chip-focus | チップ全体に `ring-2 ring-accent ring-offset-2` |
| clear-all-hover | 「すべてクリア」テキストに下線表示 |

---

## 6. アニメーション仕様

| シーン | プロパティ | 値 |
|--------|-----------|-----|
| チップ追加 | なし | 即時表示（アニメーション不要） |
| チップ削除 | なし | 即時削除（アニメーション不要） |

brutally-minimal のため、チップの追加/削除にアニメーションは不要。状態変化は即時反映する。

---

## 7. アクセシビリティ仕様

### ARIA属性

| 要素 | 属性 | 値 |
|------|------|-----|
| バーコンテナ | `role` | `"list"` |
| バーコンテナ | `aria-label` | `"適用中のフィルタ"` |
| 各チップ | `role` | `"listitem"` |
| チップ削除ボタン | `aria-label` | `"${label} フィルタを削除"` |
| すべてクリアボタン | `aria-label` | `"すべてのフィルタをクリア"` |

### キーボード操作マップ

| キー | 動作 |
|------|------|
| `Tab` | チップ間を順にフォーカス移動（X ボタンにフォーカス） |
| `Backspace` / `Delete` | フォーカス中のチップを削除 |
| `Enter` / `Space` | フォーカス中のX ボタンをクリック（チップ削除） |

### スクリーンリーダー

- チップ削除時に変更を通知するため、バーコンテナに `aria-live="polite"` は設定しない（頻繁な変更による読み上げ過多を防止）
- 代わりに、削除後にフォーカスを次のチップまたは「すべてクリア」ボタンに移動する

---

## 8. レスポンシブ仕様

| ブレークポイント | 表示形式 | 備考 |
|----------------|---------|------|
| base - sm | 横スクロール（`overflow-x-auto`）+ `flex-nowrap` | チップが折り返さない |
| md以上 | `flex-wrap` で自動折り返し | 複数行になる場合あり |

### モバイル固有の調整

```tsx
<div className="flex items-center gap-sm py-sm overflow-x-auto scrollbar-none md:flex-wrap md:overflow-visible">
  {/* チップ群 */}
</div>
```

- モバイルでは横スクロールでチップを閲覧可能に
- `scrollbar-none` でスクロールバーを非表示（空間節約）
- md以上では `flex-wrap` で折り返し表示

---

## 9. 依存関係

| パッケージ | 用途 |
|-----------|------|
| `shadcn/ui Badge` | チップのベーススタイル（カスタマイズ前提） |
| `lucide-react` | X, XCircle アイコン |
| `clsx` / `cn` | 条件付きクラス結合 |

---

## 10. 使用例

```tsx
import { FilterChipBar } from "@/components/filter-chip-bar";

export function SearchHeader() {
  const { activeFilters, removeFilter, clearAllFilters } = useSearchFilters();

  const chips: FilterChip[] = [
    ...activeFilters.industries.map((ind) => ({
      id: `industry-${ind.code}`,
      category: "industry" as const,
      label: ind.name,
      value: ind.code,
    })),
    ...activeFilters.prefectures.map((pref) => ({
      id: `region-${pref.code}`,
      category: "region" as const,
      label: pref.name,
      value: pref.code,
    })),
    ...activeFilters.details.map((detail) => ({
      id: `detail-${detail.key}`,
      category: "detail" as const,
      label: detail.label,
      value: detail.value,
    })),
  ];

  return (
    <FilterChipBar
      chips={chips}
      onRemove={(chipId) => removeFilter(chipId)}
      onClearAll={clearAllFilters}
      maxVisible={8}
    />
  );
}
```

---

## 11. 禁止事項

| 禁止 | 理由 |
|------|------|
| チップの追加/削除アニメーション | brutally-minimal。即時反映 |
| チップのドラッグ&ドロップ並べ替え | フィルタ条件の順序は意味を持たない |
| チップのインライン編集 | フィルタ条件の変更はサイドバーで行う |
| カテゴリ別のアイコン表示 | テキストのみ。アイコンは X ボタンのみ |
| チップの展開/折りたたみ（詳細表示） | チップはラベルのみ。詳細はフィルタサイドバーで確認 |
| 5色以上のカテゴリ色 | 3カテゴリ（industry/region/detail）で固定 |

---

*Generated by CodeGenAgent (Gen) - Phase 2: Design*
*Project: Company List Builder*
