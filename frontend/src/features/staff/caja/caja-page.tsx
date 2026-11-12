import { useCallback, useEffect, useMemo, useState } from 'react';
import { ErrorBox, Loading } from '../../../components/ui';
import { Ico } from '../../../components/Icon';
import { PageHero } from '../../../components/PageHero';
import { fmtPEN } from '../../../lib/format';
import { API_URL } from '../../../lib/api-url';
import { useToast } from '../../../shared/ui/use-toast';
import { leerPermisos, leerUsuario } from '../../auth/login/auth-service';
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
  historialCajaService,
  type CajaInfo,
  type CajaMaestros,
  type CierrePendiente,
  type ConceptoCajaInfo,
  type HistorialTurno,
  type MetodoPagoInfo,
  type Ticket,
} from '../staff-service';

const HISTORIAL_Z_POR_PAGINA = 10;

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
  const [aperturaAbierta, setAperturaAbierta] = useState(false);
  const [movimientoAbierto, setMovimientoAbierto] = useState(false);
  const [arqueoAbierto, setArqueoAbierto] = useState(false);
  const [actaAbierta, setActaAbierta] = useState<number | null>(null);
  const [validandoCierre, setValidandoCierre] = useState<number | null>(null);
  const [comprobanteAbierto, setComprobanteAbierto] = useState<{ idVenta: number; tipoDocumento: string } | null>(null);
  const [ticketAbierto, setTicketAbierto] = useState<boolean>(false);
  const [cierres, setCierres] = useState<CierrePendiente[]>([]);
  const [cierresCerrados, setCierresCerrados] = useState<HistorialTurno[]>([]);
  const [paginaHistorialZ, setPaginaHistorialZ] = useState(1);
  const { toast } = useToast();
  const permisos = leerPermisos();
  const tipoUsuario = leerUsuario()?.tipo.toUpperCase();
  const puedeCerrar = permisos.includes('CAJ_CERRAR');
  const puedeValidarCierre =
    permisos.includes('CAJ_VALIDAR_CIERRE') &&
    (tipoUsuario === 'ADMINISTRADOR' || tipoUsuario === 'SUPERVISOR');

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

  const cajaSel = maestros?.cajas.find((c) => c.id === cajaTurno) ?? null;
  const historialZOrdenado = useMemo(
    () => [...cierresCerrados].sort((a, b) => {
      const fechaB = Date.parse(b.fCierre ?? b.fApertura);
      const fechaA = Date.parse(a.fCierre ?? a.fApertura);
      return (Number.isFinite(fechaB) ? fechaB : 0) - (Number.isFinite(fechaA) ? fechaA : 0);
    }),
    [cierresCerrados],
  );
  const paginasHistorialZ = Math.max(1, Math.ceil(historialZOrdenado.length / HISTORIAL_Z_POR_PAGINA));
  const historialZPagina = historialZOrdenado.slice(
    (paginaHistorialZ - 1) * HISTORIAL_Z_POR_PAGINA,
    paginaHistorialZ * HISTORIAL_Z_POR_PAGINA,
  );

  useEffect(() => {
    if (paginaHistorialZ > paginasHistorialZ) setPaginaHistorialZ(paginasHistorialZ);
  }, [paginaHistorialZ, paginasHistorialZ]);

  useEffect(() => {
    if (!aperturaAbierta && !movimientoAbierto && !arqueoAbierto && actaAbierta === null) return;
    const cerrarConEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setAperturaAbierta(false);
      setMovimientoAbierto(false);
      setArqueoAbierto(false);
      setActaAbierta(null);
    };
    window.addEventListener('keydown', cerrarConEscape);
    return () => window.removeEventListener('keydown', cerrarConEscape);
  }, [aperturaAbierta, movimientoAbierto, arqueoAbierto, actaAbierta]);

  const aperturar = useCallback(async () => {
    if (!cajaSel) return;
    setAperturando(true);
    try {
      const r = await aperturarCaja(cajaSel.id, Number(montoInicial || 0), observacionApertura);
      setMensaje(`Turno aperturado en ${cajaSel.nombre}. ${r.mensaje}`.trim());
      toast({ title: 'Caja abierta', description: `Turno aperturado en ${cajaSel.nombre}`, variant: 'success' });
      setMontoInicial('');
      setObservacionApertura('');
      setAperturaAbierta(false);
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

  const validarCierre = useCallback(async (cierre: CierrePendiente) => {
    setValidandoCierre(cierre.id);
    try {
      const result = await confirmarCierreCaja(cierre.id);
      setMensaje(`Cierre de ${cierre.cajaNombre} validado: ${result.resultado.toLowerCase()}.`);
      toast({ title: 'Cierre validado', description: `Cierre de ${cierre.cajaNombre} validado: ${result.resultado.toLowerCase()}.`, variant: 'success' });
      setPaginaHistorialZ(1);
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
      <PageHero
        titleId="caja-hero-title"
        eyebrow="Operación y control de efectivo"
        title="Caja, clara y bajo control."
        description="Administra tu turno, cobra las cuentas solicitadas y entrega el arqueo para validación."
        actions={<button className="y-btn line" onClick={() => void cargar()}>Actualizar información</button>}
      />
      {error && <ErrorBox msg={error} retry={cargar} />}
      {pendientes === null && !error && <Loading text="Cargando caja..." />}
      {pendientes && maestros && !error && (
        <>
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
                        {c.nombre} · {c.aperturada === 'S' ? 'ABIERTA' : 'CERRADA'}
                      </option>
                    ))}
                  </select>
                </div>
                {!cajaSel ? (
                  <span className="caja-muted" style={{ paddingTop: 26 }}>No hay cajas activas configuradas.</span>
                ) : cajaSel.aperturada === 'N' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span className="ys-status" style={{ color: 'var(--text-muted)', background: '#f3f4f6' }}>
                      <i /> Turno cerrado
                    </span>
                    <button className="btn btn-gold" onClick={() => setAperturaAbierta(true)}>
                      Aperturar turno
                    </button>
                  </div>
                ) : cajaSel.cierrePendiente ? (
                  <span className="ys-status" style={{ color: '#fbbf24', background: '#fbbf2422', padding: '6px 12px', borderRadius: 6, marginTop: 4 }}>
                    <i /> Esperando validación de un supervisor para cerrar
                  </span>
                ) : (
                  <div style={{ paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <span className="ys-status" style={{ color: '#22c55e', background: '#22c55e22', padding: '6px 12px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <i style={{ fontSize: 12 }} /> Turno abierto · sistema {fmtPEN(cajaSel?.montoSistema ?? 0)}
                    </span>
                    {puedeCerrar && cajaSel?.turnoId && (
                      <button
                        className="btn btn-primary"
                        onClick={() => setArqueoAbierto(true)}
                        style={{ marginTop: 8, padding: '10px 20px', fontWeight: 600 }}
                      >
                        Arqueo y solicitar cierre
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
          <section className="y-section" aria-label="Caja">
            <div className="y-section-header">
              <span className="y-section-eyebrow">Caja</span>
              <h2 className="y-section-title">Caja y movimientos</h2>
            </div>
            <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', padding: 20, border: '1px solid var(--border)' }}>
              <div>
                <b style={{ fontSize: 16 }}>{cajaSel?.nombre ?? 'Selecciona una caja en Turno'}</b>
                {cajaSel?.aperturada === 'S' ? (
                  <>
                    <p style={{ margin: '6px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                      Saldo del sistema: <b>{fmtPEN(cajaSel.montoSistema ?? cajaSel.montoBase)}</b>
                    </p>
                    {!!cajaSel.netoPorMedio.length && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {cajaSel.netoPorMedio.map((saldo) => (
                          <span key={saldo.medio} style={{ padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }}>
                            {saldo.medio}: <b>{fmtPEN(saldo.total)}</b>
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: 13 }}>
                    Abre un turno para registrar movimientos de caja.
                  </p>
                )}
              </div>
              {cajaSel?.aperturada === 'S' && !cajaSel.cierrePendiente && permisos.includes('CAJ_EGRESO') && (
                <button className="btn btn-gold" onClick={() => setMovimientoAbierto(true)}>
                  Registrar movimiento
                </button>
              )}
            </div>
          </section>
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
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
                      <span>{t.detalles.length} {t.detalles.length === 1 ? 'ítem' : 'ítems'}</span>
                      <b>S/ {(t.total ?? 0).toFixed(2)}</b>
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
          <section className="y-section" aria-label="Arqueo de caja">
            <div className="y-section-header">
              <span className="y-section-eyebrow">Arqueo</span>
              <h2 className="y-section-title">Arqueo del turno</h2>
            </div>
            <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', padding: 20, border: '1px solid var(--border)' }}>
              <div>
                <b>{cajaSel?.nombre ?? 'Sin caja seleccionada'}</b>
                <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: 13 }}>
                  Saldo teórico: {fmtPEN(cajaSel?.montoSistema ?? cajaSel?.montoBase ?? 0)}
                </p>
              </div>
              <button
                className="btn btn-primary"
                disabled={!cajaSel?.turnoId || cajaSel.cierrePendiente}
                onClick={() => setArqueoAbierto(true)}
              >
                Abrir arqueo
              </button>
            </div>
          </section>
          {puedeValidarCierre && (
            <section className="y-section" aria-label="Cierres pendientes de validación">
              <div className="y-section-header">
                <span className="y-section-eyebrow">Supervisión</span>
                <h2 className="y-section-title">Arqueos por validar</h2>
              </div>
              <div className="card" style={{ padding: 20, border: '1px solid var(--border)' }}>
                {cierres.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0', margin: 0 }}>No hay cierres pendientes de aprobación.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {cierres.map((cierre) => (
                      <article key={cierre.id} style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 8, background: '#fff', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 10 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <b style={{ color: 'var(--text)' }}>{cierre.cajaNombre}</b>
                            <span style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginTop: 2 }}>
                              Cajero: {cierre.cajero} · {new Date(cierre.fechaSolicitud).toLocaleString('es-PE')}
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
                            {validandoCierre === cierre.id ? 'Validando…' : 'Validar y cerrar'}
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
          {puedeValidarCierre && (
            <section className="y-section" aria-label="Incidencias de caja">
              <div className="y-section-header">
                <span className="y-section-eyebrow">Supervisión</span>
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
          <section className="y-section" aria-label="Historial de actas Z">
              <div className="y-section-header">
                <span className="y-section-eyebrow">Historial</span>
                <h2 className="y-section-title">Actas Z generadas</h2>
              </div>
              <div className="card" style={{ padding: 20, border: '1px solid var(--border)' }}>
                {historialZOrdenado.length === 0 ? (
                  <p style={{ margin: 0, color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>
                    Aún no hay actas Z generadas.
                  </p>
                ) : (
                  <>
                    <div style={{ overflowX: 'auto' }}>
                      <table aria-label="Actas Z, más recientes primero" style={{ width: '100%', minWidth: 900, borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                            {['Cierre', 'N.º turno', 'Caja', 'Cajero', 'Sistema', 'Declarado', 'Diferencia', 'Resultado', 'Acta'].map((columna) => (
                              <th key={columna} scope="col" style={{ padding: 10, whiteSpace: 'nowrap' }}>{columna}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {historialZPagina.map((cierre) => (
                            <tr key={cierre.id} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: 10, whiteSpace: 'nowrap' }}>
                                {cierre.fCierre ? new Date(cierre.fCierre).toLocaleString('es-PE') : '—'}
                              </td>
                              <td style={{ padding: 10 }}>{cierre.numeroTurno || '—'}</td>
                              <td style={{ padding: 10 }}>{cierre.cajaNombre}</td>
                              <td style={{ padding: 10 }}>{cierre.cajero || '—'}</td>
                              <td style={{ padding: 10, textAlign: 'right' }}>{fmtPEN(cierre.montoSistema)}</td>
                              <td style={{ padding: 10, textAlign: 'right' }}>{fmtPEN(cierre.montoDeclarado)}</td>
                              <td style={{ padding: 10, textAlign: 'right', color: cierre.diferencia >= 0 ? 'var(--success)' : '#dc2626' }}>
                                {fmtPEN(cierre.diferencia)}
                              </td>
                              <td style={{ padding: 10, whiteSpace: 'nowrap' }}>{cierre.resultado ?? '—'}</td>
                              <td style={{ padding: 10 }}>
                                <button className="btn btn-ghost" onClick={() => setActaAbierta(cierre.id)}>
                                  Ver Z
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 14 }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                        Página {paginaHistorialZ} de {paginasHistorialZ} · {historialZOrdenado.length} actas, más recientes primero
                      </span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="btn btn-ghost"
                          disabled={paginaHistorialZ <= 1}
                          onClick={() => setPaginaHistorialZ((pagina) => Math.max(1, pagina - 1))}
                        >
                          Anterior
                        </button>
                        <button
                          className="btn btn-ghost"
                          disabled={paginaHistorialZ >= paginasHistorialZ}
                          onClick={() => setPaginaHistorialZ((pagina) => Math.min(paginasHistorialZ, pagina + 1))}
                        >
                          Siguiente
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </section>
        </>
      )}

      {aperturaAbierta && cajaSel && (
        <div
          className="ys-veil"
          style={{ position: 'fixed', inset: 0, zIndex: 70, display: 'grid', placeItems: 'center', padding: 16, background: 'rgba(0,0,0,.45)' }}
          onClick={() => setAperturaAbierta(false)}
        >
          <section
            className="card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="apertura-modal-title"
            style={{ width: 'min(480px, 100%)', padding: 22 }}
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="apertura-modal-title" style={{ margin: '0 0 16px' }}>Aperturar turno · {cajaSel.nombre}</h2>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void aperturar();
              }}
              style={{ display: 'grid', gap: 12 }}
            >
              <label style={{ display: 'grid', gap: 6, color: 'var(--text-muted)', fontSize: 13 }}>
                Monto inicial
                <input
                  className="input"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  required
                  value={montoInicial}
                  onChange={(event) => setMontoInicial(event.target.value)}
                />
              </label>
              <label style={{ display: 'grid', gap: 6, color: 'var(--text-muted)', fontSize: 13 }}>
                Observación (opcional)
                <input
                  className="input"
                  maxLength={200}
                  value={observacionApertura}
                  onChange={(event) => setObservacionApertura(event.target.value)}
                />
              </label>
              <div style={{ display: 'flex', justifyContent: 'end', gap: 8, marginTop: 4 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setAperturaAbierta(false)}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-gold"
                  disabled={aperturando || montoInicial === '' || !Number.isFinite(Number(montoInicial)) || Number(montoInicial) < 0}
                >
                  {aperturando ? 'Aperturando…' : 'Aperturar turno'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
      {movimientoAbierto && cajaSel && (
        <div
          className="ys-veil"
          style={{ position: 'fixed', inset: 0, zIndex: 70, display: 'grid', placeItems: 'center', padding: 16, background: 'rgba(0,0,0,.45)' }}
          onClick={() => setMovimientoAbierto(false)}
        >
          <section
            className="card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="movimiento-modal-title"
            style={{ width: 'min(760px, 100%)', maxHeight: '90vh', overflowY: 'auto', padding: 20 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <h2 id="movimiento-modal-title" style={{ margin: 0 }}>Movimiento · {cajaSel.nombre}</h2>
              <button className="btn btn-ghost" onClick={() => setMovimientoAbierto(false)}>Cerrar</button>
            </div>
            <CajaMovimientoForm
              cajaId={cajaSel.id}
              conceptos={maestros?.conceptos ?? []}
              metodos={maestros?.metodosPago ?? []}
              onRegistrado={async () => {
                setMensaje('Movimiento de caja registrado.');
                await cargar();
                setMovimientoAbierto(false);
              }}
            />
          </section>
        </div>
      )}
      {arqueoAbierto && cajaSel?.turnoId && (
        <div
          className="ys-veil"
          style={{ position: 'fixed', inset: 0, zIndex: 70, display: 'grid', placeItems: 'center', padding: 16, background: 'rgba(0,0,0,.45)' }}
          onClick={() => setArqueoAbierto(false)}
        >
          <section
            className="card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="arqueo-modal-title"
            style={{ width: 'min(720px, 100%)', maxHeight: '90vh', overflowY: 'auto', padding: 20 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <h2 id="arqueo-modal-title" style={{ margin: 0 }}>Arqueo · {cajaSel.nombre}</h2>
              <button className="btn btn-ghost" onClick={() => setArqueoAbierto(false)}>Cerrar</button>
            </div>
            <CajaArqueo
              cajaId={cajaSel.id}
              aperturaId={cajaSel.turnoId}
              cajaNombre={cajaSel.nombre}
              saldoTeorico={cajaSel.montoSistema ?? cajaSel.montoBase}
              onHecho={async (msg) => {
                setMensaje(msg);
                await cargar();
                setArqueoAbierto(false);
              }}
            />
          </section>
        </div>
      )}
      {actaAbierta !== null && (
        <div
          className="ys-veil"
          style={{ position: 'fixed', inset: 0, zIndex: 70, display: 'grid', placeItems: 'center', padding: 16, background: 'rgba(0,0,0,.45)' }}
          onClick={() => setActaAbierta(null)}
        >
          <section
            className="card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="acta-z-modal-title"
            style={{ width: 'min(520px, 100%)', maxHeight: '90vh', overflowY: 'auto', padding: 20 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <h2 id="acta-z-modal-title" style={{ margin: 0 }}>Acta Z · turno {actaAbierta}</h2>
              <button className="btn btn-ghost" onClick={() => setActaAbierta(null)}>Cerrar</button>
            </div>
            <CajaActa aperturaId={actaAbierta} />
          </section>
        </div>
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
          <button
            className="y-btn line y-btn sm"
            style={{ marginTop: 10 }}
            onClick={() => setTicketAbierto(true)}
          >
            Imprimir ticket térmico (80mm)
          </button>
        </section>
      )}
      {ticketAbierto && (
        <section className="y-panel y-panel-card caja-validaciones" aria-label="Ticket térmico">
          <div className="caja-section-heading">
            <div>
              <span className="y-flow-hero__eyebrow">Comprobante</span>
              <h2 style={{ margin: '2px 0 0', fontFamily: 'var(--font-d)', fontSize: 22 }}>
                Ticket térmico · venta {comprobanteAbierto?.idVenta}
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
      const res = await fetch(`${API_URL}/factiliza/ruc`, {
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
                      detalle.estadoPreparacion === 'L' ? 'Listo' :
                        'Anulado'}
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
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  className="input"
                  placeholder="RUC (11 dígitos)"
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
                  {factilizaLoading ? 'Buscando…' : 'Buscar'}
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
