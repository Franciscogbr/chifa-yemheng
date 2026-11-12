import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class ReservasPage extends BasePage {
  readonly btnCrearReserva = this.page.locator('button[id="crear-reserva"]');
  readonly inputFecha = this.page.locator('input[name="fecha"]');
  readonly inputHora = this.page.locator('input[name="hora"]');
  readonly inputComensales = this.page.locator('input[name="comensales"]');
  readonly btnConfirmar = this.page.locator('button[id="confirmar"]');
  readonly mensajeExito = this.page.locator('.mensaje-exito');

  async crearReserva(fecha: string, hora: string, comensales: string) {
    await this.click(this.btnCrearReserva);
    await this.fill(this.inputFecha, fecha);
    await this.fill(this.inputHora, hora);
    await this.fill(this.inputComensales, comensales);
    await this.click(this.btnConfirmar);
    await this.page.waitForURL('**/reservas/creada');
  }

  async obtenerMensaje() {
    return await this.page.textContent('.mensaje-exito');
  }
}
