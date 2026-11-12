import type { Pedido, PedidoLista } from '../models/pedido.js';
import { PedidoError } from '../models/pedido.js';
import type { DetalleAdd, PedidoAbrir, PedidoQuery } from '../schemas/pedido.js';
import {
  agregarDetalle as repoAgregar,
  anularPedido as repoAnular,
  abrirPedidoReservaMozo as repoAbrirPedidoReservaMozo,
  auditar,
  cambiarPreparacion as repoCambiarPrep,
  idEstadoMesaPorNombre,
  listarPedidos as repoListar,
  listarPedidosCocina,
  listarReservasEsperandoMozo as repoListarReservasEsperandoMozo,
  obtenerEstadoMesa,
  obtenerPedido as repoObtener,
  abrirPedido as repoAbrir,
  pedidosAbiertosPorMesa,
  pedirCuentaMesa,
  registrarEntregaMozo,
  recalcularPedido as repoRecalcular,
} from '../repositories/pedidos-repository.js';
import { descontarInsumosPorDetalle } from './inventario-service.js';

export function listarService(q: PedidoQuery): Promise<PedidoLista> {
  return repoListar(q);
}

export function reservasEsperandoMozoService() {
  return repoListarReservasEsperandoMozo();
}

export async function abrirPedidoReservaMozoService(
  reservaId: number,
  usuarioId: number,
  logeo: string,
  pc: string,
): Promise<Pedido> {
  const result = await repoAbrirPedidoReservaMozo(reservaId, usuarioId, logeo, pc);
  await auditar(usuarioId, 'ABRIR_PEDIDO_RESERVA', result.id, `Reserva ${reservaId} · Pedido ${result.numero}`);
  const pedido = await repoObtener(result.id);
  if (!pedido) throw new PedidoError('NOT_FOUND');
  return pedido;
}

/** Pedidos activos con detalle para cocina (KDS), con envoltorio paginado (spec). */
export async function cocinaService(): Promise<PedidoLista> {
  const data = await listarPedidosCocina();
  return { data, page: 1, limit: data.length || 100, total: data.length };
}

export async function obtenerService(id: number): Promise<Pedido> {
  const p = await repoObtener(id);
  if (!p) {
    throw new PedidoError('NOT_FOUND');
  }
  return p;
}

export async function abrirService(
  input: PedidoAbrir,
  idUsuario: number,
  _logeo: string,
  _pc = '',
): Promise<Pedido> {
  const result = await repoAbrir(
    input.tipo,
    idUsuario,
    input.mesa ?? null,
    input.cliente ?? null,
    input.empleado ?? null,
    input.comensales ?? 1,
    input.obs ?? '',
  );
  await auditar(idUsuario, 'ABRIR_PEDIDO', result.id, `Pedido ${result.numero}`);
  const pedido = await repoObtener(result.id);
  if (!pedido) {
    throw new PedidoError('NOT_FOUND');
  }
  return pedido;
}

export async function agregarDetalleService(
  pedidoId: number,
  input: DetalleAdd,
  idUsuario: number,
  _logeo: string,
  _pc = '',
  roles: string[] = [],
): Promise<Pedido> {
  const pedido = await repoObtener(pedidoId);
  if (!pedido) {
    throw new PedidoError('NOT_FOUND');
  }
  if (pedido.facturado === 'S' || pedido.anulado === 'S') {
    throw new PedidoError('PEDIDO_FACTURADO');
  }
  if (roles.includes('MOZO') && pedido.canalOrigen !== 'PRESENCIAL') {
    throw new PedidoError('MOZO_PEDIDO_DIGITAL');
  }
  await repoAgregar(pedidoId, input.producto, input.cantidad, input.nota ?? '', input.descuento ?? 0);
  await repoRecalcular(pedidoId);
  await auditar(idUsuario, 'AGREGAR_DETALLE', pedidoId, `Producto ${input.producto} x${input.cantidad}`);
  const updated = await repoObtener(pedidoId);
  if (!updated) {
    throw new PedidoError('NOT_FOUND');
  }
  return updated;
}

export async function entregasPendientesMozoService(): Promise<Pedido[]> {
  const pedidos = await listarPedidosCocina();
  return pedidos
    .filter((pedido) => pedido.mesaId !== null)
    .map((pedido) => ({
      ...pedido,
      detalles: pedido.detalles?.filter(
        (detalle) =>
          detalle.estadoRegistro === 'A' &&
          detalle.estadoPreparacion === 'L' &&
          detalle.fechaEntregaMozo === null,
      ),
    }))
    .filter((pedido) => (pedido.detalles?.length ?? 0) > 0);
}

