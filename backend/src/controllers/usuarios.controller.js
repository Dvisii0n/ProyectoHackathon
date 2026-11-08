import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { enteroPositivo, textoRequerido, validarEnum } from '../utils/validaciones.js';

const COLUMNAS = 'usuario_id, usuario, rol, activo, fecha_alta';

const ROLES = ['ADMIN', 'PROFESOR', 'LABORATORISTA', 'ALUMNO'];

function normalizarUsuario(usuario) {
  return String(usuario).trim().toLowerCase();
}

function validarUsuario(usuario) {
  return normalizarUsuario(textoRequerido(usuario, 'El usuario', { min: 3, max: 30 }));
}

function validarContrasena(contrasena) {
  if (typeof contrasena !== 'string' || contrasena.length < 4) {
    throw new ApiError(400, 'La contraseña debe tener al menos 4 caracteres');
  }

  return contrasena;
}

function validarRol(valor) {
  return validarEnum(
    String(valor ?? '').trim().toUpperCase(),
    'rol',
    ROLES,
  );
}

function validarActivo(valor) {
  if (typeof valor !== 'boolean') {
    throw new ApiError(400, 'El campo "activo" debe ser booleano');
  }

  return valor;
}

/** GET /api/usuarios */
export async function listar(req, res) {
  const { rows } = await query(
    `SELECT ${COLUMNAS} FROM usuarios ORDER BY usuario_id`,
  );

  res.json({ usuarios: rows });
}

/** GET /api/usuarios/:id */
export async function obtener(req, res) {
  const id = enteroPositivo(req.params.id, 'id');

  const { rows } = await query(
    `SELECT ${COLUMNAS} FROM usuarios WHERE usuario_id = $1`,
    [id],
  );

  if (rows.length === 0) {
    throw new ApiError(404, 'Usuario no encontrado');
  }

  res.json({ usuario: rows[0] });
}

/** POST /api/usuarios */
export async function crear(req, res) {
  const { usuario, contrasena, rol, tipo, activo = true } = req.body ?? {};

  const usuarioNormalizado = validarUsuario(usuario);
  validarContrasena(contrasena);
  const rolValidado = validarRol(rol ?? tipo);
  const activoValidado = validarActivo(activo);

  const existente = await query(
    'SELECT usuario_id FROM usuarios WHERE usuario = $1',
    [usuarioNormalizado],
  );

  if (existente.rowCount > 0) {
    throw new ApiError(409, 'Ese nombre de usuario ya está en uso');
  }

  const hash = await bcrypt.hash(contrasena, 10);

  const { rows } = await query(
    `INSERT INTO usuarios (usuario, contrasena, rol, activo)
     VALUES ($1, $2, $3, $4)
     RETURNING ${COLUMNAS}`,
    [usuarioNormalizado, hash, rolValidado, activoValidado],
  );

  res.status(201).json({ usuario: rows[0] });
}

/** PATCH /api/usuarios/:id */
export async function actualizar(req, res) {
  const id = enteroPositivo(req.params.id, 'id');
  const { usuario, contrasena, rol, tipo, activo } = req.body ?? {};
  const campos = [];
  const valores = [];

  if (usuario !== undefined) {
    valores.push(validarUsuario(usuario));
    campos.push(`usuario = $${valores.length}`);
  }

  if (rol !== undefined || tipo !== undefined) {
    const rolValidado = validarRol(rol ?? tipo);

    valores.push(rolValidado);
    campos.push(`rol = $${valores.length}`);
  }

  if (activo !== undefined) {
    valores.push(validarActivo(activo));
    campos.push(`activo = $${valores.length}`);
  }

  if (contrasena !== undefined) {
    validarContrasena(contrasena);
    valores.push(await bcrypt.hash(contrasena, 10));
    campos.push(`contrasena = $${valores.length}`);
  }

  if (campos.length === 0) {
    throw new ApiError(400, 'Envía al menos un campo para actualizar');
  }

  valores.push(id);

  const { rows } = await query(
    `UPDATE usuarios
        SET ${campos.join(', ')}
      WHERE usuario_id = $${valores.length}
      RETURNING ${COLUMNAS}`,
    valores,
  );

  if (rows.length === 0) {
    throw new ApiError(404, 'Usuario no encontrado');
  }

  res.json({ usuario: rows[0] });
}

/** DELETE /api/usuarios/:id */
export async function eliminar(req, res) {
  const id = enteroPositivo(req.params.id, 'id');

  const { rowCount } = await query(
    'DELETE FROM usuarios WHERE usuario_id = $1',
    [id],
  );

  if (rowCount === 0) {
    throw new ApiError(404, 'Usuario no encontrado');
  }

  res.status(204).send();
}
