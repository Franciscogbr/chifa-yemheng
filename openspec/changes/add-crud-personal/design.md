# Design: add-crud-personal

## Mapeo spec+plantilla ↔ BD
| Origen | BD | Decisión |
|---|---|---|
| Persona (nombres, apellidos, DNI/CE/Pasaporte, tel, correo, dirección) | `PERSONA` (ID_TipoIdentidad, N_Documento UQ por tipo, Nombre 80, Celular char(9), EMAIL 50, Direccion 100, ID_Distrito) | Crear PERSONA + EMPLEADO en transacción lógica (rollback manual del 1ro si falla el 2do). |
| Laboral (cargo, contrato, turno, ingreso, cese, sueldo) | `EMPLEADO` (ID_Persona, ID_Contrato, ID_Cargo NOT NULL; Turno; F_Ingreso/F_Cese; Salario) | Cargo/contrato por id desde listas (CARGO/CONTRATO seeds); cese solo en edición; sueldo ≥0. |
| Toggle activo/cesado | `EMPLEADO.ESTADO` | Cesado = `I`. No toca `USUARIO` (si el empleado tiene usuario, se gestiona en `usuarios.md`). |
| “Crear usuario” (plantilla) | `USUARIO.ID_Empleado` | Botón deshabilitado con tooltip “Disponible en módulo Usuarios”; no crea nada en v1. |
| KPIs dotación por área | `CARGO.Area` (Cocina/Salón/Delivery/…) | Agregación en memoria sobre la página + total global aparte (v1 simple). |
| Plan/Licencia, Carlos, Exportar, Validar Reniec, role-switcher | — | Eliminados (igual que CRUDs previos). |

## Decisiones
1. **Sin cambio de documento**: el DNI/CE identifica a la persona; editar
   no cambia tipo+documento (evita colisiones con `UQ_PERSONA_DOC`).
2. **Guards**: `authGuard + requirePermisos(EMP_*)`; ruta solo
   ADMIN/GERENTE (GERENTE inexistente en ROL, inofensivo).
3. **Auditoría** `AUDITORIA` sobre `EMPLEADO` (CREAR/EDITAR/ACTIVAR/CESAR).
4. **Permisos `EMP_*`**: verificar en verificación final; patch SQL si faltan
   (igual que `CAT_*`/`PROD_*`).
