import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { PageHeader } from '../../../components/ui';
import { leerToken } from '../../auth/login/auth-service';
import { mensajeError } from '../../../shared/errors';
import { useToast } from '../../../shared/ui/use-toast';

type Estado = 'A' | 'I';
type ResourceKey = 'categorias' | 'unidades' | 'tipos-mesa';
type CrudValue = string | number | null;
type CrudRecord = { id: number; [key: string]: CrudValue | undefined };
type Campo = {
  key: string;
  label: string;
  kind?: 'text' | 'number' | 'select' | 'textarea';
  required?: boolean;
  step?: string;
  options?: { value: string; label: string }[];
};
type Recurso = {
  label: string;
  singular: string;
  endpoint: string;
  searchParam: string;
  campos: Campo[];
};

import { API_URL } from '../../../lib/api-url';

const API = API_URL;
const LIMIT = 20;
const RECURSOS: Record<ResourceKey, Recurso> = {
  categorias: {
    label: 'Categorías',
    singular: 'categoría',
    endpoint: 'categorias',
    searchParam: 'nombre',
    campos: [
      { key: 'nombre', label: 'Nombre', required: true },
      { key: 'descripcion', label: 'Descripción', kind: 'textarea' },
      {
        key: 'area',
        label: 'Área de despacho',
        kind: 'select',
        required: true,
        options: [{ value: 'COCINA', label: 'Cocina' }, { value: 'BARRA', label: 'Barra' }],
      },
      { key: 'orden', label: 'Orden', kind: 'number', required: true, step: '1' },
      {
        key: 'estado',
        label: 'Estado',
        kind: 'select',
        required: true,
        options: [{ value: 'A', label: 'Activa' }, { value: 'I', label: 'Inactiva' }],
      },
    ],
  },
  unidades: {
    label: 'Unidades',
    singular: 'unidad',
    endpoint: 'unidades',
    searchParam: 'buscar',
    campos: [
      { key: 'nombre', label: 'Nombre', required: true },
      { key: 'abreviatura', label: 'Abreviatura', required: true },
      { key: 'codigoSunat', label: 'Código SUNAT' },
      {
        key: 'estado',
        label: 'Estado',
        kind: 'select',
        required: true,
        options: [{ value: 'A', label: 'Activa' }, { value: 'I', label: 'Inactiva' }],
      },
    ],
  },
  'tipos-mesa': {
    label: 'Tipos de mesa',
    singular: 'tipo de mesa',
    endpoint: 'tipos-mesa',
    searchParam: 'buscar',
    campos: [
      { key: 'nombre', label: 'Nombre', required: true },
      { key: 'cargoServicio', label: 'Cargo por servicio (%)', kind: 'number', required: true, step: '0.01' },
      {
        key: 'estado',
        label: 'Estado',
        kind: 'select',
        required: true,
        options: [{ value: 'A', label: 'Activo' }, { value: 'I', label: 'Inactivo' }],
      },
    ],
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isCrudRecord(value: unknown): value is CrudRecord {
  return isRecord(value)
    && typeof value['id'] === 'number'
    && Object.values(value).every((item) => item === null || typeof item === 'string' || typeof item === 'number');
}

function headers(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${leerToken() ?? ''}`,
  };
}

async function leerRespuesta<T>(response: Response): Promise<T> {
  const body: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = isRecord(body) && typeof body['error'] === 'string' ? body['error'] : 'NETWORK_ERROR';
    throw new Error(message);
  }
  return body as T;
}

function payloadDeFormulario(key: ResourceKey, form: Record<string, string>): Record<string, unknown> {
  const estado = (form['estado'] || 'A') as Estado;
  if (key === 'categorias') {
    return {
      nombre: form['nombre']?.trim(),
      descripcion: form['descripcion']?.trim() ?? '',
      area: form['area'],
      orden: Number(form['orden'] || 0),
      estado,
    };
  }
  if (key === 'unidades') {
    return {
      nombre: form['nombre']?.trim(),
      abreviatura: form['abreviatura']?.trim(),
      codigoSunat: form['codigoSunat']?.trim() ?? '',
      estado,
    };
  }
  return {
    nombre: form['nombre']?.trim(),
    cargoServicio: Number(form['cargoServicio'] || 0),
    estado,
  };
}

export function AdminCrudPage() {
  const [recursoKey, setRecursoKey] = useState<ResourceKey>('categorias');
  const [filtrar, setFiltrar] = useState('');
  const [pagina, setPagina] = useState(1);
  const [filas, setFilas] = useState<CrudRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [edicion, setEdicion] = useState<CrudRecord | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const [filaParaCambiarEstado, setFilaParaCambiarEstado] = useState<CrudRecord | null>(null);
  const recurso = RECURSOS[recursoKey];
  const totalPaginas = Math.max(1, Math.ceil(total / LIMIT));

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const query = new URLSearchParams({ page: String(pagina), limit: String(LIMIT) });
      if (filtrar.trim()) query.set(recurso.searchParam, filtrar.trim());
      const body = await fetch(`${API}/${recurso.endpoint}?${query}`, { headers: headers() })
        .then(leerRespuesta<unknown>);
      if (!isRecord(body) || !Array.isArray(body['data']) || typeof body['total'] !== 'number') {
        throw new Error('RESPUESTA_INVALIDA');
      }
      const data = body['data'];
      if (!data.every(isCrudRecord)) throw new Error('RESPUESTA_INVALIDA');
      setFilas(data);
      setTotal(body['total']);
    } catch (e) {
      setError((e as Error).message || 'No se pudieron cargar los registros.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { void cargar(); }, [recursoKey, pagina, filtrar]);

  const estadisticas = useMemo(() => ({
    activas: filas.filter((fila) => fila['estado'] === 'A').length,
    inactivas: filas.filter((fila) => fila['estado'] === 'I').length,
  }), [filas]);

  const abrirCrear = () => {
    setEdicion(null);
    setForm(Object.fromEntries(recurso.campos.map((campo) => [
      campo.key,
      campo.key === 'estado' ? 'A' : campo.key === 'area' ? 'COCINA' : campo.key === 'orden' ? '0' : '',
    ])));
    setError(null);
    setModal(true);
  };

  const abrirEdicion = (fila: CrudRecord) => {
    setEdicion(fila);
    setForm(Object.fromEntries(recurso.campos.map((campo) => [
      campo.key,
      String(fila[campo.key] ?? (campo.key === 'estado' ? 'A' : '')),
    ])));
    setError(null);
    setModal(true);
  };

  const guardar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      const url = edicion
        ? `${API}/${recurso.endpoint}/${edicion.id}`
        : `${API}/${recurso.endpoint}`;
      await fetch(url, {
        method: edicion ? 'PUT' : 'POST',
        headers: headers(),
        body: JSON.stringify(payloadDeFormulario(recursoKey, form)),
      }).then(leerRespuesta<unknown>);
      setModal(false);
      setAviso(`${recurso.singular[0]?.toUpperCase()}${recurso.singular.slice(1)} ${edicion ? 'actualizada' : 'creada'} correctamente.`);
      await cargar();
    } catch (e) {
      setError((e as Error).message || 'No se pudo guardar el registro.');
    } finally {
      setGuardando(false);
    }
  };

  const abrirCambiarEstado = (fila: CrudRecord) => {
    setFilaParaCambiarEstado(fila);
  };

  const cerrarCambiarEstado = () => {
    setFilaParaCambiarEstado(null);
  };

  const ejecutarCambiarEstado = async () => {
    if (!filaParaCambiarEstado) return;
    const fila = filaParaCambiarEstado;
    const nuevoEstado: Estado = fila['estado'] === 'A' ? 'I' : 'A';
    setError(null);
    try {
      await fetch(`${API}/${recurso.endpoint}/${fila.id}/estado`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ estado: nuevoEstado, confirmar: true }),
      }).then(leerRespuesta<unknown>);
      setAviso(`Registro ${nuevoEstado === 'A' ? 'activado' : 'desactivado'} correctamente.`);
      await cargar();
      cerrarCambiarEstado();
      toast({
        title: 'Estado actualizado',
        description: `Registro ${nuevoEstado === 'A' ? 'activado' : 'desactivado'} correctamente.`,
        variant: 'success',
      });
    } catch (e) {
      const err = e as Error & { error?: string };
      setError(mensajeError(err.error) || 'No se pudo cambiar el estado.');
    } finally {
      cerrarCambiarEstado();
    }
  };

  return (
    <>
      {filaParaCambiarEstado && (
        <div
          role="presentation"
          onMouseDown={(event) => { if (event.target === event.currentTarget) cerrarCambiarEstado(); }}
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,.65)', display: 'grid', placeItems: 'center', padding: 16 }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="cambiar-estado-titulo" className="y-panel" style={{ width: 'min(420px, 90%)', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12, marginBottom: 16 }}>
              <div>
                <h2 id="cambiar-estado-titulo" style={{ margin: 0 }}>Cambiar estado</h2>
                <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 13 }}>
                  {String(filaParaCambiarEstado['nombre'] ?? '#' + filaParaCambiarEstado.id)}
                </p>
              </div>
              <button className="btn btn-ghost" onClick={cerrarCambiarEstado} aria-label="Cerrar">Cerrar</button>
            </div>
            <p style={{ margin: '0 0 16px', color: 'var(--muted)' }}>
              ¿Estás seguro de que quieres {filaParaCambiarEstado['estado'] === 'A' ? 'desactivar' : 'activar'} este registro?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" onClick={cerrarCambiarEstado} className="btn btn-ghost">
                Cancelar
              </button>
              <button type="button" onClick={ejecutarCambiarEstado} className="btn" style={{ background: '#ef4444', color: '#fff' }}>
                {filaParaCambiarEstado['estado'] === 'A' ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </section>
        </div>
      )}

    <div className="y-shell mx-auto max-w-7xl px-4 py-8 pb-32">
      <PageHeader title="CRUD Genérico" sub="Gestiona datos maestros desde una vista unificada." />

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-[#7F1518] to-[#A61E22] p-5 text-white shadow-sm sm:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">Registros visibles</p>
          <p className="mt-2 text-3xl font-bold">{total}</p>
          <p className="mt-1 text-sm text-white/75">{recurso.label} · página {pagina} de {totalPaginas}</p>
        </div>
        <div className="rounded-2xl border border-[#E8E1DB] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#77716C]">Activos en esta página</p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">{estadisticas.activas}</p>
          <p className="mt-1 text-sm text-[#77716C]">Disponibles para su uso</p>
        </div>
        <div className="rounded-2xl border border-[#E8E1DB] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#77716C]">Inactivos en esta página</p>
          <p className="mt-2 text-3xl font-bold text-[#77716C]">{estadisticas.inactivas}</p>
          <p className="mt-1 text-sm text-[#77716C]">Se conservan para el historial</p>
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-3xl border border-[#E8E1DB] bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-[#F0EBE7] bg-[#FFFCFA] p-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#77716C]">
              Tabla maestra
              <select
                value={recursoKey}
                onChange={(event) => {
                  setRecursoKey(event.target.value as ResourceKey);
                  setPagina(1);
                  setAviso(null);
                }}
                className="min-w-52 rounded-xl border border-[#E8E1DB] bg-white px-3 py-2.5 text-sm font-medium normal-case text-[#333] outline-none focus:border-[#A61E22] focus:ring-2 focus:ring-[#A61E22]/15"
              >
                {Object.entries(RECURSOS).map(([key, item]) => (
                  <option key={key} value={key}>{item.label}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#77716C]">
              Buscar
              <input
                type="search"
                value={filtrar}
                onChange={(event) => { setFiltrar(event.target.value); setPagina(1); }}
                placeholder={`Buscar ${recurso.label.toLowerCase()}...`}
                className="min-w-60 rounded-xl border border-[#E8E1DB] bg-white px-3 py-2.5 text-sm font-normal normal-case text-[#333] outline-none focus:border-[#A61E22] focus:ring-2 focus:ring-[#A61E22]/15"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={abrirCrear}
            className="rounded-xl bg-[#A61E22] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#7F1518]"
          >
            + Crear {recurso.singular}
          </button>
        </div>

        {aviso && (
          <div role="status" className="mx-5 mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {aviso}
            <button type="button" className="ml-3 font-semibold underline" onClick={() => setAviso(null)}>Cerrar</button>
          </div>
        )}
        {error && !modal && (
          <div role="alert" className="mx-5 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {cargando ? (
          <div className="p-12 text-center text-sm text-[#77716C]">Cargando datos maestros…</div>
        ) : filas.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-semibold text-[#514A45]">No se encontraron registros</p>
            <p className="mt-1 text-sm text-[#77716C]">Ajusta la búsqueda o crea el primer registro.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-[#FAF6F2] text-xs uppercase tracking-wider text-[#77716C]">
                <tr>
                  <th className="px-5 py-4">ID</th>
                  {recurso.campos.filter((campo) => campo.key !== 'estado').map((campo) => (
                    <th key={campo.key} className="px-5 py-4">{campo.label}</th>
                  ))}
                  <th className="px-5 py-4">Estado</th>
                  <th className="px-5 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EBE7]">
                {filas.map((fila) => (
                  <tr key={fila.id} className="transition hover:bg-[#FFFCFA]">
                    <td className="px-5 py-4 font-mono text-xs text-[#77716C]">#{fila.id}</td>
                    {recurso.campos.filter((campo) => campo.key !== 'estado').map((campo) => (
                      <td key={campo.key} className="max-w-64 px-5 py-4 text-[#333]">
                        {campo.key === 'area'
                          ? (fila[campo.key] === 'BARRA' ? 'Barra' : 'Cocina')
                          : campo.key === 'cargoServicio'
                            ? `${Number(fila[campo.key] ?? 0).toFixed(2)}%`
                            : (fila[campo.key] ?? '—')}
                      </td>
                    ))}
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${fila['estado'] === 'A' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                        {fila['estado'] === 'A' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => abrirEdicion(fila)}
                          className="rounded-lg border border-[#E8E1DB] px-3 py-2 text-xs font-semibold text-[#514A45] transition hover:bg-[#FAF6F2]"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => void abrirCambiarEstado(fila)}
                          className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${fila['estado'] === 'A' ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                        >
                          {fila['estado'] === 'A' ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-[#F0EBE7] bg-[#FFFCFA] px-5 py-4">
          <span className="text-sm text-[#77716C]">{total} registros</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#77716C]">Página {pagina} de {totalPaginas}</span>
            <button
              type="button"
              disabled={pagina <= 1 || cargando}
              onClick={() => setPagina((actual) => Math.max(1, actual - 1))}
              className="rounded-lg border border-[#E8E1DB] bg-white px-3 py-2 text-sm font-semibold text-[#514A45] disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={pagina >= totalPaginas || cargando}
              onClick={() => setPagina((actual) => Math.min(totalPaginas, actual + 1))}
              className="rounded-lg border border-[#E8E1DB] bg-white px-3 py-2 text-sm font-semibold text-[#514A45] disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      </section>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <form onSubmit={(event) => void guardar(event)} className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="bg-gradient-to-r from-[#7F1518] to-[#A61E22] px-6 py-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">Datos maestros</p>
              <h2 className="mt-1 text-2xl font-bold">{edicion ? 'Editar' : 'Crear'} {recurso.singular}</h2>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-2">
              {recurso.campos.map((campo) => (
                <label key={campo.key} className={`grid gap-2 text-xs font-bold uppercase tracking-wider text-[#77716C] ${campo.kind === 'textarea' ? 'sm:col-span-2' : ''}`}>
                  {campo.label}{campo.required ? ' *' : ''}
                  {campo.kind === 'select' ? (
                    <select
                      required={campo.required}
                      value={form[campo.key] ?? ''}
                      onChange={(event) => setForm((actual) => ({ ...actual, [campo.key]: event.target.value }))}
                      className="rounded-xl border border-[#E8E1DB] bg-white px-3 py-3 text-sm font-normal normal-case text-[#333] outline-none focus:border-[#A61E22] focus:ring-2 focus:ring-[#A61E22]/15"
                    >
                      {(campo.options ?? []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  ) : campo.kind === 'textarea' ? (
                    <textarea
                      value={form[campo.key] ?? ''}
                      onChange={(event) => setForm((actual) => ({ ...actual, [campo.key]: event.target.value }))}
                      rows={3}
                      className="resize-y rounded-xl border border-[#E8E1DB] px-3 py-3 text-sm font-normal normal-case text-[#333] outline-none focus:border-[#A61E22] focus:ring-2 focus:ring-[#A61E22]/15"
                    />
                  ) : (
                    <input
                      type={campo.kind ?? 'text'}
                      required={campo.required}
                      step={campo.step}
                      min={campo.kind === 'number' ? '0' : undefined}
                      value={form[campo.key] ?? ''}
                      onChange={(event) => setForm((actual) => ({ ...actual, [campo.key]: event.target.value }))}
                      className="rounded-xl border border-[#E8E1DB] px-3 py-3 text-sm font-normal normal-case text-[#333] outline-none focus:border-[#A61E22] focus:ring-2 focus:ring-[#A61E22]/15"
                    />
                  )}
                </label>
              ))}
              {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:col-span-2">{error}</p>}
            </div>
            <div className="flex justify-end gap-3 border-t border-[#F0EBE7] px-6 py-4">
              <button type="button" onClick={() => setModal(false)} className="rounded-xl border border-[#E8E1DB] px-5 py-3 text-sm font-semibold text-[#514A45] hover:bg-[#FAF6F2]">
                Cancelar
              </button>
              <button type="submit" disabled={guardando} className="rounded-xl bg-[#A61E22] px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#7F1518] disabled:cursor-not-allowed disabled:opacity-50">
                {guardando ? 'Guardando…' : edicion ? 'Guardar cambios' : 'Crear registro'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
    </>
  );
}
