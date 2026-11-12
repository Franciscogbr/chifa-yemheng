export const TEST_USUARIO_ADMIN = {
  sub: 1,
  logeo: 'admin_academico',
  roles: ['ADMIN'],
  permisos: [
    'PED_VER', 'PED_REGISTRAR', 'PED_ANULAR', 'PED_COCINA', 'PED_ENTREGAR', 'PED_EDITAR',
    'CAJA_ABRIR', 'CAJA_COBRAR', 'CAJA_CERRAR',
    'CLI_VER', 'PROD_VER', 'MES_VER', 'RES_VER',
    'EMP_VER', 'EMP_CREAR', 'EMP_EDITAR', 'EMP_ELIMINAR',
    'UNIDAD_VER', 'UNIDAD_CREAR', 'UNIDAD_EDITAR', 'UNIDAD_ELIMINAR',
    'TMESA_VER', 'TMESA_CREAR', 'TMESA_EDITAR', 'TMESA_ELIMINAR',
    'INV_VER', 'INV_CREAR', 'REC_VER', 'REC_CREAR',
    'SEG_USUARIO', 'SEG_ROL',
    'DASHBOARD_VER',
    'REN_VER', 'REN_REGISTRAR', 'REN_VALIDAR',
    'AUD_VER',
    'DELIVERY_VER', 'DELIVERY_ENTREGAR', 'DELIVERY_DESPACHAR',
    'CAT_VER', 'CAT_CREAR', 'CAT_EDITAR',
  ],
};

export const TEST_USUARIO_MOZO = {
  sub: 2,
  logeo: 'mozo_juan',
  roles: ['MOZO'],
  permisos: ['PED_VER', 'PED_REGISTRAR', 'PED_ENTREGAR', 'MES_VER', 'RES_VER', 'CLI_VER'],
};

export const TEST_USUARIO_CAJERO = {
  sub: 3,
  logeo: 'cajero_maria',
  roles: ['CAJERO'],
  permisos: ['CAJA_ABRIR', 'CAJA_COBRAR', 'CAJA_CERRAR'],
};

export const TEST_USUARIO_COCINA = {
  sub: 4,
  logeo: 'cocina_ana',
  roles: ['COCINA'],
  permisos: ['PED_COCINA', 'PED_VER'],
};

export const TEST_USUARIO_REPARTIDOR = {
  sub: 5,
  logeo: 'repartidor_carlos',
  roles: ['REPARTIDOR'],
  permisos: ['DELIVERY_VER', 'DELIVERY_ENTREGAR'],
};

export const TEST_PEDIDO_VALIDO = {
  tipo: 1,
  mesa: 1,
  comensales: 2,
  obs: 'PRUEBA_CAJA_NEGRA',
};

export const TEST_PEDIDO_CON_DETALLE = {
  tipo: 1,
  mesa: 2,
  comensales: 4,
  obs: 'Con detalle de prueba',
};

export const TEST_DETALLE_VALIDO = {
  producto: 1,
  cantidad: 2,
  nota: 'Sin cebolla',
  descuento: 0,
};

export const TEST_CAJA_APERTURA = {
  cajaId: 1,
  montoInicial: 100,
  observacion: 'PRUEBA_CAJA_NEGRA',
};

export const TEST_COBRO_VALIDO = {
  pedidoId: 1,
  cajaId: 1,
  tipoDocumento: 'BOLETA',
  pagos: [{ metodo: 'EFECTIVO', monto: 100 }],
};

export const TEST_MESA_VALIDA = {
  numero: 99,
  tipoMesaId: 1,
  capacidad: 4,
};

export const TEST_RESERVA_VALIDA = {
  fecha: '2026-12-01',
  hora: '20:00',
  comensales: 2,
};

export const TEST_CLIENTE_VALIDO = {
  nombre: 'Cliente Prueba Caja Negra',
  telefono: '999999999',
  documento: '12345678',
};

export const TEST_DELIVERY_VALIDO = {
  clienteId: 1,
  direccion: 'Direccion de prueba caja negra',
  telefono: '999999999',
  total: 25.0,
};

export const TEST_PERSONAL_VALIDO = {
  nombres: 'Empleado Prueba',
  apellidos: 'Caja Negra',
  tipoDocumento: 'DNI',
  numeroDocumento: '87654321',
  telefono: '999888777',
  correo: 'prueba@chifa.com',
  cargo: 'MOZO',
  salario: 1200,
};

export const TEST_UNIDAD_VALIDA = {
  nombre: 'Unidad Prueba',
  abreviatura: 'UND',
};

export const TEST_TIPO_MESA_VALIDO = {
  nombre: 'Tipo Prueba',
  capacidad: 4,
};

export const TEST_PRODUCTO_VALIDO = {
  nombre: 'Producto Prueba',
  precio: 15.5,
  categoriaId: 1,
  unidadId: 1,
};

export const TEST_MOVIMIENTO_INVENTARIO_VALIDO = {
  productoId: 1,
  tipo: 'ENTRADA',
  cantidad: 10,
  motivo: 'PRUEBA_CAJA_NEGRA',
};

export const TEST_USUARIO_SEGURIDAD_VALIDO = {
  empleadoId: 1,
  logeo: 'nuevo_usuario_prueba',
  clave: 'Clave123!',
  tipo: 'EMPLEADO',
};

export const TEST_ROL_VALIDO = {
  nombre: 'ROL_PRUEBA_CAJA_NEGRA',
  descripcion: 'Rol de prueba',
};

export const TEST_RENDICION_VALIDA = {
  fecha: '2026-11-12',
  monto: 150.0,
  observacion: 'PRUEBA_CAJA_NEGRA',
};

export const TEST_RESERVA_CLIENTE_VALIDA = {
  fecha: '2026-11-20',
  hora: '20:00',
  comensales: 2,
};
