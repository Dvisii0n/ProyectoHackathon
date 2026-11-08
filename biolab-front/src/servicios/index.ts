// ----------------------------------------------------------------------
// Servicios: una función por cada endpoint que necesita el front.
// Con VITE_USAR_MOCKS=true trabajan sobre src/datos-mock/almacen.ts
// (los cambios se guardan en el navegador); con false llaman al back.
// El detalle de cada endpoint está en docs/contrato-api.md
// ----------------------------------------------------------------------

import type {
  Rol,
  Racha,
  Cuenta,
  Alumno,
  Usuario,
  Reporte,
  Carrera,
  Materia,
  Decision,
  Practica,
  Profesor,
  TipoCuenta,
  Recompensa,
  NuevaCuenta,
  NuevoEquipo,
  GrupoEscolar,
  NuevoReporte,
  FotoPractica,
  NuevaMateria,
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
} from 'src/tipos/dominio';

import { DIAS_PARA_PEDIR_MATERIAL } from 'src/tipos/dominio';
import { lunesDe, bloquesDePractica } from 'src/utilidades/horario';
import { AYUDA_GRUPO, normalizarGrupo } from 'src/utilidades/grupo';
import { nuevoId, leerTabla, guardarTabla } from 'src/datos-mock/almacen';
import {
  fotosMock,
  horarioMock,
  carrerasMock,
  usuariosMock,
  rachaAlumnoMock,
  recompensasMock,
  rachaLaboratorioMock,
} from 'src/datos-mock';

import { ErrorApi, peticion, USAR_MOCKS, guardarToken, simularRespuesta } from './cliente-api';
import {
  subirFotoApi,
  crearEquipoApi,
  quitarGrupoApi,
  borrarEquipoApi,
  crearReporteApi,
  obtenerRachaApi,
  asignarGrupoApi,
  crearMateriaApi,
  crearArticuloApi,
  crearPracticaApi,
  borrarMateriaApi,
  urlDeEvidenciaApi,
  borrarArticuloApi,
  borrarPracticaApi,
  crearSolicitudApi,
  decidirReporteApi,
  editarArticuloApi,
  obtenerEquiposApi,
  obtenerHorarioApi,
  asignarMateriaApi,
  obtenerAlumnosApi,
  obtenerMisFotosApi,
  obtenerReportesApi,
  obtenerCarrerasApi,
  obtenerMateriasApi,
  obtenerPracticasApi,
  revisarSolicitudApi,
  quitarAsignacionApi,
  entregarSolicitudApi,
  obtenerInventarioApi,
  obtenerProfesoresApi,
  obtenerRecompensasApi,
  obtenerSolicitudesApi,
  obtenerMisPracticasApi,
  registrarDevolucionApi,
  obtenerAsignacionesApi,
  obtenerInventarioTodoApi,
  obtenerDisponibilidadApi,
  obtenerPracticasDeHoyApi,
  obtenerMaterialPrestableApi,
  obtenerPracticasParaReporteApi,
} from './esquema';

// ---------------------------- Sesión ----------------------------

/** El back llama ADMIN al coordinador */
const rolDeTipo: Record<TipoCuenta, Rol> = {
  ALUMNO: 'alumno',
  PROFESOR: 'profesor',
  LABORATORISTA: 'laboratorista',
  ADMIN: 'coordinador',
};

/**
 * POST /auth/login — solo inicio de sesión, no hay registro.
 * Guarda el token y regresa el usuario. Con mocks, basta el usuario de ejemplo.
 */
export async function entrar(usuario: string, contrasena: string): Promise<Usuario> {
  const nombreUsuario = usuario.trim().toLowerCase();

  if (USAR_MOCKS) {
    const encontrado = usuariosMock.find((u) => u.usuario === nombreUsuario);
    if (!encontrado) throw new Error('Ese usuario no tiene cuenta. Pídele acceso a la coordinación.');
    guardarToken('token-de-ejemplo');
    return simularRespuesta(encontrado, 400);
  }
  const respuesta = await peticion<{
    token: string;
    usuario: { usuario_id: string | number; usuario: string; rol: TipoCuenta };
    tipo: TipoCuenta;
    perfil: { nombre: string; apellido: string; grupo_id?: string | number | null } | null;
  }>('/auth/login', {
    metodo: 'POST',
    cuerpo: { usuario: nombreUsuario, contrasena },
  });
  guardarToken(respuesta.token);

  // El login solo trae grupo_id; el nombre del grupo (3-02…) se pide aparte si es alumno.
  let grupo: string | undefined;
  if (respuesta.tipo === 'ALUMNO' && respuesta.perfil?.grupo_id) {
    try {
      const grupos = await obtenerGruposEscolares();
      grupo = grupos.find((g) => g.id === Number(respuesta.perfil?.grupo_id))?.nombre;
    } catch {
      // sin el nombre del grupo la app funciona igual
    }
  }

  return {
    id: String(respuesta.usuario.usuario_id),
    nombre: respuesta.perfil ? `${respuesta.perfil.nombre} ${respuesta.perfil.apellido}` : respuesta.usuario.usuario,
    usuario: respuesta.usuario.usuario,
    rol: rolDeTipo[respuesta.tipo],
    grupo,
  };
}

