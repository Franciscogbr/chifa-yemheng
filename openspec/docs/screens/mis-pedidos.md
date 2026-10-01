# Mis Pedidos

## Información General

### Nombre

Mis Pedidos

### Ruta

```text
/cliente/mis-pedidos
```

### Shell

```text
PublicShell
```

### Feature

```text
features/cliente/pedidos
```

### Roles Permitidos

```text
CLIENTE
```

### Permisos

```text
CLIENTE_PEDIDOS
```

---

# Objetivo

Permitir que el cliente consulte el historial completo de pedidos realizados desde la plataforma.

Incluye:

- Pedidos QR.
- Pedidos delivery.
- Pedidos para llevar.
- Estado de pedidos.
- Comprobantes emitidos.
- Historial de consumo.
- Totales gastados.
- Repetición de pedidos.

---

# Usuarios Objetivo

```text
CLIENTE
```

---

# Layout

## Tipo

```text
Historial y Consulta
```

---

## Estructura General

```text
┌──────────────────────────────┐
│ Resumen                      │
├──────────────────────────────┤
│ Filtros                      │
├──────────────────────────────┤
│ Pedidos                      │
├──────────────────────────────┤
│ Detalle Pedido               │
├──────────────────────────────┤
│ Comprobantes                 │
└──────────────────────────────┘
```

---

# Sección 1: Resumen

## Mostrar

```text
Total Pedidos

Consumo Histórico

Pedidos QR

Pedidos Delivery

Pedidos Para Llevar
```

---

### Ejemplo

```text
Total Pedidos: 58

Consumo Histórico:
S/. 5,280.00

QR: 35

Delivery: 18

Para Llevar: 5
```

---

# Sección 2: Filtros

## Fecha

```text
Desde

Hasta
```

---

## Tipo Pedido

```text
Todos

Mesa QR

Delivery

Para Llevar
```

---

## Estado

```text
Todos

Abierto

Servido

Facturado

Anulado
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

# Sección 3: Listado de Pedidos

## Tarjeta Pedido

Mostrar:

```text
Código

Fecha

Tipo Pedido

Estado

Total

Comprobante
```

---

### Ejemplo

```text
PED-2026-001258

25/09/2026

Mesa QR

Facturado

S/. 86.00

Boleta
```

---

# Tipos de Pedido

## Mesa QR

```text
Pedido realizado desde mesa.
```

---

## Delivery

```text
Entrega a domicilio.
```

---

## Para Llevar

```text
Recojo en local.
```

---

# Estados del Pedido

## Abierto

```text
Pedido en proceso.
```

---

## En Preparación

```text
Preparándose.
```

---

## Servido

```text
Entregado.
```

---

## Facturado

```text
Venta finalizada.
```

---

## Anulado

```text
Pedido cancelado.
```

---

# Sección 4: Detalle Pedido

## Información General

Mostrar:

```text
Código

Fecha

Hora

Tipo

Estado
```

---

# Datos de Consumo

## Tabla

| Campo | Descripción |
|---------|---------|
| Producto | Producto |
| Cantidad | Cantidad |
| Precio | Unitario |
| Importe | Total |

---

### Ejemplo

```text
2 Chaufa Especial

S/. 25.00

S/. 50.00
```

---

```text
1 Wantán Frito

S/. 18.00

S/. 18.00
```

---

```text
2 Inka Cola

S/. 6.00

S/. 12.00
```

---

# Totales

## Subtotal

```text
Base imponible.
```

---

## IGV

```text
18%
```

---

## Total

```text
Monto final.
```

---

# Información de Mesa

Visible para:

```text
Mesa QR
```

---

Mostrar:

```text
Mesa

Ambiente
```

---

# Información Delivery

Visible para:

```text
Delivery
```

---

Mostrar:

```text
Dirección

Distrito

Costo Envío
```

---

# Participantes

Visible para:

```text
Comandas QR compartidas
```

---

Mostrar:

```text
Participantes mesa.
```

### Ejemplo

```text
Juan Pérez

María López

Carlos Ramos
```

---

# Sección 5: Comprobantes

## Información

Mostrar:

```text
Tipo

Serie

Número

Fecha Emisión
```

---

### Ejemplo

```text
Boleta

