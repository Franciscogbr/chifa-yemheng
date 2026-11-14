import { expect, test, type Page, type Request } from '@playwright/test';

interface CajaFlowState {
  cierreSolicitado: boolean;
  cierreConfirmado: boolean;
  confirmaciones: number;
  solicitanteId: number | null;
  aprobadorId: number | null;
}

interface TestUser {
  id: number;
  logeo: string;
  tipo: 'CAJERO' | 'ADMINISTRADOR';
  empleado: string;
  permisos: string[];
}

function crearToken(user: TestUser): string {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const payload = Buffer.from(
    JSON.stringify({ exp, tipo: user.tipo, sub: user.id }),
  ).toString('base64');
  return `e2e.${payload}.firma`;
}

async function guardarSesion(page: Page, user: TestUser) {
  const usuario = {
    id: user.id,
    logeo: user.logeo,
    tipo: user.tipo,
    empleado: user.empleado,
    cargo: user.tipo,
  };
  await page.evaluate(
    ({ token, usuarioInicial, permisos }) => {
      localStorage.setItem('chifa.token', token);
      localStorage.setItem('chifa.user', JSON.stringify(usuarioInicial));
      localStorage.setItem('chifa.permisos', JSON.stringify(permisos));
    },
    {
      token: crearToken(user),
      usuarioInicial: usuario,
      permisos: user.permisos,
    },
  );
}

function usuarioDeLaSolicitud(request: Request): number | null {
  const token = request.headers()['authorization']?.replace(/^Bearer\s+/i, '');
  const encodedPayload = token?.split('.')[1];
  if (!encodedPayload) return null;

  const payload = JSON.parse(Buffer.from(encodedPayload, 'base64').toString()) as {
    sub?: number;
  };
  return typeof payload.sub === 'number' ? payload.sub : null;
}

async function mockCajaApi(page: Page, state: CajaFlowState) {
  await page.route('**/caja/**', async (route) => {
    const request = route.request();
    const headers = request.headers();
    const corsHeaders = {
      'access-control-allow-origin': headers['origin'] ?? 'http://localhost:5174',
      'access-control-allow-methods':
        headers['access-control-request-method'] ?? 'GET, POST, OPTIONS',
      'access-control-allow-headers':
        headers['access-control-request-headers'] ?? 'authorization, content-type',
    };

    if (request.method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: corsHeaders });
      return;
    }

    const path = new URL(request.url()).pathname;
    let response: unknown;

    if (path.endsWith('/caja/maestros')) {
      response = {
        cajas: [{
          id: 1,
          nombre: 'Caja E2E',
          aperturada: state.cierreConfirmado ? 'N' : 'S',
          montoBase: 0,
          turnoId: state.cierreConfirmado ? null : 1001,
          montoSistema: state.cierreConfirmado ? null : 100,
          cierrePendiente: state.cierreSolicitado && !state.cierreConfirmado,
          netoPorMedio: [],
        }],
        metodosPago: [],
        conceptos: [],
      };
    } else if (path.endsWith('/caja/cierres/pendientes')) {
      response = state.cierreSolicitado && !state.cierreConfirmado
        ? [{
            id: 1001,
            cajaId: 1,
            cajaNombre: 'Caja E2E',
            cajero: 'fran.caja',
            fechaSolicitud: '2026-11-13T10:00:00.000Z',
            montoSistema: 100,
            montoDeclarado: 90,
            diferencia: -10,
            observacion: null,
          }]
        : [];
    } else if (path.endsWith('/caja/pendientes')) {
      response = [];
    } else if (path.endsWith('/caja/cierres/cerrados')) {
      response = [];
    } else if (path.endsWith('/caja/incidencias')) {
      response = { data: [] };
    } else if (path.endsWith('/movimientos-resumen')) {
      response = {
        movimientos: [{ medio: 'Efectivo', cantidad: 1, monto: 90, afectaEfectivo: true }],
        total: 90,
      };
    } else if (path.endsWith('/caja/cierre/arqueo') && request.method() === 'POST') {
      state.cierreSolicitado = true;
      state.solicitanteId = usuarioDeLaSolicitud(request);
      response = {
        aperturaId: 1001,
        sistema: 100,
        declarado: 90,
        diferencia: -10,
        resultado: 'FALTANTE',
        idIncidencia: 1,
        requiereSupervisor: true,
      };
    } else if (
      path.endsWith('/caja/turno/cierre/confirmar')
      && request.method() === 'POST'
    ) {
      state.aprobadorId = usuarioDeLaSolicitud(request);
      if (state.aprobadorId === state.solicitanteId) {
        await route.fulfill({
          status: 409,
          headers: corsHeaders,
          json: { error: 'VALIDADOR_DEBE_SER_DISTINTO' },
        });
        return;
      }
      state.cierreConfirmado = true;
      state.confirmaciones += 1;
      response = { sistema: 100, declarado: 90, diferencia: -10, resultado: 'FALTANTE' };
    } else {
      await route.continue();
      return;
    }

    await route.fulfill({ status: 200, headers: corsHeaders, json: response });
  });
}

test('el cajero solicita un arqueo con diferencia y administración lo aprueba', async ({
  page,
}) => {
  test.setTimeout(60_000);
  const state: CajaFlowState = {
    cierreSolicitado: false,
    cierreConfirmado: false,
    confirmaciones: 0,
    solicitanteId: null,
    aprobadorId: null,
  };
  const cajero: TestUser = {
    id: 101,
    logeo: 'fran.caja',
    tipo: 'CAJERO',
    empleado: 'Fran Caja',
    permisos: ['CAJ_CERRAR', 'CAJ_APERTURAR', 'CAJA_APERTURA'],
  };
  const admin: TestUser = {
    id: 201,
    logeo: 'admin.e2e',
    tipo: 'ADMINISTRADOR',
    empleado: 'Administrador E2E',
    permisos: ['CAJ_CERRAR', 'CAJ_APERTURAR', 'CAJA_APERTURA', 'CAJ_VALIDAR_CIERRE'],
  };

  await mockCajaApi(page, state);
  await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });
  await guardarSesion(page, cajero);
  await page.goto('/admin/caja', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Abrir arqueo' }).first().click({ noWaitAfter: true });

  const arqueoDialog = page.getByRole('dialog');
  await expect(arqueoDialog).toBeVisible();
  await arqueoDialog
    .getByRole('button', { name: 'Registrar arqueo automático y solicitar cierre' })
    .click({ noWaitAfter: true });
  await expect.poll(() => state.cierreSolicitado).toBe(true);
  await expect(page.getByText('Esperando validación de un supervisor para cerrar')).toBeVisible();

  await guardarSesion(page, admin);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Arqueos por validar' })).toBeVisible();
  await expect(page.getByText(/Cajero: fran\.caja/)).toBeVisible();
  await page.getByRole('button', { name: 'Validar y cerrar' }).click({ noWaitAfter: true });
  await expect(page.getByText('Turno cerrado', { exact: true })).toBeVisible();
  expect(state.aprobadorId).not.toBe(state.solicitanteId);
  expect(state.confirmaciones).toBe(1);
});