// ---------------------------- Equipos de alumnos (profesor) ----------------------------

/** GET /equipo + tablas relacionadas — los equipos del profesor que inició sesión */
export function obtenerEquipos(): Promise<EquipoAlumnos[]> {
  if (USAR_MOCKS) return simularRespuesta(leerTabla('equipos'));
  return obtenerEquiposApi();
}

/** POST /equipo — se registran a principio de semestre */
export function crearEquipo(datos: NuevoEquipo, profesorId = ''): Promise<EquipoAlumnos> {
  if (USAR_MOCKS) {
    const equipo: EquipoAlumnos = { nombre: datos.nombre, grupo: datos.grupo, integrantes: datos.integrantes, id: nuevoId('e'), profesorId: 'u-prof' };
    guardarTabla('equipos', [...leerTabla('equipos'), equipo]);
    return simularRespuesta(equipo);
  }
  return crearEquipoApi(datos, profesorId);
}

/** DELETE /equipo/:id */
export function borrarEquipo(id: string): Promise<void> {
  if (USAR_MOCKS) {
    guardarTabla('equipos', leerTabla('equipos').filter((e) => e.id !== id));
    return simularRespuesta(undefined, 150);
  }
  return borrarEquipoApi(id);
}

// ---------------------------- Prácticas ----------------------------

/** GET /practicas — profesor: las que creó; laboratorista/coordinador: todas */
export function obtenerPracticas(): Promise<Practica[]> {
  if (USAR_MOCKS) return simularRespuesta(ordenarPorFecha(leerTabla('practicas')));
  return obtenerPracticasApi();
}

/** GET /practicas/mias — alumno: las prácticas asignadas a su equipo */
export function obtenerMisPracticas(alumnoId: string): Promise<{ practicas: Practica[]; equipo: EquipoAlumnos | null }> {
  if (USAR_MOCKS) {
    const equipos = leerTabla('equipos').filter((e) => e.integrantes.some((i) => i.id === alumnoId));
    const ids = equipos.map((e) => e.id);
    const practicas = leerTabla('practicas').filter((p) => p.equipoIds.some((id) => ids.includes(id)));
    return simularRespuesta({ practicas: ordenarPorFecha(practicas), equipo: equipos[0] ?? null });
  }
  return obtenerMisPracticasApi(alumnoId);
}

/** POST /practicas — el profesor elige día, hora, laboratorio y equipos */
export function crearPractica(datos: NuevaPractica, profesorId = ''): Promise<Practica> {
  if (USAR_MOCKS) {
    const practica: Practica = { ...datos, id: nuevoId('p'), profesorId: 'u-prof', profesorNombre: 'Profesor' };
    guardarTabla('practicas', [...leerTabla('practicas'), practica]);
    return simularRespuesta(practica);
  }
  return crearPracticaApi(datos, profesorId);
}

/** DELETE /practicas/:id */
export function borrarPractica(id: string): Promise<void> {
  if (USAR_MOCKS) {
    guardarTabla('practicas', leerTabla('practicas').filter((p) => p.id !== id));
    return simularRespuesta(undefined, 150);
  }
  return borrarPracticaApi(id);
}

/** Prácticas que ya empezaron (o empiezan hoy): las que se pueden reportar, la más reciente primero */
export function obtenerPracticasParaReporte(): Promise<Practica[]> {
  if (USAR_MOCKS) {
    const finDeHoy = new Date();
    finDeHoy.setHours(23, 59, 59, 999);
    return simularRespuesta(
      leerTabla('practicas')
        .filter((p) => new Date(p.inicio) <= finDeHoy)
        .sort((a, b) => b.inicio.localeCompare(a.inicio)),
    );
  }
  return obtenerPracticasParaReporteApi();
}

