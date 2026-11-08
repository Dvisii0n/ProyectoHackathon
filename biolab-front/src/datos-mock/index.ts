// ----------------------------------------------------------------------
// Datos de ejemplo. Los usan los servicios mientras no exista el back
// (variable VITE_USAR_MOCKS=true). Tienen la misma forma que src/tipos/dominio.ts
// ----------------------------------------------------------------------

import type {
  Racha,
  Usuario,
  Reporte,
  Practica,
  Recompensa,
  Laboratorio,
  FotoPractica,
  EquipoAlumnos,
  BloqueHorario,
  SolicitudMaterial,
  ArticuloInventario,
} from 'src/tipos/dominio';

/** Fecha relativa a hoy en ISO local, p. ej. enDias(2, 10) = pasado mañana a las 10:00 */
export function enDias(dias: number, hora: number, minutos = 0): string {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  fecha.setHours(hora, minutos, 0, 0);
  const dosDigitos = (n: number) => String(n).padStart(2, '0');
  return `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}T${dosDigitos(hora)}:${dosDigitos(minutos)}:00`;
}

export const usuariosMock: Usuario[] = [
  { id: 'u-coord', nombre: 'Coordinador', correo: 'coordinacion@biolab.mx', rol: 'coordinador' },
  { id: 'u-lab', nombre: 'Laboratorista', correo: 'laboratorio@biolab.mx', rol: 'laboratorista' },
  { id: 'u-prof', nombre: 'Profesor', correo: 'profesor@biolab.mx', rol: 'profesor' },
  { id: 'u-alum', nombre: 'Alumno', correo: 'alumno@biolab.mx', rol: 'alumno', grupo: '3B' },
];

/** El alumno de prueba (u-alum) está en el Equipo 2 del grupo 3B */
export const equiposMock: EquipoAlumnos[] = [
  { id: 'e-1', nombre: 'Equipo 1', grupo: '3B', profesorId: 'u-prof', integrantes: [{ id: 'a-1', nombre: 'Mariana López' }, { id: 'a-2', nombre: 'Diego Ruiz' }, { id: 'a-3', nombre: 'Sofía Castro' }] },
  { id: 'e-2', nombre: 'Equipo 2', grupo: '3B', profesorId: 'u-prof', integrantes: [{ id: 'u-alum', nombre: 'Alumno' }, { id: 'a-4', nombre: 'Ana Torres' }, { id: 'a-5', nombre: 'Luis Peña' }] },
  { id: 'e-3', nombre: 'Equipo 3', grupo: '3B', profesorId: 'u-prof', integrantes: [{ id: 'a-6', nombre: 'Valeria Díaz' }, { id: 'a-7', nombre: 'Jorge Ramos' }] },
  { id: 'e-4', nombre: 'Equipo 1', grupo: '5A', profesorId: 'u-prof', integrantes: [{ id: 'a-8', nombre: 'Camila Ortiz' }, { id: 'a-9', nombre: 'Héctor Gil' }] },
];

export const laboratoriosMock: Laboratorio[] = [
  { id: 'microbiologia', nombre: 'Microbiología' },
  { id: 'fisiologia', nombre: 'Fisiología' },
  { id: 'quimica', nombre: 'Química' },
];

export const practicasMock: Practica[] = [
  { id: 'p-1', nombre: 'Siembra de cultivos', grupo: '3B', laboratorioId: 'microbiologia', profesorId: 'u-prof', profesorNombre: 'Profesor', inicio: enDias(2, 10), duracionHoras: 2, equipoIds: ['e-1', 'e-2'], descripcion: 'Sembrar en agar nutritivo y observar colonias.' },
  { id: 'p-2', nombre: 'Tinción de Gram', grupo: '3B', laboratorioId: 'microbiologia', profesorId: 'u-prof', profesorNombre: 'Profesor', inicio: enDias(9, 9), duracionHoras: 2, equipoIds: ['e-2', 'e-3'] },
  { id: 'p-3', nombre: 'Preparación de soluciones', grupo: '3B', laboratorioId: 'quimica', profesorId: 'u-prof', profesorNombre: 'Profesor', inicio: enDias(-3, 12), duracionHoras: 1, equipoIds: ['e-1', 'e-2'] },
  { id: 'p-4', nombre: 'Signos vitales', grupo: '5A', laboratorioId: 'fisiologia', profesorId: 'u-prof', profesorNombre: 'Profesor', inicio: enDias(1, 8), duracionHoras: 2, equipoIds: ['e-4'] },
];

