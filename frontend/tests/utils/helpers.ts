import { Page } from '@playwright/test';

export async function login(page: Page, usuario: string, clave: string) {
  await page.goto('/auth/login');
  await page.fill('input[id="logeo"]', usuario);
  await page.fill('input[id="clave"]', clave);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin');
}

export async function logout(page: Page) {
  await page.click('button[id="logout"]');
  await page.waitForURL('**/auth/login');
}

export async function esperarMensajeExito(page: Page, mensaje: string) {
  await page.waitForSelector('.mensaje-exito');
  const texto = await page.textContent('.mensaje-exito');
  if (!texto?.includes(mensaje)) {
    throw new Error(`Se esperaba "${mensaje}" pero se obtuvo "${texto}"`);
  }
}

export async function tomarCapturaError(page: Page, nombre: string) {
  const nombreArchivo = `error-${nombre}-${Date.now()}.png`;
  await page.screenshot({ path: `reports/screenshots/${nombreArchivo}`, fullPage: true });
  return nombreArchivo;
}
