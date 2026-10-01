import { useEffect, useState } from 'react';
import type { Maestro } from '../../../services/maestros';
import { DistritoPicker } from '../../../components/distrito-picker';
import {
  actualizarCliente,
  cambiarEstadoCliente,
  crearCliente,
  listarClientes,
  listarDistritos,
  listarTiposIdentidad,
} from './clientes-service';
import type { Cliente, ClienteForm, Genero, TipoCliente, TipoDocPersona } from './clientes-types';
import { GENERO_LABELS } from '../personal/personal-types';

const LIMITE = 20;

const VACIO: ClienteForm = {
  tipo: 'N',
  nombres: '',
  apPaterno: '',
  apMaterno: '',
  tipoDoc: 'DNI',
  dni: '',
  fNacimiento: '',
  genero: '',
  razonSocial: '',
  nombreComercial: '',
  ruc: '',
  telefono: '',
  correo: '',
  distritoId: 0,
  direccion: '',
  codigoCliente: '',
};

/** Normaliza tipo-doc de BD (nombre o abreviatura) al valor del form. */
function tipoDocForm(valor: string): TipoDocPersona {
  const v = valor.trim().toUpperCase();
  if (v === 'CE' || v === 'CARNET EXTRANJERIA') {
    return 'CE';
  }
  if (v === 'PAS' || v === 'PASAPORTE') {
    return 'PASAPORTE';
  }
  return 'DNI';
}

/** Opciones de tipo-doc del endpoint, solo persona natural (sin RUC). */
function tiposPersona(tipos: Maestro[]): { valor: TipoDocPersona; label: string }[] {
  const out: { valor: TipoDocPersona; label: string }[] = [];
  for (const t of tipos) {
    const abrev = (t.abreviatura ?? '').trim().toUpperCase();
    if (abrev === 'DNI') {
      out.push({ valor: 'DNI', label: t.nombre });
    } else if (abrev === 'CE') {
      out.push({ valor: 'CE', label: t.nombre });
    } else if (abrev === 'PAS') {
      out.push({ valor: 'PASAPORTE', label: t.nombre });
    }
  }
  return out;
}

