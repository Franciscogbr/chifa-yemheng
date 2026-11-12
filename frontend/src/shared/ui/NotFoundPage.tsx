import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/login/auth-context';

type TipoUsuario = 'CLIENTE' | 'REPARTIDOR' | 'DELIVERY' | 'CAJERO' | 'MOZO' | 'ADMIN' | 'ADMIN_SUPERVISOR' | string;

export function NotFoundPage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const tipo = (usuario?.tipo || '').toUpperCase() as TipoUsuario;

  const esCliente = tipo === 'CLIENTE';
  const esRepartidor = tipo === 'REPARTIDOR' || tipo === 'DELIVERY';
  const esCajero = tipo === 'CAJERO';
  const esMozo = tipo === 'MOZO';
  const esAdmin = tipo === 'ADMIN' || tipo === 'ADMIN_SUPERVISOR';

  const obtenerRutaPrincipal = (): string => {
    if (esAdmin) return '/admin';
    if (esCajero) return '/admin/caja';
    if (esMozo) return '/staff/mozo';
    if (esRepartidor) return '/repartidor/mis-entregas';
    if (esCliente) return '/cliente/inicio';
    return '/cliente/login';
  };

  const obtenerMensaje = (): string => {
    if (esAdmin) return 'Panel de Administración';
    if (esCajero) return 'Punto de Venta - Caja';
    if (esMozo) return 'Mesa de Mozo';
    if (esRepartidor) return 'Mis Entregas';
    if (esCliente) return 'Mis Pedidos';
    return 'Inicio';
  };

  const obtenerDescripcion = (): string => {
    if (esAdmin) return 'Gestiona pedidos, personal, inventario y reportes del negocio.';
    if (esCajero) return 'Procesa pagos, cierra cuentas y gestiona la caja.';
    if (esMozo) return 'Atiende mesas, toma pedidos y gestiona comandas.';
    if (esRepartidor) return 'Consulta y actualiza el estado de tus entregas.';
    if (esCliente) return 'Consulta tu menú, haz pedidos y sigue el estado de tus entregas.';
    return 'Accede al sistema.';
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fbf9f8',
        padding: '24px',
        fontFamily: "'Chifa Sans', ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: '480px', textAlign: 'center', backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #f0eded' }}>
        <div style={{ fontSize: '72px', fontWeight: '700', color: '#a61e22', lineHeight: '1', marginBottom: '16px' }}>404</div>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1b1c1c', margin: '0 0 12px' }}>Página no encontrada</h1>
        <p style={{ color: '#5a413e', margin: '0 0 24px' }}>{obtenerDescripcion()}</p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
          <button
            onClick={() => navigate(obtenerRutaPrincipal())}
            style={{
              backgroundColor: '#a61e22',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'background-color 0.2s',
            }}
          >
            Ir a {obtenerMensaje()}
          </button>
        </div>

        {usuario && (
          <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f6f3f2', borderRadius: '8px' }}>
            <p style={{ color: '#7c1316', fontSize: '13px', margin: '0 0 8px' }}>Sesión activa como</p>
            <p style={{ color: '#1b1c1c', fontWeight: '700', margin: '0' }}>
              {usuario.logeo} ({usuario.tipo})
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
