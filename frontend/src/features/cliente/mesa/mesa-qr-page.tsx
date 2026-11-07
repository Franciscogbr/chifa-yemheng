import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useCart } from '../../../contexts/CartContext';
import { useClienteAuth } from '../auth/cliente-auth-context';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1';

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
  const [mesa, setMesa] = useState<MesaInfo | null>(null);
  const [err, setErr] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setErr('Mesa no especificada.');
      setLoading(false);
      return;
    }
    let cancelado = false;
    setLoading(true);
    setErr('');
    
    // Always show an alert when fetch starts
    console.log('QR: Starting fetch for', id);
    
    fetch(`${API_URL}/mesas/by-qr?codigo=${encodeURIComponent(id)}`)
      .then(async (res) => {
        console.log('QR: Response', res.status);
        if (!res.ok) {
          const errBody = await res.text();
          throw new Error('QR Error ' + res.status + ': ' + errBody);
        }
        const data = await res.json();
        console.log('QR: Data', data);
        
        if (cancelado) return;
        
        setMesa(data);
        
        // If there are customers and no logged in client, join existing order
        if (data?.comensales > 0 && !cliente && !cancelado) {
          console.log('QR: Joining existing order');
          window.location.href = '/cliente/mi-consumo?mesa=' + (data.qr ?? id ?? '');
        } else if (!cliente && !cancelado) {
          // First client - ask decision
          console.log('QR: First client, showing decision');
          const tomarPedido = window.confirm(
            'Yo tomare el pedido.\n\n¿Qué modo deseas?\n1. Repartir comanda de nombres\n2. Modo pensamiento'
          );
          
          if (tomarPedido) {
            // Take order only
            setMesaId(String(data.id));
          } else {
            // Share order
            window.location.href = '/cliente/mi-consumo?mesa=' + (data.qr ?? id ?? '');
          }
        } else if (!cliente && !cancelado) {
          // Join automatically
          window.location.href = '/cliente/mi-consumo?mesa=' + (data.qr ?? id ?? '');
        } else {
          // Already has session
          setMesaId(String(data.id));
        }
      })
      .catch((e) => {
        console.error('QR: Fetch error', e);
        setErr('Error al cargar mesa: ' + e.message);
        // Show alert so user sees something
        try { window.alert('Error cargando mesa: ' + e.message); } catch(e2) {}
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });
    return () => {
      cancelado = true;
    };
  }, [id]);

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

  return (
    <div style={{padding: '24px 16px 140px', maxWidth: 420, margin: '0 auto'}}>
      <div style={{padding: 26, textAlign: 'center', background: 'radial-gradient(300px 200px at 50% 0,rgba(166,30,34,0.12),transparent),var(--surface-lowest)'}}>
        <p style={{margin: '0 0 18px', fontSize: 14, color: 'var(--text-muted)'}}>Escanea el QR de tu mesa</p>
        <div>
          <QRCodeSVG value={mesa?.qr ?? ''} size={168} />
        </div>
        <h1 style={{fontSize: 34, margin: '16px 0 4px'}}>Mesa {mesa?.numero}</h1>
        <p style={{color: 'var(--muted)', fontSize: 12, margin: 0}}>
          {mesa?.ambiente} · Capacidad {mesa?.capacidad} · {mesa?.estadoOperativo}
        </p>
        <p style={{color: 'var(--muted)', fontSize: 12, margin: '14px 0'}}>
          Abre la cámara de tu celular y escanea el código. Tus acompañantes comparten esta misma comanda.
        </p>
        <div style={{margin: '16px 0'}}>
          <Link
            style={{display: 'inline-block', background: '#0066cc', color: 'white', padding: '10px 16px', borderRadius: '6px', textDecoration: 'none'}}
            to={cliente ? '/cliente/menu' : '/cliente/login?mesa=' + (mesa?.qr ?? id ?? '')}
          >
            Ver carta y pedir
          </Link>
          <Link
            style={{display: 'inline-block', background: '#6c757d', color: 'white', padding: '10px 16px', borderRadius: '6px', textDecoration: 'none', marginLeft: '10px'}}
            to={cliente ? '/cliente/mi-consumo' : '/cliente/login?mesa=' + (mesa?.qr ?? id ?? '')}
          >
            Mi comanda
          </Link>
        </div>
      </div>
    </div>
  );
}
