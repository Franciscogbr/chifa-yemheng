import { describe, expect, it } from 'vitest';
import { deliveryCreateSchema } from './delivery.js';

describe('deliveryCreateSchema', () => {
  it('accepts a customer, products, address, and normalized phone', () => {
    const result = deliveryCreateSchema.safeParse({
      clienteId: 7,
      items: [{ productoId: 2, cantidad: 1 }],
      distritoId: 3,
      direccion: 'Calle 1',
      telefono: ' 987654321 ',
      costoEnvio: 5,
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.telefono).toBe('987654321');
  });

  it('rejects the obsolete placeholder order ID and an empty product list', () => {
    const result = deliveryCreateSchema.safeParse({
      pedidoId: 0,
      clienteId: 7,
      items: [],
      distritoId: 3,
      direccion: 'Calle 1',
      telefono: '987654321',
    });

    expect(result.success).toBe(false);
  });

  it('requires latitude and longitude together', () => {
    const result = deliveryCreateSchema.safeParse({
      clienteId: 7,
      items: [{ productoId: 2, cantidad: 1 }],
      distritoId: 3,
      direccion: 'Calle 1',
      telefono: '987654321',
      latCliente: -12,
    });

    expect(result.success).toBe(false);
  });
});
