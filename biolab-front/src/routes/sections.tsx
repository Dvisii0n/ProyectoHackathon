import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';

import { RutaProtegida } from './ruta-protegida';
import { RequiereSesion } from './requiere-sesion';

// ----------------------------------------------------------------------

export const PaginaPanel = lazy(() => import('src/paginas/panel'));
export const PaginaReportes = lazy(() => import('src/paginas/reportes'));
export const PaginaNuevoReporte = lazy(() => import('src/paginas/nuevo-reporte'));
export const PaginaInventario = lazy(() => import('src/paginas/inventario'));
export const PaginaHorarios = lazy(() => import('src/paginas/horarios'));
export const PaginaPrestamo = lazy(() => import('src/paginas/prestamo'));
export const PaginaPracticas = lazy(() => import('src/paginas/practicas'));
export const PaginaMisPracticas = lazy(() => import('src/paginas/mis-practicas'));
export const PaginaSolicitudes = lazy(() => import('src/paginas/solicitudes'));
export const PaginaUsuarios = lazy(() => import('src/paginas/usuarios'));
export const PaginaMaterias = lazy(() => import('src/paginas/materias'));
export const PaginaGaleria = lazy(() => import('src/paginas/galeria'));
export const PaginaIniciarSesion = lazy(() => import('src/paginas/iniciar-sesion'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));

const renderFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flex: '1 1 auto',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

export const routesSection: RouteObject[] = [
  {
    element: (
      <RequiereSesion>
        <DashboardLayout>
          <Suspense fallback={renderFallback()}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </RequiereSesion>
    ),
    children: [
      { index: true, element: <RutaProtegida permiso="verPanel"><PaginaPanel /></RutaProtegida> },
      { path: 'reportes', element: <RutaProtegida permiso="decidirReportes"><PaginaReportes /></RutaProtegida> },
      { path: 'reportes/nuevo', element: <RutaProtegida permiso="crearReportes"><PaginaNuevoReporte /></RutaProtegida> },
      { path: 'inventario', element: <RutaProtegida permiso="verInventario"><PaginaInventario /></RutaProtegida> },
      { path: 'horarios', element: <PaginaHorarios /> },
      { path: 'pedir-material', element: <RutaProtegida permiso="pedirMaterial"><PaginaPrestamo /></RutaProtegida> },
      { path: 'practicas', element: <RutaProtegida permiso="gestionarPracticas"><PaginaPracticas /></RutaProtegida> },
      { path: 'mis-practicas', element: <RutaProtegida permiso="verMisPracticas"><PaginaMisPracticas /></RutaProtegida> },
      { path: 'solicitudes', element: <RutaProtegida permiso="revisarSolicitudes"><PaginaSolicitudes /></RutaProtegida> },
      { path: 'usuarios', element: <RutaProtegida permiso="gestionarUsuarios"><PaginaUsuarios /></RutaProtegida> },
      { path: 'materias', element: <RutaProtegida permiso="gestionarMaterias"><PaginaMaterias /></RutaProtegida> },
      { path: 'galeria', element: <RutaProtegida permiso="verGaleria"><PaginaGaleria /></RutaProtegida> },
    ],
  },
  {
    path: 'iniciar-sesion',
    element: (
      <AuthLayout>
        <PaginaIniciarSesion />
      </AuthLayout>
    ),
  },
  {
    path: '404',
    element: <Page404 />,
  },
  { path: '*', element: <Page404 /> },
];