export const solicitudesMock: SolicitudMaterial[] = [
  {
    id: 's-1',
    practicaId: 'p-4',
    nombrePractica: 'Signos vitales',
    inicioPractica: enDias(1, 8),
    equipoId: 'e-4',
    nombreEquipo: 'Equipo 1',
    grupo: '5A',
    solicitanteId: 'a-8',
    solicitanteNombre: 'Camila Ortiz',
    fecha: enDias(0, 9, 20),
    estado: 'pendiente',
    renglones: [
      { articuloId: 'i-guantes', nombre: 'Guantes de nitrilo', cantidad: 4, aceptado: null },
      { articuloId: 'i-alcohol', nombre: 'Alcohol 70%', cantidad: 1, aceptado: null },
      { articuloId: 'i-mic2', nombre: 'Microscopio 2', cantidad: 1, aceptado: null },
    ],
  },
  {
    id: 's-2',
    practicaId: 'p-3',
    nombrePractica: 'Preparación de soluciones',
    inicioPractica: enDias(-3, 12),
    equipoId: 'e-1',
    nombreEquipo: 'Equipo 1',
    grupo: '3B',
    solicitanteId: 'a-1',
    solicitanteNombre: 'Mariana López',
    fecha: enDias(-5, 17),
    estado: 'entregada',
    codigoQr: 'BIOLAB-SOLICITUD-s-2',
    renglones: [
      { articuloId: 'i-vasos', nombre: 'Vasos de precipitados', cantidad: 3, aceptado: true },
      { articuloId: 'i-balanza', nombre: 'Balanza analítica', cantidad: 1, aceptado: true },
      { articuloId: 'i-pipetas', nombre: 'Pipetas Pasteur', cantidad: 4, aceptado: false },
    ],
  },
];

export const reportesMock: Reporte[] = [
  {
    id: 'r-1',
    tipo: 'aula',
    practicaId: 'p-1',
    titulo: 'Microbiología · Grupo 3B',
    nombrePractica: 'Siembra de cultivos',
    autorRol: 'laboratorista',
    autorNombre: 'Laboratorista',
    fecha: enDias(0, 10, 40),
    calificaciones: { limpieza: 'bien', material: 'bien', equipo: 'bien', orden: 'bien' },
    fotos: [],
    nota: 'El aula quedó limpia y el material se devolvió completo.',
    severidad: 'en-orden',
    decision: null,
  },
  {
    id: 'r-2',
    tipo: 'aula',
    practicaId: 'p-2',
    titulo: 'Fisiología · Grupo 5A',
    nombrePractica: 'Signos vitales',
    autorRol: 'profesor',
    autorNombre: 'Profesor',
    fecha: enDias(0, 9, 15),
    calificaciones: { limpieza: 'bien', material: 'regular', equipo: 'mal', orden: 'regular' },
    fotos: [],
    nota: 'Se rompió un tubo de ensayo y un baumanómetro quedó sin funcionar.',
    severidad: 'dano',
    decision: null,
  },
  {
    id: 'r-3',
    tipo: 'aula',
    practicaId: 'p-3',
    titulo: 'Química · Grupo 2C',
    nombrePractica: 'Preparación de soluciones',
    autorRol: 'laboratorista',
    autorNombre: 'Laboratorista',
    fecha: enDias(-1, 13, 20),
    calificaciones: { limpieza: 'mal', material: 'bien', equipo: 'bien', orden: 'regular' },
    fotos: [],
    nota: 'Quedaron mesas con residuos y reactivos fuera de su lugar.',
    severidad: 'advertencia',
    decision: null,
  },
  {
    id: 'r-4',
    tipo: 'aula',
    practicaId: 'p-1',
    titulo: 'Microbiología · Grupo 4A',
    nombrePractica: 'Tinción de Gram',
    autorRol: 'profesor',
    autorNombre: 'Profesor',
    fecha: enDias(-1, 11, 5),
    calificaciones: { limpieza: 'bien', material: 'regular', equipo: 'bien', orden: 'bien' },
    fotos: [],
    nota: 'Faltaron dos portaobjetos al cierre de la práctica.',
    severidad: 'advertencia',
    decision: null,
  },
];

