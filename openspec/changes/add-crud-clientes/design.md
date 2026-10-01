# Design: add-crud-clientes

## Mapeo spec+plantilla ↔ BD
| Origen | BD | Decisión |
|---|---|---|
| Natural: nombres/apellidos/DNI/tel/correo/distrito/dirección | `PERSONA` (ID_TipoIdentidad DNI, N_Documento 15, Nombre 80, Ap_Paterno/Materno, Celular char(9), EMAIL 50, Direccion 100, ID_Distrito) + `CLIENTE` (ID_Persona, Tipo 'N') | Crear PERSONA y CLIENTE en una transacción lógica (2 inserts + rollback manual si falla el 2do). |
| Empresa: razón social/RUC/tel/correo/distrito/dirección | `EMPRESA` (RUC char(11) UQ, Razon_Social 140, Telefono, EMAIL, Direccion, ID_Distrito) + `CLIENTE` (ID_Empresa, Tipo 'J') | Igual; RUC duplicado → 409. `BR-RES-016`: solo empresas con RUC reciben FACTURA. |
| XOR (`BR-EST-001`, `CK_CLIENTE_XOR`) | exactamente un lado NOT NULL | Zod discriminado por `tipo`; backend valida. |
| Puntos/nivel, Gmail badge | `CLIENTE.Puntos` (default 0) | Solo lectura v1 (`BR-INF-050` acumula por ventas/QR). |
| Distrito (plantilla: 8 Lima) | `PERSONA/EMPRESA.ID_Distrito` NULL | Selector estático v1 (ids reales de UBIGEO seed); endpoint propio diferido. |
| Teléfono `+51` | `Celular char(9)` / `Telefono varchar(15)` | Zod 9 dígitos para natural; empresa libre 15. |
| Botones Reniec/Sunat, role-switcher, Plan/Licencia, Carlos, Exportar | — | Eliminados (igual que CRUDs previos). |
| WhatsApp `wa.me` | Celular real | Se mantiene (funcionalidad real). |

## Decisiones
1. **Sin `ON CONFLICT`**: unicidad por documento se verifica antes
   (DNI: `PERSONA` UQ por (tipo, doc); RUC: `UQ_EMPRESA_RUC`) → 409 `YA_EXISTE`.
2. **Editar** no cambia de tipo (N↔J prohibido: rompería facturas históricas).
3. **Desactivar** = `CLIENTE.ESTADO I` (+ cascada visual a persona/empresa:
   se mantiene su estado; solo el CLIENTE se desactiva).
4. **Guards**: `requirePermisos(CLI_*)`; ruta con roles
   ADMIN/SUPERVISOR/CAJERO (GERENTE inexistente en ROL, inofensivo).
5. **Orden**: puntos desc | alfabético | recientes (`F_Registro` desc).
   “Más pedidos / última visita” quedan como mejora (requieren joins).
6. **Auditoría** `AUDITORIA` (CREAR/EDITAR/ACTIVAR/DESACTIVAR cliente).
