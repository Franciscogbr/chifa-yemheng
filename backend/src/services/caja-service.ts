import type { CajaResponse } from '../repositories/caja-repository.js';
import type { Pedido } from '../models/pedido.js';
import {
  abrirCaja,
  cobrarAtomicMixto,
  rechazarCierreCaja,
  solicitarCierreArqueo,
  listarIncidencias,
  resolverIncidencia, type IncidenciaCaja,
  cobrarParticipanteAtomic,
  confirmarCierreCaja,
  listarCierresPendientes,
  listarCajas,
  listarMetodosPago,
  listarConceptosCaja,
  registrarMovimientoCaja,
  listarMovimientosTurno,
  solicitarCierreCaja,
  turnoAbiertoDeCaja,
  actaCierre, type ActaCierre,
  reporteDiferencias, type DiferenciaReporteRow,
  historialCajero, type HistorialCajeroRow,
  historialCaja, type HistorialTurno,
  getComprobante, type ComprobanteData,
  type CierrePendiente,
} from '../repositories/caja-repository.js';
export type { ComprobanteData };
import { listarPedidosPorCobrar, obtenerPedido } from '../repositories/pedidos-repository.js';

export async function maestrosCajaService(): Promise<CajaResponse> {
  const [cajas, metodosPago, conceptos] = await Promise.all([listarCajas(), listarMetodosPago(), listarConceptosCaja()]);
  return {
    cajas,
    metodosPago,
    conceptos: conceptos.filter((concepto) => !esConceptoCobro(concepto.nombre)),
  };
}

function esConceptoCobro(nombre: string): boolean {
  const clave = nombre.trim().toUpperCase();
  return clave === 'VENTA AL CONTADO' || clave.startsWith('COBRO CON TARJETA') || clave.startsWith('COBRO BILLETERA');
}

export async function pendientesCajaService(): Promise<Pedido[]> {
  return listarPedidosPorCobrar();
}

export async function abrirCajaService(
  cajaId: number,
  usuarioId: number,
  montoInicial: number,
  observacion = '',
): Promise<{ id: number; mensaje: string }> {
  const numeroTurno = new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date());
  return abrirCaja({ cajaId, usuarioId, montoInicial, numeroTurno, observacion });
}

export async function cobrarService(args: {
  pedidoId: number;
  usuarioId: number;
  cajaId: number;
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
  aportes?: { clienteId: number; monto: number; referencia: string }[];
}): Promise<{ idVenta: number; serie: string; numero: string; total: number; vuelto: number }> {
  const apertura = await turnoAbiertoDeCaja(args.cajaId);
  if (!apertura) {
    throw new Error('NO_CAJA_ABIERTA');
  }
  const pedido = await obtenerPedido(args.pedidoId);
  if (!pedido) {
    throw new Error('PEDIDO_NOT_FOUND');
  }
  if (pedido.modoPagoMesa === 'POR_CONSUMO' && !args.aportes) {
    throw new Error('APORTES_REQUERIDOS');
  }
  if (pedido.modoPagoMesa === 'CUENTA_UNICA' && args.aportes) {
    throw new Error('APORTES_NO_PERMITIDOS');
  }
  const cents = (amount: number) => Math.round(amount * 100);
  const paymentTotal = args.pagos.reduce((sum, payment) => sum + cents(payment.monto), 0);
  if (args.pagos.length === 0 || paymentTotal <= 0) throw new Error('PAGOS_INVALIDOS');

  const metodos = await listarMetodosPago();
  for (const payment of args.pagos) {
    const method = metodos.find((item) => item.id === payment.metodoPagoId);
    if (!method) throw new Error('METODO_PAGO_INVALIDO');
    if (method.requiereReferencia && !payment.referencia.trim()) throw new Error('REFERENCIA_REQUERIDA');
    if (method.nombre.toUpperCase().includes('TRANSF') && !payment.banco.trim()) throw new Error('BANCO_REQUERIDO');
    if (method.afectaEfectivo && cents(payment.montoRecibido ?? payment.monto) < cents(payment.monto)) {
      throw new Error('EFECTIVO_INSUFICIENTE');
    }
  }
  if (args.aportes) {
    const byPayer = new Map<number, number>();
    for (const payment of args.pagos) {
      if (!payment.clienteId) throw new Error('PAGADOR_REQUERIDO');
      byPayer.set(payment.clienteId, (byPayer.get(payment.clienteId) ?? 0) + cents(payment.monto));
    }
    const shares = new Map(args.aportes.map((share) => [share.clienteId, cents(share.monto)]));
    if (
      byPayer.size !== shares.size
      || [...shares].some(([clientId, amount]) => byPayer.get(clientId) !== amount)
      || paymentTotal !== [...shares.values()].reduce((sum, amount) => sum + amount, 0)
    ) {
      throw new Error('APORTE_NO_COINCIDE_CON_CONSUMO');
    }
  } else if (args.pagos.some((payment) => payment.clienteId !== null)) {
    throw new Error('PAGADORES_NO_PERMITIDOS');
  }

  const result = await cobrarAtomicMixto({
    pedidoId: args.pedidoId,
    usuarioId: args.usuarioId,
    aperturaId: apertura.id,
    tipoDocumento: args.tipoDocumento,
    clienteId: args.clienteId,
    empresa: args.empresa,
    pagos: args.pagos,
    aportes: args.aportes,
  });
  const change = args.pagos.reduce((sum, payment) => {
    const method = metodos.find((item) => item.id === payment.metodoPagoId);
    if (!method?.afectaEfectivo) return sum;
    return sum + Math.max(0, cents(payment.montoRecibido ?? payment.monto) - cents(payment.monto));
  }, 0) / 100;
  return { ...result, vuelto: change };
}

