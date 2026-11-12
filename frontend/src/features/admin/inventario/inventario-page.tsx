import { useEffect, useState } from 'react';
import {
  actualizarReceta,
  crearMovimiento,
  crearReceta,
  getCostoReceta,
  getStockInsumos,
  listarInsumosParaSelect,
  listarMovimientos,
  listarPlatosParaSelect,
  listarRecetas,
} from './inventario-service';
import type {
  Movimiento,
  OpcionProducto,
  Receta,
  RecetaCostoView,
  StockInsumoView,
} from './inventario-service';

const LIMITE = 20;

export function AdminInventarioPage() {
  const [tab, setTab] = useState<'movimientos' | 'recetas' | 'insumos'>('movimientos');
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [insumosTabla, setInsumosTabla] = useState<StockInsumoView[]>([]);
  const [totalMov, setTotalMov] = useState(0);
  const [totalRec, setTotalRec] = useState(0);
  const [page, setPage] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [cargandoMaestros, setCargandoMaestros] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalMov, setModalMov] = useState(false);
  const [modalRec, setModalRec] = useState(false);
  const [modalCosto, setModalCosto] = useState(false);
  const [recetaEditando, setRecetaEditando] = useState<number | null>(null);
  const [costoVer, setCostoVer] = useState<RecetaCostoView | null>(null);
  const [formMov, setFormMov] = useState({ productoId: 0, tipo: 'E', cantidad: 0, costo: 0, motivo: '' });
  const [formRec, setFormRec] = useState({ productoId: 0, insumoId: 0, cantidad: 0 });
  const [guardando, setGuardando] = useState(false);
  const [platos, setPlatos] = useState<OpcionProducto[]>([]);
  const [insumos, setInsumos] = useState<OpcionProducto[]>([]);
  const [categoriasInsumo, setCategoriasInsumo] = useState<{ id: number; nombre: string }[]>([]);
  const [unidadesInsumo, setUnidadesInsumo] = useState<{ id: number; nombre: string }[]>([]);
  const [filtroProductoId, setFiltroProductoId] = useState<number | null>(null);
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

  /* Filtros kardex */
  const [filtroTipo, setFiltroTipo] = useState<'E' | 'S' | 'A' | 'M' | ''>('');
  const [filtroDesde, setFiltroDesde] = useState<string>('');
  const [filtroHasta, setFiltroHasta] = useState<string>('');

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      if (tab === 'movimientos') {
        const res = await listarMovimientos({
          page,
          limit: LIMITE,
          productoId: undefined,
          tipo: filtroTipo || undefined,
          desde: filtroDesde || undefined,
          hasta: filtroHasta || undefined,
        });
        setMovimientos(res.data);
        setTotalMov(res.total);
      } else if (tab === 'recetas') {
        const res = await listarRecetas({ page, limit: LIMITE, productoId: filtroProductoId === null ? undefined : filtroProductoId });
        setRecetas(res.data);
        setTotalRec(res.total);
      } else {
        const res = await getStockInsumos({
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
        setInsumosTabla(res);
        const filtrosActivos = filtroNombre || filtroCategoriaId !== null || filtroUnidadId !== null
          || filtroEstadoStock !== 'todos' || filtroStockMinDesde || filtroStockMinHasta
          || filtroStockActDesde || filtroStockActHasta;
        if (!filtrosActivos) {
          setCategoriasInsumo(Array.from(new Map(
            res.filter((r) => r.categoriaId !== null && r.categoria)
              .map((r) => [r.categoriaId!, r.categoria!]),
          ), ([id, nombre]) => ({ id, nombre })));
          setUnidadesInsumo(Array.from(new Map(
            res.filter((r) => r.unidadId !== null && r.unidadMedida)
              .map((r) => [r.unidadId!, r.unidadMedida!]),
          ), ([id, nombre]) => ({ id, nombre })));
        }
      }
    } catch {
      setError('No fue posible cargar los datos.');
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
    } catch {
      // No bloquear la página si fallan los maestros
    } finally {
      setCargandoMaestros(false);
    }
  };

  useEffect(() => {
    void cargar();
    void cargarMaestros();
  }, [page, tab, filtroTipo, filtroDesde, filtroHasta, filtroProductoId, filtroNombre, filtroCategoriaId, filtroUnidadId, filtroEstadoStock, filtroStockMinDesde, filtroStockMinHasta, filtroStockActDesde, filtroStockActHasta, filtroOrdenarPor, filtroOrdenDireccion]);

  const handleCrearMov = async () => {
    if (!formMov.productoId || !formMov.cantidad) {
      setError('Producto y cantidad son obligatorios.');
      return;
    }
    setGuardando(true);
    try {
      await crearMovimiento({
        productoId: formMov.productoId,
        tipo: formMov.tipo,
        cantidad: formMov.cantidad,
        costo: formMov.costo,
        motivo: formMov.motivo || undefined,
      });
      setModalMov(false);
      setFormMov({ productoId: 0, tipo: 'E', cantidad: 0, costo: 0, motivo: '' });
      await cargar();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGuardando(false);
    }
  };

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

  const colorTipo = (t: string) => t === 'E' ? 'bg-green-100 text-green-700' : t === 'S' ? 'bg-red-100 text-red-700' : t === 'A' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700';
  const labelTipo = (t: string) => t === 'E' ? 'Entrada' : t === 'S' ? 'Salida' : t === 'A' ? 'Ajuste' : 'Merma';

  const totalPaginas = Math.max(1, Math.ceil((tab === 'movimientos' ? totalMov : totalRec) / LIMITE));

  return (
    <div className="y-shell" style={{ padding: '24px 16px 140px', maxWidth: 1240, margin: '0 auto' }}>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>Inventario</h1>
        <button onClick={() => {
          if (tab === 'movimientos') setModalMov(true);
          else if (tab === 'recetas') setModalRec(true);
        }} className="rounded-lg bg-[#A61E22] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7F1518]">
          + {tab === 'movimientos' ? 'Movimiento' : tab === 'recetas' ? 'Receta' : ''}
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={() => { setTab('movimientos'); setPage(1); }} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${tab === 'movimientos' ? 'bg-[#A61E22] text-white' : 'bg-[#F5F5F5] hover:bg-[#D9D9D9]'}`}>Kardex</button>
        <button onClick={() => { setTab('recetas'); setPage(1); }} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${tab === 'recetas' ? 'bg-[#A61E22] text-white' : 'bg-[#F5F5F5] hover:bg-[#D9D9D9]'}`}>Recetas</button>
        <button onClick={() => { setTab('insumos'); setPage(1); }} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${tab === 'insumos' ? 'bg-[#A61E22] text-white' : 'bg-[#F5F5F5] hover:bg-[#D9D9D9]'}`}>Insumos</button>
      </div>

      {tab === 'recetas' && (
        <div className="flex gap-2 mb-4 items-center">
          <label className="text-xs font-bold uppercase opacity-60">Filtrar por plato:</label>
          <select
            value={filtroProductoId ?? ''}
            onChange={(e) => {
              setFiltroProductoId(e.target.value ? Number(e.target.value) : null);
              setPage(1);
            }}
            className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm"
          >
            <option value="">Todos los platos</option>
            {platos.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
          {filtroProductoId && (
            <button
              onClick={() => { setFiltroProductoId(null); setPage(1); }}
              className="text-xs text-[#A61E22] underline hover:text-[#7F1518]"
            >
              Limpiar filtro
            </button>
          )}
        </div>
      )}

      {tab === 'movimientos' && (
        <div className="flex gap-2 mb-4 items-center">
          <label className="text-xs font-bold uppercase opacity-60">Tipo:</label>
          <select
            value={filtroTipo}
            onChange={(e) => { setFiltroTipo(e.target.value as 'E' | 'S' | 'A' | 'M' | ''); setPage(1); }}
            className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            <option value="E">Entrada</option>
            <option value="S">Salida</option>
            <option value="A">Ajuste</option>
            <option value="M">Merma</option>
          </select>
          <label className="text-xs font-bold uppercase opacity-60 ml-2">Desde:</label>
          <input
            type="date"
            value={filtroDesde}
            onChange={(e) => { setFiltroDesde(e.target.value); setPage(1); }}
            className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm"
          />
          <label className="text-xs font-bold uppercase opacity-60 ml-2">Hasta:</label>
          <input
            type="date"
            value={filtroHasta}
            onChange={(e) => { setFiltroHasta(e.target.value); setPage(1); }}
            className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm"
          />
          {(filtroTipo || filtroDesde || filtroHasta) && (
            <button
              onClick={() => { setFiltroTipo(''); setFiltroDesde(''); setFiltroHasta(''); setPage(1); }}
              className="text-xs text-[#A61E22] underline hover:text-[#7F1518]"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {tab === 'insumos' && (
        <div>
          <div className="flex flex-wrap gap-4 mb-4 items-start">
          <div className="flex-1 min-w-[220px]">
            <label className="text-xs font-bold uppercase opacity-60 block mb-1">Buscar insumo:</label>
            <input
              type="text"
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
              placeholder="Ej. arroz, pollo, aceite"
              className="w-full rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm"
            />
          </div>
          <div className="min-w-[200px]">
            <label className="text-xs font-bold uppercase opacity-60 block mb-1">Categoría:</label>
            <select
              value={filtroCategoriaId ?? ''}
              onChange={(e) => setFiltroCategoriaId(e.target.value ? Number(e.target.value) : null)}
              className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm"
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
              className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm"
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
              className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm"
            >
              <option value="todos">Todos</option>
              <option value="bajo">Bajo stock (≤ mínimo)</option>
              <option value="ok">Disponible (&gt; mínimo)</option>
            </select>
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
              className="w-full rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm"
            />
          </div>
          <div className="min-w-[180px]">
            <label className="text-xs font-bold uppercase opacity-60 block mb-1">Stock mínimo hasta:</label>
            <input
              type="number"
              value={filtroStockMinHasta}
              onChange={(e) => setFiltroStockMinHasta(e.target.value)}
              placeholder="Hasta"
              className="w-full rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm"
            />
          </div>
          <div className="min-w-[180px]">
            <label className="text-xs font-bold uppercase opacity-60 block mb-1">Stock actual desde:</label>
            <input
              type="number"
              value={filtroStockActDesde}
              onChange={(e) => setFiltroStockActDesde(e.target.value)}
              placeholder="Desde"
              className="w-full rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm"
            />
          </div>
          <div className="min-w-[180px]">
            <label className="text-xs font-bold uppercase opacity-60 block mb-1">Stock actual hasta:</label>
            <input
              type="number"
              value={filtroStockActHasta}
              onChange={(e) => setFiltroStockActHasta(e.target.value)}
              placeholder="Hasta"
              className="w-full rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm"
            />
          </div>
          <div className="min-w-[200px]">
            <label className="text-xs font-bold uppercase opacity-60 block mb-1">Ordenar por:</label>
            <select
              value={filtroOrdenarPor}
              onChange={(e) => setFiltroOrdenarPor(e.target.value as 'nombre' | 'stock_actual' | 'stock_minimo')}
              className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm"
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
              className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm"
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
                setPage(1);
              }}
              className="text-xs text-[#A61E22] underline hover:text-[#7F1518] px-2 py-1.5"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
        </div>
      )}

      {error && <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">{error} <button onClick={() => setError(null)} className="ml-2 underline">Cerrar</button></div>}

      {cargando ? (
        <div className="y-panel" style={{ padding: 24, textAlign: 'center' }}>Cargando...</div>
      ) : tab === 'movimientos' ? (
        movimientos.length === 0 ? (
          <div className="y-panel" style={{ padding: 24, textAlign: 'center' }}>No hay movimientos registrados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F5F5F5] text-left text-xs uppercase tracking-wider text-[#333]/60">
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Producto</th>
                  <th className="px-3 py-2">Tipo</th>
                  <th className="px-3 py-2 text-right">Cantidad</th>
                  <th className="px-3 py-2 text-right">Costo</th>
                  <th className="px-3 py-2">Motivo</th>
                  <th className="px-3 py-2">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F5F5]">
                {movimientos.map((m) => (
                  <tr key={m.id} className="hover:bg-[#F5F5F5]">
                    <td className="px-3 py-2">{m.id}</td>
                    <td className="px-3 py-2">{m.producto}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${colorTipo(m.tipo)}`}>{labelTipo(m.tipo)}</span>
                    </td>
                    <td className="px-3 py-2 text-right">{m.cantidad}</td>
                    <td className="px-3 py-2 text-right">S/. {m.costo.toFixed(2)}</td>
                    <td className="px-3 py-2">{m.motivo || '—'}</td>
                    <td className="px-3 py-2">{new Date(m.fecha).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : tab === 'recetas' ? (
        recetas.length === 0 ? (
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
                      <div className="flex gap-2">
                        <button
                          className="text-[#A61E22] underline"
                          onClick={() => {
                            setRecetaEditando(r.id);
                            setFormRec({ productoId: r.productoId, insumoId: r.insumoId, cantidad: r.cantidad });
                            setModalRec(true);
                          }}
                        >
                          Editar
                        </button>
                        <button
                          className="text-blue-600 underline"
                          onClick={() => void verCostoReceta(r.productoId)}
                        >
                          Ver costo
                        </button>
                        <button className="text-[#A61E22] underline" disabled={guardando} onClick={() => void cambiarEstadoReceta(r)}>
                          {r.estado === 'A' ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        insumosTabla.length === 0 ? (
          <div className="y-panel" style={{ padding: 24, textAlign: 'center' }}>No hay insumos registrados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F5F5F5] text-left text-xs uppercase tracking-wider text-[#333]/60">
                  <th className="px-3 py-2">Insumo</th>
                  <th className="px-3 py-2">Categoría</th>
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
        )
      )}

      <div className="flex items-center justify-center gap-2 mt-4">
        {tab !== 'insumos' && (
          <>
            <button disabled={page <= 1} onClick={() => setPage((x) => Math.max(1, x - 1))} className="rounded-lg bg-white px-3 py-1.5 shadow-sm disabled:opacity-50">← Anterior</button>
            <span className="text-sm">Página {page} de {totalPaginas}</span>
            <button disabled={page >= totalPaginas} onClick={() => setPage((x) => x + 1)} className="rounded-lg bg-white px-3 py-1.5 shadow-sm disabled:opacity-50">Siguiente →</button>
          </>
        )}
      </div>

      {modalMov && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-[#7F1518] mb-4">Nuevo Movimiento</h2>
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase opacity-60">Producto *</span>
                <select
                  disabled={cargandoMaestros}
                  value={formMov.productoId}
                  onChange={(e) => setFormMov({ ...formMov, productoId: Number(e.target.value) })}
                  className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm disabled:opacity-60"
                >
                  <option value="">Seleccionar producto…</option>
                  {platos.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase opacity-60">Tipo *</span>
                <select value={formMov.tipo} onChange={(e) => setFormMov({ ...formMov, tipo: e.target.value })} className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm">
                  <option value="E">Entrada</option>
                  <option value="S">Salida</option>
                  <option value="A">Ajuste</option>
                  <option value="M">Merma</option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase opacity-60">Cantidad *</span>
                <input type="number" value={formMov.cantidad} onChange={(e) => setFormMov({ ...formMov, cantidad: Number(e.target.value) })} className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase opacity-60">Costo</span>
                <input type="number" value={formMov.costo} onChange={(e) => setFormMov({ ...formMov, costo: Number(e.target.value) })} className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase opacity-60">Motivo</span>
                <input value={formMov.motivo} onChange={(e) => setFormMov({ ...formMov, motivo: e.target.value })} className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm" />
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setModalMov(false)} className="rounded-xl bg-[#F5F5F5] px-5 py-2.5 text-sm font-semibold hover:bg-[#D9D9D9]">Cancelar</button>
              <button onClick={() => void handleCrearMov()} disabled={guardando} className="rounded-xl bg-[#A61E22] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#7F1518] disabled:opacity-60">
                {guardando ? 'Guardando…' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                {guardando ? 'Guardando…' : 'Crear'}
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