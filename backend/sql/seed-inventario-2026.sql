-- =========================================================
-- Inventario del laboratorio de Ciencias Biomédicas 2026
-- Generado desde "Inventario laboratorio Ciencias Biomédicas 2026.xlsx"
--
-- Volumétricos, no volumétricos, utensilios y metales -> materiales
--   (columna categoria: VOLUMETRICO, NO_VOLUMETRICO, UTENSILIO, METAL)
-- Consumibles y reactivos -> consumibles (columna tipo: CONSUMIBLE o REACTIVO)
-- Equipos -> equipo_lab
--
-- La cantidad es el conteo más reciente de cada renglón (feb 2026).
-- Si se corre otra vez no duplica: se salta si ya existe VOL00001.
--   psql -d hackathon -f sql/seed-inventario-2026.sql
-- Totales: {"VOLUMETRICO": 31, "NO_VOLUMETRICO": 44, "UTENSILIO": 20, "METAL": 8, "EQUIPO_LAB": 13, "CONSUMIBLES": 79}
-- =========================================================

DO $$
DECLARE
  id_cat INT;
BEGIN
  IF EXISTS (SELECT 1 FROM materiales WHERE codigo = 'VOL00001') THEN
    RAISE NOTICE 'El inventario 2026 ya estaba importado; no se hizo nada.';
    RETURN;
  END IF;

    INSERT INTO catalogo (nombre, categoria) VALUES ('Probeta 10 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Probeta', '10 ml', NULL, 'vidrio', NULL, 'VOL00001', 'DISPONIBLE', 'VOLUMETRICO', 1);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Probeta 250 ml (plástico)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Probeta', '250 ml', NULL, 'plástico', NULL, 'VOL00002', 'DISPONIBLE', 'VOLUMETRICO', 1);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Probeta 100 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Probeta', '100 ml', NULL, 'vidrio', NULL, 'VOL00003', 'DISPONIBLE', 'VOLUMETRICO', 5);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Probeta 250 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Probeta', '250 ml', NULL, 'vidrio', NULL, 'VOL00004', 'DISPONIBLE', 'VOLUMETRICO', 4);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Probeta 500 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Probeta', '500 ml', NULL, 'vidrio', NULL, 'VOL00005', 'BAJA', 'VOLUMETRICO', 0);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Probeta 1000 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Probeta', '1000 ml', NULL, 'vidrio', NULL, 'VOL00006', 'DISPONIBLE', 'VOLUMETRICO', 3);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Matraz aforado 10 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Matraz aforado', '10 ml', NULL, 'vidrio', NULL, 'VOL00007', 'DISPONIBLE', 'VOLUMETRICO', 6);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Matraz aforado 50 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Matraz aforado', '50 ml', NULL, 'vidrio', NULL, 'VOL00008', 'DISPONIBLE', 'VOLUMETRICO', 5);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Matraz aforado 100 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Matraz aforado', '100 ml', NULL, 'vidrio', NULL, 'VOL00009', 'DISPONIBLE', 'VOLUMETRICO', 4);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Matraz aforado 200 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Matraz aforado', '200 ml', NULL, 'vidrio', NULL, 'VOL00010', 'DISPONIBLE', 'VOLUMETRICO', 1);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Matraz aforado 250 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Matraz aforado', '250 ml', NULL, 'vidrio', NULL, 'VOL00011', 'DISPONIBLE', 'VOLUMETRICO', 6);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Matraz aforado 500 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Matraz aforado', '500 ml', NULL, 'vidrio', NULL, 'VOL00012', 'DISPONIBLE', 'VOLUMETRICO', 2);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Matraz aforado 1000 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Matraz aforado', '1000 ml', NULL, 'vidrio', NULL, 'VOL00013', 'DISPONIBLE', 'VOLUMETRICO', 4);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Pipeta graduada 0.2 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Pipeta graduada', '0.2 ml', NULL, 'vidrio', NULL, 'VOL00014', 'DISPONIBLE', 'VOLUMETRICO', 2);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Pipeta graduada 1 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Pipeta graduada', '1 ml', NULL, 'vidrio', NULL, 'VOL00015', 'DISPONIBLE', 'VOLUMETRICO', 15);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Pipeta graduada 2 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Pipeta graduada', '2 ml', NULL, 'vidrio', NULL, 'VOL00016', 'DISPONIBLE', 'VOLUMETRICO', 8);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Pipeta graduada 5 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Pipeta graduada', '5 ml', NULL, 'vidrio', NULL, 'VOL00017', 'DISPONIBLE', 'VOLUMETRICO', 23);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Pipeta graduada 10 ml (plástico)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Pipeta graduada', '10 ml', NULL, 'plástico', NULL, 'VOL00018', 'DISPONIBLE', 'VOLUMETRICO', 5);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Pipetas graduada 10 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Pipetas graduada', '10 ml', NULL, 'vidrio', NULL, 'VOL00019', 'DISPONIBLE', 'VOLUMETRICO', 11);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Pipeta aforada 10 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Pipeta aforada', '10 ml', NULL, 'vidrio', NULL, 'VOL00020', 'BAJA', 'VOLUMETRICO', 0);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Pipeta aforada 25 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Pipeta aforada', '25 ml', NULL, 'vidrio', NULL, 'VOL00021', 'BAJA', 'VOLUMETRICO', 0);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Pipeta aforada 50 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Pipeta aforada', '50 ml', NULL, 'vidrio', NULL, 'VOL00022', 'BAJA', 'VOLUMETRICO', 0);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Pipeta esteril Graduada 5 ml', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Pipeta esteril Graduada', '5 ml', NULL, NULL, NULL, 'VOL00023', 'DISPONIBLE', 'VOLUMETRICO', 41);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Pipeta serologica 5 ml (plástico)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Pipeta serologica', '5 ml', NULL, 'plástico', NULL, 'VOL00024', 'BAJA', 'VOLUMETRICO', 0);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Micropipeta 10ul (plástico)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Micropipeta 10ul', NULL, NULL, 'plástico', NULL, 'VOL00025', 'DISPONIBLE', 'VOLUMETRICO', 1);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Micropipeta 20ul (plástico)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Micropipeta 20ul', NULL, NULL, 'plástico', NULL, 'VOL00026', 'DISPONIBLE', 'VOLUMETRICO', 1);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Micropipeta 100ul (plástico)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Micropipeta 100ul', NULL, NULL, 'plástico', NULL, 'VOL00027', 'DISPONIBLE', 'VOLUMETRICO', 3);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Micropipeta 200ul (plástico)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Micropipeta 200ul', NULL, NULL, 'plástico', NULL, 'VOL00028', 'BAJA', 'VOLUMETRICO', 0);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Micropipeta 1000ul (plástico)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Micropipeta 1000ul', NULL, NULL, 'plástico', NULL, 'VOL00029', 'DISPONIBLE', 'VOLUMETRICO', 3);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Bureta 50 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Bureta', '50 ml', NULL, 'vidrio', NULL, 'VOL00030', 'DISPONIBLE', 'VOLUMETRICO', 1);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Bureta 25 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Bureta', '25 ml', NULL, 'vidrio', NULL, 'VOL00031', 'DISPONIBLE', 'VOLUMETRICO', 2);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Vaso precipitado 50 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Vaso precipitado', '50 ml', NULL, 'vidrio', NULL, 'NVO00001', 'DISPONIBLE', 'NO_VOLUMETRICO', 6);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Vaso precipitado 100 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Vaso precipitado', '100 ml', NULL, 'vidrio', NULL, 'NVO00002', 'DISPONIBLE', 'NO_VOLUMETRICO', 8);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Vaso precipitado 200 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Vaso precipitado', '200 ml', NULL, 'vidrio', NULL, 'NVO00003', 'BAJA', 'NO_VOLUMETRICO', 0);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Vaso precipitado 250 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Vaso precipitado', '250 ml', NULL, 'vidrio', '11, 1 con grieta', 'NVO00004', 'DISPONIBLE', 'NO_VOLUMETRICO', 11);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Vaso precipitado 500 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Vaso precipitado', '500 ml', NULL, 'vidrio', NULL, 'NVO00005', 'DISPONIBLE', 'NO_VOLUMETRICO', 10);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Vaso precipitado 800 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Vaso precipitado', '800 ml', NULL, 'vidrio', NULL, 'NVO00006', 'DISPONIBLE', 'NO_VOLUMETRICO', 1);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Vaso precipitado 1000 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Vaso precipitado', '1000 ml', NULL, 'vidrio', NULL, 'NVO00007', 'DISPONIBLE', 'NO_VOLUMETRICO', 48);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Matraz erlenmeyer 125 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Matraz erlenmeyer', '125 ml', NULL, 'vidrio', NULL, 'NVO00008', 'BAJA', 'NO_VOLUMETRICO', 0);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Matraz erlenmeyer 250 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Matraz erlenmeyer', '250 ml', NULL, 'vidrio', NULL, 'NVO00009', 'DISPONIBLE', 'NO_VOLUMETRICO', 2);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Matraz erlenmeyer 500 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Matraz erlenmeyer', '500 ml', NULL, 'vidrio', NULL, 'NVO00010', 'DISPONIBLE', 'NO_VOLUMETRICO', 5);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Matraz erlenmeyer 1000 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Matraz erlenmeyer', '1000 ml', NULL, 'vidrio', NULL, 'NVO00011', 'DISPONIBLE', 'NO_VOLUMETRICO', 1);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Matraz de destilacion 125 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Matraz de destilacion', '125 ml', NULL, 'vidrio', NULL, 'NVO00012', 'DISPONIBLE', 'NO_VOLUMETRICO', 29);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Matraz de destilacion 500 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Matraz de destilacion', '500 ml', NULL, 'vidrio', NULL, 'NVO00013', 'DISPONIBLE', 'NO_VOLUMETRICO', 3);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Matraz de fondo redondo 250 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Matraz de fondo redondo', '250 ml', NULL, 'vidrio', NULL, 'NVO00014', 'DISPONIBLE', 'NO_VOLUMETRICO', 1);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Matraz de fondo plano (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Matraz de fondo plano', NULL, NULL, 'vidrio', NULL, 'NVO00015', 'DISPONIBLE', 'NO_VOLUMETRICO', 1);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Pipetas pasteur 3 ml (plástico)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Pipetas pasteur', '3 ml', NULL, 'plástico', NULL, 'NVO00016', 'DISPONIBLE', 'NO_VOLUMETRICO', 14);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Embudo de decantacion 250 ml', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Embudo de decantacion', '250 ml', NULL, NULL, NULL, 'NVO00017', 'DISPONIBLE', 'NO_VOLUMETRICO', 1);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Embudo de decantacion 125 ml', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Embudo de decantacion', '125 ml', NULL, NULL, NULL, 'NVO00018', 'DISPONIBLE', 'NO_VOLUMETRICO', 5);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Tubo Folin 25 ml', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Tubo Folin', '25 ml', NULL, NULL, NULL, 'NVO00019', 'DISPONIBLE', 'NO_VOLUMETRICO', 12);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Tubo de destilacion', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Tubo de destilacion', NULL, NULL, NULL, NULL, 'NVO00020', 'DISPONIBLE', 'NO_VOLUMETRICO', 1);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Tubo con rosca', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Tubo con rosca', NULL, NULL, NULL, NULL, 'NVO00021', 'BAJA', 'NO_VOLUMETRICO', 0);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Tubos de ensayo 10 ml 13 mm x 100 mm (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Tubos de ensayo', '10 ml', '13 mm x 100 mm', 'vidrio', NULL, 'NVO00022', 'BAJA', 'NO_VOLUMETRICO', 0);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Tubos de ensayo 12 mm x 100 mm (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Tubos de ensayo', NULL, '12 mm x 100 mm', 'vidrio', NULL, 'NVO00023', 'BAJA', 'NO_VOLUMETRICO', 0);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Tubos de ensayo 15 ml 13 mm x 125 mm (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Tubos de ensayo', '15 ml', '13 mm x 125 mm', 'vidrio', NULL, 'NVO00024', 'DISPONIBLE', 'NO_VOLUMETRICO', 17);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Tubos de ensayo 20 ml 13 mm x 150 mm (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Tubos de ensayo', '20 ml', '13 mm x 150 mm', 'vidrio', NULL, 'NVO00025', 'DISPONIBLE', 'NO_VOLUMETRICO', 48);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Tubos de ensayo 25 ml 13 mm x 150 mm (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Tubos de ensayo', '25 ml', '13 mm x 150 mm', 'vidrio', NULL, 'NVO00026', 'DISPONIBLE', 'NO_VOLUMETRICO', 27);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Tubos de ensayo 30 ml 13 mm x 150 mm (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Tubos de ensayo', '30 ml', '13 mm x 150 mm', 'vidrio', NULL, 'NVO00027', 'DISPONIBLE', 'NO_VOLUMETRICO', 5);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Tubos de ensayo 50 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Tubos de ensayo', '50 ml', NULL, 'vidrio', NULL, 'NVO00028', 'DISPONIBLE', 'NO_VOLUMETRICO', 5);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Tubos conicos/falcon 15 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Tubos conicos/falcon', '15 ml', NULL, 'vidrio', NULL, 'NVO00029', 'DISPONIBLE', 'NO_VOLUMETRICO', 19);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Tubos conicos/falcon 15 ml (plástico)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Tubos conicos/falcon', '15 ml', NULL, 'plástico', NULL, 'NVO00030', 'DISPONIBLE', 'NO_VOLUMETRICO', 18);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Tubo sin rosca', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Tubo sin rosca', NULL, NULL, NULL, NULL, 'NVO00031', 'BAJA', 'NO_VOLUMETRICO', 0);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Tubos de ensayo 20 ml 16 mm x 150 mm (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Tubos de ensayo', '20 ml', '16 mm x 150 mm', 'vidrio', NULL, 'NVO00032', 'DISPONIBLE', 'NO_VOLUMETRICO', 20);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Tubos de ensayo 25 ml 18 mm x 150 mm (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Tubos de ensayo', '25 ml', '18 mm x 150 mm', 'vidrio', NULL, 'NVO00033', 'DISPONIBLE', 'NO_VOLUMETRICO', 8);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Tubos de ensayo 14 ml 15 mm x 105 mm (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Tubos de ensayo', '14 ml', '15 mm x 105 mm', 'vidrio', NULL, 'NVO00034', 'BAJA', 'NO_VOLUMETRICO', 0);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Tubos de ensayo 2 ml 10 mm x 50 mm (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Tubos de ensayo', '2 ml', '10 mm x 50 mm', 'vidrio', NULL, 'NVO00035', 'BAJA', 'NO_VOLUMETRICO', 0);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Tubos de ensayo 5 ml 12 mm x 75 mm (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Tubos de ensayo', '5 ml', '12 mm x 75 mm', 'vidrio', NULL, 'NVO00036', 'DISPONIBLE', 'NO_VOLUMETRICO', 241);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Tubos de ensayo 3 ml 10 mm x 75 mm (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Tubos de ensayo', '3 ml', '10 mm x 75 mm', 'vidrio', NULL, 'NVO00037', 'DISPONIBLE', 'NO_VOLUMETRICO', 21);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Tubos de ensayo 3 ml 10 mm x 65 mm (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Tubos de ensayo', '3 ml', '10 mm x 65 mm', 'vidrio', NULL, 'NVO00038', 'DISPONIBLE', 'NO_VOLUMETRICO', 7);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Tubos de ensayo 10 ml 12 mm x 100 mm (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Tubos de ensayo', '10 ml', '12 mm x 100 mm', 'vidrio', NULL, 'NVO00039', 'DISPONIBLE', 'NO_VOLUMETRICO', 177);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Tubos de ensayo 30 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Tubos de ensayo', '30 ml', NULL, 'vidrio', NULL, 'NVO00040', 'BAJA', 'NO_VOLUMETRICO', 0);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Tubos de ensayo con tapadera de corcho 50 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Tubos de ensayo con tapadera de corcho', '50 ml', NULL, 'vidrio', NULL, 'NVO00041', 'BAJA', 'NO_VOLUMETRICO', 0);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Tubos de ensayo conico con tapadera de corcho 50 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Tubos de ensayo conico con tapadera de corcho', '50 ml', NULL, 'vidrio', NULL, 'NVO00042', 'BAJA', 'NO_VOLUMETRICO', 0);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Tubos de ensayo conico sin tapa 50 ml (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Tubos de ensayo conico sin tapa', '50 ml', NULL, 'vidrio', NULL, 'NVO00043', 'BAJA', 'NO_VOLUMETRICO', 0);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Tubo pipa de vidrio (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Tubo pipa de vidrio', NULL, NULL, 'vidrio', NULL, 'NVO00044', 'BAJA', 'NO_VOLUMETRICO', 0);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Embudo (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Embudo', NULL, NULL, 'vidrio', NULL, 'UTE00001', 'DISPONIBLE', 'UTENSILIO', 3);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Embudo (plástico)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Embudo', NULL, NULL, 'plástico', NULL, 'UTE00002', 'DISPONIBLE', 'UTENSILIO', 3);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Gradilla (plástico)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Gradilla', NULL, NULL, 'plástico', NULL, 'UTE00003', 'DISPONIBLE', 'UTENSILIO', 12);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Gradilla (metal)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Gradilla', NULL, NULL, 'metal', NULL, 'UTE00004', 'DISPONIBLE', 'UTENSILIO', 5);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Cajas petri (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Cajas petri', NULL, NULL, 'vidrio', NULL, 'UTE00005', 'DISPONIBLE', 'UTENSILIO', 35);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Cajas petri (plástico)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Cajas petri', NULL, NULL, 'plástico', NULL, 'UTE00006', 'DISPONIBLE', 'UTENSILIO', 12);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Propipetas (plástico)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Propipetas', NULL, NULL, 'plástico', NULL, 'UTE00007', 'DISPONIBLE', 'UTENSILIO', 13);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Termometro (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Termometro', NULL, NULL, 'vidrio', NULL, 'UTE00008', 'DISPONIBLE', 'UTENSILIO', 6);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Asas bacteriologicas (metal)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Asas bacteriologicas', NULL, NULL, 'metal', NULL, 'UTE00009', 'DISPONIBLE', 'UTENSILIO', 33);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Picetas (plástico)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Picetas', NULL, NULL, 'plástico', NULL, 'UTE00010', 'DISPONIBLE', 'UTENSILIO', 7);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Varillas de agitación (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Varillas de agitación', NULL, NULL, 'vidrio', NULL, 'UTE00011', 'BAJA', 'UTENSILIO', 0);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Guantes termicos', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Guantes termicos', NULL, NULL, NULL, NULL, 'UTE00012', 'DISPONIBLE', 'UTENSILIO', 2);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Mosquetas agitador magnetico', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Mosquetas agitador magnetico', NULL, NULL, NULL, NULL, 'UTE00013', 'DISPONIBLE', 'UTENSILIO', 2);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Espatulas/cucharas', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Espatulas/cucharas', NULL, NULL, NULL, NULL, 'UTE00014', 'DISPONIBLE', 'UTENSILIO', 10);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Mangueras mechero', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Mangueras mechero', NULL, NULL, NULL, '10 M', 'UTE00015', 'DISPONIBLE', 'UTENSILIO', 10);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Placas de vidrio con anillos (vidrio)', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Placas de vidrio con anillos', NULL, NULL, 'vidrio', NULL, 'UTE00016', 'DISPONIBLE', 'UTENSILIO', 3);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Cajas de puntillas de micropipeta', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Cajas de puntillas de micropipeta', NULL, NULL, NULL, NULL, 'UTE00017', 'DISPONIBLE', 'UTENSILIO', 3);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Pinzas para vaso 3 dedos 20cm', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Pinzas para vaso 3 dedos 20cm', NULL, NULL, NULL, NULL, 'UTE00018', 'DISPONIBLE', 'UTENSILIO', 6);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Pinza laboratorio', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Pinza laboratorio', NULL, NULL, NULL, NULL, 'UTE00019', 'BAJA', 'UTENSILIO', 0);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Condensador Graham 300mm', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Condensador Graham 300mm', NULL, NULL, NULL, NULL, 'UTE00020', 'BAJA', 'UTENSILIO', 0);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Soporte universal', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Soporte universal', NULL, NULL, 'metal', NULL, 'MET00001', 'DISPONIBLE', 'METAL', 2);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Mallas de asbesto', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Mallas de asbesto', NULL, NULL, 'metal', NULL, 'MET00002', 'DISPONIBLE', 'METAL', 55);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Mecheros bunsen', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Mecheros bunsen', NULL, NULL, 'metal', NULL, 'MET00003', 'DISPONIBLE', 'METAL', 33);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Mechero fisher', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Mechero fisher', NULL, NULL, 'metal', NULL, 'MET00004', 'DISPONIBLE', 'METAL', 1);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Tripodes 13 cm', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Tripodes', NULL, '13 cm', 'metal', NULL, 'MET00005', 'DISPONIBLE', 'METAL', 30);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Tripodes 15 cm', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Tripodes', NULL, '15 cm', 'metal', NULL, 'MET00006', 'DISPONIBLE', 'METAL', 1);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Aro para soporte universal 10 cm', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Aro para soporte universal', NULL, '10 cm', 'metal', NULL, 'MET00007', 'BAJA', 'METAL', 0);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Aro para soporte universal 7.5 cm', 'MATERIAL') RETURNING id_catalogo INTO id_cat;
    INSERT INTO materiales (fk_id_catalogo, nombre, volumen, medidas, composicion, notas, codigo, estado, categoria, cantidad) VALUES (id_cat, 'Aro para soporte universal', NULL, '7.5 cm', 'metal', NULL, 'MET00008', 'DISPONIBLE', 'METAL', 1);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Incubadora', 'EQUIPO_LAB') RETURNING id_catalogo INTO id_cat;
    INSERT INTO equipo_lab (fk_id_catalogo, nombre, notas, codigo, estado, cantidad) VALUES (id_cat, 'Incubadora', NULL, 'EQP00001', 'DISPONIBLE', 1);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Balanza digital', 'EQUIPO_LAB') RETURNING id_catalogo INTO id_cat;
    INSERT INTO equipo_lab (fk_id_catalogo, nombre, notas, codigo, estado, cantidad) VALUES (id_cat, 'Balanza digital', NULL, 'EQP00002', 'DISPONIBLE', 1);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Balanza Analitica', 'EQUIPO_LAB') RETURNING id_catalogo INTO id_cat;
    INSERT INTO equipo_lab (fk_id_catalogo, nombre, notas, codigo, estado, cantidad) VALUES (id_cat, 'Balanza Analitica', NULL, 'EQP00003', 'DISPONIBLE', 2);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Autoclave', 'EQUIPO_LAB') RETURNING id_catalogo INTO id_cat;
    INSERT INTO equipo_lab (fk_id_catalogo, nombre, notas, codigo, estado, cantidad) VALUES (id_cat, 'Autoclave', NULL, 'EQP00004', 'DISPONIBLE', 1);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Centrifuga clinica', 'EQUIPO_LAB') RETURNING id_catalogo INTO id_cat;
    INSERT INTO equipo_lab (fk_id_catalogo, nombre, notas, codigo, estado, cantidad) VALUES (id_cat, 'Centrifuga clinica', NULL, 'EQP00005', 'DISPONIBLE', 1);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Placa de calentamiento con agitacion', 'EQUIPO_LAB') RETURNING id_catalogo INTO id_cat;
    INSERT INTO equipo_lab (fk_id_catalogo, nombre, notas, codigo, estado, cantidad) VALUES (id_cat, 'Placa de calentamiento con agitacion', NULL, 'EQP00006', 'DISPONIBLE', 1);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Potenciometro', 'EQUIPO_LAB') RETURNING id_catalogo INTO id_cat;
    INSERT INTO equipo_lab (fk_id_catalogo, nombre, notas, codigo, estado, cantidad) VALUES (id_cat, 'Potenciometro', NULL, 'EQP00007', 'DISPONIBLE', 1);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Microscopios', 'EQUIPO_LAB') RETURNING id_catalogo INTO id_cat;
    INSERT INTO equipo_lab (fk_id_catalogo, nombre, notas, codigo, estado, cantidad) VALUES (id_cat, 'Microscopios', NULL, 'EQP00008', 'DISPONIBLE', 8);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Termociclador', 'EQUIPO_LAB') RETURNING id_catalogo INTO id_cat;
    INSERT INTO equipo_lab (fk_id_catalogo, nombre, notas, codigo, estado, cantidad) VALUES (id_cat, 'Termociclador', NULL, 'EQP00009', 'DISPONIBLE', 1);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Espectrofotometro', 'EQUIPO_LAB') RETURNING id_catalogo INTO id_cat;
    INSERT INTO equipo_lab (fk_id_catalogo, nombre, notas, codigo, estado, cantidad) VALUES (id_cat, 'Espectrofotometro', NULL, 'EQP00010', 'DISPONIBLE', 1);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Refrigerador', 'EQUIPO_LAB') RETURNING id_catalogo INTO id_cat;
    INSERT INTO equipo_lab (fk_id_catalogo, nombre, notas, codigo, estado, cantidad) VALUES (id_cat, 'Refrigerador', NULL, 'EQP00011', 'DISPONIBLE', 2);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Vortex', 'EQUIPO_LAB') RETURNING id_catalogo INTO id_cat;
    INSERT INTO equipo_lab (fk_id_catalogo, nombre, notas, codigo, estado, cantidad) VALUES (id_cat, 'Vortex', NULL, 'EQP00012', 'DISPONIBLE', 1);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Lector para microhematocrito. circular', 'EQUIPO_LAB') RETURNING id_catalogo INTO id_cat;
    INSERT INTO equipo_lab (fk_id_catalogo, nombre, notas, codigo, estado, cantidad) VALUES (id_cat, 'Lector para microhematocrito. circular', NULL, 'EQP00013', 'DISPONIBLE', 1);

    INSERT INTO catalogo (nombre, categoria) VALUES ('Tubos eppendorf', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Tubos eppendorf', 0, 'pzas', NULL, 0, 'CONSUMIBLE');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Medios de transporte', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Medios de transporte', 19, 'pzas', NULL, 0, 'CONSUMIBLE');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Tubos capilares', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Tubos capilares', 5, 'botes', NULL, 0, 'CONSUMIBLE');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Puntillas de micropipeta 10ul (CH)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Puntillas de micropipeta 10ul (CH)', 0, 'pzas', NULL, 0, 'CONSUMIBLE');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Puntillas de micropipeta 200ul (M)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Puntillas de micropipeta 200ul (M)', 0, 'pzas', NULL, 0, 'CONSUMIBLE');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Puntillas de micropipeta 1000ul (G)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Puntillas de micropipeta 1000ul (G)', 0, 'pzas', NULL, 0, 'CONSUMIBLE');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Lancetas', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Lancetas', 2, 'cajas', NULL, 0, 'CONSUMIBLE');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Tubos EDTA', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Tubos EDTA', 0, 'pzas', NULL, 0, 'CONSUMIBLE');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Porta objetos', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Porta objetos', 2, 'cajitas', NULL, 0, 'CONSUMIBLE');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Cubre objetos', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Cubre objetos', 10, 'pzas', NULL, 0, 'CONSUMIBLE');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Jeringas', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Jeringas', 3, 'pzas', NULL, 0, 'CONSUMIBLE');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Vacutainers', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Vacutainers', 0, 'pzas', NULL, 0, 'CONSUMIBLE');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Hidroxido de sodio (2.5 kg)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Hidroxido de sodio', 2, 'frasco 2.5 kg', '2022-01-01', 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Perlas de hidroxido de potasio (500 g)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Perlas de hidroxido de potasio', 2, 'frasco 500 g', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Fosfato de amonio monob (500 g)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Fosfato de amonio monob', 0, 'frasco 500 g', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Fosfato de amonio dib (500 g)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Fosfato de amonio dib', 2, 'frasco 500 g', '2022-06-01', 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Hidroxido de potasio (500 g)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Hidroxido de potasio', 2, 'frasco 500 g', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Acetato de sodio anh (100 g)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Acetato de sodio anh', 1, 'frasco 100 g', '2025-01-01', 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Acetato de sodio anh (500 g)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Acetato de sodio anh', 2, 'frasco 500 g', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Bicarbonato de sodio (500 g)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Bicarbonato de sodio', 3, 'frasco 500 g', '2025-01-01', 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Formiato de amonio (100 g)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Formiato de amonio', 1, 'frasco 100 g', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Fosfato de sodio monob (500 g)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Fosfato de sodio monob', 2, 'frasco 500 g', '2025-01-01', 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('EDTA sal disodica (500 g)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'EDTA sal disodica', 1, 'frasco 500 g', '2025-01-01', 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Acido sulfanilico (500 g)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Acido sulfanilico', 1, 'frasco 500 g', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Acido borico (500 g)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Acido borico', 2, 'frasco 500 g', '2025-01-01', 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Fosfato de sodio dib (500 g)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Fosfato de sodio dib', 2, 'frasco 500 g', '2025-01-01', 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Cloruro de sodio (500 g)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Cloruro de sodio', 3, 'frasco 500 g', '2025-01-01', 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Cloruro de calcio (500 g)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Cloruro de calcio', 1, 'frasco 500 g', '2028-01-01', 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Hidroxido de amonio (1000 ml)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Hidroxido de amonio', 1, 'frasco 1000 ml', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Acido acetico glacial (1000 ml)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Acido acetico glacial', 3, 'frasco 1000 ml', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Formaldehido (1000 ml)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Formaldehido', 1, 'frasco 1000 ml', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Alcohol etilico absoluto (1000 ml)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Alcohol etilico absoluto', 2, 'frasco 1000 ml', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('1-octanol (1000 ml)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, '1-octanol', 2, 'frasco 1000 ml', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Acetona (1000 ml)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Acetona', 1, 'frasco 1000 ml', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Alcohol iso propilico (1000 ml)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Alcohol iso propilico', 3, 'frasco 1000 ml', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Acido clorhidrico (1000 ml)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Acido clorhidrico', 6, 'frasco 1000 ml', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Glicerol (1000 ml)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Glicerol', 2, 'frasco 1000 ml', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Acido propionico (1000 ml)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Acido propionico', 2, 'frasco 1000 ml', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Acido formico (1000 ml)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Acido formico', 1, 'frasco 1000 ml', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Cloroformo (1000 ml)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Cloroformo', 1, 'frasco 1000 ml', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Acido sulfurico (1000 ml)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Acido sulfurico', 2, 'frasco 1000 ml', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Metanol (1000 ml)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Metanol', 1, 'frasco 1000 ml', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Acido formico (500 ml)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Acido formico', 1, 'frasco 500 ml', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Yodo solución al 2% (1000 ml)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Yodo solución al 2%', 1, 'frasco 1000 ml', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Tri base (500 g)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Tri base', 1, 'frasco 500 g', '2025-05-01', 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Peroxido de Hidrógeno (1000 ml)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Peroxido de Hidrógeno', 0, 'frasco 1000 ml', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Orceína Acética-clorhídrica (125 ml)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Orceína Acética-clorhídrica', 0, 'frasco 125 ml', '2025-10-26', 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Solucion buffer ph 4 (1000 ml)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Solucion buffer ph 4', 0, 'frasco 1000 ml', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Solucion buffer ph 7 (1000 ml)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Solucion buffer ph 7', 2, 'frasco 1000 ml', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Solucion buffer ph 10 (1000 ml)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Solucion buffer ph 10', 0, 'frasco 1000 ml', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Solución buffer para Giemsa en sangre (500 ml)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Solución buffer para Giemsa en sangre', 1, 'frasco 500 ml', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Buffer de referencia pH4 (1000 ml)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Buffer de referencia pH4', 1, 'frasco 1000 ml', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Buffer de referencia pH 10 (1000 ml)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Buffer de referencia pH 10', 1, 'frasco 1000 ml', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Buffer pH Trazable 10.012 (473 ml)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Buffer pH Trazable 10.012', 1, 'frasco 473 ml', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('EDTA (DI-SODICA) (1000 ml)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'EDTA (DI-SODICA)', 1, 'frasco 1000 ml', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Kit Hemocolorante rapido (3 (100 ml))', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Kit Hemocolorante rapido', 1, 'kit 3 (100 ml)', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Agar destroxa (450 g)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Agar destroxa', 1, 'frasco 450 g', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Agar infusion cerebro corazon (450 g)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Agar infusion cerebro corazon', 1, 'frasco 450 g', '2025-12-01', 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Agar sangre (450 g)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Agar sangre', 1, 'frasco 450 g', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Caldo de urea (450 g)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Caldo de urea', 1, 'frasco 450 g', '2013-06-01', 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Agar salmonella (450 g)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Agar salmonella', 1, 'frasco 450 g', '2018-12-01', 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Agar bilis rojo violeta (500 g)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Agar bilis rojo violeta', 1, 'frasco 500 g', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Caldo tetrationato (100 g)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Caldo tetrationato', 1, 'frasco 100 g', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Caldo tetrationato (450 g)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Caldo tetrationato', 1, 'frasco 450 g', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Agar de citrato de simmons (100 g)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Agar de citrato de simmons', 2, 'frasco 100 g', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Lactosa pura (500 g)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Lactosa pura', 2, 'frasco 500 g', '2025-02-01', 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Suero bovino albumina (50 g)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Suero bovino albumina', 1, 'frasco 50 g', '2023-07-01', 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Polisorbato 80 (500 g)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Polisorbato 80', 1, 'frasco 500 g', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Acrylamida (25 g)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Acrylamida', 0, 'frasco 25 g', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Lisozima (10 g)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Lisozima', 1, 'frasco 10 g', '2023-02-01', 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Eritorbato de sodio (500 g)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Eritorbato de sodio', 1, 'frasco 500 g', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Fenolftaleina (25 g)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Fenolftaleina', 1, 'frasco 25 g', '2026-01-01', 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Nitrato de plata (25 g)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Nitrato de plata', 2, 'frasco 25 g', '2025-01-01', 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Azul de bromofenol (10 g)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Azul de bromofenol', 2, 'frasco 10 g', '2025-01-01', 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Azul de Bromotimol (50 g)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Azul de Bromotimol', 1, 'frasco 50 g', '2023-12-01', 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Naranja de metilo (10 g)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Naranja de metilo', 1, 'frasco 10 g', '2026-01-01', 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Agua destilada (Galón)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Agua destilada', 3, 'galón', NULL, 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Benedic reactivó (500 ml)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Benedic reactivó', 1, 'frasco 500 ml', '2026-07-01', 0, 'REACTIVO');

    INSERT INTO catalogo (nombre, categoria) VALUES ('Solución alcohólica (840 ml)', 'CONSUMIBLES') RETURNING id_catalogo INTO id_cat;
    INSERT INTO consumibles (fk_id_catalogo, consumible, cantidad, unidad, caducidad, minimo_restock, tipo) VALUES (id_cat, 'Solución alcohólica', 0, 'frasco 840 ml', '2025-12-01', 0, 'REACTIVO');

  RAISE NOTICE 'Inventario 2026 importado.';
END
$$;
