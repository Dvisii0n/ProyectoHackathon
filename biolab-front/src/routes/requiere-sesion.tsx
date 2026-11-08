import { Navigate } from 'react-router';

import { useSesion } from 'src/contexto/sesion';

// ----------------------------------------------------------------------
// Si nadie ha iniciado sesión, manda al login.
// ----------------------------------------------------------------------

export function RequiereSesion({ children }: { children: React.ReactNode }) {
  const { sesionIniciada } = useSesion();

  if (!sesionIniciada) {
    return <Navigate to="/iniciar-sesion" replace />;
  }

  return <>{children}</>;
}
