import { Router } from 'express';
import {
  actualizar,
  crear,
  eliminar,
  listar,
  obtener,
} from '../controllers/alumnos.controller.js';
import { autenticar } from '../middlewares/auth.js';
import { autorizar } from '../middlewares/roles.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(autenticar);

router.get('/', asyncHandler(listar));
router.get('/:id', asyncHandler(obtener));
router.post('/', autorizar('ADMIN', 'LABORATORISTA'), asyncHandler(crear));
router.patch('/:id', asyncHandler(actualizar));
router.delete('/:id', asyncHandler(eliminar));

export default router;
