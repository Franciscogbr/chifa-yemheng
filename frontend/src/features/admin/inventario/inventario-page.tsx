import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { getStockInsumos } from './inventario-service';
import type { StockInsumoView } from './inventario-service';

export function AdminInventarioPage() {
  const [insumosTabla, setInsumosTabla] = useState<StockInsumoView[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroNombre, setFiltroNombre] = useState<string>('');
  const [filtroCategoriaId, setFiltroCategoriaId] = useState<number | null>(null);
  const [filtroUnidadId, setFiltroUnidadId] = useState<number | null>(null);
  const [filtroEstadoStock, setFiltroEstadoStock] = useState<'todos' | 'bajo' | 'ok'>('todos');
  const [filtroStockMinDesde, setFiltroStockMinDesde] = useState<string>('');
  const [filtroStockMinHasta, setFiltroStockMinHasta] = useState<string>('');
  const [filtroStockActDesde, setFiltroStockActDesde] = useState<string>('');
  const [filtroStockActHasta, setFiltroStockActHasta] = useState<string>('');
  const [filtroOrdenarPor, setFiltroOrdenarPor] = useState<'nombre' | 'stock_actual' | 'stock_minimo'>('nombre');
  const [filtroOrdenDireccion, setFiltroOrdenDireccion] = useState<'asc' | 'desc'>('asc');
  const [categoriasInsumo, setCategoriasInsumo] = useState<{ id: number; nombre: string }[]>([]);
  const [unidadesInsumo, setUnidadesInsumo] = useState<{ id: number; nombre: string }[]>([]);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const res2 = await getStockInsumos({
        nombre: filtroNombre || undefined,
        categoriaId: filtroCategoriaId === null ? undefined : filtroCategoriaId,
        unidadId: filtroUnidadId === null ? undefined : filtroUnidadId,
        stockMinimoDesde: filtroStockMinDesde ? Number(filtroStockMinDesde) : undefined,
        stockMinimoHasta: filtroStockMinHasta ? Number(filtroStockMinHasta) : undefined,
        stockActualDesde: filtroStockActDesde ? Number(filtroStockActDesde) : undefined,
        stockActualHasta: filtroStockActHasta ? Number(filtroStockActHasta) : undefined,
        soloBajoStock: filtroEstadoStock === 'bajo' ? true : filtroEstadoStock === 'ok' ? false : undefined,
        ordenarPor: filtroOrdenarPor,
        ordenDireccion: filtroOrdenDireccion,
      });
      setInsumosTabla(res2);
      const filtrosActivos = filtroNombre || filtroCategoriaId !== null || filtroUnidadId !== null
        || filtroEstadoStock !== 'todos' || filtroStockMinDesde || filtroStockMinHasta
        || filtroStockActDesde || filtroStockActHasta;
      if (!filtrosActivos) {
        setCategoriasInsumo(Array.from(new Map(
          res2.filter((r) => r.categoriaId !== null && r.categoria)
            .map((r) => [r.categoriaId!, r.categoria!]),
        ), ([id, nombre]) => ({ id, nombre })));
        setUnidadesInsumo(Array.from(new Map(
          res2.filter((r) => r.unidadId !== null && r.unidadMedida)
            .map((r) => [r.unidadId!, r.unidadMedida!]),
        ), ([id, nombre]) => ({ id, nombre })));
      }
    } catch {
      setError('No fue posible cargar los datos.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargar();
  }, [filtroNombre, filtroCategoriaId, filtroUnidadId, filtroEstadoStock, filtroStockMinDesde, filtroStockMinHasta, filtroStockActDesde, filtroStockActHasta, filtroOrdenarPor, filtroOrdenDireccion]);

  const handleExportarExcel = async () => {
    if (insumosTabla.length === 0) return;
    const { default: ExcelJS } = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Insumos');
    sheet.columns = [
      { header: 'Insumo', key: 'producto', width: 30 },
      { header: 'Categoría', key: 'categoria', width: 20 },
      { header: 'Clasificación', key: 'clasificacion', width: 20 },
      { header: 'Stock Actual', key: 'stockActual', width: 15 },
      { header: 'Stock Mínimo', key: 'stockMinimo', width: 15 },
      { header: 'Unidad', key: 'unidadMedida', width: 15 },
      { header: 'Estado', key: 'estado', width: 10 },
    ];
    const rows = insumosTabla.map((s) => ({
      producto: s.producto,
      categoria: s.categoria ?? '—',
      clasificacion: s.clasificacion ?? '—',
      stockActual: s.stockActual,
      stockMinimo: s.stockMinimo,
      unidadMedida: s.unidadMedida ?? '—',
      estado: s.estadoBajoStock ? 'BAJO' : 'OK',
    }));
    sheet.addRows(rows);
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `insumos_${new Date().toISOString().slice(0, 10)}.xlsx`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const handleExportarPDF = async () => {
    if (insumosTabla.length === 0) return;
    const [{ jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ]);
    const pdf = new jsPDF({ orientation: 'landscape' });
    pdf.setFontSize(14);
    pdf.text('Informe de Insumos', 14, 15);
    pdf.setFontSize(10);
    pdf.text(`Generado: ${new Date().toLocaleString()}`, 14, 25);
    autoTable(pdf, {
      startY: 35,
      head: [['Insumo', 'Categoría', 'Clasificación', 'Stock Actual', 'Stock Mínimo', 'Unidad', 'Estado']],
      body: insumosTabla.map((s) => [
        s.producto,
        s.categoria ?? '—',
        s.clasificacion ?? '—',
        s.stockActual.toString(),
        s.stockMinimo.toString(),
        s.unidadMedida ?? '—',
        s.estadoBajoStock ? 'BAJO' : 'OK',
      ]),
    });
    pdf.save(`insumos_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="y-shell" style={{ padding: '24px 16px 140px', maxWidth: 1240, margin: '0 auto' }}>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>Inventario</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase opacity-60 mr-1">Reportes:</span>
          <button
            onClick={() => void handleExportarExcel()}
            disabled={cargando || insumosTabla.length === 0}
            className="rounded-lg bg-[#A61E22] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#7F1518] disabled:opacity-50"
          >
            <FileText size={16} /> Excel
          </button>
          <button
            onClick={() => void handleExportarPDF()}
            disabled={cargando || insumosTabla.length === 0}
            className="rounded-lg bg-[#A61E22] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#7F1518] disabled:opacity-50"
          >
            <FileText size={16} /> PDF
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
            <label className="text-xs font-bold uppercase opacity-60 block mb-1">Buscar insumo:</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#333]/40 text-xs">🔍</span>
              <input
                type="text"
                value={filtroNombre}
                onChange={(e) => setFiltroNombre(e.target.value)}
                placeholder="Ej. arroz, pollo, aceite"
                className="w-full rounded-lg bg-white border border-[#E8E1DB] px-3 py-2 text-sm pl-9 focus:border-[#A61E22] focus:ring-1 focus:ring-[#A61E22] outline-none"
              />
            </div>
          </div>
          <div className="min-w-[200px]">
            <label className="text-xs font-bold uppercase opacity-60 block mb-1">Categoría:</label>
            <select
              value={filtroCategoriaId ?? ''}
              onChange={(e) => setFiltroCategoriaId(e.target.value ? Number(e.target.value) : null)}
              className="rounded-lg bg-white border border-[#E8E1DB] px-3 py-2 text-sm focus:border-[#A61E22] focus:ring-1 focus:ring-[#A61E22] outline-none"
            >
              <option value="">Todas las categorías</option>
              {categoriasInsumo.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div className="min-w-[200px]">
            <label className="text-xs font-bold uppercase opacity-60 block mb-1">Unidad:</label>
            <select
              value={filtroUnidadId ?? ''}
              onChange={(e) => setFiltroUnidadId(e.target.value ? Number(e.target.value) : null)}
              className="rounded-lg bg-white border border-[#E8E1DB] px-3 py-2 text-sm focus:border-[#A61E22] focus:ring-1 focus:ring-[#A61E22] outline-none"
            >
              <option value="">Todas las unidades</option>
              {unidadesInsumo.map((u) => (
                <option key={u.id} value={u.id}>{u.nombre}</option>
              ))}
            </select>
          </div>
          <div className="min-w-[200px]">
            <label className="text-xs font-bold uppercase opacity-60 block mb-1">Estado de stock:</label>
            <select
              value={filtroEstadoStock}
              onChange={(e) => setFiltroEstadoStock(e.target.value as 'todos' | 'bajo' | 'ok')}
              className="rounded-lg bg-white border border-[#E8E1DB] px-3 py-2 text-sm focus:border-[#A61E22] focus:ring-1 focus:ring-[#A61E22] outline-none"
            >
              <option value="todos">Todos</option>
              <option value="bajo">Bajo stock (≤ mínimo)</option>
              <option value="ok">Disponible (&gt; mínimo)</option>
            </select>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 mb-4 items-start">
        <div className="min-w-[180px]">
          <label className="text-xs font-bold uppercase opacity-60 block mb-1">Stock mínimo desde:</label>
          <input
            type="number"
            value={filtroStockMinDesde}
            onChange={(e) => setFiltroStockMinDesde(e.target.value)}
            placeholder="Desde"
            className="w-full rounded-lg bg-white border border-[#E8E1DB] px-3 py-2 text-sm focus:border-[#A61E22] focus:ring-1 focus:ring-[#A61E22] outline-none"
          />
        </div>
        <div className="min-w-[180px]">
          <label className="text-xs font-bold uppercase opacity-60 block mb-1">Stock mínimo hasta:</label>
          <input
            type="number"
            value={filtroStockMinHasta}
            onChange={(e) => setFiltroStockMinHasta(e.target.value)}
            placeholder="Hasta"
            className="w-full rounded-lg bg-white border border-[#E8E1DB] px-3 py-2 text-sm focus:border-[#A61E22] focus:ring-1 focus:ring-[#A61E22] outline-none"
          />
        </div>
        <div className="min-w-[180px]">
          <label className="text-xs font-bold uppercase opacity-60 block mb-1">Stock actual desde:</label>
          <input
            type="number"
            value={filtroStockActDesde}
            onChange={(e) => setFiltroStockActDesde(e.target.value)}
            placeholder="Desde"
            className="w-full rounded-lg bg-white border border-[#E8E1DB] px-3 py-2 text-sm focus:border-[#A61E22] focus:ring-1 focus:ring-[#A61E22] outline-none"
          />
        </div>
        <div className="min-w-[180px]">
          <label className="text-xs font-bold uppercase opacity-60 block mb-1">Stock actual hasta:</label>
          <input
            type="number"
            value={filtroStockActHasta}
            onChange={(e) => setFiltroStockActHasta(e.target.value)}
            placeholder="Hasta"
            className="w-full rounded-lg bg-white border border-[#E8E1DB] px-3 py-2 text-sm focus:border-[#A61E22] focus:ring-1 focus:ring-[#A61E22] outline-none"
          />
        </div>
        <div className="min-w-[200px]">
          <label className="text-xs font-bold uppercase opacity-60 block mb-1">Ordenar por:</label>
          <select
            value={filtroOrdenarPor}
            onChange={(e) => setFiltroOrdenarPor(e.target.value as 'nombre' | 'stock_actual' | 'stock_minimo')}
            className="rounded-lg bg-white border border-[#E8E1DB] px-3 py-2 text-sm focus:border-[#A61E22] focus:ring-1 focus:ring-[#A61E22] outline-none"
          >
            <option value="nombre">Nombre</option>
            <option value="stock_actual">Stock actual</option>
            <option value="stock_minimo">Stock mínimo</option>
          </select>
        </div>
        <div className="min-w-[200px]">
          <label className="text-xs font-bold uppercase opacity-60 block mb-1">Dirección:</label>
          <select
            value={filtroOrdenDireccion}
            onChange={(e) => setFiltroOrdenDireccion(e.target.value as 'asc' | 'desc')}
            className="rounded-lg bg-white border border-[#E8E1DB] px-3 py-2 text-sm focus:border-[#A61E22] focus:ring-1 focus:ring-[#A61E22] outline-none"
          >
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </select>
        </div>
        <div className="flex items-end min-w-[200px]">
          <button
            onClick={() => {
              setFiltroNombre('');
              setFiltroCategoriaId(null);
              setFiltroUnidadId(null);
              setFiltroEstadoStock('todos');
              setFiltroStockMinDesde('');
              setFiltroStockMinHasta('');
              setFiltroStockActDesde('');
              setFiltroStockActHasta('');
              setFiltroOrdenarPor('nombre');
              setFiltroOrdenDireccion('asc');
            }}
            className="text-xs text-[#A61E22] underline hover:text-[#7F1518] px-2 py-1.5"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {cargando ? (
        <div className="y-panel" style={{ padding: 24, textAlign: 'center' }}>Cargando...</div>
      ) : insumosTabla.length === 0 ? (
        <div className="y-panel" style={{ padding: 24, textAlign: 'center' }}>No hay insumos registrados.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F5F5F5] text-left text-xs uppercase tracking-wider text-[#333]/60">
                <th className="px-3 py-2">Insumo</th>
                <th className="px-3 py-2">Categoría</th>
                <th className="px-3 py-2">Clasificación</th>
                <th className="px-3 py-2 text-right">Stock Actual</th>
                <th className="px-3 py-2 text-right">Stock Mínimo</th>
                <th className="px-3 py-2">Unidad</th>
                <th className="px-3 py-2">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F5]">
              {insumosTabla.map((s) => (
                <tr key={s.idProducto} className={`hover:bg-[#F5F5F5] ${s.estadoBajoStock ? 'bg-red-50' : ''}`}>
                  <td className="px-3 py-2">{s.producto}</td>
                  <td className="px-3 py-2">{s.categoria || '—'}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${clasificacionColor(s.clasificacion)}`}>
                      {s.clasificacion ? s.clasificacion.charAt(0).toUpperCase() + s.clasificacion.slice(1).toLowerCase() : '—'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">{s.stockActual}</td>
                  <td className="px-3 py-2 text-right">{s.stockMinimo}</td>
                  <td className="px-3 py-2">{s.unidadMedida || '—'}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${s.estadoBajoStock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {s.estadoBajoStock ? 'BAJO' : 'OK'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 mt-4">
        <span className="text-sm">Mostrando {insumosTabla.length} insumos</span>
      </div>
    </div>
  );
}

function clasificacionColor(c: string | null): string {
  if (!c) return 'text-[#333333]/60 bg-[#F5F5F5]';
  const colores: Record<string, string> = {
    VEGETALES: 'text-[#166534] bg-[#DCFCE7]',
    CARNES: 'text-[#991B1B] bg-[#FEE2E2]',
    ABARROTES: 'text-[#92400E] bg-[#FEF3C7]',
    MARISCOS: 'text-[#0C4A6E] bg-[#E0F2FE]',
    LACTEOS: 'text-[#6D28D9] bg-[#F3E8FF]',
    BEBIDAS: 'text-[#047857] bg-[#CCFBF1]',
    LICORES: 'text-[#7C3AED] bg-[#EDE9FE]',
    POSTRES: 'text-[#DB2777] bg-[#FCE7F3]',
    PLATOS: 'text-[#B45309] bg-[#FFEDD5]',
    SOPAS: 'text-[#0891B2] bg-[#CCFBF1]',
    CHIFA: 'text-[#B45309] bg-[#FFEDD5]',
    COMBOS: 'text-[#1D4ED8] bg-[#DBEAFE]',
    ENTRADAS: 'text-[#DC2626] bg-[#FCA5A5]',
    ESPECIAS: 'text-[#7C2D12] bg-[#FEF3C7]',
    ALMACEN: 'text-[#4B5563] bg-[#E5E7EB]',
    GENERAL: 'text-[#6B7280] bg-[#F3F4F6]',
  };
  return colores[c] || 'text-[#333333]/60 bg-[#F5F5F5]';
}
