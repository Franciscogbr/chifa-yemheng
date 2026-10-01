# Proposal: add-qr-seguro

## Por qué
El QR actual (`yemheng.pe/m/{NUMERO}`) es determinista: regenerar devuelve
el mismo valor y no invalida fotos copiadas. Si un QR impreso se filtra,
no hay forma de rotarlo sin cambiar el número de la mesa.
Se pide poder **cambiar el QR manteniendo la misma mesa** por seguridad,
con opción explícita `Mantener / Regenerar` al editar.

## Qué
- QR rotativo `yemheng.pe/m/{NUMERO}-{TOKEN8}` (ej. `yemheng.pe/m/M-01-8f3KqZ2a`).
- Al editar mesa: por defecto **Mantener** (no reimprimir); con
  `regenerarQr:true` se genera token nuevo para el mismo `id_mesa` y el
  QR anterior queda invalidado.
- Historial BD en `openspec/database/alter-data/add-qr-token/` (UNIQUE + backfill).
- Frontend muestra QR real de BD (`m.qr`), no URL provisional `/auth/login`.
- La futura carta pública debe resolver por `codigo_qr`, no por `numero`.

## No objetivos
- Cambiar tamaño de columna (`varchar(60)` sobra: 13+5+1+8=27).
- QR manual editable a mano (riesgo duplicados).
- Reimpresión automática / envío a impresora.
