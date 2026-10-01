# Proposal: add-crud-personal

## Por qué
Cuarto CRUD por orden: el personal es base de `USUARIO` (`BR-EST-003`:
todo usuario es un empleado) y del login que ya opera. Sin este ABM no
hay altas de empleados para futuros usuarios ni control de turnos.

## Qué
ABM de personal (`/admin/personal`, `features/admin/personal`) según
`openspec/docs/screens/recursos-humanos.md` + plantilla Stitch:
- Tabla: Colaborador, Documento, Cargo+Área, Turno, Fecha Ingreso,
  Estado, Acciones (editar, toggle, “Crear usuario” futuro deshabilitado).
- KPIs dotación (total, cocina, salón, delivery/caja).
- Filtros: buscar, cargo, turno, estado. Paginación 20/50/100.
- Modal 2 bloques: personal (nombres, apellidos, tipo+documento,
  teléfono, correo, dirección) y laboral (cargo de `CARGO`, contrato,
  turno, ingreso, cese en edición, sueldo).
- Activar/cesar = `EMPLEADO.ESTADO` (jamás DELETE). Auditoría.
- Solo ADMIN/GERENTE (`EMP_VER/CREAR/EDITAR`, `EMP_ELIMINAR` cubre cese).
- Responsive tabla/scroll/cards + modal full-screen móvil.

## No objetivos
- Crear `USUARIO`/roles aquí (va a `usuarios.md`; el botón solo enlazará).
- Validación Reniec en línea, exportar nómina, endpoint CARGO propio
  (lista estática v1 desde seeds), control de asistencia/planillas.
