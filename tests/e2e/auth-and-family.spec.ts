// 464 – E2E Test: Login & Register Flow
// 465 – E2E Test: Family Invite Flow
// Uses Playwright — Run: npx playwright test tests/e2e/
// Install: npm install -D @playwright/test && npx playwright install

import { test, expect, Page } from '@playwright/test';

const APP_URL    = process.env.APP_URL    || 'http://localhost:3000';
const TEST_EMAIL = process.env.TEST_EMAIL || `e2e_${Date.now()}@yumna.app`;
const TEST_PASS  = process.env.TEST_PASS  || 'E2ETest@Yumna123!';
const TEST_NAME  = 'Testing E2E User';

// ── 464: Login & Register Flow ────────────────────────────────────────────
test.describe('Auth Flow (Task 464)', () => {
  test('Register → Redirect to Dashboard', async ({ page }: { page: Page }) => {
    await page.goto(`${APP_URL}/register`);
    await page.waitForLoadState('networkidle');

    // Fill registration form
    await page.fill('input[name="name"], input[placeholder*="nama"], input[placeholder*="Nama"]', TEST_NAME);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASS);

    // Submit
    await page.click('button[type="submit"]');

    // Should reach dashboard or family-setup
    await expect(page).toHaveURL(/dashboard|family|setup/, { timeout: 10_000 });
    await expect(page.locator('h1, [data-testid="dashboard-title"]')).toBeVisible({ timeout: 8_000 });
  });

  test('Login with valid credentials', async ({ page }: { page: Page }) => {
    await page.goto(`${APP_URL}/login`);
    await page.waitForLoadState('networkidle');

    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASS);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/dashboard/, { timeout: 10_000 });
  });

  test('Login with wrong password shows error', async ({ page }: { page: Page }) => {
    await page.goto(`${APP_URL}/login`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', 'WrongPassword!');
    await page.click('button[type="submit"]');

    // Should stay on login page and show error
    await expect(page).toHaveURL(/login/, { timeout: 5_000 });
    const errorMsg = page.locator('[role="alert"], .text-red-500, .text-rose-500');
    await expect(errorMsg).toBeVisible({ timeout: 5_000 });
  });

  test('Protected route redirects unauthenticated to login', async ({ page }: { page: Page }) => {
    // Clear cookies
    await page.context().clearCookies();
    await page.goto(`${APP_URL}/dashboard`);
    await expect(page).toHaveURL(/login/, { timeout: 8_000 });
  });
});

// ── 465: Family Invite Flow ───────────────────────────────────────────────
test.describe('Family Invite Flow (Task 465)', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    // Login before each test
    await page.goto(`${APP_URL}/login`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASS);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 10_000 });
  });

  test('Navigate to family settings', async ({ page }: { page: Page }) => {
    await page.goto(`${APP_URL}/dashboard/profile`);
    await expect(page.locator('text=Keluarga, text=Family')).toBeVisible({ timeout: 8_000 });
  });

  test('Family invite form visible on profile page', async ({ page }: { page: Page }) => {
    await page.goto(`${APP_URL}/dashboard/profile`);
    // Invite section should exist
    const inviteBtn = page.locator('button:has-text("Undang"), button:has-text("Invite")');
    await expect(inviteBtn).toBeVisible({ timeout: 8_000 });
  });

  test('Dashboard loads key widgets', async ({ page }: { page: Page }) => {
    await page.goto(`${APP_URL}/dashboard`);
    // Check for core dashboard elements
    await expect(page.locator('[id*="wallet"], [data-wallet], text=Dompet')).toBeVisible({ timeout: 10_000 });
  });
});

// ── 466: AI Transaction Entry Flow ────────────────────────────────────────
test.describe('AI Transaction Flow (Task 466)', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto(`${APP_URL}/login`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASS);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 10_000 });
  });

  test('Chat page loads with input field', async ({ page }: { page: Page }) => {
    await page.goto(`${APP_URL}/dashboard/chat`);
    const input = page.locator('textarea, input[placeholder*="pesan"], input[placeholder*="chat"]');
    await expect(input).toBeVisible({ timeout: 8_000 });
  });

  test('Sending a message shows response', async ({ page }: { page: Page }) => {
    await page.goto(`${APP_URL}/dashboard/chat`);
    const input = page.locator('textarea').first();
    await input.fill('Saya beli nasi goreng 25000');
    await page.keyboard.press('Enter');

    // Wait for AI response bubble
    const response = page.locator('[class*="bubble"], [class*="message"], [class*="chat"]').last();
    await expect(response).toBeVisible({ timeout: 15_000 });
  });
});
