import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ico } from '../../../components/Icon';
import { QrScannerModal } from '../../../components/QrScannerModal';
import { Loading } from '../../../components/ui';
import { useClienteAuth } from '../auth/cliente-auth-context';
import { useCart } from '../../../contexts/CartContext';
interface MiCuentaResponse {
  cuenta: {
    idCuenta: number;
    idVenta: number | null;
    estadoCuenta: 'ABIERTA' | 'PAGADA';
    saldoPendiente: number;
    montoPagado: number;
  };
}
import { ComprobanteBoleta } from '../../staff/caja/ComprobanteBoleta';
import { ComprobanteFactura } from '../../staff/caja/ComprobanteFactura';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1';

interface ComandaActiva {
  id: number;
  numero: string;
  mesaId: number;
  estado: string;
  estadoComandaDerivado: string;
  total: number;
  cantidadDetalles: number;
  mesaEstado: string | null;
  modoPagoMesa: 'CUENTA_UNICA' | 'POR_CONSUMO';
  esOrganizador: boolean;
  participantes: {
    clienteId: number;
    nombre: string;
    esOrganizador: boolean;
    consumoEstimado: number;
  }[];
}

interface MiCuentaEstado {
  estadoCuenta: 'ABIERTA' | 'PAGADA';
  saldoPendiente: number;
  montoPagado: number;
}

type ModalInfo = 'mesa' | null;

const ESTUDIOS: Record<string, string> = {
  'EN PREPARACION': 'f59e0b',
  'SERVIDO': '22c55e',
  ABIERTO: '6c757d',
};

