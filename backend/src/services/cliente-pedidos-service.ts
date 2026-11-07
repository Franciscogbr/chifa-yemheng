import type { ModoPagoMesa, Pedido, ParticipantePedido } from '../models/pedido.js';
import { PedidoError } from '../models/pedido.js';
import type { DetalleAdd, PedidoAbrir } from '../schemas/pedido.js';
import {
  agregarDetalleDeCliente as repoAgregarDeCliente,
  auditar,
  obtenerPedido as repoObtener,
  abrirOUnirseComandaQR,
  pedidosAbiertosPorMesa,
  recalcularPedido as repoRecalcular,
  obtenerEstadoMesa as repoEstadoMesa,
  clienteParticipa,
  pedirCuentaComanda,
  saldoParticipante, type CuentaParticipanteSaldo,
  registrarParticipanteMesa,
  listarParticipantesPedido,
  configurarModoPagoMesa,
} from '../repositories/pedidos-repository.js';
import { distribuirConsumoPedido } from '../utils/pedido-consumo.js';

const AUTOSERVICIO_USER_ID = 1;

export interface PedidoClienteDetalle extends Pedido {
  estadoComandaDerivado: string;
}

export interface ComandaActivaCliente {
  id: number;
  numero: string;
  mesaId: number;
  estado: string;
  estadoComandaDerivado: string;
  total: number;
  cantidadDetalles: number;
  mesaEstado: string | null;
  modoPagoMesa: ModoPagoMesa;
  esOrganizador: boolean;
  participantes: (ParticipantePedido & { consumoEstimado: number })[];
}

/** BR-INF-047/048: estado de la comanda derivado de sus ítems. */
function derivarEstadoComanda(pedido: Pedido): string {
  if (pedido.anulado === 'S') {
    return 'ANULADO';
  }
  if (pedido.facturado === 'S') {
    return 'FACTURADO';
  }
  const activos = (pedido.detalles ?? []).filter(
    (d) => d.estadoRegistro === 'A' && d.estadoPreparacion !== 'A',
  );
  if (activos.length === 0) {
    return pedido.estado;
  }
  if (activos.some((d) => d.estadoPreparacion === 'E')) {
    return 'EN PREPARACION';
  }
  if (activos.every((d) => d.estadoPreparacion === 'S')) {
    return 'SERVIDO';
  }
  return pedido.estado;
}

/** El cliente o un participante QR del pedido (BR-EST-013) puede verlo. */
async function validarParticipacion(pedido: Pedido, clienteId: number): Promise<void> {
  if (pedido.clienteId === clienteId) {
    return;
  }
  const participa = await clienteParticipa(pedido.id, clienteId);
  if (!participa) {
    throw new PedidoError('NO_PARTICIPANTE');
  }
}

export async function abrirClienteService(
  input: PedidoAbrir,
  clienteId: number,
  _pc = '',
): Promise<Pedido> {
  if (input.mesa == null) {
    throw new PedidoError('TIPO_INVALIDO');
  }
  const result = await abrirOUnirseComandaQR({
    tipo: input.tipo,
    usuario: AUTOSERVICIO_USER_ID,
    mesa: input.mesa,
    cliente: clienteId,
    comensales: input.comensales ?? 1,
    obs: input.obs ?? '',
  });
  await auditar(
    AUTOSERVICIO_USER_ID,
    result.esNuevo ? 'ABRIR_PEDIDO_CLIENTE' : 'UNIRSE_COMANDA_CLIENTE',
    result.id,
    `Pedido ${result.numero} (cliente ${clienteId})`,
  );
  const pedido = await repoObtener(result.id);
  if (!pedido) {
    throw new PedidoError('NOT_FOUND');
  }
  return pedido;
}

export async function agregarDetalleClienteService(
  pedidoId: number,
  input: DetalleAdd,
  clienteId: number,
  _pc = '',
): Promise<Pedido> {
  const pedido = await repoObtener(pedidoId);
  if (!pedido) {
    throw new PedidoError('NOT_FOUND');
  }
  if (pedido.facturado === 'S' || pedido.anulado === 'S') {
    throw new PedidoError('PEDIDO_FACTURADO');
  }
  // BR-RES-029: una mesa POR COBRAR no admite nuevos productos (el SP no lo valida).
  if (pedido.mesaId != null) {
    const mesa = await repoEstadoMesa(pedido.mesaId);
    if (mesa.descripcion === 'POR COBRAR') {
      throw new PedidoError('MESA_POR_COBRAR');
    }
  }
  if (pedido.mesaId != null) {
    await registrarParticipanteMesa(pedidoId, clienteId);
  }
  await repoAgregarDeCliente(
    pedidoId,
    input.producto,
    input.cantidad,
    input.nota ?? '',
    input.descuento ?? 0,
    clienteId,
  );
  await repoRecalcular(pedidoId);
  await auditar(AUTOSERVICIO_USER_ID, 'AGREGAR_DETALLE_CLIENTE', pedidoId, `Producto ${input.producto} x${input.cantidad} (cliente ${clienteId})`);
  const updated = await repoObtener(pedidoId);
  if (!updated) {
    throw new PedidoError('NOT_FOUND');
  }
  return updated;
}

