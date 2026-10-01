# Reportes

## Información General

### Nombre

Reportes

### Ruta

```text
/reportes
```

### Shell

```text
StaffShell
```

### Feature

```text
features/reportes
```

### Roles Permitidos

```text
SUPERVISOR
ADMIN
GERENTE
```

### Permisos

```text
REP_VER

REP_EXPORTAR

REP_FINANCIERO

REP_OPERATIVO
```

---

# Objetivo

Centralizar la consulta y análisis de información operativa, comercial y financiera del restaurante.

Permite:

- Analizar ventas.
- Analizar productos.
- Analizar clientes.
- Analizar delivery.
- Analizar reservas.
- Analizar productividad.
- Exportar información.
- Generar reportes ejecutivos.

---

# Usuarios Objetivo

```text
SUPERVISOR

ADMIN

GERENTE
```

---

# Layout

## Tipo

```text
Business Intelligence Operativo
```

---

## Estructura General

```text
┌──────────────────────────────┐
│ Indicadores Globales         │
├──────────────────────────────┤
│ Filtros                      │
├──────────────────────────────┤
│ Reportes Comerciales         │
├──────────────────────────────┤
│ Reportes Operativos          │
├──────────────────────────────┤
│ Exportaciones                │
└──────────────────────────────┘
```

---

# Sección 1: Indicadores Globales

## Mostrar

```text
Ventas Totales

Pedidos

Clientes

Ticket Promedio

Productos Vendidos
```

---

### Ejemplo

```text
Ventas:
S/. 125,000.00

Pedidos:
2,580

Clientes:
1,240

Ticket Promedio:
S/. 48.45

Productos:
8,950
```

---

# Sección 2: Filtros

## Fecha

```text
Hoy

Semana

Mes

Personalizado
```

---

## Sucursal

```text
Todas
```

---

## Canal

```text
Todos

Mesa

Delivery

Para Llevar
```

---

## Método Pago

```text
Todos

Efectivo

Yape

Plin

Tarjeta
```

---

# Reportes Comerciales

## Reporte de Ventas

### Mostrar

```text
Ventas por día

Ventas por semana

Ventas por mes

Ventas por año
```

---

### Indicadores

```text
Importe

Cantidad

Ticket Promedio
```

---

## Ventas por Canal

Mostrar:

```text
Mesa

Delivery

Para Llevar
```

---

### Métricas

```text
Cantidad

Total vendido

Porcentaje participación
```

---

## Ventas por Método de Pago

Mostrar:

```text
Efectivo

Yape

Plin

Tarjeta

Transferencia
```

---

# Reporte de Productos

## Más Vendidos

Mostrar:

```text
Top 10

Top 20

Top 50
```

---

### Métricas

```text
Cantidad vendida

Importe generado
```

---

## Menos Vendidos

Mostrar:

```text
Productos con baja rotación
```

---

## Categorías

Mostrar:

```text
Ventas por categoría
```

---

# Reporte de Clientes

## Clientes Frecuentes

Mostrar:

```text
Top clientes
```

---

### Métricas

```text
Cantidad pedidos

Consumo total

Ticket promedio
```

---

## Nuevos Clientes

Mostrar:

```text
Clientes registrados
por período
```

---

## Retención

Mostrar:

```text
Clientes recurrentes
```

---

# Reporte Delivery

## Indicadores

Mostrar:

```text
Pedidos Delivery

Ingresos Delivery

Costo Delivery

Ticket Delivery
```

---

## Repartidores

Mostrar:

```text
Cantidad pedidos

Entregas exitosas

Tiempo promedio
```

---

## Tiempos

```text
Preparación

Entrega

Tiempo Total
```

---

# Reporte de Reservas

## Mostrar

```text
Reservas registradas

Reservas confirmadas

Reservas canceladas

No Show
```

---

## Ocupación

```text
Utilización de mesas
```

---

## Horarios Más Solicitados

```text
Horas pico
```

---

# Reporte Financiero

## Ingresos

Mostrar:

```text
Ventas

Delivery

Otros ingresos
```

---

## Egresos

Mostrar:

```text
Movimientos de caja

Devoluciones

Notas de crédito
```

---

## Resultado

```text
Ingresos

Egresos

Utilidad Bruta
```

---

# Reporte de Caja

## Mostrar

```text
Aperturas

Cierres

Arqueos

Diferencias
```

---

## Indicadores

```text
Cuadrados

Sobrantes

Faltantes
```

---

# Reporte de Cocina

## Mostrar

```text
Pedidos preparados

Tiempo promedio

Productos anulados

Volumen producción
```

