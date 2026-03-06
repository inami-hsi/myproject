# LiveCounter コンポーネント仕様

P0コンポーネント。ライブカウンター = 差別化の要。

**作成日**: 2026-03-05
**ソース**: `docs/design/company-list-builder-design-system.yml`、`docs/design/company-list-builder-component-library.md`

---

## 1. 概要

| 項目 | 内容 |
|------|------|
| 役割 | 検索結果件数をリアルタイムで表示し、フィルタ条件変更時にカウントアップアニメーションを行う。Company List Builder の唯一の差別化要素 |
| 使用画面 | メイン検索画面（テーブル上部）、LP（SearchPreview内）、モバイルヘッダー直下 |
| ベース技術 | CSS transition + `toLocaleString()` + `tabular-nums` |
| ティア | Tier 2（ビジネスロジック含むカスタムコンポーネント） |
| 優先度 | P0（差別化の核心） |

---

## 2. Props定義

```typescript
interface LiveCounterProps {
  /** 表示する件数 */
  count: number;
  /** 件数のラベル（例: "件"）。デフォルト: "件" */
  suffix?: string;
  /** プレフィックスラベル（例: "検索結果:"） */
  prefix?: string;
  /** サイズバリアント */
  size?: "default" | "large";
  /** 読み込み中 */
  loading?: boolean;
  /** アニメーションの有効/無効 */
  animated?: boolean;
}
```

---

## 3. ビジュアル仕様

### size="large"（検索結果ヘッダー用）

```
検索結果:  12,345  件
^prefix^   ^count^  ^suffix^
 text-body  text-counter-lg  text-body
 font-body  font-mono        font-body
 text-secondary  text-primary  text-secondary
```

```
┌──────────────────────────────────────┐
│                                      │
│  検索結果:  12,345  件               │
│             ^^^^^^                   │
│        JetBrains Mono 700            │
│        1.5rem (24px)                 │
│        tabular-nums                  │
│                                      │
└──────────────────────────────────────┘
```

### size="default"（ダウンロード残数等）

```
┌──────────────────────┐
│  残り:  2,850  件    │
│         ^^^^^        │
│   JetBrains Mono 500 │
│   1rem (16px)        │
│   tabular-nums       │
└──────────────────────┘
```

### ローディング状態

```
┌──────────────────────────────────────┐
│                                      │
│  検索結果:  ████████  件             │
│             Skeleton                 │
│             w-[80px] h-[24px]        │
│                                      │
└──────────────────────────────────────┘
```

---

## 4. スタイル仕様

### size="large"

```tsx
<div className="flex items-baseline gap-sm" aria-live="polite" aria-atomic="true">
  {prefix && (
    <span className="text-body font-body text-secondary">{prefix}</span>
  )}
  <span
    className="text-counter-lg font-mono tabular-nums text-primary transition-[opacity,transform] duration-150 ease-out"
    data-changing={isChanging}
  >
    {count.toLocaleString("ja-JP")}
  </span>
  {suffix && (
    <span className="text-body font-body text-secondary">{suffix}</span>
  )}
</div>
```

### size="default"

```tsx
<div className="flex items-baseline gap-xs" aria-live="polite" aria-atomic="true">
  {prefix && (
    <span className="text-table-data font-body text-secondary">{prefix}</span>
  )}
  <span
    className="text-counter font-mono tabular-nums text-primary transition-[opacity,transform] duration-150 ease-out"
    data-changing={isChanging}
  >
    {count.toLocaleString("ja-JP")}
  </span>
  {suffix && (
    <span className="text-table-data font-body text-secondary">{suffix}</span>
  )}
</div>
```

### Tailwindクラス対応表

| 要素 | size="large" | size="default" |
|------|-------------|---------------|
| 数値 | `text-counter-lg font-mono tabular-nums text-primary` | `text-counter font-mono tabular-nums text-primary` |
| prefix/suffix | `text-body font-body text-secondary` | `text-table-data font-body text-secondary` |
| gap | `gap-sm` (8px) | `gap-xs` (4px) |
| 数値フォントサイズ | 1.5rem (24px) | 1rem (16px) |
| 数値フォントウェイト | 700 | 500 |

---

## 5. 状態仕様

| 状態 | 視覚表現 |
|------|---------|
| default | 数値が `text-primary` で静止表示 |
| changing | 旧数値が `opacity: 0` + `translateY(-4px)` にフェードアウト → 新数値が `opacity: 1` + `translateY(0)` にフェードイン |
| loading | 数値部分が `Skeleton w-[80px] h-[24px]`（large）/ `Skeleton w-[60px] h-[16px]`（default） |
| zero | `0` を表示。特別な視覚表現なし |
| error | 該当なし（エラー時はカウンターを表示しない。親コンポーネントでハンドリング） |

### カウントアップアニメーションの実装

