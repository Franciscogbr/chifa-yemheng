-- =============================================================
-- Funciones puente para Supabase (backend via supabase-js / HTTPS)
-- Carpeta: openspec/database/add-function-connect-supabase/
-- BD: RESTAURANTEV3 (PostgreSQL) — yemheng.sql
-- Versión: v3 (verificada en PG 17.6, 2026-09-28)
-- -------------------------------------------------------------
-- Motivo: usp_login y usp_permisos_usuario son PROCEDURE
-- (params OUT / refcursor) y supabase-js solo puede invocar
-- FUNCTIONs que devuelven datos. Estas 2 funciones exponen su
-- resultado como JSON para POST /api/v1/auth/login
-- y GET /api/v1/auth/permisos.
-- Diseño v3: SIN CALL directo. En esta instancia el CALL con
-- params OUT dentro de funciones guardadas falla de forma
-- consistente (ERROR 42601, PG 17.6), mientras el mismo CALL en
-- un bloque DO sí funciona. Por eso fn_login replica la lógica
-- exacta de usp_login y fn_permisos_usuario ejecuta el SELECT
-- directo. Verificado: fn_login('fran','fran') → {"ok":true,...}.
-- Regla: ALTER ADITIVO + ESPEJO DOCUMENTADO — no modifica ni
-- elimina ningún objeto existente (usp_login y
-- usp_permisos_usuario intactos). Fuente espejo: yemheng.sql
-- líneas 636-689 (usp_login) y 696-713 (usp_permisos_usuario).
-- Si esos USP cambian, actualizar este archivo a la par.
-- Idempotente: CREATE OR REPLACE + DROPs previos, reejecutable
-- sin duplicar. Nota: fn_login anterior (v1/v2 con CALL) debe
-- eliminarse primero si existe (ver bloque 0).
-- Uso: pegar el archivo completo en Supabase Dashboard → SQL → Run.
-- =============================================================

-- ---------- 0. Limpieza de versiones previas (v1/v2 con CALL) ----------
DROP FUNCTION IF EXISTS public.fn_login(text, text);
DROP FUNCTION IF EXISTS public.fn_login(character varying, character varying);
DROP FUNCTION IF EXISTS public.fn_permisos_usuario(integer);

-- ---------- 1. fn_login ----------
-- Espejo exacto de usp_login → JSON.
-- ok = true solo si login exitoso. Mensajes:
--   'Usuario inexistente, inactivo o bloqueado' (no distingue,
--   igual que el USP) | 'Clave incorrecta' |
--   'Usuario bloqueado tras 3 intentos. Contacte al administrador.'
--   | 'Acceso correcto'.
-- Efectos laterales idénticos al USP: Intentos+1 y Bloqueo='S'
-- al 3er fallo, reset Intentos=0 + F_UltimoAcceso en éxito,
-- inserts en AUDITORIA (LOGIN / LOGIN_FALLIDO).
CREATE OR REPLACE FUNCTION public.fn_login(p_logeo text, p_clave text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
         (pe.nombre || ' ' || COALESCE(pe.ap_paterno, '')) AS nombre,
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
$$;

-- ---------- 2. fn_permisos_usuario ----------
-- Replica el SELECT de usp_permisos_usuario (líneas 700-711)
-- devolviendo arreglo JSON: [{modulo, orden, clave, permiso}].
-- Solo unión de roles vigentes: ROL_PERMISO.Concedido='S',
-- estados 'A' en usuario_rol/rol_permiso/permiso/modulo,
-- ordenado por modulo.orden, permiso.clave (BR-ACC-036).
CREATE OR REPLACE FUNCTION public.fn_permisos_usuario(p_id_usuario integer)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
  FROM (
    SELECT DISTINCT m.n_modulo AS modulo, m.orden AS orden,
           pe.clave AS clave, pe.n_permiso AS permiso
    FROM usuario_rol ur
      INNER JOIN rol_permiso rp ON rp.id_rol = ur.id_rol
        AND rp.concedido = 'S' AND rp.estado = 'A'
      INNER JOIN permiso pe ON pe.id_permiso = rp.id_permiso AND pe.estado = 'A'
      INNER JOIN modulo m ON m.id_modulo = pe.id_modulo AND m.estado = 'A'
    WHERE ur.id_usuario = p_id_usuario AND ur.vigente = 'S' AND ur.estado = 'A'
    ORDER BY m.orden, pe.clave
  ) t;
$$;

-- ---------- 3. VERIFICACION ----------
-- SELECT fn_login('fran', 'fran');
-- Esperado: {"ok": true, "id_usuario": 14, "logeo": "fran",
--            "tipo_usuario": "ADMINISTRADOR", ... "mensaje": "Acceso correcto"}
-- SELECT fn_login('fran', 'mal');
-- Esperado: {"ok": false, ... "mensaje": "Clave incorrecta"}
-- SELECT fn_permisos_usuario(14);
-- Esperado: [{"modulo": "...", "orden": N, "clave": "...", "permiso": "..."}, ...]
-- SELECT oid::regprocedure FROM pg_proc WHERE proname IN ('fn_login', 'fn_permisos_usuario');
-- Esperado: exactamente 2 filas (sin sobrecargas fantasma).
