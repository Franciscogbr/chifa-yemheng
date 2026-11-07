-- T15a1 (S5): arqueo por denominaciones y incidencias de caja.
-- Aditiva: CREATE TABLE/INDEX, ADD COLUMN IF NOT EXISTS. Sin DROP/DELETE/TRUNCATE/GRANT/REVOKE salvo los GRANT/REVOKE de RLS propios de las tablas nuevas.
-- Niveles de control del prompt: dif<=10 cerrar con observacion; 10-50 incidencia MEDIA + supervisor informado; >50 cierre solo con supervisor + incidencia CRITICA.

-- ==========================================================================
-- 1) conteo físico por denominación (Perú estándar)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS public.arqueo_denominacion (
  id bigserial PRIMARY KEY,
  id_aperturacaja integer NOT NULL REFERENCES public.apertura_caja(id_aperturacaja) ON DELETE CASCADE,
  valor numeric(10,2) NOT NULL CHECK (valor > 0),
  tipo character varying(10) NOT NULL DEFAULT 'BILLETE' CHECK (tipo IN ('BILLETE', 'MONEDA')),
  cantidad integer NOT NULL DEFAULT 0 CHECK (cantidad >= 0),
  feccre timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecmod timestamp without time zone,
  usumod character varying(30)
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_arqueo_denominacion
  ON public.arqueo_denominacion (id_aperturacaja, valor);

CREATE INDEX IF NOT EXISTS ix_arqueo_denominacion_apertura
  ON public.arqueo_denominacion (id_aperturacaja);

COMMENT ON TABLE public.arqueo_denominacion IS
  'S5: conteo fisico de billetes y monedas por apertura de caja (Peru: billetes 10/20/50/100/200, monedas 0.10/0.20/0.50/1/2/5). Su suma define el dinero contado del arqueo; el sistema nunca lo ajusta.';

-- RL-S: solo el backend toca el conteo standokin.
ALTER TABLE public.arqueo_denominacion ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.arqueo_denominacion FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.arqueo_denominacion TO service_role;

-- ==========================================================================
-- 2) incidencias de caja (diferencias con trazabilidad completa)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS public.incidencia_caja (
  id bigserial PRIMARY KEY,
  id_aperturacaja integer NOT NULL REFERENCES public.apertura_caja(id_aperturacaja) ON DELETE CASCADE,
  id_caja integer NOT NULL,
  id_cajero integer NOT NULL,
  diferencia numeric(12,2) NOT NULL,
  nivel character varying(10) NOT NULL DEFAULT 'MEDIA' CHECK (nivel IN ('MEDIA', 'CRITICA')),
  estado character varying(15) NOT NULL DEFAULT 'PENDIENTE'
    CHECK (estado IN ('PENDIENTE', 'EN_REVISION', 'JUSTIFICADA', 'CERRADA')),
  motivo text NOT NULL DEFAULT '',
  resuelta_por integer,
  resuelta_en timestamp without time zone,
  comentario_resolucion text,
  feccre timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecmod timestamp without time zone,
  usumod character varying(30)
);

CREATE INDEX IF NOT EXISTS ix_incidencia_caja_apertura
  ON public.incidencia_caja (id_aperturacaja);

CREATE INDEX IF NOT EXISTS ix_incidencia_caja_estado
  ON public.incidencia_caja (estado, feccre);

COMMENT ON TABLE public.incidencia_caja IS
  'S5: incidencias automaticas del cierre. Nivel MEDIA: diferencia entre 10.01 y 50 soles (el supervisor queda informado desde la bandeja). Nivel CRITICA: diferencia mayor a 50 soles; el cierre exige confirmacion de otro usuario autorizado. Estado PENDIENTE -> EN_REVISION -> JUSTIFICADA o CERRADA, con usuario y fecha de resolucion para auditoria.';

ALTER TABLE public.incidencia_caja ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.incidencia_caja FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.incidencia_caja TO service_role;

-- ==========================================================================
-- 3) observacion de la apertura (mono-sucursal: sin terminal/sucursal)
-- ==========================================================================
ALTER TABLE public.apertura_caja
  ADD COLUMN IF NOT EXISTS observacion character varying(200);

COMMENT ON COLUMN public.apertura_caja.observacion IS
  'S5: observacion libre del cajero al aperturar el turno (mono-sucursal: la sucursal y la terminal corresponden a la caja unica del local).';
