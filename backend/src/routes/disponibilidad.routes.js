import { Router } from 'express';
import { query } from '../config/db.js';
import { autenticar } from '../middlewares/auth.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { enteroPositivo } from '../utils/validaciones.js';
import { disponibilidadDePractica } from '../services/disponibilidad.service.js';

const router = Router();

router.use(autenticar);

/**
 * GET /api/disponibilidad?practica=ID&equipo=ID
 * Qué hay disponible del inventario para esa práctica. Si se manda el equipo, no se
 * cuenta lo que ese mismo equipo ya tiene aprobado.
 */
router.get('/', asyncHandler(async (req, res) => {
  const practicaId = enteroPositivo(req.query.practica, 'practica');
  let peticionId = null;

  if (req.query.equipo !== undefined) {
    const equipoId = enteroPositivo(req.query.equipo, 'equipo');
    const { rows } = await query(
      'SELECT peticion_eq_id FROM peticion_eq WHERE fk_id_practica = $1 AND fk_id_equipo = $2',
      [practicaId, equipoId],
    );
    peticionId = rows[0]?.peticion_eq_id ?? null;
  }

  if (practicaId === undefined) {
    throw new ApiError(400, 'practica es obligatorio');
  }

  res.json({ disponibilidad: await disponibilidadDePractica(practicaId, { peticionId }) });
}));

export default router;
