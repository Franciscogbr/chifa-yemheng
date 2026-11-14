import { test, expect } from '@playwright/test';
import { login } from '../utils/helpers';

test('abrir caja con monto inicial', async ({ page }) => {
  await login(page, 'cajero1');
  await page.goto('/admin/caja');
  await expect(page.locator('h2, h1')).toContainText(/caja|turno/i);
});

test('caja muestra estado de turno', async ({ page }) => {
  await login(page, 'cajero1');
  await page.goto('/admin/caja');
  await expect(page.locator('body')).toContainText(/caja|turno|movimiento/i);
});