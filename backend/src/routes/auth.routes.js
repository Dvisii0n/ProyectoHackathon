import { Router } from 'express';
import { login, perfil, registro } from '../controllers/auth.controller.js';
import { autenticar } from '../middlewares/auth.js';
import { autorizar } from '../middlewares/roles.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post(
  '/registro',
  autenticar,
  autorizar('ADMIN', 'LABORATORISTA'),
  asyncHandler(registro),
);
router.post('/login', asyncHandler(login));
router.get('/perfil', autenticar, asyncHandler(perfil));

export default router;
