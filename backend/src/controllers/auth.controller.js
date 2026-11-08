import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { firmarToken } from '../utils/jwt.js';
import {
  crearUsuarioConPerfil,
  normalizarUsuario,
  obtenerPerfilUsuario,
  validarRegistro,
} from '../services/usuarios.service.js';

const COLUMNAS_USUARIO = 'usuario_id, usuario, rol, activo, fecha_alta';

/** POST /api/auth/registro */
export async function registro(req, res) {
  const datos = validarRegistro(req.body ?? {});

  const { usuario, tipo, perfil } = await crearUsuarioConPerfil(datos);

  res.status(201).json({
    usuario,
    tipo,
    perfil,
    token: firmarToken({ ...usuario, tipo }),
  });
}

/** POST /api/auth/login */
export async function login(req, res) {
  // Se inicia sesión con el nombre de usuario. `correo` se acepta por
  // compatibilidad con clientes viejos, pero el esquema ya no lo almacena.
  const { usuario, correo, contrasena } = req.body ?? {};
  const identificador = typeof usuario === 'string' ? usuario : correo;

  if (typeof identificador !== 'string' || typeof contrasena !== 'string') {
    throw new ApiError(400, 'Usuario y contraseña son obligatorios');
  }

  const { rows } = await query(
    `SELECT usuario_id, usuario, rol, activo, fecha_alta, contrasena
       FROM usuarios
      WHERE usuario = $1
      LIMIT 1`,
    [normalizarUsuario(identificador)],
  );

  const usuarioEncontrado = rows[0];

  if (!usuarioEncontrado || !(await bcrypt.compare(contrasena, usuarioEncontrado.contrasena))) {
    throw new ApiError(401, 'Credenciales inválidas');
  }

  if (!usuarioEncontrado.activo) {
    throw new ApiError(403, 'La cuenta está desactivada');
  }

  delete usuarioEncontrado.contrasena;

  const { tipo, perfil } = await obtenerPerfilUsuario(usuarioEncontrado.usuario_id);

  res.json({
    usuario: usuarioEncontrado,
    tipo,
    perfil,
    token: firmarToken({ ...usuarioEncontrado, tipo }),
  });
}

/** GET /api/auth/perfil (requiere token) */
export async function perfil(req, res) {
  const { rows } = await query(
    `SELECT ${COLUMNAS_USUARIO} FROM usuarios WHERE usuario_id = $1`,
    [req.usuario.id],
  );

  if (rows.length === 0) {
    throw new ApiError(404, 'Usuario no encontrado');
  }

  const { tipo, perfil: datosPerfil } = await obtenerPerfilUsuario(req.usuario.id);

  res.json({
    usuario: rows[0],
    tipo,
    perfil: datosPerfil,
  });
}
