import { supabase } from '../config/supabase.js';
import { PedidoError, type DetallePedido, type ModoPagoMesa, type ParticipantePedido, type Pedido, type PedidoLista } from '../models/pedido.js';
import type { PedidoQuery } from '../schemas/pedido.js';
import { createAudit, updateAudit } from '../utils/auditoria.js';
import { distribuirConsumoPedido } from '../utils/pedido-consumo.js';

interface DetalleRow {
  id_detallepedido: number;
  id_pedido: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
  sub_total: number;
  nota_cocina: string | null;
  estado_preparacion: string;
  es_cortesia: string;
  f_solicitud: string;
  f_atencion: string | null;
  f_entrega_mozo: string | null;
  id_usuario_entrega: number | null;
  id_cliente: number | null;
  estado: string;
  producto: { n_producto: string } | null;
}

export async function registrarEntregaMozo(pedidoId: number, detalleId: number, usuarioId: number): Promise<void> {
  const fechaEntrega = new Date().toISOString();
  const { data, error } = await supabase
    .from('detalle_pedido')
    .update({
      f_entrega_mozo: fechaEntrega,
      id_usuario_entrega: usuarioId,
      usumod: 'SYSTEM',
      fecmod: fechaEntrega,
    })
    .eq('id_pedido', pedidoId)
    .eq('id_detallepedido', detalleId)
    .eq('estado_preparacion', 'S')
    .eq('estado', 'A')
    .is('f_entrega_mozo', null)
    .select('id_detallepedido')
    .maybeSingle();
  if (error) {
    throw new Error(`DB_DELIVERY_FAIL: ${error.message}`);
  }
  if (!data) {
    throw new Error('ENTREGA_NO_DISPONIBLE');
  }
}

interface PedidoRow {
  id_pedido: number;
  numero_pedido: string;
  id_cliente: number | null;
  id_mesa: number | null;
  id_tipopedido: number;
  canal_origen: 'QR' | 'WEB' | 'PRESENCIAL';
  modo_pago_mesa: ModoPagoMesa;
  id_estadopedido: number;
  id_usuario: number;
  id_empleado: number | null;
  f_pedido: string;
  f_cierre: string | null;
  n_comensales: number;
  subtotal: number;
  descuento: number;
  servicio: number;
  igv: number;
  total: number;
  facturado: string;
  anulado: string;
  motivo_anulacion: string | null;
  observacion: string | null;
  estado: string;
  tipo_pedido: { n_tipopedido: string } | null;
  estado_pedido: { descripcion: string } | null;
  mesa: { numero: string } | null;
}

const SELECT_PEDIDO =
  'id_pedido, numero_pedido, id_cliente, id_mesa, id_tipopedido, canal_origen, modo_pago_mesa, id_estadopedido, id_usuario, id_empleado, f_pedido, f_cierre, n_comensales, subtotal, descuento, servicio, igv, total, facturado, anulado, motivo_anulacion, observacion, estado, tipo_pedido(n_tipopedido), estado_pedido(descripcion), mesa(numero)';

const SELECT_DETALLE =
  'id_detallepedido, id_pedido, id_producto, cantidad, precio_unitario, descuento, sub_total, nota_cocina, estado_preparacion, es_cortesia, f_solicitud, f_atencion, f_entrega_mozo, id_usuario_entrega, id_cliente, estado, producto(n_producto)';

const SELECT_PEDIDO_COCINA = `${SELECT_PEDIDO}, detalle_pedido(${SELECT_DETALLE})`;

function lanzarErrorComanda(error: { message: string }, fallback: string): never {
  const codigos = [
    'MESA_POR_COBRAR',
    'YA_POR_COBRAR',
    'PEDIDO_FACTURADO',
    'PEDIDO_ANULADO',
    'NO_PARTICIPANTE',
    'NO_ES_ORGANIZADOR',
    'NO_COMANDA_ACTIVA',
    'PRODUCTO_NO_DISPONIBLE',
    'MESA_OCUPADA',
    'LA_MESA_NO_ADMITE_NUEVOS_PARTICIPANTES',
    'MODO_PAGO_BLOQUEADO',
  ] as const;
  const codigo = codigos.find((candidate) => error.message.includes(candidate));
  if (codigo) {
    throw new PedidoError(codigo);
  }
  throw new Error(`${fallback}: ${error.message}`);
}

