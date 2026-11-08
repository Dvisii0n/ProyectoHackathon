import type { IconifyName } from 'src/components/iconify/register-icons';
import type {
  Decision,
  Severidad,
  Calificacion,
  EstadoEquipo,
  IdLaboratorio,
  EstadoSolicitud,
} from 'src/tipos/dominio';

import { colores } from 'src/componentes/estilos';

// ----------------------------------------------------------------------
// Cómo se ve cada estado (texto + ícono + colores). Así ningún estado
// depende solo del color y todas las pantallas lo pintan igual.
// ----------------------------------------------------------------------

type Apariencia = { texto: string; icono: IconifyName; fondo: string; color: string };

export const aparienciaSeveridad: Record<Severidad, Apariencia> = {
  'en-orden': { texto: 'Todo en orden', icono: 'biolab:paloma', fondo: colores.menta, color: '#2E4429' },
  advertencia: { texto: 'Advertencia', icono: 'biolab:exclamacion', fondo: colores.durazno, color: colores.cafeTexto },
  dano: { texto: 'Daño de equipo', icono: 'biolab:cruz', fondo: colores.tinto, color: colores.crema },
};

/** Color del puntito de la línea de tiempo */
export const colorSeveridad: Record<Severidad, string> = {
  'en-orden': colores.verde,
  advertencia: colores.mandarina,
  dano: colores.tinto,
};

export const aparienciaDecision: Record<Decision, { sello: string; mensaje: string; color: string }> = {
  'todo-bien': { sello: 'TODO BIEN', mensaje: 'Marcado como todo bien', color: colores.verde },
  advertencia: { sello: 'ADVERTIDO', mensaje: 'Advertencia enviada al grupo', color: colores.mandarinaOscura },
  sancion: { sello: 'SANCIONADO', mensaje: 'Sanción aplicada al grupo', color: colores.tintoClaro },
  baneo: { sello: 'BANEADO', mensaje: 'Grupo baneado del laboratorio', color: colores.tinto },
};

export const aparienciaCalificacion: Record<Calificacion, { texto: string; icono: IconifyName; color: string }> = {
  bien: { texto: 'Bien', icono: 'biolab:carita-bien', color: colores.verde },
  regular: { texto: 'Regular', icono: 'biolab:carita-regular', color: colores.mandarinaOscura },
  mal: { texto: 'Mal', icono: 'biolab:carita-mal', color: colores.tinto },
};

export const aparienciaEstadoEquipo: Record<EstadoEquipo, Apariencia> = {
  disponible: { texto: 'Disponible', icono: 'biolab:paloma', fondo: colores.menta, color: '#2E4429' },
  ocupado: { texto: 'Ocupado', icono: 'biolab:reloj', fondo: colores.durazno, color: colores.cafeTexto },
  mantenimiento: { texto: 'En mantenimiento', icono: 'biolab:alerta', fondo: colores.rosa, color: colores.tinto },
};

export const aparienciaLaboratorio: Record<IdLaboratorio, { nombre: string; fondo: string; color: string; icono: IconifyName }> = {
  microbiologia: { nombre: 'Microbiología', fondo: colores.verde, color: colores.crema, icono: 'biolab:matraz' },
  fisiologia: { nombre: 'Fisiología', fondo: colores.tintoClaro, color: colores.crema, icono: 'biolab:corazon' },
  quimica: { nombre: 'Química', fondo: colores.arena, color: '#3A2412', icono: 'biolab:vaso' },
};

/** "2026-11-07T10:40:00" → "hoy, 10:40" / "ayer, 13:20" / "5 nov, 09:00" */
export function fechaAmigable(iso: string, ahora = new Date()): string {
  const fecha = new Date(iso);
  const hora = fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  const dias = Math.floor((new Date(ahora.toDateString()).getTime() - new Date(fecha.toDateString()).getTime()) / 86400000);
  if (dias === 0) return `hoy, ${hora}`;
  if (dias === 1) return `ayer, ${hora}`;
  return `${fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}, ${hora}`;
}

/** "2026-11-10T10:00:00", 2 → "lun 10 nov · 10:00 a 12:00" */
export function horarioPractica(inicio: string, duracionHoras: number): string {
  const fecha = new Date(inicio);
  const fin = new Date(fecha.getTime() + duracionHoras * 3600000);
  const dia = fecha.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' }).replace(/\./g, '');
  const hora = (f: Date) => f.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${dia} · ${hora(fecha)} a ${hora(fin)}`;
}

/** "2026-11-03T00:00:00" → "lunes 3 de noviembre" */
export function fechaLarga(fecha: Date): string {
  return fecha.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
}

export const aparienciaSolicitud: Record<EstadoSolicitud, Apariencia> = {
  pendiente: { texto: 'Esperando revisión', icono: 'biolab:reloj', fondo: colores.durazno, color: colores.cafeTexto },
  aprobada: { texto: 'Aprobada: muestra tu QR', icono: 'biolab:qr', fondo: colores.menta, color: '#2E4429' },
  rechazada: { texto: 'Rechazada', icono: 'biolab:cruz', fondo: colores.rosa, color: colores.tinto },
  entregada: { texto: 'Material entregado', icono: 'biolab:caja', fondo: colores.salvia, color: colores.bosque },
  devuelta: { texto: 'Devuelto en orden', icono: 'biolab:paloma', fondo: colores.menta, color: '#2E4429' },
  'con-problemas': { texto: 'Devuelto con problemas', icono: 'biolab:alerta', fondo: colores.tinto, color: colores.crema },
};
