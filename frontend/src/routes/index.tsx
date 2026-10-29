import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthGuard, PublicGuard, RoleGuard, AreaGuard, ClienteAuthGuard, ClientePublicGuard } from './guards';
import { ADMIN_ROLES } from './admin-access';
import { useAuth } from '../features/auth/login/auth-context';
import { RouteError } from '../shared/ui/route-error';
import { AdminShell } from '../layouts/admin-shell';
import ClientLayout from '../layouts/client-layout';
import { PublicShell } from '../layouts/public-shell';
import RepartidorLayout from '../layouts/repartidor-layout';

// Auth
import { LoginPage } from '../features/auth/login/login-page';
import { RepartidorLoginPage } from '../features/repartidor/login-page';
import { ClienteLoginPage } from '../features/cliente/login/cliente-login-page';

// Landing
import LandingPage from '../features/landing/landing-page';

// Admin Pages
import { DashboardPage } from '../features/admin/dashboard/dashboard-page';
import { CategoriasPage } from '../features/admin/categorias/categorias-page';
import { ProductosPage } from '../features/admin/productos/productos-page';
import { UnidadesPage } from '../features/admin/unidades/unidades-page';
import { ClientesPage } from '../features/admin/clientes/clientes-page';
import { PersonalPage } from '../features/admin/personal/personal-page';
import { MesasPage } from '../features/admin/mesas/mesas-page';
import { AdminReportesPage } from '../features/admin/reportes/reportes-page';
import { AdminAuditoriaPage } from '../features/admin/auditoria/auditoria-page';
import { AdminUsuariosPage } from '../features/admin/usuarios/usuarios-page';
import { AdminInventarioPage } from '../features/admin/inventario/inventario-page';
import { AdminEmpleadosPage } from '../features/admin/empleados/empleados-page';
import { AdminCrudPage } from '../features/admin/crud/crud-page';
import { AdminReservasPage } from '../features/admin/reservas-admin/reservas-admin-page';
import { ParametrosDeliveryPage } from '../features/admin/parametros-delivery/parametros-delivery-page';
import { PedidosDeliveryPage } from '../features/admin/pedidos-delivery/PedidosDeliveryPage';
import { AdminPedidosPage } from '../features/admin/pedidos/pedidos-page';

// Staff Pages
import { StaffMozoPage } from '../features/staff/mozo/mozo-page';
import { StaffCajaPage } from '../features/staff/caja/caja-page';
import { StaffDeliveryPage } from '../features/staff/delivery/delivery-page';
import { StaffCocinaPage } from '../features/staff/cocina/cocina-page';

// Repartidor Pages
import { MisEntregasPage } from '../features/repartidor/mis-entregas/mis-entregas-page';
import { EntregaDetallePage } from '../features/repartidor/entrega-detalle/entrega-detalle-page';
import { PorRendirPage } from '../features/repartidor/por-rendir/por-rendir-page';

// Cliente Pages
import { ClienteHubPage } from '../features/cliente/inicio/cliente-hub-page';
import { ClienteMenuPage } from '../features/cliente/menu/menu-page';
import { ClienteComandaPage } from '../features/cliente/comanda/comanda-page';
import { ClientePerfilPage } from '../features/cliente/perfil/perfil-page';
import { ClienteHistorialPage } from '../features/cliente/historial/historial-page';
import { ClienteReservasPage } from '../features/cliente/reservas/reservas-page';
import { ClienteReservaNuevaPage } from '../features/cliente/reservas/reserva-nueva-page';
import { ClienteDeliveryPage } from '../features/cliente/delivery/delivery-page';
import { ClientePedidoTrackingPage } from '../features/cliente/pedido/pedido-tracking-page';
import { ClienteMiConsumoPage } from '../features/cliente/consumo/mi-consumo-page';
import { ClienteResetClavePage } from '../features/cliente/reset/reset-clave-page';
import MesaQrPage from '../features/cliente/mesa/mesa-qr-page';

function AdminHomeRoute() {
  const { usuario } = useAuth();
  if (usuario?.tipo.toUpperCase() === 'CAJERO') {
    return <Navigate to="/admin/caja" replace />;
  }
  return <RoleGuard roles={ADMIN_ROLES.adminSupervisor}><DashboardPage /></RoleGuard>;
}


