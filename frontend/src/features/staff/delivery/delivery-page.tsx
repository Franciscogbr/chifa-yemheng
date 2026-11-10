import { useEffect, useState, useMemo } from 'react';
import { api } from '@/shared/services/api-client';
import { DeliveryStatusBadge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { toast } from '@/shared/ui/use-toast';

interface Delivery {
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
  totalPedido?: number;
}

const LIMITE = 20;

export function StaffDeliveryPage() {
  const [page, setPage] = useState(1);
  const [estado, setEstado] = useState<'P' | 'R' | 'E' | 'C' | ''>('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ pedidoId: 0, direccion: '', referencia: '', telefono: '', costo: 0 });
  const [guardando, setGuardando] = useState(false);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [total, setTotal] = useState(0);

  /* Repartidores para asignar */
  const [repartidores, setRepartidores] = useState<{ id: number; nombre: string; email: string }[]>([]);
  const [cargandoRepartidores, setCargandoRepartidores] = useState(false);

  /* Modal asignar repartidor */
  const [modalAsignar, setModalAsignar] = useState(false);
  const [deliveryAsignarId, setDeliveryAsignarId] = useState<number | null>(null);
  const [formAsignar, setFormAsignar] = useState({ repartidorId: 0 });
  const [guardandoAsignar, setGuardandoAsignar] = useState(false);

  /* Modal anular */
  const [modalAnular, setModalAnular] = useState(false);
  const [deliveryAnularId, setDeliveryAnularId] = useState<number | null>(null);
  const [formAnular, setFormAnular] = useState({ motivo: '' });
  const [guardandoAnular, setGuardandoAnular] = useState(false);
  const [noCancelableIds, setNoCancelableIds] = useState<Set<number>>(new Set());

  /* Modal registro de venta (staff) */
  const [modalVenta, setModalVenta] = useState(false);
  const [deliveryVentaId, setDeliveryVentaId] = useState<number | null>(null);
  const [formVenta, setFormVenta] = useState({ monto: 0, metodoPago: 'EFECTIVO' as const, referencia: '' });
  const [guardandoVenta, setGuardandoVenta] = useState(false);

  const cargar = async () => {
    try {
      const res = await api.getDeliveries({ page, limit: LIMITE, estado: estado || undefined });
      if (res?.data) {
        setDeliveries(res.data);
        setTotal(res.total);
        setNoCancelableIds(new Set());
      }
    } catch {
      toast({ title: 'Error', description: 'No fue posible cargar las entregas.', variant: 'destructive' });
    }
  };

  const cargarRepartidores = async () => {
    setCargandoRepartidores(true);
    try {
      const data = await api.getRepartidores();
      setRepartidores(Array.isArray(data) ? data : []);
    } catch {
      setRepartidores([]);
      toast({ title: 'Aviso', description: 'No se pudo cargar la lista de repartidores. Verifica permisos (SEG_USUARIO).', variant: 'destructive' });
    } finally {
      setCargandoRepartidores(false);
    }
  };

  useEffect(() => {
    void cargar();
    void cargarRepartidores();
  }, [page, estado]);

  const kpis = useMemo(() => {
    const all = deliveries;
    const pendientes = all.filter(d => d.estado === 'P').length;
    const enRuta = all.filter(d => d.estado === 'R').length;
    const hoy = new Date();
    const hoyStr = `${hoy.getFullYear()}-${(hoy.getMonth() + 1).toString().padStart(2, '0')}-${hoy.getDate().toString().padStart(2, '0')}`;
    const entregadosHoy = all.filter(d => d.estado === 'E' && d.fechaCreacion?.startsWith(hoyStr)).length;
    const enRutaConTiempos = all.filter(d => d.estado === 'E' && d.fechaSalida && d.fechaEntrega);
    const tiempoPromedio = enRutaConTiempos.length > 0
      ? enRutaConTiempos.reduce((sum, d) => sum + (new Date(d.fechaEntrega!).getTime() - new Date(d.fechaSalida!).getTime()), 0) / 60000 / enRutaConTiempos.length
      : 0;
    return { pendientes, enRuta, entregados: entregadosHoy, tiempoPromedio: Math.round(tiempoPromedio) };
  }, [deliveries]);

  const handleCrear = async () => {
    if (!form.pedidoId || !form.direccion.trim()) {
      toast({ title: 'Error', description: 'Pedido ID y dirección son obligatorios.', variant: 'destructive' });
      return;
    }
    setGuardando(true);
    try {
      await api.request('/delivery', {
        method: 'POST',
        body: JSON.stringify({ pedidoId: form.pedidoId, direccion: form.direccion.trim(), referencia: form.referencia || undefined, telefono: form.telefono || undefined, costo: form.costo }),
      });
      setModal(false);
      setForm({ pedidoId: 0, direccion: '', referencia: '', telefono: '', costo: 0 });
      await cargar();
    } catch (e) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setGuardando(false);
    }
  };

  const handleAsignar = async () => {
    if (!formAsignar.repartidorId || !deliveryAsignarId) return;
    setGuardandoAsignar(true);
    try {
      await api.asignarRepartidor(deliveryAsignarId, formAsignar.repartidorId);
      setModalAsignar(false);
      setDeliveryAsignarId(null);
      setFormAsignar({ repartidorId: 0 });
      await cargar();
      toast({ title: 'Repartidor asignado', description: 'La entrega ha sido asignada correctamente.' });
    } catch (e) {
      toast({ title: 'Error', description: (e as Error).message || 'No se pudo asignar el repartidor.', variant: 'destructive' });
    } finally {
      setGuardandoAsignar(false);
    }
  };

  const handleDespachar = async (id: number) => {
    setGuardando(true);
    try {
      await api.iniciarRutaStaff(id);
      await cargar();
      toast({ title: 'Ruta iniciada', description: 'El repartidor ha sido despachado.' });
    } catch (e) {
      toast({ title: 'Error', description: (e as Error).message || 'No se pudo iniciar la ruta.', variant: 'destructive' });
    } finally {
      setGuardando(false);
    }
  };

  const handleEntregar = async (id: number) => {
    setGuardando(true);
    try {
      await api.confirmarEntregaStaff(id);
      await cargar();
      toast({ title: 'Entrega completada', description: 'El pedido quedó marcado como entregado.' });
    } catch (e) {
      toast({ title: 'Error', description: (e as Error).message || 'No se pudo confirmar la entrega.', variant: 'destructive' });
    } finally {
      setGuardando(false);
    }
  };

  const handleAnular = async () => {
    if (!formAnular.motivo.trim() || !deliveryAnularId) return;
    setGuardandoAnular(true);
    try {
      await api.anularDelivery(deliveryAnularId, formAnular.motivo.trim());
      setModalAnular(false);
      setDeliveryAnularId(null);
      setFormAnular({ motivo: '' });
      await cargar();
      toast({ title: 'Delivery anulado', description: 'La entrega ha sido cancelada.' });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo anular la entrega.';
      const err = e as { error?: string };
      if (err.error === 'DELIVERY_NO_CANCELABLE') {
        setNoCancelableIds((prev) => new Set(prev).add(deliveryAnularId ?? 0));
        await cargar();
        toast({ title: 'No se puede anular', description: 'Esta entrega ya no es cancelable.', variant: 'destructive' });
      } else {
        toast({ title: 'Error', description: msg, variant: 'destructive' });
      }
    } finally {
      setGuardandoAnular(false);
    }
  };

  const handleRegistrarVentaStaff = async () => {
    if (guardandoVenta || !deliveryVentaId) return;
    setGuardandoVenta(true);
    try {
      const resultado = await api.registrarVentaDeliveryStaff(deliveryVentaId, {
        monto: formVenta.monto,
        metodoPago: formVenta.metodoPago,
        referencia: formVenta.referencia.trim() || undefined,
      });
      setModalVenta(false);
      setDeliveryVentaId(null);
      setFormVenta({ monto: 0, metodoPago: 'EFECTIVO', referencia: '' });
      await cargar();
      toast({
        title: 'Venta registrada',
        description: `Venta #${resultado.idVenta} registrada correctamente.`,
      });
    } catch (e: unknown) {
      console.error('Error registrando venta (staff):', e);
      const msg = e instanceof Error ? e.message : 'No se pudo registrar la venta.';
      if ((e as { error?: string })?.error === 'VENTA_YA_EXISTE') {
        toast({ title: 'Ya registrado', description: 'Esta entrega ya tiene una venta registrada.', variant: 'destructive' });
        await cargar();
      } else {
        toast({ title: 'Error', description: msg, variant: 'destructive' });
      }
    } finally {
      setGuardandoVenta(false);
    }
  };

  const renderKpis = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-red-50 rounded-lg p-4">
        <p className="text-sm text-gray-500">Pendientes</p>
        <p className="text-2xl font-bold text-red-600">{kpis.pendientes}</p>
      </div>
      <div className="bg-yellow-50 rounded-lg p-4">
        <p className="text-sm text-gray-500">En Ruta</p>
        <p className="text-2xl font-bold text-yellow-600">{kpis.enRuta}</p>
      </div>
      <div className="bg-green-50 rounded-lg p-4">
        <p className="text-sm text-gray-500">Entregados Hoy</p>
        <p className="text-2xl font-bold text-green-600">{kpis.entregados}</p>
      </div>
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-500">Tiempo Prom. Ruta (min)</p>
        <p className="text-2xl font-bold text-gray-600">{kpis.tiempoPromedio}</p>
      </div>
    </div>
  );

  const renderFiltros = () => (
    <div className="flex flex-wrap gap-2 mb-6">
      {(['', 'P', 'R', 'E', 'C'] as const).map((e) => (
        <Button
          key={e}
          variant={estado === e ? 'primary' : 'outline'}
          size="sm"
          onClick={() => { setEstado(e as '' | 'P' | 'R' | 'E' | 'C'); setPage(1); }}
        >
          {e === '' ? 'Todos' : ({ P: 'Pendiente', R: 'En Ruta', E: 'Entregado', C: 'Cancelado' } as Record<string, string>)[e]}
        </Button>
      ))}
    </div>
  );

  const renderKanban = () => {
    const columns = [
      { key: 'P' as const, label: 'Pendiente', color: 'bg-red-50 border-red-200' },
      { key: 'R' as const, label: 'En Ruta', color: 'bg-yellow-50 border-yellow-200' },
      { key: 'E' as const, label: 'Entregado', color: 'bg-green-50 border-green-200' },
    ];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map((col) => {
          const items = deliveries.filter((d) => d.estado === col.key);
          return (
            <div key={`col-${col.key}`} className={`rounded-xl p-4 shadow-sm border ${col.color}`}>
              <h3 className="font-medium text-gray-700 text-sm uppercase mb-4">
                {col.label} ({items.length})
              </h3>
              {items.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Sin entregas</p>
              ) : (
                <div className="space-y-3">
                  {items.map((d) => (
                    <div key={d.id} className="bg-white rounded-lg p-3 border hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-mono text-sm text-gray-600">Pedido #{d.pedidoId}</p>
                          <p className="text-sm font-medium text-gray-900 truncate">{d.direccion}</p>
                        </div>
                        <DeliveryStatusBadge estado={d.estado} />
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{d.repartidor || 'Sin asignar'}</span>
                        <span>S/ {d.costo.toFixed(2)}</span>
                      </div>
                      {d.totalPedido !== undefined && (
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                          <span className="text-gray-500">Total pedido</span>
                          <span className="font-medium text-gray-700">S/ {d.totalPedido.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex gap-2 mt-2 pt-2 border-t">
                        {d.estado === 'P' && !d.repartidorId && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => { setDeliveryAsignarId(d.id); setModalAsignar(true); }}
                            disabled={cargandoRepartidores || repartidores.length === 0}
                          >
                            Asignar
                          </Button>
                        )}
                        {d.estado === 'P' && d.repartidorId && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="flex-1"
                            onClick={() => void handleDespachar(d.id)}
                            disabled={guardando}
                          >
                            Despachar / Iniciar ruta
                          </Button>
                        )}
                        {d.estado === 'R' && !d.montoPagado && !d.metodoPago && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setDeliveryVentaId(d.id);
                              setFormVenta({
                                monto: d.totalPedido !== undefined ? d.totalPedido + d.costo : 0,
                                metodoPago: 'EFECTIVO',
                                referencia: '',
                              });
                              setModalVenta(true);
                            }}
                            disabled={guardandoVenta}
                          >
                            Registrar venta
                          </Button>
                        )}
                        {d.estado === 'R' && (d.montoPagado || d.metodoPago) && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="flex-1"
                            onClick={() => void handleEntregar(d.id)}
                            disabled={guardando}
                          >
                            Entregar
                          </Button>
                        )}
                        {d.estado === 'P' && !noCancelableIds.has(d.id) && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => { setDeliveryAnularId(d.id); setFormAnular({ motivo: '' }); setModalAnular(true); }}
                            disabled={guardandoAnular}
                          >
                            Anular
                          </Button>
                        )}
                        {d.estado === 'R' && !noCancelableIds.has(d.id) && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => { setDeliveryAnularId(d.id); setFormAnular({ motivo: '' }); setModalAnular(true); }}
                            disabled={guardandoAnular}
                          >
                            Anular
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderPagination = () => (
    <div className="flex items-center justify-between mt-6">
      <p className="text-sm text-gray-500">
        Página {page} de {Math.max(1, Math.ceil(total / LIMITE))} — {total} total
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
          Anterior
        </Button>
        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(Math.ceil(total / LIMITE), p + 1))} disabled={page === Math.ceil(total / LIMITE)}>
          Siguiente
        </Button>
      </div>
    </div>
  );

  const renderModal = () => {
    if (!modal) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-red-600 mb-4">Nueva Entrega</h2>
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase opacity-60">Pedido ID *</span>
              <input type="number" value={form.pedidoId} onChange={(e) => setForm({ ...form, pedidoId: Number(e.target.value) })} className="rounded-lg bg-gray-50 px-3 py-2 text-sm" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase opacity-60">Dirección *</span>
              <input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} className="rounded-lg bg-gray-50 px-3 py-2 text-sm" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase opacity-60">Referencia</span>
              <input value={form.referencia} onChange={(e) => setForm({ ...form, referencia: e.target.value })} className="rounded-lg bg-gray-50 px-3 py-2 text-sm" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase opacity-60">Teléfono</span>
              <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="rounded-lg bg-gray-50 px-3 py-2 text-sm" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase opacity-60">Costo</span>
              <input type="number" value={form.costo} onChange={(e) => setForm({ ...form, costo: Number(e.target.value) })} className="rounded-lg bg-gray-50 px-3 py-2 text-sm" />
            </label>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
            <Button onClick={() => void handleCrear()} disabled={guardando}>
              {guardando ? 'Guardando…' : 'Crear'}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderModalAsignar = () => {
    if (!modalAsignar) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-[#7F1518] mb-4">Asignar Repartidor</h2>
          <p className="text-sm text-gray-500 mb-4">Selecciona el repartidor para la entrega.</p>
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase opacity-60">Repartidor *</span>
              <select
                value={formAsignar.repartidorId}
                onChange={(e) => setFormAsignar({ ...formAsignar, repartidorId: Number(e.target.value) })}
                className="rounded-lg bg-gray-50 px-3 py-2 text-sm"
                disabled={cargandoRepartidores || repartidores.length === 0}
              >
                <option value="">Seleccionar repartidor…</option>
                {repartidores.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre} ({r.email})
                  </option>
                ))}
              </select>
              {cargandoRepartidores && <p className="text-[10px] text-gray-400 mt-1">Cargando repartidores…</p>}
              {repartidores.length === 0 && !cargandoRepartidores && (
                <p className="text-[10px] text-red-600 mt-1">No hay repartidores disponibles.</p>
              )}
            </label>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setModalAsignar(false)}>Cancelar</Button>
            <Button onClick={() => void handleAsignar()} disabled={guardandoAsignar || !formAsignar.repartidorId || repartidores.length === 0}>
              {guardandoAsignar ? 'Asignando…' : 'Asignar'}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderModalAnular = () => {
    if (!modalAnular) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-[#DC2626] mb-4">Anular Delivery</h2>
          <p className="text-sm text-gray-500 mb-4">Indica el motivo de la anulación.</p>
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase opacity-60">Motivo *</span>
              <textarea
                value={formAnular.motivo}
                onChange={(e) => setFormAnular({ ...formAnular, motivo: e.target.value })}
                rows={3}
                className="rounded-lg bg-gray-50 px-3 py-2 text-sm"
                placeholder="Ej. Cliente no se encontró en la dirección"
              />
            </label>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setModalAnular(false)}>Cancelar</Button>
            <Button onClick={() => void handleAnular()} disabled={guardandoAnular || !formAnular.motivo.trim()}>
              {guardandoAnular ? 'Anulando…' : 'Anular'}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderModalVenta = () => {
    if (!modalVenta) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 sm:p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-[#7F1518] mb-4">Registrar Venta (Staff)</h2>
          <p className="text-sm text-gray-500 mb-4">Registra el cobro al cliente para esta entrega.</p>
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
              <p className="text-[10px] text-gray-500">Máximo sugerido: S/ {(deliveryVentaId ? deliveries.find(d => d.id === deliveryVentaId)?.totalPedido ?? 0 + deliveries.find(d => d.id === deliveryVentaId)?.costo ?? 0 : 0).toFixed(2)}</p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase opacity-60">Método de pago *</span>
                <select
                  value={formVenta.metodoPago}
                  onChange={(e) =>
                    setFormVenta({ ...formVenta, metodoPago: e.target.value as 'EFECTIVO' | 'YAPE' | 'PLIN' | 'TARJETA' | 'TRANSFERENCIA' })
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
              {(['YAPE', 'PLIN', 'TARJETA', 'TRANSFERENCIA'] as const).includes(formVenta.metodoPago) && !formVenta.referencia.trim() && (
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
              onClick={() => void handleRegistrarVentaStaff()}
              disabled={
                guardandoVenta ||
                formVenta.monto <= 0 ||
                (['YAPE', 'PLIN', 'TARJETA', 'TRANSFERENCIA'] as const).includes(formVenta.metodoPago) &&
                  !formVenta.referencia.trim()
              }
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#7F1518] hover:bg-[#A61E22] disabled:opacity-50"
            >
              {guardandoVenta ? 'Registrando…' : 'Registrar venta'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Delivery</h1>
        <Button onClick={() => setModal(true)} size="lg">
          + Nueva Entrega
        </Button>
      </div>

      {renderKpis()}
      {renderFiltros()}
      {renderKanban()}
      {renderPagination()}
      {renderModal()}
      {renderModalAsignar()}
      {renderModalAnular()}
      {renderModalVenta()}
    </div>
  );
}