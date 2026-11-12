import { test, expect } from '@playwright/test';

test('sin sesión se redirige al login', async ({ page }) => {
  await page.goto('/admin');
  await page.waitForURL('**/auth/login');
  await expect(page).toHaveURL(/.*\/auth\/login/);
});