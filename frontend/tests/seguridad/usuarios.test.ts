import { test, expect } from '@playwright/test';
import { login } from '../utils/helpers';

test('página de usuarios/seguridad se carga', async ({ page }) => {
  await login(page, 'admin');
  await page.goto('/admin/usuarios');
  await expect(page.locator('body')).toContainText(/usuario|seguridad|admin/i);
});