import { test, expect } from '@playwright/test';
import { login } from '../utils/helpers';

test('página de dashboard se carga', async ({ page }) => {
  await login(page, 'admin', 'admin123');
  await page.goto('/admin');
  await expect(page.locator('body')).toBeVisible();
});