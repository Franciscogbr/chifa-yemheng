import { useEffect, useMemo, useState } from 'react';
import { ErrorBox, Loading, PageHeader } from '../../../components/ui';
import {
  anularPedidoAdmin,
  listarPedidosAdmin,
  obtenerPedidoAdmin,
  type DetallePedidoAdmin,
  type EstadoPreparacion,
  type PedidoAdmin,
} from './pedidos-service';
import { mensajeError } from '../../../shared/errors';
import { useToast } from '../../../shared/ui/use-toast';

const LIMITE = 50;
const ESTADOS_PEDIDO = ['ABIERTO', 'EN PREPARACION', 'SERVIDO', 'FACTURADO', 'ANULADO'];
const ESTADOS_PREPARACION: Record<EstadoPreparacion, string> = {
  P: 'Pendiente',
  L: 'Listo',
  A: 'Anulado',
};
const TONOS_PEDIDO: Record<string, string> = {
  ABIERTO: '#3b82f6',
  'EN PREPARACION': '#f59e0b',
  SERVIDO: '#14b8a6',
  FACTURADO: '#22c55e',
  ANULADO: '#ef4444',
};
const TONOS_PREPARACION: Record<EstadoPreparacion, string> = {
  P: '#f59e0b',
  L: '#22c55e',
  A: '#ef4444',
};

function formatoFecha(fecha: string | null): string {
  if (!fecha) return '—';
  const parsed = new Date(fecha);
  return Number.isNaN(parsed.getTime())
    ? '—'
    : parsed.toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' });
}

function moneda(valor: number): string {
  return `S/ ${Number(valor || 0).toFixed(2)}`;
}

function puedeAnular(pedido: PedidoAdmin): boolean {
  const deliveryCancelable = pedido.deliverySituacion == null || pedido.deliverySituacion === 'P';
  return pedido.anulado !== 'S' && pedido.facturado !== 'S' && pedido.estadoRegistro === 'A' && deliveryCancelable;
}

function etiquetaCanal(canal: PedidoAdmin['canalOrigen']): string {
  if (canal === 'QR') return 'QR';
  if (canal === 'WEB') return 'Web';
  return 'Presencial';
}

