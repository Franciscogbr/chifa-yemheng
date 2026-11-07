import { useCallback, useEffect, useMemo, useState } from 'react';
import { ErrorBox, Loading } from '../../../components/ui';
import { Ico } from '../../../components/Icon';
import { fmtPEN } from '../../../lib/format';
import { leerPermisos } from '../../auth/login/auth-service';
import { StaffFeedbackModal, type StaffFeedback } from '../staff-feedback-modal';
import { CajaArqueo } from './CajaArqueo';
import { CajaIncidencias } from './CajaIncidencias';
import { CajaActa } from './CajaActa';
import { ComprobanteBoleta } from './ComprobanteBoleta';
import { ComprobanteFactura } from './ComprobanteFactura';
import {
  aperturarCaja,
  confirmarCierreCaja,
  listarCierresPendientes,
  listarCajaMaestros,
  listarCajaPendientes,
  registrarCobro,
  registrarMovimientoCaja,
  solicitarCierreCaja,
  type CajaInfo,
  type CajaMaestros,
  type CierrePendiente,
  type ConceptoCajaInfo,
  type MetodoPagoInfo,
  type Ticket,
} from '../staff-service';

function mensajeCaja(codigo: string): string {
  const mensajes: Record<string, string> = {
    EFECTIVO_INSUFICIENTE: 'El efectivo recibido no cubre el importe asignado a efectivo.',
    REFERENCIA_REQUERIDA: 'Ingresa el número de operación para este método de pago.',
    PEDIDO_NO_POR_COBRAR: 'La cuenta todavía no fue solicitada por la mesa.',
    PEDIDO_FACTURADO: 'Este pedido ya fue cobrado.',
    NO_CAJA_ABIERTA: 'No hay un turno abierto para esta caja.',
    TURNO_NO_ABIERTO: 'El turno ya no está disponible para cierre.',
    CIERRE_NO_PENDIENTE: 'Este arqueo ya fue atendido.',
    SOLO_CAJERO_APERTURA: 'Solo quien aperturó el turno puede solicitar su cierre.',
    VALIDADOR_DEBE_SER_DISTINTO: 'El cierre debe ser aprobado por otra persona.',
    RUC_INVALIDO: 'El RUC asociado al cliente no es válido.',
    FACTURA_REQUIERE_EMPRESA: 'Selecciona un cliente asociado a una empresa con RUC.',
    MONTO_INVALIDO: 'Ingresa un monto válido.',
    APORTES_PENDIENTES: 'Asigna a cada participante pagos que cubran exactamente su consumo.',
    PAGOS_NO_CUBREN_TOTAL: 'La suma de los medios de pago debe cubrir exactamente la cuenta.',
    BANCO_REQUERIDO: 'Selecciona o ingresa el banco de la transferencia.',
    PAGADOR_REQUERIDO: 'Asigna cada pago al integrante que lo realiza.',
    APORTE_NO_COINCIDE_CON_CONSUMO: 'El total pagado por cada integrante debe coincidir con su consumo asignado.',
    PAGO_INCOMPLETO: 'Completa el importe, efectivo recibido, referencia o banco requerido en cada pago.',
    MIGRACION_CAJA_PAGOS_MIXTOS_PENDIENTE: 'Falta aplicar en Supabase la migración de pagos mixtos y reportes antes de cobrar.',
    MIGRACION_APERTURA_OBSERVACION_PENDIENTE: 'Falta aplicar la migración de observación de apertura en Supabase.'
  };
  if (mensajes[codigo]) return mensajes[codigo];
  if (codigo.startsWith('DB_') || /failed to fetch|networkerror|network_error/i.test(codigo)) {
    return 'No se pudo conectar con el servicio. Revisa la conexión e inténtalo nuevamente.';
  }
  return 'No se pudo completar la operación. Revisa los datos e inténtalo nuevamente.';
}

