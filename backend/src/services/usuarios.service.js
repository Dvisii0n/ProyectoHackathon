import bcrypt from 'bcryptjs';
import { conTransaccion, query } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import {
  enteroPositivo,
  textoRequerido,
  validarEnum,
} from '../utils/validaciones.js';

export const TIPOS_USUARIO = ['ALUMNO', 'PROFESOR', 'LABORATORISTA', 'ADMIN'];

const COLUMNAS_USUARIO = 'usuario_id, usuario, creado_en';

/** Normaliza el nombre de usuario para evitar duplicados por mayúsculas. */
export function normalizarUsuario(usuario) {
  return String(usuario).trim().toLowerCase();
}

/** Valida y normaliza los datos de registro según el tipo elegido. */
export function validarRegistro(datos = {}) {
  const usuario = normalizarUsuario(
    textoRequerido(datos.usuario, 'El usuario', { min: 3, max: 50 }),
  );

  if (typeof datos.contrasena !== 'string' || datos.contrasena.length < 4) {
    throw new ApiError(400, 'La contraseña debe tener al menos 4 caracteres');
  }

  const tipo = validarEnum(
    String(datos.tipo ?? '').trim().toUpperCase(),
    'tipo',
    TIPOS_USUARIO,
  );

  const nombre = textoRequerido(datos.nombre, 'El nombre', { max: 100 });
  const apellido = textoRequerido(datos.apellido, 'El apellido', { max: 100 });

  let matricula = null;
  let grupoId = null;

  if (tipo === 'ALUMNO') {
    matricula = textoRequerido(datos.matricula, 'La matrícula', { max: 50 });
    grupoId = enteroPositivo(datos.grupo_id ?? null, 'grupo_id', { permitirNulo: true });
  }

  return {
    usuario,
    contrasena: datos.contrasena,
    tipo,
    nombre,
    apellido,
    matricula,
    grupoId,
  };
}

/**
 * Crea el usuario y su perfil (alumno o personal) en una transacción.
 * Si algo falla, no queda ningún registro a medias.
 */
export async function crearUsuarioConPerfil(datos) {
  const hash = await bcrypt.hash(datos.contrasena, 10);

  return conTransaccion(async (cliente) => {
    const usuarioExistente = await cliente.query(
      'SELECT usuario_id FROM usuarios WHERE usuario = $1',
      [datos.usuario],
    );

    if (usuarioExistente.rowCount > 0) {
      throw new ApiError(409, 'Ese nombre de usuario ya está en uso');
    }

    if (datos.tipo === 'ALUMNO') {
      const matriculaExistente = await cliente.query(
        'SELECT alumno_id FROM alumnos WHERE matricula = $1',
        [datos.matricula],
      );

      if (matriculaExistente.rowCount > 0) {
        throw new ApiError(409, 'Ya existe un alumno con esa matrícula');
      }
    }

    const { rows } = await cliente.query(
      `INSERT INTO usuarios (usuario, contrasena)
       VALUES ($1, $2)
       RETURNING ${COLUMNAS_USUARIO}`,
      [datos.usuario, hash],
    );

    const usuario = rows[0];

    let perfil;

    if (datos.tipo === 'ALUMNO') {
      const resultado = await cliente.query(
        `INSERT INTO alumnos (nombre, apellido, matricula, usuario_id, grupo_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING alumno_id, nombre, apellido, matricula, usuario_id, grupo_id`,
        [datos.nombre, datos.apellido, datos.matricula, usuario.usuario_id, datos.grupoId],
      );

      perfil = resultado.rows[0];
    } else {
      const resultado = await cliente.query(
        `INSERT INTO personal (nombre, apellido, tipo, usuario_id)
         VALUES ($1, $2, $3, $4)
         RETURNING profesor_id, nombre, apellido, tipo, usuario_id`,
        [datos.nombre, datos.apellido, datos.tipo, usuario.usuario_id],
      );

      perfil = resultado.rows[0];
    }

    return { usuario, tipo: datos.tipo, perfil };
  });
}

/** Obtiene el tipo y el perfil asociado a un usuario. */
export async function obtenerPerfilUsuario(usuarioId) {
  const alumno = await query(
    `SELECT alumno_id, nombre, apellido, matricula, usuario_id, grupo_id
       FROM alumnos
      WHERE usuario_id = $1`,
    [usuarioId],
  );

  if (alumno.rowCount > 0) {
    return { tipo: 'ALUMNO', perfil: alumno.rows[0] };
  }

  const personal = await query(
    `SELECT profesor_id, nombre, apellido, tipo, usuario_id
       FROM personal
      WHERE usuario_id = $1`,
    [usuarioId],
  );

  if (personal.rowCount > 0) {
    return { tipo: personal.rows[0].tipo, perfil: personal.rows[0] };
  }

  return { tipo: null, perfil: null };
}