/** GET /practicas?hoy=true — prácticas que se pueden reportar (aula) */
export function obtenerPracticasDeHoy(): Promise<Practica[]> {
  if (USAR_MOCKS) return simularRespuesta(ordenarPorFecha(leerTabla('practicas')));
  return obtenerPracticasDeHoyApi();
}

/** ¿Ya se puede pedir material para esta práctica? (una semana antes y hasta que empieza) */
export function ventanaParaPedir(practica: Practica, ahora = new Date()) {
  const inicio = new Date(practica.inicio);
  const abre = new Date(inicio);
  abre.setDate(abre.getDate() - DIAS_PARA_PEDIR_MATERIAL);
  abre.setHours(0, 0, 0, 0);
  if (ahora > inicio) return { estado: 'pasada' as const, abre };
  if (ahora < abre) return { estado: 'cerrada' as const, abre };
  return { estado: 'abierta' as const, abre };
}

function ordenarPorFecha(practicas: Practica[]) {
  return practicas.slice().sort((a, b) => a.inicio.localeCompare(b.inicio));
}

// ---------------------------- Solicitudes de material ----------------------------

/** GET /solicitudes — laboratorista: todas; alumno: las de su equipo */
export function obtenerSolicitudes(filtro?: { equipoId?: string }): Promise<SolicitudMaterial[]> {
  if (USAR_MOCKS) {
    const todas = leerTabla('solicitudes').filter((s) => !filtro?.equipoId || s.equipoId === filtro.equipoId);
    return simularRespuesta(todas.sort((a, b) => b.fecha.localeCompare(a.fecha)));
  }
  return obtenerSolicitudesApi(filtro);
}

/**
 * GET /disponibilidad?practica=…&equipo=… — cuánto se puede pedir de cada artículo para esa práctica.
 * Con datos de ejemplo no hay existencias reales: regresa null y no se limita nada.
 */
export function obtenerDisponibilidad(practicaId: string, equipoId: string): Promise<Record<string, Disponibilidad> | null> {
  if (USAR_MOCKS) return simularRespuesta(null, 100);
  return obtenerDisponibilidadApi(practicaId, equipoId);
}

/** POST /solicitudes — un integrante pide para todo su equipo */
export function crearSolicitud(datos: NuevaSolicitud, solicitante: Usuario): Promise<SolicitudMaterial> {
  if (USAR_MOCKS) {
    const practica = leerTabla('practicas').find((p) => p.id === datos.practicaId);
    const equipo = leerTabla('equipos').find((e) => e.id === datos.equipoId);
    const inventario = leerTabla('inventario');
    if (!practica || !equipo) return Promise.reject(new Error('Práctica o equipo no encontrado'));
    if (ventanaParaPedir(practica).estado !== 'abierta') {
      return Promise.reject(new Error('Solo puedes pedir material una semana antes de la práctica'));
    }
    const solicitud: SolicitudMaterial = {
      id: nuevoId('s'),
      practicaId: practica.id,
      nombrePractica: practica.nombre,
      inicioPractica: practica.inicio,
      equipoId: equipo.id,
      nombreEquipo: equipo.nombre,
      grupo: equipo.grupo,
      solicitanteId: solicitante.id,
      solicitanteNombre: solicitante.nombre,
      fecha: new Date().toISOString(),
      estado: 'pendiente',
      renglones: datos.renglones.map((r) => ({
        articuloId: r.articuloId,
        nombre: inventario.find((a) => a.id === r.articuloId)?.nombre ?? r.articuloId,
        cantidad: r.cantidad,
        aceptado: null,
      })),
    };
    guardarTabla('solicitudes', [...leerTabla('solicitudes'), solicitud]);
    return simularRespuesta(solicitud, 500);
  }
  return crearSolicitudApi(datos);
}

/**
 * PATCH /solicitudes/:id/revision — el laboratorista palomea qué acepta.
 * Si acepta al menos uno, queda "aprobada" y el back genera el QR; si no, "rechazada".
 */
export function revisarSolicitud(id: string, aceptados: Record<string, boolean>): Promise<SolicitudMaterial> {
  if (USAR_MOCKS) {
    return actualizarSolicitud(id, (s) => {
      const renglones = s.renglones.map((r) => ({ ...r, aceptado: !!aceptados[r.articuloId] }));
      const alguno = renglones.some((r) => r.aceptado);
      return { ...s, renglones, estado: alguno ? 'aprobada' : 'rechazada', codigoQr: alguno ? `BIOLAB-SOLICITUD-${s.id}` : undefined };
    });
  }
  return revisarSolicitudApi(id, aceptados);
}

