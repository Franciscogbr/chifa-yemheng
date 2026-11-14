DO $$
DECLARE
  v_mozo_tipo integer;
  v_mozo_tipos integer;
  v_mozo_roles integer;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.tipo_usuario
    WHERE estado = 'A'
      AND upper(btrim(n_tipousuario)) = 'ALMACEN'
  ) THEN
    RETURN;
  END IF;

  SELECT count(*)
  INTO v_mozo_tipos
  FROM public.tipo_usuario
  WHERE estado = 'A'
    AND upper(btrim(n_tipousuario)) = 'MOZO';

  SELECT count(*)
  INTO v_mozo_roles
  FROM public.rol
  WHERE estado = 'A'
    AND upper(btrim(n_rol)) = 'MOZO';

  IF v_mozo_tipos <> 1 OR v_mozo_roles <> 1 THEN
    RAISE EXCEPTION USING
      MESSAGE = 'TIPO_MOZO_DESTINO_INVALIDO',
      DETAIL = 'Se requiere exactamente un tipo MOZO y un rol MOZO activos.';
  END IF;

  SELECT id_tipousuario
  INTO v_mozo_tipo
  FROM public.tipo_usuario
  WHERE estado = 'A'
    AND upper(btrim(n_tipousuario)) = 'MOZO';

  UPDATE public.usuario AS u
  SET id_tipousuario = v_mozo_tipo,
      usumod = 'MIGRACION',
      pcmod = NULL,
      fecmod = now(),
      motivo_ultimo_cambio = 'Tipo ALMACEN retirado; reasignado a MOZO'
  FROM public.tipo_usuario AS tu
  WHERE tu.id_tipousuario = u.id_tipousuario
    AND tu.estado = 'A'
    AND upper(btrim(tu.n_tipousuario)) = 'ALMACEN';

  UPDATE public.tipo_usuario
  SET estado = 'I',
      usumod = 'MIGRACION',
      pcmod = NULL,
      fecmod = now()
  WHERE estado = 'A'
    AND upper(btrim(n_tipousuario)) = 'ALMACEN';
END;
$$;

DO $$
DECLARE
  v_tipos_invalidos text;
BEGIN
  SELECT string_agg(tu.n_tipousuario, ', ' ORDER BY tu.n_tipousuario)
  INTO v_tipos_invalidos
  FROM public.tipo_usuario AS tu
  WHERE tu.estado = 'A'
    AND (
      SELECT count(*)
      FROM public.rol AS r
      WHERE r.estado = 'A'
        AND upper(btrim(r.n_rol)) = CASE
          WHEN upper(btrim(tu.n_tipousuario)) = 'DELIVERY' THEN 'REPARTIDOR'
          ELSE upper(btrim(tu.n_tipousuario))
        END
    ) <> 1;

  IF v_tipos_invalidos IS NOT NULL THEN
    RAISE EXCEPTION USING
      MESSAGE = 'TIPO_ROL_MAPEO_INVALIDO',
      DETAIL = v_tipos_invalidos;
  END IF;
END;
$$;

ALTER TABLE public.tipo_usuario
  ADD COLUMN id_rol integer;

UPDATE public.tipo_usuario AS tu
SET id_rol = r.id_rol
FROM public.rol AS r
WHERE tu.estado = 'A'
  AND r.estado = 'A'
  AND upper(btrim(r.n_rol)) = CASE
    WHEN upper(btrim(tu.n_tipousuario)) = 'DELIVERY' THEN 'REPARTIDOR'
    ELSE upper(btrim(tu.n_tipousuario))
  END;

ALTER TABLE public.tipo_usuario
  ADD CONSTRAINT fk_tipo_usuario_rol
  FOREIGN KEY (id_rol) REFERENCES public.rol (id_rol);

ALTER TABLE public.tipo_usuario
  ADD CONSTRAINT ck_tipo_usuario_rol_activo
  CHECK (estado <> 'A' OR id_rol IS NOT NULL);

