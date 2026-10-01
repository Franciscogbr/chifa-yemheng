# Proposal: add-crud-clientes

## Por qué
Tercer CRUD por orden: los clientes alimentan ventas, reservas y delivery
(`BR-EST-004/005`, `BR-RES-052` online exige CLIENTE con Gmail). Sin este
ABM no hay facturación a consumidor identificado ni fidelización
(`BR-INF-050`).

## Qué
ABM de clientes (`/admin/clientes`, `features/admin/clientes`) según
`openspec/docs/screens/clientes.md` + plantilla Stitch (con cambios):
- Tabs Todos / Natural / Empresa / VIP + KPIs + filtros (buscar,
  distrito, estado, orden).
- Tabla: Cliente, Documento, Teléfono/WhatsApp, Correo, Distrito+Dirección,
  Puntos, Estado, Acciones (historial futuro, editar, toggle).
- Modal Natural (nombres, DNI 8, teléfono, correo, distrito, dirección)
  / Empresa (razón social, RUC 11, teléfono, correo, distrito, dirección).
  XOR estricto (`BR-EST-001`). Puntos solo lectura.
- Roles ADMIN/GERENTE/SUPERVISOR **+ CAJERO** (`CLI_VER/CREAR/EDITAR/ELIMINAR`).
- Responsive tabla/scroll/cards + modal full-screen móvil.

## No objetivos
- Validaciones Reniec/Sunat en línea (botones decorativos diferidos).
- Historial de consumos (lectura futura), edición manual de puntos,
  endpoint UBIGEO propio (distritos estáticos Lima v1), exportar (diferido).
