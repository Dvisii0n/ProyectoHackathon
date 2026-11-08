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

/** POST /api/auth/registro */
export async function registro(req, res) {
  const datos = validarRegistro(req.body ?? {});

  if (datos.tipo === 'ADMIN' && req.usuario.tipo !== 'ADMIN') {
    throw new ApiError(403, 'Solo un administrador puede registrar administradores');
  }

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
  const { usuario, contrasena } = req.body ?? {};

  if (typeof usuario !== 'string' || typeof contrasena !== 'string') {
    throw new ApiError(400, 'Usuario y contraseña son obligatorios');
  }

  const { rows } = await query(
    `SELECT usuario_id, usuario, contrasena, creado_en
       FROM usuarios
      WHERE usuario = $1`,
    [normalizarUsuario(usuario)],
  );

  const usuarioEncontrado = rows[0];

  if (!usuarioEncontrado || !(await bcrypt.compare(contrasena, usuarioEncontrado.contrasena))) {
    throw new ApiError(401, 'Credenciales inválidas');
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
    'SELECT usuario_id, usuario, creado_en FROM usuarios WHERE usuario_id = $1',
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
