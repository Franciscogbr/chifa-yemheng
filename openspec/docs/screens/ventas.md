# Ventas

## Información General

### Nombre

Ventas

### Ruta

```text
/ventas
```

### Shell

```text
StaffShell
```

### Feature

```text
features/ventas
```

### Roles Permitidos

```text
CAJERO
SUPERVISOR
ADMIN
```

### Permisos

```text
VEN_VER
VEN_CREAR
VEN_CONSULTAR
VEN_EXPORTAR
VEN_NOTACREDITO
```

---

# Objetivo

Permitir consultar, gestionar y auditar las ventas realizadas por el restaurante.

Permite:

- Consultar ventas.
- Visualizar comprobantes emitidos.
- Consultar métodos de pago.
- Revisar ventas QR.
- Revisar ventas delivery.
- Generar reportes.
- Exportar información.
- Emitir notas de crédito autorizadas.
- Consultar estadísticas comerciales.

---

# Usuarios Objetivo

```text
CAJERO

SUPERVISOR

ADMIN
```

---

# Layout

## Tipo

```text
Consulta Comercial
```

---

## Estructura General

```text
┌──────────────────────────────┐
│ Indicadores                  │
├──────────────────────────────┤
│ Filtros                      │
├──────────────────────────────┤
│ Ventas                       │
├──────────────────────────────┤
│ Detalle Venta                │
├──────────────────────────────┤
│ Comprobantes                 │
└──────────────────────────────┘
```

---

# Sección 1: Indicadores

## Ventas del Día

Mostrar:

```text
Cantidad ventas
```

---

## Importe del Día

Mostrar:

```text
Monto total vendido
```

---

## Ticket Promedio

Mostrar:

```text
Promedio por venta
```

---

## Clientes Atendidos

Mostrar:

```text
Cantidad clientes
```

---

### Ejemplo

```text
Ventas:
125

Total:
S/. 8,540.00

Ticket Promedio:
S/. 68.32

Clientes:
98
```

---

# Sección 2: Filtros

## Fecha

```text
Desde

Hasta
```

---

## Comprobante

```text
Todos

Boleta

Factura

Ticket
```

---

## Tipo Pedido

```text
Todos

Mesa

Delivery

Para Llevar
```

---

## Método Pago

```text
Todos

Efectivo

Yape

Plin

Tarjeta

Transferencia
```

---

## Estado

```text
Todos

Facturada

Anulada
```

---

## Cajero

```text
Todos

Usuario específico
```

---

# Sección 3: Listado de Ventas

## Tabla

| Campo | Descripción |
|---------|---------|
| Fecha | Fecha venta |
| Hora | Hora |
| Documento | Serie y número |
| Cliente | Cliente |
| Tipo Pedido | Origen |
| Método Pago | Medio de pago |
| Total | Importe |
| Cajero | Responsable |
| Estado | Activa / Anulada |

---

### Ejemplo

```text
B001-00001528

Juan Pérez

Mesa

Yape

S/. 86.00
```

---

# Estados de Venta

## Facturada

```text
Venta válida.
```

Color:

```text
Verde
```

---

## Anulada

```text
Venta anulada mediante
nota de crédito.
```

Color:

```text
Rojo
```

---

# Sección 4: Detalle de Venta

## Información General

Mostrar:

```text
Código Venta

Fecha

Hora

Cliente

Cajero

Tipo Pedido
```

---

## Comprobante

Mostrar:

```text
Tipo

Serie

Número

Fecha Emisión
```

---

## Productos

### Tabla

| Campo | Descripción |
|---------|---------|
| Producto | Nombre |
| Cantidad | Cantidad |
| Precio | Unitario |
| Importe | Subtotal |

---

# Información de Pago

## Mostrar

```text
Método Pago

Monto Pagado

Vuelto
```

---

### Ejemplo

```text
Método:
Efectivo

Monto:
S/. 100.00

Vuelto:
S/. 14.00
```

---

# Totales

## Subtotal

```text
Base gravada.
```

---

## IGV

```text
18%
```

---

## Descuento

```text
Monto descuento.
```

---

## Total

```text
Monto final.
```

---

# Sección 5: Comprobantes

## Visualización

Mostrar:

```text
Boleta

Factura

Ticket
```

---

## Acciones

### Ver

```text
Previsualización.
```

---

### Descargar PDF

```text
PDF comprobante.
```

---

### Reenviar

```text
Correo electrónico.
```

---

# Nota de Crédito

## Disponibilidad

```text
Solo Supervisor y Admin.
```

---

## Motivo

Obligatorio.

Opciones:

```text
Error de digitación

Venta anulada

Devolución

Otro
```

---

## Resultado

```text
Venta Anulada

Generación de Nota de Crédito
```

---

# Estadísticas Comerciales

## Ventas por Tipo

Mostrar:

```text
Mesa

Delivery

Para Llevar
```

---

## Ventas por Método Pago

Mostrar:

```text
Efectivo

Yape

Plin

Tarjeta

Transferencia
```

---

## Top Productos

Mostrar:

```text
Más vendidos
```

---

## Top Clientes

Mostrar:

