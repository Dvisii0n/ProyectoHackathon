import { CONFIG } from 'src/config-global';
import { VistaUsuarios } from 'src/secciones/usuarios';

// ----------------------------------------------------------------------

export default function Pagina() {
  return (
    <>
      <title>{`Cuentas · ${CONFIG.appName}`}</title>

      <VistaUsuarios />
    </>
  );
}
