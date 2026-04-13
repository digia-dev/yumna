import { test, expect } from '@playwright/test';

test.describe('Visual Regression - Design System', () => {
  test('should match the design system baseline', async ({ page }) => {
    await page.goto('/design-system');
    
    // Wait for animations to settle
    await page.waitForTimeout(1000);
    
    // Take a full page screenshot for regression
    await expect(page).toHaveScreenshot('design-system-baseline.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.1,
    });
  });

  test('should match dark mode baseline', async ({ page }) => {
    await page.goto('/design-system');
    
    // Toggle dark mode (assuming we have a button or just set class)
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('design-system-dark-baseline.png', {
      fullPage: true,
    });
  });
});
