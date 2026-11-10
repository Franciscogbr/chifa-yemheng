import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChefHat, Receipt } from 'lucide-react';
import { Loading } from '../../../components/ui';
import DishImg from '../../../components/DishImg';
import { useClienteAuth } from '../auth/cliente-auth-context';
import { EstadoBadge } from '../../../shared/ui/EstadoBadge';
import { useRealtimePedido } from '../../../shared/hooks/useRealtimePedido';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1';

const PASOS = [
  { id: 'pendiente', label: 'Pendiente', icon: Receipt },
  { id: 'listo', label: 'Listo', icon: ChefHat },
];

interface DetalleDTO {
  id: number;
  producto: string;
  cantidad: number;
  estadoPreparacion: 'P' | 'L' | 'A';
  estadoRegistro: 'A' | 'I';
  precioUnitario: number;
  subTotal: number;
  fechaAtencion: string | null;
}

interface PedidoDTO {
  id: number;
  numero: string;
  mesaId: number | null;
  estado: string;
  estadoComandaDerivado: string;
  total: number;
  facturado: 'S' | 'N';
  anulado: 'S' | 'N';
  detalles: DetalleDTO[];
}

function pasoDeEstado(e: string): number {
  const estado = (e ?? '').toUpperCase();
  if (estado === 'LISTO' || estado === 'SERVIDO') return 1;
  return 0; // ABIERTO / PENDIENTE / RECIBIDO
}

