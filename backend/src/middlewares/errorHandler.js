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

  // Cuerpo más grande de lo permitido (por ejemplo, una foto de más de 8 MB).
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ error: 'El archivo es demasiado grande (máximo 8 MB por foto)' });
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

  // Violación de una restricción CHECK (enum, estado, etc.).
  if (error.code === '23514') {
    return res.status(400).json({ error: 'Valor fuera de los permitidos' });
  }

  // Fecha u hora con formato inválido.
  if (error.code === '22007' || error.code === '22008') {
    return res.status(400).json({ error: 'Fecha inválida' });
  }

  console.error(error);
  return res.status(500).json({ error: 'Error interno del servidor' });
}
