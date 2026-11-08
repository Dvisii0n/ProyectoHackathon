import { crearRecurso } from '../utils/recurso.js';
import {
  enteroNoNegativo,
  enteroPositivo,
  fechaOpcional,
  fechaRequerida,
  textoOpcional,
  textoRequerido,
  validarEnum,
} from '../utils/validaciones.js';
import { validarUnidad } from '../utils/unidades.js';
import { ApiError } from '../utils/ApiError.js';
import { validarRenglon, validarAprobacion } from '../services/disponibilidad.service.js';

/** La práctica debe terminar después de empezar y durar máximo 12 horas. */
function validarFechasPractica(fila) {
  const inicio = new Date(fila.fecha_inicio).getTime();
  const fin = new Date(fila.fecha_final).getTime();

  if (!(fin > inicio)) {
    throw new ApiError(400, 'La fecha final debe ser posterior a la fecha de inicio');
  }

  if (fin - inicio > 12 * 3_600_000) {
    throw new ApiError(400, 'Una práctica no puede durar más de 12 horas');
  }
}

const CATEGORIAS_CATALOGO = ['MATERIAL', 'EQUIPO_LAB', 'CONSUMIBLES'];
const ESTADOS_INVENTARIO = ['BAJA', 'PRESTADO', 'DISPONIBLE'];
const TIPOS_CONSUMIBLE = ['CONSUMIBLE', 'REACTIVO'];
const CATEGORIAS_MATERIAL = ['VOLUMETRICO', 'NO_VOLUMETRICO', 'UTENSILIO', 'METAL'];
const ESTADOS_BATA = ['RENTA', 'DISPONIBLE', 'LAVAR'];
const ESTADOS_FISICOS_BATA = ['BUENO', 'MALO', 'CON DEFECTO'];

const texto = (campo, max) => (valor) => textoRequerido(valor, campo, { max });
const textoNulo = (campo, max) => (valor) => textoOpcional(valor, campo, { max });
const codigo = (campo) => (valor) => textoRequerido(valor, campo, { min: 8, max: 8 });
const entero = (campo) => (valor) => enteroPositivo(valor, campo);
const enteroCero = (campo) => (valor) => enteroNoNegativo(valor, campo);
const fecha = (campo) => (valor) => fechaRequerida(valor, campo);
const fechaNula = (campo) => (valor) => fechaOpcional(valor, campo);
const opcion = (campo, valores) => (valor) => validarEnum(valor, campo, valores);
const opcionNula = (campo, valores) => (valor) => (
  valor === null ? null : validarEnum(valor, campo, valores)
);

/** 5. R_PROFESOR_MATERIA */
export const rProfesorMateria = crearRecurso({
  tabla: 'r_profesor_materia',
  clave: 'id_r_profesor_materia',
  nombre: 'r_profesor_materia',
  singular: 'relacion',
  columnas: ['fk_materia', 'fk_profesor'],
  requeridos: ['fk_materia', 'fk_profesor'],
  validar: {
    fk_materia: entero('fk_materia'),
    fk_profesor: entero('fk_profesor'),
  },
});

/** 8. R_PROFMAT_GRUPO */
export const rProfmatGrupo = crearRecurso({
  tabla: 'r_profmat_grupo',
  clave: ['fk_r_profesor_materia', 'fk_grupo'],
  nombre: 'r_profmat_grupo',
  singular: 'relacion',
  columnas: ['fk_r_profesor_materia', 'fk_grupo'],
  requeridos: ['fk_r_profesor_materia', 'fk_grupo'],
  validar: {
    fk_r_profesor_materia: entero('fk_r_profesor_materia'),
    fk_grupo: entero('fk_grupo'),
  },
});

/** 9. CATALOGO */
export const catalogo = crearRecurso({
  tabla: 'catalogo',
  clave: 'id_catalogo',
  nombre: 'catalogo',
  singular: 'articulo_catalogo',
  columnas: ['nombre', 'categoria'],
  requeridos: ['nombre', 'categoria'],
  validar: {
    nombre: texto('El nombre', 100),
    categoria: opcion('La categoría', CATEGORIAS_CATALOGO),
  },
});

