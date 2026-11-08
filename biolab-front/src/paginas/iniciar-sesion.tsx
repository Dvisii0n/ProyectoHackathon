import { CONFIG } from 'src/config-global';
import { VistaIniciarSesion } from 'src/secciones/sesion';

// ----------------------------------------------------------------------

export default function Pagina() {
  return (
    <>
      <title>{`Iniciar sesión · ${CONFIG.appName}`}</title>

      <VistaIniciarSesion />
    </>
  );
}
