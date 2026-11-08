import { CONFIG } from 'src/config-global';
import { VistaPrestamo } from 'src/secciones/prestamo';

// ----------------------------------------------------------------------

export default function Pagina() {
  return (
    <>
      <title>{`Pedir material · ${CONFIG.appName}`}</title>

      <VistaPrestamo />
    </>
  );
}
