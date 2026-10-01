# Cliente Reservar

## Información General

### Nombre

Solicitud de Reserva Online (Canal Online)

### Ruta

```text
/cliente/reservar
```

> Archivo 7.2. La gestión staff vive en `reservas.md`
> (/admin/reservas); el listado cliente en `mis-reservas.md`.

### Shell

```text
PublicShell
```

### Feature

```text
features/cliente/reservar
```

### Roles Permitidos

```text
CLIENTE (Gmail obligatorio)
```

### Permisos

```text
CLIENTE_RESERVA (propuesto)
```

---

# Objetivo

Solicitar reserva online que nace Pendiente sin mesa.

Permite:

- Elegir fecha/hora, N personas, observación.
- Dejar adelanto opcional solo digital.
- Enviar → `P sin mesa` y seguir estado hasta confirmación staff.
- Cancelar pendiente propia.

No permite:

- Elegir mesa (la asigna staff con `SAL_RESERVA`).
- Pagar adelanto en efectivo a distancia.
- Confirmarse sola.

---

# Layout

```text
┌─────────────────────────────────────────────┐
│ Form (fecha, hora, personas, obs.)          │
├─────────────────────────────────────────────┤
│ Adelanto opcional (solo digital)            │
├─────────────────────────────────────────────┤
│ [Solicitar reserva]                         │
└─────────────────────────────────────────────┘
```

---

# Sección 1: Formulario

## Fecha* / Hora*

```text
DatePicker + TimePicker futuros.
```

## Personas*

```text
Número > 0. Sugerido validar ≤ capacidad típica mesa
(validación app brecha; no bloquea, advierte).
```

## Observación

```text
Textarea (ej. cumpleaños, tronas).
```

---

# Sección 2: Adelanto Opcional

```text
Monto (default 0) + método único digital
(Yape/Plin/tarjeta/transferencia, nunca efectivo).
Concepto ADELANTO DE RESERVA → MOVIMIENTO_CAJA digital
(suma Total_Ingresos, no Monto_Sistema).
```

BR:

```text
BR-DER-053.
```

---

# Flujo

```text
Solicitar → RESERVA (ID_Cliente=yo, ID_Mesa NULL,
ID_Usuario=AUTOSERVICIO, Situacion='P') → Mis reservas P
→ staff confirma con mesa libre → C + mesa RESERVADA
→ Atendida al llegar / X al cancelar.
```

---

# Reglas de Negocio

## BR-RES-052

```text
Online exige Gmail y nace Pendiente sin mesa (ID_Mesa NULL,
usuario AUTOSERVICIO). Solo personal con SAL_RESERVA la confirma
asignando mesa libre → RESERVADA.
```

## BR-DER-053

```text
Adelanto opcional; online solo pago único digital
(concepto ADELANTO DE RESERVA).
```

> Compatibilidad: el legado citaba validaciones de cliente/personas
> que hoy viven como VU-RES-001 en `reservas.md`; aquí ya cumplidas
> por Gmail obligatorio + validación personas > 0.

---

# Seguridad

```text
CLIENTE + Gmail. Sin Gmail → login-cliente.md.
```

---

# APIs

```http
POST /api/cliente/reservas
Body: { fReserva, nPersonas, observacion?, adelanto?, metodoDigital? }
Response: { idReserva, situacion: P }

PATCH /api/cliente/reservas/{id}/anular (solo P propia)
```

---

# Base de Datos

```text
RESERVA (ID_Cliente NOT NULL=yo, ID_Mesa NULL, ID_Usuario=AUTOSERVICIO,
F_Reserva, N_Personas default 2, Adelanto, Situacion P/C/A/X, Observacion)
CLIENTE / MESA (solo lectura desocupadas para info, no elección)
MOVIMIENTO_CAJA (adelanto digital) + APERTURA_CAJA (turno abierto)
```

---

# Auditoría

Registrar:

```text
Solicitar + cancelar online.
```

---

# Estados / Responsive

```text
Loading / Éxito P + link Mis reservas / Error.
Mobile-first wizard.
```

---

# Criterios de Aceptación

## Escenario 1

```gherkin
Given cliente Gmail
When solicita con fecha futura y 4 personas
Then se crea P sin mesa
```

---

## Escenario 2

```gherkin
Given adelanto online
When elige efectivo
Then el sistema rechaza (solo digital)
```

---

## Escenario 3

```gherkin
Given reserva P propia
When la cancela
Then pasa a X
```