function mapDetalle(row: DetalleRow): DetallePedido {
  return {
    id: row.id_detallepedido,
    pedidoId: row.id_pedido,
    productoId: row.id_producto,
    producto: row.producto?.n_producto ?? '',
    cantidad: Number(row.cantidad),
    precioUnitario: Number(row.precio_unitario),
    descuento: Number(row.descuento ?? 0),
    subTotal: Number(row.sub_total ?? 0),
    notaCocina: row.nota_cocina,
    estadoPreparacion: (row.estado_preparacion ?? 'P') as DetallePedido['estadoPreparacion'],
    esCortesia: (row.es_cortesia ?? 'N') as DetallePedido['esCortesia'],
    fechaSolicitud: row.f_solicitud,
    fechaAtencion: row.f_atencion,
    fechaEntregaMozo: row.f_entrega_mozo,
    clienteId: row.id_cliente,
    estadoRegistro: (row.estado ?? 'A') as DetallePedido['estadoRegistro'],
  };
}

function mapPedido(row: PedidoRow, detalles?: DetallePedido[]): Pedido {
  return {
    id: row.id_pedido,
    numero: row.numero_pedido,
    clienteId: row.id_cliente,
    mesaId: row.id_mesa,
    mesaNumero: row.mesa?.numero ?? null,
    tipoId: row.id_tipopedido,
    tipo: row.tipo_pedido?.n_tipopedido ?? '',
    canalOrigen: row.canal_origen ?? 'PRESENCIAL',
    modoPagoMesa: row.modo_pago_mesa ?? 'CUENTA_UNICA',
    estadoId: row.id_estadopedido,
    estado: row.estado_pedido?.descripcion ?? '',
    usuarioId: row.id_usuario,
    empleadoId: row.id_empleado,
    fecha: row.f_pedido,
    fechaCierre: row.f_cierre,
    comensales: Number(row.n_comensales ?? 1),
    subtotal: Number(row.subtotal ?? 0),
    descuento: Number(row.descuento ?? 0),
    servicio: Number(row.servicio ?? 0),
    igv: Number(row.igv ?? 0),
    total: Number(row.total ?? 0),
    facturado: (row.facturado ?? 'N') as Pedido['facturado'],
    anulado: (row.anulado ?? 'N') as Pedido['anulado'],
    motivoAnulacion: row.motivo_anulacion,
    observacion: row.observacion,
    estadoRegistro: (row.estado ?? 'A') as Pedido['estadoRegistro'],
    detalles,
  };
}

export async function listarPedidos(q: PedidoQuery): Promise<PedidoLista> {
  const desde = (q.page - 1) * q.limit;
  const hasta = desde + q.limit - 1;

  let query = supabase
    .from('pedido')
    .select(SELECT_PEDIDO, { count: 'exact' })
    .order('f_pedido', { ascending: false })
    .order('id_pedido', { ascending: false })
    .range(desde, hasta);

  if (q.estado) {
    query = query.eq('estado_pedido.descripcion', q.estado);
  }
  if (q.mesa !== undefined) {
    query = query.eq('id_mesa', q.mesa);
  }
  if (q.fecha) {
    query = query.gte('f_pedido', `${q.fecha}T00:00:00`).lte('f_pedido', `${q.fecha}T23:59:59`);
  }

  const { data, error, count } = await query;
  if (error) {
    throw new Error(`DB_LIST_FAIL: ${error.message}`);
  }
  const rows = ((data ?? []) as unknown as PedidoRow[]).map((r) => mapPedido(r));
  return { data: rows, page: q.page, limit: q.limit, total: count ?? 0 };
}

