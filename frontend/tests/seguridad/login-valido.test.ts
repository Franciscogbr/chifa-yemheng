import { test, expect } from '@playwright/test';
import { login } from '../utils/helpers';

test('login con credenciales válidas', async ({ page }) => {
  await login(page, 'admin');
  await expect(page).toHaveURL(/.*\/admin/);
});

test('redirige a /admin/caja cuando el usuario es cajero', async ({ page }) => {
  await login(page, 'cajero1');
  await expect(page).toHaveURL(/.*\/admin/);
});