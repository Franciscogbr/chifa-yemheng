import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';
import {
  getCajaMaestros,
  getCajaPendientes,
  getCierresPendientes,
  postCajaTurno,
  postCajaCierre,
  postCajaCobro,
  postCajaArqueo,
  getCajaIncidencias,
  patchCajaIncidencia,
  postCajaMovimiento,
  getCajaMovimientosResumen,
} from '../../../../controllers/caja-controller.js';
import * as cajaService from '../../../../services/caja-service.js';
import { makeMockRequest, makeMockResponse, makeMockUser } from '../shared/helpers.js';

vi.mock('../../../../services/caja-service.js');

describe('Caja blanca - caja-controller', () => {
  let mockReq: Request;
  let mockRes: any;

  beforeEach(() => {
    mockReq = makeMockRequest();
    mockRes = makeMockResponse();
    vi.resetAllMocks();
  });

  describe('getCajaMaestros', () => {
    it('devuelve 200 con los maestros de caja', async () => {
      vi.spyOn(cajaService, 'maestrosCajaService').mockResolvedValue({
        cajas: [], metodosPago: [], conceptos: [],
      });
      await getCajaMaestros(mockReq, mockRes);
      expect(mockRes.body.cajas).toEqual([]);
    });
  });

  describe('getCajaPendientes', () => {
    it('devuelve 200 con los pedidos pendientes', async () => {
      vi.spyOn(cajaService, 'pendientesCajaService').mockResolvedValue([]);
      await getCajaPendientes(mockReq, mockRes);
      expect(mockRes.body).toEqual([]);
    });
  });

  describe('getCierresPendientes', () => {
    it('devuelve 200 con cierres pendientes', async () => {
      vi.spyOn(cajaService, 'cierresPendientesService').mockResolvedValue([]);
      await getCierresPendientes(mockReq, mockRes);
      expect(mockRes.body).toEqual([]);
    });
  });

  describe('postCajaTurno', () => {
    it('devuelve 400 cuando el body es inválido', async () => {
      mockReq.body = { cajaId: 'no-es-numero' };
      mockReq.user = makeMockUser();
      await postCajaTurno(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.body.error).toBe('VALIDATION_ERROR');
    });

    it('devuelve 201 cuando se abre la caja correctamente', async () => {
      mockReq.body = { cajaId: 1, montoInicial: 100, observacion: 'Apertura' };
      mockReq.user = makeMockUser({ sub: 5 });
      vi.spyOn(cajaService, 'abrirCajaService').mockResolvedValue({
        id: 1, mensaje: 'Caja abierta',
      });
      await postCajaTurno(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(cajaService.abrirCajaService).toHaveBeenCalledWith(1, 5, 100, 'Apertura');
    });
  });

  describe('postCajaCierre', () => {
    it('devuelve 400 cuando falta montoDeclarado', async () => {
      mockReq.body = { cajaId: 1 };
      mockReq.user = makeMockUser({ sub: 5 });
      await postCajaCierre(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('devuelve 200 cuando se solicita el cierre', async () => {
      mockReq.body = { cajaId: 1, montoDeclarado: 150, observacion: 'Cierre' };
      mockReq.user = makeMockUser({ sub: 5 });
      vi.spyOn(cajaService, 'solicitarCierreCajaService').mockResolvedValue({
        aperturaId: 1, sistema: 150, declarado: 150, diferencia: 0, resultado: 'CUADRADA',
      });
      await postCajaCierre(mockReq, mockRes);
      expect(mockRes.body.resultado).toBe('CUADRADA');
    });
  });

  describe('postCajaCobro', () => {
    it('devuelve 400 cuando el body es inválido', async () => {
      mockReq.body = {};
      mockReq.user = makeMockUser({ sub: 5 });
      await postCajaCobro(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('devuelve 200 cuando se procesa el cobro', async () => {
      mockReq.body = {
        pedidoId: 1, cajaId: 1, tipoDocumento: '03', clienteId: null,
        pagos: [{ metodoPagoId: 1, monto: 100, montoRecibido: 100, referencia: '', banco: '' }],
      };
      mockReq.user = makeMockUser({ sub: 5 });
      vi.spyOn(cajaService, 'cobrarService').mockResolvedValue({
        idVenta: 1, serie: 'F001', numero: '00001', total: 100, vuelto: 0,
      });
      await postCajaCobro(mockReq, mockRes);
      expect(mockRes.body.idVenta).toBe(1);
    });
  });

  describe('postCajaArqueo', () => {
    it('devuelve 400 cuando faltan denominaciones', async () => {
      mockReq.body = { cajaId: 1 };
      mockReq.user = makeMockUser({ sub: 5 });
      await postCajaArqueo(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('devuelve 200 cuando se registra el arqueo', async () => {
      mockReq.body = {
        cajaId: 1,
        denominaciones: [{ valor: 10, cantidad: 5, tipo: 'BILLETE' }],
        observacion: 'Arqueo',
      };
      mockReq.user = makeMockUser({ sub: 5 });
      vi.spyOn(cajaService, 'arqueoCierreService').mockResolvedValue({
        aperturaId: 1, sistema: 50, declarado: 50, diferencia: 0,
        resultado: 'CUADRADA', idIncidencia: null, requiereSupervisor: false,
      });
      await postCajaArqueo(mockReq, mockRes);
      expect(mockRes.body.resultado).toBe('CUADRADA');
    });
  });

  describe('getCajaIncidencias', () => {
    it('devuelve 200 con incidencias', async () => {
      vi.spyOn(cajaService, 'incidenciasService').mockResolvedValue([]);
      await getCajaIncidencias(mockReq, mockRes);
      expect(mockRes.body.data).toEqual([]);
    });
  });

  describe('patchCajaIncidencia', () => {
    it('devuelve 400 cuando el id no es válido', async () => {
      mockReq.params = { id: 'abc' };
      mockReq.body = { estado: 'CERRADA', comentario: 'ok' };
      mockReq.user = makeMockUser({ sub: 5 });
      await patchCajaIncidencia(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('devuelve 200 cuando se resuelve la incidencia', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { estado: 'CERRADA', comentario: 'Resuelto' };
      mockReq.user = makeMockUser({ sub: 5 });
      vi.spyOn(cajaService, 'resolverIncidenciaService').mockResolvedValue(undefined);
      await patchCajaIncidencia(mockReq, mockRes);
      expect(mockRes.body).toEqual({ ok: true });
    });
  });

  describe('postCajaMovimiento', () => {
    it('devuelve 400 cuando el body es inválido', async () => {
      mockReq.body = {};
      mockReq.user = makeMockUser({ sub: 5 });
      await postCajaMovimiento(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('devuelve 201 cuando se registra el movimiento', async () => {
      mockReq.body = { cajaId: 1, conceptoId: 1, metodoPagoId: 1, monto: 50, descripcion: 'Gasto', referencia: '', banco: '' };
      mockReq.user = makeMockUser({ sub: 5 });
      vi.spyOn(cajaService, 'registrarMovimientoCajaService').mockResolvedValue({ movimientoId: 1 });
      await postCajaMovimiento(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe('getCajaMovimientosResumen', () => {
    it('devuelve 400 cuando aperturaId no es válido', async () => {
      mockReq.params = { aperturaId: 'abc' };
      await getCajaMovimientosResumen(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });
});
