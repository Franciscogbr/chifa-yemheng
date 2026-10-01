# Catálogo de Reglas de Negocio — Chifa "RESTAURANTEV3"

**Sistema:** Gestión de ventas y pedidos para restaurante (chifa) — base de datos `RESTAURANTEV3` (Microsoft SQL Server 2016+).
**Archivo fuente del modelo:** `01_MODELO_RESTAURANTE_SQLSERVER.sql`
**Enfoque:** Automatizar la atención al cliente mediante autoconsumo por QR + delivery, con caja/facturación, roles/permisos y auditoría.

---

## 1. Glosario de términos

| Término | Definición |
|---|---|
| **Comanda (Pedido)** | Cabecera del pedido que se registra en una mesa (o para llevar/delivery). Reúne uno o varios ítems. |
| **Ítem (Detalle del pedido)** | Cada plato/bebida que forma parte de una comanda, con cantidad, precio y estado de preparación. |
| **POR COBRAR** | Estado de mesa/comanda cuando el cliente solicitó la cuenta y está pendiente el cobro. |
| **Comprobante de venta** | Documento emitido por el cajero al cobrar (BOLETA 03 / FACTURA 01 / TICKET TK) junto con VENTA, PAGO_VENTA y MOVIMIENTO_CAJA en una sola operación (BR-ACC-042). Su tipo lo decide el cajero (tabla 4.1); se entrega en mesa (por el mozo) o en el mostrador de Caja. |
| **Turno de caja (APERTURA_CAJA)** | Período en que una caja está abierta operando con un cajero a cargo. Una caja solo puede tener un turno abierto a la vez. |
| **Arqueo de caja** | Control al cierre del turno: compara el dinero físico declarado con el que el sistema espera, dando CUADRADO/SOBRANTE/FALTANTE. |
| **Recargo por servicio** | Porcentaje adicional según el tipo de mesa. En este chifa se usa solo mesa estándar (0%), por lo que el recargo es 0. |
| **Autoconsumo QR** | Modalidad en que el cliente escanea un código QR de la mesa y pide desde su propio celular. |
| **Consumidor final** | En el autoconsumo QR el cliente se identifica con Gmail (login obligatorio) y se asocia al CLIENTE correspondiente. Si el cliente no desea usar QR o no tiene celular, lo atiende un mesero (flujo tradicional). El cliente genérico "CLIENTES VARIOS" aplica a la venta rápida/presencial sin identificación. |
| **Pago único** | Una venta se paga con un solo método (efectivo, o Yape/PLIN, o tarjeta); no se combinan métodos en la misma venta. |
| **Afecta_Efectivo** | Indica si un movimiento/pago corresponde a dinero físico que entra o sale de la caja (afecta el `Monto_Sistema`). |
| **Costo de envío** | Tarifa del delivery pagada por el cliente; se asigna manualmente según la zona/distrito. |
| **Reserva de mesa** | Reserva de una mesa para una fecha/hora futura. Se registra por tres canales: **presencial** (en el local), **telefónica** u **online** (app con login Gmail obligatorio). La online **nace Pendiente (P) sin mesa asignada** y el personal la confirma asignando una mesa libre (la mesa pasa a RESERVADA). |
| **Comanda Compartida** | Modalidad de autoconsumo QR donde múltiples clientes autenticados mediante el QR de una misma mesa participan de una única comanda activa. |
| **Participante de Mesa** | Cliente autenticado mediante Gmail que se incorpora a la comanda activa de una mesa utilizando el QR de dicha mesa. |

---

## 2. Sección A — Catálogo de reglas por categoría

Cada regla tiene un identificador `BR-{dominio}-{number}`. La columna "Implementación" indica dónde se aplica en el modelo (tabla / USP / app).

### 2.1 Reglas estructurales (hechos y relaciones)

