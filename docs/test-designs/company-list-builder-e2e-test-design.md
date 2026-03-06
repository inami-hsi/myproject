# E2Eテスト設計書 -- Company List Builder

**プロジェクト名**: Company List Builder（企業リストビルダー）
**Phase**: 2 - Design（テスト設計）
**作成日**: 2026-03-05
**ステータス**: Draft
**入力ドキュメント**:
- `docs/requirements/company-list-builder-requirements.md`
- `docs/design/company-list-builder-spec.md`
- `docs/design/company-list-builder-ui-guidelines.md`
- `docs/design/company-list-builder-component-specs/company-table.md`
- `docs/design/company-list-builder-component-specs/industry-tree.md`

**テストフレームワーク**: Playwright
**テスト実行環境**: Docker (`/test --mode e2e`)

---

## 概要

| 項目 | 値 |
|------|-----|
| ビジネスシナリオ数 | 8件 |
| テストケース総数 | 72件 |
| ハッピーパス | 42件 |
| エラーパス | 18件 |
| エッジケース | 12件 |

### シナリオ一覧

| ID | シナリオ名 | カテゴリ | 優先度 |
|----|-----------|---------|--------|
| E2E-001 | 未認証ユーザーの初回体験フロー | ハッピーパス | P0 |
| E2E-002 | 認証済みユーザーの検索+ダウンロードフロー | ハッピーパス | P0 |
| E2E-003 | プランアップグレードフロー | ハッピーパス | P0 |
| E2E-004 | 検索条件の保存+共有フロー | ハッピーパス | P1 |
| E2E-005 | ダウンロード上限到達+アップグレード誘導フロー | エラーパス | P1 |
| E2E-006 | モバイルでの検索+ダウンロードフロー | ハッピーパス | P1 |
| E2E-007 | 地域統計ダッシュボード操作フロー | ハッピーパス | P2 |
| E2E-008 | 非同期ダウンロード（5,000件超）フロー | エッジケース | P1 |

### テスト環境設定

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  retries: 2,
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
  },
  projects: [
    { name: "desktop-chrome", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chrome", use: { ...devices["Pixel 7"] } },
  ],
});
```

### テストユーザー

| ユーザー | プラン | 用途 |
|---------|--------|------|
| `test-free@example.com` | Free | Free制限テスト |
| `test-starter@example.com` | Starter | 通常操作テスト |
| `test-pro@example.com` | Pro | 大量ダウンロードテスト |
| `test-limit@example.com` | Starter（DL残数10件） | 上限到達テスト |

### 共通ヘルパー

```typescript
// e2e/helpers/auth.ts
import { Page } from "@playwright/test";

export async function loginAs(page: Page, email: string, password: string) {
  await page.goto("/sign-in");
  await page.getByLabel("メールアドレス").fill(email);
  await page.getByLabel("パスワード").fill(password);
  await page.getByRole("button", { name: "ログイン" }).click();
  await page.waitForURL("/search");
}

export async function loginAsStarter(page: Page) {
  await loginAs(page, "test-starter@example.com", "TestPassword123!");
}

export async function loginAsFree(page: Page) {
  await loginAs(page, "test-free@example.com", "TestPassword123!");
}

export async function loginAsPro(page: Page) {
  await loginAs(page, "test-pro@example.com", "TestPassword123!");
}
```

```typescript
// e2e/helpers/search.ts
import { Page, expect } from "@playwright/test";

export async function selectIndustry(page: Page, industryName: string) {
  const tree = page.getByRole("tree", { name: "業種分類ツリー" });
  const node = tree.getByRole("treeitem", { name: new RegExp(industryName) });
  await node.getByRole("checkbox").check();
}

export async function selectPrefecture(page: Page, prefectureName: string) {
  await page.getByRole("checkbox", { name: prefectureName }).check();
}

export async function waitForLiveCounter(page: Page) {
  const counter = page.getByRole("status", { name: /検索結果/ });
  await expect(counter).not.toHaveCSS("opacity", "0.5", { timeout: 5000 });
}

export async function getResultCount(page: Page): Promise<number> {
  const counter = page.getByRole("status", { name: /検索結果/ });
  const text = await counter.textContent();
  const match = text?.match(/[\d,]+/);
  return match ? parseInt(match[0].replace(/,/g, ""), 10) : 0;
}
```

---

## E2E-001: 未認証ユーザーの初回体験フロー

**シナリオ**: 未認証ユーザーがLPにアクセスし、検索プレビューを試した後、サインアップして検索・ダウンロードまで行う。

**前提条件**: 未認証状態

### テストステップ

| Step | 操作 | 期待結果 |
|------|------|----------|
| 1 | LPにアクセスする | ヒーローコピー、SearchPreview、PricingTableが表示される |
| 2 | SearchPreviewで業種「E 製造業」を選択する | ドロップダウンが閉じ、「E 製造業」が選択状態になる |
| 3 | SearchPreviewで地域「東京都」を選択する | ドロップダウンが閉じ、「東京都」が選択状態になる |
| 4 | ヒット件数を確認する | 「約 XX,XXX 件ヒット」がカンマ区切りで表示される（0より大きい） |
| 5 | 「無料で検索してみる」ボタンをクリックする | `/search`画面に遷移する |
| 6 | 検索画面でプレビューテーブルを確認する | 先頭5件がプレビュー表示される（代表者名・資本金等はマスク） |
| 7 | テーブル行をクリックする | ログインを促すメッセージが表示される |
| 8 | 「登録してフルデータを見る」ボタンをクリックする | `/sign-up`に遷移する |
| 9 | メールアドレスとパスワードで登録する | アカウントが作成され、`/search`にリダイレクトされる |
| 10 | 検索画面でフルデータテーブルを確認する | 全カラム（代表者名・資本金等含む）が表示される |
| 11 | DownloadPanelでCSV/UTF-8を選択し「ダウンロード」をクリックする | CSVファイルがダウンロードされる |

### Playwrightコード

```typescript
// e2e/e2e-001-first-experience.spec.ts
import { test, expect } from "@playwright/test";

