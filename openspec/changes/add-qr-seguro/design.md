# Design: add-qr-seguro

## Mapeo spec ↔ BD ↔ API
| Origen | BD / API | Decisión |
|---|---|---|
| QR actual `yemheng.pe/m/{NUMERO}` | `MESA.Codigo_QR varchar(60) NULL`, sin UNIQUE | Determinista, sin rotación. |
| QR rotativo | `MESA.Codigo_QR varchar(60) + UQ_MESA_CODIGO_QR` | Formato `yemheng.pe/m/{NUMERO}-{TOKEN8}` con `TOKEN8 = substr(md5(random()::text),1,8)` en backfill y `crypto.randomBytes` en app. UNIQUE garantiza no colisiones. Varios NULL permitidos en Postgres. |
| Crear mesa | `POST /mesas` | Siempre genera token nuevo vía `qrPara(numero, token)`. |
| Editar mesa | `PUT /mesas/:id { ..., regenerarQr?: boolean }` | `false/undef` → mantiene `codigo_qr`. `true` → `codigo_qr = qrPara(numeroFinal, nuevoToken)` aunque el número no cambió. Si cambia número y no regenera, se mantiene el viejo (sigue apuntando por `id_mesa`, texto desincronizado → warning UI). |
| Ver QR | `GET /mesas` → `qr` | Frontend renderiza `m.qr` con `QRCodeSVG`. Fin del provisional `VITE_PUBLIC_URL + /auth/login`. |
| Auditoría | `AUDITORIA` | `EDITAR_MESA` siempre; `REGENERAR_QR` cuando `regenerarQr:true`. |

## Decisiones
1. **Token de 8 chars**: equilibrio entre largo de QR impreso y colisiones (36^8). Suficiente para salón (<100 mesas) con UNIQUE como red.
2. **Mantener por defecto**: 9/10 ediciones (capacidad, tipo, detalle, ambiente) no necesitan reimprimir. Solo número o seguridad justifican regenerar.
3. **Carta pública futura**: debe hacer `WHERE codigo_qr = ?`, no `WHERE numero = ?`, o la rotación no invalida nada.
4. **Backfill idempotente**: `WHERE codigo_qr IS NULL` para poder re-ejecutar sin pisar tokens ya rotados.
