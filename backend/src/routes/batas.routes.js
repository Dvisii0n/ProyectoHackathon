import { Router } from 'express';
import { devolver, listarRentas, miRenta, rentar } from '../controllers/batas.controller.js';
import { autenticar } from '../middlewares/auth.js';
import { autorizar } from '../middlewares/roles.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(autenticar);

const PERSONAL = autorizar('ADMIN', 'LABORATORISTA');

// Alumnos: piden su bata y ven la que tienen
router.get('/mia', autorizar('ALUMNO'), asyncHandler(miRenta));
router.post('/rentar', autorizar('ALUMNO'), asyncHandler(rentar));

// Laboratorio y administrador: ven las rentas y reciben las batas
router.get('/rentas', PERSONAL, asyncHandler(listarRentas));
router.post('/rentas/:id/devolucion', PERSONAL, asyncHandler(devolver));

export default router;
