import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/login/auth-context';
import { leerPermisos } from '../features/auth/login/auth-service';
import { useClienteAuth } from '../features/cliente/auth/cliente-auth-context';
import { limpiarModoCliente, leerQrValidado, limpiarQrValidado, useModoCliente, type ClienteModo } from '../features/cliente/auth/cliente-mode';
import { useCart } from '../contexts/CartContext';

/** Valida JWT y retorna payload si válido, null si inválido/expirado. */
function validateToken(token: string | null): { exp?: number; tipo?: string } | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1] ?? '')) as { exp?: number; tipo?: string };
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null; // expirado
    }
    return payload;
  } catch {
    return null; // token malformed
  }
}

function rutaInicialStaff(tipo: string | undefined): string {
  switch (tipo?.toUpperCase()) {
    case 'CAJERO':
      return '/admin/caja';
    case 'MOZO':
      return '/admin/mozo';
    case 'COCINA':
      return '/admin/cocina';
    case 'DELIVERY':
    case 'REPARTIDOR':
      return '/repartidor/mis-entregas';
    default:
      return '/admin';
  }
}

/** PublicGuard: si ya hay sesión staff VÁLIDA, fuera del login (sincrónico). */
export function PublicGuard({ children }: { children: ReactNode }) {
  const { token, usuario } = useAuth();
  const payload = validateToken(token);
  if (payload && usuario) {
    return <Navigate to={rutaInicialStaff(usuario.tipo)} replace />;
  }
  return <>{children}</>;
}

/** Esqueleto de carga mostrado mientras el guard valida la sesión. */
export function GuardSkeleton() {
  return (
    <div className="y-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16 }}>
      <div className="skel" style={{ width: 120, height: 120, borderRadius: '50%', margin: '0 auto' }} />
      <div className="skel" style={{ width: 200, height: 24 }} />
      <div className="skel" style={{ width: 280, height: 24 }} />
      <p style={{ color: 'var(--muted)', fontSize: 14 }}>Validando sesión...</p>
    </div>
  );
}

/** AuthGuard: exige JWT staff VÁLIDO. */
export function AuthGuard({ children }: { children: ReactNode }) {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const payload = useMemo(() => validateToken(token), [token]);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!payload) {
      logout();
      navigate('/auth/login', { replace: true });
    } else {
      setAuthorized(true);
    }
  }, [payload, logout, navigate]);

  if (!authorized) return <GuardSkeleton />;
  return <>{children}</>;
}

/** RoleGuard: exige tipo de usuario permitido con token VÁLIDO. */
export function RoleGuard({ roles, children }: { roles: string[]; children: ReactNode }) {
  const { token, usuario } = useAuth();
  const navigate = useNavigate();
  const payload = useMemo(() => validateToken(token), [token]);
  const allowedRoles = roles.map((role) => role.toUpperCase()).join('|');
  const [authorized, setAuthorized] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (!payload) {
      navigate('/auth/login', { replace: true });
    } else {
      const tipo = (usuario?.tipo ?? payload.tipo ?? '').toUpperCase();
      const allowed = allowedRoles.split('|').includes(tipo);
      setAuthorized(allowed);
      setAccessDenied(!allowed);
    }
  }, [payload, usuario?.tipo, allowedRoles, navigate]);

  if (accessDenied) {
    return (
      <div className="y-panel" role="alert" style={{ margin: 24, padding: 24 }}>
        No tienes autorización para acceder a esta sección.
      </div>
    );
  }
  if (!authorized) return <GuardSkeleton />;
  return <>{children}</>;
}

/** RepartidorGuard: exige rol REPARTIDOR con token VÁLIDO. */
export function RepartidorGuard({ children }: { children: ReactNode }) {
  const { token, usuario } = useAuth();
  const navigate = useNavigate();
  const payload = useMemo(() => validateToken(token), [token]);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!payload) {
      navigate('/auth/login', { replace: true });
    } else {
      const esRepartidor = (usuario?.tipo ?? payload.tipo ?? '').toUpperCase() === 'REPARTIDOR';
      if (!esRepartidor) {
        navigate('/auth/login', { replace: true });
      } else {
        setAuthorized(true);
      }
    }
  }, [payload, usuario?.tipo, navigate]);

  if (!authorized) return <GuardSkeleton />;
  return <>{children}</>;
}

