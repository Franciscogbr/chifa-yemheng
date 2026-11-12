import { Page } from '@playwright/test';

export async function esperarCargaPagina(page: Page) {
  await page.waitForLoadState('networkidle');
}

export async function esperarMensajeExito(page: Page, mensaje: string) {
  await page.waitForSelector('.mensaje-exito');
  const texto = await page.textContent('.mensaje-exito');
  if (!texto.includes(mensaje)) {
    throw new Error(`Se esperaba "${mensaje}" pero se obtuvo "${texto}"`);
  }
}

export async function esperarError(page: Page, mensaje: string) {
  await page.waitForSelector('.error, .error-message, .alert-danger');
  const texto = await page.textContent('.error, .error-message, .alert-danger');
  if (!texto.includes(mensaje)) {
    throw new Error(`Se esperaba "${mensaje}" pero se obtuvo "${texto}"`);
  }
}

export async function esperarRedireccion(page: Page, url: string) {
  await page.waitForURL(`**/${url}`);
}
