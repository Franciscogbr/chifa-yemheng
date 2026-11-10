import { useCallback, useEffect, useMemo, useState } from 'react';
import { ErrorBox, Loading } from '../../../components/ui';
import { Ico } from '../../../components/Icon';
import { fmtPEN } from '../../../lib/format';
import { useToast } from '../../../shared/ui/use-toast';
import { leerPermisos } from '../../auth/login/auth-service';
import { StaffFeedbackModal, type StaffFeedback } from '../staff-feedback-modal';
import { CajaArqueo } from './CajaArqueo';
import { CajaIncidencias } from './CajaIncidencias';
import { CajaActa } from './CajaActa';
import { ComprobanteBoleta } from './ComprobanteBoleta';
import { ComprobanteFactura } from './ComprobanteFactura';
import { ComprobanteTicket } from './ComprobanteTicket';


import {
  aperturarCaja,
  confirmarCierreCaja,
  listarCierresPendientes,
  listarCajaMaestros,
  listarCajaPendientes,
  registrarCobro,
  registrarMovimientoCaja,
  solicitarCierreCaja,
  historialCajaService,
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
    REFERENCIA_REQUERIDA: 'Ingresa el nÃºmero de operaciÃ³n para este mÃ©todo de pago.',
    PEDIDO_NO_POR_COBRAR: 'La cuenta todavÃ­a no fue solicitada por la mesa.',
    PEDIDO_FACTURADO: 'Este pedido ya fue cobrado.',
    NO_CAJA_ABIERTA: 'No hay un turno abierto para esta caja.',
    TURNO_NO_ABIERTO: 'El turno ya no estÃ¡ disponible para cierre.',
    CIERRE_NO_PENDIENTE: 'Este arqueo ya fue atendido.',
    SOLO_CAJERO_APERTURA: 'Solo quien aperturÃ³ el turno puede solicitar su cierre.',
    VALIDADOR_DEBE_SER_DISTINTO: 'El cierre debe ser aprobado por otra persona.',
    RUC_INVALIDO: 'El RUC asociado al cliente no es vÃ¡lido.',
    FACTURA_REQUIERE_EMPRESA: 'Selecciona un cliente asociado a una empresa con RUC.',
    MONTO_INVALIDO: 'Ingresa un monto vÃ¡lido.',
    APORTES_PENDIENTES: 'Asigna a cada participante pagos que cubran exactamente su consumo.',
    PAGOS_NO_CUBREN_TOTAL: 'La suma de los medios de pago debe cubrir exactamente la cuenta.',
    BANCO_REQUERIDO: 'Selecciona o ingresa el banco de la transferencia.',
    PAGADOR_REQUERIDO: 'Asigna cada pago al integrante que lo realiza.',
    APORTE_NO_COINCIDE_CON_CONSUMO: 'El total pagado por cada integrante debe coincidir con su consumo asignado.',
    PAGO_INCOMPLETO: 'Completa el importe, efectivo recibido, referencia o banco requerido en cada pago.',
    MIGRACION_CAJA_PAGOS_MIXTOS_PENDIENTE: 'Falta aplicar en Supabase la migraciÃ³n de pagos mixtos y reportes antes de cobrar.',
    MIGRACION_APERTURA_OBSERVACION_PENDIENTE: 'Falta aplicar la migraciÃ³n de observaciÃ³n de apertura en Supabase.'
  };
  if (mensajes[codigo]) return mensajes[codigo];
  if (codigo.startsWith('DB_') || /failed to fetch|networkerror|network_error/i.test(codigo)) {
    return 'No se pudo conectar con el servicio. Revisa la conexiÃ³n e intÃ©ntalo nuevamente.';
  }
  return 'No se pudo completar la operaciÃ³n. Revisa los datos e intÃ©ntalo nuevamente.';
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
  const [solicitandoCierre, setSolicitandoCierre] = useState(false);
  const [validandoCierre, setValidandoCierre] = useState<number | null>(null);
  const [comprobanteAbierto, setComprobanteAbierto] = useState<{ idVenta: number; tipoDocumento: string } | null>(null);
  const [ticketAbierto, setTicketAbierto] = useState<boolean>(false);
  const [cierres, setCierres] = useState<CierrePendiente[]>([]);
  const [cierresCerrados, setCierresCerrados] = useState<CierrePendiente[]>([]);
  const { toast } = useToast();
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
      setCierresCerrados(await historialCajaService());
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
      toast({ title: 'Caja abierta', description: `Turno aperturado en ${cajaSel.nombre}`, variant: 'success' });
      setMontoInicial('');
      setObservacionApertura('');
      await cargar();
    } catch (e) {
      setFeedback({
        kind: 'error',
        title: 'No se pudo aperturar la caja',
        description: e instanceof Error ? mensajeCaja(e.message) : 'IntÃ©ntalo nuevamente.',
      });
    } finally {
      setAperturando(false);
    }
  }, [cajaSel, montoInicial, observacionApertura, cargar]);

  const solicitarCierre = useCallback(async () => {
    if (!cajaSel?.turnoId || cajaSel.cierrePendiente) return;
    setSolicitandoCierre(true);
    setMensaje(null);
    try {
      const result = await solicitarCierreCaja({
        cajaId: cajaSel.id,
        montoDeclarado: null,
        observacion: '',
      });
      setMensaje(`Cierre enviado a validaciÃ³n. Diferencia: ${fmtPEN(result.diferencia)}.`);
      toast({ title: 'Cierre solicitado', description: 'El cierre ha sido enviado a validaciÃ³n.', variant: 'success' });
      await cargar();
    } catch (e) {
      setFeedback({
        kind: 'error',
        title: 'No se pudo solicitar el cierre',
        description: e instanceof Error ? mensajeCaja(e.message) : 'IntÃ©ntalo nuevamente.',
      });
    } finally {
      setSolicitandoCierre(false);
    }
  }, [cajaSel, cargar]);

  const validarCierre = useCallback(async (cierre: CierrePendiente) => {
    setValidandoCierre(cierre.id);
    try {
      const result = await confirmarCierreCaja(cierre.id);
      setMensaje(`Cierre de ${cierre.cajaNombre} validado: ${result.resultado.toLowerCase()}.`);
      toast({ title: 'Cierre validado', description: `Cierre de ${cierre.cajaNombre} validado: ${result.resultado.toLowerCase()}.`, variant: 'success' });
      await cargar();
    } catch (e) {
      setFeedback({
        kind: 'error',
        title: 'No se pudo validar el cierre',
        description: e instanceof Error ? mensajeCaja(e.message) : 'IntÃ©ntalo nuevamente.',
      });
    } finally {
      setValidandoCierre(null);
    }
  }, [cargar]);

  return (
    <div className="y-shell" style={{ padding: '24px 16px 140px', maxWidth: 1240, margin: '0 auto' }}>
      <section className="y-flow-hero" aria-labelledby="caja-hero-title">
        <div className="y-flow-hero__content">
          <span className="y-flow-hero__eyebrow">OperaciÃ³n y control de efectivo</span>
          <h1 id="caja-hero-title" className="y-flow-hero__title">Caja, clara y bajo control.</h1>
          <p className="y-flow-hero__description">
            Administra tu turno, cobra las cuentas solicitadas y entrega el arqueo para validaciÃ³n.
          </p>
          <div className="y-flow-hero__actions">
            <button className="y-btn line" onClick={() => void cargar()}>Actualizar informaciÃ³n</button>
          </div>
        </div>
      </section>
      {error && <ErrorBox msg={error} retry={cargar} />}
      {pendientes === null && !error && <Loading text="Cargando caja..." />}
      {pendientes && maestros && !error && (
        <>
          <section className="y-section" aria-label="Resumen de caja">
            <div className="y-section-header">
              <span className="y-section-eyebrow">Resumen</span>
              <h2 className="y-section-title">Indicadores del turno</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
              <div className="ys-kpi card y-kpi-card" style={{ border: '1px solid var(--border)', background: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Ico n="chair" size={18} />
                  </div>
                  <div>
                    <b style={{ fontSize: 20, display: 'block' }}>{pendientes.length}</b>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Pedidos pendientes</span>
                  </div>
                </div>
              </div>
              <div className="ys-kpi card y-kpi-card" style={{ border: '1px solid var(--border)', background: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Ico n="money" size={18} />
                  </div>
                  <div>
                    <b style={{ fontSize: 20, display: 'block' }}>{fmtPEN(total)}</b>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Total por cobrar</span>
                  </div>
                </div>
              </div>
              <div className="ys-kpi card y-kpi-card" style={{ border: '1px solid var(--border)', background: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Ico n="store" size={18} />
                  </div>
                  <div>
                    <b style={{ fontSize: 20, display: 'block' }}>{maestros.cajas.length}</b>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Cajas activas</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="y-section" aria-label="Turno de caja">
            <div className="y-section-header">
              <span className="y-section-eyebrow">Turno</span>
              <h2 className="y-section-title">Turno de caja</h2>
            </div>
            <div className="card" style={{ padding: 20, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-muted)' }}>Seleccionar caja</label>
                  <select className="select" value={cajaTurno} onChange={(e) => setCajaTurno(Number(e.target.value))} style={{ width: '100%', maxWidth: 320 }}>
                    {maestros.cajas.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} Â· {c.aperturada === 'S' ? 'ABIERTA' : 'CERRADA'}
                      </option>
                    ))}
                  </select>
                </div>
                {!cajaSel ? (
                  <span className="caja-muted" style={{ paddingTop: 26 }}>No hay cajas activas configuradas.</span>
                ) : cajaSel.aperturada === 'N' ? (
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', paddingTop: 8 }}>
                    <input
                      className="input"
                      inputMode="decimal"
                      min="0"
                      placeholder="Monto inicial S/"
                      value={montoInicial}
                      onChange={(e) => setMontoInicial(e.target.value)}
                      style={{ width: 160 }}
                      aria-label="Monto inicial de caja"
                    />
                    <input
                      className="input"
                      maxLength={200}
                      placeholder="ObservaciÃ³n de apertura (opcional)"
                      value={observacionApertura}
                      onChange={(e) => setObservacionApertura(e.target.value)}
                      style={{ minWidth: 260, flex: '1' }}
                      aria-label="ObservaciÃ³n de apertura"
                    />
                    <button className="btn btn-gold" disabled={aperturando || !cajaSel || montoInicial === '' || !Number.isFinite(Number(montoInicial)) || Number(montoInicial) < 0} onClick={() => void aperturar()} style={{ height: 44 }}>
                      Aperturar turno
                    </button>
                  </div>
                ) : cajaSel.cierrePendiente ? (
                  <span className="ys-status" style={{ color: '#fbbf24', background: '#fbbf2422', padding: '6px 12px', borderRadius: 6, marginTop: 4 }}>
                    <i /> Cierre pendiente de validaciÃ³n
                  </span>
                ) : (
                  <div style={{ paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <span className="ys-status" style={{ color: '#22c55e', background: '#22c55e22', padding: '6px 12px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <i style={{ fontSize: 12 }} /> Turno abierto Â· sistema {fmtPEN(cajaSel?.montoSistema ?? 0)}
                    </span>
                    {!!cajaSel.netoPorMedio.length && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Saldo neto por medio (ingresos menos egresos del turno)</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                          {cajaSel.netoPorMedio.map((saldo) => (
                            <span key={saldo.medio} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', background: '#f8f9fa', borderRadius: 6, fontSize: 12, border: '1px solid var(--border)' }}>
                              {saldo.medio}: <b>{fmtPEN(saldo.total)}</b>
                            </span>
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
                      <button
                        className="btn btn-primary"
                        disabled={solicitandoCierre}
                        onClick={() => void solicitarCierre()}
                        style={{ marginTop: 8, padding: '10px 20px', fontWeight: 600 }}
                      >
                        {solicitandoCierre ? 'Enviandoâ€¦' : 'Solicitar cierre'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
          {puedeValidarCierre && (
            <section className="y-section" aria-label="Cierres pendientes de validaciÃ³n">
              <div className="y-section-header">
                <span className="y-section-eyebrow">SupervisiÃ³n</span>
                <h2 className="y-section-title">Arqueos por validar</h2>
              </div>
              <div className="card" style={{ padding: 20, border: '1px solid var(--border)' }}>
                {cierres.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0', margin: 0 }}>No hay cierres pendientes de aprobaciÃ³n.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {cierres.map((cierre) => (
                      <article key={cierre.id} style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 8, background: '#fff', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 10 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <b style={{ color: 'var(--text)' }}>{cierre.cajaNombre}</b>
                            <span style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginTop: 2 }}>
                              {cierre.cajero} Â· {new Date(cierre.fechaSolicitud).toLocaleString('es-PE')}
                            </span>
                            {cierre.observacion && (
                              <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: 4 }}>{cierre.observacion}</small>
                            )}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>{fmtPEN(cierre.diferencia)}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Sistema</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Declarado</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Diferencia</div>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{fmtPEN(cierre.montoSistema)}</div>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{fmtPEN(cierre.montoDeclarado)}</div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: cierre.diferencia >= 0 ? 'var(--success)' : '#dc2626' }}>{fmtPEN(cierre.diferencia)}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <button
                            className="btn btn-gold"
                            disabled={validandoCierre !== null}
                            onClick={() => void validarCierre(cierre)}
                            style={{ flex: 1, padding: 10, fontWeight: 600 }}
                          >
                            {validandoCierre === cierre.id ? 'Validandoâ€¦' : 'Validar y cerrar'}
                          </button>
                          <button className="btn btn-ghost" onClick={() => setActaAbierta(cierre.id)} style={{ padding: 10 }}>
                            Ver acta Z
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}
          {actaAbierta != null && (
            <section className="y-panel y-panel-card caja-validaciones" aria-label="Acta de cierre">
              <div className="caja-section-heading">
                <div>
                  <span className="y-flow-hero__eyebrow">SupervisiÃ³n</span>
                  <h2 style={{ margin: '2px 0 0', fontFamily: 'var(--font-d)', fontSize: 22 }}>Acta Z Â· apertura {actaAbierta}</h2>
                </div>
                <button className="y-btn line y-btn sm" onClick={() => setActaAbierta(null)}>Cerrar</button>
              </div>
              <CajaActa aperturaId={actaAbierta} />
            </section>
          )}
          {puedeValidarCierre && (
            <section className="y-section" aria-label="Incidencias de caja">
              <div className="y-section-header">
                <span className="y-section-eyebrow">SupervisiÃ³n</span>
                <h2 className="y-section-title">Incidencias de caja</h2>
              </div>
              <CajaIncidencias
                puedeValidar={true}
                onChanged={async (msg) => {
                  setMensaje(msg);
                  await cargar();
                }}
              />
            </section>
          )}
                    {cierresCerrados.length > 0 && (
            <section className="y-section" aria-label="Cierres cerrados">
              <div className="y-section-header">
                <span className="y-section-eyebrow">Historial</span>
                <h2 className="y-section-title">Cierres realizados</h2>
              </div>
              <div className="card" style={{ padding: 20, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {cierresCerrados.map((cierre) => (
                    <article key={cierre.id} style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 8, background: '#fff', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 10 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <b style={{ color: 'var(--text)' }}>{cierre.cajaNombre}</b>
                          <span style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginTop: 2 }}>
                            {cierre.cajero} · {cierre.fechaSolicitud ? new Date(cierre.fechaSolicitud).toLocaleString('es-PE') : ''}
                          </span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>{fmtPEN(cierre.diferencia)}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Sistema</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Declarado</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Diferencia</div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{fmtPEN(cierre.montoSistema)}</div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{fmtPEN(cierre.montoDeclarado)}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: cierre.diferencia >= 0 ? 'var(--success)' : '#dc2626' }}>{fmtPEN(cierre.diferencia)}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button className="btn btn-ghost" onClick={() => setActaAbierta(cierre.id)} style={{ padding: 10 }}>
                          Ver acta Z
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}
          {cajaSel?.aperturada === 'S' && !cajaSel.cierrePendiente && permisos.includes('CAJ_EGRESO') && (
            <section className="y-section" aria-label="Movimientos de caja">
              <div className="y-section-header">
                <span className="y-section-eyebrow">Caja</span>
                <h2 className="y-section-title">Registrar movimiento</h2>
              </div>
              <CajaMovimientoForm
                cajaId={cajaSel.id}
                conceptos={maestros.conceptos}
                metodos={maestros.metodosPago}
                onRegistrado={async () => {
                  setMensaje('Movimiento de caja registrado.');
                  await cargar();
                }}
              />
            </section>
          )}
          <section className="y-section" aria-label="Pedidos pendientes de cobro">
            <div className="y-section-header">
              <span className="y-section-eyebrow">Cobros</span>
              <h2 className="y-section-title">Pedidos pendientes</h2>
            </div>
            {pendientes.length === 0 ? (
              <div className="card" style={{ padding: 40, textAlign: 'center', border: '1px solid var(--border)' }}>
                <Ico n="ok" size={44} />
                <h3 style={{ margin: '10px 0 6px', color: 'var(--text)' }}>Todo en orden</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>No hay pedidos pendientes de cobro.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
                {pendientes.map((t) => (
                  <div key={t.id} className="ys-ticket card" style={{ border: '1px solid var(--border)', padding: 16, borderRadius: 10, background: '#fff', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Ico n="receipt" size={16} />
                        <b style={{ fontSize: 15 }}>{t.numero}</b>
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {t.mesaId ? `Mesa ${t.mesaId}` : 'Delivery'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-muted)' }}>
                      <span>{t.detalles.length} {t.detalles.length === 1 ? 'Ã­tem' : 'Ã­tems'}</span>
                      <span>S/ {(t.total ?? 0).toFixed(2)}</span>
                    </div>
                    <button
                      className="btn btn-gold"
                      disabled={!cajaSel || cajaSel.aperturada !== 'S' || cajaSel.cierrePendiente}
                      onClick={() => setSeleccion(t)}
                      style={{ width: '100%', padding: 10, fontWeight: 600, fontSize: 14 }}
                    >
                      Cobrar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
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
            toast({ title: 'Pago registrado', description: `Comprobante ${res.serie}-${res.numero} emitido por S/ ${payload.pagos.reduce((s, p) => s + p.monto, 0).toFixed(2)}`, variant: 'success' });
            setSeleccion(null);
            setComprobanteAbierto({ idVenta: res.idVenta, tipoDocumento: payload.tipoDocumento });
            setTicketAbierto(true);
            await cargar();
          }}
        />
      )}
      {comprobanteAbierto && (
        <section className="y-panel y-panel-card caja-validaciones" aria-label="Comprobante">
          <div className="caja-section-heading">
            <div>
              <span className="y-flow-hero__eyebrow">SupervisiÃ³n</span>
              <h2 style={{ margin: '2px 0 0', fontFamily: 'var(--font-d)', fontSize: 22 }}>Comprobante Â· venta {comprobanteAbierto.idVenta}</h2>
            </div>
            <button className="y-btn line y-btn sm" onClick={() => setComprobanteAbierto(null)}>Cerrar</button>
          </div>
          {comprobanteAbierto.tipoDocumento === '01' ? (
            <ComprobanteFactura ventaId={comprobanteAbierto.idVenta} onClose={() => setComprobanteAbierto(null)} />
          ) : (
            <ComprobanteBoleta ventaId={comprobanteAbierto.idVenta} onClose={() => setComprobanteAbierto(null)} />
          )}
          <button
            className="y-btn line y-btn sm"
            style={{ marginTop: 10 }}
            onClick={() => setTicketAbierto(true)}
          >
            Imprimir ticket tÃ©rmico (80mm)
          </button>
        </section>
      )}
      {ticketAbierto && (
        <section className="y-panel y-panel-card caja-validaciones" aria-label="Ticket tÃ©rmico">
          <div className="caja-section-heading">
            <div>
              <span className="y-flow-hero__eyebrow">Comprobante</span>
              <h2 style={{ margin: '2px 0 0', fontFamily: 'var(--font-d)', fontSize: 22 }}>
                Ticket tÃ©rmico Â· venta {comprobanteAbierto?.idVenta}
              </h2>
            </div>
            <button className="y-btn line y-btn sm" onClick={() => setTicketAbierto(false)}>
              Cerrar
            </button>
          </div>
          {comprobanteAbierto && (
            <ComprobanteTicket ventaId={comprobanteAbierto.idVenta} onClose={() => setTicketAbierto(false)} />
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
  const [factilizaLoading, setFactilizaLoading] = useState(false);
  const [factilizaError, setFactilizaError] = useState<string | null>(null);
  const [datosRuc, setDatosRuc] = useState<{ razonSocial: string; direccion: string | null } | null>(null);
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

  const consultarRucFactiliza = useCallback(async (ruc: string) => {
    if (!ruc || !/^\d{11}$/.test(ruc)) return;
    setFactilizaLoading(true);
    setFactilizaError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1'}/factiliza/ruc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruc }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setFactilizaError(body.error || 'Error al consultar RUC');
        return;
      }
      const data = await res.json();
      setDatosRuc({ razonSocial: data.razonSocial, direccion: data.direccion ?? null });
    } catch {
      setFactilizaError('No se pudo conectar con Factiliza');
    } finally {
      setFactilizaLoading(false);
    }
  }, []);

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
              {ticket.mesaId ? `Mesa ${ticket.mesaId}` : 'Delivery'} Â· {fmtPEN(ticket.total)}
            </p>
          </div>
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
        </div>

        <div style={{ marginTop: 16, display: 'grid', gap: 10 }}>
          <section style={{ display: 'grid', gap: 8, padding: 12, border: '1px solid var(--border)', borderRadius: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <strong>Detalle del pedido</strong>
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                {ticket.detalles.length} {ticket.detalles.length === 1 ? 'Ã­tem' : 'Ã­tems'}
              </span>
            </div>
            <div style={{ display: 'grid', gap: 6, maxHeight: 180, overflowY: 'auto' }}>
              {ticket.detalles.map((detalle) => (
                <div key={detalle.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
                  <span>{detalle.cantidad} Ã— {detalle.producto}</span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {detalle.estadoPreparacion === 'P' ? 'Pendiente' :
                      detalle.estadoPreparacion === 'L' ? 'Listo' :
                        'Anulado'}
                  </span>
                </div>
              ))}
              {ticket.detalles.length === 0 && (
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Este pedido no tiene Ã­tems.</span>
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
                  <span>{participante.nombre}{participante.esOrganizador ? ' Â· Organizador' : ''}</span>
                  <span>Consumo {fmtPEN(participante.consumoEstimado)} Â· Asignado {fmtPEN(asignado / 100)}</span>
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
                    <option value="">Selecciona quiÃ©n paga</option>
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
                    NÃºmero de operaciÃ³n{metodo?.requiereReferencia ? '' : ' (opcional)'}
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
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  className="input"
                  placeholder="RUC (11 dÃ­gitos)"
                  value={clienteTexto}
                  onChange={(e) => {
                    setClienteTexto(e.target.value);
                    setDatosRuc(null);
                  }}
                />
                <button
                  className="btn btn-ghost"
                  disabled={factilizaLoading || !/^\d{11}$/.test(clienteTexto)}
                  onClick={() => void consultarRucFactiliza(clienteTexto)}
                >
                  {factilizaLoading ? 'Buscandoâ€¦' : 'Buscar'}
                </button>
              </div>
              {factilizaError && (
                <p style={{ color: '#fca5a5', fontSize: 12, marginTop: 4 }}>{factilizaError}</p>
              )}
              {datosRuc && (
                <div style={{ marginTop: 8, padding: 8, background: '#ecfdf5', borderRadius: 6, border: '1px solid #bbf7d0' }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600 }}>{datosRuc.razonSocial}</p>
                  {datosRuc.direccion && (
                    <p style={{ margin: 2, fontSize: 11, color: 'var(--text-muted)' }}>{datosRuc.direccion}</p>
                  )}
                </div>
              )}
            </>
          )}

        </div>

        {error && (
          <p style={{ marginTop: 10, color: '#fca5a5' }}>{error}</p>
        )}
        {cajaCerrada && !error && (
          <p style={{ marginTop: 10, color: '#fcd34d' }}>
            La caja seleccionada estÃ¡ cerrada: apertura el turno primero.
          </p>
        )}

        <button
          className="btn btn-gold"
          style={{ marginTop: 14 }}
          disabled={busy || cajaCerrada || lineaInvalida || !pagosCubrenTotal || faltanAportes || pagos.length === 0}
          onClick={() => void enviar()}
        >
          {busy ? 'Procesando cobroâ€¦' : 'Confirmar cobro'}
        </button>
        <p style={{ marginTop: 8, color: 'var(--text-muted)', fontSize: 12 }}>
          Se emitirÃ¡ una venta y un comprobante. Los medios se registran individualmente y solo el efectivo aumenta el arqueo fÃ­sico.
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
        description: cause instanceof Error ? mensajeCaja(cause.message) : 'IntÃ©ntalo nuevamente.',
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
          {conceptos.map((item) => <option key={item.id} value={item.id}>{item.tipoMovimiento} Â· {item.nombre}</option>)}
        </select>
        <select className="select" value={metodoPagoId} onChange={(event) => setMetodoPagoId(Number(event.target.value))} aria-label="Medio del movimiento">
          {metodos.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}
        </select>
        <input className="input" type="number" min="0.01" step="0.01" placeholder="Monto" value={monto} onChange={(event) => setMonto(event.target.value)} />
        <input className="input" maxLength={200} placeholder="DescripciÃ³n" value={descripcion} onChange={(event) => setDescripcion(event.target.value)} />
        {metodo?.requiereReferencia && (
          <input className="input" maxLength={30} placeholder="OperaciÃ³n / referencia" value={referencia} onChange={(event) => setReferencia(event.target.value)} />
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
          {enviando ? 'Registrandoâ€¦' : 'Registrar'}
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