| ID | Regla | Implementación |
|---|---|---|
| BR-EST-001 | Un CLIENTE es exactamente una persona natural (`Tipo_Cliente = 'N'`) o una empresa (`Tipo_Cliente = 'J'`), nunca ambas ni ninguna (XOR). | CLIENTE (CK_CLIENTE_XOR) |
| BR-EST-002 | PERSONA es la base; de ella derivan CLIENTE y EMPLEADO. | PERSONA → CLIENTE / EMPLEADO |
| BR-EST-003 | Todo USUARIO del sistema es personal (empleado); el cliente con Gmail es solo CLIENTE, no usuario. | USUARIO.ID_Empleado |
| BR-EST-004 | Un PEDIDO (comanda) pertenece a un cliente y opcionalmente a una mesa; el delivery y para llevar no requieren mesa. | PEDIDO.ID_Cliente / ID_Mesa |
| BR-EST-005 | Toda VENTA nace de un PEDIDO (1 venta → 1 pedido). | VENTA.ID_Pedido (NOT NULL) |
| BR-EST-006 | Una venta genera como máximo una BOLETA o una FACTURA (relación 1:1). | BOLETA/FACTURA `UQ_ID_Venta` |
| BR-EST-007 | Una mesa solo puede tener una comanda abierta a la vez. | USP_ABRIR_PEDIDO |
| BR-EST-008 | Toda venta pertenece a un turno de caja abierto. | VENTA.ID_AperturaCaja (NOT NULL) |
| BR-EST-009 | Un pedido delivery tiene su registro 1:1 en PEDIDO_DELIVERY. | PEDIDO_DELIVERY `UQ_ID_Pedido` |
| BR-EST-010 | Una RECETA vincula un plato preparado (`Tipo_Producto = 'P'`) con uno o más insumos (`Tipo_Producto = 'I'`) y la cantidad requerida. | RECETA (FK a PRODUCTO ×2, UQ) |
| BR-EST-011 | La comanda pertenece a la mesa y no al cliente individual. Todos los consumos registrados desde el QR de una mesa se consolidan en una única comanda activa. | PEDIDO.ID_Mesa + App |
| BR-EST-012 | Todos los clientes autenticados mediante el QR de una misma mesa participan de la misma comanda activa. | App QR |
| BR-EST-013 | Una mesa puede tener múltiples clientes asociados a una misma comanda activa. | App QR |
| BR-EST-014 | Un cliente puede participar simultáneamente en una sola comanda activa por mesa. | App QR |
| BR-EST-057 | Una venta admite N notas de crédito (sin límite de 1); cada NC referencia la boleta/factura original y usa la serie 07/BC01. | NOTA_CREDITO / SERIE_DOCUMENTO |

### 2.2 Reglas de restricción (qué está prohibido u obligado)

| ID | Regla | Implementación |
|---|---|---|
| BR-RES-011 | Solo se agregan productos ACTIVOS y DISPONIBLES a una comanda. | USP_AGREGAR_DETALLE_PEDIDO |
| BR-RES-012 | No se agregan ítems a un pedido FACTURADO ni ANULADO. | USP_AGREGAR_DETALLE_PEDIDO |
| BR-RES-013 | Una mesa solo puede tener una comanda abierta (no facturada ni anulada). | USP_ABRIR_PEDIDO |
| BR-RES-014 | Si el tipo de pedido exige mesa (`Requiere_Mesa = 'S'`), debe indicarse una mesa. | USP_ABRIR_PEDIDO |
| BR-RES-015 | Un pedido se anula SOLO si no está facturado. Una venta facturada solo se corrige con NOTA_CREDITO (BR-RES-054). | USP_ANULAR_PEDIDO / USP_ANULAR_VENTA_CON_NC |
| BR-RES-016 | La FACTURA (01) solo se emite a clientes asociados a una EMPRESA con RUC. | USP_FACTURAR_PEDIDO |
| BR-RES-017 | Toda venta requiere un turno de caja ABIERTO. | USP_FACTURAR_PEDIDO |
| BR-RES-018 | Cantidades, precios, montos y capacidad deben ser valores > 0 (validaciones de la BD). | Checks CK_DETPED_CAN, CK_DETVEN_CAN, CK_PAGVEN_MON, CK_MOVCAJA_MON, CK_MESA_CAP, etc. |
| BR-RES-019 | Las cortesías y descuentos solo los aplica quien tiene permiso `PED_DESCUENTO` (mozo/supervisor); el cliente QR nunca los aplica por sí mismo. | ROL_PERMISO / app |
| BR-RES-020 | El estado de preparación de los platos solo lo cambia el personal de COCINA (CHEF / AYUDANTE DE COCINA). | Autorización / app (rol COCINA) |
| BR-RES-021 | El autoconsumo QR exige que el cliente se identifique de forma **obligatoria** con login Gmail. Si el cliente no desea usar QR o no tiene celular, un **mesero** toma el pedido de forma tradicional (sin exigir login Gmail). | App (OAuth) / Mesero |
| BR-RES-022 | Solo se muestran al cliente los productos DISPONIBLES y con stock (se ocultan agotados e insumos). | App (consulta a PRODUCTO/CATEGORÍA) |
| BR-RES-023 | Si una mesa ya posee una comanda activa, no se crea una nueva comanda al escanear nuevamente el QR. | App QR |
| BR-RES-024 | El cliente que escanea el QR de una mesa con comanda activa se incorpora automáticamente a dicha comanda. | App QR |
| BR-RES-025 | Todos los productos agregados por distintos participantes de una mesa se consolidan en una única comanda. | PEDIDO / DETALLE_PEDIDO |
| BR-RES-026 | La solicitud de cuenta aplica a toda la comanda de la mesa. | App |
| BR-RES-027 | No se permite dividir automáticamente una comanda en múltiples ventas. | Caja |
| BR-RES-028 | No se permite emitir múltiples comprobantes para una misma comanda. | Caja |
| BR-RES-029 | Una mesa en estado POR COBRAR no admite nuevos productos. | USP_AGREGAR_DETALLE_PEDIDO |
| BR-RES-054 | La NOTA_CREDITO solo se emite sobre una VENTA facturada y no anulada; exige motivo obligatorio y serie 07 con correlativo bloqueado. | USP_ANULAR_VENTA_CON_NC |
| BR-RES-052 | La reserva **online** exige login Gmail **obligatorio** (asociado al CLIENTE) y **nace Pendiente (P) sin mesa asignada** (`ID_Mesa NULL`, usuario interno AUTOSERVICIO). Solo el personal con permiso `SAL_RESERVA` la confirma **asignando una mesa libre**, y la mesa pasa a RESERVADA. | App (OAuth) + RESERVA / app |

