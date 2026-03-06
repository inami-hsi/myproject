# IndustryTree コンポーネント仕様

P0コンポーネント。4階層業種ツリー + WAI-ARIA Treeview 完全準拠。

**作成日**: 2026-03-05
**ソース**: `docs/design/company-list-builder-design-system.yml`、`docs/design/company-list-builder-component-library.md`

---

## 1. 概要

| 項目 | 内容 |
|------|------|
| 役割 | 日本標準産業分類の階層構造をチェックボックスツリーで表示し、業種フィルタリングを提供する |
| 使用画面 | メイン検索画面のフィルタサイドバー |
| ベース技術 | shadcn/ui Checkbox + Command + カスタムツリー実装 |
| ティア | Tier 2（ビジネスロジック含むカスタムコンポーネント） |
| 優先度 | P0 |
| WAI-ARIA | Treeview パターン完全準拠（H-04解決） |

---

## 2. Props定義

```typescript
interface IndustryNode {
  /** 分類コード（例: "E", "09", "090", "0901"） */
  code: string;
  /** 分類名（例: "E 製造業"） */
  name: string;
  /** 階層レベル */
  level: "major" | "middle" | "minor" | "detail";
  /** 子ノード */
  children?: IndustryNode[];
  /** この分類に属する企業数 */
  count?: number;
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
  /** 無効化 */
  disabled?: boolean;
}
```

---

## 3. ビジュアル仕様

### デスクトップ

```
┌─ 業種 ──────────────────────────┐
│ ┌──────────────────────────────┐│
│ │ 🔍 業種を検索...             ││  ← Command 検索入力
│ └──────────────────────────────┘│
│                                 │
│ ▼ ☑ A 農業、林業         1,234 │  ← major（大分類）
│   ▼ ☑ 01 農業            1,100 │  ← middle（中分類）
│       ☑ 010 耕種農業       800 │  ← minor（小分類）
│       ☐ 011 畜産農業       300 │
│   ▶ ☐ 02 林業              134 │  ← 折りたたみ状態
│                                 │
│ ▼ ☑ E 製造業            45,678 │
│   ▼ ☑ 09 食料品製造業   12,345 │
│       ☑ 090 畜産食料品    5,678 │
│       ☐ 091 水産食料品    3,456 │
│       ☐ 092 保存食料品    3,211 │
│   ▶ ☐ 10 飲料・たばこ    8,901 │
│   ▶ ☐ 11 繊維工業        6,789 │
│                                 │
│ ▶ ☐ G 情報通信業        23,456 │
│ ▶ ☐ I 卸売業、小売業    67,890 │
│ ▶ ☐ J 金融業、保険業    12,345 │
│         ...                     │
└─────────────────────────────────┘
```

### モバイル（lg未満、Sheet内）

```
┌────────────────────────────────┐
│ 業種                           │
│ ┌────────────────────────────┐ │
│ │ 🔍 業種を検索...           │ │
│ └────────────────────────────┘ │
│                                │
│ ▼ ☑ A 農業、林業       1,234  │
│   ▼ ☑ 01 農業          1,100  │
│       ☑ 010 耕種農業     800  │
│       ☐ 011 畜産農業     300  │
│                                │
│ ▼ ☑ E 製造業          45,678  │
│   (展開中...)                  │
│                                │
│         ...                    │
└────────────────────────────────┘
```

---

## 4. スタイル仕様

### ツリーコンテナ

```tsx
<div
  role="tree"
  aria-label="業種分類ツリー"
  aria-multiselectable="true"
  className="space-y-xs"
>
  {/* ノード群 */}
</div>
```

### 大分類ノード（major）

