import { test, expect } from '@playwright/test';
import { login } from '../utils/helpers';

test('caja página de cierre se carga', async ({ page }) => {
  await login(page, 'cajero1');
  await page.goto('/admin/caja');
  await expect(page.locator('body')).toContainText(/caja|movimiento|arqueo/i);
});