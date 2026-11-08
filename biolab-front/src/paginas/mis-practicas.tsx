import { CONFIG } from 'src/config-global';
import { VistaMisPracticas } from 'src/secciones/mis-practicas';

// ----------------------------------------------------------------------

export default function Pagina() {
  return (
    <>
      <title>{`Mis prácticas · ${CONFIG.appName}`}</title>

      <VistaMisPracticas />
    </>
  );
}