export async function obtenerPedido(id: number): Promise<Pedido | null> {
  const { data, error } = await supabase.from('pedido').select(SELECT_PEDIDO).eq('id_pedido', id).maybeSingle();
  if (error) {
    throw new Error(`DB_GET_FAIL: ${error.message}`);
  }
  if (!data) {
    return null;
  }
  const pedido = mapPedido(data as unknown as PedidoRow);

  const { data: det, error: detError } = await supabase
    .from('detalle_pedido')
    .select(SELECT_DETALLE)
    .eq('id_pedido', id)
    .order('f_solicitud', { ascending: true });
  if (detError) {
    throw new Error(`DB_GET_FAIL: ${detError.message}`);
  }
  pedido.detalles = ((det ?? []) as unknown as DetalleRow[]).map(mapDetalle);
  return pedido;
}

export async function abrirPedido(
  tipo: number,
  usuario: number,
  mesa: number | null,
  cliente: number | null,
  empleado: number | null,
  comensales: number,
  obs: string,
  canalOrigen: 'QR' | 'WEB' | 'PRESENCIAL' = 'PRESENCIAL',
): Promise<{ id: number; numero: string }> {
  const { data, error } = await supabase.rpc('fn_abrir_pedido_validado', {
    p_tipo: tipo,
    p_usuario: usuario,
    p_mesa: mesa,
    p_cliente: cliente,
    p_empleado: empleado,
    p_comensales: comensales,
    p_obs: obs,
  });
  if (error) {
    lanzarErrorComanda(error, 'DB_OPEN_FAIL');
  }
  const result = (Array.isArray(data) ? data[0] : data) as { o_id: number; o_num: string } | null;
  if (!result || !result.o_id) {
    throw new Error('DB_OPEN_FAIL: sin retorno');
  }
  if (canalOrigen === 'WEB') {
    const { error: origenError } = await supabase
      .from('pedido')
      .update({ canal_origen: canalOrigen, ...updateAudit('SYSTEM', '') })
      .eq('id_pedido', result.o_id);
    if (origenError) {
      throw new Error(`DB_UPDATE_FAIL: ${origenError.message}`);
    }
  }
  return { id: result.o_id, numero: result.o_num };
}

export async function abrirOUnirseComandaQR(args: {
  tipo: number;
  usuario: number;
  mesa: number;
  cliente: number;
  comensales: number;
  obs: string;
}): Promise<{ id: number; numero: string; esNuevo: boolean }> {
  const { data, error } = await supabase.rpc('fn_abrir_o_unirse_comanda_qr', {
    p_tipo: args.tipo,
    p_usuario: args.usuario,
    p_mesa: args.mesa,
    p_cliente: args.cliente,
    p_comensales: args.comensales,
    p_obs: args.obs,
  });
  if (error) {
    lanzarErrorComanda(error, 'DB_OPEN_FAIL');
  }
  const row = (Array.isArray(data) ? data[0] : data) as {
    id_pedido?: number;
    numero_pedido?: string;
    es_nuevo?: boolean;
  } | null;
  if (!row?.id_pedido || !row.numero_pedido) {
    throw new Error('DB_OPEN_FAIL: sin retorno');
  }
  return { id: Number(row.id_pedido), numero: row.numero_pedido, esNuevo: row.es_nuevo === true };
}

export async function agregarDetalle(
  pedido: number,
  producto: number,
  cantidad: number,
  nota: string,
  descuento: number,
): Promise<void> {
  const { error } = await supabase.rpc('fn_agregar_detalle_pedido', {
    p_pedido: pedido,
    p_prod: producto,
    p_cant: cantidad,
    p_nota: nota,
    p_desc: descuento,
  });
  if (error) {
    lanzarErrorComanda(error, 'DB_ADD_FAIL');
  }
}

export async function agregarDetalleDeCliente(
  pedidoId: number,
  productoId: number,
  cantidad: number,
  nota: string,
  descuento: number,
  clienteId: number,
): Promise<void> {
  const { error } = await supabase.rpc('fn_agregar_detalle_pedido_cliente', {
    p_pedido: pedidoId,
    p_prod: productoId,
    p_cant: cantidad,
    p_nota: nota,
    p_desc: descuento,
    p_cliente: clienteId,
  });
  if (error) {
    lanzarErrorComanda(error, 'DB_ADD_FAIL');
  }
}

