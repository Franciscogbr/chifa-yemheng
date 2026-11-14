import { supabase } from '../config/supabase.js';
import { createAudit } from '../utils/auditoria.js';
import { resumirMovimientosPorMedio } from '../utils/caja-totales.js';

export interface Caja {
  id: number;
  nombre: string;
  aperturada: 'S' | 'N';
  montoBase: number;
  estadoRegistro: 'A' | 'I';
  turnoId: number | null;
  montoSistema: number | null;
  cierrePendiente: boolean;
  netoPorMedio: { medio: string; total: number }[];
}

export interface MetodoPago {
  id: number;
  nombre: string;
  afectaEfectivo: boolean;
  requiereReferencia: boolean;
  estadoRegistro: 'A' | 'I';
}

export interface TurnoCaja {
  id: number;
  cajaId: number;
  usuarioId: number;
  montoSistema: number;
  situacion: 'A' | 'P' | 'C';
}

export interface CierrePendiente {
  id: number;
  cajaId: number;
  cajaNombre: string;
  cajero: string;
  fechaSolicitud: string;
  montoSistema: number;
  montoDeclarado: number;
  diferencia: number;
  observacion: string | null;
}

export interface CajaResponse {
  cajas: Caja[];
  metodosPago: MetodoPago[];
  conceptos: ConceptoCaja[];
}

export interface ConceptoCaja {
  id: number;
  nombre: string;
  tipoMovimiento: string;
  afectaEfectivo: boolean;
}

export async function listarCajas(): Promise<Caja[]> {
  const [{ data, error }, { data: turnos, error: turnosError }] = await Promise.all([
    supabase
      .from('caja')
      .select('id_caja, n_caja, aperturada, monto_base, estado')
      .eq('estado', 'A')
      .order('n_caja', { ascending: true })
      .order('id_caja', { ascending: false }),
    supabase
      .from('apertura_caja')
      .select('id_aperturacaja, id_caja, situacion, monto_sistema')
      .in('situacion', ['A', 'P'])
      .eq('estado', 'A'),
  ]);
  if (error || turnosError) {
    throw new Error(`DB_LIST_FAIL: ${(error ?? turnosError)?.message ?? 'No se pudieron cargar las cajas'}`);
  }
  const activeTurns = ((turnos ?? []) as unknown as Record<string, unknown>[])
    .filter((turno) => turno['situacion'] === 'A');
  const activeTurnIds = activeTurns.map((turno) => Number(turno['id_aperturacaja']));
  let movimientos: Record<string, unknown>[] = [];
  if (activeTurnIds.length > 0) {
    const { data: cobrados, error: cobrosError } = await supabase
      .from('movimiento_caja')
      .select('id_aperturacaja, monto, tipo_movimiento_caja(n_tipomovimiento), metodo_pago(n_metodopago)')
      .in('id_aperturacaja', activeTurnIds)
      .eq('estado', 'A');
    if (cobrosError) throw new Error(`DB_LIST_FAIL: ${cobrosError.message}`);
    movimientos = (cobrados ?? []) as unknown as Record<string, unknown>[];
  }
  const totalsByTurn = new Map<number, Map<string, number>>();
  const movementsByTurn = new Map<number, { medio: string; monto: number; tipoMovimiento: string }[]>();
  for (const movement of movimientos) {
    const turnoId = Number(movement['id_aperturacaja']);
    const metodo = movement['metodo_pago'] as Record<string, unknown> | null;
    const tipo = movement['tipo_movimiento_caja'] as Record<string, unknown> | null;
    const grouped = movementsByTurn.get(turnoId) ?? [];
    grouped.push({
      medio: String(metodo?.['n_metodopago'] ?? 'Otro'),
      monto: Number(movement['monto']),
      tipoMovimiento: String(tipo?.['n_tipomovimiento'] ?? ''),
    });
    movementsByTurn.set(turnoId, grouped);
  }
  for (const [turnoId, grouped] of movementsByTurn) {
    const totals = resumirMovimientosPorMedio(grouped);
    totalsByTurn.set(turnoId, new Map(totals.map(({ medio, total }) => [medio, total])));
  }
  const turnoPorCaja = new Map(
    ((turnos ?? []) as unknown as Record<string, unknown>[]).map((turno) => [
      Number(turno['id_caja']),
      turno,
    ]),
  );
  return ((data ?? []) as unknown as Record<string, unknown>[]).map((r) => ({
    id: Number(r['id_caja']),
    nombre: String(r['n_caja'] ?? ''),
    aperturada: (r['aperturada'] === 'S' ? 'S' : 'N') as 'S' | 'N',
    montoBase: Number(r['monto_base'] ?? 0),
    estadoRegistro: (r['estado'] === 'I' ? 'I' : 'A') as 'A' | 'I',
    turnoId: turnoPorCaja.has(Number(r['id_caja']))
      ? Number(turnoPorCaja.get(Number(r['id_caja']))?.['id_aperturacaja'])
      : null,
    montoSistema: turnoPorCaja.has(Number(r['id_caja']))
      ? Number(turnoPorCaja.get(Number(r['id_caja']))?.['monto_sistema'] ?? 0)
      : null,
    cierrePendiente: turnoPorCaja.get(Number(r['id_caja']))?.['situacion'] === 'P',
    netoPorMedio: Array.from(
      totalsByTurn.get(Number(turnoPorCaja.get(Number(r['id_caja']))?.['id_aperturacaja'])) ?? new Map<string, number>(),
      ([medio, monto]) => ({ medio, total: monto }),
    ),
  }));
}

export async function listarMetodosPago(): Promise<MetodoPago[]> {
  const { data, error } = await supabase
    .from('metodo_pago')
    .select('id_metodopago, n_metodopago, afecta_efectivo, requiere_referencia, estado')
    .eq('estado', 'A')
    .order('n_metodopago', { ascending: true })
    .order('id_metodopago', { ascending: false });
  if (error) {
    throw new Error(`DB_LIST_FAIL: ${error.message}`);
  }

  return ((data ?? []) as unknown as Record<string, unknown>[]).map((r) => ({
    id: Number(r['id_metodopago']),
    nombre: String(r['n_metodopago'] ?? ''),
    afectaEfectivo: String(r['afecta_efectivo'] ?? 'N') === 'S',
    requiereReferencia: String(r['requiere_referencia'] ?? 'N') === 'S',
    estadoRegistro: (r['estado'] === 'I' ? 'I' : 'A') as 'A' | 'I',
  }));
}

export async function listarConceptosCaja(): Promise<ConceptoCaja[]> {
  const { data, error } = await supabase
    .from('concepto_caja')
    .select('id_concepto, n_concepto, afecta_efectivo, tipo_movimiento_caja(n_tipomovimiento)')
    .eq('estado', 'A')
    .order('n_concepto');
  if (error) throw new Error(`DB_LIST_FAIL: ${error.message}`);
  return ((data ?? []) as unknown as Record<string, unknown>[]).map((row) => {
    const tipo = row['tipo_movimiento_caja'] as Record<string, unknown> | null;
    return {
      id: Number(row['id_concepto']),
      nombre: String(row['n_concepto'] ?? ''),
      tipoMovimiento: String(tipo?.['n_tipomovimiento'] ?? ''),
      afectaEfectivo: String(row['afecta_efectivo'] ?? 'N') === 'S',
    };
  });
}

/** Turno de caja (apertura_caja) activo del usuario en la caja indicada. */
export async function turnoActivo(cajaId: number, usuarioId: number): Promise<TurnoCaja | null> {
  const { data, error } = await supabase
    .from('apertura_caja')
    .select('id_aperturacaja, id_caja, id_usuario, situacion, monto_sistema')
    .eq('id_caja', cajaId)
    .eq('id_usuario', usuarioId)
    .eq('situacion', 'A')
    .order('f_apertura', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    throw new Error(`DB_GET_FAIL: ${error.message}`);
  }
  if (!data) {
    return null;
  }
  const row = data as Record<string, unknown>;
  return {
    id: Number(row['id_aperturacaja']),
    cajaId: Number(row['id_caja']),
    usuarioId: Number(row['id_usuario']),
    montoSistema: Number(row['monto_sistema'] ?? 0),
    situacion: 'A',
  };
}

/** Cualquier turno activo de la caja (independiente del usuario), para cobro. */
export async function turnoAbiertoDeCaja(cajaId: number): Promise<TurnoCaja | null> {
  const { data, error } = await supabase
    .from('apertura_caja')
    .select('id_aperturacaja, id_caja, id_usuario, situacion, monto_sistema')
    .eq('id_caja', cajaId)
    .eq('situacion', 'A')
    .order('f_apertura', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    throw new Error(`DB_GET_FAIL: ${error.message}`);
  }
  if (!data) {
    return null;
  }
  const row = data as Record<string, unknown>;
  return {
    id: Number(row['id_aperturacaja']),
    cajaId: Number(row['id_caja']),
    usuarioId: Number(row['id_usuario']),
    montoSistema: Number(row['monto_sistema'] ?? 0),
    situacion: 'A',
  };
}

