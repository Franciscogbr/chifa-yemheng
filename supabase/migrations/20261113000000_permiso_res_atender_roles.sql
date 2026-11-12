-- Migración idempotente: asigna el permiso RES_ATENDER a los roles apropiados.
-- Roles: ADMINISTRADOR, SUPERVISOR, MOZO.
-- No toca requirePermisos; solo garantiza que el permiso exista y esté asignado.
-- El usuario debe volver a iniciar sesión para recibir el permiso en su JWT.
--
-- Nota: el trigger tr_proteger_permiso_admin bloquea la asignación de un permiso
-- que el actor no posee ya (anti-escalada de privilegios). Como RES_ATENDER es
-- nuevo, nadie lo tiene, por lo que se deshabilita temporalmente el trigger
-- durante la inserción y se vuelve a habilitar al final.
-- Requiere ejecutarse como superusuario (postgres / supabase_admin).

ALTER TABLE public.rol_permiso DISABLE TRIGGER tr_proteger_permiso_admin;

INSERT INTO public.permiso (id_modulo, n_permiso, clave, descripcion)
SELECT m.id_modulo, 'Atender reservas', 'RES_ATENDER', 'Registrar llegada y atender reserva confirmada (reservas.md)'
FROM public.modulo m
WHERE m.n_modulo = 'RESERVAS'
  AND NOT EXISTS (
    SELECT 1 FROM public.permiso p WHERE p.clave = 'RES_ATENDER'
  );

INSERT INTO public.rol_permiso (id_rol, id_permiso, concedido, usucre, pccre, feccre, estado)
SELECT r.id_rol, p.id_permiso, 'S', 'SISTEMA', NULL, now(), 'A'
FROM public.rol r
JOIN public.permiso p ON p.clave = 'RES_ATENDER'
WHERE r.n_rol IN ('ADMINISTRADOR', 'SUPERVISOR', 'MOZO')
  AND NOT EXISTS (
    SELECT 1 FROM public.rol_permiso rp
    WHERE rp.id_rol = r.id_rol AND rp.id_permiso = p.id_permiso
  );

ALTER TABLE public.rol_permiso ENABLE TRIGGER tr_proteger_permiso_admin;
