import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CalendarDays, ChevronRight, FileText, Receipt } from 'lucide-react';
import { Loading, Empty } from '../../../components/ui';
import { fmtDate, fmtPEN } from '../../../lib/format';
import { useClienteAuth } from '../auth/cliente-auth-context';

import { API_URL } from '../../../lib/api-url';

export function ClienteHistorialPage() {
  const { token } = useClienteAuth();
  const [tab, setTab] = useState<'pedidos' | 'reservas'>('pedidos');
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [reservas, setReservas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorPedidos, setErrorPedidos] = useState<string | null>(null);
  const [errorReservas, setErrorReservas] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    setLoading(true);
    setErrorPedidos(null);
    setErrorReservas(null);

    if (!token) {
      setErrorPedidos('Inicia sesión para consultar tus pedidos.');
      setErrorReservas('Inicia sesión para consultar tus reservas.');
      setLoading(false);
      return () => { cancelado = true; };
    }

    const cargarLista = async <T,>(ruta: string): Promise<T[]> => {
      const res = await fetch(`${API_URL}${ruta}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('No se pudieron cargar los datos.');
      const body = (await res.json()) as { data?: T[] } | T[];
      return Array.isArray(body) ? body : (body.data ?? []);
    };

    Promise.allSettled([
      cargarLista<any>('/cliente/pedidos?limit=20'),
      cargarLista<any>('/cliente/reservas'),
    ]).then(([pedidosRes, reservasRes]) => {
      if (cancelado) return;
      if (pedidosRes.status === 'fulfilled') setPedidos(pedidosRes.value);
      else setErrorPedidos(pedidosRes.reason instanceof Error ? pedidosRes.reason.message : 'No se pudieron cargar tus pedidos.');
      if (reservasRes.status === 'fulfilled') setReservas(reservasRes.value);
      else setErrorReservas(reservasRes.reason instanceof Error ? reservasRes.reason.message : 'No se pudieron cargar tus reservas.');
      setLoading(false);
    });

    return () => { cancelado = true; };
  }, [token]);

  return (
    <div className="y-shell">
      <main className="y-cliente-page">
        <div className="y-head">
          <Link to="/cliente/inicio" className="y-icon-btn" aria-label="Volver"><ArrowLeft size={18} /></Link>
          <h2 className="font-d" style={{ margin: 0, fontSize: 22 }}>Mi historial</h2>
        </div>
        <section className="y-flow-hero y-cliente-flow-hero" aria-labelledby="historial-title">
          <div className="y-flow-hero__content">
            <span className="y-flow-hero__eyebrow">Tu actividad</span>
            <h1 id="historial-title" className="y-flow-hero__title">Pedidos y reservas.</h1>
            <p className="y-flow-hero__description">La información de esta sección se consulta desde tu cuenta.</p>
          </div>
        </section>
        <div className="y-tabs">
          <button className={tab === 'pedidos' ? 'on' : ''} onClick={() => setTab('pedidos')}>Pedidos</button>
          <button className={tab === 'reservas' ? 'on' : ''} onClick={() => setTab('reservas')}>Reservas</button>
        </div>

        {loading ? (
          <Loading text="Cargando historial…" />
        ) : tab === 'pedidos' ? (
          errorPedidos ? (
            <div className="y-panel y-cliente-empty" role="alert">
              <b>No pudimos consultar tus pedidos</b>
              <p>{errorPedidos}</p>
              {!token && <Link className="y-btn red sm" to="/cliente/login">Iniciar sesión</Link>}
            </div>
          ) : pedidos.length === 0 ? (
            <Empty title="No hay pedidos registrados" sub="Cuando un pedido se registre en tu cuenta, aparecerá aquí." />
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {pedidos.map((p) => (
                <Link key={p.id_pedido ?? p.id} to={`/cliente/pedido/${p.id_pedido ?? p.id}`} className="y-panel y-rcard">
                  <div className="y-avatar"><Receipt size={18} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b style={{ fontSize: 14 }}>Pedido #{p.numero_pedido ?? p.numero ?? p.id}</b>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12, margin: '3px 0 6px' }}>{fmtDate(p.f_pedido ?? p.fecha)}</div>
                    <span className={`y-chip ${p.facturado === 'S' ? 'ok' : 'warn'}`}>
                      {p.facturado === 'S' ? 'Facturado' : p.estado_comanda_derivado ?? p.estadoComandaDerivado ?? p.estado ?? 'Estado no disponible'}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <b style={{ fontFamily: 'var(--font-d)', fontSize: 15 }}>{p.total == null ? '—' : fmtPEN(p.total)}</b>
                    <ChevronRight size={14} style={{ color: 'var(--muted)', marginLeft: 6 }} />
                    {p.facturado === 'S' && (
                      <Link
                        to={`/cliente/comprobante/${p.id_pedido ?? p.id}`}
                        className="mt-2 inline-block text-xs text-brown-600 underline hover:text-brown-800"
                      >
                        <FileText size={12} className="mr-1" /> Ver comprobante
                      </Link>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : (
          errorReservas ? (
            <div className="y-panel y-cliente-empty" role="alert">
              <b>No pudimos consultar tus reservas</b>
              <p>{errorReservas}</p>
              {!token && <Link className="y-btn red sm" to="/cliente/login">Iniciar sesión</Link>}
            </div>
          ) : reservas.length === 0 ? (
            <Empty title="No hay reservas registradas" sub="Cuando envíes una solicitud, aparecerá aquí." />
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {reservas.map((r) => (
                <div key={r.id_reserva ?? r.id} className="y-panel y-rcard">
                  <div className="y-avatar"><CalendarDays size={18} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b style={{ fontSize: 14 }}>Reserva #{r.id_reserva ?? r.id}</b>
                    <div style={{ color: 'var(--muted)', fontSize: 12, margin: '3px 0 6px' }}>
                      {fmtDate(r.f_reserva ?? r.fecha)}{r.n_personas != null ? ` · ${r.n_personas} personas` : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}