export async function abrirCaja(args: {
  cajaId: number;
  usuarioId: number;
  montoInicial: number;
  numeroTurno: string;
  observacion?: string;
}): Promise<{ id: number; mensaje: string }> {
  const { data, error } = await supabase.rpc('fn_aperturar_caja_atomic_observada', {
    p_caja: args.cajaId,
    p_usuario: args.usuarioId,
    p_monto: args.montoInicial,
    p_numero: args.numeroTurno,
    p_observacion: args.observacion ?? '',
  });
  if (error?.code === 'PGRST202') {
    throw new Error('MIGRACION_APERTURA_OBSERVACION_PENDIENTE');
  }
  if (error) {
    throw new Error(error.message);
  }
  const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | null;
  if (!row) {
    throw new Error('APERTURA_SIN_RESULTADO');
  }
  return {
    id: Number(row['id_apertura']),
    mensaje: String(row['mensaje'] ?? 'Caja aperturada correctamente'),
  };
}

function codigoConcepto(metodo: MetodoPago): number {
  if (metodo.afectaEfectivo) {
    return 1;
  }
  if (['YAPE', 'PLIN'].includes(metodo.nombre.toUpperCase())) {
    return 3;
  }
  return 2;
}

export async function cobrar(args: {
  pedidoId: number;
  usuarioId: number;
  aperturaId: number;
  tipoDocumento: string;
  clienteId: number | null;
  metodoPagoId: number;
  montoRecibido: number | null;
  referencia: string;
}): Promise<{ idVenta: number; serie: string; numero: string; total: number; vuelto: number }> {
  const { data: pedidoExistente, error: errPedExist } = await supabase
    .from('pedido')
    .select('id_pedido, facturado, anulado')
    .eq('id_pedido', args.pedidoId)
    .maybeSingle();
  if (errPedExist) {
    throw new Error(`DB_GET_FAIL: ${errPedExist.message}`);
  }
  if (!pedidoExistente) {
    throw new Error('PEDIDO_NOT_FOUND');
  }
  if (pedidoExistente.facturado === 'S') {
    throw new Error('PEDIDO_FACTURADO');
  }
  if (pedidoExistente.anulado === 'S') {
    throw new Error('PEDIDO_ANULADO');
  }

  const { data: ape, error: errApe } = await supabase
    .from('apertura_caja')
    .select('id_aperturacaja')
    .eq('id_aperturacaja', args.aperturaId)
    .eq('situacion', 'A')
    .maybeSingle();
  if (errApe) {
    throw new Error(`DB_GET_FAIL: ${errApe.message}`);
  }
  if (!ape) {
    throw new Error('NO_CAJA_ABIERTA');
  }

  // Recalcular pedido antes de facturar (BR-EST-006).
  const { error: errRecalc } = await supabase.rpc('fn_recalcular_pedido', {
    p_id: args.pedidoId,
  });
  if (errRecalc) {
    throw new Error(`DB_RECALC_FAIL: ${errRecalc.message}`);
  }

  // Leer pedido ya recalculado.
  const { data: pedido, error: errPed2 } = await supabase
    .from('pedido')
    .select('id_pedido, id_mesa, id_cliente, subtotal, descuento, servicio, igv, total, facturado, anulado')
    .eq('id_pedido', args.pedidoId)
    .maybeSingle();
  if (errPed2) {
    throw new Error(`DB_GET_FAIL: ${errPed2.message}`);
  }
  if (!pedido) {
    throw new Error('PEDIDO_NOT_FOUND');
  }
  if (pedido.facturado === 'S') {
    throw new Error('PEDIDO_FACTURADO');
  }
  if (pedido.anulado === 'S') {
    throw new Error('PEDIDO_ANULADO');
  }

  const metodo = (await listarMetodosPago()).find((m) => m.id === args.metodoPagoId);
  const total = Number(pedido.total ?? 0);
  if (total <= 0) {
    throw new Error('TOTAL_CERO');
  }
  const recibido = args.montoRecibido ?? total;
  const vuelto = recibido > total ? recibido - total : 0;

  let idEmpresa: number | null = null;
  let clienteDocumento: string | null = null;
  let clienteNombre: string | null = null;
  if (args.tipoDocumento === '01') {
    if (!args.clienteId) {
      throw new Error('FACTURA_CLIENTE_REQUERIDO');
    }
    const { data: cli, error: errCli } = await supabase
      .from('cliente')
      .select('id_empresa, empresa(ruc)')
      .eq('id_cliente', args.clienteId)
      .maybeSingle();
    if (errCli) {
      throw new Error(`DB_GET_FAIL: ${errCli.message}`);
    }
    if (!cli) {
      throw new Error('FACTURA_CLIENTE_REQUERIDO');
    }
    const c = cli as Record<string, unknown>;
    idEmpresa = Number(c['id_empresa'] ?? null);
    if (!idEmpresa) {
      throw new Error('FACTURA_CLIENTE_REQUERIDO');
    }
    // BR-RES-016: la FACTURA (01) solo se emite a clientes asociados a una EMPRESA con RUC válido (11 dígitos).
    const ruc = String((c['empresa'] as Record<string, unknown> | null)?.['ruc'] ?? '');
    if (!/^\d{11}$/.test(ruc)) {
      throw new Error('RUC_INVALIDO');
    }
  } else if (args.tipoDocumento === '03' && args.clienteId) {
    // Boleta: poblar cliente_documento y cliente_nombre.
    const { data: cli, error: errCli } = await supabase
      .from('cliente')
      .select('n_documento, persona(nombre, ap_paterno, ap_materno)')
      .eq('id_cliente', args.clienteId)
      .maybeSingle();
    if (errCli) {
      throw new Error(`DB_GET_FAIL: ${errCli.message}`);
    }
    if (cli) {
      const c = cli as Record<string, unknown>;
      clienteDocumento = String(c['n_documento'] ?? '');
      const pe = c['persona'] as Record<string, unknown> | null;
      const partes = [
        String(pe?.['nombre'] ?? ''),
        String(pe?.['ap_paterno'] ?? ''),
        String(pe?.['ap_materno'] ?? ''),
      ].filter((p) => p);
      clienteNombre = partes.length > 0 ? partes.join(' ') : null;
    }
  }

  const { data: venta, error: errVen } = await supabase
    .from('venta')
    .insert({
      id_pedido: args.pedidoId,
      id_cliente: args.clienteId,
      id_usuario: args.usuarioId,
      id_aperturacaja: args.aperturaId,
      tipodocumento: args.tipoDocumento,
      subtotal: Number(pedido.subtotal ?? 0),
      descuento: Number(pedido.descuento ?? 0),
      servicio: Number(pedido.servicio ?? 0),
      igv: Number(pedido.igv ?? 0),
      total,
      total_pagado: total,
      vuelto,
    })
    .select('id_venta')
    .single();
  if (errVen) {
    throw new Error(`DB_COBRO_FAIL: ${errVen.message}`);
  }
  const idVenta = Number((venta as { id_venta: number }).id_venta);

  const { data: detalles, error: errDet } = await supabase
    .from('detalle_pedido')
    .select('id_producto, cantidad, precio_unitario, descuento')
    .eq('id_pedido', args.pedidoId)
    .neq('estado_preparacion', 'A')
    .eq('estado', 'A')
    .eq('es_cortesia', 'N');
  if (errDet) {
    throw new Error(`DB_GET_FAIL: ${errDet.message}`);
  }
  if (detalles && detalles.length > 0) {
    const { error: errDetIns } = await supabase.from('detalle_venta').insert(
      (detalles as unknown[]).map((d) => {
        const x = d as Record<string, unknown>;
        return {
          id_venta: idVenta,
          id_producto: x['id_producto'],
          cantidad: x['cantidad'],
          precio: x['precio_unitario'],
          descuento: x['descuento'],
        };
      }),
    );
    if (errDetIns) {
      throw new Error(`DB_COBRO_FAIL: ${errDetIns.message}`);
    }
  }

  // Correlativo atómico vía función Postgres con FOR UPDATE.
  let serie: string | null = null;
  let numero: string | null = null;
  try {
    const { data: serieResult, error: errSerie } = await supabase.rpc(
      'fn_incrementar_correlativo_serie',
      { p_tipodoc: args.tipoDocumento },
    );
    if (errSerie) throw errSerie;
    const serieRows = (serieResult as unknown[]) ?? [];
    if (serieRows.length > 0) {
      const firstRow = serieRows[0] as Record<string, unknown>;
      serie = String(firstRow['serie'] ?? '');
      numero = String(firstRow['numero'] ?? '');
    }
  } catch {
    // Fallback: leer + actualizar (menos atómico, pero funcional si la función no existe).
    const { data: serieRow, error: errSerieRow } = await supabase
      .from('serie_documento')
      .select('id_serie, serie, correlativo')
      .eq('tipo_documento', args.tipoDocumento)
      .eq('estado', 'A')
      .order('id_serie', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (errSerieRow) throw errSerieRow;
    if (!serieRow) {
      throw new Error('SERIE_NO_EXISTE');
    }
    const firstRow = serieRow as Record<string, unknown>;
    serie = String(firstRow['serie'] ?? '');
    const correlativo = Number(firstRow['correlativo'] ?? 0) + 1;
    numero = String(correlativo).padStart(8, '0');
    const { error: errSerieUpd } = await supabase
      .from('serie_documento')
      .update({ correlativo })
      .eq('id_serie', Number(firstRow['id_serie']));
    if (errSerieUpd) throw errSerieUpd;
  }

  if (!serie || !numero) {
    throw new Error('SERIE_NO_EXISTE');
  }

  if (args.tipoDocumento === '03') {
    const { error: errBol } = await supabase.from('boleta').insert({
      id_venta: idVenta,
      serie,
      numero,
      cliente_documento: clienteDocumento,
      cliente_nombre: clienteNombre,
    });
    if (errBol) {
      throw new Error(`DB_COBRO_FAIL: ${errBol.message}`);
    }
  } else if (args.tipoDocumento === '01') {
    const { error: errFac } = await supabase.from('factura').insert({
      id_venta: idVenta,
      id_empresa: idEmpresa,
      serie,
      numero,
      condicion_pago: 'CONTADO',
    });
    if (errFac) {
      throw new Error(`DB_COBRO_FAIL: ${errFac.message}`);
    }
  }

  const concepto = metodo ? codigoConcepto(metodo) : 1;
  const { error: errMov } = await supabase.from('movimiento_caja').insert({
    id_aperturacaja: args.aperturaId,
    id_tipomovimiento: 1, // INGRESO
    id_concepto: concepto,
    id_metodopago: args.metodoPagoId,
    id_usuario: args.usuarioId,
    monto: total,
    descripcion: 'Cobro comprobante',
    id_pedido: args.pedidoId,
    id_venta: idVenta,
    numero_operacion: args.referencia || null,
    documento: 'N',
    estado: 'A',
  });
  if (errMov) {
    throw new Error(`DB_COBRO_FAIL: ${errMov.message}`);
  }

  // BR-INF-051: los pagos digitales suman a Total_Ingresos pero NO modifican el efectivo físico (Monto_Sistema).
  if (metodo && metodo.afectaEfectivo) {
    const { error: errApeUpd } = await supabase.rpc('fn_sumar_efectivo_turno', {
      p_apertura: args.aperturaId,
      p_monto: total,
    });
    if (errApeUpd) {
      throw new Error(`DB_COBRO_FAIL: ${errApeUpd.message}`);
    }
  }

  const { error: errPedUpd } = await supabase
    .from('pedido')
    .update({ facturado: 'S', id_estadopedido: 4, f_cierre: new Date().toISOString() })
    .eq('id_pedido', args.pedidoId);
  if (errPedUpd) {
    throw new Error(`DB_COBRO_FAIL: ${errPedUpd.message}`);
  }

  if (pedido.id_mesa) {
    await supabase.from('mesa').update({ id_estadomesa: 1 }).eq('id_mesa', pedido.id_mesa);
  }

  return {
    idVenta,
    serie,
    numero,
    total,
    vuelto,
  };
}

/* ------------------------- Factura: clientes empresa ------------------------- */

export interface ClienteEmpresa {
  clienteId: number;
  razonSocial: string;
  ruc: string;
  nombreComercial: string | null;
}

/** Busca clientes tipo empresa (J) por RUC o razón social para emitir FACTURA (01). (BR-RES-016) */
export async function buscarClientesEmpresa(q: string): Promise<ClienteEmpresa[]> {
  const term = q.trim();
  if (term.length < 2) {
    return [];
  }
  const digits = term.replace(/\D/g, '');
  let query = supabase
    .from('cliente')
    .select('id_cliente, id_empresa, empresa(ruc, razon_social, nombre_comercial)')
    .eq('estado', 'A')
    .not('id_empresa', 'is', null)
    .limit(10);
  if (/^\d+$/.test(digits) && digits.length >= 4) {
    query = query.ilike('empresa.ruc', `%${digits}%`);
  } else {
    query = query.ilike('empresa.razon_social', `%${term}%`);
  }
  const { data, error } = await query;
  if (error) {
    throw new Error(`DB_LIST_FAIL: ${error.message}`);
  }
  return ((data ?? []) as unknown as Record<string, unknown>[]).map((r) => {
    const emp = r['empresa'] as Record<string, unknown> | null;
    return {
      clienteId: Number(r['id_cliente']),
      razonSocial: String(emp?.['razon_social'] ?? ''),
      ruc: String(emp?.['ruc'] ?? ''),
      nombreComercial: emp?.['nombre_comercial'] ? String(emp['nombre_comercial']) : null,
    };
  });
}

/* ------------------------------ Cierre y arqueo ------------------------------ */

export interface MovimientoCaja {
  id: number;
  fecha: string;
  tipoMovimiento: string;
  concepto: string;
  metodoPago: string;
  monto: number;
  afectaEfectivo: boolean;
  descripcion: string | null;
  numeroOperacion: string | null;
  idVenta: number | null;
  usuario: string;
}

export interface TurnoDetalle {
  id: number;
  cajaId: number;
  cajaNombre: string;
  cajero: string;
  numeroTurno: string;
  fApertura: string;
  montoInicial: number;
  montoSistema: number;
  totalIngresos: number;
  totalEgresos: number;
  situacion: 'A' | 'P' | 'C';
}

export interface HistorialTurno {
  id: number;
  cajaNombre: string;
  cajero: string;
  usuarioCierre: string | null;
  numeroTurno: string;
  fApertura: string;
  fCierre: string | null;
  montoInicial: number;
  montoSistema: number;
  montoDeclarado: number;
  diferencia: number;
  resultado: 'CUADRADO' | 'SOBRANTE' | 'FALTANTE' | null;
  observacion: string | null;
  situacion: 'A' | 'C';
}

export interface CierreResultado {
  sistema: number;
  declarado: number;
  diferencia: number;
  resultado: string;
}

export interface ReporteZ {
  turno: TurnoDetalle;
  resultado: 'CUADRADO' | 'SOBRANTE' | 'FALTANTE' | null;
  montoDeclarado: number;
  usuarioCierre: string | null;
  fCierre: string | null;
  observacion: string | null;
  movimientos: MovimientoCaja[];
}

/** Turno completo de una caja (abierto o, si no hay, el último cerrado). */
export async function turnoDeCaja(cajaId: number): Promise<TurnoDetalle | null> {
  const { data, error } = await supabase
    .from('apertura_caja')
    .select('id_aperturacaja, id_caja, id_usuario, numero_turno, f_apertura, monto_inicial, monto_sistema, total_ingresos, total_egresos, situacion')
    .eq('id_caja', cajaId)
    .order('f_apertura', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    throw new Error(`DB_GET_FAIL: ${error.message}`);
  }
  if (!data) {
    return null;
  }
  const row = data as Record<string, unknown>;
  const cajaNombre = String((await listarCajas()).find((c) => c.id === Number(row['id_caja']))?.nombre ?? `Caja ${row['id_caja']}`);
  return {
    id: Number(row['id_aperturacaja']),
    cajaId: Number(row['id_caja']),
    cajaNombre,
    cajero: await logeoUsuarioSingle(Number(row['id_usuario'])),
    numeroTurno: String(row['numero_turno'] ?? ''),
    fApertura: new Date(String(row['f_apertura'])).toISOString(),
    montoInicial: Number(row['monto_inicial'] ?? 0),
    montoSistema: Number(row['monto_sistema'] ?? 0),
    totalIngresos: Number(row['total_ingresos'] ?? 0),
    totalEgresos: Number(row['total_egresos'] ?? 0),
    situacion: (row['situacion'] === 'P' ? 'P' : row['situacion'] === 'C' ? 'C' : 'A') as 'A' | 'P' | 'C',
  };
}

async function logeoUsuarioSingle(id: number): Promise<string> {
  const { data, error } = await supabase
    .from('usuario')
    .select('logeo')
    .eq('id_usuario', id)
    .maybeSingle();
  if (error) throw new Error(`DB_GET_FAIL: ${error.message}`);
  return String(data?.['logeo'] ?? '');
}

async function logeoUsuario(ids: number[]): Promise<Map<number, string>> {
  const mapa = new Map<number, string>();
  if (ids.length === 0) {
    return mapa;
  }
  const { data, error } = await supabase
    .from('usuario')
    .select('id_usuario, logeo')
    .in('id_usuario', ids);
  if (error) {
    throw new Error(`DB_GET_FAIL: ${error.message}`);
  }
  for (const r of (data ?? []) as unknown as Record<string, unknown>[]) {
    mapa.set(Number(r['id_usuario']), String(r['logeo'] ?? ''));
  }
  return mapa;
}

/** Movimientos de caja del turno activo de la caja indicada. */
export async function listarMovimientos(cajaId: number): Promise<{ turno: TurnoDetalle | null; movimientos: MovimientoCaja[] }> {
  const turno = await turnoDeCaja(cajaId);
  if (!turno || turno.situacion !== 'A') {
    return { turno, movimientos: [] };
  }
  const { data, error } = await supabase
    .from('movimiento_caja')
    .select('id_movimientocaja, f_movimiento, monto, afecta_efectivo, descripcion, numero_operacion, id_venta, id_usuario, tipo_movimiento_caja(n_tipomovimiento), concepto_caja(n_concepto), metodo_pago(n_metodopago)')
    .eq('id_aperturacaja', turno.id)
    .eq('estado', 'A')
    .order('f_movimiento', { ascending: true });
  if (error) {
    throw new Error(`DB_LIST_FAIL: ${error.message}`);
  }
  const ids = [...new Set(((data ?? []) as unknown as Record<string, unknown>[]).map((r) => Number(r['id_usuario'])))];
  const usuarios = await logeoUsuario(ids);
  const movimientos = ((data ?? []) as unknown as Record<string, unknown>[]).map((r) => {
    const tm = r['tipo_movimiento_caja'] as Record<string, unknown> | null;
    const cc = r['concepto_caja'] as Record<string, unknown> | null;
    const mp = r['metodo_pago'] as Record<string, unknown> | null;
    return {
      id: Number(r['id_movimientocaja']),
      fecha: new Date(String(r['f_movimiento'])).toISOString(),
      tipoMovimiento: String(tm?.['n_tipomovimiento'] ?? ''),
      concepto: String(cc?.['n_concepto'] ?? ''),
      metodoPago: String(mp?.['n_metodopago'] ?? ''),
      monto: Number(r['monto'] ?? 0),
      afectaEfectivo: String(r['afecta_efectivo'] ?? 'N') === 'S',
      descripcion: r['descripcion'] ? String(r['descripcion']) : null,
      numeroOperacion: r['numero_operacion'] ? String(r['numero_operacion']) : null,
      idVenta: r['id_venta'] ? Number(r['id_venta']) : null,
      usuario: usuarios.get(Number(r['id_usuario'])) ?? '',
    };
  });
  return { turno, movimientos };
}

/** Historial de turnos cerrados de todas las cajas. */
export async function historialCaja(limite = 20): Promise<HistorialTurno[]> {
  const { data, error } = await supabase
    .from('apertura_caja')
    .select('id_aperturacaja, id_caja, id_usuario, id_usuariocierre, numero_turno, f_apertura, f_cierre, monto_inicial, monto_sistema, monto_declarado, diferencia, situacion, observacion')
    .eq('situacion', 'C')
    .order('f_cierre', { ascending: false })
    .limit(Math.min(limite, 100));
  if (error) {
    throw new Error(`DB_LIST_FAIL: ${error.message}`);
  }
  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  if (rows.length === 0) {
    return [];
  }
  const cajasIds = Array.from(new Set(rows.map((r) => Number(r['id_caja']))));
  const { data: cajas, error: errCajas } = await supabase
    .from('caja')
    .select('id_caja, n_caja')
    .in('id_caja', cajasIds);
  if (errCajas) {
    throw new Error(`DB_GET_FAIL: ${errCajas.message}`);
  }
  const nombreCaja = new Map<number, string>(
    ((cajas ?? []) as unknown as Record<string, unknown>[]).map((c) => [Number(c['id_caja']), String(c['n_caja'] ?? '')]),
  );
  const allIds = rows.flatMap((r) => [Number(r['id_usuario']), Number(r['id_usuariocierre'] ?? 0)]);
  const uniqueIds = Array.from(new Set(allIds));
  const usuariosIds = uniqueIds.filter((x): x is number => x > 0);
  const usuarios = await logeoUsuario(usuariosIds);
  return rows.map((r) => {
    const diferencia = Number(r['diferencia'] ?? 0);
    return {
      id: Number(r['id_aperturacaja']),
      cajaNombre: nombreCaja.get(Number(r['id_caja'])) ?? `Caja ${r['id_caja']}`,
      cajero: usuarios.get(Number(r['id_usuario'])) ?? '',
      usuarioCierre: r['id_usuariocierre'] ? (usuarios.get(Number(r['id_usuariocierre'])) ?? null) : null,
      numeroTurno: String(r['numero_turno'] ?? ''),
      fApertura: new Date(String(r['f_apertura'])).toISOString(),
      fCierre: r['f_cierre'] ? new Date(String(r['f_cierre'])).toISOString() : null,
      montoInicial: Number(r['monto_inicial'] ?? 0),
      montoSistema: Number(r['monto_sistema'] ?? 0),
      montoDeclarado: Number(r['monto_declarado'] ?? 0),
      diferencia,
      resultado: (diferencia === 0 ? 'CUADRADO' : diferencia > 0 ? 'SOBRANTE' : 'FALTANTE') as 'CUADRADO' | 'SOBRANTE' | 'FALTANTE',
      observacion: r['observacion'] ? String(r['observacion']) : null,
      situacion: 'C' as const,
    };
  });
}

export async function cobrarAtomic(args: {
  pedidoId: number;
  usuarioId: number;
  aperturaId: number;
  tipoDocumento: string;
  clienteId: number | null;
  metodoPagoId: number;
  montoRecibido: number | null;
  referencia: string;
}): Promise<{ idVenta: number; serie: string; numero: string; total: number; vuelto: number }> {
  const { data, error } = await supabase.rpc('fn_cobrar_pedido_atomic', {
    p_pedido: args.pedidoId,
    p_usuario: args.usuarioId,
    p_apertura: args.aperturaId,
    p_tipodoc: args.tipoDocumento,
    p_cliente: args.clienteId,
    p_metodo: args.metodoPagoId,
    p_recibido: args.montoRecibido,
    p_ref: args.referencia,
  });
  if (error) {
    throw new Error(error.message);
  }
  const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | null;
  if (!row) {
    throw new Error('COBRO_SIN_RESULTADO');
  }
  return {
    idVenta: Number(row['id_venta']),
    serie: String(row['serie'] ?? ''),
    numero: String(row['numero'] ?? ''),
    total: Number(row['total'] ?? 0),
    vuelto: Number(row['vuelto'] ?? 0),
  };
}

export async function cobrarAtomicConAportes(args: {
  pedidoId: number;
  usuarioId: number;
  aperturaId: number;
  tipoDocumento: string;
  clienteId: number | null;
  metodoPagoId: number;
  montoRecibido: number | null;
  referencia: string;
  aportes: { clienteId: number; monto: number; referencia: string }[];
}): Promise<{ idVenta: number; serie: string; numero: string; total: number; vuelto: number }> {
  const { data, error } = await supabase.rpc('fn_cobrar_pedido_aportes_atomic', {
    p_pedido: args.pedidoId,
    p_usuario: args.usuarioId,
    p_apertura: args.aperturaId,
    p_tipodoc: args.tipoDocumento,
    p_cliente: args.clienteId,
    p_metodo: args.metodoPagoId,
    p_recibido: args.montoRecibido,
    p_ref: args.referencia,
    p_aportes: args.aportes,
  });
  if (error) {
    throw new Error(error.message);
  }
  const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | null;
  if (!row) {
    throw new Error('COBRO_SIN_RESULTADO');
  }
  return {
    idVenta: Number(row['id_venta']),
    serie: String(row['serie'] ?? ''),
    numero: String(row['numero'] ?? ''),
    total: Number(row['total'] ?? 0),
    vuelto: Number(row['vuelto'] ?? 0),
  };
}

export async function cobrarAtomicMixto(args: {
  pedidoId: number;
  usuarioId: number;
  aperturaId: number;
  tipoDocumento: string;
  clienteId: number | null;
  empresa?: { razonSocial: string; direccion: string; ruc: string };
  pagos: {
    metodoPagoId: number;
    monto: number;
    montoRecibido: number | null;
    referencia: string;
    banco: string;
    clienteId: number | null;
  }[];
  aportes: { clienteId: number; monto: number; referencia: string }[] | undefined;
}): Promise<{ idVenta: number; serie: string; numero: string; total: number; vuelto: number }> {
  let idCliente = args.clienteId;

  // Factura sin cliente registrado: crear empresa y cliente automáticamente con datos de Factiliza.
  if (args.tipoDocumento === '01' && !idCliente && args.empresa) {
    const ahora = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const auditoria = createAudit(String(args.usuarioId), '');

    // Buscar empresa existente por RUC
    const { data: empExistente } = await supabase
      .from('empresa')
      .select('id_empresa')
      .eq('ruc', args.empresa.ruc)
      .maybeSingle();
    let idEmpresa: number;
    if (empExistente) {
      idEmpresa = Number((empExistente as Record<string, unknown>)['id_empresa']);
    } else {
      const { data: nuevaEmp, error: errEmp } = await supabase
        .from('empresa')
        .insert({
          ruc: args.empresa.ruc,
          razon_social: args.empresa.razonSocial,
          direccion: args.empresa.direccion,
          ...auditoria,
        })
        .select('id_empresa')
        .single();
      if (errEmp) throw new Error(`DB_CREATE_FAIL: ${errEmp.message}`);
      idEmpresa = Number((nuevaEmp as Record<string, unknown>)['id_empresa']);
    }

    // Buscar cliente existente para esa empresa
    const { data: cliExistente } = await supabase
      .from('cliente')
      .select('id_cliente')
      .eq('id_empresa', idEmpresa)
      .maybeSingle();
    if (cliExistente) {
      idCliente = Number((cliExistente as Record<string, unknown>)['id_cliente']);
    } else {
      const { data: nuevoCli, error: errCli } = await supabase
        .from('cliente')
        .insert({
          id_empresa: idEmpresa,
          tipo_cliente: 'J',
          estado: 'A',
          f_registro: ahora,
          ...auditoria,
        })
        .select('id_cliente')
        .single();
      if (errCli) throw new Error(`DB_CREATE_FAIL: ${errCli.message}`);
      idCliente = Number((nuevoCli as Record<string, unknown>)['id_cliente']);
    }
  }

  const { data, error } = await supabase.rpc('fn_cobrar_pedido_mixto_atomic', {
    p_pedido: args.pedidoId,
    p_usuario: args.usuarioId,
    p_apertura: args.aperturaId,
    p_tipodoc: args.tipoDocumento,
    p_cliente: idCliente,
    p_pagos: args.pagos,
    p_aportes: args.aportes ?? null,
  });
  if (error) {
    if (error.code === 'PGRST202') {
      throw new Error('MIGRACION_CAJA_PAGOS_MIXTOS_PENDIENTE');
    }
    throw new Error(error.message);
  }
  const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | null;
  if (!row) throw new Error('COBRO_SIN_RESULTADO');
  return {
    idVenta: Number(row['id_venta']),
    serie: String(row['serie'] ?? ''),
    numero: String(row['numero'] ?? ''),
    total: Number(row['total'] ?? 0),
    vuelto: Number(row['vuelto'] ?? 0),
  };
}

/** S5: el supervisor rechaza el arqueo; el cajero re-cuenta. */
export async function rechazarCierreCaja(args: {
  aperturaId: number;
  supervisorId: number;
}): Promise<void> {
  const { error } = await supabase.rpc('fn_rechazar_cierre_caja', {
    p_apertura: args.aperturaId,
    p_supervisor: args.supervisorId,
  });
  if (error) throw new Error(error.message);
}

/* ------------------------- T17: comprobante (boleta/factura) ------------------------- */

export interface ComprobanteData {
  venta: Record<string, unknown> | null;
  pedido: Record<string, unknown> | null;
  cliente: Record<string, unknown> | null;
  cuenta: Record<string, unknown> | null;
  detalles: Record<string, unknown>[];
  comprobante: Record<string, unknown> | null;
  emisor: Record<string, unknown> | null;
  pagos: Record<string, unknown>[];
}

export async function getComprobante(ventaId: number): Promise<ComprobanteData> {
  const { data: venta, error: errVenta } = await supabase
    .from('venta')
    .select('*')
    .eq('id_venta', ventaId)
    .maybeSingle();
  if (errVenta) throw new Error(`DB_GET_FAIL: ${errVenta.message}`);
  if (!venta) throw new Error('COMPROBANTE_NO_ENCONTRADO');

  const { data: pedido } = await supabase
    .from('pedido')
    .select('*')
    .eq('id_pedido', venta.id_pedido)
    .maybeSingle();

  const { data: cliente } = await supabase
    .from('cliente')
    .select('*')
    .eq('id_cliente', venta.id_cliente)
    .maybeSingle();

  const { data: cuenta } = await supabase
    .from('cuenta_participante')
    .select('*')
    .eq('id_venta', ventaId)
    .maybeSingle();

  const { data: detalles } = await supabase
    .from('detalle_pedido')
    .select('*')
    .eq('id_cuenta', cuenta?.id)
    .eq('estado', 'A');

  const { data: boleta } = await supabase
    .from('boleta')
    .select('*')
    .eq('id_venta', ventaId)
    .maybeSingle();

  const { data: factura } = await supabase
    .from('factura')
    .select('*')
    .eq('id_venta', ventaId)
    .maybeSingle();

  const comprobante = venta.tipodocumento === '03' ? boleta : factura;

  const { data: emisor } = await supabase
    .from('emisor_config')
    .select('*')
    .order('feccre', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: pagos } = await supabase
    .from('pago_venta')
    .select('*')
    .eq('id_venta', ventaId);

  return {
    venta,
    pedido,
    cliente,
    cuenta,
    detalles: detalles || [],
    comprobante,
    emisor,
    pagos: pagos || []
  };
}

/** S5: solicita cierre con arqueo por denominaciones y niveles (T15a2). */
export async function solicitarCierreArqueo(args: {
  aperturaId: number;
  usuarioId: number;
  denominaciones: { valor: number; cantidad: number; tipo: 'BILLETE' | 'MONEDA' }[];
  observacion: string;
}): Promise<{
  sistema: number;
  declarado: number;
  diferencia: number;
  resultado: 'CUADRADA' | 'SOBRANTE' | 'FALTANTE';
  idIncidencia: number | null;
  requiereSupervisor: boolean;
}> {
  const { data, error } = await supabase.rpc('fn_solicitar_cierre_arqueo', {
    p_apertura: args.aperturaId,
    p_usuario: args.usuarioId,
    p_denominaciones: args.denominaciones,
    p_observacion: args.observacion,
  });
  if (error) {
    if (error.code === 'PGRST202') {
      throw new Error('MIGRACION_CAJA_ARQUEO_PENDIENTE');
    }
    throw new Error(`ARQUEO_FAIL: ${error.message}`);
  }
  const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | null;
  if (!row) throw new Error('ARQUEO_SIN_RESULTADO');
  return {
    sistema: Number(row['sistema'] ?? 0),
    declarado: Number(row['declarado'] ?? 0),
    diferencia: Number(row['diferencia'] ?? 0),
    resultado: (['CUADRADA', 'SOBRANTE', 'FALTANTE'].find(
      (x) => x === String(row['resultado'] ?? ''),
    ) ?? 'FALTANTE') as 'CUADRADA' | 'SOBRANTE' | 'FALTANTE',
    idIncidencia: row['id_incidencia'] == null ? null : Number(row['id_incidencia']),
    requiereSupervisor: row['requiere_supervisor'] === true,
  };
}

export interface IncidenciaCaja {
  id: number;
  aperturaId: number;
  cajaId: number;
  cajeroId: number;
  diferencia: number;
  nivel: 'MEDIA' | 'CRITICA';
  estado: 'PENDIENTE' | 'EN_REVISION' | 'JUSTIFICADA' | 'CERRADA';
  motivo: string;
  resueltaPor: number | null;
  fecha: string;
}

export async function listarIncidencias(pendientesSolo: boolean): Promise<IncidenciaCaja[]> {
  let query = supabase
    .from('incidencia_caja')
    .select('id, id_aperturacaja, id_caja, id_cajero, diferencia, nivel, estado, motivo, resuelta_por, feccre')
    .order('feccre', { ascending: false });
  if (pendientesSolo) {
    query = query.in('estado', ['PENDIENTE', 'EN_REVISION']);
  }
  const { data, error } = await query;
  if (error) throw new Error(`DB_LIST_FAIL: ${error.message}`);
  return ((data ?? []) as unknown as Record<string, unknown>[]).map((r) => ({
    id: Number(r['id']),
    aperturaId: Number(r['id_aperturacaja']),
    cajaId: Number(r['id_caja']),
    cajeroId: Number(r['id_cajero']),
    diferencia: Number(r['diferencia'] ?? 0),
    nivel: (String(r['nivel']) === 'CRITICA' ? 'CRITICA' : 'MEDIA') as 'MEDIA' | 'CRITICA',
    estado: String(r['estado']) as IncidenciaCaja['estado'],
    motivo: String(r['motivo'] ?? ''),
    resueltaPor: r['resuelta_por'] == null ? null : Number(r['resuelta_por']),
    fecha: new Date(String(r['feccre'])).toISOString(),
  }));
}

export async function resolverIncidencia(args: {
  id: number;
  estado: 'EN_REVISION' | 'JUSTIFICADA' | 'CERRADA';
  resueltaPor: number;
  comentario: string;
}): Promise<void> {
  const { error } = await supabase
    .from('incidencia_caja')
    .update({
      estado: args.estado,
      resuelta_por: args.resueltaPor,
      resuelta_en: new Date().toISOString(),
      comentario_resolucion: args.comentario,
      fecmod: new Date().toISOString(),
      usumod: 'SYSTEM',
    })
    .eq('id', args.id);
  if (error) throw new Error(`DB_UPDATE_FAIL: ${error.message}`);
}

/** S3: cobro de la cuenta individual de un participante por fn_cobrar_participante_atomic. */
export async function cobrarParticipanteAtomic(args: {
  pedidoId: number;
  clienteId: number;
  usuarioId: number;
  aperturaId: number;
  tipoDocumento: '03' | '01';
  pagos: { metodoPagoId: number; monto: number; montoRecibido: number | null; referencia: string; banco: string }[];
  empresaId: number | null;
  documento: string | null;
  nombreDoc: string | null;
}): Promise<{
  idCuenta: number;
  idVenta: number;
  serie: string;
  numero: string;
  total: number;
  vuelto: number;
  mesaLiquidada: boolean;
}> {
  const { data, error } = await supabase.rpc('fn_cobrar_participante_atomic', {
    p_pedido: args.pedidoId,
    p_cliente: args.clienteId,
    p_usuario: args.usuarioId,
    p_apertura: args.aperturaId,
    p_tipodoc: args.tipoDocumento,
    p_pagos: args.pagos,
    p_empresa_id: args.empresaId,
    p_documento: args.documento,
    p_nombre_doc: args.nombreDoc,
  });
  if (error) {
    if (error.code === 'PGRST202') {
      throw new Error('MIGRACION_CAJA_PAGOS_MIXTOS_PENDIENTE');
    }
    throw new Error(`COBRO_PARTICIPANTE_FAIL: ${error.message}`);
  }
  const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | null;
  if (!row) throw new Error('COBRO_SIN_RESULTADO');
  return {
    idCuenta: Number(row['id_cuenta']),
    idVenta: Number(row['id_venta']),
    serie: String(row['serie'] ?? ''),
    numero: String(row['numero'] ?? ''),
    total: Number(row['total'] ?? 0),
    vuelto: Number(row['vuelto'] ?? 0),
    mesaLiquidada: row['mesa_liquidada'] === true,
  };
}

export async function registrarMovimientoCaja(args: {
  aperturaId: number;
  usuarioId: number;
  conceptoId: number;
  metodoPagoId: number;
  monto: number;
  descripcion: string;
  referencia: string;
  banco: string;
}): Promise<number> {
  const { data, error } = await supabase.rpc('fn_registrar_movimiento_caja_atomic', {
    p_apertura: args.aperturaId,
    p_usuario: args.usuarioId,
    p_concepto: args.conceptoId,
    p_metodo: args.metodoPagoId,
    p_monto: args.monto,
    p_descripcion: args.descripcion,
    p_referencia: args.referencia,
    p_banco: args.banco,
  });
  if (error) throw new Error(error.message);
  return Number(data);
}

export interface MovimientoCajaHistorial {
  id: number;
  fecha: string;
  tipoMovimiento: string;
  concepto: string;
  metodoPago: string;
  monto: number;
  afectaEfectivo: boolean;
  descripcion: string | null;
  documento: string | null;
  referencia: string | null;
  usuario: string;
}

export async function listarMovimientosTurno(aperturaId: number): Promise<MovimientoCajaHistorial[]> {
  const { data, error } = await supabase
    .from('movimiento_caja')
    .select('id_movimientocaja, f_movimiento, monto, afecta_efectivo, descripcion, documento, numero_operacion, tipo_movimiento_caja(n_tipomovimiento), concepto_caja(n_concepto), metodo_pago(n_metodopago), usuario(logeo)')
    .eq('id_aperturacaja', aperturaId)
    .eq('estado', 'A')
    .order('f_movimiento', { ascending: false })
    .order('id_movimientocaja', { ascending: false });

  if (error) throw new Error(`DB_MOVIMIENTOS_TURNO_FAIL: ${error.message}`);

  return ((data ?? []) as unknown as Record<string, unknown>[]).map((row) => {
    const tipo = row['tipo_movimiento_caja'] as Record<string, unknown> | null;
    const concepto = row['concepto_caja'] as Record<string, unknown> | null;
    const metodo = row['metodo_pago'] as Record<string, unknown> | null;
    const usuario = row['usuario'] as Record<string, unknown> | null;
    return {
      id: Number(row['id_movimientocaja']),
      fecha: String(row['f_movimiento'] ?? ''),
      tipoMovimiento: String(tipo?.['n_tipomovimiento'] ?? '—'),
      concepto: String(concepto?.['n_concepto'] ?? '—'),
      metodoPago: String(metodo?.['n_metodopago'] ?? '—'),
      monto: Number(row['monto'] ?? 0),
      afectaEfectivo: String(row['afecta_efectivo'] ?? 'N') === 'S',
      descripcion: row['descripcion'] ? String(row['descripcion']) : null,
      documento: row['documento'] ? String(row['documento']) : null,
      referencia: row['numero_operacion'] ? String(row['numero_operacion']) : null,
      usuario: String(usuario?.['logeo'] ?? '—'),
    };
  });
}

export async function solicitarCierreCaja(args: {
  aperturaId: number;
  usuarioId: number;
  declarado: number;
  observacion: string;
}): Promise<CierreResultado> {
  const { data, error } = await supabase.rpc('fn_solicitar_cierre_caja', {
    p_apertura: args.aperturaId,
    p_usuario: args.usuarioId,
    p_declarado: args.declarado,
    p_observacion: args.observacion,
  });
  if (error) {
    throw new Error(error.message);
  }
  const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | null;
  if (!row) {
    throw new Error('CIERRE_SIN_RESULTADO');
  }
  const diferencia = Number(row['diferencia'] ?? 0);
  return {
    sistema: Number(row['sistema'] ?? 0),
    declarado: Number(row['declarado'] ?? 0),
    diferencia,
    resultado: diferencia === 0 ? 'CUADRADO' : diferencia > 0 ? 'SOBRANTE' : 'FALTANTE',
  };
}

export async function confirmarCierreCaja(args: {
  aperturaId: number;
  supervisorId: number;
}): Promise<CierreResultado> {
  const { data, error } = await supabase.rpc('fn_confirmar_cierre_caja', {
    p_apertura: args.aperturaId,
    p_supervisor: args.supervisorId,
  });
  if (error) {
    throw new Error(error.message);
  }
  const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | null;
  if (!row) {
    throw new Error('CIERRE_SIN_RESULTADO');
  }
  const diferencia = Number(row['diferencia'] ?? 0);
  return {
    sistema: Number(row['sistema'] ?? 0),
    declarado: Number(row['declarado'] ?? 0),
    diferencia,
    resultado: diferencia === 0 ? 'CUADRADO' : diferencia > 0 ? 'SOBRANTE' : 'FALTANTE',
  };
}

export async function listarCierresPendientes(): Promise<CierrePendiente[]> {
  const { data, error } = await supabase
    .from('apertura_caja')
    .select('id_aperturacaja, id_caja, id_usuario, f_solicitud_cierre, monto_sistema, monto_declarado, diferencia, observacion')
    .eq('situacion', 'P')
    .eq('estado', 'A')
    .order('f_solicitud_cierre', { ascending: true });
  if (error) {
    throw new Error(`DB_LIST_FAIL: ${error.message}`);
  }
  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  if (rows.length === 0) {
    return [];
  }

  const cajaIds = Array.from(new Set(rows.map((row) => Number(row['id_caja']))));
  const usuarioIds = Array.from(new Set(rows.map((row) => Number(row['id_usuario']))));
  const [{ data: cajas, error: cajasError }, usuarios] = await Promise.all([
    supabase.from('caja').select('id_caja, n_caja').in('id_caja', cajaIds),
    logeoUsuario(usuarioIds),
  ]);
  if (cajasError) {
    throw new Error(`DB_GET_FAIL: ${cajasError.message}`);
  }
  const cajaNombre = new Map(
    ((cajas ?? []) as unknown as Record<string, unknown>[]).map((row) => [
      Number(row['id_caja']),
      String(row['n_caja'] ?? ''),
    ]),
  );
  return rows.map((row) => ({
    id: Number(row['id_aperturacaja']),
    cajaId: Number(row['id_caja']),
    cajaNombre: cajaNombre.get(Number(row['id_caja'])) ?? `Caja ${row['id_caja']}`,
    cajero: usuarios.get(Number(row['id_usuario'])) ?? '',
    fechaSolicitud: row['f_solicitud_cierre']
      ? new Date(String(row['f_solicitud_cierre'])).toISOString()
      : '',
    montoSistema: Number(row['monto_sistema'] ?? 0),
    montoDeclarado: Number(row['monto_declarado'] ?? 0),
    diferencia: Number(row['diferencia'] ?? 0),
    observacion: row['observacion'] ? String(row['observacion']) : null,
  }));
}

/** Reporte Z de un turno (abierto o cerrado). */
export async function reporteZ(aperturaId: number): Promise<ReporteZ | null> {
  const { data, error } = await supabase
    .from('apertura_caja')
    .select('id_aperturacaja, id_caja, id_usuario, id_usuariocierre, numero_turno, f_apertura, f_cierre, monto_inicial, monto_sistema, total_ingresos, total_egresos, monto_declarado, diferencia, situacion, observacion')
    .eq('id_aperturacaja', aperturaId)
    .maybeSingle();
  if (error) {
    throw new Error(`DB_GET_FAIL: ${error.message}`);
  }
  if (!data) {
    return null;
  }
  const r = data as Record<string, unknown>;
  const cajaNombre = String((await listarCajas()).find((c) => c.id === Number(r['id_caja']))?.nombre ?? `Caja ${r['id_caja']}`);
  const usuarios = await logeoUsuario([Number(r['id_usuario']), Number(r['id_usuariocierre'] ?? 0)].filter((x) => x > 0));
  const diferencia = r['diferencia'] === null ? null : Number(r['diferencia']);
  const { movimientos } = await listarMovimientosDeApertura(aperturaId);
  return {
    turno: {
      id: Number(r['id_aperturacaja']),
      cajaId: Number(r['id_caja']),
      cajaNombre,
      cajero: usuarios.get(Number(r['id_usuario'])) ?? '',
      numeroTurno: String(r['numero_turno'] ?? ''),
      fApertura: new Date(String(r['f_apertura'])).toISOString(),
      montoInicial: Number(r['monto_inicial'] ?? 0),
      montoSistema: Number(r['monto_sistema'] ?? 0),
      totalIngresos: Number(r['total_ingresos'] ?? 0),
      totalEgresos: Number(r['total_egresos'] ?? 0),
      situacion: (r['situacion'] === 'C' ? 'C' : 'A') as 'A' | 'C',
    },
    resultado: diferencia === null ? null : (diferencia === 0 ? 'CUADRADO' : diferencia > 0 ? 'SOBRANTE' : 'FALTANTE'),
    montoDeclarado: r['monto_declarado'] === null ? 0 : Number(r['monto_declarado']),
    usuarioCierre: r['id_usuariocierre'] ? (usuarios.get(Number(r['id_usuariocierre'])) ?? null) : null,
    fCierre: r['f_cierre'] ? new Date(String(r['f_cierre'])).toISOString() : null,
    observacion: r['observacion'] ? String(r['observacion']) : null,
    movimientos,
  };
}

async function listarMovimientosDeApertura(aperturaId: number): Promise<{ movimientos: MovimientoCaja[] }> {
  const { data, error } = await supabase
    .from('movimiento_caja')
    .select('id_movimientocaja, f_movimiento, monto, afecta_efectivo, descripcion, numero_operacion, id_venta, id_usuario, tipo_movimiento_caja(n_tipomovimiento), concepto_caja(n_concepto), metodo_pago(n_metodopago)')
    .eq('id_aperturacaja', aperturaId)
    .eq('estado', 'A')
    .order('f_movimiento', { ascending: true });
  if (error) {
    throw new Error(`DB_LIST_FAIL: ${error.message}`);
  }
  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  const ids = [...new Set(rows.map((r) => Number(r['id_usuario'])))];
  const usuarios = await logeoUsuario(ids);
  return {
    movimientos: rows.map((r) => {
      const tm = r['tipo_movimiento_caja'] as Record<string, unknown> | null;
      const cc = r['concepto_caja'] as Record<string, unknown> | null;
      const mp = r['metodo_pago'] as Record<string, unknown> | null;
      return {
        id: Number(r['id_movimientocaja']),
        fecha: new Date(String(r['f_movimiento'])).toISOString(),
        tipoMovimiento: String(tm?.['n_tipomovimiento'] ?? ''),
        concepto: String(cc?.['n_concepto'] ?? ''),
        metodoPago: String(mp?.['n_metodopago'] ?? ''),
        monto: Number(r['monto'] ?? 0),
        afectaEfectivo: String(r['afecta_efectivo'] ?? 'N') === 'S',
        descripcion: r['descripcion'] ? String(r['descripcion']) : null,
        numeroOperacion: r['numero_operacion'] ? String(r['numero_operacion']) : null,
        idVenta: r['id_venta'] ? Number(r['id_venta']) : null,
        usuario: usuarios.get(Number(r['id_usuario'])) ?? '',
      };
    }),
  };
}

/* ------------------------ T15a5 · acta Z y reportes ------------------------ */

export interface ActaCierre {
  aperturaId: number;
  caja: string;
  numeroTurno: string | null;
  cajero: string;
  validador: string | null;
  fechaApertura: string | null;
  fechaCierre: string | null;
  saldoInicial: number;
  totalIngresos: number;
  totalEgresos: number;
  saldoTeorico: number;
  dineroContado: number;
  diferencia: number;
  resultado: 'CUADRADA' | 'SOBRANTE' | 'FALTANTE';
  situacion: 'A' | 'P' | 'C';
  observacion: string | null;
  conteo: { valor: number; tipo: string; cantidad: number }[];
  incidencia: {
    id: number;
    nivel: 'MEDIA' | 'CRITICA';
    estado: string;
    motivo: string;
    comentarioResolucion: string | null;
  } | null;
}

/** S5: datos completos del acta de cierre (Z) de un turno. */
export async function actaCierre(aperturaId: number): Promise<ActaCierre | null> {
  const { data, error } = await supabase
    .from('apertura_caja')
    .select('id_aperturacaja, id_usuario, id_usuariocierre, numero_turno, f_apertura, f_cierre, monto_inicial, total_ingresos, total_egresos, monto_sistema, monto_declarado, diferencia, situacion, observacion, caja(n_caja), usuario:usuario!fk_aperturacaja_usuario(id_usuario, logeo, empleado:empleado!fk_usuario_empleado(id_persona, persona:persona!fk_empleado_persona(nombre, ap_paterno, ap_materno)))')
    .eq('id_aperturacaja', aperturaId)
    .maybeSingle();
  if (error) throw new Error(`DB_GET_FAIL: ${error.message}`);
  const row = (data ?? null) as unknown as Record<string, unknown> | null;
  if (!row) return null;

  const [conteo, incidenciaRes, validador] = await Promise.all([
    supabase
      .from('arqueo_denominacion')
      .select('valor, tipo, cantidad')
      .eq('id_aperturacaja', apertureIdSafe(aperturaId))
      .order('valor', { ascending: false }),
    supabase
      .from('incidencia_caja')
      .select('id, nivel, estado, motivo, comentario_resolucion')
      .eq('id_aperturacaja', apertureIdSafe(aperturaId))
      .order('feccre', { ascending: false })
      .limit(1)
      .maybeSingle(),
    Number(row['id_usuariocierre'] ?? 0)
      ? logeoUsuarioMax([Number(row['id_usuariocierre'])])
      : Promise.resolve(new Map<number, string>()),
  ]);

  const conteoRows = ((conteo?.data ?? []) as unknown as Record<string, unknown>[]);
  const incidenciaRow = (incidenciaRes?.data ?? null) as unknown as Record<string, unknown> | null;
  const personal = (row['usuario'] ?? null) as Record<string, unknown> | null;
  const empleado = (personal?.['empleado'] ?? null) as Record<string, unknown> | null;
  const persona = (empleado?.['persona'] ?? null) as Record<string, unknown> | null;
  const diferencia = Number(row['diferencia'] ?? 0);
  const caja = (row['caja'] ?? null) as Record<string, unknown> | null;

  return {
    aperturaId,
    caja: String(caja?.['n_caja'] ?? ''),
    numeroTurno: row['numero_turno'] == null ? null : String(row['numero_turno']),
    cajero: nombrePersona(persona, Number(row['id_usuario'] ?? 0)),
    validador: validador.get(Number(row['id_usuariocierre'] ?? 0)) ?? null,
    fechaApertura: row['f_apertura'] == null ? null : new Date(String(row['f_apertura'])).toISOString(),
    fechaCierre: row['f_cierre'] == null ? null : new Date(String(row['f_cierre'])).toISOString(),
    saldoInicial: Number(row['monto_inicial'] ?? 0),
    totalIngresos: Number(row['total_ingresos'] ?? 0),
    totalEgresos: Number(row['total_egresos'] ?? 0),
    saldoTeorico: Number(row['monto_sistema'] ?? 0),
    dineroContado: Number(row['monto_declarado'] ?? 0),
    diferencia,
    resultado: diferencia === 0 ? 'CUADRADA' : diferencia > 0 ? 'SOBRANTE' : 'FALTANTE',
    situacion: (['A', 'P', 'C'].find((x) => x === String(row['situacion'] ?? '')) ?? 'A') as 'A' | 'P' | 'C',
    observacion: row['observacion'] == null ? null : String(row['observacion']),
    conteo: conteoRows.map((d) => ({
      valor: Number(d['valor'] ?? 0),
      tipo: String(d['tipo'] ?? 'BILLETE'),
      cantidad: Number(d['cantidad'] ?? 0),
    })),
    incidencia: incidenciaRow
      ? {
          id: Number(incidenciaRow['id'] ?? 0),
          nivel: (String(incidenciaRow['nivel']) === 'CRITICA' ? 'CRITICA' : 'MEDIA') as 'MEDIA' | 'CRITICA',
          estado: String(incidenciaRow['estado'] ?? ''),
          motivo: String(incidenciaRow['motivo'] ?? ''),
          comentarioResolucion: incidenciaRow['comentario_resolucion'] == null
            ? null
            : String(incidenciaRow['comentario_resolucion']),
        }
      : null,
  };
}

function apertureIdSafe(id: number): number {
  return id;
}

function nombrePersona(persona: Record<string, unknown> | null | undefined, fallbackId: number): string {
  if (!persona) return `Usuario ${fallbackId}`;
  const partes = [
    persona['nombre'],
    persona['ap_paterno'],
    persona['ap_materno'],
  ].filter((p) => typeof p === 'string' && p.length > 0);
  return partes.length ? partes.map((p) => String(p)).join(' ') : `Usuario ${fallbackId}`;
}

/** helper logeo: usa el mismo mapping de nombres de historialCaja. */
async function logeoUsuarioMax(ids: number[]): Promise<Map<number, string>> {
  if (ids.length === 0) return new Map();
  return logeoUsuario(ids.filter((x) => x > 0));
}

export interface DiferenciaReporteRow {
  aperturaId: number;
  caja: string;
  cajero: string;
  fechaCierre: string | null;
  saldoTeorico: number;
  dineroContado: number;
  diferencia: number;
  resultado: 'CUADRADA' | 'SOBRANTE' | 'FALTANTE';
  incidenciaEstado: string | null;
  incidenciaNivel: string | null;
}

/** S5: reporte de diferencias de turnos cerrados. */
export async function reporteDiferencias(): Promise<DiferenciaReporteRow[]> {
  const { data, error } = await supabase
    .from('apertura_caja')
    .select('id_aperturacaja, id_caja, id_usuario, f_cierre, monto_sistema, monto_declarado, diferencia, caja(n_caja), usuario:personal(persona(nombre, ap_paterno, ap_materno))')
    .eq('situacion', 'C')
    .neq('diferencia', 0)
    .order('f_cierre', { ascending: false })
    .limit(200);
  if (error) throw new Error(`DB_LIST_FAIL: ${error.message}`);
  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  if (rows.length === 0) return [];

  const { data: incs, error: errInc } = await supabase
    .from('incidencia_caja')
    .select('id_aperturacaja, nivel, estado')
    .in('id_aperturacaja', rows.map((r) => Number(r['id_aperturacaja'])));
  if (errInc) throw new Error(`DB_LIST_FAIL: ${errInc.message}`);
  const mapaInc = new Map<number, { nivel: string; estado: string }>();
  for (const i of (incs ?? []) as unknown as Record<string, unknown>[]) {
    mapaInc.set(Number(i['id_aperturacaja']), {
      nivel: String(i['nivel'] ?? ''),
      estado: String(i['estado'] ?? ''),
    });
  }
  return rows.map((r) => {
    const diferencia = Number(r['diferencia'] ?? 0);
    const inc = mapaInc.get(Number(r['id_aperturacaja']));
    const persona = (r['usuario'] ?? null) as Record<string, unknown> | null;
    const caja = (r['caja'] ?? null) as Record<string, unknown> | null;
    return {
      aperturaId: Number(r['id_aperturacaja']),
      caja: String(caja?.['n_caja'] ?? ''),
      cajero: nombrePersona((persona?.['persona'] ?? null) as Record<string, unknown> | null, Number(r['id_usuario'] ?? 0)),
      fechaCierre: r['f_cierre'] == null ? null : new Date(String(r['f_cierre'])).toISOString(),
      saldoTeorico: Number(r['monto_sistema'] ?? 0),
      dineroContado: Number(r['monto_declarado'] ?? 0),
      diferencia,
      resultado: diferencia === 0 ? 'CUADRADA' : diferencia > 0 ? 'SOBRANTE' : 'FALTANTE',
      incidenciaEstado: inc?.estado ?? null,
      incidenciaNivel: inc?.nivel ?? null,
    };
  });
}

export interface HistorialCajeroRow {
  cajeroId: number;
  cajero: string;
  arqueos: number;
  totalSobrantes: number;
  totalFaltantes: number;
  diferenciaAcumulada: number;
  incidencias: number;
}

/** S5: historial de arqueos por cajero. */
export async function historialCajero(): Promise<HistorialCajeroRow[]> {
  const { data, error } = await supabase
    .from('apertura_caja')
    .select('id_usuario, monto_inicial, total_ingresos, total_egresos, monto_sistema, monto_declarado, diferencia, personal(nombre, ap_paterno, ap_materno)')
    .eq('situacion', 'C')
    .limit(300);
  if (error) throw new Error('DB_LIST_FAIL: ' + error.message);
  const rows = (data ?? []) as unknown as Record<string, unknown>[];

  const porCajero = new Map<number, { arqueos: number; sobrantes: number; faltantes: number }>();
  for (const r of rows) {
    const cajeroId = Number(r['id_usuario'] ?? 0);
    const dif = Number(r['diferencia'] ?? 0);
    const prev = porCajero.get(cajeroId) ?? { arqueos: 0, sobrantes: 0, faltantes: 0 };
    prev.arqueos += 1;
    if (dif > 0) prev.sobrantes += dif;
    if (dif < 0) prev.faltantes += Math.abs(dif);
    porCajero.set(cajeroId, prev);
  }

  const { data: incs, error: errInc } = await supabase
    .from('incidencia_caja')
    .select('id_cajero')
    .in('id_cajero', Array.from(porCajero.keys()));
  if (errInc) throw new Error('DB_LIST_FAIL: ' + errInc.message);
  const incidPor = new Map<number, number>();
  for (const i of (incs ?? []) as unknown as Record<string, unknown>[]) {
    const k = Number(i['id_cajero'] ?? 0);
    incidPor.set(k, (incidPor.get(k) ?? 0) + 1);
  }

  const out: HistorialCajeroRow[] = [];
  for (const [cajeroId, agg] of porCajero) {
    const base = rows.find((r) => Number(r['id_usuario']) === cajeroId);
    const pers = (base?.['personal'] ?? null) as Record<string, unknown> | null;
    out.push({
      cajeroId,
      cajero: nombrePersona(pers, cajeroId),
      arqueos: agg.arqueos,
      totalSobrantes: agg.sobrantes,
      totalFaltantes: agg.faltantes,
      diferenciaAcumulada: agg.sobrantes - agg.faltantes,
      incidencias: incidPor.get(cajeroId) ?? 0,
    });
  }
  return out.sort((a, b) => b.arqueos - a.arqueos);
}
