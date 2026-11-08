// ----------------------------------------------------------------------
// Traducción entre el esquema real de la base y los tipos del dominio del
// front. El back expone una tabla por recurso; aquí se combinan las tablas
// para armar las formas que ya usan las pantallas.
//
// Nada de esto inventa datos: cuando el esquema no tiene una columna
// (laboratorio, QR, fotos, racha…) se usa un valor neutro y se documenta.
// ----------------------------------------------------------------------

import type {
  Racha,
  Alumno,
  Reporte,
  Carrera,
  Materia,
  Practica,
  Decision,
  Profesor,
  Recompensa,
  NuevoEquipo,
  FotoPractica,
  NuevoReporte,
  NuevaMateria,
  TipoMaterial,
  NuevoArticulo,
  BloqueHorario,
  NuevaPractica,
  EquipoAlumnos,
  NuevaSolicitud,
  Disponibilidad,
  EstadoDevolucion,
  SolicitudMaterial,
  AsignacionMateria,
  ArticuloInventario,
  CategoriaInventario,
  CalificacionesReporte,
} from 'src/tipos/dominio';

import { MAX_EVIDENCIAS } from 'src/tipos/dominio';
import { prepararFoto } from 'src/utilidades/imagen';
import { bloquesDePractica } from 'src/utilidades/horario';

import { peticion, peticionBlob } from './cliente-api';

// ---------------------------- Filas del API ----------------------------

type FilaGrupo = { grupo_id: number; grupo: string };

type FilaAlumno = {
  alumno_id: number;
  nombre: string;
  apellido: string;
  matricula: string;
  usuario_id: number;
  grupo_id: number | null;
  grupo: string | null;
};

type FilaPersonal = {
  profesor_id: number;
  nombre: string;
  apellido: string;
  tipo: 'PROFESOR' | 'LABORATORISTA';
  usuario_id: number;
};

type FilaEquipo = {
  equipo_id: number;
  materia_id: number;
  fk_id_r_profesor_materia: number;
};

type FilaRpm = {
  id_r_profesor_materia: number;
  fk_materia: number;
  fk_profesor: number;
};

type FilaRpmGrupo = { fk_r_profesor_materia: number; fk_grupo: number };
type FilaIntegrante = { fk_id_alumno: number; fk_id_equipo: number };

type FilaPractica = {
  id_practicas: number;
  nombre: string;
  descripcion: string | null;
  fecha_inicio: string;
  fecha_final: string;
  fk_id_personal: number;
};

type FilaPeticion = {
  peticion_eq_id: number;
  fk_id_practica: number;
  fk_id_equipo: number;
};

type FilaPeticionCatalogo = {
  peticion_catalogo_id: number;
  peticion_eq_id: number;
  fk_id_catalogo: number;
  cantidad: number;
};

type FilaAprobacion = {
  aprobacion_id: number;
  fk_equipo: number;
  fk_id_practica: number;
};

type CategoriaCatalogo = 'MATERIAL' | 'EQUIPO_LAB' | 'CONSUMIBLES';

type FilaCatalogo = {
  id_catalogo: number;
  nombre: string;
  categoria: CategoriaCatalogo;
};

type FilaConsumible = {
  id_consumibles: number;
  fk_id_catalogo: number;
  consumible: string;
  cantidad: number;
  unidad: string;
  caducidad: string | null;
  minimo_restock: number;
  tipo: 'CONSUMIBLE' | 'REACTIVO';
};

type FilaEquipoLab = {
  id_equipo_lab: number;
  fk_id_catalogo: number;
  nombre: string;
  codigo: string;
  notas: string | null;
  cantidad: number;
  minimo_restock: number;
  estado: 'BAJA' | 'PRESTADO' | 'DISPONIBLE';
};

type FilaMaterial = {
  id_materiales: number;
  fk_id_catalogo: number;
  nombre: string;
  codigo: string;
  volumen: string | null;
  medidas: string | null;
  composicion: string | null;
  notas: string | null;
  categoria: TipoMaterial;
  cantidad: number;
  minimo_restock: number;
  estado: 'BAJA' | 'PRESTADO' | 'DISPONIBLE';
};

type FilaEvidencia = {
  id_evidencia: number;
  fk_id_reporte: number;
  tipo_mime: string;
  nombre_archivo: string | null;
  tamano: number;
};

type FilaReporte = {
  id_reportes: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  fk_id_practica: number | null;
};

// ---------------------------- Utilidades ----------------------------

async function lista<T>(ruta: string, clave: string): Promise<T[]> {
  const respuesta = await peticion<Record<string, T[]>>(ruta);
  return respuesta[clave] ?? [];
}

function duracionHoras(inicio: string, fin: string): number {
  const horas = (new Date(fin).getTime() - new Date(inicio).getTime()) / 3_600_000;
  return horas > 0 ? Math.round(horas * 10) / 10 : 1;
}

/** "120 pzas" → 120; sin número → 1 */
function cantidadNumerica(texto: string): number {
  const numero = Number.parseInt(texto, 10);
  return Number.isFinite(numero) && numero >= 0 ? numero : 1;
}

/** Código de 8 caracteres que exige el esquema para equipos y materiales. */
function codigoNuevo(prefijo: string): string {
  const numero = String(Date.now()).slice(-6);
  return `${prefijo}${numero}`.slice(0, 8).padEnd(8, '0');
}

function estadoInventario(estado: FilaEquipoLab['estado']): ArticuloInventario['estado'] {
  if (estado === 'PRESTADO') return 'ocupado';
  if (estado === 'BAJA') return 'mantenimiento';
  return 'disponible';
}

const categoriaDesdeApi: Record<CategoriaCatalogo, CategoriaInventario> = {
  CONSUMIBLES: 'consumibles',
  EQUIPO_LAB: 'equipo',
  MATERIAL: 'utensilios',
};

const categoriaHaciaApi: Record<CategoriaInventario, CategoriaCatalogo> = {
  consumibles: 'CONSUMIBLES',
  equipo: 'EQUIPO_LAB',
  utensilios: 'MATERIAL',
};

// ---------------------------- Equipos ----------------------------