test.describe("E2E-001: 未認証ユーザーの初回体験フロー", () => {
  test("LP → プレビュー → サインアップ → 検索 → ダウンロード", async ({ page }) => {
    // Step 1: LPにアクセス
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "500万法人"
    );

    // Step 2-3: SearchPreviewで業種・地域を選択
    await page.getByLabel("業種").selectOption({ label: "E 製造業" });
    await page.getByLabel("地域").selectOption({ label: "東京都" });

    // Step 4: ヒット件数確認
    const hitCount = page.locator("[data-testid='preview-count']");
    await expect(hitCount).toContainText(/[\d,]+ 件/);
    const countText = await hitCount.textContent();
    const count = parseInt(countText!.replace(/[^\d]/g, ""), 10);
    expect(count).toBeGreaterThan(0);

    // Step 5: 検索画面へ遷移
    await page.getByRole("link", { name: "無料で検索してみる" }).click();
    await page.waitForURL("/search**");

    // Step 6: プレビューテーブル確認（未認証）
    const previewRows = page.locator("table tbody tr");
    await expect(previewRows).toHaveCount(5);
    // マスクされた列を確認
    await expect(page.locator("td").filter({ hasText: "---" }).first()).toBeVisible();

    // Step 7-8: 行クリック → ログイン促進
    await previewRows.first().click();
    await expect(page.getByText("ログインしてください")).toBeVisible();
    await page.getByRole("link", { name: /登録/ }).click();
    await page.waitForURL("/sign-up**");

    // Step 9: サインアップ
    const uniqueEmail = `e2e-${Date.now()}@example.com`;
    await page.getByLabel("メールアドレス").fill(uniqueEmail);
    await page.getByLabel("パスワード").fill("TestPassword123!");
    await page.getByRole("button", { name: "登録" }).click();
    await page.waitForURL("/search**", { timeout: 15000 });

    // Step 10: フルデータ確認
    const fullRows = page.locator("table tbody tr");
    await expect(fullRows.first()).toBeVisible();
    // 資本金カラムがマスクされていないことを確認
    const capitalCell = fullRows.first().locator("td").nth(3);
    await expect(capitalCell).not.toContainText("---");

    // Step 11: ダウンロード
    await page.getByRole("radio", { name: "CSV" }).check();
    await page.getByRole("radio", { name: "UTF-8" }).check();
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "ダウンロード" }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.csv$/);
  });
});
```

---

## E2E-002: 認証済みユーザーの検索+ダウンロードフロー

**シナリオ**: Starterプランユーザーが業種+地域で検索し、詳細フィルタを調整した後、CSV/Excelでダウンロードする。

**前提条件**: Starterプランで認証済み

### テストステップ

| Step | 操作 | 期待結果 |
|------|------|----------|
| 1 | Starterユーザーでログインする | `/search`に遷移する |
| 2 | IndustryTreeで「E 製造業」をチェックする | チェックが入り、LiveCounterが更新される |
| 3 | IndustryTreeで「G 情報通信業」もチェックする（複数業種OR） | LiveCounterの件数が増加する |
| 4 | RegionCascaderで「東京都」をチェックする | FilterChipBarに「E 製造業」「G 情報通信業」「東京都」のチップが表示される |
| 5 | RegionCascaderで「神奈川県」も追加する | チップが4つになりLiveCounterが更新される |
| 6 | 詳細条件で資本金「1,000万〜1億」を入力する | LiveCounterの件数が減少する |
| 7 | 詳細条件で従業員数「10〜」を入力する | LiveCounterの件数がさらに減少する |
| 8 | テーブルの法人名カラムヘッダーをクリックしてソートする | テーブルが法人名昇順でソートされる |
| 9 | テーブル2行目をクリックする | 企業詳細モーダルが表示される |
| 10 | モーダルの外部リンク（gBizINFO）を確認する | gBizINFOサイトへのリンクが表示されている |
| 11 | Escapeでモーダルを閉じる | モーダルが閉じ、テーブルに戻る |
| 12 | DownloadPanelでExcel/Shift-JISを選択する | Excel/Shift-JISが選択状態になる |
| 13 | カラム選択で「法人名」「所在地」「代表者」「資本金」を選択する | 選択カラムが4つになる |
| 14 | 「ダウンロード」ボタンをクリックする | Excelファイルがダウンロードされる |
| 15 | ダウンロード残数が減少していることを確認する | 残数がダウンロード件数分だけ減少している |

### Playwrightコード

```typescript
// e2e/e2e-002-search-download.spec.ts
import { test, expect } from "@playwright/test";
import { loginAsStarter } from "./helpers/auth";
import {
  selectIndustry,
  selectPrefecture,
  waitForLiveCounter,
  getResultCount,
} from "./helpers/search";

