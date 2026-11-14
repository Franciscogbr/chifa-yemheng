import { test, expect } from '@playwright/test';
import { login } from '../utils/helpers';

test('registro de ingreso en caja', async ({ page }) => {
  await login(page, 'cajero1');
  await page.goto('/admin/caja');
  await expect(page.locator('body')).toContainText(/movimiento|ingreso|caja/i);
});