/** S5: solicita cierre con arqueo (denominaciones + niveles). */
export async function arqueoCierreService(args: {
  cajaId: number;
  usuarioId: number;
  denominaciones: { valor: number; cantidad: number; tipo: 'BILLETE' | 'MONEDA' }[];
  observacion: string;
}): Promise<{
  aperturaId: number;
  sistema: number;
  declarado: number;
  diferencia: number;
  resultado: 'CUADRADA' | 'SOBRANTE' | 'FALTANTE';
  idIncidencia: number | null;
  requiereSupervisor: boolean;
}> {
  const turno = await turnoAbiertoDeCaja(args.cajaId);
  if (!turno) throw new Error('TURNO_NO_ABIERTO');
  const result = await solicitarCierreArqueo({
    aperturaId: turno.id,
    usuarioId: args.usuarioId,
    denominaciones: args.denominaciones,
    observacion: args.observacion,
  });
  return { aperturaId: turno.id, ...result };
}

export async function incidenciasService(pendientesSolo: boolean): Promise<IncidenciaCaja[]> {
  return listarIncidencias(pendientesSolo);
}

/* ------------------------- T15a5: acta Z y reportes ------------------------- */

export async function actaCierreService(aperturaId: number): Promise<ActaCierre | null> {
  return actaCierre(aperturaId);
}

export async function reporteDiferenciasService(): Promise<DiferenciaReporteRow[]> {
  return reporteDiferencias();
}

export async function historialCajeroService(): Promise<HistorialCajeroRow[]> {
  return historialCajero();
}

/** S5: el supervisor rechaza el arqueo para que el cajero re-cuenta. */
export async function rechazarCierreService(args: {
  aperturaId: number;
  supervisorId: number;
}): Promise<void> {
  await rechazarCierreCaja({ aperturaId: args.aperturaId, supervisorId: args.supervisorId });
}

/** S5: resuelve una incidencia; solo un autorizador distinto. */
export async function resolverIncidenciaService(args: {
  incidenciaId: number;
  estado: 'EN_REVISION' | 'JUSTIFICADA' | 'CERRADA';
  supervisorId: number;
  comentario: string;
}): Promise<void> {
  if (args.estado !== 'EN_REVISION' && !args.comentario.trim()) {
    throw new Error('COMENTARIO_REQUERIDO');
  }
  await resolverIncidencia({
    id: args.incidenciaId,
    estado: args.estado,
    resueltaPor: args.supervisorId,
    comentario: args.comentario,
  });
}

