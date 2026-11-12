import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';
import {
  getPersonal,
  getEmpleado,
  postEmpleado,
  putEmpleado,
  patchEmpleadoEstado,
} from '../../../../controllers/personal-controller.js';
import * as personalService from '../../../../services/personal-service.js';
import { PersonalError } from '../../../../models/personal.js';
import { makeMockRequest, makeMockResponse, makeMockUser } from '../shared/helpers.js';

vi.mock('../../../../services/personal-service.js');

describe('Caja blanca - personal-controller', () => {
  let mockReq: Request;
  let mockRes: any;

  beforeEach(() => {
    mockReq = makeMockRequest();
    mockRes = makeMockResponse();
    vi.resetAllMocks();
  });

  describe('getPersonal', () => {
    it('devuelve 400 cuando la query es inválida', async () => {
      mockReq.query = { page: 0 };
      await getPersonal(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('devuelve 200 con la lista de personal', async () => {
      mockReq.query = { page: 1, limit: 10 };
      vi.spyOn(personalService, 'listarService').mockResolvedValue({
        data: [], page: 1, limit: 10, total: 0,
      });
      await getPersonal(mockReq, mockRes);
      expect(mockRes.body.data).toEqual([]);
    });
  });

  describe('getEmpleado', () => {
    it('devuelve 200 con el empleado cuando existe', async () => {
      mockReq.params = { id: '1' };
      vi.spyOn(personalService, 'obtenerService').mockResolvedValue({ id: 1, nombres: 'Juan' } as any);
      await getEmpleado(mockReq, mockRes);
      expect(mockRes.body.id).toBe(1);
    });

    it('devuelve 404 cuando el empleado no existe', async () => {
      mockReq.params = { id: '999' };
      vi.spyOn(personalService, 'obtenerService').mockRejectedValue(new PersonalError('NOT_FOUND'));
      await getEmpleado(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.body.error).toBe('NOT_FOUND');
    });
  });

  describe('postEmpleado', () => {
    it('devuelve 400 cuando el body es inválido', async () => {
      mockReq.body = { nombres: 123 };
      mockReq.user = makeMockUser({ sub: 1 });
      await postEmpleado(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('devuelve 201 cuando se crea el empleado', async () => {
      mockReq.body = { nombres: 'Juan', apPaterno: 'Pérez', tipoDoc: 'DNI', documento: '12345678', telefono: '999888777', cargoId: 1, contratoId: 1 };
      mockReq.user = makeMockUser({ sub: 1 });
      vi.spyOn(personalService, 'crearService').mockResolvedValue({ id: 1, nombres: 'Juan' } as any);
      await postEmpleado(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('devuelve 409 cuando el empleado ya existe', async () => {
      mockReq.body = { nombres: 'Juan', apPaterno: 'Pérez', tipoDoc: 'DNI', documento: '12345678', telefono: '999888777', cargoId: 1, contratoId: 1 };
      mockReq.user = makeMockUser({ sub: 1 });
      vi.spyOn(personalService, 'crearService').mockRejectedValue(new PersonalError('YA_EXISTE'));
      await postEmpleado(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.body.error).toBe('YA_EXISTE');
    });
  });

  describe('putEmpleado', () => {
    it('devuelve 400 cuando el body es inválido', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { nombres: 123 };
      mockReq.user = makeMockUser({ sub: 1 });
      await putEmpleado(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('devuelve 200 cuando se actualiza el empleado', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { nombres: 'Juan Actualizado' };
      mockReq.user = makeMockUser({ sub: 1 });
      vi.spyOn(personalService, 'actualizarService').mockResolvedValue({ id: 1, nombres: 'Juan Actualizado' } as any);
      await putEmpleado(mockReq, mockRes);
      expect(mockRes.body.nombres).toBe('Juan Actualizado');
    });
  });

  describe('patchEmpleadoEstado', () => {
    it('devuelve 400 cuando el estado es inválido', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { estado: 'X' };
      mockReq.user = makeMockUser({ sub: 1 });
      await patchEmpleadoEstado(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('devuelve 200 cuando se cambia el estado', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { estado: 'I' };
      mockReq.user = makeMockUser({ sub: 1 });
      vi.spyOn(personalService, 'cambiarEstadoService').mockResolvedValue({ id: 1, estado: 'I' } as any);
      await patchEmpleadoEstado(mockReq, mockRes);
      expect(mockRes.body.estado).toBe('I');
    });
  });
});
