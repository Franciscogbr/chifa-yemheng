import { Page, Locator } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  async click(selector: string | Locator) {
    if (typeof selector === 'string') await this.page.click(selector);
    else await selector.click();
  }

  async fill(selector: string | Locator, value: string) {
    if (typeof selector === 'string') await this.page.fill(selector, value);
    else await selector.fill(value);
  }

  async waitForVisible(selector: string, timeout = 10000) {
    await this.page.waitForSelector(selector, { state: 'visible', timeout });
  }

  async getText(selector: string) {
    return await this.page.textContent(selector);
  }

  async hasText(selector: string, texto: string) {
    const textoElemento = await this.page.textContent(selector);
    return textoElemento?.includes(texto) ?? false;
  }

  async verificarMensajeExito(mensajeEsperado: string) {
    const mensaje = await this.page.textContent('.mensaje-exito');
    return mensaje?.includes(mensajeEsperado);
  }

  async esperarCargaPagina() {
    await this.page.waitForLoadState('networkidle');
  }
}
