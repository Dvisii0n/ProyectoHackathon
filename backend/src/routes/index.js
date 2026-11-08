import { Router } from 'express';
import { query } from '../config/db.js';
import authRoutes from './auth.routes.js';
import usuariosRoutes from './usuarios.routes.js';
import carrerasRoutes from './carreras.routes.js';
import personalRoutes from './personal.routes.js';
import materiasRoutes from './materias.routes.js';
import alumnosRoutes from './alumnos.routes.js';
import gruposRoutes from './grupos.routes.js';
import tareasRoutes from './tareas.routes.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/salud', asyncHandler(async (req, res) => {
  await query('SELECT 1');
  res.json({ estado: 'ok', baseDatos: 'conectada' });
}));

router.use('/auth', authRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/carreras', carrerasRoutes);
router.use('/personal', personalRoutes);
router.use('/materias', materiasRoutes);
router.use('/alumnos', alumnosRoutes);
router.use('/grupos', gruposRoutes);
router.use('/tareas', tareasRoutes);

export default router;
