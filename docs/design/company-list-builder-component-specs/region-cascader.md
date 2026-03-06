# RegionCascader コンポーネント仕様

P0コンポーネント。地域カスケード選択（地方区分 → 都道府県 → 市区町村）。

**作成日**: 2026-03-05
**ソース**: `docs/design/company-list-builder-design-system.yml`、`docs/design/company-list-builder-component-library.md`

---

## 1. 概要

| 項目 | 内容 |
|------|------|
| 役割 | 地方区分 → 都道府県 → 市区町村の3段階カスケード選択で、地域フィルタリングを提供する |
| 使用画面 | メイン検索画面のフィルタサイドバー |
| ベース技術 | shadcn/ui Checkbox + Command + Accordion |
| ティア | Tier 2（ビジネスロジック含むカスタムコンポーネント） |
| 優先度 | P0 |

---

## 2. Props定義

```typescript
interface Prefecture {
  /** 都道府県コード（2桁: "01"〜"47"） */
  code: string;
  /** 都道府県名 */
  name: string;
  /** 地方区分 */
  region: "北海道" | "東北" | "関東" | "中部" | "近畿" | "中国" | "四国" | "九州・沖縄";
  /** この都道府県の企業数 */
  count?: number;
}

interface City {
  /** 市区町村コード（5桁） */
  code: string;
  /** 所属都道府県コード */
  prefectureCode: string;
  /** 市区町村名 */
  name: string;
  /** この市区町村の企業数 */
  count?: number;
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
  /** 市区町村データの読み込み中フラグ（都道府県選択後のロード） */
  citiesLoading?: boolean;
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
┌─ 地域 ──────────────────────────┐
│ ┌──────────────────────────────┐│
│ │ 🔍 都道府県・市区町村を検索  ││  ← Command 検索
│ └──────────────────────────────┘│
│                                 │
│ ▼ 北海道              [すべて] │  ← 地方区分ヘッダー
│   ☐ 北海道              5,678 │  ← 都道府県
│                                 │
│ ▼ 東北                [すべて] │
│   ☐ 青森県              1,234 │
│   ☐ 岩手県              1,100 │
│   ☐ 宮城県              2,345 │
│   ☐ 秋田県                890 │
│   ☐ 山形県                780 │
│   ☐ 福島県              1,456 │
│                                 │
│ ▼ 関東                [すべて] │
│   ☑ 東京都             89,012 │  ← 選択中
│     ▼ 市区町村を選択           │  ← 都道府県選択で展開
│     ☑ 千代田区          3,456 │
│     ☑ 中央区            4,567 │
│     ☐ 港区              5,678 │
│     ☐ 新宿区            3,210 │
│            ...                 │
│   ☐ 神奈川県           45,678 │
│   ☐ 埼玉県             23,456 │
│   ☐ 千葉県             19,876 │
│         ...                    │
│                                 │
│ ▶ 中部                [すべて] │  ← 折りたたみ
│ ▶ 近畿                [すべて] │
│ ▶ 中国                [すべて] │
│ ▶ 四国                [すべて] │
│ ▶ 九州・沖縄          [すべて] │
└─────────────────────────────────┘
```

### モバイル（Sheet内）

```
┌────────────────────────────────┐
│ 地域                           │
│ ┌────────────────────────────┐ │
│ │ 🔍 都道府県を検索          │ │
│ └────────────────────────────┘ │
│                                │
│ ▼ 関東              [すべて]  │
│   ☑ 東京都           89,012   │
│   ☐ 神奈川県         45,678   │
│   ☐ 埼玉県           23,456   │
│        ...                     │
│                                │
│ ▶ 東北              [すべて]  │
│ ▶ 中部              [すべて]  │
│        ...                     │
└────────────────────────────────┘
```

---

## 4. スタイル仕様

### 地方区分ヘッダー

```tsx
<div className="flex items-center justify-between min-h-[44px] px-xs">
  <button
    className="flex items-center gap-xs text-body font-heading font-semibold text-primary flex-1"
    onClick={() => toggleRegion(region)}
    aria-expanded={isExpanded}
  >
    {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
    {regionName}
  </button>
  <button
    className="text-table-data text-accent hover:underline flex-shrink-0"
    onClick={() => selectAllInRegion(region)}
    aria-label={`${regionName}の都道府県をすべて選択`}
  >
    すべて
  </button>
</div>
```