### 2.3 Reglas de derivación (cálculos)

| ID | Regla | Implementación |
|---|---|---|
| BR-DER-023 | Subtotal del ítem = Cantidad × Precio Unitario − Descuento. | DETALLE_PEDIDO / DETALLE_VENTA (persisted) |
| BR-DER-024 | Bruto del pedido = Σ de subtotales de los ítems, EXCLUYENDO anulados (`Estado_Preparacion='A'`), inactivos y cortesías. | FN_TOTAL_PEDIDO |
| BR-DER-025 | Servicio = (Bruto − Descuento) × Cargo_Servicio(tipo mesa) / 100. Con mesa estándar (0%) el servicio = 0. | USP_RECALCULAR_PEDIDO |
| BR-DER-026 | IGV (18% incluido) = Total − Total / 1.18. | USP_RECALCULAR_PEDIDO |
| BR-DER-027 | SubTotal = Total / 1.18 (base gravada). | USP_RECALCULAR_PEDIDO |
| BR-DER-028 | Total = Bruto − Descuento + Servicio. | USP_RECALCULAR_PEDIDO |
| BR-DER-029 | Vuelto = Monto_Recibido − Total (solo si > 0 y el pago es en efectivo). | USP_FACTURAR_PEDIDO |
| BR-DER-030 | La venta se paga con **un solo método de pago**; se cierra cuando el pago cubre el Total (Total_Pagado ≥ Total). | PAGO_VENTA |
| BR-DER-031 | Correlativo del comprobante = siguiente número con bloqueo (UPDLOCK/HOLDLOCK) para evitar duplicados; formato de 8 dígitos. | USP_FACTURAR_PEDIDO + SERIE_DOCUMENTO |
| BR-DER-032 | Diferencia de caja = Monto_Declarado − Monto_Sistema → CUADRADO (0), SOBRANTE (>0), FALTANTE (<0). | USP_CERRAR_CAJA |
| BR-DER-033 | Costo de envío = asignado manualmente según el distrito/zona al registrar el delivery (sugerido por la app). | PEDIDO_DELIVERY.Costo_Envio |
| BR-DER-034 | Tiempo de preparación = F_Atencion − F_Solicitud; tiempo de espera = ahora − F_Solicitud (no se almacena, se calcula). | DETALLE_PEDIDO / VW_COMANDA_COCINA |
| BR-DER-056 | Al emitir la NC: `VENTA.Anulada='S'` y egreso en caja (concepto `DEVOLUCION A CLIENTE`) por el total devuelto; el egreso reduce `Monto_Sistema` solo si fue en efectivo. | USP_ANULAR_VENTA_CON_NC |
| BR-DER-053 | El **adelanto** de una reserva es **opcional**. En la reserva online solo se admite pago **único digital** (nunca efectivo a distancia) y se registra con concepto `ADELANTO DE RESERVA`. | App + MOVIMIENTO_CAJA (pago digital) |

### 2.4 Reglas de acción y autorización (comportamiento)

