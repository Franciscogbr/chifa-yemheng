import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  solicitarCierreArqueo: vi.fn(),
  turnoAbiertoDeCaja: vi.fn(),
  listarIncidencias: vi.fn(),
  resolverIncidencia: vi.fn(),
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
}));

import {
  arqueoCierreService,
  incidenciasService,
  resolverIncidenciaService,
} from '../caja-service.js';

const CONTABILIZACION = [
  { valor: 10, cantidad: 15, tipo: 'BILLETE' as const },
  { valor: 20, cantidad: 5, tipo: 'BILLETE' as const },
];

describe('arqueoCierreService (S5)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rechaza si no hay turno abierto', async () => {
    mocks.turnoAbiertoDeCaja.mockResolvedValue(null);

    await expect(
      arqueoCierreService({ cajaId: 1, usuarioId: 3, denominaciones: CONTABILIZACION, observacion: '' }),
    ).rejects.toThrow('TURNO_NO_ABIERTO');
    expect(mocks.solicitarCierreArqueo).not.toHaveBeenCalled();
  });

  it('usa la apertura del turno y devuelve niveles y apertura', async () => {
    mocks.turnoAbiertoDeCaja.mockResolvedValue({ id: 55 });
    mocks.solicitarCierreArqueo.mockResolvedValue({
      sistema: 300, declarado: 250, diferencia: -50,
      resultado: 'FALTANTE', idIncidencia: 9, requiereSupervisor: false,
    });

    const result = await arqueoCierreService({
      cajaId: 1, usuarioId: 3, denominaciones: CONTABILIZACION, observacion: 'Falta un 50',
    });

    expect(mocks.solicitarCierreArqueo).toHaveBeenCalledWith({
      aperturaId: 55, usuarioId: 3, denominaciones: CONTABILIZACION, observacion: 'Falta un 50',
    });
    expect(result).toEqual({
      aperturaId: 55, sistema: 300, declarado: 250, diferencia: -50,
      resultado: 'FALTANTE', idIncidencia: 9, requiereSupervisor: false,
    });
  });
});

describe('incidenciasService + resolverIncidenciaService (S5)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lista incidencias pendientes', async () => {
    mocks.listarIncidencias.mockResolvedValue([]);
    await incidenciasService(true);
    expect(mocks.listarIncidencias).toHaveBeenCalledWith(true);
  });

  it('exige comentario para resoluciones finales (JUSTIFICADA/CERRADA)', async () => {
    await expect(
      resolverIncidenciaService({
        incidenciaId: 1, estado: 'JUSTIFICADA', supervisorId: 7, comentario: ' ',
      }),
    ).rejects.toThrow('COMENTARIO_REQUERIDO');

    await resolverIncidenciaService({
      incidenciaId: 1, estado: 'EN_REVISION', supervisorId: 7, comentario: '',
    });
    expect(mocks.resolverIncidencia).toHaveBeenCalledWith({
      id: 1, estado: 'EN_REVISION', resueltaPor: 7, comentario: '',
    });
  });
});
