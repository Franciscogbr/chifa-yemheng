-- login-primer-nombre · 01 — fn_login devuelve solo el primer nombre en `empleado`
-- Antes: nombre || ' ' || ap_paterno ("Fran Admin"). Ahora: solo nombre ("Fran").
-- El navbar muestra un solo nombre; apellidos siguen en personal/fichas.

CREATE OR REPLACE FUNCTION public.fn_login(p_logeo text, p_clave text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_id   integer;
  v_hash varchar(200);
  v_bloq char(1);
  r record;
BEGIN
  SELECT u.id_usuario, u.clave INTO v_id, v_hash
  FROM usuario u
  WHERE u.logeo = p_logeo AND u.estado = 'A' AND u.bloqueado = 'N';

  IF v_id IS NULL THEN
    INSERT INTO auditoria(id_usuario, n_tabla, accion, valor_nuevo)
    VALUES (NULL, 'USUARIO', 'LOGIN_FALLIDO', 'Logeo: ' || p_logeo);
    RETURN json_build_object('ok', false, 'id_usuario', 0, 'logeo', NULL,
      'tipo_usuario', NULL, 'empleado', NULL, 'cargo', NULL,
      'mensaje', 'Usuario inexistente, inactivo o bloqueado');
  END IF;

  IF v_hash IS DISTINCT FROM encode(digest(p_clave, 'sha256'), 'hex') THEN
    UPDATE usuario SET
      intentos  = intentos + 1,
      bloqueado = CASE WHEN intentos + 1 >= 3 THEN 'S' ELSE 'N' END,
      usumod = current_user, pcmod = NULL, fecmod = CURRENT_TIMESTAMP
    WHERE id_usuario = v_id;

    INSERT INTO auditoria(id_usuario, n_tabla, accion, id_registro, valor_nuevo)
    VALUES (v_id, 'USUARIO', 'LOGIN_FALLIDO', v_id, 'Clave incorrecta');

    SELECT u.bloqueado INTO v_bloq FROM usuario u WHERE u.id_usuario = v_id;
    RETURN json_build_object('ok', false, 'id_usuario', 0, 'logeo', NULL,
      'tipo_usuario', NULL, 'empleado', NULL, 'cargo', NULL,
      'mensaje', CASE WHEN v_bloq = 'S'
        THEN 'Usuario bloqueado tras 3 intentos. Contacte al administrador.'
        ELSE 'Clave incorrecta' END);
  END IF;

  UPDATE usuario SET intentos = 0, f_ultimoacceso = CURRENT_TIMESTAMP
  WHERE id_usuario = v_id;

  INSERT INTO auditoria(id_usuario, n_tabla, accion, id_registro, valor_nuevo)
  VALUES (v_id, 'USUARIO', 'LOGIN', v_id, 'Acceso correcto');

  SELECT v_id AS v_id, u.logeo AS logeo, tu.n_tipousuario AS n_tipousuario,
         NULLIF(TRIM(pe.nombre), '') AS nombre,
         ca.n_cargo AS n_cargo
    INTO r
  FROM usuario u
    INNER JOIN tipo_usuario tu ON tu.id_tipousuario = u.id_tipousuario
    INNER JOIN empleado e      ON e.id_empleado     = u.id_empleado
    INNER JOIN persona pe      ON pe.id_persona      = e.id_persona
    INNER JOIN cargo ca        ON ca.id_cargo        = e.id_cargo
  WHERE u.id_usuario = v_id;

  RETURN json_build_object('ok', true, 'id_usuario', r.v_id, 'logeo', r.logeo,
    'tipo_usuario', r.n_tipousuario, 'empleado', r.nombre, 'cargo', r.n_cargo,
    'mensaje', 'Acceso correcto');
END;
$function$;
