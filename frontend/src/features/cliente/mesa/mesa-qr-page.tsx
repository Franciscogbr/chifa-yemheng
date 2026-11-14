import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import { useClienteAuth } from '../auth/cliente-auth-context';
import { guardarModoCliente, marcarQrValidado } from '../auth/cliente-mode';
import { mensajeError } from '../../../shared/errors';

import { API_URL } from '../../../lib/api-url';

interface MesaInfo {
  id: number;
  numero: string;
  ambiente: string;
  capacidad: number;
  estadoOperativo: string;
  qr: string | null;
  comensales?: number;
}

type EstadoAtencion =
  | 'ESPERANDO_MOZO'
  | 'PEDIDO_TOMADO'
  | 'RESERVA_CANCELADA'
  | 'ATENCION_NO_DISPONIBLE';

interface RespuestaAtencion {
  error?: string;
  reservaId?: number | null;
  canal?: 'QR' | 'MOZO';
  mesaId?: number;
  estado?: EstadoAtencion;
  pedidoId?: number | null;
}

export default function MesaQrPage() {
  const { id } = useParams();
  const { setMesaId, setReservaId } = useCart();
  const { cliente, token } = useClienteAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const reservaAtencionId = Number(searchParams.get('reserva'));
  const reservaAtencionValida = Number.isSafeInteger(reservaAtencionId) && reservaAtencionId > 0;
  const [mesa, setMesa] = useState<MesaInfo | null>(null);
  const [err, setErr] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [mostrarDecision, setMostrarDecision] = useState(false);
  const [procesandoAtencion, setProcesandoAtencion] = useState(false);
  const [errorAtencion, setErrorAtencion] = useState<string | null>(null);
  const [estadoAtencion, setEstadoAtencion] = useState<EstadoAtencion>('ESPERANDO_MOZO');
  const [mesaAtencionId, setMesaAtencionId] = useState<number | null>(null);
  const [cargandoAtencion, setCargandoAtencion] = useState(false);
  const [reintentoAtencion, setReintentoAtencion] = useState(0);

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
        setMesaId(String(data.id));
        marcarQrValidado();
        guardarModoCliente('local');

        if (reservaAtencionValida) {
          setMostrarDecision(false);
        } else if (data?.comensales > 0 && !cancelado) {
          navigate('/cliente/mi-consumo?mesa=' + (data.qr ?? id ?? ''));
        } else {
          setMostrarDecision(true);
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
  }, [id, cliente, navigate, reservaAtencionValida, setMesaId]);

  useEffect(() => {
    if (!reservaAtencionValida) return;
    if (!cliente || !token) {
      setErrorAtencion('Inicia sesión con la cuenta asociada a esta reserva para consultar la solicitud.');
      return;
    }

    let cancelado = false;
    let temporizador: number | undefined;

    const consultar = async () => {
      setCargandoAtencion(true);
      try {
        const response = await fetch(
          `${API_URL}/cliente/pedidos/reserva/${reservaAtencionId}/atencion`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const body = await response.json().catch(() => ({})) as RespuestaAtencion;
        if (!response.ok) {
          if (response.status < 500) {
            if (!cancelado) {
              setEstadoAtencion('ATENCION_NO_DISPONIBLE');
              setErrorAtencion('No encontramos una solicitud activa para esta reserva.');
            }
            return;
          }
          throw new Error(body.error ?? 'No se pudo consultar la solicitud al mozo.');
        }
        if (cancelado) return;

        setEstadoAtencion(body.estado ?? 'ATENCION_NO_DISPONIBLE');
        setMesaAtencionId(body.mesaId ?? null);
        setErrorAtencion(null);

        if (body.estado === 'PEDIDO_TOMADO' && body.pedidoId) {
          navigate(`/cliente/pedido/${body.pedidoId}`, { replace: true });
          return;
        }
        if (body.estado !== 'ESPERANDO_MOZO') return;
      } catch (error) {
        if (!cancelado) {
          setErrorAtencion(
            error instanceof Error ? error.message : 'No se pudo consultar la solicitud al mozo.',
          );
        }
      } finally {
        if (!cancelado) setCargandoAtencion(false);
      }

      if (!cancelado) {
        temporizador = window.setTimeout(() => void consultar(), 5000);
      }
    };

    void consultar();
    return () => {
      cancelado = true;
      if (temporizador !== undefined) window.clearTimeout(temporizador);
    };
  }, [cliente, navigate, reintentoAtencion, reservaAtencionId, reservaAtencionValida, token]);

  const elegirAtencion = async (canal: 'QR' | 'MOZO') => {
    if (!mesa) return;
    const codigoMesa = mesa?.qr ?? id ?? '';
    if (!cliente || !token) {
      navigate(`/cliente/login?mesa=${encodeURIComponent(codigoMesa)}&modo=${canal.toLowerCase()}`);
      return;
    }

    setProcesandoAtencion(true);
    setErrorAtencion(null);
    try {
      const response = await fetch(`${API_URL}/cliente/pedidos/reserva/atencion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mesaId: mesa.id, canal }),
      });
      const body = await response.json().catch(() => ({})) as RespuestaAtencion;
      if (!response.ok) {
        if (body.error === 'RESERVA_NO_ATENDIDA') {
          throw new Error('El personal debe registrar la llegada antes de continuar con esta reserva.');
        }
        if (body.error === 'RESERVA_NO_ESPERA_MOZO') {
          throw new Error('No encontramos una reserva confirmada para esta mesa y tu cuenta. Pide ayuda al personal.');
        }
        throw new Error('No se pudo registrar la opción de atención. Inténtalo nuevamente o avisa al personal.');
      }

      if (canal === 'QR') {
        setMesaId(String(mesa.id));
        if (body.reservaId) setReservaId(body.reservaId);
        setMostrarDecision(false);
        navigate('/cliente/menu');
      } else {
        if (!Number.isSafeInteger(body.reservaId) || !body.reservaId) {
          throw new Error('No se pudo identificar la reserva para seguir la solicitud.');
        }
        setEstadoAtencion('ESPERANDO_MOZO');
        setMesaAtencionId(mesa.id);
        setMostrarDecision(false);
        setSearchParams({ reserva: String(body.reservaId) }, { replace: true });
      }
    } catch (error) {
      setErrorAtencion(error instanceof Error ? error.message : 'No se pudo enviar la solicitud.');
    } finally {
      setProcesandoAtencion(false);
    }
  };

  if (loading) {
    return (
      <div style={{padding: 24, display: 'grid', placeItems: 'center', minHeight: '60vh'}}>
        <p>Identificando tu mesa…</p>
      </div>
    );
  }
  if (reservaAtencionValida) {
    return (
      <div style={{padding: '24px 16px 140px', maxWidth: 420, margin: '0 auto'}}>
        <div role="status" style={{padding: 26, textAlign: 'center', background: 'var(--surface-lowest)'}}>
          <h1 style={{fontSize: 28, margin: '0 0 12px'}}>Solicitud al mozo</h1>
          <p style={{color: 'var(--muted)', fontSize: 14}}>
            Mesa {mesa?.numero ?? mesaAtencionId ?? 'asignada a tu reserva'}
          </p>
          {estadoAtencion === 'ESPERANDO_MOZO' ? (
            <p>Esperando que un mozo tome tu pedido. Esta pantalla se actualizará automáticamente.</p>
          ) : estadoAtencion === 'RESERVA_CANCELADA' ? (
            <p>La reserva fue cancelada. Contacta al personal para recibir ayuda.</p>
          ) : (
            <p>Ya no podemos continuar esta solicitud. Contacta al personal para recibir ayuda.</p>
          )}
          {cargandoAtencion && <p aria-live="polite">Actualizando solicitud…</p>}
          {errorAtencion && <p role="alert" style={{color: '#b42318'}}>{errorAtencion}</p>}
          {errorAtencion && (
            <button
              type="button"
              onClick={() => setReintentoAtencion((value) => value + 1)}
              className="mt-3 rounded-lg border px-4 py-2"
            >
              Volver a intentar
            </button>
          )}
          <p style={{color: 'var(--muted)', fontSize: 12, marginTop: 16}}>
            Cuando el mozo abra la comanda, te llevaremos al seguimiento del pedido.
          </p>
        </div>
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
  if (mostrarDecision) {
    return (
      <div style={{padding: '24px 16px 140px', maxWidth: 420, margin: '0 auto'}}>
        <div style={{padding: 26, textAlign: 'center', background: 'radial-gradient(300px 200px at 50% 0,rgba(166,30,34,0.12),transparent),var(--surface-lowest)'}}>
          <h1 style={{fontSize: 32, margin: '0 0 12px'}}>¿Cómo quieres pedir?</h1>
          <p style={{color: 'var(--muted)', fontSize: 14, margin: '0 0 24px'}}>
            Selecciona cómo quieres gestionar tu pedido en la mesa {mesa.numero}.
          </p>
          <div style={{display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24}}>
            {cliente ? (
              <>
                <button
                  type="button"
                  disabled={procesandoAtencion}
                  onClick={() => void elegirAtencion('QR')}
                  className="w-full flex items-center justify-center gap-8 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-4 text-lg font-bold text-[#7F1518] shadow-sm transition hover:bg-amber-500/20 disabled:opacity-60"
                >
                  <span style={{fontSize: 24}}>📱</span>
                  <span>Pedir por QR</span>
                </button>
                <button
                  type="button"
                  disabled={procesandoAtencion}
                  onClick={() => void elegirAtencion('MOZO')}
                  className="w-full flex items-center justify-center gap-8 rounded-lg border border-gray-300 bg-white px-4 py-4 text-lg font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
                >
                  <span style={{fontSize: 24}}>🙋</span>
                  <span>Que un mozo tome mi pedido</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
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
                  type="button"
                  onClick={() => {
                    navigate('/cliente/login?mesa=' + encodeURIComponent(mesa.qr ?? id ?? ''));
                    setMostrarDecision(false);
                  }}
                  className="w-full flex items-center justify-center gap-8 rounded-lg border border-gray-300 bg-white px-4 py-4 text-lg font-bold text-gray-700 shadow-sm transition hover:bg-gray-50"
                >
                  <span style={{fontSize: 24}}>👤</span>
                  <span>Cada uno pide lo suyo</span>
                </button>
                <button
                  type="button"
                  onClick={() => void elegirAtencion('MOZO')}
                  className="w-full flex items-center justify-center gap-8 rounded-lg border border-gray-300 bg-white px-4 py-4 text-lg font-bold text-gray-700 shadow-sm transition hover:bg-gray-50"
                >
                  <span style={{fontSize: 24}}>🙋</span>
                  <span>Que un mozo tome mi pedido</span>
                </button>
              </>
            )}
          </div>
          {procesandoAtencion && <p role="status">Registrando tu opción…</p>}
          {errorAtencion && <p role="alert" style={{color: '#b42318'}}>{errorAtencion}</p>}
          <p style={{color: 'var(--muted)', fontSize: 12, marginTop: 16}}>
            Para solicitar un mozo desde aquí, inicia sesión con la cuenta asociada a tu reserva. También puedes avisar directamente al personal.
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
