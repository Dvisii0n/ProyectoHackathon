import { CONFIG } from 'src/config-global';
import { VistaPanel } from 'src/secciones/panel';

// ----------------------------------------------------------------------

export default function Pagina() {
  return (
    <>
      <title>{`Panel · ${CONFIG.appName}`}</title>

      <VistaPanel />
    </>
  );
}
