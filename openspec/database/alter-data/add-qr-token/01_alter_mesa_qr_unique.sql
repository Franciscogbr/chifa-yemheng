-- add-qr-token · 01 — UNIQUE para QR rotativo por seguridad
-- Aditivo: no rompe datos actuales (varios NULL permitidos en UNIQUE).
-- Formato objetivo: yemheng.pe/m/{NUMERO}-{TOKEN8} (ej. yemheng.pe/m/M-01-8f3KqZ2a, 27 chars < varchar(60)).

ALTER TABLE public.mesa
  ADD CONSTRAINT uq_mesa_codigo_qr UNIQUE (codigo_qr);

COMMENT ON COLUMN public.mesa.codigo_qr IS 'QR rotativo: yemheng.pe/m/{NUMERO}-{TOKEN}. Regenerable por seguridad, invalida el impreso anterior.';