/** S3: cobra la cuenta individual de un participante de mesa compartida. */
export async function cobrarParticipanteService(args: {
  pedidoId: number;
  clienteId: number;
  usuarioId: number;
  cajaId: number;
  tipoDocumento: '03' | '01';
  participanteDocumento?: string;
  participanteNombre?: string;
  empresaId?: number;
  pagos: {
    metodoPagoId: number;
    monto: number;
    montoRecibido: number | null;
    referencia: string;
    banco: string;
  }[];
}): Promise<{
  idCuenta: number;
  idVenta: number;
  serie: string;
  numero: string;
  total: number;
  vuelto: number;
  mesaLiquidada: boolean;
}> {
  const apertura = await turnoAbiertoDeCaja(args.cajaId);
  if (!apertura) {
    throw new Error('NO_CAJA_ABIERTA');
  }
  return cobrarParticipanteAtomic({
    pedidoId: args.pedidoId,
    clienteId: args.clienteId,
    usuarioId: args.usuarioId,
    aperturaId: apertura.id,
    tipoDocumento: args.tipoDocumento,
    pagos: args.pagos,
    empresaId: args.empresaId ?? null,
    documento: args.participanteDocumento ?? null,
    nombreDoc: args.participanteNombre ?? null,
  });
}

export async function getComprobanteService(ventaId: number): Promise<ComprobanteData> {
  return getComprobante(ventaId);
}

export async function registrarMovimientoCajaService(args: {
  cajaId: number;
  usuarioId: number;
  conceptoId: number;
  metodoPagoId: number;
  monto: number;
  descripcion: string;
  referencia: string;
  banco: string;
}): Promise<{ movimientoId: number }> {
  const turno = await turnoAbiertoDeCaja(args.cajaId);
  if (!turno) throw new Error('NO_CAJA_ABIERTA');
  const [conceptos, metodos] = await Promise.all([listarConceptosCaja(), listarMetodosPago()]);
  const concepto = conceptos.find((item) => item.id === args.conceptoId && !esConceptoCobro(item.nombre));
  const metodo = metodos.find((item) => item.id === args.metodoPagoId);
  if (!concepto || !metodo) throw new Error('MOVIMIENTO_INVALIDO');
  if (metodo.requiereReferencia && !args.referencia.trim()) throw new Error('REFERENCIA_REQUERIDA');
  if (metodo.nombre.toUpperCase().includes('TRANSF') && !args.banco.trim()) throw new Error('BANCO_REQUERIDO');
  const movimientoId = await registrarMovimientoCaja({
    ...args,
    aperturaId: turno.id,
  });
  return { movimientoId };
}

export async function listarMovimientosTurnoService(aperturaId: number) {
  return listarMovimientosTurno(aperturaId);
}

export async function cierresPendientesService(): Promise<CierrePendiente[]> {
  return listarCierresPendientes();
}

export async function historialCajaService(limite = 20): Promise<HistorialTurno[]> {
  return historialCaja(limite);
}

export async function solicitarCierreCajaService(args: {
  cajaId: number;
  usuarioId: number;
  declarado: number;
  observacion: string;
}): Promise<{ aperturaId: number; sistema: number; declarado: number; diferencia: number; resultado: string }> {
  const turno = await turnoAbiertoDeCaja(args.cajaId);
  if (!turno) {
    throw new Error('TURNO_NO_ABIERTO');
  }
  const result = await solicitarCierreCaja({
    aperturaId: turno.id,
    usuarioId: args.usuarioId,
    declarado: args.declarado,
    observacion: args.observacion,
  });
  return { aperturaId: turno.id, ...result };
}

export async function confirmarCierreCajaService(
  aperturaId: number,
  supervisorId: number,
): Promise<{ sistema: number; declarado: number; diferencia: number; resultado: string }> {
  return confirmarCierreCaja({ aperturaId, supervisorId });
}
