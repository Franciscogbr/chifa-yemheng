# Rendición de delivery — implementación y despliegue

## Alcance implementado

- La pantalla `/admin/rendiciones` permite seleccionar repartidor, cargar pedidos
  entregados en efectivo, seleccionar un subconjunto, calcular diferencia y
  registrar el monto realmente recibido.
- Un RPC transaccional crea la rendición, relaciona sus pedidos e ingresa a caja
  el monto recibido. Un pedido no puede pertenecer a dos rendiciones.
- Los estados persistidos son `R` (pendiente de validación), `O` (observada) y
  `V` (validada). La validación guarda usuario y fecha; no reutiliza
  `movimiento_caja.estado`.
- El historial tiene filtros de repartidor, estado y fechas, paginación, descarga
  de constancias PDF y exportación completa a Excel.
- El registro de tokens FCM está ligado al empleado del JWT; el navegador no envía
  un `userId` para decidir a qué repartidor se asocia el token.
- Los pagos digitales se excluyen con `metodo_pago.afecta_efectivo = 'S'`.

El PDF deja constancia del usuario que validó y de la fecha. No incluye una firma
gráfica, porque el sistema no tiene una firma digital registrada.

Los movimientos creados por la versión anterior se consultan para impedir que un
pedido ya rendido vuelva a registrarse. No se importan automáticamente al nuevo
historial: el modelo anterior no guardaba el monto realmente entregado ni un
estado de validación fiable. Antes de habilitar el cambio en producción, revisar
si existen descripciones `Rendición delivery repartidor ...` y conciliarlas.

## Cambios de base de datos requeridos

El proyecto usa migraciones imperativas. El CLI de Supabase no está disponible en
el entorno, así que **no se creó un nombre de migración manualmente ni se ejecutó
SQL en la base remota**.

En Supabase SQL Editor, aplicar en este orden:

1. `openspec/database/alter-data/add-rendicion-wrapper/01_fn_registrar_movimiento_caja.sql`
   (crea el wrapper contable y asigna permisos `REN_*`).
2. `openspec/database/alter-data/add-rendicion-delivery-ledger/01_create_rendicion_delivery.sql`
   (crea el ledger, el detalle, la tabla de tokens, RLS/grants y el RPC transaccional).

La API nueva de rendiciones y el registro push requieren que ambos scripts estén
aplicados. Las tablas están protegidas con RLS y solo se concede acceso directo a
`service_role`, usado exclusivamente por el backend. No conceder acceso a
`anon`/`authenticated`.

Verificar después de aplicarlos:

```sql
SELECT to_regclass('public.rendicion_delivery') AS rendicion,
       to_regclass('public.rendicion_delivery_detalle') AS detalle,
       to_regclass('public.dispositivo_token') AS tokens;

SELECT proname
FROM pg_proc
WHERE proname IN ('fn_registrar_movimiento_caja', 'fn_registrar_rendicion_delivery');
```

También confirmar que los permisos `REN_VER`, `REN_REGISTRAR` y `REN_VALIDAR`
estén asignados a los roles correspondientes. El script del wrapper asigna
`REN_VER`/`REN_REGISTRAR` a cajero y los tres permisos a supervisor/admin.

## Push: configuración necesaria

No se agregó ninguna dependencia: `firebase` ya está en el frontend y
`firebase-admin` en el backend.

En el entorno de **build del frontend**, configurar los valores públicos de la
aplicación web Firebase y la clave pública VAPID:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_AUTH_DOMAIN` (opcional)
- `VITE_FIREBASE_VAPID_KEY`

Estos valores identifican la app web y la clave VAPID es pública; **no** colocar
la cuenta de servicio en variables `VITE_*`. La credencial privada usada por
`firebase-admin` debe permanecer solo en Render/backend (`FIREBASE_SERVICE_ACCOUNT`).
El repartidor activa las notificaciones desde su panel y el service worker está
en `frontend/public/firebase-messaging-sw.js`.

## Uso y validación funcional

1. Abrir `/admin/rendiciones` con una cuenta con `REN_VER`; el cajero también
   necesita `REN_REGISTRAR` para crear rendiciones.
2. Seleccionar repartidor, cargar los pendientes, marcar los pedidos y registrar
   el monto entregado. Si hay faltante o sobrante, la observación es obligatoria.
3. La transacción falla completa si ya se rindió un pedido, no existe turno de
   caja abierto o un pedido ya no cumple las condiciones.
4. Supervisor/admin con `REN_VALIDAR` puede validar rendiciones `R` u `O`.
5. Filtrar el historial, descargar una constancia PDF o exportar los resultados a
   Excel.
6. En el panel de repartidor, activar avisos; revisar el permiso del navegador y
   la configuración de Firebase si aparece un error.

## Pendientes que requieren datos del negocio

- Cargar centroides y costos aprobados para distritos. No se inventan coordenadas
  ni tarifas; sin datos oficiales la sugerencia de costo por distancia sigue
  limitada.
- Configurar las variables públicas Firebase/VAPID en el entorno de despliegue.
- Aplicar y verificar los dos scripts SQL en Supabase antes de desplegar el
  backend que usa el ledger nuevo.