CREATE INDEX ix_tipo_usuario_id_rol
  ON public.tipo_usuario (id_rol);

ALTER TABLE public.usuario_rol
  ADD COLUMN asignacion_tipo_usuario boolean NOT NULL DEFAULT false;

UPDATE public.usuario_rol AS ur
SET asignacion_tipo_usuario = true
FROM public.usuario AS u
JOIN public.tipo_usuario AS tu
  ON tu.id_tipousuario = u.id_tipousuario
WHERE ur.id_usuario = u.id_usuario
  AND ur.id_rol = tu.id_rol;

CREATE OR REPLACE FUNCTION public.fn_lock_tipo_usuario_rol_mapping()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(724310, 2);
  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_lock_tipo_usuario_rol_mapping()
  FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS tr_lock_tipo_usuario_rol_mapping ON public.tipo_usuario;
CREATE TRIGGER tr_lock_tipo_usuario_rol_mapping
BEFORE INSERT OR UPDATE OF id_rol, estado ON public.tipo_usuario
FOR EACH STATEMENT
EXECUTE FUNCTION public.fn_lock_tipo_usuario_rol_mapping();

DROP TRIGGER IF EXISTS tr_lock_rol_tipo_usuario_mapping ON public.rol;
CREATE TRIGGER tr_lock_rol_tipo_usuario_mapping
BEFORE UPDATE OF estado ON public.rol
FOR EACH STATEMENT
EXECUTE FUNCTION public.fn_lock_tipo_usuario_rol_mapping();

CREATE OR REPLACE FUNCTION public.fn_validar_tipo_usuario_rol()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(724310, 2);

  IF NEW.estado = 'A'
     AND NOT EXISTS (
       SELECT 1
       FROM public.rol AS r
       WHERE r.id_rol = NEW.id_rol
         AND r.estado = 'A'
     ) THEN
    RAISE EXCEPTION USING MESSAGE = 'TIPO_ROL_MAPEO_INVALIDO';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_validar_tipo_usuario_rol()
  FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS tr_validar_tipo_usuario_rol ON public.tipo_usuario;
CREATE TRIGGER tr_validar_tipo_usuario_rol
BEFORE INSERT OR UPDATE OF id_rol, estado ON public.tipo_usuario
FOR EACH ROW
EXECUTE FUNCTION public.fn_validar_tipo_usuario_rol();

CREATE OR REPLACE FUNCTION public.fn_proteger_rol_tipo_usuario()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(724310, 2);

  IF OLD.estado = 'A'
     AND NEW.estado <> 'A'
     AND EXISTS (
       SELECT 1
       FROM public.tipo_usuario AS tu
       WHERE tu.id_rol = OLD.id_rol
         AND tu.estado = 'A'
     ) THEN
    RAISE EXCEPTION USING MESSAGE = 'ROL_TIPO_EN_USO';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_proteger_rol_tipo_usuario()
  FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS tr_proteger_rol_tipo_usuario ON public.rol;
CREATE TRIGGER tr_proteger_rol_tipo_usuario
BEFORE UPDATE OF estado ON public.rol
FOR EACH ROW
EXECUTE FUNCTION public.fn_proteger_rol_tipo_usuario();

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
  v_estado character;
  v_vigente character;
  v_sync_previo text;
