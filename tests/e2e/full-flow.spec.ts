import { test, expect } from '@playwright/test';

const baseURL = process.env.BASE_URL || 'http://localhost:3000';
const categoryMap: Record<string, { steps: number; defaultAnswers: Record<number, string | string[]> }> = {
  auto: {
    steps: 8,
    defaultAnswers: {
      1: 'age-26-34',
      2: 'commute',
      3: 'solo',
      4: 'none',
      5: 'standard',
      6: 'rental-car',
      7: 'face-to-face',
      8: 'none',
    },
  },
  fire: {
    steps: 8,
    defaultAnswers: {
      1: 'house',
      2: 'under-5',
      3: 'both',
      4: 'flood',
      5: 'wood-low',
      6: 'basic-coverage',
      7: '5years',
      8: 'claim-first',
    },
  },
  liability: {
    steps: 7,
    defaultAnswers: {
      1: 'daily-life',
      2: 'urban',
      3: 'family-3',
      4: 'moderate',
      5: 'legal-support',
      6: 'face-to-face',
      7: 'budget-2k',
    },
  },
  injury: {
    steps: 7,
    defaultAnswers: {
      1: 'office',
      2: 'employed',
      3: 'low',
      4: '10000',
      5: 'hospitalization',
      6: 'budget-1k',
      7: 'online',
    },
  },
};

for (const [category, { steps, defaultAnswers }] of Object.entries(categoryMap)) {
  test(`${category}: 全ステップ＋結果ページ`, async ({ page }) => {
    // Q1 にアクセス
    await page.goto(`${baseURL}/insurance/loss/${category}/questions/1`, { waitUntil: 'networkidle' });
    
    // ページがロードされるまで待機（クライアントサイドレンダリング対応）
    // 選択肢ボタンがレンダリングされるまで待機
    await page.waitForSelector('button[type="button"]', { timeout: 10000 });

    // 各ステップを順番に進める
    for (let step = 1; step <= steps; step++) {
      const answer = defaultAnswers[step];

      // 該当するQ番号ページにいることを確認（URLが正しくなるまで待機）
      await page.waitForURL(`**/${category}/questions/${step}`, { timeout: 10000 });

      // 選択肢ボタンがレンダリングされるまで待機
      await page.waitForSelector('button[type="button"]', { timeout: 10000 }).catch(() => {});

      // 選択肢ボタンをクリック（最初のオプションを選択）
      const optionButtons = page.locator('button[type="button"]').filter({ hasText: /.+/ });
      if ((await optionButtons.count()) > 0) {
        // 最初の選択肢ボタンをクリック
        await optionButtons.first().click();
      } else {
        // デバッグ情報を出力
        console.log(`Step ${step}: No option buttons found. URL: ${page.url()}`);
        console.log('Page HTML snippet:', (await page.content()).substring(0, 2000));
        throw new Error(`No option button found for step ${step}`);
      }

      // Next button - より柔軟なセレクタ
      await page.waitForSelector('button', { timeout: 5000 });
      const nextBtn = page.locator('button').filter({ hasText: /次へ|結果を見る/ });
      if ((await nextBtn.count()) === 0) {
        throw new Error(`No next button found on step ${step}`);
      }
      await expect(nextBtn.first()).toBeEnabled({ timeout: 5000 });
      await nextBtn.first().click();

      // ページ遷移を待機
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    }

    // 結果ページに到達したかを確認
    await page.waitForSelector('h1', { timeout: 10000 });
    const heading = page.locator('h1').filter({ hasText: '推奨結果' });
    if ((await heading.count()) === 0) {
      console.log('Current URL:', page.url());
    }
    await expect(heading).toBeVisible({ timeout: 10000 });

    // 会社名が表示されるまで待機（h2 が読み込まれる）
    await page.waitForSelector('h2', { timeout: 15000 });
    // CSRレンダリング完了を待つ
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    
    // スコア確認: 会社名が表示されている
    const companyCards = page.locator('h2');
    await expect(companyCards.first()).toBeVisible({ timeout: 10000 });
    const cardCount = await companyCards.count();
    expect(cardCount).toBeGreaterThanOrEqual(1); // 最低1社の推奨
  });
}
