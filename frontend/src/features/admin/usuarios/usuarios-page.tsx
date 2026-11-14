import { useEffect, useState } from 'react';
import { leerPermisos, leerToken } from '../../auth/login/auth-service';

import { API_URL } from '../../../lib/api-url';

const BASE = `${API_URL}/seguridad`;

interface Usuario {
  id: number;
  logeo: string;
  tipo: string;
  empleadoId: number | null;
  empleado: string | null;
  bloqueado: string;
  estado: string;
}

interface Rol {
  id: number;
  nombre: string;
  descripcion: string | null;
  estado: string;
}

interface Permiso {
  id: number;
  modulo: string;
  nombre: string;
  clave: string;
  descripcion: string | null;
}

interface Empleado {
  id: number;
  nombres: string;
  apPaterno: string;
  estado: string;
}

interface UsuarioForm {
  logeo: string;
  clave: string;
  tipo: string;
  empleadoId: number;
  estado: 'A' | 'I';
  motivo: string;
}

interface RolForm {
  nombre: string;
  descripcion: string;
  estado: 'A' | 'I';
  motivo: string;
}

async function api<T>(path: string, opts?: RequestInit): Promise<T> {
  const url = path.startsWith('/personal') ? `${API_URL}${path}` : `${BASE}${path}`;
  const res = await fetch(url, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${leerToken() ?? ''}`,
      ...opts?.headers,
    },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    const messages: Record<string, string> = {
      ROL_TIPO_NO_ENCONTRADO: 'Este tipo de usuario no tiene un rol activo asignado.',
      ROL_TIPO_EN_USO: 'No se puede desactivar un rol asignado a un tipo de usuario activo.',
    };
    throw new Error(messages[body.error ?? ''] ?? body.error ?? 'NETWORK_ERROR');
  }
  return (await res.json()) as T;
}

export function AdminUsuariosPage() {
  const permisosSesion = leerPermisos();
  const puedeGestionarUsuarios = permisosSesion.includes('SEG_USUARIO');
  const puedeGestionarRoles = permisosSesion.includes('SEG_ROL');
  const [tab, setTab] = useState<'usuarios' | 'roles' | 'permisos'>(() =>
    puedeGestionarUsuarios ? 'usuarios' : puedeGestionarRoles ? 'roles' : 'usuarios',
  );
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [tiposUsuario, setTiposUsuario] = useState<string[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [usuarioForm, setUsuarioForm] = useState<UsuarioForm>({
    logeo: '',
    clave: '',
    tipo: '',
    empleadoId: 0,
    estado: 'A',
    motivo: '',
  });
  const [rolId, setRolId] = useState<number | null>(null);
  const [rolForm, setRolForm] = useState<RolForm>({ nombre: '', descripcion: '', estado: 'A', motivo: '' });
  const [permisoIds, setPermisoIds] = useState<number[]>([]);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      if (tab === 'usuarios') {
        const [u, tipos, personal] = await Promise.all([
          api<{ data: Usuario[] }>('/usuarios?page=1&limit=100'),
          api<string[]>('/tipos-usuario'),
          api<{ data: Empleado[] }>('/personal?page=1&limit=100&estado=A'),
        ]);
        setUsuarios(u.data);
        setTiposUsuario(tipos);
        setEmpleados(personal.data);
      } else {
        const [r, p] = await Promise.all([
          api<{ data: Rol[] }>('/roles?page=1&limit=100'),
          api<{ data: Permiso[] }>('/permisos'),
        ]);
        setRoles(r.data);
        setPermisos(p.data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No fue posible cargar los datos.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (
      (tab === 'usuarios' && !puedeGestionarUsuarios)
      || (tab !== 'usuarios' && !puedeGestionarRoles)
    ) {
      setCargando(false);
      return;
    }
    void cargar();
  }, [tab]);

  async function guardarUsuario(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      const body = usuarioId
        ? {
            tipo: usuarioForm.tipo,
            empleadoId: usuarioForm.empleadoId,
            estado: usuarioForm.estado,
            motivo: usuarioForm.motivo,
            ...(usuarioForm.clave ? { clave: usuarioForm.clave } : {}),
          }
        : usuarioForm;
      await api(`/usuarios${usuarioId ? `/${usuarioId}` : ''}`, {
        method: usuarioId ? 'PUT' : 'POST',
        body: JSON.stringify(body),
      });
      setUsuarioId(null);
      setUsuarioForm({ logeo: '', clave: '', tipo: tiposUsuario[0] ?? '', empleadoId: 0, estado: 'A', motivo: '' });
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar el usuario.');
    } finally {
      setGuardando(false);
    }
  }

  async function editarUsuario(usuario: Usuario) {
    setUsuarioId(usuario.id);
    setUsuarioForm({
      logeo: usuario.logeo,
      clave: '',
      tipo: usuario.tipo,
      empleadoId: usuario.empleadoId ?? 0,
      estado: usuario.estado === 'I' ? 'I' : 'A',
      motivo: '',
    });
  }

  async function guardarRol(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      await api<Rol>(`/roles${rolId ? `/${rolId}` : ''}`, {
        method: rolId ? 'PUT' : 'POST',
        body: JSON.stringify({ ...rolForm, permisoIds }),
      });
      setRolId(null);
      setRolForm({ nombre: '', descripcion: '', estado: 'A', motivo: '' });
      setPermisoIds([]);
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar el rol.');
    } finally {
      setGuardando(false);
    }
  }

  async function editarRol(rol: Rol) {
    setRolId(rol.id);
    setRolForm({ nombre: rol.nombre, descripcion: rol.descripcion ?? '', estado: rol.estado === 'I' ? 'I' : 'A', motivo: '' });
    setError(null);
    try {
      const result = await api<{ permisoIds: number[] }>(`/roles/${rol.id}/permisos`);
      setPermisoIds(result.permisoIds);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar los permisos del rol.');
    }
  }

  function cancelarEdicion() {
    setUsuarioId(null);
    setUsuarioForm({ logeo: '', clave: '', tipo: tiposUsuario[0] ?? '', empleadoId: 0, estado: 'A', motivo: '' });
    setRolId(null);
    setRolForm({ nombre: '', descripcion: '', estado: 'A', motivo: '' });
    setPermisoIds([]);
  }

  const inputClass = 'rounded-lg border border-[#D9D9D9] bg-white px-3 py-2 text-sm';
  const buttonClass = 'rounded-lg bg-[#A61E22] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50';

  return (
    <div className="y-shell" style={{ padding: '24px 16px 140px', maxWidth: 1240, margin: '0 auto' }}>
      <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--fg)' }}>Seguridad</h1>
      <div className="flex gap-2 mb-4">
        {([
          ...(puedeGestionarUsuarios ? ['usuarios' as const] : []),
          ...(puedeGestionarRoles ? ['roles' as const, 'permisos' as const] : []),
        ]).map((value) => (
          <button key={value} onClick={() => { cancelarEdicion(); setTab(value); }} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${tab === value ? 'bg-[#A61E22] text-white' : 'bg-[#F5F5F5] hover:bg-[#D9D9D9]'}`}>
            {value === 'usuarios' ? 'Usuarios' : value === 'roles' ? 'Roles' : 'Permisos'}
          </button>
        ))}
      </div>
      {error && <div role="alert" className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">{error}</div>}
      {!puedeGestionarUsuarios && !puedeGestionarRoles ? (
        <div className="y-panel p-4 text-sm" role="status">
          Tu cuenta no tiene permisos para administrar usuarios, roles o permisos.
        </div>
      ) : cargando ? (
        <div className="y-panel" style={{ padding: 24, textAlign: 'center' }}>Cargando...</div>
      ) : tab === 'usuarios' ? (
        <>
          <form onSubmit={(event) => void guardarUsuario(event)} className="y-panel mb-4 grid gap-3 p-4 md:grid-cols-2">
            <h2 className="md:col-span-2 text-lg font-bold">{usuarioId ? `Editar usuario ${usuarioForm.logeo}` : 'Crear usuario'}</h2>
            {!usuarioId && (
              <label className="grid gap-1 text-sm">Usuario
                <input className={inputClass} value={usuarioForm.logeo} minLength={3} maxLength={30} required onChange={(e) => setUsuarioForm({ ...usuarioForm, logeo: e.target.value })} />
              </label>
            )}
            <label className="grid gap-1 text-sm">{usuarioId ? 'Nueva clave (opcional)' : 'Clave'}
              <input className={inputClass} type="password" value={usuarioForm.clave} minLength={4} maxLength={100} required={!usuarioId} onChange={(e) => setUsuarioForm({ ...usuarioForm, clave: e.target.value })} />
            </label>
            <label className="grid gap-1 text-sm">Tipo de usuario
              <select className={inputClass} value={usuarioForm.tipo} required onChange={(e) => setUsuarioForm({ ...usuarioForm, tipo: e.target.value })}>
                <option value="">Selecciona un tipo</option>
                {tiposUsuario.map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}
              </select>
              <span className="text-xs text-[#333]/60">Se asignará automáticamente el rol del mismo nombre y sus permisos activos.</span>
            </label>
            <label className="grid gap-1 text-sm">Empleado
              <select className={inputClass} value={usuarioForm.empleadoId} required onChange={(e) => setUsuarioForm({ ...usuarioForm, empleadoId: Number(e.target.value) })}>
                <option value={0} disabled>Selecciona un empleado</option>
                {empleados.map((empleado) => <option key={empleado.id} value={empleado.id}>{empleado.nombres} {empleado.apPaterno}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-sm">Estado
              <select className={inputClass} value={usuarioForm.estado} onChange={(e) => setUsuarioForm({ ...usuarioForm, estado: e.target.value as 'A' | 'I' })}>
                <option value="A">Activo</option><option value="I">Inactivo</option>
              </select>
            </label>
            {usuarioId && (
              <label className="grid gap-1 text-sm md:col-span-2">Motivo del cambio (obligatorio)
                <textarea className={inputClass} value={usuarioForm.motivo} minLength={8} maxLength={500} required rows={2} onChange={(e) => setUsuarioForm({ ...usuarioForm, motivo: e.target.value })} />
                <span className="text-xs text-[#333]/60">Indica por qué se modifica el acceso o se restablece/desbloquea la cuenta.</span>
              </label>
            )}
            <div className="flex gap-2 md:col-span-2">
              <button className={buttonClass} disabled={guardando}>{guardando ? 'Guardando…' : usuarioId ? 'Guardar cambios' : 'Crear usuario'}</button>
              {usuarioId && <button type="button" className="rounded-lg bg-[#F5F5F5] px-4 py-2 text-sm" onClick={cancelarEdicion}>Cancelar</button>}
            </div>
          </form>
          <div className="y-panel overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-[#F5F5F5] text-left text-xs uppercase text-[#333]/60">
                <th className="px-3 py-2">Usuario</th><th className="px-3 py-2">Tipo</th><th className="px-3 py-2">Empleado</th><th className="px-3 py-2">Bloqueado</th><th className="px-3 py-2">Estado</th><th className="px-3 py-2">Acciones</th>
              </tr></thead>
              <tbody className="divide-y divide-[#F5F5F5]">
                {usuarios.map((usuario) => <tr key={usuario.id}>
                  <td className="px-3 py-2 font-semibold">{usuario.logeo}</td><td className="px-3 py-2">{usuario.tipo}</td><td className="px-3 py-2">{usuario.empleado ?? '—'}</td>
                  <td className="px-3 py-2">{usuario.bloqueado === 'S' ? 'Sí' : 'No'}</td><td className="px-3 py-2">{usuario.estado === 'A' ? 'Activo' : 'Inactivo'}</td>
                  <td className="px-3 py-2"><button className="text-[#A61E22] underline" onClick={() => void editarUsuario(usuario)}>Editar / desbloquear</button></td>
                </tr>)}
              </tbody>
            </table>
            {usuarios.length === 0 && <p className="py-4 text-center text-sm text-[#333]/60">Sin usuarios.</p>}
          </div>
        </>
      ) : tab === 'roles' ? (
        <>
          <form onSubmit={(event) => void guardarRol(event)} className="y-panel mb-4 grid gap-3 p-4 md:grid-cols-2">
            <h2 className="md:col-span-2 text-lg font-bold">{rolId ? 'Editar rol y permisos' : 'Crear rol y permisos'}</h2>
            <label className="grid gap-1 text-sm">Nombre
              <input className={inputClass} value={rolForm.nombre} required maxLength={50} onChange={(e) => setRolForm({ ...rolForm, nombre: e.target.value })} />
            </label>
            <label className="grid gap-1 text-sm">Descripción
              <input className={inputClass} value={rolForm.descripcion} maxLength={200} onChange={(e) => setRolForm({ ...rolForm, descripcion: e.target.value })} />
            </label>
            <label className="grid gap-1 text-sm">Estado
              <select className={inputClass} value={rolForm.estado} onChange={(e) => setRolForm({ ...rolForm, estado: e.target.value as 'A' | 'I' })}>
                <option value="A">Activo</option><option value="I">Inactivo</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm md:col-span-2">Motivo del cambio (obligatorio)
              <textarea className={inputClass} value={rolForm.motivo} minLength={8} maxLength={500} required rows={2} onChange={(e) => setRolForm({ ...rolForm, motivo: e.target.value })} />
              <span className="text-xs text-[#333]/60">La modificación del rol y sus permisos se guarda como una sola operación.</span>
            </label>
            <fieldset className="grid gap-2 md:col-span-2">
              <legend className="text-sm font-semibold">Permisos del rol</legend>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {permisos.map((permiso) => <label key={permiso.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={permisoIds.includes(permiso.id)} onChange={(event) => setPermisoIds((current) => event.target.checked
                    ? [...current, permiso.id]
                    : current.filter((id) => id !== permiso.id))} />
                  <span>{permiso.modulo} · {permiso.nombre}</span>
                </label>)}
              </div>
            </fieldset>
            <div className="flex gap-2 md:col-span-2">
              <button className={buttonClass} disabled={guardando}>{guardando ? 'Guardando…' : rolId ? 'Guardar rol y permisos' : 'Crear rol'}</button>
              {rolId && <button type="button" className="rounded-lg bg-[#F5F5F5] px-4 py-2 text-sm" onClick={cancelarEdicion}>Cancelar</button>}
            </div>
          </form>
          <div className="y-panel overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-[#F5F5F5] text-left text-xs uppercase text-[#333]/60"><th className="px-3 py-2">Rol</th><th className="px-3 py-2">Descripción</th><th className="px-3 py-2">Estado</th><th className="px-3 py-2">Acciones</th></tr></thead>
              <tbody className="divide-y divide-[#F5F5F5]">{roles.map((rol) => <tr key={rol.id}>
                <td className="px-3 py-2 font-semibold">{rol.nombre}</td><td className="px-3 py-2">{rol.descripcion ?? '—'}</td><td className="px-3 py-2">{rol.estado === 'A' ? 'Activo' : 'Inactivo'}</td>
                <td className="px-3 py-2"><button className="text-[#A61E22] underline" onClick={() => void editarRol(rol)}>Editar permisos</button></td>
              </tr>)}</tbody>
            </table>
            {roles.length === 0 && <p className="py-4 text-center text-sm text-[#333]/60">Sin roles.</p>}
          </div>
        </>
      ) : (
        <div className="y-panel overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-[#F5F5F5] text-left text-xs uppercase text-[#333]/60"><th className="px-3 py-2">Módulo</th><th className="px-3 py-2">Permiso</th><th className="px-3 py-2">Clave</th><th className="px-3 py-2">Descripción</th></tr></thead>
            <tbody className="divide-y divide-[#F5F5F5]">{permisos.map((permiso) => <tr key={permiso.id}>
              <td className="px-3 py-2">{permiso.modulo}</td><td className="px-3 py-2">{permiso.nombre}</td><td className="px-3 py-2 font-mono text-xs">{permiso.clave}</td><td className="px-3 py-2">{permiso.descripcion ?? '—'}</td>
            </tr>)}</tbody>
          </table>
          {permisos.length === 0 && <p className="py-4 text-center text-sm text-[#333]/60">Sin permisos.</p>}
        </div>
      )}
    </div>
  );
}