```typescript
import { useState, useEffect, useRef } from "react";

function useLiveCount(targetCount: number, animated: boolean = true) {
  const [displayCount, setDisplayCount] = useState(targetCount);
  const [isChanging, setIsChanging] = useState(false);
  const prevCount = useRef(targetCount);

  useEffect(() => {
    if (targetCount === prevCount.current) return;

    if (!animated) {
      setDisplayCount(targetCount);
      prevCount.current = targetCount;
      return;
    }

    // フェードアウト
    setIsChanging(true);

    const timer = setTimeout(() => {
      // 新しい値を設定してフェードイン
      setDisplayCount(targetCount);
      setIsChanging(false);
      prevCount.current = targetCount;
    }, 150); // 150ms = トランジション完了を待つ

    return () => clearTimeout(timer);
  }, [targetCount, animated]);

  return { displayCount, isChanging };
}
```

---

## 6. アニメーション仕様

このコンポーネントが Company List Builder の唯一の「動き」を持つ要素である。

| プロパティ | 値 | 説明 |
|-----------|-----|------|
| `opacity` | `1` → `0` → `1` | フェードアウト → フェードイン |
| `transform` | `translateY(0)` → `translateY(-4px)` → `translateY(0)` | 上方向にスライドアウト → 下から戻る |
| デュレーション | 150ms | design-system.yml `animation.max_duration` 準拠 |
| イージング | ease-out | design-system.yml `animation.easing` 準拠 |

### CSS定義

```css
.counter-value {
  transition: opacity 150ms ease-out, transform 150ms ease-out;
}

.counter-value[data-changing="true"] {
  opacity: 0;
  transform: translateY(-4px);
}

.counter-value[data-changing="false"] {
  opacity: 1;
  transform: translateY(0);
}
```

### reduced-motion 対応

```css
@media (prefers-reduced-motion: reduce) {
  .counter-value {
    transition-duration: 0.01ms !important;
  }
}
```

reduced-motion 有効時は数値が即座に最終値に切り替わる。フェードアウト/フェードインは発生しない。

---

## 7. アクセシビリティ仕様

### ARIA属性

| 属性 | 値 | 説明 |
|------|-----|------|
| `aria-live` | `"polite"` | 数値変化をスクリーンリーダーに通知（ユーザーの操作完了後に読み上げ） |
| `aria-atomic` | `"true"` | 変化時に要素全体を読み上げる（数値だけでなくprefix/suffixも） |
| `role` | なし（暗黙のロール） | `<div>` のデフォルトロール |

### スクリーンリーダー読み上げ

件数変化時に以下のように読み上げられる:

```
"検索結果: 12,345 件"
```

- `aria-live="polite"` により、ユーザーの現在の操作を中断しない
- フィルタ変更のたびに読み上げが発生するため `"assertive"` は使用しない

---

## 8. レスポンシブ仕様

| ブレークポイント | 配置 | サイズ |
|----------------|------|--------|
| base - md | ヘッダー直下、フルワイド | size="large" |
| lg以上 | テーブル上部、メインエリア内 | size="large" |

モバイルでの配置:

```
┌────────────────────────┐
│ [HEADER]         [=]   │
├────────────────────────┤
│ 検索結果:  12,345  件  │  ← LiveCounter
│ [フィルタ ▼] 2件選択中 │
├────────────────────────┤
│ (カードリスト)         │
```

---

## 9. 依存関係

| パッケージ | 用途 |
|-----------|------|
| `shadcn/ui Skeleton` | ローディング表示 |
| なし（外部ライブラリ不要） | CSS transition のみで実装 |

---

## 10. 使用例

### 検索結果ヘッダー

```tsx
import { LiveCounter } from "@/components/live-counter";

export function SearchResultHeader() {
  const { totalCount, isLoading } = useSearchResults();

  return (
    <div className="flex items-center justify-between py-md">
      <LiveCounter
        count={totalCount ?? 0}
        prefix="検索結果:"
        suffix="件"
        size="large"
        loading={isLoading}
      />
      <ColumnVisibilityDropdown />
    </div>
  );
}
```

### ダウンロード残数

```tsx
<LiveCounter
  count={remainingDownloads}
  prefix="残り:"
  suffix={`/ ${downloadLimit.toLocaleString("ja-JP")}件`}
  size="default"
  animated={false}  // 残数は即時更新
/>
```

### LP検索プレビュー

```tsx
<LiveCounter
  count={previewCount ?? 0}
  suffix="件見つかりました"
  size="large"
  loading={previewLoading}
/>
```

---

## 11. 禁止事項

| 禁止 | 理由 |
|------|------|
| 数値のインクリメンタルカウントアップ（1,2,3...12345） | 150ms制限を超える。フェードイン/フェードアウトのみ |
| motion/react の `AnimatePresence` | CSS transitions のみ使用 |
| 数値変化時の色変化（赤→緑等） | brutally-minimal。数値の動き自体が唯一のフィードバック |
| 数値変化時のサイズ変化（拡大/縮小） | レイアウトシフトを引き起こす |
| `aria-live="assertive"` | フィルタ変更のたびに割り込み読み上げが発生し、ユーザー体験を阻害する |
| カウンターのアニメーションを3秒以上持続させる | design-system.yml 禁止事項 |
| 桁区切りなしの数値表示 | `toLocaleString("ja-JP")` 必須 |
| `tabular-nums` なしの数値表示 | 桁揃え必須。数値が変化しても幅が変わらないようにする |

---

*Generated by CodeGenAgent (Gen) - Phase 2: Design*
*Project: Company List Builder*
