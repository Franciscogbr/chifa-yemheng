import type { Request, Response } from 'express';
import {
  arqueoCajaSchema,
  confirmarCierreCajaSchema,
  cierreCajaSchema,
  cobroCajaSchema,
  resolverIncidenciaSchema,
  cobroParticipanteSchema,
  movimientoCajaSchema,
  turnoCajaSchema,
} from '../schemas/caja.js';
import {
  abrirCajaService,
  cierresPendientesService,
  cobrarService,
  cobrarParticipanteService,
  arqueoCierreService,
  actaCierreService,
  reporteDiferenciasService,
  historialCajeroService,
  incidenciasService,
  rechazarCierreService,
  resolverIncidenciaService,
  getComprobanteService,
  confirmarCierreCajaService,
  maestrosCajaService,
  pendientesCajaService,
  solicitarCierreCajaService,
  registrarMovimientoCajaService,
} from '../services/caja-service.js';
import type { AuthenticatedRequest } from '../middlewares/auth-guard.js';

function sesion(req: Request): { id: number } {
  const user = (req as AuthenticatedRequest).user;
  return { id: user.sub };
}

const CODIGOS_409 = new Set([
  'PEDIDO_FACTURADO',
  'PEDIDO_ANULADO',
  'PEDIDO_NO_POR_COBRAR',
  'NO_CAJA_ABIERTA',
  'FACTURA_REQUIERE_EMPRESA',
  'CAJA_YA_ABIERTA',
  'TURNO_NO_ABIERTO',
  'CIERRE_NO_PENDIENTE',
  'SOLO_CAJERO_APERTURA',
  'VALIDADOR_DEBE_SER_DISTINTO',
  'PEDIDOS_POR_COBRAR',
  'MODO_NO_INDIVIDUAL',
  'PEDIDO_NO_COBRABLE',
  'SALDO_SIN_CUBRIR',
  'SALDO_CERO',
  'NO_PARTICIPANTE',
]);
const CODIGOS_422 = new Set([
  'MONTO_INVALIDO',
  'EFECTIVO_INSUFICIENTE',
  'REFERENCIA_REQUERIDA',
  'RUC_INVALIDO',
  'METODO_PAGO_INVALIDO',
  'TIPO_DOCUMENTO_INVALIDO',
  'TOTAL_CERO',
  'APORTES_REQUERIDOS',
  'APORTES_INVALIDOS',
  'APORTES_DUPLICADOS',
  'APORTE_NO_COINCIDE_CON_CONSUMO',
  'APORTES_NO_CUBREN_TOTAL',
  'APORTES_NO_PERMITIDOS',
  'PAGOS_INVALIDOS',
  'PAGADOR_REQUERIDO',
  'PAGADORES_NO_PERMITIDOS',
  'APORTE_NO_COINCIDE_CON_CONSUMO',
  'BANCO_REQUERIDO',
  'MOVIMIENTO_INVALIDO',
  'PAGOS_NO_CUBREN_TOTAL',
  'MONTO_RECIBIDO_NO_APLICA',
  'DESCRIPCION_REQUERIDA',
  'EMPRESA_REQUERIDA',
  'OBSERVACION_REQUERIDA',
  'COMENTARIO_REQUERIDO',
  'TURNO_NO_ABIERTO',
]);

function errorCaja(res: Response, err: unknown): void {
  const msg = err instanceof Error ? err.message : String(err);
  const base = msg.includes(': ') ? msg.slice(msg.indexOf(': ') + 2) : msg;
  if (base === 'MIGRACION_CAJA_PAGOS_MIXTOS_PENDIENTE') {
    res.status(503).json({ error: base });
    return;
  }
  if (CODIGOS_409.has(base)) {
    res.status(409).json({ error: base });
    return;
  }
  if (CODIGOS_422.has(base)) {
    res.status(422).json({ error: base });
    return;
  }
  if (base === 'PEDIDO_NOT_FOUND') {
    res.status(404).json({ error: base });
    return;
  }
  if (base === 'CAJA_NO_EXISTE') {
    res.status(404).json({ error: base });
    return;
  }
  if (msg.startsWith('DB_')) {
    res.status(500).json({ error: base.startsWith('DB_') ? base.slice(0, base.indexOf(':')) : 'DB_FAIL', detalle: msg });
    return;
  }
  res.status(500).json({ error: 'INTERNAL_ERROR', detalle: msg });
}

export async function getCajaMaestros(_req: Request, res: Response): Promise<void> {
  res.json(await maestrosCajaService());
}

export async function getCajaPendientes(_req: Request, res: Response): Promise<void> {
  res.json(await pendientesCajaService());
}

export async function getCierresPendientes(_req: Request, res: Response): Promise<void> {
  try {
    res.json(await cierresPendientesService());
  } catch (err) {
    errorCaja(res, err);
  }
}

export async function postCajaTurno(req: Request, res: Response): Promise<void> {
  const parsed = turnoCajaSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  const s = sesion(req);
  try {
    res.status(201).json(await abrirCajaService(parsed.data.cajaId, s.id, parsed.data.montoInicial, parsed.data.observacion));
  } catch (err) {
    errorCaja(res, err);
  }
}

export async function postCajaCierre(req: Request, res: Response): Promise<void> {
  const parsed = cierreCajaSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  const s = sesion(req);
  try {
    res.json(
      await solicitarCierreCajaService({
        cajaId: parsed.data.cajaId,
        usuarioId: s.id,
        declarado: parsed.data.montoDeclarado,
        observacion: parsed.data.observacion,
      }),
    );
  } catch (err) {
    errorCaja(res, err);
  }
}

