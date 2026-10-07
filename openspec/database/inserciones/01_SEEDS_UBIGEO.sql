/* ==========================================================================
   SEEDS NIVEL 0 - UBIGEO NACIONAL (DEPARTAMENTO/PROVINCIA/DISTRITO)
   Fuente: INEI - Directorio Nacional de Municipalidades 2025
   (via MichaelSuarez0/ubigeos_peru, ubigeo_inei_2025.csv).
   Contenido: 25 departamentos, 197 provincias, 1891 distritos.
   Nombres en MAYUSCULAS sin tildes (se conserva la Ñ), igual que
   los seeds base. Idempotente: re-ejecutable sin duplicar
   (WHERE NOT EXISTS; FKs resueltas por nombre, sin IDs fijos).
   Requiere: esquema + seeds base (ICA, LIMA y sus provincias).
   ========================================================================== */

/* ---------- DEPARTAMENTO ---------- */
INSERT INTO DEPARTAMENTO (N_Departamento)
SELECT 'AMAZONAS' WHERE NOT EXISTS (SELECT 1 FROM DEPARTAMENTO WHERE N_Departamento = 'AMAZONAS');
INSERT INTO DEPARTAMENTO (N_Departamento)
SELECT 'ANCASH' WHERE NOT EXISTS (SELECT 1 FROM DEPARTAMENTO WHERE N_Departamento = 'ANCASH');
INSERT INTO DEPARTAMENTO (N_Departamento)
SELECT 'APURIMAC' WHERE NOT EXISTS (SELECT 1 FROM DEPARTAMENTO WHERE N_Departamento = 'APURIMAC');
INSERT INTO DEPARTAMENTO (N_Departamento)
SELECT 'AREQUIPA' WHERE NOT EXISTS (SELECT 1 FROM DEPARTAMENTO WHERE N_Departamento = 'AREQUIPA');
INSERT INTO DEPARTAMENTO (N_Departamento)
SELECT 'AYACUCHO' WHERE NOT EXISTS (SELECT 1 FROM DEPARTAMENTO WHERE N_Departamento = 'AYACUCHO');
INSERT INTO DEPARTAMENTO (N_Departamento)
SELECT 'CAJAMARCA' WHERE NOT EXISTS (SELECT 1 FROM DEPARTAMENTO WHERE N_Departamento = 'CAJAMARCA');
INSERT INTO DEPARTAMENTO (N_Departamento)
SELECT 'CALLAO' WHERE NOT EXISTS (SELECT 1 FROM DEPARTAMENTO WHERE N_Departamento = 'CALLAO');
INSERT INTO DEPARTAMENTO (N_Departamento)
SELECT 'CUSCO' WHERE NOT EXISTS (SELECT 1 FROM DEPARTAMENTO WHERE N_Departamento = 'CUSCO');
INSERT INTO DEPARTAMENTO (N_Departamento)
SELECT 'HUANCAVELICA' WHERE NOT EXISTS (SELECT 1 FROM DEPARTAMENTO WHERE N_Departamento = 'HUANCAVELICA');
INSERT INTO DEPARTAMENTO (N_Departamento)
SELECT 'HUANUCO' WHERE NOT EXISTS (SELECT 1 FROM DEPARTAMENTO WHERE N_Departamento = 'HUANUCO');
INSERT INTO DEPARTAMENTO (N_Departamento)
SELECT 'ICA' WHERE NOT EXISTS (SELECT 1 FROM DEPARTAMENTO WHERE N_Departamento = 'ICA');
INSERT INTO DEPARTAMENTO (N_Departamento)
SELECT 'JUNIN' WHERE NOT EXISTS (SELECT 1 FROM DEPARTAMENTO WHERE N_Departamento = 'JUNIN');
INSERT INTO DEPARTAMENTO (N_Departamento)
SELECT 'LA LIBERTAD' WHERE NOT EXISTS (SELECT 1 FROM DEPARTAMENTO WHERE N_Departamento = 'LA LIBERTAD');
INSERT INTO DEPARTAMENTO (N_Departamento)
SELECT 'LAMBAYEQUE' WHERE NOT EXISTS (SELECT 1 FROM DEPARTAMENTO WHERE N_Departamento = 'LAMBAYEQUE');
INSERT INTO DEPARTAMENTO (N_Departamento)
SELECT 'LIMA' WHERE NOT EXISTS (SELECT 1 FROM DEPARTAMENTO WHERE N_Departamento = 'LIMA');
INSERT INTO DEPARTAMENTO (N_Departamento)
SELECT 'LORETO' WHERE NOT EXISTS (SELECT 1 FROM DEPARTAMENTO WHERE N_Departamento = 'LORETO');
INSERT INTO DEPARTAMENTO (N_Departamento)
SELECT 'MADRE DE DIOS' WHERE NOT EXISTS (SELECT 1 FROM DEPARTAMENTO WHERE N_Departamento = 'MADRE DE DIOS');
INSERT INTO DEPARTAMENTO (N_Departamento)
SELECT 'MOQUEGUA' WHERE NOT EXISTS (SELECT 1 FROM DEPARTAMENTO WHERE N_Departamento = 'MOQUEGUA');
INSERT INTO DEPARTAMENTO (N_Departamento)
SELECT 'PASCO' WHERE NOT EXISTS (SELECT 1 FROM DEPARTAMENTO WHERE N_Departamento = 'PASCO');
INSERT INTO DEPARTAMENTO (N_Departamento)
SELECT 'PIURA' WHERE NOT EXISTS (SELECT 1 FROM DEPARTAMENTO WHERE N_Departamento = 'PIURA');
INSERT INTO DEPARTAMENTO (N_Departamento)
SELECT 'PUNO' WHERE NOT EXISTS (SELECT 1 FROM DEPARTAMENTO WHERE N_Departamento = 'PUNO');
INSERT INTO DEPARTAMENTO (N_Departamento)
SELECT 'SAN MARTIN' WHERE NOT EXISTS (SELECT 1 FROM DEPARTAMENTO WHERE N_Departamento = 'SAN MARTIN');
INSERT INTO DEPARTAMENTO (N_Departamento)
SELECT 'TACNA' WHERE NOT EXISTS (SELECT 1 FROM DEPARTAMENTO WHERE N_Departamento = 'TACNA');
INSERT INTO DEPARTAMENTO (N_Departamento)
SELECT 'TUMBES' WHERE NOT EXISTS (SELECT 1 FROM DEPARTAMENTO WHERE N_Departamento = 'TUMBES');
INSERT INTO DEPARTAMENTO (N_Departamento)
SELECT 'UCAYALI' WHERE NOT EXISTS (SELECT 1 FROM DEPARTAMENTO WHERE N_Departamento = 'UCAYALI');

/* ---------- PROVINCIA ---------- */
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'BAGUA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'AMAZONAS' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'BAGUA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'BONGARA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'AMAZONAS' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'BONGARA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'CHACHAPOYAS' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'AMAZONAS' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'CHACHAPOYAS');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'CONDORCANQUI' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'AMAZONAS' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'CONDORCANQUI');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'LUYA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'AMAZONAS' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'LUYA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'RODRIGUEZ DE MENDOZA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'AMAZONAS' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'RODRIGUEZ DE MENDOZA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'UTCUBAMBA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'AMAZONAS' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'UTCUBAMBA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'AIJA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'ANCASH' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'AIJA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'ANTONIO RAYMONDI' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'ANCASH' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'ANTONIO RAYMONDI');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'ASUNCION' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'ANCASH' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'ASUNCION');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'BOLOGNESI' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'ANCASH' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'BOLOGNESI');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'CARHUAZ' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'ANCASH' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'CARHUAZ');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'CARLOS FERMIN FITZCARRALD' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'ANCASH' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'CARLOS FERMIN FITZCARRALD');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'CASMA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'ANCASH' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'CASMA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'CORONGO' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'ANCASH' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'CORONGO');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'HUARAZ' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'ANCASH' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'HUARAZ');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'HUARI' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'ANCASH' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'HUARI');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'HUARMEY' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'ANCASH' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'HUARMEY');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'HUAYLAS' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'ANCASH' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'HUAYLAS');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'MARISCAL LUZURIAGA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'ANCASH' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'MARISCAL LUZURIAGA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'OCROS' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'ANCASH' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'OCROS');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'PALLASCA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'ANCASH' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'PALLASCA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'POMABAMBA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'ANCASH' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'POMABAMBA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'RECUAY' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'ANCASH' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'RECUAY');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'SANTA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'ANCASH' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'SANTA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'SIHUAS' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'ANCASH' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'SIHUAS');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'YUNGAY' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'ANCASH' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'YUNGAY');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'ABANCAY' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'APURIMAC' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'ABANCAY');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'ANDAHUAYLAS' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'APURIMAC' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'ANDAHUAYLAS');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'ANTABAMBA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'APURIMAC' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'ANTABAMBA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'AYMARAES' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'APURIMAC' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'AYMARAES');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'CHINCHEROS' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'APURIMAC' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'CHINCHEROS');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'COTABAMBAS' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'APURIMAC' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'COTABAMBAS');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'GRAU' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'APURIMAC' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'GRAU');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'AREQUIPA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'AREQUIPA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'AREQUIPA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'CAMANA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'AREQUIPA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'CAMANA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'CARAVELI' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'AREQUIPA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'CARAVELI');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'CASTILLA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'AREQUIPA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'CASTILLA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'CAYLLOMA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'AREQUIPA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'CAYLLOMA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'CONDESUYOS' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'AREQUIPA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'CONDESUYOS');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'ISLAY' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'AREQUIPA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'ISLAY');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'LA UNION' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'AREQUIPA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'LA UNION');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'CANGALLO' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'AYACUCHO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'CANGALLO');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'HUAMANGA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'AYACUCHO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'HUAMANGA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'HUANCA SANCOS' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'AYACUCHO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'HUANCA SANCOS');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'HUANTA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'AYACUCHO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'HUANTA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'LA MAR' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'AYACUCHO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'LA MAR');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'LUCANAS' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'AYACUCHO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'LUCANAS');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'PARINACOCHAS' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'AYACUCHO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'PARINACOCHAS');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'PAUCAR DEL SARA SARA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'AYACUCHO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'PAUCAR DEL SARA SARA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'SUCRE' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'AYACUCHO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'SUCRE');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'VICTOR FAJARDO' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'AYACUCHO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'VICTOR FAJARDO');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'VILCAS HUAMAN' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'AYACUCHO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'VILCAS HUAMAN');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'CAJABAMBA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'CAJAMARCA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'CAJABAMBA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'CAJAMARCA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'CAJAMARCA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'CAJAMARCA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'CELENDIN' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'CAJAMARCA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'CELENDIN');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'CHOTA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'CAJAMARCA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'CHOTA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'CONTUMAZA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'CAJAMARCA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'CONTUMAZA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'CUTERVO' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'CAJAMARCA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'CUTERVO');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'HUALGAYOC' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'CAJAMARCA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'HUALGAYOC');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'JAEN' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'CAJAMARCA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'JAEN');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'NINABAMBA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'CAJAMARCA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'NINABAMBA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'SAN IGNACIO' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'CAJAMARCA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'SAN IGNACIO');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'SAN MARCOS' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'CAJAMARCA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'SAN MARCOS');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'SAN MIGUEL' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'CAJAMARCA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'SAN MIGUEL');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'SAN PABLO' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'CAJAMARCA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'SAN PABLO');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'SANTA CRUZ' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'CAJAMARCA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'SANTA CRUZ');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'CALLAO' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'CALLAO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'CALLAO');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'ACOMAYO' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'CUSCO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'ACOMAYO');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'ANTA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'CUSCO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'ANTA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'CALCA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'CUSCO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'CALCA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'CANAS' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'CUSCO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'CANAS');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'CANCHIS' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'CUSCO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'CANCHIS');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'CHUMBIVILCAS' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'CUSCO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'CHUMBIVILCAS');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'CUSCO' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'CUSCO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'CUSCO');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'ESPINAR' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'CUSCO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'ESPINAR');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'LA CONVENCION' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'CUSCO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'LA CONVENCION');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'PARURO' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'CUSCO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'PARURO');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'PAUCARTAMBO' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'CUSCO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'PAUCARTAMBO');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'QUISPICANCHI' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'CUSCO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'QUISPICANCHI');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'URUBAMBA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'CUSCO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'URUBAMBA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'ACOBAMBA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'HUANCAVELICA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'ACOBAMBA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'ANGARAES' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'HUANCAVELICA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'ANGARAES');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'CASTROVIRREYNA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'HUANCAVELICA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'CASTROVIRREYNA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'CHURCAMPA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'HUANCAVELICA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'CHURCAMPA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'HUANCAVELICA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'HUANCAVELICA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'HUANCAVELICA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'HUAYTARA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'HUANCAVELICA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'HUAYTARA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'TAYACAJA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'HUANCAVELICA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'TAYACAJA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'AMBO' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'HUANUCO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'AMBO');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'DOS DE MAYO' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'HUANUCO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'DOS DE MAYO');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'HUACAYBAMBA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'HUANUCO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'HUACAYBAMBA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'HUAMALIES' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'HUANUCO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'HUAMALIES');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'HUANUCO' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'HUANUCO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'HUANUCO');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'LAURICOCHA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'HUANUCO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'LAURICOCHA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'LEONCIO PRADO' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'HUANUCO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'LEONCIO PRADO');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'MARAÑON' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'HUANUCO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'MARAÑON');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'PACHITEA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'HUANUCO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'PACHITEA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'PUERTO INCA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'HUANUCO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'PUERTO INCA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'YAROWILCA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'HUANUCO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'YAROWILCA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'CHINCHA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'ICA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'CHINCHA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'ICA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'ICA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'ICA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'NASCA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'ICA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'NASCA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'PALPA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'ICA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'PALPA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'PISCO' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'ICA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'PISCO');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'CHANCHAMAYO' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'JUNIN' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'CHANCHAMAYO');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'CHUPACA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'JUNIN' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'CHUPACA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'CONCEPCION' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'JUNIN' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'CONCEPCION');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'HUANCAYO' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'JUNIN' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'HUANCAYO');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'JAUJA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'JUNIN' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'JAUJA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'JUNIN' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'JUNIN' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'JUNIN');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'SATIPO' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'JUNIN' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'SATIPO');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'TARMA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'JUNIN' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'TARMA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'YAULI' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'JUNIN' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'YAULI');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'ASCOPE' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'LA LIBERTAD' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'ASCOPE');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'BOLIVAR' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'LA LIBERTAD' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'BOLIVAR');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'CHEPEN' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'LA LIBERTAD' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'CHEPEN');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'GRAN CHIMU' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'LA LIBERTAD' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'GRAN CHIMU');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'JULCAN' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'LA LIBERTAD' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'JULCAN');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'OTUZCO' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'LA LIBERTAD' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'OTUZCO');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'PACASMAYO' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'LA LIBERTAD' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'PACASMAYO');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'PATAZ' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'LA LIBERTAD' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'PATAZ');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'SANCHEZ CARRION' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'LA LIBERTAD' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'SANCHEZ CARRION');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'SANTIAGO DE CHUCO' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'LA LIBERTAD' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'SANTIAGO DE CHUCO');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'TRUJILLO' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'LA LIBERTAD' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'TRUJILLO');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'VIRU' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'LA LIBERTAD' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'VIRU');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'CHICLAYO' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'LAMBAYEQUE' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'CHICLAYO');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'FERREÑAFE' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'LAMBAYEQUE' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'FERREÑAFE');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'LAMBAYEQUE' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'LAMBAYEQUE' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'LAMBAYEQUE');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'BARRANCA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'LIMA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'BARRANCA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'CAJATAMBO' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'LIMA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'CAJATAMBO');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'CANTA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'LIMA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'CANTA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'CAÑETE' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'LIMA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'CAÑETE');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'HUARAL' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'LIMA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'HUARAL');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'HUAROCHIRI' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'LIMA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'HUAROCHIRI');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'HUAURA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'LIMA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'HUAURA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'LIMA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'LIMA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'LIMA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'OYON' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'LIMA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'OYON');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'YAUYOS' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'LIMA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'YAUYOS');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'ALTO AMAZONAS' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'LORETO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'ALTO AMAZONAS');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'DATEM DEL MARAÑON' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'LORETO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'DATEM DEL MARAÑON');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'LORETO' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'LORETO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'LORETO');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'MARISCAL RAMON CASTILLA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'LORETO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'MARISCAL RAMON CASTILLA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'MAYNAS' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'LORETO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'MAYNAS');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'PUTUMAYO' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'LORETO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'PUTUMAYO');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'REQUENA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'LORETO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'REQUENA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'UCAYALI' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'LORETO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'UCAYALI');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'MANU' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'MADRE DE DIOS' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'MANU');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'TAHUAMANU' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'MADRE DE DIOS' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'TAHUAMANU');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'TAMBOPATA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'MADRE DE DIOS' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'TAMBOPATA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'GENERAL SANCHEZ CERRO' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'MOQUEGUA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'GENERAL SANCHEZ CERRO');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'ILO' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'MOQUEGUA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'ILO');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'MARISCAL NIETO' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'MOQUEGUA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'MARISCAL NIETO');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'DANIEL ALCIDES CARRION' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'PASCO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'DANIEL ALCIDES CARRION');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'OXAPAMPA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'PASCO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'OXAPAMPA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'PASCO' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'PASCO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'PASCO');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'AYABACA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'PIURA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'AYABACA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'HUANCABAMBA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'PIURA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'HUANCABAMBA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'MORROPON' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'PIURA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'MORROPON');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'PAITA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'PIURA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'PAITA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'PIURA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'PIURA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'PIURA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'SECHURA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'PIURA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'SECHURA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'SULLANA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'PIURA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'SULLANA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'TALARA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'PIURA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'TALARA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'AZANGARO' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'PUNO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'AZANGARO');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'CARABAYA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'PUNO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'CARABAYA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'CHUCUITO' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'PUNO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'CHUCUITO');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'EL COLLAO' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'PUNO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'EL COLLAO');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'HUANCANE' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'PUNO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'HUANCANE');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'LAMPA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'PUNO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'LAMPA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'MELGAR' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'PUNO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'MELGAR');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'MOHO' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'PUNO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'MOHO');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'PUNO' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'PUNO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'PUNO');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'SAN ANTONIO DE PUTINA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'PUNO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'SAN ANTONIO DE PUTINA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'SAN ROMAN' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'PUNO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'SAN ROMAN');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'SANDIA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'PUNO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'SANDIA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'YUNGUYO' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'PUNO' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'YUNGUYO');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'BELLAVISTA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'SAN MARTIN' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'BELLAVISTA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'EL DORADO' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'SAN MARTIN' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'EL DORADO');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'HUALLAGA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'SAN MARTIN' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'HUALLAGA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'LAMAS' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'SAN MARTIN' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'LAMAS');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'MARISCAL CACERES' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'SAN MARTIN' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'MARISCAL CACERES');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'MOYOBAMBA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'SAN MARTIN' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'MOYOBAMBA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'PICOTA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'SAN MARTIN' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'PICOTA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'RIOJA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'SAN MARTIN' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'RIOJA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'SAN MARTIN' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'SAN MARTIN' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'SAN MARTIN');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'TOCACHE' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'SAN MARTIN' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'TOCACHE');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'CANDARAVE' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'TACNA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'CANDARAVE');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'JORGE BASADRE' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'TACNA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'JORGE BASADRE');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'TACNA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'TACNA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'TACNA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'TARATA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'TACNA' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'TARATA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'CONTRALMIRANTE VILLAR' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'TUMBES' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'CONTRALMIRANTE VILLAR');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'TUMBES' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'TUMBES' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'TUMBES');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'ZARUMILLA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'TUMBES' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'ZARUMILLA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'ATALAYA' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'UCAYALI' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'ATALAYA');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'CORONEL PORTILLO' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'UCAYALI' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'CORONEL PORTILLO');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'PADRE ABAD' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'UCAYALI' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'PADRE ABAD');
INSERT INTO PROVINCIA (ID_Departamento, N_Provincia)
SELECT d.ID_Departamento, 'PURUS' FROM DEPARTAMENTO d
WHERE d.N_Departamento = 'UCAYALI' AND NOT EXISTS (SELECT 1 FROM PROVINCIA p WHERE p.ID_Departamento = d.ID_Departamento AND p.N_Provincia = 'PURUS');