---

## Indicadores

```text
Preparados

Servidos

Anulados
```

---

# Dashboard Ejecutivo

## KPIs

Mostrar:

```text
Ventas Mes

Crecimiento

Clientes

Ticket Promedio

Delivery %

Rentabilidad
```

---

## Comparativos

Mostrar:

```text
Mes Actual vs Mes Anterior

Año Actual vs Año Anterior
```

---

# Gráficos

## Tipos

```text
Barras

Líneas

Área

Pie

Donut
```

---

## Componente

```text
Interactivo
```

---

# Exportaciones

## Excel

Formato:

```text
.xlsx
```

---

## PDF

Formato:

```text
.pdf
```

---

## CSV

Formato:

```text
.csv
```

---

# Programación de Reportes

## Opcional (Fase 2)

Permite:

```text
Enviar reportes automáticos
por correo electrónico.
```

---

## Frecuencia

```text
Diaria

Semanal

Mensual
```

---

# Restricciones

## No Permitido

```text
Modificar información histórica.
```

---

## No Permitido

```text
Eliminar registros desde reportes.
```

---

## No Permitido

```text
Acceso sin permisos autorizados.
```

---

# Reglas de Negocio

## BR-DER-030

```text
La venta utiliza un único
método de pago.
```

---

## BR-ACC-042

```text
Toda venta genera:

Venta

Pago

Comprobante

Movimiento Caja
```

---

## BR-INF-050

```text
El historial de compras permite
identificar clientes frecuentes.
```

---

## BR-INF-051

```text
Los pagos digitales no afectan
el efectivo físico de caja.
```

---

## BR-DER-032

```text
El arqueo determina:

Cuadrado

Sobrante

Faltante
```

---

# Seguridad

## Roles

```text
SUPERVISOR

ADMIN

GERENTE
```

---

## Permisos

```text
REP_VER

REP_EXPORTAR

REP_FINANCIERO

REP_OPERATIVO
```

---

# APIs

## Dashboard

```http
GET /api/reportes/dashboard
```

---

## Ventas

```http
GET /api/reportes/ventas
```

---

## Productos

```http
GET /api/reportes/productos
```

---

## Clientes

```http
GET /api/reportes/clientes
```

---

## Delivery

```http
GET /api/reportes/delivery
```

---

## Reservas

```http
GET /api/reportes/reservas
```

---

## Caja

```http
GET /api/reportes/caja
```

---

## Exportar Excel

```http
GET /api/reportes/export/excel
```

---

## Exportar PDF

```http
GET /api/reportes/export/pdf
```

---

# Base de Datos

## Tablas

```text
VENTA

DETALLE_VENTA

PAGO_VENTA

CLIENTE

PEDIDO

PEDIDO_DELIVERY

RESERVA

MOVIMIENTO_CAJA

ARQUEO_CAJA

USUARIO

PRODUCTO

AUDITORIA
```

---

# Auditoría

Registrar:

```text
Consulta de reportes

Exportaciones

Descargas PDF

Descargas Excel

Programación automática
```

---

# Estados de Pantalla

## Loading

```text
Skeleton KPIs.

Skeleton gráficos.
```

---

## Sin Datos

```text
No existe información para el período seleccionado.
```

---

## Error

```text
No fue posible generar el reporte.
```

---

## Sin Conexión

```text
Verifique su conexión.
```

---

# Responsive

## Desktop

```text
Dashboard completo.
```

---

## Tablet

```text
Gráficos apilados.
```

---

## Mobile

```text
KPIs resumidos.

Gráficos verticales.
```

---

# Casos Especiales

## Períodos Grandes

```text
Generación asíncrona de exportaciones.
```

---

## Sin Ventas

```text
Mostrar KPIs en cero.
```

---

## Datos Parciales

```text
Indicar fecha de actualización.
```

---

# Criterios de Aceptación

## Escenario 1

```gherkin
Given un usuario con permiso REP_VER
When ingresa al módulo Reportes
Then visualiza indicadores y reportes disponibles
```

---

## Escenario 2

```gherkin
Given filtros aplicados
When consulta ventas
Then obtiene únicamente la información correspondiente
```

---

## Escenario 3

```gherkin
Given un reporte generado
When exporta a Excel
Then obtiene un archivo con los datos filtrados
```

---

## Escenario 4

```gherkin
Given información histórica
When consulta clientes frecuentes
Then visualiza el ranking por consumo
```

---

## Escenario 5

```gherkin
Given datos de caja
When consulta arqueos
Then visualiza diferencias y estados correctamente
```