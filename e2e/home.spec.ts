import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('loads with welcome message', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Welcome to FinanceApp' })).toBeVisible();
  });

  test('has links to login and register', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Get Started' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible();
  });
});
