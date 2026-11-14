import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../config/env.js', () => ({ env: { FACTILIZA_TOKEN: 'test-token' } }));

import { consultarDni, consultarRuc } from '../factiliza-service.js';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Factiliza lookups', () => {
  it('maps DNI details and sends the bearer token from the backend', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            nombres: 'ANA MARIA',
            apellido_paterno: 'PEREZ',
            apellido_materno: 'LOPEZ',
            fecha_nacimiento: '1990-04-12',
            sexo: 'FEMENINO',
            direccion: 'JR. EJEMPLO 123',
            departamento: 'ICA',
            provincia: 'ICA',
            distrito: 'ICA',
          },
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(consultarDni('12345678')).resolves.toEqual({
      nombres: 'ANA MARIA',
      apPaterno: 'PEREZ',
      apMaterno: 'LOPEZ',
      fNacimiento: '1990-04-12',
      genero: 'F',
      direccion: 'JR. EJEMPLO 123',
      ubicacion: { departamento: 'ICA', provincia: 'ICA', distrito: 'ICA' },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.factiliza.com/v1/dni/info/12345678',
      expect.objectContaining({
        headers: { Authorization: 'Bearer test-token', Accept: 'application/json' },
      }),
    );
  });

  it('maps RUC company name and address', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            success: true,
            data: {
              nombre_o_razon_social: 'EMPRESA EJEMPLO S.A.C.',
              direccion: 'AV. CENTRAL 100',
              departamento: 'ICA',
              provincia: 'ICA',
              distrito: 'ICA',
            },
          }),
          { status: 200 },
        ),
      ),
    );

    await expect(consultarRuc('20123456789')).resolves.toEqual({
      razonSocial: 'EMPRESA EJEMPLO S.A.C.',
      direccion: 'AV. CENTRAL 100',
      ubicacion: { departamento: 'ICA', provincia: 'ICA', distrito: 'ICA' },
    });
  });

  it('does not return malformed DNI data as a successful lookup', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ success: true, data: { nombres: 'ANA' } }), { status: 200 }),
      ),
    );

    await expect(consultarDni('12345678')).rejects.toMatchObject({
      status: 502,
      code: 'FACTILIZA_INVALID_RESPONSE',
    });
  });
});
