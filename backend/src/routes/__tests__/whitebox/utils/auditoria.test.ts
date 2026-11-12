import type { Request } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { getPc } from '../../../../utils/auditoria.js';

function requestFixture(options: {
  equipo?: string;
  ip?: string;
  remoteAddress?: string;
}): Request {
  return {
    header: vi.fn().mockReturnValue(options.equipo),
    ip: options.ip,
    socket: { remoteAddress: options.remoteAddress },
  } as unknown as Request;
}

describe('Caja blanca - auditoria', () => {
  describe('getPc', () => {
    it('usa la IP del cliente y ignora cabeceras de dispositivo', () => {
      expect(getPc(requestFixture({ equipo: 'Laptop admin', ip: '192.168.1.25' }))).toBe('192.168.1.25');
      expect(getPc(requestFixture({ ip: '::ffff:192.168.1.25' }))).toBe('192.168.1.25');
    });

    it('usa el socket IP como fallback y preserva IPv6', () => {
      expect(getPc(requestFixture({ remoteAddress: '2001:db8::1' }))).toBe('2001:db8::1');
    });

    it('devuelve UNKNOWN cuando no hay IP válida', () => {
      expect(getPc(requestFixture({ ip: 'not-an-ip', remoteAddress: undefined }))).toBe('UNKNOWN');
    });

    it('prefiere req.ip sobre remoteAddress', () => {
      const result = getPc(requestFixture({ ip: '10.0.0.5', remoteAddress: '2001:db8::1' }));
      expect(result).toBe('10.0.0.5');
    });
  });
});
