import type { ModoPagoMesa, Pedido, ParticipantePedido } from '../models/pedido.js';
import { PedidoError } from '../models/pedido.js';
import type { DetalleAdd, PedidoAbrir } from '../schemas/pedido.js';
import {
  agregarDetalleDeCliente as repoAgregarDeCliente,
  auditar,
  obtenerPedido as repoObtener,
  abrirOUnirseComandaQR,
  pedidosAbiertosPorMesa,
  registrarLlegadaReservaCliente,
  recalcularPedido as repoRecalcular,
  obtenerEstadoMesa as repoEstadoMesa,
  clienteParticipa,
  pedirCuentaComanda,
  saldoParticipante, type CuentaParticipanteSaldo,
  registrarParticipanteMesa,
  listarParticipantesPedido,
  configurarModoPagoMesa,
  actualizarModoPagoMesa,
} from '../repositories/pedidos-repository.js';
import { distribuirConsumoPedido } from '../utils/pedido-consumo.js';
import type { ReservaAtencionCliente } from '../schemas/pedido.js';

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

export async function elegirAtencionClienteService(
  input: ReservaAtencionCliente,
  clienteId: number,
): Promise<{ reservaId: number | null; canal: ReservaAtencionCliente['canal'] }> {
  const reservaId = await registrarLlegadaReservaCliente(input.mesaId, clienteId, input.canal);
  if (input.canal === 'MOZO' && reservaId === null) {
    throw new PedidoError('RESERVA_NO_ESPERA_MOZO');
  }
  return { reservaId, canal: input.canal };
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
  if (activos.some((d) => d.estadoPreparacion === 'L')) {
    return 'EN PREPARACION';
  }
  if (activos.every((d) => d.estadoPreparacion === 'L')) {
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

export interface DetalleTandaInput {
  producto: number;
  cantidad: number;
  nota?: string;
  descuento?: number;
}

export interface TandaInput {
  mesa: number;
  comensales?: number;
  obs?: string;
  detalles: DetalleTandaInput[];
}

export async function abrirPedidoTandaService(
  input: TandaInput,
  clienteId: number,
): Promise<Pedido> {
  if (!input.mesa) {
    throw new PedidoError('TIPO_INVALIDO');
  }
  if (input.detalles.length === 0) {
    throw new PedidoError('TIPO_INVALIDO');
  }
  // Abrir o unirse a la comanda QR (una sola operación)
  const result = await abrirOUnirseComandaQR({
    tipo: 1,
    usuario: AUTOSERVICIO_USER_ID,
    mesa: input.mesa,
    cliente: clienteId,
    comensales: input.comensales ?? 1,
    obs: input.obs ?? '',
  });
  await auditar(
    AUTOSERVICIO_USER_ID,
    'ABRIR_PEDIDO_TANDA',
    result.id,
    `Pedido ${result.numero} (cliente ${clienteId}, ${input.detalles.length} platos)`,
  );
  // Agregar cada detalle al pedido (una operación por plato, dentro de la misma comanda)
  for (const d of input.detalles) {
    await repoAgregarDeCliente(
      result.id,
      d.producto,
      d.cantidad,
      d.nota ?? '',
      d.descuento ?? 0,
      clienteId,
    );
  }
  await repoRecalcular(result.id);
  await auditar(AUTOSERVICIO_USER_ID, 'AGREGAR_TANDA_DETALLES', result.id, `${input.detalles.length} detalles`);
  const updated = await repoObtener(result.id);
  if (!updated) {
    throw new PedidoError('NOT_FOUND');
  }
  return updated;
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
  // Modo de pago automático: 1 persona = CUENTA_UNICA, 2+ personas = POR_CONSUMO
  const modoCalculado = participantes.length > 1 ? 'POR_CONSUMO' : 'CUENTA_UNICA';
  if (pedido.modoPagoMesa !== modoCalculado) {
    await actualizarModoPagoMesa(pedido.id, modoCalculado);
  }
  return {
    id: pedido.id,
    numero: pedido.numero,
    mesaId: pedido.mesaId ?? mesaId,
    estado: pedido.estado,
    estadoComandaDerivado: derivarEstadoComanda(pedido),
    total: pedido.total,
    cantidadDetalles: (pedido.detalles ?? []).filter((d) => d.estadoRegistro === 'A').length,
    mesaEstado: mesa.descripcion,
    modoPagoMesa: modoCalculado,
    esOrganizador: membresia.esOrganizador,
    participantes: participantesConImportes,
  };
}

export async function configurarModoPagoClienteService(
  pedidoId: number,
  clienteId: number,
  _modo: ModoPagoMesa,
): Promise<{ pedidoId: number; modoPagoMesa: ModoPagoMesa }> {
  const pedido = await repoObtener(pedidoId);
  if (!pedido) {
    throw new PedidoError('NOT_FOUND');
  }
  const participantes = await listarParticipantesPedido(pedido.id);
  // Modo de pago automático: 1 persona = CUENTA_UNICA, 2+ personas = POR_CONSUMO
  const modoCalculado = participantes.length > 1 ? 'POR_CONSUMO' : 'CUENTA_UNICA';
  const nuevoModo = await configurarModoPagoMesa(pedidoId, clienteId, modoCalculado);
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