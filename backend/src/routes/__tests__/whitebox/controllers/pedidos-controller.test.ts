import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';
import {
  getPedidos,
  getCocina,
  getPedido,
  postPedido,
  postDetalle,
  patchPreparacion,
  patchAnular,
  postRecalcular,
  patchPedirCuenta,
} from '../../../../controllers/pedidos-controller.js';
import * as pedidosService from '../../../../services/pedidos-service.js';
import { PedidoError } from '../../../../models/pedido.js';
import { makeMockRequest, makeMockResponse, makeMockUser } from '../shared/helpers.js';

vi.mock('../../../../services/pedidos-service.js');
vi.mock('../../../../middlewares/auth-guard.js', () => ({
  authGuard: (req: any, res: any, next: any) => next(),
}));
vi.mock('../../../../middlewares/permission-guard.js', () => ({
  requirePermisos: () => (req: any, res: any, next: any) => next(),
  requirePermisosORoles: () => (req: any, res: any, next: any) => next(),
}));

describe('Caja blanca - pedidos-controller', () => {
  let mockReq: Request;
  let mockRes: any;

  beforeEach(() => {
    mockReq = makeMockRequest();
    mockRes = makeMockResponse();
    vi.resetAllMocks();
  });

  describe('getPedidos', () => {
    it('devuelve 400 cuando la query es inválida', async () => {
      mockReq.query = { page: -1 };
      await getPedidos(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.body.error).toBe('VALIDATION_ERROR');
    });

    it('devuelve 200 con la lista de pedidos', async () => {
      mockReq.query = { page: 1, limit: 10 };
      vi.spyOn(pedidosService, 'listarService').mockResolvedValue({
        data: [], page: 1, limit: 10, total: 0,
      });
      await getPedidos(mockReq, mockRes);
      expect(mockRes.body.data).toEqual([]);
      expect(pedidosService.listarService).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });
  });

  describe('getCocina', () => {
    it('devuelve 200 con la lista de cocina', async () => {
      vi.spyOn(pedidosService, 'cocinaService').mockResolvedValue({
        data: [], page: 1, limit: 100, total: 0,
      });
      await getCocina(mockReq, mockRes);
      expect(mockRes.body.data).toEqual([]);
    });
  });

  describe('getPedido', () => {
    it('devuelve 200 con el pedido cuando existe', async () => {
      mockReq.params = { id: '1' };
      vi.spyOn(pedidosService, 'obtenerService').mockResolvedValue({
        id: 1, numero: 'PED-001',
      } as any);
      await getPedido(mockReq, mockRes);
      expect(mockRes.body.id).toBe(1);
    });

    it('devuelve 404 cuando el pedido no existe', async () => {
      mockReq.params = { id: '999' };
      vi.spyOn(pedidosService, 'obtenerService').mockRejectedValue(new PedidoError('NOT_FOUND'));
      await getPedido(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.body.error).toBe('NOT_FOUND');
    });
  });

  describe('postPedido', () => {
    it('devuelve 400 cuando el body es inválido', async () => {
      mockReq.body = { tipo: 'no-es-numero' };
      await postPedido(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.body.error).toBe('VALIDATION_ERROR');
    });

    it('devuelve 201 cuando se crea el pedido correctamente', async () => {
      mockReq.body = { tipo: 1, mesa: 1, comensales: 2 };
      mockReq.user = makeMockUser();
      vi.spyOn(pedidosService, 'abrirService').mockResolvedValue({
        id: 1, numero: 'PED-001',
      } as any);
      await postPedido(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('devuelve 409 cuando el servicio lanza PedidoError', async () => {
      mockReq.body = { tipo: 1, mesa: 1 };
      mockReq.user = makeMockUser();
      vi.spyOn(pedidosService, 'abrirService').mockRejectedValue(new PedidoError('PEDIDO_ANULADO'));
      await postPedido(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.body.error).toBe('PEDIDO_ANULADO');
    });
  });

  describe('postDetalle', () => {
    it('devuelve 400 cuando el body es inválido', async () => {
      mockReq.body = { producto: 'no-es-numero' };
      mockReq.params = { id: '1' };
      mockReq.user = makeMockUser();
      await postDetalle(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('devuelve 200 cuando se agrega el detalle', async () => {
      mockReq.body = { producto: 1, cantidad: 2 };
      mockReq.params = { id: '1' };
      mockReq.user = makeMockUser();
      vi.spyOn(pedidosService, 'agregarDetalleService').mockResolvedValue({ id: 1 } as any);
      await postDetalle(mockReq, mockRes);
      expect(mockRes.body.id).toBe(1);
    });
  });

  describe('patchPreparacion', () => {
    it('devuelve 400 cuando el estado es inválido', async () => {
      mockReq.body = { estado: 'X' };
      mockReq.params = { idDetalle: '1' };
      mockReq.user = makeMockUser();
      await patchPreparacion(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('devuelve 200 cuando se cambia la preparación', async () => {
      mockReq.body = { estado: 'L' };
      mockReq.params = { idDetalle: '1' };
      mockReq.user = makeMockUser();
      vi.spyOn(pedidosService, 'cambiarPreparacionService').mockResolvedValue(undefined);
      await patchPreparacion(mockReq, mockRes);
      expect(mockRes.body).toEqual({ ok: true });
    });
  });

  describe('patchAnular', () => {
    it('devuelve 400 cuando falta el motivo', async () => {
      mockReq.body = {};
      mockReq.params = { id: '1' };
      mockReq.user = makeMockUser();
      await patchAnular(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('devuelve 200 cuando se anula el pedido', async () => {
      mockReq.body = { motivo: 'Cliente se fue' };
      mockReq.params = { id: '1' };
      mockReq.user = makeMockUser();
      vi.spyOn(pedidosService, 'anularService').mockResolvedValue(undefined);
      await patchAnular(mockReq, mockRes);
      expect(mockRes.body).toEqual({ ok: true });
    });
  });

  describe('postRecalcular', () => {
    it('devuelve 200 con el pedido recalculado', async () => {
      mockReq.params = { id: '1' };
      mockReq.user = makeMockUser();
      vi.spyOn(pedidosService, 'recalcularService').mockResolvedValue({ id: 1, total: 50 } as any);
      await postRecalcular(mockReq, mockRes);
      expect(mockRes.body.total).toBe(50);
    });
  });

  describe('patchPedirCuenta', () => {
    it('devuelve 200 cuando se pide la cuenta', async () => {
      mockReq.params = { id: '1' };
      mockReq.user = makeMockUser();
      vi.spyOn(pedidosService, 'pedirCuentaStaffService').mockResolvedValue({
        ok: true, pedidoId: 1, estado: 'POR COBRAR',
      });
      await patchPedirCuenta(mockReq, mockRes);
      expect(mockRes.body.ok).toBe(true);
    });
  });
});
