import { useEffect, useState } from 'react';
import {
  actualizarCategoria,
  cambiarEstadoCategoria,
  crearCategoria,
  listarCategorias,
} from './categorias-service';
import type { AreaDespacho, Categoria, CategoriaForm } from './categorias-types';

const LIMITE = 20;

const VACIO: CategoriaForm = { nombre: '', descripcion: '', area: 'COCINA', orden: 0, estado: 'A' };

/** /admin/categorias — ABM de categorías (categorias.md). Responsive: tabla/cards/modal. */
export function CategoriasPage() {
  const [page, setPage] = useState(1);
  const [nombre, setNombre] = useState('');
  const [estado, setEstado] = useState<'' | 'A' | 'I'>('');
  const [busqueda, setBusqueda] = useState('');
  const [datos, setDatos] = useState<Categoria[]>([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<null | { editando: Categoria | null }>(null);
  const [form, setForm] = useState<CategoriaForm>(VACIO);
  const [formError, setFormError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [confirmar, setConfirmar] = useState<Categoria | null>(null);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await listarCategorias({ page, limit: LIMITE, nombre: busqueda, estado });
      setDatos(res.data);
      setTotal(res.total);
    } catch {
      setError('No fue posible cargar las categorías.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, busqueda, estado]);

  const totalPaginas = Math.max(1, Math.ceil(total / LIMITE));
  const hayFiltros = busqueda !== '' || nombre !== '' || estado !== '';
  const activas = datos.filter((d) => d.estado === 'A').length;
  const platos = datos.reduce((acc, d) => acc + d.productosAsociados, 0);

  const abrirNuevo = () => {
    setForm({ ...VACIO, orden: Math.max(0, ...datos.map((d) => d.orden)) + 1 });
    setFormError(null);
    setModal({ editando: null });
  };

  const abrirEditar = (cat: Categoria) => {
    setForm({
      nombre: cat.nombre,
      descripcion: cat.descripcion ?? '',
      area: cat.area,
      orden: cat.orden,
      estado: cat.estado,
    });
    setFormError(null);
    setModal({ editando: cat });
  };

  const guardar = async () => {
    if (!form.nombre.trim()) {
      setFormError('El nombre es obligatorio.');
      return;
    }
    if (form.nombre.trim().length > 50) {
      setFormError('El nombre admite máximo 50 caracteres (BD).');
      return;
    }
    if ((form.descripcion ?? '').length > 100) {
      setFormError('La descripción admite máximo 100 caracteres (BD).');
      return;
    }
    setGuardando(true);
    setFormError(null);
    try {
      if (modal?.editando) {
        await actualizarCategoria(modal.editando.id, { ...form, nombre: form.nombre.trim() });
      } else {
        await crearCategoria({ ...form, nombre: form.nombre.trim() });
      }
      setModal(null);
      await cargar();
    } catch (e) {
      const codigo = (e as Error).message;
      setFormError(
        codigo === 'YA_EXISTE'
          ? 'Ya existe una categoría con ese nombre.'
          : 'No se pudo guardar. Reintente.',
      );
    } finally {
      setGuardando(false);
    }
  };

  const toggleEstado = async (cat: Categoria, forzar = false) => {
    const nuevo = cat.estado === 'A' ? 'I' : 'A';
    if (nuevo === 'I' && cat.productosAsociados > 0 && !forzar) {
      setConfirmar(cat);
      return;
    }
    try {
      await cambiarEstadoCategoria(cat.id, nuevo, forzar);
      setConfirmar(null);
      await cargar();
    } catch (e) {
      const err = e as Error & { productosAsociados?: number };
      if (err.message === 'TIENE_PRODUCTOS') {
        setConfirmar(cat);
      }
    }
  };

  return (
    <div className="flex w-full flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <nav className="flex items-center gap-2 text-[11px] tracking-wider text-[#333333]/60 uppercase">
            <span>Inicio</span>
            <span>/</span>
            <span className="font-bold text-[#A61E22]">Categorías</span>
          </nav>
          <h1 className="mt-1 font-[Newsreader] text-3xl font-medium text-[#7F1518]">
            Gestión de Categorías de Carta
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[#333333]/70">
            Taxonomía gastronómica para carta física, carta digital QR y comandas KDS.
          </p>
        </div>
        <button
          onClick={abrirNuevo}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-[#A61E22] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#7F1518]"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi titulo="Total Categorías" valor={String(total)} detalle="Estructura canónica" icono="category" />
        <Kpi titulo="Categorías Activas" valor={String(activas)} detalle="En carta digital y salón" icono="menu_book" />
        <Kpi titulo="Platos Vinculados" valor={String(platos)} detalle="Recetas registradas" icono="restaurant" />
        <Kpi
          titulo="Inactivas"
          valor={String(datos.filter((d) => d.estado === 'I').length)}
          detalle="Ocultas en carta"
          icono="visibility_off"
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-col items-stretch justify-between gap-4 rounded-xl bg-white p-4 shadow-sm md:flex-row md:items-center">
        <div className="relative w-full md:w-96">
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setBusqueda(nombre);
                setPage(1);
              }
            }}
            placeholder="Buscar por nombre o descripción…"
            className="w-full rounded-lg border border-[#D9D9D9] bg-[#F5F5F5] py-2 pr-12 pl-4 text-sm outline-none focus:border-[#A61E22]"
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
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold tracking-wider uppercase opacity-60">Estado:</label>
          <select
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value as '' | 'A' | 'I');
              setPage(1);
            }}
            className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm outline-none"
          >
            <option value="">Todos</option>
            <option value="A">Activas</option>
            <option value="I">Inactivas</option>
          </select>
        </div>
      </div>

      {/* Contenido */}
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
          {hayFiltros ? (
            <p className="text-lg font-semibold">No se encontraron registros</p>
          ) : (
            <>
              <p className="text-lg font-semibold">No existen categorías registradas.</p>
              <button
                onClick={abrirNuevo}
                className="mt-4 cursor-pointer rounded-xl bg-[#A61E22] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#7F1518] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A61E22]/50 active:scale-[0.99]"
              >
                Crear la primera
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Tabla desktop / scroll tablet */}
          <div className="hidden overflow-hidden rounded-xl bg-white shadow-sm md:block">
            <div className="max-h-[60vh] overflow-auto">
              <table className="w-full border-collapse text-left">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-[#F5F5F5] text-[11px] tracking-wider text-[#333333]/60 uppercase">
                    <th className="w-16 px-4 py-3 text-center">Orden</th>
                    <th className="px-6 py-3">Categoría</th>
                    <th className="px-6 py-3">Descripción</th>
                    <th className="px-6 py-3 text-center">Área</th>
                    <th className="px-6 py-3 text-center">Productos</th>
                    <th className="px-6 py-3 text-center">Estado</th>
                    <th className="w-44 px-6 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F5F5] text-sm">
                  {datos.map((cat) => (
                    <tr key={cat.id} className="transition-colors hover:bg-[#F5F5F5]">
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#333333]/10 text-sm font-bold text-[#7F1518]">
                          {cat.orden}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-[#7F1518]">{cat.nombre}</div>
                        <div className="text-[11px] tracking-wider text-[#333333]/50 uppercase">
                          ID: {cat.id}
                        </div>
                      </td>
                      <td className="max-w-xs px-6 py-4">
                        <p className="truncate text-sm text-[#333333]/70">{cat.descripcion || '—'}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="rounded bg-[#F5F5F5] px-2 py-1 text-xs font-semibold">
                          {cat.area}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold">{cat.productosAsociados} platos</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge estado={cat.estado} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            title="Editar categoría"
                            onClick={() => abrirEditar(cat)}
                            className="rounded-lg p-1.5 text-[#D4A017] transition-colors hover:bg-[#F5F5F5]"
                          >
                            <span className="material-symbols-outlined text-[19px]">edit</span>
                          </button>
                          <Toggle
                            activo={cat.estado === 'A'}
                            titulo={cat.estado === 'A' ? 'Desactivar en carta' : 'Activar en carta'}
                            onClick={() => void toggleEstado(cat)}
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
                Mostrando <strong>{datos.length}</strong> de <strong>{total}</strong> categorías
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="cursor-pointer rounded-lg bg-white px-3 py-1.5 shadow-sm transition-colors hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white dark:bg-white/10 dark:hover:bg-white/20"
                >
                  ← Anterior
                </button>
                <span>
                  Página {page} de {totalPaginas}
                </span>
                <button
                  disabled={page >= totalPaginas}
                  onClick={() => setPage((p) => p + 1)}
                  className="cursor-pointer rounded-lg bg-white px-3 py-1.5 shadow-sm transition-colors hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white dark:bg-white/10 dark:hover:bg-white/20"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          </div>

          {/* Cards móvil */}
          <div className="grid max-h-[70vh] grid-cols-1 gap-4 overflow-y-auto sm:grid-cols-2 md:hidden">
            {datos.map((cat) => (
              <article key={cat.id} className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-[#7F1518]">{cat.nombre}</h3>
                    <p className="text-xs text-[#333333]/50">
                      ID {cat.id} · Orden {cat.orden} · {cat.area}
                    </p>
                  </div>
                  <Badge estado={cat.estado} />
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-[#333333]/70">{cat.descripcion || '—'}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-bold">{cat.productosAsociados} platos</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => abrirEditar(cat)}
                      className="cursor-pointer rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm font-semibold transition-colors hover:bg-[#D9D9D9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A61E22]/50"
                    >
                      Editar
                    </button>
                    <Toggle
                      activo={cat.estado === 'A'}
                      titulo={cat.estado === 'A' ? 'Desactivar' : 'Activar'}
                      onClick={() => void toggleEstado(cat)}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 backdrop-blur-xs sm:p-4">
          <div className="flex max-h-screen w-full flex-col overflow-y-auto bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl">
            <div className="flex items-center justify-between bg-[#F5F5F5] px-6 py-4">
              <h2 className="text-xl font-bold text-[#7F1518]">
                {modal.editando ? 'Editar Categoría' : 'Nueva Categoría'}
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
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">
                    Nombre <span className="text-[#A61E22]">*</span>
                  </span>
                  <input
                    value={form.nombre}
                    maxLength={50}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Ej. Arroces Chaufa"
                    className="rounded-lg bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-[#A61E22]"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">
                    Área de despacho
                  </span>
                  <select
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value as AreaDespacho })}
                    className="rounded-lg bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none"
                  >
                    <option value="COCINA">COCINA</option>
                    <option value="BARRA">BARRA</option>
                    <option value="CAJA">CAJA</option>
                  </select>
                </label>
              </div>
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">
                  Descripción
                </span>
                <textarea
                  value={form.descripcion}
                  maxLength={100}
                  rows={3}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Tipos de platos y técnicas al wok…"
                  className="resize-none rounded-lg bg-[#F5F5F5] px-3.5 py-2 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-[#A61E22]"
                />
                <span className="text-right text-[11px] opacity-50">{form.descripcion.length}/100 (BD)</span>
              </label>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">
                    Orden en carta
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={form.orden}
                    onChange={(e) => setForm({ ...form, orden: Number(e.target.value) })}
                    className="rounded-lg bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none"
                  />
                </label>
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
                        {v === 'A' ? 'Activa' : 'Inactiva'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
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
                  <span>{guardando ? 'Guardando…' : 'Guardar Categoría'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmación desactivar con productos */}
      {confirmar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-[#7F1518]">Confirmar desactivación</h3>
            <p className="mt-2 text-sm text-[#333333]/70">
              <strong>{confirmar.nombre}</strong> tiene <strong>{confirmar.productosAsociados} platos</strong>{' '}
              asociados. Se ocultarán de la carta y la botonera hasta reactivarla. ¿Continuar?
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setConfirmar(null)}
                className="cursor-pointer rounded-xl bg-[#F5F5F5] px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-[#D9D9D9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A61E22]/50"
              >
                Cancelar
              </button>
              <button
                onClick={() => void toggleEstado(confirmar, true)}
                className="cursor-pointer rounded-xl bg-[#A61E22] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#7F1518] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A61E22]/50 active:scale-[0.99]"
              >
                Sí, desactivar
              </button>
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

function Badge({ estado }: { estado: 'A' | 'I' }) {
  return estado === 'A' ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#333333]/10 px-2.5 py-1 text-[11px] font-bold text-[#A61E22]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#F2C94C]" />
      Activa
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F5F5F5] px-2.5 py-1 text-[11px] font-semibold text-[#333333]/60">
      <span className="h-1.5 w-1.5 rounded-full bg-[#D9D9D9]" />
      Inactiva
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
