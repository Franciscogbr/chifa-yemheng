import { test, expect } from '@playwright/test';

test('página de login de cliente se carga', async ({ page }) => {
  await page.goto('/cliente/login');
  await expect(page.locator('body')).toBeVisible();
});