/** Matriz área → permisos (BR-ACC-036, spec permisos/areas). */
const AREA_PERMISOS: Record<string, string[]> = {
  MESAS: ['MESA_VER', 'MESA_CREAR', 'MESA_EDITAR', 'MESA_ELIMINAR', 'TMESA_VER', 'TMESA_CREAR', 'TMESA_EDITAR', 'TMESA_ELIMINAR'],
  MOZO: ['PED_VER', 'PED_REGISTRAR', 'PED_ANULAR', 'PED_DESCUENTO', 'PED_ENTREGAR'],
  COCINA: ['PED_COCINA', 'PED_VER'],
  CAJA: ['CAJA_APERTURA', 'CAJA_CIERRE', 'CAJA_ARQUEO', 'CAJA_RENDICION', 'CAJ_APERTURAR', 'CAJ_CERRAR', 'CAJ_VALIDAR_CIERRE', 'CAJ_EGRESO', 'VEN_COBRAR', 'VEN_EMITIR', 'VEN_NOTACREDITO'],
  SEGURIDAD: ['EMP_VER', 'EMP_CREAR', 'EMP_EDITAR', 'EMP_ELIMINAR', 'PER_VER', 'PER_CREAR', 'PER_EDITAR', 'PER_ELIMINAR', 'AUD_VER'],
};

/** AreaGuard: si el usuario no tiene ninguno de los permisos del área, redirige. */
export function AreaGuard({ area, children }: { area: keyof typeof AREA_PERMISOS | string; children: ReactNode }) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const payload = useMemo(() => validateToken(token), [token]);
  const [authorized, setAuthorized] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (!payload) {
      navigate('/auth/login', { replace: true });
    } else {
      const permisos = leerPermisos();
      const requeridos = AREA_PERMISOS[area] ?? [];
      const allowed = requeridos.length > 0 && requeridos.some((p) => permisos.includes(p));
      setAuthorized(allowed);
      setAccessDenied(!allowed);
    }
  }, [payload, area, navigate]);

  if (accessDenied) {
    return (
      <div className="y-panel" role="alert" style={{ margin: 24, padding: 24 }}>
        Tu cuenta no tiene permisos para acceder a esta área.
      </div>
    );
  }
  if (!authorized) return <GuardSkeleton />;
  return <>{children}</>;
}

/** ClientePublicGuard: si ya hay sesión cliente VÁLIDA, fuera del login (sincrónico). */
export function ClientePublicGuard({ children }: { children: ReactNode }) {
  const { token, cliente } = useClienteAuth();
  const payload = validateToken(token);
  if (payload && cliente) {
    return <Navigate to="/cliente/inicio" replace />;
  }
  return <>{children}</>;
}

/** ClienteAuthGuard: exige JWT cliente VÁLIDO. */
export function ClienteAuthGuard({ children }: { children: ReactNode }) {
  const { token, logoutCliente } = useClienteAuth();
  const navigate = useNavigate();
  const payload = useMemo(() => validateToken(token), [token]);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!payload) {
      void logoutCliente();
      navigate('/cliente/login', { replace: true });
    } else {
      setAuthorized(true);
    }
  }, [payload, logoutCliente, navigate]);

  if (!authorized) return null;
  return <>{children}</>;
}

/** Restringe las rutas del cliente a la experiencia elegida tras iniciar sesión. */
export function ClienteFlowGuard({
  modoPermitido,
  children,
}: {
  modoPermitido: ClienteModo | 'cualquiera';
  children: ReactNode;
}) {
  const { token } = useClienteAuth();
  const payload = useMemo(() => validateToken(token), [token]);
  const modo = useModoCliente();
  const { mesaId } = useCart();
  const qrValidado = leerQrValidado();
  const requiereMesa = modoPermitido === 'local';
  const modoValido = modoPermitido === 'cualquiera' ? modo !== null : modo === modoPermitido;
  // Para modo local se exige mesaId Y que el QR haya sido validado en esta sesión.
  const accesoValido =
    !payload ||
    (modoValido && (!requiereMesa || (Boolean(mesaId) && qrValidado)));

  useEffect(() => {
    if (payload && requiereMesa && modo === 'local' && (!mesaId || !qrValidado)) {
      limpiarModoCliente();
      limpiarQrValidado();
    }
  }, [payload, requiereMesa, modo, mesaId, qrValidado]);

  if (!accesoValido) return <Navigate to="/cliente/inicio" replace />;
  return <>{children}</>;
}