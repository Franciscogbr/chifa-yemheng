import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarDays, UsersRound, ClipboardCheck, Clock3, ScanLine, Bell, X } from 'lucide-react';
import { Loading, Empty } from '../../../components/ui';
import { ReservaForm, ReservaCard } from '../../../components/ReservaParts';
import { QrScannerModal } from '../../../components/QrScannerModal';
import type { Reserva } from '../../../types/db';
import { useClienteAuth } from '../auth/cliente-auth-context';
import { useReservasRefresco } from '../../../shared/hooks/useReservasRefresco';
import { useCart } from '../../../contexts/CartContext';
import { guardarModoCliente, marcarQrValidado } from '../auth/cliente-mode';

import { API_URL } from '../../../lib/api-url';

export function ClienteReservasPage() {
  const { cliente, token } = useClienteAuth();
  const { setMesaId, setReservaId, clear } = useCart();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'mis' | 'nueva'>('mis');
  const [reservasActuales, setReservasActuales] = useState<Reserva[]>([]);
  const [reservasHistorial, setReservasHistorial] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [reservaAccionId, setReservaAccionId] = useState<number | null>(null);
  const [mensajeAccion, setMensajeAccion] = useState<string | null>(null);
  const [historialAbierto, setHistorialAbierto] = useState(false);
  const [paginaHistorial, setPaginaHistorial] = useState(1);
  const [reservaSeleccionada, setReservaSeleccionada] = useState<{
    id: number;
    mesaId: number;
    canalAtencion: 'QR' | null;
  } | null>(null);
  const [scannerReservaAbierto, setScannerReservaAbierto] = useState(false);

  const cargarReservas = async () => {
    if (!cliente || !token) return;
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    try {
      const res = await fetch(`${API_URL}/cliente/reservas`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      if (!res.ok) throw new Error('No se pudieron cargar tus reservas.');
      const body = (await res.json()) as { data?: Reserva[] } | Reserva[];
      const reservas = Array.isArray(body) ? body : (body.data ?? []);
      // Las más recientes primero; fechas nulas van al final
      reservas.sort((a, b) => {
        const aFecha = a.f_reserva ? new Date(a.f_reserva).getTime() : -1;
        const bFecha = b.f_reserva ? new Date(b.f_reserva).getTime() : -1;
        return bFecha - aFecha;
      });
      // Atendida sigue activa: el cliente todavía puede elegir/continuar por QR o esperar al mozo.
      const reservasActivas = reservas.filter((r) => ['P', 'C', 'A'].includes(String(r.situacion)));
      const reservasHistorial = reservas.filter((r) => !['P', 'C', 'A'].includes(String(r.situacion)));
      setReservasActuales(reservasActivas);
      setReservasHistorial(reservasHistorial);
    } catch (e: unknown) {
      if (!controller.signal.aborted) {
        setError(e instanceof Error ? e.message : 'No se pudieron cargar tus reservas.');
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  const { refrescando } = useReservasRefresco(cargarReservas, 10000);

  useEffect(() => {
    void cargarReservas();
  }, [cliente, token, refreshKey]);

  function onDone() {
    setTab('mis');
    setRefreshKey((key) => key + 1);
  }

  async function continuarReserva(reserva: Reserva) {
    if (!token) {
      setMensajeAccion('Tu sesión venció. Inicia sesión nuevamente para continuar.');
      return;
    }
    setReservaAccionId(reserva.id_reserva);
    setMensajeAccion(null);
    try {
      const response = await fetch(
        `${API_URL}/cliente/reservas/${reserva.id_reserva}/continuar`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const body = await response.json().catch(() => ({})) as {
        error?: string;
        pedidoId?: number | null;
        mesaId?: number | null;
        canalAtencion?: 'QR' | 'MOZO' | null;
      };
      if (!response.ok) {
        throw new Error(body.error ?? 'No se pudo continuar con esta reserva.');
      }
      if (body.pedidoId) {
        navigate(`/cliente/pedido/${body.pedidoId}`);
        return;
      }
      if (!body.mesaId) {
        throw new Error('La reserva no tiene una mesa asignada para continuar.');
      }
      if (body.canalAtencion === 'MOZO') {
        setMensajeAccion('Esta reserva ya está esperando la atención del mozo.');
        return;
      }
      const seleccion = {
        id: reserva.id_reserva,
        mesaId: body.mesaId,
        canalAtencion: body.canalAtencion === 'QR' ? 'QR' as const : null,
      };
      setReservaSeleccionada(seleccion);
      if (seleccion.canalAtencion === 'QR') setScannerReservaAbierto(true);
    } catch (error) {
      setMensajeAccion(
        error instanceof Error ? error.message : 'No se pudo continuar con esta reserva.',
      );
    } finally {
      setReservaAccionId(null);
    }
  }

  async function elegirAtencionReserva(canal: 'QR' | 'MOZO') {
    const seleccion = reservaSeleccionada;
    if (!seleccion || !token) {
      setMensajeAccion('Tu sesión venció. Inicia sesión nuevamente para continuar.');
      return;
    }
    if (canal === 'QR') {
      setScannerReservaAbierto(true);
      return;
    }
    await guardarAtencionReserva(seleccion, canal);
  }

  async function guardarAtencionReserva(
    seleccion: { id: number; mesaId: number; canalAtencion?: 'QR' | null },
    canal: 'QR' | 'MOZO',
  ) {
    if (!token) return;
    setReservaAccionId(seleccion.id);
    setMensajeAccion(null);
    try {
      const response = await fetch(`${API_URL}/cliente/pedidos/reserva/atencion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reservaId: seleccion.id,
          mesaId: seleccion.mesaId,
          canal,
        }),
      });
      const body = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) {
        const mensajes: Record<string, string> = {
          RESERVA_NOT_FOUND: 'No encontramos una reserva activa asociada a tu cuenta.',
          RESERVA_MESA_NO_COINCIDE: 'Ese QR no corresponde a la mesa asignada a esta reserva.',
          RESERVA_CONTINUAR_NO_DISPONIBLE: 'La reserva ya no está disponible para elegir cómo pedir.',
          RESERVA_CANAL_YA_ELEGIDO: 'Ya elegiste cómo hacer tu pedido para esta reserva.',
        };
        throw new Error(mensajes[body.error ?? ''] ?? body.error ?? 'No se pudo registrar tu opción de atención.');
      }

      setReservaSeleccionada(null);
      if (canal === 'QR') {
        clear();
        setMesaId(String(seleccion.mesaId));
        setReservaId(seleccion.id);
        guardarModoCliente('local');
        marcarQrValidado();
        navigate('/cliente/menu');
      } else {
        setMensajeAccion('Listo. Avisamos al mozo que estás esperando atención en tu mesa.');
        setRefreshKey((key) => key + 1);
      }
    } catch (error) {
      setMensajeAccion(error instanceof Error ? error.message : 'No se pudo registrar tu opción de atención.');
    } finally {
      setReservaAccionId(null);
    }
  }

  function procesarQrReserva(mesaQrId: string) {
    const seleccion = reservaSeleccionada;
    setScannerReservaAbierto(false);
    if (!seleccion || Number(mesaQrId) !== seleccion.mesaId) {
      setMensajeAccion('Ese QR no corresponde a la mesa asignada a esta reserva. Escanea el QR de tu mesa reservada.');
      return;
    }
    void guardarAtencionReserva(seleccion, 'QR');
  }

  async function cancelarReserva(reserva: Reserva) {
    if (!token || !window.confirm('¿Quieres cancelar esta reserva?')) return;
    setReservaAccionId(reserva.id_reserva);
    setMensajeAccion(null);
    try {
      const response = await fetch(`${API_URL}/cliente/reservas/${reserva.id_reserva}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) {
        if (body.error === 'RESERVA_CON_PEDIDO') {
          throw new Error('No se puede cancelar: la reserva ya tiene un pedido asociado.');
        }
        throw new Error(body.error ?? 'No se pudo cancelar la reserva.');
      }
      setRefreshKey((key) => key + 1);
    } catch (error) {
      setMensajeAccion(
        error instanceof Error ? error.message : 'No se pudo cancelar la reserva.',
      );
    } finally {
      setReservaAccionId(null);
    }
  }

  const accionesReserva = {
    onContinuar: (reserva: Reserva) => void continuarReserva(reserva),
    onCancelar: (reserva: Reserva) => void cancelarReserva(reserva),
    busy: reservaAccionId != null,
  };
  const reservasActivas = reservasActuales.filter((r) => ['P', 'C', 'A'].includes(String(r.situacion)));
  const historialPorPagina = 5;
  const totalPaginasHistorial = Math.max(1, Math.ceil(reservasHistorial.length / historialPorPagina));
  const paginaHistorialSegura = Math.min(paginaHistorial, totalPaginasHistorial);
  const reservasHistorialPagina = reservasHistorial.slice(
    (paginaHistorialSegura - 1) * historialPorPagina,
    paginaHistorialSegura * historialPorPagina,
  );

  if (!cliente) {
    return (
      <div className="y-shell">
        <main className="y-cliente-page">
          <div className="y-head">
            <Link to="/cliente/inicio" className="y-icon-btn" aria-label="Volver"><ArrowLeft size={18} /></Link>
            <h2 className="font-d" style={{ margin: 0, fontSize: 22 }}>Reservas</h2>
          </div>
          <section className="y-flow-hero y-cliente-flow-hero" aria-labelledby="reservas-guest-title">
            <div className="y-flow-hero__content">
              <span className="y-flow-hero__eyebrow"><CalendarDays size={14} /> Reservas</span>
              <h1 id="reservas-guest-title" className="y-flow-hero__title">Solicita una mesa.</h1>
              <p className="y-flow-hero__description">
                Cuéntanos cuándo vienes y para cuántas personas. Podrás revisar el estado de tu solicitud desde tu cuenta.
              </p>
            </div>
          </section>
          <section className="y-guest-content" aria-label="Cómo solicitar una reserva">
            <div className="y-guest-section-heading">
              <span className="y-cliente-kicker">Una visita para disfrutar</span>
              <h2>Planea tu momento en Yemheng</h2>
              <p>Organiza los detalles de tu visita y el equipo revisará tu solicitud.</p>
            </div>
            <div className="y-guest-steps">
              <article className="y-panel y-guest-step">
                <span className="y-guest-step__icon"><CalendarDays size={23} /></span>
                <span className="y-guest-step__number">01</span>
                <h2>Elige cuándo venir</h2>
                <p>Indica la fecha y hora que prefieres para tu visita.</p>
              </article>
              <article className="y-panel y-guest-step">
                <span className="y-guest-step__icon"><UsersRound size={23} /></span>
                <span className="y-guest-step__number">02</span>
                <h2>Cuéntanos cuántos son</h2>
                <p>Agrega la cantidad de personas y cualquier observación importante.</p>
              </article>
              <article className="y-panel y-guest-step">
                <span className="y-guest-step__icon"><ClipboardCheck size={23} /></span>
                <span className="y-guest-step__number">03</span>
                <h2>Envía tu solicitud</h2>
                <p>El equipo revisará la solicitud y podrás consultar su estado desde tu cuenta.</p>
              </article>
            </div>
            <div className="y-guest-note">
              <Clock3 size={18} />
              <p>Enviar una solicitud no confirma automáticamente una mesa; espera la confirmación del local.</p>
            </div>
            <div className="y-guest-explore-links">
              <Link to="/cliente/menu">Descubre la carta antes de venir <span aria-hidden="true">→</span></Link>
              <Link to="/cliente/delivery">¿Te quedas en casa? Conoce el delivery <span aria-hidden="true">→</span></Link>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="y-shell">
      <main className="y-cliente-page">
        <div className="y-head">
          <Link to="/cliente/inicio" className="y-icon-btn" aria-label="Volver"><ArrowLeft size={18} /></Link>
          <h2 className="font-d" style={{ margin: 0, fontSize: 22 }}>Reservas</h2>
        </div>
        <section className="y-flow-hero y-cliente-flow-hero" aria-labelledby="reservas-title">
          <div className="y-flow-hero__content">
            <span className="y-flow-hero__eyebrow">Tu cuenta</span>
            <h1 id="reservas-title" className="y-flow-hero__title">Tus reservas, en un solo lugar.</h1>
            <p className="y-flow-hero__description">Consulta el estado de las solicitudes vinculadas a tu cuenta o envía una nueva.</p>
          </div>
        </section>
        <div className="y-tabs">
          <button className={tab === 'mis' ? 'on' : ''} onClick={() => setTab('mis')}>Mis reservas</button>
          <button className={tab === 'nueva' ? 'on' : ''} onClick={() => setTab('nueva')}>Nueva reserva</button>
        </div>
        {mensajeAccion && <p className="y-reserva-form__message" role="alert">{mensajeAccion}</p>}

      {tab === 'nueva' ? (
        <div className={`y-reservas-layout${reservasActuales.length === 0 ? ' y-reservas-layout--single' : ''}`}>
            <div>
              <ReservaForm onDone={onDone} baseUrl="/api/v1/cliente/reservas" token={token} />
            </div>
          {reservasActuales.length > 0 && (
            <div>
              <>
                <h3 className="font-d" style={{ fontSize: 16, margin: '0 0 10px' }}>Mis reservas</h3>
                <div style={{ display: 'grid', gap: 10 }}>
                  {reservasActuales.map((r) => (
                    <ReservaCard key={r.id_reserva} r={r} nombre={cliente?.nombre} {...accionesReserva} />
                  ))}
                </div>
              </>
            </div>
          )}
        </div>
      ) : ((loading && reservasActuales.length === 0 && reservasHistorial.length === 0) && !refrescando) ? (
        <Loading text="Cargando reservas…" />
      ) : error ? (
        <div className="y-panel y-cliente-empty" role="alert">
          <b>No pudimos consultar tus reservas</b>
          <p>{error}</p>
          <button className="y-btn line sm" onClick={() => setTab('nueva')}>Solicitar una reserva</button>
        </div>
      ) : (
        <section aria-label="Reservas activas">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-d" style={{ fontSize: 18, margin: 0 }}>Reservas activas</h3>
              <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 12 }}>
                Solicitudes pendientes y reservas confirmadas.
              </p>
            </div>
            <button
              type="button"
              className="y-btn line sm"
              onClick={() => { setPaginaHistorial(1); setHistorialAbierto(true); }}
            >
              Ver historial de reservas ({reservasHistorial.length})
            </button>
          </div>
          {reservasActivas.length > 0 ? (
            <div style={{ display: 'grid', gap: 10 }}>
              {reservasActivas.map((r) => (
                <ReservaCard key={r.id_reserva} r={r} nombre={cliente?.nombre} {...accionesReserva} />
              ))}
            </div>
          ) : (
            <Empty title="No tienes reservas activas" sub="Tus reservas atendidas o canceladas están en el historial." />
          )}
        </section>
      )}
      {historialAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setHistorialAbierto(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="historial-reservas-title"
            className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 id="historial-reservas-title" className="font-d text-xl font-bold text-[#7F1518]">
                  Historial de reservas
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Reservas atendidas y canceladas, de la más reciente a la más antigua.
                </p>
              </div>
              <button
                type="button"
                aria-label="Cerrar historial"
                onClick={() => setHistorialAbierto(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>
            {reservasHistorial.length === 0 ? (
              <Empty title="Historial vacío" sub="Las reservas atendidas o canceladas aparecerán aquí." />
            ) : (
              <>
                <div className="grid max-h-[60vh] gap-3 overflow-y-auto p-1">
                  {reservasHistorialPagina.map((r) => (
                    <ReservaCard key={r.id_reserva} r={r} nombre={cliente?.nombre} />
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="text-xs text-gray-500">
                    {reservasHistorial.length} reservas · Página {paginaHistorialSegura} de {totalPaginasHistorial}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="y-btn line sm"
                      disabled={paginaHistorialSegura <= 1}
                      onClick={() => setPaginaHistorial((page) => Math.max(1, page - 1))}
                    >
                      Anterior
                    </button>
                    <button
                      type="button"
                      className="y-btn line sm"
                      disabled={paginaHistorialSegura >= totalPaginasHistorial}
                      onClick={() => setPaginaHistorial((page) => Math.min(totalPaginasHistorial, page + 1))}
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      )}
      {reservaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="reserva-atencion-titulo"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="reserva-atencion-titulo" className="text-xl font-bold text-[#7F1518]">
                  {reservaSeleccionada.canalAtencion === 'QR' ? 'Continúa por QR' : '¿Cómo quieres hacer tu pedido?'}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  {reservaSeleccionada.canalAtencion === 'QR'
                    ? 'Ya elegiste pedir por QR. Escanea el código de la mesa asignada a tu reserva.'
                    : 'Para pedir por QR, escanea el código de la mesa asignada a tu reserva.'}
                </p>
                {mensajeAccion && <p role="alert" className="mt-2 text-sm text-[#A61E22]">{mensajeAccion}</p>}
              </div>
              <button
                type="button"
                aria-label="Cerrar opciones"
                onClick={() => setReservaSeleccionada(null)}
                disabled={reservaAccionId != null}
                className="rounded-lg p-1 text-gray-500 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-5 grid gap-3">
              <button
                type="button"
                onClick={() => void elegirAtencionReserva('QR')}
                disabled={reservaAccionId != null}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#A61E22] px-5 py-3 font-semibold text-white disabled:opacity-60"
              >
                <ScanLine size={18} />
                {reservaSeleccionada.canalAtencion === 'QR' ? 'Volver a escanear QR' : 'Pedir por QR'}
              </button>
              {reservaSeleccionada.canalAtencion == null && (
                <button
                  type="button"
                  onClick={() => void elegirAtencionReserva('MOZO')}
                  disabled={reservaAccionId != null}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#A61E22] px-5 py-3 font-semibold text-[#7F1518] disabled:opacity-60"
                >
                  <Bell size={18} />
                  Solicitar atención del mozo
                </button>
              )}
              <button
                type="button"
                onClick={() => setReservaSeleccionada(null)}
                disabled={reservaAccionId != null}
                className="rounded-xl px-5 py-2 text-sm text-gray-600 hover:bg-gray-100"
              >
                Ahora no
              </button>
            </div>
          </section>
        </div>
      )}
      <QrScannerModal
        open={scannerReservaAbierto}
        onClose={() => setScannerReservaAbierto(false)}
        onScan={procesarQrReserva}
      />
      </main>
    </div>
  );
}
