import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class CajaPage extends BasePage {
  readonly btnAbrirCaja = this.page.locator('button[id="abrir-caja"]');
  readonly btnCerrarCaja = this.page.locator('button[id="cerrar-caja"]');
  readonly btnArqueo = this.page.locator('button[id="arqueo"]');
  readonly inputMontoInicial = this.page.locator('input[name="montoInicial"]');
  readonly btnRegistrarMovimiento = this.page.locator('button[id="registrar-movimiento"]');
  readonly inputMonto = this.page.locator('input[name="monto"]');
  readonly btnConfirmar = this.page.locator('button[id="confirmar"]');
  readonly btnConfirmarCierre = this.page.locator('button[id="confirmar-cierre"]');
  readonly mensajeExito = this.page.locator('.mensaje-exito');
  readonly inputDenominaciones = this.page.locator('input[name="denominaciones"]');

  async abrirCaja(monto: string) {
    await this.click(this.btnAbrirCaja);
    await this.fill(this.inputMontoInicial, monto);
    await this.click(this.btnConfirmar);
    await this.page.waitForURL('**/caja/abierta');
  }

  async cerrarCaja() {
    await this.click(this.btnCerrarCaja);
    await this.click(this.btnConfirmar);
    await this.page.waitForURL('**/caja/cerrada');
  }

  async hacerArqueo(denominaciones: Record<string, number>) {
    await this.click(this.btnArqueo);
    for (const [denominacion, cantidad] of Object.entries(denominaciones)) {
      await this.page.fill(`input[name="denominacion-${denominacion}"]`, cantidad.toString());
    }
    await this.click(this.btnConfirmar);
    await this.page.waitForURL('**/caja/arqueo');
  }

  async registrarMovimiento(tipo: 'ingreso' | 'egreso', monto: string, descripcion: string) {
    await this.click(this.btnRegistrarMovimiento);
    await this.page.selectOption('select[name="tipo"]', tipo);
    await this.fill(this.inputMonto, monto);
    await this.fill(this.page.locator('input[name="descripcion"]'), descripcion);
    await this.click(this.btnConfirmar);
    await this.page.waitForURL('**/caja/movimiento');
  }

  async obtenerMensaje() {
    return await this.page.textContent('.mensaje-exito');
  }
}
