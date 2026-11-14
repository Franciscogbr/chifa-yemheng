import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import { Ico } from '../../../components/Icon';
import { QrScannerModal } from '../../../components/QrScannerModal';
import { useClienteAuth } from '../auth/cliente-auth-context';
import { mensajeError } from '../../../shared/errors';

import { API_URL } from '../../../lib/api-url';
const PLACEHOLDER_IMG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" fill="none"%3E%3Crect width="96" height="96" fill="%23f0eded"/%3E%3Ctext x="48" y="54" text-anchor="middle" font-family="system-ui" font-size="28" fill="%238e706d"%3E🍽️%3C/text%3E%3C/svg%3E';

export function ClienteComandaPage() {
  const { items, mesaId, reservaId, setMesaId, setQty, remove, clear, subtotal, igv, total } = useCart();
  const { cliente } = useClienteAuth();
  const navigate = useNavigate();
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [pedidoId, setPedidoId] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  useEffect(() => {
    if (!mesaId) {
      setErr(null);
    }
  }, [mesaId]);

  async function enviarTanda() {
    if (!mesaId || items.length === 0) return;

    const token = localStorage.getItem('chifa.cliente.token');
    if (!token) {
      sessionStorage.setItem('chifa.cliente.pending_mesa', mesaId);
      navigate(`/cliente/login?redirect=comanda&mesa=${encodeURIComponent(mesaId)}`);
      return;
    }

    setEnviando(true);
    setMsg(null);
    setPedidoId(null);
    setErr(null);

    const detalles = items.map((it) => ({
      producto: it.producto.id_producto,
      cantidad: it.cantidad,
      nota: it.nota || '',
      descuento: 0,
    }));

    try {
      const r = await fetch(`${API_URL}/cliente/pedidos/tanda`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...(reservaId != null ? { reservaId } : { mesa: Number(mesaId) }),
          comensales: 1,
          obs: '',
          detalles,
        }),
      });
      if (!r.ok) {
        const b = (await r.json().catch(() => ({}))) as { error?: string };
        throw new Error(b.error ?? `API ${r.status}`);
      }
      const data = (await r.json()) as { id?: number; pedidoId?: number };
      const pedidoIdNum = data.id ?? data.pedidoId ?? null;
      setMsg('Comanda enviada. Sigue el estado en tiempo real.');
      setPedidoId(pedidoIdNum ?? null);
      clear();
      sessionStorage.removeItem('chifa.cliente.pending_mesa');
    } catch (e) {
      const code = (e as Error).message;
      setErr(mensajeError(code) || 'No se pudo enviar el pedido.');
    } finally {
      setEnviando(false);
    }
  }

  const itemLineTotal = (it: { producto: { precio: number }; cantidad: number }) =>
    it.cantidad * Number(it.producto.precio);

  const totalQty = items.reduce((s, x) => s + x.cantidad, 0);

  return (
    <>
      {!mesaId ? (
        <div className="y-qr-hero-layout">
          <header className="y-qr-hero-header">
            <div className="y-qr-logo">Y E M H E N G</div>
            <div className="y-qr-tagline">CHIFA PERUANO</div>
          </header>

          <main className="y-qr-hero-main">
            <p className="y-qr-instruction">APUNTA TU CÁMARA AL QR</p>

            <div className="y-qr-illustration" aria-hidden="true">
              <svg className="y-qr-phone" viewBox="0 0 200 360" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Celular escaneando código QR">
                {/* Cuerpo del celular */}
                <rect x="20" y="10" width="160" height="340" rx="32" fill="var(--cocoa)" />
                <rect x="30" y="24" width="140" height="312" rx="22" fill="var(--surface-lowest)" />

                {/* Pantalla del celular */}
                <rect x="38" y="42" width="124" height="276" rx="16" fill="var(--surface-low)" />

                {/* Marco QR en la pantalla */}
                <rect x="62" y="88" width="76" height="76" rx="8" fill="var(--surface-lowest)" stroke="var(--primary)" strokeWidth="2" />

                {/* Patrón QR simulado */}
                <g fill="var(--primary)">
                  <rect x="66" y="92" width="8" height="8" />
                  <rect x="78" y="92" width="8" height="8" />
                  <rect x="90" y="92" width="8" height="8" />
                  <rect x="102" y="92" width="8" height="8" />
                  <rect x="114" y="92" width="8" height="8" />
                  <rect x="66" y="104" width="8" height="8" />
                  <rect x="114" y="104" width="8" height="8" />
                  <rect x="66" y="116" width="8" height="8" />
                  <rect x="114" y="116" width="8" height="8" />
                  <rect x="66" y="128" width="8" height="8" />
                  <rect x="78" y="128" width="8" height="8" />
                  <rect x="90" y="128" width="8" height="8" />
                  <rect x="102" y="128" width="8" height="8" />
                  <rect x="114" y="128" width="8" height="8" />
                  <rect x="66" y="140" width="8" height="8" />
                  <rect x="114" y="140" width="8" height="8" />
                  <rect x="66" y="152" width="8" height="8" />
                  <rect x="78" y="152" width="8" height="8" />
                  <rect x="90" y="152" width="8" height="8" />
                  <rect x="102" y="152" width="8" height="8" />
                  <rect x="114" y="152" width="8" height="8" />
                </g>

                {/* Línea de escaneo animada */}
                <rect x="62" y="88" width="76" height="2" className="y-qr-scanline-svg" fill="url(#scanGradient)" />

                {/* Cámara superior */}
                <circle cx="100" cy="20" r="6" fill="var(--cocoa)" opacity="0.6" />

                {/* Botón inferior */}
                <rect x="90" y="318" width="20" height="4" rx="2" fill="var(--cocoa)" opacity="0.3" />
                <defs>
                  <linearGradient id="scanGradient" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0" />
                    <stop offset="50%" stopColor="var(--primary)" stopOpacity="1" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="y-qr-actions">
              {cliente ? (
                <button
                  className="y-btn y-btn-qr-primary"
                  onClick={() => setScannerOpen(true)}
                  style={{ width: '100%', maxWidth: 320, padding: '16px 24px', fontSize: 15 }}
                >
                  <span style={{ marginRight: 10, display: 'inline-flex' }}><Ico n="user" size={20} /></span>
                  Continuar con tu cuenta
                </button>
              ) : (
                <button
                  className="y-btn y-btn-qr-primary"
                  onClick={() => {
                    navigate(`/cliente/login?redirect=comanda`);
                  }}
                  style={{ width: '100%', maxWidth: 320, padding: '16px 24px', fontSize: 15 }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: 10, flex: 'none' }}>
                    <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Iniciar sesión primero para escanear mesa
                </button>
              )}
            </div>
          </main>
        </div>
      ) : (
        <div className="y-comanda-layout">
          <section className="y-flow-hero y-comanda-page-hero" aria-labelledby="comanda-hero-title">
            <div className="y-flow-hero__content">
              <span className="y-flow-hero__eyebrow">Pedido en mesa {mesaId}</span>
              <h1 id="comanda-hero-title" className="y-flow-hero__title">Arma tu comanda a tu ritmo.</h1>
              {(msg || items.length > 0) && (
                <p className="y-flow-hero__description">
                  {msg ?? `${items.length} ${items.length === 1 ? 'plato' : 'platos'} · ${totalQty} unidades en tu carrito. Revisa la selección antes de enviarla a cocina.`}
                </p>
              )}
              <div className="y-flow-hero__actions y-client-actions">
                {msg && pedidoId != null ? (
                  <>
                    <Link className="y-btn y-btn-hero y-client-action-primary" to={`/cliente/pedido/${pedidoId}`}>
                      Ver mi comanda
                    </Link>
                    <Link className="y-btn y-btn-hero-secondary y-client-action-secondary" to="/cliente/menu">
                      Agregar otra tanda
                    </Link>
                  </>
                ) : (
                  <>
                    <Link className="y-btn y-btn-hero-secondary y-client-action-secondary" to="/cliente/menu">
                      {items.length > 0 ? 'Agregar más platos' : 'Elegir platos'}
                    </Link>
                    <Link className="y-btn y-btn-hero-secondary y-client-action-secondary" to="/cliente/mi-consumo">
                      Ver mi comanda
                    </Link>
                  </>
                )}
              </div>
            </div>
          </section>

          <div className="y-comanda-body">
            <section className="y-comanda-items" aria-label="Platos en la comanda">
              {err && (
                <div className="y-banner" style={{ marginBottom: 12, borderColor: '#ba1a1a', background: '#ffdad6', color: '#93000a' }}>
                  <Ico n="err" /> {err}
                </div>
              )}

              {items.length === 0 && !msg ? (
                <div className="y-panel" style={{ padding: 32, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <div style={{ color: 'var(--muted)', marginBottom: 12, display: 'block' }}>
                    <Ico n="store" size={48} />
                  </div>
                  <p style={{ color: 'var(--muted)', margin: 0 }}>No hay productos seleccionados en el carrito.</p>
                </div>
              ) : items.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {items.map((it, index) => (
                    <div
                      key={it.producto.id_producto}
                      className="y-comanda-item"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <button
                        className="y-comanda-remove"
                        onClick={() => remove(it.producto.id_producto)}
                        aria-label={`Quitar ${it.producto.n_producto}`}
                      >
                        <Ico n="err" size={18} />
                      </button>
                      <div className="y-comanda-img-wrap">
                        <img
                          src={it.producto.imagen || PLACEHOLDER_IMG}
                          alt={it.producto.n_producto}
                          className="y-comanda-img"
                          loading="lazy"
                        />
                      </div>
                      <div className="y-comanda-info">
                        <h3 className="y-comanda-name">{it.producto.n_producto}</h3>
                        {it.nota && (
                          <p className="y-comanda-note">📝 {it.nota}</p>
                        )}
                        <div className="y-qty-hero">
                          <button
                            onClick={() => setQty(it.producto.id_producto, it.cantidad - 1)}
                            disabled={it.cantidad <= 1}
                            aria-label="Disminuir cantidad"
                          >
                            <Ico n="minus" size={16} />
                          </button>
                          <b>{it.cantidad}</b>
                          <button
                            onClick={() => setQty(it.producto.id_producto, it.cantidad + 1)}
                            aria-label="Aumentar cantidad"
                          >
                            <Ico n="plus" size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="y-comanda-subtotal">
                        S/ {itemLineTotal(it).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>

            {items.length > 0 && <aside className="y-comanda-totals" aria-label="Resumen de pago">
              <div className="y-totals">
                <div className="y-totals-row">
                  <span>Subtotal (sin IGV)</span>
                  <b>S/ {subtotal.toFixed(2)}</b>
                </div>
                <div className="y-totals-row">
                  <span>IGV (18%)</span>
                  <b>S/ {igv.toFixed(2)}</b>
                </div>
                <div className="y-totals-row y-totals-total">
                  <span>Total</span>
                  <b>S/ {total.toFixed(2)}</b>
                </div>
              </div>
              <button
                className="y-btn y-btn-hero"
                style={{ width: '100%', marginTop: 12 }}
                disabled={enviando || items.length === 0}
                onClick={() => void enviarTanda()}
              >
                {enviando
                  ? <> <span className="y-spin"><Ico n="hourglass" size={18} /></span> Enviando… </>
                  : <> <Ico n="chef" size={18} /> Enviar a cocina </>}
              </button>
            </aside>}
          </div>
        </div>
      )}

      <QrScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={(codigo) => {
          setMesaId(codigo);
          setScannerOpen(false);
        }}
      />
    </>
  );
}