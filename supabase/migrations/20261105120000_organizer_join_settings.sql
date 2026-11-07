ALTER TABLE public.pedido
  ADD COLUMN IF NOT EXISTS acepta_participantes boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.pedido.acepta_participantes IS
  'S4: el organizador abre o cierra la union de participantes por QR a la comanda. Cerrar la union no elimina a los participantes ya registrados; solo impide nuevas uniones mientras permanezca cerrada.';
