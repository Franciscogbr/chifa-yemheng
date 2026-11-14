import { test, expect } from '@playwright/test';
import { login } from '../utils/helpers';

test('página de rendiciones se carga', async ({ page }) => {
  await login(page, 'cajero1');
  await page.goto('/admin/rendiciones');
  await expect(page.locator('body')).toContainText(/rendicion|cierre/i);
});