| ID | Regla | Implementación |
|---|---|---|
| BR-ACC-035 | El personal inicia sesión con login + clave (hash); se bloquea tras 3 intentos fallidos. | USP_LOGIN |
| BR-ACC-036 | El menú/permiso que ve cada usuario depende de sus roles y permisos concedidos (RBAC). | USP_PERMISOS_USUARIO |
| BR-ACC-037 | Al abrir una comanda, la mesa pasa a OCUPADA; al facturar o anular vuelve a LIBRE. | USP_ABRIR_PEDIDO / USP_FACTURAR_PEDIDO / USP_ANULAR_PEDIDO |
| BR-ACC-038 | Transiciones del ítem de cocina: P (Pendiente) → E (En proceso) → S (Servido), y P → A (Anulado) si se descarta por agotado. | App / update a DETALLE_PEDIDO |
| BR-ACC-039 | Transiciones del pedido: ABIERTO → EN PREPARACION → SERVIDO → FACTURADO (o ANULADO). | ESTADO_PEDIDO / USP |
| BR-ACC-040 | Transiciones del delivery: P (Pendiente) → R (En ruta) → E (Entregado), y P → C (Cancelado), con F_Salida/F_Entrega. | PEDIDO_DELIVERY |
| BR-ACC-041 | El delivery se asigna al primer repartidor disponible. | App (asignación) |
| BR-ACC-042 | Al facturar se registra: VENTA + detalle + BOLETA/FACTURA + **un solo** PAGO_VENTA + **un solo** MOVIMIENTO_CAJA (con concepto según el único método: efectivo→VENTA AL CONTADO, YAPE/PLIN→BILLETERA DIGITAL, tarjeta→COBRO CON TARJETA). | USP_FACTURAR_PEDIDO |
| BR-ACC-043 | El cobro de la venta se hace con **un solo método** (efectivo o digital). El cajero lo ejecuta/autoriza en terminal; el cliente desde la app solo solicita la cuenta (POR COBRAR). | USP_FACTURAR_PEDIDO + app |
| BR-ACC-044 | En el autoconsumo QR el cliente inicia sesión con Gmail (OAuth externo) de forma **obligatoria**; el login/cierre se audita en AUDITORIA. En el flujo presencial el mesero toma el pedido sin login del cliente. | App + AUDITORIA |
| BR-ACC-045 | Si el delivery se cobra en EFECTIVO contra entrega, el repartidor entrega el dinero al cajero al regresar, quien registra el ingreso en el arqueo. | MOVIMIENTO_CAJA / app |
| BR-ACC-046 | El cierre de caja lo inicia el cajero (declara el monto); un supervisor/administrador valida y confirma el cierre. | USP_CERRAR_CAJA + roles |
| BR-ACC-047 | Al escanear el QR se valida si la mesa posee una comanda activa. | App QR |
| BR-ACC-048 | Si la mesa no posee una comanda activa, el sistema crea una nueva comanda y cambia la mesa a estado OCUPADA. | App QR |
| BR-ACC-049 | Si la mesa ya posee una comanda activa, el sistema incorpora al cliente a la comanda existente. | App QR |
| BR-ACC-050 | Todos los participantes asociados a una mesa visualizan el mismo consumo acumulado. | App QR |
| BR-ACC-051 | La acción "Pedir Cuenta" realizada por cualquier participante afecta a toda la comanda de la mesa. | App QR |
| BR-ACC-052 | Al facturarse la comanda, se finalizan todas las sesiones QR asociadas a la mesa. | App QR |
| BR-ACC-055 | Solo el **supervisor/administrador** (permiso `VEN_NOTACREDITO`) autoriza y emite la NC; el USP rechaza a cualquier otro rol aunque invoque el procedimiento directo. Cada NC se audita. | USP_ANULAR_VENTA_CON_NC + AUDITORIA |

### 2.5 Reglas de inferencia (deducciones)

