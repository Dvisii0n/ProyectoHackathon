import { query } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { tipoDeImagen } from '../utils/imagen.js';
import { enteroPositivo } from '../utils/validaciones.js';

export const MAX_EVIDENCIAS = 5;
export const MAX_BYTES = 8 * 1024 * 1024;

const COLUMNAS = 'id_evidencia, fk_id_reporte, tipo_mime, nombre_archivo, tamano, fecha';

/** GET /api/evidencias — datos (sin la imagen) de todas las evidencias */
export async function listar(req, res) {
  const { rows } = await query(
    `SELECT ${COLUMNAS} FROM evidencias_reporte ORDER BY fk_id_reporte, id_evidencia`,
  );

  res.json({ evidencias: rows });
}

/** GET /api/reportes/:id/evidencias — evidencias de un reporte */
export async function listarDeReporte(req, res) {
  const id = enteroPositivo(req.params.id, 'id');

  const { rows } = await query(
    `SELECT ${COLUMNAS} FROM evidencias_reporte WHERE fk_id_reporte = $1 ORDER BY id_evidencia`,
    [id],
  );

  res.json({ evidencias: rows });
}

/** GET /api/evidencias/:id — la imagen */
export async function obtener(req, res) {
  const id = enteroPositivo(req.params.id, 'id');

  const { rows } = await query(
    'SELECT tipo_mime, datos FROM evidencias_reporte WHERE id_evidencia = $1',
    [id],
  );

  if (rows.length === 0) {
    throw new ApiError(404, 'Evidencia no encontrada');
  }

  res.set({
    'Content-Type': rows[0].tipo_mime,
    'Cache-Control': 'private, max-age=86400',
    'X-Content-Type-Options': 'nosniff',
  });
  res.send(rows[0].datos);
}

/** POST /api/reportes/:id/evidencias — sube UNA foto (el cuerpo es la imagen) */
export async function subir(req, res) {
  const id = enteroPositivo(req.params.id, 'id');
  const archivo = req.body;

  if (!Buffer.isBuffer(archivo) || archivo.length === 0) {
    throw new ApiError(400, 'Envía la foto como cuerpo de la petición (Content-Type: image/*)');
  }

  const tipo = tipoDeImagen(archivo);

  if (!tipo) {
    throw new ApiError(400, 'El archivo no es una imagen válida (JPEG, PNG, WebP o HEIC)');
  }

  const nombre = req.get('X-Nombre-Archivo');
  const nombreLimpio = nombre ? decodeURIComponent(nombre).slice(0, 255) : null;

  // El límite de 5 se revisa en la misma sentencia que inserta, para que dos
  // subidas a la vez no lo rebasen.
  const { rows } = await query(
    `INSERT INTO evidencias_reporte (fk_id_reporte, tipo_mime, nombre_archivo, tamano, datos)
     SELECT r.id_reportes, $2, $3, $4, $5
       FROM reportes r
      WHERE r.id_reportes = $1
        AND (SELECT COUNT(*) FROM evidencias_reporte WHERE fk_id_reporte = $1) < $6
     RETURNING ${COLUMNAS}`,
    [id, tipo, nombreLimpio, archivo.length, archivo, MAX_EVIDENCIAS],
  );

  if (rows.length === 0) {
    const existe = await query('SELECT 1 FROM reportes WHERE id_reportes = $1', [id]);

    if (existe.rowCount === 0) {
      throw new ApiError(404, 'Reporte no encontrado');
    }

    throw new ApiError(409, `Un reporte admite máximo ${MAX_EVIDENCIAS} fotos de evidencia`);
  }

  res.status(201).json({ evidencia: rows[0] });
}
