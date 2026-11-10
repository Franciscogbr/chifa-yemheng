import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Bike, CheckCircle2, ExternalLink, MapPin, Phone, ReceiptText } from 'lucide-react';
import { fmtPEN } from '@/lib/format';
import { MapLeaflet } from '@/shared/ui/MapLeaflet';
import { useGpsTracking, type GpsPosition } from '@/shared/hooks/useGpsTracking';
import { api } from '@/shared/services/api-client';
import type { DeliveryShared, EstadoDelivery } from '@/shared/types/delivery';
import { toast } from '@/shared/ui/use-toast';

const GPS_MIN_INTERVAL_MS = 10000;
type MetodoPagoDelivery = 'EFECTIVO' | 'YAPE' | 'PLIN' | 'TARJETA' | 'TRANSFERENCIA';
const METODOS_CON_REFERENCIA = new Set<MetodoPagoDelivery>(['YAPE', 'PLIN', 'TARJETA', 'TRANSFERENCIA']);

const ESTADOS: Record<EstadoDelivery, string> = {
  P: 'Pendiente',
  R: 'En ruta',
  E: 'Entregado',
  C: 'Cancelado',
};

function googleMapsUrl(entrega: DeliveryShared): string {
  const destino = entrega.latCliente !== null && entrega.latCliente !== undefined &&
      entrega.lngCliente !== null && entrega.lngCliente !== undefined
    ? `${entrega.latCliente},${entrega.lngCliente}`
    : `${entrega.direccion}${entrega.distrito ? `, ${entrega.distrito}` : ''}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destino)}`;
}

function geolocationMessage(code: number): string {
  if (code === 1) return 'No se autorizó el GPS. Puedes continuar la ruta, pero el cliente no verá tu ubicación.';
  if (code === 2) return 'No se pudo determinar tu ubicación. Revisa el GPS del dispositivo.';
  if (code === 3) return 'El GPS tardó demasiado en responder. Se volverá a intentar.';
  return 'El GPS no está disponible en este dispositivo.';
}

