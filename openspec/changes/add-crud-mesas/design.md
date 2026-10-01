# Design: add-crud-mesas

## Mapeo spec+plantilla ↔ BD
| Origen | BD | Decisión |
|---|---|---|
| Número* (plantilla `VIP-01`) | `MESA.Numero varchar(5)`, `UQ_MESA(Ambiente,Numero)` | Zod max 5; duplicado por ambiente → 409 `YA_EXISTE`. Esquema `M-01/T-01/B-01/V-01`. |
| Ambiente* (selector) | `MESA.ID_Ambiente` NOT NULL, FK | Opciones de `GET /api/v1/ambientes?estado=A`. |
| Capacidad* (>0) | `Capacidad int` default 4, `CK_MESA_CAP` | Zod int 1..99. |
| Tipo* | `MESA.ID_TipoMesa` NOT NULL, FK (`TIPO_MESA` + `Cargo_Servicio`) | Selector (Estándar/Box/Barra/VIP). |
| Detalle | `Detalle varchar(100)` | Opcional max 100. |
| QR preview `yemheng.pe/m/{NUMERO}` | `Codigo_QR varchar(60)` NULL | Se autogenera al crear (`yemheng.pe/m/{NUMERO}`); editable NO en v1 (matriz: QR automatizado en app). |
| Estado operativo (badges) | `MESA.ID_EstadoMesa` FK (`ESTADO_MESA` + `Color`) | Solo lectura en admin; default LIBRE (id 1) al crear. |
| Estado Admin toggle | `MESA.ESTADO` | `A`/`I`; jamás DELETE. |
| Ambientes (nombre UQ 50, desc, piso) | `AMBIENTE` | Mini-CRUD: GET/POST/PUT/PATCH estado (mismos guards `MESA_*`). |
| Plan/Licencia, Carlos, role-switcher, alert()s | — | Eliminados (igual que CRUDs previos). |

## Decisiones
1. **Mapa solo lectura**: el admin no mueve estados operativos (lo hacen
   USPs de comandas/reservas). Evita corrupciones de salón.
2. **QR automático**: `Codigo_QR = yemheng.pe/m/{NUMERO}` al crear; si el
   número cambia, se regenera. Render gráfico diferido.
3. **Guards**: `authGuard + requirePermisos(MESA_*)`; 401/403/404/409.
4. **Auditoría** `AUDITORIA` (CREAR/EDITAR/ACTIVAR/DESACTIVAR mesa y ambiente).
5. **Permisos `MESA_*`**: verificar en bloque final; patch SQL si faltan.
