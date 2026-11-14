import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ rpc: vi.fn() }));

vi.mock('../config/supabase.js', () => ({
  supabase: { rpc: mocks.rpc },
}));

import { atenderReserva } from './reservas-repository.js';

beforeEach(() => {
  mocks.rpc.mockReset();
});

describe('atenderReserva', () => {
  it('registra la llegada sin asignar un canal de atención', async () => {
    mocks.rpc.mockResolvedValueOnce({
      data: [{
        id_reserva: 17,
        id_cliente: 42,
        id_mesa: 9,
        f_reserva: '2026-11-13T18:00:00',
        n_personas: 2,
        situacion: 'A',
        adelanto: 0,
        feccre: '2026-11-13T17:00:00',
        f_llegada: '2026-11-13T18:00:00',
        canal_atencion: null,
        cliente: null,
        mesa: { numero: '9' },
      }],
      error: null,
    });

    await expect(atenderReserva(17, 'empleado', 'terminal'))
      .resolves.toMatchObject({ id: 17, estado: 'A', canalAtencion: null });
    expect(mocks.rpc).toHaveBeenCalledWith('fn_registrar_llegada_reserva', {
      p_reserva: 17,
      p_canal: null,
      p_usuario: 'empleado',
      p_pc: 'terminal',
    });
  });
});
