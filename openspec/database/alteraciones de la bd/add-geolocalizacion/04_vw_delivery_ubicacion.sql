-- add-geolocalizacion · 04 — Vista mapa delivery
-- Para 5.2 seguimientoEntregas y 7.5 seguimiento cliente (mapa lectura, polling 30s).
-- No expone datos personales: solo coords + situacion + tiempos.

CREATE OR REPLACE VIEW public.vw_delivery_ubicacion AS
SELECT
  pd.id_pedidodelivery,
  pd.id_pedido,
  pd.id_distrito,
  d.d_distrito AS distrito,
  pd.direccion_entrega,
  pd.costo_envio,
  pd.situacion,
  pd.f_salida,
  pd.f_entrega,
  pd.lat_cliente,
  pd.lng_cliente,
  pd.lat_repartidor,
  pd.lng_repartidor,
  pd.f_ubicacion,
  pd.id_empleado AS id_repartidor
FROM public.pedido_delivery pd
LEFT JOIN public.distrito d ON d.id_distrito = pd.id_distrito
WHERE pd.estado = 'A';

COMMENT ON VIEW public.vw_delivery_ubicacion
  IS 'Mapa delivery (BR-GPS-001/002). Fuente para 5.2 y 7.5. Sin PII.';
