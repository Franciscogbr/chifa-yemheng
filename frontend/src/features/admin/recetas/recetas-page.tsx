import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import {
  actualizarReceta,
  crearReceta,
  getCostoReceta,
  listarInsumosParaSelect,
  listarPlatosParaSelect,
  listarRecetas,
} from './recetas-service';
import type { OpcionProducto, Receta, RecetaCostoView, RecetaLista } from './recetas-service';

const LIMITE = 20;

export function RecetasPage() {
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [totalRec, setTotalRec] = useState(0);
  const [page, setPage] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [cargandoMaestros, setCargandoMaestros] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalRec, setModalRec] = useState(false);
  const [modalCosto, setModalCosto] = useState(false);
  const [recetaEditando, setRecetaEditando] = useState<number | null>(null);
  const [costoVer, setCostoVer] = useState<RecetaCostoView | null>(null);
  const [formRec, setFormRec] = useState({ productoId: 0, insumoId: 0, cantidad: 0 });
  const [guardando, setGuardando] = useState(false);
  const [insumos, setInsumos] = useState<OpcionProducto[]>([]);
  const [platos, setPlatos] = useState<OpcionProducto[]>([]);
  const [filtroProductoId, setFiltroProductoId] = useState<number | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'A' | 'I'>('todos');

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const res: RecetaLista = await listarRecetas({ page, limit: LIMITE, productoId: filtroProductoId ?? undefined, texto: undefined, estado: filtroEstado === 'todos' ? undefined : filtroEstado });
      setRecetas(res.data);
      setTotalRec(res.total);
    } catch {
      setError('No fue posible cargar las recetas.');
    } finally {
      setCargando(false);
    }
  };

  const cargarMaestros = async () => {
    setCargandoMaestros(true);
    try {
      const [ps, ins] = await Promise.all([listarPlatosParaSelect(), listarInsumosParaSelect()]);
      setPlatos(ps);
      setInsumos(ins);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar platos e insumos.');
    } finally {
      setCargandoMaestros(false);
    }
  };

  useEffect(() => {
    void cargar();
    void cargarMaestros();
  }, [page, filtroProductoId, filtroEstado]);

  const handleCrearRec = async () => {
    if (!formRec.productoId || !formRec.insumoId || !formRec.cantidad) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    setGuardando(true);
    try {
      if (recetaEditando) {
        await actualizarReceta(recetaEditando, { cantidad: formRec.cantidad });
      } else {
        await crearReceta({ productoId: formRec.productoId, insumoId: formRec.insumoId, cantidad: formRec.cantidad });
      }
      setModalRec(false);
      setRecetaEditando(null);
      setFormRec({ productoId: 0, insumoId: 0, cantidad: 0 });
      await cargar();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstadoReceta = async (receta: Receta) => {
    setGuardando(true);
    setError(null);
    try {
      await actualizarReceta(receta.id, { estado: receta.estado === 'A' ? 'I' : 'A' });
      await cargar();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  const verCostoReceta = async (productoId: number) => {
    setCostoVer(null);
    setModalCosto(true);
    try {
      const costo = await getCostoReceta(productoId);
      setCostoVer(costo);
    } catch (e) {
      setError((e as Error).message);
      setModalCosto(false);
    }
  };

  const totalPaginas = Math.max(1, Math.ceil(totalRec / LIMITE));

  const handleExportarExcel = async () => {
    if (recetas.length === 0) return;
    const { default: ExcelJS } = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Recetas');
    sheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Producto', key: 'producto', width: 30 },
      { header: 'Insumo', key: 'insumo', width: 30 },
      { header: 'Cantidad', key: 'cantidad', width: 15 },
      { header: 'Unidad', key: 'unidad', width: 15 },
      { header: 'Estado', key: 'estado', width: 10 },
    ];
    const rows = recetas.map((r) => ({
      id: r.id,
      producto: r.producto,
      insumo: r.insumo,
      cantidad: r.cantidad,
      unidad: r.unidad,
      estado: r.estado === 'A' ? 'Activa' : 'Inactiva',
    }));
    sheet.addRows(rows);
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recetas_${new Date().toISOString().slice(0, 10)}.xlsx`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const handleExportarPDF = async () => {
    if (recetas.length === 0) return;
    const [{ jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ]);
    const pdf = new jsPDF({ orientation: 'landscape' });
    pdf.setFontSize(14);
    pdf.text('Informe de Recetas', 14, 15);
    pdf.setFontSize(10);
    pdf.text(`Generado: ${new Date().toLocaleString()}`, 14, 25);
    autoTable(pdf, {
      startY: 35,
      head: [['ID', 'Producto', 'Insumo', 'Cantidad', 'Unidad', 'Estado']],
      body: recetas.map((r) => [
        r.id.toString(),
        r.producto,
        r.insumo,
        r.cantidad.toString(),
        r.unidad,
        r.estado === 'A' ? 'Activa' : 'Inactiva',
      ]),
    });
    pdf.save(`recetas_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="y-shell" style={{ padding: '24px 16px 140px', maxWidth: 1240, margin: '0 auto' }}>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>Recetas</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase opacity-60 mr-1">Reportes:</span>
          <button
            onClick={() => void handleExportarExcel()}
            disabled={cargando || recetas.length === 0}
            className="rounded-lg bg-[#A61E22] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#7F1518] disabled:opacity-50"
          >
            <FileText size={16} /> Excel
          </button>
          <button
            onClick={() => void handleExportarPDF()}
            disabled={cargando || recetas.length === 0}
            className="rounded-lg bg-[#A61E22] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#7F1518] disabled:opacity-50"
          >
            <FileText size={16} /> PDF
          </button>
          <button onClick={() => setModalRec(true)} className="rounded-lg bg-[#A61E22] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7F1518]">
            + Receta
          </button>
        </div>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">{error} <button onClick={() => setError(null)} className="ml-2 underline">Cerrar</button></div>}

      <div className="rounded-xl bg-[#F5F5F5]/60 p-4 mb-6 shadow-sm border border-[#F5F5F5]">
        <div className="flex items-center mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#333]/60 mr-2">Filtros</span>
        </div>
        <div className="flex flex-wrap gap-4 items-start">
          <div className="flex-1 min-w-[220px]">
            <label className="text-xs font-bold uppercase opacity-60 block mb-1">Producto (Plato):</label>
            <select
              value={filtroProductoId ?? ''}
              onChange={(e) => { setFiltroProductoId(e.target.value ? Number(e.target.value) : null); setPage(1); }}
              className="rounded-lg bg-white border border-[#E8E1DB] px-3 py-2 text-sm focus:border-[#A61E22] focus:ring-1 focus:ring-[#A61E22] outline-none"
            >
              <option value="">Todos los platos</option>
              {platos.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
          <div className="min-w-[180px]">
            <label className="text-xs font-bold uppercase opacity-60 block mb-1">Estado:</label>
            <select
              value={filtroEstado}
              onChange={(e) => { setFiltroEstado(e.target.value as 'todos' | 'A' | 'I'); setPage(1); }}
              className="rounded-lg bg-white border border-[#E8E1DB] px-3 py-2 text-sm focus:border-[#A61E22] focus:ring-1 focus:ring-[#A61E22] outline-none"
            >
              <option value="todos">Todos</option>
              <option value="A">Activa</option>
              <option value="I">Inactiva</option>
            </select>
          </div>
          <div className="flex items-end min-w-[200px]">
            <button
              onClick={() => {
                setFiltroProductoId(null);
                setFiltroEstado('todos');
                setPage(1);
              }}
              className="text-xs text-[#A61E22] underline hover:text-[#7F1518] px-2 py-1.5"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {cargando ? (
        <div className="y-panel" style={{ padding: 24, textAlign: 'center' }}>Cargando...</div>
      ) : recetas.length === 0 ? (
        <div className="y-panel" style={{ padding: 24, textAlign: 'center' }}>No hay recetas registradas.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F5F5F5] text-left text-xs uppercase tracking-wider text-[#333]/60">
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Producto</th>
                <th className="px-3 py-2">Insumo</th>
                <th className="px-3 py-2 text-right">Cantidad</th>
                <th className="px-3 py-2">Unidad</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F5]">
              {recetas.map((r) => (
                <tr key={r.id} className="hover:bg-[#F5F5F5]">
                  <td className="px-3 py-2">{r.id}</td>
                  <td className="px-3 py-2">{r.producto}</td>
                  <td className="px-3 py-2">{r.insumo}</td>
                  <td className="px-3 py-2 text-right">{r.cantidad}</td>
                  <td className="px-3 py-2">{r.unidad}</td>
                  <td className="px-3 py-2">{r.estado === 'A' ? 'Activa' : 'Inactiva'}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <button
                        className="rounded-lg bg-[#A61E22] px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#7F1518] disabled:opacity-50"
                        onClick={() => {
                          // Asegurar que el plato e insumo existan en los maestros para que el select los muestre
                          if (!platos.some((p) => p.id === r.productoId)) {
                            setPlatos([...platos, { id: r.productoId, nombre: r.producto }]);
                          }
                          if (!insumos.some((i) => i.id === r.insumoId)) {
                            setInsumos([...insumos, { id: r.insumoId, nombre: r.insumo }]);
                          }
                          setRecetaEditando(r.id);
                          setFormRec({ productoId: r.productoId, insumoId: r.insumoId, cantidad: r.cantidad });
                          setModalRec(true);
                        }}
                      >
                        Editar
                      </button>
                      <button
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                        onClick={() => void verCostoReceta(r.productoId)}
                      >
                        Costo
                      </button>
                      <button
                        disabled={guardando}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-sm disabled:opacity-50 ${r.estado === 'A' ? 'bg-[#A61E22] hover:bg-[#7F1518]' : 'bg-green-600 hover:bg-green-700'}`}
                        onClick={() => void cambiarEstadoReceta(r)}
                      >
                        {r.estado === 'A' ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 mt-4">
        <>
          <button disabled={page <= 1} onClick={() => setPage((x) => Math.max(1, x - 1))} className="rounded-lg bg-white px-3 py-1.5 shadow-sm disabled:opacity-50">← Anterior</button>
          <span className="text-sm">Página {page} de {totalPaginas}</span>
          <button disabled={page >= totalPaginas} onClick={() => setPage((x) => x + 1)} className="rounded-lg bg-white px-3 py-1.5 shadow-sm disabled:opacity-50">Siguiente →</button>
        </>
      </div>

      {modalRec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-[#7F1518] mb-4">{recetaEditando ? 'Editar Receta' : 'Nueva Receta'}</h2>
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase opacity-60">Producto (Plato) *</span>
                <select
                  disabled={recetaEditando !== null || cargandoMaestros}
                  value={formRec.productoId}
                  onChange={(e) => setFormRec({ ...formRec, productoId: Number(e.target.value) })}
                  className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm disabled:opacity-60"
                >
                  <option value="">Seleccionar plato…</option>
                  {platos.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase opacity-60">Insumo *</span>
                <select
                  disabled={recetaEditando !== null || cargandoMaestros}
                  value={formRec.insumoId}
                  onChange={(e) => setFormRec({ ...formRec, insumoId: Number(e.target.value) })}
                  className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm disabled:opacity-60"
                >
                  <option value="">Seleccionar insumo…</option>
                  {insumos.map((i) => (
                    <option key={i.id} value={i.id}>{i.nombre}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase opacity-60">Cantidad *</span>
                <input type="number" value={formRec.cantidad} onChange={(e) => setFormRec({ ...formRec, cantidad: Number(e.target.value) })} className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm" />
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => { setModalRec(false); setRecetaEditando(null); }} className="rounded-xl bg-[#F5F5F5] px-5 py-2.5 text-sm font-semibold hover:bg-[#D9D9D9]">Cancelar</button>
              <button onClick={() => void handleCrearRec()} disabled={guardando} className="rounded-xl bg-[#A61E22] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#7F1518] disabled:opacity-60">
                {guardando ? 'Guardando…' : recetaEditando ? 'Guardar cambios' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalCosto && costoVer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 sm:p-6">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-[#7F1518] mb-4">Costo de Receta — {costoVer.producto}</h2>
            <p className="text-sm text-gray-500 mb-4">Desglose por insumo y costo total estimado.</p>
            <div className="space-y-3">
              {costoVer.detalles.map((d) => (
                <div key={d.insumo} className="flex justify-between items-center p-2 rounded bg-[#F5F5F5]">
                  <div>
                    <p className="text-sm font-medium">{d.insumo}</p>
                    <p className="text-xs text-gray-500">{d.cantidad} {d.unidad}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">S/ {d.subtotal.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">S/ {d.costoUnitario.toFixed(2)} / {d.unidad}</p>
                  </div>
                </div>
              ))}
              <div className="mt-4 pt-4 border-t flex justify-between">
                <span className="font-bold text-lg">Costo total:</span>
                <span className="font-bold text-lg text-[#7F1518]">S/ {costoVer.costoTotal.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => setModalCosto(false)} className="rounded-xl bg-[#A61E22] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#7F1518]">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
