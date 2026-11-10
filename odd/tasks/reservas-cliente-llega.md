# Flujo de Reserva: Cliente llega y ocupa la mesa (T1-T4)

Objective: Implementar el flujo completo desde que un cliente con reserva confirmada llega al restaurante hasta que ocupa la mesa y puede ordenar.

Branch: feat/reservas-cliente-llega · Delivery: ask-on-risk · Checks: backend typecheck, frontend typecheck/build.

## Specs

### S1 — Al atender reserva, la mesa pasa a OCUPADA (no Libre)
User requirement: "cuando el personal atiende una reserva, la mesa debe quedar ocupada para que otro cliente no se siente ahí"
- `PATCH /api/v1/reservas/:id/atender` debe cambiar `situacion` a `'A'` (Atendida)
- La mesa asociada debe cambiar `id_estadomesa` a `2` (OCUPADA), no a `1` (LIBRE)
- Si no hay mesa asignada, la reserva no puede atenderse hasta asignar una

### S2 — Listado de reservas del día para el personal
User requirement: "el personal necesita ver las reservas del día para saber a quién sentar"
- `GET /api/v1/reservas` debe filtrar por fecha y estado (`P` o `C`)
- Debe devolver mesa asignada (si la hay), cliente, hora, comensales

### S3 — Pantalla admin: Reservas del día
User requirement: "el personal necesita una pantalla para ver reservas y sentar clientes"
- Crear página en frontend para ver reservas del día con estado Pendiente/Confirmada
- Mostrar nombre, mesa, hora, personas, estado
- Botón para atender cada reserva confirmada

### S4 — Botón "Sentar / Atender" por reserva
User requirement: "al hacer clic en atender, la reserva pasa a atendida y la mesa se ocupa"
- Botón por cada reserva en estado `C`
- Al hacer clic: llama `PATCH /api/v1/reservas/:id/atender`
- Si éxito: mostrar confirmación y opcionalmente botón para abrir comanda

## Tasks

- T1 — Backend: corregir `atenderReserva` para que mesa quede OCUPADA (id_estadomesa=2)
- T2 — Backend: verificar/ajustar endpoint `GET /api/v1/reservas` para filtrar reservas del día por estado
- T3 — Frontend: crear pantalla `reservas-admin-page.tsx` con listado de reservas del día
- T4 — Frontend: agregar botón "Sentar / Atender" que llame a `PATCH /:id/atender`

## Log

- L1: User request: implementar flujo de reserva hasta que cliente ocupa la mesa (T1-T4) y lanzar subagentes que simulen clientes
- L2: Se exploró el código existente: rutas, controladores, servicios, repositorios de reservas ya existen en backend; frontend solo tiene `ReservaParts.tsx` para cliente, no hay pantalla de admin para personal
