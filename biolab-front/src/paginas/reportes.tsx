import { CONFIG } from 'src/config-global';
import { VistaReportes } from 'src/secciones/reportes';

// ----------------------------------------------------------------------

export default function Pagina() {
  return (
    <>
      <title>{`Bandeja de reportes · ${CONFIG.appName}`}</title>

      <VistaReportes />
    </>
  );
}
