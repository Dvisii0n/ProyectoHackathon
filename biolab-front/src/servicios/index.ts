// ----------------------------------------------------------------------
// Servicios: una función por cada endpoint que necesita el front.
// Con VITE_USAR_MOCKS=true trabajan sobre src/datos-mock/almacen.ts
// (los cambios se guardan en el navegador); con false llaman al back.
// El detalle de cada endpoint está en docs/contrato-api.md
// ----------------------------------------------------------------------

import type {
  Rol,
  Racha,
  Usuario,
  Reporte,
  Decision,
  Practica,
  Recompensa,
  NuevoEquipo,
  NuevoReporte,
  FotoPractica,
  NuevoArticulo,
  BloqueHorario,
  NuevaPractica,
  EquipoAlumnos,
  NuevaSolicitud,
  EstadoDevolucion,
  SolicitudMaterial,
  ArticuloInventario,
  CategoriaInventario,
} from 'src/tipos/dominio';

import { DIAS_PARA_PEDIR_MATERIAL } from 'src/tipos/dominio';
import { nuevoId, leerTabla, guardarTabla } from 'src/datos-mock/almacen';
import {
  fotosMock,
  horarioMock,
  usuariosMock,
  rachaAlumnoMock,
  recompensasMock,
  rachaLaboratorioMock,
} from 'src/datos-mock';

import { peticion, USAR_MOCKS, guardarToken, simularRespuesta } from './cliente-api';

// ---------------------------- Sesión ----------------------------

/**
 * POST /sesion — solo inicio de sesión, no hay registro.
 * Guarda el token y regresa el usuario. Con mocks, basta el correo de un usuario de ejemplo.
 */
export async function entrar(correo: string, contrasena: string): Promise<Usuario> {
  if (USAR_MOCKS) {
    const usuario = usuariosMock.find((u) => u.correo === correo.trim().toLowerCase());
    if (!usuario) throw new Error('Ese correo no tiene cuenta. Pídele acceso a la coordinación.');
    guardarToken('token-de-ejemplo');
    return simularRespuesta(usuario, 400);
  }
  const respuesta = await peticion<{ token: string; usuario: Usuario }>('/sesion', {
    metodo: 'POST',
    cuerpo: { correo, contrasena },
  });
  guardarToken(respuesta.token);
  return respuesta.usuario;
}

// ---------------------------- Equipos de alumnos (profesor) ----------------------------

/** GET /equipos — los equipos del profesor que inició sesión */
export function obtenerEquipos(): Promise<EquipoAlumnos[]> {
  if (USAR_MOCKS) return simularRespuesta(leerTabla('equipos'));
  return peticion<EquipoAlumnos[]>('/equipos');
}

/** POST /equipos — se registran a principio de semestre */
export function crearEquipo(datos: NuevoEquipo): Promise<EquipoAlumnos> {
  if (USAR_MOCKS) {
    const equipo: EquipoAlumnos = { ...datos, id: nuevoId('e'), profesorId: 'u-prof' };
    guardarTabla('equipos', [...leerTabla('equipos'), equipo]);
    return simularRespuesta(equipo);
  }
  return peticion<EquipoAlumnos>('/equipos', { metodo: 'POST', cuerpo: datos });
}

/** DELETE /equipos/:id */
export function borrarEquipo(id: string): Promise<void> {
  if (USAR_MOCKS) {
    guardarTabla('equipos', leerTabla('equipos').filter((e) => e.id !== id));
    return simularRespuesta(undefined, 150);
  }
  return peticion<void>(`/equipos/${id}`, { metodo: 'DELETE' });
}

// ---------------------------- Prácticas ----------------------------

/** GET /practicas — profesor: las que creó; laboratorista/coordinador: todas */
export function obtenerPracticas(): Promise<Practica[]> {
  if (USAR_MOCKS) return simularRespuesta(ordenarPorFecha(leerTabla('practicas')));
  return peticion<Practica[]>('/practicas');
}

/** GET /practicas/mias — alumno: las prácticas asignadas a su equipo */
export function obtenerMisPracticas(alumnoId: string): Promise<{ practicas: Practica[]; equipo: EquipoAlumnos | null }> {
  if (USAR_MOCKS) {
    const equipos = leerTabla('equipos').filter((e) => e.integrantes.some((i) => i.id === alumnoId));
    const ids = equipos.map((e) => e.id);
    const practicas = leerTabla('practicas').filter((p) => p.equipoIds.some((id) => ids.includes(id)));
    return simularRespuesta({ practicas: ordenarPorFecha(practicas), equipo: equipos[0] ?? null });
  }
  return peticion('/practicas/mias');
}

