// ----------------------------------------------------------------------
// Tipos del dominio de Biolab.
// Son el "contrato" con el equipo de back: cada servicio en src/servicios
// regresa exactamente estas formas. Si el back cambia un campo, se cambia aquí.
// ----------------------------------------------------------------------

/** Roles del sistema. El coordinador solo recibe información; el laboratorista hace la chamba. */
export type Rol = 'coordinador' | 'laboratorista' | 'profesor' | 'alumno';

export type Usuario = {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
  /** Solo alumnos: grupo al que pertenece, p. ej. "3B" */
  grupo?: string;
  /** Solo alumnos: si está suspendido no puede pedir material ni reservar */
  suspendido?: boolean;
};

// ---------------------------- Laboratorios y prácticas ----------------------------

export type IdLaboratorio = 'microbiologia' | 'fisiologia' | 'quimica';

export type Laboratorio = {
  id: IdLaboratorio;
  nombre: string;
};

/** Equipo de alumnos. El profesor los registra a principio de semestre. */
export type EquipoAlumnos = {
  id: string;
  nombre: string;
  grupo: string;
  profesorId: string;
  integrantes: { id: string; nombre: string }[];
};

export type NuevoEquipo = Omit<EquipoAlumnos, 'id' | 'profesorId'>;

/** Práctica que crea el profesor: día, hora, laboratorio y qué equipos la hacen */
export type Practica = {
  id: string;
  nombre: string;
  grupo: string;
  laboratorioId: IdLaboratorio;
  profesorId: string;
  profesorNombre: string;
  /** Fecha y hora de inicio, ISO 8601 */
  inicio: string;
  /** Duración en horas (bloques de 1 h) */
  duracionHoras: number;
  descripcion?: string;
  equipoIds: string[];
};

export type NuevaPractica = Omit<Practica, 'id' | 'profesorId' | 'profesorNombre'>;

/** Días antes de la práctica en que se abre la solicitud de material */
export const DIAS_PARA_PEDIR_MATERIAL = 7;

// ---------------------------- Reportes de aula ----------------------------

export type Calificacion = 'bien' | 'regular' | 'mal';

export type RubroReporte = 'limpieza' | 'material' | 'equipo' | 'orden';

export type CalificacionesReporte = Record<RubroReporte, Calificacion>;

export type Severidad = 'en-orden' | 'advertencia' | 'dano';

/** Lo que decide el coordinador sobre un reporte */
export type Decision = 'todo-bien' | 'advertencia' | 'sancion' | 'baneo';

/** aula = cómo entregaron el salón; material = material devuelto dañado o incompleto */
export type TipoReporte = 'aula' | 'material';

export type Reporte = {
  id: string;
  tipo: TipoReporte;
  practicaId: string;
  /** Solo reportes de material: equipo responsable */
  equipoId?: string;
  /** Texto listo para mostrar, p. ej. "Microbiología · Grupo 3B" */
  titulo: string;
  nombrePractica: string;
  autorRol: Extract<Rol, 'laboratorista' | 'profesor'>;
  autorNombre: string;
  /** ISO 8601 */
  fecha: string;
  /** Solo reportes de aula */
  calificaciones?: CalificacionesReporte;
  /** Solo reportes de material: lo que se devolvió con problema */
  materialConProblema?: { nombre: string; nota: string }[];
  /** URLs de las fotos del aula (al llegar y al entregar) */
  fotos: string[];
  nota?: string;
  /** La calcula el back a partir de las calificaciones */
  severidad: Severidad;
  /** null mientras el coordinador no decide */
  decision: Decision | null;
};

/** Lo que manda el laboratorista o profesor al crear un reporte */
export type NuevoReporte = {
  practicaId: string;
  calificaciones: CalificacionesReporte;
  fotos: File[];
  nota?: string;
};

// ---------------------------- Inventario ----------------------------

export type CategoriaInventario = 'consumibles' | 'equipo' | 'utensilios';

export type EstadoEquipo = 'disponible' | 'ocupado' | 'mantenimiento';

export type ArticuloInventario = {
  id: string;
  nombre: string;
  categoria: CategoriaInventario;
  /** Texto libre: "10 cajas", "500 ml"… */
  cantidad: string;
  ubicacion?: string;
  descripcion?: string;
  /** Consumibles: porcentaje que queda (0–100) para el tubito de nivel */
  porcentajeRestante?: number;
  /** Equipo: estado actual. Solo el equipo se puede reservar */
  estado?: EstadoEquipo;
  laboratorioId?: IdLaboratorio;
};

export type NuevoArticulo = Omit<ArticuloInventario, 'id'>;

// ---------------------------- Horarios y reservas ----------------------------

export type DiaSemana = 0 | 1 | 2 | 3 | 4; // lunes a viernes

export type BloqueHorario = {
  id: string;
  dia: DiaSemana;
  /** Hora de inicio en formato 24 h, p. ej. 8 = 8:00 */
  hora: number;
  laboratorioId: IdLaboratorio;
  practica: string;
  grupo: string;
};


// ---------------------------- Solicitudes de material ----------------------------

/**
 * Ciclo de una solicitud:
 * pendiente → (laboratorista revisa) aprobada | rechazada → (entrega con QR) entregada
 * → (devolución) devuelta | con-problemas
 */
export type EstadoSolicitud = 'pendiente' | 'aprobada' | 'rechazada' | 'entregada' | 'devuelta' | 'con-problemas';

export type EstadoDevolucion = 'bien' | 'con-problema';

export type RenglonSolicitud = {
  articuloId: string;
  nombre: string;
  cantidad: number;
  /** null mientras el laboratorista no lo revisa */
  aceptado: boolean | null;
  /** Se llena al regresar el material */
  devolucion?: { estado: EstadoDevolucion; nota?: string };
};

/** La hace un integrante en nombre de todo su equipo */
export type SolicitudMaterial = {
  id: string;
  practicaId: string;
  nombrePractica: string;
  inicioPractica: string;
  equipoId: string;
  nombreEquipo: string;
  grupo: string;
  solicitanteId: string;
  solicitanteNombre: string;
  /** ISO 8601 */
  fecha: string;
  estado: EstadoSolicitud;
  renglones: RenglonSolicitud[];
  /** Texto del QR de aprobación; lo genera el back al aprobar */
  codigoQr?: string;
};

export type NuevaSolicitud = {
  practicaId: string;
  equipoId: string;
  renglones: { articuloId: string; cantidad: number }[];
};

// ---------------------------- Galería y mascota ----------------------------

export type EstadoFoto = 'pendiente' | 'aprobada' | 'rechazada';

export type FotoPractica = {
  id: string;
  url: string;
  practicaId: string;
  titulo: string;
  estado: EstadoFoto;
};

export type FormatoCollage = 'post' | 'historia';

export type AnimoCapi = 'feliz' | 'triste';

export type IdRecompensa = 'mandarina' | 'lentes' | 'bata' | 'gorro' | 'termal';

export type Recompensa = {
  id: IdRecompensa;
  nombre: string;
  nivelRequerido: number;
};

/** Estado de la racha: del laboratorio (coordinador/laboratorista) o del alumno */
export type Racha = {
  dias: number;
  /** Qué cuenta la racha: "días sin daños" o "prácticas seguidas" */
  etiqueta: string;
  animo: AnimoCapi;
  /** Días de la semana actual con racha cumplida (lunes = 0) */
  diasCumplidos: number;
  nivel: number;
  puntos: number;
  puntosSiguienteNivel: number;
  siguienteRecompensa: string;
};