export function ClientePedidoTrackingPage() {
  const { id } = useParams();
  const { token, logoutCliente } = useClienteAuth();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [pedido, setPedido] = useState<PedidoDTO | null>(null);
  const [pidiendo, setPidiendo] = useState(false);
  const [msgCuenta, setMsgCuenta] = useState<string | null>(null);
  const [errCuenta, setErrCuenta] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!token || !id) return;
    try {
      const res = await fetch(`${API_URL}/cliente/pedidos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 401) {
          void logoutCliente();
          return;
        }
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setErr(body.error ?? 'NETWORK_ERROR');
        return;
      }
      const data = (await res.json()) as PedidoDTO;
      setPedido(data);
    } finally {
      setLoading(false);
    }
  }, [id, token, logoutCliente]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  useRealtimePedido(pedido ? Number(id) : null, () => void cargar());

  async function pedirCuenta() {
    if (!pedido || !token || pedido.mesaId == null || pidiendo) return;
    setPidiendo(true);
    setMsgCuenta(null);
    setErrCuenta(null);
    try {
      const res = await fetch(`${API_URL}/cliente/pedidos/cuenta`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mesaId: pedido.mesaId }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setErrCuenta(
          body.error === 'YA_POR_COBRAR'
            ? 'La solicitud de cuenta ya figura para esta mesa.'
            : body.error === 'NO_COMANDA_ACTIVA'
              ? 'No hay comanda activa en tu mesa.'
              : body.error ?? 'No se pudo pedir la cuenta.',
        );
        return;
      }
      setMsgCuenta('Solicitud de cuenta enviada.');
      await cargar();
    } finally {
      setPidiendo(false);
    }
  }

  if (loading) return <div className="y-shell" style={{ padding: 24 }}><Loading text="Cargando tu pedido…" /></div>;

  if (err || !pedido) {
    return (
      <div className="y-shell" style={{ padding: '24px 16px 140px', maxWidth: 480, margin: '0 auto' }}>
        <div className="y-panel" style={{ padding: 24, textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 18 }}>No se encontró tu pedido</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>{err === 'NO_PARTICIPANTE' ? 'No participas de esta comanda.' : err ?? 'Inténtalo de nuevo.'}</p>
          <Link className="y-btn line" to="/cliente/inicio" style={{ marginTop: 16, display: 'inline-flex' }}>Volver</Link>
        </div>
      </div>
    );
  }

  const step = pedido.anulado === 'S' ? -1 : pasoDeEstado(pedido.estadoComandaDerivado);
  const activos = pedido.detalles.filter((d) => d.estadoRegistro === 'A' && d.estadoPreparacion !== 'A');
  const puedePedirCuenta = pedido.mesaId != null && pedido.anulado === 'N' && pedido.estadoComandaDerivado !== 'FACTURADO';
  const porCobrar = pedido.mesaId != null && (step >= 1 || msgCuenta != null);

  return (
    <div className="y-shell" style={{ padding: '24px 16px 140px', maxWidth: 480, margin: '0 auto' }}>
      <section className="y-flow-hero y-cliente-flow-hero" aria-labelledby="pedido-hero-title">
        <div className="y-flow-hero__content">
          <span className="y-flow-hero__eyebrow">
            {pedido.mesaId ? `Mesa ${pedido.mesaId}` : 'Seguimiento de pedido'}
          </span>
          <h1 id="pedido-hero-title" className="y-flow-hero__title">Sigue cada paso de tu pedido.</h1>
          <p className="y-flow-hero__description">
            Pedido {pedido.numero} · {pedido.estadoComandaDerivado}
          </p>
          <div className="y-flow-hero__actions y-client-actions">
            {pedido.mesaId != null && pedido.anulado === 'N' && pedido.estadoComandaDerivado !== 'FACTURADO' && (
              <Link className="y-btn y-btn-hero y-client-action-primary" to="/cliente/menu">
                Agregar otra tanda
              </Link>
            )}
            {pedido.mesaId != null && (
              <Link className="y-btn y-btn-hero-secondary y-client-action-secondary" to="/cliente/mi-consumo">
                Ver mi mesa
              </Link>
            )}
            {puedePedirCuenta && (
              <button
                className="y-btn y-btn-hero-secondary y-client-action-secondary"
                disabled={pidiendo || porCobrar}
                onClick={() => void pedirCuenta()}
              >
                {porCobrar ? 'Cuenta pedida ✔' : pidiendo ? 'Pidiendo…' : 'Pedir la cuenta'}
              </button>
            )}
          </div>
        </div>
      </section>
      <div className="y-panel" style={{ padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
          <h2 className="font-d" style={{ margin: 0, fontSize: 20 }}>{pedido.numero}</h2>
        </div>

        {pedido.anulado === 'S' ? (
          <div className="y-banner" style={{ marginBottom: 12 }}>Tu pedido fue anulado.</div>
        ) : (
          <div className="y-track">
            {PASOS.map((p, i) => {
              const done = i < step;
              const now = i === step;
              return (
                <div key={p.id} className={`y-tstep ${done ? 'done' : ''} ${now ? 'now' : ''}`}>
                  <div className="dot"><p.icon size={16} /></div>
                  <div>
                    <b>{p.label}</b>
                    <small>{done ? 'Completado' : now ? 'En curso' : 'Pendiente'}</small>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <b style={{ fontSize: 13 }}>Platos enviados</b>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
             {activos.map((it) => (
               <div key={it.id} className="y-line">
                 <DishImg alt={it.producto} style={{ width: 44, height: 44, borderRadius: 10 }} />
                 <div style={{ flex: 1 }}>
                   <b style={{ fontSize: 13 }}>{it.producto}</b>
                   <div style={{ fontSize: 11, color: 'var(--muted)' }}>x{it.cantidad}</div>
                 </div>
                 <EstadoBadge
                   estado={it.estadoPreparacion}
                   size="sm"
                   tooltip={it.fechaAtencion ? new Date(it.fechaAtencion).toLocaleTimeString() : undefined}
                 />
               </div>
             ))}
            {activos.length === 0 && <div style={{ fontSize: 12, color: 'var(--muted)' }}>Sin platos pendientes de servir.</div>}
          </div>
        </div>

        {(step >= 2 || msgCuenta) && !errCuenta && (
          <div className="y-banner" style={{ marginTop: 14 }}>✓ Tu comanda está servida/lista para servir.</div>
        )}
        {msgCuenta && (
          <div className="y-banner" style={{ marginTop: 14 }}>{msgCuenta}</div>
        )}
        {errCuenta && (
          <div className="y-banner" style={{ marginTop: 14, borderColor: '#ba1a1a', background: '#ffdad6', color: '#93000a' }}>{errCuenta}</div>
        )}

      </div>
    </div>
  );
}
