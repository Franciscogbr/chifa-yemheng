# Mi Consumo

## Información General

### Nombre

Mi Consumo

### Ruta

```text
/cliente/mi-consumo
```

### Shell

```text
PublicShell
```

### Feature

```text
features/cliente/mi-consumo
```

### Roles Permitidos

```text
CLIENTE
```

### Permisos

```text
CLIENTE_QR
```

---

# Objetivo

Permitir que los participantes de una mesa visualicen en tiempo real el estado de la comanda compartida.

Permite:

- Consultar productos consumidos.
- Ver estado de preparación.
- Visualizar productos servidos.
- Consultar total acumulado.
- Identificar quién agregó cada producto.
- Consultar participantes de la mesa.
- Solicitar cuenta.

---

# Usuarios Objetivo

```text
CLIENTE
```

---

# Concepto de Negocio

## Comanda Compartida

```text
Todos los participantes de una mesa
visualizan el mismo consumo acumulado.

La información pertenece a la mesa
y no a una persona individual.
```

---

# Actualización

## Método

```text
Polling
```

---

## Intervalo

```text
5 segundos
```

---

## Objetivo

```text
Actualizar estados de cocina y total
sin recargar la pantalla.
```

---

# Layout

## Tipo

```text
Consulta Operativa
```

---

## Estructura General

```text
┌──────────────────────────────┐
│ Mesa y Participantes         │
├──────────────────────────────┤
│ Resumen General              │
├──────────────────────────────┤
│ Consumo Actual               │
├──────────────────────────────┤
│ Estado Cocina                │
├──────────────────────────────┤
│ Totales                      │
├──────────────────────────────┤
│ Acciones                     │
└──────────────────────────────┘
```

---

# Sección 1: Información de Mesa

## Mostrar

```text
Mesa

Ambiente

Hora Ingreso

Estado Mesa
```

---

### Ejemplo

```text
Mesa 12

Primer Piso

13:15

OCUPADA
```

---

# Participantes

## Mostrar

```text
Participantes activos
```

---

### Ejemplo

```text
Juan Pérez

María López

Carlos Ramos
```

---

## Indicador

```text
3 participantes
```

---

# Sección 2: Resumen General

## Mostrar

### Productos

```text
Cantidad total de productos
```

---

### Productos Servidos

```text
Cantidad servida
```

---

### Productos En Preparación

```text
Cantidad en cocina
```

---

### Total Acumulado

```text
Monto total de la mesa
```

---

# Sección 3: Consumo Actual

## Tabla

| Campo | Descripción |
|---------|---------|
| Producto | Nombre |
| Cantidad | Cantidad |
| Participante | Cliente que agregó |
| Estado | Estado actual |
| Precio | Precio |
| Importe | Subtotal |

---

## Ejemplo

```text
1 Chaufa Especial

Agregado por Juan

Estado: En Preparación
```

---

```text
2 Inka Cola

Agregado por María

Estado: Servido
```

---

```text
1 Wantán Frito

Agregado por Carlos

Estado: Pendiente
```

---

# Estados de Consumo

## Pendiente

Código:

```text
P
```

Descripción:

```text
Registrado pero aún no tomado
por cocina.
```

Color:

```text
Gris
```

---

## En Preparación

Código:

```text
E
```

Descripción:

```text
Preparándose en cocina.
```

Color:

```text
Naranja
```

---

## Servido

Código:

```text
S
```

Descripción:

```text
Entregado al cliente.
```

Color:

```text
Verde
```

---

## Anulado

Código:

```text
A
```

Descripción:

```text
Cancelado o descartado.
```

Color:

```text
Rojo
```

---

# Sección 4: Estado de Cocina

## Resumen

Mostrar:

```text
Pendientes

En Preparación

Servidos

Anulados
```

---

## Timeline

### Ejemplo

```text
13:15
Pedido registrado
```

↓

```text
13:18
En preparación
```

↓

```text
13:27
Servido
```

---

# Sección 5: Totales

## Subtotal

```text
Monto sin descuentos.
```

---

## Descuento

```text
Si aplica.
```

---

## Servicio

```text
0%
```

---

## Total Mesa

```text
Monto acumulado de consumo.
```

---

### Ejemplo

```text
Subtotal: S/. 72.88

IGV: S/. 13.12

Total: S/. 86.00
```

---

# Estado de Cuenta

## Abierta

```text
Se permiten nuevos pedidos.
```

---

## Por Cobrar

```text
Cuenta solicitada.
```

---

## Cerrada

