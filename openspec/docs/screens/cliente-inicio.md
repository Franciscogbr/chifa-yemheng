# Cliente Inicio

## Información General

### Nombre

Hub del Cliente (Post-Gmail)

### Ruta

```text
/cliente/inicio
```

> Archivo 7.1. Si entró por QR de mesa va directo a
> `/cliente/mesa/:id` (cliente-comanda.md); si entró por web,
> llega aquí.

### Shell

```text
PublicShell
```

### Feature

```text
features/cliente/inicio
```

### Roles Permitidos

```text
CLIENTE (Gmail obligatorio, ver login-cliente.md)
```

### Permisos

```text
CLIENTE_QR / CLIENTE_RESERVA / CLIENTE_PEDIDOS (propuestos)
```

---

# Objetivo

Hub cálido post-login: saludar y derivar a Reservar / Delivery / Mis reservas / Mis pedidos.

Permite:

- Ver saludo personalizado + puntos.
- Ir a Reservar mesa, Pedir delivery, Mis reservas, Mis pedidos.
- Ver estado resumido (reservas P/C, pedidos activos).

No pide ni cobra aquí.

---

# Layout

```text
┌─────────────────────────────────────────────┐
│ Hola, {nombre} + puntos                     │
├─────────────────────────────────────────────┤
│ [Reservar mesa] [Pedir delivery]            │
│ [Mis reservas]  [Mis pedidos]               │
└─────────────────────────────────────────────┘
```

Mobile-first, 2×2 cards.

---

# Secciones

## Perfil Resumen

```text
CLIENTE + PERSONA (nombre, email, Puntos).
```

## Accesos

```text
→ /cliente/reservar (cliente-reservar.md)
→ /cliente/delivery (cliente-delivery.md)
→ /cliente/mis-reservas (mis-reservas.md)
→ /cliente/mis-pedidos (mis-pedidos.md)
```

## Resumen Vivo (opcional)

```text
Próxima reserva C + último pedido P/R/E.
```

---

# Reglas

```text
BR-ACC-044 (Gmail obligatorio), BR-INF-050 (puntos/historial).
```

---

# APIs / BD / Auditoría

```http
GET /api/cliente/resumen
```

```text
CLIENTE + PERSONA. Solo lectura. Sin auditoría salvo navegación.
```

---

# Criterios

```gherkin
Given cliente logueado con Gmail
When abre /cliente/inicio
Then ve su nombre y 4 accesos
```
