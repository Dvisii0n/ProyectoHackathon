import type { Permisos } from 'src/contexto/sesion';

import { Navigate } from 'react-router';

import { useSesion } from 'src/contexto/sesion';
import { rutaInicio } from 'src/layouts/nav-config-dashboard';

// ----------------------------------------------------------------------
// Si el rol actual no tiene el permiso, lo manda a su pantalla de inicio.
// ----------------------------------------------------------------------

type RutaProtegidaProps = {
  permiso: keyof Permisos;
  children: React.ReactNode;
};

export function RutaProtegida({ permiso, children }: RutaProtegidaProps) {
  const { permisos } = useSesion();

  if (!permisos[permiso]) {
    return <Navigate to={rutaInicio(permisos)} replace />;
  }

  return <>{children}</>;
}
