import { test, expect } from '@playwright/test';

test('página de delivery de cliente se carga', async ({ page }) => {
  await page.goto('/cliente/delivery');
  await expect(page.locator('body')).toBeVisible();
});