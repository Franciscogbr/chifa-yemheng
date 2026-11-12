import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class PedidosPage extends BasePage {
  readonly btnCrearPedido = this.page.locator('button[id="crear-pedido"]');
  readonly inputMesa = this.page.locator('input[name="mesa"]');
  readonly inputComensales = this.page.locator('input[name="comensales"]');
  readonly btnAgregarProducto = this.page.locator('button[id="agregar-producto"]');
  readonly btnEnviarCocina = this.page.locator('button[id="enviar-cocina"]');
  readonly btnAnular = this.page.locator('button[id="anular-pedido"]');
  readonly btnDetalle = this.page.locator('button[id="ver-detalle"]');
  readonly btnEditar = this.page.locator('button[id="editar-pedido"]');
  readonly mensajeExito = this.page.locator('.mensaje-exito');
  readonly btnConfirmar = this.page.locator('button[id="confirmar"]');
  readonly selectTipoPago = this.page.locator('select[name="tipoPago"]');

  async crearPedido(mesa: string, comensales: string) {
    await this.click(this.btnCrearPedido);
    await this.fill(this.inputMesa, mesa);
    await this.fill(this.inputComensales, comensales);
    await this.click(this.btnCrearPedido);
    await this.page.waitForURL('**/pedidos/creado');
  }

  async agregarProducto() {
    await this.click(this.btnAgregarProducto);
    await this.click(this.btnEnviarCocina);
  }

  async anularPedido(motivo: string) {
    await this.click(this.btnAnular);
    await this.fill(this.page.locator('input[name="motivo"]'), motivo);
    await this.click(this.btnConfirmar);
    await this.page.waitForURL('**/pedidos/anulado');
  }

  async obtenerMensaje() {
    return await this.page.textContent('.mensaje-exito');
  }
}
