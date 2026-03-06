# DownloadPanel コンポーネント仕様

P0コンポーネント。ダウンロードUI。

**作成日**: 2026-03-05
**ソース**: `docs/design/company-list-builder-design-system.yml`、`docs/design/company-list-builder-component-library.md`

---

## 1. 概要

| 項目 | 内容 |
|------|------|
| 役割 | ダウンロード形式・文字コード選択、残数プログレスバー表示、ダウンロード実行ボタンを提供する |
| 使用画面 | メイン検索画面のテーブル下部（デスクトップ）、StickyDownloadBar経由（モバイル） |
| ベース技術 | shadcn/ui Select + Button + Progress |
| ティア | Tier 2（ビジネスロジック含むカスタムコンポーネント） |
| 優先度 | P0 |

---

## 2. Props定義

```typescript
interface DownloadOptions {
  /** ダウンロード形式（デフォルト: "csv"） */
  format: "csv" | "xlsx";
  /** 文字コード（デフォルト: "utf-8"） */
  encoding: "utf-8" | "shift-jis";
  /** ダウンロード対象カラム */
  columns: string[];
}

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
  /** ダウンロード完了フラグ（一時的にtrueになる） */
  downloadComplete?: boolean;
  /** 大量件数の非同期生成中 */
  asyncProcessing?: boolean;
  /** 表示カラム（ダウンロード対象カラムの選択肢） */
  availableColumns?: { key: string; label: string }[];
  /** 非同期処理閾値（デフォルト: 5000）。この件数を超えるとメール配信に切り替わる */
  asyncThreshold?: number;
}

/** デフォルト値 */
const DOWNLOAD_PANEL_DEFAULTS = {
  format: "csv" as const,
  encoding: "utf-8" as const,
  asyncThreshold: 5000,
};
```

---

## 3. ビジュアル仕様

### デスクトップ

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  形式:  [ CSV ▼ ]    文字コード:  [ UTF-8 ▼ ]           │
│                                                          │
│  ダウンロード残数                                        │
│  ████████████████████████░░░░░░  2,850 / 3,000件         │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │          ⬇ 12,345件をダウンロード                │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  ※ 5,000件を超える場合はメールでお届けします            │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### ダウンロード完了状態

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  形式:  [ CSV ▼ ]    文字コード:  [ UTF-8 ▼ ]           │
│                                                          │
│  ダウンロード残数                                        │
│  ██████████████████████░░░░░░░░  2,838 / 3,000件         │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │          ✓ ダウンロード完了                      │    │  ← bg-accent-success
│  └──────────────────────────────────────────────────┘    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 上限超過状態

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  形式:  [ CSV ▼ ]    文字コード:  [ UTF-8 ▼ ]           │
│                                                          │
│  ダウンロード残数                                        │
│  ██████████████████████████████  3,000 / 3,000件         │  ← bg-error
│                                                          │
│  ⚠ 今月のダウンロード上限に達しました                    │
│  プランをアップグレードしてください                      │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │          ⬇ ダウンロード（無効）                  │    │  ← disabled
│  └──────────────────────────────────────────────────┘    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 4. スタイル仕様

### パネルコンテナ

```tsx
<div
  className="border border-border rounded-card p-md space-y-md"
  aria-label="ダウンロード設定"
>
  {/* コンテンツ */}
</div>
```

### 形式・文字コード選択

```tsx
<div className="flex flex-wrap gap-md">
  <div className="flex items-center gap-xs">
    <Label className="text-table-data font-body text-secondary">形式:</Label>
    <Select value={format} onValueChange={setFormat}>
      <SelectTrigger className="w-[120px] rounded-input border-border">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="rounded-dropdown shadow-dropdown">
        <SelectItem value="csv">CSV</SelectItem>
        <SelectItem value="xlsx">Excel</SelectItem>
      </SelectContent>
    </Select>
  </div>
  <div className="flex items-center gap-xs">
    <Label className="text-table-data font-body text-secondary">文字コード:</Label>
    <Select value={encoding} onValueChange={setEncoding}>
      <SelectTrigger className="w-[140px] rounded-input border-border">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="rounded-dropdown shadow-dropdown">
        <SelectItem value="utf-8">UTF-8</SelectItem>
        <SelectItem value="shift-jis">Shift-JIS</SelectItem>
      </SelectContent>
    </Select>
  </div>
</div>
```

### プログレスバー（残数表示）

```tsx
<div className="space-y-xs">
  <Label className="text-table-data font-body text-secondary">
    ダウンロード残数
  </Label>
  <div className="flex items-center gap-sm">
    <Progress
      value={usagePercentage}
      className={cn(
        "flex-1 h-2",
        usagePercentage >= 100 && "[&>div]:bg-error",
        usagePercentage >= 80 && usagePercentage < 100 && "[&>div]:bg-warning",
        usagePercentage < 80 && "[&>div]:bg-accent"
      )}
      aria-valuenow={remaining}
      aria-valuemax={downloadLimit}
      aria-label="ダウンロード残数"
    />
    <span className="text-table-data font-mono tabular-nums text-slate-600 flex-shrink-0">
      {remaining.toLocaleString("ja-JP")} / {downloadLimit.toLocaleString("ja-JP")}件
    </span>
  </div>
</div>
```

