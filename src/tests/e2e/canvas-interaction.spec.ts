import { test, expect } from '@playwright/test';

test.describe('Canvas Basic Interaction', () => {
  test('app loads and shows canvas', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('svg')).toBeVisible({ timeout: 10000 });
  });

  test('app title is set', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Draw Tool/);
  });

  test('canvas has correct structure', async ({ page }) => {
    await page.goto('/');
    const svg = page.locator('svg');
    await expect(svg).toBeVisible();
  });
});
