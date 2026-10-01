# Design: add-personal-ficha-completa

## Contrato
| Capa | Decisión |
|---|---|
| Backend maestros | `routes/maestros.ts` + controller + service + repository. `GET /api/v1/maestros/{distritos,cargos,contratos,tipos-identidad}` con `authGuard` + `requirePermisos('EMP_VER','CLI_VER')`. Solo filas `estado='A'`, orden por id. Respuesta `{ id, nombre }` (+ `area` en cargos, `abreviatura` en tipos). Sin Zod de entrada (lista completa). |
| Backend personal | `schemas/personal.ts` create/update suman `distritoId?` (int+), `fNacimiento?` (date), `genero?` (M/F/O espejo de `CK_PERSONA_GEN`), `fondoPension?` (max 3 uppercase), `nHijos?` (0-9), `essalud?` (max 6). `SELECT`/`mapRow`/insert/update de `persona` cubren los 6. `fCese` sigue solo en update. Auditoría la pone el backend. |
| Frontend personal | Modal carga 4 listas en paralelo al abrirse (`Promise.all`), spinner en selects, error + Reintentar (sin fallback hardcodeado). Se borran `CARGOS/CONTRATOS/TURNOS`. Turno pasa a texto libre (máx 18, fiel a BD). Género: select M/F/O con labels UI. Tabla suma columna Distrito. Distrito usa `DistritoPicker` compartido. |
| Picker distrito | `components/distrito-picker.tsx`: campo + dropdown con buscador interno fijo (autoFocus, filtra en vivo sin tildes) + lista (Otro primero). Teclado: escribir filtra · ↓/↑ mueve (wrap) · Enter confirma · Escape revierte · Tab confirma. `0` = Otro = `NULL`. Sin match no se graba (el form valida). A11y: combobox/listbox/option + activedescendant + focus ring. Se usa en personal y clientes. |
| Frontend clientes | Su select de distrito consume el mismo endpoint; se borra el placeholder "Lima v1". |
| Regla cero-constantes | `grep 'CARGOS|CONTRATOS|TURNOS|DISTRITOS' frontend/src` debe dar 0. Zod/enums de validación y labels UI no cuentan como constantes de datos. |

## Matriz campo → fuente
| Campo | Fuente |
|---|---|
| distrito, cargo, contrato, tipoDoc | Endpoints vivos (tablas BD) |
| fNacimiento, fIngreso, fCese | input date directo |
| genero | enum M/F/O (CHECK, sin tabla) + labels UI |
| turno, fondoPension, essalud | texto libre (sin tabla en BD) |
| nHijos | número 0–9 |

## Decisiones
1. Todo nuevo opcional (columnas NULL; no rompe seeds ni registro rápido).
2. `Otro / Sin especificar` en distrito = `NULL` (no se inventa id 0).
3. Tipos-identidad incluye RUC desde API, pero personal filtra DNI/CE/PAS en el select (RUC es de empresas).
4. Cargos: el endpoint devuelve los 7 reales; los 4 inventados desaparecen del form.
