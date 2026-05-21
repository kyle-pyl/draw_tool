import { test, expect } from '@playwright/test';

test.describe('App Navigation', () => {
  test('page loads without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');
    await page.waitForTimeout(2000);

    expect(errors).toEqual([]);
  });

  test('SVG canvas renders', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg', { timeout: 10000 });
    const svg = page.locator('svg').first();
    await expect(svg).toBeVisible();
  });

  test('app renders root element', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#root', { timeout: 10000 });
    const root = page.locator('#root');
    await expect(root).toBeAttached();
  });
});
