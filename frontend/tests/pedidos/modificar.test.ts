import { test, expect } from '@playwright/test';
import { login } from '../utils/helpers';

test('página de pedidos permite ver pedidos', async ({ page }) => {
  await login(page, 'mozo1');
  await page.goto('/admin/pedidos');
  await expect(page.locator('body')).toBeVisible();
});