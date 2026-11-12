import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class DashboardPage extends BasePage {
  readonly btnCaja = this.page.locator('a[href="/admin/caja"], button[id="btn-caja"]');
  readonly btnPedidos = this.page.locator('a[href="/admin/pedidos"]');
  readonly btnInventario = this.page.locator('a[href="/admin/inventario"]');
  readonly btnReportes = this.page.locator('a[href="/admin/reportes"]');
  readonly btnReservas = this.page.locator('a[href="/admin/reservas"]');
  readonly btnLogout = this.page.locator('button[id="logout"], button[id="btn-logout"]');
  readonly bienvenida = this.page.locator('h1, h2');

  async irACaja() {
    await this.click(this.btnCaja);
  }

  async irAPedidos() {
    await this.click(this.btnPedidos);
  }

  async irAInventario() {
    await this.click(this.btnInventario);
  }

  async irAReservas() {
    await this.click(this.page.locator('a[href="/admin/reservas"]'));
  }

  async irARendiciones() {
    await this.click(this.page.locator('a[href="/admin/rendiciones"]'));
  }

  async irAFactiliza() {
    await this.click(this.page.locator('a[href="/admin/factiliza"]'));
  }

  async clickLogout() {
    await this.click(this.btnLogout);
    await this.page.waitForURL('**/auth/login');
  }

  async obtenerMensajeBienvenida() {
    return await this.page.textContent('h1, h2');
  }
}