export async function recalcularPedido(pedido: number): Promise<void> {
  const { error } = await supabase.rpc('fn_recalcular_pedido', { p_id: pedido });
  if (error) {
    throw new Error(`DB_RECALC_FAIL: ${error.message}`);
  }
}

export async function anularPedido(pedido: number, usuario: number, motivo: string): Promise<void> {
  const { error } = await supabase.rpc('usp_anular_pedido', {
    p_pedido: pedido,
    p_usuario: usuario,
    p_motivo: motivo,
  });
  if (error) {
    throw new Error(`DB_ANULAR_FAIL: ${error.message}`);
  }
}

export async function cambiarPreparacion(detalleId: number, estado: string): Promise<void> {
  const patch: Record<string, unknown> = {
    estado_preparacion: estado,
    usumod: 'SYSTEM',
    fecmod: new Date().toISOString(),
  };
  if (estado === 'S' || estado === 'E') {
    patch['f_atencion'] = new Date().toISOString();
  }
  const { error } = await supabase.from('detalle_pedido').update(patch).eq('id_detallepedido', detalleId);
  if (error) {
    throw new Error(`DB_PREP_FAIL: ${error.message}`);
  }
}

export async function auditar(
  idUsuario: number,
  accion: string,
  idRegistro: number,
  valor: string,
): Promise<void> {
  const { error } = await supabase.from('auditoria').insert({
    id_usuario: idUsuario,
    n_tabla: 'PEDIDO',
    accion,
    id_registro: idRegistro,
    valor_nuevo: valor,
    ...createAudit('SYSTEM', ''),
  });
  if (error) {
    throw new Error(`DB_AUDIT_FAIL: ${error.message}`);
  }
}

export async function obtenerEstadoMesa(
  mesaId: number,
): Promise<{ id: number | null; descripcion: string | null }> {
  const { data, error } = await supabase
    .from('mesa')
    .select('id_estadomesa, estado_mesa(descripcion)')
    .eq('id_mesa', mesaId)
    .maybeSingle();
  if (error) {
    throw new Error(`DB_GET_FAIL: ${error.message}`);
  }
  if (!data) {
    return { id: null, descripcion: null };
  }
  const row = data as unknown as {
    id_estadomesa: number | null;
    estado_mesa: { descripcion: string } | { descripcion: string }[] | null;
  };
  const rel = row.estado_mesa;
  const descripcion = Array.isArray(rel) ? (rel[0]?.descripcion ?? null) : (rel?.descripcion ?? null);
  return { id: row.id_estadomesa, descripcion };
}

export async function idEstadoMesaPorNombre(descripcion: string): Promise<number | null> {
  const { data, error } = await supabase
    .from('estado_mesa')
    .select('id_estadomesa')
    .eq('descripcion', descripcion)
    .eq('estado', 'A')
    .limit(1)
    .maybeSingle();
  if (error) {
    throw new Error(`DB_GET_FAIL: ${error.message}`);
  }
  if (!data) {
    throw new Error(`DB_CAT_FAIL: estado de mesa ${descripcion} no existe`);
  }
  return (data as { id_estadomesa: number }).id_estadomesa;
}

export async function clienteParticipa(pedidoId: number, clienteId: number): Promise<boolean> {
  const { data, error } = await supabase
    .from('pedido_participante')
    .select('id_cliente')
    .eq('id_pedido', pedidoId)
    .eq('id_cliente', clienteId)
    .limit(1)
    .maybeSingle();
  if (error) {
    throw new Error(`DB_GET_FAIL: ${error.message}`);
  }
  return data != null;
}