### 都道府県行

```tsx
<div
  className="flex items-center gap-xs min-h-[44px] pl-lg pr-xs rounded-sm hover:bg-background-surface transition-colors duration-fast cursor-pointer"
>
  <Checkbox
    checked={isSelected}
    onCheckedChange={() => togglePrefecture(prefecture.code)}
    aria-label={`${prefecture.name} を選択`}
  />
  <span className="text-body font-body text-primary flex-1">{prefecture.name}</span>
  <span className="text-table-data font-mono tabular-nums text-slate-600">
    {prefecture.count?.toLocaleString("ja-JP")}
  </span>
</div>
```

### 市区町村行（カスケード展開時）

```tsx
<div
  className="flex items-center gap-xs min-h-[44px] pl-2xl pr-xs rounded-sm hover:bg-background-surface transition-colors duration-fast cursor-pointer"
>
  <Checkbox
    checked={isCitySelected}
    onCheckedChange={() => toggleCity(city.code)}
    aria-label={`${city.name} を選択`}
  />
  <span className="text-table-data font-body text-secondary flex-1">{city.name}</span>
  <span className="text-table-data font-mono tabular-nums text-slate-600">
    {city.count?.toLocaleString("ja-JP")}
  </span>
</div>
```

---

## 5. 状態仕様

| 状態 | 視覚表現 |
|------|---------|
| default | テキスト `text-primary`（都道府県）、`text-secondary`（市区町村） |
| hover | `bg-background-surface`。100ms ease-out |
| focus | `ring-2 ring-accent ring-offset-2` を行全体に適用 |
| checked（都道府県: 全域） | Checkbox ON（チェックマーク）。「全域」ラベル表示。市区町村リストがカスケード展開し全チェックON |
| indeterminate（都道府県: 一部選択） | Checkbox indeterminate（ハイフンマーク）。市区町村リストが展開中で一部のみ選択されている状態 |
| checked（市区町村） | Checkbox ON |
| region-expanded | 地方区分の都道府県リストが可視。ChevronDown |
| region-collapsed | 地方区分の都道府県リストが非表示。ChevronRight |
| cities-loading | 市区町村エリアに Skeleton 表示 |
| disabled | `opacity-50 pointer-events-none` |
| loading | 全体に Skeleton 表示（地方区分8行分） |
| search-filtered | 検索クエリに一致する都道府県・市区町村のみ表示 |
| no-results | 「一致する地域が見つかりません」テキスト表示 |

### カスケード動作

| 操作 | 結果 |
|------|------|
| 都道府県をチェック | 「全域」選択として扱う（当該都道府県の全市区町村を含む）。市区町村リストがカスケード展開し、全市区町村チェックボックスがON状態になる。都道府県チェックボックス横に「全域」ラベルを表示する |
| 個別市区町村をチェック/アンチェック | 都道府県チェックボックスは indeterminate（混合）状態に変化する。全市区町村がチェックされた場合はチェック状態、全市区町村がアンチェックされた場合はアンチェック状態に戻る |
| 「すべて」ボタンクリック | 地方区分内の全都道府県をチェック（全域選択） |
| 都道府県をアンチェック | 紐づく市区町村の選択も全解除。市区町村リストを折りたたみ |

### indeterminate（混合）状態の挙動

IndustryTree と同一の indeterminate 挙動に統一する。

| 条件 | 都道府県チェックボックスの状態 | 表示 |
|------|-------------------------------|------|
| 全市区町村が選択されている | checked (`aria-checked="true"`) | チェックマーク + 「全域」ラベル |
| 一部の市区町村のみ選択されている | indeterminate (`aria-checked="mixed"`) | ハイフン（−）マーク |
| 市区町村が1つも選択されていない | unchecked (`aria-checked="false"`) | 空のチェックボックス |

```tsx
<Checkbox
  checked={allCitiesSelected ? true : someCitiesSelected ? "indeterminate" : false}
  onCheckedChange={() => togglePrefecture(prefecture.code)}
  aria-label={`${prefecture.name} を選択`}
/>
<span className="text-body font-body text-primary flex-1">
  {prefecture.name}
  {allCitiesSelected && (
    <span className="ml-xs text-table-data text-slate-600">全域</span>
  )}
</span>
```

---

## 6. アニメーション仕様

