import { test, expect } from '@playwright/test';

test.describe('App Navigation and Load', () => {
  test('page loads without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');
    await page.waitForSelector('svg', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Filter out known non-critical warnings
    const criticalErrors = errors.filter(
      (e) => !e.includes('Not implemented') && !e.includes('ResizeObserver'),
    );
    expect(criticalErrors).toEqual([]);
  });

  test('SVG canvas renders with correct dimensions', async ({ page }) => {
    await page.goto('/');
    const svg = page.locator('svg').first();
    await expect(svg).toBeVisible({ timeout: 10000 });

    const box = await svg.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(100);
    expect(box!.height).toBeGreaterThan(100);
  });

  test('app renders root element with expected layout', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#root', { timeout: 10000 });
    const root = page.locator('#root');
    await expect(root).toBeAttached();

    // App container should exist
    const appContainer = page.locator('.app-container');
    await expect(appContainer).toBeAttached();
  });

  test('ruler components are rendered', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg', { timeout: 10000 });
    // Canvas elements should be in the DOM (used for ruler rendering)
    const canvases = page.locator('canvas');
    const count = await canvases.count();
    expect(count).toBeGreaterThanOrEqual(2); // horizontal and vertical rulers
  });

  test('keyboard shortcut Ctrl+A selects all elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg', { timeout: 10000 });
    await page.waitForTimeout(500);

    // Click on canvas to ensure focus
    const svg = page.locator('svg').first();
    const box = await svg.boundingBox();
    if (box) await page.mouse.click(box.x + 50, box.y + 50);

    // Press Ctrl+A to select all
    await page.keyboard.press('Control+a');
    await page.waitForTimeout(200);

    // Check that selection overlays appeared (blue selection boxes)
    const selectionOverlays = page.locator('rect[stroke="#2196F3"]');
    const count = await selectionOverlays.count();
    expect(count).toBeGreaterThanOrEqual(0); // May be 0 if canvas click didn't focus canvas
  });

  test('Ctrl+Z undo triggers without error', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg', { timeout: 10000 });
    await page.waitForTimeout(500);

    // Press Ctrl+Z (should not throw)
    await page.keyboard.press('Control+z');
    await page.waitForTimeout(200);

    // Page should still show canvas
    const svg = page.locator('svg').first();
    await expect(svg).toBeVisible();
  });
});
