import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ico } from '../../../components/Icon';
import { QrScannerModal } from '../../../components/QrScannerModal';
import { Loading } from '../../../components/ui';
import { useClienteAuth } from '../auth/cliente-auth-context';
import { useCart } from '../../../contexts/CartContext';
import { miCuentaClienteService } from '../../staff/staff-service';
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

interface PedidoDetalleCliente {
  id: number;
  numero: string;
  total: number;
  detalles: {
    id: number;
    clienteId: number | null;
    producto: string;
    cantidad: number;
    subTotal: number;
    notaCocina: string | null;
    estadoPreparacion: 'P' | 'E' | 'S' | 'A';
    estadoRegistro: 'A' | 'I';
  }[];
}

type ModalInfo = 'pedido' | 'mesa' | null;

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
  const [pedidoDetalle, setPedidoDetalle] = useState<PedidoDetalleCliente | null>(null);
  const [modalInfo, setModalInfo] = useState<ModalInfo>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pidiendo, setPidiendo] = useState(false);
  const [msgCuenta, setMsgCuenta] = useState<string | null>(null);
  const [guardandoModo, setGuardandoModo] = useState(false);
  const [errModo, setErrModo] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [comprobanteAbierto, setComprobanteAbierto] = useState<{ idVenta: number; tipoDocumento: string } | null>(null);

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
        const cuentaData = await miCuentaClienteService(data.id);
        setComprobanteAbierto({ idVenta: cuentaData.cuenta.idCuenta, tipoDocumento: '03' });
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

  async function abrirDetallePedido() {
    if (!comanda || !token || cargandoDetalle) return;
    setModalInfo('pedido');
    setCargandoDetalle(true);
    setErrorDetalle(null);
    try {
      const response = await fetch(`${API_URL}/cliente/pedidos/${comanda.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) {
        await logoutCliente();
        return;
      }
      if (!response.ok) {
        throw new Error('No se pudo cargar el detalle de tu pedido.');
      }
      setPedidoDetalle((await response.json()) as PedidoDetalleCliente);
    } catch (error) {
      setErrorDetalle(error instanceof Error ? error.message : 'No se pudo cargar el detalle de tu pedido.');
    } finally {
      setCargandoDetalle(false);
    }
  }

  async function pedirLaCuenta() {
    if (!mesaId || !token || pidiendo) return;
    setPidiendo(true);
    setMsgCuenta(null);
    try {
      const res = await fetch(`${API_URL}/cliente/pedidos/cuenta`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mesaId: Number(mesaId) }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setMsgCuenta(
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

  async function cambiarModoPago(modo: ComandaActiva['modoPagoMesa']) {
    if (!comanda || !token || !comanda.esOrganizador || guardandoModo || porCobrar) return;
    setGuardandoModo(true);
    setErrModo(null);
    try {
      const res = await fetch(`${API_URL}/cliente/pedidos/${comanda.id}/modo-pago`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ modo }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setErrModo(body.error === 'NO_ES_ORGANIZADOR'
          ? 'Solo quien inició la comanda puede cambiar el modo de pago.'
          : body.error ?? 'No se pudo actualizar el modo de pago.');
        return;
      }
      await cargar();
    } finally {
      setGuardandoModo(false);
    }
  }

  const porCobrar = comanda?.mesaEstado === 'POR COBRAR' || msgCuenta != null;

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
                  Resumen de mesa
                </button>
                <button
                  className="y-btn y-btn-hero-secondary y-client-action-secondary"
                  onClick={() => void abrirDetallePedido()}
                >
                  Ver mi pedido
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
            <label htmlFor="modo-pago-mesa" style={{ display: 'block', fontSize: 12, color: 'var(--muted)' }}>
              Forma de liquidar la cuenta
            </label>
            <select
              id="modo-pago-mesa"
              className="select"
              style={{ width: '100%', marginTop: 6 }}
              value={comanda.modoPagoMesa}
              disabled={!comanda.esOrganizador || porCobrar || guardandoModo}
              onChange={(event) => void cambiarModoPago(event.target.value as ComandaActiva['modoPagoMesa'])}
            >
              <option value="CUENTA_UNICA">Cuenta completa en un solo pago</option>
              <option value="POR_CONSUMO">Cada integrante paga su consumo</option>
            </select>
            <p style={{ margin: '6px 0 0', fontSize: 11, color: 'var(--muted)' }}>
              {comanda.esOrganizador
                ? 'El modo se define antes de pedir la cuenta.'
                : 'Solo el organizador puede elegir la forma de pago.'}
            </p>
            {errModo && <p role="alert" style={{ color: '#93000a', fontSize: 12 }}>{errModo}</p>}
            {comanda.modoPagoMesa === 'POR_CONSUMO' && (
              <div style={{ display: 'grid', gap: 6, marginTop: 10 }}>
                {comanda.participantes.map((participante) => (
                  <div key={participante.clienteId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span>{participante.nombre}{participante.clienteId === cliente?.id ? ' · Tú' : ''}</span>
                    <b>S/ {participante.consumoEstimado.toFixed(2)}</b>
                  </div>
                ))}
                <small style={{ color: 'var(--muted)' }}>
                  Importes estimados; los platos compartidos se distribuyen entre los participantes.
                </small>
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="y-panel" style={{ padding: 24, textAlign: 'center' }}>
          <p style={{ color: 'var(--muted)', margin: 0 }}>No hay una comanda activa para esta mesa.</p>
        </div>
      )}

      {modalInfo && (
        <div
          role="presentation"
          onClick={() => setModalInfo(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 80,
            display: 'grid',
            placeItems: 'center',
            padding: 16,
            background: 'rgba(0,0,0,.58)',
          }}
        >
          <section
            className="y-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cliente-info-modal-title"
            onClick={(event) => event.stopPropagation()}
            style={{ width: 'min(560px, 100%)', maxHeight: '85vh', overflow: 'auto', padding: 20 }}
          >
            <header style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <span className="y-flow-hero__eyebrow">{modalInfo === 'mesa' ? `Mesa ${mesaId}` : 'Detalle personal'}</span>
                <h2 id="cliente-info-modal-title" className="font-d" style={{ margin: '4px 0', fontSize: 24 }}>
                  {modalInfo === 'mesa' ? 'Resumen de la mesa' : 'Productos de tu pedido'}
                </h2>
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13 }}>
                  {modalInfo === 'mesa'
                    ? 'Estado y participantes registrados en la comanda actual.'
                    : `Pedido ${pedidoDetalle?.numero ?? comanda?.numero ?? ''}`}
                </p>
              </div>
              <button type="button" className="y-btn line" onClick={() => setModalInfo(null)}>Cerrar</button>
            </header>

            {modalInfo === 'mesa' && comanda && (
              <div style={{ display: 'grid', gap: 12 }}>
                <div className="y-panel" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, padding: 14 }}>
                  <div>
                    <small style={{ color: 'var(--muted)' }}>Estado</small>
                    <strong style={{ display: 'block' }}>{comanda.estadoComandaDerivado}</strong>
                  </div>
                  <div>
                    <small style={{ color: 'var(--muted)' }}>Total actual</small>
                    <strong style={{ display: 'block' }}>S/ {comanda.total.toFixed(2)}</strong>
                  </div>
                  <div>
                    <small style={{ color: 'var(--muted)' }}>Productos enviados</small>
                    <strong style={{ display: 'block' }}>{comanda.cantidadDetalles}</strong>
                  </div>
                  <div>
                    <small style={{ color: 'var(--muted)' }}>Personas en la comanda</small>
                    <strong style={{ display: 'block' }}>{comanda.participantes.length}</strong>
                  </div>
                </div>
                {comanda.mesaEstado === 'POR COBRAR' && (
                  <div className="y-banner">La mesa ya solicitó la cuenta.</div>
                )}
                <div style={{ display: 'grid', gap: 8 }}>
                  <h3 style={{ margin: 0, fontSize: 15 }}>Participantes</h3>
                  {comanda.participantes.map((participante) => (
                    <div
                      key={participante.clienteId}
                      className="y-line"
                      style={{ justifyContent: 'space-between', padding: '10px 0' }}
                    >
                      <span>{participante.nombre}{participante.clienteId === cliente?.id ? ' · Tú' : ''}</span>
                      <span style={{ color: 'var(--muted)', fontSize: 12 }}>
                        {comanda.modoPagoMesa === 'POR_CONSUMO'
                          ? `Consumo estimado S/ ${participante.consumoEstimado.toFixed(2)}`
                          : 'Participante'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {modalInfo === 'pedido' && (
              <div style={{ display: 'grid', gap: 10 }}>
                {cargandoDetalle && <Loading text="Cargando tus productos…" />}
                {errorDetalle && (
                  <div className="y-banner" role="alert">
                    {errorDetalle}
                    <button type="button" className="y-btn line" onClick={() => void abrirDetallePedido()} style={{ marginLeft: 8 }}>
                      Reintentar
                    </button>
                  </div>
                )}
                {!cargandoDetalle && !errorDetalle && pedidoDetalle && (() => {
                  const misDetalles = pedidoDetalle.detalles.filter(
                    (detalle) => detalle.estadoRegistro === 'A' && detalle.clienteId === cliente?.id,
                  );
                  return (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                        <span>Subtotal de tus {misDetalles.length === 1 ? 'producto' : 'productos'}</span>
                        <strong>S/ {misDetalles.reduce((sum, detalle) => sum + detalle.subTotal, 0).toFixed(2)}</strong>
                      </div>
                      {misDetalles.length === 0 ? (
                        <p style={{ color: 'var(--muted)', margin: 0 }}>
                          Aún no hay productos asociados a tu cuenta en esta comanda.
                        </p>
                      ) : misDetalles.map((detalle) => (
                        <article key={detalle.id} className="y-panel" style={{ padding: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                            <strong>{detalle.cantidad} × {detalle.producto}</strong>
                            <strong>S/ {detalle.subTotal.toFixed(2)}</strong>
                          </div>
                          {detalle.notaCocina && (
                            <p style={{ margin: '5px 0', color: 'var(--muted)', fontSize: 12 }}>
                              Nota: {detalle.notaCocina}
                            </p>
                          )}
                          <small style={{ color: 'var(--muted)' }}>
                            {detalle.estadoPreparacion === 'P' ? 'Pendiente' :
                              detalle.estadoPreparacion === 'E' ? 'En preparación' :
                                detalle.estadoPreparacion === 'S' ? 'Servido' : 'Anulado'}
                          </small>
                        </article>
                      ))}
                    </>
                  );
                })()}
              </div>
            )}
          </section>
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

      {comprobanteAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-[280mm] w-full overflow-y-auto max-h-[85vh] overflow-y-auto">
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
    </div>
  );
}
