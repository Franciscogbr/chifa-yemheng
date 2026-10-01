# Design: add-clientes-ficha-completa

## Contrato
| Capa | Decisión |
|---|---|
| Backend | `schemas/cliente.ts`: N suma `tipoDoc?` (DNI/CE/PAS), `fNacimiento?` (date), `genero?` (M/F/O espejo CHECK); N+J suman `codigoCliente?` (max 15). Update espeja en opcional/nulable. `models/cliente.ts` + repository SELECT/mapRow/insert/update. `codigo_cliente` sin UNIQUE (igual que BD). |
| Frontend | `clientes-types.ts` (+tipos), `clientes-service.ts` (create N/J + update con regla anti-`''`: omitir `''` donde el schema rechaza), `clientes-page.tsx` (sección N: tipoDoc/fNac/género; bloque compartido: código; tabla: + columna Código). Distrito ya vivo vía picker. |
| Regla | Cero constantes nuevas; maestros y picker reutilizados. |

## Decisiones
1. `Codigo_Cliente` manual opcional (BD: varchar(15) NULL sin UNIQUE; seeds usan `CLI-0001` como ejemplo).
2. Tipo-doc N filtra DNI/CE/PAS (RUC es de empresas), igual que personal.
3. Todo nuevo opcional (no rompe clientes existentes ni seeds).
