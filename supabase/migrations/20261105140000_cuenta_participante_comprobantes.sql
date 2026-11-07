-- T11 (S3): cuentas individuales por participante y camposElectronicos de boleta/factura.
-- Aditiva: solo CREATE TABLE/INDEX/COMMENT, ADD COLUMN IF NOT EXISTS y funciones nuevas.
-- No ejecuta DROP, DELETE, TRUNCATE, GRANT ni REVOKE.

-- ==========================================================================
-- 1) cuenta_participante: una cuenta ABIERTA por participante en la mesa;
--    al pagarla se cierra y, si el participante vuelve a pedir, se abre otra.
-- ==========================================================================
CREATE TABLE IF NOT EXISTS public.cuenta_participante (
  id bigserial PRIMARY KEY,
  id_pedido integer NOT NULL REFERENCES public.pedido(id_pedido) ON DELETE CASCADE,
  id_cliente integer NOT NULL REFERENCES public.cliente(id_cliente),
  estado_cuenta character varying(10) NOT NULL DEFAULT 'ABIERTA',
  monto_pagado numeric(12,2) NOT NULL DEFAULT 0 CHECK (monto_pagado >= 0),
  serie_comprobante character varying(10),
  numero_comprobante character varying(15),
  feccre timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  feccie timestamp without time zone
);

-- S3: solo puede existir una cuenta ABIERTA por (pedido, participante);
-- al cerrarse puede abrirse otra si vuelve a pedir antes del cierre de mesa.
CREATE UNIQUE INDEX IF NOT EXISTS ux_cuenta_participante_abierta
  ON public.cuenta_participante (id_pedido, id_cliente)
  WHERE estado_cuenta = 'ABIERTA';

CREATE INDEX IF NOT EXISTS ix_cuenta_participante_pedido
  ON public.cuenta_participante (id_pedido, id_cliente);

COMMENT ON TABLE public.cuenta_participante IS
  'S3: cuenta individual de un participante de comanda compartida (POR_CONSUMO). Se abre al registrar su primer pedido propio y se cierra cuando Caja cobra su total. Si el participante vuelve a pedir tras pagar y la mesa sigue abierta, se crea una cuenta nueva; su historial queda en las cuentas cerradas.';

COMMENT ON COLUMN public.cuenta_participante.monto_pagado IS
  'S3: total confirmado por Caja al cerrar la cuenta (snapshot, validado contra pago_venta.id_cliente_pagador). Permite auditar sin recalcular.';

-- RL-S: solo el backend (service_role) toca las cuentas de participantes;
-- anon/authenticated no tienen acceso directo (idem pedido_participante).
ALTER TABLE public.cuenta_participante ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.cuenta_participante FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.cuenta_participante TO service_role;

-- ==========================================================================
-- 2) cierre total de la mesa
-- ==========================================================================
ALTER TABLE public.pedido
  ADD COLUMN IF NOT EXISTS mesa_liquidada boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.pedido.mesa_liquidada IS
  'S3: true cuando se consolida el comprobante final de la mesa (todos los participantes han pagado su cuenta completa). Disparado por el cobro del ultimo participante; permanece en true para auditoria.';

-- ==========================================================================
-- 3) camposElectronicos de boleta/factura existentes (placeholder SUNAT)
-- ==========================================================================
ALTER TABLE public.boleta
  ADD COLUMN IF NOT EXISTS hash_cpe character varying(64);

ALTER TABLE public.boleta
  ADD COLUMN IF NOT EXISTS estado_sunat character varying(20) NOT NULL DEFAULT 'PENDIENTE';

ALTER TABLE public.factura
  ADD COLUMN IF NOT EXISTS hash_cpe character varying(64);

ALTER TABLE public.factura
  ADD COLUMN IF NOT EXISTS estado_sunat character varying(20) NOT NULL DEFAULT 'PENDIENTE';

COMMENT ON COLUMN public.boleta.estado_sunat IS
  'S3 fase 1: PENDIENTE hasta integrar facturador electronico real; quedara ACEPTADO u error al integrar el proveedor.';

COMMENT ON COLUMN public.factura.estado_sunat IS
  'S3 fase 1: PENDIENTE hasta integrar facturador electronico real; quedara ACEPTADO u error al integrar el proveedor.';

COMMENT ON COLUMN public.boleta.hash_cpe IS
  'S3 fase 1: placeholder de hash del CPE; placeholder hasta integrar el facturador electronico.';

COMMENT ON COLUMN public.factura.hash_cpe IS
  'S3 fase 1: placeholder de hash del CPE; placeholder hasta integrar el facturador electronico.';

-- ==========================================================================
-- 4) fn_saldo_participante: estado de la cuenta individual, fuente unica
--    para Caja, la app del cliente y la boleta.
-- ==========================================================================
CREATE OR REPLACE FUNCTION public.fn_saldo_participante(
  p_pedido integer,
  p_cliente integer
)
RETURNS TABLE (
  id_cuenta bigint,
  estado_cuenta character varying,
  consumo_abierto numeric,
  monto_pagado numeric,
  platos jsonb
)
LANGUAGE sql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
  WITH activos AS (
    SELECT
      cp.id AS id_cuenta,
      cp.estado_cuenta,
      COALESCE(SUM(CASE WHEN dp.estado = 'A' AND dp.estado_preparacion <> 'A'
                        THEN dp.sub_total END), 0) AS consumo_abierto,
      COALESCE(MAX(cp.monto_pagado), 0) AS monto_pagado,
      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'id', dp.id_detallepedido,
            'producto', COALESCE(pr.n_producto, ''),
            'cantidad', dp.cantidad,
            'precioUnitario', dp.precio_unitario,
            'subTotal', dp.sub_total,
            'estadoPreparacion', dp.estado_preparacion
          )
          ORDER BY dp.id_detallepedido
        ) FILTER (WHERE dp.id_detallepedido IS NOT NULL),
        '[]'::jsonb
      ) AS platos
    FROM public.cuenta_participante AS cp
    LEFT JOIN public.detalle_pedido AS dp
      ON dp.id_pedido = cp.id_pedido
     AND dp.id_cliente = cp.id_cliente
     AND cp.estado_cuenta = 'ABIERTA'
    LEFT JOIN public.producto AS pr
      ON pr.id_producto = dp.id_producto
    WHERE cp.id_pedido = p_pedido
      AND cp.id_cliente = p_cliente
    GROUP BY cp.id, cp.estado_cuenta
  )
  SELECT
    a.id_cuenta,
    a.estado_cuenta,
    CASE WHEN a.estado_cuenta = 'ABIERTA' THEN a.consumo_abierto ELSE 0 END,
    a.monto_pagado,
    a.platos
  FROM activos a;
$$;
