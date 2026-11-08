import { query } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import {
  enteroPositivo,
  textoRequerido,
} from '../utils/validaciones.js';

const COLUMNAS = `a.alumno_id, a.nombre, a.apellido, a.matricula,
                  a.usuario_id, u.usuario, a.grupo_id, g.grupo`;

const JOINS = `FROM alumnos a
               JOIN usuarios u ON u.usuario_id = a.usuario_id
               LEFT JOIN grupo g ON g.grupo_id = a.grupo_id`;

/** GET /api/alumnos */
export async function listar(req, res) {
  const { rows } = await query(
    `SELECT ${COLUMNAS} ${JOINS} ORDER BY a.alumno_id`,
  );

  res.json({ alumnos: rows });
}

/** GET /api/alumnos/:id */
export async function obtener(req, res) {
  const id = enteroPositivo(req.params.id, 'id');

  const { rows } = await query(
    `SELECT ${COLUMNAS} ${JOINS} WHERE a.alumno_id = $1`,
    [id],
  );

  if (rows.length === 0) {
    throw new ApiError(404, 'Alumno no encontrado');
  }

  res.json({ alumno: rows[0] });
}

/** POST /api/alumnos */
export async function crear(req, res) {
  const { nombre, apellido, matricula, usuario_id, grupo_id = null } = req.body ?? {};

  const { rows } = await query(
    `INSERT INTO alumnos (nombre, apellido, matricula, usuario_id, grupo_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING alumno_id, nombre, apellido, matricula, usuario_id, grupo_id`,
    [
      textoRequerido(nombre, 'El nombre', { max: 100 }),
      textoRequerido(apellido, 'El apellido', { max: 100 }),
      textoRequerido(matricula, 'La matrícula', { max: 50 }),
      enteroPositivo(usuario_id, 'usuario_id'),
      enteroPositivo(grupo_id, 'grupo_id', { permitirNulo: true }),
    ],
  );

  res.status(201).json({ alumno: rows[0] });
}

/** PATCH /api/alumnos/:id */
export async function actualizar(req, res) {
  const id = enteroPositivo(req.params.id, 'id');
  const { nombre, apellido, matricula, usuario_id, grupo_id } = req.body ?? {};
  const campos = [];
  const valores = [];

  if (nombre !== undefined) {
    valores.push(textoRequerido(nombre, 'El nombre', { max: 100 }));
    campos.push(`nombre = $${valores.length}`);
  }

  if (apellido !== undefined) {
    valores.push(textoRequerido(apellido, 'El apellido', { max: 100 }));
    campos.push(`apellido = $${valores.length}`);
  }

  if (matricula !== undefined) {
    valores.push(textoRequerido(matricula, 'La matrícula', { max: 50 }));
    campos.push(`matricula = $${valores.length}`);
  }

  if (usuario_id !== undefined) {
    valores.push(enteroPositivo(usuario_id, 'usuario_id'));
    campos.push(`usuario_id = $${valores.length}`);
  }

  if (grupo_id !== undefined) {
    valores.push(enteroPositivo(grupo_id, 'grupo_id', { permitirNulo: true }));
    campos.push(`grupo_id = $${valores.length}`);
  }

  if (campos.length === 0) {
    throw new ApiError(400, 'Envía al menos un campo para actualizar');
  }

  valores.push(id);

  const { rows } = await query(
    `UPDATE alumnos
        SET ${campos.join(', ')}
      WHERE alumno_id = $${valores.length}
      RETURNING alumno_id, nombre, apellido, matricula, usuario_id, grupo_id`,
    valores,
  );

  if (rows.length === 0) {
    throw new ApiError(404, 'Alumno no encontrado');
  }

  res.json({ alumno: rows[0] });
}

/** DELETE /api/alumnos/:id */
export async function eliminar(req, res) {
  const id = enteroPositivo(req.params.id, 'id');

  const { rowCount } = await query(
    'DELETE FROM alumnos WHERE alumno_id = $1',
    [id],
  );

  if (rowCount === 0) {
    throw new ApiError(404, 'Alumno no encontrado');
  }

  res.status(204).send();
}
