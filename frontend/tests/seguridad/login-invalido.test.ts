import { test, expect } from '@playwright/test';

test('login con credenciales inválidas muestra error', async ({ page }) => {
  await page.goto('/auth/login');
  await page.fill('input[id="logeo"]', 'usuario');
  await page.fill('input[id="clave"]', 'clave123');
  await page.click('button[type="submit"]');
  await expect(page.locator('div[role="alert"]')).toBeVisible();
});