async function cargarEquipos(): Promise<EquipoAlumnos[]> {
  const [equipos, integrantes, alumnos, rpms, rpmGrupos, grupos, personal] = await Promise.all([
    lista<FilaEquipo>('/equipo', 'equipo'),
    lista<FilaIntegrante>('/equipo-integrantes', 'equipo_integrantes'),
    lista<FilaAlumno>('/alumnos', 'alumnos'),
    lista<FilaRpm>('/r-profesor-materia', 'r_profesor_materia'),
    lista<FilaRpmGrupo>('/r-profmat-grupo', 'r_profmat_grupo'),
    lista<FilaGrupo>('/grupos', 'grupos'),
    lista<FilaPersonal>('/personal', 'personal'),
  ]);

  const alumnoPorId = new Map(alumnos.map((a) => [a.alumno_id, a]));
  const grupoPorId = new Map(grupos.map((g) => [g.grupo_id, g.grupo]));
  const rpmPorId = new Map(rpms.map((r) => [r.id_r_profesor_materia, r]));
  const grupoPorRpm = new Map(rpmGrupos.map((r) => [r.fk_r_profesor_materia, r.fk_grupo]));
  const personalPorId = new Map(personal.map((p) => [p.profesor_id, p]));

  return equipos.map((equipo) => {
    const rpm = rpmPorId.get(equipo.fk_id_r_profesor_materia);
    const profesor = rpm ? personalPorId.get(rpm.fk_profesor) : undefined;
    // Una asignación puede tener varios grupos: manda el grupo de los integrantes.
    const primerAlumno = integrantes.find((i) => i.fk_id_equipo === equipo.equipo_id);
    const grupoId =
      (primerAlumno && alumnoPorId.get(primerAlumno.fk_id_alumno)?.grupo_id) ||
      grupoPorRpm.get(equipo.fk_id_r_profesor_materia);

    const miembros = integrantes
      .filter((i) => i.fk_id_equipo === equipo.equipo_id)
      .map((i) => {
        const alumno = alumnoPorId.get(i.fk_id_alumno);
        return {
          id: String(i.fk_id_alumno),
          nombre: alumno ? `${alumno.nombre} ${alumno.apellido}`.trim() : `Alumno ${i.fk_id_alumno}`,
        };
      });

    return {
      id: String(equipo.equipo_id),
      nombre: `Equipo ${equipo.equipo_id}`,
      grupo: grupoId ? (grupoPorId.get(grupoId) ?? '') : '',
      profesorId: profesor ? String(profesor.usuario_id) : '',
      integrantes: miembros,
    };
  });
}

export async function obtenerEquiposApi(): Promise<EquipoAlumnos[]> {
  return cargarEquipos();
}

/**
 * Un equipo cuelga de una asignación (R_PROFESOR_MATERIA) y de uno de sus
 * grupos (R_PROFMAT_GRUPO). Los integrantes son alumnos reales (alumno_id).
 */
export async function crearEquipoApi(datos: NuevoEquipo, profesorUsuarioId: string): Promise<EquipoAlumnos> {
  if (!datos.asignacionId || !datos.grupoId) {
    throw new Error('Elige la materia y el grupo del equipo');
  }

  const [rpms, rpmGrupos, grupos] = await Promise.all([
    lista<FilaRpm>('/r-profesor-materia', 'r_profesor_materia'),
    lista<FilaRpmGrupo>('/r-profmat-grupo', 'r_profmat_grupo'),
    lista<FilaGrupo>('/grupos', 'grupos'),
  ]);

  const rpm = rpms.find((r) => r.id_r_profesor_materia === datos.asignacionId);
  if (!rpm) throw new Error('Esa materia ya no está asignada');

  const grupo = grupos.find((g) => g.grupo_id === datos.grupoId);
  if (!grupo) throw new Error('Ese grupo ya no existe');

  const yaAsignado = rpmGrupos.some(
    (r) => r.fk_r_profesor_materia === rpm.id_r_profesor_materia && r.fk_grupo === grupo.grupo_id,
  );

  if (!yaAsignado) {
    await peticion('/r-profmat-grupo', {
      metodo: 'POST',
      cuerpo: { fk_r_profesor_materia: rpm.id_r_profesor_materia, fk_grupo: grupo.grupo_id },
    });
  }

  const { equipo } = await peticion<{ equipo: FilaEquipo }>('/equipo', {
    metodo: 'POST',
    cuerpo: { materia_id: rpm.fk_materia, fk_id_r_profesor_materia: rpm.id_r_profesor_materia },
  });

  for (const integrante of datos.integrantes) {
    await peticion('/equipo-integrantes', {
      metodo: 'POST',
      cuerpo: { fk_id_alumno: Number(integrante.id), fk_id_equipo: equipo.equipo_id },
    });
  }

  return {
    id: String(equipo.equipo_id),
    nombre: `Equipo ${equipo.equipo_id}`,
    grupo: grupo.grupo,
    profesorId: profesorUsuarioId,
    integrantes: datos.integrantes,
  };
}

export async function borrarEquipoApi(id: string): Promise<void> {
  const [integrantes, peticiones] = await Promise.all([
    lista<FilaIntegrante>('/equipo-integrantes', 'equipo_integrantes'),
    lista<FilaPeticion>('/peticion-eq', 'peticion_eq'),
  ]);

  await Promise.all(
    integrantes
      .filter((i) => String(i.fk_id_equipo) === id)
      .map((i) => peticion(`/equipo-integrantes/${i.fk_id_alumno}/${i.fk_id_equipo}`, { metodo: 'DELETE' })),
  );

  await Promise.all(
    peticiones
      .filter((p) => String(p.fk_id_equipo) === id)
      .map((p) => peticion(`/peticion-eq/${p.peticion_eq_id}`, { metodo: 'DELETE' })),
  );

  await peticion(`/equipo/${id}`, { metodo: 'DELETE' });
}

// ---------------------------- Prácticas ----------------------------

function mapPractica(
  practica: FilaPractica,
  peticiones: FilaPeticion[],
  equipos: EquipoAlumnos[],
  personal: FilaPersonal[],
): Practica {
  const equipoPorId = new Map(equipos.map((e) => [Number(e.id), e]));
  const equipoIds = peticiones
    .filter((p) => p.fk_id_practica === practica.id_practicas)
    .map((p) => String(p.fk_id_equipo));
  const primero = equipoIds.map((id) => equipoPorId.get(Number(id))).find(Boolean);
  const profesor = personal.find((p) => p.profesor_id === practica.fk_id_personal);

  return {
    id: String(practica.id_practicas),
    nombre: practica.nombre,
    grupo: primero?.grupo ?? '',
    // El esquema no guarda el laboratorio; se usa uno fijo para la UI.
    laboratorioId: 'microbiologia',
    profesorId: profesor ? String(profesor.usuario_id) : '',
    profesorNombre: profesor ? `${profesor.nombre} ${profesor.apellido}`.trim() : '',
    inicio: practica.fecha_inicio,
    fin: practica.fecha_final,
    duracionHoras: duracionHoras(practica.fecha_inicio, practica.fecha_final),
    descripcion: practica.descripcion ?? undefined,
    equipoIds,
  };
}

export async function obtenerPracticasApi(): Promise<Practica[]> {
  const [practicas, peticiones, equipos, personal] = await Promise.all([
    lista<FilaPractica>('/practicas', 'practicas'),
    lista<FilaPeticion>('/peticion-eq', 'peticion_eq'),
    cargarEquipos(),
    lista<FilaPersonal>('/personal', 'personal'),
  ]);

  return practicas
    .map((p) => mapPractica(p, peticiones, equipos, personal))
    .sort((a, b) => a.inicio.localeCompare(b.inicio));
}

