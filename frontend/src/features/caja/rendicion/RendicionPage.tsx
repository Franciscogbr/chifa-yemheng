import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/shared/services/api-client';
import { leerPermisos } from '@/features/auth/login/auth-service';
import { toast } from '@/shared/ui/use-toast';
import type {
  EstadoRendicion,
  PedidoPendienteRendicion,
  RepartidorRendicion,
  RendicionHistorial,
} from '@/shared/types/rendicion';

const money = (amount: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

function descargar(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function nombreEstado(estado: EstadoRendicion): string {
  if (estado === 'V') return 'Validada';
  return estado === 'O' ? 'Observada' : 'Pendiente de validación';
}

type FiltrosRendicion = NonNullable<Parameters<typeof api.getRendiciones>[0]>;

async function obtenerHistorialCompleto(
  filters: Omit<FiltrosRendicion, 'page' | 'limit'>,
): Promise<RendicionHistorial[]> {
  const rows: RendicionHistorial[] = [];
  for (let page = 1; ; page += 1) {
    const batch = await api.getRendiciones({ ...filters, page, limit: 200 });
    rows.push(...batch.data);
    if (!batch.hasMore) return rows;
  }
}

export function RendicionPage() {
  const [repartidores, setRepartidores] = useState<RepartidorRendicion[]>([]);
  const [repartidorId, setRepartidorId] = useState('');
  const [pedidos, setPedidos] = useState<PedidoPendienteRendicion[]>([]);
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  const [montoEntregado, setMontoEntregado] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [historial, setHistorial] = useState<RendicionHistorial[]>([]);
  const [historialPage, setHistorialPage] = useState(1);
  const [historialPuedeContinuar, setHistorialPuedeContinuar] = useState(false);
  const [estadoFiltro, setEstadoFiltro] = useState<'' | EstadoRendicion>('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [loading, setLoading] = useState(false);
  const permisos = useMemo(() => leerPermisos(), []);
  const puedeRegistrar = permisos.includes('REN_REGISTRAR');
  const puedeValidar = permisos.includes('REN_VALIDAR');

  const pedidosSeleccionados = useMemo(
    () => pedidos.filter((pedido) => seleccionados.includes(pedido.pedidoId)),
    [pedidos, seleccionados],
  );
  const esperado = pedidosSeleccionados.reduce((sum, pedido) => sum + pedido.total, 0);
  const entregado = montoEntregado === '' ? 0 : Number(montoEntregado);
  const diferencia = Number((entregado - esperado).toFixed(2));

  const cargarHistorial = useCallback(async (page = historialPage) => {
    try {
      const result = await api.getRendiciones({
        ...(repartidorId ? { repartidorId: Number(repartidorId) } : {}),
        ...(estadoFiltro ? { estado: estadoFiltro } : {}),
        ...(desde ? { desde } : {}),
        ...(hasta ? { hasta } : {}),
        page,
        limit: 200,
      });
      setHistorial(result.data);
      setHistorialPuedeContinuar(result.hasMore);
    } catch (error) {
      toast({
        title: 'No se pudo cargar el historial',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  }, [desde, hasta, repartidorId, estadoFiltro, historialPage]);

  useEffect(() => {
    let active = true;
    Promise.all([api.getRepartidoresRendicion(), api.getRendiciones({ page: 1, limit: 200 })])
      .then(([staff, result]) => {
        if (!active) return;
        setRepartidores(staff);
        setHistorial(result.data);
        setHistorialPage(1);
        setHistorialPuedeContinuar(result.hasMore);
      })
      .catch((error: unknown) => {
        if (!active) return;
        toast({
          title: 'No se pudo cargar la rendición',
          description: (error as Error).message,
          variant: 'destructive',
        });
      });
    return () => {
      active = false;
    };
  }, []);

  const cargarPendientes = async () => {
    if (!repartidorId) {
      toast({ title: 'Selecciona un repartidor', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const rows = await api.getPendientesRendicion(Number(repartidorId));
      setPedidos(rows);
      setSeleccionados([]);
      setMontoEntregado('');
      setObservaciones('');
    } catch (error) {
      toast({
        title: 'No se pudieron cargar los pedidos',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePedido = (pedidoId: number) => {
    setSeleccionados((current) =>
      current.includes(pedidoId) ? current.filter((id) => id !== pedidoId) : [...current, pedidoId],
    );
  };

  const registrar = async () => {
    if (!puedeRegistrar || !repartidorId || pedidosSeleccionados.length === 0) {
      toast({ title: 'Selecciona un repartidor y al menos un pedido', variant: 'destructive' });
      return;
    }
    const monto = Number(montoEntregado);
    if (montoEntregado === '' || !Number.isFinite(monto) || monto < 0) {
      toast({ title: 'Ingresa un monto válido', variant: 'destructive' });
      return;
    }
    if (diferencia !== 0 && !observaciones.trim()) {
      toast({ title: 'La diferencia requiere una observación', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const result = await api.registrarRendicion({
        repartidorId: Number(repartidorId),
        pedidoIds: pedidosSeleccionados.map((pedido) => pedido.pedidoId),
        montoEntregado: Number(monto.toFixed(2)),
        ...(observaciones.trim() ? { observaciones: observaciones.trim() } : {}),
      });
      toast({
        title: `Rendición #${result.id} registrada`,
        description: `${result.estado}. Esperado ${money(result.totalEsperado)}; diferencia ${money(result.diferencia)}.`,
      });
      await cargarPendientes();
      await cargarHistorial();
    } catch (error) {
      toast({
        title: 'No se pudo registrar la rendición',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const validar = async (id: number) => {
    setLoading(true);
    try {
      await api.validarRendicion(id);
      toast({ title: `Rendición #${id} validada` });
      await cargarHistorial();
    } catch (error) {
      toast({
        title: 'No se pudo validar la rendición',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const descargarPdf = async (id: number) => {
    try {
      const record = await api.getRendicionPdf(id);
      const [{ jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
      ]);
      const pdf = new jsPDF();
      pdf.setFontSize(18);
      pdf.text(`Rendición de delivery #${record.id}`, 14, 20);
      pdf.setFontSize(11);
      pdf.text(`Repartidor: ${record.repartidor} (#${record.repartidorId})`, 14, 30);
      pdf.text(`Fecha: ${new Date(record.fecha).toLocaleString('es-PE')}`, 14, 37);
      pdf.text(`Estado: ${nombreEstado(record.estado)}`, 14, 44);
      pdf.text(`Esperado: ${money(record.montoEsperado)}`, 14, 51);
      pdf.text(`Entregado: ${money(record.montoEntregado)}`, 14, 58);
      pdf.text(`Diferencia: ${money(record.diferencia)}`, 14, 65);
      if (record.validadorId !== null) {
        pdf.text(
          `Validada por usuario #${record.validadorId} el ${record.fechaValidacion ? new Date(record.fechaValidacion).toLocaleString('es-PE') : ''}`,
          14,
          72,
        );
      }
      if (record.observaciones) {
        const lines = pdf.splitTextToSize(`Observación: ${record.observaciones}`, 180);
        pdf.text(lines, 14, record.validadorId !== null ? 80 : 73);
      }
      autoTable(pdf, {
        startY: record.observaciones ? (record.validadorId !== null ? 95 : 88) : (record.validadorId !== null ? 81 : 74),
        head: [['Pedido', 'Esperado']],
        body: record.pedidos.map((pedido) => [String(pedido.pedidoId), money(pedido.totalEsperado)]),
      });
      pdf.save(`rendicion-${record.id}.pdf`);
    } catch (error) {
      toast({
        title: 'No se pudo generar el PDF',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  const exportarExcel = async () => {
    try {
      const { default: ExcelJS } = await import('exceljs');
      const filters = {
        ...(repartidorId ? { repartidorId: Number(repartidorId) } : {}),
        ...(estadoFiltro ? { estado: estadoFiltro } : {}),
        ...(desde ? { desde } : {}),
        ...(hasta ? { hasta } : {}),
      };
      const rows = await obtenerHistorialCompleto(filters);
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Rendiciones');
      sheet.columns = [
        { header: 'N°', key: 'id', width: 12 },
        { header: 'Fecha', key: 'fecha', width: 22 },
        { header: 'Repartidor', key: 'repartidor', width: 28 },
        { header: 'Estado', key: 'estado', width: 24 },
        { header: 'Esperado', key: 'esperado', width: 16 },
        { header: 'Entregado', key: 'entregado', width: 16 },
        { header: 'Diferencia', key: 'diferencia', width: 16 },
        { header: 'Pedidos', key: 'pedidos', width: 32 },
        { header: 'Observaciones', key: 'observaciones', width: 40 },
      ];
      sheet.addRows(
        rows.map((row) => ({
          id: row.id,
          fecha: new Date(row.fecha).toLocaleString('es-PE'),
          repartidor: row.repartidor,
          estado: nombreEstado(row.estado),
          esperado: row.montoEsperado,
          entregado: row.montoEntregado,
          diferencia: row.diferencia,
          pedidos: row.pedidos.map((pedido) => pedido.pedidoId).join(', '),
          observaciones: row.observaciones ?? '',
        })),
      );
      sheet.getRow(1).font = { bold: true };
      const buffer = await workbook.xlsx.writeBuffer();
      descargar(
        new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
        'historial-rendiciones.xlsx',
      );
    } catch (error) {
      toast({
        title: 'No se pudo exportar el historial',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  const exportarPdf = async () => {
    try {
      const [{ jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
      ]);
      const rows = await obtenerHistorialCompleto({
        ...(repartidorId ? { repartidorId: Number(repartidorId) } : {}),
        ...(estadoFiltro ? { estado: estadoFiltro } : {}),
        ...(desde ? { desde } : {}),
        ...(hasta ? { hasta } : {}),
      });
      const pdf = new jsPDF({ orientation: 'landscape' });
      pdf.setFontSize(16);
      pdf.text('Historial de rendiciones de delivery', 14, 18);
      pdf.setFontSize(10);
      pdf.text(`Registros: ${rows.length}`, 14, 25);
      autoTable(pdf, {
        startY: 30,
        head: [['N°', 'Fecha', 'Repartidor', 'Estado', 'Esperado', 'Entregado', 'Diferencia', 'Pedidos']],
        body: rows.map((row) => [
          String(row.id),
          new Date(row.fecha).toLocaleString('es-PE'),
          row.repartidor,
          nombreEstado(row.estado),
          money(row.montoEsperado),
          money(row.montoEntregado),
          money(row.diferencia),
          row.pedidos.map((pedido) => pedido.pedidoId).join(', '),
        ]),
      });
      pdf.save('historial-rendiciones.pdf');
    } catch (error) {
      toast({
        title: 'No se pudo exportar el PDF',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[#7F1518]">Rendición de delivery</h1>
        <p className="mt-1 text-sm text-gray-600">
          Revisa los pedidos en efectivo y registra el importe recibido en caja.
        </p>
      </header>

      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <label className="min-w-60 flex-1 text-sm font-medium">
            Repartidor
            <select
              value={repartidorId}
              onChange={(event) => setRepartidorId(event.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            >
              <option value="">Selecciona un repartidor</option>
              {repartidores.map((repartidor) => (
                <option key={repartidor.id} value={repartidor.id}>
                  {repartidor.nombre} (#{repartidor.id})
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={cargarPendientes}
            disabled={loading || !repartidorId}
            className="rounded-lg bg-[#A61E22] px-4 py-2 font-semibold text-white disabled:opacity-50"
          >
            Cargar pedidos pendientes
          </button>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[700px] divide-y text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-600">
              <tr>
                <th className="p-3">Incluir</th>
                <th className="p-3">Pedido</th>
                <th className="p-3">Cliente / dirección</th>
                <th className="p-3">Método</th>
                <th className="p-3 text-right">Esperado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pedidos.map((pedido) => (
                <tr key={pedido.idPedidoDelivery}>
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={seleccionados.includes(pedido.pedidoId)}
                      onChange={() => togglePedido(pedido.pedidoId)}
                      aria-label={`Incluir pedido ${pedido.pedidoId}`}
                    />
                  </td>
                  <td className="p-3 font-semibold">#{pedido.pedidoId}</td>
                  <td className="p-3">
                    <div>{pedido.cliente}</div>
                    <div className="text-xs text-gray-500">{pedido.direccion}</div>
                  </td>
                  <td className="p-3">{pedido.metodoPago}</td>
                  <td className="p-3 text-right font-semibold">{money(pedido.total)}</td>
                </tr>
              ))}
              {pedidos.length === 0 && (
                <tr>
                  <td className="p-4 text-center text-gray-500" colSpan={5}>
                    {loading ? 'Cargando pedidos…' : 'Selecciona un repartidor y carga sus pedidos.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {puedeRegistrar && pedidosSeleccionados.length > 0 && (
          <div className="mt-5 grid gap-4 border-t pt-4 md:grid-cols-2">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-blue-50 p-3">
                <div className="font-bold">{money(esperado)}</div>
                <div className="text-xs text-gray-600">Esperado</div>
              </div>
              <div className="rounded-lg bg-green-50 p-3">
                <div className="font-bold">{money(entregado)}</div>
                <div className="text-xs text-gray-600">Entregado</div>
              </div>
              <div className={`rounded-lg p-3 ${diferencia === 0 ? 'bg-gray-100' : diferencia > 0 ? 'bg-yellow-50' : 'bg-red-50'}`}>
                <div className="font-bold">{money(diferencia)}</div>
                <div className="text-xs text-gray-600">
                  {diferencia === 0 ? 'Cuadrado' : diferencia > 0 ? 'Sobrante' : 'Faltante'}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium">
                Monto recibido (S/)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={montoEntregado}
                  onChange={(event) => setMontoEntregado(event.target.value)}
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </label>
              <label className="block text-sm font-medium">
                Observación {diferencia !== 0 && <span className="text-red-600">(obligatoria si hay diferencia)</span>}
                <textarea
                  value={observaciones}
                  onChange={(event) => setObservaciones(event.target.value)}
                  maxLength={500}
                  rows={2}
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </label>
              <button
                type="button"
                onClick={registrar}
                disabled={loading}
                className="w-full rounded-lg bg-[#A61E22] px-4 py-2 font-semibold text-white disabled:opacity-50"
              >
                {loading ? 'Procesando…' : `Registrar ${pedidosSeleccionados.length} pedido(s)`}
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Historial de rendiciones</h2>
            <p className="text-sm text-gray-500">Consulta, valida y descarga constancias.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={exportarPdf} className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50">
              Exportar PDF
            </button>
            <button type="button" onClick={exportarExcel} className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50">
              Exportar Excel
            </button>
          </div>
        </div>
        <div className="my-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <select
            value={repartidorId}
            onChange={(event) => setRepartidorId(event.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
            aria-label="Filtrar por repartidor"
          >
            <option value="">Todos los repartidores</option>
            {repartidores.map((repartidor) => (
              <option key={repartidor.id} value={repartidor.id}>{repartidor.nombre}</option>
            ))}
          </select>
          <select
            value={estadoFiltro}
            onChange={(event) => setEstadoFiltro(event.target.value as '' | EstadoRendicion)}
            className="rounded-lg border px-3 py-2 text-sm"
            aria-label="Filtrar por estado"
          >
            <option value="">Todos los estados</option>
            <option value="R">Pendiente de validación</option>
            <option value="O">Observada</option>
            <option value="V">Validada</option>
          </select>
          <input type="date" value={desde} onChange={(event) => setDesde(event.target.value)} className="rounded-lg border px-3 py-2 text-sm" aria-label="Desde" />
          <input type="date" value={hasta} onChange={(event) => setHasta(event.target.value)} className="rounded-lg border px-3 py-2 text-sm" aria-label="Hasta" />
          <button
            type="button"
            onClick={() => {
              setHistorialPage(1);
              void cargarHistorial(1);
            }}
            className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Aplicar filtros
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] divide-y text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-600">
              <tr>
                <th className="p-3">N° / fecha</th>
                <th className="p-3">Repartidor / pedidos</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-right">Esperado</th>
                <th className="p-3 text-right">Entregado</th>
                <th className="p-3 text-right">Diferencia</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {historial.map((rendicion) => (
                <tr key={rendicion.id}>
                  <td className="p-3">
                    <div className="font-semibold">#{rendicion.id}</div>
                    <div className="text-xs text-gray-500">{new Date(rendicion.fecha).toLocaleString('es-PE')}</div>
                  </td>
                  <td className="p-3">
                    <div>{rendicion.repartidor}</div>
                    <div className="text-xs text-gray-500">
                      Pedidos: {rendicion.pedidos.map((pedido) => pedido.pedidoId).join(', ')}
                    </div>
                  </td>
                  <td className="p-3">{nombreEstado(rendicion.estado)}</td>
                  <td className="p-3 text-right">{money(rendicion.montoEsperado)}</td>
                  <td className="p-3 text-right">{money(rendicion.montoEntregado)}</td>
                  <td className="p-3 text-right">{money(rendicion.diferencia)}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => void descargarPdf(rendicion.id)} className="text-blue-700 underline">
                        PDF
                      </button>
                      {puedeValidar && rendicion.estado !== 'V' && (
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => void validar(rendicion.id)}
                          className="text-green-700 underline disabled:opacity-50"
                        >
                          Validar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {historial.length === 0 && (
                <tr><td className="p-4 text-center text-gray-500" colSpan={7}>No hay rendiciones para estos filtros.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            type="button"
            disabled={historialPage <= 1}
            onClick={() => {
              const page = historialPage - 1;
              setHistorialPage(page);
              void cargarHistorial(page);
            }}
            className="rounded-lg border px-3 py-2 disabled:opacity-40"
          >
            Anterior
          </button>
          <span>Página {historialPage}</span>
          <button
            type="button"
            disabled={!historialPuedeContinuar}
            onClick={() => {
              const page = historialPage + 1;
              setHistorialPage(page);
              void cargarHistorial(page);
            }}
            className="rounded-lg border px-3 py-2 disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      </section>
    </div>
  );
}