B001

00000128

25/09/2026
```

---

# Descargas

## Descargar PDF

```text
Comprobante PDF.
```

---

## Reenviar Correo

```text
Enviar comprobante nuevamente.
```

---

# Estadísticas Personales

## Consumo Total

```text
Monto histórico gastado.
```

---

## Ticket Promedio

```text
Promedio por pedido.
```

---

## Producto Favorito

```text
Producto más solicitado.
```

---

## Última Compra

```text
Fecha y monto.
```

---

# Acciones Disponibles

## Ver Detalle

```text
Abre información completa.
```

---

## Descargar Comprobante

```text
PDF.
```

---

## Repetir Pedido

Disponible para:

```text
Delivery

Para Llevar
```

---

## Compartir

```text
Compartir comprobante.
```

---

# Restricciones

## No Permitido

```text
Modificar pedidos históricos.
```

---

## No Permitido

```text
Eliminar pedidos facturados.
```

---

## No Permitido

```text
Consultar pedidos de otros clientes.
```

---

# Reglas de Negocio

## BR-ACC-044

```text
El cliente debe encontrarse
autenticado mediante Gmail.
```

---

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

## BR-EST-011

```text
La comanda QR pertenece a la mesa
y puede tener múltiples participantes.
```

---

## BR-INF-050

```text
El historial se asocia al cliente
identificado mediante Gmail.
```

---

# Seguridad

## Rol

```text
CLIENTE
```

---

## Autenticación

```text
OAuth Google obligatorio.
```

---

## Restricción

```text
Solo visualiza pedidos propios.
```

---

# APIs

## Mis Pedidos

```http
GET /api/cliente/pedidos
```

---

## Detalle Pedido

```http
GET /api/cliente/pedidos/{id}
```

---

## Historial

```http
GET /api/cliente/pedidos/historial
```

---

## Comprobante PDF

```http
GET /api/comprobantes/{id}/pdf
```

---

## Reenviar Comprobante

```http
POST /api/comprobantes/{id}/reenviar
```

---

## Estadísticas

```http
GET /api/cliente/pedidos/estadisticas
```

---

# Base de Datos

## Tablas

```text
PEDIDO

DETALLE_PEDIDO

VENTA

BOLETA

FACTURA

CLIENTE

PEDIDO_DELIVERY

AUDITORIA
```

---

# Auditoría

Registrar:

```text
Consulta historial

Visualización detalle

Descarga comprobante

Reenvío comprobante
```

---

# Estados de Pantalla

## Loading

```text
Skeleton listado.
```

---

## Sin Pedidos

```text
Aún no existen pedidos registrados.
```

---

## Error

```text
No fue posible obtener la información.
```

---

## Sin Conexión

```text
Verifique su conexión a internet.
```

---

# Responsive

## Desktop

```text
Listado y detalle simultáneo.
```

---

## Tablet

```text
Listado superior y detalle inferior.
```

---

## Mobile

```text
Cards por pedido.

Detalle en pantalla independiente.
```

---

# Casos Especiales

## Pedido QR Compartido

```text
Mostrar participantes asociados
a la mesa.
```

---

## Pedido Delivery

```text
Mostrar dirección de entrega.
```

---

## Pedido Con Factura

```text
Mostrar razón social y RUC.
```

---

## Comprobante No Disponible

```text
Mostrar opción de reenvío.
```

---

# Criterios de Aceptación

## Escenario 1

```gherkin
Given un cliente autenticado
When consulta Mis Pedidos
Then visualiza únicamente su historial
```

---

## Escenario 2

```gherkin
Given un pedido QR compartido
When consulta el detalle
Then visualiza la información de la mesa y participantes
```

---

## Escenario 3

```gherkin
Given una venta facturada
When consulta el pedido
Then puede descargar el comprobante PDF
```

---

## Escenario 4

```gherkin
Given un historial con múltiples pedidos
When aplica filtros por tipo y fecha
Then el sistema muestra únicamente los resultados coincidentes
```

---

## Escenario 5

```gherkin
Given un pedido delivery anterior
When selecciona Repetir Pedido
Then el sistema permite iniciar un nuevo pedido con los mismos productos
```