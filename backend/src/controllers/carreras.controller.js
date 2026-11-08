import { query } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { enteroPositivo, textoRequerido, validarEnum } from '../utils/validaciones.js';

const CARRERAS_VALIDAS = [
  'LICENCIATURA EN CIENCIAS BIOMEDICAS',
  'LICENCIATURA EN PSICOLOGIA',
  'LICENCIATURA EN CRIMINALISTICA Y CIENCIAS PERICIALES',
];

const COLUMNAS = 'carrera_id, carrera';

function validarCarrera(valor) {
  return validarEnum(
    String(valor ?? '').trim().toUpperCase(),
    'carrera',
    CARRERAS_VALIDAS,
  );
}

/** GET /api/carreras */
export async function listar(req, res) {
  const { rows } = await query(
    `SELECT ${COLUMNAS} FROM carreras ORDER BY carrera_id`,
  );

  res.json({ carreras: rows });
}

/** GET /api/carreras/:id */
export async function obtener(req, res) {
  const id = enteroPositivo(req.params.id, 'id');

  const { rows } = await query(
    `SELECT ${COLUMNAS} FROM carreras WHERE carrera_id = $1`,
    [id],
  );

  if (rows.length === 0) {
    throw new ApiError(404, 'Carrera no encontrada');
  }

  res.json({ carrera: rows[0] });
}

/** POST /api/carreras */
export async function crear(req, res) {
  const { carrera } = req.body ?? {};

  const { rows } = await query(
    `INSERT INTO carreras (carrera)
     VALUES ($1)
     RETURNING ${COLUMNAS}`,
    [validarCarrera(carrera)],
  );

  res.status(201).json({ carrera: rows[0] });
}

/** PATCH /api/carreras/:id */
export async function actualizar(req, res) {
  const id = enteroPositivo(req.params.id, 'id');
  const { carrera } = req.body ?? {};

  if (carrera === undefined) {
    throw new ApiError(400, 'Envía al menos un campo para actualizar');
  }

  const { rows } = await query(
    `UPDATE carreras
        SET carrera = $1
      WHERE carrera_id = $2
      RETURNING ${COLUMNAS}`,
    [validarCarrera(carrera), id],
  );

  if (rows.length === 0) {
    throw new ApiError(404, 'Carrera no encontrada');
  }

  res.json({ carrera: rows[0] });
}

/** DELETE /api/carreras/:id */
export async function eliminar(req, res) {
  const id = enteroPositivo(req.params.id, 'id');

  const { rowCount } = await query(
    'DELETE FROM carreras WHERE carrera_id = $1',
    [id],
  );

  if (rowCount === 0) {
    throw new ApiError(404, 'Carrera no encontrada');
  }

  res.status(204).send();
}
