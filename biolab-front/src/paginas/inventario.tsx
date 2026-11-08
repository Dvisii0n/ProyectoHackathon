import { CONFIG } from 'src/config-global';
import { VistaInventario } from 'src/secciones/inventario';

// ----------------------------------------------------------------------

export default function Pagina() {
  return (
    <>
      <title>{`Inventario · ${CONFIG.appName}`}</title>

      <VistaInventario />
    </>
  );
}
