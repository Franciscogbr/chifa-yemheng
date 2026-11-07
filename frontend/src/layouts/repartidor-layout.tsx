import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/login/auth-context';
import { useState } from 'react';
import { Ico } from '@/components/Icon';
import { usePushToken } from '../shared/hooks/usePushToken';

type RepartidorNavLink = { to: string; label: string; icon: 'bike' | 'note' };

const NAV_LINKS: RepartidorNavLink[] = [
  { to: '/repartidor/mis-entregas', label: 'Mis Entregas', icon: 'bike' },
  { to: '/repartidor/por-rendir', label: 'Por Rendir', icon: 'note' },
];

export default function RepartidorLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const push = usePushToken();

  const handleLogout = () => {
    logout();
    navigate('/auth/login', { replace: true });
  };

  return (
    <div className="min-h-screen y-shell y-bkg-auth">
      <header className="y-header border-b border-[#E5E5E5]">
        <div className="y-header .in max-w-2xl mx-auto px-4 py-3">
          <div className="y-header .in y-logo">
            <span className="w s">Yemheng</span>
          </div>
          <nav className="y-header .in y-nav">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                className={`y-nav-link ${location.pathname === link.to ? 'active' : ''}`}
                to={link.to}
              >
                <Ico n={link.icon} size={18} /> {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-2">
            <button
              type="button"
              onClick={() => void (push.registered ? push.unregisterToken() : push.registerToken())}
              disabled={push.loading}
              className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
            >
              {push.loading
                ? 'Configurando avisos…'
                : push.registered
                  ? 'Desactivar avisos'
                  : 'Activar avisos de entrega'}
            </button>
            {push.error && (
              <p role="alert" className="mt-1 text-xs text-red-700">
                {push.error === 'FIREBASE_WEB_CONFIG_MISSING' || push.error === 'FIREBASE_VAPID_KEY_MISSING'
                  ? 'Faltan las variables públicas de Firebase Web/VAPID en el frontend.'
                  : push.error === 'PUSH_PERMISSION_NOT_GRANTED'
                    ? 'Permite las notificaciones en el navegador para activarlas.'
                    : push.error === 'PUSH_NOT_SUPPORTED'
                      ? 'Este navegador no admite notificaciones push.'
                      : 'No se pudieron configurar las notificaciones. Revisa la conexión e inténtalo otra vez.'}
              </p>
            )}
          </div>
        </div>
      </header>

      <main className="p-4">
        <Outlet />
      </main>

      <footer className="y-footer y-footer-small mt-auto border-t border-[#E5E5E5]">
        <div className="max-w-2xl mx-auto px-4 py-3 text-center text-sm text-gray-500">
          Chifa Yemheng · División Delivery · 2026
        </div>
      </footer>

      {/* Modal logout */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl p-6 shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4">Cerrar sesión</h3>
            <p>¿Estás seguro de querer cerrar sesión?</p>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowLogoutModal(false)} className="rounded-xl bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200">Cancelar</button>
              <button onClick={handleLogout} className="rounded-xl bg-[#A61E22] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7F1518]">Cerrar sesión</button>
            </div>
          </div>
        </div>
      )}
      <button
        className="fixed bottom-4 right-4 rounded-full bg-[#A61E22] p-3 text-white shadow-lg"
        onClick={() => setShowLogoutModal(true)}
        aria-label="Cerrar sesión"
      >
        <Ico n="bike" size={20} />
      </button>
    </div>
  );
}