CREATE OR REPLACE FUNCTION public.fn_sincronizar_rol_tipo_usuario()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_actor_logeo character varying;
  v_rol_anterior integer;
  v_rol_nuevo integer;
  v_asignacion integer;
BEGIN
  v_actor_logeo := CASE
    WHEN TG_OP = 'INSERT' THEN NEW.usucre
    ELSE COALESCE(NULLIF(NEW.usumod, ''), NEW.usucre)
  END;

  SELECT r.id_rol
  INTO v_rol_nuevo
  FROM public.tipo_usuario AS tu
  JOIN public.rol AS r
    ON upper(btrim(r.n_rol)) = upper(btrim(tu.n_tipousuario))
   AND r.estado = 'A'
  WHERE tu.id_tipousuario = NEW.id_tipousuario
    AND tu.estado = 'A'
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING MESSAGE = 'ROL_TIPO_NO_ENCONTRADO';
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.id_tipousuario IS DISTINCT FROM NEW.id_tipousuario THEN
    SELECT r.id_rol
    INTO v_rol_anterior
    FROM public.tipo_usuario AS tu
    JOIN public.rol AS r
      ON upper(btrim(r.n_rol)) = upper(btrim(tu.n_tipousuario))
    WHERE tu.id_tipousuario = OLD.id_tipousuario
    LIMIT 1;

    IF v_rol_anterior IS NOT NULL AND v_rol_anterior <> v_rol_nuevo THEN
      UPDATE public.usuario_rol
      SET vigente = 'N',
          estado = 'I',
          usumod = v_actor_logeo,
          pcmod = NEW.pcmod,
          fecmod = now()
      WHERE id_usuario = NEW.id_usuario
        AND id_rol = v_rol_anterior
        AND estado = 'A'
        AND vigente = 'S';
    END IF;
  END IF;

  SELECT ur.id_usuariorol
  INTO v_asignacion
  FROM public.usuario_rol AS ur
  WHERE ur.id_usuario = NEW.id_usuario
    AND ur.id_rol = v_rol_nuevo
  FOR UPDATE;

  IF FOUND THEN
    UPDATE public.usuario_rol
    SET vigente = 'S',
        estado = 'A',
        f_asignacion = now(),
        usumod = v_actor_logeo,
        pcmod = NEW.pcmod,
        fecmod = now()
    WHERE id_usuariorol = v_asignacion
      AND (vigente <> 'S' OR estado <> 'A');
  ELSE
    INSERT INTO public.usuario_rol (
      id_usuario,
      id_rol,
      f_asignacion,
      vigente,
      usucre,
      pccre,
      feccre,
      estado
    )
    VALUES (
      NEW.id_usuario,
      v_rol_nuevo,
      now(),
      'S',
      v_actor_logeo,
      NEW.pcmod,
      now(),
      'A'
    );
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_sincronizar_rol_tipo_usuario()
  FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS tr_sincronizar_rol_tipo_usuario ON public.usuario;
CREATE TRIGGER tr_sincronizar_rol_tipo_usuario
AFTER INSERT OR UPDATE OF id_tipousuario ON public.usuario
FOR EACH ROW
EXECUTE FUNCTION public.fn_sincronizar_rol_tipo_usuario();

INSERT INTO public.usuario_rol (
  id_usuario,
  id_rol,
  f_asignacion,
  vigente,
  usucre,
  pccre,
  feccre,
  estado
)
SELECT
  u.id_usuario,
  r.id_rol,
  now(),
  'S',
  'MIGRACION',
  NULL,
  now(),
  'A'
FROM public.usuario AS u
JOIN public.tipo_usuario AS tu
  ON tu.id_tipousuario = u.id_tipousuario
 AND tu.estado = 'A'
JOIN public.rol AS r
  ON upper(btrim(r.n_rol)) = upper(btrim(tu.n_tipousuario))
 AND r.estado = 'A'
ON CONFLICT (id_usuario, id_rol) DO UPDATE
SET vigente = 'S',
    estado = 'A',
    f_asignacion = now(),
    usumod = 'MIGRACION',
    pcmod = NULL,
    fecmod = now()
WHERE public.usuario_rol.vigente <> 'S'
   OR public.usuario_rol.estado <> 'A';

NOTIFY pgrst, 'reload schema';