/** POST /practicas — el profesor elige día, hora, laboratorio y equipos */
export function crearPractica(datos: NuevaPractica): Promise<Practica> {
  if (USAR_MOCKS) {
    const practica: Practica = { ...datos, id: nuevoId('p'), profesorId: 'u-prof', profesorNombre: 'Profesor' };
    guardarTabla('practicas', [...leerTabla('practicas'), practica]);
    return simularRespuesta(practica);
  }
  return peticion<Practica>('/practicas', { metodo: 'POST', cuerpo: datos });
}

/** DELETE /practicas/:id */
export function borrarPractica(id: string): Promise<void> {
  if (USAR_MOCKS) {
    guardarTabla('practicas', leerTabla('practicas').filter((p) => p.id !== id));
    return simularRespuesta(undefined, 150);
  }
  return peticion<void>(`/practicas/${id}`, { metodo: 'DELETE' });
}

/** GET /practicas?hoy=true — prácticas que se pueden reportar (aula) */
export function obtenerPracticasDeHoy(): Promise<Practica[]> {
  if (USAR_MOCKS) return simularRespuesta(ordenarPorFecha(leerTabla('practicas')));
  return peticion<Practica[]>('/practicas?hoy=true');
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
  const consulta = filtro?.equipoId ? `?equipoId=${filtro.equipoId}` : '';
  return peticion<SolicitudMaterial[]>(`/solicitudes${consulta}`);
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
  return peticion<SolicitudMaterial>('/solicitudes', { metodo: 'POST', cuerpo: datos });
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
  return peticion<SolicitudMaterial>(`/solicitudes/${id}/revision`, { metodo: 'PATCH', cuerpo: { aceptados } });
}

/** POST /solicitudes/entregar — el laboratorista escanea el QR y entrega el material */
export function entregarSolicitud(codigoQr: string): Promise<SolicitudMaterial> {
  if (USAR_MOCKS) {
    const solicitud = leerTabla('solicitudes').find((s) => s.codigoQr === codigoQr.trim());
    if (!solicitud || solicitud.estado !== 'aprobada') return Promise.reject(new Error('Ese QR no corresponde a una solicitud aprobada'));
    return actualizarSolicitud(solicitud.id, (s) => ({ ...s, estado: 'entregada' }));
  }
  return peticion<SolicitudMaterial>('/solicitudes/entregar', { metodo: 'POST', cuerpo: { codigoQr } });
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
  return peticion<SolicitudMaterial>(`/solicitudes/${id}/devolucion`, { metodo: 'POST', cuerpo: { revision } });
}

function actualizarSolicitud(id: string, cambio: (s: SolicitudMaterial) => SolicitudMaterial): Promise<SolicitudMaterial> {
  const solicitudes = leerTabla('solicitudes');
  const actual = solicitudes.find((s) => s.id === id);
  if (!actual) return Promise.reject(new Error('Solicitud no encontrada'));
  const nueva = cambio(actual);
  guardarTabla('solicitudes', solicitudes.map((s) => (s.id === id ? nueva : s)));
  return simularRespuesta(nueva, 300);
}

/** GET /inventario/prestable — lo que un equipo puede pedir (consumibles, equipo disponible, utensilios) */
export function obtenerMaterialPrestable(): Promise<ArticuloInventario[]> {
  if (USAR_MOCKS) {
    return simularRespuesta(leerTabla('inventario').filter((a) => a.estado !== 'mantenimiento'));
  }
  return peticion<ArticuloInventario[]>('/inventario/prestable');
}

// ---------------------------- Reportes ----------------------------

/** GET /reportes — bandeja del coordinador (aula y material) */
export function obtenerReportes(): Promise<Reporte[]> {
  if (USAR_MOCKS) return simularRespuesta(leerTabla('reportes'));
  return peticion<Reporte[]>('/reportes');
}

/** GET /reportes?equipoId=… — alumno: los reportes de material de su equipo */
export function obtenerReportesDeEquipo(equipoId: string): Promise<Reporte[]> {
  if (USAR_MOCKS) return simularRespuesta(leerTabla('reportes').filter((r) => r.equipoId === equipoId));
  return peticion<Reporte[]>(`/reportes?equipoId=${equipoId}`);
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
  return peticion<Reporte>(`/reportes/${id}/decision`, { metodo: 'PATCH', cuerpo: { decision } });
}

/** POST /reportes (multipart) — reporte de aula que hacen laboratorista o profesor */
export function crearReporte(datos: NuevoReporte): Promise<{ id: string }> {
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
    return simularRespuesta({ id: reporte.id }, 600);
  }
  const formulario = new FormData();
  formulario.append('practicaId', datos.practicaId);
  formulario.append('calificaciones', JSON.stringify(datos.calificaciones));
  if (datos.nota) formulario.append('nota', datos.nota);
  datos.fotos.forEach((foto) => formulario.append('fotos', foto));
  return peticion<{ id: string }>('/reportes', { metodo: 'POST', formulario });
}

