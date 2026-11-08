import { Router } from 'express';
import {
  actualizar,
  crear,
  eliminar,
  listar,
  obtener,
} from '../controllers/tareas.controller.js';
import { autenticar } from '../middlewares/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Todas las rutas de tareas requieren un token válido.
router.use(autenticar);

router.get('/', asyncHandler(listar));
router.get('/:id', asyncHandler(obtener));
router.post('/', asyncHandler(crear));
router.patch('/:id', asyncHandler(actualizar));
router.delete('/:id', asyncHandler(eliminar));

export default router;
