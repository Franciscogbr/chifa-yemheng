import { test, expect } from '@playwright/test';
import { login } from '../utils/helpers';

test('página de tipos de mesa se carga', async ({ page }) => {
  await login(page, 'admin');
  await page.goto('/admin/mesas');
  await expect(page.locator('body')).toContainText(/mesa/i);
});