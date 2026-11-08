import { ApiError } from '../utils/ApiError.js';

/** Responde 404 para rutas que no existen. */
export function notFound(req, res, next) {
  next(new ApiError(404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}

/** Middleware central de errores. */
export function errorHandler(error, req, res, next) {
  if (error instanceof ApiError) {
    return res.status(error.status).json({
      error: error.message,
      ...(error.detalles ? { detalles: error.detalles } : {}),
    });
  }

  // Violación de restricción UNIQUE en PostgreSQL.
  if (error.code === '23505') {
    return res.status(409).json({ error: 'El recurso ya existe' });
  }

  // Violación de llave foránea.
  if (error.code === '23503') {
    return res.status(400).json({ error: 'Referencia inválida' });
  }

  // Valor con formato inválido (por ejemplo, un id que no es numérico).
  if (error.code === '22P02') {
    return res.status(400).json({ error: 'Identificador inválido' });
  }

  // Falta un campo obligatorio a nivel de base de datos.
  if (error.code === '23502') {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  console.error(error);
  return res.status(500).json({ error: 'Error interno del servidor' });
}