export const inventarioMock: ArticuloInventario[] = [
  { id: 'i-guantes', nombre: 'Guantes de nitrilo', categoria: 'consumibles', cantidad: '10 cajas', ubicacion: 'Estante A', porcentajeRestante: 18 },
  { id: 'i-alcohol', nombre: 'Alcohol 70%', categoria: 'consumibles', cantidad: '500 ml', ubicacion: 'Gabinete 2', porcentajeRestante: 55 },
  { id: 'i-cubre', nombre: 'Cubrebocas', categoria: 'consumibles', cantidad: '120 pzas', ubicacion: 'Estante A', porcentajeRestante: 82 },
  { id: 'i-sodio', nombre: 'Sodio (reactivo)', categoria: 'consumibles', cantidad: '250 g', ubicacion: 'Gabinete de reactivos', porcentajeRestante: 30 },
  { id: 'i-mic1', nombre: 'Microscopio 1', categoria: 'equipo', cantidad: '1', laboratorioId: 'microbiologia', estado: 'disponible' },
  { id: 'i-mic2', nombre: 'Microscopio 2', categoria: 'equipo', cantidad: '1', laboratorioId: 'microbiologia', estado: 'ocupado' },
  { id: 'i-centri', nombre: 'Centrífuga', categoria: 'equipo', cantidad: '1', laboratorioId: 'fisiologia', estado: 'mantenimiento' },
  { id: 'i-balanza', nombre: 'Balanza analítica', categoria: 'equipo', cantidad: '1', laboratorioId: 'quimica', estado: 'disponible' },
  { id: 'i-vasos', nombre: 'Vasos de precipitados', categoria: 'utensilios', cantidad: '10 piezas', estado: 'disponible' },
  { id: 'i-tubos', nombre: 'Tubos de ensayo', categoria: 'utensilios', cantidad: '60 piezas', estado: 'disponible' },
  { id: 'i-pipetas', nombre: 'Pipetas Pasteur', categoria: 'utensilios', cantidad: '4 piezas', estado: 'ocupado' },
];

export const horarioMock: BloqueHorario[] = [
  { id: 'h-1', dia: 0, hora: 8, laboratorioId: 'microbiologia', practica: 'Cultivo celular', grupo: '3B' },
  { id: 'h-2', dia: 0, hora: 10, laboratorioId: 'fisiologia', practica: 'Signos vitales', grupo: '5A' },
  { id: 'h-3', dia: 1, hora: 9, laboratorioId: 'quimica', practica: 'Soluciones', grupo: '2C' },
  { id: 'h-4', dia: 1, hora: 11, laboratorioId: 'microbiologia', practica: 'Tinción de Gram', grupo: '4A' },
  { id: 'h-5', dia: 2, hora: 8, laboratorioId: 'fisiologia', practica: 'Electrocardiograma', grupo: '6B' },
  { id: 'h-6', dia: 2, hora: 12, laboratorioId: 'quimica', practica: 'Titulación', grupo: '2A' },
  { id: 'h-7', dia: 3, hora: 10, laboratorioId: 'microbiologia', practica: 'Siembra', grupo: '3A' },
  { id: 'h-8', dia: 3, hora: 13, laboratorioId: 'fisiologia', practica: 'Espirometría', grupo: '5B' },
  { id: 'h-9', dia: 4, hora: 9, laboratorioId: 'quimica', practica: 'pH y buffers', grupo: '2B' },
  { id: 'h-10', dia: 4, hora: 11, laboratorioId: 'microbiologia', practica: 'Microscopía', grupo: '4B' },
];

const titulosFotos = ['Siembra', 'Microscopio', 'Tinción', 'Pipetas', 'Cultivo', 'Equipo', 'Mesa de trabajo', 'Resultados', 'Grupo 3B'];

export const fotosMock: FotoPractica[] = titulosFotos.map((titulo, i) => ({
  id: `f-${i + 1}`,
  url: '',
  practicaId: 'p-1',
  titulo,
  estado: 'aprobada',
}));

export const recompensasMock: Recompensa[] = [
  { id: 'mandarina', nombre: 'Mandarina', nivelRequerido: 1 },
  { id: 'lentes', nombre: 'Lentes de seguridad', nivelRequerido: 2 },
  { id: 'bata', nombre: 'Bata de laboratorio', nivelRequerido: 3 },
  { id: 'gorro', nombre: 'Gorro de científico', nivelRequerido: 4 },
  { id: 'termal', nombre: 'Aguas termales', nivelRequerido: 5 },
];

export const rachaLaboratorioMock: Racha = {
  dias: 12,
  etiqueta: 'días sin daños',
  animo: 'feliz',
  diasCumplidos: 5,
  nivel: 3,
  puntos: 70,
  puntosSiguienteNivel: 100,
  siguienteRecompensa: 'Faltan 3 días para el gorro de científico',
};

export const rachaAlumnoMock: Racha = {
  dias: 5,
  etiqueta: 'prácticas seguidas',
  animo: 'feliz',
  diasCumplidos: 5,
  nivel: 3,
  puntos: 70,
  puntosSiguienteNivel: 100,
  siguienteRecompensa: '30 puntos más para el gorro de científico',
};
