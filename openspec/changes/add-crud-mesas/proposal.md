# Proposal: add-crud-mesas

## Por qué
Quinto y último CRUD del alcance: las mesas alimentan comandas, reservas
y QR de autoconsumo (`BR-EST-007/013`, `BR-RES-052`, matriz de brechas QR).
Sin este ABM no hay salón configurable ni mapa.

## Qué
ABM de mesas y ambientes (`/admin/mesas`, `features/admin/mesas`) según
`openspec/docs/screens/mesas.md` + plantilla `design/mesas-template.html`:
- Tabs Mapa (solo lectura) / Mesas / Ambientes.
- Mapa: grillas por ambiente con colores oficiales de `ESTADO_MESA`,
  leyenda con conteos. Los estados operativos los mueven comandas y
  reservas vía USPs, no el admin.
- Tabla: Número, Ambiente, Capacidad, Tipo, Estado Operativo, QR
  (`yemheng.pe/m/{NUMERO}`), Estado Admin, Editar + toggle.
- Ambientes: tarjetas con conteo + mini-CRUD (nombre UQ 50, descripción,
  piso, activar/desactivar).
- Modal mesa: Ambiente*, Número* (max 5, único por ambiente),
  Capacidad* (>0), Tipo*, Detalle, QR preview en vivo solo-lectura.
- Esquema de números `M-01/T-01/B-01/V-01` (“VIP-01” no cabe en `varchar(5)`).
- Roles ADMIN/GERENTE/SUPERVISOR (`MESA_VER/CREAR/EDITAR/ELIMINAR`).
- Responsive mapa/tabla/cards + modal full-screen móvil.

## No objetivos
- Cambiar estados operativos a mano (lo hacen `USP_ABRIR_PEDIDO`,
  facturación y reservas).
- Generar imágenes QR (solo texto `Codigo_QR`; render QR queda como mejora).
- Exportar, planes, role-switcher (eliminados como en CRUDs previos).
- Mapa operativo de mozo (`mapa-mesas.md`, fase posterior).
