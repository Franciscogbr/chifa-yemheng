import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { cambiarClaveRequest, leerUsuario } from '../features/auth/login/auth-service';
import { useAuth } from '../features/auth/login/auth-context';
import { useTheme } from '../theme/theme-context';
import { EQUIPOS, getEquipo, setEquipo } from '../utils/equipo';

interface Modulo {
  to: string;
  icono: string;
  label: string;
}

interface Grupo {
  titulo: string;
  items: Modulo[];
}

/** Solo habilitados por ahora. Futuros se agregan cuando su change exista:
 * Cocina (/admin/cocina), Caja (/admin/caja), Delivery, Reservas,
 * Reportes, Auditoría, Usuarios y Roles.
 */
const GRUPOS: Grupo[] = [
  { titulo: 'Principal', items: [{ to: '/admin', icono: 'dashboard', label: 'Dashboard' }] },
  {
    titulo: 'Gestión de carta',
    items: [
      { to: '/admin/productos', icono: 'restaurant_menu', label: 'Productos' },
      { to: '/admin/categorias', icono: 'category', label: 'Categorías' },
    ],
  },
  {
    titulo: 'Gestión de salón',
    items: [{ to: '/admin/mesas', icono: 'table_restaurant', label: 'Mesas y Ambientes' }],
  },
  {
    titulo: 'Gestión de personas',
    items: [
      { to: '/admin/personal', icono: 'badge', label: 'Personal' },
      { to: '/admin/clientes', icono: 'groups', label: 'Clientes' },
    ],
  },
];

