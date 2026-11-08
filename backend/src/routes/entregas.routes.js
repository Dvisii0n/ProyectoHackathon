import { Router } from 'express';
import { entregar } from '../controllers/entregas.controller.js';
import { autenticar } from '../middlewares/auth.js';
import { autorizar } from '../middlewares/roles.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(autenticar);

// Solo el laboratorista (o el administrador) entrega el material
router.post('/', autorizar('ADMIN', 'LABORATORISTA'), asyncHandler(entregar));

export default router;