| ID | Regla | Implementación |
|---|---|---|
| BR-INF-047 | La comanda está EN PREPARACION si al menos un ítem está EN PROCESO (E). | Derivación por ítems |
| BR-INF-048 | La comanda está SERVIDO si TODOS sus ítems están SERVIDOS (S). | Derivación por ítems |
| BR-INF-049 | El arqueo se clasifica por su diferencia: cuadrado (0), sobrante (>0), faltante (<0). | USP_CERRAR_CAJA |
| BR-INF-050 | Cliente frecuente: se identifica por correo Gmail y acumula Puntos/historial (reutilizando su CLIENTE). | App + CLIENTE |
| BR-INF-051 | Los pagos digitales se registran como ingreso del negocio (Total_Ingresos) pero NO modifican el efectivo físico (Monto_Sistema). | USP_REGISTRAR_MOVIMIENTO_CAJA |
| BR-INF-052 | Si existe una comanda activa asociada a una mesa, la mesa se considera OCUPADA. | Derivación PEDIDO + MESA |
| BR-INF-053 | Si la comanda activa se encuentra en estado POR COBRAR, la mesa se considera POR COBRAR. | Derivación PEDIDO + MESA |
| BR-INF-054 | Todos los participantes de una mesa observan el mismo total acumulado porque comparten una única comanda activa. | App QR |

---

## 3. Sección B — Reglas mapeadas por tramos (flujo de atención)

> Las reglas de la Sección A se agrupan aquí según la etapa del proceso en que aplican.

### Tramo 0 — Reserva de mesa (presencial, telefónica u online)
- Una reserva se registra por **tres canales**: **presencial** (en el local), **telefónica** u **online** (app con login Gmail obligatorio).
- La reserva **online nace Pendiente (P) sin mesa asignada** (`ID_Mesa NULL`, usuario interno AUTOSERVICIO) (BR-RES-052).
- El personal con permiso `SAL_RESERVA` **confirma** la reserva **asignando una mesa libre**; la mesa pasa a **RESERVADA** y queda bloqueada para el horario reservado (BR-RES-052, BR-ACC-037).
- El **adelanto** es **opcional** y, en online, solo **pago único digital** (concepto `ADELANTO DE RESERVA`); se cruza con la cuenta al facturar (BR-DER-053).
- Al llegar el cliente con reserva confirmada, pasa directo a su mesa (sigue al Tramo 1).

### Tramo 1 — Llegada del cliente y mesa
- Cada mesa tiene un **QR impreso** que identifica la mesa y su ambiente (BR-... brecha: `Codigo_QR` en MESA).
- El autoconsumo QR exige que el cliente se **identifique con Gmail** (login obligatorio; se audita). Si el cliente **no desea usar QR** o no tiene celular, un **mesero lo atiende presencial** (flujo tradicional, sin exigir login del cliente).
- Si no tiene celular o prefiere, un **mozo lo atiende presencial** (flujo tradicional).

### Tramo 2 — Abrir comanda (QR) · Comanda compartida por mesa
- El cliente escanea el QR de una mesa.
- El sistema valida el login Gmail obligatorio.
- El sistema identifica la mesa asociada al QR.
- Si la mesa no posee una comanda activa (BR-ACC-048):
    - se crea una nueva comanda;
    - la mesa pasa a estado OCUPADA.
- Si la mesa ya posee una comanda activa (BR-ACC-049, BR-RES-023/024):
    - no se crea una nueva comanda;
    - el cliente se incorpora a la comanda existente.
- El pedido QR se registra mediante el usuario interno AUTOSERVICIO.
- Todos los clientes autenticados mediante el mismo QR comparten una única comanda activa (BR-EST-011/012/013).
- Todos los productos agregados por cualquier participante se consolidan en la misma comanda (BR-RES-025).
- Todos los participantes visualizan el mismo consumo acumulado (BR-ACC-050, BR-INF-054).
- La comanda pertenece a la mesa y no a un cliente individual.
- La cuenta pertenece a la mesa y no a un cliente individual (BR-RES-026).

### Tramo 3 — Ver la carta y armar el pedido
- Solo se muestran productos **disponibles y con stock** (BR-RES-022).
- El cliente agrega cantidad, nota ("sin ají") y ve precios con IGV incluido (BR-DER-023, BR-EST-001).
- El cliente **confirma su pedido entero** antes de enviarlo a cocina.
- Los productos agregados por cualquier participante forman parte de la misma comanda (BR-RES-025).
- Opcionalmente el sistema puede registrar qué cliente agregó cada producto para fines informativos y de auditoría.
- El total mostrado corresponde al consumo acumulado total de la mesa (BR-INF-054, BR-ACC-050).
- Ejemplo Mesa 12: Juan agrega 1 Chaufa Especial + María agrega 2 Inka Cola + Carlos agrega 1 Wantán Frito → COMANDA COMPARTIDA (1 Chaufa Especial, 2 Inka Cola, 1 Wantán Frito) TOTAL MESA S/. 58.00.

