import { query } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';

const COLUMNAS = 'id, titulo, descripcion, completada, creado_en, actualizado_en';

function validarTitulo(titulo) {
  if (typeof titulo !== 'string' || titulo.trim().length === 0) {
    throw new ApiError(400, 'El título es obligatorio');
  }

  if (titulo.trim().length > 200) {
    throw new ApiError(400, 'El título no puede superar los 200 caracteres');
  }

  return titulo.trim();
}

function validarDescripcion(descripcion) {
  if (descripcion === undefined || descripcion === null) {
    return null;
  }

  if (typeof descripcion !== 'string') {
    throw new ApiError(400, 'La descripción debe ser texto');
  }

  return descripcion.trim();
}

function validarCompletada(completada) {
  if (typeof completada !== 'boolean') {
    throw new ApiError(400, 'El campo "completada" debe ser booleano');
  }

  return completada;
}

/** GET /api/tareas */
export async function listar(req, res) {
  const { rows } = await query(
    `SELECT ${COLUMNAS}
       FROM tareas
      WHERE usuario_id = $1
      ORDER BY id DESC`,
    [req.usuario.id],
  );

  res.json({ tareas: rows });
}

/** GET /api/tareas/:id */
export async function obtener(req, res) {
  const { rows } = await query(
    `SELECT ${COLUMNAS}
       FROM tareas
      WHERE id = $1 AND usuario_id = $2`,
    [req.params.id, req.usuario.id],
  );

  if (rows.length === 0) {
    throw new ApiError(404, 'Tarea no encontrada');
  }

  res.json({ tarea: rows[0] });
}

/** POST /api/tareas */
export async function crear(req, res) {
  const { titulo, descripcion, completada = false } = req.body ?? {};

  const { rows } = await query(
    `INSERT INTO tareas (usuario_id, titulo, descripcion, completada)
     VALUES ($1, $2, $3, $4)
     RETURNING ${COLUMNAS}`,
    [
      req.usuario.id,
      validarTitulo(titulo),
      validarDescripcion(descripcion),
      validarCompletada(completada),
    ],
  );

  res.status(201).json({ tarea: rows[0] });
}

/** PATCH /api/tareas/:id */
export async function actualizar(req, res) {
  const { titulo, descripcion, completada } = req.body ?? {};
  const campos = [];
  const valores = [];

  if (titulo !== undefined) {
    valores.push(validarTitulo(titulo));
    campos.push(`titulo = $${valores.length}`);
  }

  if (descripcion !== undefined) {
    valores.push(validarDescripcion(descripcion));
    campos.push(`descripcion = $${valores.length}`);
  }

  if (completada !== undefined) {
    valores.push(validarCompletada(completada));
    campos.push(`completada = $${valores.length}`);
  }

  if (campos.length === 0) {
    throw new ApiError(400, 'Envía al menos un campo para actualizar');
  }

  valores.push(req.params.id, req.usuario.id);

  const { rows } = await query(
    `UPDATE tareas
        SET ${campos.join(', ')}, actualizado_en = now()
      WHERE id = $${valores.length - 1} AND usuario_id = $${valores.length}
      RETURNING ${COLUMNAS}`,
    valores,
  );

  if (rows.length === 0) {
    throw new ApiError(404, 'Tarea no encontrada');
  }

  res.json({ tarea: rows[0] });
}

/** DELETE /api/tareas/:id */
export async function eliminar(req, res) {
  const { rowCount } = await query(
    'DELETE FROM tareas WHERE id = $1 AND usuario_id = $2',
    [req.params.id, req.usuario.id],
  );

  if (rowCount === 0) {
    throw new ApiError(404, 'Tarea no encontrada');
  }

  res.status(204).send();
}
