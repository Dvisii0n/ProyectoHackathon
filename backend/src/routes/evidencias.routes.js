import express, { Router } from 'express';
import * as evidencias from '../controllers/evidencias.controller.js';
import { autenticar } from '../middlewares/auth.js';
import { autorizar } from '../middlewares/roles.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(autenticar);

// La foto viaja como cuerpo binario (sin multipart): una petición por foto.
const recibirImagen = express.raw({ type: 'image/*', limit: evidencias.MAX_BYTES });

// Subir fotos lo hacen quienes crean reportes; verlas, solo el ADMIN (igual que los reportes).
const SOLO_ADMIN = autorizar('ADMIN');

router.get('/evidencias', SOLO_ADMIN, asyncHandler(evidencias.listar));
router.get('/evidencias/:id', SOLO_ADMIN, asyncHandler(evidencias.obtener));
router.get('/reportes/:id/evidencias', SOLO_ADMIN, asyncHandler(evidencias.listarDeReporte));
router.post(
  '/reportes/:id/evidencias',
  autorizar('ADMIN', 'LABORATORISTA', 'PROFESOR'),
  recibirImagen,
  asyncHandler(evidencias.subir),
);

export default router;