/** /admin/clientes — ABM de clientes Natural/Empresa (clientes.md). */
export function ClientesPage() {
  const [page, setPage] = useState(1);
  const [buscar, setBuscar] = useState('');
  const [texto, setTexto] = useState('');
  const [tab, setTab] = useState<'' | TipoCliente>( '');
  const [estado, setEstado] = useState<'' | 'A' | 'I'>('');
  const [orden, setOrden] = useState<'puntos' | 'alpha' | 'recientes'>('recientes');
  const [datos, setDatos] = useState<Cliente[]>([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<null | { editando: Cliente | null }>(null);
  const [form, setForm] = useState<ClienteForm>(VACIO);
  const [formError, setFormError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [distritos, setDistritos] = useState<Maestro[]>([]);
  const [cargandoDistritos, setCargandoDistritos] = useState(true);
  const [errorDistritos, setErrorDistritos] = useState<string | null>(null);
  const [tiposDoc, setTiposDoc] = useState<Maestro[]>([]);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await listarClientes({ page, limit: LIMITE, buscar, tipo: tab, estado, orden });
      setDatos(res.data);
      setTotal(res.total);
    } catch {
      setError('No fue posible cargar los clientes.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, buscar, tab, estado, orden]);

  const recargarDistritos = async () => {
    setCargandoDistritos(true);
    setErrorDistritos(null);
    try {
      const [d, t] = await Promise.all([listarDistritos(), listarTiposIdentidad()]);
      setDistritos(d);
      setTiposDoc(t);
    } catch {
      setErrorDistritos('No fue posible cargar los distritos.');
    } finally {
      setCargandoDistritos(false);
    }
  };

  useEffect(() => {
    void recargarDistritos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPaginas = Math.max(1, Math.ceil(total / LIMITE));
  const naturales = datos.filter((d) => d.tipo === 'N').length;
  const empresas = datos.filter((d) => d.tipo === 'J').length;
  const puntos = datos.reduce((acc, d) => acc + d.puntos, 0);

  const abrirNuevo = () => {
    setForm(VACIO);
    setFormError(null);
    setModal({ editando: null });
  };

  const abrirEditar = (c: Cliente) => {
    setForm({
      ...VACIO,
      tipo: c.tipo,
      nombres: c.tipo === 'N' ? c.nombres : '',
      apPaterno: c.tipo === 'N' ? c.apPaterno : '',
      apMaterno: c.tipo === 'N' ? c.apMaterno : '',
      tipoDoc: c.tipo === 'N' ? tipoDocForm(c.tipoDoc) : 'DNI',
      dni: c.tipo === 'N' ? c.documento : '',
      fNacimiento: c.tipo === 'N' ? (c.fNacimiento ?? '').slice(0, 10) : '',
      genero: c.tipo === 'N' ? ((c.genero ?? '') as ClienteForm['genero']) : '',
      razonSocial: c.tipo === 'J' ? c.nombre : '',
      ruc: c.tipo === 'J' ? c.documento : '',
      telefono: c.telefono,
      correo: c.correo ?? '',
      distritoId: c.distritoId ?? 0,
      direccion: c.direccion ?? '',
      codigoCliente: c.codigoCliente ?? '',
    });
    setFormError(null);
    setModal({ editando: c });
  };

  const validar = (): string | null => {
    if (form.tipo === 'N') {
      if (!form.nombres.trim()) {
        return 'Nombres es obligatorio.';
      }
      const doc = form.dni.trim();
      if (form.tipoDoc === 'DNI' && !/^\d{8}$/.test(doc)) {
        return 'DNI de 8 dígitos.';
      }
      if (form.tipoDoc === 'CE' && !/^\d{9}$/.test(doc)) {
        return 'Carnet de extranjería de 9 dígitos.';
      }
      if (form.tipoDoc === 'PASAPORTE' && !/^[A-Za-z0-9]{1,15}$/.test(doc)) {
        return 'Pasaporte de hasta 15 caracteres.';
      }
      if (!/^\d{9}$/.test(form.telefono.trim())) {
        return 'Celular de 9 dígitos.';
      }
    } else {
      if (!form.razonSocial.trim()) {
        return 'Razón social es obligatoria.';
      }
      if (!/^\d{11}$/.test(form.ruc.trim())) {
        return 'RUC de 11 dígitos.';
      }
      if (!form.telefono.trim()) {
        return 'Teléfono es obligatorio.';
      }
    }
    if (!form.correo.trim()) {
      return 'Correo es obligatorio.';
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.correo.trim())) {
      return 'Correo inválido.';
    }
    if (!form.distritoId) {
      return 'Seleccione el distrito.';
    }
    if (form.fNacimiento) {
      const hoy = new Date().toISOString().slice(0, 10);
      if (form.fNacimiento > hoy) {
        return 'Nacimiento no puede ser futura.';
      }
    }
    return null;
  };

  const guardar = async () => {
    const v = validar();
    if (v) {
      setFormError(v);
      return;
    }
    setGuardando(true);
    setFormError(null);
    try {
      if (modal?.editando) {
        await actualizarCliente(modal.editando.id, form);
      } else {
        await crearCliente(form);
      }
      setModal(null);
      await cargar();
    } catch (e) {
      const codigo = (e as Error).message;
      setFormError(
        codigo === 'YA_EXISTE'
          ? 'Ya existe un cliente con ese documento.'
          : 'No se pudo guardar. Reintente.',
      );
    } finally {
      setGuardando(false);
    }
  };

  const toggleEstado = async (c: Cliente) => {
    try {
      await cambiarEstadoCliente(c.id, c.estado === 'A' ? 'I' : 'A');
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
            <span className="font-bold text-[#A61E22]">Clientes</span>
          </nav>
          <h1 className="mt-1 font-[Newsreader] text-3xl font-medium text-[#7F1518]">
            Gestión y Fidelización de Clientes
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[#333333]/70">
            Directorio de comensales, corporativos y Club Dinastía.
          </p>
        </div>
        <button
          onClick={abrirNuevo}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-[#A61E22] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#7F1518]"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          <span>Nuevo Cliente</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi titulo="Total Clientes" valor={String(total)} detalle="Registrados en sistema" icono="groups" />
        <Kpi titulo="Naturales" valor={String(naturales)} detalle="Comensales y delivery" icono="person" />
        <Kpi titulo="Empresas" valor={String(empresas)} detalle="Facturación RUC" icono="domain" />
        <Kpi titulo="Puntos Dinastía" valor={String(puntos)} detalle="Acumulados visibles" icono="stars" />
      </div>

      <div className="flex gap-2 overflow-x-auto rounded-xl bg-white p-3 shadow-sm">
        {(
          [
            { v: '', label: 'Todos' },
            { v: 'N', label: 'Persona Natural' },
            { v: 'J', label: 'Empresa / RUC' },
          ] as { v: '' | TipoCliente; label: string }[]
        ).map((t) => (
          <button
            key={t.label}
            onClick={() => {
              setTab(t.v);
              setPage(1);
            }}
            className={`shrink-0 cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t.v
                ? 'bg-[#A61E22] text-white shadow-sm'
                : 'bg-[#F5F5F5] hover:bg-[#D9D9D9]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 items-center gap-3 rounded-xl bg-white p-4 shadow-sm md:grid-cols-12">
        <div className="relative md:col-span-6">
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setBuscar(texto);
                setPage(1);
              }
            }}
            placeholder="Nombre, DNI/RUC o correo…"
            className="w-full rounded-xl bg-[#F5F5F5] py-2.5 pr-12 pl-4 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-[#A61E22]"
          />
          <button
            type="button"
            aria-label="Buscar"
            onClick={() => {
              setBuscar(texto);
              setPage(1);
            }}
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg bg-[#A61E22] p-1.5 text-white transition-colors hover:bg-[#7F1518]"
          >
            <span className="material-symbols-outlined text-[18px]">search</span>
          </button>
        </div>
        <select
          value={estado}
          onChange={(e) => {
            setEstado(e.target.value as '' | 'A' | 'I');
            setPage(1);
          }}
          className="cursor-pointer rounded-xl bg-[#F5F5F5] px-3 py-2.5 text-sm outline-none md:col-span-3"
        >
          <option value="">Estado: Todos</option>
          <option value="A">Solo Activos</option>
          <option value="I">Inactivos</option>
        </select>
        <select
          value={orden}
          onChange={(e) => setOrden(e.target.value as 'puntos' | 'alpha' | 'recientes')}
          className="cursor-pointer rounded-xl bg-[#F5F5F5] px-3 py-2.5 text-sm outline-none md:col-span-3"
        >
          <option value="recientes">Últimos</option>
          <option value="puntos">Mayor Puntaje</option>
          <option value="alpha">Alfabético A-Z</option>
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
          <p className="text-lg font-semibold">No existen clientes registrados.</p>
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
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Documento</th>
                    <th className="px-4 py-3">Teléfono</th>
                    <th className="px-4 py-3">Correo</th>
                    <th className="px-4 py-3">Distrito</th>
                    <th className="px-4 py-3 text-center">Puntos</th>
                    <th className="px-4 py-3 text-center">Estado</th>
                    <th className="w-32 px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F5F5] text-sm">
                  {datos.map((c) => (
                    <tr key={c.id} className="transition-colors hover:bg-[#F5F5F5]">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F2C94C]/40 text-sm font-bold text-[#7F1518]">
                            {c.nombre.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-semibold">{c.nombre}</div>
                            <div className="text-xs text-[#333333]/50">
                              {c.tipo === 'N' ? 'Persona Natural' : 'Empresa / RUC'}
                              {c.tipo === 'J' && c.nombreComercial ? ` · ${c.nombreComercial}` : ''}
                              {c.codigoCliente ? (
                                <span className="ml-1 font-mono text-[11px] text-[#A61E22]">{c.codigoCliente}</span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-mono">{c.documento}</div>
                        <div className="text-[11px] tracking-wider text-[#333333]/50 uppercase">{c.tipoDoc}</div>
                      </td>
                      <td className="px-4 py-4 font-mono whitespace-nowrap">{c.telefono || '—'}</td>
                      <td className="max-w-[200px] px-4 py-4">
                        <div className="truncate">{c.correo || '—'}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded bg-[#F5F5F5] px-2 py-0.5 text-xs font-medium">
                          {c.distrito || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center font-bold text-[#D4A017]">{c.puntos} pts</td>
                      <td className="px-4 py-4 text-center">
                        {c.estado === 'A' ? (
                          <span className="rounded-full bg-[#22C55E]/15 px-2.5 py-1 text-[11px] font-bold text-[#22C55E]">
                            Activo
                          </span>
                        ) : (
                          <span className="rounded-full bg-[#D9D9D9]/40 px-2.5 py-1 text-[11px] font-bold text-[#333333]/60">
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            title="Editar ficha"
                            onClick={() => abrirEditar(c)}
                            className="rounded-lg p-1.5 text-[#D4A017] transition-colors hover:bg-[#F5F5F5]"
                          >
                            <span className="material-symbols-outlined text-[19px]">edit</span>
                          </button>
                          <Toggle
                            activo={c.estado === 'A'}
                            titulo={c.estado === 'A' ? 'Desactivar' : 'Activar'}
                            onClick={() => void toggleEstado(c)}
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
                Mostrando <strong>{datos.length}</strong> de <strong>{total}</strong> clientes
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

          <div className="grid max-h-[70vh] grid-cols-1 gap-4 overflow-y-auto sm:grid-cols-2 md:hidden">
            {datos.map((c) => (
              <article key={c.id} className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-[#7F1518]">{c.nombre}</h3>
                    <p className="font-mono text-xs text-[#333333]/50">
                      {c.tipoDoc}: {c.documento}
                      {c.codigoCliente ? ` · ${c.codigoCliente}` : ''}
                    </p>
                  </div>
                  {c.estado === 'A' ? (
                    <span className="rounded-full bg-[#22C55E]/15 px-2 py-0.5 text-[11px] font-bold text-[#22C55E]">
                      Activo
                    </span>
                  ) : (
                    <span className="rounded-full bg-[#D9D9D9]/40 px-2 py-0.5 text-[11px] font-bold text-[#333333]/60">
                      Inactivo
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-[#333333]/70">
                  {c.telefono} · {c.puntos} pts
                </p>
                <div className="mt-3 flex items-center justify-end gap-2">
                  <button
                    onClick={() => abrirEditar(c)}
                    className="cursor-pointer rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm font-semibold transition-colors hover:bg-[#D9D9D9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A61E22]/50"
                  >
                    Editar
                  </button>
                  <Toggle
                    activo={c.estado === 'A'}
                    titulo={c.estado === 'A' ? 'Desactivar' : 'Activar'}
                    onClick={() => void toggleEstado(c)}
                  />
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 backdrop-blur-xs sm:p-4">
          <div className="flex max-h-screen w-full flex-col overflow-y-auto bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl">
            <div className="flex items-center justify-between bg-gradient-to-r from-[#7F1518] to-[#A61E22] px-6 py-4 text-white">
              <h2 className="text-xl font-bold">
                {modal.editando ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h2>
              <button
                onClick={() => setModal(null)}
                aria-label="Cerrar"
                className="rounded-lg p-2 transition-colors hover:bg-white/10"
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
              {!modal.editando && (
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#F5F5F5] p-1">
                  {(['N', 'J'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, tipo: t })}
                      className={`cursor-pointer rounded-lg py-2.5 text-sm font-bold transition-all ${
                        form.tipo === t
                          ? 'bg-white text-[#A61E22] shadow-sm'
                          : 'text-[#333333]/60 hover:bg-white/60 hover:text-[#333333]'
                      }`}
                    >
                      {t === 'N' ? 'Persona Natural' : 'Empresa (RUC)'}
                    </button>
                  ))}
                </div>
              )}
              {form.tipo === 'N' ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                  <label className="flex flex-col gap-1.5 md:col-span-8">
                    <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">
                      Nombres y Apellidos *
                    </span>
                    <input
                      value={form.nombres}
                      maxLength={80}
                      onChange={(e) => setForm({ ...form, nombres: e.target.value })}
                      placeholder="Ej. Eduardo Chang Navarro"
                      className="rounded-xl bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-[#A61E22]"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 md:col-span-4">
                    <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Tipo Doc.</span>
                    <select
                      value={form.tipoDoc}
                      disabled={!!modal.editando || cargandoDistritos}
                      onChange={(e) => setForm({ ...form, tipoDoc: e.target.value as ClienteForm['tipoDoc'] })}
                      className="rounded-xl bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none disabled:opacity-60"
                    >
                      {tiposPersona(tiposDoc).map((t) => (
                        <option key={t.valor} value={t.valor}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5 md:col-span-4">
                    <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">
                      {form.tipoDoc === 'DNI' ? 'DNI (8)' : form.tipoDoc === 'CE' ? 'CE (9)' : 'Pasaporte'} *
                    </span>
                    <input
                      value={form.dni}
                      maxLength={15}
                      inputMode={form.tipoDoc === 'PASAPORTE' ? 'text' : 'numeric'}
                      disabled={!!modal.editando}
                      onChange={(e) => setForm({ ...form, dni: e.target.value })}
                      placeholder={form.tipoDoc === 'DNI' ? '48291049' : form.tipoDoc === 'CE' ? '001234567' : 'AB123456'}
                      className="rounded-xl bg-[#F5F5F5] px-3.5 py-2.5 font-mono text-sm outline-none focus:bg-white focus:ring-1 focus:ring-[#A61E22] disabled:opacity-60"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 md:col-span-4">
                    <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">F. Nacimiento</span>
                    <input
                      type="date"
                      value={form.fNacimiento}
                      onChange={(e) => setForm({ ...form, fNacimiento: e.target.value })}
                      className="rounded-xl bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 md:col-span-4">
                    <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Género</span>
                    <select
                      value={form.genero}
                      onChange={(e) => setForm({ ...form, genero: e.target.value as ClienteForm['genero'] })}
                      className="rounded-xl bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none"
                    >
                      <option value="">—</option>
                      {(Object.keys(GENERO_LABELS) as Genero[]).map((g) => (
                        <option key={g} value={g}>
                          {GENERO_LABELS[g]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5 md:col-span-6">
                    <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">
                      Ap. Paterno
                    </span>
                    <input
                      value={form.apPaterno}
                      maxLength={80}
                      onChange={(e) => setForm({ ...form, apPaterno: e.target.value })}
                      className="rounded-xl bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 md:col-span-6">
                    <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">
                      Ap. Materno
                    </span>
                    <input
                      value={form.apMaterno}
                      maxLength={80}
                      onChange={(e) => setForm({ ...form, apMaterno: e.target.value })}
                      className="rounded-xl bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none"
                    />
                  </label>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                  <label className="flex flex-col gap-1.5 md:col-span-7">
                    <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">
                      Razón Social *
                    </span>
                    <input
                      value={form.razonSocial}
                      maxLength={140}
                      onChange={(e) => setForm({ ...form, razonSocial: e.target.value })}
                      placeholder="Ej. Inversiones Cantón S.A.C."
                      className="rounded-xl bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-[#A61E22]"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 md:col-span-5">
                    <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">RUC (11) *</span>
                    <input
                      value={form.ruc}
                      maxLength={11}
                      inputMode="numeric"
                      disabled={!!modal.editando}
                      onChange={(e) => setForm({ ...form, ruc: e.target.value })}
                      placeholder="20601928371"
                      className="rounded-xl bg-[#F5F5F5] px-3.5 py-2.5 font-mono text-sm outline-none focus:bg-white focus:ring-1 focus:ring-[#A61E22] disabled:opacity-60"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 md:col-span-12">
                    <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">
                      Nombre comercial
                    </span>
                    <input
                      value={form.nombreComercial}
                      maxLength={140}
                      onChange={(e) => setForm({ ...form, nombreComercial: e.target.value })}
                      placeholder="Ej. Chifa Yemheng"
                      className="rounded-xl bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-[#A61E22]"
                    />
                  </label>
                </div>
              )}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">
                    Teléfono {form.tipo === 'N' ? '(9 dígitos) *' : '*'}
                  </span>
                  <input
                    value={form.telefono}
                    maxLength={15}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    placeholder={form.tipo === 'N' ? '998 765 432' : '+51 (01) 441-2090'}
                    className="rounded-xl bg-[#F5F5F5] px-3.5 py-2.5 font-mono text-sm outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Correo *</span>
                  <input
                    value={form.correo}
                    maxLength={50}
                    onChange={(e) => setForm({ ...form, correo: e.target.value })}
                    placeholder="cliente@ejemplo.com"
                    className="rounded-xl bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Dirección</span>
                  <input
                    value={form.direccion}
                    maxLength={100}
                    onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                    placeholder="Av. Aviación 2890, Dpto 402"
                    className="rounded-xl bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Código</span>
                  <input
                    value={form.codigoCliente}
                    maxLength={15}
                    onChange={(e) => setForm({ ...form, codigoCliente: e.target.value })}
                    placeholder="CLI-0001"
                    className="rounded-xl bg-[#F5F5F5] px-3.5 py-2.5 font-mono text-sm outline-none"
                  />
                </label>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Distrito *</span>
                  <DistritoPicker
                    value={form.distritoId}
                    onChange={(id) => setForm({ ...form, distritoId: id })}
                    distritos={distritos}
                    cargando={cargandoDistritos}
                    error={errorDistritos}
                    onReintentar={() => void recargarDistritos()}
                  />
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
                  <span>{guardando ? 'Guardando…' : 'Guardar Cliente'}</span>
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
