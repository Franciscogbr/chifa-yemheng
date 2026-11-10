import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, RefreshCw, PackageCheck } from 'lucide-react';
import { MapLeaflet } from '@/shared/ui/MapLeaflet';
import { api } from '@/shared/services/api-client';
import { toast } from '@/shared/ui/use-toast';

const POLL_MS = 10000;

const ESTADO_LABEL: Record<string, string> = {
  P: 'Pendiente',
  R: 'En ruta',
  E: 'Entregado',
  C: 'Cancelado',
};

interface SeguimientoDelivery {
  id: number;
  pedidoId: number;
  distrito: string | null;
  direccion: string;
  referencia: string | null;
  telefono: string | null;
  repartidor: string | null;
  repartidorId: number | null;
  costo: number;
  estado: 'P' | 'R' | 'E' | 'C';
  fechaCreacion: string;
  fechaSalida: string | null;
  fechaEntrega: string | null;
}

interface UbicacionSeguimiento {
  id_pedidodelivery: number;
  id_pedido: number;
  direccion_entrega: string;
  distrito: string | null;
  costo_envio: number;
  situacion: 'P' | 'R' | 'E' | 'C';
  f_salida: string | null;
  f_entrega: string | null;
  lat_cliente: number | null;
  lng_cliente: number | null;
  lat_repartidor: number | null;
  lng_repartidor: number | null;
  f_ubicacion: string | null;
  repartidor: string | null;
}

