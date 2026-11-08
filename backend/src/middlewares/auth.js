import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Middleware de autenticación.
 * Espera el header: Authorization: Bearer <token>
 */
export function autenticar(req, res, next) {
  const header = req.headers.authorization ?? '';

  if (!header.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Token no proporcionado'));
  }

  const token = header.slice('Bearer '.length).trim();

  try {
    const payload = jwt.verify(token, env.jwt.secret);

    req.usuario = {
      id: Number(payload.sub),
      usuario: payload.usuario,
      tipo: payload.tipo ?? null,
    };

    return next();
  } catch {
    return next(new ApiError(401, 'Token inválido o expirado'));
  }
}
