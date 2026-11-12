import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  obtenerService,
  abrirService,
  agregarDetalleService,
  anularService,
  cambiarPreparacionService,
  recalcularService,
  pedirCuentaStaffService,
  entregasPendientesMozoService,
} from '../../../../services/pedidos-service.js';
import * as pedidosRepo from '../../../../repositories/pedidos-repository.js';
import { PedidoError } from '../../../../models/pedido.js';
import type { Pedido } from '../../../../models/pedido.js';
import { descontarInsumosPorDetalle } from '../../../../services/inventario-service.js';

vi.mock('../../../../repositories/pedidos-repository.js');
vi.mock('../../../../services/inventario-service.js', () => ({
  descontarInsumosPorDetalle: vi.fn(),
}));

const mockPedido: Pedido = {
  id: 1, numero: 'PED-001', clienteId: null, mesaId: 1, mesaNumero: '1',
  tipoId: 1, tipo: 'Mesa', canalOrigen: 'PRESENCIAL', modoPagoMesa: 'CUENTA_UNICA',
  estadoId: 1, estado: 'ABIERTO', usuarioId: 1, empleadoId: null,
  fecha: '2026-11-12', fechaCierre: null, comensales: 2, subtotal: 50, descuento: 0,
  servicio: 0, igv: 0, total: 50, facturado: 'N', anulado: 'N',
  motivoAnulacion: null, observacion: null, estadoRegistro: 'A', detalles: [],
};