```text
Mayor consumo
```

---

# Exportaciones

## Excel

```text
Ventas filtradas.
```

---

## PDF

```text
Reporte comercial.
```

---

# Restricciones

## No Permitido

```text
Modificar ventas facturadas.
```

---

## No Permitido

```text
Eliminar ventas.
```

---

## No Permitido

```text
Emitir nota de crédito
sin autorización.
```

---

# Reglas de Negocio

## BR-EST-005

```text
Toda venta nace de un pedido.
```

---

## BR-EST-006

```text
Una venta genera un único
comprobante.
```

---

## BR-DER-030

```text
La venta utiliza un único
método de pago.
```

---

## BR-ACC-042

```text
La facturación registra:

Venta
Comprobante
Pago
Movimiento Caja
```

---

## BR-ACC-043

```text
El cobro es realizado
por el cajero.
```

---

## BR-RES-016

```text
La factura requiere cliente
empresa con RUC.
```

---

## BR-ACC-055

```text
Solo Supervisor/Admin
pueden emitir nota de crédito.
```

---

## BR-RES-054

```text
Toda nota de crédito requiere
motivo obligatorio.
```

---

## BR-DER-029 (referencia cobro)

```text
Vuelto = Monto_Recibido − Total
(solo si > 0 y el pago es en efectivo).
El cálculo se ejecuta en caja-cobro.md
(USP_FACTURAR_PEDIDO).
```

---

## BR-DER-031 (referencia cobro)

```text
Correlativo del comprobante = siguiente número con bloqueo
(UPDLOCK/HOLDLOCK) para evitar duplicados; formato de 8 dígitos.
Serie en SERIE_DOCUMENTO (ver caja-cobro.md).
```

---

## BR-DER-056

```text
Al emitir la NC: VENTA.Anulada='S' y egreso en caja
(concepto DEVOLUCION A CLIENTE) por el total devuelto;
el egreso reduce Monto_Sistema solo si fue en efectivo.
(USP_ANULAR_VENTA_CON_NC)
```

---

## BR-EST-057

```text
Una venta admite N notas de crédito (sin límite de 1);
cada NC referencia la boleta/factura original
y usa la serie 07/BC01.
```

---

## BR-RES-015

```text
Un pedido se anula SOLO si no está facturado.
Una venta facturada solo se corrige con NOTA_CREDITO
(BR-RES-054 + USP_ANULAR_VENTA_CON_NC).
```

---

# Seguridad

## Roles

```text
CAJERO

SUPERVISOR

ADMIN
```

---

## Permisos

```text
VEN_VER

VEN_CONSULTAR

VEN_EXPORTAR

VEN_NOTACREDITO
```

---

# APIs

## Listar Ventas

```http
GET /api/ventas
```

---

## Detalle Venta

```http
GET /api/ventas/{id}
```

---

## Exportar Excel

```http
GET /api/ventas/export/excel
```

---

## Exportar PDF

```http
GET /api/ventas/export/pdf
```

---

## Comprobante PDF

```http
GET /api/ventas/{id}/pdf
```

---

## Nota Crédito

```http
POST /api/ventas/{id}/nota-credito
```

---

## Dashboard Comercial

```http
GET /api/ventas/dashboard
```

---

# Base de Datos

## Tablas

```text
VENTA

DETALLE_VENTA

PAGO_VENTA

BOLETA

FACTURA

NOTA_CREDITO

CLIENTE

USUARIO

MOVIMIENTO_CAJA

AUDITORIA
```

---

# Auditoría

Registrar:

```text
Consulta venta

Descarga comprobante

Exportación

Reenvío comprobante

Emisión nota crédito
```

---

# Estados de Pantalla

## Loading

```text
Skeleton tabla.
```

---

## Sin Datos

```text
No existen ventas registradas.
```

---

## Error

```text
No fue posible cargar las ventas.
```

---

## Sin Conexión

```text
Verifique su conexión.
```

---

# Responsive

## Desktop

```text
Tabla completa + detalle.
```

---

## Tablet

```text
Tabla resumida.
```

---

## Mobile

```text
Tarjetas por venta.
```

---

# Casos Especiales

## Venta QR Compartida

```text
Mostrar participantes
de la mesa.
```

---

## Venta Delivery

```text
Mostrar costo de envío.
```

---

## Venta Anulada

```text
Mostrar nota de crédito asociada.
```

---

## Factura

```text
Mostrar RUC y razón social.
```

---

# Criterios de Aceptación

## Escenario 1

```gherkin
Given ventas registradas
When el usuario consulta el módulo
Then visualiza el listado filtrable
```

---

## Escenario 2

```gherkin
Given una venta facturada
When consulta el detalle
Then visualiza productos, pago y comprobante
```

---

## Escenario 3

```gherkin
Given filtros aplicados
When exporta a Excel
Then obtiene únicamente los registros filtrados
```

---

## Escenario 4

```gherkin
Given un supervisor autorizado
When emite una nota de crédito
Then la venta pasa a estado Anulada
```

---

## Escenario 5

```gherkin
Given una venta QR compartida
When consulta el detalle
Then visualiza los participantes asociados a la mesa
```