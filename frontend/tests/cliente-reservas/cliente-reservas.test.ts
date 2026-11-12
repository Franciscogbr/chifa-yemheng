import { test, expect } from '@playwright/test';

test('página de reservas de cliente se carga', async ({ page }) => {
  await page.goto('/cliente/reservas');
  await expect(page.locator('body')).toBeVisible();
});