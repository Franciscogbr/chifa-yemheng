import { test, expect } from '@playwright/test';
import { login } from '../utils/helpers';

test('página de reportes se carga', async ({ page }) => {
  await login(page, 'admin');
  await page.goto('/admin/reportes');
  await expect(page.locator('body')).toContainText(/reporte/i);
});