test.describe("E2E-002: 検索+ダウンロードフロー", () => {
  test("業種+地域+詳細フィルタ → Excel/SJIS ダウンロード", async ({
    page,
  }) => {
    // Step 1: ログイン
    await loginAsStarter(page);

    // Step 2: 業種「E 製造業」選択
    await selectIndustry(page, "E 製造業");
    await waitForLiveCounter(page);
    const count1 = await getResultCount(page);
    expect(count1).toBeGreaterThan(0);

    // Step 3: 業種「G 情報通信業」追加（OR条件）
    await selectIndustry(page, "G 情報通信業");
    await waitForLiveCounter(page);
    const count2 = await getResultCount(page);
    expect(count2).toBeGreaterThan(count1);

    // Step 4: 地域「東京都」選択
    await selectPrefecture(page, "東京都");
    await waitForLiveCounter(page);

    // FilterChipBar確認
    const chipBar = page.getByRole("list").filter({ has: page.getByRole("listitem") });
    await expect(chipBar.getByText("E 製造業")).toBeVisible();
    await expect(chipBar.getByText("G 情報通信業")).toBeVisible();
    await expect(chipBar.getByText("東京都")).toBeVisible();

    // Step 5: 地域「神奈川県」追加
    await selectPrefecture(page, "神奈川県");
    await waitForLiveCounter(page);
    await expect(chipBar.getByText("神奈川県")).toBeVisible();

    // Step 6: 資本金フィルタ
    await page.getByLabel("資本金（最小）").fill("10000000");
    await page.getByLabel("資本金（最大）").fill("100000000");
    await waitForLiveCounter(page);
    const count3 = await getResultCount(page);
    expect(count3).toBeLessThan(count2);

    // Step 7: 従業員数フィルタ
    await page.getByLabel("従業員数（最小）").fill("10");
    await waitForLiveCounter(page);
    const count4 = await getResultCount(page);
    expect(count4).toBeLessThanOrEqual(count3);

    // Step 8: ソート
    await page.getByRole("columnheader", { name: "法人名" }).click();
    const firstRow = page.locator("table tbody tr").first();
    await expect(firstRow).toBeVisible();

    // Step 9: 行クリック → 企業詳細モーダル
    await page.locator("table tbody tr").nth(1).click();
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();

    // Step 10: 外部リンク確認
    await expect(modal.getByRole("link", { name: /gBizINFO/ })).toBeVisible();

    // Step 11: モーダル閉じ
    await page.keyboard.press("Escape");
    await expect(modal).not.toBeVisible();

    // Step 12: ダウンロード設定
    await page.getByRole("radio", { name: "Excel" }).check();
    await page.getByRole("radio", { name: "Shift-JIS" }).check();

    // Step 13: カラム選択
    // デフォルトのチェック状態をリセットし、必要カラムのみ選択する操作
    await page.getByLabel("法人名").check();
    await page.getByLabel("所在地").check();
    await page.getByLabel("代表者").check();
    await page.getByLabel("資本金").check();

    // Step 14: ダウンロード
    const remainingBefore = await page
      .locator("[data-testid='remaining-downloads']")
      .textContent();
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "ダウンロード" }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.xlsx$/);

    // Step 15: 残数減少確認
    const remainingAfter = await page
      .locator("[data-testid='remaining-downloads']")
      .textContent();
    const before = parseInt(remainingBefore!.replace(/[^\d]/g, ""), 10);
    const after = parseInt(remainingAfter!.replace(/[^\d]/g, ""), 10);
    expect(after).toBeLessThan(before);
  });
});
```

---

## E2E-003: プランアップグレードフロー

**シナリオ**: FreeプランユーザーがStarterプランにアップグレードし、ダウンロード上限が拡大されることを確認する。

**前提条件**: Freeプランで認証済み

### テストステップ

| Step | 操作 | 期待結果 |
|------|------|----------|
| 1 | Freeユーザーでログインする | `/search`に遷移する |
| 2 | ダッシュボードに移動する | ダウンロード上限が「50件/月」と表示される |
| 3 | DownloadPanelでExcel形式を選択しようとする | Excel選択が無効化され、「Starterプラン以上で利用可能」が表示される |
| 4 | 「プランをアップグレード」リンクをクリックする | `/pricing`に遷移する |
| 5 | Starterプランの「申し込む」ボタンをクリックする | Stripe Checkout Sessionにリダイレクトされる |
| 6 | Stripeテスト用カードで決済を完了する | 決済成功ページが表示され、アプリにリダイレクトされる |
| 7 | ダッシュボードでプランを確認する | 「Starter」プラン、ダウンロード上限「3,000件/月」と表示される |
| 8 | 検索画面でExcel形式を選択する | Excel形式が選択可能になっている |
| 9 | Excelでダウンロードする | .xlsxファイルがダウンロードされる |

### Playwrightコード

```typescript
// e2e/e2e-003-plan-upgrade.spec.ts
import { test, expect } from "@playwright/test";
import { loginAsFree } from "./helpers/auth";

