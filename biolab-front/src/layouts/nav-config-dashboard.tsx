import type { Permisos } from 'src/contexto/sesion';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// Menú lateral. Cada opción dice qué permiso necesita para mostrarse.
// ----------------------------------------------------------------------

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

type OpcionMenu = NavItem & {
  /** Si se omite, la ven todos los roles */
  permiso?: keyof Permisos;
};

const icono = (nombre: Parameters<typeof Iconify>[0]['icon']) => <Iconify icon={nombre} width={22} />;

const opcionesMenu: OpcionMenu[] = [
  { title: 'Panel', path: '/', icon: icono('biolab:panel'), permiso: 'verPanel' },
  { title: 'Reportes', path: '/reportes', icon: icono('biolab:reporte'), permiso: 'decidirReportes' },
  { title: 'Solicitudes', path: '/solicitudes', icon: icono('biolab:caja'), permiso: 'revisarSolicitudes' },
  { title: 'Prácticas y equipos', path: '/practicas', icon: icono('biolab:usuarios'), permiso: 'gestionarPracticas' },
  { title: 'Mis prácticas', path: '/mis-practicas', icon: icono('biolab:microscopio'), permiso: 'verMisPracticas' },
  { title: 'Pedir material', path: '/pedir-material', icon: icono('biolab:qr'), permiso: 'pedirMaterial' },
  { title: 'Hacer reporte', path: '/reportes/nuevo', icon: icono('biolab:lapiz'), permiso: 'crearReportes' },
  { title: 'Inventario', path: '/inventario', icon: icono('biolab:matraz'), permiso: 'verInventario' },
  { title: 'Horarios', path: '/horarios', icon: icono('biolab:calendario') },
  { title: 'Galería y Capi', path: '/galeria', icon: icono('biolab:galeria'), permiso: 'verGaleria' },
]

/** Regresa solo las opciones que el rol actual puede ver */
export function obtenerNavegacion(permisos: Permisos): NavItem[] {
  return opcionesMenu
    .filter((opcion) => !opcion.permiso || permisos[opcion.permiso])
    .map((opcion) => ({ title: opcion.title, path: opcion.path, icon: opcion.icon, info: opcion.info }));
}

/** Ruta de inicio de cada rol (el alumno no tiene panel) */
export function rutaInicio(permisos: Permisos): string {
  return obtenerNavegacion(permisos)[0]?.path ?? '/horarios';
}
