import { test, expect } from '@playwright/test';
import { calculateRecommendations } from '../../src/lib/scoring';

const samples: Record<string, Record<number, string | string[]>> = {
  auto: {
    1: '30-39',
    2: 'commute',
    3: '1',
    4: 'sedan',
    5: ['accident-response', 'cost', 'digital'],
    6: ['rental-car', 'roadside-service'],
    7: 'face-to-face',
    8: ['none'],
  },
  fire: {
    1: 'house',
    2: 'under-5',
    3: 'both',
    4: ['flood', 'typhoon'],
    5: 'wood-low',
    6: ['basic-coverage', 'cost', 'water-damage'],
    7: '5years',
    8: 'claim-first',
  },
  liability: {
    1: 'daily-life',
    2: 'urban',
    3: 'family-3',
    4: 'moderate',
    5: ['legal-support', 'coverage-limit', 'cost'],
    6: 'face-to-face',
    7: 'budget-2k',
  },
  injury: {
    1: 'office',
    2: 'employed',
    3: 'low',
    4: '10000',
    5: ['hospitalization', 'cost', 'service'],
    6: 'budget-1k',
    7: 'online',
  },
};

const stepsByCategory: Record<string, number> = { auto: 8, fire: 8, liability: 7, injury: 7 };

for (const category of Object.keys(samples)) {
  test(`結果ページ表示: ${category}`, async ({ page }) => {
    const testBaseURL = process.env.BASE_URL || 'http://localhost:3000';
    const answers = samples[category];
    const recs = calculateRecommendations(category as any, answers as any);

    // Prepare persisted zustand state
    const stepCount = stepsByCategory[category];
    const persisted = {
      state: {
        currentCategory: category,
        currentStep: stepCount + 1,
        answers: {
          auto: {},
          fire: {},
          liability: {},
          injury: {},
        },
        recommendations: recs,
        showResults: true,
      },
    } as any;

    persisted.state.answers[category] = answers;

    // set localStorage on same-origin page then navigate to results
    const origin = testBaseURL;
    await page.goto(origin, { waitUntil: 'networkidle' });
    await page.evaluate(([k, v]) => localStorage.setItem(k, v), ['insurance-storage', JSON.stringify(persisted)]);

    const url = `${origin}/insurance/loss/${category}/questions/${stepCount + 1}`;
    await page.goto(url, { waitUntil: 'networkidle' });

    // Assert page header is present
    await page.waitForSelector('h1', { timeout: 10000 });
    await expect(page.locator('h1', { hasText: '推奨結果' })).toBeVisible({ timeout: 10000 });

    // Company name from precomputed recommendations should appear as h2
    const firstCompany = recs[0].companyName;
    await expect(page.getByRole('heading', { name: firstCompany, level: 2 }).first()).toBeVisible();

    // Match score numeric exists and in 0-100
    // Score is shown either in desktop format (hidden sm:block) or mobile format (sm:hidden)
    const scoreLocator = page.locator('[class*="font-bold"][class*="text-accent-500"]').first();
    await expect(scoreLocator).toBeVisible();
    const scoreText = (await scoreLocator.innerText()).trim();
    const n = Number(scoreText.replace(/[^0-9.]/g, ''));
    expect(n).toBeGreaterThanOrEqual(0);
    expect(n).toBeLessThanOrEqual(100);
  });
}
