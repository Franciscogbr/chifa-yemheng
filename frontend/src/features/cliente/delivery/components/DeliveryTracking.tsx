import { Link } from 'react-router-dom';
import { ArrowLeft, Bike, Check, PackageCheck } from 'lucide-react';
import { fmtPEN } from '@/lib/format';
import { MapLeaflet } from '@/shared/ui/MapLeaflet';
import { useDeliveryUbicacion } from '@/shared/hooks/useDeliveryUbicacion';

const PASOS: { id: 'P' | 'R' | 'E'; label: string; icon: typeof Bike }[] = [
  { id: 'P', label: 'Pendiente', icon: PackageCheck },
  { id: 'R', label: 'En ruta', icon: Bike },
  { id: 'E', label: 'Entregado', icon: Check },
];

function hora(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString();
}

export function DeliveryTracking({ deliveryId }: { deliveryId: number }) {
  const { ubicacion, loading } = useDeliveryUbicacion(deliveryId);

  if (loading && !ubicacion) {
    return (
      <div className="y-shell y-responsive-page">
        <div className="y-panel" style={{ padding: 22 }}>Cargando seguimiento…</div>
      </div>
    );
  }

  if (!ubicacion) {
    return (
      <div className="y-shell y-responsive-page">
        <div className="y-head">
          <Link to="/cliente/inicio" className="y-icon-btn" aria-label="Volver"><ArrowLeft size={18} /></Link>
          <h2 className="font-d" style={{ margin: 0, fontSize: 22 }}>Seguimiento delivery</h2>
        </div>
        <div className="y-panel" style={{ padding: 22 }}>No encontramos información de este delivery.</div>
      </div>
    );
  }

  const idx = PASOS.findIndex((p) => p.id === ubicacion.situacion);
  const pins = [
    ubicacion.lat_cliente !== null && ubicacion.lng_cliente !== null
      ? { lat: ubicacion.lat_cliente, lng: ubicacion.lng_cliente, label: 'Dirección de entrega', color: 'blue' as const }
      : null,
    ubicacion.lat_repartidor !== null && ubicacion.lng_repartidor !== null
      ? { lat: ubicacion.lat_repartidor, lng: ubicacion.lng_repartidor, label: 'Repartidor', color: 'red' as const }
      : null,
  ].filter((p): p is NonNullable<typeof p> => p !== null);
  const center: [number, number] | undefined = pins.length === 0
    ? undefined
    : pins.length === 1
      ? [pins[0].lat, pins[0].lng]
      : [(pins[0].lat + pins[1].lat) / 2, (pins[0].lng + pins[1].lng) / 2];

  return (
    <div className="y-shell y-responsive-page">
      <div className="y-head">
        <Link to="/cliente/inicio" className="y-icon-btn" aria-label="Volver"><ArrowLeft size={18} /></Link>
        <h2 className="font-d" style={{ margin: 0, fontSize: 22 }}>Seguimiento delivery</h2>
      </div>

      <div className="y-panel" style={{ padding: 22 }}>
        {ubicacion.situacion === 'C' ? (
          <div className="y-banner" role="status" style={{ marginTop: 14, borderTop: '1px solid var(--line2)', paddingTop: 14 }}>
            Este delivery fue cancelado. Contacta al restaurante si necesitas más información.
          </div>
        ) : (
          <div className="y-track">
            {PASOS.map((p, i) => {
              const done = idx >= 0 && i < idx;
              const now = i === idx;
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

        <div className="mt-6 p-4 rounded-lg border" style={{ borderColor: 'var(--outline-variant)' }}>
          <h3 className="font-medium text-gray-900 mb-2">Pedido #{ubicacion.id_pedido}</h3>
          <p className="text-gray-500 mb-2">Dirección: {ubicacion.direccion_entrega || '—'}</p>
          <p className="text-gray-500 mb-2">Distrito: {ubicacion.distrito || '—'}</p>
          <p className="text-gray-500 mb-2">
            Costo de envío: {ubicacion.costo_envio_confirmado ? fmtPEN(ubicacion.costo_envio) : 'pendiente de confirmación'}
          </p>
          {ubicacion.repartidor && <p className="text-gray-500 mb-2">Repartidor: {ubicacion.repartidor}</p>}
          <p className="text-gray-500 mb-2">Salida: {hora(ubicacion.f_salida)} · Entrega: {hora(ubicacion.f_entrega)}</p>
          {ubicacion.situacion === 'R' && (
            <p className="text-green-600 text-sm">
              <b>En ruta desde:</b> {hora(ubicacion.f_salida)}
              {ubicacion.lat_repartidor !== null && <span> · Última ubicación: {hora(ubicacion.f_ubicacion)}</span>}
            </p>
          )}
        </div>

        {ubicacion.situacion !== 'C' && pins.length > 0 ? (
          <div className="mt-4">
            <MapLeaflet pins={pins} readonly center={center} zoom={14} height="280px" />
          </div>
        ) : ubicacion.situacion !== 'C' ? (
          <div className="mt-4 p-3 rounded-lg bg-gray-50 border border-gray-300">
            <p className="text-sm text-gray-600" style={{ margin: 0 }}>
              Aún no hay ubicación del repartidor disponible.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
