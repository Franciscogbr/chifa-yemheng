import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CalendarDays, UsersRound, ClipboardCheck, Clock3 } from 'lucide-react';
import { Loading, Empty } from '../../../components/ui';
import { ReservaForm, ReservaCard } from '../../../components/ReservaParts';
import type { Reserva } from '../../../types/db';
import { useClienteAuth } from '../auth/cliente-auth-context';

import { API_URL } from '../../../lib/api-url';

export function ClienteReservasPage() {
  const { cliente, token } = useClienteAuth();
  const [tab, setTab] = useState<'mis' | 'nueva'>('mis');
  const [reservasActuales, setReservasActuales] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelado = false;
    const controller = new AbortController();
    if (!cliente) {
      setLoading(false);
      return () => {
        cancelado = true;
        controller.abort();
      };
    }
    if (!token) {
      setError('Inicia sesión nuevamente para consultar tus reservas.');
      setLoading(false);
      return () => {
        cancelado = true;
        controller.abort();
      };
    }

    setLoading(true);
    setError(null);
    fetch(`${API_URL}/cliente/reservas`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('No se pudieron cargar tus reservas.');
        return res.json() as Promise<{ data?: Reserva[] } | Reserva[]>;
      })
      .then((body) => {
        if (cancelado) return;
        setReservasActuales(Array.isArray(body) ? body : (body.data ?? []));
      })
      .catch((e: unknown) => {
        if (!cancelado && !controller.signal.aborted) {
          setError(e instanceof Error ? e.message : 'No se pudieron cargar tus reservas.');
        }
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });

    return () => {
      cancelado = true;
      controller.abort();
    };
  }, [cliente, token, refreshKey]);

  function onDone() {
    setTab('mis');
    setRefreshKey((key) => key + 1);
  }

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
                    <ReservaCard key={r.id_reserva} r={r} nombre={cliente?.nombre} />
                  ))}
                </div>
              </>
            </div>
          )}
        </div>
      ) : loading ? (
        <Loading text="Cargando reservas…" />
      ) : error ? (
        <div className="y-panel y-cliente-empty" role="alert">
          <b>No pudimos consultar tus reservas</b>
          <p>{error}</p>
          <button className="y-btn line sm" onClick={() => setTab('nueva')}>Solicitar una reserva</button>
        </div>
      ) : reservasActuales.length === 0 ? (
        <Empty title="No hay reservas registradas" sub="Cuando envíes una solicitud, aparecerá aquí." />
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {reservasActuales.map((r) => (
            <ReservaCard key={r.id_reserva} r={r} nombre={cliente?.nombre} />
          ))}
        </div>
      )}
      </main>
    </div>
  );
}