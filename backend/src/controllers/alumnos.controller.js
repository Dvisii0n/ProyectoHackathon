import { query } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import {
  enteroPositivo,
  textoRequerido,
} from '../utils/validaciones.js';

const COLUMNAS = `a.alumno_id, a.nombre, a.apellido, a.matricula,
                  a.fk_usuario AS usuario_id, u.usuario,
                  a.fk_grupo_id AS grupo_id, g.grupo`;

const JOINS = `FROM alumnos a
               JOIN usuarios u ON u.usuario_id = a.fk_usuario
               LEFT JOIN grupo g ON g.grupo_id = a.fk_grupo_id`;

/** La matrícula es CHAR(8) en la base. */
function validarMatricula(matricula) {
  if (typeof matricula !== 'string' || matricula.trim().length !== 8) {
    throw new ApiError(400, 'La matrícula debe tener exactamente 8 caracteres');
  }

  return matricula.trim();
}

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
  const { nombre, apellido, matricula, usuario_id, grupo_id } = req.body ?? {};

  if (grupo_id === undefined || grupo_id === null) {
    throw new ApiError(400, 'grupo_id es obligatorio');
  }

  const { rows } = await query(
    `INSERT INTO alumnos (nombre, apellido, matricula, fk_usuario, fk_grupo_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING alumno_id, nombre, apellido, matricula,
               fk_usuario AS usuario_id, fk_grupo_id AS grupo_id`,
    [
      textoRequerido(nombre, 'El nombre', { max: 60 }),
      textoRequerido(apellido, 'El apellido', { max: 80 }),
      validarMatricula(matricula),
      enteroPositivo(usuario_id, 'usuario_id'),
      enteroPositivo(grupo_id, 'grupo_id'),
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
    valores.push(textoRequerido(nombre, 'El nombre', { max: 60 }));
    campos.push(`nombre = $${valores.length}`);
  }

  if (apellido !== undefined) {
    valores.push(textoRequerido(apellido, 'El apellido', { max: 80 }));
    campos.push(`apellido = $${valores.length}`);
  }

  if (matricula !== undefined) {
    valores.push(validarMatricula(matricula));
    campos.push(`matricula = $${valores.length}`);
  }

  if (usuario_id !== undefined) {
    valores.push(enteroPositivo(usuario_id, 'usuario_id'));
    campos.push(`fk_usuario = $${valores.length}`);
  }

  if (grupo_id !== undefined) {
    valores.push(enteroPositivo(grupo_id, 'grupo_id'));
    campos.push(`fk_grupo_id = $${valores.length}`);
  }

  if (campos.length === 0) {
    throw new ApiError(400, 'Envía al menos un campo para actualizar');
  }

  valores.push(id);

  const { rows } = await query(
    `UPDATE alumnos
        SET ${campos.join(', ')}
      WHERE alumno_id = $${valores.length}
      RETURNING alumno_id, nombre, apellido, matricula,
                fk_usuario AS usuario_id, fk_grupo_id AS grupo_id`,
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
