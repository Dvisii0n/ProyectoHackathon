-- =========================================================
-- SCRIPT COMPLETO POSTGRESQL
-- Sistema de Gestión de Laboratorio
-- =========================================================

-- =========================================================
-- 0. BASE DE DATOS (ejecutar por separado si es necesario)
-- =========================================================
-- CREATE DATABASE laboratorio_db
--     WITH ENCODING 'UTF8'
--     LC_COLLATE='es_MX.UTF-8'
--     LC_CTYPE='es_MX.UTF-8'
--     TEMPLATE=template0;
--
-- \c laboratorio_db

-- =========================================================
-- 1. TIPOS ENUM
-- =========================================================
CREATE TYPE rol_usuario AS ENUM ('ADMIN','PROFESOR','LABORATORISTA','ALUMNO');

CREATE TYPE carrera_enum AS ENUM (
    'LICENCIATURA EN CIENCIAS BIOMEDICAS',
    'LICENCIATURA EN PSICOLOGIA',
    'LICENCIATURA EN CRIMINALISTICA Y CIENCIAS PERICIALES'
);

CREATE TYPE rol_personal AS ENUM ('PROFESOR','LABORATORISTA');

CREATE TYPE categoria_catalogo AS ENUM ('MATERIAL','EQUIPO_LAB','CONSUMIBLES');

CREATE TYPE estado_inventario AS ENUM ('BAJA','PRESTADO','DISPONIBLE');

CREATE TYPE estado_bata AS ENUM ('RENTA','DISPONIBLE','LAVAR');

CREATE TYPE estado_fisico_bata AS ENUM ('BUENO','MALO','CON DEFECTO');

-- =========================================================
-- 2. TABLAS
-- =========================================================

