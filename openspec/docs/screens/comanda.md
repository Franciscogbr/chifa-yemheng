# Comanda

## Información General

### Nombre

Detalle de Comanda / Pedidos por Mesa (fusiona 2.3 + 2.5)

### Ruta

```text
/mozo/comanda/:id
```

> Cubre Archivo 2.3 comanda.html (detalle) y 2.5
> pedidosPorMesa.html (listado activos por mesa).
> Listado = tab/selector superior dentro de esta misma pantalla.

### Shell

```text
StaffShell
```

### Feature

```text
features/mozo/comanda
```

### Roles Permitidos

```text
MOZO
CAJERO
SUPERVISOR
```

### Permisos

```text
PED_VER (propuesto)
PED_EDITAR (propuesto, agregar tanda / pedir cuenta)
```

> Si no se dan de alta, mapear temporalmente a MESA_VER.
> El cobro exige VEN_COBRAR (caja-cobro.md), no esta pantalla.

---

# Objetivo

Ver y operar la comanda activa de una mesa (única por mesa).

Permite:

- Ver ítems con cantidad, precio, subtotal, total con IGV.
- Ver estado del pedido y de cada ítem P/E/S.
- Agregar nueva tanda (si no está POR COBRAR ni FACTURADO).
- Pedir la cuenta (pasar a POR COBRAR).
- Listar comandas activas por mesa (pestaña Pedidos por Mesa).
- Ver consumo acumulado compartido QR.

No permite:

- Cobrar ni emitir comprobante (ver `caja-cobro.md`).
- Cambiar P/E/S (solo cocina, ver `detalle-item-cocina.md`).
- Aplicar descuentos sin `PED_DESCUENTO`.
- Dividir la cuenta ni emitir múltiples comprobantes.

---

# Usuarios Objetivo

- MOZO
- CAJERO (solo lectura + pedir cuenta)
- SUPERVISOR

---

# Layout

## Tipo

```text
Detalle + Listado Superior
```

## Estructura General

```text
┌─────────────────────────────────────────────┐
│ Header (Mesa + N° Pedido + Estado)          │
├─────────────────────────────────────────────┤
│ Tabs: [Comanda actual | Pedidos por mesa]   │
├─────────────────────────────────────────────┤
│ Tabla Ítems (cant, precio, subt, estado P/E/S)│
├─────────────────────────────────────────────┤
│ Totales (bruto, descuento, servicio, IGV, total)│
├─────────────────────────────────────────────┤
│ Acciones: [+ Tanda] [Pedir cuenta]          │
└─────────────────────────────────────────────┘
```

---

# Sección 1: Header

Mostrar:

```text
Mesa (número + ambiente)
N° Pedido (PED-YYYYMMDD-seq)
Cliente principal + N participantes QR
Estado pedido (ABIERTO / EN_PREPARACION / SERVIDO / POR_COBRAR)
```

Fuente:

```text
PEDIDO + MESA + CLIENTE
```

---

# Sección 2: Pestaña Pedidos por Mesa (2.5)

## Objetivo

Listar comandas activas agrupadas por mesa.

Columnas:

| Campo | Descripción |
|---------|---------|
| Mesa | Número + ambiente |
| Pedido | N° + hora apertura |
| Estado | ABIERTO / EN_PREPARACION / SERVIDO / POR_COBRAR |
| Ítems | Cantidad líneas |
| Total | Acumulado |
| Acciones | Abrir comanda |

Fuente:

```text
PEDIDO (Facturado='N', Anulado='N')
+ ESTADO_PEDIDO + MESA + DETALLE_PEDIDO
```

Acción:

```text
Click fila → carga detalle en pestaña Comanda actual.
```

---

# Sección 3: Tabla Ítems

## Columnas

| Campo | Descripción |
|---------|---------|
| Producto | Nombre + nota cocina ("sin ají") |
| Cantidad | > 0 |
| Precio Unit. | Con IGV incluido |
| Descuento | Solo con PED_DESCUENTO |
| Subtotal | Cant×PU−Desc (persistido) |
| Estado Prep. | P/E/S/A con color |
| Cortesía | S/N (excluye de bruto) |

Fuente:

```text
DETALLE_PEDIDO + PRODUCTO
```

Regla visual:

```text
Anulados (A) en gris tachado, no suman.
Cortesías con badge, no suman a bruto (FN_TOTAL_PEDIDO).
```

---

# Sección 4: Totales

Mostrar:

```text
Bruto (Σ subtotales excluye A/inactivos/cortesías)
Descuento
Servicio (Bruto−Desc)×Cargo/100, 0% estándar
SubTotal = Total/1.18
IGV = Total−Total/1.18
Total = Bruto−Desc+Servicio
```

Fuente cálculo:

```text
USP_RECALCULAR_PEDIDO + FN_TOTAL_PEDIDO
```

---

# Sección 5: Acciones

## Agregar Tanda

```text
Selector producto (solo ACTIVO + DISPONIBLE) + cantidad + nota.
Invoca USP_AGREGAR_DETALLE_PEDIDO + recalcula.
```

Bloqueado si:

```text
Pedido FACTURADO/ANULADO (BR-RES-012)
Mesa POR_COBRAR (BR-RES-029)
```

---

## Pedir Cuenta

