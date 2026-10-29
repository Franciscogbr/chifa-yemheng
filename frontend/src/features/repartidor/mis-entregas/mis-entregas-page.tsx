import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bike, ChevronLeft, ChevronRight, MapPin, Phone, RefreshCw } from 'lucide-react';
import { fmtPEN } from '@/lib/format';
import { api } from '@/shared/services/api-client';
import type { DeliveryListaShared, DeliveryShared, EstadoDelivery } from '@/shared/types/delivery';

const PAGE_SIZE = 20;
type FiltroEntrega = 'P' | 'R' | 'historial';
const FILTROS: { key: FiltroEntrega; label: string; estados: Array<'P' | 'R' | 'E' | 'C'> }[] = [
  { key: 'P', label: 'Asignados', estados: ['P'] },
  { key: 'R', label: 'En ruta', estados: ['R'] },
  { key: 'historial', label: 'Historial', estados: ['E', 'C'] },
];
const ESTADOS: Record<EstadoDelivery, string> = {
  P: 'Pendiente',
  R: 'En ruta',
  E: 'Entregado',
  C: 'Cancelado',
};

function fecha(value: string): string {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 'Fecha no disponible' : parsed.toLocaleString();
}

export function MisEntregasPage() {
  const [resultado, setResultado] = useState<DeliveryListaShared | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [filtro, setFiltro] = useState<FiltroEntrega>('P');
  const [page, setPage] = useState(1);
  const filtroActivo = FILTROS.find((item) => item.key === filtro) ?? FILTROS[0];
  const entregas: DeliveryShared[] = resultado?.data ?? [];
  const totalPaginas = Math.max(1, Math.ceil((resultado?.total ?? 0) / PAGE_SIZE));

  useEffect(() => {
    let vigente = true;
    setLoading(true);
    setError(null);
    void api.getMisEntregas({ estado: filtroActivo.estados, page, limit: PAGE_SIZE })
      .then((response) => {
        if (vigente) setResultado(response);
      })
      .catch((e: unknown) => {
        console.error('Error cargando entregas del repartidor:', e);
        if (vigente) setError(e instanceof Error ? e.message : 'No se pudieron cargar tus entregas.');
      })
      .finally(() => {
        if (vigente) setLoading(false);
      });
    return () => { vigente = false; };
  }, [filtroActivo, page, reloadKey]);

  const cambiarFiltro = (nuevoFiltro: FiltroEntrega) => {
    setFiltro(nuevoFiltro);
    setPage(1);
  };

  return (
    <div className="y-shell y-responsive-page y-padding-repartidor">
      <div className="mx-auto max-w-3xl space-y-5">
        <header className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500">Panel del repartidor</p>
            <h1 className="text-2xl font-bold text-[#7F1518]">Mis entregas</h1>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"
            onClick={() => setReloadKey((key) => key + 1)}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </header>

        <section className="flex flex-wrap gap-2" aria-label="Filtrar entregas">
          {FILTROS.map((item) => (
            <button
              key={item.key}
              type="button"
              aria-pressed={filtro === item.key}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold ${filtro === item.key ? 'border-[#7F1518] bg-[#7F1518] text-white' : 'bg-white text-gray-700'}`}
              onClick={() => cambiarFiltro(item.key)}
            >
              {item.label}
            </button>
          ))}
        </section>

        {error && (
          <div className="y-panel flex flex-wrap items-center justify-between gap-3 p-4" role="alert">
            <p className="m-0 text-sm text-red-700">No se pudieron cargar las entregas. ({error})</p>
            <button type="button" className="y-btn line" onClick={() => setReloadKey((key) => key + 1)}>
              Reintentar
            </button>
          </div>
        )}

        {loading && <div className="y-panel p-6 text-center text-gray-500">Cargando tus entregas…</div>}

        {!loading && !error && resultado?.total === 0 && (
          <div className="y-panel p-8 text-center">
            <Bike className="mx-auto mb-3 text-gray-400" size={32} />
            <h2 className="text-lg font-semibold">
              {filtro === 'P' ? 'No tienes pedidos pendientes asignados' : filtro === 'R' ? 'No tienes entregas en ruta' : 'Aún no tienes entregas en el historial'}
            </h2>
            <p className="mb-0 text-sm text-gray-500">Las entregas se actualizarán aquí cuando cambie su estado.</p>
          </div>
        )}

        {!loading && !error && entregas.length > 0 && (
          <section className="space-y-3" aria-label="Lista de entregas">
            {entregas.map((entrega) => (
              <Link
                key={entrega.id}
                to={`/repartidor/entrega/${entrega.id}`}
                className="y-panel flex flex-col gap-3 p-4 text-inherit no-underline transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h2 className="m-0 text-lg font-bold">Pedido #{entrega.pedidoId}</h2>
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold">{ESTADOS[entrega.estado]}</span>
                  </div>
                  <p className="mb-1 flex items-start gap-2 text-sm text-gray-600">
                    <MapPin size={16} className="mt-0.5 shrink-0" />
                    <span>{entrega.direccion}{entrega.distrito ? `, ${entrega.distrito}` : ''}</span>
                  </p>
                  {entrega.referencia && <p className="mb-1 text-sm text-gray-600">Referencia: {entrega.referencia}</p>}
                  {entrega.telefono && (
                    <p className="mb-1 text-sm">
                      <Phone size={14} className="mr-1 inline" aria-hidden="true" />
                      <span className="sr-only">Teléfono: </span>{entrega.telefono}
                    </p>
                  )}
                  <p className="mb-0 text-xs text-gray-500">
                    {entrega.nombreCliente ?? 'Cliente'} · Asignado {fecha(entrega.fechaCreacion)}
                  </p>
                  <p className="mb-0 mt-1 text-xs text-gray-500">
                    Pedido {entrega.totalPedido === undefined ? '—' : fmtPEN(entrega.totalPedido)} · Envío {fmtPEN(entrega.costo)}
                    {entrega.metodoPago ? ` · ${entrega.metodoPago}` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
                  <div className="text-left sm:text-right">
                    <p className="m-0 text-xs text-gray-500">Por cobrar</p>
                    <p className="m-0 font-bold">{entrega.montoPorCobrar === undefined ? '—' : fmtPEN(entrega.montoPorCobrar)}</p>
                  </div>
                  <ChevronRight size={20} aria-hidden="true" />
                </div>
              </Link>
            ))}
          </section>
        )}

        {!loading && !error && (resultado?.total ?? 0) > 0 && (
          <nav className="flex items-center justify-between gap-3" aria-label="Paginación de entregas">
            <button
              type="button"
              className="y-btn line inline-flex items-center gap-1"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
            >
              <ChevronLeft size={17} /> Anterior
            </button>
            <span className="text-sm text-gray-600">Página {page} de {totalPaginas} · {resultado?.total} entregas</span>
            <button
              type="button"
              className="y-btn line inline-flex items-center gap-1"
              onClick={() => setPage((current) => Math.min(totalPaginas, current + 1))}
              disabled={page >= totalPaginas}
            >
              Siguiente <ChevronRight size={17} />
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
