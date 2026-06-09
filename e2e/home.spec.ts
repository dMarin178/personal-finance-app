import { test, expect } from '@playwright/test';

test('home page loads with welcome message', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Welcome to FinanceApp' })).toBeVisible();
});

test('home page has links to login and register', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Get Started' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible();
});