/** 10. CONSUMIBLES */
export const consumibles = crearRecurso({
  tabla: 'consumibles',
  clave: 'id_consumibles',
  nombre: 'consumibles',
  singular: 'consumible',
  columnas: [
    'fk_id_catalogo',
    'consumible',
    'cantidad',
    'unidad',
    'caducidad',
    'minimo_restock',
    'tipo',
  ],
  requeridos: ['fk_id_catalogo', 'consumible', 'unidad'],
  validarRegistro: (fila) => validarUnidad(fila.tipo ?? 'CONSUMIBLE', fila.unidad),
  validar: {
    fk_id_catalogo: entero('fk_id_catalogo'),
    consumible: texto('El consumible', 50),
    cantidad: enteroCero('La cantidad'),
    unidad: texto('La unidad', 20),
    caducidad: fechaNula('La caducidad'),
    minimo_restock: enteroCero('El mínimo de restock'),
    tipo: opcion('El tipo de consumible', TIPOS_CONSUMIBLE),
  },
});

/** 11. EQUIPO_LAB */
export const equipoLab = crearRecurso({
  tabla: 'equipo_lab',
  clave: 'id_equipo_lab',
  nombre: 'equipo_lab',
  singular: 'equipo_lab',
  columnas: ['fk_id_catalogo', 'nombre', 'mant_prev', 'notas', 'codigo', 'estado', 'cantidad', 'minimo_restock'],
  requeridos: ['fk_id_catalogo', 'nombre', 'codigo'],
  validar: {
    fk_id_catalogo: entero('fk_id_catalogo'),
    nombre: texto('El nombre', 100),
    mant_prev: textoNulo('El mantenimiento preventivo', 20),
    notas: textoNulo('Las notas', 100),
    codigo: codigo('El código'),
    estado: opcion('El estado', ESTADOS_INVENTARIO),
    cantidad: enteroCero('La cantidad'),
    minimo_restock: enteroCero('El mínimo de restock'),
  },
});

/** 12. MATERIALES */
export const materiales = crearRecurso({
  tabla: 'materiales',
  clave: 'id_materiales',
  nombre: 'materiales',
  singular: 'material',
  columnas: [
    'fk_id_catalogo',
    'nombre',
    'volumen',
    'medidas',
    'composicion',
    'notas',
    'codigo',
    'estado',
    'categoria',
    'cantidad',
    'minimo_restock',
  ],
  requeridos: ['fk_id_catalogo', 'nombre', 'codigo'],
  validar: {
    fk_id_catalogo: entero('fk_id_catalogo'),
    nombre: texto('El nombre', 100),
    volumen: textoNulo('El volumen', 10),
    medidas: textoNulo('Las medidas', 50),
    composicion: textoNulo('La composición', 30),
    notas: textoNulo('Las notas', 100),
    codigo: codigo('El código'),
    estado: opcion('El estado', ESTADOS_INVENTARIO),
    categoria: opcion('La categoría de material', CATEGORIAS_MATERIAL),
    cantidad: enteroCero('La cantidad'),
    minimo_restock: enteroCero('El mínimo de restock'),
  },
});

/** 13. HISTORIAL_MANTENIMIENTO */
export const historialMantenimiento = crearRecurso({
  tabla: 'historial_mantenimiento',
  clave: 'id_historial_mantenimiento',
  nombre: 'historial_mantenimiento',
  singular: 'mantenimiento',
  columnas: ['fecha', 'encargado', 'fk_id_equipo_lab'],
  requeridos: ['fecha', 'encargado', 'fk_id_equipo_lab'],
  validar: {
    fecha: fecha('La fecha'),
    encargado: texto('El encargado', 255),
    fk_id_equipo_lab: entero('fk_id_equipo_lab'),
  },
});

/** 14. RIESGO_BIOLOGICO */
export const riesgoBiologico = crearRecurso({
  tabla: 'riesgo_biologico',
  clave: 'id_riesgo_biologico',
  nombre: 'riesgo_biologico',
  singular: 'riesgo',
  columnas: ['objetos_recoleccion', 'recolector', 'fk_id_personal', 'fecha'],
  requeridos: ['objetos_recoleccion', 'recolector', 'fk_id_personal', 'fecha'],
  validar: {
    objetos_recoleccion: texto('Los objetos de recolección', 100),
    recolector: texto('El recolector', 100),
    fk_id_personal: entero('fk_id_personal'),
    fecha: fecha('La fecha'),
  },
});

