# Spec delta: mesas — QR rotativo

## Endpoints (`/api/v1/mesas`, `authGuard`)

### PUT /mesas/:id — `MESA_EDITAR` (+ rotación QR)
- Body suma `regenerarQr?: boolean` (def `false`).
- `regenerarQr=false/undef` → `codigo_qr` intacto aunque cambie `numero`.
- `regenerarQr=true` → `codigo_qr = yemheng.pe/m/{NUMERO_FINAL}-{TOKEN8}` nuevo,
  mismo `id_mesa`. Anterior invalidado.
- 200 con `qr` nuevo; 409 `YA_EXISTE` si choca número por ambiente; 422 si ambiente/tipo inválido.

## Criterios
1. `PUT {capacidad:6}` sin flag → `qr` idéntico al anterior.
2. `PUT {numero:"M-02"}` sin flag → `qr` idéntico (sigue apuntando por id).
3. `PUT {regenerarQr:true}` → `qr` distinto, formato `yemheng.pe/m/{NUM}-........`, `char_length <= 60`, único.
4. `GET /mesas` expone `qr` rotado y frontend lo renderiza en detalle/hoja.
5. Carta pública (futura) resuelve por `codigo_qr`; QR viejo → 404.