```text
Pasa comanda a POR_COBRAR.
Afecta a toda la mesa (todos los participantes QR).
Ya no admite nuevos productos.
El cobro lo hace cajero en caja-cobro.md.
```

---

# Restricciones

## No Permitido

```text
Dividir automáticamente la comanda en múltiples ventas.
```

→ `BR-RES-027`.

---

## No Permitido

```text
Emitir múltiples comprobantes para la misma comanda.
```

→ `BR-RES-028`. 1 Comanda = 1 Venta = 1 Comprobante.

---

# Reglas de Negocio

## BR-DER-023

```text
Subtotal ítem = Cantidad × Precio Unitario − Descuento.
```

## BR-DER-024

```text
Bruto = Σ subtotales excluyendo anulados (A), inactivos y cortesías.
(FN_TOTAL_PEDIDO)
```

## BR-DER-025

```text
Servicio = (Bruto − Descuento) × Cargo_Servicio(tipo mesa) / 100.
Con mesa estándar (0%) el servicio = 0.
(USP_RECALCULAR_PEDIDO)
```

## BR-DER-026

```text
IGV (18% incluido) = Total − Total / 1.18.
(USP_RECALCULAR_PEDIDO)
```

## BR-DER-027

```text
SubTotal = Total / 1.18 (base gravada).
(USP_RECALCULAR_PEDIDO)
```

## BR-DER-028

```text
Total = Bruto − Descuento + Servicio.
(USP_RECALCULAR_PEDIDO)
```

## BR-RES-012

```text
No se agregan ítems a pedido FACTURADO ni ANULADO.
```

## BR-RES-025

```text
Todos los productos de distintos participantes se consolidan
en única comanda.
```

## BR-RES-026

```text
La solicitud de cuenta aplica a toda la comanda de la mesa.
```

## BR-RES-029

```text
Mesa en POR COBRAR no admite nuevos productos.
```

## BR-EST-005 / BR-EST-006

```text
Toda venta nace de un pedido; una venta un único comprobante.
Esta pantalla prepara, no factura.
```

## BR-RES-015 (referencia)

```text
Un pedido se anula SOLO si no está facturado.
Una venta facturada solo se corrige con NOTA_CREDITO
(ver ventas.md, USP_ANULAR_VENTA_CON_NC).
```

## BR-ACC-052 (referencia)

```text
Al facturarse la comanda (en caja-cobro.md), se finalizan
todas las sesiones QR asociadas a la mesa y la mesa
vuelve a LIBRE.
```

---

# Seguridad

## Roles

```text
MOZO
CAJERO
SUPERVISOR
```

## Permisos

```text
PED_VER
PED_EDITAR
```

---

# APIs

## Detalle Comanda

```http
GET /api/pedidos/{id}
Response: { pedido, mesa, items[], totales }
```

---

## Activos por Mesa

```http
GET /api/pedidos/activos?mesa={id}
```

---

## Agregar Tanda

```http
POST /api/pedidos/{id}/detalle
Body: { idProducto, cantidad, nota, descuento? }
```

---

## Pedir Cuenta

```http
PATCH /api/pedidos/{id}/pedir-cuenta
```

---

# Base de Datos

## Tablas

```text
PEDIDO (Numero_Pedido, ID_Mesa, ID_Cliente, ID_EstadoPedido,
Subtotal, Descuento, Servicio, IGV, Total, Facturado, Anulado)
DETALLE_PEDIDO (Cantidad, Precio_Unitario, Descuento, Sub_Total,
Nota_Cocina, Estado_Preparacion P/E/S/A, Es_Cortesia)
PRODUCTO (para selector)
ESTADO_PEDIDO
TIPO_PEDIDO
```

## Procedimientos / Funciones

```text
USP_RECALCULAR_PEDIDO
USP_AGREGAR_DETALLE_PEDIDO
FN_TOTAL_PEDIDO
```

---

# Auditoría

Registrar:

```text
Agregar tanda (pedido, producto, cantidad, usuario)
Pedir cuenta (pedido, mesa, usuario, fecha)
```

---

# Estados de Pantalla

## Loading

```text
Skeleton tabla ítems + totales.
```

---

## Sin Datos

```text
La mesa no tiene comanda activa. [Abrir comanda]
```

---

## Cuenta

```text
Abierta (permite pedir) / Por Cobrar (bloquea) / Cerrada (facturada).
```

---

# Responsive

## Desktop

```text
Tabla completa + totales laterales.
```

---

## Mobile

```text
Cards por ítem + sticky totales + botón Pedir cuenta.
```

---

# Criterios de Aceptación

## Escenario 1

```gherkin
Given una comanda ABIERTO con 3 ítems
When la consulta el mozo
Then ve subtotales y total con IGV correctos
```

---

## Escenario 2

```gherkin
Given una comanda POR_COBRAR
When intenta agregar un ítem
Then el sistema rechaza (BR-RES-029)
```

---

## Escenario 3

```gherkin
Given cualquier participante QR
When pulsa Pedir cuenta
Then toda la mesa pasa a POR_COBRAR
```

---

## Escenario 4

```gherkin
Given una comanda compartida Mesa 12
When Juan, María y Carlos agregan productos
Then todo consolida en una única comanda y un total
```
