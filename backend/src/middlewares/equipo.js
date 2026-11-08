import { query } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Las solicitudes de material las hace el equipo: solo un integrante del equipo
 * puede crear o cambiar los renglones de su solicitud. Quien no es alumno
 * (laboratorista, profesor, administrador) solo puede quitar renglones, por ejemplo
 * cuando se borra una práctica.
 *
 * Debe usarse después de `autenticar`.
 */
export function soloIntegrantesDelEquipo(req, res, next) {
  comprobar(req).then(() => next(), next);
}

async function peticionDe(req) {
  if (req.method === 'POST') {
    const id = Number(req.body?.peticion_eq_id);
    return Number.isInteger(id) && id > 0 ? id : null;
  }

  const { rows } = await query('SELECT peticion_eq_id FROM peticion_catalogo WHERE peticion_catalogo_id = $1', [Number(req.params.id)]);
  return rows[0]?.peticion_eq_id ?? null;
}

async function comprobar(req) {
  const esAlumno = req.usuario?.tipo === 'ALUMNO';

  if (!esAlumno) {
    if (req.method === 'DELETE') return;
    throw new ApiError(403, 'La solicitud de material la hace el equipo: solo sus integrantes pueden pedir o cambiar materiales');
  }

  const peticionId = await peticionDe(req);

  if (peticionId === null) {
    // Sin petición no hay equipo que comprobar: el controlador responde 400/404
    return;
  }

  const { rowCount } = await query(
    `SELECT 1
       FROM peticion_eq pe
       JOIN equipo_integrantes ei ON ei.fk_id_equipo = pe.fk_id_equipo
       JOIN alumnos a ON a.alumno_id = ei.fk_id_alumno
      WHERE pe.peticion_eq_id = $1 AND a.fk_usuario = $2`,
    [peticionId, req.usuario.id],
  );

  if (rowCount === 0) {
    throw new ApiError(403, 'Solo los integrantes del equipo pueden pedir o cambiar su material');
  }
}
