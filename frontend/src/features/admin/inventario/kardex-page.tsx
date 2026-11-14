import { useCallback, useEffect, useMemo, useState } from 'react';
import { FileText, Filter, RefreshCw } from 'lucide-react';
import {
  listarKardex,
  type KardexFilter,
  type KardexItem,
  type KardexLista,
} from './kardex-service';
import { CLASIFICACIONES } from '../productos/productos-types';

const LIMITE = 50;

const TIPO_LABEL: Record<string, string> = {
  E: 'Entrada (Compra / Devolución)',
  S: 'Salida (Consumo / Transferencia)',
  A: 'Ajuste',
  M: 'Merma',
};

const TIPO_COLOR: Record<string, string> = {
  E: 'bg-green-100 text-green-700',
  S: 'bg-red-100 text-red-700',
  A: 'bg-blue-100 text-blue-700',
  M: 'bg-orange-100 text-orange-700',
};

export function KardexPage() {
  const [filtros, setFiltros] = useState<KardexFilter>({
    page: 1,
    limit: LIMITE,
    productoId: undefined,
    nombre: '',
    clasificacion: '',
    tipo: undefined,
    desde: '',
    hasta: '',
  });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<KardexLista | null>(null);
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState<KardexItem | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const res: KardexLista = await listarKardex(filtros);
      setData(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar el kardex.');
    } finally {
      setCargando(false);
    }
  }, [filtros]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const setFiltro = (key: string, value: string | number | undefined) => {
    setFiltros((prev) => ({
      ...prev,
      [key]: value === '' ? undefined : value,
      page: 1,
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      page: 1,
      limit: LIMITE,
      productoId: undefined,
      nombre: '',
      clasificacion: '',
      tipo: undefined,
      desde: '',
      hasta: '',
    });
  };

  const totalPaginas = useMemo(() => {
    if (!data) return 1;
    return Math.max(1, Math.ceil(data.total / LIMITE));
  }, [data]);

  const indicadores = useMemo(() => {
    if (!data) {
      return {
        stockActual: 0,
        totalEntradas: 0,
        totalSalidas: 0,
        valorizacionTotal: 0,
      };
    }
    return {
      stockActual: data.indicadores.stockActual,
      totalEntradas: data.indicadores.totalEntradas,
      totalSalidas: data.indicadores.totalSalidas,
      valorizacionTotal: data.indicadores.valorizacionTotal,
    };
  }, [data]);

  const items: KardexItem[] = useMemo(() => (data ? data.data : []), [data]);

  const handleExportarExcel = async () => {
    if (!data) return;
    const { default: ExcelJS } = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Kardex');
    sheet.columns = [
      { header: 'Fecha y hora', key: 'fecha', width: 20 },
      { header: 'Documento', key: 'documento', width: 20 },
      { header: 'Tipo', key: 'tipo', width: 20 },
      { header: 'Descripción', key: 'descripcion', width: 40 },
      { header: 'Producto', key: 'producto', width: 30 },
      { header: 'Código', key: 'codigo', width: 15 },
      { header: 'Categoría', key: 'categoria', width: 20 },
      { header: 'Unidad', key: 'unidad', width: 15 },
      { header: 'Entrada', key: 'entrada', width: 12 },
      { header: 'Salida', key: 'salida', width: 12 },
      { header: 'Saldo', key: 'saldo', width: 12 },
      { header: 'Costo Unitario', key: 'costoUnitario', width: 15 },
      { header: 'Costo Total', key: 'costoTotal', width: 15 },
      { header: 'Usuario', key: 'usuario', width: 20 },
    ];
    const rows = items.map((m) => ({
      fecha: new Date(m.fecha).toLocaleString(),
      documento: m.documento ?? '—',
      tipo: m.tipoMovimientoLabel,
      descripcion: m.descripcion ?? '—',
      producto: m.producto,
      codigo: m.codigo,
      categoria: m.categoria ?? '—',
      unidad: m.unidad ?? '—',
      entrada: m.esEntrada ? m.cantidad : '',
      salida: m.esSalida ? m.cantidad : '',
      saldo: m.saldo,
      costoUnitario: m.costoUnitario,
      costoTotal: m.costoTotal,
      usuario: m.usuario ?? '—',
    }));
    sheet.addRows(rows);
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kardex_${new Date().toISOString().slice(0, 10)}.xlsx`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const handleExportarPDF = async () => {
    if (!data) return;
    const [{ jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ]);
    const pdf = new jsPDF({ orientation: 'landscape' });
    pdf.setFontSize(14);
    pdf.text('Kardex de Inventario', 14, 15);
    pdf.setFontSize(10);
    pdf.text(`Generado: ${new Date().toLocaleString()}`, 14, 25);
    autoTable(pdf, {
      startY: 35,
      head: [['Fecha', 'Documento', 'Tipo', 'Producto', 'Entrada', 'Salida', 'Saldo', 'Costo Unit.', 'Costo Total', 'Usuario']],
      body: items.map((m) => [
        new Date(m.fecha).toLocaleString(),
        m.documento ?? '—',
        m.tipoMovimientoLabel,
        m.producto,
        m.esEntrada ? m.cantidad.toString() : '',
        m.esSalida ? m.cantidad.toString() : '',
        m.saldo.toString(),
        m.costoUnitario.toFixed(2),
        m.costoTotal.toFixed(2),
        m.usuario ?? '—',
      ]),
    });
    pdf.save(`kardex_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const colorTipo = (tipo: string) => TIPO_COLOR[tipo] ?? 'bg-gray-100 text-gray-700';
  const labelTipo = (tipo: string) => TIPO_LABEL[tipo] ?? tipo;

  return (
    <div className="y-shell" style={{ padding: '24px 16px 140px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#7F1518' }}>Kardex de Inventario</h1>
          <p className="text-sm text-[#666]/80 mt-1">
            Consulta de solo lectura de todos los movimientos de inventario generados por los módulos del sistema.
            Los saldos se calculan automáticamente a partir del stock inicial y cada movimiento registrado.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => void cargar()}
            disabled={cargando}
            className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm font-semibold text-[#333]/60 shadow-sm hover:bg-[#D9D9D9] disabled:opacity-50"
          >
            <RefreshCw size={16} /> Actualizar
          </button>
          <button
            onClick={() => handleExportarExcel()}
            disabled={cargando || items.length === 0}
            className="rounded-lg bg-[#A61E22] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#7F1518] disabled:opacity-50"
          >
            <FileText size={16} /> Excel
          </button>
          <button
            onClick={() => handleExportarPDF()}
            disabled={cargando || items.length === 0}
            className="rounded-lg bg-[#A61E22] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#7F1518] disabled:opacity-50"
          >
            PDF
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error} <button onClick={() => setError(null)} className="ml-2 underline">Cerrar</button>
        </div>
      )}

      {/* Filtros */}
      <div className="rounded-xl bg-[#F5F5F5]/60 p-4 mb-6 shadow-sm border border-[#F5F5F5]">
        <div className="flex items-center mb-3">
          <Filter size={16} className="mr-2 text-[#A61E22]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#333]/60">Filtros de búsqueda</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase opacity-60">Producto / código</label>
            <input
              type="text"
              value={filtros.nombre ?? ''}
              onChange={(e) => setFiltro('nombre', e.target.value)}
              placeholder="Nombre o código"
              className="w-full rounded-lg bg-white px-3 py-2 text-sm border border-[#E8E1DB] focus:border-[#A61E22] outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase opacity-60">Tipo de movimiento</label>
            <select
              value={String(filtros.tipo ?? '')}
              onChange={(e) => setFiltro('tipo', e.target.value as 'E' | 'S' | 'A' | 'M' | '')}
              className="w-full rounded-lg bg-white px-3 py-2 text-sm border border-[#E8E1DB] focus:border-[#A61E22] outline-none"
            >
              <option value="">Todos los tipos</option>
              <option value="E">COMPRAS / Devolución</option>
              <option value="S">CONSUMO / Transferencia</option>
              <option value="A">AJUSTES</option>
              <option value="M">MERMAS</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase opacity-60">Clasificación</label>
            <select
              value={String(filtros.clasificacion ?? '')}
              onChange={(e) => setFiltro('clasificacion', e.target.value)}
              className="w-full rounded-lg bg-white px-3 py-2 text-sm border border-[#E8E1DB] focus:border-[#A61E22] outline-none"
            >
              <option value="">Todas las clasificaciones</option>
              {CLASIFICACIONES.map((c) => (
                <option key={c.valor} value={c.valor}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase opacity-60">Desde</label>
            <input
              type="date"
              value={filtros.desde ?? ''}
              onChange={(e) => setFiltro('desde', e.target.value)}
              className="w-full rounded-lg bg-white px-3 py-2 text-sm border border-[#E8E1DB] focus:border-[#A61E22] outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase opacity-60">Hasta</label>
            <input
              type="date"
              value={filtros.hasta ?? ''}
              onChange={(e) => setFiltro('hasta', e.target.value)}
              className="w-full rounded-lg bg-white px-3 py-2 text-sm border border-[#E8E1DB] focus:border-[#A61E22] outline-none"
            />
          </div>
        </div>
        <div className="flex items-end gap-2 mt-3">
          {(filtros.nombre || filtros.tipo || filtros.desde || filtros.hasta) && (
            <button onClick={limpiarFiltros} className="text-xs text-[#A61E22] underline hover:text-[#7F1518] px-2 py-1">
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Indicadores (tarjetas informativas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl bg-white p-5 shadow-sm border border-[#F5F5F5]">
          <div className="text-xs font-bold uppercase tracking-wider text-[#333]/60">Stock actual</div>
          <div className="text-2xl font-bold text-[#333]">{indicadores.stockActual}</div>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm border border-[#F5F5F5]">
          <div className="text-xs font-bold uppercase tracking-wider text-[#333]/60">Total entradas</div>
          <div className="text-2xl font-bold text-[#15803d]">{indicadores.totalEntradas}</div>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm border border-[#F5F5F5]">
          <div className="text-xs font-bold uppercase tracking-wider text-[#333]/60">Total salidas</div>
          <div className="text-2xl font-bold text-[#b91c1c]">{indicadores.totalSalidas}</div>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm border border-[#F5F5F5]">
          <div className="text-xs font-bold uppercase tracking-wider text-[#333]/60">Valorización</div>
          <div className="text-2xl font-bold text-[#7F1518]">S/ {indicadores.valorizacionTotal.toFixed(2)}</div>
        </div>
      </div>

      {/* Tabla de movimientos */}
      <div className="rounded-xl bg-white shadow-sm border border-[#F5F5F5] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F5F5] text-left text-xs uppercase tracking-wider text-[#333]/60 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-3">Fecha y hora</th>
                <th className="px-3 py-3">Documento</th>
                <th className="px-3 py-3">Tipo de movimiento</th>
                <th className="px-3 py-3">Descripción</th>
                <th className="px-3 py-3">Producto</th>
                <th className="px-3 py-3">Clasificación</th>
                <th className="px-3 py-3 text-right">Entrada</th>
                <th className="px-3 py-3 text-right">Salida</th>
                <th className="px-3 py-3 text-right">Saldo</th>
                <th className="px-3 py-3 text-right">Costo unit.</th>
                <th className="px-3 py-3 text-right">Costo total</th>
                <th className="px-3 py-3">Usuario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F5]">
              {cargando ? (
                <tr>
                  <td colSpan={12} className="px-3 py-10 text-center text-[#333]/60">Cargando movimientos…</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-3 py-10 text-center text-[#333]/60">
                    No se encontraron movimientos con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                items.map((m) => (
                  <tr
                    key={m.id}
                    className="hover:bg-[#F9F5F5] cursor-pointer transition-colors"
                    onClick={() => setMovimientoSeleccionado(m)}
                  >
                    <td className="px-3 py-2">{new Date(m.fecha).toLocaleString()}</td>
                    <td className="px-3 py-2 text-[#333]/70">{m.documento ?? '—'}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${colorTipo(m.tipo)}`}>
                        {labelTipo(m.tipo)}
                      </span>
                    </td>
                    <td className="px-3 py-2">{m.descripcion ?? '—'}</td>
                    <td className="px-3 py-2 font-medium">{m.producto}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${clasificacionColor(m.clasificacion)}`}>
                        {m.clasificacion ? m.clasificacion.charAt(0).toUpperCase() + m.clasificacion.slice(1).toLowerCase() : '—'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      {m.esEntrada ? m.cantidad.toString() : '—'}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {m.esSalida ? m.cantidad.toString() : '—'}
                    </td>
                    <td className="px-3 py-2 text-right font-medium">{m.saldo.toString()}</td>
                    <td className="px-3 py-2 text-right">S/ {m.costoUnitario.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right">S/ {m.costoTotal.toFixed(2)}</td>
                    <td className="px-3 py-2">{m.usuario ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {!cargando && data && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#F5F5F5] bg-[#F9F9F9]">
            <div className="text-sm text-[#333]/70">
              Mostrando {items.length} de {data.total} movimientos · Página {filtros.page ?? 1} de {totalPaginas}
            </div>
            <div className="flex gap-2">
              <button
                disabled={(filtros.page ?? 1) <= 1}
                onClick={() => setFiltro('page', String(Number(filtros.page ?? 1) - 1))}
                className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F5F5F5]"
              >
                ← Anterior
              </button>
              <button
                disabled={(filtros.page ?? 1) >= totalPaginas}
                onClick={() => setFiltro('page', String(Number(filtros.page ?? 1) + 1))}
                className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F5F5F5]"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalle de movimiento */}
      {movimientoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={(e) => {
          if (e.target === e.currentTarget) setMovimientoSeleccionado(null);
        }}>
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-[#F5F5F5]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#7F1518]">Detalle de movimiento</h2>
              <button
                onClick={() => setMovimientoSeleccionado(null)}
                className="rounded-lg p-2 text-[#333]/60 hover:bg-[#F5F5F5] hover:text-[#333]"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-xs font-bold uppercase opacity-60">Producto</label>
                <p className="text-sm">{movimientoSeleccionado.producto}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase opacity-60">Código</label>
                <p className="text-sm">{movimientoSeleccionado.codigo}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase opacity-60">Tipo de movimiento</label>
                <p className="text-sm">{movimientoSeleccionado.tipoMovimientoLabel}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase opacity-60">Fecha y hora</label>
                <p className="text-sm">{new Date(movimientoSeleccionado.fecha).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase opacity-60">Documento</label>
                <p className="text-sm">{movimientoSeleccionado.documento ?? '—'}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase opacity-60">Descripción</label>
                <p className="text-sm">{movimientoSeleccionado.descripcion ?? '—'}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase opacity-60">Clasificación</label>
                <p className={`text-sm ${clasificacionColor(movimientoSeleccionado.clasificacion)}`}>
                  {movimientoSeleccionado.clasificacion ? movimientoSeleccionado.clasificacion.charAt(0).toUpperCase() + movimientoSeleccionado.clasificacion.slice(1).toLowerCase() : '—'}
                </p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase opacity-60">Unidad</label>
                <p className="text-sm">{movimientoSeleccionado.unidad ?? '—'}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase opacity-60">Stock anterior</label>
                <p className="text-sm">{movimientoSeleccionado.stockAnterior.toString()}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase opacity-60">Cantidad</label>
                <p className="text-sm">{movimientoSeleccionado.cantidad.toString()}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase opacity-60">Saldo resultante</label>
                <p className="text-sm font-bold">{movimientoSeleccionado.saldo.toString()}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase opacity-60">Costo unitario</label>
                <p className="text-sm">S/ {movimientoSeleccionado.costoUnitario.toFixed(2)}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase opacity-60">Costo total</label>
                <p className="text-sm">S/ {movimientoSeleccionado.costoTotal.toFixed(2)}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase opacity-60">Usuario responsable</label>
                <p className="text-sm">{movimientoSeleccionado.usuario ?? '—'}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setMovimientoSeleccionado(null)}
                className="rounded-xl bg-[#A61E22] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#7F1518]"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
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