export async function crearPracticaApi(datos: NuevaPractica, profesorUsuarioId: string): Promise<Practica> {
  const [personal, equipos] = await Promise.all([
    lista<FilaPersonal>('/personal', 'personal'),
    cargarEquipos(),
  ]);

  const profesor = personal.find((p) => String(p.usuario_id) === profesorUsuarioId) ?? personal[0];
  if (!profesor) throw new Error('No hay un perfil de profesor al que asignar la práctica');

  const inicio = new Date(datos.inicio);
  const fin = datos.fin ? new Date(datos.fin) : new Date(inicio.getTime() + datos.duracionHoras * 3_600_000);

  const { practica } = await peticion<{ practica: FilaPractica }>('/practicas', {
    metodo: 'POST',
    cuerpo: {
      nombre: datos.nombre,
      descripcion: datos.descripcion ?? null,
      fecha_inicio: inicio.toISOString(),
      fecha_final: fin.toISOString(),
      fk_id_personal: profesor.profesor_id,
    },
  });

  const peticiones: FilaPeticion[] = [];

  for (const equipoId of datos.equipoIds) {
    const { peticion: creada } = await peticion<{ peticion: FilaPeticion }>('/peticion-eq', {
      metodo: 'POST',
      cuerpo: { fk_id_practica: practica.id_practicas, fk_id_equipo: Number(equipoId) },
    });
    peticiones.push(creada);
  }

  return mapPractica(practica, peticiones, equipos, personal);
}

export async function borrarPracticaApi(id: string): Promise<void> {
  const [peticiones, peticionCatalogo, aprobaciones, aprobMateriales, aprobEquipoLab, aprobConsumibles] =
    await Promise.all([
      lista<FilaPeticion>('/peticion-eq', 'peticion_eq'),
      lista<FilaPeticionCatalogo>('/peticion-catalogo', 'peticion_catalogo'),
      lista<FilaAprobacion>('/aprobacion', 'aprobacion'),
      lista<Record<string, number>>('/aprob-materiales', 'aprob_materiales'),
      lista<Record<string, number>>('/aprob-equipo-lab', 'aprob_equipo_lab'),
      lista<Record<string, number>>('/aprob-consumibles', 'aprob_consumibles'),
    ]);

  const idsPeticion = new Set(
    peticiones.filter((p) => String(p.fk_id_practica) === id).map((p) => p.peticion_eq_id),
  );

  await Promise.all(
    peticionCatalogo
      .filter((p) => idsPeticion.has(p.peticion_eq_id))
      .map((p) => peticion(`/peticion-catalogo/${p.peticion_catalogo_id}`, { metodo: 'DELETE' })),
  );

  await Promise.all(
    [...idsPeticion].map((peticionId) => peticion(`/peticion-eq/${peticionId}`, { metodo: 'DELETE' })),
  );

  const idsAprobacion = new Set(
    aprobaciones.filter((a) => String(a.fk_id_practica) === id).map((a) => a.aprobacion_id),
  );

  await Promise.all([
    ...aprobMateriales
      .filter((a) => idsAprobacion.has(a.fk_id_aprobacion))
      .map((a) => peticion(`/aprob-materiales/${a.fk_id_material}/${a.fk_id_aprobacion}`, { metodo: 'DELETE' })),
    ...aprobEquipoLab
      .filter((a) => idsAprobacion.has(a.fk_id_aprobacion))
      .map((a) => peticion(`/aprob-equipo-lab/${a.fk_id_equipo_lab}/${a.fk_id_aprobacion}`, { metodo: 'DELETE' })),
    ...aprobConsumibles
      .filter((a) => idsAprobacion.has(a.fk_id_aprobacion))
      .map((a) => peticion(`/aprob-consumibles/${a.fk_id_consumible}/${a.fk_id_aprobacion}`, { metodo: 'DELETE' })),
  ]);

  await Promise.all(
    [...idsAprobacion].map((aprobacionId) => peticion(`/aprobacion/${aprobacionId}`, { metodo: 'DELETE' })),
  );

  await peticion(`/practicas/${id}`, { metodo: 'DELETE' });
}

/**
 * Prácticas a las que se les puede hacer reporte: las que ya empezaron o
 * empiezan hoy. Las más recientes primero.
 */
export async function obtenerPracticasParaReporteApi(): Promise<Practica[]> {
  const finDeHoy = new Date();
  finDeHoy.setHours(23, 59, 59, 999);
  const practicas = await obtenerPracticasApi();
  return practicas.filter((p) => new Date(p.inicio) <= finDeHoy).sort((a, b) => b.inicio.localeCompare(a.inicio));
}

export async function obtenerPracticasDeHoyApi(): Promise<Practica[]> {
  const practicas = await obtenerPracticasApi();
  const hoy = new Date().toISOString().slice(0, 10);
  return practicas.filter((p) => p.inicio.slice(0, 10) === hoy);
}

export async function obtenerMisPracticasApi(
  usuarioId: string,
): Promise<{ practicas: Practica[]; equipo: EquipoAlumnos | null }> {
  // La sesión trae usuario_id; los integrantes de un equipo usan alumno_id.
  const [equipos, alumnos] = await Promise.all([cargarEquipos(), lista<FilaAlumno>('/alumnos', 'alumnos')]);
  const alumno = alumnos.find((a) => String(a.usuario_id) === usuarioId);
  if (!alumno) return { practicas: [], equipo: null };
  const alumnoId = String(alumno.alumno_id);
  const mios = equipos.filter((e) => e.integrantes.some((i) => i.id === alumnoId));
  const ids = new Set(mios.map((e) => e.id));
  const practicas = (await obtenerPracticasApi()).filter((p) => p.equipoIds.some((id) => ids.has(id)));
  return { practicas, equipo: mios[0] ?? null };
}

// ---------------------------- Solicitudes ----------------------------

type ContextoSolicitudes = {
  peticiones: FilaPeticion[];
  renglones: FilaPeticionCatalogo[];
  aprobaciones: FilaAprobacion[];
  /** "TIPO:aprobacion:detalle" de lo que sí se presta (tablas aprob_*) */
  aprobadas: Set<string>;
  inventario: ContextoInventario;
  practicas: FilaPractica[];
  equipos: EquipoAlumnos[];
};

/** Dónde vive cada artículo del catálogo y en qué tabla aprob_* se marca como prestado */
function detalleDe(articulo: FilaCatalogo, inventario: ContextoInventario) {
  if (articulo.categoria === 'CONSUMIBLES') {
    const d = inventario.consumibles.find((c) => c.fk_id_catalogo === articulo.id_catalogo);
    return d ? { clave: 'C', ruta: '/aprob-consumibles', campo: 'fk_id_consumible', id: d.id_consumibles } : null;
  }
  if (articulo.categoria === 'EQUIPO_LAB') {
    const d = inventario.equipos.find((e) => e.fk_id_catalogo === articulo.id_catalogo);
    return d ? { clave: 'E', ruta: '/aprob-equipo-lab', campo: 'fk_id_equipo_lab', id: d.id_equipo_lab } : null;
  }
  const d = inventario.materiales.find((m) => m.fk_id_catalogo === articulo.id_catalogo);
  return d ? { clave: 'M', ruta: '/aprob-materiales', campo: 'fk_id_material', id: d.id_materiales } : null;
}