### Tramo 4 — Confirmación a cocina
- El cliente envía a cocina por **tandas confirmadas**; puede reabrir y agregar más (BR-RES-012).
- La comanda pasa a **EN PREPARACION** cuando cocina toma el 1er plato del envío (BR-INF-047).
- El cliente recibe **aviso** en su app cuando sus platos cambian de estado; un **mozo lleva el plato a la mesa**.

### Tramo 5 — Preparación en cocina (por ítem)
- Cocina cambia los estados por ítem P→E→S (BR-ACC-038) y **solo cocina** lo hace (BR-RES-020).
- Cocina puede **anular** un plato agotado (A) para que ya no se pida (BR-ACC-038).
- Preparación en **orden de llegada**. El tiempo de espera/preparación se **calcula** (BR-DER-034).

### Tramo 6 — Entrega y estado servido
- Cocina marca el plato como **S (Servido)** al despacharlo.
- El mozo lleva el plato a la mesa; el aviso al cliente se actualiza **al entregar** (BR-ACC-044).
- La comanda pasa a **SERVIDO** cuando **todos** sus ítems están servidos (BR-INF-048).

### Tramo 7 — Cobro y pago
- El cliente desde la app pulsa **"Pedir la cuenta/Cobrar"** → la comanda pasa a **POR COBRAR** (ya no se agregan platos, BR-RES-029). El cliente QR **nunca paga directamente** desde el celular: solo solicita la cuenta (BR-ACC-043).
- La solicitud de cuenta afecta a todos los participantes de la mesa (BR-ACC-051, BR-RES-026).
- No existe división automática de cuentas (BR-RES-027).
- Todos los consumos de la mesa generan una única venta (BR-EST-005).
- La venta genera un único comprobante (BR-EST-006, BR-RES-028).
- La cuenta corresponde al consumo total acumulado de la mesa.
- El cajero cobra una única cuenta correspondiente a la comanda compartida.
- **Pago único**: el cajero cobra la cuenta con **un solo método** (efectivo o digital: Yape/Plín, tarjeta, transferencia) y ejecuta la venta (BR-ACC-042/043, BR-DER-030, BR-DER-029). El mozo del flujo tradicional tampoco cobra: solo pide la cuenta por el POS.
- La venta se cierra cuando el pago **cubre el Total (Total_Pagado ≥ Total)** (BR-DER-030).
- **Comprobante**: al cobrar se emite **BOLETA (03)**, **FACTURA (01)** o **TICKET (TK)**. El **tipo lo decide el cajero en el terminal** según la tabla 4.1 (empresa con RUC + lo pide → FACTURA; si no → BOLETA); **no se solicita desde la app del cliente**.
- **Logística en mesa**: el mozo lleva la cuenta al cliente; tras el cobro en Caja, el mozo lleva a la mesa el comprobante (boleta/factura/ticket) y el vuelto (si fue efectivo). Variante aceptada: el cliente paga en el mostrador de Caja y retira su comprobante allí.
- Al liberar la mesa (→ LIBRE), la app muestra el mensaje de cierre/agradecimiento (BR-ACC-037).
- Al finalizar el cobro: la comanda se cierra; la mesa vuelve a estado LIBRE; finalizan las sesiones QR de todos los participantes (BR-ACC-052).

### Tramo 8 — Delivery y repartidor
- Delivery por la **app** (Gmail obligatorio + dirección) o por **teléfono** (BR-RES-021).
- **Costo de envío** asignado manualmente según el distrito (sugerido por la app) (BR-DER-033).
- El sistema asigna al **primer repartidor disponible** (BR-ACC-041).
- Estados del delivery P→R→E (y C cancelado) con F_Salida/F_Entrega (BR-ACC-040).
- El delivery se cobra con **un solo método** (efectivo o digital): si fue **en efectivo contra entrega**, el repartidor rinde el efectivo al cajero al regresar (BR-ACC-045); los pagos digitales no llegan a la caja física (BR-INF-051).

### Tramo 9 — Cierre de caja / arqueo
- Cada caja maneja uno o varios turnos; un turno se cierra antes de abrir otro en la misma caja (BR-EST-008, BR-RES-017).
- El arqueo se calcula en los USP: `Diferencia = Monto_Declarado − Monto_Sistema` → CUADRADO/SOBRANTE/FALTANTE (BR-DER-032, BR-INF-049).
- El cajero declara el efectivo; un **supervisor/administrador valida** el cierre (BR-ACC-046).
- Los pagos digitales se registran como ingreso pero **no** modifican el efectivo físico (BR-INF-051).

---