/** 15. PRACTICAS */
export const practicas = crearRecurso({
  tabla: 'practicas',
  clave: 'id_practicas',
  nombre: 'practicas',
  singular: 'practica',
  columnas: ['nombre', 'descripcion', 'fecha_inicio', 'fecha_final', 'fk_id_personal'],
  requeridos: ['nombre', 'fecha_inicio', 'fecha_final', 'fk_id_personal'],
  validarRegistro: validarFechasPractica,
  validar: {
    nombre: texto('El nombre', 100),
    descripcion: textoNulo('La descripción', 255),
    fecha_inicio: fecha('La fecha de inicio'),
    fecha_final: fecha('La fecha final'),
    fk_id_personal: entero('fk_id_personal'),
  },
});

/** 16. EQUIPO (equipo de trabajo/alumnos) */
export const equipo = crearRecurso({
  tabla: 'equipo',
  clave: 'equipo_id',
  nombre: 'equipo',
  singular: 'equipo',
  columnas: ['materia_id', 'fk_id_r_profesor_materia'],
  requeridos: ['materia_id', 'fk_id_r_profesor_materia'],
  validar: {
    materia_id: entero('materia_id'),
    fk_id_r_profesor_materia: entero('fk_id_r_profesor_materia'),
  },
});

/** 17. EQUIPO_INTEGRANTES */
export const equipoIntegrantes = crearRecurso({
  tabla: 'equipo_integrantes',
  clave: ['fk_id_alumno', 'fk_id_equipo'],
  nombre: 'equipo_integrantes',
  singular: 'integrante',
  columnas: ['fk_id_alumno', 'fk_id_equipo'],
  requeridos: ['fk_id_alumno', 'fk_id_equipo'],
  validar: {
    fk_id_alumno: entero('fk_id_alumno'),
    fk_id_equipo: entero('fk_id_equipo'),
  },
});

/** 18. PETICION_EQ */
export const peticionEq = crearRecurso({
  tabla: 'peticion_eq',
  clave: 'peticion_eq_id',
  nombre: 'peticion_eq',
  singular: 'peticion',
  columnas: ['fk_id_practica', 'fk_id_equipo'],
  requeridos: ['fk_id_practica', 'fk_id_equipo'],
  validar: {
    fk_id_practica: entero('fk_id_practica'),
    fk_id_equipo: entero('fk_id_equipo'),
  },
});

/** 19. PETICION_CATALOGO */
export const peticionCatalogo = crearRecurso({
  tabla: 'peticion_catalogo',
  clave: 'peticion_catalogo_id',
  nombre: 'peticion_catalogo',
  singular: 'renglon',
  columnas: ['peticion_eq_id', 'fk_id_catalogo', 'cantidad'],
  requeridos: ['peticion_eq_id', 'fk_id_catalogo'],
  validar: {
    peticion_eq_id: entero('peticion_eq_id'),
    fk_id_catalogo: entero('fk_id_catalogo'),
    cantidad: enteroCero('La cantidad'),
  },
  // Que haya suficiente y esté disponible en el horario de la práctica
  validarRegistro: (fila) =>
    validarRenglon({ peticionId: fila.peticion_eq_id, idCatalogo: fila.fk_id_catalogo, cantidad: fila.cantidad }),
});

/** 20. APROBACION */
export const aprobacion = crearRecurso({
  tabla: 'aprobacion',
  clave: 'aprobacion_id',
  nombre: 'aprobacion',
  singular: 'aprobacion',
  columnas: ['fk_equipo', 'fk_id_practica'],
  requeridos: ['fk_equipo', 'fk_id_practica'],
  validar: {
    fk_equipo: entero('fk_equipo'),
    fk_id_practica: entero('fk_id_practica'),
  },
});

/** 21. APROB_MATERIALES */
export const aprobMateriales = crearRecurso({
  tabla: 'aprob_materiales',
  clave: ['fk_id_material', 'fk_id_aprobacion'],
  nombre: 'aprob_materiales',
  singular: 'material_aprobado',
  columnas: ['fk_id_material', 'fk_id_aprobacion'],
  requeridos: ['fk_id_material', 'fk_id_aprobacion'],
  validar: {
    fk_id_material: entero('fk_id_material'),
    fk_id_aprobacion: entero('fk_id_aprobacion'),
  },
  // Solo se aprueba lo que se pidió y alcanza en ese horario
  validarRegistro: (fila) => validarAprobacion({ idAprobacion: fila.fk_id_aprobacion, tipo: 'material', idDetalle: fila.fk_id_material }),
});