/** POST /solicitudes/entregar — el laboratorista escanea el QR y entrega el material */
export function entregarSolicitud(codigoQr: string): Promise<SolicitudMaterial> {
  if (USAR_MOCKS) {
    const solicitud = leerTabla('solicitudes').find((s) => s.codigoQr === codigoQr.trim());
    if (!solicitud || solicitud.estado !== 'aprobada') return Promise.reject(new Error('Ese QR no corresponde a una solicitud aprobada'));
    return actualizarSolicitud(solicitud.id, (s) => ({ ...s, estado: 'entregada' }));
  }
  return entregarSolicitudApi(codigoQr);
}

/**
 * POST /solicitudes/:id/devolucion — al terminar la práctica.
 * Si algo regresa con problema, el back crea un reporte de material que les llega
 * al equipo (alumnos) y al coordinador.
 */
export function registrarDevolucion(
  id: string,
  revision: Record<string, { estado: EstadoDevolucion; nota?: string }>
): Promise<SolicitudMaterial> {
  if (USAR_MOCKS) {
    return actualizarSolicitud(id, (s) => {
      const renglones = s.renglones.map((r) => (r.aceptado ? { ...r, devolucion: revision[r.articuloId] ?? { estado: 'bien' as const } } : r));
      const conProblema = renglones.filter((r) => r.devolucion?.estado === 'con-problema');
      if (conProblema.length > 0) {
        const reporte: Reporte = {
          id: nuevoId('r'),
          tipo: 'material',
          practicaId: s.practicaId,
          equipoId: s.equipoId,
          titulo: `${s.nombreEquipo} · Grupo ${s.grupo}`,
          nombrePractica: s.nombrePractica,
          autorRol: 'laboratorista',
          autorNombre: 'Laboratorista',
          fecha: new Date().toISOString(),
          materialConProblema: conProblema.map((r) => ({ nombre: r.nombre, nota: r.devolucion?.nota || 'Sin nota' })),
          fotos: [],
          nota: `Material devuelto con problema: ${conProblema.map((r) => r.nombre).join(', ')}.`,
          severidad: 'dano',
          decision: null,
        };
        guardarTabla('reportes', [reporte, ...leerTabla('reportes')]);
      }
      return { ...s, renglones, estado: conProblema.length > 0 ? 'con-problemas' : 'devuelta' };
    });
  }
  return registrarDevolucionApi(id, revision);
}

function actualizarSolicitud(id: string, cambio: (s: SolicitudMaterial) => SolicitudMaterial): Promise<SolicitudMaterial> {
  const solicitudes = leerTabla('solicitudes');
  const actual = solicitudes.find((s) => s.id === id);
  if (!actual) return Promise.reject(new Error('Solicitud no encontrada'));
  const nueva = cambio(actual);
  guardarTabla('solicitudes', solicitudes.map((s) => (s.id === id ? nueva : s)));
  return simularRespuesta(nueva, 300);
}

/** Todo el inventario, también lo agotado o en uso (el equipo ve por qué algo no se puede pedir) */
export function obtenerInventarioTodo(): Promise<ArticuloInventario[]> {
  if (USAR_MOCKS) return simularRespuesta(leerTabla('inventario'));
  return obtenerInventarioTodoApi();
}

/** GET /inventario/prestable — lo que un equipo puede pedir (consumibles, equipo disponible, utensilios) */
export function obtenerMaterialPrestable(): Promise<ArticuloInventario[]> {
  if (USAR_MOCKS) {
    return simularRespuesta(leerTabla('inventario').filter((a) => a.estado !== 'mantenimiento'));
  }
  return obtenerMaterialPrestableApi();
}

// ---------------------------- Reportes ----------------------------

/** GET /reportes — bandeja del coordinador (aula y material). Solo ADMIN: el laboratorista únicamente los crea */
export function obtenerReportes(): Promise<Reporte[]> {
  if (USAR_MOCKS) return simularRespuesta(leerTabla('reportes'));
  return obtenerReportesApi();
}

/**
 * Reportes de un equipo (pantalla del alumno). Con la API no hay ninguno: el
 * esquema no liga reportes con equipos y solo el coordinador puede leerlos.
 */
export function obtenerReportesDeEquipo(_equipoId: string): Promise<Reporte[]> {
  if (USAR_MOCKS) return simularRespuesta(leerTabla('reportes').filter((r) => r.equipoId === _equipoId));
  return Promise.resolve([]);
}

