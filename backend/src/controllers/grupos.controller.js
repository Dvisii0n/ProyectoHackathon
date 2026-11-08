import { query } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { enteroPositivo, textoRequerido } from '../utils/validaciones.js';

const COLUMNAS = 'grupo_id, grupo';

/** GET /api/grupos */
export async function listar(req, res) {
  const { rows } = await query(
    `SELECT ${COLUMNAS} FROM grupo ORDER BY grupo_id`,
  );

  res.json({ grupos: rows });
}

/** GET /api/grupos/:id */
export async function obtener(req, res) {
  const id = enteroPositivo(req.params.id, 'id');

  const { rows } = await query(
    `SELECT ${COLUMNAS} FROM grupo WHERE grupo_id = $1`,
    [id],
  );

  if (rows.length === 0) {
    throw new ApiError(404, 'Grupo no encontrado');
  }

  res.json({ grupo: rows[0] });
}

/** POST /api/grupos */
export async function crear(req, res) {
  const { grupo } = req.body ?? {};

  const { rows } = await query(
    `INSERT INTO grupo (grupo)
     VALUES ($1)
     RETURNING ${COLUMNAS}`,
    [textoRequerido(grupo, 'El grupo', { max: 100 })],
  );

  res.status(201).json({ grupo: rows[0] });
}

/** PATCH /api/grupos/:id */
export async function actualizar(req, res) {
  const id = enteroPositivo(req.params.id, 'id');
  const { grupo } = req.body ?? {};

  if (grupo === undefined) {
    throw new ApiError(400, 'Envía al menos un campo para actualizar');
  }

  const { rows } = await query(
    `UPDATE grupo
        SET grupo = $1
      WHERE grupo_id = $2
      RETURNING ${COLUMNAS}`,
    [textoRequerido(grupo, 'El grupo', { max: 100 }), id],
  );

  if (rows.length === 0) {
    throw new ApiError(404, 'Grupo no encontrado');
  }

  res.json({ grupo: rows[0] });
}

/** DELETE /api/grupos/:id */
export async function eliminar(req, res) {
  const id = enteroPositivo(req.params.id, 'id');

  const { rowCount } = await query(
    'DELETE FROM grupo WHERE grupo_id = $1',
    [id],
  );

  if (rowCount === 0) {
    throw new ApiError(404, 'Grupo no encontrado');
  }

  res.status(204).send();
}