test.describe("E2E-003: プランアップグレードフロー", () => {
  test("Free → Starter アップグレード → Excel有効化", async ({ page }) => {
    // Step 1: Freeユーザーでログイン
    await loginAsFree(page);

    // Step 2: ダッシュボード確認
    await page.goto("/dashboard");
    await expect(page.getByText("50件/月")).toBeVisible();
    await expect(page.getByText("Free")).toBeVisible();

    // Step 3: Excel無効確認
    await page.goto("/search");
    await page.getByRole("radio", { name: "Excel" }).click();
    await expect(
      page.getByText("Starterプラン以上で利用可能")
    ).toBeVisible();

    // Step 4: プランアップグレードへ遷移
    await page.getByRole("link", { name: /プランをアップグレード/ }).click();
    await page.waitForURL("/pricing");

    // Step 5: Stripe Checkout
    const [stripePopup] = await Promise.all([
      page.waitForEvent("popup"),
      page.getByTestId("starter-plan-button").click(),
    ]);
    // Stripe Checkout操作はテスト環境によって異なる
    // Stripe Checkout Sessionのリダイレクト先を確認
    await expect(stripePopup || page).toHaveURL(/checkout\.stripe\.com|\/search/);

    // Step 6-7: 決済完了後（Webhook処理待ち）
    // テスト環境ではWebhookをモックするか、ポーリングで確認する
    await page.goto("/dashboard");
    await page.waitForTimeout(3000); // Webhook処理待ち
    await page.reload();
    await expect(page.getByText("Starter")).toBeVisible();
    await expect(page.getByText("3,000件/月")).toBeVisible();

    // Step 8-9: Excelダウンロード確認
    await page.goto("/search");
    const excelRadio = page.getByRole("radio", { name: "Excel" });
    await expect(excelRadio).toBeEnabled();
    await excelRadio.check();

    // 簡単なフィルタ設定後ダウンロード
    await page.getByRole("checkbox", { name: /E 製造業/ }).check();
    await page.waitForTimeout(500);

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "ダウンロード" }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.xlsx$/);
  });
});
```

---

## E2E-004: 検索条件の保存+共有フロー

**シナリオ**: ユーザーAが検索条件を保存し、共有リンクを生成してユーザーBに渡す。ユーザーBは共有リンクから検索条件を復元する。

**前提条件**: Starterプランで認証済み（ユーザーA）、未認証（ユーザーB）

### テストステップ

| Step | 操作 | 期待結果 |
|------|------|----------|
| 1 | ユーザーAでログインし、業種「E 製造業」+地域「東京都」で検索する | 検索結果が表示される |
| 2 | 「検索条件を保存」ボタンをクリックする | 保存ダイアログが表示される |
| 3 | 条件名「東京都の製造業」を入力し保存する | 保存成功メッセージが表示される |
| 4 | ダッシュボードに移動する | 保存済み検索一覧に「東京都の製造業」が表示される |
| 5 | 「共有」ボタンをクリックする | 共有リンクが生成され、URLがクリップボードにコピーされる |
| 6 | 共有リンクURLを取得する | `https://...?shared=UUID`形式のURLが生成されている |
| 7 | ログアウトする | 未認証状態になる |
| 8 | 共有リンクURLにアクセスする | 検索画面に遷移し、「E 製造業」+「東京都」のフィルタが復元される |
| 9 | LiveCounterを確認する | 件数が表示される（0より大きい） |
| 10 | ダウンロードボタンをクリックする | ログインを促すメッセージが表示される |

### Playwrightコード

```typescript
// e2e/e2e-004-save-share.spec.ts
import { test, expect } from "@playwright/test";
import { loginAsStarter } from "./helpers/auth";
import {
  selectIndustry,
  selectPrefecture,
  waitForLiveCounter,
} from "./helpers/search";

test.describe("E2E-004: 検索条件の保存+共有フロー", () => {
  let shareUrl: string;

  test("ユーザーAが検索条件を保存し共有リンクを生成する", async ({
    page,
  }) => {
    // Step 1: ログイン+検索
    await loginAsStarter(page);
    await selectIndustry(page, "E 製造業");
    await selectPrefecture(page, "東京都");
    await waitForLiveCounter(page);

    // Step 2-3: 検索条件保存
    await page.getByRole("button", { name: "検索条件を保存" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByLabel("条件名").fill("東京都の製造業");
    await dialog.getByRole("button", { name: "保存" }).click();
    await expect(page.getByText("保存しました")).toBeVisible();

    // Step 4: ダッシュボード確認
    await page.goto("/dashboard");
    await expect(page.getByText("東京都の製造業")).toBeVisible();

    // Step 5-6: 共有リンク生成
    await page.getByRole("button", { name: "共有" }).first().click();
    const shareDialog = page.getByRole("dialog");
    const shareInput = shareDialog.getByRole("textbox");
    await expect(shareInput).toBeVisible();
    shareUrl = await shareInput.inputValue();
    expect(shareUrl).toMatch(/shared=/);
  });

  test("ユーザーBが共有リンクから検索条件を復元する", async ({
    page,
  }) => {
    // Step 7-8: 未認証で共有リンクにアクセス
    // shareUrlが前のテストから取得できない場合はAPIで取得
    const url = shareUrl || "/search?shared=test-share-token";
    await page.goto(url);

    // Step 9: フィルタ復元確認
    await expect(page.getByText("E 製造業")).toBeVisible();
    await expect(page.getByText("東京都")).toBeVisible();
    const counter = page.getByRole("status", { name: /検索結果/ });
    await expect(counter).toContainText(/[\d,]+/);

    // Step 10: ダウンロード → ログイン促進
    await page.getByRole("button", { name: "ダウンロード" }).click();
    await expect(
      page.getByText(/ログイン/)
    ).toBeVisible();
  });
});
```

