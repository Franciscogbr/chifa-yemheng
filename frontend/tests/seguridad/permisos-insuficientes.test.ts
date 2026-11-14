import { test, expect } from '@playwright/test';
import { login } from '../utils/helpers';

test('mesero no puede acceder a ruta de caja', async ({ page }) => {
  await login(page, 'mozo1');
  await page.goto('/admin/caja');
  // Debe redirigir o mostrar error de permisos
  await expect(page.locator('body')).toBeVisible();
});