| シーン | プロパティ | 値 |
|--------|-----------|-----|
| 地方区分展開/折りたたみ | `grid-template-rows` | `0fr` → `1fr`、150ms ease-out |
| 市区町村カスケード展開 | `grid-template-rows` | `0fr` → `1fr`、150ms ease-out |
| 行ホバー | `background-color` | 100ms ease-out |
| ChevronDown/Right 回転 | `transform` | `rotate(0)` → `rotate(90deg)`、150ms ease-out |

---

## 7. アクセシビリティ仕様

### ARIA属性

| 要素 | 属性 | 値 |
|------|------|-----|
| コンテナ | `role` | `"group"` |
| コンテナ | `aria-label` | `"地域選択"` |
| 地方区分ヘッダー | `role` | `"button"` |
| 地方区分ヘッダー | `aria-expanded` | `true` / `false` |
| 「すべて」ボタン | `aria-label` | `"${地方名}の都道府県をすべて選択"` |
| 都道府県 Checkbox | `aria-label` | `"${都道府県名} を選択"` |
| 都道府県 Checkbox | `aria-checked` | `"true"` / `"false"` / `"mixed"`（indeterminate時） |
| 市区町村 Checkbox | `aria-label` | `"${市区町村名} を選択"` |
| 検索入力 | `aria-label` | `"都道府県・市区町村を検索"` |

### キーボード操作マップ

| キー | 動作 |
|------|------|
| `Tab` | 検索入力 → 地方区分ヘッダー → 都道府県チェックボックス → 市区町村チェックボックス の順に移動 |
| `Space` | チェックボックスのON/OFF |
| `Enter` | 地方区分ヘッダーの展開/折りたたみ、チェックボックスのON/OFF |
| `Arrow Down` | 同グループ内の次の項目にフォーカス |
| `Arrow Up` | 同グループ内の前の項目にフォーカス |
| `Escape` | 検索入力のクリア |

---

## 8. レスポンシブ仕様

| ブレークポイント | 表示形式 | 備考 |
|----------------|---------|------|
| base - md | Sheet（ドロワー）内に配置 | 地方区分のみ初期表示、タップで展開 |
| lg以上 | フィルタサイドバー（280px）内に配置 | ScrollArea でスクロール |

### モバイル固有の調整

- 市区町村選択はモバイルでは省略可能（都道府県単位の選択で十分な場合が多い）
- 各行の `min-h-[44px]` を維持（タッチターゲット）
- 「すべて」ボタンはモバイルでも表示（一括選択の利便性）

---

## 9. 依存関係

| パッケージ | 用途 |
|-----------|------|
| `shadcn/ui Checkbox` | チェックボックスUI |
| `shadcn/ui Command` | 地域名テキスト検索 |
| `shadcn/ui ScrollArea` | スクロール制御 |
| `lucide-react` | MapPin, ChevronDown, ChevronRight アイコン |

---

## 10. 使用例

```tsx
import { RegionCascader } from "@/components/region-cascader";
import { useState } from "react";

export function RegionFilter() {
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: prefectures, isLoading } = usePrefectures();
  const { data: cities, isLoading: citiesLoading } = useCities(selectedPrefs);

  return (
    <div className="space-y-sm">
      <h3 className="text-h3 font-heading flex items-center gap-xs">
        <MapPin className="size-5" />
        地域
      </h3>
      <RegionCascader
        prefectures={prefectures ?? []}
        cities={cities ?? []}
        selectedPrefectures={selectedPrefs}
        selectedCities={selectedCities}
        onPrefectureChange={setSelectedPrefs}
        onCityChange={setSelectedCities}
        searchQuery={searchQuery}
        citiesLoading={citiesLoading}
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
| 日本地図UIでの地域選択（RegionCascader内） | 地図はダッシュボード画面（JapanHeatmap）専用。フィルタはリスト形式 |
| ドラッグ操作での範囲選択 | チェックボックスでの明示的選択を基本とする |
| 都道府県のアイコン・画像表示 | brutally-minimal。テキストのみ |
| 市区町村の初回全件ロード | 都道府県選択後にオンデマンドでロードする |
| 地方区分間のドラッグ&ドロップ並べ替え | 地理的順序は固定 |

---

*Generated by CodeGenAgent (Gen) - Phase 2: Design*
*Project: Company List Builder*