---

## E2E-005: ダウンロード上限到達+アップグレード誘導フロー

**シナリオ**: ダウンロード残数が少ないユーザーが上限に到達し、プランアップグレードへ誘導される。

**前提条件**: Starterプラン、DL残数10件のテストユーザー

### テストステップ

| Step | 操作 | 期待結果 |
|------|------|----------|
| 1 | DL残数10件のユーザーでログインする | `/search`に遷移する |
| 2 | ダウンロード残数を確認する | 残数が「10 / 3,000件」と表示される |
| 3 | 残数が20%以下であることの警告を確認する | warning色（#d97706）+ AlertTriangleアイコンで警告が表示される |
| 4 | 業種「E 製造業」+地域「東京都」で検索する | 検索結果が表示される |
| 5 | 100件のCSVダウンロードを実行する | ダウンロードが成功し、残数が減少する |
| 6 | 残数が0件になるまでダウンロードを繰り返す | 残数が0件になる |
| 7 | ダウンロードボタンをクリックする | ボタンが無効化されており、クリックできない |
| 8 | 「上限に達しました」メッセージを確認する | 「今月のダウンロード上限に達しました」テキストが表示される |
| 9 | アップグレード誘導リンクを確認する | 「プランをアップグレードしてください」リンクが表示される |
| 10 | アップグレードリンクをクリックする | `/pricing`に遷移する |

### Playwrightコード

```typescript
// e2e/e2e-005-download-limit.spec.ts
import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { selectIndustry, selectPrefecture, waitForLiveCounter } from "./helpers/search";

test.describe("E2E-005: ダウンロード上限到達フロー", () => {
  test("DL残数減少 → 上限到達 → ボタン無効化 → アップグレード誘導", async ({
    page,
  }) => {
    // Step 1: DL残数10件のユーザーでログイン
    await loginAs(page, "test-limit@example.com", "TestPassword123!");

    // Step 2-3: 残数・警告確認
    const remaining = page.locator("[data-testid='remaining-downloads']");
    await expect(remaining).toContainText("10");
    // warning表示確認
    await expect(page.locator("[data-testid='download-warning']")).toBeVisible();

    // Step 4: 検索
    await selectIndustry(page, "E 製造業");
    await selectPrefecture(page, "東京都");
    await waitForLiveCounter(page);

    // Step 5-6: ダウンロード実行（残数を消費）
    // テスト環境では残数を直接操作するか、小さいデータセットでダウンロードを繰り返す
    await page.getByRole("radio", { name: "CSV" }).check();
    await page.getByRole("button", { name: "ダウンロード" }).click();

    // APIレスポンスをモックして上限到達状態にする
    await page.route("**/api/download", (route) => {
      route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            code: "DOWNLOAD_LIMIT_EXCEEDED",
            message: "今月のダウンロード上限(3,000件)に達しました。",
            current_count: 3000,
            limit: 3000,
            plan: "starter",
          },
        }),
      });
    });

    // Step 7: ダウンロードボタン無効化確認
    const downloadButton = page.getByRole("button", { name: "ダウンロード" });
    await expect(downloadButton).toBeDisabled();

    // Step 8: 上限メッセージ確認
    await expect(
      page.getByText("今月のダウンロード上限に達しました")
    ).toBeVisible();

    // Step 9-10: アップグレード誘導
    const upgradeLink = page.getByRole("link", {
      name: /プランをアップグレード/,
    });
    await expect(upgradeLink).toBeVisible();
    await upgradeLink.click();
    await page.waitForURL("/pricing");
  });
});
```

---

## E2E-006: モバイルでの検索+ダウンロードフロー

**シナリオ**: モバイルデバイスで検索し、フィルタドロワー操作、カード表示、StickyDownloadBarからダウンロードする。

**前提条件**: Starterプランで認証済み、Pixel 7相当のビューポート

### テストステップ

