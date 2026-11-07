import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ rpc: vi.fn() }));

vi.mock('../config/supabase.js', () => ({ supabase: { rpc: mocks.rpc } }));

import { abrirCaja } from './caja-repository.js';

describe('abrirCaja: observación opcional (T15b)', () => {
  beforeEach(() => mocks.rpc.mockReset());

  it('pasa monto, turno y observación al RPC atómico nuevo', async () => {
    mocks.rpc.mockResolvedValue({
      data: [{ id_apertura: 31, mensaje: 'Caja aperturada correctamente' }],
      error: null,
    });

    const result = await abrirCaja({
      cajaId: 2,
      usuarioId: 7,
      montoInicial: 300,
      numeroTurno: '06/11/26, 08:00',
      observacion: 'Fondo contado por dos personas',
    });

    expect(mocks.rpc).toHaveBeenCalledWith('fn_aperturar_caja_atomic_observada', {
      p_caja: 2,
      p_usuario: 7,
      p_monto: 300,
      p_numero: '06/11/26, 08:00',
      p_observacion: 'Fondo contado por dos personas',
    });
    expect(result).toEqual({ id: 31, mensaje: 'Caja aperturada correctamente' });
  });

  it('manda cadena vacía si no se indicó observación', async () => {
    mocks.rpc.mockResolvedValue({ data: [{ id_apertura: 32, mensaje: 'OK' }], error: null });
    await abrirCaja({ cajaId: 2, usuarioId: 7, montoInicial: 0, numeroTurno: 'T2' });
    expect(mocks.rpc).toHaveBeenCalledWith('fn_aperturar_caja_atomic_observada', expect.objectContaining({
      p_observacion: '',
    }));
  });

  it('explica cuándo falta aplicar la migración', async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { code: 'PGRST202', message: 'function not found' } });
    await expect(abrirCaja({ cajaId: 2, usuarioId: 7, montoInicial: 10, numeroTurno: 'T3' }))
      .rejects.toThrow('MIGRACION_APERTURA_OBSERVACION_PENDIENTE');
  });
});
