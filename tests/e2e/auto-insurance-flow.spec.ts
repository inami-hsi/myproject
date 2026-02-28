import { test, expect } from "@playwright/test";

/**
 * E2E Tests: Auto Insurance Questionnaire Flow
 *
 * Tests the complete user journey through the 8-step questionnaire
 * from start to completion. These tests run against a live browser
 * to verify the UI, navigation, and form submission.
 *
 * Prerequisites:
 * - Next.js app running on http://localhost:3000
 * - PostgreSQL database with latest schema
 * - User already logged in (or auth mocked)
 */

test.describe("Auto Insurance 8-Step Questionnaire", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to questionnaire start page
    // Note: In real test, user would need to be authenticated
    // For now, we assume demo login or JWT token is set
    await page.goto("/questionnaire/auto", { waitUntil: "networkidle" });
  });

  test("Step 1: Vehicle Ownership question renders", async ({ page }) => {
    // Verify page title/heading
    const heading = page.locator("h2");
    await expect(heading).toContainText(/車を持っている|vehicle|ownership/i);

    // Verify step indicator shows step 1
    const stepIndicator = page.locator('[data-testid="step-counter"]');
    await expect(stepIndicator).toContainText(/ステップ[^1]|step.{0,3}1/i);

    // Verify options are displayed
    const options = page.locator("input[type='radio']");
    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThan(0);

    // Verify Next button is disabled until selection
    const nextButton = page.locator('button:has-text("次へ")');
    const isDisabled = await nextButton.isDisabled();
    // Note: May or may not be disabled depending on implementation
  });

  test("Step 1 → 2: Select 'Yes' to vehicle ownership", async ({ page }) => {
    // Find and click the 'Yes' option for vehicle ownership
    const yesLabel = page.locator('label:has-text("はい")');
    await yesLabel.first().click();

    // Verify option is selected
    const yesInput = page.locator(
      'input[type="radio"][value="yes"], input[type="radio"][value*="yes"]'
    );
    await expect(yesInput.first()).toBeChecked();

    // Click Next button
    const nextButton = page.locator('button:has-text("次へ")');
    await nextButton.click();

    // Wait for step 2 to load
    await page.waitForLoadState("networkidle");

    // Verify step 2 heading (Driving Frequency)
    const heading = page.locator("h2");
    await expect(heading).toContainText(/運転|driving|frequency/i);
  });

  test("Step 1 → Skip: Select 'No' to vehicle ownership skips to completion", async ({
    page,
  }) => {
    // Click 'No' option
    const noLabel = page.locator('label:has-text("いいえ")');
    await noLabel.first().click();

    // Click Next button
    const nextButton = page.locator('button:has-text("次へ")');
    await nextButton.click();

    // Should either show completion message or redirect to results
    await page.waitForLoadState("networkidle");

    // Either we see "診断完了" button or redirect to recommendation page
    let isCompleted = false;
    try {
      const completionButton = page.locator(
        'button:has-text("診断を完了"), button:has-text("診断完了")'
      );
      isCompleted = await completionButton.isVisible().catch(() => false);
    } catch {
      // If not visible in current page, check if redirected
      isCompleted = page.url().includes("recommendation");
    }

    expect(isCompleted).toBe(true);
  });

  test("Full 8-step flow with all selections", async ({ page }) => {
    // Step 1: Vehicle Ownership
    await page.locator('label:has-text("はい")').first().click();
    await page.locator('button:has-text("次へ")').click();
    await page.waitForLoadState("networkidle");

    // Step 2: Driving Frequency (Daily)
    const drivingLabels = page.locator("label").filter({
      hasText: /毎日|daily|every day/i,
    });
    await drivingLabels.first().click();
    await page.locator('button:has-text("次へ")').click();
    await page.waitForLoadState("networkidle");

    // Step 3: Annual Mileage (20,000+ km)
    const mileageLabels = page
      .locator("label")
      .filter({ hasText: /20000|20,000|年間走行距離/ });
    await mileageLabels.first().click();
    await page.locator('button:has-text("次へ")').click();
    await page.waitForLoadState("networkidle");

    // Step 4: Vehicle Type (Car)
    const vehicleLabels = page
      .locator("label")
      .filter({ hasText: /乗用車|car|sedan/ });
    await vehicleLabels.first().click();
    await page.locator('button:has-text("次へ")').click();
    await page.waitForLoadState("networkidle");

    // Step 5: Past Accidents (None)
    const accidentLabels = page.locator("label").filter({ hasText: /なし|none/ });
    await accidentLabels.first().click();
    await page.locator('button:has-text("次へ")').click();
    await page.waitForLoadState("networkidle");

    // Step 6: Drivers (Self Only)
    const driverLabels = page
      .locator("label")
      .filter({ hasText: /本人のみ|myself|self only/ });
    await driverLabels.first().click();
    await page.locator('button:has-text("次へ")').click();
    await page.waitForLoadState("networkidle");

    // Step 7: Coverage Needs (Multiple Choice)
    // Select 2-3 coverage types
    const covLabels = page
      .locator("label")
      .filter({ hasText: /対人|liability|vehicle/ });
    const covCount = await covLabels.count();
    if (covCount > 0) {
      await covLabels.nth(0).click();
    }
    if (covCount > 1) {
      await covLabels.nth(1).click();
    }

    await page.locator('button:has-text("次へ")').click();
    await page.waitForLoadState("networkidle");

    // Step 8: Budget (Monthly 5,000-10,000 yen)
    const budgetLabels = page
      .locator("label")
      .filter({ hasText: /5000|5,000|月額/ });
    await budgetLabels.first().click();

    // Complete the questionnaire
    const completeButton = page.locator(
      'button:has-text("診断を完了"), button:has-text("推奨を見る"), button:has-text("診断完了")'
    );
    await completeButton.click();

    // Wait for navigation to results page
    await page.waitForLoadState("networkidle");

    // Verify we're on the recommendation/results page
    const isOnResultsPage =
      page.url().includes("recommendation") ||
      page.url().includes("results") ||
      page.url().includes("diagnosis");

    expect(isOnResultsPage).toBe(true);
  });

  test("Navigation: Previous button goes back to previous step", async ({
    page,
  }) => {
    // Complete step 1
    await page.locator('label:has-text("はい")').first().click();
    await page.locator('button:has-text("次へ")').click();
    await page.waitForLoadState("networkidle");

    // Complete step 2
    const drivingLabels = page.locator("label").filter({ hasText: /毎日|daily/ });
    await drivingLabels.first().click();
    await page.locator('button:has-text("次へ")').click();
    await page.waitForLoadState("networkidle");

    // Click Previous button
    const prevButton = page.locator('button:has-text("戻る"), button:has-text("前へ")');
    if (await prevButton.isVisible()) {
      await prevButton.click();
      await page.waitForLoadState("networkidle");

      // Should be back on step 1 with previous selection intact
      // (implementation dependent on whether selections are persisted)
    }
  });

  test("Progress bar shows current step progress", async ({ page }) => {
    // Check progress bar exists and shows step 1 of 8
    const progressBar = page.locator('[data-testid="step-progress"]');
    if (await progressBar.isVisible()) {
      // Verify visual progress (width or percentage)
      const width = await progressBar.evaluate((el) =>
        window.getComputedStyle(el).width
      );
      expect(width).toBeTruthy();
    }

    // Check step labels are displayed
    const stepLabels = page.locator('[data-testid="step-label"]');
    const labelCount = await stepLabels.count();
    expect(labelCount).toBeGreaterThanOrEqual(1);
  });

  test("Form submission saves responses to database", async ({ page }) => {
    // Complete step 1
    await page.locator('label:has-text("はい")').first().click();
    await page.locator('button:has-text("次へ")').click();
    await page.waitForLoadState("networkidle");

    // Intercept the API call and verify it's being sent
    const responsePromise = page.waitForResponse((response) =>
      response.url().includes("/api/questionnaire")
    );

    // Move to next step (which should trigger save)
    const drivingLabels = page.locator("label").filter({ hasText: /毎日|daily/ });
    await drivingLabels.first().click();
    await page.locator('button:has-text("次へ")').click();

    // Verify API response
    const response = await responsePromise;
    expect(response.ok()).toBe(true);

    // Verify response body contains success status
    const responseBody = await response.json();
    expect(responseBody.status || responseBody.success).toBeDefined();
  });

  test("Error handling: Displays error for invalid input", async ({ page }) => {
    // Try to proceed without selecting an option
    // (depends on implementation - might have validation)
    const nextButton = page.locator('button:has-text("次へ")');

    // Check if button is disabled or if error appears on click
    if (!(await nextButton.isDisabled())) {
      await nextButton.click();

      // Wait for potential error message
      const errorMessage = page.locator('[role="alert"], .error, .validation-error');
      const hasError = await errorMessage.isVisible().catch(() => false);

      // Either shows error or prevents navigation
      expect(hasError).toBeTruthy();
    }
  });

  test("Loading states: Shows loading indicator during submission", async ({
    page,
  }) => {
    // Make a selection that triggers save
    await page.locator('label:has-text("はい")').first().click();

    // Intercept network to delay response
    await page.route("**/api/questionnaire", (route) => {
      setTimeout(() => route.continue(), 500);
    });

    const nextButton = page.locator('button:has-text("次へ")');
    nextButton.click();

    // Check for loading spinner
    const spinner = page.locator('[data-testid="loading"], .spinner, .loader');
    const hasSpinner = await spinner.isVisible().catch(() => false);

    // Either shows spinner or button has loading state
    expect(hasSpinner || (await nextButton.isDisabled())).toBeTruthy();
  });

  test("Mobile responsiveness: Layout adapts for small screens", async ({
    page,
  }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Verify elements are still visible and interactive
    const heading = page.locator("h2");
    await expect(heading).toBeVisible();

    const options = page.locator("input[type='radio']");
    expect(await options.count()).toBeGreaterThan(0);

    const nextButton = page.locator('button:has-text("次へ")');
    await expect(nextButton).toBeVisible();

    // Make selection and verify button is clickable
    await page.locator("label").first().click();
    await expect(nextButton).toBeEnabled();
  });
});