export async function registrarParticipanteMesa(
  pedidoId: number,
  clienteId: number,
): Promise<{ organizadorClienteId: number; esOrganizador: boolean; modoPagoMesa: ModoPagoMesa }> {
  const { data, error } = await supabase.rpc('fn_registrar_participante_comanda', {
    p_pedido: pedidoId,
    p_cliente: clienteId,
  });
  if (error) {
    lanzarErrorComanda(error, 'DB_JOIN_FAIL');
  }
  const row = (Array.isArray(data) ? data[0] : data) as {
    organizador_cliente_id?: number;
    es_organizador?: boolean;
    modo_pago_mesa?: ModoPagoMesa;
  } | null;
  if (!row?.organizador_cliente_id) {
    throw new Error('DB_JOIN_FAIL: no se pudo registrar la participación');
  }
  return {
    organizadorClienteId: Number(row.organizador_cliente_id),
    esOrganizador: row.es_organizador === true,
    modoPagoMesa: row.modo_pago_mesa ?? 'CUENTA_UNICA',
  };
}

export async function listarParticipantesPedido(pedidoId: number): Promise<ParticipantePedido[]> {
  const participantes = await listarParticipantesPedidos([pedidoId]);
  return participantes.get(pedidoId) ?? [];
}

export async function listarParticipantesPedidos(
  pedidoIds: number[],
): Promise<Map<number, ParticipantePedido[]>> {
  const result = new Map<number, ParticipantePedido[]>();
  if (pedidoIds.length === 0) {
    return result;
  }
  const { data, error } = await supabase
    .from('pedido_participante')
    .select('id_pedido, id_cliente, es_organizador, cliente:cliente(persona(nombre, ap_paterno, ap_materno))')
    .in('id_pedido', pedidoIds)
    .order('id_cliente', { ascending: true });
  if (error) {
    throw new Error(`DB_LIST_FAIL: ${error.message}`);
  }
  for (const pedidoId of pedidoIds) {
    result.set(pedidoId, []);
  }
  for (const row of ((data ?? []) as unknown as {
    id_pedido: number;
    id_cliente: number;
    es_organizador: boolean;
    cliente: {
      persona: { nombre: string; ap_paterno: string | null; ap_materno: string | null } | null;
    } | {
      persona: { nombre: string; ap_paterno: string | null; ap_materno: string | null } | null;
    }[] | null;
  }[])) {
    const cliente = Array.isArray(row.cliente) ? row.cliente[0] : row.cliente;
    const persona = cliente?.persona;
    const participantes = result.get(row.id_pedido);
    participantes?.push({
      clienteId: row.id_cliente,
      nombre: persona
        ? `${persona.nombre} ${persona.ap_paterno ?? ''} ${persona.ap_materno ?? ''}`.trim()
        : `Cliente ${row.id_cliente}`,
      esOrganizador: row.es_organizador,
    });
  }
  return result;
}

/** S3: consulta la cuenta individual del participante (fn_saldo_participante). */
export interface CuentaParticipanteSaldo {
  idCuenta: number;
  estadoCuenta: 'ABIERTA' | 'PAGADA';
  saldoPendiente: number;
  montoPagado: number;
  platos: {
    id: number;
    producto: string;
    cantidad: number;
    precioUnitario: number;
    subTotal: number;
    estadoPreparacion: string;
  }[];
}

export async function saldoParticipante(
  pedidoId: number,
  clienteId: number,
): Promise<CuentaParticipanteSaldo | null> {
  const { data, error } = await supabase.rpc('fn_saldo_participante', {
    p_pedido: pedidoId,
    p_cliente: clienteId,
  });
  if (error) {
    throw new Error(`DB_SALDO_FAIL: ${error.message}`);
  }
  const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | null;
  if (!row) {
    return null;
  }
  const platosRaw = (row['platos'] ?? []) as unknown as CuentaParticipanteSaldo['platos'];
  return {
    idCuenta: Number(row['id_cuenta']),
    estadoCuenta: (row['estado_cuenta'] === 'PAGADA' ? 'PAGADA' : 'ABIERTA') as 'ABIERTA' | 'PAGADA',
    saldoPendiente: Number(row['consumo_abierto'] ?? 0),
    montoPagado: Number(row['monto_pagado'] ?? 0),
    platos: platosRaw,
  };
}

