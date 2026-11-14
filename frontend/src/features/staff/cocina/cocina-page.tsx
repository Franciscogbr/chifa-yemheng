import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ErrorBox, Loading, PageHeader } from '../../../components/ui';
import { Ico } from '../../../components/Icon';
import { timeAgo } from '../../../lib/format';
import {
  cambiarPreparacion,
  listarPedidosCocina,
  type EstadoPreparacion,
  type Ticket,
  type TicketLinea,
} from '../staff-service';
import { EstadoBadge } from '../../../shared/ui/EstadoBadge';
import { supabase } from '../../../shared/services/supabase';
import { StaffFeedbackModal, type StaffFeedback } from '../staff-feedback-modal';

const INTERVALO_ACTUALIZACION_MS = 10_000;
const RETRASO_HISTORIAL_KEY = 'chifa.cocina.retraso-historial-segundos';
const RETRASO_HISTORIAL_DEFAULT_SEGUNDOS = 10;
const RETRASO_HISTORIAL_MIN_SEGUNDOS = 1;
const RETRASO_HISTORIAL_MAX_SEGUNDOS = 600;
const TAMANO_PAGINA_HISTORIAL = 10;
type GrupoCocina = 'P' | 'L';

const TONE: Record<string, string> = { P: '#f59e0b', L: '#22c55e', H: '#64748b', A: '#ef4444' };

function describirErrorCocina(error: unknown, fallback: string): string {
  const raw = error instanceof Error ? error.message : '';
  const code = raw.split(':', 1)[0]?.trim().toUpperCase() ?? '';
  const known: Record<string, string> = {
    NOT_FOUND: 'La comanda o el producto ya no está disponible. Actualiza el tablero.',
    VALIDATION_ERROR: 'No se pudo aplicar ese cambio. Actualiza el tablero e inténtalo nuevamente.',
    NETWORK_ERROR: 'No se pudo conectar. Revisa la conexión e inténtalo nuevamente.',
    TRANSICION_ESTADO_INVALIDA: 'El estado del producto cambió en otro dispositivo. Actualiza el tablero.',
  };
  if (known[code]) return known[code];
  if (code.startsWith('DB_') || /failed to fetch|networkerror/i.test(raw)) {
    return 'No se pudo conectar con el servicio. Revisa la conexión e inténtalo nuevamente.';
  }
  return fallback;
}

const AUDIO_URL = '/sonidos/nuevo-pedido.mp3';

const minutosEspera = (fechaSolicitud: string | null): number => {
  if (!fechaSolicitud) return 0;
  return Math.floor((Date.now() - new Date(fechaSolicitud).getTime()) / 60000);
};

const colorUrgencia = (minutos: number): string => {
  if (minutos >= 10) return '#ef4444';
  if (minutos >= 5) return '#f59e0b';
  return '#22c55e';
};