/** PATCH /reportes/:id/decision — el coordinador decide qué hacer (null = deshacer) */
export function decidirReporte(id: string, decision: Decision | null): Promise<Reporte> {
  if (USAR_MOCKS) {
    const reportes = leerTabla('reportes');
    const reporte = reportes.find((r) => r.id === id);
    if (!reporte) return Promise.reject(new Error('Reporte no encontrado'));
    const actualizado = { ...reporte, decision };
    guardarTabla('reportes', reportes.map((r) => (r.id === id ? actualizado : r)));
    return simularRespuesta(actualizado, 150);
  }
  return decidirReporteApi(id, decision);
}

/** POST /reportes (multipart) — reporte de aula que hacen laboratorista o profesor */
export function crearReporte(datos: NuevoReporte): Promise<{ id: string; fotosFallidas: number }> {
  if (USAR_MOCKS) {
    const practica = leerTabla('practicas').find((p) => p.id === datos.practicaId);
    const valores = Object.values(datos.calificaciones);
    const reporte: Reporte = {
      id: nuevoId('r'),
      tipo: 'aula',
      practicaId: datos.practicaId,
      titulo: practica ? `Grupo ${practica.grupo}` : 'Aula',
      nombrePractica: practica?.nombre ?? '',
      autorRol: 'laboratorista',
      autorNombre: 'Laboratorista',
      fecha: new Date().toISOString(),
      calificaciones: datos.calificaciones,
      fotos: [],
      nota: datos.nota,
      severidad: datos.calificaciones.equipo === 'mal' ? 'dano' : valores.some((v) => v !== 'bien') ? 'advertencia' : 'en-orden',
      decision: null,
    };
    guardarTabla('reportes', [reporte, ...leerTabla('reportes')]);
    // Con datos de ejemplo no hay dónde guardar las fotos
    return simularRespuesta({ id: reporte.id, fotosFallidas: 0 }, 600);
  }
  return crearReporteApi(datos);
}

// ---------------------------- Inventario ----------------------------

/** GET /inventario?categoria=… */
export function obtenerInventario(categoria: CategoriaInventario): Promise<ArticuloInventario[]> {
  if (USAR_MOCKS) return simularRespuesta(leerTabla('inventario').filter((a) => a.categoria === categoria));
  return obtenerInventarioApi(categoria);
}

/** POST /inventario — solo laboratorista */
export function crearArticulo(datos: NuevoArticulo): Promise<ArticuloInventario> {
  if (USAR_MOCKS) {
    const articulo = { ...datos, id: nuevoId('i') };
    guardarTabla('inventario', [articulo, ...leerTabla('inventario')]);
    return simularRespuesta(articulo);
  }
  return crearArticuloApi(datos);
}

/** PUT /inventario/:id — solo laboratorista */
export function editarArticulo(id: string, datos: NuevoArticulo): Promise<ArticuloInventario> {
  if (USAR_MOCKS) {
    const articulo = { ...datos, id };
    guardarTabla('inventario', leerTabla('inventario').map((a) => (a.id === id ? articulo : a)));
    return simularRespuesta(articulo);
  }
  return editarArticuloApi(id, datos);
}

/** DELETE /inventario/:id — solo laboratorista */
export function borrarArticulo(id: string): Promise<void> {
  if (USAR_MOCKS) {
    guardarTabla('inventario', leerTabla('inventario').filter((a) => a.id !== id));
    return simularRespuesta(undefined);
  }
  return borrarArticuloApi(id);
}

// ---------------------------- Horarios ----------------------------

/** Bloques de una semana (lunes a viernes). Cada práctica ocupa sus horas de inicio a fin. */
export function obtenerHorarioSemana(semana: Date = new Date()): Promise<BloqueHorario[]> {
  const lunes = lunesDe(semana);
  if (USAR_MOCKS) {
    const dePracticas = leerTabla('practicas').flatMap((p) => bloquesDePractica(p, lunes));
    const esEstaSemana = lunes.getTime() === lunesDe(new Date()).getTime();
    const ocupados = new Set(dePracticas.map((b) => `${b.dia}-${b.hora}`));
    const fijos = esEstaSemana ? horarioMock.filter((b) => !ocupados.has(`${b.dia}-${b.hora}`)) : [];
    return simularRespuesta([...dePracticas, ...fijos]);
  }
  return obtenerHorarioApi(lunes);
}

// ---------------------------- Galería y mascota ----------------------------

/** GET /fotos?mias=true&estado=aprobada */
export function obtenerMisFotos(): Promise<FotoPractica[]> {
  if (USAR_MOCKS) return simularRespuesta(fotosMock);
  return obtenerMisFotosApi();
}

