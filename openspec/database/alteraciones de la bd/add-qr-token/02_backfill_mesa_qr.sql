-- add-qr-token · 02 — backfill una sola vez para mesas sin QR
-- Genera yemheng.pe/m/{NUMERO}-{TOKEN8} a partir del numero actual.
-- Idempotente: solo toca WHERE codigo_qr IS NULL.

UPDATE public.mesa
SET codigo_qr = 'yemheng.pe/m/' || UPPER(numero) || '-' || substr(md5(random()::text), 1, 8)
WHERE codigo_qr IS NULL;