export function ClienteMiConsumoPage() {
  const { mesaId, setMesaId } = useCart();
  const { token, cliente, logoutCliente } = useClienteAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [comanda, setComanda] = useState<ComandaActiva | null>(null);
  const [modalInfo, setModalInfo] = useState<ModalInfo>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pidiendo, setPidiendo] = useState(false);
  const [msgCuenta, setMsgCuenta] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [comprobanteAbierto, setComprobanteAbierto] = useState<{ idVenta: number; tipoDocumento: string } | null>(null);
  const [miEstadoCuenta, setMiEstadoCuenta] = useState<MiCuentaEstado | null>(null);

  const miConsumoPropio = useCallback(() => {
    if (!cliente || !comanda?.participantes) return null;
    return comanda.participantes.find((p) => p.clienteId === cliente.id) ?? null;
  }, [cliente, comanda]);

  const cargar = useCallback(async () => {
    if (!mesaId || !token) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`${API_URL}/cliente/pedidos/comanda?mesaId=${Number(mesaId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 401) {
          void logoutCliente();
          return;
        }
        setErr('No se pudo cargar tu consumo.');
        return;
      }
      const data = (await res.json()) as ComandaActiva | null;
      setComanda(data && 'id' in data ? data : null);

      if (data && 'id' in data && data.id) {
        const cuentaRes = await fetch(`${API_URL}/cliente/pedidos/${data.id}/mi-cuenta`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (cuentaRes.status === 401) {
          void logoutCliente();
          return;
        }
        if (!cuentaRes.ok) {
          setErr('No se pudo cargar el estado de tu cuenta.');
          return;
        }
        const cuentaData = (await cuentaRes.json()) as MiCuentaResponse;
        if (cuentaData.cuenta.idVenta) {
          setComprobanteAbierto({ idVenta: cuentaData.cuenta.idVenta, tipoDocumento: '03' });
        }
        setMiEstadoCuenta({
          estadoCuenta: cuentaData.cuenta.estadoCuenta,
          saldoPendiente: cuentaData.cuenta.saldoPendiente,
          montoPagado: cuentaData.cuenta.montoPagado,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [mesaId, token, logoutCliente]);

  useEffect(() => {
    void cargar();
    const t = setInterval(() => void cargar(), 10000);
    return () => clearInterval(t);
  }, [cargar]);

  useEffect(() => {
    if (!modalInfo) return;
    const cerrarConEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setModalInfo(null);
    };
    window.addEventListener('keydown', cerrarConEscape);
    return () => window.removeEventListener('keydown', cerrarConEscape);
  }, [modalInfo]);

  async function pedirLaCuenta() {
    const mesaParaCuenta = comanda?.mesaId ?? mesaId;
    if (!mesaParaCuenta || !token || pidiendo) return;
    setPidiendo(true);
    setMsgCuenta(null);
    try {
      const res = await fetch(`${API_URL}/cliente/pedidos/cuenta`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mesaId: Number(mesaParaCuenta) }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setMsgCuenta(
          body.error === 'YA_POR_COBRAR'
            ? 'La solicitud de cuenta ya figura para esta mesa.'
            : body.error === 'NO_COMANDA_ACTIVA'
              ? 'No hay comanda activa en esta mesa.'
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

  const porCobrar = comanda?.mesaEstado === 'POR COBRAR' || msgCuenta != null;
  const miConsumo = miConsumoPropio();
  const miSaldoPendiente = miEstadoCuenta?.saldoPendiente ?? miConsumo?.consumoEstimado ?? 0;
  const cuentaYaPagada = miEstadoCuenta?.estadoCuenta === 'PAGADA';
  const cuentaAbierta = miEstadoCuenta?.estadoCuenta === 'ABIERTA' || miEstadoCuenta === null;

  if (!mesaId) {
    return (
      <div className="y-shell" style={{ padding: '24px 16px 140px', maxWidth: 520, margin: '0 auto' }}>
        <section className="y-flow-hero y-cliente-flow-hero" aria-labelledby="consumo-scan-title">
          <div className="y-flow-hero__content">
            <span className="y-flow-hero__eyebrow">Autoconsumo QR</span>
            <h1 id="consumo-scan-title" className="y-flow-hero__title">Escanea tu mesa y comparte el consumo.</h1>
            <p className="y-flow-hero__description">
              Todas las personas de la mesa pueden seguir los pedidos y consultar el total acumulado.
            </p>
            <div className="y-flow-hero__actions">
              {token ? (
                <button className="y-btn line" onClick={() => setScannerOpen(true)}>Escanear mesa</button>
              ) : (
                <Link className="y-btn line" to="/cliente/login">Iniciar sesión para escanear</Link>
              )}
            </div>
          </div>
        </section>
        <div className="y-panel" style={{ padding: 24, textAlign: 'center' }}>
          <Ico n="alert" size={24} />
          <h2 style={{ margin: '8px 0 4px', fontSize: 18 }}>Mi consumo</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>
            Escanea el QR de tu mesa para ver tu comanda en vivo.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
            <Link className="y-btn line" to="/cliente/inicio">Volver</Link>
          </div>
        </div>
        <QrScannerModal
          open={scannerOpen}
          onClose={() => setScannerOpen(false)}
          onScan={(codigo) => {
            setMesaId(codigo);
            setScannerOpen(false);
          }}
        />
      </div>
    );
  }

  if (loading && !comanda) return <div className="y-shell" style={{ padding: 24 }}><Loading text="Cargando tu consumo…" /></div>;

  return (
    <div className="y-shell" style={{ padding: '24px 16px 140px', maxWidth: 520, margin: '0 auto' }}>
      <section className="y-flow-hero y-cliente-flow-hero" aria-labelledby="consumo-hero-title">
        <div className="y-flow-hero__content">
          <span className="y-flow-hero__eyebrow">Mesa {mesaId}</span>
          <h1 id="consumo-hero-title" className="y-flow-hero__title">Tu consumo, siempre a la vista.</h1>
          <p className="y-flow-hero__description">
            Revisa el resumen de la mesa y consulta los productos asociados a tu pedido.
          </p>
          <div className="y-flow-hero__actions y-client-actions">
            {comanda ? (
              <>
                <button
                  className="y-btn y-btn-hero-secondary y-client-action-secondary"
                  onClick={() => setModalInfo('mesa')}
                >
                  Ver mi comanda
                </button>
                <button className="y-btn y-btn-hero-secondary y-client-action-secondary" onClick={() => navigate(`/cliente/pedido/${comanda.id}`)}>
                  Ver seguimiento
                </button>
                <Link className="y-btn y-btn-hero-secondary y-client-action-secondary" to="/cliente/menu">
                  Agregar otra tanda
                </Link>
                <button
                  className="y-btn y-btn-hero y-client-action-primary"
                  disabled={pidiendo || porCobrar || comanda.mesaEstado === 'POR COBRAR'}
                  onClick={() => void pedirLaCuenta()}
                >
                  {porCobrar ? 'Cuenta pedida ✔' : pidiendo ? 'Pidiendo…' : 'Pedir la cuenta'}
                </button>
              </>
            ) : null}
          </div>
        </div>
        </section>

        {err && <div className="y-banner" style={{ borderColor: '#ba1a1a', background: '#ffdad6', color: '#93000a' }}>{err}</div>}
        {msgCuenta && <div className="y-banner">{msgCuenta}</div>}

        {comanda ? (
          <div className="y-panel" style={{ padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <b className="font-d" style={{ fontSize: 16 }}>{comanda.numero}</b>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>Mesa {comanda.mesaId}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: ESTUDIOS[comanda.estadoComandaDerivado] ?? '#6c757d', display: 'inline-block' }} />
              <b style={{ fontSize: 13 }}>{comanda.estadoComandaDerivado}</b>
            </div>
            {comanda.mesaEstado === 'POR COBRAR' && (
              <div className="y-banner" style={{ marginTop: 12 }}>La solicitud de cuenta está registrada para esta mesa.</div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 14 }}>
              <span>{comanda.cantidadDetalles} ítems enviados</span>
              <b className="y-price">S/ {comanda.total.toFixed(2)}</b>
            </div>
            <section style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)' }}>Forma de liquidar la cuenta</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <span className="y-chip" style={{ background: 'var(--surface-lowest)', border: '1px solid var(--border)', color: 'var(--ink)' }}>
                  {comanda.modoPagoMesa === 'POR_CONSUMO' ? 'Cada quien paga su parte' : 'Pago único de la mesa'}
                </span>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>Modo automático según participantes en la mesa</span>
              </div>
              <p style={{ margin: '6px 0 0', fontSize: 11, color: 'var(--muted)' }}>
                Se ajusta solo: si hay varios en la mesa, cada uno paga su consumo. Si estás solo, pagas la cuenta completa.
              </p>
              {comanda.modoPagoMesa === 'POR_CONSUMO' && (
                <div style={{ display: 'grid', gap: 6, marginTop: 10 }}>
                  {comanda.participantes.map((participante) => (
                    <div key={participante.clienteId} className="y-comanda-item" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, border: '1px solid var(--border)', borderRadius: 12, background: 'var(--surface-lowest)' }}>
                      <div className="participante-info" style={{ flex: 1 }}>
                        <div className="participante-nombre">
                          {participante.nombre}{participante.clienteId === cliente?.id ? ' (Tú)' : ''}
                        </div>
                        <small style={{ color: 'var(--muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {participante.esOrganizador ? 'Organizador' : 'Participante'}
                        </small>
                      </div>
                      <div className="participante-consumo">
                        <span className={`consumo-estimado ${participante.esOrganizador ? 'organizador' : ''}`}>
                          S/ {participante.consumoEstimado.toFixed(2)}
                        </span>
                        <span className={`consumo-estado ${cuentaYaPagada ? 'pagado' : 'pendiente'}`}>
                          {cuentaYaPagada ? 'PAGADO' : 'Pendiente'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {comanda.modoPagoMesa === 'POR_CONSUMO' && cliente && miConsumo && miConsumo.consumoEstimado > 0 && cuentaAbierta && !cuentaYaPagada && (
              <button
                className="y-btn y-btn-hero"
                style={{ width: '100%', marginTop: 16 }}
                onClick={() => void pedirLaCuenta()}
              >
                Pagar mi cuenta · S/ {miSaldoPendiente.toFixed(2)}
              </button>
            )}

            {comanda.modoPagoMesa === 'POR_CONSUMO' && cliente && cuentaYaPagada && comprobanteAbierto && (
              <button
                className="y-btn y-btn-hero y-btn-hero-secondary"
                style={{ width: '100%', marginTop: 16 }}
                onClick={() => setComprobanteAbierto(comprobanteAbierto)}
              >
                🧾 Ver mi boleta · S/ {miEstadoCuenta?.montoPagado.toFixed(2)}
              </button>
            )}

            {comanda.modoPagoMesa === 'CUENTA_UNICA' && cliente && cuentaYaPagada && comprobanteAbierto && (
              <button
                className="y-btn y-btn-hero y-btn-hero-secondary"
                style={{ width: '100%', marginTop: 16 }}
                onClick={() => setComprobanteAbierto(comprobanteAbierto)}
              >
                🧾 Ver comprobante de la mesa · S/ {miEstadoCuenta?.montoPagado.toFixed(2)}
              </button>
            )}
          </div>
        ) : (
          <div className="y-panel" style={{ padding: 24, textAlign: 'center' }}>
            <p style={{ color: 'var(--muted)', margin: 0 }}>No hay una comanda activa para esta mesa.</p>
          </div>
        )}

        {comprobanteAbierto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-[280mm] w-full overflow-y-auto max-h-[85vh]">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-brown-800 tracking-tighter uppercase">YEMHENG</h2>
                  <p className="text-xs text-gray-600">Comprobante de Pago Individual</p>
                </div>
                <button className="y-btn line" onClick={() => setComprobanteAbierto(null)}>Cerrar</button>
              </div>
              {comprobanteAbierto.tipoDocumento === '01' ? (
                <ComprobanteFactura ventaId={comprobanteAbierto.idVenta} onClose={() => setComprobanteAbierto(null)} />
              ) : (
                <ComprobanteBoleta ventaId={comprobanteAbierto.idVenta} onClose={() => setComprobanteAbierto(null)} />
              )}
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
      </div>
    );
  }
