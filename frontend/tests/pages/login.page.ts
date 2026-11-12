import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  readonly inputUsuario = this.page.locator('input[id="logeo"]');
  readonly inputClave = this.page.locator('input[id="clave"]');
  readonly btnLogin = this.page.locator('button[type="submit"]');
  readonly mensajeError = this.page.locator('div[role="alert"]');

  async login(usuario: string, clave: string) {
    await this.page.goto('/auth/login');
    await this.fill(this.inputUsuario, usuario);
    await this.fill(this.inputClave, clave);
    await this.click(this.btnLogin);
    await this.page.waitForURL('**/admin');
  }

  async obtenerMensajeError() {
    return await this.page.textContent('div[role="alert"]');
  }

  async verificarMensajeError(textoEsperado: string) {
    const texto = await this.obtenerMensajeError();
    return texto?.includes(textoEsperado) ?? false;
  }
}
