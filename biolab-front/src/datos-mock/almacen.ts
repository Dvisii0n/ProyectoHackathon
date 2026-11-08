import type {
  Cuenta,
  Materia,
  Reporte,
  Practica,
  GrupoEscolar,
  EquipoAlumnos,
  SolicitudMaterial,
  AsignacionMateria,
  ArticuloInventario,
} from 'src/tipos/dominio';

import { equiposMock, cuentasMock, materiasMock, reportesMock, practicasMock, inventarioMock, solicitudesMock, asignacionesMock, gruposEscolaresMock } from './index';

// ----------------------------------------------------------------------
// "Base de datos" de mentiras para el prototipo. Guarda los cambios en el
// navegador para que el flujo funcione entre roles: el alumno pide material,
// cambias a laboratorista y ves la solicitud. Se borra cuando exista el back.
// ----------------------------------------------------------------------

type Tablas = {
  cuentas: Cuenta[];
  grupos: GrupoEscolar[];
  reportes: Reporte[];
  practicas: Practica[];
  equipos: EquipoAlumnos[];
  solicitudes: SolicitudMaterial[];
  inventario: ArticuloInventario[];
  materias: Materia[];
  asignaciones: AsignacionMateria[];
};

const CLAVE = 'biolab:datos-demo:v5';

function datosIniciales(): Tablas {
  return structuredClone({
    cuentas: cuentasMock,
    grupos: gruposEscolaresMock,
    reportes: reportesMock,
    practicas: practicasMock,
    equipos: equiposMock,
    solicitudes: solicitudesMock,
    inventario: inventarioMock,
    materias: materiasMock,
    asignaciones: asignacionesMock,
  });
}

let memoria: Tablas | null = null;

function cargar(): Tablas {
  if (memoria) return memoria;
  try {
    const guardado = localStorage.getItem(CLAVE);
    memoria = guardado ? (JSON.parse(guardado) as Tablas) : datosIniciales();
  } catch {
    memoria = datosIniciales();
  }
  return memoria;
}

export function leerTabla<K extends keyof Tablas>(tabla: K): Tablas[K] {
  return structuredClone(cargar()[tabla]);
}

export function guardarTabla<K extends keyof Tablas>(tabla: K, filas: Tablas[K]) {
  const datos = cargar();
  datos[tabla] = structuredClone(filas);
  try {
    localStorage.setItem(CLAVE, JSON.stringify(datos));
  } catch {
    // sin almacenamiento: los cambios viven solo en memoria
  }
}

/** Regresa los datos de prueba a como venían (útil antes de una demo) */
export function reiniciarDatosDemo() {
  memoria = datosIniciales();
  try {
    localStorage.removeItem(CLAVE);
  } catch {
    // sin almacenamiento disponible
  }
}

export function nuevoId(prefijo: string): string {
  return `${prefijo}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
