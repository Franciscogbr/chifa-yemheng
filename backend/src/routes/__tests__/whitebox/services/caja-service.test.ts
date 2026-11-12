import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  abrirCajaService,
  cobrarService,
  arqueoCierreService,
  solicitarCierreCajaService,
  registrarMovimientoCajaService,
} from '../../../../services/caja-service.js';
import * as cajaRepo from '../../../../repositories/caja-repository.js';
import * as pedidosRepo from '../../../../repositories/pedidos-repository.js';

vi.mock('../../../../repositories/caja-repository.js');
vi.mock('../../../../repositories/pedidos-repository.js');

describe('Caja blanca - caja-service', () => {
  beforeEach(() => { vi.resetAllMocks(); });

  describe('abrirCajaService', () => {
    it('abre la caja con monto inicial', async () => {
      vi.spyOn(cajaRepo, 'abrirCaja').mockResolvedValue({ id: 1, mensaje: 'Caja abierta' });
      const result = await abrirCajaService(1, 5, 100, 'Apertura');
      expect(result.id).toBe(1);
      expect(cajaRepo.abrirCaja).toHaveBeenCalledWith({
        cajaId: 1, usuarioId: 5, montoInicial: 100,
        numeroTurno: expect.any(String), observacion: 'Apertura',
      });
    });
  });

  describe('cobrarService', () => {
    const pagoValido = {
      pedidoId: 1, usuarioId: 1, cajaId: 1, tipoDocumento: '03', clienteId: null,
      pagos: [{ metodoPagoId: 1, monto: 100, montoRecibido: 100, referencia: '', banco: '' }],
    };

    it('lanza NO_CAJA_ABIERTA cuando no hay turno abierto', async () => {
      vi.spyOn(cajaRepo, 'turnoAbiertoDeCaja').mockResolvedValue(null);
      await expect(cobrarService(pagoValido)).rejects.toThrow('NO_CAJA_ABIERTA');
    });

    it('lanza PEDIDO_NOT_FOUND cuando el pedido no existe', async () => {
      vi.spyOn(cajaRepo, 'turnoAbiertoDeCaja').mockResolvedValue({ id: 1 });
      vi.spyOn(pedidosRepo, 'obtenerPedido').mockResolvedValue(null);
      await expect(cobrarService({ ...pagoValido, pedidoId: 999 })).rejects.toThrow('PEDIDO_NOT_FOUND');
    });

    it('lanza PAGOS_INVALIDOS cuando no hay pagos', async () => {
      vi.spyOn(cajaRepo, 'turnoAbiertoDeCaja').mockResolvedValue({ id: 1 });
      vi.spyOn(pedidosRepo, 'obtenerPedido').mockResolvedValue({ id: 1 } as any);
      vi.spyOn(cajaRepo, 'listarMetodosPago').mockResolvedValue([]);
      await expect(cobrarService({ ...pagoValido, pagos: [] })).rejects.toThrow('PAGOS_INVALIDOS');
    });

    it('lanza METODO_PAGO_INVALIDO cuando el método no existe', async () => {
      vi.spyOn(cajaRepo, 'turnoAbiertoDeCaja').mockResolvedValue({ id: 1 });
      vi.spyOn(pedidosRepo, 'obtenerPedido').mockResolvedValue({ id: 1 } as any);
      vi.spyOn(cajaRepo, 'listarMetodosPago').mockResolvedValue([]);
      await expect(cobrarService({ ...pagoValido, pagos: [{ metodoPagoId: 999, monto: 100, montoRecibido: 100, referencia: '', banco: '' }] }))
        .rejects.toThrow('METODO_PAGO_INVALIDO');
    });

    it('lanza APORTES_REQUERIDOS para POR_CONSUMO sin aportes', async () => {
      vi.spyOn(cajaRepo, 'turnoAbiertoDeCaja').mockResolvedValue({ id: 1 });
      vi.spyOn(pedidosRepo, 'obtenerPedido').mockResolvedValue({ id: 1, modoPagoMesa: 'POR_CONSUMO' } as any);
      await expect(cobrarService(pagoValido)).rejects.toThrow('APORTES_REQUERIDOS');
    });
  });

  describe('arqueoCierreService', () => {
    it('lanza TURNO_NO_ABIERTO cuando no hay turno', async () => {
      vi.spyOn(cajaRepo, 'turnoAbiertoDeCaja').mockResolvedValue(null);
      await expect(arqueoCierreService({
        cajaId: 1, usuarioId: 1, denominaciones: [], observacion: '',
      })).rejects.toThrow('TURNO_NO_ABIERTO');
    });
  });

  describe('solicitarCierreCajaService', () => {
    it('lanza TURNO_NO_ABIERTO cuando no hay turno', async () => {
      vi.spyOn(cajaRepo, 'turnoAbiertoDeCaja').mockResolvedValue(null);
      await expect(solicitarCierreCajaService({
        cajaId: 1, usuarioId: 1, declarado: 100, observacion: '',
      })).rejects.toThrow('TURNO_NO_ABIERTO');
    });
  });

  describe('registrarMovimientoCajaService', () => {
    it('lanza NO_CAJA_ABIERTA cuando no hay turno', async () => {
      vi.spyOn(cajaRepo, 'turnoAbiertoDeCaja').mockResolvedValue(null);
      await expect(registrarMovimientoCajaService({
        cajaId: 1, usuarioId: 1, conceptoId: 1, metodoPagoId: 1, monto: 50,
        descripcion: 'Gasto', referencia: '', banco: '',
      })).rejects.toThrow('NO_CAJA_ABIERTA');
    });

    it('lanza MOVIMIENTO_INVALIDO cuando concepto o método no existen', async () => {
      vi.spyOn(cajaRepo, 'turnoAbiertoDeCaja').mockResolvedValue({ id: 1 });
      vi.spyOn(cajaRepo, 'listarConceptosCaja').mockResolvedValue([]);
      vi.spyOn(cajaRepo, 'listarMetodosPago').mockResolvedValue([]);
      await expect(registrarMovimientoCajaService({
        cajaId: 1, usuarioId: 1, conceptoId: 999, metodoPagoId: 999, monto: 50,
        descripcion: 'Gasto', referencia: '', banco: '',
      })).rejects.toThrow('MOVIMIENTO_INVALIDO');
    });
  });
});
