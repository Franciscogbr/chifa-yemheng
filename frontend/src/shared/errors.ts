/**
 * Catálogo de códigos de error traducidos al español.
 * Se usa en toda la app para mostrar mensajes amables al cliente en lugar de
 * códigos técnicos crudos.
 */
export const ERRORES: Record<string, string> = {
  // Errores de autenticación y sesión
  NOT_FOUND: 'No se encontró el recurso solicitado.',
  CLIENTE_NOT_FOUND: 'Cliente no encontrado.',
  REPARTIDOR_NO_DISPONIBLE: 'La cuenta del repartidor no está disponible para registrar el cobro.',
  PEDIDO_INVALIDO: 'El pedido ya no está disponible para registrar el cobro.',
  AUTOSERVICIO_USER_NOT_READY: 'El usuario de autoservicio no está listo.',
  DISTRITO_NOT_FOUND: 'Distrito no encontrado.',
  FUERA_DE_COBERTURA: 'Tu dirección está fuera de la zona de cobertura.',
  INVALID_STATE: 'El estado actual no permite esta acción.',
  UNKNOWN_ERROR: 'Ocurrió un error inesperado. Inténtalo de nuevo.',
  'HTTP 401': 'Sesión expirada. Inicia sesión de nuevo.',
  'HTTP 403': 'No tienes permiso para realizar esta acción.',
  'HTTP 404': 'No se encontró lo que buscas.',
  'HTTP 500': 'Error del servidor. Inténtalo más tarde.',

  // Errores de pedido y comanda
  PEDIDO_FACTURADO: 'El pedido ya está facturado y no se puede modificar.',
  PEDIDO_ANULADO: 'El pedido ya fue anulado.',
  PRODUCTO_NO_DISPONIBLE: 'Uno de los productos ya no está disponible.',
  MESA_POR_COBRAR: 'La mesa ya pidió la cuenta; no se pueden agregar más productos.',
  LA_MESA_NO_ADMITE_NUEVOS_PARTICIPANTES: 'La mesa no admite nuevos participantes.',
  MOZO_PEDIDO_DIGITAL: 'Este pedido solo se puede gestionar de forma presencial.',
  NO_PARTICIPANTE: 'No eres participante de esta comanda.',
  NO_ES_ORGANIZADOR: 'Solo el organizador puede realizar esta acción.',
  NO_COMANDA_ACTIVA: 'No hay una comanda activa para esta mesa.',
  MESA_OCUPADA: 'La mesa ya está ocupada.',
  YA_POR_COBRAR: 'La cuenta ya está por cobrar.',
  TIPO_INVALIDO: 'Tipo de pedido inválido.',
  SIN_CUENTA: 'No hay cuenta asociada a esta mesa.',
  LA_MESA_NO_ADMITE_NUEVOS_PARTICIPANTES_FULL: 'La mesa no admite más participantes.',
  MODOPAGO_BLOQUEADO: 'El modo de pago seleccionado no está disponible.',

  // Errores de delivery y cobro
  VENTA_YA_EXISTE: 'Esta entrega ya tiene una venta registrada.',
  CAJA_NO_ABIERTA: 'No hay una caja abierta para registrar el cobro.',
  MONTO_INVALIDO: 'El monto a cobrar no es correcto.',
  DELIVERY_NO_CANCELABLE: 'Este delivery ya no se puede anular.',
  SERIE_BOLETA_FAIL: 'No se pudo generar la boleta electrónica.',
  BOLETA_FAIL: 'Error al registrar la boleta.',
  PAGO_FAIL: 'Error al registrar el pago.',
  VENTA_FAIL: 'Error al crear la venta.',
  DB_GET_FAIL: 'Error al consultar la base de datos.',
  CLIENTE_FAIL: 'Error al obtener datos del cliente.',
  METODO_PAGO_FAIL: 'Error al obtener el método de pago.',
  ENTREGA_FAIL: 'Error al marcar la entrega como realizada.',
  DB_VENTA_FAIL: 'Error al crear la venta.',
  DB_SERIE_FAIL: 'Error al generar la serie de la boleta.',
  DB_PAGO_FAIL: 'Error al registrar el pago.',
  DB_BOLETA_FAIL: 'Error al guardar la boleta.',
  DB_CLIENTE_FAIL: 'Error al buscar el cliente.',
  DB_METODO_PAGO_FAIL: 'Error al buscar el método de pago.',
  DB_ENTREGA_FAIL: 'Error al actualizar el estado de la entrega.',
  VENTA_NO_EXISTE: 'No existe una venta registrada para esta entrega.',
};

export function mensajeError(codigo: string | undefined | null): string {
  if (!codigo) return 'Ocurrió un error inesperado.';
  return ERRORES[codigo] ?? codigo;
}