/** Shell administrativo: sidebar por grupos + navbar + contenido. */
export function AdminShell() {
  const { usuario, logout } = useAuth();
  const { tema, cambiarTema } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [busqueda, setBusqueda] = useState('');
  const [abiertos, setAbiertos] = useState<string[]>(GRUPOS.map((g) => g.titulo));
  const [menuUsuario, setMenuUsuario] = useState(false);
  const [verPerfil, setVerPerfil] = useState(false);
  const [verClave, setVerClave] = useState(false);
  const [verVista, setVerVista] = useState(false);
  const [movil, setMovil] = useState(false);
  const [equipo, setEquipoSel] = useState<string>(() => getEquipo());
  const menuRef = useRef<HTMLDivElement>(null);

  const salir = () => {
    logout();
    navigate('/auth/login', { replace: true });
  };

  useEffect(() => {
    setMenuUsuario(false);
    setMovil(false);
  }, [location.pathname]);

  useEffect(() => {
    const fuera = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuUsuario(false);
      }
    };
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (verClave) {
          setVerClave(false);
          return;
        }
        setMenuUsuario(false);
        setVerPerfil(false);
        setVerVista(false);
      }
    };
    document.addEventListener('mousedown', fuera);
    document.addEventListener('keydown', tecla);
    return () => {
      document.removeEventListener('mousedown', fuera);
      document.removeEventListener('keydown', tecla);
    };
  }, [verClave]);

  const toggleGrupo = (titulo: string) => {
    setAbiertos((prev) => (prev.includes(titulo) ? prev.filter((t) => t !== titulo) : [...prev, titulo]));
  };

  const q = busqueda.trim().toLowerCase();
  const gruposFiltrados = GRUPOS.map((g) => ({
    ...g,
    items: q ? g.items.filter((m) => m.label.toLowerCase().includes(q)) : g.items,
  })).filter((g) => g.items.length > 0);

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-colors ${
      isActive
        ? 'border-l-4 border-[#F2C94C] bg-[#A61E22] font-semibold text-white'
        : 'text-[#F2C94C]/90 hover:bg-[#A61E22] hover:text-white'
    }`;

  const sidebar = (
    <div className="flex h-full flex-col justify-between">
      <div>
        <div className="flex h-16 items-center gap-2 border-b border-white/10 px-6">
          <img
            src="/img/sello-yemheng.svg"
            alt="Sello Chifa Yemheng"
            className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-[#F2C94C]/60"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-base font-bold tracking-wider text-white">CHIFA YEMHENG</span>
            <span className="text-[10px] text-white/60">Sistema de Gestión Comercial</span>
          </div>
        </div>
        <nav className="flex flex-col gap-3 overflow-y-auto px-3 py-4">
          {gruposFiltrados.map((g) => (
            <div key={g.titulo}>
              <button
                type="button"
                onClick={() => toggleGrupo(g.titulo)}
                className="flex w-full cursor-pointer items-center justify-between rounded-lg px-4 py-1.5 text-[11px] font-bold tracking-wider text-white/50 uppercase transition-colors hover:bg-white/5 hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2C94C]/50"
              >
                <span>{g.titulo}</span>
                <span
                  className={`material-symbols-outlined text-[18px] transition-transform ${abiertos.includes(g.titulo) ? 'rotate-180' : ''}`}
                >
                  expand_more
                </span>
              </button>
              {abiertos.includes(g.titulo) && (
                <div className="flex flex-col gap-1">
                  {g.items.map((m) => (
                    <NavLink key={m.to} to={m.to} end={m.to === '/admin'} className={linkCls}>
                      <span className="material-symbols-outlined text-[#F2C94C]">{m.icono}</span>
                      <span>{m.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
          {gruposFiltrados.length === 0 && (
            <p className="px-4 py-2 text-sm text-white/50">Sin módulos para “{busqueda}”.</p>
          )}
        </nav>
      </div>
      <div className="p-4 text-[11px] text-white/40">Chifa Yemheng · Operación Central</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-[Plus_Jakarta_Sans] text-[#333333] dark:bg-[#1b1200] dark:text-[#f5f5f5]">
      <aside className="fixed top-0 left-0 z-50 hidden h-screen w-72 flex-col overflow-y-auto bg-[#7F1518] shadow-2xl lg:flex dark:bg-[#2a0d0e]">
        {sidebar}
      </aside>
      {movil && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMovil(false)} />
          <aside className="absolute top-0 left-0 h-full w-72 overflow-y-auto bg-[#7F1518] shadow-2xl">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-72">
        <header className="fixed top-0 right-0 left-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-[#D9D9D9] bg-white px-4 sm:px-6 lg:left-72 dark:border-white/10 dark:bg-[#241010]">
          <div className="flex flex-1 items-center gap-2">
            <button
              type="button"
              onClick={() => setMovil(true)}
              aria-label="Abrir menú"
              className="rounded-lg p-2 hover:bg-[#F5F5F5] lg:hidden dark:hover:bg-white/10"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <span className="font-bold text-[#A61E22] lg:hidden dark:text-white">CHIFA YEMHENG</span>
            <div className="relative hidden max-w-xl flex-1 md:block">
              <span className="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-[18px] opacity-40">
                search
              </span>
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar productos, clientes, ventas… (filtra el menú)"
                className="w-full rounded-lg bg-[#F5F5F5] py-2 pr-4 pl-10 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-[#A61E22] dark:bg-white/10 dark:focus:bg-white/15"
              />
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              title="Notificaciones (próximamente)"
              className="relative rounded-lg p-2 hover:bg-[#F5F5F5] dark:hover:bg-white/10"
            >
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#DC2626] text-[10px] font-bold text-white">
                3
              </span>
            </button>
            <button
              type="button"
              title="Configuración de vista"
              onClick={() => setVerVista(true)}
              className="rounded-lg p-2 hover:bg-[#F5F5F5] dark:hover:bg-white/10"
            >
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuUsuario((v) => !v)}
                className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-[#F5F5F5] dark:hover:bg-white/10"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#A61E22]">
                  <span className="material-symbols-outlined text-[18px] text-white">person</span>
                </div>
                <div className="hidden flex-col text-left sm:flex">
                  <span className="text-sm leading-tight font-semibold">
                    {usuario?.empleado || usuario?.logeo}
                  </span>
                </div>
                <span className="material-symbols-outlined text-[18px] opacity-60">expand_more</span>
              </button>
              {menuUsuario && (
                <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-[#2a0d0e] dark:shadow-black/50">
                  <div className="border-b border-[#F5F5F5] px-4 py-3 dark:border-white/10">
                    <p className="truncate text-sm font-bold">{usuario?.empleado || usuario?.logeo}</p>
                    <p className="text-[11px] tracking-wider text-[#333333]/60 uppercase dark:text-white/60">
                      {usuario?.cargo || usuario?.tipo}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuUsuario(false);
                      setVerPerfil(true);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-[#F5F5F5] dark:hover:bg-white/10"
                  >
                    <span className="material-symbols-outlined text-[18px]">account_circle</span>
                    Ver perfil
                  </button>
                  <button
                    type="button"
                    onClick={salir}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-[#A61E22] hover:bg-[#A61E22]/10 dark:text-[#F2C94C]"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="min-h-screen px-4 py-6 pt-24 sm:px-6">
          <Outlet />
        </main>
      </div>

      {verVista && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#2a0d0e]">
            <h2 className="text-lg font-bold">Configuración de vista</h2>
            <p className="mt-1 text-sm opacity-60">Tema de la interfaz (se guarda en este equipo).</p>
            <div className="mt-4 flex flex-col gap-1.5">
              <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">
                Equipo (opcional — auditoría pccre/pcmod)
              </span>
              <select
                value={equipo}
                onChange={(e) => {
                  setEquipoSel(e.target.value);
                  setEquipo(e.target.value);
                }}
                className="cursor-pointer rounded-xl bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none dark:bg-white/10"
              >
                <option value="">Sin equipo (usa IP)</option>
                {EQUIPOS.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => cambiarTema('claro')}
                className={`flex-1 cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                  tema === 'claro'
                    ? 'bg-[#A61E22] text-white'
                    : 'bg-[#F5F5F5] hover:bg-[#D9D9D9] dark:bg-white/10 dark:hover:bg-white/20'
                }`}
              >
                Claro
              </button>
              <button
                type="button"
                onClick={() => cambiarTema('oscuro')}
                className={`flex-1 cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                  tema === 'oscuro'
                    ? 'bg-[#A61E22] text-white'
                    : 'bg-[#F5F5F5] hover:bg-[#D9D9D9] dark:bg-white/10 dark:hover:bg-white/20'
                }`}
              >
                Oscuro
              </button>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setVerVista(false)}
                className="cursor-pointer rounded-xl bg-[#F5F5F5] px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-[#D9D9D9] dark:bg-white/10 dark:hover:bg-white/20"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {verPerfil && (
        <PerfilModal onCerrar={() => setVerPerfil(false)} onClave={() => setVerClave(true)} />
      )}
      {verClave && <ClaveModal onCerrar={() => setVerClave(false)} />}
    </div>
  );
}

function PerfilModal({ onCerrar, onClave }: { onCerrar: () => void; onClave: () => void }) {
  const usuario = leerUsuario();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#2a0d0e]">
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-bold">Mi perfil</h2>
          <button type="button" onClick={onCerrar} aria-label="Cerrar" className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-[#F5F5F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A61E22]/50 dark:hover:bg-white/10">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-[#F5F5F5] p-3 dark:bg-white/10">
            <dt className="text-[11px] font-bold tracking-wider uppercase opacity-60">Empleado</dt>
            <dd className="font-semibold">{usuario?.empleado || '—'}</dd>
          </div>
          <div className="rounded-xl bg-[#F5F5F5] p-3 dark:bg-white/10">
            <dt className="text-[11px] font-bold tracking-wider uppercase opacity-60">Usuario</dt>
            <dd className="font-semibold">{usuario?.logeo || '—'}</dd>
          </div>
          <div className="rounded-xl bg-[#F5F5F5] p-3 dark:bg-white/10">
            <dt className="text-[11px] font-bold tracking-wider uppercase opacity-60">Cargo</dt>
            <dd className="font-semibold">{usuario?.cargo || '—'}</dd>
          </div>
          <div className="rounded-xl bg-[#F5F5F5] p-3 dark:bg-white/10">
            <dt className="text-[11px] font-bold tracking-wider uppercase opacity-60">Rol</dt>
            <dd className="font-semibold">{usuario?.tipo || '—'}</dd>
          </div>
        </dl>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCerrar}
            className="cursor-pointer rounded-xl bg-[#F5F5F5] px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-[#D9D9D9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A61E22]/50 dark:bg-white/10 dark:hover:bg-white/20"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={onClave}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#A61E22] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#7F1518] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A61E22]/50 active:scale-[0.99]"
          >
            <span className="material-symbols-outlined text-[18px]">key</span>
            Cambiar contraseña
          </button>
        </div>
      </div>
    </div>
  );
}

function ClaveModal({ onCerrar }: { onCerrar: () => void }) {
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [repetir, setRepetir] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const guardar = async () => {
    setError(null);
    setOk(false);
    if (!actual || !nueva || !repetir) {
      setError('Completa los 3 campos.');
      return;
    }
    if (nueva.length < 4) {
      setError('La nueva debe tener mínimo 4 caracteres.');
      return;
    }
    if (nueva === actual) {
      setError('La nueva debe ser distinta a la actual.');
      return;
    }
    if (nueva !== repetir) {
      setError('Repetir no coincide con la nueva.');
      return;
    }
    setGuardando(true);
    try {
      await cambiarClaveRequest(actual, nueva);
      setOk(true);
      setActual('');
      setNueva('');
      setRepetir('');
    } catch (e) {
      const codigo = (e as Error).message;
      setError(
        codigo === 'ACTUAL_INCORRECTA'
          ? 'La contraseña actual es incorrecta.'
          : codigo === 'BLOQUEADO'
            ? 'Usuario bloqueado. Contacte al administrador.'
            : codigo === 'INACTIVO'
              ? 'Usuario inactivo.'
              : 'No se pudo cambiar. Reintente.',
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#2a0d0e]">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">Cambiar contraseña</h2>
            <p className="mt-1 text-sm opacity-60">La sesión sigue activa al guardar.</p>
          </div>
          <button type="button" onClick={onCerrar} aria-label="Cerrar" className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-[#F5F5F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A61E22]/50 dark:hover:bg-white/10">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {error && (
          <div role="alert" className="mt-3 rounded-lg border border-[#DC2626]/30 bg-[#DC2626]/10 p-3 text-sm">
            {error}
          </div>
        )}
        {ok && (
          <div role="status" className="mt-3 rounded-lg border border-[#22C55E]/30 bg-[#22C55E]/10 p-3 text-sm">
            Clave actualizada. La sesión sigue activa.
          </div>
        )}
        <div className="mt-3 flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Actual</span>
            <input
              type="password"
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              className="rounded-lg bg-[#F5F5F5] px-3 py-2.5 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-[#A61E22] dark:bg-white/10 dark:focus:bg-white/15"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Nueva (mín 4)</span>
            <input
              type="password"
              value={nueva}
              onChange={(e) => setNueva(e.target.value)}
              className="rounded-lg bg-[#F5F5F5] px-3 py-2.5 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-[#A61E22] dark:bg-white/10 dark:focus:bg-white/15"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Repetir nueva</span>
            <input
              type="password"
              value={repetir}
              onChange={(e) => setRepetir(e.target.value)}
              className="rounded-lg bg-[#F5F5F5] px-3 py-2.5 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-[#A61E22] dark:bg-white/10 dark:focus:bg-white/15"
            />
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCerrar}
            className="cursor-pointer rounded-xl bg-[#F5F5F5] px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-[#D9D9D9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A61E22]/50 dark:bg-white/10 dark:hover:bg-white/20"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void guardar()}
            disabled={guardando}
            className="cursor-pointer rounded-xl bg-[#A61E22] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#7F1518] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A61E22]/50 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[#A61E22]"
          >
            {guardando ? 'Guardando…' : 'Guardar clave'}
          </button>
        </div>
      </div>
    </div>
  );
}
