import { test, expect } from '@playwright/test';
import { login } from '../utils/helpers';

test('página de seguimiento de delivery se carga', async ({ page }) => {
  await login(page, 'admin', 'admin123');
  await page.goto('/admin/delivery/seguimiento');
  await expect(page.locator('body')).toContainText(/delivery|seguimiento|reparto/i);
});