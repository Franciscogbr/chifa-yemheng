# POS Mozo

## Información General

### Nombre

Punto de Venta del Mesero (Flujo Presencial sin QR)

### Ruta

```text
/mozo
```

### Shell

```text
StaffShell
```

### Feature

```text
features/mozo/pos
```

### Roles Permitidos

```text
MOZO
SUPERVISOR
```

### Permisos

```text
PED_VER (propuesto)
PED_CREAR (propuesto)
```

> Cobrar exige VEN_COBRAR (caja). Descuento exige PED_DESCUENTO.

---

# Objetivo

Atender presencial cuando el cliente no usa QR (sin celular o sin deseo QR).

Permite:

- Seleccionar mesa + cliente (genérico o identificado).
- Ver carta disponible.
- Abrir comanda.
- Agregar ítems por tandas.
- Confirmar/enviar a cocina.
- Pedir cuenta.

No permite:

- Cobrar (solo cajero en caja).
- Cambiar estados cocina P/E/S.
- Exigir Gmail al cliente presencial.

---

# Usuarios Objetivo

- MOZO
- SUPERVISOR

---

# Layout

## Tipo

```text
POS 3 Columnas
```

## Estructura General

```text
┌────────────────────────────────────────────────────┐
│ Header (Mozo + turno)                              │
├──────────────┬──────────────────┬──────────────────┤
│ Mesa/Cliente │ Carta            │ Pedido actual    │
│              │ [categorías]     │ ítems + total    │
│              │ [productos]      │ [Confirmar]      │
│              │                  │ [Pedir cuenta]   │
└──────────────┴──────────────────┴──────────────────┘
```

---

# Sección 1: Mesa / Cliente

## Mesa

Tipo:

```text
Select + mapa resumido
```

Fuente:

```text
MESA LIBRE (VW_MAPA_MESAS)
```

Validación:

```text
Si TIPO_PEDIDO.Requiere_Mesa='S' → mesa obligatoria (BR-RES-014).
Si mesa con comanda activa → no crea, abre la existente.
```

---

## Cliente

Tipo:

```text
Autocomplete + opción CLIENTES VARIOS
```

Fuente:

```text
CLIENTE + PERSONA/EMPRESA
```

Default:

```text
CLIENTES VARIOS (genérico) para venta rápida presencial.
```

> Sin Gmail obligatorio (excepción BR-RES-021).

---

## Comensales

Tipo:

```text
Número
```

Validación:

```text
> 0 y ≤ MESA.Capacidad (validación app, brecha §6 REGLAS).
```

---

# Sección 2: Carta

Mostrar:

```text
Categorías + productos DISPONIBLES y con stock,
con precio e imagen.
```

Fuente:

```text
PRODUCTO (Estado='A', Disponible='S') + CATEGORIA_PRODUCTO
```

Oculta:

```text
Agotados e insumos (BR-RES-022).
```

---

# Sección 3: Pedido Actual

Mostrar:

```text
Ítems agregados (cant, precio, subtotal),
total recalculado, estado.
```

Acciones:

```text
[+] / [-] cantidad, quitar línea, nota cocina,
Confirmar a cocina, Pedir cuenta.
```

---

# Acciones Disponibles

## Abrir Comanda

```http
POST /api/pedidos/abrir
Body: { idTipoPedido, idMesa, idCliente, nComensales }
```

Implementación:

```text
USP_ABRIR_PEDIDO: valida Requiere_Mesa, mesa sin activa,
genera PED+fecha+seq, ID_EstadoPedido=1, mesa→OCUPADA (2).
Registra con usuario mozo (no AUTOSERVICIO).
```

---

## Agregar Ítem

```http
POST /api/pedidos/{id}/detalle
```

Implementación:

```text
USP_AGREGAR_DETALLE_PEDIDO: bloquea si facturado/anulado,
valida producto ACTIVO+disponible, recalcula.
```

---

## Confirmar a Cocina

```text
Marca tanda como enviada (F_Solicitud).
La comanda pasa a EN_PREPARACION cuando cocina toma 1er plato.
```

---

## Pedir Cuenta

```http
PATCH /api/pedidos/{id}/pedir-cuenta
```

> Solo solicita; el mozo tampoco cobra.

---

# Restricciones

## No Permitido

```text
Cobrar desde el POS.
```

---

## No Permitido

```text
Agregar productos inactivos o no disponibles.
```

→ `BR-RES-011`.

---

# Reglas de Negocio

## BR-EST-007 / BR-RES-013

```text
Una mesa solo una comanda abierta/activa.
```

## BR-RES-014

```text
Si Requiere_Mesa='S', mesa obligatoria.
```

## BR-RES-011

```text
Solo ACTIVOS y DISPONIBLES a comanda.
```

## BR-ACC-037

```text
Abrir → OCUPADA; facturar/anular → LIBRE.
```

## BR-RES-021 (excepción)

```text
Flujo presencial por mesero no exige login Gmail.
```

## BR-RES-019

```text
Cortesías/descuentos solo con PED_DESCUENTO;
nunca desde QR, solo mozo/supervisor autorizado.
```

---

# Seguridad

## Roles

```text
MOZO
SUPERVISOR
```

## Permisos

```text
PED_VER
PED_CREAR
PED_DESCUENTO (solo para descuentos)
```

---

# APIs

## Abrir

```http
POST /api/pedidos/abrir
```

## Agregar

```http
POST /api/pedidos/{id}/detalle
```

## Recalcular (interno)

```text
USP_RECALCULAR_PEDIDO tras cada tanda.
```

---

# Base de Datos

## Tablas

```text
PEDIDO (ID_Cliente, ID_Mesa, ID_TipoPedido, ID_EstadoPedido,
ID_Usuario=mozo, ID_Empleado, N_Comensales)
DETALLE_PEDIDO
PRODUCTO
TIPO_PEDIDO (Requiere_Mesa S/N)
CLIENTE (incluye CLIENTES VARIOS)
MESA
```

## Procedimientos

```text
USP_ABRIR_PEDIDO
USP_AGREGAR_DETALLE_PEDIDO
USP_RECALCULAR_PEDIDO
FN_TOTAL_PEDIDO
```

---

# Auditoría

Registrar:

```text
Apertura comanda presencial (mozo, mesa, cliente)
Agregar tanda
Pedir cuenta por POS
```

---

# Estados de Pantalla

## Loading

```text
Skeleton carta + pedido.
```

---

## Sin Datos

```text
Seleccione una mesa LIBRE para iniciar.
```

---

# Responsive

## Desktop

```text
3 columnas simultáneas.
```

---

## Tablet / Mobile

```text
Tabs Mesa | Carta | Pedido. Uso en salón con tablet.
```

---

# Criterios de Aceptación

## Escenario 1

```gherkin
Given una mesa LIBRE y CLIENTES VARIOS
When el mozo abre comanda
Then se crea PEDIDO y la mesa pasa a OCUPADA
```

---

## Escenario 2

```gherkin
Given tipo pedido que exige mesa
When intenta abrir sin mesa
Then el sistema rechaza (BR-RES-014)
```

---

## Escenario 3

```gherkin
Given un producto agotado
When lo busca en el POS
Then no aparece (BR-RES-022)
```

---

## Escenario 4

```gherkin
Given una comanda presencial
When pide la cuenta desde el POS
Then pasa a POR_COBRAR y solo el cajero puede cobrar
```
