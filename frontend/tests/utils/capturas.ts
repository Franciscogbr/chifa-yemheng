import { Page } from '@playwright/test';

export async function tomarCapturaError(page: Page, nombre: string) {
  const nombreArchivo = `error-${nombre}-${Date.now()}.png`;
  await page.screenshot({ path: `reports/screenshots/${nombreArchivo}`, fullPage: true });
  return nombreArchivo;
}

export async function tomarCapturaDespuesDeAccion(page: Page, nombre: string) {
  const nombreArchivo = `paso-${nombre}-${Date.now()}.png`;
  await page.screenshot({ path: `reports/screenshots/${nombreArchivo}`, fullPage: true });
  return nombreArchivo;
}
