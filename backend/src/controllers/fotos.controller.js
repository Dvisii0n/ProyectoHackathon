import { query } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { tipoDeImagen } from '../utils/imagen.js';
import { enteroPositivo } from '../utils/validaciones.js';

export const MAX_FOTOS_POR_ALUMNO = 10;
export const MAX_BYTES = 8 * 1024 * 1024;

/** El alumno de la sesión (o 403 si la cuenta no tiene perfil de alumno). */
async function alumnoDe(req) {
  const { rows } = await query('SELECT alumno_id FROM alumnos WHERE fk_usuario = $1', [req.usuario.id]);

  if (rows.length === 0) {
    throw new ApiError(403, 'Tu cuenta no tiene un perfil de alumno');
  }

  return rows[0].alumno_id;
}

/** POST /api/practicas/:id/fotos — un alumno sube UNA foto de su práctica (el cuerpo es la imagen) */
export async function subir(req, res) {
  const practicaId = enteroPositivo(req.params.id, 'id');
  const alumnoId = await alumnoDe(req);
  const archivo = req.body;

  if (!Buffer.isBuffer(archivo) || archivo.length === 0) {
    throw new ApiError(400, 'Envía la foto como cuerpo de la petición (Content-Type: image/*)');
  }

  const tipo = tipoDeImagen(archivo);

  if (!tipo) {
    throw new ApiError(400, 'El archivo no es una imagen válida (JPEG, PNG, WebP o HEIC)');
  }

  // Solo fotos de prácticas de su equipo, y una vez que la práctica empezó
  const practica = await query(
    `SELECT p.fecha_inicio <= LOCALTIMESTAMP AS empezo,
            EXISTS (
              SELECT 1
                FROM peticion_eq pe
                JOIN equipo_integrantes ei ON ei.fk_id_equipo = pe.fk_id_equipo
               WHERE pe.fk_id_practica = p.id_practicas AND ei.fk_id_alumno = $2
            ) AS es_suya
       FROM practicas p
      WHERE p.id_practicas = $1`,
    [practicaId, alumnoId],
  );

  if (practica.rowCount === 0) {
    throw new ApiError(404, 'Práctica no encontrada');
  }

  if (!practica.rows[0].es_suya) {
    throw new ApiError(403, 'Solo puedes subir fotos de las prácticas de tu equipo');
  }

  if (!practica.rows[0].empezo) {
    throw new ApiError(409, 'La práctica todavía no empieza: sube tus fotos cuando comience');
  }

  const nombre = req.get('X-Nombre-Archivo');
  const nombreLimpio = nombre ? decodeURIComponent(nombre).slice(0, 255) : null;

  // El límite se revisa en la misma sentencia que inserta, para que dos subidas a la vez no lo rebasen
  const { rows } = await query(
    `INSERT INTO fotos_practica (fk_id_practica, fk_id_alumno, tipo_mime, nombre_archivo, tamano, datos)
     SELECT $1, $2, $3, $4, $5, $6
      WHERE (SELECT COUNT(*) FROM fotos_practica WHERE fk_id_practica = $1 AND fk_id_alumno = $2) < $7
     RETURNING id_foto, fk_id_practica, fecha`,
    [practicaId, alumnoId, tipo, nombreLimpio, archivo.length, archivo, MAX_FOTOS_POR_ALUMNO],
  );

  if (rows.length === 0) {
    throw new ApiError(409, `Ya subiste el máximo de ${MAX_FOTOS_POR_ALUMNO} fotos de esta práctica`);
  }

  res.status(201).json({ foto: rows[0] });
}

/** GET /api/fotos/mias — cuántas fotos subió el alumno por práctica (sin las imágenes) */
export async function misConteos(req, res) {
  const alumnoId = await alumnoDe(req);

  const { rows } = await query(
    `SELECT fk_id_practica, COUNT(*)::int AS total
       FROM fotos_practica
      WHERE fk_id_alumno = $1
      GROUP BY fk_id_practica`,
    [alumnoId],
  );

  res.json({ conteos: rows, maximo: MAX_FOTOS_POR_ALUMNO });
}

/** GET /api/fotos — datos de todas las fotos, sin la imagen (solo ADMIN) */
export async function listar(req, res) {
  const { rows } = await query(
    `SELECT f.id_foto, f.fk_id_practica, p.nombre AS practica, p.fecha_inicio,
            f.fk_id_alumno, a.nombre AS alumno_nombre, a.apellido AS alumno_apellido,
            a.matricula, g.grupo, f.nombre_archivo, f.tamano, f.fecha
       FROM fotos_practica f
       JOIN practicas p ON p.id_practicas = f.fk_id_practica
       JOIN alumnos a   ON a.alumno_id = f.fk_id_alumno
       LEFT JOIN grupo g ON g.grupo_id = a.fk_grupo_id
      ORDER BY p.fecha_inicio DESC, f.fecha DESC`,
  );

  res.json({ fotos: rows });
}

/** GET /api/fotos/:id — la imagen (solo ADMIN) */
export async function obtener(req, res) {
  const id = enteroPositivo(req.params.id, 'id');
  const { rows } = await query('SELECT tipo_mime, datos FROM fotos_practica WHERE id_foto = $1', [id]);

  if (rows.length === 0) {
    throw new ApiError(404, 'Foto no encontrada');
  }

  res.set({
    'Content-Type': rows[0].tipo_mime,
    'Cache-Control': 'private, max-age=86400',
    'X-Content-Type-Options': 'nosniff',
  });
  res.send(rows[0].datos);
}

/** DELETE /api/fotos/:id (solo ADMIN) */
export async function eliminar(req, res) {
  const id = enteroPositivo(req.params.id, 'id');
  const { rowCount } = await query('DELETE FROM fotos_practica WHERE id_foto = $1', [id]);

  if (rowCount === 0) {
    throw new ApiError(404, 'Foto no encontrada');
  }

  res.status(204).send();
}
