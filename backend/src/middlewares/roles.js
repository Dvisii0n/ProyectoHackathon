import { ApiError } from '../utils/ApiError.js';

/**
 * Restringe una ruta a los tipos de usuario indicados.
 * Debe usarse después del middleware `autenticar`.
 */
export function autorizar(...tiposPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !tiposPermitidos.includes(req.usuario.tipo)) {
      return next(new ApiError(403, 'No tienes permisos para realizar esta acción'));
    }

    return next();
  };
}