/** 22. APROB_EQUIPO_LAB */
export const aprobEquipoLab = crearRecurso({
  tabla: 'aprob_equipo_lab',
  clave: ['fk_id_equipo_lab', 'fk_id_aprobacion'],
  nombre: 'aprob_equipo_lab',
  singular: 'equipo_aprobado',
  columnas: ['fk_id_equipo_lab', 'fk_id_aprobacion'],
  requeridos: ['fk_id_equipo_lab', 'fk_id_aprobacion'],
  validar: {
    fk_id_equipo_lab: entero('fk_id_equipo_lab'),
    fk_id_aprobacion: entero('fk_id_aprobacion'),
  },
  // Solo se aprueba lo que se pidió y alcanza en ese horario
  validarRegistro: (fila) => validarAprobacion({ idAprobacion: fila.fk_id_aprobacion, tipo: 'equipo', idDetalle: fila.fk_id_equipo_lab }),
});

/** 23. APROB_CONSUMIBLES */
export const aprobConsumibles = crearRecurso({
  tabla: 'aprob_consumibles',
  clave: ['fk_id_consumible', 'fk_id_aprobacion'],
  nombre: 'aprob_consumibles',
  singular: 'consumible_aprobado',
  columnas: ['fk_id_consumible', 'fk_id_aprobacion'],
  requeridos: ['fk_id_consumible', 'fk_id_aprobacion'],
  validar: {
    fk_id_consumible: entero('fk_id_consumible'),
    fk_id_aprobacion: entero('fk_id_aprobacion'),
  },
  // Solo se aprueba lo que se pidió y alcanza en ese horario
  validarRegistro: (fila) => validarAprobacion({ idAprobacion: fila.fk_id_aprobacion, tipo: 'consumible', idDetalle: fila.fk_id_consumible }),
});

/** 24. REPORTES */
export const reportes = crearRecurso({
  tabla: 'reportes',
  clave: 'id_reportes',
  nombre: 'reportes',
  singular: 'reporte',
  columnas: ['titulo', 'descripcion', 'fecha', 'fk_id_practica'],
  requeridos: ['titulo', 'descripcion'],
  validar: {
    titulo: texto('El título', 100),
    descripcion: texto('La descripción', 255),
    fecha: fecha('La fecha'),
    fk_id_practica: (valor) => (valor === null ? null : enteroPositivo(valor, 'fk_id_practica')),
  },
});

/** 25. BATAS_LAB */
export const batasLab = crearRecurso({
  tabla: 'batas_lab',
  clave: 'bata_id',
  nombre: 'batas_lab',
  singular: 'bata',
  columnas: ['codigo', 'estado'],
  requeridos: ['codigo'],
  validar: {
    codigo: codigo('El código'),
    estado: opcion('El estado', ESTADOS_BATA),
  },
});

/** 26. RENTA_BATAS */
export const rentaBatas = crearRecurso({
  tabla: 'renta_batas',
  clave: 'id_renta_batas',
  nombre: 'renta_batas',
  singular: 'renta',
  columnas: [
    'fk_id_alumno',
    'fk_id_bata',
    'fecha_inicio',
    'fecha_fin',
    'estado_entregado',
    'estado_recibido',
    'comentario',
  ],
  requeridos: ['fk_id_alumno', 'fk_id_bata', 'fecha_inicio', 'estado_entregado'],
  validar: {
    fk_id_alumno: entero('fk_id_alumno'),
    fk_id_bata: entero('fk_id_bata'),
    fecha_inicio: fecha('La fecha de inicio'),
    fecha_fin: fechaNula('La fecha de fin'),
    estado_entregado: opcion('El estado entregado', ESTADOS_FISICOS_BATA),
    estado_recibido: opcionNula('El estado recibido', ESTADOS_FISICOS_BATA),
    comentario: textoNulo('El comentario', 255),
  },
});
