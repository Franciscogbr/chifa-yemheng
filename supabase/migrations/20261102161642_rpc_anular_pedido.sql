CREATE OR REPLACE FUNCTION public.fn_anular_pedido_rpc(
  p_pedido integer,
  p_usuario integer,
  p_motivo character varying
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public, pg_temp
AS $$
BEGIN
  CALL public.usp_anular_pedido(p_pedido, p_usuario, p_motivo);
END;
$$;

REVOKE ALL ON FUNCTION public.fn_anular_pedido_rpc(integer, integer, character varying)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_anular_pedido_rpc(integer, integer, character varying)
  TO service_role;

NOTIFY pgrst, 'reload schema';