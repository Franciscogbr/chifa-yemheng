import { test, expect } from '@playwright/test';
import { login } from '../utils/helpers';

test('página de pedidos se carga', async ({ page }) => {
  await login(page, 'mozo1', 'clave123');
  await page.goto('/admin/pedidos');
  await expect(page.locator('body')).toContainText(/pedido/i);
});