# Spec delta: clientes ficha completa

## CLI-FICHA-P1 · Ficha natural completa
Crear/editar cliente N acepta `tipoDoc?` (DNI/CE/PAS, endpoint),
`fNacimiento?` (date pasada), `genero?` (M/F/O) y los persiste en `PERSONA`.
Todo opcional.

## CLI-FICHA-P2 · Código de cliente
Crear/editar N y J acepta `codigoCliente?` (texto libre máx 15) y lo persiste
en `CLIENTE.codigo_cliente`. Sin autoincremento ni unicidad (igual que BD).

## CLI-FICHA-P3 · Sin 400 por vacíos
Updates/creates omiten `''` donde el schema rechaza; `null` solo con
`.nullable()`. Casos cubiertos: N sin correo/distrito/código, J sin correo,
personal sin correo/hijos (T7 del change de personal).
