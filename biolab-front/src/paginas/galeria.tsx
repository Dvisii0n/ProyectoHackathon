import { CONFIG } from 'src/config-global';
import { VistaGaleria } from 'src/secciones/galeria';

// ----------------------------------------------------------------------

export default function Pagina() {
  return (
    <>
      <title>{`Galería y Capi · ${CONFIG.appName}`}</title>

      <VistaGaleria />
    </>
  );
}
