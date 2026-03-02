import { test, expect } from '@playwright/test';

const baseURL = process.env.BASE_URL || 'http://localhost:3000';

// 各生命保険カテゴリの設定
const categoryMap: Record<string, { steps: number; defaultAnswers: Record<number, string> }> = {
  term: {
    steps: 7,
    defaultAnswers: {
      1: '30-39',
      2: 'married-child',
      3: '20years',
      4: '30m',
      5: 'cost',
      6: '3k-5k',
      7: 'online',
    },
  },
  whole: {
    steps: 7,
    defaultAnswers: {
      1: '40-49',
      2: 'savings',
      3: 'pay-65',
      4: '10m',
      5: 'return-rate',
      6: '20k-30k',
      7: 'face-to-face',
    },
  },
  medical: {
    steps: 7,
    defaultAnswers: {
      1: '30-39',
      2: 'healthy',
      3: '5000',
      4: 'lifetime',
      5: 'hospitalization',
      6: '2k-5k',
      7: 'online',
    },
  },
  cancer: {
    steps: 7,
    defaultAnswers: {
      1: '40-49',
      2: 'diagnosis-lump',
      3: '1m',
      4: 'full',
      5: 'diagnosis-benefit',
      6: '2k-5k',
      7: 'online',
    },
  },
  annuity: {
    steps: 5,
    defaultAnswers: {
      1: 'retirement',
      2: '65',
      3: '10-year',
      4: '10k-20k',
      5: 'yen-fixed',
    },
  },
  variable: {
    steps: 5,
    defaultAnswers: {
      1: 'investment',
      2: 'beginner',
      3: 'medium-low',
      4: '10-20',
      5: 'whole-variable',
    },
  },
  education: {
    steps: 5,
    defaultAnswers: {
      1: '0',
      2: '18',
      3: '3m',
      4: 'waiver',
      5: 'high',
    },
  },
  endowment: {
    steps: 5,
    defaultAnswers: {
      1: 'maturity',
      2: '20years',
      3: '5m',
      4: '10k-20k',
      5: 'monthly',
    },
  },
  nursing: {
    steps: 5,
    defaultAnswers: {
      1: 'self-care',
      2: 'care-2',
      3: 'combination',
      4: '5m',
      5: 'lifetime',
    },
  },
  disability: {
    steps: 5,
    defaultAnswers: {
      1: 'income-loss',
      2: '15m',
      3: 'wide',
      4: '60days',
      5: '65',
    },
  },
  income: {
    steps: 5,
    defaultAnswers: {
      1: 'family-income',
      2: '15m',
      3: '65',
      4: '2years',
      5: 'lump-or-annuity',
    },
  },
};

for (const [category, { steps, defaultAnswers }] of Object.entries(categoryMap)) {
  test(`生命保険 ${category}: 全ステップ＋結果ページ`, async ({ page }) => {
    // Q1 にアクセス
    await page.goto(`${baseURL}/insurance/life/${category}/questions/1`, { waitUntil: 'networkidle' });
    
    // ページがロードされるまで待機（クライアントサイドレンダリング対応）
    await page.waitForSelector('input[type="radio"], input[type="checkbox"]', { timeout: 10000 });

    // 各ステップを順番に進める
    for (let step = 1; step <= steps; step++) {
      const answer = defaultAnswers[step];

      // 該当するQ番号ページにいることを確認（URLが正しくなるまで待機）
      await page.waitForURL(`**/${category}/questions/${step}`, { timeout: 10000 });

      // input要素がレンダリングされるまで待機
      await page.waitForSelector('input[type="radio"], input[type="checkbox"]', { timeout: 10000 }).catch(() => {});

      // radio/checkbox/select を見つけてクリック
      const radioByValue = page.locator(`input[type="radio"][value="${answer}"]`);
      const checkboxByValue = page.locator(`input[type="checkbox"][value="${answer}"]`);
      const radioButtons = page.locator('input[type="radio"]');
      const checkboxButtons = page.locator('input[type="checkbox"]');

      if ((await radioByValue.count()) > 0) {
        await radioByValue.first().click({ force: true });
      } else if ((await checkboxByValue.count()) > 0) {
        await checkboxByValue.first().click({ force: true });
      } else if ((await radioButtons.count()) > 0) {
        await radioButtons.first().click({ force: true });
      } else if ((await checkboxButtons.count()) > 0) {
        await checkboxButtons.first().click({ force: true });
      } else {
        const selectElem = page.locator('select');
        if ((await selectElem.count()) > 0) {
          await selectElem.first().selectOption(answer as string);
        } else {
          // デバッグ情報を出力
          console.log(`Step ${step}: No input found. URL: ${page.url()}`);
          console.log('Page HTML snippet:', (await page.content()).substring(0, 2000));
          throw new Error(`No input element found for step ${step}, answer="${answer}"`);
        }
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
