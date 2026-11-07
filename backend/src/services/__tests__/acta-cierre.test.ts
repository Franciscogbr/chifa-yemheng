import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  actaCierre: vi.fn(),
  reporteDiferencias: vi.fn(),
  historialCajero: vi.fn(),
}));

vi.mock('../../repositories/caja-repository.js', () => ({
  ...mocks,
  abrirCaja: vi.fn(),
  cobrarAtomicMixto: vi.fn(),
  cobrarParticipanteAtomic: vi.fn(),
  confirmarCierreCaja: vi.fn(),
  listarCierresPendientes: vi.fn(),
  listarCajas: vi.fn(),
  listarMetodosPago: vi.fn(),
  listarConceptosCaja: vi.fn(),
  registrarMovimientoCaja: vi.fn(),
  solicitarCierreCaja: vi.fn(),
  solicitarCierreArqueo: vi.fn(),
  turnoAbiertoDeCaja: vi.fn(),
  rechazarCierreCaja: vi.fn(),
  listarIncidencias: vi.fn(),
  resolverIncidencia: vi.fn(),
  listarPedidosPorCobrar: vi.fn(),
  obtenerPedido: vi.fn(),
}));

import {
  actaCierreService,
  historialCajeroService,
  reporteDiferenciasService,
} from '../caja-service.js';

describe('acta Z + reportes de caja (T15a5)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('acta Cierre devuelve los datos del turno cuando existe', async () => {
    mocks.actaCierre.mockResolvedValue({
      aperturaId: 55,
      caja: 'CAJA-01',
      saldoTeorico: 300,
      dineroContado: 250,
      diferencia: -50,
      resultado: 'FALTANTE',
      situacion: 'C',
      conteo: [{ valor: 50, tipo: 'BILLETE', cantidad: 5 }],
      incidencia: { id: 9, nivel: 'MEDIA', estado: 'PENDIENTE', motivo: 'x', comentarioResolucion: null },
    });

    const r = await actaCierreService(55);
    expect(r?.resultado).toBe('FALTANTE');
    expect(r?.conteo).toHaveLength(1);
    expect(r?.incidencia?.id).toBe(9);
  });

  it('acta null cuando el turno no existe', async () => {
    mocks.actaCierre.mockResolvedValue(null);
    expect(await actaCierreService(999)).toBeNull();
  });

  it('reporte de diferencias e historial por cajero pasan directo', async () => {
    mocks.reporteDiferencias.mockResolvedValue([
      { aperturaId: 1, caja: 'CAJA-01', cajero: 'Juan', diferencia: -50, resultado: 'FALTANTE' },
    ]);
    mocks.historialCajero.mockResolvedValue([
      { cajeroId: 1, cajero: 'Juan', arqueos: 5, totalSobrantes: 0, totalFaltantes: 80, diferenciaAcumulada: -80, incidencias: 2 },
    ]);

    expect((await reporteDiferenciasService())[0].diferencia).toBe(-50);
    const h = (await historialCajeroService())[0];
    expect(h.arqueos).toBe(5);
    expect(h.diferenciaAcumulada).toBe(-80);
  });
});