## 4. Tablas de decisión

### 4.1 Selección del comprobante según tipo de cliente y petición

| Condiciones | R1 | R2 |
|---|---|---|
| Cliente es EMPRESA con RUC | No | Sí |
| Cliente solicita factura | No | Sí |
| **Acciones** | | |
| Emitir BOLETA (03) | X | |
| Emitir FACTURA (01) | | X |

### 4.2 Cierre de la venta (pago único)

| Condiciones | R1 | R2 |
|---|---|---|
| Único pago (Sus métodos) ≥ Total | No | Sí |
| Pago en EFECTIVO supera el Total | — | No / Sí |
| **Acciones** | | |
| Permitir cerrar venta | | X |
| Calcular Vuelto (solo efectivo) | | (si efectivo) |
| **Resultado** | No se cierra | Venta cerrada |

### 4.3 Estados de la comanda según ítems

| Condiciones | R1 | R2 | R3 |
|---|---|---|---|
| Algún ítem EN PROCESO (E) | Sí | No | No |
| Todos los ítems SERVIDOS (S) | — | No | Sí |
| **Acciones** | | | |
| Estado comanda = EN PREPARACION | X | | |
| Estado comanda = SERVIDO | | | X |
| (Si facturado → FACTURADO) | | | |

### 4.4 Efecto de los pagos sobre el arqueo

| Condiciones | EFECTIVO | YAPE/PLIN | TARJETA |
|---|---|---|---|
| Genera movimiento de caja | Sí | Sí | Sí |
| Afecta físicamente la caja (Monto_Sistema) | **Sí** | No | No |
| Suma a Total_Ingresos | Sí | Sí | Sí |

---

## 5. Mapeo USP ↔ Reglas

| USP / Función / Vista | Reglas que implementa | Línea |
|---|---|---|
| FN_TOTAL_PEDIDO | BR-DER-024 | 1396 |
| USP_LOGIN | BR-ACC-035, BR-ACC-044 | 1415 |
| USP_PERMISOS_USUARIO | BR-ACC-036 | 1472 |
| USP_APERTURAR_CAJA | BR-EST-008, BR-ACC-046 | 1489 |
| USP_REGISTRAR_MOVIMIENTO_CAJA | BR-INF-051, BR-ACC-042, BR-ACC-045 | 1521 |
| USP_CERRAR_CAJA | BR-DER-032, BR-INF-049, BR-ACC-046 | 1568 |
| USP_ABRIR_PEDIDO | BR-EST-007, BR-RES-014, BR-ACC-037 | 1609 |
| USP_RECALCULAR_PEDIDO | BR-DER-025, BR-DER-026, BR-DER-027, BR-DER-028 | 1648 |
| USP_AGREGAR_DETALLE_PEDIDO | BR-RES-011, BR-RES-012, BR-DER-023 | 1680 |
| USP_FACTURAR_PEDIDO | BR-EST-005/006, BR-RES-016/017, BR-DER-029/030/031, BR-ACC-042/043 | 1707 |
| USP_ANULAR_PEDIDO | BR-RES-015, BR-ACC-037 | 1843 |
| USP_ANULAR_VENTA_CON_NC | BR-RES-054, BR-ACC-055, BR-DER-056, BR-EST-057 | — |
| VW_COMANDA_COCINA | BR-DER-034 | 1926 |
| VW_ARQUEO_CAJA | BR-DER-032, BR-INF-049 | 1965 |

---

## 6. Matriz de brechas (adiciones que NO rompen el modelo)

> Cambios propuestos para soportar el flujo QR/delivery. Son **adiciones**; no alteran la estructura existente.

| Área | Cambio propuesto | Tipo |
|---|---|---|
| Mesa | QR por mesa **automatizado en la app**: la app lee las mesas desde `MESA` y el QR codifica el ID de mesa; **sin alterar el modelo** y sin depender de programador para nuevas mesas. | App (no toca BD) |
| Seguridad | Crear usuario interno "AUTOSERVICIO" para registrar comandas QR. | Datos/config |
| Cocina | Nuevo USP para cambiar el `Estado_Preparacion` de un ítem (P/E/S/A). | USP nuevo |
| Pedido | Nuevo USP para derivar el estado del pedido (EN PREPARACION/SERVIDO) según sus ítems. | USP nuevo |
| Delivery | Nuevo USP para actualizar `PEDIDO_DELIVERY.Situacion`, asignación y rendición (con pago único). | USP nuevo |
| Inventario | Nuevo USP para descontar insumos por RECETA al servir (MOVIMIENTO_INVENTARIO tipo 'S'). | USP nuevo |
| App (no BD) | Validar unicidad de correo Gmail; validar longitud de documento; sugerir costo de envío por zona; validar comensales ≤ capacidad; control del efectivo "por rendir" del repartidor. | App |