export async function postCajaConfirmarCierre(req: Request, res: Response): Promise<void> {
  const parsed = confirmarCierreCajaSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  const s = sesion(req);
  try {
    res.json(await confirmarCierreCajaService(parsed.data.aperturaId, s.id));
  } catch (err) {
    errorCaja(res, err);
  }
}

export async function postCajaCobro(req: Request, res: Response): Promise<void> {
  const parsed = cobroCajaSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  const s = sesion(req);
  try {
    const input = parsed.data;
    res.json(
      await cobrarService({
        pedidoId: input.pedidoId,
        usuarioId: s.id,
        cajaId: input.cajaId,
        tipoDocumento: input.tipoDocumento,
        clienteId: input.clienteId,
        pagos: input.pagos,
        aportes: input.aportes,
      }),
    );
  } catch (err) {
    errorCaja(res, err);
  }
}

/** S3: cobro de la cuenta individual de un participante de mesa compartida. */
export async function postCajaCobroParticipante(req: Request, res: Response): Promise<void> {
  const parsed = cobroParticipanteSchema.safeParse(req.body);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const faltantes = [...(flat.formErrors ?? []), ...Object.values(flat.fieldErrors ?? {}).flat()];
    if (faltantes.includes('EMPRESA_REQUERIDA_FACTURA') || faltantes.includes('DNI_REQUERIDO_BOLETA')) {
      res.status(400).json({ error: 'EMPRESA_REQUERIDA' });
      return;
    }
    res.status(400).json({ error: 'VALIDATION_ERROR', details: flat });
    return;
  }
  const s = sesion(req);
  try {
    const input = parsed.data;
    res.json(
      await cobrarParticipanteService({
        pedidoId: input.pedidoId,
        clienteId: input.clienteId,
        usuarioId: s.id,
        cajaId: input.cajaId,
        tipoDocumento: input.tipoDocumento,
        participanteDocumento: input.participanteDocumento,
        participanteNombre: input.participanteNombre,
        empresaId: input.empresa?.id,
        pagos: input.pagos,
      }),
    );
  } catch (err) {
    errorCaja(res, err);
  }
}

/** S5: arqueo por denominaciones + niveles al solicitar el cierre. */
export async function postCajaArqueo(req: Request, res: Response): Promise<void> {
  const parsed = arqueoCajaSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  const s = sesion(req);
  try {
    res.json(
      await arqueoCierreService({
        cajaId: parsed.data.cajaId,
        usuarioId: s.id,
        denominaciones: parsed.data.denominaciones,
        observacion: parsed.data.observacion,
      }),
    );
  } catch (err) {
    errorCaja(res, err);
  }
}

export async function getCajaIncidencias(req: Request, res: Response): Promise<void> {
  const soloPendientes = req.query['pendientes'] !== 'false';
  try {
    res.json({ data: await incidenciasService(soloPendientes) });
  } catch (err) {
    errorCaja(res, err);
  }
}

/** S5: un autorizado distinto resuelve la incidencia del cajero. */
export async function patchCajaIncidencia(req: Request, res: Response): Promise<void> {
  const id = Number(req.params['id']);
  const parsed = resolverIncidenciaSchema.safeParse(req.body);
  if (!Number.isInteger(id) || id <= 0 || !parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.success ? undefined : parsed.error.flatten() });
    return;
  }
  const s = sesion(req);
  try {
    await resolverIncidenciaService({
      incidenciaId: id,
      estado: parsed.data.estado,
      supervisorId: s.id,
      comentario: parsed.data.comentario,
    });
    res.json({ ok: true });
  } catch (err) {
    errorCaja(res, err);
  }
}

/** S5: rechazo del arqueo; devuelta el turno al cajero con situacion A. */
export async function postCajaRechazarCierre(req: Request, res: Response): Promise<void> {
  const parsed = confirmarCierreCajaSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  const s = sesion(req);
  try {
    await rechazarCierreService({ aperturaId: parsed.data.aperturaId, supervisorId: s.id });
    res.json({ ok: true });
  } catch (err) {
    errorCaja(res, err);
  }
}

/* --------------------- T17: comprobante (boleta/factura) --------------------- */

export async function getCajaComprobante(req: Request, res: Response): Promise<void> {
  const ventaId = Number(req.params['id']);
  if (!Number.isInteger(ventaId) || ventaId <= 0) {
    res.status(400).json({ error: 'VALIDATION_ERROR' });
    return;
  }
  try {
    const comprobante = await getComprobanteService(ventaId);
    res.json(comprobante);
  } catch (err) {
    errorCaja(res, err);
  }
}

/* --------------------- T15a5: acta Z + reportes --------------------- */

export async function getCajaActa(req: Request, res: Response): Promise<void> {
  const id = Number(req.params['id']);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'VALIDATION_ERROR' });
    return;
  }
  try {
    const acta = await actaCierreService(id);
    if (!acta) {
      res.status(404).json({ error: 'TURNO_NO_ABIERTO' });
      return;
    }
    res.json(acta);
  } catch (err) {
    errorCaja(res, err);
  }
}

export async function getCajaReporteDiferencias(_req: Request, res: Response): Promise<void> {
  try {
    res.json({ data: await reporteDiferenciasService() });
  } catch (err) {
    errorCaja(res, err);
  }
}

export async function getCajaHistorialCajero(_req: Request, res: Response): Promise<void> {
  try {
    res.json({ data: await historialCajeroService() });
  } catch (err) {
    errorCaja(res, err);
  }
}

export async function postCajaMovimiento(req: Request, res: Response): Promise<void> {
  const parsed = movimientoCajaSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  const s = sesion(req);
  try {
    res.status(201).json(await registrarMovimientoCajaService({ ...parsed.data, usuarioId: s.id }));
  } catch (err) {
    errorCaja(res, err);
  }
}
