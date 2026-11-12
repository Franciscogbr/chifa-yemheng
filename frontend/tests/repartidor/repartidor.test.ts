import { test, expect } from '@playwright/test';

test('página de login de repartidor se carga', async ({ page }) => {
  await page.goto('/repartidor/login');
  await expect(page.locator('body')).toBeVisible();
});