export function AdminPedidosPage() {
  const [pedidos, setPedidos] = useState<PedidoAdmin[]>([]);
  const [noCancelablesIds, setNoCancelablesIds] = useState<Set<number>>(() => new Set());
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [estado, setEstado] = useState('');
  const [fecha, setFecha] = useState('');
  const [buscar, setBuscar] = useState('');
  const [canal, setCanal] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actualizar, setActualizar] = useState(0);
  const [pedidoIdSeleccionado, setPedidoIdSeleccionado] = useState<number | null>(null);
  const [detalle, setDetalle] = useState<PedidoAdmin | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState<string | null>(null);
  const [versionDetalle, setVersionDetalle] = useState(0);
  const [accionPedidoId, setAccionPedidoId] = useState<number | null>(null);
  const { toast } = useToast();
  const [pedidoParaAnular, setPedidoParaAnular] = useState<PedidoAdmin | null>(null);
  const [motivoAnular, setMotivoAnular] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setCargando(true);
    setError(null);
    void listarPedidosAdmin({ page, limit: LIMITE, estado, fecha }, controller.signal)
      .then((resultado) => {
        setPedidos(resultado.data);
        setTotal(resultado.total);
      })
      .catch((e: unknown) => {
        if (!controller.signal.aborted) {
          setError(e instanceof Error ? e.message : 'No fue posible cargar las comandas.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setCargando(false);
      });
    return () => controller.abort();
  }, [page, estado, fecha, actualizar]);

  useEffect(() => {
    if (pedidoIdSeleccionado === null) {
      setDetalle(null);
      return;
    }
    const controller = new AbortController();
    setDetalle(null);
    setCargandoDetalle(true);
    setErrorDetalle(null);
    void obtenerPedidoAdmin(pedidoIdSeleccionado, controller.signal)
      .then((pedido) => setDetalle(pedido))
      .catch((e: unknown) => {
        if (!controller.signal.aborted) {
          setErrorDetalle(e instanceof Error ? e.message : 'No fue posible cargar el detalle.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setCargandoDetalle(false);
      });
    return () => controller.abort();
  }, [pedidoIdSeleccionado, versionDetalle]);

  const pedidosVisibles = useMemo(() => {
    const query = buscar.trim().toLocaleLowerCase();
    return pedidos.filter((pedido) => {
      if (canal && pedido.canalOrigen !== canal) return false;
      if (!query) return true;
      const ubicacion = pedido.mesaNumero ?? (pedido.mesaId ? String(pedido.mesaId) : 'delivery');
      return [pedido.numero, ubicacion, pedido.estado, pedido.canalOrigen, String(pedido.id)]
        .join(' ')
        .toLocaleLowerCase()
        .includes(query);
    });
  }, [pedidos, buscar, canal]);

  const totalPaginas = Math.max(1, Math.ceil(total / LIMITE));
  const anulados = pedidos.filter((pedido) => pedido.anulado === 'S').length;
  const facturados = pedidos.filter((pedido) => pedido.facturado === 'S').length;
  const activos = pedidos.filter((pedido) => puedeAnular(pedido)).length;

  const abrirAnular = (pedido: PedidoAdmin) => {
    setPedidoParaAnular(pedido);
    setMotivoAnular('');
  };

  const cerrarAnular = () => {
    setPedidoParaAnular(null);
    setMotivoAnular('');
  };

  const ejecutarAnular = async () => {
    if (!pedidoParaAnular || !motivoAnular.trim()) return;
    setAccionPedidoId(pedidoParaAnular.id);
    setError(null);
    try {
      await anularPedidoAdmin(pedidoParaAnular.id, motivoAnular.trim());
      setActualizar((valor) => valor + 1);
      if (pedidoIdSeleccionado === pedidoParaAnular.id) setVersionDetalle((valor) => valor + 1);
      cerrarAnular();
      toast({
        title: 'Comanda anulada',
        description: 'La comanda ha sido anulada correctamente.',
        variant: 'success',
      });
    } catch (e) {
      const err = e as Error & { error?: string; detail?: string };
      const detailError = err.detail ?? err.message;
      const codigo = err.error ?? detailError;
      if (codigo === 'DELIVERY_NO_CANCELABLE') {
        setNoCancelablesIds((actual) => new Set(actual).add(pedidoParaAnular.id));
        setError('Esta comanda pertenece a un delivery que ya no se puede anular.');
      } else {
        setError(mensajeError(codigo) || 'No fue posible anular la comanda.');
      }
    } finally {
      setAccionPedidoId(null);
    }
  };

  return (
    <div className="y-shell" style={{ padding: '24px 16px 140px', maxWidth: 1240, margin: '0 auto' }}>
      <PageHeader
        title="Pedidos / Comandas"
        sub="Consulta el historial, el origen y el estado real de cada comanda."
        right={
          <button className="btn btn-ghost" onClick={() => setActualizar((valor) => valor + 1)}>
            Actualizar
          </button>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 16 }}>
        <Resumen titulo="Total registrado" valor={total} />
        <Resumen titulo="Activos en página" valor={activos} tono="#3b82f6" />
        <Resumen titulo="Facturados en página" valor={facturados} tono="#22c55e" />
        <Resumen titulo="Anulados en página" valor={anulados} tono="#ef4444" />
      </div>

      <section className="y-panel" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: 12 }}>
          <label style={labelStyle}>
            Buscar en esta página
            <input
              className="input"
              value={buscar}
              onChange={(event) => setBuscar(event.target.value)}
              placeholder="N.º, mesa o canal"
              aria-label="Buscar en los pedidos de esta página"
            />
          </label>
          <label style={labelStyle}>
            Estado de la comanda
            <select className="input" value={estado} onChange={(event) => { setEstado(event.target.value); setPage(1); }}>
              <option value="">Todos los estados</option>
              {ESTADOS_PEDIDO.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label style={labelStyle}>
            Canal de origen
            <select className="input" value={canal} onChange={(event) => setCanal(event.target.value)}>
              <option value="">Todos los canales</option>
              <option value="PRESENCIAL">Presencial</option>
              <option value="QR">QR</option>
              <option value="WEB">Web</option>
            </select>
          </label>
          <label style={labelStyle}>
            Fecha
            <input className="input" type="date" value={fecha} onChange={(event) => { setFecha(event.target.value); setPage(1); }} />
          </label>
        </div>
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)' }}>
          El buscador y el canal filtran los {pedidos.length} registros cargados en la página actual.
        </div>
      </section>

      {error && <ErrorBox msg={error} retry={() => setActualizar((valor) => valor + 1)} />}
      {cargando && pedidos.length === 0 && !error && <Loading text="Cargando comandas..." />}

      {!cargando && !error && pedidosVisibles.length === 0 && (
        <div className="y-panel" style={{ padding: 28, textAlign: 'center', color: 'var(--muted)' }}>
          {pedidos.length === 0 ? 'No hay comandas para los filtros seleccionados.' : 'No hay coincidencias en esta página.'}
        </div>
      )}

      {pedidosVisibles.length > 0 && (
        <div className="y-panel" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 820, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--muted)', fontSize: 12 }}>
                  {['Comanda', 'Fecha', 'Mesa / tipo', 'Origen', 'Estado', 'Total', 'Cobro', ''].map((columna) => (
                    <th key={columna} style={{ padding: '12px 14px', borderBottom: '1px solid var(--line2)' }}>{columna}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pedidosVisibles.map((pedido) => (
                  <tr key={pedido.id} style={{ borderBottom: '1px solid var(--line2)' }}>
                    <td style={cellStyle}>
                      <strong>{pedido.numero || `#${pedido.id}`}</strong>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>ID {pedido.id}</div>
                    </td>
                    <td style={cellStyle}>{formatoFecha(pedido.fecha)}</td>
                    <td style={cellStyle}>
                      {pedido.mesaId ? `Mesa ${pedido.mesaNumero ?? pedido.mesaId}` : pedido.tipo || 'Sin mesa'}
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{pedido.comensales || 1} comensal(es)</div>
                    </td>
                    <td style={cellStyle}>{etiquetaCanal(pedido.canalOrigen)}</td>
                    <td style={cellStyle}><EstadoPedido estado={pedido.estado} /></td>
                    <td style={cellStyle}>{moneda(pedido.total)}</td>
                    <td style={cellStyle}>{pedido.facturado === 'S' ? 'Facturado' : 'Pendiente'}</td>
                    <td style={{ ...cellStyle, whiteSpace: 'nowrap' }}>
                      <button className="btn btn-ghost" onClick={() => setPedidoIdSeleccionado(pedido.id)}>Detalle</button>
                      {puedeAnular(pedido) && !noCancelablesIds.has(pedido.id) && (
                        <button
                          className="btn btn-ghost"
                          style={{ color: '#ef4444', marginLeft: 4 }}
                          disabled={accionPedidoId === pedido.id}
                          onClick={() => void abrirAnular(pedido)}
                        >
                          {accionPedidoId === pedido.id ? 'Anulando…' : 'Anular'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '12px 16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>
              Página {page} de {totalPaginas} · {total} comanda(s)
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost" disabled={page <= 1 || cargando} onClick={() => setPage((actual) => Math.max(1, actual - 1))}>Anterior</button>
              <button className="btn btn-ghost" disabled={page >= totalPaginas || cargando} onClick={() => setPage((actual) => Math.min(totalPaginas, actual + 1))}>Siguiente</button>
            </div>
          </div>
        </div>
      )}

      {pedidoIdSeleccionado !== null && (
        <div
          role="presentation"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setPedidoIdSeleccionado(null); }}
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,.65)', display: 'grid', placeItems: 'center', padding: 16 }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="pedido-detalle-titulo" className="y-panel" style={{ width: 'min(760px, 100%)', maxHeight: '90vh', overflowY: 'auto', padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12, marginBottom: 16 }}>
              <div>
                <h2 id="pedido-detalle-titulo" style={{ margin: 0 }}>Detalle de comanda</h2>
                <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 13 }}>
                  {detalle?.numero ?? `Pedido #${pedidoIdSeleccionado}`}
                </p>
              </div>
              <button className="btn btn-ghost" onClick={() => setPedidoIdSeleccionado(null)} aria-label="Cerrar detalle">Cerrar</button>
            </div>
            {errorDetalle && <ErrorBox msg={errorDetalle} retry={() => setVersionDetalle((valor) => valor + 1)} />}
            {cargandoDetalle && !errorDetalle && <Loading text="Cargando detalle..." />}
            {detalle && !cargandoDetalle && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 16 }}>
                  <Dato titulo="Estado" valor={<EstadoPedido estado={detalle.estado} />} />
                  <Dato titulo="Origen" valor={etiquetaCanal(detalle.canalOrigen)} />
                  <Dato titulo="Mesa / tipo" valor={detalle.mesaId ? `Mesa ${detalle.mesaNumero ?? detalle.mesaId}` : detalle.tipo || 'Sin mesa'} />
                  <Dato titulo="Fecha" valor={formatoFecha(detalle.fecha)} />
                  <Dato titulo="Cobro" valor={detalle.facturado === 'S' ? 'Facturado' : 'Pendiente'} />
                  <Dato titulo="Total" valor={moneda(detalle.total)} />
                </div>
                {detalle.observacion && <p style={{ margin: '0 0 16px', color: 'var(--muted)' }}>Observación: {detalle.observacion}</p>}
                {detalle.motivoAnulacion && <p style={{ margin: '0 0 16px', color: '#ef4444' }}>Motivo de anulación: {detalle.motivoAnulacion}</p>}
                <h3 style={{ margin: '0 0 8px' }}>Productos</h3>
                {(detalle.detalles ?? []).length === 0 ? (
                  <p style={{ color: 'var(--muted)' }}>Esta comanda no tiene líneas de detalle.</p>
                ) : (
                  <div style={{ display: 'grid', gap: 8 }}>
                    {(detalle.detalles ?? []).map((linea) => <LineaDetalle key={linea.id} linea={linea} />)}
                  </div>
                )}
                <div style={{ display: 'grid', gap: 4, justifyContent: 'end', textAlign: 'right', marginTop: 16, fontSize: 13 }}>
                  <span>Subtotal: {moneda(detalle.subtotal)}</span>
                  {detalle.descuento > 0 && <span>Descuento: −{moneda(detalle.descuento)}</span>}
                  {detalle.servicio > 0 && <span>Servicio: {moneda(detalle.servicio)}</span>}
                  {detalle.igv > 0 && <span>IGV: {moneda(detalle.igv)}</span>}
                  <strong style={{ fontSize: 16 }}>Total: {moneda(detalle.total)}</strong>
                </div>
                {puedeAnular(detalle) && !noCancelablesIds.has(detalle.id) && (
                  <div style={{ display: 'flex', justifyContent: 'end', marginTop: 18 }}>
                    <button className="btn btn-ghost" style={{ color: '#ef4444' }} disabled={accionPedidoId === detalle.id} onClick={() => void abrirAnular(detalle)}>
                      {accionPedidoId === detalle.id ? 'Anulando…' : 'Anular comanda'}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      )}

      {pedidoParaAnular && (
        <div
          role="presentation"
          onMouseDown={(event) => { if (event.target === event.currentTarget) cerrarAnular(); }}
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,.65)', display: 'grid', placeItems: 'center', padding: 16 }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="anular-titulo" className="y-panel" style={{ width: 'min(480px, 90%)', maxHeight: '90vh', overflowY: 'auto', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12, marginBottom: 16 }}>
              <div>
                <h2 id="anular-titulo" style={{ margin: 0 }}>Anular comanda</h2>
                <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 13 }}>
                  {pedidoParaAnular.numero ?? `Pedido #${pedidoParaAnular.id}`}
                </p>
              </div>
              <button className="btn btn-ghost" onClick={cerrarAnular} aria-label="Cerrar">Cerrar</button>
            </div>
            <p style={{ margin: '0 0 16px', color: 'var(--muted)' }}>
              ¿Estás seguro de que quieres anular esta comanda? Esta acción no se puede deshacer.
            </p>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>Motivo de anulación</label>
              <textarea
                value={motivoAnular}
                onChange={(event) => setMotivoAnular(event.target.value)}
                placeholder="Ej: Cliente desistió, error en el pedido…"
                rows={3}
                style={{ width: '100%', padding: 8, border: '1px solid var(--line2)', borderRadius: 6, background: 'var(--surface-lowest)', color: 'var(--text)', fontSize: 13 }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={cerrarAnular}
                className="btn btn-ghost"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={ejecutarAnular}
                disabled={accionPedidoId === pedidoParaAnular.id || !motivoAnular.trim()}
                className="btn"
                style={{ background: '#ef4444', color: '#fff' }}
              >
                {accionPedidoId === pedidoParaAnular.id ? 'Anulando…' : 'Anular comanda'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function Resumen({ titulo, valor, tono = 'var(--text)' }: { titulo: string; valor: number; tono?: string }) {
  return (
    <div className="y-panel" style={{ padding: 14 }}>
      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{titulo}</div>
      <strong style={{ display: 'block', fontSize: 22, color: tono }}>{valor}</strong>
    </div>
  );
}

function EstadoPedido({ estado }: { estado: string }) {
  const normalized = estado.toUpperCase();
  const tono = TONOS_PEDIDO[normalized] ?? 'var(--muted)';
  return (
    <span style={{ display: 'inline-block', borderRadius: 999, padding: '4px 9px', color: tono, background: `color-mix(in srgb, ${tono} 16%, transparent)`, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
      {estado || 'Sin estado'}
    </span>
  );
}

function Dato({ titulo, valor }: { titulo: string; valor: React.ReactNode }) {
  return (
    <div style={{ padding: 10, border: '1px solid var(--line2)', borderRadius: 8 }}>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>{titulo}</div>
      <div style={{ fontWeight: 600, fontSize: 13 }}>{valor}</div>
    </div>
  );
}

function LineaDetalle({ linea }: { linea: DetallePedidoAdmin }) {
  const estado = ESTADOS_PREPARACION[linea.estadoPreparacion];
  const tono = TONOS_PREPARACION[linea.estadoPreparacion];
  return (
    <article style={{ border: '1px solid var(--line2)', borderRadius: 8, padding: 12, opacity: linea.estadoRegistro === 'I' ? 0.65 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <strong>{linea.cantidad} × {linea.producto || `Producto #${linea.productoId}`}</strong>
        <span style={{ color: tono, fontSize: 12, fontWeight: 700 }}>{estado}</span>
      </div>
      <div style={{ marginTop: 5, fontSize: 12, color: 'var(--muted)' }}>
        {moneda(linea.precioUnitario)} c/u · Importe {moneda(linea.subTotal)}
        {linea.esCortesia === 'S' ? ' · Cortesía' : ''}
        {linea.estadoRegistro === 'I' ? ' · Inactivo' : ''}
      </div>
      {linea.notaCocina && <div style={{ marginTop: 6, color: 'var(--gold-light)', fontSize: 12 }}>Nota: {linea.notaCocina}</div>}
      <div style={{ marginTop: 6, display: 'flex', gap: 12, flexWrap: 'wrap', color: 'var(--muted)', fontSize: 11 }}>
        <span>Solicitado: {formatoFecha(linea.fechaSolicitud)}</span>
        {linea.fechaAtencion && <span>Atención: {formatoFecha(linea.fechaAtencion)}</span>}
        {linea.fechaEntregaMozo && <span>Entregado: {formatoFecha(linea.fechaEntregaMozo)}</span>}
      </div>
    </article>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'grid',
  gap: 6,
  fontSize: 12,
  fontWeight: 600,
};

const cellStyle: React.CSSProperties = {
  padding: '12px 14px',
  fontSize: 13,
  verticalAlign: 'top',
};
