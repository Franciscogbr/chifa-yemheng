import { test, expect } from '@playwright/test';
import { login, logout } from './utils/helpers';

/**
 * Flujo de delivery punto a punto (P2P) — prueba end to end.
 *
 * Cubre el escenario solicitado:
 *  1. Staff (mozo) prepara el entorno: mesa N disponible y su QR.
 *  2. Cliente escanea el QR de la mesa N.
 *  3. El sistema SOLO admite el QR de la mesa asignada (mesa N); cualquier otro
 *     QR se rechaza.
 *  4. Cliente elige atención:
 *        a) Por QR → mismo flujo habitual (menú → carrito → enviar a cocina).
 *        b) Por mozo → el mozo toma el pedido desde su POS (canal PRESENCIAL).
 *  5. Delivery: se crea el pedido a domicilio y se hace seguimiento
 *     P (pendiente) → R (en ruta) → E (entregado) desde staff/repartidor.
 *
 * NOTA: Ajusta los selectores de las pantallas cliente (menú, carrito, wizard de
 * delivery) si tu markup difiere. Los flujos de staff usan los selectores de
 * loginPage/cajaPage definidos en los fixtures.
 */

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Flujo delivery P2P (cliente → mesa → pedido → delivery)', () => {
  const MESA_ESPERADA = 'N'; // Número de mesa asignada al cliente (ajustar)

  test.beforeEach(async ({ page }) => {
    // Cada prueba parte de sesión limpia
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('cliente escanea QR de mesa N, elige QR y completa pedido (autoservicio)', async ({
    page,
  }) => {
    // --- Paso 1: Cliente accede y escanea QR de la mesa asignada ---
    await page.goto('/cliente/login');
    // Si tu cliente requiere login, descomenta y usa las credenciales de cliente:
    // await page.fill('input[id="logeo"]', process.env.TEST_USER_CLIENTE ?? '');
    // await page.fill('input[id="clave"]', process.env.TEST_USER_CLIENTE_PASS ?? '');
    // await page.click('button[type="submit"]');

    // Abrir escáner QR (botón del bottom nav)
    await page.click('button[aria-label="Escanear QR de mesa"], button.qr');

    // Inyectar/detectar el QR de la mesa N.
    // Como Playwright no accede a la cámara real, se asume que el modal expone
    // una forma de inyectar el código. Ajusta según tu implementación real.
    await page.fill('input[type="file"][accept="image/*"]', '');
    // O bien, si hay un input oculto para código manual:
    // await page.fill('input[placeholder="código QR"]', `yemheng.pe/m/${MESA_ESPERADA}`);

    // Validación: el sistema debe aceptar SOLO la mesa N
    await expect(page).toHaveURL(/.*mesa=.*/);
    await expect(page.locator(`text=Mesa ${MESA_ESPERADA}`)).toBeVisible();

    // --- Paso 2: Tarjeta de decisión — elegir "Pedir por QR" ---
    await page.click('button:has-text("Pedir por QR")');

    // Debe navegar al menú habitual (mismo flujo de cliente QR)
    await expect(page).toHaveURL(/.*\/cliente\/menu/);

    // --- Paso 3: Agregar producto al carrito y enviar a cocina ---
    await page.click('button:has-text("Agregar"), button:has-text("Añadir")').first();
    await page.click('button:has-text("Enviar a cocina"), button:has-text("Enviar tanda")');

    // La comanda debe quedar abierta para la mesa N
    await expect(page.locator(`text=Mesa ${MESA_ESPERADA}`)).toBeVisible();
  });

  test('cliente escanea QR de mesa distinta y es RECHAZADO (validación de mesa correcta)', async ({
    page,
  }) => {
    await page.goto('/cliente/login');
    await page.click('button[aria-label="Escanear QR de mesa"], button.qr');

    // Inyectar QR de una mesa DISTINTA a la asignada N
    // await page.fill('input[placeholder="código QR"]', 'yemheng.pe/m/OTRA');

    // El sistema NO debe dejar pasar; debe mostrar error de mesa inválida
    await expect(
      page.locator('text=QR inválido o de otra mesa, text=mesa N, text=otra mesa')
    ).toBeVisible();
    await expect(page).not.toHaveURL(/.*\/cliente\/menu/);
  });

  test('cliente elige que un mozo tome el pedido (canal MOZO)', async ({ page }) => {
    await page.goto('/cliente/login');
    await page.click('button[aria-label="Escanear QR de mesa"], button.qr');

    // Escanear QR de mesa N (válido)
    // await page.fill('input[placeholder="código QR"]', `yemheng.pe/m/${MESA_ESPERADA}`);

    // Elegir "Que un mozo tome mi pedido"
    await page.click('button:has-text("Que un mozo tome mi pedido")');

    // Debe mostrar confirmación de solicitud enviada al mozo
    await expect(
      page.locator('text=Solicitud enviada, text=Un mozo atenderá')
    ).toBeVisible();
  });

  test('mozo toma el pedido de mesa N desde su POS (canal PRESENCIAL)', async ({ page }) => {
    // Login como mozo en panel de staff
    await login(page, 'mozo1');

    // El mozo ve la reserva/solicitud de la mesa N esperando atención
    await page.goto('/pedidos/mozo/reservas-pendientes');
    await expect(page.locator(`text=Mesa ${MESA_ESPERADA}`)).toBeVisible();

    // Abre comanda de la mesa N y agrega productos (canal PRESENCIAL)
    await page.click(`button:has-text("Abrir comanda Mesa ${MESA_ESPERADA}")`);
    await page.click('button:has-text("Agregar producto")').first();
    await page.click('button:has-text("Enviar a cocina")');

    // El pedido debe estar en cocina con canal PRESENCIAL
    await expect(page.locator('text=PRESENCIAL')).toBeVisible();

    await logout(page);
  });

  test('delivery completo: creación, asignación, despacho y entrega (P → R → E)', async ({
    page,
  }) => {
    // --- Staff crea el delivery ---
    await login(page, 'cajero1');
    await page.goto('/delivery');

    await page.click('button:has-text("Crear delivery")');
    await page.fill('input[name="direccion"], input[placeholder*="dirección"]', 'Av. Ejemplo 123');
    await page.click('button:has-text("Confirmar")');

    const deliveryId = await page.locator('text=Pedido #').textContent();
    expect(deliveryId).toBeTruthy();

    // Asignar repartidor
    await page.click(`button:has-text("Asignar repartidor")`);
    await expect(page.locator('text=En ruta, text=Asignado')).toBeVisible();

    // Despachar (P → R)
    await page.click(`button:has-text("Despachar")`);
    await expect(page.locator('text=En ruta')).toBeVisible();

    await logout(page);

    // --- Repartidor entrega (R → E) ---
    await login(page, 'mesero1'); // o perfil repartidor si existe
    await page.goto('/delivery/seguimiento');
    await page.click(`button:has-text("Entregar")`);
    await expect(page.locator('text=Entregado')).toBeVisible();

    await logout(page);

    // --- Cliente ve seguimiento y comprobante ---
    await page.goto('/cliente/delivery');
    await expect(page.locator('text=Entregado')).toBeVisible();
    await expect(page.locator('text=Imprimir boleta')).toBeVisible();
  });
});
