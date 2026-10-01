import { useEffect, useState } from 'react';
import {
  actualizarProducto,
  cambiarEstadoProducto,
  crearProducto,
  listarCategoriasActivas,
  listarCodigosConPrefijo,
  listarProductos,
} from './productos-service';
import type { CategoriaOpcion } from './productos-service';
import { prefijoParaCategoria, requiereTiempo, siguienteCodigo, TIPOS, UNIDADES } from './productos-types';
import type { Producto, ProductoForm, TipoProducto } from './productos-types';

const LIMITE = 20;

const VACIO: ProductoForm = {
  nombre: '',
  categoriaId: 0,
  unidadId: 1,
  tipo: 'P',
  precio: 0,
  costo: 0,
  stock: 0,
  stockMin: 0,
  controlaStock: false,
  tiempo: 0,
  disponible: true,
  imagen: '',
  detalle: '',
  afectoIgv: true,
  codigo: '',
  estado: 'A',
};

/** /admin/productos — ABM de productos (productos.md + plantilla Stitch). */
export function ProductosPage() {
  const [page, setPage] = useState(1);
  const [nombre, setNombre] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState<number | ''>('');
  const [estado, setEstado] = useState<'' | 'A' | 'I'>('');
  const [disponible, setDisponible] = useState<'' | 'S' | 'N'>('');
  const [datos, setDatos] = useState<Producto[]>([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<CategoriaOpcion[]>([]);
  const [modal, setModal] = useState<null | { editando: Producto | null }>(null);
  const [form, setForm] = useState<ProductoForm>(VACIO);
  const [formError, setFormError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [sugiriendo, setSugiriendo] = useState(false);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const [res, cats] = await Promise.all([
        listarProductos({ page, limit: LIMITE, nombre: busqueda, categoria, estado, disponible }),
        listarCategoriasActivas(),
      ]);
      setDatos(res.data);
      setTotal(res.total);
      setCategorias(cats);
    } catch {
      setError('No fue posible cargar los productos.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, busqueda, categoria, estado, disponible]);

  const totalPaginas = Math.max(1, Math.ceil(total / LIMITE));
  const disponibles = datos.filter((d) => d.disponible && d.estado === 'A').length;

  const abrirNuevo = () => {
    setForm(VACIO);
    setFormError(null);
    setModal({ editando: null });
  };

  const abrirEditar = (p: Producto) => {
    setForm({
      nombre: p.nombre,
      categoriaId: p.categoriaId,
      unidadId: p.unidadId,
      tipo: p.tipo,
      precio: p.precio,
      costo: p.costo,
      stock: p.stock,
      stockMin: p.stockMin,
      controlaStock: p.controlaStock,
      tiempo: p.tiempo ?? 0,
      disponible: p.disponible,
      imagen: p.imagen ?? '',
      detalle: p.detalle ?? '',
      afectoIgv: p.afectoIgv,
      codigo: p.codigo ?? '',
      estado: p.estado,
    });
    setFormError(null);
    setModal({ editando: p });
  };

  /** Sugiere el siguiente código libre del prefijo de la categoría (no pisa lo escrito). */
  const sugerirCodigo = async (categoriaId: number, forzar = false) => {
    if (!forzar && form.codigo.trim()) {
      return;
    }
    const cat = categorias.find((c) => c.id === categoriaId);
    if (!cat) {
      return;
    }
    setSugiriendo(true);
    try {
      const prefijo = prefijoParaCategoria(cat.nombre);
      const existentes = await listarCodigosConPrefijo(prefijo);
      setForm((f) => ({ ...f, codigo: siguienteCodigo(prefijo, existentes) }));
    } catch {
      setFormError('No se pudo sugerir el código. Escríbalo manual.');
    } finally {
      setSugiriendo(false);
    }
  };

  const cambiarCategoria = (id: number) => {
    setForm({ ...form, categoriaId: id });
    void sugerirCodigo(id);
  };

  const cambiarTipo = (tipo: TipoProducto) => {
    setForm({ ...form, tipo, tiempo: requiereTiempo(tipo) ? form.tiempo : 0 });
  };

  const guardar = async () => {
    if (!form.nombre.trim()) {
      setFormError('El nombre es obligatorio (máx. 50).');
      return;
    }
    if (!form.categoriaId) {
      setFormError('Seleccione la categoría (solo activas).');
      return;
    }
    if (!(form.precio >= 0)) {
      setFormError('El precio debe ser ≥ 0.');
      return;
    }
    setGuardando(true);
    setFormError(null);
    try {
      const payload = { ...form, nombre: form.nombre.trim(), codigo: form.codigo.trim() };
      if (modal?.editando) {
        await actualizarProducto(modal.editando.id, payload);
      } else {
        await crearProducto(payload);
      }
      setModal(null);
      await cargar();
    } catch (e) {
      const codigo = (e as Error).message;
      setFormError(
        codigo === 'YA_EXISTE'
          ? 'Ya existe un producto con ese código.'
          : codigo === 'CATEGORIA_INVALIDA'
            ? 'La categoría no existe o está inactiva.'
            : 'No se pudo guardar. Reintente.',
      );
    } finally {
      setGuardando(false);
    }
  };

  const toggleEstado = async (p: Producto) => {
    try {
      await cambiarEstadoProducto(p.id, p.estado === 'A' ? 'I' : 'A');
      await cargar();
    } catch {
      setError('No se pudo cambiar el estado.');
    }
  };

  return (
    <div className="flex w-full flex-col gap-6 pb-12">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <nav className="flex items-center gap-2 text-[11px] tracking-wider text-[#333333]/60 uppercase">
            <span>Inicio</span>
            <span>/</span>
            <span className="font-bold text-[#A61E22]">Productos</span>
          </nav>
          <h1 className="mt-1 font-[Newsreader] text-3xl font-medium text-[#7F1518]">
            Gestión de Productos y Platos
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-[#333333]/70">
            Catálogo maestro de preparaciones, insumos y coctelería de <strong>CHIFA YEMHENG</strong>.
          </p>
        </div>
        <button
          onClick={abrirNuevo}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-[#A61E22] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#7F1518]"
        >
          <span className="material-symbols-outlined text-[22px]">add</span>
          <span>Nuevo Producto</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi titulo="Total Productos" valor={String(total)} detalle="Catálogo completo" icono="restaurant" />
        <Kpi titulo="Disponibles" valor={String(disponibles)} detalle="En carta y comandas" icono="check_circle" />
        <Kpi titulo="Categorías" valor={String(categorias.length)} detalle="Activas seleccionables" icono="category" />
        <Kpi
          titulo="Inactivos"
          valor={String(datos.filter((d) => d.estado === 'I').length)}
          detalle="Fuera de carta"
          icono="block"
        />
      </div>

      <div className="grid grid-cols-1 items-center gap-3 rounded-xl bg-white p-4 shadow-sm md:grid-cols-2 lg:grid-cols-12">
        <div className="relative lg:col-span-5">
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setBusqueda(nombre);
                setPage(1);
              }
            }}
            placeholder="Buscar por nombre…"
            className="w-full rounded-xl bg-[#F5F5F5] py-2.5 pr-12 pl-4 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-[#A61E22]"
          />
          <button
            type="button"
            aria-label="Buscar"
            onClick={() => {
              setBusqueda(nombre);
              setPage(1);
            }}
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg bg-[#A61E22] p-1.5 text-white transition-colors hover:bg-[#7F1518]"
          >
            <span className="material-symbols-outlined text-[18px]">search</span>
          </button>
        </div>
        <select
          value={categoria}
          onChange={(e) => {
            setCategoria(e.target.value === '' ? '' : Number(e.target.value));
            setPage(1);
          }}
          className="cursor-pointer rounded-xl bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none lg:col-span-3"
        >
          <option value="">Todas las categorías ({categorias.length})</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        <select
          value={estado}
          onChange={(e) => {
            setEstado(e.target.value as '' | 'A' | 'I');
            setPage(1);
          }}
          className="cursor-pointer rounded-xl bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none lg:col-span-2"
        >
          <option value="">Estado: Todos</option>
          <option value="A">Activo</option>
          <option value="I">Inactivo</option>
        </select>
        <select
          value={disponible}
          onChange={(e) => {
            setDisponible(e.target.value as '' | 'S' | 'N');
            setPage(1);
          }}
          className="cursor-pointer rounded-xl bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none lg:col-span-2"
        >
          <option value="">En Carta: Todas</option>
          <option value="S">Disponible</option>
          <option value="N">Agotado</option>
        </select>
      </div>

      {cargando ? (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="h-8 animate-pulse rounded bg-[#F5F5F5]" />
          <div className="mt-3 h-8 animate-pulse rounded bg-[#F5F5F5]" />
          <div className="mt-3 h-8 animate-pulse rounded bg-[#F5F5F5]" />
        </div>
      ) : error ? (
        <div className="rounded-xl bg-white p-6 text-center shadow-sm">
          <p>{error}</p>
          <button
            onClick={() => void cargar()}
            className="mt-3 cursor-pointer rounded-lg bg-[#A61E22] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#7F1518] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A61E22]/50 active:scale-[0.99]"
          >
            Reintentar
          </button>
        </div>
      ) : datos.length === 0 ? (
        <div className="rounded-xl bg-white p-10 text-center shadow-sm">
          <p className="text-lg font-semibold">No existen productos registrados.</p>
          <button
            onClick={abrirNuevo}
            className="mt-4 cursor-pointer rounded-xl bg-[#A61E22] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#7F1518] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A61E22]/50 active:scale-[0.99]"
          >
            Crear el primero
          </button>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl bg-white shadow-sm md:block">
            <div className="max-h-[60vh] overflow-auto">
              <table className="w-full border-collapse text-left">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-[#F5F5F5] text-[11px] tracking-wider text-[#333333]/60 uppercase">
                    <th className="w-16 px-4 py-3 text-center">Foto</th>
                    <th className="px-4 py-3">Nombre &amp; Código</th>
                    <th className="px-4 py-3">Categoría</th>
                    <th className="px-4 py-3 text-right">Precio</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3 text-center">Cocción</th>
                    <th className="px-4 py-3 text-center">En Carta</th>
                    <th className="px-4 py-3 text-center">Estado</th>
                    <th className="w-36 px-4 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F5F5] text-sm">
                  {datos.map((p) => (
                    <tr key={p.id} className="transition-colors hover:bg-[#F5F5F5]">
                      <td className="px-4 py-3 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#A61E22] to-[#7F1518] text-white shadow-sm">
                          {p.imagen ? (
                            <img
                              src={p.imagen}
                              alt={p.nombre}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="material-symbols-outlined text-[22px]">restaurant</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold">{p.nombre}</div>
                        <div className="font-mono text-[11px] text-[#333333]/50">
                          {p.codigo ? `REF: ${p.codigo}` : `ID: ${p.id}`}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-[#F2C94C]/30 px-2.5 py-1 text-[11px] font-bold">
                          {p.categoria || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold">
                        S/. {p.precio.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <StockBadge p={p} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="rounded-lg bg-[#F5F5F5] px-2 py-0.5 text-xs">
                          {p.tiempo ? `${p.tiempo} min` : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {p.disponible ? (
                          <span className="rounded-full bg-[#22C55E]/15 px-2.5 py-1 text-[11px] font-bold text-[#22C55E]">
                            Disponible
                          </span>
                        ) : (
                          <span className="rounded-full bg-[#D9D9D9]/50 px-2.5 py-1 text-[11px] font-bold text-[#333333]/60">
                            Agotado
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {p.estado === 'A' ? (
                          <span className="rounded bg-[#22C55E]/15 px-2 py-0.5 text-[11px] font-bold text-[#22C55E]">
                            Activo
                          </span>
                        ) : (
                          <span className="rounded bg-[#D9D9D9]/40 px-2 py-0.5 text-[11px] font-bold text-[#333333]/60">
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            title="Editar producto"
                            onClick={() => abrirEditar(p)}
                            className="rounded-lg p-1.5 text-[#2563EB] transition-colors hover:bg-[#2563EB]/10"
                          >
                            <span className="material-symbols-outlined text-[19px]">edit</span>
                          </button>
                          <Toggle
                            activo={p.estado === 'A'}
                            titulo={p.estado === 'A' ? 'Desactivar' : 'Activar'}
                            onClick={() => void toggleEstado(p)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col items-center justify-between gap-3 bg-[#F5F5F5]/60 p-4 text-sm text-[#333333]/70 sm:flex-row">
              <span>
                Mostrando <strong>{datos.length}</strong> de <strong>{total}</strong> productos
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((x) => Math.max(1, x - 1))}
                  className="cursor-pointer rounded-lg bg-white px-3 py-1.5 shadow-sm transition-colors hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white dark:bg-white/10 dark:hover:bg-white/20"
                >
                  ← Anterior
                </button>
                <span>
                  Página {page} de {totalPaginas}
                </span>
                <button
                  disabled={page >= totalPaginas}
                  onClick={() => setPage((x) => x + 1)}
                  className="cursor-pointer rounded-lg bg-white px-3 py-1.5 shadow-sm transition-colors hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white dark:bg-white/10 dark:hover:bg-white/20"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          </div>

          <div className="grid max-h-[70vh] grid-cols-1 gap-4 overflow-y-auto sm:grid-cols-2 md:hidden">
            {datos.map((p) => (
              <article key={p.id} className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-[#7F1518]">{p.nombre}</h3>
                    <p className="text-xs text-[#333333]/50">
                      {p.categoria} · S/. {p.precio.toFixed(2)}
                    </p>
                  </div>
                  {p.estado === 'A' ? (
                    <span className="rounded bg-[#22C55E]/15 px-2 py-0.5 text-[11px] font-bold text-[#22C55E]">
                      Activo
                    </span>
                  ) : (
                    <span className="rounded bg-[#D9D9D9]/40 px-2 py-0.5 text-[11px] font-bold text-[#333333]/60">
                      Inactivo
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <StockBadge p={p} />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => abrirEditar(p)}
                      className="cursor-pointer rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm font-semibold transition-colors hover:bg-[#D9D9D9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A61E22]/50"
                    >
                      Editar
                    </button>
                    <Toggle
                      activo={p.estado === 'A'}
                      titulo={p.estado === 'A' ? 'Desactivar' : 'Activar'}
                      onClick={() => void toggleEstado(p)}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 backdrop-blur-xs sm:p-4">
          <div className="flex max-h-[90vh] w-full flex-col overflow-y-auto bg-white shadow-2xl sm:max-w-3xl sm:rounded-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between bg-[#F5F5F5] px-6 py-4">
              <h2 className="text-xl font-bold text-[#7F1518]">
                {modal.editando ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button
                onClick={() => setModal(null)}
                aria-label="Cerrar"
                className="rounded-lg p-2 transition-colors hover:bg-[#D9D9D9]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-4 p-6">
              {formError && (
                <div role="alert" className="rounded-lg border border-[#DC2626]/30 bg-[#DC2626]/10 p-3 text-sm">
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-1.5 md:col-span-2">
                  <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">
                    Nombre <span className="text-[#A61E22]">*</span>
                  </span>
                  <input
                    value={form.nombre}
                    maxLength={50}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Ej. Chaufa Especial"
                    className="rounded-lg bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-[#A61E22]"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">
                    Categoría <span className="text-[#A61E22]">*</span>
                  </span>
                  <select
                    value={form.categoriaId}
                    onChange={(e) => cambiarCategoria(Number(e.target.value))}
                    className="rounded-lg bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none"
                  >
                    <option value={0}>Seleccione…</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Tipo</span>
                  <select
                    value={form.tipo}
                    onChange={(e) => cambiarTipo(e.target.value as TipoProducto)}
                    className="rounded-lg bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none"
                  >
                    {TIPOS.map((t) => (
                      <option key={t.valor} value={t.valor}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">
                    Precio (S/.) <span className="text-[#A61E22]">*</span>
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={form.precio}
                    onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })}
                    className="rounded-lg bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Unidad *</span>
                  <select
                    value={form.unidadId}
                    onChange={(e) => setForm({ ...form, unidadId: Number(e.target.value) })}
                    className="rounded-lg bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none"
                  >
                    {UNIDADES.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Stock</span>
                  <input
                    type="number"
                    min={0}
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                    className="rounded-lg bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Stock mínimo</span>
                  <input
                    type="number"
                    min={0}
                    value={form.stockMin}
                    onChange={(e) => setForm({ ...form, stockMin: Number(e.target.value) })}
                    className="rounded-lg bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">
                    Tiempo cocción (min)
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={form.tiempo}
                    disabled={!requiereTiempo(form.tipo)}
                    onChange={(e) => setForm({ ...form, tiempo: Number(e.target.value) })}
                    className="rounded-lg bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  {!requiereTiempo(form.tipo) && (
                    <span className="text-[11px] leading-snug text-[#333333]/60">
                      Solo aplica a Preparado.
                    </span>
                  )}
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="flex items-center justify-between gap-2 text-[11px] font-bold tracking-wider uppercase opacity-60">
                    <span>
                      Código <span className="normal-case opacity-70">(opcional, único)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => void sugerirCodigo(form.categoriaId, true)}
                      disabled={sugiriendo || !form.categoriaId}
                      className="rounded-md bg-[#F5F5F5] px-2 py-0.5 text-[10px] font-bold normal-case text-[#A61E22] transition-colors hover:bg-[#A61E22] hover:text-white disabled:opacity-50"
                    >
                      {sugiriendo ? 'Buscando…' : 'Autocompletar'}
                    </button>
                  </span>
                  <input
                    value={form.codigo}
                    maxLength={20}
                    onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                    placeholder="Ej. CHF009"
                    className="rounded-lg bg-[#F5F5F5] px-3.5 py-2.5 font-mono text-sm outline-none"
                  />
                  <span className="text-[11px] leading-snug text-[#333333]/60">
                    Prefijo por familia + número: SOP sopas · CHF chifa · ENT entradas · PLF fondo
                    · CRI criollos · MAR marinos · BEO/BEF/BEC bebidas · LIC licores · POS postres
                    · INS insumos. Vacío = se muestra el ID. Si repites uno verás “Ya existe…”.
                  </span>
                </label>
                <label className="flex flex-col gap-1.5 md:col-span-2">
                  <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Detalle</span>
                  <textarea
                    value={form.detalle}
                    maxLength={150}
                    rows={2}
                    onChange={(e) => setForm({ ...form, detalle: e.target.value })}
                    className="resize-none rounded-lg bg-[#F5F5F5] px-3.5 py-2 text-sm outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Imagen (URL)</span>
                  <input
                    value={form.imagen}
                    maxLength={200}
                    onChange={(e) => setForm({ ...form, imagen: e.target.value })}
                    placeholder="https://…"
                    className="rounded-lg bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Costo (S/.)</span>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={form.costo}
                    onChange={(e) => setForm({ ...form, costo: Number(e.target.value) })}
                    className="rounded-lg bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none"
                  />
                </label>
                <div className="flex gap-4">
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.disponible}
                      onChange={(e) => setForm({ ...form, disponible: e.target.checked })}
                      className="h-4 w-4 accent-[#22C55E]"
                    />
                    Disponible en carta
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.controlaStock}
                      onChange={(e) => setForm({ ...form, controlaStock: e.target.checked })}
                      className="h-4 w-4 accent-[#A61E22]"
                    />
                    Controla stock
                  </label>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Estado</span>
                  <div className="flex gap-2">
                    {(['A', 'I'] as const).map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setForm({ ...form, estado: v })}
                        className={`flex-1 cursor-pointer rounded-lg px-3 py-2.5 text-sm font-bold transition-colors ${
                          form.estado === v
                            ? 'bg-[#A61E22] text-white'
                            : 'bg-[#F5F5F5] hover:bg-[#D9D9D9]'
                        }`}
                      >
                        {v === 'A' ? 'Activo' : 'Inactivo'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-[#F5F5F5] bg-white py-4">
                <button
                  onClick={() => setModal(null)}
                  className="rounded-xl bg-[#F5F5F5] px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-[#D9D9D9]"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => void guardar()}
                  disabled={guardando}
                  className="flex items-center gap-2 rounded-xl bg-[#A61E22] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#7F1518] disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-[20px]">save</span>
                  <span>{guardando ? 'Guardando…' : 'Guardar Producto'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Kpi({ titulo, valor, detalle, icono }: { titulo: string; valor: string; detalle: string; icono: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white p-5 shadow-sm">
      <div className="flex flex-col">
        <span className="text-[11px] font-medium tracking-wider text-[#333333]/60 uppercase">{titulo}</span>
        <span className="mt-2 text-4xl leading-none font-bold">{valor}</span>
        <span className="mt-1 text-sm text-[#333333]/60">{detalle}</span>
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5F5F5] text-[#A61E22]">
        <span className="material-symbols-outlined text-2xl">{icono}</span>
      </div>
    </div>
  );
}

function StockBadge({ p }: { p: Producto }) {
  const bajo = p.controlaStock && p.stock <= p.stockMin;
  const dot = !p.controlaStock || p.stock > p.stockMin ? 'bg-[#22C55E]' : bajo ? 'bg-[#F59E0B]' : 'bg-[#D9D9D9]';
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {p.stock} {p.unidad || ' und.'}
      {bajo && ' (Bajo)'}
    </span>
  );
}

function Toggle({ activo, titulo, onClick }: { activo: boolean; titulo: string; onClick: () => void }) {
  return (
    <button
      title={titulo}
      onClick={onClick}
      className={`relative flex h-6 w-11 cursor-pointer items-center rounded-full p-0.5 transition-colors hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A61E22]/50 dark:hover:brightness-110 ${
        activo ? 'bg-[#A61E22]' : 'bg-[#D9D9D9]'
      }`}
    >
      <div
        className={`h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
          activo ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}
