import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class InventarioPage extends BasePage {
  readonly btnEntrada = this.page.locator('button[id="entrada-stock"]');
  readonly btnSalida = this.page.locator('button[id="salida-stock"]');
  readonly inputProducto = this.page.locator('input[name="producto"]');
  readonly inputCantidad = this.page.locator('input[name="cantidad"]');
  readonly btnConfirmar = this.page.locator('button[id="confirmar"]');
  readonly mensajeExito = this.page.locator('.mensaje-exito');

  async registrarEntrada(producto: string, cantidad: string) {
    await this.click(this.btnEntrada);
    await this.fill(this.inputProducto, producto);
    await this.fill(this.inputCantidad, cantidad);
    await this.click(this.btnConfirmar);
    await this.page.waitForURL('**/inventario/entrada');
  }

  async registrarSalida(producto: string, cantidad: string) {
    await this.click(this.btnSalida);
    await this.fill(this.inputProducto, producto);
    await this.fill(this.inputCantidad, cantidad);
    await this.click(this.btnConfirmar);
    await this.page.waitForURL('**/inventario/salida');
  }

  async obtenerMensaje() {
    return await this.page.textContent('.mensaje-exito');
  }
}