// ---------------------------- Inventario ----------------------------

/** GET /inventario?categoria=… */
export function obtenerInventario(categoria: CategoriaInventario): Promise<ArticuloInventario[]> {
  if (USAR_MOCKS) return simularRespuesta(leerTabla('inventario').filter((a) => a.categoria === categoria));
  return peticion<ArticuloInventario[]>(`/inventario?categoria=${categoria}`);
}

/** POST /inventario — solo laboratorista */
export function crearArticulo(datos: NuevoArticulo): Promise<ArticuloInventario> {
  if (USAR_MOCKS) {
    const articulo = { ...datos, id: nuevoId('i') };
    guardarTabla('inventario', [articulo, ...leerTabla('inventario')]);
    return simularRespuesta(articulo);
  }
  return peticion<ArticuloInventario>('/inventario', { metodo: 'POST', cuerpo: datos });
}

/** PUT /inventario/:id — solo laboratorista */
export function editarArticulo(id: string, datos: NuevoArticulo): Promise<ArticuloInventario> {
  if (USAR_MOCKS) {
    const articulo = { ...datos, id };
    guardarTabla('inventario', leerTabla('inventario').map((a) => (a.id === id ? articulo : a)));
    return simularRespuesta(articulo);
  }
  return peticion<ArticuloInventario>(`/inventario/${id}`, { metodo: 'PUT', cuerpo: datos });
}

/** DELETE /inventario/:id — solo laboratorista */
export function borrarArticulo(id: string): Promise<void> {
  if (USAR_MOCKS) {
    guardarTabla('inventario', leerTabla('inventario').filter((a) => a.id !== id));
    return simularRespuesta(undefined);
  }
  return peticion<void>(`/inventario/${id}`, { metodo: 'DELETE' });
}

// ---------------------------- Horarios ----------------------------

/** GET /horarios?semana=actual — incluye las prácticas que crearon los profesores esta semana */
export function obtenerHorarioSemana(): Promise<BloqueHorario[]> {
  if (USAR_MOCKS) {
    const hoy = new Date();
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
    lunes.setHours(0, 0, 0, 0);
    const sabado = new Date(lunes);
    sabado.setDate(lunes.getDate() + 5);

    const dePracticas: BloqueHorario[] = leerTabla('practicas')
      .filter((p) => {
        const inicio = new Date(p.inicio);
        return inicio >= lunes && inicio < sabado;
      })
      .flatMap((p) => {
        const inicio = new Date(p.inicio);
        const dia = ((inicio.getDay() + 6) % 7) as BloqueHorario['dia'];
        return Array.from({ length: p.duracionHoras }, (_, i) => ({
          id: `${p.id}-${i}`,
          dia,
          hora: inicio.getHours() + i,
          laboratorioId: p.laboratorioId,
          practica: p.nombre,
          grupo: p.grupo,
        }));
      });

    const ocupados = new Set(dePracticas.map((b) => `${b.dia}-${b.hora}`));
    return simularRespuesta([...dePracticas, ...horarioMock.filter((b) => !ocupados.has(`${b.dia}-${b.hora}`))]);
  }
  return peticion<BloqueHorario[]>('/horarios?semana=actual');
}

// ---------------------------- Galería y mascota ----------------------------

/** GET /fotos?mias=true&estado=aprobada */
export function obtenerMisFotos(): Promise<FotoPractica[]> {
  if (USAR_MOCKS) return simularRespuesta(fotosMock);
  return peticion<FotoPractica[]>('/fotos?mias=true&estado=aprobada');
}

/** POST /fotos (multipart) — queda pendiente hasta que el laboratorista la apruebe */
export function subirFoto(practicaId: string, archivo: File): Promise<FotoPractica> {
  if (USAR_MOCKS) {
    return simularRespuesta<FotoPractica>({ id: nuevoId('f'), url: '', practicaId, titulo: archivo.name, estado: 'pendiente' });
  }
  const formulario = new FormData();
  formulario.append('practicaId', practicaId);
  formulario.append('foto', archivo);
  return peticion<FotoPractica>('/fotos', { metodo: 'POST', formulario });
}

/** GET /racha — la del laboratorio para coordinador/laboratorista/profesor, la del equipo para alumnos */
export function obtenerRacha(rol: Rol): Promise<Racha> {
  if (USAR_MOCKS) return simularRespuesta(rol === 'alumno' ? rachaAlumnoMock : rachaLaboratorioMock, 200);
  return peticion<Racha>('/racha');
}

/** GET /recompensas */
export function obtenerRecompensas(): Promise<Recompensa[]> {
  if (USAR_MOCKS) return simularRespuesta(recompensasMock);
  return peticion<Recompensa[]>('/recompensas');
}
