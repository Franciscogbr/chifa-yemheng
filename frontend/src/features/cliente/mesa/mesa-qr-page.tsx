import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import { useClienteAuth } from '../auth/cliente-auth-context';
import { mensajeError } from '../../../shared/errors';

import { API_URL } from '../../../lib/api-url';

interface MesaInfo {
  id: number;
  numero: string;
  ambiente: string;
  capacidad: number;
  estadoOperativo: string;
  qr: string | null;
}

export default function MesaQrPage() {
  const { id } = useParams();
  const { setMesaId } = useCart();
  const { cliente } = useClienteAuth();
  const navigate = useNavigate();
  const [mesa, setMesa] = useState<MesaInfo | null>(null);
  const [err, setErr] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [mostrarDecision, setMostrarDecision] = useState(false);

  useEffect(() => {
    if (!id) {
      setErr('Mesa no especificada.');
      setLoading(false);
      return;
    }
    let cancelado = false;
    setLoading(true);
    setErr('');

    fetch(`${API_URL}/mesas/by-qr?codigo=${encodeURIComponent(id)}`)
      .then(async (res) => {
        if (!res.ok) {
          const errBody = await res.text();
          throw new Error('QR Error ' + res.status + ': ' + errBody);
        }
        const data = await res.json();

        if (cancelado) return;

        setMesa(data);

        if (data?.comensales > 0 && !cliente && !cancelado) {
          navigate('/cliente/mi-consumo?mesa=' + (data.qr ?? id ?? ''));
        } else if (!cliente && !cancelado) {
          // Primera vez: mostrar tarjeta con decisión clara
          setMostrarDecision(true);
        } else {
          // Already has session
          setMesaId(String(data.id));
          navigate('/cliente/menu');
        }
      })
      .catch((err) => {
        setErr(mensajeError(err.error) || 'Error al cargar la mesa. Inténtalo de nuevo.');
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });
    return () => {
      cancelado = true;
    };
  }, [id, cliente, navigate]);

  if (loading) {
    return (
      <div style={{padding: 24, display: 'grid', placeItems: 'center', minHeight: '60vh'}}>
        <p>Identificando tu mesa…</p>
      </div>
    );
  }
  if (err || !mesa) {
    return (
      <div style={{padding: 24, maxWidth: 420, margin: '0 auto'}}>
        <div style={{padding: 24, textAlign: 'center'}}>
          <p style={{color: 'var(--rose-soft, #ffb4ab)', fontWeight: 600}}>{err || 'Mesa no encontrada.'}</p>
          <Link to="/cliente/login" style={{marginTop: 16, display: 'inline-block'}}>Volver al login</Link>
        </div>
      </div>
    );
  }

  // Tarjeta de decisión para primera vez en la mesa
  if (mostrarDecision && !cliente) {
    return (
      <div style={{padding: '24px 16px 140px', maxWidth: 420, margin: '0 auto'}}>
        <div style={{padding: 26, textAlign: 'center', background: 'radial-gradient(300px 200px at 50% 0,rgba(166,30,34,0.12),transparent),var(--surface-lowest)'}}>
          <h1 style={{fontSize: 32, margin: '0 0 12px'}}>¿Cómo quieres pedir?</h1>
          <p style={{color: 'var(--muted)', fontSize: 14, margin: '0 0 24px'}}>
            Selecciona cómo quieres gestionar tu comanda en la mesa {mesa.numero}.
          </p>
          <div style={{display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24}}>
            <button
              onClick={() => {
                setMesaId(String(mesa.id));
                setMostrarDecision(false);
                navigate('/cliente/menu');
              }}
              className="w-full flex items-center justify-center gap-8 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-4 text-lg font-bold text-[#7F1518] shadow-sm transition hover:bg-amber-500/20"
            >
              <span style={{fontSize: 24}}>🍽️</span>
              <span>Pedir yo por toda la mesa</span>
            </button>
            <button
              onClick={() => {
                navigate('/cliente/login?mesa=' + encodeURIComponent(mesa.qr ?? id ?? ''));
                setMostrarDecision(false);
              }}
              className="w-full flex items-center justify-center gap-8 rounded-lg border border-gray-300 bg-white px-4 py-4 text-lg font-bold text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              <span style={{fontSize: 24}}>👤</span>
              <span>Cada uno pide lo suyo</span>
            </button>
          </div>
          <p style={{color: 'var(--muted)', fontSize: 12, marginTop: 16}}>
            Si eliges "Cada uno pide lo suyo", se te pedirá iniciar sesión con tu cuenta.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{padding: '24px 16px 140px', maxWidth: 420, margin: '0 auto'}}>
      <div style={{padding: 26, textAlign: 'center', background: 'radial-gradient(300px 200px at 50% 0,rgba(166,30,34,0.12),transparent),var(--surface-lowest)'}}>
        <h1 style={{fontSize: 34, margin: '0 0 4px'}}>Mesa {mesa?.numero}</h1>
        <p style={{color: 'var(--muted)', fontSize: 12, margin: 0}}>
          {mesa?.ambiente} · Capacidad {mesa?.capacidad} · {mesa?.estadoOperativo}
        </p>
        <p style={{color: 'var(--muted)', fontSize: 12, margin: '14px 0'}}>
          Mesa identificada. Tus acompañantes pueden compartir la comanda desde sus teléfonos.
        </p>
        <div style={{margin: '16px 0'}}>
          <Link
            style={{display: 'inline-block', background: '#7F1518', color: 'white', padding: '10px 16px', borderRadius: '6px', textDecoration: 'none'}}
            to={cliente ? '/cliente/menu' : '/cliente/login?mesa=' + (mesa?.qr ?? id ?? '')}
          >
            Ver carta y pedir
          </Link>
          <Link
            style={{display: 'inline-block', background: 'var(--line2)', color: 'var(--text)', padding: '10px 16px', borderRadius: '6px', textDecoration: 'none', marginLeft: '10px'}}
            to={cliente ? '/cliente/mi-consumo' : '/cliente/login?mesa=' + (mesa?.qr ?? id ?? '')}
          >
            Mi comanda
          </Link>
        </div>
      </div>
    </div>
  );
}