BEGIN
  v_actor_logeo := CASE
    WHEN TG_OP = 'INSERT' THEN NEW.usucre
    ELSE COALESCE(NULLIF(NEW.usumod, ''), NEW.usucre)
  END;

  SELECT tu.id_rol
  INTO v_rol_nuevo
  FROM public.tipo_usuario AS tu
  JOIN public.rol AS r
    ON r.id_rol = tu.id_rol
   AND r.estado = 'A'
  WHERE tu.id_tipousuario = NEW.id_tipousuario
    AND tu.estado = 'A';

  IF NOT FOUND THEN
    RAISE EXCEPTION USING MESSAGE = 'ROL_TIPO_NO_ENCONTRADO';
  END IF;

  v_sync_previo := current_setting('app.sync_usuario_rol_tipo', true);
  PERFORM set_config('app.sync_usuario_rol_tipo', 'on', true);

  IF TG_OP = 'UPDATE' AND OLD.id_tipousuario IS DISTINCT FROM NEW.id_tipousuario THEN
    SELECT tu.id_rol
    INTO v_rol_anterior
    FROM public.tipo_usuario AS tu
    WHERE tu.id_tipousuario = OLD.id_tipousuario;

    IF v_rol_anterior IS NOT NULL AND v_rol_anterior <> v_rol_nuevo THEN
      UPDATE public.usuario_rol
      SET vigente = 'N',
          estado = 'I',
          usumod = v_actor_logeo,
          pcmod = COALESCE(NEW.pcmod, NEW.pccre),
          fecmod = now()
      WHERE id_usuario = NEW.id_usuario
        AND id_rol = v_rol_anterior
        AND asignacion_tipo_usuario
        AND estado = 'A'
        AND vigente = 'S';
    END IF;
  END IF;

  SELECT ur.id_usuariorol, ur.estado, ur.vigente
  INTO v_asignacion, v_estado, v_vigente
  FROM public.usuario_rol AS ur
  WHERE ur.id_usuario = NEW.id_usuario
    AND ur.id_rol = v_rol_nuevo
  FOR UPDATE;

  IF FOUND THEN
    IF v_estado <> 'A' OR v_vigente <> 'S' THEN
      UPDATE public.usuario_rol
      SET vigente = 'S',
          estado = 'A',
          asignacion_tipo_usuario = true,
          f_asignacion = now(),
          usumod = v_actor_logeo,
          pcmod = COALESCE(NEW.pcmod, NEW.pccre),
          fecmod = now()
      WHERE id_usuariorol = v_asignacion;
    END IF;
  ELSE
    INSERT INTO public.usuario_rol (
      id_usuario,
      id_rol,
      f_asignacion,
      vigente,
      asignacion_tipo_usuario,
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
      true,
      v_actor_logeo,
      COALESCE(NEW.pcmod, NEW.pccre),
      now(),
      'A'
    );
  END IF;

  PERFORM set_config('app.sync_usuario_rol_tipo', COALESCE(v_sync_previo, ''), true);
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

CREATE OR REPLACE FUNCTION public.fn_proteger_asignacion_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_role_name text;
  v_quita_asignacion boolean;
  v_actor_logeo text;
  v_actor_id integer;
  v_rol_anterior text;
  v_asigna_admin boolean;
  v_sync_tipo_usuario boolean;
