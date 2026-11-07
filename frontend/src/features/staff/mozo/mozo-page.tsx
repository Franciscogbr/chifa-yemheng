import { useCallback, useEffect, useMemo, useState } from 'react';
import { ErrorBox, Loading, PageHeader } from '../../../components/ui';
import { Ico } from '../../../components/Icon';
import { fmtPEN, timeAgo } from '../../../lib/format';
import { listarMesas, listarOcupacion } from '../../admin/mesas/mesas-service';
import { COLOR_POR_ESTADO, type Mesa, type OcupacionMesa } from '../../admin/mesas/mesas-types';
import { listarProductos } from '../../admin/productos/productos-service';
import type { Producto } from '../../admin/productos/productos-types';
import {
  abrirPedidoMesa,
  agregarLinea,
  confirmarEntregaMozo,
  listarEntregasMozo,
  listarPedidoPorMesa,
  pedirCuenta,
  type Ticket,
} from '../staff-service';
import { EstadoBadge } from '../../../shared/ui/EstadoBadge';
import { useRealtimePedido } from '../../../shared/hooks/useRealtimePedido';
import { StaffFeedbackModal } from '../staff-feedback-modal';

function tone(mesa: Mesa): string {
  return mesa.color || COLOR_POR_ESTADO[mesa.estadoOperativo] || '#d4a017';
}

type FiltroMesa = 'TODAS' | 'PRESENCIAL' | 'OCUPADA' | 'LIBRE' | 'POR COBRAR' | 'RESERVADA';

type FeedbackKind = 'info' | 'warning' | 'error' | 'success';

interface MozoFeedback {
  kind: FeedbackKind;
  title: string;
  description: string;
  onRefresh?: () => Promise<void>;
}

function describirError(error: unknown, fallback: string): Omit<MozoFeedback, 'onRefresh'> {
  const raw = error instanceof Error ? error.message : '';
  const code = raw.split(':', 1)[0]?.trim().toUpperCase() ?? '';
  const known: Record<string, Omit<MozoFeedback, 'onRefresh'>> = {
    YA_POR_COBRAR: {
      kind: 'info',
      title: 'Cuenta ya solicitada',
      description: 'Esta mesa está pendiente de cobro. El cajero continuará con el pago desde Caja.',
    },
    MESA_POR_COBRAR: {
      kind: 'warning',
      title: 'Mesa pendiente de cobro',
      description: 'No se puede modificar este pedido mientras espera el cobro en Caja.',
    },
    MOZO_PEDIDO_DIGITAL: {
      kind: 'info',
      title: 'Pedido digital',
      description: 'Puedes consultar el avance, pero el cliente administra este pedido desde su dispositivo.',
    },
    PEDIDO_FACTURADO: {
      kind: 'info',
      title: 'Pedido ya cobrado',
      description: 'Este pedido ya fue cobrado. Actualiza la mesa para ver su estado actual.',
    },
    PEDIDO_ANULADO: {
      kind: 'warning',
      title: 'Pedido anulado',
      description: 'Este pedido fue anulado. Actualiza la mesa antes de continuar.',
    },
    MESA_OCUPADA: {
      kind: 'warning',
      title: 'Mesa ya ocupada',
      description: 'La mesa ya tiene un pedido activo. Actualízala para abrir la comanda actual.',
    },
    PRODUCTO_NO_DISPONIBLE: {
      kind: 'warning',
      title: 'Producto no disponible',
      description: 'Ese producto ya no está disponible. Elige otro producto de la carta.',
    },
    ENTREGA_NO_DISPONIBLE: {
      kind: 'info',
      title: 'Entrega ya actualizada',
      description: 'No se pudo confirmar la entrega. Puede que otro usuario ya la haya registrado; actualiza la bandeja.',
    },
    NOT_FOUND: {
      kind: 'warning',
      title: 'Información desactualizada',
      description: 'La mesa o el pedido ya no está disponible. Actualiza el salón para continuar.',
    },
    TIPO_INVALIDO: {
      kind: 'warning',
      title: 'No se puede abrir el pedido',
      description: 'El tipo de pedido no es válido. Actualiza la mesa y vuelve a intentarlo.',
    },
    VALIDATION_ERROR: {
      kind: 'warning',
      title: 'Revisa los datos',
      description: 'Falta información o alguno de los datos no es válido. Revísalos e inténtalo nuevamente.',
    },
    NETWORK_ERROR: {
      kind: 'error',
      title: 'No se pudo conectar',
      description: 'Revisa la conexión e inténtalo nuevamente.',
    },
  };
  if (known[code]) return known[code];
  if (code.startsWith('DB_') || /failed to fetch|networkerror/i.test(raw)) {
    return {
      kind: 'error',
      title: 'No se pudo completar la acción',
      description: fallback,
    };
  }
  return {
    kind: 'error',
    title: 'No se pudo completar la acción',
    description: fallback,
  };
}

