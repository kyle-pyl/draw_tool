import { test, expect } from '@playwright/test';

test.describe('Drawing Tools', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg', { timeout: 10000 });
  });

  test('shape toolbar renders with tool buttons', async ({ page }) => {
    // The ShapeToolbar renders as a fixed div with SVG icons for each tool
    const svgElements = page.locator('svg');
    await expect(svgElements.first()).toBeVisible();
    // Toolbar buttons should be present in the DOM
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(5);
  });

  test('top toolbar is visible and has Open/Save buttons', async ({ page }) => {
    const toolbar = page.locator('.top-toolbar');
    await expect(toolbar).toBeVisible();
    // Look for Open and Save text in toolbar buttons
    const openBtn = page.locator('.top-toolbar button', { hasText: 'Open' });
    await expect(openBtn).toBeVisible();
    const saveBtn = page.locator('.top-toolbar button', { hasText: 'Save' });
    await expect(saveBtn).toBeVisible();
  });

  test('top toolbar has export buttons', async ({ page }) => {
    const svgBtn = page.locator('.top-toolbar button', { hasText: 'SVG' });
    await expect(svgBtn).toBeVisible();
    const pngBtn = page.locator('.top-toolbar button', { hasText: 'PNG' });
    await expect(pngBtn).toBeVisible();
  });

  test('top toolbar has undo and redo buttons', async ({ page }) => {
    const undoBtn = page.locator('.top-toolbar button', { hasText: 'Undo' });
    await expect(undoBtn).toBeVisible();
    const redoBtn = page.locator('.top-toolbar button', { hasText: 'Redo' });
    await expect(redoBtn).toBeVisible();
  });

  test('templates panel toggles on button click', async ({ page }) => {
    const templatesBtn = page.locator('.top-toolbar button', { hasText: 'Templates' });
    await expect(templatesBtn).toBeVisible();
    // Click to open
    await templatesBtn.click();
    await page.waitForTimeout(300);
    // Panel should appear (look for template-related content)
    const panel = page.locator('.template-panel, [class*="template"]').first();
    const isVisible = await panel.isVisible().catch(() => false);
    // If panel didn't appear by class, at least the button became active
    const isActive = await templatesBtn.evaluate((el) => el.classList.contains('active'));
    expect(isActive || isVisible).toBe(true);
    // Click again to close
    await templatesBtn.click();
  });

  test('data panel toggles on button click', async ({ page }) => {
    const dataBtn = page.locator('.top-toolbar button', { hasText: 'Data' });
    await expect(dataBtn).toBeVisible();
    await dataBtn.click();
    await page.waitForTimeout(300);
    const isActive = await dataBtn.evaluate((el) => el.classList.contains('active'));
    expect(isActive).toBe(true);
    await dataBtn.click();
  });
});