/** POST /fotos (multipart) — queda pendiente hasta que el laboratorista la apruebe */
export function subirFoto(practicaId: string, archivo: File): Promise<FotoPractica> {
  if (USAR_MOCKS) {
    return simularRespuesta<FotoPractica>({ id: nuevoId('f'), url: '', practicaId, titulo: archivo.name, estado: 'pendiente' });
  }
  return subirFotoApi(practicaId, archivo);
}

/** GET /racha — la del laboratorio para coordinador/laboratorista/profesor, la del equipo para alumnos */
export function obtenerRacha(rol: Rol): Promise<Racha> {
  if (USAR_MOCKS) return simularRespuesta(rol === 'alumno' ? rachaAlumnoMock : rachaLaboratorioMock, 200);
  return obtenerRachaApi(rol === 'alumno' ? 'alumno' : 'otro');
}

/** GET /recompensas */
export function obtenerRecompensas(): Promise<Recompensa[]> {
  if (USAR_MOCKS) return simularRespuesta(recompensasMock);
  return obtenerRecompensasApi(recompensasMock);
}

// ---------------------------- Cuentas (coordinador y laboratorista) ----------------------------

type FilaAlumnoApi = { usuario_id: string | number; usuario: string; nombre: string; apellido: string; matricula: string; grupo: string | null };
type FilaPersonalApi = { usuario_id: string | number; usuario: string; nombre: string; apellido: string; tipo: Exclude<TipoCuenta, 'ALUMNO'> };
type FilaUsuarioApi = { usuario_id: string | number; usuario: string; rol: TipoCuenta; activo: boolean };

/**
 * GET /alumnos, GET /personal y GET /usuarios — el back no tiene un listado
 * único con el tipo, así que se juntan. Los ADMIN solo existen en `usuarios`
 * (no tienen fila en `personal`), por eso se agregan al final. Las cuentas
 * más nuevas salen primero.
 */
export async function obtenerCuentas(): Promise<Cuenta[]> {
  if (USAR_MOCKS) return simularRespuesta(leerTabla('cuentas'));

  const [alumnos, personal, usuarios] = await Promise.all([
    peticion<{ alumnos: FilaAlumnoApi[] }>('/alumnos'),
    peticion<{ personal: FilaPersonalApi[] }>('/personal'),
    peticion<{ usuarios: FilaUsuarioApi[] }>('/usuarios'),
  ]);

  const conPerfil: Cuenta[] = [
    ...alumnos.alumnos.map((a) => ({
      id: String(a.usuario_id),
      usuario: a.usuario,
      tipo: 'ALUMNO' as const,
      nombre: a.nombre,
      apellido: a.apellido,
      matricula: a.matricula,
      grupo: a.grupo ?? undefined,
    })),
    ...personal.personal.map((p) => ({
      id: String(p.usuario_id),
      usuario: p.usuario,
      tipo: p.tipo,
      nombre: p.nombre,
      apellido: p.apellido,
    })),
  ];

  const idsConPerfil = new Set(conPerfil.map((c) => c.id));
  const sinPerfil: Cuenta[] = usuarios.usuarios
    .filter((u) => !idsConPerfil.has(String(u.usuario_id)))
    .map((u) => ({
      id: String(u.usuario_id),
      usuario: u.usuario,
      tipo: u.rol,
      nombre: u.usuario,
      apellido: '',
    }));

  return [...conPerfil, ...sinPerfil].sort((a, b) => Number(b.id) - Number(a.id));
}

/**
 * POST /auth/registro — crea el usuario y su perfil en una sola llamada.
 * Solo ADMIN y LABORATORISTA pueden; solo ADMIN puede crear otro ADMIN.
 * Errores del back: 400 (datos inválidos), 403 (sin permiso), 409 (usuario o matrícula repetidos).
 */