describe('Caja blanca - pedidos-service', () => {
  beforeEach(() => { vi.resetAllMocks(); });

  describe('obtenerService', () => {
    it('devuelve el pedido cuando existe', async () => {
      vi.spyOn(pedidosRepo, 'obtenerPedido').mockResolvedValue(mockPedido);
      const result = await obtenerService(1);
      expect(result).toEqual(mockPedido);
    });

    it('lanza PedidoError NOT_FOUND cuando no existe', async () => {
      vi.spyOn(pedidosRepo, 'obtenerPedido').mockResolvedValue(null);
      await expect(obtenerService(999)).rejects.toThrow(PedidoError);
    });
  });

  describe('abrirService', () => {
    it('crea un pedido y lo devuelve', async () => {
      vi.spyOn(pedidosRepo, 'abrirPedido').mockResolvedValue({ id: 1, numero: 'PED-002' });
      vi.spyOn(pedidosRepo, 'auditar').mockResolvedValue(undefined);
      vi.spyOn(pedidosRepo, 'obtenerPedido').mockResolvedValue(mockPedido);
      const result = await abrirService({ tipo: 1, mesa: 1, comensales: 2 }, 1, 'user1', 'PC-01');
      expect(result).toEqual(mockPedido);
      expect(pedidosRepo.abrirPedido).toHaveBeenCalledWith(1, 1, 1, null, null, 2, '');
    });

    it('lanza NOT_FOUND si no se puede obtener después de abrir', async () => {
      vi.spyOn(pedidosRepo, 'abrirPedido').mockResolvedValue({ id: 2, numero: 'PED-003' });
      vi.spyOn(pedidosRepo, 'auditar').mockResolvedValue(undefined);
      vi.spyOn(pedidosRepo, 'obtenerPedido').mockResolvedValue(null);
      await expect(abrirService({ tipo: 1, mesa: 1 }, 1, 'user1')).rejects.toThrow(PedidoError);
    });
  });

  describe('agregarDetalleService', () => {
    it('agrega un detalle al pedido', async () => {
      vi.spyOn(pedidosRepo, 'obtenerPedido').mockResolvedValue(mockPedido);
      vi.spyOn(pedidosRepo, 'agregarDetalle').mockResolvedValue(undefined);
      vi.spyOn(pedidosRepo, 'recalcularPedido').mockResolvedValue(undefined);
      vi.spyOn(pedidosRepo, 'auditar').mockResolvedValue(undefined);
      vi.spyOn(pedidosRepo, 'obtenerPedido').mockResolvedValue(mockPedido);
      const result = await agregarDetalleService(
        1, { producto: 1, cantidad: 2, nota: 'Sin cebolla', descuento: 0 },
        1, 'user1', 'PC-01', ['MOZO'],
      );
      expect(result).toEqual(mockPedido);
    });

    it('lanza NOT_FOUND si el pedido no existe', async () => {
      vi.spyOn(pedidosRepo, 'obtenerPedido').mockResolvedValue(null);
      await expect(
        agregarDetalleService(999, { producto: 1, cantidad: 1 }, 1, 'user1'),
      ).rejects.toThrow(PedidoError);
    });

    it('lanza PEDIDO_FACTURADO si ya está facturado', async () => {
      vi.spyOn(pedidosRepo, 'obtenerPedido').mockResolvedValue({ ...mockPedido, facturado: 'S' });
      await expect(
        agregarDetalleService(1, { producto: 1, cantidad: 1 }, 1, 'user1'),
      ).rejects.toThrow(PedidoError);
    });

    it('lanza MOZO_PEDIDO_DIGITAL si mozo agrega a pedido digital', async () => {
      vi.spyOn(pedidosRepo, 'obtenerPedido').mockResolvedValue({ ...mockPedido, canalOrigen: 'QR' });
      await expect(
        agregarDetalleService(1, { producto: 1, cantidad: 1 }, 1, 'user1', 'PC', ['MOZO']),
      ).rejects.toThrow(PedidoError);
    });
  });

  describe('anularService', () => {
    it('anula un pedido válido', async () => {
      vi.spyOn(pedidosRepo, 'obtenerPedido').mockResolvedValue(mockPedido);
      vi.spyOn(pedidosRepo, 'anularPedido').mockResolvedValue(undefined);
      vi.spyOn(pedidosRepo, 'auditar').mockResolvedValue(undefined);
      await anularService(1, 1, 'Cliente se fue', 'PC-01', ['ADMIN']);
      expect(pedidosRepo.anularPedido).toHaveBeenCalledWith(1, 1, 'Cliente se fue');
    });

    it('lanza PEDIDO_FACTURADO si ya está facturado', async () => {
      vi.spyOn(pedidosRepo, 'obtenerPedido').mockResolvedValue({ ...mockPedido, facturado: 'S' });
      await expect(anularService(1, 1, 'motivo', 'PC', ['ADMIN'])).rejects.toThrow(PedidoError);
    });

    it('lanza PEDIDO_ANULADO si ya está anulado', async () => {
      vi.spyOn(pedidosRepo, 'obtenerPedido').mockResolvedValue({ ...mockPedido, anulado: 'S' });
      await expect(anularService(1, 1, 'motivo', 'PC', ['ADMIN'])).rejects.toThrow(PedidoError);
    });
  });

  describe('cambiarPreparacionService', () => {
    it('cambia el estado de preparación a Listo', async () => {
      vi.spyOn(pedidosRepo, 'cambiarPreparacion').mockResolvedValue(undefined);
      vi.spyOn(pedidosRepo, 'auditar').mockResolvedValue(undefined);
      await cambiarPreparacionService(1, 'L', 1, 'user1', 'PC-01');
      expect(pedidosRepo.cambiarPreparacion).toHaveBeenCalledWith(1, 'L');
    });

    it('audita error de inventario sin bloquear', async () => {
      vi.spyOn(pedidosRepo, 'cambiarPreparacion').mockResolvedValue(undefined);
      vi.mocked(descontarInsumosPorDetalle).mockRejectedValue(new Error('Fallo insumos'));
      vi.spyOn(pedidosRepo, 'auditar').mockResolvedValue(undefined);
      await cambiarPreparacionService(1, 'L', 1, 'user1', 'PC-01');
      expect(pedidosRepo.auditar).toHaveBeenCalledWith(1, 'DESCUENTO_INSUMOS_ERROR', 1, 'Fallo insumos');
    });
  });

  describe('recalcularService', () => {
    it('recalcula un pedido existente', async () => {
      vi.spyOn(pedidosRepo, 'obtenerPedido').mockResolvedValue(mockPedido);
      vi.spyOn(pedidosRepo, 'recalcularPedido').mockResolvedValue(undefined);
      vi.spyOn(pedidosRepo, 'obtenerPedido').mockResolvedValue(mockPedido);
      const result = await recalcularService(1, ['ADMIN']);
      expect(result).toEqual(mockPedido);
    });

    it('lanza NOT_FOUND si el pedido no existe', async () => {
      vi.spyOn(pedidosRepo, 'obtenerPedido').mockResolvedValue(null);
      await expect(recalcularService(999, [])).rejects.toThrow(PedidoError);
    });
  });

  describe('pedirCuentaStaffService', () => {
    it('pide la cuenta correctamente', async () => {
      vi.spyOn(pedidosRepo, 'obtenerPedido').mockResolvedValue(mockPedido);
      vi.spyOn(pedidosRepo, 'obtenerEstadoMesa').mockResolvedValue({ descripcion: 'LIBRE' });
      vi.spyOn(pedidosRepo, 'idEstadoMesaPorNombre').mockResolvedValue(10);
      vi.spyOn(pedidosRepo, 'pedirCuentaMesa').mockResolvedValue(undefined);
      vi.spyOn(pedidosRepo, 'auditar').mockResolvedValue(undefined);
      const result = await pedirCuentaStaffService(1, 1, 'user1', 'PC-01', ['ADMIN']);
      expect(result.ok).toBe(true);
      expect(result.pedidoId).toBe(1);
    });

    it('lanza VALIDATION_ERROR si el pedido no tiene mesa', async () => {
      vi.spyOn(pedidosRepo, 'obtenerPedido').mockResolvedValue({ ...mockPedido, mesaId: null });
      await expect(
        pedirCuentaStaffService(1, 1, 'user1', 'PC', ['ADMIN']),
      ).rejects.toThrow(PedidoError);
    });
  });

  describe('entregasPendientesMozoService', () => {
    it('filtra pedidos con entregas pendientes', async () => {
      const pedidosConDetalle = [{
        ...mockPedido, mesaId: 1,
        detalles: [{
          id: 1, estadoRegistro: 'A', estadoPreparacion: 'L', fechaEntregaMozo: null,
          productoId: 1, producto: 'Plato', cantidad: 1, precioUnitario: 10,
          descuento: 0, subTotal: 10, notaCocina: null, esCortesia: 'N',
          fechaSolicitud: '', fechaAtencion: null, clienteId: null,
        }],
      }];
      vi.spyOn(pedidosRepo, 'listarPedidosCocina').mockResolvedValue(pedidosConDetalle);
      const result = await entregasPendientesMozoService();
      expect(result.length).toBe(1);
    });
  });
});
