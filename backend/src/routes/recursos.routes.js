import { Router } from 'express';
import * as recursos from '../controllers/recursos.controller.js';
import { autenticar } from '../middlewares/auth.js';
import { autorizar } from '../middlewares/roles.js';
import { soloIntegrantesDelEquipo } from '../middlewares/equipo.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(autenticar);

const INVENTARIO = autorizar('ADMIN', 'LABORATORISTA');
const ACADEMICO = autorizar('ADMIN', 'LABORATORISTA', 'PROFESOR');
const SOLO_ADMIN = autorizar('ADMIN');

/** Registra un CRUD completo para una tabla con PK simple. */
function registrar(ruta, controlador, permiso = INVENTARIO, permisoBaja = permiso) {
  router.get(ruta, asyncHandler(controlador.listar));
  router.get(`${ruta}/:id`, asyncHandler(controlador.obtener));
  router.post(ruta, permiso, asyncHandler(controlador.crear));

  if (controlador.permiteActualizar) {
    router.patch(`${ruta}/:id`, permiso, asyncHandler(controlador.actualizar));
  }

  router.delete(`${ruta}/:id`, permisoBaja, asyncHandler(controlador.eliminar));
}

/**
 * Reportes: cualquiera de ADMIN, LABORATORISTA y PROFESOR puede crearlos,
 * pero solo el ADMIN puede verlos, cambiarlos o borrarlos.
 */
function registrarReportes(ruta, controlador) {
  router.get(ruta, SOLO_ADMIN, asyncHandler(controlador.listar));
  router.get(`${ruta}/:id`, SOLO_ADMIN, asyncHandler(controlador.obtener));
  router.post(ruta, ACADEMICO, asyncHandler(controlador.crear));
  router.patch(`${ruta}/:id`, SOLO_ADMIN, asyncHandler(controlador.actualizar));
  router.delete(`${ruta}/:id`, SOLO_ADMIN, asyncHandler(controlador.eliminar));
}

/** Registra listado/alta/baja para una tabla con PK compuesta. */
function registrarCompuesto(ruta, controlador, permiso = ACADEMICO, permisoBaja = permiso) {
  const parametros = controlador.claveColumnas.map((columna) => `:${columna}`).join('/');

  router.get(ruta, asyncHandler(controlador.listar));
  router.get(`${ruta}/${parametros}`, asyncHandler(controlador.obtener));
  router.post(ruta, permiso, asyncHandler(controlador.crear));
  router.delete(`${ruta}/${parametros}`, permisoBaja, asyncHandler(controlador.eliminar));
}

/**
 * Renglones de la solicitud de material: los crea y cambia el equipo (sus alumnos);
 * quitarlos también lo puede hacer el personal (al borrar una práctica).
 */
function registrarSolicitudDelEquipo(ruta, controlador) {
  const staff = autorizar('ADMIN', 'LABORATORISTA', 'PROFESOR', 'ALUMNO');

  router.get(ruta, asyncHandler(controlador.listar));
  router.get(`${ruta}/:id`, asyncHandler(controlador.obtener));
  router.post(ruta, autorizar('ALUMNO'), soloIntegrantesDelEquipo, asyncHandler(controlador.crear));
  router.patch(`${ruta}/:id`, autorizar('ALUMNO'), soloIntegrantesDelEquipo, asyncHandler(controlador.actualizar));
  router.delete(`${ruta}/:id`, staff, soloIntegrantesDelEquipo, asyncHandler(controlador.eliminar));
}

registrar('/r-profesor-materia', recursos.rProfesorMateria, ACADEMICO);
registrarCompuesto('/r-profmat-grupo', recursos.rProfmatGrupo);

registrar('/catalogo', recursos.catalogo);
registrar('/consumibles', recursos.consumibles);
registrar('/equipo-lab', recursos.equipoLab);
registrar('/materiales', recursos.materiales);
registrar('/historial-mantenimiento', recursos.historialMantenimiento);
registrar('/riesgo-biologico', recursos.riesgoBiologico, ACADEMICO);

registrar('/practicas', recursos.practicas, ACADEMICO);
registrar('/equipo', recursos.equipo, ACADEMICO);
registrarCompuesto('/equipo-integrantes', recursos.equipoIntegrantes);
registrar('/peticion-eq', recursos.peticionEq, ACADEMICO);
registrarSolicitudDelEquipo('/peticion-catalogo', recursos.peticionCatalogo);
// Solo el laboratorista (o el administrador) aprueba; al borrar una práctica el personal académico puede quitar lo aprobado
registrar('/aprobacion', recursos.aprobacion, INVENTARIO, ACADEMICO);
registrarCompuesto('/aprob-materiales', recursos.aprobMateriales, INVENTARIO, ACADEMICO);
registrarCompuesto('/aprob-equipo-lab', recursos.aprobEquipoLab, INVENTARIO, ACADEMICO);
registrarCompuesto('/aprob-consumibles', recursos.aprobConsumibles, INVENTARIO, ACADEMICO);

registrarReportes('/reportes', recursos.reportes);
registrar('/batas-lab', recursos.batasLab);
registrar('/renta-batas', recursos.rentaBatas);

export default router;
