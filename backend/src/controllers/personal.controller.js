import { query } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import {
  enteroPositivo,
  textoRequerido,
  validarEnum,
} from '../utils/validaciones.js';

// `rol_personal` solo admite PROFESOR y LABORATORISTA. El ADMIN vive en
// `usuarios.rol` y no tiene fila en esta tabla.
const TIPOS = ['PROFESOR', 'LABORATORISTA'];

const COLUMNAS = `p.profesor_id, p.nombre, p.apellido, p.rol AS tipo,
                  p.fk_usuario_id AS usuario_id, u.usuario`;

const JOINS = `FROM personal p
               JOIN usuarios u ON u.usuario_id = p.fk_usuario_id`;

/** GET /api/personal */
export async function listar(req, res) {
  const { rows } = await query(
    `SELECT ${COLUMNAS} ${JOINS} ORDER BY p.profesor_id`,
  );

  res.json({ personal: rows });
}

/** GET /api/personal/:id */
export async function obtener(req, res) {
  const id = enteroPositivo(req.params.id, 'id');

  const { rows } = await query(
    `SELECT ${COLUMNAS} ${JOINS} WHERE p.profesor_id = $1`,
    [id],
  );

  if (rows.length === 0) {
    throw new ApiError(404, 'Profesor no encontrado');
  }

  res.json({ personal: rows[0] });
}

/** POST /api/personal */
export async function crear(req, res) {
  const { nombre, apellido, tipo, usuario_id } = req.body ?? {};
  const tipoValidado = validarEnum(tipo, 'tipo', TIPOS);

  const { rows } = await query(
    `INSERT INTO personal (nombre, apellido, rol, fk_usuario_id)
     VALUES ($1, $2, $3, $4)
     RETURNING profesor_id, nombre, apellido,
               rol AS tipo, fk_usuario_id AS usuario_id`,
    [
      textoRequerido(nombre, 'El nombre', { max: 100 }),
      textoRequerido(apellido, 'El apellido', { max: 100 }),
      tipoValidado,
      enteroPositivo(usuario_id, 'usuario_id'),
    ],
  );

  res.status(201).json({ personal: rows[0] });
}

/** PATCH /api/personal/:id */
export async function actualizar(req, res) {
  const id = enteroPositivo(req.params.id, 'id');
  const { nombre, apellido, tipo, usuario_id } = req.body ?? {};
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

  if (tipo !== undefined) {
    valores.push(validarEnum(tipo, 'tipo', TIPOS));
    campos.push(`rol = $${valores.length}`);
  }

  if (usuario_id !== undefined) {
    valores.push(enteroPositivo(usuario_id, 'usuario_id'));
    campos.push(`fk_usuario_id = $${valores.length}`);
  }

  if (campos.length === 0) {
    throw new ApiError(400, 'Envía al menos un campo para actualizar');
  }

  valores.push(id);

  const { rows } = await query(
    `UPDATE personal
        SET ${campos.join(', ')}
      WHERE profesor_id = $${valores.length}
      RETURNING profesor_id, nombre, apellido,
                rol AS tipo, fk_usuario_id AS usuario_id`,
    valores,
  );

  if (rows.length === 0) {
    throw new ApiError(404, 'Profesor no encontrado');
  }

  res.json({ personal: rows[0] });
}

/** DELETE /api/personal/:id */
export async function eliminar(req, res) {
  const id = enteroPositivo(req.params.id, 'id');

  const { rowCount } = await query(
    'DELETE FROM personal WHERE profesor_id = $1',
    [id],
  );

  if (rowCount === 0) {
    throw new ApiError(404, 'Profesor no encontrado');
  }

  res.status(204).send();
}
