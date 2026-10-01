# Spec delta: personal ficha completa

## PER-FICHA-P1 · Listas maestras vivas
`GET /api/v1/maestros/distritos|cargos|contratos|tipos-identidad` (auth,
permiso EMP_VER o CLI_VER) retorna filas con `estado='A'` ordenadas por id:
`{ id, nombre }` (+ `area`, `abreviatura` donde aplica). Sin estas filas el
form muestra error + Reintentar, nunca datos inventados.

## PER-FICHA-P2 · Ficha completa opcional
Crear/editar personal acepta `distritoId?, fNacimiento?, genero? (M/F/O),
fondoPension?, nHijos? (0-9), essalud?` y los persiste en
`PERSONA`/`EMPLEADO`. Todo opcional. `fCese` solo en edición.
`Otro` en distrito = `NULL`.

## PER-FICHA-P3 · Cero constantes de datos
Ningún select del form usa listas hardcodeadas (`grep` de
`CARGOS|CONTRATOS|TURNOS|DISTRITOS` en `src` = 0). Turno es texto libre
(máx 18). Los cargos ofrecidos son exactamente los de BD.
