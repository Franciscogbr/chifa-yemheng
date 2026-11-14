import { test, expect } from '@playwright/test';
import { login } from '../utils/helpers';

test('página de personal se carga', async ({ page }) => {
  await login(page, 'admin');
  await page.goto('/admin/personal');
  await expect(page.locator('body')).toContainText(/personal|usuario|empleado/i);
});