export function StaffSeguimientoPage() {
  const [deliveries, setDeliveries] = useState<SeguimientoDelivery[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Map<number, UbicacionSeguimiento>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const intervalsRef = useRef<Map<number, ReturnType<typeof setInterval>>>(new Map());

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSeguimiento({ estado: 'R' });
      const lista: SeguimientoDelivery[] = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
      setDeliveries(lista);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar el seguimiento.');
      toast({ title: 'Error', description: 'No se pudieron cargar las entregas en ruta.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [refreshKey]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  /* Polling de ubicación por cada delivery en ruta */
  useEffect(() => {
    // Limpiar intervalos previos
    intervalsRef.current.forEach((t) => clearInterval(t));
    intervalsRef.current = new Map();

    for (const d of deliveries) {
      const timer = setInterval(async () => {
        try {
          const data = await api.getUbicacionSeguimiento(d.id);
          setUbicaciones((prev) => {
            const next = new Map(prev);
            next.set(d.id, data);
            return next;
          });
        } catch (e) {
          console.error(`Error ubicación delivery ${d.id}:`, e);
        }
      }, POLL_MS);
      intervalsRef.current.set(d.id, timer);

      // Primera consulta inmediata
      void (async () => {
        try {
          const data = await api.getUbicacionSeguimiento(d.id);
          setUbicaciones((prev) => {
            const next = new Map(prev);
            next.set(d.id, data);
            return next;
          });
        } catch (e) {
          console.error(`Error ubicación delivery ${d.id}:`, e);
        }
      })();
    }

    return () => {
      intervalsRef.current.forEach((t) => clearInterval(t));
      intervalsRef.current = new Map();
    };
  }, [deliveries]);

  const pins = useMemo(() => {
    const result: Array<{ lat: number; lng: number; label: string; color: 'blue' | 'red'; id: number }> = [];
    for (const d of deliveries) {
      const u = ubicaciones.get(d.id);
      const reparto = u?.lat_repartidor != null && u?.lng_repartidor != null;
      const cliente = u?.lat_cliente != null && u?.lng_cliente != null;
      if (reparto) {
        result.push({
          lat: u.lat_repartidor!,
          lng: u.lng_repartidor!,
          label: `Repartidor: ${u.repartidor ?? 'Repartidor'} — Pedido #${d.pedidoId}`,
          color: 'red',
          id: d.id * 10 + 1,
        });
      }
      if (cliente) {
        result.push({
          lat: u.lat_cliente!,
          lng: u.lng_cliente!,
          label: `Cliente (entrega): ${u.direccion_entrega} — Pedido #${d.pedidoId}`,
          color: 'blue',
          id: d.id * 10 + 2,
        });
      }
    }
    return result;
  }, [deliveries, ubicaciones]);

  const center = useMemo<[number, number] | undefined>(() => {
    if (pins.length === 0) return undefined;
    const lat = pins.reduce((s: number, p: { lat: number; lng: number }) => s + p.lat, 0) / pins.length;
    const lng = pins.reduce((s: number, p: { lat: number; lng: number }) => s + p.lng, 0) / pins.length;
    return [lat, lng];
  }, [pins]);

  const ahora = () => new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return (
      <div className="y-shell y-responsive-page p-6 text-center text-gray-500">
        <RefreshCw size={20} className="animate-spin mx-auto mb-3" /> Cargando seguimiento en vivo…
      </div>
    );
  }

  if (error && deliveries.length === 0) {
    return (
      <div className="y-shell y-responsive-page y-padding-repartidor">
        <div className="y-panel mx-auto max-w-xl p-6" role="alert">
          <p className="text-red-700">{error}</p>
          <button
            type="button"
            className="y-btn line"
            onClick={() => setRefreshKey((k) => k + 1)}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const enRuta = deliveries.filter((d) => d.estado === 'R');

  return (
    <div className="y-shell y-responsive-page y-padding-repartidor">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500">Seguimiento de entregas</p>
            <h1 className="text-2xl font-bold text-[#7F1518]">Mapa en vivo</h1>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"
            onClick={() => setRefreshKey((k) => k + 1)}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Mapa */}
          <div className="lg:col-span-8 rounded-xl border shadow-sm overflow-hidden">
            <div className="h-[500px]">
              {pins.length > 0 ? (
                <MapLeaflet pins={pins} readonly center={center} zoom={13} height="100%" />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <MapPin size={32} className="mb-2 opacity-50" />
                  <p>No hay repartidores en ruta con ubicación disponible.</p>
                </div>
              )}
            </div>
            <div className="px-4 py-2 text-xs text-gray-500 border-t">
              {pins.length} punto(s) en mapa ·
              {enRuta.length} entrega(s) en ruta · Última actualización: {ahora()}
            </div>
          </div>

          {/* Panel de entregas */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Entregas en ruta</h2>
              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-yellow-100 text-yellow-800">
                {enRuta.length}
              </span>
            </div>

            {enRuta.length === 0 ? (
              <div className="rounded-xl border p-8 text-center text-gray-500">
                <PackageCheck size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay entregas en ruta en este momento.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {enRuta.map((d) => {
                  const u = ubicaciones.get(d.id);
                  const tieneGps = u?.lat_repartidor != null && u?.lng_repartidor != null;
                  return (
                    <div key={d.id} className="rounded-xl border p-3">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <p className="m-0 font-mono text-sm text-gray-600">Pedido #{d.pedidoId}</p>
                          <p className="m-0 text-sm font-medium text-gray-900 truncate">{d.direccion}</p>
                        </div>
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-yellow-100 text-yellow-800">
                          En ruta
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <span>{d.repartidor || 'Sin asignar'}</span>
                        <span>·</span>
                        <span>S/ {d.costo.toFixed(2)}</span>
                        <span>·</span>
                        <span>{tieneGps ? 'GPS activo' : 'Sin GPS'}</span>
                      </div>
                      {u && u.f_salida && (
                        <p className="m-0 text-[10px] text-gray-400">
                          Salida: {new Date(u.f_salida).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                          {u.f_ubicacion ? ` · Ubicación: ${new Date(u.f_ubicacion).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}` : ''}
                        </p>
                      )}
                      <div className="mt-2 flex gap-2">
                        <Link
                          to={`/delivery/seguimiento/${d.id}`}
                          className="flex-1 text-center py-1.5 rounded-lg bg-[#F5F5F5] text-[11px] font-semibold text-[#7F1518] hover:bg-[#E8E0E0] transition-colors"
                        >
                          Ver detalle
                        </Link>
                        {tieneGps && (
                          <button
                            type="button"
                            className="flex-1 text-center py-1.5 rounded-lg bg-[#2563EB]/10 text-xs font-semibold text-[#2563EB] hover:bg-[#2563EB]/20 transition-colors"
                            onClick={() => {
                              // centrar mapa en este pin se maneja vía estado; aquí solo notificamos
                              toast({ title: 'Centrar mapa', description: 'Selecciona el pin del repartidor en el mapa.' });
                            }}
                          >
                            Centrar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Todas las entregas del seguimiento (paginado simple) */}
        <section className="border-t pt-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">Historial del seguimiento</h2>
            <span className="text-xs text-gray-500">{deliveries.length} registro(s)</span>
          </div>
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F5F5]">
                <tr>
                  <th className="px-3 py-2 text-[#333333]/60 uppercase">Pedido</th>
                  <th className="px-3 py-2 text-[#333333]/60 uppercase">Dirección</th>
                  <th className="px-3 py-2 text-[#333333]/60 uppercase">Repartidor</th>
                  <th className="px-3 py-2 text-[#333333]/60 uppercase text-center">Estado</th>
                  <th className="px-3 py-2 text-[#333333]/60 uppercase text-right">Costo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F5F5]">
                {deliveries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-gray-500">
                      Sin registros de seguimiento.
                    </td>
                  </tr>
                ) : (
                  deliveries.map((d) => (
                    <tr key={d.id}>
                      <td className="px-3 py-2.5 font-mono text-gray-600">#{d.pedidoId}</td>
                      <td className="px-3 py-2.5 truncate max-w-[200px] text-gray-700">{d.direccion}</td>
                      <td className="px-3 py-2.5 text-gray-700">{d.repartidor || '—'}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          d.estado === 'R' ? 'bg-yellow-100 text-yellow-800' : d.estado === 'E' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {ESTADO_LABEL[d.estado]}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium text-gray-700">S/ {d.costo.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