async function cargarContextoSolicitudes(): Promise<ContextoSolicitudes> {
  const [peticiones, renglones, aprobaciones, inventario, practicas, equipos, aprobMateriales, aprobEquipo, aprobConsumibles] =
    await Promise.all([
      lista<FilaPeticion>('/peticion-eq', 'peticion_eq'),
      lista<FilaPeticionCatalogo>('/peticion-catalogo', 'peticion_catalogo'),
      lista<FilaAprobacion>('/aprobacion', 'aprobacion'),
      cargarInventario(),
      lista<FilaPractica>('/practicas', 'practicas'),
      cargarEquipos(),
      lista<Record<string, number>>('/aprob-materiales', 'aprob_materiales'),
      lista<Record<string, number>>('/aprob-equipo-lab', 'aprob_equipo_lab'),
      lista<Record<string, number>>('/aprob-consumibles', 'aprob_consumibles'),
    ]);

  const aprobadas = new Set<string>([
    ...aprobMateriales.map((a) => `M:${a.fk_id_aprobacion}:${a.fk_id_material}`),
    ...aprobEquipo.map((a) => `E:${a.fk_id_aprobacion}:${a.fk_id_equipo_lab}`),
    ...aprobConsumibles.map((a) => `C:${a.fk_id_aprobacion}:${a.fk_id_consumible}`),
  ]);

  return { peticiones, renglones, aprobaciones, aprobadas, inventario, practicas, equipos };
}

function mapSolicitud(peticionEq: FilaPeticion, contexto: ContextoSolicitudes): SolicitudMaterial {
  const practica = contexto.practicas.find((p) => p.id_practicas === peticionEq.fk_id_practica);
  const equipo = contexto.equipos.find((e) => Number(e.id) === peticionEq.fk_id_equipo);
  const aprobacion = contexto.aprobaciones.find(
    (a) => a.fk_equipo === peticionEq.fk_id_equipo && a.fk_id_practica === peticionEq.fk_id_practica,
  );

  const renglones = contexto.renglones
    .filter((r) => r.peticion_eq_id === peticionEq.peticion_eq_id)
    .map((r) => {
      const articulo = contexto.inventario.catalogo.find((c) => c.id_catalogo === r.fk_id_catalogo);
      const detalle = articulo ? detalleDe(articulo, contexto.inventario) : null;
      return {
        articuloId: String(r.fk_id_catalogo),
        nombre: articulo?.nombre ?? `Artículo ${r.fk_id_catalogo}`,
        cantidad: r.cantidad,
        // null mientras el laboratorista no revisa; después, lo que palomeó
        aceptado: aprobacion ? !!detalle && contexto.aprobadas.has(`${detalle.clave}:${aprobacion.aprobacion_id}:${detalle.id}`) : null,
      };
    });

  const nadaAprobado = renglones.length > 0 && renglones.every((r) => !r.aceptado);
  const estado: SolicitudMaterial['estado'] = !aprobacion ? 'pendiente' : nadaAprobado ? 'rechazada' : 'aprobada';

  return {
    id: String(peticionEq.peticion_eq_id),
    practicaId: String(peticionEq.fk_id_practica),
    nombrePractica: practica?.nombre ?? '',
    inicioPractica: practica?.fecha_inicio ?? '',
    equipoId: String(peticionEq.fk_id_equipo),
    nombreEquipo: equipo?.nombre ?? `Equipo ${peticionEq.fk_id_equipo}`,
    grupo: equipo?.grupo ?? '',
    // El esquema no guarda quién hizo la solicitud ni cuándo.
    solicitanteId: '',
    solicitanteNombre: '',
    fecha: practica?.fecha_inicio ?? new Date().toISOString(),
    estado,
    renglones,
    codigoQr: estado === 'aprobada' ? `BIOLAB-SOLICITUD-${peticionEq.peticion_eq_id}` : undefined,
  };
}

export async function obtenerSolicitudesApi(filtro?: { equipoId?: string }): Promise<SolicitudMaterial[]> {
  const contexto = await cargarContextoSolicitudes();

  return contexto.peticiones
    .filter((p) => !filtro?.equipoId || String(p.fk_id_equipo) === filtro.equipoId)
    .map((p) => mapSolicitud(p, contexto))
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
}

type RenglonNuevo = { articuloId: string; cantidad: number };

/**
 * Deja la lista de materiales de las peticiones indicadas exactamente como
 * `renglones`: agrega lo nuevo, cambia cantidades y quita lo que ya no está.
 * Solo se puede mientras el laboratorista no haya revisado la solicitud.
 */
export async function guardarMaterialesApi(ids: string[], renglones: RenglonNuevo[]): Promise<SolicitudMaterial[]> {
  const contexto = await cargarContextoSolicitudes();

  for (const r of renglones) {
    if (!contexto.inventario.catalogo.some((c) => String(c.id_catalogo) === r.articuloId)) {
      throw new Error('Alguno de los materiales ya no existe en el inventario');
    }
    if (!Number.isInteger(r.cantidad) || r.cantidad < 1) throw new Error('Las cantidades deben ser números enteros de 1 en adelante');
  }

  const peticiones = ids.map((id) => {
    const encontrada = contexto.peticiones.find((p) => String(p.peticion_eq_id) === id);
    if (!encontrada) throw new Error('La solicitud ya no existe');
    const revisada = contexto.aprobaciones.some((a) => a.fk_equipo === encontrada.fk_id_equipo && a.fk_id_practica === encontrada.fk_id_practica);
    if (revisada) {
      const equipo = contexto.equipos.find((e) => Number(e.id) === encontrada.fk_id_equipo)?.nombre ?? 'Un equipo';
      throw new Error(`${equipo} ya tiene su solicitud revisada: ya no se pueden cambiar sus materiales`);
    }
    return encontrada;
  });

  // Lo que se agrega en esta llamada: si el back rechaza algo (no alcanza, no está disponible…), se deshace
  const creados: number[] = [];

  try {
    for (const pet of peticiones) {
      const actuales = contexto.renglones.filter((r) => r.peticion_eq_id === pet.peticion_eq_id);

      for (const actual of actuales) {
        const nuevo = renglones.find((r) => r.articuloId === String(actual.fk_id_catalogo));
        if (!nuevo) {
          await peticion(`/peticion-catalogo/${actual.peticion_catalogo_id}`, { metodo: 'DELETE' });
        } else if (nuevo.cantidad !== actual.cantidad) {
          await peticion(`/peticion-catalogo/${actual.peticion_catalogo_id}`, { metodo: 'PATCH', cuerpo: { cantidad: nuevo.cantidad } });
        }
      }

      for (const nuevo of renglones) {
        if (!actuales.some((a) => String(a.fk_id_catalogo) === nuevo.articuloId)) {
          const { renglon } = await peticion<{ renglon: FilaPeticionCatalogo }>('/peticion-catalogo', {
            metodo: 'POST',
            cuerpo: { peticion_eq_id: pet.peticion_eq_id, fk_id_catalogo: Number(nuevo.articuloId), cantidad: nuevo.cantidad },
          });
          creados.push(renglon.peticion_catalogo_id);
        }
      }
    }
  } catch (error) {
    await Promise.all(creados.map((id) => peticion(`/peticion-catalogo/${id}`, { metodo: 'DELETE' }).catch(() => undefined)));
    throw error;
  }

  const actualizado = await cargarContextoSolicitudes();
  return peticiones.map((p) => mapSolicitud(p, actualizado));
}

