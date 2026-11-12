import { test, expect } from '@playwright/test';
import { login } from '../utils/helpers';

test('página de unidades se carga', async ({ page }) => {
  await login(page, 'admin', 'admin123');
  await page.goto('/admin/unidades');
  await expect(page.locator('body')).toContainText(/unidad/i);
});