---

## 7. Resumen de validación

- **Total de reglas (Sección A + GPS):** 73 (53 base + 20 comanda compartida BR-EST-011/014, BR-RES-023/029, BR-ACC-047/052, BR-INF-052/054).
- **Por categoría:**
  - Estructural: 14
  - Restricción: 20
  - Derivación: 13
  - Acción/Autorización: 18
  - Inferencia: 8
  - GPS: 2 (BR-GPS-001/002)
- **Decisiones clave confirmadas:** cliente NO es usuario (solo CLIENTE con Gmail); origen por usuario interno + ID_Cliente; **pago único por venta** (no mixto); estados de cocina por ítem; delivery con repartidor propio, pago único y efectivo contra entrega rendido a caja; cierre de caja con validación de supervisor; **nota de crédito con devolución para ventas facturadas (BR-RES-054/055/056, solo supervisor)**; **reserva de mesa por 3 canales (presencial/telefónica/online)**, con la online naciendo **Pendiente sin mesa** hasta que el personal la confirme asignando una mesa; **autoconsumo QR con comanda compartida por mesa (1 Mesa = 1 Comanda Activa = N Participantes = 1 Cuenta = 1 Venta = 1 Comprobante), sin división automática ni múltiples comprobantes**.

---

### 2.6 Reglas GPS (opcionales, add-geolocalizacion)

| ID | Regla | Implementación |
|---|---|---|
| BR-GPS-001 | La ubicación GPS es **opcional y nunca bloquea**: abrir comanda, agregar ítems, facturar o cerrar caja funcionan con `lat/lng NULL` usando `dirección + distrito` manual. | `pedido_delivery.lat/lng_* NULL`, `USP_ACTUALIZAR_UBICACION_DELIVERY`, app (fallback manual) |
| BR-GPS-002 | La distancia (haversine cliente ↔ `distrito.lat/lng_ref`) **solo sugiere** el `costo_envío`; el valor final lo confirma humano en `pedido_delivery.costo_envio` (`BR-DER-033` intacto). | `distrito.lat_ref, lng_ref, radio_km, costo_base` + app |

### Tramo 8 (+GPS)
- GPS opcional: el cliente comparte su pin al pedir (`CLIENTE`), el repartidor comparte su posición en ruta `R` cada 30s (`f_ubicacion`); se deja de compartir en `E/C`. Sin permiso GPS se usa el flujo manual actual.

### Matriz de brechas (+GPS)
| Delivery | Columnas `lat/lng_cliente, lat/lng_repartidor, f_ubicacion` + `USP_ACTUALIZAR_UBICACION_DELIVERY` + `VW_DELIVERY_UBICACION` | Adición App+BD (`alter-data/add-geolocalizacion/`) |

---

## 8. Principio general del modelo — Autoconsumo QR compartido

```text
PRINCIPIO GENERAL DE AUTOCONSUMO QR

1 Mesa
=
1 Comanda Activa
=
N Clientes Participantes
=
1 Cuenta
=
1 Venta
=
1 Comprobante

Todos los clientes autenticados mediante el QR de la misma mesa participan de la misma comanda activa.
Los productos agregados por cualquier participante se consolidan en una única comanda.
Todos visualizan el mismo consumo acumulado.
La cuenta pertenece a la mesa y no a personas individuales.
Al cobrarse la comanda:
- se genera una única venta;
- se emite un único comprobante;
- la mesa vuelve a estado LIBRE;
- finalizan las sesiones QR de todos los participantes.
```

## 9. Ejemplo completo — Comanda compartida

```text
Mesa 08
Juan escanea QR + María escanea QR + Carlos escanea QR
↓
Comanda #1045
↓
Juan agrega 1 Chaufa + María agrega 2 Gaseosas + Carlos agrega 1 Wantán
↓
Total Mesa: S/. 65.00
↓
María solicita la cuenta → Mesa = POR COBRAR
↓
Cajero realiza 1 venta → Se emite 1 comprobante
↓
Mesa = LIBRE → Fin de sesión QR para todos
```

---

*Documento generado a partir del análisis de `01_MODELO_RESTAURANTE_SQLSERVER.sql` y de las decisiones de negocio definidas para el chifa.*
