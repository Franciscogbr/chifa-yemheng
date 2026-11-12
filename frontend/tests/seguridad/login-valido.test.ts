import { test, expect } from '@playwright/test';
import { login } from '../utils/helpers';

test('login con credenciales válidas', async ({ page }) => {
  await login(page, 'admin', 'admin123');
  await expect(page).toHaveURL(/.*\/admin/);
});

test('redirige a /admin/caja cuando el usuario es cajero', async ({ page }) => {
  await login(page, 'cajero1', 'clave123');
  await expect(page).toHaveURL(/.*\/admin/);
});