function timestampFecha(fecha: string | null): number | null {
  if (!fecha) return null;
  const fechaConZona = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(fecha) ? fecha : `${fecha}Z`;
  const timestamp = Date.parse(fechaConZona);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function timestampAtencion(detalle: TicketLinea): number | null {
  return timestampFecha(detalle.fechaAtencion);
}

function esHistorialListo(detalle: TicketLinea, ahora: number, retrasoHistorialMs: number): boolean {
  const timestamp = timestampAtencion(detalle);
  return detalle.estadoPreparacion === 'L'
    && timestamp !== null
    && ahora - timestamp >= retrasoHistorialMs;
}

function perteneceAlGrupo(
  detalle: TicketLinea,
  grupo: GrupoCocina,
  ahora: number,
  retrasoHistorialMs: number,
): boolean {
  if (grupo === 'P') return detalle.estadoPreparacion === 'P';
  return detalle.estadoPreparacion === 'L' && !esHistorialListo(detalle, ahora, retrasoHistorialMs);
}

export function StaffCocinaPage() {
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<StaffFeedback | null>(null);
  const [retrasoHistorialSegundos, setRetrasoHistorialSegundos] = useState(RETRASO_HISTORIAL_DEFAULT_SEGUNDOS);
  const [retrasoHistorialDraft, setRetrasoHistorialDraft] = useState(String(RETRASO_HISTORIAL_DEFAULT_SEGUNDOS));
  const [mostrarConfiguracion, setMostrarConfiguracion] = useState(false);
  const [errorConfiguracion, setErrorConfiguracion] = useState<string | null>(null);
  const [paginaHistorial, setPaginaHistorial] = useState(1);
  const [ahora, setAhora] = useState(Date.now);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousTicketsRef = useRef<Ticket[] | null>(null);
  const retrasoHistorialMs = retrasoHistorialSegundos * 1000;

  useEffect(() => {
    try {
      const guardado = window.localStorage.getItem(RETRASO_HISTORIAL_KEY);
      if (guardado === null) return;
      const segundos = Number(guardado);
      if (
        Number.isInteger(segundos)
        && segundos >= RETRASO_HISTORIAL_MIN_SEGUNDOS
        && segundos <= RETRASO_HISTORIAL_MAX_SEGUNDOS
      ) {
        setRetrasoHistorialSegundos(segundos);
        setRetrasoHistorialDraft(String(segundos));
      }
    } catch {
      setErrorConfiguracion('No se pudo leer el tiempo guardado en este navegador.');
    }
  }, []);

  const guardarConfiguracion = useCallback(() => {
    const segundos = Number(retrasoHistorialDraft);
    if (
      !Number.isInteger(segundos)
      || segundos < RETRASO_HISTORIAL_MIN_SEGUNDOS
      || segundos > RETRASO_HISTORIAL_MAX_SEGUNDOS
    ) {
      setErrorConfiguracion(`Ingresa un tiempo entero entre ${RETRASO_HISTORIAL_MIN_SEGUNDOS} y ${RETRASO_HISTORIAL_MAX_SEGUNDOS} segundos.`);
      return;
    }
    try {
      window.localStorage.setItem(RETRASO_HISTORIAL_KEY, String(segundos));
    } catch {
      setErrorConfiguracion('No se pudo guardar el tiempo en este navegador.');
      return;
    }
    setRetrasoHistorialSegundos(segundos);
    setAhora(Date.now());
    setErrorConfiguracion(null);
    setMostrarConfiguracion(false);
  }, [retrasoHistorialDraft]);

  const cargar = useCallback(async () => {
    try {
      const datos = await listarPedidosCocina();
      setAhora(Date.now());
      setTickets(datos);
      setError(null);

      const prevIds = new Set(previousTicketsRef.current?.map((t) => t.id) ?? []);
      const nuevo = datos.find((t) => !prevIds.has(t.id));
      if (nuevo) {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          void audioRef.current.play().catch(() => {});
        }
      }
      previousTicketsRef.current = datos;
    } catch (e) {
      setError(describirErrorCocina(e, 'No se pudo cargar la cocina. Intenta actualizar el tablero.'));
    }
  }, []);

  useEffect(() => {
    audioRef.current = new Audio(AUDIO_URL);

    void cargar();
    let debounceTimer: number | null = null;
    const trigger = () => {
      if (debounceTimer) window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(() => void cargar(), 200);
    };
    const channel = supabase
      .channel('cocina:detalles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'detalle_pedido' }, trigger)
      .subscribe();
    const refreshTimer = window.setInterval(() => void cargar(), INTERVALO_ACTUALIZACION_MS);
    return () => {
      if (debounceTimer) window.clearTimeout(debounceTimer);
      window.clearInterval(refreshTimer);
      void supabase.removeChannel(channel);
    };
  }, [cargar]);

  const mover = useCallback(
    async (ticketId: number, detalleId: number, estado: EstadoPreparacion) => {
      setBusy(detalleId);
      try {
        await cambiarPreparacion(ticketId, detalleId, estado);
        await cargar();
      } catch (e) {
        setFeedback({
          kind: 'error',
          title: 'No se pudo actualizar el producto',
          description: describirErrorCocina(e, 'Actualiza el tablero e inténtalo nuevamente.'),
        });
      } finally {
        setBusy(null);
      }
    },
    [cargar],
  );

  const proximoTraslado = useMemo(() => {
    if (!tickets) return null;
    const fechas = tickets.flatMap((ticket) => ticket.detalles
      .filter((detalle) => detalle.estadoPreparacion === 'L')
      .map(timestampAtencion)
      .filter((timestamp): timestamp is number => timestamp !== null)
      .map((timestamp) => timestamp + retrasoHistorialMs)
      .filter((timestamp) => timestamp > ahora));
    return fechas.length > 0 ? Math.min(...fechas) : null;
  }, [tickets, ahora, retrasoHistorialMs]);

  useEffect(() => {
    if (proximoTraslado === null) return;
    const timer = window.setTimeout(
      () => setAhora(Date.now()),
      Math.max(0, proximoTraslado - Date.now()),
    );
    return () => window.clearTimeout(timer);
  }, [proximoTraslado]);

  const conteo = useMemo(() => {
    const p = tickets?.filter((t) => t.detalles.some((d) => d.estadoPreparacion === 'P')).length ?? 0;
    const l = tickets?.filter((t) => t.detalles.some(
      (d) => d.estadoPreparacion === 'L' && !esHistorialListo(d, ahora, retrasoHistorialMs),
    )).length ?? 0;
    return { p, l };
  }, [tickets, ahora, retrasoHistorialMs]);

  const historialListos = useMemo(() => (tickets ?? [])
    .flatMap((ticket) => ticket.detalles
      .filter((detalle) => esHistorialListo(detalle, ahora, retrasoHistorialMs))
      .map((detalle) => ({
        ticket,
        detalle,
        timestamp: timestampAtencion(detalle) ?? 0,
      })))
    .sort((a, b) => b.timestamp - a.timestamp), [tickets, ahora, retrasoHistorialMs]);
  const totalPaginasHistorial = Math.max(1, Math.ceil(historialListos.length / TAMANO_PAGINA_HISTORIAL));
  const historialListosPagina = useMemo(() => {
    const inicio = (paginaHistorial - 1) * TAMANO_PAGINA_HISTORIAL;
    return historialListos.slice(inicio, inicio + TAMANO_PAGINA_HISTORIAL);
  }, [historialListos, paginaHistorial]);

  useEffect(() => {
    setPaginaHistorial((paginaActual) => Math.min(paginaActual, totalPaginasHistorial));
  }, [totalPaginasHistorial]);

  const grupos: { clave: GrupoCocina; titulo: string }[] = [
    { clave: 'P', titulo: 'Pendientes' },
    { clave: 'L', titulo: 'Listos' },
  ];

  return (
    <div className="y-shell" style={{ padding: '24px 16px 140px', maxWidth: 1240, margin: '0 auto' }}>
      <PageHeader
        title="Cocina (KDS)"
        sub="Tablero de comandas en preparación."
        right={(
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <EstadoChip estado="P" texto={`${conteo.p} pend`} />
            <EstadoChip estado="L" texto={`${conteo.l} listo`} />
            <button
              className="btn btn-ghost"
              aria-expanded={mostrarConfiguracion}
              aria-controls="cocina-configurar-tiempo"
              onClick={() => {
                if (mostrarConfiguracion) {
                  setMostrarConfiguracion(false);
                  return;
                }
                setRetrasoHistorialDraft(String(retrasoHistorialSegundos));
                setErrorConfiguracion(null);
                setMostrarConfiguracion(true);
              }}
            >
              Configurar tiempo
            </button>
            <button className="btn btn-ghost" onClick={() => void cargar()}>Refrescar</button>
          </div>
        )}
      />
      {errorConfiguracion && <p role="alert" style={{ color: '#ef4444', margin: '0 0 12px' }}>{errorConfiguracion}</p>}
      {mostrarConfiguracion && (
        <section
          id="cocina-configurar-tiempo"
          className="card"
          aria-label="Configuración del tiempo para historial"
          style={{ marginBottom: 16, padding: 16 }}
        >
          <form
            onSubmit={(event) => {
              event.preventDefault();
              guardarConfiguracion();
            }}
            style={{ display: 'flex', gap: 12, alignItems: 'end', flexWrap: 'wrap' }}
          >
            <label style={{ display: 'grid', gap: 6, fontSize: 13 }}>
              Segundos antes de mover a historial
              <input
                className="input"
                type="number"
                min={RETRASO_HISTORIAL_MIN_SEGUNDOS}
                max={RETRASO_HISTORIAL_MAX_SEGUNDOS}
                step={1}
                required
                value={retrasoHistorialDraft}
                onChange={(event) => setRetrasoHistorialDraft(event.target.value)}
                style={{ width: 180 }}
              />
            </label>
            <button type="submit" className="btn btn-gold">Guardar</button>
            <button type="button" className="btn btn-ghost" onClick={() => setMostrarConfiguracion(false)}>
              Cancelar
            </button>
          </form>
          <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontSize: 12 }}>
            Entre {RETRASO_HISTORIAL_MIN_SEGUNDOS} y {RETRASO_HISTORIAL_MAX_SEGUNDOS} segundos. Se guarda en este navegador.
          </p>
        </section>
      )}
      {error && <ErrorBox msg={error} retry={cargar} />}
      {tickets === null && error === null && <Loading text="Cargando comandas..." />}
      {tickets?.length === 0 && !error && (
        <div className="card" style={{ padding: 32, textAlign: 'center' }}>
          <Ico n="chef" size={40} />
          <h3 style={{ margin: '8px 0 0' }}>No hay comandas activas</h3>
          <p style={{ color: 'var(--text-muted)' }}>Cuando lleguen pedidos, se verán aquí.</p>
        </div>
      )}
      {tickets && tickets.length > 0 && !error && (
        <div>
          <div className="ys-board">
            {grupos.map((g) => (
              <div key={g.clave} className="ys-col card">
                <h3 style={{ color: TONE[g.clave] }}>{g.titulo}</h3>
                {tickets
                  .filter((t) => t.detalles.some((d) => perteneceAlGrupo(d, g.clave, ahora, retrasoHistorialMs)))
                  .map((t) => (
                    <div key={`${g.clave}-${t.id}`} className="ys-ticket" style={{ ['--tone' as string]: TONE[g.clave] }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontWeight: 700 }}>
                        <span>{t.numero}</span>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 11 }}>{timeAgo(t.fecha)}</span>
                      </div>
                      <p style={{ margin: '2px 0 8px', fontSize: 12, color: 'var(--text-muted)' }}>
                        {t.mesaId ? `Mesa ${t.mesaId} · ` : 'Delivery · '}
                        {t.comensales || 1} pax · S/ {(t.total ?? 0).toFixed(2)}
                      </p>
                      {t.detalles
                        .filter((d) => perteneceAlGrupo(d, g.clave, ahora, retrasoHistorialMs))
                        .map((d) => (
                          <DetalleLinea key={d.id} ticket={t} d={d} busy={busy === d.id} onMove={mover} />
                        ))}
                    </div>
                  ))}
              </div>
            ))}
          </div>
          <section className="ys-col card" style={{ marginTop: 16, padding: 12 }}>
            <h3 style={{ color: TONE.H }}>Historial de listos ({historialListos.length})</h3>
            {historialListos.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', margin: '8px 4px' }}>Aún no hay platos listos en el historial.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table aria-label="Historial de platos listos" style={{ width: '100%', minWidth: 560, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Fecha y hora de listo', 'Comanda', 'Plato', 'Cantidad', 'Mesa / canal'].map((columna) => (
                        <th
                          key={columna}
                          scope="col"
                          style={{ borderBottom: '1px solid var(--line2)', color: 'var(--text-muted)', fontSize: 12, padding: 10, textAlign: 'left' }}
                        >
                          {columna}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {historialListosPagina.map(({ ticket, detalle, timestamp }) => (
                      <tr key={detalle.id}>
                        <td style={{ borderBottom: '1px solid var(--line2)', padding: 10, whiteSpace: 'nowrap' }}>
                          {new Date(timestamp).toLocaleString('es-PE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </td>
                        <td style={{ borderBottom: '1px solid var(--line2)', padding: 10 }}>{ticket.numero}</td>
                        <td style={{ borderBottom: '1px solid var(--line2)', padding: 10 }}>{detalle.producto}</td>
                        <td style={{ borderBottom: '1px solid var(--line2)', padding: 10 }}>{detalle.cantidad}</td>
                        <td style={{ borderBottom: '1px solid var(--line2)', padding: 10 }}>
                          {ticket.mesaId !== null ? `Mesa ${ticket.mesaNumero ?? ticket.mesaId}` : 'Delivery'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {historialListos.length > 0 && (
              <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                  Página {paginaHistorial} de {totalPaginasHistorial} — {historialListos.length} platos
                </p>
                <div style={{ display: 'flex', gap: 8 }} aria-label="Paginación del historial de cocina">
                  <button
                    className="btn btn-ghost"
                    onClick={() => setPaginaHistorial((paginaActual) => Math.max(1, paginaActual - 1))}
                    disabled={paginaHistorial === 1}
                  >
                    Anterior
                  </button>
                  <button
                    className="btn btn-ghost"
                    onClick={() => setPaginaHistorial((paginaActual) => Math.min(totalPaginasHistorial, paginaActual + 1))}
                    disabled={paginaHistorial === totalPaginasHistorial}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
      {feedback && (
        <StaffFeedbackModal
          feedback={feedback}
          onClose={() => setFeedback(null)}
          onAction={async () => {
            setTickets(await listarPedidosCocina());
            setError(null);
          }}
          actionLabel="Actualizar tablero"
        />
      )}
    </div>
  );
}

function EstadoChip({ estado, texto }: { estado: string; texto: string }) {
  return (
    <span className="ys-status" style={{ color: TONE[estado], background: `${TONE[estado]}22` }}>
      <i />
      {texto}
    </span>
  );
}

function DetalleLinea({
  ticket,
  d,
  busy,
  onMove,
}: {
  ticket: Ticket;
  d: TicketLinea;
  busy: boolean;
  onMove: (t: number, d: number, e: EstadoPreparacion) => Promise<void>;
}) {
  const estado = d.estadoPreparacion;
  const minutos = minutosEspera(d.fechaSolicitud);
  const tonoUrgencia = colorUrgencia(minutos);
  return (
    <div style={{ display: 'grid', gap: 6, padding: '8px 0', borderTop: '1px solid var(--line2)' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <EstadoBadge estado={estado} size="lg" />
        <b style={{ minWidth: 22 }}>{d.cantidad}x</b>
        <span style={{ flex: 1 }}>{d.producto}</span>
        {estado === 'P' && (
          <span style={{ fontSize: 11, color: tonoUrgencia, fontWeight: 700, whiteSpace: 'nowrap' }}>
            {minutos} min
          </span>
        )}
      </div>
      {d.notaCocina && <p style={{ margin: 0, fontSize: 12, color: 'var(--gold-light)' }}>{d.notaCocina}</p>}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {estado === 'P' && (
          <button className="btn btn-gold" disabled={busy} onClick={() => void onMove(ticket.id, d.id, 'L')}>
            Marcar listo
          </button>
        )}
        {estado !== 'L' && estado !== 'A' && (
          <button
            className="btn btn-ghost"
            disabled={busy}
            style={{ color: '#fca5a5' }}
            onClick={() => void onMove(ticket.id, d.id, 'A')}
          >
            Anular
          </button>
        )}
      </div>
    </div>
  );
}
