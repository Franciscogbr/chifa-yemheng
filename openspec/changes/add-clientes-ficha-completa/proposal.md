# Proposal: add-clientes-ficha-completa

## Por qué
El CRUD de clientes no cubre 4 campos de negocio: tipo-doc/fNac/género (N) y
código de cliente (N+J). `Linea_Credito` se elimina en `add-drop-linea-credito`
y `F_Venc_Credito` nunca existió (queda fuera).

## Qué
- Backend: schemas/model/repository con `tipoDoc/fNacimiento/genero` (N) y
  `codigoCliente` (N+J, texto libre opcional).
- Frontend: sección N (+tipoDoc/fNac/género), campo código, service anti-`''`,
  selects vivos (distrito ya migrado).
- Reutiliza módulo `maestros` y `DistritoPicker` (cero consts nuevas).

## No objetivos
- Puntos (lectura), F_Registro/auditoría (auto), Usuarios/Roles, crédito.