### ダウンロードボタン

```tsx
<Button
  variant={downloadComplete ? "success" : "default"}
  size="lg"
  className="w-full"
  onClick={() => onDownload({ format, encoding, columns })}
  disabled={downloading || remaining <= 0 || resultCount === 0}
>
  {downloading ? (
    <>
      <span className="animate-spin size-4 border-2 border-white border-t-transparent rounded-full" />
      ダウンロード中...
    </>
  ) : downloadComplete ? (
    <>
      <Check className="size-4" />
      ダウンロード完了
    </>
  ) : (
    <>
      <Download className="size-4" />
      {resultCount.toLocaleString("ja-JP")}件をダウンロード
    </>
  )}
</Button>
```

---

## 5. 状態仕様

| 状態 | 視覚表現 |
|------|---------|
| default | 形式・文字コード選択可能。ダウンロードボタン活性 |
| downloading | ボタンにスピナー表示。「ダウンロード中...」テキスト。ボタン無効化 |
| complete | ボタンが `bg-accent-success` に変化。チェックマーク + 「ダウンロード完了」テキスト。150ms ease-out でフェードイン |
| limit-warning | プログレスバーが `bg-warning`（残り20%以下）。AlertTriangle アイコン + 警告テキスト |
| limit-exceeded | プログレスバーが `bg-error`。ダウンロードボタン無効化。アップグレード促進テキスト |
| async-processing | 「メールでお届けします」テキスト表示。ボタンテキストが「非同期ダウンロード開始」に変更 |
| no-results | resultCount === 0 の場合、ボタン無効化。「検索結果がありません」テキスト |

### プログレスバーの色判定

```typescript
const usagePercentage = (downloadedCount / downloadLimit) * 100;
const remaining = downloadLimit - downloadedCount;

// 色判定
if (usagePercentage >= 100) → bg-error
if (usagePercentage >= 80)  → bg-warning
if (usagePercentage < 80)   → bg-accent
```

### ビジネスルール

| ルール | 詳細 |
|--------|------|
| 3クリックでリスト完成 | format と encoding にデフォルト値（CSV / UTF-8）が設定されているため、ユーザーはフィルタ選択後にSelect操作なしでダウンロードボタンを即クリック可能。最短フローは「業種選択 → 地域選択 → ダウンロード」の3クリック |
| デフォルト状態で即ダウンロード可能 | format="csv"、encoding="utf-8" がプリセットされるため、DownloadPanel表示直後からダウンロードボタンは活性状態（resultCount > 0 かつ remaining > 0 の場合） |
| 非同期処理閾値の明示 | 5,000件を超える場合は非同期処理（メール配信）に切り替わる。この閾値はUI上で「※ 5,000件を超える場合はメールでお届けします」テキストとして常に表示し、ユーザーに事前に認知させる |
| 非同期処理のフィードバック | asyncProcessing=true 時はボタンテキストが「非同期ダウンロード開始」に変更され、処理がバックグラウンドで行われることをユーザーに明示する |

---

## 6. アニメーション仕様

| シーン | プロパティ | 値 |
|--------|-----------|-----|
| ダウンロード完了 | `opacity`, `transform` | チェックマークが `opacity: 0 scale(0.8)` → `opacity: 1 scale(1)`。150ms ease-out |
| ボタン色変化 | `background-color` | `bg-accent` → `bg-accent-success`。150ms ease-out |
| スピナー | CSS animation | `animate-spin`（border-top のrotate） |

### ダウンロード完了アニメーションCSS

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

---

## 7. アクセシビリティ仕様

### ARIA属性

| 要素 | 属性 | 値 |
|------|------|-----|
| パネルコンテナ | `aria-label` | `"ダウンロード設定"` |
| Progress | `aria-valuenow` | 残りダウンロード件数 |
| Progress | `aria-valuemax` | ダウンロード上限 |
| Progress | `aria-label` | `"ダウンロード残数"` |
| ダウンロードボタン | `aria-busy` | ダウンロード中は `true` |
| 形式 Select | `aria-label` | `"ダウンロード形式を選択"` |
| 文字コード Select | `aria-label` | `"文字コードを選択"` |

### キーボード操作マップ

| キー | 動作 |
|------|------|
| `Tab` | 形式Select → 文字コードSelect → ダウンロードボタン の順に移動 |
| `Enter` / `Space` | Select を開く / ダウンロードボタンを押す |
| `Arrow Up/Down` | Select 内の項目を移動 |

### スクリーンリーダー

