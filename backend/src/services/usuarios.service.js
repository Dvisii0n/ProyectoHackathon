import bcrypt from 'bcryptjs';
import { conTransaccion, query } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import {
  enteroPositivo,
  textoRequerido,
  validarEnum,
} from '../utils/validaciones.js';

export const TIPOS_USUARIO = ['ALUMNO', 'PROFESOR', 'LABORATORISTA', 'ADMIN'];

const COLUMNAS_USUARIO = 'usuario_id, usuario, rol, activo, fecha_alta';

/** Normaliza el nombre de usuario para evitar duplicados por mayúsculas. */
export function normalizarUsuario(usuario) {
  return String(usuario).trim().toLowerCase();
}

/** Valida y normaliza los datos de registro según el tipo elegido. */
export function validarRegistro(datos = {}) {
  const usuario = normalizarUsuario(
    textoRequerido(datos.usuario, 'El usuario', { min: 3, max: 30 }),
  );

  if (typeof datos.contrasena !== 'string' || datos.contrasena.length < 4) {
    throw new ApiError(400, 'La contraseña debe tener al menos 4 caracteres');
  }

  const tipo = validarEnum(
    String(datos.tipo ?? '').trim().toUpperCase(),
    'tipo',
    TIPOS_USUARIO,
  );

  const esAlumno = tipo === 'ALUMNO';
  const nombre = textoRequerido(datos.nombre, 'El nombre', { max: esAlumno ? 60 : 100 });
  const apellido = textoRequerido(datos.apellido, 'El apellido', { max: esAlumno ? 80 : 100 });

  let matricula = null;
  let grupoId = null;

  if (esAlumno) {
    if (typeof datos.matricula !== 'string' || datos.matricula.trim().length !== 8) {
      throw new ApiError(400, 'La matrícula debe tener exactamente 8 caracteres');
    }

    matricula = datos.matricula.trim();

    if (datos.grupo_id === undefined || datos.grupo_id === null) {
      throw new ApiError(400, 'grupo_id es obligatorio para alumnos');
    }

    grupoId = enteroPositivo(datos.grupo_id, 'grupo_id');
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
 *
 * El rol ADMIN solo vive en `usuarios.rol`; no tiene fila en `personal`
 * porque el enum `rol_personal` únicamente admite PROFESOR y LABORATORISTA.
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
      `INSERT INTO usuarios (usuario, contrasena, rol)
       VALUES ($1, $2, $3)
       RETURNING ${COLUMNAS_USUARIO}`,
      [datos.usuario, hash, datos.tipo],
    );

    const usuario = rows[0];

    let perfil = null;

    if (datos.tipo === 'ALUMNO') {
      const resultado = await cliente.query(
        `INSERT INTO alumnos (nombre, apellido, matricula, fk_usuario, fk_grupo_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING alumno_id, nombre, apellido, matricula,
                   fk_usuario AS usuario_id, fk_grupo_id AS grupo_id`,
        [datos.nombre, datos.apellido, datos.matricula, usuario.usuario_id, datos.grupoId],
      );

      perfil = resultado.rows[0];
    } else if (datos.tipo === 'PROFESOR' || datos.tipo === 'LABORATORISTA') {
      const resultado = await cliente.query(
        `INSERT INTO personal (nombre, apellido, rol, fk_usuario_id)
         VALUES ($1, $2, $3, $4)
         RETURNING profesor_id, nombre, apellido,
                   rol AS tipo, fk_usuario_id AS usuario_id`,
        [datos.nombre, datos.apellido, datos.tipo, usuario.usuario_id],
      );

      perfil = resultado.rows[0];
    }

    return { usuario, tipo: datos.tipo, perfil };
  });
}

/** Obtiene el rol y el perfil asociado a un usuario. */
export async function obtenerPerfilUsuario(usuarioId) {
  const usuario = await query(
    'SELECT rol FROM usuarios WHERE usuario_id = $1',
    [usuarioId],
  );

  const tipo = usuario.rows[0]?.rol ?? null;

  if (tipo === 'ALUMNO') {
    const alumno = await query(
      `SELECT alumno_id, nombre, apellido, matricula,
              fk_usuario AS usuario_id, fk_grupo_id AS grupo_id
         FROM alumnos
        WHERE fk_usuario = $1`,
      [usuarioId],
    );

    if (alumno.rowCount > 0) {
      return { tipo, perfil: alumno.rows[0] };
    }
  }

  if (tipo === 'PROFESOR' || tipo === 'LABORATORISTA') {
    const personal = await query(
      `SELECT profesor_id, nombre, apellido,
              rol AS tipo, fk_usuario_id AS usuario_id
         FROM personal
        WHERE fk_usuario_id = $1`,
      [usuarioId],
    );

    if (personal.rowCount > 0) {
      return { tipo, perfil: personal.rows[0] };
    }
  }

  return { tipo, perfil: null };
}
