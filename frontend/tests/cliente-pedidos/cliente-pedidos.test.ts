import { test, expect } from '@playwright/test';

test('página de pedidos de cliente se carga', async ({ page }) => {
  await page.goto('/cliente/pedido/1');
  await expect(page.locator('body')).toBeVisible();
});