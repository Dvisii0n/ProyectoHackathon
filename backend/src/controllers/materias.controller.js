import { query } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { enteroPositivo, textoRequerido } from '../utils/validaciones.js';

const COLUMNAS = `m.materia_id, m.nombre,
                  m.fk_carrera_id AS carrera_id, c.carrera`;

const JOINS = `FROM materias m
               JOIN carreras c ON c.carrera_id = m.fk_carrera_id`;

/** GET /api/materias */
export async function listar(req, res) {
  const { rows } = await query(
    `SELECT ${COLUMNAS} ${JOINS} ORDER BY m.materia_id`,
  );

  res.json({ materias: rows });
}

/** GET /api/materias/:id */
export async function obtener(req, res) {
  const id = enteroPositivo(req.params.id, 'id');

  const { rows } = await query(
    `SELECT ${COLUMNAS} ${JOINS} WHERE m.materia_id = $1`,
    [id],
  );

  if (rows.length === 0) {
    throw new ApiError(404, 'Materia no encontrada');
  }

  res.json({ materia: rows[0] });
}

/** POST /api/materias */
export async function crear(req, res) {
  const { nombre, carrera_id } = req.body ?? {};

  const { rows } = await query(
    `INSERT INTO materias (nombre, fk_carrera_id)
     VALUES ($1, $2)
     RETURNING materia_id, nombre, fk_carrera_id AS carrera_id`,
    [
      textoRequerido(nombre, 'El nombre', { max: 255 }),
      enteroPositivo(carrera_id, 'carrera_id'),
    ],
  );

  res.status(201).json({ materia: rows[0] });
}

/** PATCH /api/materias/:id */
export async function actualizar(req, res) {
  const id = enteroPositivo(req.params.id, 'id');
  const { nombre, carrera_id } = req.body ?? {};
  const campos = [];
  const valores = [];

  if (nombre !== undefined) {
    valores.push(textoRequerido(nombre, 'El nombre', { max: 255 }));
    campos.push(`nombre = $${valores.length}`);
  }

  if (carrera_id !== undefined) {
    valores.push(enteroPositivo(carrera_id, 'carrera_id'));
    campos.push(`fk_carrera_id = $${valores.length}`);
  }

  if (campos.length === 0) {
    throw new ApiError(400, 'Envía al menos un campo para actualizar');
  }

  valores.push(id);

  const { rows } = await query(
    `UPDATE materias
        SET ${campos.join(', ')}
      WHERE materia_id = $${valores.length}
      RETURNING materia_id, nombre, fk_carrera_id AS carrera_id`,
    valores,
  );

  if (rows.length === 0) {
    throw new ApiError(404, 'Materia no encontrada');
  }

  res.json({ materia: rows[0] });
}

/** DELETE /api/materias/:id */
export async function eliminar(req, res) {
  const id = enteroPositivo(req.params.id, 'id');

  const { rowCount } = await query(
    'DELETE FROM materias WHERE materia_id = $1',
    [id],
  );

  if (rowCount === 0) {
    throw new ApiError(404, 'Materia no encontrada');
  }

  res.status(204).send();
}
