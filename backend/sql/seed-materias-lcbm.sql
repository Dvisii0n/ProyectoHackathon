-- =========================================================
-- Materias de laboratorio del plan LCBM 2025
-- (Licenciatura en Ciencias Biomédicas, ver LCBM-2025.jpg)
--
-- Idempotente: se puede correr varias veces sin duplicar.
--   psql -d hackathon -f sql/seed-materias-lcbm.sql
-- =========================================================

INSERT INTO materias (nombre, fk_carrera_id)
SELECT m.nombre, c.carrera_id
  FROM (VALUES
          ('Introducción al Laboratorio de Biomedicina'), -- Semestre 1
          ('Laboratorio de Química'),                     -- Semestre 2
          ('Laboratorio de Microbiología'),               -- Semestre 3
          ('Laboratorio de Genética'),                    -- Semestre 4
          ('Laboratorio de Biología Molecular')           -- Semestre 5
       ) AS m(nombre)
  JOIN carreras c ON c.carrera = 'LICENCIATURA EN CIENCIAS BIOMEDICAS'
 WHERE NOT EXISTS (
         SELECT 1
           FROM materias x
          WHERE x.nombre = m.nombre
            AND x.fk_carrera_id = c.carrera_id
       );