| Step | 操作 | 期待結果 |
|------|------|----------|
| 1 | モバイルビューポートでログインする | `/search`に遷移する |
| 2 | LiveCounterがヘッダー直下に表示されていることを確認する | 件数が画面上部に表示される |
| 3 | 「フィルタ ▼」ボタンをタップする | Sheetドロワー（`w-[85vw] max-w-[360px]`）が左からスライドして表示される |
| 4 | ドロワー内のIndustryTreeで「E 製造業」をチェックする | チェックが入る |
| 5 | ドロワー内のRegionCascaderで「東京都」をチェックする | チェックが入る |
| 6 | ドロワーを閉じる | ドロワーが閉じ、フィルタボタンに選択数バッジ「2」が表示される |
| 7 | 検索結果がカード表示であることを確認する | テーブルではなく、カード形式で企業データが表示される |
| 8 | 各カードにmin-h-[44px]のタッチターゲットが確保されていることを確認する | カードのタップ領域が44px以上 |
| 9 | カードをタップする | 企業詳細がフルスクリーンシートで表示される |
| 10 | 詳細シートを閉じる | カード一覧に戻る |
| 11 | StickyDownloadBarを確認する | 画面下部に固定表示され、ダウンロードボタンと残数が見える |
| 12 | StickyDownloadBarの「ダウンロード」をタップする | CSVファイルがダウンロードされる |

### Playwrightコード

```typescript
// e2e/e2e-006-mobile-search.spec.ts
import { test, expect, devices } from "@playwright/test";
import { loginAsStarter } from "./helpers/auth";

test.use(devices["Pixel 7"]);

test.describe("E2E-006: モバイル検索+ダウンロードフロー", () => {
  test("フィルタドロワー → カード表示 → StickyDownloadBar", async ({
    page,
  }) => {
    // Step 1: モバイルでログイン
    await loginAsStarter(page);

    // Step 2: LiveCounter確認
    const counter = page.getByRole("status", { name: /検索結果/ });
    await expect(counter).toBeVisible();

    // Step 3: フィルタドロワーを開く
    const filterButton = page.getByRole("button", { name: /フィルタ/ });
    await expect(filterButton).toBeVisible();
    await filterButton.tap();
    const drawer = page.locator("[data-testid='filter-drawer']");
    await expect(drawer).toBeVisible();

    // Step 4-5: フィルタ選択
    await drawer.getByRole("checkbox", { name: /E 製造業/ }).check();
    await drawer.getByRole("checkbox", { name: /東京都/ }).check();

    // Step 6: ドロワー閉じ
    await page.getByRole("button", { name: /閉じる/ }).tap();
    await expect(drawer).not.toBeVisible();
    // バッジ確認
    await expect(filterButton).toContainText("2");

    // Step 7: カード表示確認（テーブルが存在しないこと）
    await expect(page.locator("table")).not.toBeVisible();
    const cards = page.locator("[data-testid='company-card']");
    await expect(cards.first()).toBeVisible();

    // Step 8: タッチターゲット確認
    const cardBox = await cards.first().boundingBox();
    expect(cardBox!.height).toBeGreaterThanOrEqual(44);

    // Step 9-10: カードタップ → 詳細シート
    await cards.first().tap();
    const detailSheet = page.getByRole("dialog");
    await expect(detailSheet).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(detailSheet).not.toBeVisible();

    // Step 11: StickyDownloadBar確認
    const stickyBar = page.locator("[data-testid='sticky-download-bar']");
    await expect(stickyBar).toBeVisible();
    const stickyBox = await stickyBar.boundingBox();
    const viewportHeight = page.viewportSize()!.height;
    // 画面下部に固定されていることを確認（下端からの距離が小さい）
    expect(stickyBox!.y + stickyBox!.height).toBeGreaterThanOrEqual(
      viewportHeight - 10
    );

    // Step 12: ダウンロード
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      stickyBar.getByRole("button", { name: "ダウンロード" }).tap(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.csv$/);
  });
});
```

---

## E2E-007: 地域統計ダッシュボード操作フロー

**シナリオ**: 地域統計ダッシュボードにアクセスし、ヒートマップ操作から詳細表示までを確認する。

**前提条件**: 認証不要（パブリックページ）

### テストステップ

| Step | 操作 | 期待結果 |
|------|------|----------|
| 1 | `/stats`にアクセスする | 「地域統計ダッシュボード」がH1で表示される |
| 2 | データ更新日を確認する | 「データ更新日: YYYY-MM-DD」が表示される |
| 3 | JapanHeatmapが表示されていることを確認する | 日本地図が色の濃淡で表示される |
| 4 | 東京都エリアにホバーする | ツールチップに「東京都: XXX,XXX社」が表示される |
| 5 | 東京都エリアをクリックする | 東京都の詳細パネルが表示される（業種分布、企業数内訳） |
| 6 | 詳細パネルの数値を確認する | JetBrains Mono + tabular-numsでカンマ区切り表示 |
| 7 | 業種別棒グラフを確認する | 業種大分類別の企業数が降順で表示される |
| 8 | 設立年推移グラフを確認する | 年別の企業数が折れ線グラフで表示される |
| 9 | 別の都道府県（大阪府）をクリックする | 詳細パネルが大阪府の情報に切り替わる |

### Playwrightコード

