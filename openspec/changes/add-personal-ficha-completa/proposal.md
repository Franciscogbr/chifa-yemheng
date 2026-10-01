# Proposal: add-personal-ficha-completa

## Por qué
El formulario de personal solo cubre 12 de 18 columnas de negocio de
`PERSONA`+`EMPLEADO`: faltan distrito, nacimiento, género, fondo de pensión,
n.º hijos y ESSALUD. Además los selects viven de constantes hardcodeadas que
ya mintieron una vez (`CARGOS` inventa 4 cargos fuera de BD).

## Qué
- Módulo `maestros`: 4 endpoints vivos (`distritos/cargos/contratos/tipos-identidad`).
- Formulario personal con las 18 columnas (6 campos nuevos, todos opcionales).
- Cero constantes de datos maestros en `src` (labels UI sí, datos no).
- Distrito de clientes migra al mismo endpoint (muere el placeholder "Lima v1").

## No objetivos
- Módulo Usuarios y Roles (change aparte `add-usuarios-roles`).
- Tabla `TURNO` (turno queda texto libre, fiel a la BD).
- Endpoint UBIGEO con filtros por provincia (lista completa por ahora).
- Multi-sucursal (no existe en la BD; change estructural futuro).
