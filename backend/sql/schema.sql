-- Esquema de la API.
-- Ejecutar con: npm run db:init

-- Tipo para distinguir al personal académico.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_personal') THEN
    CREATE TYPE tipo_personal AS ENUM ('PROFESOR', 'LABORATORISTA', 'ADMIN');
  END IF;
END
$$;

-- Permite actualizar instalaciones que ya tenían el enum sin ADMIN.
ALTER TYPE tipo_personal ADD VALUE IF NOT EXISTS 'ADMIN';

-- TABLA 1: USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
  usuario_id BIGSERIAL PRIMARY KEY,
  usuario TEXT NOT NULL UNIQUE,
  contrasena TEXT NOT NULL,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TABLA 2: CARRERAS
CREATE TABLE IF NOT EXISTS carreras (
  carrera_id BIGSERIAL PRIMARY KEY,
  carrera TEXT NOT NULL UNIQUE
);

-- TABLA 7: GRUPO
CREATE TABLE IF NOT EXISTS grupo (
  grupo_id BIGSERIAL PRIMARY KEY,
  grupo TEXT NOT NULL UNIQUE
);

-- TABLA 4: MATERIAS
CREATE TABLE IF NOT EXISTS materias (
  materia_id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  carrera_id BIGINT NOT NULL REFERENCES carreras(carrera_id) ON DELETE RESTRICT,
  UNIQUE (nombre, carrera_id)
);

-- TABLA 3: PERSONAL
CREATE TABLE IF NOT EXISTS personal (
  profesor_id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  tipo tipo_personal NOT NULL,
  usuario_id BIGINT NOT NULL UNIQUE REFERENCES usuarios(usuario_id) ON DELETE CASCADE
);

-- TABLA 6: ALUMNOS
CREATE TABLE IF NOT EXISTS alumnos (
  alumno_id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  matricula TEXT NOT NULL UNIQUE,
  usuario_id BIGINT NOT NULL UNIQUE REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
  grupo_id BIGINT REFERENCES grupo(grupo_id) ON DELETE SET NULL
);

-- Tabla de prueba: tareas por usuario.
CREATE TABLE IF NOT EXISTS tareas (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT NOT NULL REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  completada BOOLEAN NOT NULL DEFAULT false,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_materias_carrera_id ON materias (carrera_id);
CREATE INDEX IF NOT EXISTS idx_alumnos_grupo_id ON alumnos (grupo_id);
CREATE INDEX IF NOT EXISTS idx_tareas_usuario_id ON tareas (usuario_id);
