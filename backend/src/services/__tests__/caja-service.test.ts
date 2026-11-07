import type { NextFunction, Request, Response } from 'express';
import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  turnoAbiertoDeCaja: vi.fn(),
  cobrarAtomicMixto: vi.fn(),
  listarMetodosPago: vi.fn(),
  obtenerPedido: vi.fn(),
  listarPedidosPorCobrar: vi.fn(),
}));

vi.mock('../../middlewares/auth-guard.js', () => ({
  authGuard: (req: Request, _res: Response, next: NextFunction) => {
    (req as Request & {
      user: {
        sub: number;
        logeo: string;
        tipo: string;
        roles: string[];
        permisos: string[];
        authVersion: number;
      };
    }).user = {
      sub: 7,
      logeo: 'cajero-prueba',
      tipo: 'CAJERO',
      roles: ['CAJERO'],
      permisos: ['VEN_COBRAR', 'VEN_EMITIR'],
      authVersion: 1,
    };
    next();
  },
}));

vi.mock('../../repositories/caja-repository.js', () => ({
  abrirCaja: vi.fn(),
  cobrarAtomicMixto: mocks.cobrarAtomicMixto,
  confirmarCierreCaja: vi.fn(),
  listarCierresPendientes: vi.fn(),
  listarCajas: vi.fn(),
  listarMetodosPago: mocks.listarMetodosPago,
  listarConceptosCaja: vi.fn(),
  registrarMovimientoCaja: vi.fn(),
  solicitarCierreCaja: vi.fn(),
  turnoAbiertoDeCaja: mocks.turnoAbiertoDeCaja,
}));

vi.mock('../../repositories/pedidos-repository.js', () => ({
  listarPedidosPorCobrar: mocks.listarPedidosPorCobrar,
  obtenerPedido: mocks.obtenerPedido,
}));

import { cobrarService } from '../caja-service.js';
import { cajaRouter } from '../../routes/caja.js';

const app = express().use(express.json()).use('/api/v1/caja', cajaRouter);

describe('cobrarService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.turnoAbiertoDeCaja.mockResolvedValue({ id: 21 });
    mocks.obtenerPedido.mockResolvedValue({ modoPagoMesa: 'CUENTA_UNICA' });
    mocks.listarMetodosPago.mockResolvedValue([{
      id: 1,
      nombre: 'EFECTIVO',
      afectaEfectivo: true,
      requiereReferencia: false,
      estadoRegistro: 'A',
    }]);
  });

  it('no permite aportes individuales cuando la cuenta es única', async () => {
    await expect(cobrarService({
      pedidoId: 14,
      usuarioId: 3,
      cajaId: 2,
      tipoDocumento: '03',
      clienteId: null,
      pagos: [{
        metodoPagoId: 1,
        monto: 80,
        montoRecibido: 80,
        referencia: '',
        banco: '',
        clienteId: 5,
      }],
      aportes: [{ clienteId: 5, monto: 80, referencia: '' }],
    })).rejects.toThrow('APORTES_NO_PERMITIDOS');

    expect(mocks.cobrarAtomicMixto).not.toHaveBeenCalled();
  });

  it('registra una venta desde el endpoint de cobro de caja', async () => {
    mocks.cobrarAtomicMixto.mockResolvedValue({
      idVenta: 9001,
      serie: 'B001',
      numero: '00001234',
      total: 80,
      vuelto: 0,
    });

    const response = await request(app)
      .post('/api/v1/caja/cobro')
      .send({
        pedidoId: 14,
        cajaId: 2,
        tipoDocumento: '03',
        clienteId: null,
        pagos: [{
          metodoPagoId: 1,
          monto: 80,
          montoRecibido: 100,
          referencia: '',
          banco: '',
          clienteId: null,
        }],
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      idVenta: 9001,
      serie: 'B001',
      numero: '00001234',
      total: 80,
      vuelto: 20,
    });
    expect(mocks.cobrarAtomicMixto).toHaveBeenCalledWith({
      pedidoId: 14,
      usuarioId: 7,
      aperturaId: 21,
      tipoDocumento: '03',
      clienteId: null,
      pagos: [{
        metodoPagoId: 1,
        monto: 80,
        montoRecibido: 100,
        referencia: '',
        banco: '',
        clienteId: null,
      }],
      aportes: undefined,
    });
  });
});
