# Spec: caja — turnos, pagos y movimientos

## Reglas del módulo

- Toda venta se registra en un turno de caja abierto y genera una venta y un comprobante.
- Una venta puede combinar efectivo, tarjeta y transferencia. La suma de los pagos debe coincidir exactamente con el total; el excedente entregado en efectivo es vuelto.
- Cada pago conserva su medio, importe, referencia y, para transferencias, banco y número de operación.
- En modalidad `POR_CONSUMO`, cada pago se atribuye al cliente que lo realiza. La suma por cliente debe coincidir con su consumo asignado y el total de la venta.
- Solo los importes de pagos y movimientos que afectan efectivo modifican el saldo físico esperado.
- Ingresos, egresos, devoluciones y ajustes manuales requieren permiso `CAJ_EGRESO`, se asocian al turno activo y no pueden registrarse luego de solicitar/cerrar el turno.
- El cierre calcula ingresos, egresos y efectivo esperado; el responsable declara el efectivo contado y un usuario distinto autorizado valida el cierre.

## Endpoints (`/api/v1/caja`, autenticados)

- `GET /maestros` — cajas, métodos de pago y conceptos de movimiento.
- `GET /pendientes` — pedidos no anulados ni facturados disponibles para cobro.
- `GET /cierres/pendientes` (`CAJ_VALIDAR_CIERRE`) — cierres de turno pendientes de validación.
- `POST /turno` (`CAJ_APERTURAR` | `CAJA_APERTURA`) — `{ cajaId, montoInicial }`.
- `POST /cobro` (`VEN_COBRAR` | `VEN_EMITIR`) — `{ pedidoId, cajaId, tipoDocumento, clienteId?, pagos:[{ metodoPagoId, monto, montoRecibido?, referencia?, banco?, clienteId? }], aportes? }`. Devuelve `{ idVenta, serie, numero, total, vuelto }`.
- `POST /movimientos` (`CAJ_EGRESO`) — `{ cajaId, conceptoId, metodoPagoId, monto, descripcion, referencia?, banco? }`.
- `POST /turno/cierre` (`CAJ_CERRAR`) solicita el arqueo. `POST /turno/cierre/confirmar` (`CAJ_VALIDAR_CIERRE`) lo confirma.
- Puede solicitar el cierre cualquier usuario con permiso `CAJ_CERRAR`, aunque no sea quien abrió el turno. La validación debe realizarla otro usuario autorizado.

## Cobro y concurrencia

- La operación de cobro es transaccional: valida la caja y el pedido, recalcula el total, registra una venta/comprobante y crea un pago y movimiento por cada medio.
- El resumen del turno por medio se calcula neteando los movimientos activos: los ingresos suman y los egresos restan en el medio asociado. Este saldo incluye cobros de ventas y movimientos manuales y no reemplaza el reporte de ventas.
- Boleta (`03`) conserva los datos de cliente ya existentes. Factura (`01`) requiere cliente empresa con RUC.
- Tarjeta y transferencia requieren referencia/operación; transferencia registra también el banco. En efectivo se valida lo recibido por encima del monto asignado y se devuelve el vuelto correspondiente.
- Cualquier fallo cancela toda la operación. El pedido no queda facturado parcialmente.

## Historial, movimientos del turno y reporte Z

- `GET /caja/movimientos` — movimientos del turno activo con concepto, método, monto, descripción, fecha y usuario.
- `GET /caja/historial?page=&limit=&desde=&hasta=` — turnos paginados con `id`, `caja`, `numeroTurno`, `fApertura`, `fCierre`, `montoInicial`, `montoSistema`, `montoDeclarado`, `diferencia`, `situacion`, `usuario`.
- `GET /caja/reporte-z?desde=&hasta=` — reporte Z diario con:
  - Por método de pago: cantidad y monto total.
  - Por tipo documento (`01` factura / `03` boleta): cantidad y monto.
  - Totales: ventas, cobrado, diferencias.
  - Por caja: ventas y cobrado.

## Errores

- `400 VALIDATION_ERROR`; `404` para entidades inexistentes.
- `409` para caja cerrada, pedido cobrado/anulado, cierre no disponible, turno ya cerrado o no hay turno activo.
- `422` para importes que no cuadran, aportes incorrectos, medio inválido, referencia/banco faltante o efectivo insuficiente.
- `503` si hay migración de pagos mixtos pendiente (`MIGRACION_CAJA_PAGOS_MIXTOS_PENDIENTE`).
