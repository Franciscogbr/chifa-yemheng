import { useEffect, useState } from 'react';
import {
  actualizarEmpleado,
  cambiarEstadoEmpleado,
  crearEmpleado,
  listarCargos,
  listarContratos,
  listarDistritos,
  listarPersonal,
  listarTiposIdentidad,
} from './personal-service';
import { GENERO_LABELS } from './personal-types';
import type { Genero, Personal, PersonalForm } from './personal-types';
import type { Maestro } from '../../../services/maestros';
import { DistritoPicker } from '../../../components/distrito-picker';

const LIMITE = 20;

const VACIO: PersonalForm = {
  nombres: '',
  apPaterno: '',
  apMaterno: '',
  tipoDoc: 'DNI',
  documento: '',
  telefono: '',
  correo: '',
  direccion: '',
  distritoId: 0,
  fNacimiento: '',
  genero: '',
  cargoId: 0,
  contratoId: 0,
  turno: '',
  fondoPension: '',
  nHijos: null,
  essalud: '',
  fIngreso: '',
  fCese: '',
  sueldo: 0,
};

/** Normaliza tipo-doc de BD (nombre o abreviatura) al valor del form. */
function tipoDocForm(valor: string): PersonalForm['tipoDoc'] {
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
function tiposPersona(tipos: Maestro[]): { valor: PersonalForm['tipoDoc']; label: string }[] {
  const out: { valor: PersonalForm['tipoDoc']; label: string }[] = [];
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

/** /admin/personal — ABM de personal (recursos-humanos.md). Solo ADMIN/GERENTE. */
export function PersonalPage() {
  const [page, setPage] = useState(1);
  const [buscar, setBuscar] = useState('');
  const [texto, setTexto] = useState('');
  const [cargo, setCargo] = useState<number | ''>('');
  const [turno, setTurno] = useState('');
  const [estado, setEstado] = useState<'' | 'A' | 'I'>('');
  const [datos, setDatos] = useState<Personal[]>([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [distritos, setDistritos] = useState<Maestro[]>([]);
  const [cargos, setCargos] = useState<Maestro[]>([]);
  const [contratos, setContratos] = useState<Maestro[]>([]);
  const [tiposDoc, setTiposDoc] = useState<Maestro[]>([]);
  const [cargandoMaestros, setCargandoMaestros] = useState(true);
  const [errorMaestros, setErrorMaestros] = useState<string | null>(null);
  const [modal, setModal] = useState<null | { editando: Personal | null }>(null);
  const [form, setForm] = useState<PersonalForm>(VACIO);
  const [formError, setFormError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await listarPersonal({ page, limit: LIMITE, buscar, cargo, turno, estado });
      setDatos(res.data);
      setTotal(res.total);
    } catch {
      setError('No fue posible cargar el personal.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, buscar, cargo, turno, estado]);

  const recargarMaestros = async () => {
    setCargandoMaestros(true);
    setErrorMaestros(null);
    try {
      const [d, c, ct, t] = await Promise.all([
        listarDistritos(),
        listarCargos(),
        listarContratos(),
        listarTiposIdentidad(),
      ]);
      setDistritos(d);
      setCargos(c);
      setContratos(ct);
      setTiposDoc(t);
    } catch {
      setErrorMaestros('No fue posible cargar las listas (distritos, cargos, contratos, documentos).');
    } finally {
      setCargandoMaestros(false);
    }
  };

  useEffect(() => {
    void recargarMaestros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPaginas = Math.max(1, Math.ceil(total / LIMITE));
  const cocina = datos.filter((d) => d.area === 'Cocina').length;
  const salon = datos.filter((d) => d.area === 'Salón' || d.area === 'Administración').length;

  const abrirNuevo = () => {
    setForm(VACIO);
    setFormError(null);
    setModal({ editando: null });
  };

  const abrirEditar = (p: Personal) => {
    setForm({
      ...VACIO,
      nombres: p.nombres,
      apPaterno: p.apPaterno,
      apMaterno: p.apMaterno,
      tipoDoc: tipoDocForm(p.tipoDoc),
      documento: p.documento,
      telefono: p.telefono,
      correo: p.correo ?? '',
      direccion: p.direccion ?? '',
      distritoId: p.distritoId ?? 0,
      fNacimiento: (p.fNacimiento ?? '').slice(0, 10),
      genero: (p.genero ?? '') as PersonalForm['genero'],
      cargoId: p.cargoId || 0,
      contratoId: p.contratoId || 0,
      turno: p.turno ?? '',
      fondoPension: p.fondoPension ?? '',
      nHijos: p.nHijos,
      essalud: p.essalud ?? '',
      fIngreso: (p.fIngreso ?? '').slice(0, 10),
      fCese: (p.fCese ?? '').slice(0, 10),
      sueldo: p.sueldo,
    });
    setFormError(null);
    setModal({ editando: p });
  };

  const validar = (): string | null => {
    if (!form.nombres.trim()) {
      return 'Nombres es obligatorio.';
    }
    if (form.tipoDoc === 'DNI' && !/^\d{8}$/.test(form.documento.trim())) {
      return 'DNI de 8 dígitos.';
    }
    if (!form.documento.trim()) {
      return 'Documento es obligatorio.';
    }
    if (!/^\d{9}$/.test(form.telefono.trim())) {
      return 'Celular de 9 dígitos.';
    }
    if (!form.cargoId) {
      return 'Seleccione el cargo.';
    }
    if (!form.contratoId) {
      return 'Seleccione el contrato.';
    }
    if (form.correo.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.correo.trim())) {
      return 'Correo inválido.';
    }
    if (form.fNacimiento) {
      const hoy = new Date().toISOString().slice(0, 10);
      if (form.fNacimiento > hoy) {
        return 'Nacimiento no puede ser futura.';
      }
    }
    if (form.nHijos !== null && (form.nHijos < 0 || form.nHijos > 9)) {
      return 'N.º hijos entre 0 y 9.';
    }
    if (form.sueldo < 0) {
      return 'Sueldo ≥ 0.';
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
        await actualizarEmpleado(modal.editando.id, { ...form, fCese: form.fCese || undefined });
      } else {
        await crearEmpleado({ ...form, fIngreso: form.fIngreso || undefined });
      }
      setModal(null);
      await cargar();
    } catch (e) {
      const codigo = (e as Error).message;
      setFormError(
        codigo === 'YA_EXISTE'
          ? 'Ya existe una persona con ese documento.'
          : 'No se pudo guardar. Reintente.',
      );
    } finally {
      setGuardando(false);
    }
  };

  const toggleEstado = async (p: Personal) => {
    try {
      await cambiarEstadoEmpleado(p.id, p.estado === 'A' ? 'I' : 'A');
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
            <span className="font-bold text-[#A61E22]">Personal</span>
          </nav>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="font-[Newsreader] text-3xl font-medium text-[#7F1518]">
              Gestión del Personal
            </h1>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#F5F5F5] px-3 py-1.5 text-[11px] font-bold tracking-wider text-[#7F1518] uppercase">
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              Solo ADMIN y GERENTE
            </span>
          </div>
          <p className="mt-1 max-w-3xl text-sm text-[#333333]/70">
            Registro de colaboradores y gestión de contratos. No crea usuarios del sistema.
          </p>
        </div>
        <button
          onClick={abrirNuevo}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-[#A61E22] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#7F1518]"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          <span>Nuevo Empleado</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi titulo="Total Colaboradores" valor={String(total)} detalle="Registrados" icono="badge" />
        <Kpi titulo="Cocina" valor={String(cocina)} detalle="Dotación cocina" icono="skillet" />
        <Kpi titulo="Salón y Adm." valor={String(salon)} detalle="Dotación salón" icono="table_restaurant" />
        <Kpi
          titulo="Cesados"
          valor={String(datos.filter((d) => d.estado === 'I').length)}
          detalle="Inactivos"
          icono="block"
        />
      </div>

      <div className="grid grid-cols-1 items-center gap-3 rounded-xl bg-white p-4 shadow-sm md:grid-cols-12">
        <div className="relative md:col-span-4">
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setBuscar(texto);
                setPage(1);
              }
            }}
            placeholder="Nombre, DNI o celular…"
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
          value={cargo}
          onChange={(e) => {
            setCargo(e.target.value === '' ? '' : Number(e.target.value));
            setPage(1);
          }}
          className="cursor-pointer rounded-xl bg-[#F5F5F5] px-3 py-2.5 text-sm outline-none md:col-span-3"
        >
          <option value="">Cargo: Todos</option>
          {cargos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        <input
          value={turno}
          onChange={(e) => {
            setTurno(e.target.value);
            setPage(1);
          }}
          placeholder="Turno: Todos…"
          maxLength={18}
          className="rounded-xl bg-[#F5F5F5] px-3 py-2.5 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-[#A61E22] md:col-span-3"
        />
        <select
          value={estado}
          onChange={(e) => {
            setEstado(e.target.value as '' | 'A' | 'I');
            setPage(1);
          }}
          className="cursor-pointer rounded-xl bg-[#F5F5F5] px-3 py-2.5 text-sm outline-none md:col-span-2"
        >
          <option value="">Todos</option>
          <option value="A">Activos</option>
          <option value="I">Cesados</option>
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
          <p className="text-lg font-semibold">No existe personal registrado.</p>
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
              <table className="w-full min-w-[1120px] border-collapse text-left">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-[#F5F5F5] text-[11px] tracking-wider text-[#333333]/60 uppercase">
                    <th className="px-4 py-3">Colaborador</th>
                    <th className="px-4 py-3">Documento</th>
                    <th className="px-4 py-3">Cargo &amp; Área</th>
                    <th className="px-4 py-3">Distrito</th>
                    <th className="px-4 py-3">Turno</th>
                    <th className="px-4 py-3">Ingreso</th>
                    <th className="px-4 py-3 text-center">Estado</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F5F5] text-sm">
                  {datos.map((p) => (
                    <tr key={p.id} className="transition-colors hover:bg-[#F5F5F5]">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F2C94C]/40 text-sm font-bold text-[#7F1518]">
                            {(p.nombres[0] ?? '') + (p.apPaterno[0] ?? '')}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-bold">
                              {p.nombres} {p.apPaterno} {p.apMaterno}
                            </div>
                            <div className="font-mono text-[11px] text-[#333333]/50">EMP-{p.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-mono">{p.documento}</div>
                        <div className="text-[11px] tracking-wider text-[#333333]/50 uppercase">{p.tipoDoc}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-full bg-[#F5F5F5] px-2.5 py-1 text-[11px] font-bold">
                          {p.cargo || '—'}
                        </span>
                        <div className="mt-0.5 text-xs text-[#333333]/50">{p.area}</div>
                      </td>
                      <td className="px-4 py-4">{p.distrito || '—'}</td>
                      <td className="px-4 py-4">{p.turno || '—'}</td>
                      <td className="px-4 py-4">{(p.fIngreso ?? '').slice(0, 10) || '—'}</td>
                      <td className="px-4 py-4 text-center">
                        {p.estado === 'A' ? (
                          <span className="rounded-full bg-[#22C55E]/15 px-2.5 py-1 text-[11px] font-bold text-[#22C55E]">
                            Activo
                          </span>
                        ) : (
                          <span className="rounded-full bg-[#D9D9D9]/40 px-2.5 py-1 text-[11px] font-bold text-[#333333]/60">
                            Cesado
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            title="Editar ficha"
                            onClick={() => abrirEditar(p)}
                            className="rounded-lg p-1.5 text-[#2563EB] transition-colors hover:bg-[#2563EB]/10"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <Toggle
                            activo={p.estado === 'A'}
                            titulo={p.estado === 'A' ? 'Cesar' : 'Reactivar'}
                            onClick={() => void toggleEstado(p)}
                          />
                          <button
                            title="Crear usuario (módulo Usuarios, futuro)"
                            disabled
                            className="cursor-not-allowed rounded-lg bg-[#F5F5F5] px-2.5 py-1.5 text-[11px] font-bold text-[#333333]/40"
                          >
                            Crear usuario
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col items-center justify-between gap-3 bg-[#F5F5F5]/60 p-4 text-sm text-[#333333]/70 sm:flex-row">
              <span>
                Mostrando <strong>{datos.length}</strong> de <strong>{total}</strong> colaboradores
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
                    <h3 className="font-bold text-[#7F1518]">
                      {p.nombres} {p.apPaterno}
                    </h3>
                    <p className="text-xs text-[#333333]/50">
                      {p.cargo} · {p.turno || 'Sin turno'} · {p.distrito || 'Sin distrito'}
                    </p>
                  </div>
                  {p.estado === 'A' ? (
                    <span className="rounded-full bg-[#22C55E]/15 px-2 py-0.5 text-[11px] font-bold text-[#22C55E]">
                      Activo
                    </span>
                  ) : (
                    <span className="rounded-full bg-[#D9D9D9]/40 px-2 py-0.5 text-[11px] font-bold text-[#333333]/60">
                      Cesado
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-end gap-2">
                  <button
                    onClick={() => abrirEditar(p)}
                    className="cursor-pointer rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm font-semibold transition-colors hover:bg-[#D9D9D9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A61E22]/50"
                  >
                    Editar
                  </button>
                  <Toggle
                    activo={p.estado === 'A'}
                    titulo={p.estado === 'A' ? 'Cesar' : 'Reactivar'}
                    onClick={() => void toggleEstado(p)}
                  />
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 backdrop-blur-xs sm:p-4">
          <div className="flex max-h-screen w-full max-w-3xl flex-col overflow-y-auto bg-white shadow-2xl sm:rounded-2xl">
            <div className="flex items-center justify-between bg-[#7F1518] px-6 py-4 text-white">
              <h2 className="text-xl font-bold">
                {modal.editando ? 'Editar Empleado' : 'Nuevo Empleado'}
              </h2>
              <button
                onClick={() => setModal(null)}
                aria-label="Cerrar"
                className="rounded-lg p-2 transition-colors hover:bg-white/10"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-5 p-6">
              {formError && (
                <div role="alert" className="rounded-lg border border-[#DC2626]/30 bg-[#DC2626]/10 p-3 text-sm">
                  {formError}
                </div>
              )}
              {errorMaestros && (
                <div role="alert" className="flex items-center justify-between gap-2 rounded-lg border border-[#D4A017]/40 bg-[#D4A017]/10 p-3 text-sm">
                  <span>{errorMaestros}</span>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="shrink-0 cursor-pointer rounded-lg bg-white px-3 py-1.5 text-xs font-bold shadow-sm transition-colors hover:bg-[#F5F5F5]"
                  >
                    Reintentar
                  </button>
                </div>
              )}
              <div>
                <p className="mb-3 text-xs font-bold tracking-wider uppercase opacity-60">
                  1. Datos Personales
                </p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Nombres *</span>
                    <input
                      value={form.nombres}
                      maxLength={80}
                      onChange={(e) => setForm({ ...form, nombres: e.target.value })}
                      className="rounded-lg bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-[#A61E22]"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Ap. Paterno</span>
                      <input
                        value={form.apPaterno}
                        maxLength={80}
                        onChange={(e) => setForm({ ...form, apPaterno: e.target.value })}
                        className="rounded-lg bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Ap. Materno</span>
                      <input
                        value={form.apMaterno}
                        maxLength={80}
                        onChange={(e) => setForm({ ...form, apMaterno: e.target.value })}
                        className="rounded-lg bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none"
                      />
                    </label>
                  </div>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Tipo Doc.</span>
                    <select
                      value={form.tipoDoc}
                      disabled={!!modal.editando || cargandoMaestros}
                      onChange={(e) => setForm({ ...form, tipoDoc: e.target.value as PersonalForm['tipoDoc'] })}
                      className="rounded-lg bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none disabled:opacity-60"
                    >
                      {tiposPersona(tiposDoc).map((t) => (
                        <option key={t.valor} value={t.valor}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Documento *</span>
                    <input
                      value={form.documento}
                      maxLength={15}
                      disabled={!!modal.editando}
                      onChange={(e) => setForm({ ...form, documento: e.target.value })}
                      className="rounded-lg bg-[#F5F5F5] px-3.5 py-2.5 font-mono text-sm outline-none focus:bg-white focus:ring-1 focus:ring-[#A61E22] disabled:opacity-60"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Celular (9) *</span>
                    <input
                      value={form.telefono}
                      maxLength={9}
                      inputMode="numeric"
                      onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                      className="rounded-lg bg-[#F5F5F5] px-3.5 py-2.5 font-mono text-sm outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Correo</span>
                    <input
                      value={form.correo}
                      maxLength={50}
                      onChange={(e) => setForm({ ...form, correo: e.target.value })}
                      className="rounded-lg bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 md:col-span-2">
                    <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Dirección</span>
                    <input
                      value={form.direccion}
                      maxLength={100}
                      onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                      className="rounded-lg bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none"
                    />
                  </label>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Distrito</span>
                    <DistritoPicker
                      value={form.distritoId}
                      onChange={(id) => setForm({ ...form, distritoId: id })}
                      distritos={distritos}
                      cargando={cargandoMaestros}
                      error={errorMaestros}
                      onReintentar={() => void recargarMaestros()}
                    />
                  </div>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">F. Nacimiento</span>
                    <input
                      type="date"
                      value={form.fNacimiento}
                      onChange={(e) => setForm({ ...form, fNacimiento: e.target.value })}
                      className="rounded-lg bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Género</span>
                    <select
                      value={form.genero}
                      onChange={(e) => setForm({ ...form, genero: e.target.value as PersonalForm['genero'] })}
                      className="rounded-lg bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none"
                    >
                      <option value="">—</option>
                      {(Object.keys(GENERO_LABELS) as Genero[]).map((g) => (
                        <option key={g} value={g}>
                          {GENERO_LABELS[g]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
              <div>
                <p className="mb-3 text-xs font-bold tracking-wider uppercase opacity-60">
                  2. Datos Laborales
                </p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Cargo *</span>
                    <select
                      value={form.cargoId}
                      disabled={cargandoMaestros}
                      onChange={(e) => setForm({ ...form, cargoId: Number(e.target.value) })}
                      className="rounded-lg bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none disabled:opacity-60"
                    >
                      <option value={0}>Seleccione…</option>
                      {cargos.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Turno</span>
                    <input
                      value={form.turno}
                      maxLength={18}
                      onChange={(e) => setForm({ ...form, turno: e.target.value })}
                      placeholder="Ej. Mañana / Tarde / Noche"
                      className="rounded-lg bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">F. Ingreso</span>
                    <input
                      type="date"
                      value={form.fIngreso}
                      onChange={(e) => setForm({ ...form, fIngreso: e.target.value })}
                      className="rounded-lg bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Sueldo (S/.)</span>
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      value={form.sueldo}
                      onChange={(e) => setForm({ ...form, sueldo: Number(e.target.value) })}
                      className="rounded-lg bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Contrato *</span>
                    <select
                      value={form.contratoId}
                      disabled={cargandoMaestros}
                      onChange={(e) => setForm({ ...form, contratoId: Number(e.target.value) })}
                      className="rounded-lg bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none disabled:opacity-60"
                    >
                      <option value={0}>Seleccione…</option>
                      {contratos.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Fondo Pensión</span>
                    <input
                      value={form.fondoPension}
                      maxLength={3}
                      onChange={(e) => setForm({ ...form, fondoPension: e.target.value.toUpperCase() })}
                      placeholder="ONP / AFP"
                      className="rounded-lg bg-[#F5F5F5] px-3.5 py-2.5 font-mono text-sm outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">N.º Hijos</span>
                    <input
                      type="number"
                      min={0}
                      max={9}
                      value={form.nHijos ?? ''}
                      onChange={(e) =>
                        setForm({ ...form, nHijos: e.target.value === '' ? null : Number(e.target.value) })
                      }
                      className="rounded-lg bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">ESSALUD</span>
                    <input
                      value={form.essalud}
                      maxLength={6}
                      onChange={(e) => setForm({ ...form, essalud: e.target.value })}
                      className="rounded-lg bg-[#F5F5F5] px-3.5 py-2.5 font-mono text-sm outline-none"
                    />
                  </label>
                  {modal.editando && (
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">
                        F. Cese (opcional)
                      </span>
                      <input
                        type="date"
                        value={form.fCese}
                        onChange={(e) => setForm({ ...form, fCese: e.target.value })}
                        className="rounded-lg bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none"
                      />
                    </label>
                  )}
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
                  <span>{guardando ? 'Guardando…' : 'Guardar Empleado'}</span>
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
        activo ? 'bg-[#22C55E]' : 'bg-[#D9D9D9]'
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