function esGestionablePorMozo(mesa: Mesa): boolean {
  return mesa.estadoOperativo === 'OCUPADA' && mesa.ocupacion?.canalOrigen === 'PRESENCIAL';
}

function tipoAtencion(mesa: Mesa): 'PRESENCIAL' | 'DIGITAL' | 'DESCONOCIDO' | null {
  if (!mesa.ocupacion) return null;
  if (mesa.ocupacion.canalOrigen === 'PRESENCIAL') return 'PRESENCIAL';
  if (mesa.ocupacion.canalOrigen === 'QR' || mesa.ocupacion.canalOrigen === 'WEB') return 'DIGITAL';
  return 'DESCONOCIDO';
}

function colorAtencion(mesa: Mesa): string | null {
  const tipo = tipoAtencion(mesa);
  if (tipo === 'PRESENCIAL') return '#0f9d83';
  if (tipo === 'DIGITAL') return '#8b5cf6';
  if (tipo === 'DESCONOCIDO') return '#6b7280';
  return null;
}

export function StaffMozoPage() {
  const [mesas, setMesas] = useState<Mesa[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [buscar, setBuscar] = useState('');
  const [abierta, setAbierta] = useState<Mesa | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [cargandoComanda, setCargandoComanda] = useState(false);
  const [feedback, setFeedback] = useState<MozoFeedback | null>(null);
  const [entregas, setEntregas] = useState<Ticket[] | null>(null);
  const [entregaError, setEntregaError] = useState<string | null>(null);
  const [entregasAbiertas, setEntregasAbiertas] = useState(false);
  const [filtroMesa, setFiltroMesa] = useState<FiltroMesa>('TODAS');

  const mostrarError = useCallback(
    (err: unknown, fallback: string, onRefresh?: () => Promise<void>) => {
      setFeedback({ ...describirError(err, fallback), onRefresh });
    },
    [],
  );

  const cargarMesas = useCallback(async () => {
    try {
      const [lista, ocupaciones] = await Promise.all([
        listarMesas({ page: 1, limit: 100, ambiente: '', estado: 'A', buscar: '' }),
        listarOcupacion(),
      ]);
      const porMesa = new Map<number, OcupacionMesa>(ocupaciones.map((ocupacion) => [ocupacion.mesaId, ocupacion]));
      setMesas(lista.data.map((mesa) => ({ ...mesa, ocupacion: porMesa.get(mesa.id) ?? null })));
      setError(null);
    } catch (e) {
      setError(describirError(e, 'No se pudo cargar el salón. Intenta actualizar el salón.').description);
    }
  }, []);

  useEffect(() => {
    void cargarMesas();
  }, [cargarMesas]);

  const cargarEntregas = useCallback(async () => {
    try {
      setEntregas(await listarEntregasMozo());
      setEntregaError(null);
    } catch (e) {
      setEntregaError(describirError(e, 'No se pudieron cargar los platos listos.').description);
    }
  }, []);

  useEffect(() => {
    void cargarEntregas();
    const timer = window.setInterval(() => void cargarEntregas(), 15000);
    return () => window.clearInterval(timer);
  }, [cargarEntregas]);

  const cargarComanda = useCallback(async (mesa: Mesa) => {
    setCargandoComanda(true);
    setTickets([]);
    try {
      const lista = await listarPedidoPorMesa(mesa.id);
      setTickets(lista.filter((p) => p.anulado === 'N'));
    } finally {
      setCargandoComanda(false);
    }
  }, []);

  const abrirComanda = useCallback(async (mesa: Mesa) => {
    setAbierta(mesa);
    try {
      await cargarComanda(mesa);
    } catch (e) {
      mostrarError(e, 'No se pudo cargar la comanda. Actualiza la mesa e inténtalo nuevamente.', async () => {
        await cargarMesas();
        await cargarComanda(mesa);
      });
    }
  }, [cargarComanda, cargarMesas, mostrarError]);

  const libres = useMemo(() => (mesas ?? []).filter((m) => m.estadoOperativo === 'LIBRE'), [mesas]);
  const ocupadas = useMemo(() => (mesas ?? []).filter((m) => m.estadoOperativo === 'OCUPADA'), [mesas]);
  const porCobrar = useMemo(() => (mesas ?? []).filter((m) => m.estadoOperativo === 'POR COBRAR'), [mesas]);
  const reservadas = useMemo(() => (mesas ?? []).filter((m) => m.estadoOperativo === 'RESERVADA'), [mesas]);
  const presenciales = useMemo(() => (mesas ?? []).filter(esGestionablePorMozo), [mesas]);
  const cantidadListos = useMemo(
    () => (entregas ?? []).reduce((total, pedido) => total + (pedido.detalles?.length ?? 0), 0),
    [entregas],
  );
  const visibles = useMemo(() => {
    const q = buscar.trim().toUpperCase();
    return (mesas ?? []).filter((mesa) => {
      const coincideBusqueda = !q || `${mesa.numero} ${mesa.ambiente}`.toUpperCase().includes(q);
      const coincideEstado =
        filtroMesa === 'TODAS' ||
        (filtroMesa === 'PRESENCIAL' ? esGestionablePorMozo(mesa) : mesa.estadoOperativo === filtroMesa);
      return coincideBusqueda && coincideEstado;
    });
  }, [mesas, buscar, filtroMesa]);

  return (
    <div className="y-shell" style={{ padding: '24px 16px 140px', maxWidth: 1240, margin: '0 auto' }}>
      <PageHeader
        title="Atención del salón"
        sub="Organiza tu atención: primero entrega los platos listos, luego continúa con las mesas."
      />
      <section className="y-flow-hero y-mozo-hero" aria-label="Resumen de atención">
        <div className="y-mozo-hero-top">
          <div className="y-flow-hero__content">
            <span className="y-flow-hero__eyebrow">Tu siguiente prioridad</span>
            <h2 className="y-flow-hero__title">
              {entregaError
                ? 'No se pudo actualizar la bandeja.'
                : entregas === null
                ? 'Revisa las prioridades del salón.'
                : cantidadListos > 0
                  ? 'Hay platos listos para entregar.'
                  : 'Mantén el salón en marcha.'}
            </h2>
            <p className="y-flow-hero__description">
              {entregaError
                ? 'Abre la bandeja de platos listos para ver el error y volver a intentar.'
                : entregas === null
                ? 'Estamos cargando la bandeja de cocina y el estado de las mesas.'
                : cantidadListos > 0
                ? `${cantidadListos} ${cantidadListos === 1 ? 'plato espera' : 'platos esperan'} en sus mesas. Atiéndelos antes de continuar.`
                : 'Consulta las mesas y sus estados. Los pedidos digitales se muestran para seguimiento; el cliente administra su pedido.'}
            </p>
          </div>
          <button
            className="btn btn-gold y-mozo-hero-action"
            onClick={() => {
              setEntregasAbiertas(true);
              void cargarEntregas();
            }}
          >
            <Ico n="waiter" size={18} />
            Ver platos listos{entregas === null ? '' : ` · ${cantidadListos}`}
          </button>
        </div>
        <div className="y-mozo-hero-stats" aria-label="Estado del salón">
          <div className="y-mozo-hero-stat y-mozo-hero-stat--ready">
            <span>Platos listos</span>
            <strong>{entregaError ? '!' : entregas === null ? '—' : cantidadListos}</strong>
            <small>{entregaError ? 'No disponible' : entregas === null ? 'Cargando bandeja' : 'Pendientes de entrega'}</small>
          </div>
          <div className="y-mozo-hero-stat">
            <span>Mesas ocupadas</span>
            <strong>{mesas === null ? '—' : ocupadas.length}</strong>
            <small>En atención</small>
          </div>
          <div className="y-mozo-hero-stat">
            <span>Por cobrar</span>
            <strong>{mesas === null ? '—' : porCobrar.length}</strong>
            <small>Derivar a Caja</small>
          </div>
          <div className="y-mozo-hero-stat">
            <span>Mesas libres</span>
            <strong>{mesas === null ? '—' : libres.length}</strong>
            <small>{reservadas.length} reservadas</small>
          </div>
        </div>
      </section>
      <div className="y-search" style={{ marginBottom: 14 }}>
        <Ico n="search" size={18} />
        <input
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          placeholder="Buscar mesa o ambiente"
        />
      </div>
      <nav className="y-mozo-filters" aria-label="Filtrar mesas">
        {(['TODAS', 'PRESENCIAL', 'OCUPADA', 'LIBRE', 'POR COBRAR', 'RESERVADA'] as const).map((filtro) => {
          const cantidad = {
            TODAS: mesas?.length,
            PRESENCIAL: mesas === null ? undefined : presenciales.length,
            OCUPADA: mesas === null ? undefined : ocupadas.length,
            LIBRE: mesas === null ? undefined : libres.length,
            'POR COBRAR': mesas === null ? undefined : porCobrar.length,
            RESERVADA: mesas === null ? undefined : reservadas.length,
          }[filtro];
          const etiqueta =
            filtro === 'TODAS'
              ? 'Todas'
              : filtro === 'PRESENCIAL'
                ? 'Presenciales'
                : filtro === 'POR COBRAR'
                  ? 'Por cobrar'
                  : filtro[0] + filtro.slice(1).toLowerCase();
          return (
            <button
              key={filtro}
              type="button"
              className={`y-mozo-filter${filtroMesa === filtro ? ' is-active' : ''}`}
              aria-pressed={filtroMesa === filtro}
              onClick={() => setFiltroMesa(filtro)}
            >
              {etiqueta} <span>{cantidad ?? '—'}</span>
            </button>
          );
        })}
      </nav>
      {error && <ErrorBox msg={error} retry={cargarMesas} />}
      {mesas === null && !error && <Loading text="Cargando salón..." />}
      {mesas?.length === 0 && !error && (
        <div className="card" style={{ padding: 32, textAlign: 'center' }}>
          <Ico n="chair" size={40} />
          <h3 style={{ margin: '8px 0 0' }}>Sin mesas registradas</h3>
          <p style={{ color: 'var(--text-muted)' }}>Cuando existan mesas activas aparecerán aquí.</p>
        </div>
      )}
      {visibles.length > 0 && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
          {visibles.map((m) => (
            <button
              key={m.id}
              className={`ys-mesa card${tipoAtencion(m) === 'PRESENCIAL' ? ' ys-mesa--presencial' : tipoAtencion(m) === 'DIGITAL' ? ' ys-mesa--digital' : tipoAtencion(m) === 'DESCONOCIDO' ? ' ys-mesa--unknown' : ''}`}
              style={{
                ['--tone' as string]: tone(m),
                ['--channel-tone' as string]: colorAtencion(m) ?? 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
              }}
              onClick={() => void abrirComanda(m)}
            >
              <div className="n">{m.numero}</div>
              <p style={{ margin: '10px 0 2px', color: tone(m), fontWeight: 700, fontSize: 12 }}>{m.estadoOperativo}</p>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 12 }}>{m.ambiente}</p>
              {m.ocupacion && (
                <div style={{ marginTop: 10, display: 'grid', gap: 4, fontSize: 12 }}>
                  <span className={`y-mozo-channel y-mozo-channel--${m.ocupacion.canalOrigen?.toLowerCase() ?? 'unknown'}`}>
                    {m.ocupacion.canalOrigen === 'PRESENCIAL'
                      ? esGestionablePorMozo(m)
                        ? 'Presencial · Gestionable'
                        : 'Presencial · Cuenta solicitada'
                      : m.ocupacion.canalOrigen
                        ? `${m.ocupacion.canalOrigen} · Solo seguimiento`
                        : 'Canal sin identificar · Solo seguimiento'}
                  </span>
                  <strong>{m.ocupacion.pedido}</strong>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {m.ocupacion.comensales} comensales · {m.ocupacion.items} productos
                  </span>
                  <span style={{ fontWeight: 700 }}>{fmtPEN(m.ocupacion.total)}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
      {!error && mesas !== null && mesas.length > 0 && visibles.length === 0 && (
        <div className="card" style={{ padding: 28, textAlign: 'center' }}>
          <h3 style={{ margin: 0 }}>No hay mesas en este filtro</h3>
          <p style={{ color: 'var(--text-muted)', margin: '8px 0 14px' }}>
            Prueba otro estado o cambia la búsqueda.
          </p>
          <button
            className="btn btn-ghost"
            onClick={() => {
              setFiltroMesa('TODAS');
              setBuscar('');
            }}
          >
            Mostrar todas las mesas
          </button>
        </div>
      )}

      {abierta && (
        <MozoDetalles
          mesa={abierta}
          tickets={tickets}
          cargando={cargandoComanda}
          onClose={() => setAbierta(null)}
          onRefrescar={() => void abrirComanda(abierta)}
          onAgregar={async (pedidoId, productoId, cantidad, nota) => {
            const nuevo = await agregarLinea(pedidoId, productoId, cantidad, nota);
            setTickets((prev) => prev.map((p) => (p.id === nuevo.id ? nuevo : p)));
          }}
          onAbrirComanda={async (comensales) => {
            try {
              const nuevo = await abrirPedidoMesa(abierta.id, comensales);
              setTickets((prev) => [...prev, nuevo]);
              await abrirComanda(abierta);
            } catch (e) {
              mostrarError(e, 'No se pudo abrir el pedido. Actualiza la mesa e inténtalo nuevamente.', async () => {
                await cargarMesas();
                await cargarComanda(abierta);
              });
            }
          }}
          onPedirCuenta={async (pedidoId) => {
            try {
              await pedirCuenta(pedidoId);
              await cargarMesas();
              setFeedback({
                kind: 'success',
                title: 'Cuenta solicitada',
                description: 'La mesa quedó pendiente de cobro. El cajero continuará con el pago desde Caja.',
              });
            } catch (e) {
              mostrarError(e, 'No se pudo solicitar la cuenta. Actualiza la mesa e inténtalo nuevamente.', async () => {
                await cargarMesas();
                await cargarComanda(abierta);
              });
            }
          }}
          onError={(err) => mostrarError(err, 'No se pudo agregar el producto. Revisa la comanda e inténtalo nuevamente.', async () => {
            await cargarMesas();
            await cargarComanda(abierta);
          })}
        />
      )}
      {entregasAbiertas && (
        <EntregasListasModal
          pedidos={entregas}
          error={entregaError}
          onCerrar={() => setEntregasAbiertas(false)}
          onRefrescar={cargarEntregas}
          onConfirmar={async (pedidoId, detalleId) => {
            await confirmarEntregaMozo(pedidoId, detalleId);
            await cargarEntregas();
            await cargarMesas();
            if (abierta) await abrirComanda(abierta);
          }}
          onError={(err) => mostrarError(err, 'No se pudo registrar la entrega. Actualiza la bandeja e inténtalo nuevamente.', cargarEntregas)}
        />
      )}
      {feedback && (
        <StaffFeedbackModal
          feedback={feedback}
          onClose={() => setFeedback(null)}
          onAction={feedback.onRefresh}
          actionLabel="Actualizar mesa"
          actionErrorMessage={(error) => describirError(error, 'No se pudo actualizar. Inténtalo nuevamente.').description}
        />
      )}
    </div>
  );
}

function MozoDetalles({
  mesa,
  tickets,
  cargando,
  onClose,
  onRefrescar,
  onAgregar,
  onAbrirComanda,
  onPedirCuenta,
  onError,
}: {
  mesa: Mesa;
  tickets: Ticket[];
  cargando: boolean;
  onClose: () => void;
  onRefrescar: () => void;
  onAgregar: (pedidoId: number, productoId: number, cantidad: number, nota: string) => Promise<void>;
  onAbrirComanda: (comensales: number) => Promise<void>;
  onPedirCuenta: (pedidoId: number) => Promise<void>;
  onError: (error: unknown) => void;
}) {
  const activos = tickets.filter((t) => t.anulado === 'N' && t.facturado === 'N');
  const activo = activos[0];
  const [pickerAbierto, setPickerAbierto] = useState(false);
  const pedidoDigital = activo?.canalOrigen === 'QR' || activo?.canalOrigen === 'WEB';
  const puedeAgregar = Boolean(activo && !pedidoDigital && mesa.estadoOperativo !== 'POR COBRAR');

  useRealtimePedido(activo?.id ?? null, () => void onRefrescar());

  return (
    <div
      className="ys-veil"
      style={{ position: 'fixed', inset: 0, zIndex: 70, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,.35)' }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ width: 'min(640px, 94vw)', padding: 22, maxHeight: '88vh', overflow: 'auto' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mozo-mesa-title"
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="ys-mesa" style={{ ['--tone' as string]: tone(mesa), padding: 0 }}>
            <div className="n" style={{ width: 44, height: 44, fontSize: 18 }}>{mesa.numero}</div>
          </div>
          <div style={{ flex: 1 }}>
            <h3 id="mozo-mesa-title" style={{ margin: 0 }}>Mesa {mesa.numero}</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 12 }}>{mesa.ambiente} · {mesa.capacidad} pax</p>
          </div>
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
        </div>

        {cargando && <Loading text="Cargando comanda..." />}

        {!cargando && activos.length === 0 && mesa.estadoOperativo === 'LIBRE' && (
          <div style={{ marginTop: 16, display: 'grid', gap: 10 }}>
            <button className="btn btn-gold" onClick={() => void onAbrirComanda(mesa.capacidad || 1)}>
              Abrir pedido ({mesa.capacidad} pax)
            </button>
          </div>
        )}

        {!cargando && activo && (
          <>
            <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="ys-status" style={{ color: '#f6be39', background: '#f6be3922' }}>{activo.numero}</span>
              <span className="ys-status" style={{ color: pedidoDigital ? '#8b5cf6' : '#64748b', background: pedidoDigital ? '#8b5cf622' : '#64748b22' }}>
                <i /> {pedidoDigital ? `Pedido ${activo.canalOrigen}` : 'Atención presencial'}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{timeAgo(activo.fecha)}</span>
              <span style={{ marginLeft: 'auto', fontWeight: 700 }}>{fmtPEN(activo.total)}</span>
            </div>
            <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
              {activo.detalles?.map((d) => (
                <div key={d.id} className="y-line" style={{ padding: '8px 0' }}>
                  <div style={{ flex: 1 }}>
                    <b>{d.cantidad}x {d.producto}</b>
                    {d.notaCocina && <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 12 }}>{d.notaCocina}</p>}
                    {d.fechaEntregaMozo && <p style={{ margin: 0, color: '#22c55e', fontSize: 11 }}>Entregado a la mesa</p>}
                  </div>
                  <EstadoBadge estado={d.estadoPreparacion} size="md" />
                </div>
              ))}
            </div>
            {pedidoDigital && (
              <p style={{ margin: '12px 0 0', color: 'var(--text-muted)', fontSize: 12 }}>
                El cliente administra su pedido digital. Desde aquí solo se consulta el avance y se registra la entrega.
              </p>
            )}
            <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {puedeAgregar && (
                <button
                  className="btn btn-gold"
                  onClick={() => setPickerAbierto(true)}
                >
                  Agregar producto
                </button>
              )}
              {!pedidoDigital && mesa.estadoOperativo !== 'POR COBRAR' && (
                <button
                  className="btn btn-ghost"
                  onClick={() => void onPedirCuenta(activo.id)}
                >
                  Pedir cuenta · {fmtPEN(activo.total)}
                </button>
              )}
              {mesa.estadoOperativo === 'POR COBRAR' && (
                <span className="ys-status" style={{ color: '#17a2b8', background: '#17a2b822' }}>
                  Cuenta solicitada · cobro en Caja
                </span>
              )}
              <button className="btn btn-ghost" onClick={onRefrescar}>Refrescar</button>
            </div>
          </>
        )}

        {pickerAbierto && activo && (
          <ProductosPicker
            onCerrar={() => setPickerAbierto(false)}
            onAgregar={async (productoId, cantidad, nota) => {
              try {
                await onAgregar(activo.id, productoId, cantidad, nota);
              } catch (e) {
                onError(e);
                throw e;
              }
            }}
            onError={onError}
          />
        )}
      </div>
    </div>
  );
}

function ProductosPicker({
  onCerrar,
  onAgregar,
  onError,
}: {
  onCerrar: () => void;
  onAgregar: (productoId: number, cantidad: number, nota: string) => Promise<void>;
  onError: (error: unknown) => void;
}) {
  const [productos, setProductos] = useState<Producto[] | null>(null);
  const [buscar, setBuscar] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [nota, setNota] = useState('');
  const [seleccion, setSeleccion] = useState<Producto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listarProductos({ page: 1, limit: 100, nombre: '', categoria: '', estado: 'A', disponible: 'S' })
      .then((r) => setProductos(r.data))
      .catch((e) => {
        setError(describirError(e, 'No se pudieron cargar los productos.').description);
        onError(e);
      });
  }, []);

  const visibles = useMemo(() => {
    const q = buscar.trim().toUpperCase();
    return (productos ?? []).filter((p) => p.nombre.toUpperCase().includes(q));
  }, [productos, buscar]);

  return (
    <div style={{ marginTop: 16, borderTop: '1px solid var(--line2)', paddingTop: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <h4 style={{ margin: 0, flex: 1 }}>Productos</h4>
        <button className="btn btn-ghost" onClick={onCerrar}>Cerrar</button>
      </div>
      <div className="y-search" style={{ marginBottom: 10 }}>
        <Ico n="search" size={18} />
        <input value={buscar} onChange={(e) => setBuscar(e.target.value)} placeholder="Buscar producto" />
      </div>
      {error && <ErrorBox msg={error} />}
      {!productos && !error && <Loading text="Cargando productos..." />}
      {productos?.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Sin productos activos.</p>}
      {visibles.length > 0 && (
        <div style={{ display: 'grid', gap: 6, maxHeight: 260, overflow: 'auto' }}>
          {visibles.map((p) => (
            <button
              key={p.id}
              className="y-row"
              style={{ cursor: 'pointer' }}
              onClick={() => setSeleccion(p)}
            >
              <span>{p.nombre}</span>
              <span className="r">{fmtPEN(p.precio)}</span>
            </button>
          ))}
        </div>
      )}
      {seleccion && (
        <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
          <p style={{ margin: 0 }}>
            <b>{seleccion.nombre}</b> · {fmtPEN(seleccion.precio)}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="input"
              type="number"
              min={1}
              value={cantidad}
              onChange={(e) => setCantidad(Math.max(1, Number(e.target.value)))}
              style={{ width: 90 }}
            />
            <input
              className="input"
              placeholder="Nota para cocina"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              style={{ flex: 1 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-gold"
              onClick={() => {
                setError(null);
                void onAgregar(seleccion.id, cantidad, nota)
                  .then(() => setSeleccion(null))
                  .catch((e: unknown) => setError(describirError(e, 'No se pudo agregar el producto.').description));
              }}
            >
              Agregar
            </button>
            <button className="btn btn-ghost" onClick={() => setSeleccion(null)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

function EntregasListasModal({
  pedidos,
  error,
  onCerrar,
  onRefrescar,
  onConfirmar,
  onError,
}: {
  pedidos: Ticket[] | null;
  error: string | null;
  onCerrar: () => void;
  onRefrescar: () => Promise<void>;
  onConfirmar: (pedidoId: number, detalleId: number) => Promise<void>;
  onError: (error: unknown) => void;
}) {
  const [procesando, setProcesando] = useState<number | null>(null);
  const cantidad = (pedidos ?? []).reduce((total, pedido) => total + (pedido.detalles?.length ?? 0), 0);

  return (
    <div
      className="ys-veil"
      style={{ position: 'fixed', inset: 0, zIndex: 80, display: 'grid', placeItems: 'center', padding: 16, background: 'rgba(0,0,0,.58)' }}
      onClick={onCerrar}
    >
      <section
        className="card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mozo-entregas-title"
        style={{ width: 'min(760px, 96vw)', maxHeight: '88vh', overflow: 'auto', padding: 22 }}
        onClick={(event) => event.stopPropagation()}
      >
        <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <span className="y-flow-hero__eyebrow">Despacho de cocina</span>
            <h2 id="mozo-entregas-title" style={{ margin: '4px 0', fontSize: 22 }}>Listos para entregar</h2>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 13 }}>
              {cantidad} {cantidad === 1 ? 'plato espera' : 'platos esperan'} en sus mesas.
            </p>
          </div>
          <button className="btn btn-ghost" onClick={() => void onRefrescar()} aria-label="Actualizar platos listos">
            Actualizar
          </button>
          <button className="btn btn-ghost" onClick={onCerrar}>Cerrar</button>
        </header>

        {error && <ErrorBox msg={error} retry={onRefrescar} />}
        {pedidos === null && !error && <Loading text="Buscando platos listos..." />}
        {pedidos?.length === 0 && !error && (
          <div className="card" style={{ textAlign: 'center', padding: 32, background: 'var(--surface-2)' }}>
            <Ico n="ok" size={30} />
            <h3 style={{ margin: '8px 0 4px' }}>Todo entregado</h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Cuando cocina despache nuevos platos aparecerán aquí.</p>
          </div>
        )}

        <div style={{ display: 'grid', gap: 12 }}>
          {pedidos?.map((pedido) => (
            <article key={pedido.id} className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <strong>Mesa {pedido.mesaNumero ?? pedido.mesaId ?? '—'}</strong>
                  <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: 12 }}>
                    Comanda {pedido.numero} · {pedido.canalOrigen === 'PRESENCIAL' ? 'Atención presencial' : `Pedido ${pedido.canalOrigen}`}
                  </span>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{timeAgo(pedido.fecha)}</span>
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                {pedido.detalles?.map((detalle) => (
                  <div key={detalle.id} className="y-line" style={{ gap: 12, padding: '10px 0' }}>
                    <div style={{ flex: 1 }}>
                      <strong>{detalle.cantidad} × {detalle.producto}</strong>
                      {detalle.notaCocina && (
                        <p style={{ margin: '3px 0 0', color: 'var(--text-muted)', fontSize: 12 }}>{detalle.notaCocina}</p>
                      )}
                    </div>
                    <button
                      className="btn btn-gold"
                      disabled={procesando === detalle.id}
                      onClick={() => {
                        setProcesando(detalle.id);
                        void onConfirmar(pedido.id, detalle.id)
                          .catch((e: unknown) => onError(e))
                          .finally(() => setProcesando(null));
                      }}
                    >
                      {procesando === detalle.id ? 'Registrando…' : 'Confirmar entrega'}
                    </button>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