export async function registrarCuenta(datos: NuevaCuenta): Promise<Cuenta> {
  const usuario = datos.usuario.trim().toLowerCase();

  if (USAR_MOCKS) {
    const cuentas = leerTabla('cuentas');
    if (cuentas.some((c) => c.usuario === usuario)) throw new ErrorApi('Ese nombre de usuario ya está en uso', 409);
    if (datos.tipo === 'ALUMNO' && cuentas.some((c) => c.matricula === datos.matricula?.trim())) {
      throw new ErrorApi('Ya existe un alumno con esa matrícula', 409);
    }
    const grupo = datos.grupoId ? leerTabla('grupos').find((g) => g.id === datos.grupoId)?.nombre : undefined;
    const cuenta: Cuenta = {
      id: nuevoId('c'),
      usuario,
      tipo: datos.tipo,
      nombre: datos.nombre.trim(),
      apellido: datos.apellido.trim(),
      ...(datos.tipo === 'ALUMNO' && { matricula: datos.matricula?.trim(), grupo }),
    };
    guardarTabla('cuentas', [cuenta, ...cuentas]);
    return simularRespuesta(cuenta, 500);
  }

  // OJO: el back también regresa un `token` de la cuenta nueva. No se guarda a propósito:
  // quien registra debe seguir con su propia sesión.
  const respuesta = await peticion<{
    usuario: { usuario_id: string | number; usuario: string };
    tipo: TipoCuenta;
    perfil: { nombre: string; apellido: string; matricula?: string } | null;
  }>('/auth/registro', {
    metodo: 'POST',
    cuerpo: {
      usuario,
      contrasena: datos.contrasena,
      tipo: datos.tipo,
      nombre: datos.nombre.trim(),
      apellido: datos.apellido.trim(),
      ...(datos.tipo === 'ALUMNO' && { matricula: datos.matricula?.trim(), grupo_id: datos.grupoId ?? null }),
    },
  });

  return {
    id: String(respuesta.usuario.usuario_id),
    usuario: respuesta.usuario.usuario,
    tipo: respuesta.tipo,
    nombre: respuesta.perfil?.nombre ?? datos.nombre.trim(),
    apellido: respuesta.perfil?.apellido ?? datos.apellido.trim(),
    matricula: respuesta.perfil?.matricula,
  };
}

/** GET /grupos — para elegir el grupo de un alumno nuevo */
export async function obtenerGruposEscolares(): Promise<GrupoEscolar[]> {
  if (USAR_MOCKS) return simularRespuesta(leerTabla('grupos'));
  const respuesta = await peticion<{ grupos: { grupo_id: string | number; grupo: string }[] }>('/grupos');
  return respuesta.grupos.map((g) => ({ id: Number(g.grupo_id), nombre: g.grupo }));
}

/** POST /grupos — crea un grupo escolar semestre-número (1-01, 3-02…) */
export async function crearGrupo(nombre: string): Promise<GrupoEscolar> {
  const limpio = normalizarGrupo(nombre);
  if (!limpio) throw new ErrorApi(AYUDA_GRUPO, 400);

  if (USAR_MOCKS) {
    const grupos = leerTabla('grupos');
    if (grupos.some((g) => g.nombre.toLowerCase() === limpio.toLowerCase())) {
      throw new ErrorApi('Ese grupo ya existe', 409);
    }
    const grupo: GrupoEscolar = {
      id: Math.max(0, ...grupos.map((g) => g.id)) + 1,
      nombre: limpio,
    };
    guardarTabla('grupos', [...grupos, grupo]);
    return simularRespuesta(grupo, 200);
  }

  const respuesta = await peticion<{ grupo: { grupo_id: string | number; grupo: string } }>('/grupos', {
    metodo: 'POST',
    cuerpo: { grupo: limpio },
  });

  return { id: Number(respuesta.grupo.grupo_id), nombre: respuesta.grupo.grupo };
}

// ---------------------------- Materias y asignaciones (coordinador y laboratorista) ----------------------------

/** GET /carreras — enum cerrado; el esquema las inserta al crear la base */
export function obtenerCarreras(): Promise<Carrera[]> {
  if (USAR_MOCKS) return simularRespuesta(carrerasMock);
  return obtenerCarrerasApi();
}

/** GET /materias */
export function obtenerMaterias(): Promise<Materia[]> {
  if (USAR_MOCKS) return simularRespuesta(leerTabla('materias'));
  return obtenerMateriasApi();
}

/** POST /materias */
export function crearMateria(datos: NuevaMateria): Promise<Materia> {
  if (USAR_MOCKS) {
    const materias = leerTabla('materias');
    const materia: Materia = {
      id: Math.max(0, ...materias.map((m) => m.id)) + 1,
      nombre: datos.nombre.trim(),
      carreraId: datos.carreraId,
      carrera: carrerasMock.find((c) => c.id === datos.carreraId)?.nombre ?? '',
    };
    guardarTabla('materias', [...materias, materia]);
    return simularRespuesta(materia);
  }
  return crearMateriaApi(datos);
}

/** DELETE /materias/:id — el back responde 400 si la materia ya está asignada */
export function borrarMateria(id: number): Promise<void> {
  if (USAR_MOCKS) {
    if (leerTabla('asignaciones').some((a) => a.materiaId === id)) {
      return Promise.reject(new ErrorApi('Referencia inválida', 400));
    }
    guardarTabla('materias', leerTabla('materias').filter((m) => m.id !== id));
    return simularRespuesta(undefined, 150);
  }
  return borrarMateriaApi(id);
}

