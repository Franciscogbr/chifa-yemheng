import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  crearService,
  obtenerService,
  actualizarService,
  cambiarEstadoService,
  listarService,
} from '../../../../services/personal-service.js';
import * as personalRepo from '../../../../repositories/personal-repository.js';
import { PersonalError } from '../../../../models/personal.js';

vi.mock('../../../../repositories/personal-repository.js');

describe('Caja blanca - personal-service', () => {
  beforeEach(() => { vi.resetAllMocks(); });

  const mockPersonal = {
    id: 1, nombres: 'Juan', apPaterno: 'Pérez', documento: '12345678',
    tipoDoc: 'DNI', telefono: '999999999', cargo: 'MOZO', salario: 1200, estado: 'A',
  } as any;

  describe('crearService', () => {
    it('lanza VALIDATION_ERROR si el DNI no tiene 8 dígitos', async () => {
      await expect(
        crearService({ nombres: 'Juan', apPaterno: 'Pérez', tipoDoc: 'DNI', documento: '123', telefono: '999', cargo: 'MOZO', salario: 1000 }, 1, 'user1'),
      ).rejects.toThrow(PersonalError);
    });

    it('lanza YA_EXISTE si el documento ya está registrado', async () => {
      vi.spyOn(personalRepo, 'existeDocumento').mockResolvedValue(true);
      await expect(
        crearService({ nombres: 'Juan', apPaterno: 'Pérez', tipoDoc: 'DNI', documento: '12345678', telefono: '999', cargo: 'MOZO', salario: 1000 }, 1, 'user1'),
      ).rejects.toThrow(PersonalError);
    });

    it('crea el empleado correctamente', async () => {
      vi.spyOn(personalRepo, 'existeDocumento').mockResolvedValue(false);
      vi.spyOn(personalRepo, 'crearPersonal').mockResolvedValue(mockPersonal);
      vi.spyOn(personalRepo, 'auditar').mockResolvedValue(undefined);
      const result = await crearService(
        { nombres: 'Juan', apPaterno: 'Pérez', tipoDoc: 'DNI', documento: '12345678', telefono: '999', cargo: 'MOZO', salario: 1000 },
        1, 'user1',
      );
      expect(result).toEqual(mockPersonal);
      expect(personalRepo.auditar).toHaveBeenCalledWith(1, 'CREAR_EMPLEADO', 1, 'Juan Pérez');
    });
  });

  describe('obtenerService', () => {
    it('devuelve el empleado cuando existe', async () => {
      vi.spyOn(personalRepo, 'obtenerPersonal').mockResolvedValue(mockPersonal);
      const result = await obtenerService(1);
      expect(result).toEqual(mockPersonal);
    });

    it('lanza NOT_FOUND cuando no existe', async () => {
      vi.spyOn(personalRepo, 'obtenerPersonal').mockResolvedValue(null);
      await expect(obtenerService(999)).rejects.toThrow(PersonalError);
      await expect(obtenerService(999)).rejects.toThrow('NOT_FOUND');
    });
  });

  describe('actualizarService', () => {
    it('lanza NOT_FOUND cuando el empleado no existe', async () => {
      vi.spyOn(personalRepo, 'obtenerPersonal').mockResolvedValue(null);
      await expect(actualizarService(999, { nombres: 'Nuevo' }, 1, 'user1')).rejects.toThrow(PersonalError);
    });

    it('actualiza el empleado correctamente', async () => {
      vi.spyOn(personalRepo, 'obtenerPersonal').mockResolvedValue(mockPersonal);
      vi.spyOn(personalRepo, 'actualizarPersonal').mockResolvedValue(mockPersonal);
      vi.spyOn(personalRepo, 'auditar').mockResolvedValue(undefined);
      const result = await actualizarService(1, { nombres: 'Juan Actualizado' }, 1, 'user1');
      expect(result).toEqual(mockPersonal);
    });
  });

  describe('cambiarEstadoService', () => {
    it('lanza NOT_FOUND cuando el empleado no existe', async () => {
      vi.spyOn(personalRepo, 'obtenerPersonal').mockResolvedValue(null);
      await expect(cambiarEstadoService(999, { estado: 'I' }, 1, 'user1')).rejects.toThrow(PersonalError);
    });

    it('cambia a INACTIVO correctamente', async () => {
      vi.spyOn(personalRepo, 'obtenerPersonal').mockResolvedValue(mockPersonal);
      vi.spyOn(personalRepo, 'cambiarEstadoPersonal').mockResolvedValue(mockPersonal);
      vi.spyOn(personalRepo, 'auditar').mockResolvedValue(undefined);
      const result = await cambiarEstadoService(1, { estado: 'I' }, 1, 'user1');
      expect(personalRepo.auditar).toHaveBeenCalledWith(1, 'CESAR_EMPLEADO', 1, 'Juan Pérez');
    });

    it('cambia a ACTIVO correctamente', async () => {
      vi.spyOn(personalRepo, 'obtenerPersonal').mockResolvedValue(mockPersonal);
      vi.spyOn(personalRepo, 'cambiarEstadoPersonal').mockResolvedValue(mockPersonal);
      vi.spyOn(personalRepo, 'auditar').mockResolvedValue(undefined);
      await cambiarEstadoService(1, { estado: 'A' }, 1, 'user1');
      expect(personalRepo.auditar).toHaveBeenCalledWith(1, 'ACTIVAR_EMPLEADO', 1, 'Juan Pérez');
    });
  });

  describe('listarService', () => {
    it('delega al repositorio', async () => {
      vi.spyOn(personalRepo, 'listarPersonal').mockResolvedValue({ data: [], page: 1, limit: 10, total: 0 });
      const result = await listarService({ page: 1, limit: 10 });
      expect(result.data).toEqual([]);
      expect(personalRepo.listarPersonal).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });
  });
});
