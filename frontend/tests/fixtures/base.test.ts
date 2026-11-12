import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { CajaPage } from '../pages/caja.page';
import { PedidosPage } from '../pages/pedidos.page';
import { InventarioPage } from '../pages/inventario.page';
import { ReservasPage } from '../pages/reservas.page';
import { SeguridadPage } from '../pages/seguridad.page';

export const test = base.extend<{
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  cajaPage: CajaPage;
  pedidosPage: PedidosPage;
  inventarioPage: InventarioPage;
  reservasPage: ReservasPage;
  seguridadPage: SeguridadPage;
  login: (usuario: string, clave: string) => Promise<void>;
  logout: () => Promise<void>;
}>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  cajaPage: async ({ page }, use) => {
    await use(new CajaPage(page));
  },
  pedidosPage: async ({ page }, use) => {
    await use(new PedidosPage(page));
  },
  inventarioPage: async ({ page }, use) => {
    await use(new InventarioPage(page));
  },
  reservasPage: async ({ page }, use) => {
    await use(new ReservasPage(page));
  },
  seguridadPage: async ({ page }, use) => {
    await use(new SeguridadPage(page));
  },
  login: async ({ page }, use) => {
    await use(async (usuario: string, clave: string) => {
      await page.goto('/auth/login');
      await page.fill('input[id="logeo"]', usuario);
      await page.fill('input[id="clave"]', clave);
      await page.click('button[type="submit"]');
      await page.waitForURL('**/admin');
    });
  },
  logout: async ({ page }, use) => {
    await use(async () => {
      await page.click('button[id="logout"]');
      await page.waitForURL('**/auth/login');
    });
  },
});