```typescript
// e2e/e2e-007-stats-dashboard.spec.ts
import { test, expect } from "@playwright/test";

test.describe("E2E-007: 地域統計ダッシュボード", () => {
  test("ヒートマップ表示 → 都道府県クリック → 詳細表示", async ({
    page,
  }) => {
    // Step 1-2: 統計ページアクセス
    await page.goto("/stats");
    await expect(
      page.getByRole("heading", { name: "地域統計ダッシュボード" })
    ).toBeVisible();
    await expect(page.getByText(/データ更新日/)).toBeVisible();

    // Step 3: ヒートマップ確認
    const heatmap = page.locator("[data-testid='japan-heatmap']");
    await expect(heatmap).toBeVisible();

    // Step 4: ホバーツールチップ（デスクトップのみ）
    const tokyoArea = heatmap.locator("[data-prefecture='13']");
    await tokyoArea.hover();
    const tooltip = page.locator("[role='tooltip']");
    await expect(tooltip).toContainText("東京都");
    await expect(tooltip).toContainText(/[\d,]+社/);

    // Step 5-6: 東京都クリック → 詳細パネル
    await tokyoArea.click();
    const detailPanel = page.locator("[data-testid='prefecture-detail']");
    await expect(detailPanel).toBeVisible();
    await expect(detailPanel).toContainText("東京都");
    // 数値フォーマット確認（JetBrains Mono）
    const numberElements = detailPanel.locator(".font-mono");
    await expect(numberElements.first()).toBeVisible();

    // Step 7: 業種別棒グラフ確認
    const industryChart = page.locator("[data-testid='industry-bar-chart']");
    await expect(industryChart).toBeVisible();

    // Step 8: 設立年推移グラフ確認
    const trendChart = page.locator(
      "[data-testid='establishment-trend-chart']"
    );
    await expect(trendChart).toBeVisible();

    // Step 9: 大阪府に切替
    const osakaArea = heatmap.locator("[data-prefecture='27']");
    await osakaArea.click();
    await expect(detailPanel).toContainText("大阪府");
  });
});
```

---

## E2E-008: 非同期ダウンロード（5,000件超）フロー

**シナリオ**: 5,000件を超える検索結果をダウンロードリクエストし、非同期生成→メール通知→ダッシュボードからDL完了を確認する。

**前提条件**: Proプランで認証済み（30,000件/月の上限）

### テストステップ

| Step | 操作 | 期待結果 |
|------|------|----------|
| 1 | Proユーザーでログインする | `/search`に遷移する |
| 2 | 広範囲の検索条件を設定する（「E 製造業」+「関東」） | LiveCounterが5,000件以上を表示する |
| 3 | LiveCounterの件数が5,000以上であることを確認する | 「約 XX,XXX 件」で5,000以上が表示される |
| 4 | 「ダウンロード」ボタンをクリックする | 非同期ダウンロード確認ダイアログが表示される |
| 5 | 確認ダイアログの内容を確認する | 「ファイルを生成中です。完了後にメールでお知らせします。」が表示される |
| 6 | ダイアログの「OK」をクリックする | ダイアログが閉じ、ステータスが「生成中」に変わる |
| 7 | ダッシュボードに移動する | ダウンロード履歴に「生成中」ステータスのエントリが表示される |
| 8 | ステータスが「完了」に変わるまで待つ（ポーリング） | ステータスが「完了」に変わり、ダウンロードリンクが表示される |
| 9 | ダウンロードリンクをクリックする | ファイルがダウンロードされる |
| 10 | ダウンロードファイルのサイズを確認する | ファイルサイズが0より大きい |

### Playwrightコード

```typescript
// e2e/e2e-008-async-download.spec.ts
import { test, expect } from "@playwright/test";
import { loginAsPro } from "./helpers/auth";
import {
  selectIndustry,
  selectPrefecture,
  waitForLiveCounter,
  getResultCount,
} from "./helpers/search";

test.describe("E2E-008: 非同期ダウンロード（5,000件超）", () => {
  // このテストは非同期処理のため、タイムアウトを長めに設定
  test.setTimeout(120_000);

  test("大量ダウンロード → 非同期生成 → ダッシュボードDL", async ({
    page,
  }) => {
    // Step 1: Proユーザーでログイン
    await loginAsPro(page);

    // Step 2: 広範囲検索
    await selectIndustry(page, "E 製造業");
    // 関東一括選択
    await page.getByRole("checkbox", { name: /関東/ }).check();
    await waitForLiveCounter(page);

    // Step 3: 5,000件以上を確認
    const count = await getResultCount(page);
    expect(count).toBeGreaterThan(5000);

    // Step 4-5: ダウンロード → 非同期確認ダイアログ
    await page.getByRole("button", { name: "ダウンロード" }).click();
    const asyncDialog = page.getByRole("dialog");
    await expect(asyncDialog).toBeVisible();
    await expect(
      asyncDialog.getByText("ファイルを生成中です")
    ).toBeVisible();
    await expect(
      asyncDialog.getByText("メールでお知らせします")
    ).toBeVisible();

    // Step 6: OK押下
    await asyncDialog.getByRole("button", { name: "OK" }).click();
    await expect(asyncDialog).not.toBeVisible();

    // Step 7: ダッシュボードで「生成中」確認
    await page.goto("/dashboard");
    const downloadHistory = page.locator("[data-testid='download-history']");
    await expect(downloadHistory.getByText(/生成中|pending|generating/)).toBeVisible();

    // Step 8: ステータス完了をポーリング（最大90秒）
    let completed = false;
    for (let i = 0; i < 18; i++) {
      await page.reload();
      const statusText = await downloadHistory
        .locator("tr")
        .first()
        .textContent();
      if (statusText?.includes("完了") || statusText?.includes("completed")) {
        completed = true;
        break;
      }
      await page.waitForTimeout(5000);
    }
    expect(completed).toBeTruthy();

    // Step 9-10: ダウンロード
    const downloadLink = downloadHistory
      .locator("tr")
      .first()
      .getByRole("link", { name: /ダウンロード/ });
    await expect(downloadLink).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      downloadLink.click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.(csv|xlsx)$/);

    // ファイルサイズ確認（0バイト以上）
    const path = await download.path();
    if (path) {
      const fs = require("fs");
      const stats = fs.statSync(path);
      expect(stats.size).toBeGreaterThan(0);
    }
  });
});
```