- ダウンロード開始時: ボタンの `aria-busy="true"` で処理中を通知
- ダウンロード完了時: ボタンテキストが「ダウンロード完了」に変わり、読み上げられる
- 上限超過時: 警告テキストが画面に表示され、フォーカス時に読み上げ

---

## 8. レスポンシブ仕様

| ブレークポイント | 表示形式 | 備考 |
|----------------|---------|------|
| base - md | `StickyDownloadBar`（画面下固定）からモーダルで展開 | 簡略表示 |
| lg以上 | テーブル下部にインライン配置 | フル表示 |

### モバイルでの動作フロー

1. `StickyDownloadBar` に「ダウンロード」ボタンと残数を表示
2. ボタンタップで `Sheet`（ドロワー）を開き、形式・文字コード選択を表示
3. ドロワー内で設定後、ダウンロード実行

### StickyDownloadBar 仕様

モバイル（lg未満）で画面下部に固定表示されるバー。

| 項目 | 仕様 |
|------|------|
| 高さ | `56px` + `env(safe-area-inset-bottom)`（iOSノッチ対応） |
| 内容 | 件数表示（LiveCounter small）+ ダウンロードボタン |
| 背景 | `bg-white` + `border-t border-border` |
| ポジション | `fixed bottom-0 left-0 right-0 z-30` |
| 表示条件 | `resultCount > 0` の場合のみ表示 |
| Sheet連携 | ダウンロードボタンタップで DownloadPanel 全体を `Sheet side="bottom"` で展開 |

```
┌────────────────────────────────────────────┐
│  12,345件  │  [ ⬇ ダウンロード ]          │  ← h-[56px] + safe-area
│            │                               │     bg-white + border-t
└────────────────────────────────────────────┘
```

```tsx
<div
  className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-border"
  style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
>
  <div className="flex items-center justify-between h-[56px] px-md">
    <span className="text-counter font-mono tabular-nums text-primary">
      {resultCount.toLocaleString("ja-JP")}件
    </span>
    <Button
      size="default"
      onClick={() => setDownloadSheetOpen(true)}
      aria-label="ダウンロード設定を開く"
    >
      <Download className="size-4" />
      ダウンロード
    </Button>
  </div>
</div>
```

### StickyDownloadBar との連携

```tsx
// lg未満ではStickyDownloadBar経由で呼び出す
<div className="hidden lg:block">
  <DownloadPanel {...props} />
</div>
<div className="lg:hidden">
  <StickyDownloadBar
    resultCount={resultCount}
    remainingDownloads={remaining}
    onDownload={() => setDownloadSheetOpen(true)}
    visible={resultCount > 0}
  />
  <Sheet open={downloadSheetOpen} onOpenChange={setDownloadSheetOpen}>
    <SheetContent side="bottom">
      <DownloadPanel {...props} />
    </SheetContent>
  </Sheet>
</div>
```

---

## 9. 依存関係

| パッケージ | 用途 |
|-----------|------|
| `shadcn/ui Button` | ダウンロードボタン |
| `shadcn/ui Select` | 形式・文字コード選択 |
| `shadcn/ui Progress` | 残数プログレスバー |
| `shadcn/ui Label` | フォームラベル |
| `shadcn/ui Sheet` | モバイルでのドロワー表示 |
| `lucide-react` | Download, Check, AlertTriangle アイコン |

---

## 10. 使用例

```tsx
import { DownloadPanel } from "@/components/download-panel";

export function SearchResultFooter() {
  const { resultCount } = useSearchResults();
  const { downloadedCount, downloadLimit } = useDownloadQuota();
  const [downloading, setDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);

  const handleDownload = async (options: DownloadOptions) => {
    setDownloading(true);
    try {
      await downloadCompanies(options);
      setDownloadComplete(true);
      setTimeout(() => setDownloadComplete(false), 3000);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <DownloadPanel
      resultCount={resultCount}
      downloadedCount={downloadedCount}
      downloadLimit={downloadLimit}
      onDownload={handleDownload}
      downloading={downloading}
      downloadComplete={downloadComplete}
      asyncProcessing={resultCount > 5000}
    />
  );
}
```

---

## 11. 禁止事項

| 禁止 | 理由 |
|------|------|
| ファイルのプレビュー表示 | ダウンロードは一括操作。プレビューはテーブルで十分 |
| 複数ファイルの同時ダウンロード | 1回の操作で1ファイル。混乱を避ける |
| ダウンロード履歴の表示 | DownloadPanel の責務外。別画面で管理 |
| プログレスバーのアニメーション（増減のトランジション） | brutally-minimal。即時反映 |
| 無限ダウンロード（上限チェックなし） | 必ずプラン上限をチェックし、超過時は無効化する |
| ダウンロード完了のconfetti等の装飾 | brutally-minimal。チェックマーク+色変化のみ |

---

*Generated by CodeGenAgent (Gen) - Phase 2: Design*
*Project: Company List Builder*
