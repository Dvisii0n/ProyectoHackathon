import express, { Router } from 'express';
import * as fotos from '../controllers/fotos.controller.js';
import { autenticar } from '../middlewares/auth.js';
import { autorizar } from '../middlewares/roles.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(autenticar);

// La foto viaja como cuerpo binario (sin multipart): una petición por foto.
const recibirImagen = express.raw({ type: 'image/*', limit: fotos.MAX_BYTES });

// Las fotos las suben los alumnos y solo el ADMIN las recibe y las ve.
router.post('/practicas/:id/fotos', autorizar('ALUMNO'), recibirImagen, asyncHandler(fotos.subir));
router.get('/fotos/mias', autorizar('ALUMNO'), asyncHandler(fotos.misConteos));
router.get('/fotos', autorizar('ADMIN'), asyncHandler(fotos.listar));
router.get('/fotos/:id', autorizar('ADMIN'), asyncHandler(fotos.obtener));
router.delete('/fotos/:id', autorizar('ADMIN'), asyncHandler(fotos.eliminar));

export default router;
