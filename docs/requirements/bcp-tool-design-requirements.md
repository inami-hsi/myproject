# BCP自動診断ツール - デザイン要件書

## 1. デザインコンセプト

### 1.1 デザイン方針
| 項目 | 説明 |
|------|------|
| **美的方向性** | `professional-trust` （信頼感 + プロフェッショナリズム） |
| **会社規模感** | 金融系B2B SaaS |
| **気分** | 冷静、堅牢、セキュア |
| **差別化ポイント** | ステップバイステップの親切な診断フロー + AI による洞察 |

### 1.2 トーン
- **色合い**：深いブルー + グレー + アクセント（グリーン安心 / レッド警告）
- **タイポグラフィ**：San-serif（信頼感）、数字は Tabular Nums（正確性）
- **モーション**：Micro-interactions のみ（200ms 以下、無駄なアニメ避退）
- **余白**：十分な「呼吸」を確保、詰め込まない設計

---

## 2. カラーシステム

### 2.1 カラーパレット

```yaml
primary:
  900: "#0a1929"  # ダークナビバーBG
  800: "#0d2a4d"
  700: "#1a4d7a"
  600: "#1976d2"  # Primary Blue（主要アクション）
  500: "#2196f3"  # Light Blue（ホバー）
  400: "#64b5f6"
  300: "#90caf9"
  200: "#bbdefb"
  100: "#e3f2fd"  # 背景ハイライト
  50:  "#f0f7ff"

secondary:
  600: "#00897b"  # Teal（確定・完了）
  500: "#009688"
  400: "#26a69a"
  300: "#80cbc4"
  100: "#e0f2f1"

danger:
  600: "#d32f2f"  # 削除・警告
  500: "#f44336"
  300: "#ef9a9a"
  100: "#ffebee"

warning:
  600: "#f57c00"  # 注意
  500: "#ff9800"
  300: "#ffb74d"
  100: "#fff3e0"

success:
  600: "#388e3c"  # 成功・最適
  500: "#4caf50"
  300: "#81c784"
  100: "#e8f5e9"

neutral:
  900: "#212121"  # 最濃テキスト
  800: "#424242"
  700: "#616161"
  600: "#757575"  # 標準テキスト
  500: "#9e9e9e"  # サブテキスト
  400: "#bdbdbd"
  300: "#e0e0e0"  # 罫線
  200: "#eeeeee"  # ラベルBG
  100: "#f5f5f5"  # Page BG
  50:  "#fafafa"

background:
  default: "#ffffff"
  paper:   "#f5f5f5"
  dark:    "#0a1929"
```

### 2.2 セマンティックカラー