/** El alumno pide para su equipo: se usa la petición que ya existe de esa práctica, si la hay */
export async function crearSolicitudApi(datos: NuevaSolicitud): Promise<SolicitudMaterial> {
  const existentes = await lista<FilaPeticion>('/peticion-eq', 'peticion_eq');
  let pet = existentes.find((p) => String(p.fk_id_practica) === datos.practicaId && String(p.fk_id_equipo) === datos.equipoId);

  if (!pet) {
    const { peticion: creada } = await peticion<{ peticion: FilaPeticion }>('/peticion-eq', {
      metodo: 'POST',
      cuerpo: { fk_id_practica: Number(datos.practicaId), fk_id_equipo: Number(datos.equipoId) },
    });
    pet = creada;
  }

  const [guardada] = await guardarMaterialesApi([String(pet.peticion_eq_id)], datos.renglones);
  return guardada;
}

/**
 * Qué se puede pedir para una práctica (existencia, lo ya apartado por otros equipos en ese
 * horario y el estado de cada artículo). Lo calcula el back; aquí se indexa por id del catálogo.
 */
export async function obtenerDisponibilidadApi(practicaId: string, equipoId: string): Promise<Record<string, Disponibilidad>> {
  const { disponibilidad } = await peticion<{
    disponibilidad: { id_catalogo: number; existencia: number; comprometido: number; disponible: number; motivo: string | null }[];
  }>(`/disponibilidad?practica=${practicaId}&equipo=${equipoId}`);

  return Object.fromEntries(
    disponibilidad.map((d) => [String(d.id_catalogo), { existencia: d.existencia, comprometido: d.comprometido, disponible: d.disponible, motivo: d.motivo }]),
  );
}

/**
 * El laboratorista palomea lo que sí presta. Cada material aprobado se guarda en
 * su tabla aprob_*; si no aprueba ninguno, la solicitud queda rechazada.
 */
export async function revisarSolicitudApi(id: string, aceptados: Record<string, boolean>): Promise<SolicitudMaterial> {
  const contexto = await cargarContextoSolicitudes();
  const original = contexto.peticiones.find((p) => String(p.peticion_eq_id) === id);

  if (!original) throw new Error('Solicitud no encontrada');

  const renglones = contexto.renglones.filter((r) => r.peticion_eq_id === original.peticion_eq_id);
  if (renglones.length === 0) throw new Error('Esta solicitud todavía no tiene materiales: elígelos primero');

  const yaRevisada = contexto.aprobaciones.some((a) => a.fk_equipo === original.fk_id_equipo && a.fk_id_practica === original.fk_id_practica);
  if (yaRevisada) throw new Error('Esta solicitud ya fue revisada');

  const { aprobacion } = await peticion<{ aprobacion: FilaAprobacion }>('/aprobacion', {
    metodo: 'POST',
    cuerpo: { fk_equipo: original.fk_id_equipo, fk_id_practica: original.fk_id_practica },
  });

  // El back vuelve a comprobar que alcance y esté disponible; si rechaza algo se deshace toda la aprobación
  const aprobados: string[] = [];

  try {
    for (const renglon of renglones) {
      if (!aceptados[String(renglon.fk_id_catalogo)]) continue;
      const articulo = contexto.inventario.catalogo.find((c) => c.id_catalogo === renglon.fk_id_catalogo);
      const detalle = articulo ? detalleDe(articulo, contexto.inventario) : null;
      if (detalle) {
        await peticion(detalle.ruta, { metodo: 'POST', cuerpo: { [detalle.campo]: detalle.id, fk_id_aprobacion: aprobacion.aprobacion_id } });
        aprobados.push(`${detalle.ruta}/${detalle.id}/${aprobacion.aprobacion_id}`);
      }
    }
  } catch (error) {
    await Promise.all(aprobados.map((ruta) => peticion(ruta, { metodo: 'DELETE' }).catch(() => undefined)));
    await peticion(`/aprobacion/${aprobacion.aprobacion_id}`, { metodo: 'DELETE' }).catch(() => undefined);
    throw error;
  }

  const actualizado = await cargarContextoSolicitudes();
  return mapSolicitud(original, actualizado);
}

export async function entregarSolicitudApi(codigoQr: string): Promise<SolicitudMaterial> {
  const solicitudes = await obtenerSolicitudesApi();
  const encontrada = solicitudes.find((s) => s.codigoQr === codigoQr.trim());

  if (!encontrada) throw new Error('Ese QR no corresponde a una solicitud aprobada');

  // El esquema no tiene columna de estado: la entrega se refleja en la UI.
  return { ...encontrada, estado: 'entregada' };
}

export async function registrarDevolucionApi(
  id: string,
  revision: Record<string, { estado: EstadoDevolucion; nota?: string }>,
): Promise<SolicitudMaterial> {
  const solicitud = (await obtenerSolicitudesApi()).find((s) => s.id === id);
  if (!solicitud) throw new Error('Solicitud no encontrada');

  const renglones = solicitud.renglones.map((r) => ({
    ...r,
    devolucion: revision[r.articuloId] ?? { estado: 'bien' as const },
  }));

  const conProblema = renglones.filter((r) => r.devolucion?.estado === 'con-problema');

  if (conProblema.length > 0) {
    await peticion('/reportes', {
      metodo: 'POST',
      cuerpo: {
        titulo: `Material con problema · ${solicitud.nombreEquipo}`.slice(0, 100),
        descripcion: `Material devuelto con problema: ${conProblema.map((r) => r.nombre).join(', ')}.`.slice(0, 255),
        fecha: new Date().toISOString(),
      },
    });
  }

  return {
    ...solicitud,
    renglones,
    estado: conProblema.length > 0 ? 'con-problemas' : 'devuelta',
  };
}

// ---------------------------- Inventario ----------------------------

type ContextoInventario = {
  catalogo: FilaCatalogo[];
  consumibles: FilaConsumible[];
  equipos: FilaEquipoLab[];
  materiales: FilaMaterial[];
};

async function cargarInventario(): Promise<ContextoInventario> {
  const [catalogo, consumibles, equipos, materiales] = await Promise.all([
    lista<FilaCatalogo>('/catalogo', 'catalogo'),
    lista<FilaConsumible>('/consumibles', 'consumibles'),
    lista<FilaEquipoLab>('/equipo-lab', 'equipo_lab'),
    lista<FilaMaterial>('/materiales', 'materiales'),
  ]);

  return { catalogo, consumibles, equipos, materiales };
}

function unir(...partes: (string | null | undefined)[]) {
  return partes.map((p) => p?.trim()).filter(Boolean).join(' · ') || undefined;
}

/** "3" + "pzas" → "3 pzas"; las unidades vienen del inventario ("cajas", "frasco 500 g"…) */
function conUnidad(cantidad: number, unidad: string) {
  return `${cantidad} ${unidad}`.trim();
}

/** Bajo en stock: la cantidad llegó al mínimo (o se acabó) */
function stock(cantidad: number, minimo: number, unidad: string) {
  return { cantidadNumero: cantidad, minimo, unidad, bajoStock: cantidad <= minimo };
}

