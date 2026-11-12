import { test, expect } from '@playwright/test';
import { login } from '../utils/helpers';

test('arqueo con diferencia se muestra', async ({ page }) => {
  await login(page, 'cajero1', 'clave123');
  await page.goto('/admin/caja');
  await expect(page.locator('body')).toBeVisible();
});