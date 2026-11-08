import { CONFIG } from 'src/config-global';
import { VistaPracticas } from 'src/secciones/practicas';

// ----------------------------------------------------------------------

export default function Pagina() {
  return (
    <>
      <title>{`Prácticas y equipos · ${CONFIG.appName}`}</title>

      <VistaPracticas />
    </>
  );
}