function mapInventario(
  articulo: FilaCatalogo,
  contexto: ContextoInventario,
): ArticuloInventario {
  const categoria = categoriaDesdeApi[articulo.categoria];
  const base = { id: String(articulo.id_catalogo), nombre: articulo.nombre, categoria, laboratorioId: 'microbiologia' as const };

  if (articulo.categoria === 'CONSUMIBLES') {
    const detalle = contexto.consumibles.find((c) => c.fk_id_catalogo === articulo.id_catalogo);
    return {
      ...base,
      ...stock(detalle?.cantidad ?? 0, detalle?.minimo_restock ?? 0, detalle?.unidad ?? 'pzas'),
      tipoConsumible: detalle?.tipo ?? 'CONSUMIBLE',
      cantidad: detalle ? conUnidad(detalle.cantidad, detalle.unidad) : '',
      descripcion: detalle?.caducidad ? `Caduca ${new Date(detalle.caducidad).toLocaleDateString('es-MX', { month: 'short', year: 'numeric', timeZone: 'UTC' })}` : undefined,
      estado: detalle && detalle.cantidad === 0 ? 'mantenimiento' : 'disponible',
    };
  }

  if (articulo.categoria === 'EQUIPO_LAB') {
    const detalle = contexto.equipos.find((e) => e.fk_id_catalogo === articulo.id_catalogo);
    const cantidad = detalle?.cantidad ?? 0;
    return {
      ...base,
      ...stock(cantidad, detalle?.minimo_restock ?? 0, 'equipos'),
      cantidad: conUnidad(cantidad, cantidad === 1 ? 'equipo' : 'equipos'),
      descripcion: unir(detalle?.codigo, detalle?.notas),
      estado: detalle ? estadoInventario(detalle.estado) : 'disponible',
    };
  }

  const detalle = contexto.materiales.find((m) => m.fk_id_catalogo === articulo.id_catalogo);
  return {
    ...base,
    ...stock(detalle?.cantidad ?? 0, detalle?.minimo_restock ?? 0, 'pzas'),
    cantidad: conUnidad(detalle?.cantidad ?? 0, 'pzas'),
    descripcion: unir(detalle?.composicion, detalle?.notas),
    estado: detalle ? estadoInventario(detalle.estado) : 'disponible',
    tipoMaterial: detalle?.categoria ?? 'UTENSILIO',
  };
}

async function inventarioCompleto(): Promise<ArticuloInventario[]> {
  const contexto = await cargarInventario();
  return contexto.catalogo.map((articulo) => mapInventario(articulo, contexto));
}

export async function obtenerInventarioApi(categoria: CategoriaInventario): Promise<ArticuloInventario[]> {
  return (await inventarioCompleto()).filter((a) => a.categoria === categoria);
}

/** Todo el inventario, también lo agotado o en uso: el equipo ve por qué algo no se puede pedir */
export async function obtenerInventarioTodoApi(): Promise<ArticuloInventario[]> {
  return inventarioCompleto();
}

export async function obtenerMaterialPrestableApi(): Promise<ArticuloInventario[]> {
  return (await inventarioCompleto()).filter((a) => a.estado !== 'mantenimiento');
}

export async function crearArticuloApi(datos: NuevoArticulo): Promise<ArticuloInventario> {
  const categoria = categoriaHaciaApi[datos.categoria];
  const cantidad = datos.cantidadNumero ?? cantidadNumerica(datos.cantidad);
  const minimo = datos.minimo ?? 0;

  const { articulo_catalogo: articulo } = await peticion<{ articulo_catalogo: FilaCatalogo }>('/catalogo', {
    metodo: 'POST',
    cuerpo: { nombre: datos.nombre, categoria },
  });

  try {
    if (categoria === 'CONSUMIBLES') {
      await peticion('/consumibles', {
        metodo: 'POST',
        cuerpo: {
          fk_id_catalogo: articulo.id_catalogo,
          consumible: datos.nombre.slice(0, 50),
          tipo: datos.tipoConsumible ?? 'CONSUMIBLE',
          cantidad,
          unidad: datos.unidad ?? 'pzas',
          minimo_restock: minimo,
        },
      });
    } else if (categoria === 'EQUIPO_LAB') {
      await peticion('/equipo-lab', {
        metodo: 'POST',
        cuerpo: { fk_id_catalogo: articulo.id_catalogo, nombre: datos.nombre, codigo: codigoNuevo('EQ'), cantidad, minimo_restock: minimo },
      });
    } else {
      await peticion('/materiales', {
        metodo: 'POST',
        cuerpo: {
          fk_id_catalogo: articulo.id_catalogo,
          nombre: datos.nombre,
          codigo: codigoNuevo('MT'),
          categoria: datos.tipoMaterial ?? 'UTENSILIO',
          cantidad,
          minimo_restock: minimo,
          notas: datos.descripcion?.slice(0, 100) ?? null,
        },
      });
    }
  } catch (error) {
    // Si el detalle no pasó la validación (p. ej. una unidad inválida) no se deja el catálogo huérfano
    await peticion(`/catalogo/${articulo.id_catalogo}`, { metodo: 'DELETE' }).catch(() => undefined);
    throw error;
  }

  const contexto = await cargarInventario();
  return mapInventario(articulo, contexto);
}

/** "5 botes" → { cantidad: 5, unidad: 'botes' } */
function cantidadYUnidad(texto: string): { cantidad: number; unidad?: string } {
  const partes = /^\s*(\d+)\s*(.*)$/.exec(texto);
  if (!partes) return { cantidad: cantidadNumerica(texto) };
  const unidad = partes[2].trim();
  return { cantidad: Number(partes[1]), ...(unidad && { unidad: unidad.slice(0, 20) }) };
}

/**
 * Edita el artículo del catálogo y su detalle. La categoría (consumible,
 * equipo o material) no cambia: cada una vive en una tabla distinta.
 */
export async function editarArticuloApi(id: string, datos: NuevoArticulo): Promise<ArticuloInventario> {
  const contexto = await cargarInventario();
  const catalogo = contexto.catalogo.find((c) => c.id_catalogo === Number(id));
  if (!catalogo) throw new Error('Artículo no encontrado');

  const nombre = datos.nombre.trim();

  if (catalogo.categoria === 'CONSUMIBLES') {
    const detalle = contexto.consumibles.find((c) => c.fk_id_catalogo === catalogo.id_catalogo);
    if (detalle) {
      await peticion(`/consumibles/${detalle.id_consumibles}`, {
        metodo: 'PATCH',
        cuerpo: {
          consumible: nombre.slice(0, 50),
          ...(datos.cantidadNumero !== undefined && datos.unidad
            ? { cantidad: datos.cantidadNumero, unidad: datos.unidad }
            : cantidadYUnidad(datos.cantidad)),
          ...(datos.minimo !== undefined && { minimo_restock: datos.minimo }),
        },
      });
    }
  } else if (catalogo.categoria === 'EQUIPO_LAB') {
    const detalle = contexto.equipos.find((e) => e.fk_id_catalogo === catalogo.id_catalogo);
    if (detalle) {
      const cantidad = datos.cantidadNumero ?? cantidadNumerica(datos.cantidad);
      await peticion(`/equipo-lab/${detalle.id_equipo_lab}`, {
        metodo: 'PATCH',
        cuerpo: { nombre, cantidad, ...(datos.minimo !== undefined && { minimo_restock: datos.minimo }), ...(cantidad === 0 ? { estado: 'BAJA' } : detalle.estado === 'BAJA' && { estado: 'DISPONIBLE' }) },
      });
    }
  } else {
    const detalle = contexto.materiales.find((m) => m.fk_id_catalogo === catalogo.id_catalogo);
    if (detalle) {
      const cantidad = datos.cantidadNumero ?? cantidadNumerica(datos.cantidad);
      await peticion(`/materiales/${detalle.id_materiales}`, {
        metodo: 'PATCH',
        cuerpo: {
          nombre,
          cantidad,
          ...(datos.minimo !== undefined && { minimo_restock: datos.minimo }),
          ...(cantidad === 0 ? { estado: 'BAJA' } : detalle.estado === 'BAJA' && { estado: 'DISPONIBLE' }),
          ...(datos.tipoMaterial && { categoria: datos.tipoMaterial }),
        },
      });
    }
  }

  const { articulo_catalogo: actualizado } = await peticion<{ articulo_catalogo: FilaCatalogo }>(`/catalogo/${id}`, {
    metodo: 'PATCH',
    cuerpo: { nombre },
  });

  return mapInventario(actualizado, await cargarInventario());
}

