# Consulta de DNI y RUC con Factiliza

El formulario de clientes permite consultar un DNI o RUC para completar los datos disponibles. La integración usa el backend para mantener privado el token de Factiliza.

## Configuración

Configura `FACTILIZA_TOKEN` en el entorno del backend. Para producción, agrégalo en las variables de entorno del servicio backend en Render. No lo configures como variable `VITE_*` ni lo publiques en el frontend.

La variable es opcional: si no está configurada, las demás funciones de la API continúan operativas y las consultas responden con `FACTILIZA_NOT_CONFIGURED`.

## Uso y límites

En **Admin → Clientes**, escribe un DNI de 8 dígitos o RUC de 11 dígitos y presiona **Consultar DNI** o **Consultar RUC**. Verifica los datos obtenidos antes de guardar. La consulta no completa el distrito, teléfono ni correo; esos campos deben completarse en el formulario.

Las rutas POST de consulta requieren autenticación y permiso `CLI_CREAR`, y están limitadas a 10 consultas por minuto por cliente HTTP. El número de documento se envía en el cuerpo de la solicitud, no en la URL. Factiliza puede aplicar límites adicionales según el plan de la cuenta.