BEGIN
  IF TG_OP = 'DELETE' THEN
    SELECT r.n_rol INTO v_role_name
    FROM public.rol AS r WHERE r.id_rol = OLD.id_rol;
    v_actor_logeo := COALESCE(
      NULLIF(current_setting('app.audit_actor_logeo', true), ''),
      NULLIF(OLD.usumod, ''),
      NULLIF(OLD.usucre, '')
    );
  ELSE
    SELECT r.n_rol INTO v_role_name
    FROM public.rol AS r WHERE r.id_rol = NEW.id_rol;
    v_actor_logeo := COALESCE(
      NULLIF(current_setting('app.audit_actor_logeo', true), ''),
      NULLIF(NEW.usumod, ''),
      NULLIF(NEW.usucre, '')
    );
  END IF;

  v_sync_tipo_usuario := TG_OP <> 'DELETE'
    AND COALESCE(NEW.asignacion_tipo_usuario, false)
    AND pg_trigger_depth() > 1
    AND current_setting('app.sync_usuario_rol_tipo', true) = 'on';

  SELECT u.id_usuario INTO v_actor_id
  FROM public.usuario AS u
  WHERE u.logeo = v_actor_logeo
    AND u.estado = 'A'
    AND u.bloqueado = 'N'
  LIMIT 1;

  IF current_user NOT IN ('postgres', 'supabase_admin')
     AND NOT (
       (
         v_sync_tipo_usuario
         AND public.fn_usuario_tiene_permiso_seguridad(v_actor_id, 'SEG_USUARIO')
       )
       OR public.fn_usuario_tiene_permiso_seguridad(v_actor_id, 'SEG_ROL')
     ) THEN
    RAISE EXCEPTION USING MESSAGE = 'FORBIDDEN';
  END IF;

  IF v_sync_tipo_usuario THEN
    IF TG_OP = 'UPDATE'
       AND NEW.estado = 'I'
       AND NEW.vigente = 'N'
       AND NEW.id_usuario = OLD.id_usuario
       AND NEW.id_rol = OLD.id_rol THEN
      IF NOT EXISTS (
        SELECT 1
        FROM public.usuario AS u
        JOIN public.tipo_usuario AS tu
          ON tu.id_tipousuario = u.id_tipousuario
         AND tu.estado = 'A'
        WHERE u.id_usuario = NEW.id_usuario
          AND tu.id_rol <> NEW.id_rol
      ) THEN
        RAISE EXCEPTION USING MESSAGE = 'FORBIDDEN';
      END IF;
    ELSIF NEW.estado = 'A' AND NEW.vigente = 'S' THEN
      IF NOT EXISTS (
        SELECT 1
        FROM public.usuario AS u
        JOIN public.tipo_usuario AS tu
          ON tu.id_tipousuario = u.id_tipousuario
         AND tu.estado = 'A'
        WHERE u.id_usuario = NEW.id_usuario
          AND tu.id_rol = NEW.id_rol
      ) THEN
        RAISE EXCEPTION USING MESSAGE = 'FORBIDDEN';
      END IF;
    ELSE
      RAISE EXCEPTION USING MESSAGE = 'FORBIDDEN';
    END IF;
  END IF;

  IF TG_OP <> 'INSERT' THEN
    SELECT r.n_rol INTO v_rol_anterior
    FROM public.rol AS r
    WHERE r.id_rol = OLD.id_rol;
  END IF;

  IF TG_OP = 'DELETE' THEN
    v_asigna_admin := false;
  ELSE
    v_asigna_admin := v_role_name = 'ADMINISTRADOR'
      AND NEW.estado = 'A'
      AND NEW.vigente = 'S';
  END IF;

  IF v_asigna_admin THEN
    PERFORM pg_advisory_xact_lock(724310, 1);
    IF current_user NOT IN ('postgres', 'supabase_admin')
       AND NOT public.fn_usuario_es_administrador_activo(v_actor_id) THEN
      RAISE EXCEPTION USING MESSAGE = 'FORBIDDEN';
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    v_quita_asignacion := true;
  ELSIF TG_OP = 'UPDATE' THEN
    v_quita_asignacion := NEW.id_usuario IS DISTINCT FROM OLD.id_usuario
      OR NEW.id_rol IS DISTINCT FROM OLD.id_rol
      OR NEW.estado <> 'A'
      OR NEW.vigente <> 'S';
  ELSE
    v_quita_asignacion := false;
  END IF;

  IF TG_OP <> 'INSERT' THEN
    IF v_rol_anterior = 'ADMINISTRADOR' AND v_quita_asignacion THEN
      PERFORM pg_advisory_xact_lock(724310, 1);
      IF current_user NOT IN ('postgres', 'supabase_admin')
         AND NOT public.fn_usuario_es_administrador_activo(v_actor_id) THEN
        RAISE EXCEPTION USING MESSAGE = 'FORBIDDEN';
      END IF;
      IF OLD.estado = 'A'
         AND OLD.vigente = 'S'
         AND public.fn_usuario_es_administrador_activo(OLD.id_usuario) THEN
        IF NOT public.fn_hay_administrador_activo(OLD.id_usuario, NULL, NULL, NULL) THEN
          RAISE EXCEPTION USING MESSAGE = 'ULTIMO_ADMINISTRADOR';
        END IF;
      END IF;
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

NOTIFY pgrst, 'reload schema';