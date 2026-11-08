import { CONFIG } from 'src/config-global';
import { VistaNuevoReporte } from 'src/secciones/nuevo-reporte';

// ----------------------------------------------------------------------

export default function Pagina() {
  return (
    <>
      <title>{`Hacer reporte · ${CONFIG.appName}`}</title>

      <VistaNuevoReporte />
    </>
  );
}
