import { test, expect } from '@playwright/test';

test('login page loads with sign in form', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
});

test('login page has link to register', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('link', { name: 'Register here' })).toBeVisible();
});

test('register page loads with create account form', async ({ page }) => {
  await page.goto('/register');
  await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
  await expect(page.locator('input[name="name"]')).toBeVisible();
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible();
});
