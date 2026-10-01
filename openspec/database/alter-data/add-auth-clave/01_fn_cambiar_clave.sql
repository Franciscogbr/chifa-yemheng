-- =============================================================
-- add-auth-clave · 01 — fn_cambiar_clave (rotación desde perfil)
-- Espejo de fn_login (sha256 + intentos/bloqueo BR-ACC-035).
-- No modifica USPs ni fn_login/fn_permisos_usuario.
-- Requiere pgcrypto (ya usado por fn_login).
-- Uso: pegar en Supabase Dashboard → SQL → Run.
-- =============================================================

CREATE OR REPLACE FUNCTION public.fn_cambiar_clave(p_id_usuario integer, p_actual text, p_nueva text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_hash varchar(200);
  v_bloq char(1);
  v_est  char(1);
BEGIN
  SELECT u.clave, u.bloqueado, u.estado INTO v_hash, v_bloq, v_est
  FROM usuario u WHERE u.id_usuario = p_id_usuario;

  IF v_hash IS NULL OR v_est <> 'A' OR v_bloq = 'S' THEN
    RETURN json_build_object('ok', false, 'mensaje', 'Usuario inactivo o bloqueado');
  END IF;

  IF v_hash IS DISTINCT FROM encode(digest(p_actual, 'sha256'), 'hex') THEN
    UPDATE usuario SET
      intentos  = intentos + 1,
      bloqueado = CASE WHEN intentos + 1 >= 3 THEN 'S' ELSE 'N' END,
      usumod = current_user, pcmod = NULL, fecmod = CURRENT_TIMESTAMP
    WHERE id_usuario = p_id_usuario;

    INSERT INTO auditoria(id_usuario, n_tabla, accion, id_registro, valor_nuevo)
    VALUES (p_id_usuario, 'USUARIO', 'CLAVE_FALLIDA', p_id_usuario, 'Actual incorrecta');

    RETURN json_build_object('ok', false, 'mensaje', 'Contraseña actual incorrecta');
  END IF;

  UPDATE usuario SET
    clave = encode(digest(p_nueva, 'sha256'), 'hex'),
    intentos = 0,
    usumod = current_user, pcmod = NULL, fecmod = CURRENT_TIMESTAMP
  WHERE id_usuario = p_id_usuario;

  INSERT INTO auditoria(id_usuario, n_tabla, accion, id_registro, valor_nuevo)
  VALUES (p_id_usuario, 'USUARIO', 'CAMBIO_CLAVE', p_id_usuario, 'Cambio desde perfil');

  RETURN json_build_object('ok', true, 'mensaje', 'Clave actualizada');
END;
$$;

-- Verificación:
-- SELECT fn_cambiar_clave(14, 'fran', 'nueva1234');
-- Esperado ok:true (luego revertir con la anterior).
-- SELECT fn_cambiar_clave(14, 'mala', 'nueva1234');
-- Esperado ok:false 'Contraseña actual incorrecta'.
-- SELECT oid::regprocedure FROM pg_proc WHERE proname = 'fn_cambiar_clave';