/**
 * Borra el artículo del catálogo y su detalle. Antes revisa que no esté en
 * ninguna solicitud ni aprobación, para no dejar el borrado a medias.
 */
export async function borrarArticuloApi(id: string): Promise<void> {
  const [contexto, renglones, aprobMateriales, aprobEquipo, aprobConsumibles] = await Promise.all([
    cargarInventario(),
    lista<FilaPeticionCatalogo>('/peticion-catalogo', 'peticion_catalogo'),
    lista<Record<string, number>>('/aprob-materiales', 'aprob_materiales'),
    lista<Record<string, number>>('/aprob-equipo-lab', 'aprob_equipo_lab'),
    lista<Record<string, number>>('/aprob-consumibles', 'aprob_consumibles'),
  ]);
  const articulo = contexto.catalogo.find((c) => c.id_catalogo === Number(id));

  if (!articulo) throw new Error('Artículo no encontrado');

  const consumible = contexto.consumibles.find((c) => c.fk_id_catalogo === articulo.id_catalogo);
  const equipo = contexto.equipos.find((e) => e.fk_id_catalogo === articulo.id_catalogo);
  const material = contexto.materiales.find((m) => m.fk_id_catalogo === articulo.id_catalogo);

  const enUso =
    renglones.some((r) => r.fk_id_catalogo === articulo.id_catalogo) ||
    (!!material && aprobMateriales.some((a) => a.fk_id_material === material.id_materiales)) ||
    (!!equipo && aprobEquipo.some((a) => a.fk_id_equipo_lab === equipo.id_equipo_lab)) ||
    (!!consumible && aprobConsumibles.some((a) => a.fk_id_consumible === consumible.id_consumibles));

  if (enUso) {
    throw new Error('No se puede borrar: ya aparece en solicitudes de material. Pon su cantidad en 0 para darlo de baja.');
  }

  if (consumible) await peticion(`/consumibles/${consumible.id_consumibles}`, { metodo: 'DELETE' });
  if (equipo) await peticion(`/equipo-lab/${equipo.id_equipo_lab}`, { metodo: 'DELETE' });
  if (material) await peticion(`/materiales/${material.id_materiales}`, { metodo: 'DELETE' });

  await peticion(`/catalogo/${id}`, { metodo: 'DELETE' });
}

// ---------------------------- Reportes ----------------------------

function mapReporte(fila: FilaReporte, practicas: Practica[], evidencias: FilaEvidencia[]): Reporte {
  const practica = practicas.find((p) => p.id === String(fila.fk_id_practica));
  return {
    id: String(fila.id_reportes),
    tipo: 'aula',
    practicaId: fila.fk_id_practica ? String(fila.fk_id_practica) : '',
    titulo: fila.titulo,
    nombrePractica: practica?.nombre ?? '',
    autorRol: 'laboratorista',
    autorNombre: '',
    fecha: fila.fecha,
    // Rutas del API (/evidencias/12): se bajan con la sesión en <ImagenProtegida>
    fotos: evidencias.filter((e) => e.fk_id_reporte === fila.id_reportes).map((e) => `/evidencias/${e.id_evidencia}`),
    nota: fila.descripcion,
    severidad: 'en-orden',
    decision: null,
  };
}

export async function obtenerReportesApi(): Promise<Reporte[]> {
  const [filas, practicas, evidencias] = await Promise.all([
    lista<FilaReporte>('/reportes', 'reportes'),
    obtenerPracticasApi(),
    lista<FilaEvidencia>('/evidencias', 'evidencias'),
  ]);
  return filas.map((f) => mapReporte(f, practicas, evidencias)).sort((a, b) => b.fecha.localeCompare(a.fecha));
}

export async function decidirReporteApi(id: string, decision: Decision | null): Promise<Reporte> {
  const reporte = (await obtenerReportesApi()).find((r) => r.id === id);
  if (!reporte) throw new Error('Reporte no encontrado');

  // El esquema no guarda la decisión: se mantiene en la sesión de la UI.
  return { ...reporte, decision };
}

function descripcionDeCalificaciones(
  calificaciones: CalificacionesReporte,
  nota?: string,
): string {
  const rubros = Object.entries(calificaciones)
    .map(([rubro, valor]) => `${rubro}: ${valor}`)
    .join(', ');
  return [nota, rubros].filter(Boolean).join(' · ').slice(0, 255);
}

/** Baja una evidencia con la sesión iniciada y regresa una URL local para un <img> */
export async function urlDeEvidenciaApi(ruta: string): Promise<string> {
  return URL.createObjectURL(await peticionBlob(ruta));
}

/**
 * Sube las fotos de un reporte de una en una (se reducen antes de subir).
 * Si alguna falla, el reporte ya existe: se sigue con las demás y se cuenta
 * cuántas no subieron para avisar sin duplicar el reporte.
 */
async function subirEvidenciasApi(reporteId: number, fotos: File[]): Promise<number> {
  let fallidas = 0;

  for (const foto of fotos) {
    try {
      const archivo = await prepararFoto(foto);
      await peticion(`/reportes/${reporteId}/evidencias`, { metodo: 'POST', archivo, nombreArchivo: foto.name });
    } catch {
      fallidas += 1;
    }
  }

  return fallidas;
}

export async function crearReporteApi(datos: NuevoReporte): Promise<{ id: string; fotosFallidas: number }> {
  const practicas = await obtenerPracticasApi();
  const practica = practicas.find((p) => p.id === datos.practicaId);
  if (!practica) throw new Error('Elige la práctica del reporte');

  const { reporte } = await peticion<{ reporte: FilaReporte }>('/reportes', {
    metodo: 'POST',
    cuerpo: {
      titulo: `${practica.nombre}${practica.grupo ? ` · Grupo ${practica.grupo}` : ''}`.slice(0, 100),
      descripcion: descripcionDeCalificaciones(datos.calificaciones, datos.nota) || 'Reporte de aula',
      fecha: new Date().toISOString(),
      fk_id_practica: Number(practica.id),
    },
  });

  const fotosFallidas = await subirEvidenciasApi(reporte.id_reportes, datos.fotos.slice(0, MAX_EVIDENCIAS));

  return { id: String(reporte.id_reportes), fotosFallidas };
}

