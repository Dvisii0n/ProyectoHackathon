import { CONFIG } from 'src/config-global';
import { VistaSolicitudes } from 'src/secciones/solicitudes';

// ----------------------------------------------------------------------

export default function Pagina() {
  return (
    <>
      <title>{`Solicitudes de material · ${CONFIG.appName}`}</title>

      <VistaSolicitudes />
    </>
  );
}