/* ---------- DISTRITO ---------- */
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHACHAPOYAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'CHACHAPOYAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHACHAPOYAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ASUNCION' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'CHACHAPOYAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ASUNCION');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'BALSAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'CHACHAPOYAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'BALSAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHETO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'CHACHAPOYAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHETO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHILIQUIN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'CHACHAPOYAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHILIQUIN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHUQUIBAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'CHACHAPOYAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHUQUIBAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'GRANADA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'CHACHAPOYAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'GRANADA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUANCAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'CHACHAPOYAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUANCAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LA JALCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'CHACHAPOYAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LA JALCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LEIMEBAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'CHACHAPOYAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LEIMEBAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LEVANTO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'CHACHAPOYAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LEVANTO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MAGDALENA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'CHACHAPOYAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MAGDALENA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MARISCAL CASTILLA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'CHACHAPOYAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MARISCAL CASTILLA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MOLINOPAMPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'CHACHAPOYAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MOLINOPAMPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MONTEVIDEO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'CHACHAPOYAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MONTEVIDEO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'OLLEROS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'CHACHAPOYAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'OLLEROS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'QUINJALCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'CHACHAPOYAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'QUINJALCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN FRANCISCO DE DAGUAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'CHACHAPOYAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN FRANCISCO DE DAGUAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN ISIDRO DE MAINO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'CHACHAPOYAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN ISIDRO DE MAINO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SOLOCO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'CHACHAPOYAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SOLOCO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SONCHE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'CHACHAPOYAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SONCHE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'BAGUA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'BAGUA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'BAGUA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ARAMANGO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'BAGUA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ARAMANGO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COPALLIN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'BAGUA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COPALLIN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'EL PARCO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'BAGUA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'EL PARCO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'IMAZA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'BAGUA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'IMAZA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LA PECA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'BAGUA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LA PECA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JUMBILLA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'BONGARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JUMBILLA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHISQUILLA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'BONGARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHISQUILLA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHURUJA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'BONGARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHURUJA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COROSHA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'BONGARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COROSHA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CUISPES' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'BONGARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CUISPES');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'FLORIDA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'BONGARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'FLORIDA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JAZAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'BONGARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JAZAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'RECTA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'BONGARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'RECTA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN CARLOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'BONGARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN CARLOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SHIPASBAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'BONGARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SHIPASBAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'VALERA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'BONGARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'VALERA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YAMBRASBAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'BONGARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YAMBRASBAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'NIEVA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'CONDORCANQUI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'NIEVA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'EL CENEPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'CONDORCANQUI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'EL CENEPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'RIO SANTIAGO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'CONDORCANQUI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'RIO SANTIAGO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LAMUD' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'LUYA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LAMUD');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CAMPORREDONDO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'LUYA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CAMPORREDONDO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COCABAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'LUYA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COCABAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COLCAMAR' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'LUYA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COLCAMAR');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CONILA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'LUYA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CONILA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'INGUILPATA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'LUYA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'INGUILPATA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LONGUITA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'LUYA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LONGUITA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LONYA CHICO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'LUYA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LONYA CHICO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LUYA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'LUYA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LUYA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LUYA VIEJO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'LUYA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LUYA VIEJO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MARIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'LUYA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MARIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'OCALLI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'LUYA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'OCALLI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'OCUMAL' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'LUYA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'OCUMAL');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PISUQUIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'LUYA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PISUQUIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PROVIDENCIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'LUYA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PROVIDENCIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN CRISTOBAL' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'LUYA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN CRISTOBAL');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN FRANCISCO DEL YESO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'LUYA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN FRANCISCO DEL YESO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JERONIMO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'LUYA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JERONIMO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JUAN DE LOPECANCHA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'LUYA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JUAN DE LOPECANCHA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA CATALINA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'LUYA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA CATALINA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTO TOMAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'LUYA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTO TOMAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TINGO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'LUYA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TINGO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TRITA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'LUYA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TRITA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN NICOLAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'RODRIGUEZ DE MENDOZA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN NICOLAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHIRIMOTO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'RODRIGUEZ DE MENDOZA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHIRIMOTO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COCHAMAL' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'RODRIGUEZ DE MENDOZA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COCHAMAL');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUAMBO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'RODRIGUEZ DE MENDOZA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUAMBO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LIMABAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'RODRIGUEZ DE MENDOZA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LIMABAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LONGAR' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'RODRIGUEZ DE MENDOZA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LONGAR');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MARISCAL BENAVIDES' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'RODRIGUEZ DE MENDOZA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MARISCAL BENAVIDES');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MILPUC' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'RODRIGUEZ DE MENDOZA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MILPUC');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'OMIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'RODRIGUEZ DE MENDOZA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'OMIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA ROSA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'RODRIGUEZ DE MENDOZA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA ROSA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TOTORA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'RODRIGUEZ DE MENDOZA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TOTORA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'VISTA ALEGRE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'RODRIGUEZ DE MENDOZA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'VISTA ALEGRE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'BAGUA GRANDE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'UTCUBAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'BAGUA GRANDE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CAJARURO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'UTCUBAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CAJARURO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CUMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'UTCUBAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CUMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'EL MILAGRO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'UTCUBAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'EL MILAGRO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JAMALCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'UTCUBAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JAMALCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LONYA GRANDE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'UTCUBAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LONYA GRANDE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YAMON' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AMAZONAS' AND p.N_Provincia = 'UTCUBAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YAMON');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUARAZ' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUARAZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUARAZ');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COCHABAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUARAZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COCHABAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COLCABAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUARAZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COLCABAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUANCHAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUARAZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUANCHAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'INDEPENDENCIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUARAZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'INDEPENDENCIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JANGAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUARAZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JANGAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LA LIBERTAD' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUARAZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LA LIBERTAD');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'OLLEROS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUARAZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'OLLEROS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PAMPAS GRANDE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUARAZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PAMPAS GRANDE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PARIACOTO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUARAZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PARIACOTO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PIRA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUARAZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PIRA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TARICA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUARAZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TARICA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'AIJA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'AIJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'AIJA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CORIS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'AIJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CORIS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUACLLAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'AIJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUACLLAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LA MERCED' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'AIJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LA MERCED');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SUCCHA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'AIJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SUCCHA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LLAMELLIN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'ANTONIO RAYMONDI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LLAMELLIN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ACZO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'ANTONIO RAYMONDI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ACZO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHACCHO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'ANTONIO RAYMONDI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHACCHO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHINGAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'ANTONIO RAYMONDI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHINGAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MIRGAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'ANTONIO RAYMONDI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MIRGAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JUAN DE RONTOY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'ANTONIO RAYMONDI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JUAN DE RONTOY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHACAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'ASUNCION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHACAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ACOCHACA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'ASUNCION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ACOCHACA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHIQUIAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'BOLOGNESI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHIQUIAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ABELARDO PARDO LEZAMETA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'BOLOGNESI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ABELARDO PARDO LEZAMETA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ANTONIO RAYMONDI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'BOLOGNESI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ANTONIO RAYMONDI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'AQUIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'BOLOGNESI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'AQUIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CAJACAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'BOLOGNESI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CAJACAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CANIS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'BOLOGNESI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CANIS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COLQUIOC' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'BOLOGNESI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COLQUIOC');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUALLANCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'BOLOGNESI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUALLANCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUASTA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'BOLOGNESI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUASTA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUAYLLACAYAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'BOLOGNESI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUAYLLACAYAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LA PRIMAVERA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'BOLOGNESI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LA PRIMAVERA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MANGAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'BOLOGNESI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MANGAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PACLLON' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'BOLOGNESI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PACLLON');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN MIGUEL DE CORPANQUI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'BOLOGNESI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN MIGUEL DE CORPANQUI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TICLLOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'BOLOGNESI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TICLLOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CARHUAZ' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'CARHUAZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CARHUAZ');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ACOPAMPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'CARHUAZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ACOPAMPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'AMASHCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'CARHUAZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'AMASHCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ANTA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'CARHUAZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ANTA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ATAQUERO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'CARHUAZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ATAQUERO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MARCARA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'CARHUAZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MARCARA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PARIAHUANCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'CARHUAZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PARIAHUANCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN MIGUEL DE ACO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'CARHUAZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN MIGUEL DE ACO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SHILLA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'CARHUAZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SHILLA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TINCO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'CARHUAZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TINCO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YUNGAR' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'CARHUAZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YUNGAR');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN LUIS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'CARLOS FERMIN FITZCARRALD' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN LUIS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN NICOLAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'CARLOS FERMIN FITZCARRALD' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN NICOLAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YAUYA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'CARLOS FERMIN FITZCARRALD' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YAUYA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CASMA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'CASMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CASMA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'BUENA VISTA ALTA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'CASMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'BUENA VISTA ALTA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COMANDANTE NOEL' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'CASMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COMANDANTE NOEL');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YAUTAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'CASMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YAUTAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CORONGO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'CORONGO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CORONGO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ACO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'CORONGO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ACO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'BAMBAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'CORONGO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'BAMBAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CUSCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'CORONGO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CUSCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LA PAMPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'CORONGO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LA PAMPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YANAC' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'CORONGO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YANAC');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YUPAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'CORONGO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YUPAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUARI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUARI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUARI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ANRA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUARI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ANRA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CAJAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUARI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CAJAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHAVIN DE HUANTAR' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUARI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHAVIN DE HUANTAR');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUACACHI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUARI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUACACHI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUACCHIS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUARI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUACCHIS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUACHIS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUARI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUACHIS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUANTAR' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUARI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUANTAR');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MASIN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUARI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MASIN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PAUCAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUARI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PAUCAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PONTO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUARI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PONTO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'RAHUAPAMPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUARI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'RAHUAPAMPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'RAPAYAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUARI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'RAPAYAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN MARCOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUARI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN MARCOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN PEDRO DE CHANA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUARI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN PEDRO DE CHANA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'UCO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUARI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'UCO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUARMEY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUARMEY' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUARMEY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COCHAPETI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUARMEY' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COCHAPETI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CULEBRAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUARMEY' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CULEBRAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUAYAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUARMEY' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUAYAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MALVAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUARMEY' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MALVAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CARAZ' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUAYLAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CARAZ');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUALLANCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUAYLAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUALLANCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUATA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUAYLAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUATA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUAYLAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUAYLAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUAYLAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MATO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUAYLAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MATO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PAMPAROMAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUAYLAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PAMPAROMAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PUEBLO LIBRE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUAYLAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PUEBLO LIBRE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA CRUZ' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUAYLAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA CRUZ');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTO TORIBIO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUAYLAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTO TORIBIO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YURACMARCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'HUAYLAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YURACMARCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PISCOBAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'MARISCAL LUZURIAGA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PISCOBAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CASCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'MARISCAL LUZURIAGA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CASCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ELEAZAR GUZMAN BARRON' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'MARISCAL LUZURIAGA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ELEAZAR GUZMAN BARRON');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'FIDEL OLIVAS ESCUDERO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'MARISCAL LUZURIAGA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'FIDEL OLIVAS ESCUDERO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LLAMA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'MARISCAL LUZURIAGA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LLAMA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LLUMPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'MARISCAL LUZURIAGA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LLUMPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LUCMA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'MARISCAL LUZURIAGA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LUCMA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MUSGA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'MARISCAL LUZURIAGA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MUSGA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'OCROS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'OCROS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'OCROS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ACAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'OCROS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ACAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CAJAMARQUILLA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'OCROS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CAJAMARQUILLA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CARHUAPAMPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'OCROS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CARHUAPAMPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COCHAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'OCROS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COCHAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CONGAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'OCROS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CONGAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LLIPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'OCROS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LLIPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN CRISTOBAL DE RAJAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'OCROS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN CRISTOBAL DE RAJAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN PEDRO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'OCROS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN PEDRO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTIAGO DE CHILCAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'OCROS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTIAGO DE CHILCAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CABANA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'PALLASCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CABANA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'BOLOGNESI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'PALLASCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'BOLOGNESI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CONCHUCOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'PALLASCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CONCHUCOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUACASCHUQUE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'PALLASCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUACASCHUQUE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUANDOVAL' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'PALLASCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUANDOVAL');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LACABAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'PALLASCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LACABAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LLAPO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'PALLASCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LLAPO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PALLASCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'PALLASCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PALLASCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PAMPAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'PALLASCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PAMPAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA ROSA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'PALLASCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA ROSA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TAUCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'PALLASCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TAUCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'POMABAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'POMABAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'POMABAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUAYLLAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'POMABAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUAYLLAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PAROBAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'POMABAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PAROBAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'QUINUABAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'POMABAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'QUINUABAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'RECUAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'RECUAY' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'RECUAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CATAC' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'RECUAY' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CATAC');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COTAPARACO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'RECUAY' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COTAPARACO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUAYLLAPAMPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'RECUAY' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUAYLLAPAMPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LLACLLIN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'RECUAY' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LLACLLIN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MARCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'RECUAY' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MARCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PAMPAS CHICO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'RECUAY' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PAMPAS CHICO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PARARIN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'RECUAY' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PARARIN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TAPACOCHA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'RECUAY' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TAPACOCHA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TICAPAMPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'RECUAY' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TICAPAMPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHIMBOTE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'SANTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHIMBOTE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CACERES DEL PERU' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'SANTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CACERES DEL PERU');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COISHCO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'SANTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COISHCO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MACATE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'SANTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MACATE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MORO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'SANTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MORO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'NEPEÑA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'SANTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'NEPEÑA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAMANCO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'SANTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAMANCO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'SANTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'NUEVO CHIMBOTE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'SANTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'NUEVO CHIMBOTE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SIHUAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'SIHUAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SIHUAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ACOBAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'SIHUAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ACOBAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ALFONSO UGARTE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'SIHUAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ALFONSO UGARTE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CASHAPAMPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'SIHUAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CASHAPAMPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHINGALPO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'SIHUAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHINGALPO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUAYLLABAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'SIHUAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUAYLLABAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'QUICHES' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'SIHUAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'QUICHES');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'RAGASH' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'SIHUAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'RAGASH');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JUAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'SIHUAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JUAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SICSIBAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'SIHUAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SICSIBAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YUNGAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'YUNGAY' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YUNGAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CASCAPARA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'YUNGAY' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CASCAPARA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MANCOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'YUNGAY' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MANCOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MATACOTO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'YUNGAY' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MATACOTO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'QUILLO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'YUNGAY' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'QUILLO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'RANRAHIRCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'YUNGAY' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'RANRAHIRCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SHUPLUY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'YUNGAY' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SHUPLUY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YANAMA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ANCASH' AND p.N_Provincia = 'YUNGAY' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YANAMA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ABANCAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'ABANCAY' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ABANCAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHACOCHE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'ABANCAY' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHACOCHE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CIRCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'ABANCAY' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CIRCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CURAHUASI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'ABANCAY' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CURAHUASI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUANIPACA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'ABANCAY' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUANIPACA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LAMBRAMA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'ABANCAY' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LAMBRAMA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PICHIRHUA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'ABANCAY' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PICHIRHUA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN PEDRO DE CACHORA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'ABANCAY' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN PEDRO DE CACHORA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TAMBURCO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'ABANCAY' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TAMBURCO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ANDAHUAYLAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'ANDAHUAYLAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ANDAHUAYLAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ANDARAPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'ANDAHUAYLAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ANDARAPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHIARA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'ANDAHUAYLAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHIARA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUANCARAMA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'ANDAHUAYLAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUANCARAMA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUANCARAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'ANDAHUAYLAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUANCARAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUAYANA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'ANDAHUAYLAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUAYANA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'KISHUARA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'ANDAHUAYLAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'KISHUARA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PACOBAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'ANDAHUAYLAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PACOBAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PACUCHA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'ANDAHUAYLAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PACUCHA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PAMPACHIRI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'ANDAHUAYLAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PAMPACHIRI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'POMACOCHA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'ANDAHUAYLAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'POMACOCHA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN ANTONIO DE CACHI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'ANDAHUAYLAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN ANTONIO DE CACHI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JERONIMO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'ANDAHUAYLAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JERONIMO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN MIGUEL DE CHACCRAMPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'ANDAHUAYLAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN MIGUEL DE CHACCRAMPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA MARIA DE CHICMO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'ANDAHUAYLAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA MARIA DE CHICMO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TALAVERA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'ANDAHUAYLAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TALAVERA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TUMAY HUARACA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'ANDAHUAYLAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TUMAY HUARACA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TURPO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'ANDAHUAYLAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TURPO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'KAQUIABAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'ANDAHUAYLAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'KAQUIABAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JOSE MARIA ARGUEDAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'ANDAHUAYLAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JOSE MARIA ARGUEDAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ANTABAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'ANTABAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ANTABAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'EL ORO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'ANTABAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'EL ORO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUAQUIRCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'ANTABAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUAQUIRCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JUAN ESPINOZA MEDRANO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'ANTABAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JUAN ESPINOZA MEDRANO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'OROPESA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'ANTABAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'OROPESA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PACHACONAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'ANTABAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PACHACONAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SABAINO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'ANTABAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SABAINO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHALHUANCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'AYMARAES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHALHUANCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CAPAYA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'AYMARAES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CAPAYA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CARAYBAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'AYMARAES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CARAYBAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHAPIMARCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'AYMARAES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHAPIMARCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COLCABAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'AYMARAES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COLCABAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COTARUSE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'AYMARAES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COTARUSE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'IHUAYLLO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'AYMARAES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'IHUAYLLO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JUSTO APU SAHUARAURA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'AYMARAES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JUSTO APU SAHUARAURA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LUCRE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'AYMARAES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LUCRE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'POCOHUANCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'AYMARAES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'POCOHUANCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JUAN DE CHACÑA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'AYMARAES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JUAN DE CHACÑA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAÑAYCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'AYMARAES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAÑAYCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SORAYA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'AYMARAES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SORAYA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TAPAIRIHUA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'AYMARAES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TAPAIRIHUA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TINTAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'AYMARAES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TINTAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TORAYA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'AYMARAES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TORAYA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YANACA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'AYMARAES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YANACA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TAMBOBAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'COTABAMBAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TAMBOBAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COTABAMBAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'COTABAMBAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COTABAMBAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COYLLURQUI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'COTABAMBAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COYLLURQUI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HAQUIRA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'COTABAMBAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HAQUIRA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MARA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'COTABAMBAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MARA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHALLHUAHUACHO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'COTABAMBAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHALLHUAHUACHO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHINCHEROS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'CHINCHEROS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHINCHEROS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ANCO-HUALLO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'CHINCHEROS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ANCO-HUALLO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COCHARCAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'CHINCHEROS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COCHARCAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUACCANA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'CHINCHEROS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUACCANA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'OCOBAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'CHINCHEROS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'OCOBAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ONGOY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'CHINCHEROS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ONGOY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'URANMARCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'CHINCHEROS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'URANMARCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'RANRACANCHA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'CHINCHEROS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'RANRACANCHA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ROCCHACC' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'CHINCHEROS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ROCCHACC');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'EL PORVENIR' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'CHINCHEROS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'EL PORVENIR');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LOS CHANKAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'CHINCHEROS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LOS CHANKAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'AHUAYRO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'CHINCHEROS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'AHUAYRO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHUQUIBAMBILLA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'GRAU' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHUQUIBAMBILLA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CURPAHUASI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'GRAU' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CURPAHUASI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'GAMARRA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'GRAU' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'GAMARRA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUAYLLATI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'GRAU' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUAYLLATI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MAMARA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'GRAU' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MAMARA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MICAELA BASTIDAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'GRAU' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MICAELA BASTIDAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PATAYPAMPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'GRAU' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PATAYPAMPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PROGRESO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'GRAU' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PROGRESO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN ANTONIO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'GRAU' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN ANTONIO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA ROSA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'GRAU' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA ROSA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TURPAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'GRAU' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TURPAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'VILCABAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'GRAU' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'VILCABAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'VIRUNDO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'GRAU' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'VIRUNDO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CURASCO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'APURIMAC' AND p.N_Provincia = 'GRAU' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CURASCO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'AREQUIPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'AREQUIPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'AREQUIPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ALTO SELVA ALEGRE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'AREQUIPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ALTO SELVA ALEGRE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CAYMA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'AREQUIPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CAYMA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CERRO COLORADO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'AREQUIPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CERRO COLORADO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHARACATO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'AREQUIPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHARACATO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHIGUATA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'AREQUIPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHIGUATA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JACOBO HUNTER' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'AREQUIPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JACOBO HUNTER');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LA JOYA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'AREQUIPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LA JOYA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MARIANO MELGAR' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'AREQUIPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MARIANO MELGAR');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MIRAFLORES' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'AREQUIPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MIRAFLORES');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MOLLEBAYA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'AREQUIPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MOLLEBAYA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PAUCARPATA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'AREQUIPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PAUCARPATA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'POCSI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'AREQUIPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'POCSI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'POLOBAYA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'AREQUIPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'POLOBAYA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'QUEQUEÑA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'AREQUIPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'QUEQUEÑA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SABANDIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'AREQUIPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SABANDIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SACHACA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'AREQUIPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SACHACA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JUAN DE SIGUAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'AREQUIPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JUAN DE SIGUAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JUAN DE TARUCANI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'AREQUIPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JUAN DE TARUCANI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA ISABEL DE SIGUAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'AREQUIPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA ISABEL DE SIGUAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA RITA DE SIGUAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'AREQUIPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA RITA DE SIGUAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SOCABAYA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'AREQUIPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SOCABAYA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TIABAYA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'AREQUIPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TIABAYA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'UCHUMAYO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'AREQUIPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'UCHUMAYO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'VITOR' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'AREQUIPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'VITOR');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YANAHUARA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'AREQUIPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YANAHUARA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YARABAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'AREQUIPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YARABAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YURA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'AREQUIPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YURA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JOSE LUIS BUSTAMANTE Y RIVERO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'AREQUIPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JOSE LUIS BUSTAMANTE Y RIVERO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CAMANA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CAMANA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CAMANA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JOSE MARIA QUIMPER' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CAMANA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JOSE MARIA QUIMPER');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MARIANO NICOLAS VALCARCEL' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CAMANA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MARIANO NICOLAS VALCARCEL');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MARISCAL CACERES' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CAMANA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MARISCAL CACERES');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'NICOLAS DE PIEROLA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CAMANA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'NICOLAS DE PIEROLA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'OCOÑA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CAMANA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'OCOÑA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'QUILCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CAMANA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'QUILCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAMUEL PASTOR' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CAMANA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAMUEL PASTOR');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CARAVELI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CARAVELI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CARAVELI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ACARI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CARAVELI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ACARI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ATICO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CARAVELI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ATICO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ATIQUIPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CARAVELI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ATIQUIPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'BELLA UNION' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CARAVELI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'BELLA UNION');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CAHUACHO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CARAVELI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CAHUACHO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHALA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CARAVELI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHALA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHAPARRA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CARAVELI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHAPARRA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUANUHUANU' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CARAVELI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUANUHUANU');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JAQUI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CARAVELI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JAQUI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LOMAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CARAVELI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LOMAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'QUICACHA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CARAVELI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'QUICACHA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YAUCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CARAVELI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YAUCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'APLAO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CASTILLA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'APLAO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ANDAGUA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CASTILLA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ANDAGUA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'AYO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CASTILLA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'AYO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHACHAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CASTILLA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHACHAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHILCAYMARCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CASTILLA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHILCAYMARCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHOCO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CASTILLA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHOCO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUANCARQUI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CASTILLA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUANCARQUI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MACHAGUAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CASTILLA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MACHAGUAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ORCOPAMPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CASTILLA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ORCOPAMPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PAMPACOLCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CASTILLA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PAMPACOLCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TIPAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CASTILLA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TIPAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'UÑON' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CASTILLA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'UÑON');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'URACA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CASTILLA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'URACA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'VIRACO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CASTILLA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'VIRACO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHIVAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CAYLLOMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHIVAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ACHOMA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CAYLLOMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ACHOMA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CABANACONDE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CAYLLOMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CABANACONDE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CALLALLI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CAYLLOMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CALLALLI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CAYLLOMA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CAYLLOMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CAYLLOMA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COPORAQUE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CAYLLOMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COPORAQUE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUAMBO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CAYLLOMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUAMBO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUANCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CAYLLOMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUANCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ICHUPAMPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CAYLLOMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ICHUPAMPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LARI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CAYLLOMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LARI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LLUTA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CAYLLOMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LLUTA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MACA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CAYLLOMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MACA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MADRIGAL' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CAYLLOMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MADRIGAL');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN ANTONIO DE CHUCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CAYLLOMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN ANTONIO DE CHUCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SIBAYO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CAYLLOMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SIBAYO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TAPAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CAYLLOMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TAPAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TISCO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CAYLLOMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TISCO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TUTI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CAYLLOMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TUTI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YANQUE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CAYLLOMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YANQUE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MAJES' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CAYLLOMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MAJES');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHUQUIBAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CONDESUYOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHUQUIBAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ANDARAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CONDESUYOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ANDARAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CAYARANI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CONDESUYOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CAYARANI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHICHAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CONDESUYOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHICHAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'IRAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CONDESUYOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'IRAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'RIO GRANDE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CONDESUYOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'RIO GRANDE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SALAMANCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CONDESUYOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SALAMANCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YANAQUIHUA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'CONDESUYOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YANAQUIHUA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MOLLENDO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'ISLAY' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MOLLENDO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COCACHACRA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'ISLAY' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COCACHACRA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'DEAN VALDIVIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'ISLAY' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'DEAN VALDIVIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ISLAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'ISLAY' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ISLAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MEJIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'ISLAY' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MEJIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PUNTA DE BOMBON' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'ISLAY' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PUNTA DE BOMBON');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COTAHUASI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'LA UNION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COTAHUASI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ALCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'LA UNION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ALCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHARCANA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'LA UNION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHARCANA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUAYNACOTAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'LA UNION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUAYNACOTAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PAMPAMARCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'LA UNION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PAMPAMARCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PUYCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'LA UNION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PUYCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'QUECHUALLA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'LA UNION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'QUECHUALLA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAYLA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'LA UNION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAYLA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TAURIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'LA UNION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TAURIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TOMEPAMPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'LA UNION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TOMEPAMPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TORO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AREQUIPA' AND p.N_Provincia = 'LA UNION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TORO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'AYACUCHO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'HUAMANGA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'AYACUCHO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ACOCRO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'HUAMANGA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ACOCRO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ACOS VINCHOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'HUAMANGA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ACOS VINCHOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CARMEN ALTO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'HUAMANGA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CARMEN ALTO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHIARA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'HUAMANGA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHIARA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'OCROS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'HUAMANGA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'OCROS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PACAYCASA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'HUAMANGA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PACAYCASA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'QUINUA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'HUAMANGA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'QUINUA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JOSE DE TICLLAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'HUAMANGA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JOSE DE TICLLAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JUAN BAUTISTA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'HUAMANGA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JUAN BAUTISTA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTIAGO DE PISCHA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'HUAMANGA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTIAGO DE PISCHA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SOCOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'HUAMANGA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SOCOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TAMBILLO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'HUAMANGA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TAMBILLO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'VINCHOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'HUAMANGA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'VINCHOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JESUS NAZARENO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'HUAMANGA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JESUS NAZARENO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ANDRES AVELINO CACERES DORREGARAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'HUAMANGA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ANDRES AVELINO CACERES DORREGARAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CANGALLO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'CANGALLO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CANGALLO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHUSCHI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'CANGALLO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHUSCHI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LOS MOROCHUCOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'CANGALLO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LOS MOROCHUCOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MARIA PARADO DE BELLIDO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'CANGALLO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MARIA PARADO DE BELLIDO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PARAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'CANGALLO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PARAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TOTOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'CANGALLO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TOTOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANCOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'HUANCA SANCOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANCOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CARAPO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'HUANCA SANCOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CARAPO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SACSAMARCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'HUANCA SANCOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SACSAMARCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTIAGO DE LUCANAMARCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'HUANCA SANCOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTIAGO DE LUCANAMARCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUANTA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'HUANTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUANTA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'AYAHUANCO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'HUANTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'AYAHUANCO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUAMANGUILLA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'HUANTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUAMANGUILLA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'IGUAIN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'HUANTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'IGUAIN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LURICOCHA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'HUANTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LURICOCHA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTILLANA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'HUANTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTILLANA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SIVIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'HUANTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SIVIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LLOCHEGUA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'HUANTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LLOCHEGUA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CANAYRE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'HUANTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CANAYRE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'UCHURACCAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'HUANTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'UCHURACCAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PUCACOLPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'HUANTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PUCACOLPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHACA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'HUANTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHACA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PUTIS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'HUANTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PUTIS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN MIGUEL' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'LA MAR' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN MIGUEL');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ANCO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'LA MAR' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ANCO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'AYNA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'LA MAR' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'AYNA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHILCAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'LA MAR' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHILCAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHUNGUI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'LA MAR' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHUNGUI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LUIS CARRANZA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'LA MAR' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LUIS CARRANZA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA ROSA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'LA MAR' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA ROSA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TAMBO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'LA MAR' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TAMBO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAMUGARI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'LA MAR' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAMUGARI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ANCHIHUAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'LA MAR' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ANCHIHUAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ORONCCOY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'LA MAR' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ORONCCOY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'UNION PROGRESO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'LA MAR' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'UNION PROGRESO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'RIO MAGDALENA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'LA MAR' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'RIO MAGDALENA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'NINABAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'LA MAR' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'NINABAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PATIBAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'LA MAR' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PATIBAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PUQUIO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'LUCANAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PUQUIO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'AUCARA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'LUCANAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'AUCARA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CABANA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'LUCANAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CABANA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CARMEN SALCEDO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'LUCANAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CARMEN SALCEDO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHAVIÑA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'LUCANAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHAVIÑA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHIPAO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'LUCANAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHIPAO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUAC-HUAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'LUCANAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUAC-HUAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LARAMATE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'LUCANAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LARAMATE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LEONCIO PRADO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'LUCANAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LEONCIO PRADO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LLAUTA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'LUCANAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LLAUTA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LUCANAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'LUCANAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LUCANAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'OCAÑA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'LUCANAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'OCAÑA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'OTOCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'LUCANAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'OTOCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAISA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'LUCANAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAISA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN CRISTOBAL' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'LUCANAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN CRISTOBAL');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JUAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'LUCANAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JUAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN PEDRO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'LUCANAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN PEDRO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN PEDRO DE PALCO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'LUCANAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN PEDRO DE PALCO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANCOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'LUCANAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANCOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA ANA DE HUAYCAHUACHO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'LUCANAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA ANA DE HUAYCAHUACHO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA LUCIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'LUCANAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA LUCIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CORACORA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'PARINACOCHAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CORACORA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHUMPI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'PARINACOCHAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHUMPI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CORONEL CASTAÑEDA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'PARINACOCHAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CORONEL CASTAÑEDA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PACAPAUSA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'PARINACOCHAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PACAPAUSA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PULLO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'PARINACOCHAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PULLO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PUYUSCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'PARINACOCHAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PUYUSCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN FRANCISCO DE RIVACAYCO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'PARINACOCHAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN FRANCISCO DE RIVACAYCO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'UPAHUACHO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'PARINACOCHAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'UPAHUACHO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PAUSA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'PAUCAR DEL SARA SARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PAUSA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COLTA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'PAUCAR DEL SARA SARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COLTA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CORCULLA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'PAUCAR DEL SARA SARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CORCULLA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LAMPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'PAUCAR DEL SARA SARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LAMPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MARCABAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'PAUCAR DEL SARA SARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MARCABAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'OYOLO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'PAUCAR DEL SARA SARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'OYOLO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PARARCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'PAUCAR DEL SARA SARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PARARCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JAVIER DE ALPABAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'PAUCAR DEL SARA SARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JAVIER DE ALPABAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JOSE DE USHUA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'PAUCAR DEL SARA SARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JOSE DE USHUA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SARA SARA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'PAUCAR DEL SARA SARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SARA SARA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'QUEROBAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'SUCRE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'QUEROBAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'BELEN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'SUCRE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'BELEN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHALCOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'SUCRE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHALCOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHILCAYOC' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'SUCRE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHILCAYOC');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUACAÑA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'SUCRE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUACAÑA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MORCOLLA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'SUCRE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MORCOLLA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PAICO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'SUCRE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PAICO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN PEDRO DE LARCAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'SUCRE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN PEDRO DE LARCAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN SALVADOR DE QUIJE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'SUCRE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN SALVADOR DE QUIJE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTIAGO DE PAUCARAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'SUCRE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTIAGO DE PAUCARAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SORAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'SUCRE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SORAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUANCAPI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'VICTOR FAJARDO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUANCAPI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ALCAMENCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'VICTOR FAJARDO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ALCAMENCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'APONGO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'VICTOR FAJARDO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'APONGO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ASQUIPATA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'VICTOR FAJARDO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ASQUIPATA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CANARIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'VICTOR FAJARDO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CANARIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CAYARA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'VICTOR FAJARDO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CAYARA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COLCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'VICTOR FAJARDO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COLCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUAMANQUIQUIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'VICTOR FAJARDO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUAMANQUIQUIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUANCARAYLLA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'VICTOR FAJARDO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUANCARAYLLA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUALLA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'VICTOR FAJARDO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUALLA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SARHUA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'VICTOR FAJARDO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SARHUA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'VILCANCHOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'VICTOR FAJARDO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'VILCANCHOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'VILCAS HUAMAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'VILCAS HUAMAN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'VILCAS HUAMAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ACCOMARCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'VILCAS HUAMAN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ACCOMARCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CARHUANCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'VILCAS HUAMAN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CARHUANCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CONCEPCION' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'VILCAS HUAMAN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CONCEPCION');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUAMBALPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'VILCAS HUAMAN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUAMBALPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'INDEPENDENCIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'VILCAS HUAMAN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'INDEPENDENCIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAURAMA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'VILCAS HUAMAN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAURAMA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'VISCHONGO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'AYACUCHO' AND p.N_Provincia = 'VILCAS HUAMAN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'VISCHONGO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CAJAMARCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CAJAMARCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CAJAMARCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ASUNCION' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CAJAMARCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ASUNCION');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHETILLA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CAJAMARCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHETILLA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COSPAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CAJAMARCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COSPAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ENCAÑADA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CAJAMARCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ENCAÑADA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JESUS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CAJAMARCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JESUS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LLACANORA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CAJAMARCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LLACANORA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LOS BAÑOS DEL INCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CAJAMARCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LOS BAÑOS DEL INCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MAGDALENA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CAJAMARCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MAGDALENA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MATARA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CAJAMARCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MATARA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'NAMORA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CAJAMARCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'NAMORA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JUAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CAJAMARCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JUAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CAJABAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CAJABAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CAJABAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CACHACHI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CAJABAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CACHACHI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CONDEBAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CAJABAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CONDEBAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SITACOCHA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CAJABAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SITACOCHA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CELENDIN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CELENDIN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CELENDIN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHUMUCH' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CELENDIN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHUMUCH');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CORTEGANA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CELENDIN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CORTEGANA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUASMIN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CELENDIN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUASMIN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JORGE CHAVEZ' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CELENDIN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JORGE CHAVEZ');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JOSE GALVEZ' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CELENDIN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JOSE GALVEZ');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MIGUEL IGLESIAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CELENDIN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MIGUEL IGLESIAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'OXAMARCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CELENDIN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'OXAMARCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SOROCHUCO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CELENDIN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SOROCHUCO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SUCRE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CELENDIN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SUCRE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'UTCO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CELENDIN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'UTCO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LA LIBERTAD DE PALLAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CELENDIN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LA LIBERTAD DE PALLAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHOTA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CHOTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHOTA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ANGUIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CHOTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ANGUIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHADIN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CHOTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHADIN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHIGUIRIP' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CHOTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHIGUIRIP');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHIMBAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CHOTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHIMBAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHOROPAMPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CHOTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHOROPAMPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COCHABAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CHOTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COCHABAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CONCHAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CHOTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CONCHAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUAMBOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CHOTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUAMBOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LAJAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CHOTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LAJAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LLAMA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CHOTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LLAMA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MIRACOSTA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CHOTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MIRACOSTA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PACCHA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CHOTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PACCHA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PION' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CHOTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PION');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'QUEROCOTO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CHOTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'QUEROCOTO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JUAN DE LICUPIS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CHOTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JUAN DE LICUPIS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TACABAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CHOTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TACABAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TOCMOCHE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CHOTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TOCMOCHE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHALAMARCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CHOTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHALAMARCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CONTUMAZA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CONTUMAZA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CONTUMAZA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHILETE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CONTUMAZA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHILETE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CUPISNIQUE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CONTUMAZA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CUPISNIQUE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'GUZMANGO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CONTUMAZA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'GUZMANGO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN BENITO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CONTUMAZA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN BENITO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA CRUZ DE TOLED' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CONTUMAZA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA CRUZ DE TOLED');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TANTARICA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CONTUMAZA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TANTARICA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YONAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CONTUMAZA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YONAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CUTERVO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CUTERVO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CUTERVO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CALLAYUC' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CUTERVO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CALLAYUC');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHOROS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CUTERVO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHOROS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CUJILLO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CUTERVO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CUJILLO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LA RAMADA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CUTERVO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LA RAMADA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PIMPINGOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CUTERVO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PIMPINGOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'QUEROCOTILLO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CUTERVO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'QUEROCOTILLO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN ANDRES DE CUTERVO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CUTERVO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN ANDRES DE CUTERVO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JUAN DE CUTERVO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CUTERVO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JUAN DE CUTERVO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN LUIS DE LUCMA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CUTERVO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN LUIS DE LUCMA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA CRUZ' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CUTERVO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA CRUZ');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTO DOMINGO DE LA CAPILLA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CUTERVO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTO DOMINGO DE LA CAPILLA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTO TOMAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CUTERVO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTO TOMAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SOCOTA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CUTERVO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SOCOTA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TORIBIO CASANOVA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'CUTERVO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TORIBIO CASANOVA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'BAMBAMARCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'HUALGAYOC' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'BAMBAMARCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHUGUR' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'HUALGAYOC' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHUGUR');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUALGAYOC' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'HUALGAYOC' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUALGAYOC');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JAEN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'JAEN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JAEN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'BELLAVISTA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'JAEN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'BELLAVISTA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHONTALI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'JAEN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHONTALI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COLASAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'JAEN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COLASAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUABAL' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'JAEN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUABAL');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LAS PIRIAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'JAEN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LAS PIRIAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'POMAHUACA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'JAEN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'POMAHUACA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PUCARA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'JAEN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PUCARA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SALLIQUE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'JAEN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SALLIQUE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN FELIPE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'JAEN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN FELIPE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JOSE DEL ALTO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'JAEN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JOSE DEL ALTO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA ROSA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'JAEN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA ROSA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN IGNACIO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'SAN IGNACIO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN IGNACIO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHIRINOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'SAN IGNACIO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHIRINOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUARANGO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'SAN IGNACIO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUARANGO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LA COIPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'SAN IGNACIO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LA COIPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'NAMBALLE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'SAN IGNACIO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'NAMBALLE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JOSE DE LOURDES' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'SAN IGNACIO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JOSE DE LOURDES');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TABACONAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'SAN IGNACIO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TABACONAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PEDRO GALVEZ' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'SAN MARCOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PEDRO GALVEZ');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHANCAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'SAN MARCOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHANCAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'EDUARDO VILLANUEVA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'SAN MARCOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'EDUARDO VILLANUEVA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'GREGORIO PITA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'SAN MARCOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'GREGORIO PITA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ICHOCAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'SAN MARCOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ICHOCAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JOSE MANUEL QUIROZ' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'SAN MARCOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JOSE MANUEL QUIROZ');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JOSE SABOGAL' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'SAN MARCOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JOSE SABOGAL');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN MIGUEL' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'SAN MIGUEL' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN MIGUEL');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'BOLIVAR' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'SAN MIGUEL' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'BOLIVAR');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CALQUIS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'SAN MIGUEL' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CALQUIS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CATILLUC' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'SAN MIGUEL' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CATILLUC');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'EL PRADO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'SAN MIGUEL' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'EL PRADO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LA FLORIDA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'SAN MIGUEL' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LA FLORIDA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LLAPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'SAN MIGUEL' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LLAPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'NANCHOC' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'SAN MIGUEL' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'NANCHOC');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'NIEPOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'SAN MIGUEL' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'NIEPOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN GREGORIO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'SAN MIGUEL' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN GREGORIO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN SILVESTRE DE COCHAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'SAN MIGUEL' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN SILVESTRE DE COCHAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TONGOD' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'SAN MIGUEL' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TONGOD');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'UNION AGUA BLANCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'SAN MIGUEL' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'UNION AGUA BLANCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN PABLO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'SAN PABLO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN PABLO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN BERNARDINO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'SAN PABLO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN BERNARDINO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN LUIS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'SAN PABLO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN LUIS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TUMBADEN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'SAN PABLO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TUMBADEN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA CRUZ' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'SANTA CRUZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA CRUZ');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ANDABAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'SANTA CRUZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ANDABAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CATACHE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'SANTA CRUZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CATACHE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHANCAYBAÑOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'SANTA CRUZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHANCAYBAÑOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LA ESPERANZA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'SANTA CRUZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LA ESPERANZA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'NINABAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'NINABAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'NINABAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PULAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'SANTA CRUZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PULAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAUCEPAMPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'SANTA CRUZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAUCEPAMPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SEXI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'SANTA CRUZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SEXI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'UTICYACU' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'SANTA CRUZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'UTICYACU');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YAUYUCAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CAJAMARCA' AND p.N_Provincia = 'SANTA CRUZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YAUYUCAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CALLAO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CALLAO' AND p.N_Provincia = 'CALLAO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CALLAO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'BELLAVISTA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CALLAO' AND p.N_Provincia = 'CALLAO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'BELLAVISTA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CARMEN DE LA LEGUA REYNOSO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CALLAO' AND p.N_Provincia = 'CALLAO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CARMEN DE LA LEGUA REYNOSO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LA PERLA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CALLAO' AND p.N_Provincia = 'CALLAO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LA PERLA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LA PUNTA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CALLAO' AND p.N_Provincia = 'CALLAO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LA PUNTA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'VENTANILLA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CALLAO' AND p.N_Provincia = 'CALLAO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'VENTANILLA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MI PERU' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CALLAO' AND p.N_Provincia = 'CALLAO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MI PERU');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CUSCO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'CUSCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CUSCO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CCORCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'CUSCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CCORCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'POROY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'CUSCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'POROY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JERONIMO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'CUSCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JERONIMO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN SEBASTIAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'CUSCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN SEBASTIAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTIAGO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'CUSCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTIAGO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAYLLA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'CUSCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAYLLA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'WANCHAQ' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'CUSCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'WANCHAQ');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ACOMAYO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'ACOMAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ACOMAYO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ACOPIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'ACOMAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ACOPIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ACOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'ACOMAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ACOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MOSOC LLACTA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'ACOMAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MOSOC LLACTA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'POMACANCHI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'ACOMAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'POMACANCHI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'RONDOCAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'ACOMAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'RONDOCAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANGARARA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'ACOMAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANGARARA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ANTA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'ANTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ANTA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ANCAHUASI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'ANTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ANCAHUASI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CACHIMAYO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'ANTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CACHIMAYO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHINCHAYPUJIO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'ANTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHINCHAYPUJIO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUAROCONDO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'ANTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUAROCONDO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LIMATAMBO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'ANTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LIMATAMBO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MOLLEPATA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'ANTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MOLLEPATA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PUCYURA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'ANTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PUCYURA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ZURITE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'ANTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ZURITE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CALCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'CALCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CALCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COYA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'CALCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COYA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LAMAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'CALCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LAMAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LARES' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'CALCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LARES');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PISAC' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'CALCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PISAC');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN SALVADOR' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'CALCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN SALVADOR');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TARAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'CALCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TARAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YANATILE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'CALCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YANATILE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YANAOCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'CANAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YANAOCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHECCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'CANAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHECCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'KUNTURKANKI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'CANAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'KUNTURKANKI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LANGUI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'CANAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LANGUI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LAYO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'CANAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LAYO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PAMPAMARCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'CANAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PAMPAMARCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'QUEHUE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'CANAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'QUEHUE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TUPAC AMARU' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'CANAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TUPAC AMARU');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SICUANI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'CANCHIS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SICUANI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHECACUPE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'CANCHIS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHECACUPE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COMBAPATA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'CANCHIS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COMBAPATA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MARANGANI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'CANCHIS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MARANGANI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PITUMARCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'CANCHIS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PITUMARCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN PABLO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'CANCHIS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN PABLO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN PEDRO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'CANCHIS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN PEDRO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TINTA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'CANCHIS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TINTA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTO TOMAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'CHUMBIVILCAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTO TOMAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CAPACMARCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'CHUMBIVILCAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CAPACMARCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHAMACA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'CHUMBIVILCAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHAMACA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COLQUEMARCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'CHUMBIVILCAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COLQUEMARCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LIVITACA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'CHUMBIVILCAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LIVITACA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LLUSCO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'CHUMBIVILCAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LLUSCO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'QUIÑOTA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'CHUMBIVILCAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'QUIÑOTA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'VELILLE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'CHUMBIVILCAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'VELILLE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ESPINAR' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'ESPINAR' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ESPINAR');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CONDOROMA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'ESPINAR' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CONDOROMA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COPORAQUE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'ESPINAR' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COPORAQUE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'OCORURO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'ESPINAR' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'OCORURO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PALLPATA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'ESPINAR' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PALLPATA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PICHIGUA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'ESPINAR' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PICHIGUA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SUYCKUTAMBO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'ESPINAR' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SUYCKUTAMBO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ALTO PICHIGUA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'ESPINAR' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ALTO PICHIGUA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA ANA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'LA CONVENCION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA ANA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ECHARATE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'LA CONVENCION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ECHARATE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUAYOPATA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'LA CONVENCION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUAYOPATA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MARANURA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'LA CONVENCION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MARANURA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'OCOBAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'LA CONVENCION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'OCOBAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'QUELLOUNO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'LA CONVENCION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'QUELLOUNO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'KIMBIRI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'LA CONVENCION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'KIMBIRI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA TERESA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'LA CONVENCION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA TERESA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'VILCABAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'LA CONVENCION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'VILCABAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PICHARI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'LA CONVENCION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PICHARI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'INKAWASI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'LA CONVENCION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'INKAWASI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'VILLA VIRGEN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'LA CONVENCION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'VILLA VIRGEN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'VILLA KINTIARINA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'LA CONVENCION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'VILLA KINTIARINA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MEGANTONI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'LA CONVENCION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MEGANTONI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'KUMPIRUSHIATO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'LA CONVENCION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'KUMPIRUSHIATO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CIELO PUNCO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'LA CONVENCION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CIELO PUNCO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MANITEA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'LA CONVENCION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MANITEA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'UNION ASHANINKA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'LA CONVENCION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'UNION ASHANINKA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PARURO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'PARURO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PARURO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ACCHA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'PARURO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ACCHA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CCAPI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'PARURO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CCAPI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COLCHA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'PARURO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COLCHA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUANOQUITE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'PARURO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUANOQUITE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'OMACHA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'PARURO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'OMACHA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PACCARITAMBO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'PARURO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PACCARITAMBO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PILLPINTO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'PARURO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PILLPINTO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YAURISQUE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'PARURO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YAURISQUE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PAUCARTAMBO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'PAUCARTAMBO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PAUCARTAMBO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CAICAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'PAUCARTAMBO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CAICAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHALLABAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'PAUCARTAMBO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHALLABAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COLQUEPATA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'PAUCARTAMBO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COLQUEPATA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUANCARANI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'PAUCARTAMBO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUANCARANI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'KOSÑIPATA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'PAUCARTAMBO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'KOSÑIPATA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'URCOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'QUISPICANCHI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'URCOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ANDAHUAYLILLAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'QUISPICANCHI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ANDAHUAYLILLAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CAMANTI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'QUISPICANCHI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CAMANTI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CCARHUAYO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'QUISPICANCHI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CCARHUAYO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CCATCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'QUISPICANCHI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CCATCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CUSIPATA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'QUISPICANCHI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CUSIPATA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUARO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'QUISPICANCHI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUARO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LUCRE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'QUISPICANCHI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LUCRE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MARCAPATA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'QUISPICANCHI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MARCAPATA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'OCONGATE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'QUISPICANCHI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'OCONGATE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'OROPESA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'QUISPICANCHI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'OROPESA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'QUIQUIJANA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'QUISPICANCHI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'QUIQUIJANA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'URUBAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'URUBAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'URUBAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHINCHERO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'URUBAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHINCHERO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUAYLLABAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'URUBAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUAYLLABAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MACHUPICCHU' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'URUBAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MACHUPICCHU');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MARAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'URUBAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MARAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'OLLANTAYTAMBO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'URUBAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'OLLANTAYTAMBO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YUCAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'CUSCO' AND p.N_Provincia = 'URUBAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YUCAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUANCAVELICA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'HUANCAVELICA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUANCAVELICA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ACOBAMBILLA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'HUANCAVELICA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ACOBAMBILLA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ACORIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'HUANCAVELICA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ACORIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CONAYCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'HUANCAVELICA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CONAYCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CUENCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'HUANCAVELICA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CUENCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUACHOCOLPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'HUANCAVELICA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUACHOCOLPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUAYLLAHUARA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'HUANCAVELICA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUAYLLAHUARA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'IZCUCHACA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'HUANCAVELICA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'IZCUCHACA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LARIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'HUANCAVELICA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LARIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MANTA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'HUANCAVELICA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MANTA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MARISCAL CACERES' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'HUANCAVELICA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MARISCAL CACERES');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MOYA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'HUANCAVELICA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MOYA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'NUEVO OCCORO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'HUANCAVELICA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'NUEVO OCCORO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PALCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'HUANCAVELICA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PALCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PILCHACA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'HUANCAVELICA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PILCHACA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'VILCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'HUANCAVELICA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'VILCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YAULI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'HUANCAVELICA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YAULI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ASCENSION' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'HUANCAVELICA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ASCENSION');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUANDO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'HUANCAVELICA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUANDO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ACOBAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'ACOBAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ACOBAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ANDABAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'ACOBAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ANDABAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ANTA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'ACOBAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ANTA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CAJA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'ACOBAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CAJA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MARCAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'ACOBAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MARCAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PAUCARA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'ACOBAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PAUCARA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'POMACOCHA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'ACOBAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'POMACOCHA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ROSARIO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'ACOBAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ROSARIO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LIRCAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'ANGARAES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LIRCAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ANCHONGA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'ANGARAES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ANCHONGA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CALLANMARCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'ANGARAES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CALLANMARCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CCOCHACCASA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'ANGARAES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CCOCHACCASA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHINCHO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'ANGARAES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHINCHO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CONGALLA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'ANGARAES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CONGALLA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUANCA-HUANCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'ANGARAES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUANCA-HUANCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUAYLLAY GRANDE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'ANGARAES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUAYLLAY GRANDE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JULCAMARCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'ANGARAES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JULCAMARCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN ANTONIO DE ANTAPARCO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'ANGARAES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN ANTONIO DE ANTAPARCO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTO TOMAS DE PATA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'ANGARAES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTO TOMAS DE PATA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SECCLLA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'ANGARAES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SECCLLA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CASTROVIRREYNA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'CASTROVIRREYNA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CASTROVIRREYNA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ARMA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'CASTROVIRREYNA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ARMA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'AURAHUA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'CASTROVIRREYNA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'AURAHUA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CAPILLAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'CASTROVIRREYNA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CAPILLAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHUPAMARCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'CASTROVIRREYNA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHUPAMARCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COCAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'CASTROVIRREYNA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COCAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUACHOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'CASTROVIRREYNA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUACHOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUAMATAMBO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'CASTROVIRREYNA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUAMATAMBO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MOLLEPAMPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'CASTROVIRREYNA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MOLLEPAMPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JUAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'CASTROVIRREYNA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JUAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA ANA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'CASTROVIRREYNA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA ANA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TANTARA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'CASTROVIRREYNA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TANTARA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TICRAPO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'CASTROVIRREYNA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TICRAPO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHURCAMPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'CHURCAMPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHURCAMPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ANCO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'CHURCAMPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ANCO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHINCHIHUASI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'CHURCAMPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHINCHIHUASI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'EL CARMEN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'CHURCAMPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'EL CARMEN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LA MERCED' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'CHURCAMPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LA MERCED');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LOCROJA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'CHURCAMPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LOCROJA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PAUCARBAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'CHURCAMPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PAUCARBAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN MIGUEL DE MAYOCC' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'CHURCAMPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN MIGUEL DE MAYOCC');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN PEDRO DE CORIS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'CHURCAMPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN PEDRO DE CORIS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PACHAMARCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'CHURCAMPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PACHAMARCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COSME' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'CHURCAMPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COSME');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUAYTARA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'HUAYTARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUAYTARA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'AYAVI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'HUAYTARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'AYAVI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CORDOVA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'HUAYTARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CORDOVA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUAYACUNDO ARMA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'HUAYTARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUAYACUNDO ARMA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LARAMARCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'HUAYTARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LARAMARCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'OCOYO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'HUAYTARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'OCOYO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PILPICHACA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'HUAYTARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PILPICHACA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'QUERCO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'HUAYTARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'QUERCO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'QUITO-ARMA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'HUAYTARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'QUITO-ARMA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN ANTONIO DE CUSICANCHA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'HUAYTARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN ANTONIO DE CUSICANCHA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN FRANCISCO DE SANGAYAICO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'HUAYTARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN FRANCISCO DE SANGAYAICO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN ISIDRO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'HUAYTARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN ISIDRO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTIAGO DE CHOCORVOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'HUAYTARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTIAGO DE CHOCORVOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTIAGO DE QUIRAHUARA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'HUAYTARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTIAGO DE QUIRAHUARA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTO DOMINGO DE CAPILLAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'HUAYTARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTO DOMINGO DE CAPILLAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TAMBO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'HUAYTARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TAMBO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PAMPAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'TAYACAJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PAMPAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ACOSTAMBO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'TAYACAJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ACOSTAMBO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ACRAQUIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'TAYACAJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ACRAQUIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'AHUAYCHA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'TAYACAJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'AHUAYCHA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COLCABAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'TAYACAJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COLCABAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'DANIEL HERNANDEZ' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'TAYACAJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'DANIEL HERNANDEZ');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUACHOCOLPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'TAYACAJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUACHOCOLPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUARIBAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'TAYACAJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUARIBAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ÑAHUIMPUQUIO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'TAYACAJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ÑAHUIMPUQUIO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PAZOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'TAYACAJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PAZOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'QUISHUAR' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'TAYACAJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'QUISHUAR');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SALCABAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'TAYACAJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SALCABAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SALCAHUASI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'TAYACAJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SALCAHUASI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN MARCOS DE ROCCHAC' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'TAYACAJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN MARCOS DE ROCCHAC');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SURCUBAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'TAYACAJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SURCUBAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TINTAY PUNCU' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'TAYACAJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TINTAY PUNCU');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'QUICHUAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'TAYACAJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'QUICHUAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ANDAYMARCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'TAYACAJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ANDAYMARCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ROBLE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'TAYACAJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ROBLE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PICHOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'TAYACAJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PICHOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTIAGO DE TUCUMA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'TAYACAJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTIAGO DE TUCUMA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LAMBRAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'TAYACAJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LAMBRAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COCHABAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANCAVELICA' AND p.N_Provincia = 'TAYACAJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COCHABAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUANUCO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'HUANUCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUANUCO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'AMARILIS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'HUANUCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'AMARILIS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHINCHAO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'HUANUCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHINCHAO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHURUBAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'HUANUCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHURUBAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MARGOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'HUANUCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MARGOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'QUISQUI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'HUANUCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'QUISQUI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN FRANCISCO DE CAYRAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'HUANUCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN FRANCISCO DE CAYRAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN PEDRO DE CHAULAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'HUANUCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN PEDRO DE CHAULAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA MARIA DEL VALLE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'HUANUCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA MARIA DEL VALLE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YARUMAYO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'HUANUCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YARUMAYO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PILLCO MARCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'HUANUCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PILLCO MARCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YACUS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'HUANUCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YACUS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN PABLO DE PILLAO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'HUANUCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN PABLO DE PILLAO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'AMBO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'AMBO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'AMBO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CAYNA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'AMBO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CAYNA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COLPAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'AMBO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COLPAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CONCHAMARCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'AMBO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CONCHAMARCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUACAR' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'AMBO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUACAR');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN FRANCISCO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'AMBO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN FRANCISCO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN RAFAEL' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'AMBO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN RAFAEL');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TOMAY KICHWA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'AMBO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TOMAY KICHWA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LA UNION' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'DOS DE MAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LA UNION');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHUQUIS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'DOS DE MAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHUQUIS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MARIAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'DOS DE MAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MARIAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PACHAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'DOS DE MAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PACHAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'QUIVILLA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'DOS DE MAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'QUIVILLA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'RIPAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'DOS DE MAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'RIPAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SHUNQUI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'DOS DE MAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SHUNQUI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SILLAPATA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'DOS DE MAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SILLAPATA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YANAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'DOS DE MAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YANAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUACAYBAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'HUACAYBAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUACAYBAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CANCHABAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'HUACAYBAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CANCHABAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COCHABAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'HUACAYBAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COCHABAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PINRA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'HUACAYBAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PINRA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LLATA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'HUAMALIES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LLATA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ARANCAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'HUAMALIES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ARANCAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHAVIN DE PARIARCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'HUAMALIES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHAVIN DE PARIARCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JACAS GRANDE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'HUAMALIES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JACAS GRANDE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JIRCAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'HUAMALIES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JIRCAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MIRAFLORES' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'HUAMALIES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MIRAFLORES');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MONZON' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'HUAMALIES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MONZON');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PUNCHAO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'HUAMALIES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PUNCHAO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PUÑOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'HUAMALIES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PUÑOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SINGA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'HUAMALIES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SINGA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TANTAMAYO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'HUAMALIES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TANTAMAYO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'RUPA-RUPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'LEONCIO PRADO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'RUPA-RUPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'DANIEL ALOMIA ROBLES' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'LEONCIO PRADO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'DANIEL ALOMIA ROBLES');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HERMILIO VALDIZAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'LEONCIO PRADO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HERMILIO VALDIZAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JOSE CRESPO Y CASTILLO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'LEONCIO PRADO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JOSE CRESPO Y CASTILLO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LUYANDO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'LEONCIO PRADO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LUYANDO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MARIANO DAMASO BERAUN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'LEONCIO PRADO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MARIANO DAMASO BERAUN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PUCAYACU' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'LEONCIO PRADO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PUCAYACU');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CASTILLO GRANDE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'LEONCIO PRADO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CASTILLO GRANDE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PUEBLO NUEVO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'LEONCIO PRADO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PUEBLO NUEVO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTO DOMINGO DE ANDA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'LEONCIO PRADO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTO DOMINGO DE ANDA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUACRACHUCO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'MARAÑON' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUACRACHUCO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHOLON' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'MARAÑON' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHOLON');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN BUENAVENTURA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'MARAÑON' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN BUENAVENTURA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LA MORADA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'MARAÑON' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LA MORADA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA ROSA DE ALTO YANAJANCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'MARAÑON' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA ROSA DE ALTO YANAJANCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PANAO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'PACHITEA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PANAO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHAGLLA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'PACHITEA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHAGLLA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MOLINO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'PACHITEA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MOLINO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'UMARI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'PACHITEA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'UMARI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PUERTO INCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'PUERTO INCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PUERTO INCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CODO DEL POZUZO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'PUERTO INCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CODO DEL POZUZO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HONORIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'PUERTO INCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HONORIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TOURNAVISTA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'PUERTO INCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TOURNAVISTA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YUYAPICHIS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'PUERTO INCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YUYAPICHIS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JESUS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'LAURICOCHA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JESUS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'BAÑOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'LAURICOCHA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'BAÑOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JIVIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'LAURICOCHA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JIVIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'QUEROPALCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'LAURICOCHA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'QUEROPALCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'RONDOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'LAURICOCHA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'RONDOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN FRANCISCO DE ASIS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'LAURICOCHA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN FRANCISCO DE ASIS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN MIGUEL DE CAURI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'LAURICOCHA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN MIGUEL DE CAURI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHAVINILLO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'YAROWILCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHAVINILLO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CAHUAC' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'YAROWILCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CAHUAC');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHACABAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'YAROWILCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHACABAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'APARICIO POMARES' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'YAROWILCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'APARICIO POMARES');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JACAS CHICO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'YAROWILCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JACAS CHICO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'OBAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'YAROWILCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'OBAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PAMPAMARCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'YAROWILCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PAMPAMARCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHORAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'HUANUCO' AND p.N_Provincia = 'YAROWILCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHORAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ICA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'ICA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ICA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LA TINGUIÑA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'ICA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LA TINGUIÑA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LOS AQUIJES' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'ICA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LOS AQUIJES');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'OCUCAJE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'ICA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'OCUCAJE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PACHACUTEC' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'ICA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PACHACUTEC');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PARCONA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'ICA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PARCONA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PUEBLO NUEVO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'ICA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PUEBLO NUEVO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SALAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'ICA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SALAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JOSE DE LOS MOLINOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'ICA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JOSE DE LOS MOLINOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JUAN BAUTISTA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'ICA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JUAN BAUTISTA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTIAGO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'ICA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTIAGO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SUBTANJALLA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'ICA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SUBTANJALLA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TATE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'ICA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TATE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YAUCA DEL ROSARIO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'ICA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YAUCA DEL ROSARIO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHINCHA ALTA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'CHINCHA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHINCHA ALTA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ALTO LARAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'CHINCHA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ALTO LARAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHAVIN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'CHINCHA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHAVIN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHINCHA BAJA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'CHINCHA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHINCHA BAJA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'EL CARMEN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'CHINCHA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'EL CARMEN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'GROCIO PRADO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'CHINCHA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'GROCIO PRADO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PUEBLO NUEVO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'CHINCHA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PUEBLO NUEVO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JUAN DE YANAC' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'CHINCHA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JUAN DE YANAC');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN PEDRO DE HUACARPANA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'CHINCHA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN PEDRO DE HUACARPANA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SUNAMPE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'CHINCHA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SUNAMPE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TAMBO DE MORA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'CHINCHA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TAMBO DE MORA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'NASCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'NASCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'NASCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHANGUILLO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'NASCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHANGUILLO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'EL INGENIO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'NASCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'EL INGENIO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MARCONA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'NASCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MARCONA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'VISTA ALEGRE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'NASCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'VISTA ALEGRE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PALPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'PALPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PALPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LLIPATA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'PALPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LLIPATA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'RIO GRANDE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'PALPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'RIO GRANDE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA CRUZ' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'PALPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA CRUZ');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TIBILLO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'PALPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TIBILLO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PISCO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'PISCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PISCO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUANCANO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'PISCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUANCANO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUMAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'PISCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUMAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'INDEPENDENCIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'PISCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'INDEPENDENCIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PARACAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'PISCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PARACAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN ANDRES' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'PISCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN ANDRES');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN CLEMENTE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'PISCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN CLEMENTE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TUPAC AMARU INCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'ICA' AND p.N_Provincia = 'PISCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TUPAC AMARU INCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUANCAYO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'HUANCAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUANCAYO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CARHUACALLANGA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'HUANCAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CARHUACALLANGA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHACAPAMPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'HUANCAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHACAPAMPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHICCHE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'HUANCAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHICCHE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHILCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'HUANCAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHILCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHONGOS ALTO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'HUANCAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHONGOS ALTO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHUPURO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'HUANCAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHUPURO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COLCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'HUANCAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COLCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CULLHUAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'HUANCAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CULLHUAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'EL TAMBO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'HUANCAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'EL TAMBO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUACRAPUQUIO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'HUANCAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUACRAPUQUIO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUALHUAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'HUANCAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUALHUAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUANCAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'HUANCAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUANCAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUASICANCHA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'HUANCAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUASICANCHA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUAYUCACHI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'HUANCAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUAYUCACHI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'INGENIO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'HUANCAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'INGENIO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PARIAHUANCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'HUANCAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PARIAHUANCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PILCOMAYO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'HUANCAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PILCOMAYO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PUCARA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'HUANCAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PUCARA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'QUICHUAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'HUANCAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'QUICHUAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'QUILCAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'HUANCAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'QUILCAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN AGUSTIN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'HUANCAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN AGUSTIN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JERONIMO DE TUNAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'HUANCAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JERONIMO DE TUNAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAÑO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'HUANCAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAÑO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAPALLANGA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'HUANCAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAPALLANGA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SICAYA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'HUANCAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SICAYA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTO DOMINGO DE ACOBAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'HUANCAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTO DOMINGO DE ACOBAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'VIQUES' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'HUANCAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'VIQUES');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CONCEPCION' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'CONCEPCION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CONCEPCION');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ACO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'CONCEPCION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ACO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ANDAMARCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'CONCEPCION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ANDAMARCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHAMBARA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'CONCEPCION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHAMBARA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COCHAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'CONCEPCION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COCHAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COMAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'CONCEPCION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COMAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HEROINAS TOLEDO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'CONCEPCION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HEROINAS TOLEDO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MANZANARES' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'CONCEPCION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MANZANARES');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MARISCAL CASTILLA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'CONCEPCION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MARISCAL CASTILLA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MATAHUASI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'CONCEPCION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MATAHUASI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MITO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'CONCEPCION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MITO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'NUEVE DE JULIO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'CONCEPCION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'NUEVE DE JULIO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ORCOTUNA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'CONCEPCION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ORCOTUNA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JOSE DE QUERO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'CONCEPCION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JOSE DE QUERO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA ROSA DE OCOPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'CONCEPCION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA ROSA DE OCOPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHANCHAMAYO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'CHANCHAMAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHANCHAMAYO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PERENE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'CHANCHAMAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PERENE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PICHANAQUI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'CHANCHAMAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PICHANAQUI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN LUIS DE SHUARO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'CHANCHAMAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN LUIS DE SHUARO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN RAMON' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'CHANCHAMAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN RAMON');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'VITOC' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'CHANCHAMAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'VITOC');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JAUJA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'JAUJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JAUJA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ACOLLA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'JAUJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ACOLLA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'APATA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'JAUJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'APATA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ATAURA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'JAUJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ATAURA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CANCHAYLLO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'JAUJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CANCHAYLLO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CURICACA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'JAUJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CURICACA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'EL MANTARO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'JAUJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'EL MANTARO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUAMALI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'JAUJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUAMALI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUARIPAMPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'JAUJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUARIPAMPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUERTAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'JAUJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUERTAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JANJAILLO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'JAUJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JANJAILLO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JULCAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'JAUJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JULCAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LEONOR ORDOÑEZ' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'JAUJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LEONOR ORDOÑEZ');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LLOCLLAPAMPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'JAUJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LLOCLLAPAMPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MARCO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'JAUJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MARCO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MASMA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'JAUJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MASMA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MASMA CHICCHE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'JAUJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MASMA CHICCHE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MOLINOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'JAUJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MOLINOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MONOBAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'JAUJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MONOBAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MUQUI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'JAUJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MUQUI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MUQUIYAUYO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'JAUJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MUQUIYAUYO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PACA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'JAUJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PACA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PACCHA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'JAUJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PACCHA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PANCAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'JAUJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PANCAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PARCO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'JAUJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PARCO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'POMACANCHA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'JAUJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'POMACANCHA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'RICRAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'JAUJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'RICRAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN LORENZO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'JAUJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN LORENZO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN PEDRO DE CHUNAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'JAUJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN PEDRO DE CHUNAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAUSA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'JAUJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAUSA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SINCOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'JAUJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SINCOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TUNAN MARCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'JAUJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TUNAN MARCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YAULI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'JAUJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YAULI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YAUYOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'JAUJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YAUYOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JUNIN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'JUNIN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JUNIN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CARHUAMAYO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'JUNIN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CARHUAMAYO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ONDORES' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'JUNIN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ONDORES');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ULCUMAYO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'JUNIN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ULCUMAYO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SATIPO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'SATIPO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SATIPO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COVIRIALI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'SATIPO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COVIRIALI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LLAYLLA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'SATIPO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LLAYLLA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MAZAMARI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'SATIPO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MAZAMARI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PAMPA HERMOSA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'SATIPO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PAMPA HERMOSA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PANGOA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'SATIPO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PANGOA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'RIO NEGRO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'SATIPO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'RIO NEGRO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'RIO TAMBO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'SATIPO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'RIO TAMBO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'VIZCATAN DEL ENE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'SATIPO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'VIZCATAN DEL ENE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TARMA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'TARMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TARMA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ACOBAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'TARMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ACOBAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUARICOLCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'TARMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUARICOLCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUASAHUASI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'TARMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUASAHUASI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LA UNION' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'TARMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LA UNION');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PALCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'TARMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PALCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PALCAMAYO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'TARMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PALCAMAYO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN PEDRO DE CAJAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'TARMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN PEDRO DE CAJAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TAPO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'TARMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TAPO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LA OROYA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'YAULI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LA OROYA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHACAPALPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'YAULI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHACAPALPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUAY-HUAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'YAULI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUAY-HUAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MARCAPOMACOCHA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'YAULI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MARCAPOMACOCHA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MOROCOCHA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'YAULI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MOROCOCHA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PACCHA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'YAULI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PACCHA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA BARBARA DE CARHUACAYAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'YAULI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA BARBARA DE CARHUACAYAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA ROSA DE SACCO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'YAULI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA ROSA DE SACCO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SUITUCANCHA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'YAULI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SUITUCANCHA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YAULI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'YAULI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YAULI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHUPACA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'CHUPACA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHUPACA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'AHUAC' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'CHUPACA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'AHUAC');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHONGOS BAJO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'CHUPACA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHONGOS BAJO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUACHAC' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'CHUPACA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUACHAC');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUAMANCACA CHICO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'CHUPACA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUAMANCACA CHICO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JUAN DE ISCOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'CHUPACA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JUAN DE ISCOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JUAN DE JARPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'CHUPACA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JUAN DE JARPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TRES DE DICIEMBRE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'CHUPACA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TRES DE DICIEMBRE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YANACANCHA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'JUNIN' AND p.N_Provincia = 'CHUPACA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YANACANCHA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TRUJILLO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'TRUJILLO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TRUJILLO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'EL PORVENIR' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'TRUJILLO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'EL PORVENIR');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'FLORENCIA DE MORA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'TRUJILLO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'FLORENCIA DE MORA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUANCHACO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'TRUJILLO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUANCHACO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LA ESPERANZA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'TRUJILLO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LA ESPERANZA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LAREDO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'TRUJILLO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LAREDO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MOCHE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'TRUJILLO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MOCHE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'POROTO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'TRUJILLO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'POROTO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SALAVERRY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'TRUJILLO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SALAVERRY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SIMBAL' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'TRUJILLO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SIMBAL');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'VICTOR LARCO HERRERA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'TRUJILLO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'VICTOR LARCO HERRERA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ALTO TRUJILLO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'TRUJILLO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ALTO TRUJILLO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ASCOPE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'ASCOPE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ASCOPE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHICAMA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'ASCOPE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHICAMA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHOCOPE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'ASCOPE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHOCOPE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MAGDALENA DE CAO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'ASCOPE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MAGDALENA DE CAO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PAIJAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'ASCOPE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PAIJAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'RAZURI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'ASCOPE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'RAZURI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTIAGO DE CAO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'ASCOPE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTIAGO DE CAO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CASA GRANDE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'ASCOPE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CASA GRANDE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'BOLIVAR' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'BOLIVAR' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'BOLIVAR');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'BAMBAMARCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'BOLIVAR' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'BAMBAMARCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CONDORMARCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'BOLIVAR' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CONDORMARCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LONGOTEA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'BOLIVAR' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LONGOTEA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'UCHUMARCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'BOLIVAR' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'UCHUMARCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'UCUNCHA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'BOLIVAR' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'UCUNCHA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHEPEN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'CHEPEN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHEPEN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PACANGA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'CHEPEN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PACANGA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PUEBLO NUEVO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'CHEPEN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PUEBLO NUEVO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JULCAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'JULCAN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JULCAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CALAMARCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'JULCAN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CALAMARCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CARABAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'JULCAN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CARABAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUASO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'JULCAN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUASO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'OTUZCO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'OTUZCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'OTUZCO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'AGALLPAMPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'OTUZCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'AGALLPAMPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHARAT' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'OTUZCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHARAT');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUARANCHAL' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'OTUZCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUARANCHAL');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LA CUESTA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'OTUZCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LA CUESTA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MACHE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'OTUZCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MACHE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PARANDAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'OTUZCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PARANDAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SALPO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'OTUZCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SALPO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SINSICAP' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'OTUZCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SINSICAP');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'USQUIL' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'OTUZCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'USQUIL');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN PEDRO DE LLOC' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'PACASMAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN PEDRO DE LLOC');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'GUADALUPE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'PACASMAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'GUADALUPE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JEQUETEPEQUE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'PACASMAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JEQUETEPEQUE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PACASMAYO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'PACASMAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PACASMAYO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JOSE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'PACASMAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JOSE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TAYABAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'PATAZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TAYABAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'BULDIBUYO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'PATAZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'BULDIBUYO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHILLIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'PATAZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHILLIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUANCASPATA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'PATAZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUANCASPATA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUAYLILLAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'PATAZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUAYLILLAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUAYO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'PATAZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUAYO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ONGON' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'PATAZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ONGON');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PARCOY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'PATAZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PARCOY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PATAZ' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'PATAZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PATAZ');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PIAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'PATAZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PIAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTIAGO DE CHALLAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'PATAZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTIAGO DE CHALLAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TAURIJA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'PATAZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TAURIJA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'URPAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'PATAZ' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'URPAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUAMACHUCO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'SANCHEZ CARRION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUAMACHUCO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHUGAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'SANCHEZ CARRION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHUGAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COCHORCO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'SANCHEZ CARRION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COCHORCO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CURGOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'SANCHEZ CARRION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CURGOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MARCABAL' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'SANCHEZ CARRION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MARCABAL');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANAGORAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'SANCHEZ CARRION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANAGORAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SARIN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'SANCHEZ CARRION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SARIN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SARTIMBAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'SANCHEZ CARRION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SARTIMBAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTIAGO DE CHUCO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'SANTIAGO DE CHUCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTIAGO DE CHUCO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ANGASMARCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'SANTIAGO DE CHUCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ANGASMARCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CACHICADAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'SANTIAGO DE CHUCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CACHICADAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MOLLEBAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'SANTIAGO DE CHUCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MOLLEBAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MOLLEPATA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'SANTIAGO DE CHUCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MOLLEPATA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'QUIRUVILCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'SANTIAGO DE CHUCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'QUIRUVILCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA CRUZ DE CHUCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'SANTIAGO DE CHUCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA CRUZ DE CHUCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SITABAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'SANTIAGO DE CHUCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SITABAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CASCAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'GRAN CHIMU' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CASCAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LUCMA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'GRAN CHIMU' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LUCMA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MARMOT' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'GRAN CHIMU' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MARMOT');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAYAPULLO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'GRAN CHIMU' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAYAPULLO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'VIRU' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'VIRU' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'VIRU');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHAO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'VIRU' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHAO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'GUADALUPITO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LA LIBERTAD' AND p.N_Provincia = 'VIRU' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'GUADALUPITO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHICLAYO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LAMBAYEQUE' AND p.N_Provincia = 'CHICLAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHICLAYO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHONGOYAPE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LAMBAYEQUE' AND p.N_Provincia = 'CHICLAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHONGOYAPE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ETEN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LAMBAYEQUE' AND p.N_Provincia = 'CHICLAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ETEN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ETEN PUERTO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LAMBAYEQUE' AND p.N_Provincia = 'CHICLAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ETEN PUERTO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JOSE LEONARDO ORTIZ' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LAMBAYEQUE' AND p.N_Provincia = 'CHICLAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JOSE LEONARDO ORTIZ');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LA VICTORIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LAMBAYEQUE' AND p.N_Provincia = 'CHICLAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LA VICTORIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LAGUNAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LAMBAYEQUE' AND p.N_Provincia = 'CHICLAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LAGUNAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MONSEFU' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LAMBAYEQUE' AND p.N_Provincia = 'CHICLAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MONSEFU');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'NUEVA ARICA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LAMBAYEQUE' AND p.N_Provincia = 'CHICLAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'NUEVA ARICA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'OYOTUN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LAMBAYEQUE' AND p.N_Provincia = 'CHICLAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'OYOTUN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PICSI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LAMBAYEQUE' AND p.N_Provincia = 'CHICLAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PICSI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PIMENTEL' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LAMBAYEQUE' AND p.N_Provincia = 'CHICLAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PIMENTEL');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'REQUE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LAMBAYEQUE' AND p.N_Provincia = 'CHICLAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'REQUE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA ROSA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LAMBAYEQUE' AND p.N_Provincia = 'CHICLAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA ROSA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAÑA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LAMBAYEQUE' AND p.N_Provincia = 'CHICLAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAÑA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CAYALTI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LAMBAYEQUE' AND p.N_Provincia = 'CHICLAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CAYALTI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PATAPO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LAMBAYEQUE' AND p.N_Provincia = 'CHICLAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PATAPO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'POMALCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LAMBAYEQUE' AND p.N_Provincia = 'CHICLAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'POMALCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PUCALA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LAMBAYEQUE' AND p.N_Provincia = 'CHICLAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PUCALA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TUMAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LAMBAYEQUE' AND p.N_Provincia = 'CHICLAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TUMAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'FERREÑAFE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LAMBAYEQUE' AND p.N_Provincia = 'FERREÑAFE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'FERREÑAFE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CAÑARIS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LAMBAYEQUE' AND p.N_Provincia = 'FERREÑAFE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CAÑARIS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'INCAHUASI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LAMBAYEQUE' AND p.N_Provincia = 'FERREÑAFE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'INCAHUASI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MANUEL ANTONIO MESONES MURO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LAMBAYEQUE' AND p.N_Provincia = 'FERREÑAFE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MANUEL ANTONIO MESONES MURO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PITIPO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LAMBAYEQUE' AND p.N_Provincia = 'FERREÑAFE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PITIPO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PUEBLO NUEVO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LAMBAYEQUE' AND p.N_Provincia = 'FERREÑAFE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PUEBLO NUEVO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LAMBAYEQUE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LAMBAYEQUE' AND p.N_Provincia = 'LAMBAYEQUE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LAMBAYEQUE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHOCHOPE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LAMBAYEQUE' AND p.N_Provincia = 'LAMBAYEQUE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHOCHOPE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ILLIMO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LAMBAYEQUE' AND p.N_Provincia = 'LAMBAYEQUE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ILLIMO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JAYANCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LAMBAYEQUE' AND p.N_Provincia = 'LAMBAYEQUE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JAYANCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MOCHUMI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LAMBAYEQUE' AND p.N_Provincia = 'LAMBAYEQUE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MOCHUMI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MORROPE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LAMBAYEQUE' AND p.N_Provincia = 'LAMBAYEQUE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MORROPE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MOTUPE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LAMBAYEQUE' AND p.N_Provincia = 'LAMBAYEQUE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MOTUPE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'OLMOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LAMBAYEQUE' AND p.N_Provincia = 'LAMBAYEQUE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'OLMOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PACORA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LAMBAYEQUE' AND p.N_Provincia = 'LAMBAYEQUE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PACORA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SALAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LAMBAYEQUE' AND p.N_Provincia = 'LAMBAYEQUE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SALAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JOSE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LAMBAYEQUE' AND p.N_Provincia = 'LAMBAYEQUE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JOSE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TUCUME' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LAMBAYEQUE' AND p.N_Provincia = 'LAMBAYEQUE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TUCUME');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LIMA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LIMA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ANCON' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ANCON');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ATE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ATE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'BARRANCO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'BARRANCO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'BREÑA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'BREÑA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CARABAYLLO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CARABAYLLO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHACLACAYO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHACLACAYO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHORRILLOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHORRILLOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CIENEGUILLA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CIENEGUILLA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COMAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COMAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'EL AGUSTINO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'EL AGUSTINO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'INDEPENDENCIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'INDEPENDENCIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JESUS MARIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JESUS MARIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LA MOLINA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LA MOLINA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LA VICTORIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LA VICTORIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LINCE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LINCE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LOS OLIVOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LOS OLIVOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LURIGANCHO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LURIGANCHO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LURIN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LURIN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MAGDALENA DEL MAR' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MAGDALENA DEL MAR');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PUEBLO LIBRE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PUEBLO LIBRE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MIRAFLORES' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MIRAFLORES');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PACHACAMAC' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PACHACAMAC');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PUCUSANA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PUCUSANA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PUENTE PIEDRA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PUENTE PIEDRA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PUNTA HERMOSA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PUNTA HERMOSA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PUNTA NEGRA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PUNTA NEGRA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'RIMAC' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'RIMAC');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN BARTOLO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN BARTOLO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN BORJA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN BORJA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN ISIDRO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN ISIDRO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JUAN DE LURIGANCHO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JUAN DE LURIGANCHO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JUAN DE MIRAFLORES' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JUAN DE MIRAFLORES');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN LUIS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN LUIS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN MARTIN DE PORRES' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN MARTIN DE PORRES');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN MIGUEL' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN MIGUEL');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA ANITA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA ANITA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA MARIA DEL MAR' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA MARIA DEL MAR');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA ROSA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA ROSA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTIAGO DE SURCO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTIAGO DE SURCO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SURQUILLO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SURQUILLO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'VILLA EL SALVADOR' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'VILLA EL SALVADOR');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'VILLA MARIA DEL TRIUNFO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'LIMA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'VILLA MARIA DEL TRIUNFO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'BARRANCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'BARRANCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'BARRANCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PARAMONGA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'BARRANCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PARAMONGA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PATIVILCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'BARRANCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PATIVILCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SUPE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'BARRANCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SUPE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SUPE PUERTO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'BARRANCA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SUPE PUERTO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CAJATAMBO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'CAJATAMBO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CAJATAMBO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'CAJATAMBO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'GORGOR' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'CAJATAMBO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'GORGOR');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUANCAPON' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'CAJATAMBO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUANCAPON');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MANAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'CAJATAMBO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MANAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CANTA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'CANTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CANTA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ARAHUAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'CANTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ARAHUAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUAMANTANGA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'CANTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUAMANTANGA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUAROS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'CANTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUAROS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LACHAQUI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'CANTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LACHAQUI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN BUENAVENTURA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'CANTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN BUENAVENTURA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA ROSA DE QUIVES' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'CANTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA ROSA DE QUIVES');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN VICENTE DE CAÑETE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'CAÑETE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN VICENTE DE CAÑETE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ASIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'CAÑETE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ASIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CALANGO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'CAÑETE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CALANGO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CERRO AZUL' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'CAÑETE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CERRO AZUL');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHILCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'CAÑETE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHILCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COAYLLO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'CAÑETE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COAYLLO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'IMPERIAL' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'CAÑETE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'IMPERIAL');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LUNAHUANA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'CAÑETE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LUNAHUANA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MALA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'CAÑETE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MALA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'NUEVO IMPERIAL' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'CAÑETE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'NUEVO IMPERIAL');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PACARAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'CAÑETE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PACARAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'QUILMANA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'CAÑETE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'QUILMANA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN ANTONIO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'CAÑETE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN ANTONIO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN LUIS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'CAÑETE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN LUIS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA CRUZ DE FLORES' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'CAÑETE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA CRUZ DE FLORES');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ZUÑIGA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'CAÑETE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ZUÑIGA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUARAL' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUARAL' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUARAL');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ATAVILLOS ALTO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUARAL' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ATAVILLOS ALTO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ATAVILLOS BAJO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUARAL' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ATAVILLOS BAJO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'AUCALLAMA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUARAL' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'AUCALLAMA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHANCAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUARAL' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHANCAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'IHUARI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUARAL' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'IHUARI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LAMPIAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUARAL' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LAMPIAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PACARAOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUARAL' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PACARAOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN MIGUEL DE ACOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUARAL' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN MIGUEL DE ACOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA CRUZ DE ANDAMARCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUARAL' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA CRUZ DE ANDAMARCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SUMBILCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUARAL' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SUMBILCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'VEINTISIETE DE NOVIEMBRE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUARAL' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'VEINTISIETE DE NOVIEMBRE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MATUCANA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAROCHIRI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MATUCANA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ANTIOQUIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAROCHIRI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ANTIOQUIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CALLAHUANCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAROCHIRI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CALLAHUANCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CARAMPOMA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAROCHIRI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CARAMPOMA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHICLA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAROCHIRI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHICLA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CUENCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAROCHIRI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CUENCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUACHUPAMPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAROCHIRI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUACHUPAMPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUANZA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAROCHIRI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUANZA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUAROCHIRI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAROCHIRI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUAROCHIRI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LAHUAYTAMBO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAROCHIRI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LAHUAYTAMBO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LANGA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAROCHIRI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LANGA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN PEDRO DE LARAOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAROCHIRI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN PEDRO DE LARAOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MARIATANA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAROCHIRI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MARIATANA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'RICARDO PALMA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAROCHIRI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'RICARDO PALMA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN ANDRES DE TUPICOCHA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAROCHIRI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN ANDRES DE TUPICOCHA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN ANTONIO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAROCHIRI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN ANTONIO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN BARTOLOME' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAROCHIRI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN BARTOLOME');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN DAMIAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAROCHIRI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN DAMIAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JUAN DE IRIS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAROCHIRI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JUAN DE IRIS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JUAN DE TANTARANCHE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAROCHIRI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JUAN DE TANTARANCHE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN LORENZO DE QUINTI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAROCHIRI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN LORENZO DE QUINTI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN MATEO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAROCHIRI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN MATEO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN MATEO DE OTAO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAROCHIRI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN MATEO DE OTAO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN PEDRO DE CASTA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAROCHIRI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN PEDRO DE CASTA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN PEDRO DE HUANCAYRE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAROCHIRI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN PEDRO DE HUANCAYRE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANGALLAYA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAROCHIRI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANGALLAYA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA CRUZ DE COCACHACRA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAROCHIRI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA CRUZ DE COCACHACRA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA EULALIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAROCHIRI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA EULALIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTIAGO DE ANCHUCAYA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAROCHIRI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTIAGO DE ANCHUCAYA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTIAGO DE TUNA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAROCHIRI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTIAGO DE TUNA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTO DOMINGO DE LOS OLLEROS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAROCHIRI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTO DOMINGO DE LOS OLLEROS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SURCO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAROCHIRI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SURCO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUACHO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAURA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUACHO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'AMBAR' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAURA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'AMBAR');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CALETA DE CARQUIN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAURA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CALETA DE CARQUIN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHECRAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAURA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHECRAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUALMAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAURA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUALMAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUAURA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAURA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUAURA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LEONCIO PRADO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAURA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LEONCIO PRADO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PACCHO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAURA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PACCHO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA LEONOR' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAURA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA LEONOR');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA MARIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAURA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA MARIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAYAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAURA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAYAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'VEGUETA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'HUAURA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'VEGUETA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'OYON' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'OYON' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'OYON');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ANDAJES' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'OYON' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ANDAJES');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CAUJUL' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'OYON' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CAUJUL');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COCHAMARCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'OYON' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COCHAMARCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'NAVAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'OYON' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'NAVAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PACHANGARA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'OYON' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PACHANGARA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YAUYOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'YAUYOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YAUYOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ALIS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'YAUYOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ALIS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ALLAUCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'YAUYOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ALLAUCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'AYAVIRI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'YAUYOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'AYAVIRI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'AZANGARO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'YAUYOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'AZANGARO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CACRA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'YAUYOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CACRA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CARANIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'YAUYOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CARANIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CATAHUASI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'YAUYOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CATAHUASI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHOCOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'YAUYOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHOCOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COCHAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'YAUYOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COCHAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COLONIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'YAUYOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COLONIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HONGOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'YAUYOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HONGOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUAMPARA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'YAUYOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUAMPARA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUANCAYA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'YAUYOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUANCAYA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUANGASCAR' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'YAUYOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUANGASCAR');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUANTAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'YAUYOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUANTAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUAÑEC' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'YAUYOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUAÑEC');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LARAOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'YAUYOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LARAOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LINCHA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'YAUYOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LINCHA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MADEAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'YAUYOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MADEAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MIRAFLORES' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'YAUYOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MIRAFLORES');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'OMAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'YAUYOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'OMAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PUTINZA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'YAUYOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PUTINZA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'QUINCHES' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'YAUYOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'QUINCHES');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'QUINOCAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'YAUYOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'QUINOCAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JOAQUIN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'YAUYOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JOAQUIN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN PEDRO DE PILAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'YAUYOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN PEDRO DE PILAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TANTA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'YAUYOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TANTA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TAURIPAMPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'YAUYOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TAURIPAMPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TOMAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'YAUYOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TOMAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TUPE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'YAUYOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TUPE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'VIÑAC' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'YAUYOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'VIÑAC');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'VITIS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LIMA' AND p.N_Provincia = 'YAUYOS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'VITIS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'IQUITOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'MAYNAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'IQUITOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ALTO NANAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'MAYNAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ALTO NANAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'FERNANDO LORES' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'MAYNAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'FERNANDO LORES');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'INDIANA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'MAYNAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'INDIANA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LAS AMAZONAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'MAYNAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LAS AMAZONAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MAZAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'MAYNAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MAZAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'NAPO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'MAYNAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'NAPO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PUNCHANA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'MAYNAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PUNCHANA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TORRES CAUSANA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'MAYNAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TORRES CAUSANA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'BELEN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'MAYNAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'BELEN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JUAN BAUTISTA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'MAYNAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JUAN BAUTISTA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YURIMAGUAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'ALTO AMAZONAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YURIMAGUAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'BALSAPUERTO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'ALTO AMAZONAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'BALSAPUERTO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JEBEROS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'ALTO AMAZONAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JEBEROS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LAGUNAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'ALTO AMAZONAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LAGUNAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA CRUZ' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'ALTO AMAZONAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA CRUZ');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TENIENTE CESAR LOPEZ ROJAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'ALTO AMAZONAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TENIENTE CESAR LOPEZ ROJAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'NAUTA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'LORETO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'NAUTA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PARINARI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'LORETO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PARINARI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TIGRE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'LORETO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TIGRE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TROMPETEROS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'LORETO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TROMPETEROS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'URARINAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'LORETO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'URARINAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'RAMON CASTILLA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'MARISCAL RAMON CASTILLA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'RAMON CASTILLA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PEBAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'MARISCAL RAMON CASTILLA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PEBAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YAVARI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'MARISCAL RAMON CASTILLA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YAVARI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN PABLO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'MARISCAL RAMON CASTILLA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN PABLO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'REQUENA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'REQUENA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'REQUENA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ALTO TAPICHE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'REQUENA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ALTO TAPICHE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CAPELO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'REQUENA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CAPELO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'EMILIO SAN MARTIN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'REQUENA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'EMILIO SAN MARTIN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MAQUIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'REQUENA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MAQUIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PUINAHUA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'REQUENA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PUINAHUA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAQUENA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'REQUENA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAQUENA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SOPLIN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'REQUENA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SOPLIN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TAPICHE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'REQUENA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TAPICHE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JENARO HERRERA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'REQUENA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JENARO HERRERA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YAQUERANA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'REQUENA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YAQUERANA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CONTAMANA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'UCAYALI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CONTAMANA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'INAHUAYA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'UCAYALI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'INAHUAYA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PADRE MARQUEZ' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'UCAYALI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PADRE MARQUEZ');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PAMPA HERMOSA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'UCAYALI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PAMPA HERMOSA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SARAYACU' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'UCAYALI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SARAYACU');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'VARGAS GUERRA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'UCAYALI' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'VARGAS GUERRA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'BARRANCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'DATEM DEL MARAÑON' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'BARRANCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CAHUAPANAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'DATEM DEL MARAÑON' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CAHUAPANAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MANSERICHE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'DATEM DEL MARAÑON' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MANSERICHE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MORONA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'DATEM DEL MARAÑON' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MORONA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PASTAZA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'DATEM DEL MARAÑON' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PASTAZA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ANDOAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'DATEM DEL MARAÑON' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ANDOAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PUTUMAYO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'PUTUMAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PUTUMAYO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ROSA PANDURO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'PUTUMAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ROSA PANDURO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TENIENTE MANUEL CLAVERO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'PUTUMAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TENIENTE MANUEL CLAVERO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YAGUAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'LORETO' AND p.N_Provincia = 'PUTUMAYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YAGUAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TAMBOPATA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'MADRE DE DIOS' AND p.N_Provincia = 'TAMBOPATA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TAMBOPATA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'INAMBARI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'MADRE DE DIOS' AND p.N_Provincia = 'TAMBOPATA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'INAMBARI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LAS PIEDRAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'MADRE DE DIOS' AND p.N_Provincia = 'TAMBOPATA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LAS PIEDRAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LABERINTO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'MADRE DE DIOS' AND p.N_Provincia = 'TAMBOPATA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LABERINTO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MANU' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'MADRE DE DIOS' AND p.N_Provincia = 'MANU' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MANU');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'FITZCARRALD' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'MADRE DE DIOS' AND p.N_Provincia = 'MANU' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'FITZCARRALD');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MADRE DE DIOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'MADRE DE DIOS' AND p.N_Provincia = 'MANU' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MADRE DE DIOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUEPETUHE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'MADRE DE DIOS' AND p.N_Provincia = 'MANU' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUEPETUHE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'IÑAPARI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'MADRE DE DIOS' AND p.N_Provincia = 'TAHUAMANU' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'IÑAPARI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'IBERIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'MADRE DE DIOS' AND p.N_Provincia = 'TAHUAMANU' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'IBERIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TAHUAMANU' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'MADRE DE DIOS' AND p.N_Provincia = 'TAHUAMANU' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TAHUAMANU');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MOQUEGUA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'MOQUEGUA' AND p.N_Provincia = 'MARISCAL NIETO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MOQUEGUA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CARUMAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'MOQUEGUA' AND p.N_Provincia = 'MARISCAL NIETO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CARUMAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CUCHUMBAYA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'MOQUEGUA' AND p.N_Provincia = 'MARISCAL NIETO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CUCHUMBAYA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAMEGUA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'MOQUEGUA' AND p.N_Provincia = 'MARISCAL NIETO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAMEGUA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN CRISTOBAL' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'MOQUEGUA' AND p.N_Provincia = 'MARISCAL NIETO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN CRISTOBAL');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TORATA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'MOQUEGUA' AND p.N_Provincia = 'MARISCAL NIETO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TORATA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN ANTONIO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'MOQUEGUA' AND p.N_Provincia = 'MARISCAL NIETO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN ANTONIO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'OMATE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'MOQUEGUA' AND p.N_Provincia = 'GENERAL SANCHEZ CERRO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'OMATE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHOJATA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'MOQUEGUA' AND p.N_Provincia = 'GENERAL SANCHEZ CERRO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHOJATA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COALAQUE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'MOQUEGUA' AND p.N_Provincia = 'GENERAL SANCHEZ CERRO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COALAQUE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ICHUÑA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'MOQUEGUA' AND p.N_Provincia = 'GENERAL SANCHEZ CERRO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ICHUÑA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LA CAPILLA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'MOQUEGUA' AND p.N_Provincia = 'GENERAL SANCHEZ CERRO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LA CAPILLA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LLOQUE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'MOQUEGUA' AND p.N_Provincia = 'GENERAL SANCHEZ CERRO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LLOQUE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MATALAQUE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'MOQUEGUA' AND p.N_Provincia = 'GENERAL SANCHEZ CERRO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MATALAQUE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PUQUINA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'MOQUEGUA' AND p.N_Provincia = 'GENERAL SANCHEZ CERRO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PUQUINA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'QUINISTAQUILLAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'MOQUEGUA' AND p.N_Provincia = 'GENERAL SANCHEZ CERRO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'QUINISTAQUILLAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'UBINAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'MOQUEGUA' AND p.N_Provincia = 'GENERAL SANCHEZ CERRO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'UBINAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YUNGA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'MOQUEGUA' AND p.N_Provincia = 'GENERAL SANCHEZ CERRO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YUNGA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ILO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'MOQUEGUA' AND p.N_Provincia = 'ILO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ILO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'EL ALGARROBAL' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'MOQUEGUA' AND p.N_Provincia = 'ILO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'EL ALGARROBAL');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PACOCHA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'MOQUEGUA' AND p.N_Provincia = 'ILO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PACOCHA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHAUPIMARCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PASCO' AND p.N_Provincia = 'PASCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHAUPIMARCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUACHON' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PASCO' AND p.N_Provincia = 'PASCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUACHON');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUARIACA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PASCO' AND p.N_Provincia = 'PASCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUARIACA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUAYLLAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PASCO' AND p.N_Provincia = 'PASCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUAYLLAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'NINACACA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PASCO' AND p.N_Provincia = 'PASCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'NINACACA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PALLANCHACRA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PASCO' AND p.N_Provincia = 'PASCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PALLANCHACRA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PAUCARTAMBO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PASCO' AND p.N_Provincia = 'PASCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PAUCARTAMBO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN FRANCISCO DE ASIS DE YARUSYACAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PASCO' AND p.N_Provincia = 'PASCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN FRANCISCO DE ASIS DE YARUSYACAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SIMON BOLIVAR' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PASCO' AND p.N_Provincia = 'PASCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SIMON BOLIVAR');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TICLACAYAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PASCO' AND p.N_Provincia = 'PASCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TICLACAYAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TINYAHUARCO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PASCO' AND p.N_Provincia = 'PASCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TINYAHUARCO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'VICCO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PASCO' AND p.N_Provincia = 'PASCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'VICCO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YANACANCHA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PASCO' AND p.N_Provincia = 'PASCO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YANACANCHA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YANAHUANCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PASCO' AND p.N_Provincia = 'DANIEL ALCIDES CARRION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YANAHUANCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHACAYAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PASCO' AND p.N_Provincia = 'DANIEL ALCIDES CARRION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHACAYAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'GOYLLARISQUIZGA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PASCO' AND p.N_Provincia = 'DANIEL ALCIDES CARRION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'GOYLLARISQUIZGA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PAUCAR' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PASCO' AND p.N_Provincia = 'DANIEL ALCIDES CARRION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PAUCAR');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN PEDRO DE PILLAO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PASCO' AND p.N_Provincia = 'DANIEL ALCIDES CARRION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN PEDRO DE PILLAO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA ANA DE TUSI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PASCO' AND p.N_Provincia = 'DANIEL ALCIDES CARRION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA ANA DE TUSI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TAPUC' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PASCO' AND p.N_Provincia = 'DANIEL ALCIDES CARRION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TAPUC');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'VILCABAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PASCO' AND p.N_Provincia = 'DANIEL ALCIDES CARRION' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'VILCABAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'OXAPAMPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PASCO' AND p.N_Provincia = 'OXAPAMPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'OXAPAMPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHONTABAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PASCO' AND p.N_Provincia = 'OXAPAMPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHONTABAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUANCABAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PASCO' AND p.N_Provincia = 'OXAPAMPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUANCABAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PALCAZU' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PASCO' AND p.N_Provincia = 'OXAPAMPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PALCAZU');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'POZUZO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PASCO' AND p.N_Provincia = 'OXAPAMPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'POZUZO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PUERTO BERMUDEZ' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PASCO' AND p.N_Provincia = 'OXAPAMPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PUERTO BERMUDEZ');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'VILLA RICA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PASCO' AND p.N_Provincia = 'OXAPAMPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'VILLA RICA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CONSTITUCION' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PASCO' AND p.N_Provincia = 'OXAPAMPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CONSTITUCION');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PIURA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'PIURA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PIURA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CASTILLA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'PIURA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CASTILLA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CATACAOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'PIURA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CATACAOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CURA MORI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'PIURA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CURA MORI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'EL TALLAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'PIURA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'EL TALLAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LA ARENA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'PIURA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LA ARENA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LA UNION' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'PIURA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LA UNION');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LAS LOMAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'PIURA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LAS LOMAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TAMBO GRANDE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'PIURA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TAMBO GRANDE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'VEINTISEIS DE OCTUBRE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'PIURA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'VEINTISEIS DE OCTUBRE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'AYABACA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'AYABACA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'AYABACA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'FRIAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'AYABACA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'FRIAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JILILI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'AYABACA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JILILI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LAGUNAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'AYABACA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LAGUNAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MONTERO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'AYABACA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MONTERO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PACAIPAMPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'AYABACA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PACAIPAMPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PAIMAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'AYABACA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PAIMAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAPILLICA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'AYABACA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAPILLICA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SICCHEZ' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'AYABACA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SICCHEZ');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SUYO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'AYABACA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SUYO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUANCABAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'HUANCABAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUANCABAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CANCHAQUE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'HUANCABAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CANCHAQUE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'EL CARMEN DE LA FRONTERA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'HUANCABAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'EL CARMEN DE LA FRONTERA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUARMACA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'HUANCABAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUARMACA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LALAQUIZ' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'HUANCABAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LALAQUIZ');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN MIGUEL DE EL FAIQUE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'HUANCABAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN MIGUEL DE EL FAIQUE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SONDOR' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'HUANCABAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SONDOR');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SONDORILLO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'HUANCABAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SONDORILLO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHULUCANAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'MORROPON' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHULUCANAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'BUENOS AIRES' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'MORROPON' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'BUENOS AIRES');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHALACO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'MORROPON' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHALACO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LA MATANZA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'MORROPON' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LA MATANZA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MORROPON' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'MORROPON' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MORROPON');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SALITRAL' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'MORROPON' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SALITRAL');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JUAN DE BIGOTE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'MORROPON' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JUAN DE BIGOTE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA CATALINA DE MOSSA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'MORROPON' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA CATALINA DE MOSSA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTO DOMINGO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'MORROPON' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTO DOMINGO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YAMANGO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'MORROPON' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YAMANGO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PAITA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'PAITA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PAITA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'AMOTAPE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'PAITA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'AMOTAPE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ARENAL' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'PAITA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ARENAL');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COLAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'PAITA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COLAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LA HUACA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'PAITA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LA HUACA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TAMARINDO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'PAITA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TAMARINDO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'VICHAYAL' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'PAITA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'VICHAYAL');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SULLANA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'SULLANA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SULLANA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'BELLAVISTA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'SULLANA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'BELLAVISTA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'IGNACIO ESCUDERO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'SULLANA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'IGNACIO ESCUDERO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LANCONES' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'SULLANA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LANCONES');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MARCAVELICA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'SULLANA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MARCAVELICA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MIGUEL CHECA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'SULLANA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MIGUEL CHECA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'QUERECOTILLO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'SULLANA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'QUERECOTILLO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SALITRAL' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'SULLANA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SALITRAL');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PARIÑAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'TALARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PARIÑAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'EL ALTO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'TALARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'EL ALTO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LA BREA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'TALARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LA BREA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LOBITOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'TALARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LOBITOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LOS ORGANOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'TALARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LOS ORGANOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MANCORA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'TALARA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MANCORA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SECHURA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'SECHURA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SECHURA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'BELLAVISTA DE LA UNION' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'SECHURA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'BELLAVISTA DE LA UNION');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'BERNAL' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'SECHURA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'BERNAL');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CRISTO NOS VALGA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'SECHURA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CRISTO NOS VALGA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'VICE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'SECHURA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'VICE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'RINCONADA LLICUAR' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PIURA' AND p.N_Provincia = 'SECHURA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'RINCONADA LLICUAR');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PUNO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'PUNO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PUNO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ACORA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'PUNO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ACORA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'AMANTANI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'PUNO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'AMANTANI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ATUNCOLLA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'PUNO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ATUNCOLLA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CAPACHICA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'PUNO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CAPACHICA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHUCUITO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'PUNO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHUCUITO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COATA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'PUNO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COATA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUATA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'PUNO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUATA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MAÑAZO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'PUNO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MAÑAZO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PAUCARCOLLA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'PUNO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PAUCARCOLLA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PICHACANI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'PUNO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PICHACANI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PLATERIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'PUNO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PLATERIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN ANTONIO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'PUNO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN ANTONIO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TIQUILLACA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'PUNO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TIQUILLACA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'VILQUE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'PUNO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'VILQUE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'AZANGARO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'AZANGARO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'AZANGARO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ACHAYA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'AZANGARO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ACHAYA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ARAPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'AZANGARO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ARAPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ASILLO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'AZANGARO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ASILLO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CAMINACA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'AZANGARO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CAMINACA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHUPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'AZANGARO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHUPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JOSE DOMINGO CHOQUEHUANCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'AZANGARO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JOSE DOMINGO CHOQUEHUANCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MUÑANI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'AZANGARO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MUÑANI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'POTONI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'AZANGARO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'POTONI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAMAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'AZANGARO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAMAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN ANTON' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'AZANGARO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN ANTON');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JOSE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'AZANGARO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JOSE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JUAN DE SALINAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'AZANGARO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JUAN DE SALINAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTIAGO DE PUPUJA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'AZANGARO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTIAGO DE PUPUJA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TIRAPATA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'AZANGARO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TIRAPATA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MACUSANI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'CARABAYA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MACUSANI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'AJOYANI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'CARABAYA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'AJOYANI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'AYAPATA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'CARABAYA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'AYAPATA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COASA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'CARABAYA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COASA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CORANI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'CARABAYA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CORANI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CRUCERO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'CARABAYA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CRUCERO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ITUATA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'CARABAYA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ITUATA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'OLLACHEA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'CARABAYA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'OLLACHEA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN GABAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'CARABAYA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN GABAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'USICAYOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'CARABAYA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'USICAYOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JULI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'CHUCUITO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JULI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'DESAGUADERO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'CHUCUITO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'DESAGUADERO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUACULLANI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'CHUCUITO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUACULLANI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'KELLUYO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'CHUCUITO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'KELLUYO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PISACOMA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'CHUCUITO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PISACOMA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'POMATA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'CHUCUITO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'POMATA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ZEPITA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'CHUCUITO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ZEPITA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ILAVE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'EL COLLAO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ILAVE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CAPAZO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'EL COLLAO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CAPAZO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PILCUYO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'EL COLLAO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PILCUYO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA ROSA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'EL COLLAO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA ROSA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CONDURIRI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'EL COLLAO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CONDURIRI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUANCANE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'HUANCANE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUANCANE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COJATA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'HUANCANE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COJATA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUATASANI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'HUANCANE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUATASANI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'INCHUPALLA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'HUANCANE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'INCHUPALLA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PUSI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'HUANCANE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PUSI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ROSASPATA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'HUANCANE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ROSASPATA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TARACO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'HUANCANE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TARACO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'VILQUE CHICO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'HUANCANE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'VILQUE CHICO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LAMPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'LAMPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LAMPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CABANILLA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'LAMPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CABANILLA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CALAPUJA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'LAMPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CALAPUJA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'NICASIO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'LAMPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'NICASIO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'OCUVIRI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'LAMPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'OCUVIRI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PALCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'LAMPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PALCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PARATIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'LAMPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PARATIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PUCARA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'LAMPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PUCARA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA LUCIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'LAMPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA LUCIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'VILAVILA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'LAMPA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'VILAVILA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'AYAVIRI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'MELGAR' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'AYAVIRI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ANTAUTA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'MELGAR' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ANTAUTA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CUPI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'MELGAR' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CUPI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LLALLI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'MELGAR' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LLALLI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MACARI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'MELGAR' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MACARI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'NUÑOA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'MELGAR' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'NUÑOA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ORURILLO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'MELGAR' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ORURILLO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA ROSA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'MELGAR' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA ROSA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'UMACHIRI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'MELGAR' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'UMACHIRI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MOHO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'MOHO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MOHO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CONIMA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'MOHO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CONIMA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUAYRAPATA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'MOHO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUAYRAPATA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TILALI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'MOHO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TILALI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PUTINA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'SAN ANTONIO DE PUTINA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PUTINA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ANANEA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'SAN ANTONIO DE PUTINA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ANANEA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PEDRO VILCA APAZA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'SAN ANTONIO DE PUTINA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PEDRO VILCA APAZA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'QUILCAPUNCU' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'SAN ANTONIO DE PUTINA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'QUILCAPUNCU');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SINA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'SAN ANTONIO DE PUTINA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SINA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JULIACA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'SAN ROMAN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JULIACA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CABANA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'SAN ROMAN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CABANA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CABANILLAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'SAN ROMAN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CABANILLAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CARACOTO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'SAN ROMAN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CARACOTO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN MIGUEL' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'SAN ROMAN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN MIGUEL');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANDIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'SANDIA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANDIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CUYOCUYO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'SANDIA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CUYOCUYO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LIMBANI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'SANDIA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LIMBANI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PATAMBUCO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'SANDIA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PATAMBUCO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PHARA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'SANDIA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PHARA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'QUIACA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'SANDIA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'QUIACA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JUAN DEL ORO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'SANDIA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JUAN DEL ORO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YANAHUAYA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'SANDIA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YANAHUAYA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ALTO INAMBARI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'SANDIA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ALTO INAMBARI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN PEDRO DE PUTINA PUNCO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'SANDIA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN PEDRO DE PUTINA PUNCO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YUNGUYO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'YUNGUYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YUNGUYO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ANAPIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'YUNGUYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ANAPIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'COPANI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'YUNGUYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'COPANI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CUTURAPI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'YUNGUYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CUTURAPI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'OLLARAYA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'YUNGUYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'OLLARAYA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TINICACHI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'YUNGUYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TINICACHI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'UNICACHI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'PUNO' AND p.N_Provincia = 'YUNGUYO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'UNICACHI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MOYOBAMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'MOYOBAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MOYOBAMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CALZADA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'MOYOBAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CALZADA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HABANA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'MOYOBAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HABANA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JEPELACIO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'MOYOBAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JEPELACIO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SORITOR' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'MOYOBAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SORITOR');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YANTALO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'MOYOBAMBA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YANTALO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'BELLAVISTA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'BELLAVISTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'BELLAVISTA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ALTO BIAVO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'BELLAVISTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ALTO BIAVO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'BAJO BIAVO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'BELLAVISTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'BAJO BIAVO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUALLAGA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'BELLAVISTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUALLAGA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN PABLO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'BELLAVISTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN PABLO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN RAFAEL' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'BELLAVISTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN RAFAEL');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JOSE DE SISA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'EL DORADO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JOSE DE SISA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'AGUA BLANCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'EL DORADO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'AGUA BLANCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN MARTIN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'EL DORADO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN MARTIN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA ROSA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'EL DORADO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA ROSA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SHATOJA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'EL DORADO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SHATOJA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAPOSOA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'HUALLAGA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAPOSOA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ALTO SAPOSOA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'HUALLAGA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ALTO SAPOSOA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'EL ESLABON' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'HUALLAGA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'EL ESLABON');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PISCOYACU' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'HUALLAGA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PISCOYACU');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SACANCHE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'HUALLAGA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SACANCHE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TINGO DE SAPOSOA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'HUALLAGA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TINGO DE SAPOSOA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LAMAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'LAMAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LAMAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ALONSO DE ALVARADO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'LAMAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ALONSO DE ALVARADO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'BARRANQUITA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'LAMAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'BARRANQUITA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CAYNARACHI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'LAMAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CAYNARACHI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CUÑUMBUQUI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'LAMAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CUÑUMBUQUI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PINTO RECODO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'LAMAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PINTO RECODO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'RUMISAPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'LAMAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'RUMISAPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN ROQUE DE CUMBAZA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'LAMAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN ROQUE DE CUMBAZA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SHANAO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'LAMAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SHANAO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TABALOSOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'LAMAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TABALOSOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ZAPATERO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'LAMAS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ZAPATERO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JUANJUI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'MARISCAL CACERES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JUANJUI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CAMPANILLA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'MARISCAL CACERES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CAMPANILLA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUICUNGO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'MARISCAL CACERES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUICUNGO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PACHIZA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'MARISCAL CACERES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PACHIZA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PAJARILLO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'MARISCAL CACERES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PAJARILLO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PICOTA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'PICOTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PICOTA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'BUENOS AIRES' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'PICOTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'BUENOS AIRES');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CASPISAPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'PICOTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CASPISAPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PILLUANA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'PICOTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PILLUANA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PUCACACA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'PICOTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PUCACACA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN CRISTOBAL' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'PICOTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN CRISTOBAL');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN HILARION' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'PICOTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN HILARION');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SHAMBOYACU' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'PICOTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SHAMBOYACU');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TINGO DE PONASA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'PICOTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TINGO DE PONASA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TRES UNIDOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'PICOTA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TRES UNIDOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'RIOJA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'RIOJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'RIOJA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'AWAJUN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'RIOJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'AWAJUN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ELIAS SOPLIN VARGAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'RIOJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ELIAS SOPLIN VARGAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'NUEVA CAJAMARCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'RIOJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'NUEVA CAJAMARCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PARDO MIGUEL' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'RIOJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PARDO MIGUEL');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'POSIC' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'RIOJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'POSIC');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN FERNANDO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'RIOJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN FERNANDO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YORONGOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'RIOJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YORONGOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YURACYACU' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'RIOJA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YURACYACU');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TARAPOTO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'SAN MARTIN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TARAPOTO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ALBERTO LEVEAU' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'SAN MARTIN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ALBERTO LEVEAU');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CACATACHI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'SAN MARTIN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CACATACHI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHAZUTA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'SAN MARTIN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHAZUTA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CHIPURANA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'SAN MARTIN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CHIPURANA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'EL PORVENIR' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'SAN MARTIN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'EL PORVENIR');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUIMBAYOC' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'SAN MARTIN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUIMBAYOC');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'JUAN GUERRA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'SAN MARTIN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'JUAN GUERRA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LA BANDA DE SHILCAYO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'SAN MARTIN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LA BANDA DE SHILCAYO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MORALES' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'SAN MARTIN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MORALES');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PAPAPLAYA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'SAN MARTIN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PAPAPLAYA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN ANTONIO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'SAN MARTIN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN ANTONIO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAUCE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'SAN MARTIN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAUCE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SHAPAJA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'SAN MARTIN' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SHAPAJA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TOCACHE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'TOCACHE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TOCACHE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'NUEVO PROGRESO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'TOCACHE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'NUEVO PROGRESO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'POLVORA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'TOCACHE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'POLVORA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SHUNTE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'TOCACHE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SHUNTE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'UCHIZA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'TOCACHE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'UCHIZA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SANTA LUCIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'SAN MARTIN' AND p.N_Provincia = 'TOCACHE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SANTA LUCIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TACNA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'TACNA' AND p.N_Provincia = 'TACNA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TACNA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ALTO DE LA ALIANZA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'TACNA' AND p.N_Provincia = 'TACNA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ALTO DE LA ALIANZA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CALANA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'TACNA' AND p.N_Provincia = 'TACNA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CALANA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CIUDAD NUEVA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'TACNA' AND p.N_Provincia = 'TACNA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CIUDAD NUEVA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'INCLAN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'TACNA' AND p.N_Provincia = 'TACNA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'INCLAN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PACHIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'TACNA' AND p.N_Provincia = 'TACNA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PACHIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PALCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'TACNA' AND p.N_Provincia = 'TACNA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PALCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'POCOLLAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'TACNA' AND p.N_Provincia = 'TACNA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'POCOLLAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAMA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'TACNA' AND p.N_Provincia = 'TACNA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAMA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CORONEL GREGORIO ALBARRACIN LANCHIPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'TACNA' AND p.N_Provincia = 'TACNA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CORONEL GREGORIO ALBARRACIN LANCHIPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LA YARADA LOS PALOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'TACNA' AND p.N_Provincia = 'TACNA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LA YARADA LOS PALOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CANDARAVE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'TACNA' AND p.N_Provincia = 'CANDARAVE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CANDARAVE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CAIRANI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'TACNA' AND p.N_Provincia = 'CANDARAVE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CAIRANI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CAMILACA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'TACNA' AND p.N_Provincia = 'CANDARAVE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CAMILACA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CURIBAYA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'TACNA' AND p.N_Provincia = 'CANDARAVE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CURIBAYA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUANUARA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'TACNA' AND p.N_Provincia = 'CANDARAVE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUANUARA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'QUILAHUANI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'TACNA' AND p.N_Provincia = 'CANDARAVE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'QUILAHUANI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LOCUMBA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'TACNA' AND p.N_Provincia = 'JORGE BASADRE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LOCUMBA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ILABAYA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'TACNA' AND p.N_Provincia = 'JORGE BASADRE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ILABAYA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ITE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'TACNA' AND p.N_Provincia = 'JORGE BASADRE' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ITE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TARATA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'TACNA' AND p.N_Provincia = 'TARATA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TARATA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HEROES ALBARRACIN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'TACNA' AND p.N_Provincia = 'TARATA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HEROES ALBARRACIN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ESTIQUE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'TACNA' AND p.N_Provincia = 'TARATA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ESTIQUE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ESTIQUE-PAMPA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'TACNA' AND p.N_Provincia = 'TARATA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ESTIQUE-PAMPA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SITAJARA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'TACNA' AND p.N_Provincia = 'TARATA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SITAJARA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SUSAPAYA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'TACNA' AND p.N_Provincia = 'TARATA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SUSAPAYA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TARUCACHI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'TACNA' AND p.N_Provincia = 'TARATA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TARUCACHI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TICACO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'TACNA' AND p.N_Provincia = 'TARATA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TICACO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TUMBES' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'TUMBES' AND p.N_Provincia = 'TUMBES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TUMBES');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CORRALES' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'TUMBES' AND p.N_Provincia = 'TUMBES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CORRALES');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'LA CRUZ' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'TUMBES' AND p.N_Provincia = 'TUMBES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'LA CRUZ');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PAMPAS DE HOSPITAL' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'TUMBES' AND p.N_Provincia = 'TUMBES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PAMPAS DE HOSPITAL');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JACINTO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'TUMBES' AND p.N_Provincia = 'TUMBES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JACINTO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SAN JUAN DE LA VIRGEN' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'TUMBES' AND p.N_Provincia = 'TUMBES' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SAN JUAN DE LA VIRGEN');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ZORRITOS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'TUMBES' AND p.N_Provincia = 'CONTRALMIRANTE VILLAR' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ZORRITOS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CASITAS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'TUMBES' AND p.N_Provincia = 'CONTRALMIRANTE VILLAR' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CASITAS');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CANOAS DE PUNTA SAL' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'TUMBES' AND p.N_Provincia = 'CONTRALMIRANTE VILLAR' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CANOAS DE PUNTA SAL');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ZARUMILLA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'TUMBES' AND p.N_Provincia = 'ZARUMILLA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ZARUMILLA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'AGUAS VERDES' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'TUMBES' AND p.N_Provincia = 'ZARUMILLA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'AGUAS VERDES');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MATAPALO' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'TUMBES' AND p.N_Provincia = 'ZARUMILLA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MATAPALO');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PAPAYAL' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'TUMBES' AND p.N_Provincia = 'ZARUMILLA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PAPAYAL');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CALLERIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'UCAYALI' AND p.N_Provincia = 'CORONEL PORTILLO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CALLERIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CAMPOVERDE' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'UCAYALI' AND p.N_Provincia = 'CORONEL PORTILLO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CAMPOVERDE');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'IPARIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'UCAYALI' AND p.N_Provincia = 'CORONEL PORTILLO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'IPARIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MASISEA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'UCAYALI' AND p.N_Provincia = 'CORONEL PORTILLO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MASISEA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YARINACOCHA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'UCAYALI' AND p.N_Provincia = 'CORONEL PORTILLO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YARINACOCHA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'NUEVA REQUENA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'UCAYALI' AND p.N_Provincia = 'CORONEL PORTILLO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'NUEVA REQUENA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'MANANTAY' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'UCAYALI' AND p.N_Provincia = 'CORONEL PORTILLO' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'MANANTAY');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'RAIMONDI' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'UCAYALI' AND p.N_Provincia = 'ATALAYA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'RAIMONDI');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'SEPAHUA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'UCAYALI' AND p.N_Provincia = 'ATALAYA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'SEPAHUA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'TAHUANIA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'UCAYALI' AND p.N_Provincia = 'ATALAYA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'TAHUANIA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'YURUA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'UCAYALI' AND p.N_Provincia = 'ATALAYA' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'YURUA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PADRE ABAD' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'UCAYALI' AND p.N_Provincia = 'PADRE ABAD' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PADRE ABAD');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'IRAZOLA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'UCAYALI' AND p.N_Provincia = 'PADRE ABAD' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'IRAZOLA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'CURIMANA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'UCAYALI' AND p.N_Provincia = 'PADRE ABAD' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'CURIMANA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'NESHUYA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'UCAYALI' AND p.N_Provincia = 'PADRE ABAD' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'NESHUYA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'ALEXANDER VON HUMBOLDT' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'UCAYALI' AND p.N_Provincia = 'PADRE ABAD' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'ALEXANDER VON HUMBOLDT');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'HUIPOCA' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'UCAYALI' AND p.N_Provincia = 'PADRE ABAD' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'HUIPOCA');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'BOQUERON' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'UCAYALI' AND p.N_Provincia = 'PADRE ABAD' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'BOQUERON');
INSERT INTO DISTRITO (ID_Provincia, D_Distrito)
SELECT p.ID_Provincia, 'PURUS' FROM PROVINCIA p INNER JOIN DEPARTAMENTO d ON d.ID_Departamento = p.ID_Departamento
WHERE d.N_Departamento = 'UCAYALI' AND p.N_Provincia = 'PURUS' AND NOT EXISTS (SELECT 1 FROM DISTRITO x WHERE x.ID_Provincia = p.ID_Provincia AND x.D_Distrito = 'PURUS');

/* ---------- CONTROL ---------- */
SELECT 'DEPARTAMENTO' AS tabla, COUNT(*) AS total FROM DEPARTAMENTO
UNION ALL SELECT 'PROVINCIA', COUNT(*) FROM PROVINCIA
UNION ALL SELECT 'DISTRITO', COUNT(*) FROM DISTRITO;