| 用途 | 色 | 用例 |
|------|-----|------|
| **Primary Action** | primary-600 (#1976d2) | 「次へ」「生成」ボタン |
| **Success** | success-500 (#4caf50) | ✅ 成功メッセージ、完了バッジ |
| **Error** | danger-500 (#f44336) | ❌ エラーメッセージ、削除ボタン |
| **Warning** | warning-500 (#ff9800) | ⚠️ 警告、未完了ステップ |
| **Focus** | primary-400 (#64b5f6) | フォーカスリング、ホバー |
| **Disabled** | neutral-300 (#e0e0e0) | 無効ボタン、グレーアウト |

---

## 3. タイポグラフィ

### 3.1 フォント選定

| 用途 | ファミリー | フォールバック |
|------|-----------|---------------|
| **見出し（H1～H4）** | Poppins（w: 600, 700） | Segoe UI, Arial |
| **本文（本体テキスト）** | Inter（w: 400, 500） | Segoe UI, Arial |
| **等幅（コード/数字） | JetBrains Mono | Courier New, monospace |

**理由**：
- `Poppins`：見出しに個性・信頼感
- `Inter`：本文の可読性 + 小サイズでも読みやすい
- `JetBrains Mono`：数値精度を強調

### 3.2 スケール

```
H1 (Heading 1)：2.5rem (40px) / weight 700 / letter-spacing -0.5px
  └─ ページタイトル、例：「BCP自動診断ツール」

H2 (Heading 2)：1.75rem (28px) / weight 700 / letter-spacing -0.3px
  └─ セクションタイトル、例：「Step 2: オールハザード評価」

H3 (Heading 3)：1.25rem (20px) / weight 600
  └─ サブセクション、フォームシェクション名

Body Large：1.125rem (18px) / weight 400 / line-height 1.6
  └─ 重要な説明文、ダイアログテキスト

Body Regular：1rem (16px) / weight 400 / line-height 1.6
  └─ 通常のテキスト、フォームラベル

Body Small：0.875rem (14px) / weight 400 / line-height 1.5
  └─ ヘルプテキスト、ツールチップ、サブテキスト

Caption：0.75rem (12px) / weight 500 / line-height 1.4
  └─ バッジ、タイムスタンプ、メタ情報
```

### 3.3 テキスト装飾ルール
- **Bold**：重要な数値、用語定義のみ
- **Italic**：外来語強調（最小限）
- **Underline**：リンク（<a> タグ）のみ
- **All Caps**：ボタンラベル（多用しない）

---

## 4. コンポーネント仕様

### 4.1 ボタン

#### Primary Button（主要アクション）
```
状態：Normal | Hover | Focus | Disabled | Loading
色：primary.600 #1976d2
背景色：primary.600
テキスト色：white
Padding：12px 24px
Border Radius：8px
Font Weight：600
Min Height：44px（タッチターゲット）

Hover（BG）：primary.700 #1565c0
Focus：primary.600 + focus-ring (2px primary.300)
Disabled：neutral.300 + text opacity 0.5
Loading：spinning indicator + テキストを非表示
```

**HTML例**:
```html
<button class="btn btn-primary">
  📄 Word で生成
</button>
```

#### Secondary Button（代替アクション）
```
背景色：neutral.100
テキスト色：primary.600
ボーダー：1px solid primary.300

Hover（BG）：neutral.200
Focus：primary.600 focus-ring
```

#### Danger Button（削除・警告）
```
背景色：danger.500
テキスト色：white
Hover（BG）：danger.600
```

---

### 4.2 Input フィーム

#### Text Input
```
Height：40px
Padding：8px 12px
Border：1px solid neutral.300
Border Radius：6px
Font Size：0.95rem
Background：white

Focus：
  border-color: primary.600 (2px)
  box-shadow: 0 0 0 3px primary.100
  outline: none

Error：
  border-color: danger.500
  color: danger.600 (text)
  Box-shadow: 0 0 0 3px danger.100
```

#### Placeholder Text
```
Color：neutral.500
Font Style：normal（Italic避退）
Opacity：0.75
```

#### Label
```
Font Size：0.875rem
Font Weight：500
Color：neutral.700
Margin Bottom：4px
Required marker（*）：danger.500
```

---

### 4.3 フォームグループ

```
Spacing（Label → Input）：6px
Spacing（Input → Helper）：6px
Helper Text Color：neutral.600
Error Text Color：danger.600
```

---

### 4.4 テーブル

```
Header Row：
  Background：neutral.100
  Text Color：neutral.800
  Font Weight：600
  Padding：12px
  Border Bottom：2px solid neutral.300

Body Row：
  Padding：12px
  Border Bottom：1px solid neutral.200
  Hover BG：neutral.50

Alternating Rows：
  None（flat design）

Cell Alignment：
  数値：右寄せ
  テキスト：左寄せ
```

---

### 4.5 Accordion / Collapse

```
Header：
  Padding：16px
  Background：neutral.100
  Border：1px solid neutral.300
  Cursor：pointer

Open State：
  Background：primary.50
  Icon (▶)：rotate 90°
  
Body：
  Padding：16px 24px
  Background：white
  Border Bottom：1px solid neutral.300
```

---

### 4.6 Modal / Dialog

```
Overlay：black 40% opacity
Modal Box：
  Background：white
  Border Radius：12px
  Box Shadow：0 10px 40px rgba(0,0,0,0.2)
  Min Width：400px（tablet詳細度対応）
  Max Height：90vh
  Padding：24px（header）, 16px（body）, 16px（footer）

Header：
  Font Size：1.25rem
  Font Weight：700
  Color：neutral.900
  Border Bottom：1px solid neutral.200

Close Button（×）：
  Top Right Corner
  Color：neutral.500
  Hover Color：neutral.700
```

---

### 4.7 Progress Bar（Step表示）

```
Total Width：100%
Height：4px
Background（Track）：neutral.200
Filled（Progress）：primary.600

Animated：
  yes（linear 0.3s）

% Number：
  Font Size：0.875rem
  Color：neutral.600
  Position：right side
```

---

### 4.8 Badge / Chip

```
Priority Badge：
  P1 → danger.600 + white text
  P2 → warning.600 + white text
  P3 → neutral.600 + white text

Status Badge：
  draft → neutral.400
  completed → success.500
  archived → neutral.600

Padding：4px 8px
Border Radius：4px
Font Size：0.75rem
Font Weight：600
```

---

### 4.9 Slider（ハザード脅弱度）

```
Track のWidth：100%
Track Height：6px
Track Background：neutral.300
Filled Track：primary.600

Thumb：
  Width/Height：20px
  Background：white
  Border：3px solid primary.600
  Border Radius：50%
  Cursor：pointer

Tooltip（on hover）：
  BG：neutral.900
  Text Color：white
  Font Size：0.75rem
  Padding：4px 8px
  Border Radius：4px
  Position：top（thumb上部）
```

---

## 5. レイアウト・スペーシング

### 5.1 グリッドシステム

**8px 基準グリッド**：

```
xs: 0.5rem (4px)    → パディング最小、隙間
sm: 1rem (8px)      → 標準パディング
md: 1.5rem (16px)   → セクション内余白
lg: 2rem (32px)     → コンポーネント間隙
xl: 4rem (64px)     → セクション間隙
2xl: 8rem (128px)   → ページ間隙
```

### 5.2 Wizard Layout Spacing

```
Page Padding：
  Desktop：32px（左右）
  Tablet：24px
  Mobile：16px

Header → Progress Bar：32px
Progress Bar → Step Content：32px
Step Content → Buttons：32px

Step Content（内部）：
  見出し → フォーム：16px
  フォーム行間：16px
  セクション区切り：24px
```

---

## 6. レスポンシブ設計

### 6.1 ブレークポイント

```
Mobile：0px ～ 640px（sm）
Tablet：640px ～ 1024px（md, lg）
Desktop：1024px ～（xl, 2xl）
```

### 6.2 Wizard の対応

#### Mobile (375px～)
```
Layout：1 Column（Full Width）
Padding：16px
Font Size：調整なし
ボタン：Full Width stack（縦並び）

Input Height：48px（タッチホバー用）
Button Height：48px（タッチターゲット）
```

#### Tablet (768px～)
```
Layout：1 Column（Max Width 640px, centered）
Padding：24px
ボタン：Flex row（横並び、gap 12px）
Modal Max Width：90vw（max 600px）
```

#### Desktop (1024px～)
```
Layout：2 Column（Form左70%, Sidebar右30%）
Max Content Width：1200px
Side Panel：Progress + Summary
```

### 6.3 Sidebar（Desktop Only）

```
Position：Sticky（右側）
Width：300px
Background：neutral.50
Border Left：1px solid neutral.200
Padding：24px

内容：
  - Step Progress（Details View）
  - Estimated Completion Time
  - Save Status Indicator
  - Quick Actions（Back/Next）
```

---

## 7. ダークモード（未実装、フューチャー対応）

### 7.1 ダークカラー対応

```
Background（Light）： #f5f5f5 → #0a1929（Dark）
Background（Paper）： #ffffff → #121212（Dark）
Text（Primary）：     #212121 → #ffffff（Dark）
Text（Secondary）：    #616161 → #b0bec5（Dark）

Border Color：        #e0e0e0 → #424242（Dark）
```

### 7.2 実装方針
- `<html data-theme="dark">` で制御
- CSS Variable による動的切り替え
- System preference 自動検出（media: prefers-color-scheme）

---

## 8. アイコン

### 8.1 アイコンライブラリ
```
Library：Lucide React
Style：Outline（Line Width: 2px）
Size：20px（標準）, 16px（小）, 24px（大）
Color：親要素のテキスト色を継承
```

### 8.2 使用アイコン例

| アイコン | 用途 |
|---------|------|
| ← / → | 前へ/次へ navigation |
| ✓ | 完了/成功 |
| ℹ️ | Info tip |
| ⚠️ | Warning |
| × | Close modal / Delete |
| 📄 | Word Document |
| 📋 | PDF Document |
| 💾 | Save |
| ↓ | Download |
| ▶ | Expand/Accordion |
| ⭐ | Favorite / Important |

---

## 9. Micro-interactions

### 9.1 Button Hover/Press

```
Normal → Hover：
  Opacity：100% → 90%（background）
  Duration：150ms
  Easing：ease-in-out

Press（Active）：
  Transform：scale(0.98)
  Duration：100ms

Focus（Keyboard）：
  Outline：2px solid primary.300
  Outline Offset：2px
```

### 9.2 Input Focus

```
Border Color Animation：
  neutral.300 → primary.600
  Duration：150ms
  Box Shadow Fade In（0 → 3px）
```

### 9.3 Loading State

```
Button Loading：
  Text Opacity：0% (fade out)
  Spinner In：fade in + rotate 360° (2s linear, infinite)
  Button Disabled：true
```

### 9.4 Toast Notification

```
Slide In：bottom-right, translateX(400px) → 0
Duration：300ms
Easing：ease-out

Auto Dismiss：5s
Slide Out：translateX(400px)
Duration：300ms
```

### 9.5 ページ遷移（Step）

```
内容 Fade Out：opacity 100% → 0% (150ms)
内容 Fade In：opacity 0% → 100% (150ms, delay 150ms)
Total：300ms
```

---

## 10. アクセシビリティ

### 10.1 カラーコントラスト

| 対象 | 最小比率 | 実装例 |
|------|---------|--------|
| 本文テキスト | 4.5:1 | neutral.900 on white = 18.5:1 ✓ |
| 大きいテキスト（18px+） | 3:1 | primary.600 on white = 4.5:1 ✓ |
| UI コンポーネント | 3:1 | primary.600 border on white = 4.5:1 ✓ |
| グラフィクス要素 | 3:1 | アイコン ok |

### 10.2 キーボードナビゲーション

```
Tab Order：
  自然な読み順（左→右、上→下）
  
Skip Link：
  「メインコンテンツへスキップ」（hidden, focus時表示）

Focus Visible：
  全インタラクティブ要素に 2px focus-ring
```

### 10.3 ARIA Label

```
button: aria-label="○○を削除"（アイコンボタン）
form: aria-required="true"（必須項目）
status: aria-live="polite"（toast 通知）
modal: aria-modal="true", role="dialog"
```

### 10.4 スクリーンリーダー対応

```
Hidden Text（Screen Reader Only）：
  <span class="sr-only">（テキスト内容）</span>

Alt Text（画像）：
  <img alt="Step 2: ハザード評価を示す図" />

Form Legend：
  <fieldset><legend>ハザード選択</legend>...
```

---

## 11. デザインシステム実装

### 11.1 CSS Framework
```
Framework：Tailwind CSS
Config：カスタムカラー/タイポグラフィ設定済み
Plugin：カスタムコンポーネント（.bcp-btn等）
```

### 11.2 Storybook（コンポーネント管理）
```
URL：http://localhost:6006/
対象：共通コンポーネント（Button, Input, Modal 等）
ドキュメント：各コンポーネント単位で記載
```

---

## 12. Design Hiearcharchy

### 12.1 視覚的優先度
```
最高優先度（デスティネーション）：
  → Primary Button（Primary Color）
  → 赤いアラート

高優先度：
  → Form Fields（Outline）
  → Section Heading

中優先度：
  → Helper Text
  → Icons

低優先度（背景要素）：
  → Divider Lines
  → Placeholder Text
```

### 12.2 信頼感の醸成
```
✓ 十分な余白 → 詰め込み感なし
✓ 一貫した色使い → 信頼できるブランド
✓ 明確なエラーメッセージ → 何が間違ったか明白
✓ プログレス表示 → 進捗が見える
✓ 確認ダイアログ → 誤操作防止
```

---

## 13. Anti-Patterns（禁止）

以下は使用してはいけません：

| 禁止パターン | 理由 |
|------------|------|
| `Helvetica`, `Arial`, `system-ui` のみ | 個性不足＆可読性低下 |
| 紫グラデーション背景 | AI slop |
| 過度なドロップシャドウ（> 8 layers） | 重くなる |
| グロー効果（box-shadow blur > 20px） | AI slop |
| 予測可能なレイアウト（完全グリッド） | FrontEnd退け |
| 多色カラーパレット（> 10色使用） | 信頼感低下 |
| 無効ボタンの Opacity < 0.5 | アクセシビリティ低下 |
| 無限スクロール（Pagination がベター） | UX悪化 |

---

## 14. 検証チェックリスト

### デザイン品質確保

- [ ] カラーコントラスト比 WCAG AA 達成
- [ ] すべてのボタンサイズ ≥ 44px
- [ ] モバイル画面 375px で正常表示
- [ ] キーボーンnavigation で全機能操作可能
- [ ] Lighthouse Accessibility ≥ 95
- [ ] スクリーンリーダー（NVDA/JAWS）で正常読み上げ
- [ ] Storybook で全コンポーネント確認
- [ ] デザイン仕様書との乖離なし

---

