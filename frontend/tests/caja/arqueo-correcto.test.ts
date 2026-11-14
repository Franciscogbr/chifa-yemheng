import { test, expect } from '@playwright/test';
import { login } from '../utils/helpers';

test('arqueo de caja se carga', async ({ page }) => {
  await login(page, 'cajero1');
  await page.goto('/admin/caja');
  await expect(page.locator('body')).toContainText(/arqueo/i);
});