```text
Venta facturada.
```

---

# Sección 6: Acciones

## Volver a Carta

```text
Regresa a la carta digital.
```

---

## Actualizar

```text
Refresca información.
```

---

## Solicitar Cuenta

Disponible cuando:

```text
Estado = ABIERTA
```

---

## Ver Detalle Completo

```text
Muestra todos los movimientos
de la comanda.
```

---

# Solicitar Cuenta

## Confirmación

```text
¿Desea solicitar la cuenta?
```

---

## Resultado

```text
Estado mesa = POR COBRAR
```

---

## Efecto

```text
Bloquea nuevos pedidos.
```

---

# Restricciones

## No Permitido

```text
Modificar productos
en preparación.
```

---

## No Permitido

```text
Eliminar productos servidos.
```

---

## No Permitido

```text
Agregar productos cuando
la cuenta está POR COBRAR.
```

---

# Reglas de Negocio

## BR-EST-011

```text
La comanda pertenece a la mesa.
```

---

## BR-EST-012

```text
Todos los participantes comparten
la misma comanda activa.
```

---

## BR-RES-025

```text
Todos los productos se consolidan
en una única comanda.
```

---

## BR-RES-026

```text
La solicitud de cuenta afecta
a toda la mesa.
```

---

## BR-RES-029

```text
No se permiten nuevos pedidos
cuando la mesa está POR COBRAR.
```

---

## BR-ACC-050

```text
Todos los participantes visualizan
el mismo consumo acumulado.
```

---

## BR-ACC-051

```text
Cualquier participante puede
solicitar la cuenta.
```

---

## BR-INF-054

```text
Todos observan el mismo total
porque comparten una única comanda.
```

---

# Notificaciones

## Producto En Preparación

Mostrar:

```text
Su pedido está siendo preparado.
```

---

## Producto Servido

Mostrar:

```text
Su pedido ha sido servido.
```

---

## Cuenta Solicitada

Mostrar:

```text
La cuenta fue solicitada.
```

---

## Cuenta Cerrada

Mostrar:

```text
Gracias por visitarnos.
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
OAuth Google obligatorio
```

---

# APIs

## Obtener Consumo

```http
GET /api/cliente/consumo
```

---

## Obtener Estados

```http
GET /api/cliente/consumo/estados
```

---

## Participantes

```http
GET /api/cliente/comanda/participantes
```

---

## Solicitar Cuenta

```http
POST /api/cliente/comanda/cuenta
```

---

## Historial

```http
GET /api/cliente/comanda/historial
```

---

# Base de Datos

## Tablas

```text
PEDIDO

DETALLE_PEDIDO

CLIENTE

MESA

VENTA

AUDITORIA
```

---

# Auditoría

Registrar:

```text
Consulta de consumo

Solicitud de cuenta

Acceso a comanda

Ingreso a mesa
```

---

# Estados de Pantalla

## Loading

```text
Skeleton consumo.
```

---

## Sin Consumo

```text
Aún no existen productos registrados.
```

---

## Sin Conexión

```text
Verifique su conexión.
```

---

## Error

```text
No fue posible obtener el consumo.
```

---

# Responsive

## Desktop

```text
Resumen y detalle simultáneos.
```

---

## Tablet

```text
Bloques apilados.
```

---

## Mobile

```text
Cards por producto.

Botón flotante:
Solicitar Cuenta
```

---

# Casos Especiales

## Nuevo Participante

```text
Aparece automáticamente en la sección
de participantes.
```

---

## Producto Anulado por Cocina

```text
Permanece visible con estado Anulado.
```

---

## Cuenta Solicitada por Otro Participante

```text
Todos visualizan estado POR COBRAR.
```

---

# Criterios de Aceptación

## Escenario 1

```gherkin
Given una mesa con varios participantes
When un cliente abre Mi Consumo
Then visualiza el mismo consumo acumulado que los demás
```

---

## Escenario 2

```gherkin
Given un producto en cocina
When cocina cambia el estado a En Preparación
Then la pantalla refleja el cambio automáticamente
```

---

## Escenario 3

```gherkin
Given un producto servido
When el cliente consulta Mi Consumo
Then visualiza el estado Servido
```

---

## Escenario 4

```gherkin
Given una comanda activa
When cualquier participante solicita la cuenta
Then toda la mesa pasa a estado POR COBRAR
```

---

## Escenario 5

```gherkin
Given una mesa POR COBRAR
When un participante intenta agregar productos
Then el sistema rechaza la operación
```