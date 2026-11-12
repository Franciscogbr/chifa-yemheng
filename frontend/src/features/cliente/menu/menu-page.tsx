import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ScanLine, ClipboardCheck, Truck } from 'lucide-react';
import { useCart } from '../../../contexts/CartContext';
import { QrScannerModal } from '../../../components/QrScannerModal';
import { useClienteAuth } from '../auth/cliente-auth-context';

import { API_URL } from '../../../lib/api-url';

interface ProductoApi {
  id: number;
  nombre: string;
  precio: number;
  disponible: boolean;
  categoria: string;
  imagen: string | null;
  detalle: string | null;
  estado: string;
}

export function ClienteMenuPage() {
  const { add, mesaId, setMesaId, count } = useCart();
  const { cliente } = useClienteAuth();
  const [productos, setProductos] = useState<ProductoApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cat, setCat] = useState<string>('');
  const [q, setQ] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [ultimoAgregado, setUltimoAgregado] = useState('');
  const [loginPromptVisible, setLoginPromptVisible] = useState(false);
  const [loginPromptKey, setLoginPromptKey] = useState(0);
  const loginPromptTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelado = false;
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('chifa.cliente.token') ?? localStorage.getItem('chifa.token') ?? '';
    fetch(`${API_URL}/productos?limit=100`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(async (res) => {
        if (!res.ok) throw new Error('NETWORK_ERROR');
        return res.json();
      })
      .then((body: { data?: ProductoApi[] } | ProductoApi[]) => {
        if (cancelado) return;
        const list = Array.isArray(body) ? body : (body.data ?? []);
        setProductos(list);
      })
      .catch(() => {
        if (!cancelado) setError('No se pudo cargar la carta.');
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });
    return () => { cancelado = true; };
  }, []);

  useEffect(() => () => {
    if (loginPromptTimer.current) clearTimeout(loginPromptTimer.current);
  }, []);

  const disponibles = productos.filter((p) => p.disponible !== false && p.estado === 'A');
  const categorias = Array.from(new Set(disponibles.map((p) => p.categoria).filter(Boolean))) as string[];
  const filtrados = disponibles.filter((p) => {
    if (cat && p.categoria !== cat) return false;
    if (q && !p.nombre.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="y-shell">
      <main className="y-cliente-page">
        <section className="y-flow-hero y-cliente-flow-hero" aria-labelledby="cliente-menu-title">
          <div className="y-flow-hero__content">
            <span className="y-flow-hero__eyebrow">Carta</span>
            <h1 id="cliente-menu-title" className="y-flow-hero__title">Elige lo que te provoca.</h1>
            <p className="y-flow-hero__description">
              Consulta los productos y precios vigentes publicados en la carta.
            </p>
            {!loading && !error && (
              <div className="y-cliente-hero__details">
                <span className="y-cliente-hero__detail">
                  {disponibles.length} {disponibles.length === 1 ? 'producto disponible' : 'productos disponibles'}
                </span>
                {mesaId && <span className="y-cliente-hero__detail">Mesa {mesaId}</span>}
                {cliente && !mesaId && count > 0 && (
                  <span className="y-cliente-hero__detail">
                    {count} {count === 1 ? 'plato en tu pedido' : 'platos en tu pedido'}
                  </span>
                )}
              </div>
            )}
            <div className="y-flow-hero__actions y-client-actions">
              {mesaId ? (
                <>
                  {count > 0 ? (
                    <a className="y-btn y-btn-hero y-client-action-primary" href="#carta-productos">
                      Seguir explorando
                    </a>
                  ) : (
                    <Link className="y-btn y-btn-hero y-client-action-primary" to="/cliente/mi-consumo">
                      Ver mi comanda
                    </Link>
                  )}
                  {count > 0 && (
                    <Link className="y-btn y-btn-hero-secondary y-client-action-secondary" to="/cliente/mi-consumo">
                      Ver mi comanda
                    </Link>
                  )}
                </>
              ) : cliente ? (
                <>
                  {count > 0 ? (
                    <Link className="y-btn y-btn-hero y-client-action-primary" to="/cliente/delivery">
                      <Truck size={17} aria-hidden="true" />
                      Continuar con delivery
                    </Link>
                  ) : (
                    <a className="y-btn y-btn-hero y-client-action-primary" href="#carta-productos">
                      <Truck size={17} aria-hidden="true" />
                      Elegir platos para delivery
                    </a>
                  )}
                  <button className="y-btn y-btn-hero-secondary y-client-action-secondary" onClick={() => setScannerOpen(true)}>
                    <ScanLine size={17} aria-hidden="true" />
                    Pedir en el local
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </section>
      <div id="carta-productos" style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', scrollMarginTop: 96 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar plato…"
          className="y-search"
          style={{ flex: 1, minWidth: 200 }}
        />
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="y-search" style={{ minWidth: 160 }}>
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <p className="y-menu-feedback" role="status" aria-live="polite">
        {ultimoAgregado ? `${ultimoAgregado} agregado a tu pedido.` : ''}
      </p>
      {loginPromptVisible && (
        <div key={loginPromptKey} className="y-login-toast" role="status" aria-live="polite">
          Inicia sesión para pedir tu plato
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Cargando carta…</p>
      ) : error ? (
        <div className="y-panel y-cliente-empty" role="alert">
          <b>No pudimos cargar la carta</b>
          <p>{error}</p>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="y-panel y-cliente-empty" role="status">
          <b>{q || cat ? 'No encontramos coincidencias' : 'No hay productos disponibles'}</b>
          <p>
            {q || cat
              ? 'Prueba con otro término de búsqueda o selecciona otra categoría.'
              : 'La carta no tiene productos disponibles en este momento.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {filtrados.map((p) => (
            <div key={p.id} className="y-dish y-panel">
              {p.imagen ? (
                <img src={p.imagen} alt={p.nombre} loading="lazy" decoding="async" />
              ) : (
                <div className="y-ph" role="img" aria-label={`Imagen no disponible para ${p.nombre}`} />
              )}
              <div className="b">
                <b style={{ fontSize: 14 }}>{p.nombre}</b>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.4 }}>{p.detalle}</p>
                <div className="row">
                  <span className="y-price">S/ {Number(p.precio).toFixed(2)}</span>
                  <button
                    className="y-plus"
                    onClick={() => {
                      if (!cliente) {
                        setLoginPromptKey((key) => key + 1);
                        setLoginPromptVisible(true);
                        window.dispatchEvent(new Event('cliente:login-required'));
                        if (loginPromptTimer.current) clearTimeout(loginPromptTimer.current);
                        loginPromptTimer.current = setTimeout(() => setLoginPromptVisible(false), 2800);
                        return;
                      }
                      add({ id_producto: p.id, n_producto: p.nombre, precio: p.precio, disponible: p.disponible ? 'S' : 'N', categoria: p.categoria, imagen: p.imagen, estado: p.estado } as any, 1);
                      setUltimoAgregado(p.nombre);
                    }}
                    aria-label={cliente ? `Agregar ${p.nombre} a tu pedido` : `Inicia sesión para agregar ${p.nombre}`}
                    title={cliente ? `Agregar ${p.nombre}` : 'Inicia sesión para pedir'}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!cliente && (
        <section className="y-guest-content y-menu-guest-guide" aria-label="Cómo pedir desde la carta">
          <div className="y-guest-section-heading">
            <span className="y-cliente-kicker">Tu pedido, a tu ritmo</span>
            <h2>De la carta a tu mesa</h2>
            <p>Explora primero; cuando quieras pedir, estos son los pasos.</p>
          </div>
          <div className="y-guest-steps">
            <article className="y-panel y-guest-step">
              <span className="y-guest-step__icon"><BookOpen size={23} /></span>
              <span className="y-guest-step__number">01</span>
              <h2>Explora la carta</h2>
              <p>Busca platos, revisa sus descripciones y consulta los precios publicados.</p>
            </article>
            <article className="y-panel y-guest-step">
              <span className="y-guest-step__icon"><ScanLine size={23} /></span>
              <span className="y-guest-step__number">02</span>
              <h2>Vincula tu mesa</h2>
              <p>Para pedir en el local, inicia sesión y escanea el QR de tu mesa.</p>
            </article>
            <article className="y-panel y-guest-step">
              <span className="y-guest-step__icon"><ClipboardCheck size={23} /></span>
              <span className="y-guest-step__number">03</span>
              <h2>Confirma tu selección</h2>
              <p>Revisa tu carrito antes de enviar los platos a cocina.</p>
            </article>
          </div>
          <div className="y-guest-explore-links">
            <Link to="/cliente/reservas">¿Planeas visitarnos? Conoce las reservas <span aria-hidden="true">→</span></Link>
            <Link to="/cliente/delivery">¿Prefieres pedir a casa? Conoce el delivery <span aria-hidden="true">→</span></Link>
          </div>
        </section>
      )}

      <QrScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={(codigo) => {
          setMesaId(codigo);
          setScannerOpen(false);
        }}
      />
      </main>
    </div>
  );
}