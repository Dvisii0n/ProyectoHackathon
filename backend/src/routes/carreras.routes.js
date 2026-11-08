import { Router } from 'express';
import {
  actualizar,
  crear,
  eliminar,
  listar,
  obtener,
} from '../controllers/carreras.controller.js';
import { autenticar } from '../middlewares/auth.js';
import { autorizar } from '../middlewares/roles.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(autenticar);

const EDITAR = autorizar('ADMIN', 'LABORATORISTA');

router.get('/', asyncHandler(listar));
router.get('/:id', asyncHandler(obtener));
router.post('/', EDITAR, asyncHandler(crear));
router.patch('/:id', EDITAR, asyncHandler(actualizar));
router.delete('/:id', EDITAR, asyncHandler(eliminar));

export default router;
