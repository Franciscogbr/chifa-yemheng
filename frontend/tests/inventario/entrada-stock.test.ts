import { test, expect } from '@playwright/test';
import { login } from '../utils/helpers';

test('página de inventario se carga', async ({ page }) => {
  await login(page, 'almacen1');
  await page.goto('/admin/inventario');
  await expect(page.locator('body')).toContainText(/inventario|insumo|stock/i);
});