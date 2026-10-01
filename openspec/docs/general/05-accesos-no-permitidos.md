# Accesos No Permitidos

Usuario sin JWT:
→ Redirigir a /auth/login

JWT inválido:
→ Logout automático

Rol incorrecto:
→ Página 403

Permiso insuficiente:
→ Página 403

Ruta no encontrada:
→ Página 404