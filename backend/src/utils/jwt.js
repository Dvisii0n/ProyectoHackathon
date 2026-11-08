import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/** Firma un token JWT cuyo `sub` es el id del usuario. */
export function firmarToken(usuario) {
  const payload = { usuario: usuario.usuario };

  if (usuario.tipo) {
    payload.tipo = usuario.tipo;
  }

  return jwt.sign(
    payload,
    env.jwt.secret,
    { subject: String(usuario.usuario_id), expiresIn: env.jwt.expiresIn },
  );
}
