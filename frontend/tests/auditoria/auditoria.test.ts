import { test, expect } from '@playwright/test';
import { login } from '../utils/helpers';

test('página de auditoría se carga', async ({ page }) => {
  await login(page, 'admin');
  await page.goto('/admin/auditoria');
  await expect(page.locator('body')).toContainText(/auditor|log/i);
});