// ---------------------------- Horarios, fotos y mascota ----------------------------

/** Bloques de la semana que empieza en `lunes`, a partir de las prácticas */
export async function obtenerHorarioApi(lunes: Date): Promise<BloqueHorario[]> {
  const practicas = await obtenerPracticasApi();
  return practicas.flatMap((practica) => bloquesDePractica(practica, lunes));
}

/** El esquema no tiene tabla de fotos: se regresa una lista vacía. */
export function obtenerMisFotosApi(): Promise<FotoPractica[]> {
  return Promise.resolve([]);
}

/** El esquema no tiene tabla de fotos: no hay a dónde subir el archivo. */
export function subirFotoApi(practicaId: string, archivo: File): Promise<FotoPractica> {
  return Promise.resolve({
    id: `local-${Date.now()}`,
    url: '',
    practicaId,
    titulo: archivo.name,
    estado: 'pendiente',
  });
}

/** El esquema no guarda rachas; se calcula una vista neutra. */
export function obtenerRachaApi(rol: 'alumno' | 'otro'): Promise<Racha> {
  const base: Racha = {
    dias: 0,
    etiqueta: rol === 'alumno' ? 'prácticas seguidas' : 'días sin daños',
    animo: 'feliz',
    diasCumplidos: 0,
    nivel: 1,
    puntos: 0,
    puntosSiguienteNivel: 100,
    siguienteRecompensa: 'mandarina',
  };

  return Promise.resolve(base);
}

/** Catálogo de recompensas: es contenido de la app, no una tabla del esquema. */
export function obtenerRecompensasApi(catalogo: Recompensa[]): Promise<Recompensa[]> {
  return Promise.resolve(catalogo);
}

// ---------------------------- Materias y asignaciones ----------------------------

type FilaCarrera = { carrera_id: number; carrera: string };
type FilaMateria = { materia_id: number; nombre: string; carrera_id: number; carrera: string };

function mapMateria(m: FilaMateria): Materia {
  return { id: Number(m.materia_id), nombre: m.nombre, carreraId: Number(m.carrera_id), carrera: m.carrera };
}

export async function obtenerCarrerasApi(): Promise<Carrera[]> {
  const filas = await lista<FilaCarrera>('/carreras', 'carreras');
  return filas.map((c) => ({ id: Number(c.carrera_id), nombre: c.carrera }));
}

export async function obtenerMateriasApi(): Promise<Materia[]> {
  return (await lista<FilaMateria>('/materias', 'materias')).map(mapMateria);
}

export async function crearMateriaApi(datos: NuevaMateria): Promise<Materia> {
  const { materia } = await peticion<{ materia: FilaMateria }>('/materias', {
    metodo: 'POST',
    cuerpo: { nombre: datos.nombre.trim(), carrera_id: datos.carreraId },
  });
  const carreras = await obtenerCarrerasApi();
  return mapMateria({ ...materia, carrera: carreras.find((c) => c.id === Number(materia.carrera_id))?.nombre ?? '' });
}

export async function borrarMateriaApi(id: number): Promise<void> {
  await peticion(`/materias/${id}`, { metodo: 'DELETE' });
}

export async function obtenerProfesoresApi(): Promise<Profesor[]> {
  const personal = await lista<FilaPersonal>('/personal', 'personal');
  return personal
    .filter((p) => p.tipo === 'PROFESOR')
    .map((p) => ({ id: Number(p.profesor_id), usuarioId: String(p.usuario_id), nombre: `${p.nombre} ${p.apellido}`.trim() }));
}

export async function obtenerAlumnosApi(): Promise<Alumno[]> {
  const alumnos = await lista<FilaAlumno>('/alumnos', 'alumnos');
  return alumnos.map((a) => ({
    id: Number(a.alumno_id),
    usuarioId: String(a.usuario_id),
    nombre: `${a.nombre} ${a.apellido}`.trim(),
    matricula: a.matricula,
    grupoId: Number(a.grupo_id),
    grupo: a.grupo ?? '',
  }));
}

export async function obtenerAsignacionesApi(): Promise<AsignacionMateria[]> {
  const [rpms, rpmGrupos, materias, personal, grupos] = await Promise.all([
    lista<FilaRpm>('/r-profesor-materia', 'r_profesor_materia'),
    lista<FilaRpmGrupo>('/r-profmat-grupo', 'r_profmat_grupo'),
    lista<FilaMateria>('/materias', 'materias'),
    lista<FilaPersonal>('/personal', 'personal'),
    lista<FilaGrupo>('/grupos', 'grupos'),
  ]);

  return rpms.map((r) => {
    const materia = materias.find((m) => Number(m.materia_id) === Number(r.fk_materia));
    const profesor = personal.find((p) => Number(p.profesor_id) === Number(r.fk_profesor));
    return {
      id: Number(r.id_r_profesor_materia),
      materiaId: Number(r.fk_materia),
      materia: materia?.nombre ?? `Materia ${r.fk_materia}`,
      profesorId: Number(r.fk_profesor),
      profesorUsuarioId: profesor ? String(profesor.usuario_id) : '',
      profesorNombre: profesor ? `${profesor.nombre} ${profesor.apellido}`.trim() : `Profesor ${r.fk_profesor}`,
      grupos: rpmGrupos
        .filter((g) => Number(g.fk_r_profesor_materia) === Number(r.id_r_profesor_materia))
        .map((g) => ({
          id: Number(g.fk_grupo),
          nombre: grupos.find((x) => Number(x.grupo_id) === Number(g.fk_grupo))?.grupo ?? '',
        })),
    };
  });
}

export async function asignarMateriaApi(materiaId: number, profesorId: number): Promise<void> {
  await peticion('/r-profesor-materia', {
    metodo: 'POST',
    cuerpo: { fk_materia: materiaId, fk_profesor: profesorId },
  });
}

/** Quita la asignación con sus grupos. Falla (400) si ya tiene equipos. */
export async function quitarAsignacionApi(asignacion: AsignacionMateria): Promise<void> {
  const equipos = await lista<FilaEquipo>('/equipo', 'equipo');
  if (equipos.some((e) => Number(e.fk_id_r_profesor_materia) === asignacion.id)) {
    throw new Error('Esta asignación ya tiene equipos de alumnos; bórralos primero');
  }
  await Promise.all(
    asignacion.grupos.map((g) => peticion(`/r-profmat-grupo/${asignacion.id}/${g.id}`, { metodo: 'DELETE' })),
  );
  await peticion(`/r-profesor-materia/${asignacion.id}`, { metodo: 'DELETE' });
}

export async function asignarGrupoApi(asignacionId: number, grupoId: number): Promise<void> {
  await peticion('/r-profmat-grupo', {
    metodo: 'POST',
    cuerpo: { fk_r_profesor_materia: asignacionId, fk_grupo: grupoId },
  });
}

export async function quitarGrupoApi(asignacionId: number, grupoId: number): Promise<void> {
  await peticion(`/r-profmat-grupo/${asignacionId}/${grupoId}`, { metodo: 'DELETE' });
}