export async function configurarModoPagoMesa(
  pedidoId: number,
  clienteId: number,
  modo: ModoPagoMesa,
): Promise<ModoPagoMesa> {
  const { data, error } = await supabase.rpc('fn_configurar_modo_pago_comanda', {
    p_pedido: pedidoId,
    p_cliente: clienteId,
    p_modo: modo,
  });
  if (error) {
    lanzarErrorComanda(error, 'DB_PAYMENT_MODE_FAIL');
  }
  return data as ModoPagoMesa;
}

export async function pedirCuentaMesa(
  mesaId: number,
  idEstadoPorCobrar: number,
  logeo: string,
  pc: string,
): Promise<void> {
  const { error } = await supabase
    .from('mesa')
    .update({ id_estadomesa: idEstadoPorCobrar, ...updateAudit(logeo, pc) })
    .eq('id_mesa', mesaId);
  if (error) {
    throw new Error(`DB_CUENTA_FAIL: ${error.message}`);
  }
}

export async function pedirCuentaComanda(pedidoId: number, clienteId: number): Promise<void> {
  const { error } = await supabase.rpc('fn_pedir_cuenta_comanda', {
    p_pedido: pedidoId,
    p_cliente: clienteId,
  });
  if (error) {
    lanzarErrorComanda(error, 'DB_CUENTA_FAIL');
  }
}

export async function pedidosAbiertosPorMesa(mesaId: number): Promise<Pedido[]> {
  const { data, error } = await supabase
    .from('pedido')
    .select(SELECT_PEDIDO)
    .eq('id_mesa', mesaId)
    .eq('facturado', 'N')
    .eq('anulado', 'N')
    .eq('estado', 'A')
    .order('f_pedido', { ascending: false });
  if (error) {
    throw new Error(`DB_LIST_FAIL: ${error.message}`);
  }
  return ((data ?? []) as unknown as PedidoRow[]).map((r) => mapPedido(r));
}

/** Pedidos activos con detalle para cocina (KDS). */
export async function listarPedidosCocina(): Promise<Pedido[]> {
  const { data, error } = await supabase
    .from('pedido')
    .select(SELECT_PEDIDO_COCINA)
    .eq('facturado', 'N')
    .eq('anulado', 'N')
    .eq('estado', 'A')
    .order('f_pedido', { ascending: false })
    .order('id_pedido', { ascending: false });
  if (error) {
    throw new Error(`DB_LIST_FAIL: ${error.message}`);
  }
  return ((data ?? []) as unknown as (PedidoRow & { detalle_pedido: DetalleRow[] | null })[]).map(
    (row) => {
      const detalles = ((row.detalle_pedido ?? []) as unknown as DetalleRow[]).map(mapDetalle);
      return mapPedido(row, detalles);
    },
  );
}

/** Pedidos de salón que solicitaron la cuenta y están listos para Caja. */
export async function listarPedidosPorCobrar(): Promise<Pedido[]> {
  const pedidos = await listarPedidosCocina();
  const mesaIds = Array.from(
    new Set(pedidos.flatMap((pedido) => (pedido.mesaId == null ? [] : [pedido.mesaId]))),
  );
  if (mesaIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('mesa')
    .select('id_mesa, estado_mesa(descripcion)')
    .in('id_mesa', mesaIds);
  if (error) {
    throw new Error(`DB_LIST_FAIL: ${error.message}`);
  }

  const mesasPorCobrar = new Set(
    ((data ?? []) as unknown as {
      id_mesa: number;
      estado_mesa: { descripcion: string } | { descripcion: string }[] | null;
    }[])
      .filter((mesa) => {
        const estado = Array.isArray(mesa.estado_mesa)
          ? mesa.estado_mesa[0]?.descripcion
          : mesa.estado_mesa?.descripcion;
        return estado === 'POR COBRAR';
      })
      .map((mesa) => Number(mesa.id_mesa)),
  );

  const pendientes = pedidos.filter((pedido) => pedido.mesaId != null && mesasPorCobrar.has(pedido.mesaId));
  const porPedido = await listarParticipantesPedidos(pendientes.map((pedido) => pedido.id));
  return pendientes.map((pedido) => ({
    ...pedido,
    participantes: distribuirConsumoPedido(pedido, porPedido.get(pedido.id) ?? []),
  }));
}