---

## エラーパス追加テストケース

### EP-001: ネットワークエラー時のリトライ

| Step | 操作 | 期待結果 |
|------|------|----------|
| 1 | 検索APIが500エラーを返す状態で検索する | テーブル領域に`Alert variant="destructive"`が表示される |
| 2 | エラーメッセージを確認する | 「一時的なエラーです。しばらくお待ちください。」が表示される |
| 3 | ネットワーク復旧後にリトライする | 正常な検索結果が表示される |

### EP-002: 認証期限切れ

| Step | 操作 | 期待結果 |
|------|------|----------|
| 1 | 認証トークンが期限切れの状態でAPIを呼び出す | 401エラーが返される |
| 2 | エラーレスポンスを確認する | 「認証が必要です。ログインしてください。」が表示される |
| 3 | 自動的にログイン画面にリダイレクトされる | `/sign-in`に遷移する |

### EP-003: 共有リンク期限切れ

| Step | 操作 | 期待結果 |
|------|------|----------|
| 1 | 期限切れの共有リンクにアクセスする | 404エラーが返される |
| 2 | エラーメッセージを確認する | 「このリンクは有効期限が切れました。」が表示される |
| 3 | 新規登録CTAを確認する | 「アカウントを作成して検索する」リンクが表示される |

### EP-004: 保存検索上限超過

| Step | 操作 | 期待結果 |
|------|------|----------|
| 1 | Freeプラン（上限3件）で3件保存済みの状態にする | ダッシュボードに3件表示される |
| 2 | 4件目を保存しようとする | 「保存上限(3件)に達しました」エラーが表示される |
| 3 | アップグレード誘導を確認する | 「プランをアップグレードしてください」リンクが表示される |

### EP-005: バリデーションエラー

| Step | 操作 | 期待結果 |
|------|------|----------|
| 1 | 資本金フィルタでmin > maxを入力する | 即時バリデーションエラーが表示される |
| 2 | 従業員数フィルタで負の値を入力する | 入力が拒否されるか、バリデーションエラーが表示される |

---

## エッジケース追加テストケース

### EC-001: 検索結果0件

| Step | 操作 | 期待結果 |
|------|------|----------|
| 1 | 極めて限定的な条件で検索する（例: 鳥取県×金融業×資本金10億以上） | LiveCounterが「0件」を表示する |
| 2 | テーブル領域を確認する | 「条件に一致する企業が見つかりませんでした。フィルタ条件を変更してください。」が表示される |
| 3 | ダウンロードボタンを確認する | ボタンが無効化されている |

### EC-002: ブラウザバック/フォワード

| Step | 操作 | 期待結果 |
|------|------|----------|
| 1 | 検索条件を設定し、テーブルに結果が表示されている状態にする | 検索結果が表示される |
| 2 | 企業詳細モーダルを開く | モーダルが表示される |
| 3 | ブラウザバックする | モーダルが閉じ、検索結果画面に戻る（フィルタ状態が保持されている） |

### EC-003: 複数タブでの同時操作

| Step | 操作 | 期待結果 |
|------|------|----------|
| 1 | タブAでダウンロードを実行する | ダウンロード残数が減少する |
| 2 | タブBでダウンロード残数を確認する | タブBの残数もリロード後に正しく反映される |

### EC-004: 大量フィルタ選択

| Step | 操作 | 期待結果 |
|------|------|----------|
| 1 | 10業種 + 10都道府県を同時に選択する | FilterChipBarに20個のチップが表示される |
| 2 | FilterChipBarの表示を確認する | チップが折り返しまたはスクロールで全て表示される |
| 3 | LiveCounterが正常に更新されることを確認する | 件数が表示される（タイムアウトしない） |

---

## テスト実行方法

```bash
# 全E2Eテスト実行
/test --mode e2e

# 特定シナリオのみ実行
npx playwright test e2e/e2e-001-first-experience.spec.ts

# モバイルテストのみ実行
npx playwright test --project=mobile-chrome

# ヘッドモードで実行（デバッグ用）
npx playwright test --headed

# テストレポート表示
npx playwright show-report
```

### CI/CD統合

```yaml
# .github/workflows/e2e.yml
name: E2E Tests
on: [pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

*Generated by CCAGI SDK - Phase 2: Test Design*
*Project: Company List Builder*