export async function confirmarEntregaMozoService(
  pedidoId: number,
  detalleId: number,
  usuarioId: number,
): Promise<void> {
  const pedido = await repoObtener(pedidoId);
  if (!pedido) {
    throw new PedidoError('NOT_FOUND');
  }
  if (pedido.mesaId === null || pedido.facturado === 'S' || pedido.anulado === 'S') {
    throw new PedidoError('ENTREGA_NO_DISPONIBLE');
  }
  const detalle = pedido.detalles?.find((item) => item.id === detalleId);
  if (
    !detalle ||
    detalle.estadoRegistro !== 'A' ||
    detalle.estadoPreparacion !== 'L' ||
    detalle.fechaEntregaMozo !== null
  ) {
    throw new PedidoError('ENTREGA_NO_DISPONIBLE');
  }
  await registrarEntregaMozo(pedidoId, detalleId, usuarioId);
  await auditar(usuarioId, 'ENTREGAR_PLATO', detalleId, `Pedido ${pedido.numero}, producto ${detalle.productoId}`);
}

export async function recalcularService(pedidoId: number, roles: string[] = []): Promise<Pedido> {
  const pedido = await repoObtener(pedidoId);
  if (!pedido) {
    throw new PedidoError('NOT_FOUND');
  }
  if (roles.includes('MOZO') && pedido.canalOrigen !== 'PRESENCIAL') {
    throw new PedidoError('MOZO_PEDIDO_DIGITAL');
  }
  await repoRecalcular(pedidoId);
  const updated = await repoObtener(pedidoId);
  if (!updated) {
    throw new PedidoError('NOT_FOUND');
  }
  return updated;
}

export async function pedirCuentaStaffService(
  pedidoId: number,
  idUsuario: number,
  logeo: string,
  pc = '',
  roles: string[] = [],
): Promise<{ ok: true; pedidoId: number; estado: string }> {
  const pedido = await repoObtener(pedidoId);
  if (!pedido) {
    throw new PedidoError('NOT_FOUND');
  }
  if (pedido.mesaId === null) {
    throw new PedidoError('VALIDATION_ERROR');
  }
  if (pedido.facturado === 'S') {
    throw new PedidoError('PEDIDO_FACTURADO');
  }
  if (pedido.anulado === 'S') {
    throw new PedidoError('PEDIDO_ANULADO');
  }
  if (roles.includes('MOZO') && pedido.canalOrigen !== 'PRESENCIAL') {
    throw new PedidoError('MOZO_PEDIDO_DIGITAL');
  }
  const estadoMesa = await obtenerEstadoMesa(pedido.mesaId);
  if (estadoMesa.descripcion === 'POR COBRAR') {
    throw new PedidoError('YA_POR_COBRAR');
  }
  const idPorCobrar = await idEstadoMesaPorNombre('POR COBRAR');
  if (!idPorCobrar) {
    throw new PedidoError('VALIDATION_ERROR');
  }
  await pedirCuentaMesa(pedido.mesaId, idPorCobrar, logeo, pc);
  await auditar(idUsuario, 'PEDIR_CUENTA_STAFF', pedidoId, `Mesa ${pedido.mesaId}`);
  return { ok: true as const, pedidoId, estado: 'POR COBRAR' };
}

export async function anularService(
  pedidoId: number,
  idUsuario: number,
  motivo: string,
  _pc = '',
  roles: string[] = [],
): Promise<void> {
  const pedido = await repoObtener(pedidoId);
  if (!pedido) {
    throw new PedidoError('NOT_FOUND');
  }
  if (pedido.facturado === 'S') {
    throw new PedidoError('PEDIDO_FACTURADO');
  }
  if (pedido.anulado === 'S') {
    throw new PedidoError('PEDIDO_ANULADO');
  }
  if (roles.includes('MOZO') && pedido.canalOrigen !== 'PRESENCIAL') {
    throw new PedidoError('MOZO_PEDIDO_DIGITAL');
  }
  await repoAnular(pedidoId, idUsuario, motivo);
  await auditar(idUsuario, 'ANULAR_PEDIDO', pedidoId, motivo);
}

export async function cambiarPreparacionService(
  detalleId: number,
  estado: string,
  idUsuario: number,
  usucre: string,
  pc = '',
): Promise<void> {
  await repoCambiarPrep(detalleId, estado);

  // Cuando el plato pasa a Listo, descontar insumos de la receta automáticamente
  if (estado === 'L') {
    try {
      const resultado = await descontarInsumosPorDetalle(detalleId, idUsuario, usucre, pc);
      if (resultado.errores.length > 0) {
        await auditar(
          idUsuario,
          'DESCUENTO_INSUMOS_PARCIAL',
          detalleId,
          `Insumos descontados: ${resultado.insumos.join(', ')}. Errores: ${resultado.errores.join('; ')}`,
        );
      } else if (resultado.descontado) {
        await auditar(
          idUsuario,
          'DESCUENTO_INSUMOS',
          detalleId,
          `Insumos descontados: ${resultado.insumos.join(', ')}`,
        );
      }
    } catch (err) {
      // No bloquear el cambio de estado por error de inventario
      await auditar(
        idUsuario,
        'DESCUENTO_INSUMOS_ERROR',
        detalleId,
        err instanceof Error ? err.message : String(err),
      );
    }
  } else {
    await auditar(idUsuario, 'CAMBIAR_PREPARACION', detalleId, estado);
  }
}

export async function pedidosAbiertosPorMesaService(mesaId: number): Promise<Pedido[]> {
  return pedidosAbiertosPorMesa(mesaId);
}