/** GET /personal filtrado a PROFESOR */
export function obtenerProfesores(): Promise<Profesor[]> {
  if (USAR_MOCKS) {
    return simularRespuesta([{ id: 1, usuarioId: 'u-prof', nombre: 'Profesor De Prueba' }]);
  }
  return obtenerProfesoresApi();
}

/** GET /alumnos — para elegir integrantes de un equipo */
export function obtenerAlumnos(): Promise<Alumno[]> {
  if (USAR_MOCKS) {
    const grupos = leerTabla('grupos');
    const deEquipos = leerTabla('equipos').flatMap((e) =>
      e.integrantes.map((i) => ({ ...i, grupo: e.grupo })),
    );
    const unicos = new Map(deEquipos.map((a) => [a.id, a]));
    return simularRespuesta(
      [...unicos.values()].map((a, i) => ({
        id: i + 1,
        usuarioId: a.id,
        nombre: a.nombre,
        matricula: '',
        grupoId: grupos.find((g) => g.nombre === a.grupo)?.id ?? 0,
        grupo: a.grupo,
      })),
    );
  }
  return obtenerAlumnosApi();
}

/** GET /r-profesor-materia + /r-profmat-grupo — qué profesor da qué materia y a qué grupos */
export function obtenerAsignaciones(): Promise<AsignacionMateria[]> {
  if (USAR_MOCKS) return simularRespuesta(leerTabla('asignaciones'));
  return obtenerAsignacionesApi();
}

/** POST /r-profesor-materia — 409 si ese profesor ya da esa materia */
export function asignarMateria(materiaId: number, profesorId: number): Promise<void> {
  if (USAR_MOCKS) {
    const asignaciones = leerTabla('asignaciones');
    if (asignaciones.some((a) => a.materiaId === materiaId && a.profesorId === profesorId)) {
      return Promise.reject(new ErrorApi('El recurso ya existe', 409));
    }
    const materia = leerTabla('materias').find((m) => m.id === materiaId);
    guardarTabla('asignaciones', [
      ...asignaciones,
      {
        id: Math.max(0, ...asignaciones.map((a) => a.id)) + 1,
        materiaId,
        materia: materia?.nombre ?? '',
        profesorId,
        profesorUsuarioId: 'u-prof',
        profesorNombre: 'Profesor De Prueba',
        grupos: [],
      },
    ]);
    return simularRespuesta(undefined, 150);
  }
  return asignarMateriaApi(materiaId, profesorId);
}

/** DELETE /r-profesor-materia/:id (y sus grupos) */
export function quitarAsignacion(asignacion: AsignacionMateria): Promise<void> {
  if (USAR_MOCKS) {
    guardarTabla('asignaciones', leerTabla('asignaciones').filter((a) => a.id !== asignacion.id));
    return simularRespuesta(undefined, 150);
  }
  return quitarAsignacionApi(asignacion);
}

/** POST /r-profmat-grupo */
export function asignarGrupo(asignacionId: number, grupoId: number): Promise<void> {
  if (USAR_MOCKS) {
    const grupo = leerTabla('grupos').find((g) => g.id === grupoId);
    guardarTabla(
      'asignaciones',
      leerTabla('asignaciones').map((a) =>
        a.id === asignacionId && grupo && !a.grupos.some((g) => g.id === grupoId) ? { ...a, grupos: [...a.grupos, grupo] } : a,
      ),
    );
    return simularRespuesta(undefined, 150);
  }
  return asignarGrupoApi(asignacionId, grupoId);
}

/** DELETE /r-profmat-grupo/:asignacion/:grupo */
export function quitarGrupo(asignacionId: number, grupoId: number): Promise<void> {
  if (USAR_MOCKS) {
    guardarTabla(
      'asignaciones',
      leerTabla('asignaciones').map((a) => (a.id === asignacionId ? { ...a, grupos: a.grupos.filter((g) => g.id !== grupoId) } : a)),
    );
    return simularRespuesta(undefined, 150);
  }
  return quitarGrupoApi(asignacionId, grupoId);
}

/** URL local de una evidencia (/evidencias/12); las URL normales de los datos de ejemplo pasan tal cual */
export async function urlDeEvidencia(ruta: string): Promise<string> {
  if (USAR_MOCKS || !ruta.startsWith('/evidencias/')) return ruta;
  return urlDeEvidenciaApi(ruta);
}