export async function recalcularClienteService(pedidoId: number, clienteId: number): Promise<Pedido> {
  const pedido = await repoObtener(pedidoId);
  if (!pedido) {
    throw new PedidoError('NOT_FOUND');
  }
  await validarParticipacion(pedido, clienteId);
  await repoRecalcular(pedidoId);
  const updated = await repoObtener(pedidoId);
  if (!updated) {
    throw new PedidoError('NOT_FOUND');
  }
  return updated;
}

export async function pedidosAbiertosPorMesaService(mesaId: number): Promise<Pedido[]> {
  return pedidosAbiertosPorMesa(mesaId);
}

export async function detalleClienteService(
  pedidoId: number,
  clienteId: number,
): Promise<PedidoClienteDetalle> {
  const pedido = await repoObtener(pedidoId);
  if (!pedido) {
    throw new PedidoError('NOT_FOUND');
  }
  await validarParticipacion(pedido, clienteId);
  return { ...pedido, estadoComandaDerivado: derivarEstadoComanda(pedido) };
}

export async function comandaActivaClienteService(
  mesaId: number,
  clienteId: number,
): Promise<ComandaActivaCliente | null> {
  const abiertos = await pedidosAbiertosPorMesa(mesaId);
  const activo = abiertos[0];
  if (!activo) {
    return null;
  }
  const pedido = await repoObtener(activo.id);
  if (!pedido) {
    throw new PedidoError('NOT_FOUND');
  }
  const mesa = await repoEstadoMesa(mesaId);
  const membresiaExistente = await clienteParticipa(pedido.id, clienteId);
  if (!membresiaExistente && mesa.descripcion === 'POR COBRAR') {
    throw new PedidoError('MESA_POR_COBRAR');
  }
  const membresia = await registrarParticipanteMesa(pedido.id, clienteId);
  const participantes = await listarParticipantesPedido(pedido.id);
  const participantesConImportes = distribuirConsumoPedido(pedido, participantes);
  return {
    id: pedido.id,
    numero: pedido.numero,
    mesaId: pedido.mesaId ?? mesaId,
    estado: pedido.estado,
    estadoComandaDerivado: derivarEstadoComanda(pedido),
    total: pedido.total,
    cantidadDetalles: (pedido.detalles ?? []).filter((d) => d.estadoRegistro === 'A').length,
    mesaEstado: mesa.descripcion,
    modoPagoMesa: membresia.modoPagoMesa,
    esOrganizador: membresia.esOrganizador,
    participantes: participantesConImportes,
  };
}

export async function configurarModoPagoClienteService(
  pedidoId: number,
  clienteId: number,
  modo: ModoPagoMesa,
): Promise<{ pedidoId: number; modoPagoMesa: ModoPagoMesa }> {
  const pedido = await repoObtener(pedidoId);
  if (!pedido) {
    throw new PedidoError('NOT_FOUND');
  }
  const nuevoModo = await configurarModoPagoMesa(pedidoId, clienteId, modo);
  return { pedidoId, modoPagoMesa: nuevoModo };
}

/** S3/S2: la vista "Mi cuenta" del participante: solo lo suyo. */
export async function miCuentaClienteService(
  pedidoId: number,
  clienteId: number,
): Promise<{ pedido: { id: number; mesaId: number | null; modoPagoMesa: ModoPagoMesa; mesaLiquidada: boolean }; cuenta: CuentaParticipanteSaldo }> {
  const pedido = await repoObtener(pedidoId);
  if (!pedido) {
    throw new PedidoError('NOT_FOUND');
  }
  // Validar permiso de ese cliente sobre el pedido sin traer datos ajenos.
  if (pedido.clienteId !== clienteId) {
    await validarParticipacion(pedido, clienteId);
  }
  const cuenta = await saldoParticipante(pedidoId, clienteId);
  if (!cuenta) {
    throw new PedidoError('SIN_CUENTA');
  }
  return {
    pedido: {
      id: pedido.id,
      mesaId: pedido.mesaId,
      modoPagoMesa: pedido.modoPagoMesa,
      mesaLiquidada: false,
    },
    cuenta,
  };
}

export async function pedirCuentaClienteService(mesaId: number, clienteId: number): Promise<{
  ok: boolean;
  pedidoId: number;
  estado: string;
}> {
  const abiertos = await pedidosAbiertosPorMesa(mesaId);
  const activo = abiertos[0];
  if (!activo) {
    throw new PedidoError('NO_COMANDA_ACTIVA');
  }
  const pedido = await repoObtener(activo.id);
  if (!pedido) {
    throw new PedidoError('NOT_FOUND');
  }
  await validarParticipacion(pedido, clienteId);
  const mesa = await repoEstadoMesa(mesaId);
  if (mesa.descripcion === 'POR COBRAR') {
    throw new PedidoError('YA_POR_COBRAR');
  }
  // BR-ACC-051/BR-RES-026: la cuenta es de toda la mesa; solo Caja cobra.
  await pedirCuentaComanda(pedido.id, clienteId);
  await auditar(
    AUTOSERVICIO_USER_ID,
    'PEDIR_CUENTA',
    pedido.id,
    `Mesa ${mesaId} (cliente ${clienteId})`,
  );
  return { ok: true, pedidoId: pedido.id, estado: 'POR COBRAR' };
}