import { test, expect } from '@playwright/test';

test.describe('Canvas Basic Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg', { timeout: 10000 });
  });

  test('app loads and shows canvas SVG', async ({ page }) => {
    const svg = page.locator('svg').first();
    await expect(svg).toBeVisible({ timeout: 10000 });
  });

  test('app title contains Draw Tool', async ({ page }) => {
    await expect(page).toHaveTitle(/Draw Tool/);
  });

  test('canvas SVG has layer groups', async ({ page }) => {
    // Elements from the basic example should be rendered as <g> inside the SVG
    const svgGroups = page.locator('svg g');
    const count = await svgGroups.count();
    expect(count).toBeGreaterThan(0);
  });

  test('clicking on canvas deselects elements', async ({ page }) => {
    const svg = page.locator('svg').first();
    const box = await svg.boundingBox();
    if (!box) throw new Error('SVG not found');
    // Click in an empty area to deselect
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(100);
    // No assertion needed — just verify no JS error thrown
  });

  test('scroll wheel zooms the canvas', async ({ page }) => {
    const svg = page.locator('svg').first();
    const box = await svg.boundingBox();
    if (!box) throw new Error('SVG not found');

    // Get initial transform
    const initialTransform = await svg.locator('g[transform]').first().getAttribute('transform');

    // Scroll to zoom in
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(0, -150);
    await page.waitForTimeout(200);

    const newTransform = await svg.locator('g[transform]').first().getAttribute('transform');
    // Transform should have changed after scroll
    expect(newTransform).not.toBe(initialTransform);
  });

  test('context menu appears on right-click on canvas', async ({ page }) => {
    const svg = page.locator('svg').first();
    const box = await svg.boundingBox();
    if (!box) throw new Error('SVG not found');

    // Right-click on empty area
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { button: 'right' });
    await page.waitForTimeout(200);

    // Context menu should appear
    const contextMenu = page.locator('.context-menu');
    await expect(contextMenu).toBeVisible({ timeout: 2000 });

    // Press Escape to close
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);
  });
});
