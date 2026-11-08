import { query } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { enteroPositivo, textoRequerido } from '../utils/validaciones.js';

const COLUMNAS = 'grupo_id, grupo';

/**
 * Los grupos se nombran semestre-número: "1-01" es semestre 1, grupo 1.
 * Se acepta "1-1" y se guarda como "1-01".
 */
function validarGrupo(valor) {
  const texto = textoRequerido(valor, 'El grupo', { min: 1, max: 10 });
  const partes = /^([1-9])\s*-\s*(\d{1,2})$/.exec(texto);

  if (!partes || Number(partes[2]) === 0) {
    throw new ApiError(400, 'El grupo debe ser semestre-número, por ejemplo 1-01 (semestre 1, grupo 1)');
  }

  return `${partes[1]}-${partes[2].padStart(2, '0')}`;
}

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
    [validarGrupo(grupo)],
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
    [validarGrupo(grupo), id],
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