export function EntregaDetallePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const deliveryId = Number(id) || 0;
  const [gps, setGps] = useState<GpsPosition | null>(null);
  const [compartiendoGps, setCompartiendoGps] = useState(false);
  const [entrega, setEntrega] = useState<DeliveryShared | null>(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);
  const lastSentRef = useRef(0);

  /* Modal de registro de venta (cobro al cliente) */
  const [modalVenta, setModalVenta] = useState(false);
  const [formVenta, setFormVenta] = useState<{
    monto: number;
    metodoPago: MetodoPagoDelivery;
    referencia: string;
  }>({
    monto: 0,
    metodoPago: 'EFECTIVO',
    referencia: '',
  });
  const [guardandoVenta, setGuardandoVenta] = useState(false);

  /* Modal de confirmación de venta realizada */
  const [ventaConfirmada, setVentaConfirmada] = useState(false);
  const [resultadoVenta, setResultadoVenta] = useState<{ idVenta: number; montoPagado: number; metodoPago: string } | null>(null);

  const cargar = useCallback(async () => {
    if (!deliveryId) {
      setError('El identificador de entrega no es válido.');
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const resultado = await api.getMiEntrega(deliveryId);
      setEntrega(resultado);
      if (resultado.estado === 'R') setCompartiendoGps(true);
      if (resultado.estado === 'E' || resultado.estado === 'C') setCompartiendoGps(false);
    } catch (e) {
      console.error('Error cargando entrega:', e);
      setError(e instanceof Error ? e.message : 'No se pudo cargar la entrega.');
    } finally {
      setLoading(false);
    }
  }, [deliveryId]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const onPosition = useCallback((position: GpsPosition) => {
    setGps(position);
    setGpsMessage(null);
    const now = Date.now();
    if (now - lastSentRef.current < GPS_MIN_INTERVAL_MS) return;
    lastSentRef.current = now;
    api.actualizarUbicacion(deliveryId, position.lat, position.lng).catch((e: unknown) => {
      console.error('Error reportando ubicación:', e);
      setGpsMessage('No se pudo enviar la ubicación. Revisa tu conexión.');
    });
  }, [deliveryId]);

  const onGpsError = useCallback((errorGps: GeolocationPositionError) => {
    setGpsMessage(geolocationMessage(errorGps.code));
  }, []);

  const { setEnabled } = useGpsTracking({
    onPosition,
    onError: onGpsError,
    enabled: compartiendoGps,
  });

  useEffect(() => {
    if (compartiendoGps && !navigator.geolocation) {
      setGpsMessage('Este navegador no permite GPS en este contexto. Puedes seguir la ruta por dirección.');
    }
  }, [compartiendoGps]);

  useEffect(() => {
    setEnabled(compartiendoGps);
  }, [compartiendoGps, setEnabled]);

  const iniciarRuta = async () => {
    if (guardando || !entrega || entrega.estado !== 'P') return;
    setGuardando(true);
    try {
      const actualizada = await api.iniciarRuta(deliveryId);
      setEntrega(actualizada);
      setCompartiendoGps(true);
      setGpsMessage(null);
      await toast({
        title: 'Ruta iniciada',
        description: 'El cliente recibirá tu ubicación mientras esta entrega esté en ruta.',
      });
    } catch (e) {
      console.error('Error iniciando ruta:', e);
      toast({ title: 'Error', description: 'No se pudo iniciar la ruta. Actualiza la entrega e inténtalo nuevamente.', variant: 'destructive' });
    } finally {
      setGuardando(false);
    }
  };

  const abrirModalCobro = () => {
    if (guardandoVenta || !entrega || !['R', 'E'].includes(entrega.estado)) return;
    setFormVenta({
      monto: entrega.montoPorCobrar ?? entrega.totalPedido ?? 0,
      metodoPago: 'EFECTIVO',
      referencia: '',
    });
    setModalVenta(true);
  };

  const handleRegistrarVenta = async () => {
    if (guardandoVenta || !entrega) return;
    setGuardandoVenta(true);
    try {
      const resultado = await api.registrarVentaDelivery(deliveryId, {
        monto: formVenta.monto,
        metodoPago: formVenta.metodoPago,
        referencia: formVenta.referencia.trim() || undefined,
      });
      setEntrega((actual) => actual ? {
        ...actual,
        estado: 'E' as const,
        montoPagado: resultado.montoPagado,
        metodoPago: resultado.metodoPago,
        montoPorCobrar: resultado.montoPorCobrar,
      } : actual);
      setCompartiendoGps(false);
      setModalVenta(false);
      setFormVenta({ monto: 0, metodoPago: 'EFECTIVO', referencia: '' });
      setResultadoVenta({
        idVenta: resultado.idVenta,
        montoPagado: resultado.montoPagado,
        metodoPago: resultado.metodoPago,
      });
      setVentaConfirmada(true);
    } catch (e: unknown) {
      console.error('Error registrando venta:', e);
      const msg = e instanceof Error ? e.message : 'No se pudo registrar el cobro.';
      if ((e as { error?: string })?.error === 'VENTA_YA_EXISTE') {
        toast({ title: 'Ya registrado', description: 'Esta entrega ya tiene una venta registrada.', variant: 'destructive' });
        void cargar();
      } else {
        toast({ title: 'Error', description: msg, variant: 'destructive' });
      }
    } finally {
      setGuardandoVenta(false);
    }
  };

  const pins = useMemo(() => {
    const result = [];
    if (entrega?.latCliente != null && entrega.lngCliente != null) {
      result.push({ lat: entrega.latCliente, lng: entrega.lngCliente, label: 'Dirección del cliente', color: 'blue' as const });
    }
    const currentGps = gps ?? (
      entrega?.latRepartidor != null && entrega.lngRepartidor != null
        ? { lat: entrega.latRepartidor, lng: entrega.lngRepartidor }
        : null
    );
    if (currentGps) {
      result.push({ ...currentGps, label: 'Tu ubicación', color: 'red' as const });
    }
    return result;
  }, [entrega, gps]);

  const center = useMemo<[number, number] | undefined>(() => {
    if (pins.length === 0) return undefined;
    if (pins.length === 1) return [pins[0].lat, pins[0].lng];
    return [
      (pins[0].lat + pins[1].lat) / 2,
      (pins[0].lng + pins[1].lng) / 2,
    ];
  }, [pins]);

  if (loading) {
    return <div className="y-shell y-responsive-page p-6 text-center text-gray-500">Cargando detalle de la entrega…</div>;
  }

  if (error || !entrega) {
    return (
      <div className="y-shell y-responsive-page y-padding-repartidor">
        <div className="y-panel mx-auto max-w-xl p-6" role="alert">
          <p className="text-red-700">{error ?? 'No se encontró la entrega.'}</p>
          <div className="flex gap-3">
            <button type="button" className="y-btn line" onClick={() => void cargar()}>Reintentar</button>
            <Link to="/repartidor/mis-entregas" className="y-btn red">Volver a mis entregas</Link>
          </div>
        </div>
      </div>
    );
  }

  const direccionCompleta = `${entrega.direccion}${entrega.distrito ? `, ${entrega.distrito}` : ''}`;
  const terminal = entrega.estado === 'E' || entrega.estado === 'C';

  return (
    <div className="y-shell y-responsive-page y-padding-repartidor">
      <div className="mx-auto max-w-3xl space-y-4">
        <Link to="/repartidor/mis-entregas" className="inline-flex items-center gap-2 text-sm text-gray-600">
          <ArrowLeft size={17} /> Mis entregas
        </Link>

        <section className="y-panel space-y-5 p-5 sm:p-6">
          <header className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="m-0 text-sm text-gray-500">Detalle de entrega</p>
              <h1 className="m-0 text-2xl font-bold text-[#7F1518]">Pedido #{entrega.pedidoId}</h1>
            </div>
            <span className="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-semibold">{ESTADOS[entrega.estado]}</span>
          </header>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border p-4">
              <h2 className="mb-2 flex items-center gap-2 text-base font-semibold"><MapPin size={18} /> Dirección</h2>
              <p className="mb-1 font-medium">{direccionCompleta}</p>
              {entrega.referencia && <p className="mb-3 text-sm text-gray-500">Referencia: {entrega.referencia}</p>}
              {!entrega.referencia && <div className="mb-3" />}
              <a href={googleMapsUrl(entrega)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
                Abrir ruta en Google Maps <ExternalLink size={15} />
              </a>
            </div>

            <div className="rounded-xl border p-4">
              <h2 className="mb-2 text-base font-semibold">Datos del cliente</h2>
              <p className="mb-2 font-medium">{entrega.nombreCliente ?? 'Cliente'}</p>
              {entrega.telefono ? (
                <a href={`tel:${entrega.telefono}`} className="inline-flex items-center gap-2 text-sm text-blue-700">
                  <Phone size={15} /> {entrega.telefono}
                </a>
              ) : (
                <p className="mb-0 text-sm text-gray-500">No se registró un teléfono de contacto.</p>
              )}
            </div>

            {entrega.items && entrega.items.length > 0 && (
              <div className="col-span-full rounded-xl border p-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="mb-0 flex items-center gap-2 text-base font-semibold">
                    <ReceiptText size={16} /> Platos del pedido
                  </h2>
                  <span className="text-xs font-medium text-gray-500">{entrega.items.length} ítem(es)</span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {entrega.items.map((item) => (
                    <div key={item.idProducto} className="flex justify-between items-start text-sm border-b pb-2 last:border-b-0">
                      <div className="flex-1">
                        <p className="m-0 text-gray-700">{item.cantidad}× {item.nombre}</p>
                        {item.nota && (
                          <p className="m-0 text-[10px] text-gray-500 italic">Nota: {item.nota}</p>
                        )}
                      </div>
                      <p className="m-0 font-medium text-gray-900 text-right">
                        S/ {item.subTotal.toFixed(2)}
                      </p>
                    </div>
                  ))}
                  <div className="mt-2 pt-2 border-t flex justify-between text-sm font-bold">
                    <span className="text-gray-600">Subtotal platos</span>
                    <span className="text-gray-900">
                      S/ {entrega.items.reduce((s, i) => s + i.subTotal, 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <h2 className="mb-2 text-base font-semibold">Cobro al cliente</h2>
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="m-0 text-sm text-gray-600">Importe pendiente</p>
                <p className="m-0 text-3xl font-bold text-[#7F1518]">
                  {entrega.montoPorCobrar === undefined ? '—' : fmtPEN(entrega.montoPorCobrar)}
                </p>
              </div>
              <div className="text-sm text-gray-600">
                <p className="m-0">Pedido: {entrega.totalPedido === undefined ? '—' : fmtPEN(entrega.totalPedido)}</p>
                <p className="m-0">Envío: {fmtPEN(entrega.costo)}{entrega.costoConfirmado === false ? ' (por confirmar)' : ''}</p>
                {entrega.montoPagado !== undefined && entrega.montoPagado > 0 && (
                  <p className="m-0">Ya pagado: {fmtPEN(entrega.montoPagado)}</p>
                )}
                {entrega.metodoPago && <p className="m-0">Pagos registrados: {entrega.metodoPago}</p>}
              </div>
            </div>
            {entrega.costoConfirmado === false && (
              <p className="mb-0 mt-2 text-sm text-amber-800">El local aún no confirmó el costo de envío; verifica el monto antes de cobrar.</p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {entrega.estado === 'P' && (
              <button type="button" onClick={() => void iniciarRuta()} disabled={guardando} className="y-btn red inline-flex items-center gap-2">
                <Bike size={18} /> {guardando ? 'Iniciando…' : 'Iniciar ruta'}
              </button>
            )}
            {entrega.estado === 'R' && !entrega.montoPagado && !entrega.metodoPago && (
              <button type="button" onClick={abrirModalCobro} disabled={guardandoVenta} className="y-btn red inline-flex items-center gap-2">
                <ReceiptText size={18} /> Registrar cobro
              </button>
            )}
            {entrega.estado === 'E' && (
              <div className="rounded-xl border p-4 flex flex-col items-start gap-2">
                <CheckCircle2 size={20} className="text-green-600 mt-0.5" />
                <div>
                  <h3 className="m-0 text-sm font-bold text-green-800">Entrega completada</h3>
                  <p className="m-0 text-xs text-green-700">El pedido fue entregado y cobrado al cliente.</p>
                </div>
                <Link
                  to="/repartidor/mis-entregas"
                  className="mt-3 inline-flex items-center gap-2 y-btn red"
                >
                  <ArrowLeft size={17} /> Regresar a mis entregas
                </Link>
              </div>
            )}
            {entrega.estado === 'C' && (
              <div className="rounded-xl border p-4 flex flex-col items-start gap-2">
                <span style={{ fontSize: 20 }} className="mt-0.5">❌</span>
                <div>
                  <h3 className="m-0 text-sm font-bold text-red-800">Entrega cancelada</h3>
                  <p className="m-0 text-xs text-red-700">Esta entrega fue cancelada. No se pueden realizar más acciones.</p>
                </div>
                <Link
                  to="/repartidor/mis-entregas"
                  className="mt-3 inline-flex items-center gap-2 y-btn red"
                >
                  <ArrowLeft size={17} /> Regresar a mis entregas
                </Link>
              </div>
            )}
            {entrega.estado === 'R' && !terminal && <p className="my-auto text-sm text-gray-600">Compartir GPS es opcional; la ruta puede continuar si no está disponible.</p>}
          </div>

          {entrega.estado === 'R' && (
            <section aria-label="Mapa de la entrega">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h2 className="m-0 flex items-center gap-2 text-base font-semibold"><MapPin size={18} /> Mapa de entrega</h2>
                <span className={`text-xs ${compartiendoGps ? 'text-green-700' : 'text-amber-700'}`}>
                  {gpsMessage ? 'GPS con problemas' : gps ? 'GPS activo' : compartiendoGps ? 'Buscando GPS…' : 'GPS detenido'}
                </span>
              </div>
              {gpsMessage && <p className="text-sm text-amber-800" role="status">{gpsMessage}</p>}
              {pins.length > 0 ? (
                <MapLeaflet pins={pins} readonly center={center} zoom={14} height="320px" />
              ) : (
                <div className="rounded-xl border bg-gray-50 p-4 text-sm text-gray-600">
                  No hay coordenadas disponibles. Usa “Abrir ruta en Google Maps” para navegar por dirección.
                </div>
              )}
            </section>
          )}
          {modalVenta && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 sm:p-6">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                <h2 className="text-xl font-bold text-[#7F1518] mb-4">Registrar Cobro</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Indique cuánto cobró al cliente y con qué método.
                </p>
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-bold uppercase opacity-60">Monto cobrado *</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formVenta.monto}
                        onChange={(e) => setFormVenta({ ...formVenta, monto: Number(e.target.value) || 0 })}
                        className="rounded-lg bg-gray-50 px-3 py-2 text-sm"
                        placeholder="0.00"
                        required
                      />
                    </label>
                    <p className="text-[10px] text-gray-500">
                      Monto sugerido: {fmtPEN(entrega?.montoPorCobrar ?? entrega?.totalPedido ?? 0)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-bold uppercase opacity-60">Método de pago *</span>
                      <select
                        value={formVenta.metodoPago}
                        onChange={(e) =>
                          setFormVenta({ ...formVenta, metodoPago: e.target.value as MetodoPagoDelivery })
                        }
                        className="rounded-lg bg-gray-50 px-3 py-2 text-sm"
                      >
                        <option value="EFECTIVO">Efectivo</option>
                        <option value="YAPE">Yape</option>
                        <option value="PLIN">Plin</option>
                        <option value="TARJETA">Tarjeta</option>
                        <option value="TRANSFERENCIA">Transferencia</option>
                      </select>
                    </label>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-bold uppercase opacity-60">Referencia</span>
                      <input
                        type="text"
                        value={formVenta.referencia}
                        onChange={(e) => setFormVenta({ ...formVenta, referencia: e.target.value })}
                        className="rounded-lg bg-gray-50 px-3 py-2 text-sm"
                        placeholder="Nro. operación (obligatorio para Yape/Plin/Tarjeta/Transferencia)"
                      />
                    </label>
                    {METODOS_CON_REFERENCIA.has(formVenta.metodoPago) && !formVenta.referencia.trim() && (
                      <p className="text-[10px] text-[#DC2626]">La referencia es obligatoria para este método.</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setModalVenta(false)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleRegistrarVenta()}
                    disabled={
                      guardandoVenta ||
                      formVenta.monto <= 0 ||
                      METODOS_CON_REFERENCIA.has(formVenta.metodoPago) &&
                        !formVenta.referencia.trim()
                    }
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#7F1518] hover:bg-[#A61E22] disabled:opacity-50"
                  >
                    {guardandoVenta ? 'Registrando…' : 'Registrar cobro'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Modal de confirmación de venta realizada */}
        {ventaConfirmada && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 sm:p-6">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={24} className="text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-[#7F1518] mb-2">Venta registrada</h2>
                <p className="text-gray-600 mb-6">
                  La venta <strong>#{resultadoVenta?.idVenta}</strong> se registró correctamente y el pedido fue entregado al cliente.
                </p>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm border-b pb-2">
                    <span className="text-gray-500">Número de venta</span>
                    <span className="text-gray-700 font-bold">#{resultadoVenta?.idVenta}</span>
                  </div>
                  <div className="flex justify-between text-sm border-b pb-2">
                    <span className="text-gray-500">Monto cobrado</span>
                    <span className="text-gray-700 font-bold">S/ {resultadoVenta?.montoPagado?.toFixed(2) ?? '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Método de pago</span>
                    <span className="text-gray-700">{resultadoVenta?.metodoPago ?? '—'}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setVentaConfirmada(false);
                    setResultadoVenta(null);
                    navigate('/repartidor/mis-entregas');
                  }}
                  className="w-full px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#7F1518] hover:bg-[#A61E22]"
                >
                  Cerrar y volver a mis entregas
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