-- ---------------------------------------------------------
-- 2.1 USUARIOS
-- ---------------------------------------------------------
CREATE TABLE usuarios (
    usuario_id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario      VARCHAR(30)  NOT NULL UNIQUE,
    contrasena   TEXT         NOT NULL,
    rol          rol_usuario  NOT NULL DEFAULT 'ALUMNO',
    activo       BOOLEAN      NOT NULL DEFAULT TRUE,
    fecha_alta   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- 2.2 CARRERAS
-- ---------------------------------------------------------
CREATE TABLE carreras (
    carrera_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    carrera    carrera_enum NOT NULL UNIQUE
);

-- ---------------------------------------------------------
-- 2.3 PERSONAL
-- ---------------------------------------------------------
CREATE TABLE personal (
    profesor_id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre        VARCHAR(100) NOT NULL,
    apellido      VARCHAR(100) NOT NULL,
    rol           rol_personal NOT NULL,
    fk_usuario_id INT NOT NULL,
    CONSTRAINT fk_personal_usuario
        FOREIGN KEY (fk_usuario_id) REFERENCES usuarios(usuario_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ---------------------------------------------------------
-- 2.4 MATERIAS
-- ---------------------------------------------------------
CREATE TABLE materias (
    materia_id     INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre         VARCHAR(255) NOT NULL,
    fk_carrera_id  INT NOT NULL,
    CONSTRAINT fk_materia_carrera
        FOREIGN KEY (fk_carrera_id) REFERENCES carreras(carrera_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ---------------------------------------------------------
-- 2.5 R_PROFESOR_MATERIA
-- ---------------------------------------------------------
CREATE TABLE r_profesor_materia (
    id_r_profesor_materia INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fk_materia            INT NOT NULL,
    fk_profesor           INT NOT NULL,
    CONSTRAINT fk_rpm_materia
        FOREIGN KEY (fk_materia)  REFERENCES materias(materia_id),
    CONSTRAINT fk_rpm_profesor
        FOREIGN KEY (fk_profesor) REFERENCES personal(profesor_id),
    CONSTRAINT uq_rpm UNIQUE (fk_materia, fk_profesor)
);

-- ---------------------------------------------------------
-- 2.6 GRUPO
-- ---------------------------------------------------------
CREATE TABLE grupo (
    grupo_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    grupo    VARCHAR(10) NOT NULL UNIQUE
);

-- ---------------------------------------------------------
-- 2.7 ALUMNOS
-- ---------------------------------------------------------
CREATE TABLE alumnos (
    alumno_id     INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre        VARCHAR(60) NOT NULL,
    apellido      VARCHAR(80) NOT NULL,
    matricula     CHAR(8)     NOT NULL UNIQUE,
    fk_usuario    INT NOT NULL,
    fk_grupo_id   INT NOT NULL,
    CONSTRAINT fk_alumno_usuario
        FOREIGN KEY (fk_usuario)  REFERENCES usuarios(usuario_id),
    CONSTRAINT fk_alumno_grupo
        FOREIGN KEY (fk_grupo_id) REFERENCES grupo(grupo_id)
);

-- ---------------------------------------------------------
-- 2.8 R_PROFMAT_GRUPO
-- ---------------------------------------------------------
CREATE TABLE r_profmat_grupo (
    fk_r_profesor_materia INT NOT NULL,
    fk_grupo              INT NOT NULL,
    PRIMARY KEY (fk_r_profesor_materia, fk_grupo),
    CONSTRAINT fk_rpmg_rpm
        FOREIGN KEY (fk_r_profesor_materia)
        REFERENCES r_profesor_materia(id_r_profesor_materia),
    CONSTRAINT fk_rpmg_grupo
        FOREIGN KEY (fk_grupo) REFERENCES grupo(grupo_id)
);

-- ---------------------------------------------------------
-- 2.9 CATALOGO
-- ---------------------------------------------------------
CREATE TABLE catalogo (
    id_catalogo INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    categoria   categoria_catalogo NOT NULL
);

-- ---------------------------------------------------------
-- 2.10 CONSUMIBLES
-- ---------------------------------------------------------
CREATE TABLE consumibles (
    id_consumibles   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fk_id_catalogo   INT NOT NULL,
    consumible       VARCHAR(50) NOT NULL,
    cantidad         INT NOT NULL DEFAULT 0,
    unidad           VARCHAR(20) NOT NULL,
    caducidad        TIMESTAMP NULL,
    minimo_restock   INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_consumible_catalogo
        FOREIGN KEY (fk_id_catalogo) REFERENCES catalogo(id_catalogo)
);

-- ---------------------------------------------------------
-- 2.11 EQUIPO_LAB
-- ---------------------------------------------------------
CREATE TABLE equipo_lab (
    id_equipo_lab  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fk_id_catalogo INT NOT NULL,
    nombre         VARCHAR(100) NOT NULL,
    mant_prev      VARCHAR(20)  NULL,
    notas          CHAR(100)    NULL,
    codigo         CHAR(8)      NOT NULL UNIQUE,
    estado         estado_inventario NOT NULL DEFAULT 'DISPONIBLE',
    CONSTRAINT fk_equipo_catalogo
        FOREIGN KEY (fk_id_catalogo) REFERENCES catalogo(id_catalogo)
);

-- ---------------------------------------------------------
-- 2.12 MATERIALES
-- ---------------------------------------------------------
CREATE TABLE materiales (
    id_materiales  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fk_id_catalogo INT NOT NULL,
    nombre         VARCHAR(100) NOT NULL,
    volumen        VARCHAR(10)  NULL,
    medidas        VARCHAR(50)  NULL,
    composicion    VARCHAR(30)  NULL,
    notas          VARCHAR(100) NULL,
    codigo         CHAR(8)      NOT NULL UNIQUE,
    estado         estado_inventario NOT NULL DEFAULT 'DISPONIBLE',
    CONSTRAINT fk_material_catalogo
        FOREIGN KEY (fk_id_catalogo) REFERENCES catalogo(id_catalogo)
);

-- ---------------------------------------------------------
-- 2.13 HISTORIAL_MANTENIMIENTO
-- ---------------------------------------------------------
CREATE TABLE historial_mantenimiento (
    id_historial_mantenimiento INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fecha            DATE         NOT NULL,
    encargado        VARCHAR(255) NOT NULL,
    fk_id_equipo_lab INT NOT NULL,
    CONSTRAINT fk_hist_equipo
        FOREIGN KEY (fk_id_equipo_lab) REFERENCES equipo_lab(id_equipo_lab)
);

-- ---------------------------------------------------------
-- 2.14 RIESGO_BIOLOGICO
-- ---------------------------------------------------------
CREATE TABLE riesgo_biologico (
    id_riesgo_biologico INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    objetos_recoleccion VARCHAR(100) NOT NULL,
    recolector          VARCHAR(100) NOT NULL,
    fk_id_personal      INT NOT NULL,
    fecha               TIMESTAMP NOT NULL,
    CONSTRAINT fk_riesgo_personal
        FOREIGN KEY (fk_id_personal) REFERENCES personal(profesor_id)
);

-- ---------------------------------------------------------
-- 2.15 PRACTICAS
-- ---------------------------------------------------------
CREATE TABLE practicas (
    id_practicas   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre         VARCHAR(100) NOT NULL,
    descripcion    VARCHAR(255) NULL,
    fecha_inicio   TIMESTAMP NOT NULL,
    fecha_final    TIMESTAMP NOT NULL,
    fk_id_personal INT NOT NULL,
    CONSTRAINT fk_practica_personal
        FOREIGN KEY (fk_id_personal) REFERENCES personal(profesor_id)
);

-- ---------------------------------------------------------
-- 2.16 EQUIPO (equipo de trabajo/alumnos)
-- ---------------------------------------------------------
CREATE TABLE equipo (
    equipo_id                INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    materia_id               INT NOT NULL,
    fk_id_r_profesor_materia INT NOT NULL,
    CONSTRAINT fk_equipo_materia
        FOREIGN KEY (materia_id) REFERENCES materias(materia_id),
    CONSTRAINT fk_equipo_rpm
        FOREIGN KEY (fk_id_r_profesor_materia)
        REFERENCES r_profesor_materia(id_r_profesor_materia)
);

-- ---------------------------------------------------------
-- 2.17 EQUIPO_INTEGRANTES
-- ---------------------------------------------------------
CREATE TABLE equipo_integrantes (
    fk_id_alumno INT NOT NULL,
    fk_id_equipo INT NOT NULL,
    PRIMARY KEY (fk_id_alumno, fk_id_equipo),
    CONSTRAINT fk_ei_alumno
        FOREIGN KEY (fk_id_alumno) REFERENCES alumnos(alumno_id),
    CONSTRAINT fk_ei_equipo
        FOREIGN KEY (fk_id_equipo) REFERENCES equipo(equipo_id)
);

-- ---------------------------------------------------------
-- 2.18 PETICION_EQ
-- ---------------------------------------------------------
CREATE TABLE peticion_eq (
    peticion_eq_id  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fk_id_practica  INT NOT NULL,
    fk_id_equipo    INT NOT NULL,
    CONSTRAINT fk_pet_practica
        FOREIGN KEY (fk_id_practica) REFERENCES practicas(id_practicas),
    CONSTRAINT fk_pet_equipo
        FOREIGN KEY (fk_id_equipo)   REFERENCES equipo(equipo_id)
);

-- ---------------------------------------------------------
-- 2.19 PETICION_CATALOGO
-- ---------------------------------------------------------
CREATE TABLE peticion_catalogo (
    peticion_catalogo_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    peticion_eq_id       INT NOT NULL,
    fk_id_catalogo       INT NOT NULL,
    cantidad             INT NOT NULL DEFAULT 1,
    CONSTRAINT fk_pc_peticion
        FOREIGN KEY (peticion_eq_id) REFERENCES peticion_eq(peticion_eq_id),
    CONSTRAINT fk_pc_catalogo
        FOREIGN KEY (fk_id_catalogo) REFERENCES catalogo(id_catalogo)
);

-- ---------------------------------------------------------
-- 2.20 APROBACION
-- ---------------------------------------------------------
CREATE TABLE aprobacion (
    aprobacion_id  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fk_equipo      INT NOT NULL,
    fk_id_practica INT NOT NULL,
    CONSTRAINT fk_aprob_equipo
        FOREIGN KEY (fk_equipo)      REFERENCES equipo(equipo_id),
    CONSTRAINT fk_aprob_practica
        FOREIGN KEY (fk_id_practica) REFERENCES practicas(id_practicas),
    CONSTRAINT uq_aprob UNIQUE (fk_equipo, fk_id_practica)
);

-- ---------------------------------------------------------
-- 2.21 APROB_MATERIALES
-- ---------------------------------------------------------
CREATE TABLE aprob_materiales (
    fk_id_material   INT NOT NULL,
    fk_id_aprobacion INT NOT NULL,
    PRIMARY KEY (fk_id_material, fk_id_aprobacion),
    CONSTRAINT fk_am_material
        FOREIGN KEY (fk_id_material)   REFERENCES materiales(id_materiales),
    CONSTRAINT fk_am_aprobacion
        FOREIGN KEY (fk_id_aprobacion) REFERENCES aprobacion(aprobacion_id)
);

-- ---------------------------------------------------------
-- 2.22 APROB_EQUIPO_LAB
-- ---------------------------------------------------------
CREATE TABLE aprob_equipo_lab (
    fk_id_equipo_lab INT NOT NULL,
    fk_id_aprobacion INT NOT NULL,
    PRIMARY KEY (fk_id_equipo_lab, fk_id_aprobacion),
    CONSTRAINT fk_ael_equipo
        FOREIGN KEY (fk_id_equipo_lab) REFERENCES equipo_lab(id_equipo_lab),
    CONSTRAINT fk_ael_aprobacion
        FOREIGN KEY (fk_id_aprobacion) REFERENCES aprobacion(aprobacion_id)
);

-- ---------------------------------------------------------
-- 2.23 APROB_CONSUMIBLES
-- ---------------------------------------------------------
CREATE TABLE aprob_consumibles (
    fk_id_consumible INT NOT NULL,
    fk_id_aprobacion INT NOT NULL,
    PRIMARY KEY (fk_id_consumible, fk_id_aprobacion),
    CONSTRAINT fk_ac_consumible
        FOREIGN KEY (fk_id_consumible) REFERENCES consumibles(id_consumibles),
    CONSTRAINT fk_ac_aprobacion
        FOREIGN KEY (fk_id_aprobacion) REFERENCES aprobacion(aprobacion_id)
);

-- ---------------------------------------------------------
-- 2.24 REPORTES
-- ---------------------------------------------------------
CREATE TABLE reportes (
    id_reportes INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titulo      VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    fecha       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- 2.25 BATAS_LAB
-- ---------------------------------------------------------
CREATE TABLE batas_lab (
    bata_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo  CHAR(8) NOT NULL UNIQUE,
    estado  estado_bata NOT NULL DEFAULT 'DISPONIBLE'
);

-- ---------------------------------------------------------
-- 2.26 RENTA_BATAS
-- ---------------------------------------------------------
CREATE TABLE renta_batas (
    id_renta_batas   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fk_id_alumno     INT NOT NULL,
    fk_id_bata       INT NOT NULL,
    fecha_inicio     TIMESTAMP NOT NULL,
    fecha_fin        TIMESTAMP NULL,
    estado_entregado estado_fisico_bata NOT NULL,
    estado_recibido  estado_fisico_bata NULL,
    comentario       VARCHAR(255) NULL,
    CONSTRAINT fk_rb_alumno
        FOREIGN KEY (fk_id_alumno) REFERENCES alumnos(alumno_id),
    CONSTRAINT fk_rb_bata
        FOREIGN KEY (fk_id_bata)   REFERENCES batas_lab(bata_id)
);

-- =========================================================
-- 3. ÍNDICES ADICIONALES
-- =========================================================
CREATE INDEX idx_alumnos_matricula       ON alumnos(matricula);
CREATE INDEX idx_equipo_lab_codigo       ON equipo_lab(codigo);
CREATE INDEX idx_materiales_codigo       ON materiales(codigo);
CREATE INDEX idx_batas_codigo            ON batas_lab(codigo);
CREATE INDEX idx_peticion_eq_practica    ON peticion_eq(fk_id_practica);
CREATE INDEX idx_peticion_eq_equipo      ON peticion_eq(fk_id_equipo);
CREATE INDEX idx_aprobacion_practica     ON aprobacion(fk_id_practica);
CREATE INDEX idx_aprobacion_equipo       ON aprobacion(fk_equipo);
CREATE INDEX idx_riesgo_personal         ON riesgo_biologico(fk_id_personal);
CREATE INDEX idx_hist_mant_equipo        ON historial_mantenimiento(fk_id_equipo_lab);

-- =========================================================
-- FIN DEL SCRIPT
-- =========================================================