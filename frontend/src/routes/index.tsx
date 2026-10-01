import { createBrowserRouter, Navigate } from 'react-router-dom';
import { CategoriasPage } from '../features/admin/categorias/categorias-page';
import { ClientesPage } from '../features/admin/clientes/clientes-page';
import { DashboardPage } from '../features/admin/dashboard/dashboard-page';
import { MesasPage } from '../features/admin/mesas/mesas-page';
import { PersonalPage } from '../features/admin/personal/personal-page';
import { ProductosPage } from '../features/admin/productos/productos-page';
import { LoginPage } from '../features/auth/login/login-page';
import { ClienteLoginPage } from '../features/cliente/login/cliente-login-page';
import { AdminShell } from '../layouts/admin-shell';
import { PublicShell } from '../layouts/public-shell';
import { AuthGuard, PublicGuard, RoleGuard } from './guards';

export const router = createBrowserRouter([
  {
    path: '/auth',
    element: <PublicShell />,
    children: [
      {
        path: 'login',
        element: (
          <PublicGuard>
            <LoginPage />
          </PublicGuard>
        ),
      },
    ],
  },
  {
    // Login cliente PRUEBA (add-cliente-login-prueba): página visual sin
    // guards a propósito (PublicGuard rebotaría a /admin con sesión staff).
    path: '/cliente',
    element: <PublicShell />,
    children: [{ path: 'login', element: <ClienteLoginPage /> }],
  },
  {
    path: '/admin',
    element: (
      <AuthGuard>
        <RoleGuard roles={['ADMINISTRADOR', 'SUPERVISOR']}>
          <AdminShell />
        </RoleGuard>
      </AuthGuard>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      {
        path: 'categorias',
        element: (
          <RoleGuard roles={['ADMINISTRADOR', 'SUPERVISOR']}>
            <CategoriasPage />
          </RoleGuard>
        ),
      },
      {
        path: 'productos',
        element: (
          <RoleGuard roles={['ADMINISTRADOR', 'SUPERVISOR']}>
            <ProductosPage />
          </RoleGuard>
        ),
      },
      {
        path: 'clientes',
        element: (
          <RoleGuard roles={['ADMINISTRADOR', 'SUPERVISOR', 'CAJERO']}>
            <ClientesPage />
          </RoleGuard>
        ),
      },
      {
        path: 'personal',
        element: (
          <RoleGuard roles={['ADMINISTRADOR', 'GERENTE']}>
            <PersonalPage />
          </RoleGuard>
        ),
      },
      {
        path: 'mesas',
        element: (
          <RoleGuard roles={['ADMINISTRADOR', 'SUPERVISOR']}>
            <MesasPage />
          </RoleGuard>
        ),
      },
    ],
  },
  { path: '*', element: <Navigate to="/auth/login" replace /> },
]);