export const router = createBrowserRouter([
  // 1. AUTH PÚBLICO
  {
    path: '/auth',
    element: <PublicShell />,
    errorElement: <RouteError />,
    children: [
      {
        path: 'login',
        element: (
          <PublicGuard>
            <LoginPage />
          </PublicGuard>
        ),
      },
      {
        path: 'repartidor-login',
        element: (
          <PublicGuard>
            <RepartidorLoginPage />
          </PublicGuard>
        ),
      },
    ],
  },

  // 2. CLIENTE (ClientLayout + ClienteAuthGuard)
  {
    path: '/',
    element: <ClientLayout />,
    errorElement: <RouteError />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: 'cliente/login',
        element: <ClientePublicGuard><ClienteLoginPage /></ClientePublicGuard>,
      },
      {
        path: 'cliente/mesa/:id',
        element: <MesaQrPage />,
      },
      {
        path: 'cliente/inicio',
        element: <ClienteAuthGuard><ClienteHubPage /></ClienteAuthGuard>,
      },
      {
        path: 'cliente/menu',
        element: <ClienteMenuPage />,
      },
      {
        path: 'cliente/comanda',
        element: <ClienteAuthGuard><ClienteComandaPage /></ClienteAuthGuard>,
      },
      {
        path: 'cliente/mi-consumo',
        element: <ClienteAuthGuard><ClienteMiConsumoPage /></ClienteAuthGuard>,
      },
      {
        path: 'cliente/perfil',
        element: <ClienteAuthGuard><ClientePerfilPage /></ClienteAuthGuard>,
      },
      {
        path: 'cliente/historial',
        element: <ClienteAuthGuard><ClienteHistorialPage /></ClienteAuthGuard>,
      },
      {
        path: 'cliente/reservas',
        element: <ClienteReservasPage />,
      },
      {
        path: 'cliente/reservar',
        element: <ClienteAuthGuard><ClienteReservaNuevaPage /></ClienteAuthGuard>,
      },
      {
        path: 'cliente/delivery',
        element: <ClienteDeliveryPage />,
      },
      {
        path: 'cliente/pedido/:id',
        element: <ClienteAuthGuard><ClientePedidoTrackingPage /></ClienteAuthGuard>,
      },
      {
        path: 'cliente/restablecer',
        element: <ClientePublicGuard><ClienteResetClavePage /></ClientePublicGuard>,
      },
    ],
  },

  // 3. ADMIN (AuthGuard en el padre; cada ruta hija valida su rol/área)
  {
    path: '/admin',
    element: <AuthGuard><AdminShell /></AuthGuard>,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <AdminHomeRoute /> },
      {
        path: 'categorias',
        element: <RoleGuard roles={ADMIN_ROLES.adminSupervisor}><CategoriasPage /></RoleGuard>,
      },
      {
        path: 'productos',
        element: <RoleGuard roles={ADMIN_ROLES.adminSupervisor}><ProductosPage /></RoleGuard>,
      },
      {
        path: 'unidades',
        element: <RoleGuard roles={ADMIN_ROLES.adminSupervisor}><UnidadesPage /></RoleGuard>,
      },
      {
        path: 'clientes',
        element: <RoleGuard roles={ADMIN_ROLES.customers}><ClientesPage /></RoleGuard>,
      },
      {
        path: 'personal',
        element: <RoleGuard roles={ADMIN_ROLES.admin}><PersonalPage /></RoleGuard>,
      },
      {
        path: 'mesas',
        element: <RoleGuard roles={ADMIN_ROLES.adminSupervisor}><MesasPage /></RoleGuard>,
      },
      {
        path: 'cocina',
        element: <RoleGuard roles={ADMIN_ROLES.kitchen}><AreaGuard area="COCINA"><StaffCocinaPage /></AreaGuard></RoleGuard>,
      },
      {
        path: 'mozo',
        element: <RoleGuard roles={ADMIN_ROLES.waiter}><AreaGuard area="MOZO"><StaffMozoPage /></AreaGuard></RoleGuard>,
      },
      {
        path: 'caja',
        element: <RoleGuard roles={ADMIN_ROLES.cashier}><AreaGuard area="CAJA"><StaffCajaPage /></AreaGuard></RoleGuard>,
      },
      {
        path: 'delivery',
        element: <RoleGuard roles={ADMIN_ROLES.delivery}><StaffDeliveryPage /></RoleGuard>,
      },
      {
        path: 'pedidos',
        element: <RoleGuard roles={ADMIN_ROLES.orders}><AdminPedidosPage /></RoleGuard>,
      },
      {
        path: 'pedidos-delivery',
        element: <RoleGuard roles={ADMIN_ROLES.delivery}><PedidosDeliveryPage /></RoleGuard>,
      },
      {
        path: 'reportes',
        element: <RoleGuard roles={ADMIN_ROLES.adminSupervisor}><AdminReportesPage /></RoleGuard>,
      },
      {
        path: 'auditoria',
        element: <RoleGuard roles={ADMIN_ROLES.admin}><AdminAuditoriaPage /></RoleGuard>,
      },
      {
        path: 'usuarios',
        element: <RoleGuard roles={ADMIN_ROLES.adminSupervisor}><AdminUsuariosPage /></RoleGuard>,
      },
      {
        path: 'inventario',
        element: <RoleGuard roles={ADMIN_ROLES.inventory}><AdminInventarioPage /></RoleGuard>,
      },
      {
        path: 'empleados',
        element: <RoleGuard roles={ADMIN_ROLES.admin}><AdminEmpleadosPage /></RoleGuard>,
      },
      {
        path: 'crud',
        element: <RoleGuard roles={ADMIN_ROLES.admin}><AdminCrudPage /></RoleGuard>,
      },
      {
        path: 'reservas-admin',
        element: <RoleGuard roles={ADMIN_ROLES.reservations}><AdminReservasPage /></RoleGuard>,
      },
      {
        path: 'parametros-delivery',
        element: <RoleGuard roles={ADMIN_ROLES.admin}><ParametrosDeliveryPage /></RoleGuard>,
      },
    ],
  },

  // 4. REPARTIDOR (RepartidorLayout + AuthGuard + RoleGuard REPARTIDOR)
  {
    path: '/repartidor/login',
    element: <PublicGuard><RepartidorLoginPage /></PublicGuard>,
    errorElement: <RouteError />,
  },
  {
    path: '/repartidor',
    element: <AuthGuard><RoleGuard roles={['REPARTIDOR', 'DELIVERY']}><RepartidorLayout /></RoleGuard></AuthGuard>,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Navigate to="/repartidor/mis-entregas" replace /> },
      { path: 'mis-entregas', element: <RoleGuard roles={['REPARTIDOR', 'DELIVERY']}><MisEntregasPage /></RoleGuard> },
      { path: 'entrega/:id', element: <RoleGuard roles={['REPARTIDOR', 'DELIVERY']}><EntregaDetallePage /></RoleGuard> },
      { path: 'por-rendir', element: <RoleGuard roles={['REPARTIDOR', 'DELIVERY']}><PorRendirPage /></RoleGuard> },
    ],
  },

  { path: '*', element: <Navigate to="/auth/login" replace /> },
])