```tsx
<div
  role="treeitem"
  aria-expanded={isExpanded}
  aria-checked={checkState}  // true | false | "mixed"
  aria-level={1}
  aria-setsize={totalSiblings}
  aria-posinset={positionInSet}
  tabIndex={isFocused ? 0 : -1}
  className="flex items-center gap-xs min-h-[44px] px-xs rounded-sm hover:bg-background-surface transition-colors duration-fast cursor-pointer"
>
  <button
    aria-label={isExpanded ? `${name} を折りたたむ` : `${name} を展開する`}
    className="size-5 flex items-center justify-center flex-shrink-0"
    tabIndex={-1}
  >
    {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
  </button>
  <Checkbox
    checked={checkState === true}
    indeterminate={checkState === "mixed"}
    className="flex-shrink-0"
    tabIndex={-1}
  />
  <span className="text-body font-body text-primary flex-1 truncate">{name}</span>
  <span className="text-table-data font-mono tabular-nums text-slate-600 flex-shrink-0">
    {count?.toLocaleString("ja-JP")}
  </span>
</div>
```

### インデント

| 階層 | インデント | Tailwindクラス |
|------|-----------|---------------|
| major（大分類） | 0px | `pl-0` |
| middle（中分類） | 24px | `pl-lg` |
| minor（小分類） | 48px | `pl-2xl` |
| detail（細分類） | 72px | `pl-[72px]` |

---

## 5. 状態仕様

| 状態 | 視覚表現 |
|------|---------|
| default | テキスト `text-primary`、カウント `text-slate-600` |
| hover | `bg-background-surface`。`transition-colors duration-fast` |
| focus | `ring-2 ring-accent ring-offset-2` をノード全体に適用 |
| checked | Checkbox が `bg-accent` で塗り潰し |
| indeterminate (mixed) | Checkbox 内にハイフン（`-`）表示。子ノードが部分選択 |
| unchecked | Checkbox が空（ボーダーのみ） |
| expanded | ChevronDown アイコン表示。子ノードが可視 |
| collapsed | ChevronRight アイコン表示。子ノードが非表示 |
| disabled | `opacity-50 pointer-events-none` |
| loading | 各大分類に `Skeleton h-[44px]` を表示 |
| search-filtered | 検索クエリに一致するノードのみ表示。一致テキストはハイライトなし（シンプルにフィルタのみ） |
| no-results | 「一致する業種が見つかりません」テキスト表示 |

### チェックボックスの連動ロジック

| 操作 | 結果 |
|------|------|
| 親ノードをチェック | 全子ノードがチェックされる |
| 親ノードをアンチェック | 全子ノードがアンチェックされる |
| 子ノードの一部をチェック | 親ノードが indeterminate（mixed）状態になる |
| 全子ノードをチェック | 親ノードが checked になる |
| 全子ノードをアンチェック | 親ノードが unchecked になる |

---

## 6. アニメーション仕様

| シーン | プロパティ | 値 |
|--------|-----------|-----|
| ノード展開/折りたたみ | `grid-template-rows` | `0fr` → `1fr`、150ms ease-out |
| ノードホバー | `background-color` | 100ms ease-out |
| 展開アイコン回転 | `transform` | `rotate(0deg)` → `rotate(90deg)`、150ms ease-out |

### 展開/折りたたみの実装

```tsx
<div
  className="grid transition-[grid-template-rows] duration-150 ease-out"
  style={{
    gridTemplateRows: isExpanded ? "1fr" : "0fr",
  }}
>
  <div className="overflow-hidden">
    <div role="group" className="space-y-xs">
      {children}
    </div>
  </div>
</div>
```

---

## 7. アクセシビリティ仕様（H-04解決: WAI-ARIA Treeview 完全準拠）

### ARIA属性マップ

| 要素 | 属性 | 値 |
|------|------|-----|
| ツリーコンテナ | `role` | `"tree"` |
| ツリーコンテナ | `aria-label` | `"業種分類ツリー"` |
| ツリーコンテナ | `aria-multiselectable` | `"true"` |
| 各ノード | `role` | `"treeitem"` |
| 各ノード | `aria-expanded` | `true` / `false`（子ノード有りの場合のみ） |
| 各ノード | `aria-checked` | `true` / `false` / `"mixed"` |
| 各ノード | `aria-level` | `1` (major) / `2` (middle) / `3` (minor) / `4` (detail) |
| 各ノード | `aria-setsize` | 同階層の兄弟ノード数 |
| 各ノード | `aria-posinset` | 同階層内での位置（1始まり） |
| 子ノードグループ | `role` | `"group"` |