export function StaffCajaPage() {
  const [pendientes, setPendientes] = useState<Ticket[] | null>(null);
  const [maestros, setMaestros] = useState<CajaMaestros | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [seleccion, setSeleccion] = useState<Ticket | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<StaffFeedback | null>(null);
  const [cajaTurno, setCajaTurno] = useState<number>(0);
  const [montoInicial, setMontoInicial] = useState('');
  const [observacionApertura, setObservacionApertura] = useState('');
  const [aperturando, setAperturando] = useState(false);
  const [actaAbierta, setActaAbierta] = useState<number | null>(null);
  const [montoDeclarado, setMontoDeclarado] = useState('');
  const [observacionCierre, setObservacionCierre] = useState('');
  const [solicitandoCierre, setSolicitandoCierre] = useState(false);
  const [validandoCierre, setValidandoCierre] = useState<number | null>(null);
  const [comprobanteAbierto, setComprobanteAbierto] = useState<{ idVenta: number; tipoDocumento: string } | null>(null);
  const [cierres, setCierres] = useState<CierrePendiente[]>([]);
  const permisos = leerPermisos();
  const puedeCerrar = permisos.includes('CAJ_CERRAR');
  const puedeValidarCierre = permisos.includes('CAJ_VALIDAR_CIERRE');

  const cargar = useCallback(async () => {
    try {
      const [pend, mast, solicitudes] = await Promise.all([
        listarCajaPendientes(),
        listarCajaMaestros(),
        puedeValidarCierre ? listarCierresPendientes() : Promise.resolve([]),
      ]);
      setPendientes(pend.filter((p) => p.anulado === 'N' && p.facturado === 'N'));
      setMaestros(mast);
      setCierres(solicitudes);
      setCajaTurno(
        (prev) =>
          prev ||
          mast.cajas.find((caja) => caja.aperturada === 'S' && !caja.cierrePendiente)?.id ||
          mast.cajas[0]?.id ||
          0,
      );
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? mensajeCaja(e.message) : 'No se pudo cargar la caja. Intenta actualizar.');
    }
  }, [puedeValidarCierre]);

  useEffect(() => {
    void cargar();
    const timer = window.setInterval(() => void cargar(), 15000);
    return () => window.clearInterval(timer);
  }, [cargar]);

  const total = useMemo(
    () => (pendientes ?? []).reduce((acc, t) => acc + (t.total ?? 0), 0),
    [pendientes],
  );

  const cajaSel = maestros?.cajas.find((c) => c.id === cajaTurno) ?? null;

  const aperturar = useCallback(async () => {
    if (!cajaSel) return;
    setAperturando(true);
    try {
      const r = await aperturarCaja(cajaSel.id, Number(montoInicial || 0), observacionApertura);
      setMensaje(`Turno aperturado en ${cajaSel.nombre}. ${r.mensaje}`.trim());
      setMontoInicial('');
      setObservacionApertura('');
      await cargar();
    } catch (e) {
      setFeedback({
        kind: 'error',
        title: 'No se pudo aperturar la caja',
        description: e instanceof Error ? mensajeCaja(e.message) : 'Inténtalo nuevamente.',
      });
    } finally {
      setAperturando(false);
    }
  }, [cajaSel, montoInicial, observacionApertura, cargar]);

  const solicitarCierre = useCallback(async () => {
    if (!cajaSel?.turnoId || cajaSel.cierrePendiente || montoDeclarado === '') return;
    setSolicitandoCierre(true);
    setMensaje(null);
    try {
      const result = await solicitarCierreCaja({
        cajaId: cajaSel.id,
        montoDeclarado: Number(montoDeclarado),
        observacion: observacionCierre,
      });
      setMensaje(`Cierre enviado a validación. Diferencia: ${fmtPEN(result.diferencia)}.`);
      setMontoDeclarado('');
      setObservacionCierre('');
      await cargar();
    } catch (e) {
      setFeedback({
        kind: 'error',
        title: 'No se pudo solicitar el cierre',
        description: e instanceof Error ? mensajeCaja(e.message) : 'Inténtalo nuevamente.',
      });
    } finally {
      setSolicitandoCierre(false);
    }
  }, [cajaSel, montoDeclarado, observacionCierre, cargar]);

  const validarCierre = useCallback(async (cierre: CierrePendiente) => {
    setValidandoCierre(cierre.id);
    try {
      const result = await confirmarCierreCaja(cierre.id);
      setMensaje(`Cierre de ${cierre.cajaNombre} validado: ${result.resultado.toLowerCase()}.`);
      await cargar();
    } catch (e) {
      setFeedback({
        kind: 'error',
        title: 'No se pudo validar el cierre',
        description: e instanceof Error ? mensajeCaja(e.message) : 'Inténtalo nuevamente.',
      });
    } finally {
      setValidandoCierre(null);
    }
  }, [cargar]);

  return (
    <div className="y-shell" style={{ padding: '24px 16px 140px', maxWidth: 1240, margin: '0 auto' }}>
      <section className="y-flow-hero" aria-labelledby="caja-hero-title">
        <div className="y-flow-hero__content">
          <span className="y-flow-hero__eyebrow">Operación y control de efectivo</span>
          <h1 id="caja-hero-title" className="y-flow-hero__title">Caja, clara y bajo control.</h1>
          <p className="y-flow-hero__description">
            Administra tu turno, cobra las cuentas solicitadas y entrega el arqueo para validación.
          </p>
          <div className="y-flow-hero__actions">
            <button className="y-btn line" onClick={() => void cargar()}>Actualizar información</button>
          </div>
        </div>
      </section>
      {error && <ErrorBox msg={error} retry={cargar} />}
      {pendientes === null && !error && <Loading text="Cargando caja..." />}
      {pendientes && maestros && !error && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 16 }}>
            <div className="ys-kpi card">
              <div className="ic" style={{ background: 'var(--primary)' }}>
                <Ico n="chair" size={20} />
              </div>
              <b>{pendientes.length}</b>
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Pedidos pendientes</span>
            </div>
            <div className="ys-kpi card">
              <div className="ic" style={{ background: 'var(--primary)' }}>
                <Ico n="money" size={20} />
              </div>
              <b>{fmtPEN(total)}</b>
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Total por cobrar</span>
            </div>
            <div className="ys-kpi card">
              <div className="ic" style={{ background: 'var(--primary)' }}>
                <Ico n="store" size={20} />
              </div>
              <b>{maestros.cajas.length}</b>
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Cajas activas</span>
            </div>
          </div>
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <b>Turno de caja</b>
                <p style={{ margin: '2px 0 0', color: 'var(--text-muted)', fontSize: 12 }}>
                  Apertura el turno antes de registrar cobros.
                </p>
              </div>
              <select className="select" value={cajaTurno} onChange={(e) => setCajaTurno(Number(e.target.value))} style={{ maxWidth: 220 }}>
                {maestros.cajas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} · {c.aperturada === 'S' ? 'ABIERTA' : 'CERRADA'}
                  </option>
                ))}
              </select>
              {!cajaSel ? (
                <span className="caja-muted">No hay cajas activas configuradas.</span>
              ) : cajaSel.aperturada === 'N' ? (
                <>
                  <input
                    className="input"
                    inputMode="decimal"
                    min="0"
                    placeholder="Monto inicial S/"
                    value={montoInicial}
                    onChange={(e) => setMontoInicial(e.target.value)}
                    style={{ width: 140 }}
                    aria-label="Monto inicial de caja"
                  />
                  <input
                    className="input"
                    maxLength={200}
                    placeholder="Observación de apertura (opcional)"
                    value={observacionApertura}
                    onChange={(e) => setObservacionApertura(e.target.value)}
                    style={{ minWidth: 220, flex: '1 1 260px' }}
                    aria-label="Observación de apertura"
                  />
                  <button className="btn btn-gold" disabled={aperturando || !cajaSel || montoInicial === '' || !Number.isFinite(Number(montoInicial)) || Number(montoInicial) < 0} onClick={() => void aperturar()}>
                    Aperturar turno
                  </button>
                </>
              ) : cajaSel.cierrePendiente ? (
                <span className="ys-status" style={{ color: '#fbbf24', background: '#fbbf2422' }}>
                  <i /> Cierre pendiente de validación
                </span>
              ) : (
                <>
                  <span className="ys-status" style={{ color: '#22c55e', background: '#22c55e22' }}>
                    <i /> Turno abierto · sistema {fmtPEN(cajaSel?.montoSistema ?? 0)}
                  </span>
                  {!!cajaSel.netoPorMedio.length && (
                    <div style={{ display: 'grid', gap: 4, width: '100%', color: 'var(--text-muted)', fontSize: 12 }}>
                      <span>Saldo neto por medio (ingresos menos egresos del turno)</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {cajaSel.netoPorMedio.map((saldo) => (
                          <span key={saldo.medio}>{saldo.medio}: <b>{fmtPEN(saldo.total)}</b></span>
                        ))}
                      </div>
                    </div>
                  )}
                  {cajaSel?.turnoId && (
                    <CajaArqueo
                      cajaId={cajaSel.id}
                      cajaNombre={cajaSel.nombre}
                      saldoTeorico={cajaSel.montoSistema ?? cajaSel.montoBase}
                      onHecho={async (msg) => {
                        setMensaje(msg);
                        await cargar();
                      }}
                    />
                  )}
                  {puedeCerrar && cajaSel?.turnoId && (
                    <div className="caja-cierre-form">
                      <label>
                        Efectivo contado
                        <input
                          className="input"
                          inputMode="decimal"
                          min="0"
                          placeholder="0.00"
                          value={montoDeclarado}
                          onChange={(e) => setMontoDeclarado(e.target.value)}
                        />
                      </label>
                      <label>
                        Observación (opcional)
                        <input
                          className="input"
                          maxLength={200}
                          placeholder="Diferencia, incidencia o comentario"
                          value={observacionCierre}
                          onChange={(e) => setObservacionCierre(e.target.value)}
                        />
                      </label>
                      <button
                        className="btn btn-ghost"
                        disabled={solicitandoCierre || montoDeclarado === '' || !Number.isFinite(Number(montoDeclarado)) || Number(montoDeclarado) < 0}
                        onClick={() => void solicitarCierre()}
                      >
                        {solicitandoCierre ? 'Enviando…' : 'Solicitar cierre'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          {puedeValidarCierre && (
            <section className="caja-validaciones card" aria-labelledby="cierres-pendientes-title">
              <div className="caja-section-heading">
                <div>
                  <span className="y-flow-hero__eyebrow">Supervisión</span>
                  <h2 id="cierres-pendientes-title">Arqueos por validar</h2>
                </div>
                <span className="caja-count">{cierres.length}</span>
              </div>
              {cierres.length === 0 ? (
                <p className="caja-muted">No hay cierres pendientes de aprobación.</p>
              ) : cierres.map((cierre) => (
                <article className="caja-cierre-pendiente" key={cierre.id}>
                  <div>
                    <b>{cierre.cajaNombre}</b>
                    <span>{cierre.cajero} · {new Date(cierre.fechaSolicitud).toLocaleString('es-PE')}</span>
                    {cierre.observacion && <small>{cierre.observacion}</small>}
                  </div>
                  <div className="caja-arqueo-cifras">
                    <span>Sistema <b>{fmtPEN(cierre.montoSistema)}</b></span>
                    <span>Declarado <b>{fmtPEN(cierre.montoDeclarado)}</b></span>
                    <span>Diferencia <b>{fmtPEN(cierre.diferencia)}</b></span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <button
                      className="btn btn-gold"
                      disabled={validandoCierre !== null}
                      onClick={() => void validarCierre(cierre)}
                    >
                      {validandoCierre === cierre.id ? 'Validando…' : 'Validar y cerrar'}
                    </button>
                    <button className="btn btn-ghost" onClick={() => setActaAbierta(cierre.id)}>
                      Ver acta Z
                    </button>
                  </div>
                </article>
              ))}
            </section>
          )}
          {actaAbierta != null && (
            <section className="y-panel y-panel-card caja-validaciones" aria-label="Acta de cierre">
              <div className="caja-section-heading">
                <div>
                  <span className="y-flow-hero__eyebrow">Supervisión</span>
                  <h2 style={{ margin: '2px 0 0', fontFamily: 'var(--font-d)', fontSize: 22 }}>Acta Z · apertura {actaAbierta}</h2>
                </div>
                <button className="y-btn line y-btn sm" onClick={() => setActaAbierta(null)}>Cerrar</button>
              </div>
              <CajaActa aperturaId={actaAbierta} />
            </section>
          )}
          {puedeValidarCierre && (
            <CajaIncidencias
              puedeValidar={true}
              onChanged={async (msg) => {
                setMensaje(msg);
                await cargar();
              }}
            />
          )}
          {cajaSel?.aperturada === 'S' && !cajaSel.cierrePendiente && permisos.includes('CAJ_EGRESO') && (
            <CajaMovimientoForm
              cajaId={cajaSel.id}
              conceptos={maestros.conceptos}
              metodos={maestros.metodosPago}
              onRegistrado={async () => {
                setMensaje('Movimiento de caja registrado.');
                await cargar();
              }}
            />
          )}
          {pendientes.length === 0 ? (
            <div className="card" style={{ padding: 32, textAlign: 'center' }}>
              <Ico n="ok" size={40} />
              <h3 style={{ margin: '8px 0 0' }}>Todo en orden</h3>
              <p style={{ color: 'var(--text-muted)' }}>No hay pedidos pendientes de cobro.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {pendientes.map((t) => (
                <div key={t.id} className="ys-ticket card" style={{ ['--tone' as string]: '#17a2b8' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <b>{t.numero}</b>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      {t.mesaId ? `Mesa ${t.mesaId}` : 'Delivery'} · {t.detalles.length} ítems · S/ {(t.total ?? 0).toFixed(2)}
                    </span>
                    <span style={{ marginLeft: 'auto' }}>
                      <button
                        className="btn btn-gold"
                        disabled={!cajaSel || cajaSel.aperturada !== 'S' || cajaSel.cierrePendiente}
                        onClick={() => setSeleccion(t)}
                      >
                        Cobrar
                      </button>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {seleccion && maestros && (
        <CobroModal
          ticket={seleccion}
          cajas={maestros.cajas.filter((c) => c.aperturada === 'S' && !c.cierrePendiente)}
          metodos={maestros.metodosPago}
          onClose={() => {
            setSeleccion(null);
            setMensaje(null);
          }}
          onCobrar={async (payload) => {
            const res = await registrarCobro(payload);
            setMensaje(`Comprobante ${res.serie}-${res.numero} emitido`);
            setSeleccion(null);
            setComprobanteAbierto({ idVenta: res.idVenta, tipoDocumento: payload.tipoDocumento });
            await cargar();
          }}
        />
      )}
      {comprobanteAbierto && (
        <section className="y-panel y-panel-card caja-validaciones" aria-label="Comprobante">
          <div className="caja-section-heading">
            <div>
              <span className="y-flow-hero__eyebrow">Supervisión</span>
              <h2 style={{ margin: '2px 0 0', fontFamily: 'var(--font-d)', fontSize: 22 }}>Comprobante · venta {comprobanteAbierto.idVenta}</h2>
            </div>
            <button className="y-btn line y-btn sm" onClick={() => setComprobanteAbierto(null)}>Cerrar</button>
          </div>
          {comprobanteAbierto.tipoDocumento === '01' ? (
            <ComprobanteFactura ventaId={comprobanteAbierto.idVenta} onClose={() => setComprobanteAbierto(null)} />
          ) : (
            <ComprobanteBoleta ventaId={comprobanteAbierto.idVenta} onClose={() => setComprobanteAbierto(null)} />
          )}
        </section>
      )}
      {mensaje && !seleccion && (
        <p className="caja-feedback" role="status">{mensaje}</p>
      )}
      {feedback && (
        <StaffFeedbackModal feedback={feedback} onClose={() => setFeedback(null)} />
      )}
    </div>
  );
}

let nextPagoDraftKey = 1;

function CobroModal({
  ticket,
  cajas,
  metodos,
  onClose,
  onCobrar,
}: {
  ticket: Ticket;
  cajas: CajaInfo[];
  metodos: MetodoPagoInfo[];
  onClose: () => void;
  onCobrar: (payload: {
    pedidoId: number;
    cajaId: number;
    tipoDocumento: string;
    clienteId: number | null;
    pagos: {
      metodoPagoId: number;
      monto: number;
      montoRecibido: number | null;
      referencia: string;
      banco: string;
      clienteId: number | null;
    }[];
    aportes?: { clienteId: number; monto: number; referencia: string }[];
  }) => Promise<void>;
}) {
  type Draft = {
    key: number;
    metodoPagoId: number;
    monto: string;
    recibido: string;
    referencia: string;
    banco: string;
    clienteId: number | null;
  };
  const crearLinea = (clienteId: number | null, monto: number): Draft => ({
    key: nextPagoDraftKey++,
    metodoPagoId: metodos[0]?.id ?? 0,
    monto: monto.toFixed(2),
    recibido: monto.toFixed(2),
    referencia: '',
    banco: '',
    clienteId,
  });
  const [cajaId, setCaja] = useState<number>(cajas[0]?.id ?? 0);
  const [tipoDocumento, setTipoDocumento] = useState('03');
  const [clienteTexto, setClienteTexto] = useState('');
  const [pagos, setPagos] = useState<Draft[]>(() => {
    const participantes = (ticket.participantes ?? []).filter((p) => p.consumoEstimado > 0);
    if (ticket.modoPagoMesa === 'POR_CONSUMO' && participantes.length > 0) {
      return participantes.map((p) => crearLinea(p.clienteId, p.consumoEstimado));
    }
    return [crearLinea(null, ticket.total)];
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cajaCerrada = (cajas.find((c) => c.id === cajaId)?.aperturada ?? 'N') === 'N';
  const participantes = (ticket.participantes ?? []).filter((p) => p.consumoEstimado > 0);
  const pagoPorConsumo = ticket.modoPagoMesa === 'POR_CONSUMO';
  const cents = (value: string | number) => Math.round(Number(value) * 100);
  const totalPagos = pagos.reduce((sum, pago) => sum + (Number.isFinite(Number(pago.monto)) ? cents(pago.monto) : 0), 0);
  const pagosCubrenTotal = totalPagos === cents(ticket.total);
  const faltanAportes = pagoPorConsumo && (
    participantes.length === 0 ||
    participantes.some((participante) => pagos
      .filter((pago) => pago.clienteId === participante.clienteId)
      .reduce((sum, pago) => sum + (Number.isFinite(Number(pago.monto)) ? cents(pago.monto) : 0), 0)
      !== cents(participante.consumoEstimado))
  );
  const lineaInvalida = pagos.some((pago) => {
    const metodo = metodos.find((item) => item.id === pago.metodoPagoId);
    const monto = Number(pago.monto);
    if (!metodo || !Number.isFinite(monto) || monto <= 0) return true;
    if (metodo.afectaEfectivo && (!Number.isFinite(Number(pago.recibido)) || cents(pago.recibido) < cents(pago.monto))) return true;
    if (metodo.requiereReferencia && !pago.referencia.trim()) return true;
    return metodo.nombre.toUpperCase().includes('TRANSF') && !pago.banco.trim();
  });

  const actualizarPago = (key: number, patch: Partial<Draft>) => {
    setPagos((actuales) => actuales.map((pago) => pago.key === key ? { ...pago, ...patch } : pago));
  };

  const enviar = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      if (clienteTexto && !/^\d+$/.test(clienteTexto)) {
        throw new Error('ID_CLIENTE_INVALIDO');
      }
      if (!pagosCubrenTotal) throw new Error('PAGOS_NO_CUBREN_TOTAL');
      if (lineaInvalida) throw new Error('PAGO_INCOMPLETO');
      if (faltanAportes) throw new Error('APORTES_PENDIENTES');
      await onCobrar({
        pedidoId: ticket.id,
        cajaId,
        tipoDocumento,
        clienteId: clienteTexto ? Number(clienteTexto) : null,
        pagos: pagos.map((pago) => {
          const metodo = metodos.find((item) => item.id === pago.metodoPagoId);
          return {
            metodoPagoId: pago.metodoPagoId,
            monto: Number(pago.monto),
            montoRecibido: metodo?.afectaEfectivo ? Number(pago.recibido) : null,
            referencia: pago.referencia.trim(),
            banco: pago.banco.trim(),
            clienteId: pago.clienteId,
          };
        }),
        ...(pagoPorConsumo
          ? {
              aportes: participantes.map((participante) => ({
                clienteId: participante.clienteId,
                monto: Number((pagos
                  .filter((pago) => pago.clienteId === participante.clienteId)
                  .reduce((sum, pago) => sum + Number(pago.monto || 0), 0)).toFixed(2)),
                referencia: pagos.find((pago) => pago.clienteId === participante.clienteId)?.referencia ?? '',
              })),
            }
          : {}),
      });
    } catch (e) {
      setError(e instanceof Error ? mensajeCaja(e.message) : 'No se pudo registrar el cobro');
    } finally {
      setBusy(false);
    }
  }, [onCobrar, ticket, cajaId, tipoDocumento, clienteTexto, pagos, metodos, pagosCubrenTotal, lineaInvalida, pagoPorConsumo, participantes, faltanAportes]);

  useEffect(() => {
    const cerrarConEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) onClose();
    };
    window.addEventListener('keydown', cerrarConEscape);
    return () => window.removeEventListener('keydown', cerrarConEscape);
  }, [busy, onClose]);

  return (
    <div
      className="ys-veil"
      style={{ position: 'fixed', inset: 0, zIndex: 70, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,.35)' }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ width: 'min(520px, 94vw)', padding: 22, maxHeight: '88vh', overflow: 'auto' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cobro-modal-title"
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <h3 id="cobro-modal-title" style={{ margin: 0 }}>Cobrar {ticket.numero}</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 12 }}>
              {ticket.mesaId ? `Mesa ${ticket.mesaId}` : 'Delivery'} · {fmtPEN(ticket.total)}
            </p>
          </div>
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
        </div>

        <div style={{ marginTop: 16, display: 'grid', gap: 10 }}>
          <section style={{ display: 'grid', gap: 8, padding: 12, border: '1px solid var(--border)', borderRadius: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <strong>Detalle del pedido</strong>
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                {ticket.detalles.length} {ticket.detalles.length === 1 ? 'ítem' : 'ítems'}
              </span>
            </div>
            <div style={{ display: 'grid', gap: 6, maxHeight: 180, overflowY: 'auto' }}>
              {ticket.detalles.map((detalle) => (
                <div key={detalle.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
                  <span>{detalle.cantidad} × {detalle.producto}</span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {detalle.estadoPreparacion === 'P' ? 'Pendiente' :
                      detalle.estadoPreparacion === 'E' ? 'En preparación' :
                        detalle.estadoPreparacion === 'S' ? 'Servido' : 'Anulado'}
                  </span>
                </div>
              ))}
              {ticket.detalles.length === 0 && (
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Este pedido no tiene ítems.</span>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
              <span>Total a cobrar</span>
              <strong>{fmtPEN(ticket.total)}</strong>
            </div>
          </section>

          <label style={{ color: 'var(--text-muted)', fontSize: 12 }}>Caja</label>
          <select className="select" value={cajaId} onChange={(e) => setCaja(Number(e.target.value))}>
            {cajas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>

          {pagoPorConsumo && (
            <section style={{ display: 'grid', gap: 8, padding: 12, border: '1px solid var(--border)', borderRadius: 10 }}>
              <strong>Pagos por consumo de cada integrante</strong>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 12 }}>
                Asigna cada medio a quien paga. Los pagos de cada persona deben cubrir exactamente su consumo.
              </p>
              {participantes.map((participante) => {
                const asignado = pagos.filter((pago) => pago.clienteId === participante.clienteId)
                  .reduce((sum, pago) => sum + (Number.isFinite(Number(pago.monto)) ? cents(pago.monto) : 0), 0);
                return <div key={participante.clienteId} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13 }}>
                  <span>{participante.nombre}{participante.esOrganizador ? ' · Organizador' : ''}</span>
                  <span>Consumo {fmtPEN(participante.consumoEstimado)} · Asignado {fmtPEN(asignado / 100)}</span>
                </div>;
              })}
            </section>
          )}

          <section style={{ display: 'grid', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <strong>Medios de pago</strong>
              <button
                type="button"
                className="btn btn-ghost"
                disabled={pagos.length >= 20}
                onClick={() => {
                  const restante = Math.max(0, (cents(ticket.total) - totalPagos) / 100);
                  const siguiente = participantes.find((participante) => {
                    const asignado = pagos
                      .filter((pago) => pago.clienteId === participante.clienteId)
                      .reduce((sum, pago) => sum + (Number.isFinite(Number(pago.monto)) ? cents(pago.monto) : 0), 0);
                    return asignado < cents(participante.consumoEstimado);
                  });
                  const asignado = siguiente
                    ? pagos.filter((pago) => pago.clienteId === siguiente.clienteId)
                      .reduce((sum, pago) => sum + (Number.isFinite(Number(pago.monto)) ? cents(pago.monto) : 0), 0)
                    : 0;
                  const montoSiguiente = pagoPorConsumo && siguiente
                    ? Math.min(restante, Math.max(0, cents(siguiente.consumoEstimado) - asignado) / 100)
                    : restante;
                  setPagos((actuales) => [
                    ...actuales,
                    crearLinea(pagoPorConsumo ? siguiente?.clienteId ?? null : null, montoSiguiente),
                  ]);
                }}
              >
                Agregar medio
              </button>
            </div>
            {pagos.map((pago) => {
              const metodo = metodos.find((item) => item.id === pago.metodoPagoId);
              const efectivo = metodo?.afectaEfectivo ?? false;
              const transferencia = metodo?.nombre.toUpperCase().includes('TRANSF') ?? false;
              return <article key={pago.key} style={{ display: 'grid', gap: 8, padding: 12, border: '1px solid var(--border)', borderRadius: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 1fr) minmax(100px, .7fr) auto', gap: 8 }}>
                  <select
                    className="select"
                    value={pago.metodoPagoId}
                    onChange={(event) => actualizarPago(pago.key, { metodoPagoId: Number(event.target.value) })}
                  >
                    {metodos.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                  </select>
                  <input
                    className="input"
                    aria-label="Importe de este medio de pago"
                    inputMode="decimal"
                    value={pago.monto}
                    onChange={(event) => actualizarPago(pago.key, { monto: event.target.value })}
                  />
                  <button
                    type="button"
                    className="btn btn-ghost"
                    aria-label="Eliminar medio de pago"
                    disabled={pagos.length === 1}
                    onClick={() => setPagos((actuales) => actuales.filter((item) => item.key !== pago.key))}
                  >
                    Quitar
                  </button>
                </div>
                {pagoPorConsumo && (
                  <select
                    className="select"
                    aria-label="Integrante que realiza el pago"
                    value={pago.clienteId ?? ''}
                    onChange={(event) => actualizarPago(pago.key, { clienteId: event.target.value ? Number(event.target.value) : null })}
                  >
                    <option value="">Selecciona quién paga</option>
                    {participantes.map((person) => <option key={person.clienteId} value={person.clienteId}>{person.nombre}</option>)}
                  </select>
                )}
                {efectivo && (
                  <label style={{ display: 'grid', gap: 4, color: 'var(--text-muted)', fontSize: 12 }}>
                    Efectivo recibido
                    <input
                      className="input"
                      inputMode="decimal"
                      value={pago.recibido}
                      onChange={(event) => actualizarPago(pago.key, { recibido: event.target.value })}
                    />
                  </label>
                )}
                {!efectivo && (
                  <label style={{ display: 'grid', gap: 4, color: 'var(--text-muted)', fontSize: 12 }}>
                    Número de operación{metodo?.requiereReferencia ? '' : ' (opcional)'}
                    <input
                      className="input"
                      maxLength={50}
                      value={pago.referencia}
                      onChange={(event) => actualizarPago(pago.key, { referencia: event.target.value })}
                    />
                  </label>
                )}
                {transferencia && (
                  <label style={{ display: 'grid', gap: 4, color: 'var(--text-muted)', fontSize: 12 }}>
                    Banco
                    <input
                      className="input"
                      maxLength={60}
                      value={pago.banco}
                      onChange={(event) => actualizarPago(pago.key, { banco: event.target.value })}
                    />
                  </label>
                )}
              </article>;
            })}
            <div className="caja-vuelto">
              <span>Cuenta <b>{fmtPEN(ticket.total)}</b></span>
              <span>Distribuido <b>{fmtPEN(totalPagos / 100)}</b></span>
              <span>Pendiente <b>{fmtPEN((cents(ticket.total) - totalPagos) / 100)}</b></span>
            </div>
          </section>

          <label style={{ color: 'var(--text-muted)', fontSize: 12 }}>Comprobante</label>
          <select className="select" value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)}>
            <option value="03">Boleta</option>
            <option value="01">Factura (cliente empresa)</option>
          </select>

          {tipoDocumento === '01' && (
            <>
              <label style={{ color: 'var(--text-muted)', fontSize: 12 }}>ID cliente (empresa)</label>
              <input
                className="input"
                placeholder="Ej: 3"
                value={clienteTexto}
                onChange={(e) => setClienteTexto(e.target.value)}
              />
            </>
          )}

        </div>

        {error && (
          <p style={{ marginTop: 10, color: '#fca5a5' }}>{error}</p>
        )}
        {cajaCerrada && !error && (
          <p style={{ marginTop: 10, color: '#fcd34d' }}>
            La caja seleccionada está cerrada: apertura el turno primero.
          </p>
        )}

        <button
          className="btn btn-gold"
          style={{ marginTop: 14 }}
          disabled={busy || cajaCerrada || lineaInvalida || !pagosCubrenTotal || faltanAportes || pagos.length === 0}
          onClick={() => void enviar()}
        >
          {busy ? 'Procesando cobro…' : 'Confirmar cobro'}
        </button>
        <p style={{ marginTop: 8, color: 'var(--text-muted)', fontSize: 12 }}>
          Se emitirá una venta y un comprobante. Los medios se registran individualmente y solo el efectivo aumenta el arqueo físico.
        </p>
      </div>
    </div>
  );
}

function CajaMovimientoForm({
  cajaId,
  conceptos,
  metodos,
  onRegistrado,
}: {
  cajaId: number;
  conceptos: ConceptoCajaInfo[];
  metodos: MetodoPagoInfo[];
  onRegistrado: () => Promise<void>;
}) {
  const [conceptoId, setConceptoId] = useState(conceptos[0]?.id ?? 0);
  const [metodoPagoId, setMetodoPagoId] = useState(metodos[0]?.id ?? 0);
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [referencia, setReferencia] = useState('');
  const [banco, setBanco] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [feedback, setFeedback] = useState<StaffFeedback | null>(null);
  const metodo = metodos.find((item) => item.id === metodoPagoId);
  const requiereBanco = metodo?.nombre.toUpperCase().includes('TRANSF') ?? false;

  const registrar = async () => {
    setEnviando(true);
    setFeedback(null);
    try {
      await registrarMovimientoCaja({
        cajaId,
        conceptoId,
        metodoPagoId,
        monto: Number(monto),
        descripcion,
        referencia,
        banco,
      });
      setMonto('');
      setDescripcion('');
      setReferencia('');
      setBanco('');
      await onRegistrado();
    } catch (cause) {
      setFeedback({
        kind: 'error',
        title: 'No se pudo registrar el movimiento',
        description: cause instanceof Error ? mensajeCaja(cause.message) : 'Inténtalo nuevamente.',
      });
    } finally {
      setEnviando(false);
    }
  };

  if (conceptos.length === 0 || metodos.length === 0) return null;

  return (
    <section className="card" style={{ padding: 16, marginBottom: 16 }} aria-labelledby="caja-movimientos-title">
      <h2 id="caja-movimientos-title" style={{ margin: '0 0 10px' }}>Registrar movimiento</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 8 }}>
        <select className="select" value={conceptoId} onChange={(event) => setConceptoId(Number(event.target.value))} aria-label="Concepto">
          {conceptos.map((item) => <option key={item.id} value={item.id}>{item.tipoMovimiento} · {item.nombre}</option>)}
        </select>
        <select className="select" value={metodoPagoId} onChange={(event) => setMetodoPagoId(Number(event.target.value))} aria-label="Medio del movimiento">
          {metodos.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}
        </select>
        <input className="input" type="number" min="0.01" step="0.01" placeholder="Monto" value={monto} onChange={(event) => setMonto(event.target.value)} />
        <input className="input" maxLength={200} placeholder="Descripción" value={descripcion} onChange={(event) => setDescripcion(event.target.value)} />
        {metodo?.requiereReferencia && (
          <input className="input" maxLength={30} placeholder="Operación / referencia" value={referencia} onChange={(event) => setReferencia(event.target.value)} />
        )}
        {requiereBanco && (
          <input className="input" maxLength={60} placeholder="Banco" value={banco} onChange={(event) => setBanco(event.target.value)} />
        )}
        <button
          type="button"
          className="btn btn-gold"
          disabled={enviando || !Number.isFinite(Number(monto)) || Number(monto) <= 0 || descripcion.trim().length < 3 || (metodo?.requiereReferencia && !referencia.trim()) || (requiereBanco && !banco.trim())}
          onClick={() => void registrar()}
        >
          {enviando ? 'Registrando…' : 'Registrar'}
        </button>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 0 }}>
        Ingresos, egresos, devoluciones y ajustes quedan asociados al turno activo. Los medios digitales no alteran el efectivo esperado.
      </p>
      {feedback && (
        <StaffFeedbackModal feedback={feedback} onClose={() => setFeedback(null)} />
      )}
    </section>
  );
}