### キーボード操作マップ（WAI-ARIA Treeview準拠）

| キー | 動作 |
|------|------|
| `Arrow Down` | 次の可視ノードにフォーカス移動 |
| `Arrow Up` | 前の可視ノードにフォーカス移動 |
| `Arrow Right` | ノードが折りたたみ状態: 展開する |
| `Arrow Right` | ノードが展開状態: 最初の子ノードにフォーカス移動 |
| `Arrow Right` | ノードが末端: 何もしない |
| `Arrow Left` | ノードが展開状態: 折りたたむ |
| `Arrow Left` | ノードが折りたたみ状態または末端: 親ノードにフォーカス移動 |
| `Home` | ツリー内の最初の可視ノードにフォーカス移動 |
| `End` | ツリー内の最後の可視ノードにフォーカス移動 |
| `Space` | フォーカス中のノードのチェックボックスをON/OFF |
| `Enter` | フォーカス中のノードのチェックボックスをON/OFF |
| `*` (アスタリスク) | フォーカス中のノードと同階層の全兄弟ノードを展開 |

### フォーカス管理

- ツリー全体で1つの `tabIndex={0}` を持つ（ロービングタブインデックスパターン）
- フォーカス中のノードのみ `tabIndex={0}`、他は `tabIndex={-1}`
- `Tab` キーでツリーに入り、`Tab` キーでツリーから出る
- ツリー内のナビゲーションは矢印キーで行う

```typescript
// フォーカス管理の状態
const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);

// ノードのtabIndex
const tabIndex = focusedNodeId === node.code ? 0 : -1;
```

---

## 8. レスポンシブ仕様

| ブレークポイント | 表示形式 | 備考 |
|----------------|---------|------|
| base - md | Sheet（ドロワー）内に配置 | Accordion スタイルで大分類のみ表示 |
| lg以上 | フィルタサイドバー（280px）内に配置 | 全階層表示、ScrollArea でスクロール |

### モバイル固有の調整

- 各ノードの `min-h-[44px]` を維持（タッチターゲット）
- 検索入力フィールドは Sheet 内の上部に固定配置
- ScrollArea でスクロール可能にし、サイドバー高さを超える場合に対応

---

## 9. 依存関係

| パッケージ | 用途 |
|-----------|------|
| `shadcn/ui Checkbox` | チェックボックスUI |
| `shadcn/ui Command` | 業種名テキスト検索 |
| `shadcn/ui ScrollArea` | スクロール制御 |
| `lucide-react` | ChevronDown, ChevronRight, Factory アイコン |

---

## 10. 使用例

```tsx
import { IndustryTree } from "@/components/industry-tree";
import { useState } from "react";

export function IndustryFilter() {
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: industries, isLoading } = useIndustryClassification();

  return (
    <div className="space-y-sm">
      <h3 className="text-h3 font-heading flex items-center gap-xs">
        <Factory className="size-5" />
        業種
      </h3>
      <IndustryTree
        industries={industries ?? []}
        selectedCodes={selectedCodes}
        onSelectionChange={setSelectedCodes}
        searchQuery={searchQuery}
        loading={isLoading}
      />
    </div>
  );
}
```

---

## 11. 禁止事項

| 禁止 | 理由 |
|------|------|
| react-arborist 等の外部ツリーライブラリの使用 | バンドルサイズ増加。カスタム実装でWAI-ARIA準拠する |
| ドラッグ&ドロップによるノード並べ替え | 分類体系は固定。ユーザーによる並べ替えは不要 |
| ノードのインライン編集 | 分類データは読み取り専用 |
| 検索テキストのハイライト表示 | brutally-minimal に反する装飾。フィルタリングのみ |
| アニメーションによるノードの段階的表示 | 150msのgrid-template-rows遷移のみ許可 |
| `height` の直接トランジション | `grid-template-rows: 0fr/1fr` を使用（H-01解決） |

---

*Generated by CodeGenAgent (Gen) - Phase 2: Design*
*Project: Company List Builder*
